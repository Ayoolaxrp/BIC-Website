import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { checkoutRequest } from '../lib/checkout';
import { sectorLabel } from '../lib/sectors';
const nameOf=group=>group==='Members'?'BIC members':sectorLabel(group);
export default function CheckoutReturn(){
 const [params]=useSearchParams();const reference=params.get('reference')||'';
 const [status,setStatus]=useState('checking');const [error,setError]=useState('');const [groups,setGroups]=useState([]);
 const check=async()=>{setStatus('checking');setError('');try{const result=await checkoutRequest('status',{reference});setStatus(result.status);if(result.status==='paid'){sessionStorage.removeItem('bic-kora-reference');setGroups((result.groups||[]).filter(g=>g.link?.startsWith('https://chat.whatsapp.com/')));}}catch(e){setError(e.message);setStatus('error');}};
 useEffect(()=>{void check();},[reference]);
 return <section className="section container"><h1>Payment confirmation</h1>
 <p role="status">{status==='paid'?'Payment verified by the server. Your registration is recorded.':status==='pending'?'Payment is still pending. Do not pay again while confirmation is outstanding.':status==='checking'?'Checking your payment securely…':'We could not confirm this payment yet.'}</p>
 {error&&<p role="alert">{error}</p>}{status!=='paid'&&<button className="btn btn-primary" disabled={status==='checking'} onClick={check}>Check again</button>}
 {status==='paid'&&(groups.length?<div className="join-groups">
  <p>Your membership covers every group. Join the main chat first, then any sector you like.</p>
  {groups.filter(g=>g.group==='Members'||g.yours).map(g=><a key={g.group} className="btn btn-primary btn-wrap" href={g.link} target="_blank" rel="noreferrer">Join the {nameOf(g.group)} group on WhatsApp</a>)}
  {groups.some(g=>g.group!=='Members'&&!g.yours)&&<h2>More groups you can join</h2>}
  {groups.filter(g=>g.group!=='Members'&&!g.yours).map(g=><a key={g.group} className="btn btn-outline btn-wrap" href={g.link} target="_blank" rel="noreferrer">Join the {nameOf(g.group)} group on WhatsApp</a>)}
  </div>:<p>The sector chair will add you to your group chat.</p>)}
 <p><Link to="/member">Return to member portal</Link></p><p>Closing checkout or returning here does not prove payment. Only server verification confirms it.</p></section>;
}
