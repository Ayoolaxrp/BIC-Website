import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  createArticle,
  createEvent,
  createNewsletterPost,
  createResource,
  deleteArticle,
  deleteEvent,
  deleteNewsletterPost,
  deleteResource,
  fetchArticles,
  fetchEvents,
  fetchNewsletterPosts,
  fetchResources,
  fetchSubmissionCounts,
  fetchSubmissions,
} from '../lib/api';
import { getLocalQueue } from '../lib/store';
import { uploadFile, formatBytes } from '../lib/upload';
import { SECTORS, sectorLabel } from '../lib/sectors';
import { getCurrentUser, isDemoMode, onAuthChange, signIn, signInWithGoogle, signOut } from '../lib/auth';

const TABS = ['overview', 'events', 'articles', 'resources', 'newsletter', 'submissions'];

const SUBMISSION_TABLES = [
  { table: 'member_applications', label: 'Member Applications' },
  { table: 'contact_messages', label: 'Contact Messages' },
  { table: 'sponsorship_inquiries', label: 'Sponsorship Inquiries' },
  { table: 'rsvps', label: 'RSVPs' },
  { table: 'subscribers', label: 'Newsletter Subscribers' },
];

const labelOf = { overview: 'Overview', events: 'Events', articles: 'Articles', resources: 'Resources', newsletter: 'Newsletter', submissions: 'Submissions' };

function Field({ label, children, hint }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      {children}
      {hint && <span className="field-error" style={{ color: 'var(--gray-500)', fontSize: '0.78rem', marginTop: 6 }}>{hint}</span>}
    </div>
  );
}

/** File input with live preview + size check (decorative; real validation in uploadFile). */
function FileField({ name, kind = 'image', label, hint }) {
  const [preview, setPreview] = useState(null);
  const [size, setSize] = useState('');
  const inputRef = useRef(null);
  const maxMb = kind === 'image' ? 5 : 3.5;

  // Clear preview/size when the parent form resets (e.g. after a successful save).
  useEffect(() => {
    const form = inputRef.current?.closest('form');
    if (!form) return;
    const onReset = () => {
      setPreview(null);
      setSize('');
    };
    form.addEventListener('reset', onReset);
    return () => form.removeEventListener('reset', onReset);
  }, []);

  const onChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      setSize('');
      return;
    }
    setSize(`${file.type.split('/')[1]?.toUpperCase() || 'FILE'} · ${formatBytes(file.size)}${file.size > maxMb * 1024 * 1024 ? ' — exceeds ' + maxMb + ' MB limit' : ''}`);
    if (kind === 'image') {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  return (
    <Field label={label} hint={hint}>
      <input ref={inputRef} type="file" name={name} accept={kind === 'image' ? 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml' : 'application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv,text/plain,application/zip'} onChange={onChange} />
      {size && <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{size}</span>}
      {kind === 'image' && preview && (
        <img src={preview} alt="Preview" className="admin-upload-preview" />
      )}
    </Field>
  );
}

function AdminForm({ onSubmit, children, submitText }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const handle = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const ok = await onSubmit(new FormData(e.target));
    setBusy(false);
    if (ok?.ok) {
      setMsg({ type: 'success', text: 'Saved successfully.' });
      e.target.reset();
    } else {
      setMsg({ type: 'error', text: ok?.error || 'Something went wrong.' });
    }
  };
  return (
    <form onSubmit={handle} className="admin-form">
      {children}
      <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }} disabled={busy}>
        {busy ? 'Saving...' : submitText}
      </button>
      {msg && <div className={`form-status visible ${msg.type}`}>{msg.text}</div>}
    </form>
  );
}

