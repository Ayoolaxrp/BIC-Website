import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { checkoutRequest } from '../lib/checkout';
export default function CheckoutReturn(){
 const [params]=useSearchParams();const reference=params.get('reference')||'';
 const [status,setStatus]=useState('checking');const [error,setError]=useState('');
 const check=async()=>{setStatus('checking');setError('');try{const result=await checkoutRequest('status',{reference});setStatus(result.status);if(result.status==='paid')sessionStorage.removeItem('bic-kora-reference');}catch(e){setError(e.message);setStatus('error');}};
 useEffect(()=>{void check();},[reference]);
 return <section className="section container"><h1>Payment confirmation</h1>
 <p role="status">{status==='paid'?'Payment verified by the server. Your registration is recorded.':status==='pending'?'Payment is still pending. Do not pay again while confirmation is outstanding.':status==='checking'?'Checking your payment securely…':'We could not confirm this payment yet.'}</p>
 {error&&<p role="alert">{error}</p>}{status!=='paid'&&<button className="btn btn-primary" disabled={status==='checking'} onClick={check}>Check again</button>}
 <p><Link to="/member">Return to member portal</Link></p><p>Closing checkout or returning here does not prove payment. Only server verification confirms it.</p></section>;
}
