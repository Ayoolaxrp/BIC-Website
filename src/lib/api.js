import { getSupabase, isSupabaseConfigured } from './supabase';
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
  const supabase = await getSupabase();
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
export async function fetchResources() {
  const rows = await readRows('resources', 'created_at', false);
  if (!isSupabaseConfigured || !rows.length) return rows;
  const supabase = await getSupabase();
  return Promise.all(rows.map(async (row) => {
    const marker = '/bic-resources/';
    const path = row.file_url?.includes(marker)
      ? row.file_url.slice(row.file_url.indexOf(marker) + marker.length)
      : row.file_url;
    if (!path || /^https?:\/\//i.test(path)) return row;
    const { data, error } = await supabase.storage.from('bic-resources').createSignedUrl(path, 3600);
    return error ? { ...row, file_url: null } : { ...row, file_url: data.signedUrl };
  }));
}
export const fetchNewsletterPosts = () =>
  readRows('newsletter_posts', 'created_at', false).then((rows) =>
    rows.filter((r) => r.status === 'published'),
  );

// ---------------------------------------------------------------------------
// ADMIN CRUD (requires an authenticated admin — RLS enforces is_admin())
// ---------------------------------------------------------------------------
async function adminWrite(table, payload) {
  if (!isSupabaseConfigured) return demoInsert(table, payload);
  const supabase = await getSupabase();
  const { error } = await supabase.from(table).insert([payload]);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

async function adminDelete(table, id) {
  if (!isSupabaseConfigured) return demoDelete(table, id);
  const supabase = await getSupabase();
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

/**
 * Record (or undo) a membership fee taken in person or by bank transfer.
 * Admin-only: the database function refuses everyone else.
 */
export async function setMembershipPayment(applicationId, status, method = null, note = '') {
  if (!isSupabaseConfigured) return { ok: false, error: 'The database is not connected.' };
  const supabase = await getSupabase();
  const { data, error } = await supabase.rpc('admin_set_membership_payment', {
    p_application_id: applicationId,
    p_status: status,
    p_method: method,
    p_note: note,
  });
  return error ? { ok: false, error: error.message } : { ok: true, row: data };
}

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
  const supabase = await getSupabase();
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
  const supabase = await getSupabase();
  const out = {};
  for (const t of SUBMISSION_TABLES) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    out[t] = error ? 0 : count;
  }
  return out;
}
