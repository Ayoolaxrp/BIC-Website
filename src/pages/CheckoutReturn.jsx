import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { checkoutRequest } from '../lib/checkout';
import { sectorLabel } from '../lib/sectors';
export default function CheckoutReturn(){
 const [params]=useSearchParams();const reference=params.get('reference')||'';
 const [status,setStatus]=useState('checking');const [error,setError]=useState('');const [group,setGroup]=useState(null);
 const check=async()=>{setStatus('checking');setError('');try{const result=await checkoutRequest('status',{reference});setStatus(result.status);if(result.status==='paid'){sessionStorage.removeItem('bic-kora-reference');setGroup(result.group_link?.startsWith('https://chat.whatsapp.com/')?{url:result.group_link,name:result.group==='Members'?'BIC members':sectorLabel(result.group)}:null);}}catch(e){setError(e.message);setStatus('error');}};
 useEffect(()=>{void check();},[reference]);
 return <section className="section container"><h1>Payment confirmation</h1>
 <p role="status">{status==='paid'?'Payment verified by the server. Your registration is recorded.':status==='pending'?'Payment is still pending. Do not pay again while confirmation is outstanding.':status==='checking'?'Checking your payment securely…':'We could not confirm this payment yet.'}</p>
 {error&&<p role="alert">{error}</p>}{status!=='paid'&&<button className="btn btn-primary" disabled={status==='checking'} onClick={check}>Check again</button>}
 {status==='paid'&&(group?<p><a className="btn btn-primary btn-wrap" href={group.url} target="_blank" rel="noreferrer">Join the {group.name} group on WhatsApp</a></p>:<p>The sector chair will add you to your group chat.</p>)}
 <p><Link to="/member">Return to member portal</Link></p><p>Closing checkout or returning here does not prove payment. Only server verification confirms it.</p></section>;
}
