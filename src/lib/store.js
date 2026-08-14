import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Offline queue — keeps every submission even when Supabase isn't
 * configured (dev/demo) or the network is down. Entries are stored under
 * `bic_local_queue` and can be replayed into the DB later.
 */
const LS_QUEUE_KEY = 'bic_local_queue';

function queueLocally(table, payload) {
  try {
    const queue = JSON.parse(localStorage.getItem(LS_QUEUE_KEY) || '[]');
    queue.push({ _table: table, ...payload, stored_at: new Date().toISOString() });
    localStorage.setItem(LS_QUEUE_KEY, JSON.stringify(queue));
    return { ok: true, source: 'local' };
  } catch {
    return { ok: false, source: 'error' };
  }
}

/**
 * Persist a record. Prefers Supabase (anonymous insert, protected by RLS);
 * transparently falls back to a local queue so nothing is ever lost.
 *
 * @param {string} table   Supabase table name (member_applications, contact_messages, ...)
 * @param {object} payload Column values
 * @returns {Promise<{ok: boolean, source: 'supabase'|'local'|'error'}>}
 */
export async function submitRecord(table, payload) {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from(table)
        .insert([{ ...payload, created_at: new Date().toISOString() }]);
      if (!error) return { ok: true, source: 'supabase' };
      console.warn(`[store] Supabase insert into ${table} failed — queuing locally:`, error.message);
    } catch (err) {
      console.warn(`[store] Supabase error for ${table} — queuing locally:`, err.message);
    }
  }
  return queueLocally(table, payload);
}

/** Read locally queued submissions (useful for a future admin/export view). */
export function getLocalQueue() {
  try {
    return JSON.parse(localStorage.getItem(LS_QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// DEMO CONTENT STORE — lets the admin console be fully testable before
// Supabase is connected. Admin-created events/articles/resources/newsletter
// posts persist to localStorage and feed the same pages as the real DB.
// ---------------------------------------------------------------------------
const CONTENT_KEY = 'bic_admin_content';

function readContent() {
  try {
    return JSON.parse(localStorage.getItem(CONTENT_KEY) || '{"events":[],"articles":[],"resources":[],"newsletter_posts":[]}');
  } catch {
    return { events: [], articles: [], resources: [], newsletter_posts: [] };
  }
}

function writeContent(content) {
  try {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
  } catch {
    /* quota exceeded — ignore */
  }
}

/** Demo-mode insert. Returns the row with a stable id. */
export function demoInsert(table, payload) {
  const content = readContent();
  if (!content[table]) content[table] = [];
  const row = {
    ...payload,
    id: `${table}-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    created_at: new Date().toISOString(),
  };
  content[table] = [row, ...content[table]];
  writeContent(content);
  return { ok: true, row };
}

/** Demo-mode delete. */
export function demoDelete(table, id) {
  const content = readContent();
  if (!content[table]) return { ok: true };
  content[table] = content[table].filter((r) => r.id !== id);
  writeContent(content);
  return { ok: true };
}

/** Demo-mode read. */
export function demoRead(table) {
  return readContent()[table] || [];
}
