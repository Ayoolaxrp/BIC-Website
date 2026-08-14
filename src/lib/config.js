/**
 * Central runtime configuration.
 *
 * `paystackConfigured` is true only when a real Paystack public key has been
 * provided via VITE_PAYSTACK_PUBLIC_KEY. The bundled fallback key is a test
 * placeholder that would open a failing checkout — so payment CTAs are
 * gated on this flag to avoid shipping a broken conversion path.
 */
const rawKey = (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '').trim();

export const PAYSTACK_PUBLIC_KEY = rawKey;

export const paystackConfigured =
  rawKey.startsWith('pk_') && !rawKey.includes('xxx') && rawKey.length > 20;

export const supabaseConfigured =
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);
