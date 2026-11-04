import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {Readable} from 'node:stream';
import {createCheckoutService,amountToKobo,validSignature,checkoutUrl,config,applicationInput} from '../server/kora.mjs';
import {handler,supabaseRpc} from '../server/http.mjs';
const env={KORA_CHECKOUT_ENABLED:'true',KORAPAY_SECRET_KEY:'mock-kora-secret',SUPABASE_SECRET_KEY:'sb_secret_mock',VITE_SUPABASE_URL:'https://mock.supabase.co',VITE_SITE_URL:'https://bic.example'};
const uuid='11111111-1111-4111-8111-111111111111';const reference='BIC-KORA-'+uuid;
const application={full_name:'Mock Member',email:'member@babcock.edu.ng',matric_number:'22/1234',phone_number:'mock-phone',department:'Finance',level:'200',knowledge_level:'Beginner',interests:[],sector:'Securities',campus:'Ilishan',committee:'Finance & Fundraising'};
const sign=data=>createHmac('sha256',env.KORAPAY_SECRET_KEY).update(JSON.stringify(data)).digest('hex');
const payload=(changes={})=>({event:'charge.success',data:{reference,amount:2500,currency:'NGN',status:'success',...changes}});
function fixture({charge={},intent={},dbError=false,fetchError=false,providerStatus=true,environment=env}={}){
 const calls=[];let confirmations=0;const row={reference,email:application.email,amount_kobo:250000,currency:'NGN',status:'pending',...intent};
 const rpc=async(name,args)=>{calls.push({name,args});if(dbError)throw new Error('sensitive storage detail');if(name==='get_kora_intent')return row;if(name==='finalize_kora_payment'){if(row.status!=='paid')confirmations++;row.status='paid';}return null;};
 const providerFetch=async(url,options)=>{calls.push({url,options});if(fetchError)throw new Error('mock timeout');return {ok:true,json:async()=>({status:providerStatus,data:url.endsWith('initialize')?{reference,checkout_url:'https://checkout.korapay.com/test/pay',...charge}:{reference,amount:'2500.00',amount_paid:'2500.00',currency:'NGN',status:'success',...charge}})};};
 return {service:createCheckoutService({rpc,env:environment,providerFetch,uuid:()=>uuid}),calls,row,get confirmations(){return confirmations;}};
}
test('disabled by default and incomplete configuration fails closed',()=>{assert.throws(()=>config({}),/disabled/);assert.throws(()=>config({KORA_CHECKOUT_ENABLED:'true'}),/configured/);assert.throws(()=>config({...env,VITE_SITE_URL:'http://bic.example'}),/origin/);});
test('strict decimal conversion rejects invalid or ambiguous provider amounts',()=>{assert.equal(amountToKobo('2500.00'),250000);assert.equal(amountToKobo('10.5'),1050);for(const v of ['2e3',0,-1,'1.001','NaN',null,'01'])assert.throws(()=>amountToKobo(v));});
test('data-only HMAC constant-time length handling and full-body rejection',()=>{const p=payload();assert.equal(validSignature(p.data,sign(p.data),env.KORAPAY_SECRET_KEY),true);assert.equal(validSignature(p.data,'a',env.KORAPAY_SECRET_KEY),false);assert.equal(validSignature(p.data,sign(p),env.KORAPAY_SECRET_KEY),false);assert.equal(validSignature({...p.data,amount:1},sign(p.data),env.KORAPAY_SECRET_KEY),false);});
test('checkout URL accepts only credential-free HTTPS Kora host',()=>{for(const v of ['http://checkout.korapay.com/a','https://evil.example','https://checkout.korapay.com.evil/a','https://a@checkout.korapay.com/a','https://checkout.korapay.com:444/a'])assert.throws(()=>checkoutUrl(v));});
test('public application validates email, bounds, choices and denies browser payment claims',()=>{assert.equal(applicationInput(application).email,application.email);for(const v of [{...application,email:'other@example.com'},{...application,payment_status:'paid'},{...application,full_name:'x'.repeat(201)},{...application,level:'999'},{...application,interests:'bad'},null])assert.throws(()=>applicationInput(v));});
test('server creates intent before Kora using fixed NGN 2500 regardless of browser',async()=>{const f=fixture();const result=await f.service.initialize({application});assert.equal(result.reference,reference);assert.equal(f.calls[0].name,'create_kora_intent');const c=f.calls.find(c=>c.url);const b=JSON.parse(c.options.body);assert.equal(b.amount,2500);assert.equal(b.narration,'BIC membership');assert.equal(b.currency,'NGN');assert.equal(b.customer.email,application.email);assert.equal(b.reference,reference);assert.equal(b.notification_url,env.VITE_SITE_URL+'/api/kora/webhook');assert.equal(b.redirect_url,env.VITE_SITE_URL+'/checkout/return');assert.equal(b.merchant_bears_cost,true);assert.equal(f.confirmations,0);});
test('extra browser amount/reference rejected before intent creation',async()=>{for(const input of [{application,amount:1},{application,reference:'client-ref'},{application:{...application,amount:1}},{kind:'event',target:'id'},null]){const f=fixture();await assert.rejects(f.service.initialize(input));assert.equal(f.calls.length,0);}});
test('failure after intent creation returns recovery reference without granting value',async()=>{const f=fixture({fetchError:true});await assert.rejects(f.service.initialize({application}),e=>e.reference===reference&&!e.message.includes('mock timeout'));assert.equal(f.confirmations,0);});
test('unknown references and inconsistent stored prices rejected',async()=>{await assert.rejects(fixture().service.status('wrong'));await assert.rejects(fixture({intent:{amount_kobo:1}}).service.status(reference));const f=createCheckoutService({env,rpc:async()=>null});await assert.rejects(f.status(reference),/not found/);});
test('invalid signatures and malformed JSON cannot reach storage or provider',async()=>{const f=fixture();await assert.rejects(f.service.webhook(JSON.stringify(payload()),'a'.repeat(64)));await assert.rejects(f.service.webhook('{','a'));assert.equal(f.calls.length,0);});
test('valid raw-body whitespace, duplicate webhook/status deliver value once',async()=>{const f=fixture();const p=payload();await f.service.webhook(JSON.stringify(p,null,2),sign(p.data));await f.service.webhook(JSON.stringify(p),sign(p.data));assert.equal((await f.service.status(reference)).status,'paid');assert.equal(f.confirmations,1);assert.equal(f.calls.filter(c=>c.url).length,1);});
test('signed event alone insufficient: signed success plus requery required',async()=>{const f=fixture({charge:{status:'pending'}});const p=payload();await assert.rejects(f.service.webhook(JSON.stringify(p),sign(p.data)));assert.equal((await f.service.status(reference)).status,'pending');assert.equal(f.confirmations,0);const q=payload({status:'failed'});await assert.rejects(f.service.webhook(JSON.stringify(q),sign(q.data)));});
test('provider reference, currency, amount and paid amount must match exactly',async()=>{for(const charge of [{amount:'2499'},{amount:'2501'},{amount_paid:'2499'},{currency:'USD'},{reference:'wrong'}]){const f=fixture({charge});await assert.rejects(f.service.status(reference));assert.equal(f.confirmations,0);}});
test('signed webhook amounts and currencies still matched to intent',async()=>{for(const change of [{amount:1},{currency:'USD'}]){const f=fixture();const p=payload(change);await assert.rejects(f.service.webhook(JSON.stringify(p),sign(p.data)));assert.equal(f.confirmations,0);}});
test('provider/database/checkout URL failures do not leak details or finalize',async()=>{for(const options of [{dbError:true},{providerStatus:false},{charge:{checkout_url:'https://evil.example'}},{charge:{reference:'wrong'}}]){const f=fixture(options);await assert.rejects(f.service.initialize({application}),e=>!e.message.includes('sensitive'));assert.equal(f.confirmations,0);}});
test('public status returns no stored email or application data',async()=>{assert.deepEqual(await fixture().service.status(reference),{reference,status:'paid'});});
test('modern Supabase key uses apikey only, correct RPC and zero Authorization headers',async()=>{let request;const rpc=supabaseRpc(env,async(url,options)=>{request={url,options};return {ok:true,text:async()=>JSON.stringify({reference})};});await rpc('get_kora_intent',{p_reference:reference});assert.equal(request.options.headers.apikey,env.SUPABASE_SECRET_KEY);assert.equal(Object.keys(request.options.headers).some(k=>k.toLowerCase()==='authorization'),false);assert.equal(request.url,env.VITE_SUPABASE_URL+'/rest/v1/rpc/get_kora_intent');await assert.rejects(rpc('other',{}));});
async function http({method='POST',headers={},body='{}',action='initialize',service}={}){const req=Readable.from([body]);req.method=method;req.headers={'content-type':'application/json',origin:env.VITE_SITE_URL,...headers};const res={code:0,headers:{},setHeader(k,v){this.headers[k]=v;},status(code){this.code=code;return this;},json(data){this.data=data;}};await handler(action,{env,makeService:()=>service||{initialize:async()=>({ok:true})}})(req,res);return res;}
test('HTTP origin, method, JSON and bounded-body protections',async()=>{assert.equal((await http({method:'GET'})).code,405);assert.equal((await http({headers:{origin:'https://evil.example'}})).code,403);assert.equal((await http({headers:{'content-type':'text/plain'}})).code,415);assert.equal((await http({body:'x'.repeat(32769)})).code,413);assert.equal((await http({body:'{'})).code,400);assert.equal((await http()).code,200);});
test('webhook receives exact raw body and signature without browser origin',async()=>{let received;const raw=' { "data" : {"x":1} } ';const r=await http({action:'webhook',body:raw,headers:{origin:undefined,'x-korapay-signature':'sig'},service:{webhook:async(body,sig)=>{received=[body,sig];return {received:true};}}});assert.equal(r.code,200);assert.deepEqual(received,[raw,'sig']);assert.equal(r.headers['Cache-Control'],'no-store');});

