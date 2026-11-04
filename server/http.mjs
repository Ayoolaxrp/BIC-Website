import { CheckoutError, config, createCheckoutService } from './kora.mjs';
export function supabaseRpc(env, request=fetch){
 const url=new URL(env.SUPABASE_URL || env.VITE_SUPABASE_URL);
 if(url.protocol!=='https:'||url.pathname!=='/'||url.search||url.hash||url.username||url.password)throw new CheckoutError(503,'Invalid payment storage configuration');
 return async(name,args)=>{
  if(!['create_kora_intent','get_kora_intent','finalize_kora_payment'].includes(name))throw new Error('Invalid RPC');
  // Modern sb_secret_ keys authenticate with apikey only, never Bearer.
  const response=await request(url.origin+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:env.SUPABASE_SECRET_KEY,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error('Storage request failed');
  const text=await response.text();return text?JSON.parse(text):null;
 };
}
export async function readRaw(req,limit=32768){const parts=[];let size=0;for await(const chunk of req){const part=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);size+=part.length;if(size>limit)throw new CheckoutError(413,'Request too large');parts.push(part);}return Buffer.concat(parts).toString('utf8');}
/** @param {'initialize'|'status'|'webhook'} action @param {{env?: NodeJS.ProcessEnv, makeService?: Function}} options */
export function handler(action,{env=process.env,makeService=undefined}={}){
 return async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  try{
   if(req.method!=='POST'){res.setHeader('Allow','POST');throw new CheckoutError(405,'Method not allowed');}
   const cfg=config(env);
   if(action!=='webhook'&&req.headers.origin!==cfg.origin)throw new CheckoutError(403,'Invalid request origin');
   if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))throw new CheckoutError(415,'JSON required');
   const raw=await readRaw(req);
   const service=makeService?makeService():createCheckoutService({env,rpc:supabaseRpc(env)});
   let result;
   if(action==='webhook')result=await service.webhook(raw,req.headers['x-korapay-signature']);
   else{let input;try{input=JSON.parse(raw);}catch{throw new CheckoutError(400,'Invalid JSON');}result=action==='initialize'?await service.initialize(input):await service.status(input?.reference);}
   res.status(200).json(result);
  }catch(error){const known=error instanceof CheckoutError;res.status(known?error.status:500).json({error:known?error.message:'Checkout temporarily unavailable',...(known&&error.reference?{reference:error.reference}:{})});}
 };
}
