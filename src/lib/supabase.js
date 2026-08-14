import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client. The site works fully without it — forms fall back to
 * local storage — but once VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are
 * set in .env, every submission is stored in Postgres (see supabase/schema.sql).
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;
