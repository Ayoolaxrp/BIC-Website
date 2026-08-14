import { supabase, isSupabaseConfigured } from './supabase';
import { demoDelete, demoInsert, demoRead, getLocalQueue } from './store';

/**
 * Data access layer.
 * - Public reads (events/articles/resources/newsletter) return the live DB rows
 *   when Supabase is configured, plus any admin-created demo content; callers
 *   fall back to built-in seed data otherwise.
 * - Admin functions require a logged-in admin session (RLS enforces it
 *   server-side). In demo mode they persist to localStorage so the whole
 *   console is testable before Supabase is connected.
 */

async function readRows(table, order = 'created_at', ascending = false, limit = 100) {
  if (!isSupabaseConfigured) return demoRead(table);
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order(order, { ascending })
    .limit(limit);
  if (error) {
    console.warn(`[api] read ${table} failed:`, error.message);
    return demoRead(table);
  }
  return data ?? [];
}

export const fetchEvents = () => readRows('events', 'created_at', false);
export const fetchArticles = () => readRows('articles', 'created_at', false);
export const fetchResources = () => readRows('resources', 'created_at', false);
export const fetchNewsletterPosts = () =>
  readRows('newsletter_posts', 'created_at', false).then((rows) =>
    rows.filter((r) => r.status === 'published'),
  );

// ---------------------------------------------------------------------------
// ADMIN CRUD (requires an authenticated admin — RLS enforces is_admin())
// ---------------------------------------------------------------------------
async function adminWrite(table, payload) {
  if (!isSupabaseConfigured) return demoInsert(table, payload);
  const { error } = await supabase.from(table).insert([payload]);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

async function adminDelete(table, id) {
  if (!isSupabaseConfigured) return demoDelete(table, id);
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export const createEvent = (p) => adminWrite('events', { ...p, is_upcoming: p.is_upcoming ?? true });
export const deleteEvent = (id) => adminDelete('events', id);

export const createArticle = (p) => adminWrite('articles', p);
export const deleteArticle = (id) => adminDelete('articles', id);

export const createResource = (p) => adminWrite('resources', p);
export const deleteResource = (id) => adminDelete('resources', id);

export const createNewsletterPost = (p) => adminWrite('newsletter_posts', { ...p, status: 'published' });
export const deleteNewsletterPost = (id) => adminDelete('newsletter_posts', id);

const SUBMISSION_TABLES = [
  'member_applications',
  'contact_messages',
  'sponsorship_inquiries',
  'rsvps',
  'subscribers',
];

export async function fetchSubmissions(table, limit = 50) {
  if (!isSupabaseConfigured) {
    return getLocalQueue()
      .filter((r) => r._table === table)
      .sort((a, b) => new Date(b.stored_at) - new Date(a.stored_at))
      .slice(0, limit);
  }
  const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) {
    console.warn(`[api] read ${table} failed:`, error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchSubmissionCounts() {
  if (!isSupabaseConfigured) {
    const out = {};
    const queue = getLocalQueue();
    for (const t of SUBMISSION_TABLES) out[t] = queue.filter((r) => r._table === t).length;
    return out;
  }
  const out = {};
  for (const t of SUBMISSION_TABLES) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    out[t] = error ? 0 : count;
  }
  return out;
}
