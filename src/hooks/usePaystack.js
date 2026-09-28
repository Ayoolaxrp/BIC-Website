import { useEffect, useState } from 'react';
import { paystackConfigured } from '../lib/config';

const PAYSTACK_SRC = 'https://js.paystack.co/v1/inline.js';

/**
 * Dynamically loads the Paystack Pop inline script (idempotent) and
 * exposes a `pay` helper — the React equivalent of the static site's
 * window.payWithPaystack().
 *
 * status: 'idle' | 'loading' | 'ready' | 'error'
 */
export default function usePaystack() {
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // No checkout is possible without a public key — skip loading inline.js
    // entirely (no wasted request, no console exception).
    if (!paystackConfigured) return;
    if (window.PaystackPop) {
      setStatus('ready');
      return;
    }
    let script = document.querySelector(`script[data-paystack="1"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = PAYSTACK_SRC;
      script.dataset.paystack = '1';
      script.async = true;
      // inline.js runs a self-setup check while evaluating and THROWS
      // "Please put your Paystack Inline javascript file inside of a form
      // element" unless its script tag sits inside a <form>. A hidden
      // holder form satisfies that check without affecting the UI.
      const holder = document.createElement('form');
      holder.style.display = 'none';
      holder.setAttribute('aria-hidden', 'true');
      holder.appendChild(script);
      document.body.appendChild(holder);
    }
    script.onload = () => setStatus('ready');
    script.onerror = () => setStatus('error');
    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  const pay = ({ email, amount, key, metadata, onSuccess, onClose }) => {
    if (!window.PaystackPop) return false;
    const handler = window.PaystackPop.setup({
      key,
      email,
      amount: amount * 100, // Naira -> kobo
      currency: 'NGN',
      metadata,
      ref: `BIC_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
      callback: (response) => {
        if (onSuccess) onSuccess(response);
      },
      onClose: () => {
        if (onClose) onClose();
      },
    });
    handler.openIframe();
    return true;
  };

  return { status, pay };
}
