export const koraCheckoutEnabled = import.meta.env.VITE_KORA_CHECKOUT_ENABLED === 'true';
export async function checkoutRequest(action,payload){
 if(!koraCheckoutEnabled)throw new Error('Online checkout is disabled.');
 const response=await fetch('/api/kora/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
 const body=await response.json();
 if(!response.ok){const error=new Error(body.error||'Checkout unavailable.');error.reference=body.reference;throw error;}return body;
}
