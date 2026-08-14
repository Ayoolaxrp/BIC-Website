import { useState } from 'react';
import { submitRecord } from '../lib/store';

/**
 * Form submission hook backed by the data layer (Supabase with a
 * localStorage fallback). Replaces the old Formspree-only handler.
 *
 * status: 'idle' | 'sending' | 'success' | 'error'
 * result: { source: 'supabase' | 'local' } | null
 */
export default function useSubmission(table) {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);

  const submit = async (payload) => {
    setStatus('sending');
    const res = await submitRecord(table, payload);
    setResult(res);
    setStatus(res.ok ? 'success' : 'error');
    return res;
  };

  const reset = () => {
    setStatus('idle');
    setResult(null);
  };

  return { status, result, submit, reset };
}
