/**
 * Supabase client — lazy. The site works fully without it — forms fall back
 * to local storage — but once VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are
 * set in .env, every submission is stored in Postgres (see supabase/schema.sql).
 *
 * The SDK (~70 KiB gz) is loaded via dynamic import on first use, so it never
 * blocks the initial render of public pages.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let clientPromise = null;

/** The shared Supabase client — resolves after the SDK loads on first call. */
export function getSupabase() {
  if (!isSupabaseConfigured) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url, anonKey),
    );
  }
  return clientPromise;
}
