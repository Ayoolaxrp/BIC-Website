import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto';
import { emailProblem } from '../src/lib/email.js';
export class CheckoutError extends Error {
 constructor(status, message, reference = undefined) { super(message); this.status = status; this.reference=reference; }
}
const fail = (status, message) => { throw new CheckoutError(status, message); };
export function amountToKobo(value) {
 const text=String(value);
 if (!/^(0|[1-9][0-9]{0,8})(\.[0-9]{1,2})?$/.test(text)) return fail(502,'Invalid provider amount');
 const [whole, fraction='']=text.split('.');
 const n=Number(whole)*100+Number(fraction.padEnd(2,'0'));
 if (!Number.isSafeInteger(n) || n<=0) return fail(502,'Invalid provider amount');
 return n;
}
export function validSignature(data, signature, secret) {
 if(typeof signature!=='string'|| !/^[a-f0-9]{64}$/i.test(signature)) return false;
 return timingSafeEqual(createHmac('sha256',secret).update(JSON.stringify(data)).digest(),Buffer.from(signature,'hex'));
}
export function checkoutUrl(value, secret = '') {
 const allowedHost=secret.startsWith('sk_test_')?'test-checkout.korapay.com':'checkout.korapay.com';
 try { const u=new URL(value); if(u.protocol==='https:'&&u.hostname===allowedHost&&!u.port&&!u.username&&!u.password) return u.href; } catch {}
 return fail(502,'Invalid provider checkout URL');
}
// Invite links live in the server-only BIC_SECTOR_LINKS env var, never in the public repo or JS bundle,
// so only a verified payment can reveal one. JSON: {"Crypto":"https://chat.whatsapp.com/...","Aspiring":"..."}.
// A sector with no group of its own falls back to the "Aspiring" catch-all group; an unknown sector (failed lookup) gets nothing.
const inviteLink=v=>{try{const u=new URL(v);return u.protocol==='https:'&&u.hostname==='chat.whatsapp.com'&&!u.port&&!u.username&&!u.password?u.href:null;}catch{return null;}};
export function sectorGroup(env, sector) {
 let links;try{links=JSON.parse(env.BIC_SECTOR_LINKS||'{}');}catch{return null;}
 if(!links||typeof links!=='object'||typeof sector!=='string')return null;
 for(const group of [sector,'Aspiring']){const link=Object.hasOwn(links,group)?inviteLink(links[group]):null;if(link)return {group,link};}
 return null;
}
export function config(env) {
 if(env.KORA_CHECKOUT_ENABLED!=='true') return fail(503,'Online checkout is disabled');
 for(const key of ['KORAPAY_SECRET_KEY','SUPABASE_SECRET_KEY','VITE_SITE_URL']) if(!env[key]) return fail(503,'Checkout is not configured');
 if(!env.SUPABASE_URL&&!env.VITE_SUPABASE_URL) return fail(503,'Checkout is not configured');
 const origin=new URL(env.VITE_SITE_URL);
 if(origin.protocol!=='https:'||origin.origin!==env.VITE_SITE_URL) return fail(503,'Invalid checkout origin configuration');
 return {secret:env.KORAPAY_SECRET_KEY, origin:origin.origin};
}
const fields={full_name:200,matric_number:40,phone_number:40,department:120,level:20,email:320,knowledge_level:40,sector:60,campus:20,committee:120};
export function applicationInput(input) {
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!Object.hasOwn(fields,k)&&k!=='interests'))fail(400,'Invalid application fields');
 const application={};
 for(const [key,max] of Object.entries(fields)){
  if(typeof input[key]!=='string'||!input[key].trim()||input[key].trim().length>max)fail(400,'Complete all application fields correctly');
  application[key]=input[key].trim();
 }
 application.email=application.email.toLowerCase();
 const emailIssue=emailProblem(application.email);if(emailIssue)fail(400,emailIssue);
 if(!['100','200','300','400','500'].includes(application.level)||!['Beginner','Intermediate','Expert'].includes(application.knowledge_level)||!['Ilishan','Iperu'].includes(application.campus))fail(400,'Invalid application selection');
 if(!['Crypto','Forex','Securities','Real Estate','General'].includes(application.sector)||!['PR/Media','Welfare','Finance & Fundraising','Events & Logistics','Membership','Educational Research','Training & Partnership'].includes(application.committee))fail(400,'Invalid sector or committee');
 if(!Array.isArray(input.interests)||input.interests.length>20||input.interests.some(v=>typeof v!=='string'||v.length>120))fail(400,'Invalid interests');
 application.interests=input.interests;return application;
}
export function createCheckoutService({rpc, sectorOf=async(_reference)=>null, providerFetch=fetch, env=process.env, uuid=randomUUID}) {
 const cfg=config(env);
 const call=async(name,args)=>{try{return await rpc(name,args);}catch{fail(503,'Payment storage unavailable; do not pay again until the reference is checked');}};
 const provider=async(path,body=undefined)=>{
  let res;try{res=await providerFetch('https://api.korapay.com/merchant/api/v1/charges/'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+cfg.secret,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(12000)});}catch{return fail(502,'Payment provider unavailable; check your reference before paying again');}
  let payload;try{payload=await res.json();}catch{return fail(502,'Invalid payment provider response');}
  if(!res.ok||payload.status!==true||!payload.data)fail(502,'Payment provider unavailable; check your reference before paying again');
  return payload.data;
 };
 const read=async reference=>{
  if(typeof reference!=='string'||!/^BIC-KORA-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(reference))fail(400,'Invalid checkout reference');
  const intent=await call('get_kora_intent',{p_reference:reference});
  if(!intent)fail(404,'Checkout not found');
  if(intent.reference!==reference||Number(intent.amount_kobo)!==250000||intent.currency!=='NGN')fail(409,'Invalid stored checkout');
  return intent;
 };
 const verify=async intent=>{
  const charge=await provider(encodeURIComponent(intent.reference));
  if(charge.reference!==intent.reference||charge.currency!==intent.currency||amountToKobo(charge.amount)!==Number(intent.amount_kobo))fail(409,'Payment details do not match the checkout');
  if(charge.status!=='success')return {reference:intent.reference,status:'pending'};
  // Nominal amount alone is not proof of received value: bank-transfer
  // underpayment preferences can produce success with a smaller accepted amount.
  // Kora's successful sandbox response can include null for an unused optional field.
  // Null is absent evidence, not zero; at least one supplied value must still match.
  const actualFields=['amount_paid','amount_accepted'].filter(key=>charge[key]!==undefined&&charge[key]!==null);
  if(actualFields.length===0)fail(409,'Actual payment amount is missing; manual verification required');
  for(const key of actualFields){
   if(amountToKobo(charge[key])!==Number(intent.amount_kobo))fail(409,'Actual payment amount does not match the checkout; manual verification required');
  }
  await call('finalize_kora_payment',{p_reference:intent.reference,p_amount_kobo:250000,p_currency:'NGN'});
  return {reference:intent.reference,status:'paid'};
 };
 return {
  async initialize(input){
   if(!input||Object.keys(input).length!==1||!input.application)fail(400,'Supply only the membership application');
   const application=applicationInput(input.application);
   const reference='BIC-KORA-'+uuid();
   await call('create_kora_intent',{p_reference:reference,p_application:application});
   try{
    const intent=await read(reference);
    const charge=await provider('initialize',{amount:2500,currency:intent.currency,narration:'BIC membership',reference,customer:{email:intent.email,name:application.full_name},merchant_bears_cost:true,redirect_url:cfg.origin+'/checkout/return',notification_url:cfg.origin+'/api/kora/webhook'});
    if(charge.reference!==reference)fail(502,'Provider reference mismatch');
    return {reference,checkout_url:checkoutUrl(charge.checkout_url,cfg.secret)};
   }catch(error){if(error instanceof CheckoutError)error.reference=reference;throw error;}
  },
  async status(reference){
   const intent=await read(reference);
   const result=intent.status==='paid'?{reference,status:'paid'}:await verify(intent);
   if(result.status!=='paid')return result;
   // A failed lookup must never hide a confirmed payment: the page then shows the "chair will add you" fallback.
   let sector=null;try{sector=await sectorOf(reference);}catch{}
   const found=sectorGroup(env,sector);
   return found?{...result,group:found.group,group_link:found.link}:result;
  },
  async webhook(raw,signature){
   let body;try{body=JSON.parse(raw);}catch{return fail(400,'Invalid JSON');}
   if(!body?.data||typeof body.data!=='object'||Array.isArray(body.data)||!validSignature(body.data,signature,cfg.secret))fail(401,'Invalid signature');
   if(body.event!=='charge.success')return {received:true};
   if(body.data.status!=='success')fail(400,'Invalid successful charge');
   const intent=await read(body.data.reference);
   if(body.data.currency!==intent.currency||amountToKobo(body.data.amount)!==250000)fail(409,'Webhook details do not match the checkout');
   if(intent.status!=='paid'){const result=await verify(intent);if(result.status!=='paid')fail(503,'Payment not confirmed yet');}
   return {received:true};
  }
 };
}