function ItemList({ rows, onDelete, empty }) {
  if (!rows.length) return <p className="admin-empty">{empty}</p>;
  return (
    <ul className="admin-list">
      {rows.map((r) => (
        <li key={r.id}>
          <div className="admin-list-main">
            <strong>{r.title || r.subject || r.name}</strong>
            {r.source_url && <a href={r.source_url} target="_blank" rel="noreferrer" className="admin-list-link">view ↗</a>}
            {r.body && <span className="admin-list-link">club article</span>}
            {r.size_label && <span style={{ color: 'var(--gray-500)', fontSize: '0.8rem' }}> · {r.size_label}</span>}
            {r.sector && <span className="badge badge-blue" style={{ marginLeft: 8 }}>{sectorLabel(r.sector)}</span>}
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => onDelete(r.id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function Admin() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('overview');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginMsg, setLoginMsg] = useState(null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const [events, setEvents] = useState([]);
  const [articles, setArticles] = useState([]);
  const [resources, setResources] = useState([]);
  const [news, setNews] = useState([]);
  const [counts, setCounts] = useState({});
  const [activeSubmission, setActiveSubmission] = useState('member_applications');
  const [submissions, setSubmissions] = useState([]);
  const [dataMsg, setDataMsg] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [articleMode, setArticleMode] = useState('club'); // 'club' | 'curated'
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    getCurrentUser().then(setUser);
    const unsub = onAuthChange((u) => setUser(u));
    return unsub;
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    setDataMsg(null);
    const [ev, ar, re, ne, c, app] = await Promise.all([
      fetchEvents(),
      fetchArticles(),
      fetchResources(),
      fetchNewsletterPosts(),
      fetchSubmissionCounts(),
      fetchSubmissions('member_applications', 200),
    ]);
    setEvents(ev);
    setArticles(ar);
    setResources(re);
    setNews(ne);
    setCounts(c);
    setApplications(app);
    setRefreshing(false);
  };

  useEffect(() => {
    if (user) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSubmissions(activeSubmission, 30).then(setSubmissions);
    }
  }, [user, activeSubmission]);

  // Live activity feed — newest first across local queue + admin content.
  const activity = useMemo(() => {
    if (!user) return [];
    const items = [];
    for (const s of SUBMISSION_TABLES) {
      if (counts[s.table]) items.push({ key: `sub-${s.table}`, label: `${counts[s.table]} new ${s.label.toLowerCase()}`, at: Date.now() });
    }
    for (const r of events.slice(0, 3)) items.push({ key: `ev-${r.id}`, label: `Event added: ${r.title}`, at: new Date(r.created_at).getTime() });
    for (const r of articles.slice(0, 3)) items.push({ key: `ar-${r.id}`, label: `Article added: ${r.title}`, at: new Date(r.created_at).getTime() });
    for (const r of news.slice(0, 3)) items.push({ key: `nw-${r.id}`, label: `Newsletter published: ${r.subject}`, at: new Date(r.created_at).getTime() });
    for (const q of getLocalQueue().slice(0, 6)) items.push({ key: `q-${q.stored_at}`, label: `Submission received: ${q.full_name || q.contact_name || q.email || q._table}`, at: new Date(q.stored_at).getTime() });
    return items.sort((a, b) => b.at - a.at).slice(0, 8);
  }, [user, counts, events, articles, news]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginBusy(true);
    setLoginMsg(null);
    const res = await signIn(loginEmail, loginPass);
    setLoginBusy(false);
    if (!res.ok) {
      setLoginMsg({ type: 'error', text: res.error });
    } else {
      setUser(res.user); // demo mode has no auth event — update directly
    }
  };

  const handleGoogle = async () => {
    setGoogleBusy(true);
    setLoginMsg(null);
    const res = await signInWithGoogle();
    setGoogleBusy(false);
    if (!res.ok) setLoginMsg({ type: 'error', text: res.error });
    // success → Supabase redirects; nothing to do here
  };

  const handleLogout = () => {
    signOut();
    setUser(null);
    setEvents([]);
    setArticles([]);
    setResources([]);
    setNews([]);
    setCounts({});
    setSubmissions([]);
    setTab('overview');
  };

  const flash = (res) => {
    setDataMsg(res.ok ? { type: 'success', text: 'Done.' } : { type: 'error', text: res.error });
    refresh();
    return res;
  };

  // -------- Not configured state --------
  if (user === null) {
    return (
      <section className="section container admin-login-wrap">
        <div className="admin-login-card">
          <h1 className="admin-title">Admin Console</h1>
          <p className="admin-subtitle">
            Sign in to manage events, articles, resources, newsletter posts, and review submissions.
          </p>
          {!isSupabaseConfigured && (
            <div className="form-status visible demo" style={{ marginBottom: 16 }}>
              <strong>Demo mode:</strong> Supabase isn't connected yet — the console runs on
              local demo data with no stored accounts. Add your keys to sign in for real.
            </div>
          )}
          {loginMsg && <div className={`form-status visible ${loginMsg.type}`}>{loginMsg.text}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@babcock.edu.ng" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" required value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="••••••••" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loginBusy}>
              {loginBusy ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          {!isDemoMode && (
            <>
              <div className="auth-divider"><span>or</span></div>
              <button
                type="button"
                className="btn btn-google"
                onClick={handleGoogle}
                disabled={googleBusy}
              >
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.5l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
                {googleBusy ? 'Redirecting...' : 'Continue with Google'}
              </button>
            </>
          )}

          <p className="admin-hint" style={{ marginTop: 16 }}>
            {isDemoMode
              ? 'Demo mode stores nothing — connect Supabase to sign in with a real account.'
              : 'First time? Create the admin user in Supabase and run the promotion SQL from supabase/schema.sql — see README.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section container">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <div className="admin-topbar">
          <div>
            <h1 className="admin-title">Admin Console</h1>
            <p className="admin-subtitle">
              Signed in as <strong>{user.email}</strong>{' '}
              {isDemoMode && <span className="demo-badge" style={{ marginLeft: 8 }}>Demo session</span>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={refresh} disabled={refreshing}>
              {refreshing ? 'Refreshing…' : '↻ Refresh'}
            </button>
            <button type="button" className="btn btn-outline" onClick={handleLogout}>Sign Out</button>
          </div>
        </div>

        {dataMsg && <div className={`form-status visible ${dataMsg.type}`}>{dataMsg.text}</div>}

        <div className="admin-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              className={`admin-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {labelOf[t]}
            </button>
          ))}
        </div>

        {/* OVERVIEW — interactive */}
        {tab === 'overview' && (
          <div className="admin-overview">
            <div className="admin-overview-cards">
              <button type="button" className="metric-card static" onClick={() => setTab('events')}>
                <div className="metric-num">{events.length}</div>
                <div className="metric-label">Events · manage →</div>
              </button>
              <button type="button" className="metric-card static" onClick={() => setTab('articles')}>
                <div className="metric-num">{articles.length}</div>
                <div className="metric-label">Articles · manage →</div>
              </button>
              <button type="button" className="metric-card static" onClick={() => setTab('resources')}>
                <div className="metric-num">{resources.length}</div>
                <div className="metric-label">Resources · manage →</div>
              </button>
              <button type="button" className="metric-card static" onClick={() => setTab('newsletter')}>
                <div className="metric-num">{news.length}</div>
                <div className="metric-label">Newsletter Posts · manage →</div>
              </button>
              {SUBMISSION_TABLES.map((s) => (
                <button
                  type="button"
                  className="metric-card static"
                  key={s.table}
                  onClick={() => { setActiveSubmission(s.table); setTab('submissions'); }}
                >
                  <div className="metric-num">{counts[s.table] ?? '—'}</div>
                  <div className="metric-label">{s.label} · review →</div>
                </button>
              ))}
            </div>

            <div className="admin-panel" style={{ marginTop: 32 }}>
              <h2 className="admin-panel-title">Members by Sector</h2>
              {(() => {
                const counts = Object.fromEntries(
                  SECTORS.map((s) => [s.value, applications.filter((a) => (a.sector || 'General') === s.value).length]),
                );
                const max = Math.max(1, ...Object.values(counts));
                if (applications.length === 0) {
                  return <p className="admin-empty">No member applications yet — sector data will appear here as students apply.</p>;
                }
                return (
                  <div className="sector-bars">
                    {SECTORS.map((s) => (
                      <div className="sector-bar" key={s.value}>
                        <div className="sector-bar-head">
                          <span>{s.label}</span>
                          <span className="sector-bar-count">{counts[s.value]}</span>
                        </div>
                        <div className="sector-bar-track">
                          <div className="sector-bar-fill" style={{ width: `${(counts[s.value] / max) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  <p className="admin-hint" style={{ marginTop: 12 }}>
                    Sectors let each executive lead their own community (crypto, forex, securities, real estate…).
                    Members pick a sector at signup and can change it from their profile.
                  </p>
                  </div>
                );
              })()}
            </div>

            <div className="admin-panel" style={{ marginTop: 32 }}>
              <h2 className="admin-panel-title">Recent Activity</h2>
              {activity.length === 0 ? (
                <p className="admin-empty">No activity yet — submissions you receive and content you publish will appear here live.</p>
              ) : (
                <ul className="admin-activity">
                  {activity.map((a) => (
                    <li key={a.key}>
                      <span className="admin-activity-dot" />
                      <span className="admin-activity-text">{a.label}</span>
                    </li>
                  ))}
                </ul>
              )}
              {isDemoMode && (
                <p className="admin-hint" style={{ marginTop: 16 }}>
                  Demo mode: activity is pulled from this browser's local storage. Live Supabase data appears once configured.
                </p>
              )}
            </div>
          </div>
        )}

        {/* EVENTS */}
        {tab === 'events' && (
          <div className="admin-panel">
            <h2 className="admin-panel-title">Add Event</h2>
            <AdminForm onSubmit={async (fd) => {
              const coverFile = fd.get('cover_file');
              let image_url = fd.get('image_url') || null;
              if (coverFile && coverFile.size) {
                const up = await uploadFile(coverFile, 'image', 'events');
                if (!up.ok) return up;
                image_url = up.url;
              }
              return createEvent({
                title: fd.get('title'),
                description: fd.get('description'),
                event_date: fd.get('event_date') || null,
                event_time: fd.get('event_time') || null,
                location: fd.get('location') || null,
                event_type: fd.get('event_type') || 'Event',
                image_url,
                is_upcoming: fd.get('is_upcoming') === 'on',
              }).then(flash);
            }} submitText="Add Event">
              <Field label="Event Title"><input type="text" name="title" required placeholder="Annual Student Finance Summit 2027" /></Field>
              <Field label="Description"><textarea name="description" required placeholder="What will attendees experience?"></textarea></Field>
              <div className="grid-2">
                <Field label="Date"><input type="date" name="event_date" /></Field>
                <Field label="Time"><input type="text" name="event_time" placeholder="10:00 AM - 4:00 PM" /></Field>
              </div>
              <div className="grid-2">
                <Field label="Location"><input type="text" name="location" placeholder="Main Auditorium, Babcock University" /></Field>
                <Field label="Type"><input type="text" name="event_type" placeholder="Summit | Workshop | Competition" /></Field>
              </div>
              <FileField name="cover_file" kind="image" label="Cover Image (upload, optional)" hint="Max 5 MB. PNG, JPG, WEBP, GIF or SVG." />
              <Field label="…or image URL (optional)"><input type="url" name="image_url" placeholder="https://images.unsplash.com/..." /></Field>
              <label className="admin-check">
                <input type="checkbox" name="is_upcoming" defaultChecked /> This is an upcoming event
              </label>
            </AdminForm>
            <h2 className="admin-panel-title" style={{ marginTop: 40 }}>Current Events</h2>
            <ItemList rows={events} onDelete={(id) => deleteEvent(id).then(flash)} empty="No events yet — add your first one above." />
          </div>
        )}

        {/* ARTICLES */}
        {tab === 'articles' && (
          <div className="admin-panel">
            <div className="admin-sub-tabs">
              <button type="button" className={`admin-tab${articleMode === 'club' ? ' active' : ''}`} onClick={() => setArticleMode('club')}>Write Club Article</button>
              <button type="button" className={`admin-tab${articleMode === 'curated' ? ' active' : ''}`} onClick={() => setArticleMode('curated')}>Add Curated Article</button>
            </div>

            {articleMode === 'club' ? (
              <AdminForm onSubmit={async (fd) => {
                const coverFile = fd.get('cover_file');
                let cover_url = null;
                if (coverFile && coverFile.size) {
                  const up = await uploadFile(coverFile, 'image', 'articles');
                  if (!up.ok) return up;
                  cover_url = up.url;
                }
                return createArticle({
                  title: fd.get('title'),
                  category: fd.get('category'),
                  summary: fd.get('summary'),
                  body: fd.get('body'),
                  cover_url,
                  author: 'Babcock Investors Club Editorial Team',
                  published_date: fd.get('published_date') || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                  is_external: false,
                }).then(flash);
              }} submitText="Publish Article">
                <Field label="Article Title"><input type="text" name="title" required placeholder="5 Things Every Student Investor Should Know" /></Field>
                <div className="grid-2">
                  <Field label="Category">
                    <select name="category" required defaultValue="">
                      <option value="" disabled>Select category</option>
                      <option>Market Updates</option>
                      <option>Financial Literacy</option>
                      <option>Student Finance</option>
                      <option>Investment Strategies</option>
                      <option>Crypto &amp; Digital Assets</option>
                      <option>Forex &amp; Trading</option>
                    </select>
                  </Field>
                  <Field label="Published Date"><input type="text" name="published_date" placeholder="e.g. Aug 12, 2026 (leave blank for today)" /></Field>
                </div>
                <Field label="Summary (1–2 sentences, shown on cards)"><textarea name="summary" required></textarea></Field>
                <Field label="Article Body"><textarea name="body" required rows={10} placeholder="Write the full article here. Paragraphs are kept automatically."></textarea></Field>
                <FileField name="cover_file" kind="image" label="Cover Image (upload, optional)" hint="Max 5 MB." />
              </AdminForm>
            ) : (
              <AdminForm onSubmit={async (fd) => {
                const coverFile = fd.get('cover_file');
                let cover_url = fd.get('cover_url') || null;
                if (coverFile && coverFile.size) {
                  const up = await uploadFile(coverFile, 'image', 'articles');
                  if (!up.ok) return up;
                  cover_url = up.url;
                }
                return createArticle({
                  title: fd.get('title'),
                  source_name: fd.get('source_name'),
                  source_url: fd.get('source_url'),
                  category: fd.get('category'),
                  summary: fd.get('summary'),
                  cover_url,
                  published_date: fd.get('published_date') || null,
                  is_external: true,
                }).then(flash);
              }} submitText="Add Article">
                <Field label="Article Title"><input type="text" name="title" required placeholder="Exact headline of the real article" /></Field>
                <div className="grid-2">
                  <Field label="Publication / Source"><input type="text" name="source_name" required placeholder="Nairametrics" /></Field>
                  <Field label="Published Date"><input type="text" name="published_date" placeholder="Apr 1, 2026" /></Field>
                </div>
                <Field label="Original Article URL (must be real)"><input type="url" name="source_url" required placeholder="https://nairametrics.com/..." /></Field>
                <Field label="Category">
                  <select name="category" required defaultValue="">
                    <option value="" disabled>Select category</option>
                    <option>Market Updates</option>
                    <option>Financial Literacy</option>
                    <option>Student Finance</option>
                    <option>Investment Strategies</option>
                    <option>Crypto &amp; Digital Assets</option>
                    <option>Forex &amp; Trading</option>
                  </select>
                </Field>
                <Field label="Summary (1–2 sentences)"><textarea name="summary" required></textarea></Field>
                <FileField name="cover_file" kind="image" label="Cover Image (upload, optional)" hint="Max 5 MB." />
                <Field label="…or cover image URL (optional)"><input type="url" name="cover_url" placeholder="https://images.unsplash.com/..." /></Field>
              </AdminForm>
            )}
            <h2 className="admin-panel-title" style={{ marginTop: 40 }}>Current Articles</h2>
            <ItemList rows={articles} onDelete={(id) => deleteArticle(id).then(flash)} empty="No articles yet — add your first one above." />
          </div>
        )}

        {/* RESOURCES */}
        {tab === 'resources' && (
          <div className="admin-panel">
            <h2 className="admin-panel-title">Add Resource</h2>
            <AdminForm onSubmit={async (fd) => {
              const file = fd.get('file');
              if (!file || !file.size) return { ok: false, error: 'Please choose a file to upload.' };
              const up = await uploadFile(file, 'resource', 'resources');
              if (!up.ok) return up;
              return createResource({
                title: fd.get('title'),
                file_url: up.url,
                description: fd.get('description'),
                size_label: up.size_label,
                sector: fd.get('sector') || null,
              }).then(flash);
            }} submitText="Add Resource">
              <Field label="Resource Title"><input type="text" name="title" required placeholder="Beginner's Guide to Investing" /></Field>
              <FileField name="file" kind="resource" label="File (PDF, Excel, Word, CSV, TXT or ZIP)" hint="Max 3.5 MB." />
              <div className="grid-2">
                <Field label="Description"><input type="text" name="description" placeholder="Short description" /></Field>
                <Field label="Sector (optional)" hint="Which sector community is this for? Leave empty for all members.">
                  <select name="sector" defaultValue="">
                    <option value="">All members</option>
                    {SECTORS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </AdminForm>
            <h2 className="admin-panel-title" style={{ marginTop: 40 }}>Current Resources</h2>
            <ItemList rows={resources} onDelete={(id) => deleteResource(id).then(flash)} empty="No resources yet — add your first one above." />
          </div>
        )}

        {/* NEWSLETTER */}
        {tab === 'newsletter' && (
          <div className="admin-panel">
            <h2 className="admin-panel-title">Write Newsletter Post</h2>
            <p className="admin-subtitle">
              Published posts appear in the <Link to="/blog">Blog</Link> newsletter section. Use the
              editor to announce events, market updates, and member news.
            </p>
            <AdminForm onSubmit={(fd) => createNewsletterPost({
              subject: fd.get('subject'),
              body: fd.get('body'),
            }).then(flash)} submitText="Publish Post">
              <Field label="Subject"><input type="text" name="subject" required placeholder="October Market Update & Summit Announcement" /></Field>
              <Field label="Body (plain text / markdown)"><textarea name="body" required rows={6} placeholder="Write the newsletter content here..."></textarea></Field>
            </AdminForm>
            <h2 className="admin-panel-title" style={{ marginTop: 40 }}>Published Posts</h2>
            <ItemList rows={news} onDelete={(id) => deleteNewsletterPost(id).then(flash)} empty="No newsletter posts yet — write your first one above." />
          </div>
        )}

        {/* SUBMISSIONS */}
        {tab === 'submissions' && (
          <div className="admin-panel">
            <h2 className="admin-panel-title">Submissions</h2>
            <div className="admin-sub-tabs">
              {SUBMISSION_TABLES.map((s) => (
                <button
                  key={s.table}
                  type="button"
                  className={`admin-tab${activeSubmission === s.table ? ' active' : ''}`}
                  onClick={() => setActiveSubmission(s.table)}
                >
                  {s.label} <span className="admin-count">({counts[s.table] ?? '—'})</span>
                </button>
              ))}
            </div>
            {submissions.length === 0 ? (
              <p className="admin-empty">No submissions in this category yet.</p>
            ) : (
              <div className="admin-sub-list">
                {submissions.map((s) => (
                  <div className="admin-sub-item" key={s.id || s.stored_at}>
                    <div className="admin-sub-head">
                      <strong>{s.full_name || s.contact_name || s.first_name || s.name || s.email}</strong>
                      <span>{new Date(s.created_at || s.stored_at).toLocaleString()}</span>
                    </div>
                    {s.sector && (
                      <span className="badge badge-blue" style={{ marginTop: 8 }}>
                        Sector: {sectorLabel(s.sector)}
                      </span>
                    )}
                    <pre>{JSON.stringify(s, null, 2)}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </section>
  );
}
