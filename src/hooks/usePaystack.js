import { useEffect, useState } from 'react';

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
      document.body.appendChild(script);
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