test('server Supabase URL takes precedence and public URL remains fallback',async()=>{let url;const rpc=supabaseRpc({...env,SUPABASE_URL:'https://server.supabase.co'},async(u)=>{url=u;return {ok:true,text:async()=>''};});await rpc('get_kora_intent',{p_reference:reference});assert.equal(url,'https://server.supabase.co/rest/v1/rpc/get_kora_intent');assert.doesNotThrow(()=>config({...env,VITE_SUPABASE_URL:undefined,SUPABASE_URL:'https://server.supabase.co'}));});

test('successful charge requires actual paid or accepted evidence, never nominal alone',async()=>{
 const f=fixture({charge:{amount_paid:undefined,amount_accepted:undefined}});
 await assert.rejects(f.service.status(reference),/Actual payment amount is missing/);
 assert.equal(f.confirmations,0);
});
test('accepted amount underpayment or overpayment never fulfills even with matching paid/nominal amount',async()=>{
 for(const amount_accepted of ['2499.00','2501.00']){
  const f=fixture({charge:{amount_accepted}});
  await assert.rejects(f.service.status(reference),/Actual payment amount does not match/);
  assert.equal(f.confirmations,0);
 }
});
test('accepted-only matching evidence and matching paid plus accepted evidence can fulfill',async()=>{
 for(const charge of [{amount_paid:undefined,amount_accepted:'2500.00'},{amount_paid:'2500.00',amount_accepted:2500}]){
  const f=fixture({charge});assert.equal((await f.service.status(reference)).status,'paid');assert.equal(f.confirmations,1);
 }
});
test('matching accepted amount cannot override conflicting paid amount',async()=>{
 for(const amount_paid of ['2499.00','2501.00']){
  const f=fixture({charge:{amount_paid,amount_accepted:'2500.00'}});
  await assert.rejects(f.service.status(reference),/Actual payment amount does not match/);assert.equal(f.confirmations,0);
 }
});
test('malformed zero or excess-precision supplied actual values fail closed',async()=>{
 for(const amount_accepted of ['invalid',0,'2500.001']){
  const f=fixture({charge:{amount_accepted}});await assert.rejects(f.service.status(reference));assert.equal(f.confirmations,0);
 }
});
test('webhook nominal amount cannot bypass missing or mismatched provider actual amount',async()=>{
 for(const charge of [{amount_paid:undefined},{amount_accepted:'2499.00'},{amount_accepted:'2501.00'}]){
  const f=fixture({charge});const p=payload();await assert.rejects(f.service.webhook(JSON.stringify(p),sign(p.data)));assert.equal(f.confirmations,0);
 }
});


test('test hosted checkout is allowed only with a server test key; live stays live-only',async()=>{
 const live='https://checkout.korapay.com/test/pay';
 const sandbox='https://test-checkout.korapay.com/test/pay';
 assert.equal(checkoutUrl(live,'sk_live_mock'),live);
 assert.equal(checkoutUrl(sandbox,'sk_test_mock'),sandbox);
 for(const key of ['', 'sk_live_mock','mock-kora-secret','SK_TEST_mock']) assert.throws(()=>checkoutUrl(sandbox,key));
 assert.throws(()=>checkoutUrl(live,'sk_test_mock'));
 for(const url of ['http://test-checkout.korapay.com/a','https://test-checkout.korapay.com.evil/a','https://a@test-checkout.korapay.com/a','https://test-checkout.korapay.com:444/a']) assert.throws(()=>checkoutUrl(url,'sk_test_mock'));
 const f=fixture({environment:{...env,KORAPAY_SECRET_KEY:'sk_test_mock'},charge:{checkout_url:sandbox}});
 assert.equal((await f.service.initialize({application})).checkout_url,sandbox);
 await assert.rejects(fixture({charge:{checkout_url:sandbox}}).service.initialize({application}),/Invalid provider checkout URL/);
});


test('observed sandbox success shape permits null accepted amount only with matching paid evidence',async()=>{
 const f=fixture({charge:{status:'success',amount:'2500.00',amount_paid:'2500.00',amount_accepted:null}});
 assert.deepEqual(await f.service.status(reference),{reference,status:'paid'});assert.equal(f.confirmations,1);
 const webhook=fixture({charge:{status:'success',amount:'2500.00',amount_paid:'2500.00',amount_accepted:null}});
 const p=payload();await webhook.service.webhook(JSON.stringify(p),sign(p.data));assert.equal(webhook.confirmations,1);
});
test('null optional actual amounts are absent evidence; no valid actual field rejects success',async()=>{
 for(const charge of [{amount_paid:null,amount_accepted:null},{amount_paid:undefined,amount_accepted:null},{amount_paid:null,amount_accepted:undefined}]){
  const f=fixture({charge});await assert.rejects(f.service.status(reference),/Actual payment amount is missing/);assert.equal(f.confirmations,0);
 }
 const acceptedOnly=fixture({charge:{amount_paid:null,amount_accepted:'2500.00'}});assert.equal((await acceptedOnly.service.status(reference)).status,'paid');
 for(const charge of [{amount_paid:'2499.00',amount_accepted:null},{amount_paid:null,amount_accepted:'2501.00'},{amount_paid:'invalid',amount_accepted:null}]){
  const f=fixture({charge});await assert.rejects(f.service.status(reference));assert.equal(f.confirmations,0);
 }
});
