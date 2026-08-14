import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCurrentUser, getMyApplication, getMyRsvps, getProfile, isDemoMode, onAuthChange, signIn, signInWithGoogle, signOut, signUp, updateProfile } from '../lib/auth';
import Seo from '../components/Seo';
import { fetchArticles, fetchNewsletterPosts, fetchResources } from '../lib/api';
import { asset } from '../lib/assets';
import { GROUP_LINKS, SECTORS, sectorLabel } from '../lib/sectors';

const MEMBER_RESOURCES = [
  { name: "Beginner's Guide to Investing", file: asset('/resources/bic-beginners-guide-to-investing.pdf'), size: 'PDF · 4.4 KB' },
  { name: 'Nigerian Stock Market 101', file: asset('/resources/bic-nigerian-stock-market-101.pdf'), size: 'PDF · 3.9 KB' },
  { name: 'Mock Trading Tournament Rules', file: asset('/resources/bic-mock-trading-rules.pdf'), size: 'PDF · 3.2 KB' },
  { name: 'Personal Budgeting Template', file: asset('/resources/bic-budget-template.csv'), size: 'CSV · 538 B' },
  { name: 'Sponsorship Prospectus', file: asset('/resources/bic-sponsorship-deck.pdf'), size: 'PDF · 3.2 KB' },
];

function AuthCard({ title, subtitle, onSubmit, buttonText, busy, msg, children }) {
  return (
    <div className="admin-login-card" style={{ maxWidth: 460 }}>
      <h1 className="admin-title" style={{ textAlign: 'center' }}>{title}</h1>
      <p className="admin-subtitle" style={{ textAlign: 'center' }}>{subtitle}</p>
      {msg && <div className={`form-status visible ${msg.type}`}>{msg.text}</div>}
      <form onSubmit={onSubmit}>
        {children}
        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
          {busy ? 'Please wait...' : buttonText}
        </button>
      </form>
    </div>
  );
}

export default function Member() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [application, setApplication] = useState(null);
  const [rsvps, setRsvps] = useState([]);

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [authMsg, setAuthMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  // Profile editing
  const [editName, setEditName] = useState('');
  const [editSector, setEditSector] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editMsg, setEditMsg] = useState(null);
  const [editing, setEditing] = useState(false);

  // Recent club updates
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);

  // Sector-tagged resources uploaded by admins
  const [sectorResources, setSectorResources] = useState([]);

  useEffect(() => {
    getCurrentUser().then(setUser);
    const unsub = onAuthChange((u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setApplication(null);
      setRsvps([]);
      setRecentPosts([]);
      setRecentArticles([]);
      return;
    }
    getProfile(user.id).then((p) => {
      setProfile(p);
      setEditName(p?.full_name || user.user_metadata?.full_name || '');
      setEditSector(p?.sector || user.user_metadata?.sector || '');
      setEditPhone(p?.phone || user.user_metadata?.phone || '');
      setEditBio(p?.bio || user.user_metadata?.bio || '');
    });
    getMyApplication(user.email).then(setApplication);
    getMyRsvps(user.email).then(setRsvps);
    fetchNewsletterPosts().then((rows) => setRecentPosts(rows.slice(0, 3)));
    fetchArticles().then((rows) => setRecentArticles(rows.slice(0, 4)));
    fetchResources().then((rows) => setSectorResources(rows));
  }, [user]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setBusy(true);
    setAuthMsg(null);

    // Membership is tied to a valid Babcock student email
    if (mode === 'signup' && !/^[^\s@]+@babcock\.edu\.ng$/i.test(email.trim())) {
      setBusy(false);
      setAuthMsg({
        type: 'error',
        text: 'Please use your official Babcock email (name.lastname@babcock.edu.ng) to create an account.',
      });
      return;
    }

    const res =
      mode === 'signup'
        ? await signUp(email, pass, name)
        : await signIn(email, pass);
    setBusy(false);
    if (!res.ok) {
      setAuthMsg({ type: 'error', text: res.error });
    } else if (mode === 'signup') {
      setAuthMsg({
        type: 'success',
        text: 'Account created! Check your Babcock email to confirm, then sign in below.',
      });
    } else {
      setUser(res.user); // demo mode has no auth event — update directly
    }
  };

  const handleGoogle = async () => {
    setGoogleBusy(true);
    setAuthMsg(null);
    const res = await signInWithGoogle();
    setGoogleBusy(false);
    if (!res.ok) setAuthMsg({ type: 'error', text: res.error });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditMsg(null);
    if (!editName.trim()) {
      setEditMsg({ type: 'error', text: 'Please enter your name.' });
      return;
    }
    const res = await updateProfile(user.id, {
      full_name: editName.trim(),
      sector: editSector || null,
      phone: editPhone.trim() || null,
      bio: editBio.trim() || null,
    });
    setEditMsg(res.ok ? { type: 'success', text: 'Profile updated.' } : { type: 'error', text: res.error });
    if (res.ok) {
      setProfile((p) => ({
        ...p,
        full_name: editName.trim(),
        sector: editSector || null,
        phone: editPhone.trim() || null,
        bio: editBio.trim() || null,
      }));
      setEditing(false);
    }
  };

  // Not signed in → auth screen
  if (!user) {
    return (
      <section className="section container admin-login-wrap">
        <Seo title="Member Portal" noindex />
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          {isDemoMode && (
            <div className="form-status visible demo" style={{ marginBottom: 16, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
              <strong>Demo mode:</strong> no accounts are stored — connect Supabase to sign in for real.
            </div>
          )}
          <AuthCard
            title={mode === 'signin' ? 'Member Login' : 'Create Member Account'}
            subtitle={
              mode === 'signin'
                ? 'Sign in to see your membership status, RSVPs, and member resources.'
                : 'Register with the same email you used on your membership application.'
            }
            onSubmit={handleAuth}
            buttonText={mode === 'signin' ? 'Sign In' : 'Create Account'}
            busy={busy}
            msg={authMsg}
          >
            {mode === 'signup' && (
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
              </div>
            )}
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name.lastname@babcock.edu.ng"
                aria-describedby="member-email-hint"
              />
              <span id="member-email-hint" className="field-error" style={{ color: 'var(--gray-500)', fontWeight: 500, fontSize: '0.78rem', marginTop: 6 }}>
                Member accounts are linked to your official @babcock.edu.ng email.
              </span>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" required minLength={6} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="At least 6 characters" />
            </div>
          </AuthCard>
          {!isDemoMode && (
            <>
              <div className="auth-divider" style={{ maxWidth: 460, margin: '14px auto 0' }}><span>or</span></div>
              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-google"
                  style={{ marginTop: 12 }}
                  onClick={handleGoogle}
                  disabled={googleBusy}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.5l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
                  {googleBusy ? 'Redirecting...' : 'Continue with Google'}
                </button>
              </div>
            </>
          )}

          <p className="text-center" style={{ marginTop: 16, color: 'var(--gray-500)', fontSize: '0.9rem' }}>
            {mode === 'signin' ? (
              <>
                New here? <button type="button" className="link-btn" onClick={() => { setMode('signup'); setAuthMsg(null); }}>Create an account</button>
              </>
            ) : (
              <>
                Already registered? <button type="button" className="link-btn" onClick={() => { setMode('signin'); setAuthMsg(null); }}>Sign in</button>
              </>
            )}{' '}
            · <Link to="/membership" className="link-btn">Apply for membership</Link>
          </p>
        </motion.div>
      </section>
    );
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <section className="section container">
      <Seo title="Member Portal" noindex />
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <div className="admin-topbar">
          <div>
            <h1 className="admin-title">Member Portal</h1>
            <p className="admin-subtitle">
              Welcome, <strong>{profile?.full_name || user.email}</strong>
              {isAdmin && ' · Admin account'}
              {isDemoMode && <span className="demo-badge" style={{ marginLeft: 8 }}>Demo session</span>}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              signOut();
              setUser(null);
              setProfile(null);
              setApplication(null);
              setRsvps([]);
            }}
          >
            Sign Out
          </button>
        </div>

        {/* PROFILE CARD */}
        <div className="admin-panel" style={{ marginBottom: 32 }}>
          <div className="admin-topbar" style={{ padding: 0 }}>
            <div>
              <h2 className="admin-panel-title" style={{ marginTop: 0 }}>My Profile</h2>
              <p className="admin-subtitle">
                {profile?.email || user.email}
                {profile?.role ? ` · Role: ${profile.role}` : ''}
              </p>
            </div>
            {!editing && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>Edit Name</button>
            )}
          </div>
          {editing ? (
            <form onSubmit={handleSaveProfile} style={{ maxWidth: 440 }}>
              {editMsg && <div className={`form-status visible ${editMsg.type}`}>{editMsg.text}</div>}
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your full name" />
              </div>
              <div className="form-group">
                <label>Primary Sector (what you want to go into)</label>
                <select value={editSector} onChange={(e) => setEditSector(e.target.value)}>
                  <option value="">Select your track</option>
                  {SECTORS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <span className="field-error" style={{ color: 'var(--gray-500)', fontSize: '0.78rem', marginTop: 6 }}>
                  Your sector shows on your profile and in the member directory.
                </span>
              </div>
              <div className="form-group">
                <label>Phone Number (optional)</label>
                <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+234 800 000 0000" />
              </div>
              <div className="form-group">
                <label>Short Bio (optional)</label>
                <textarea rows={2} value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="e.g. 300-level Accounting student interested in equities" />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary btn-sm">Save</button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditing(false); setEditMsg(null); }}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <div className="profile-avatar">
                {(profile?.full_name || 'BIC').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div className="profile-details" style={{ marginTop: 16 }}>
                {profile?.sector && (
                  <p><strong>Sector:</strong> {sectorLabel(profile.sector)}</p>
                )}
                {profile?.phone && <p><strong>Phone:</strong> {profile.phone}</p>}
                {profile?.bio && <p><strong>Bio:</strong> {profile.bio}</p>}
                {!profile?.sector && !profile?.phone && !profile?.bio && (
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>
                    Add your sector, phone, and a short bio — your sector tells the club which community to onboard you into.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* MEMBERSHIP STATUS */}
        <div className="member-status-card">
          <div>
            <h2 className="admin-panel-title" style={{ marginTop: 0 }}>Membership Status</h2>
            <p className="admin-subtitle">
              {application
                ? `Application submitted on ${new Date(application.created_at).toLocaleDateString()} — Reference: ${application.paystack_ref || 'pending'}. The exec team will onboard you at the next session.`
                : 'No membership application found for this email yet. Submit one to unlock full member benefits.'}
            </p>
          </div>
          {application ? (
            <span className="badge badge-green">Application Received</span>
          ) : (
            <Link to="/membership" className="btn btn-primary">Apply Now (₦5,000)</Link>
          )}
        </div>

        {/* RESOURCES */}
        <div className="admin-panel" style={{ marginTop: 32 }}>
          <h2 className="admin-panel-title">Member Resources</h2>
          <p className="admin-subtitle">
            Free downloads for registered members
            {profile?.sector ? ` — showing your ${sectorLabel(profile.sector)} picks first.` : '.'}
          </p>
          {sectorResources.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 className="admin-panel-title" style={{ fontSize: '1rem', marginTop: 0 }}>
                {profile?.sector ? `${sectorLabel(profile.sector)} resources` : 'Sector resources'}
              </h3>
              <div className="resource-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {sectorResources
                  .filter((r) => !profile?.sector || !r.sector || r.sector === profile.sector)
                  .map((r) => (
                    <a key={r.id} href={r.file_url} download className="resource-card" aria-label={`Download ${r.title}`}>
                      <div className="resource-icon">
                        <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div className="resource-text">
                        <h4>{r.title}</h4>
                        <p>{r.size_label || 'Download'} · {r.description}</p>
                      </div>
                      <span className="resource-download" aria-hidden="true">↓</span>
                    </a>
                  ))}
              </div>
            </div>
          )}
          <div className="resource-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {MEMBER_RESOURCES.map((r) => (
              <a key={r.name} href={r.file} download className="resource-card" aria-label={`Download ${r.name}`}>
                <div className="resource-icon">
                  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div className="resource-text">
                  <h4>{r.name}</h4>
                  <p>{r.size}</p>
                </div>
                <span className="resource-download" aria-hidden="true">↓</span>
              </a>
            ))}
          </div>
        </div>

        {/* COMMUNITY GROUPS */}
        <div className="admin-panel" style={{ marginTop: 32 }}>
          <h2 className="admin-panel-title">Community Groups</h2>
          <p className="admin-subtitle">
            Join your sector's group chat to meet other members and get sector-specific updates.
          </p>
          <div className="group-chat-grid">
            {SECTORS.map((s) => {
              const link = GROUP_LINKS[s.value];
              const isSet = link && !link.includes('REPLACE_');
              return (
                <div className={`group-chat-card${sectorLabel(profile?.sector) === s.label ? ' mine' : ''}`} key={s.value}>
                  <div>
                    <strong>{s.label}</strong>
                    <p>{s.desc}</p>
                  </div>
                  {isSet ? (
                    <a href={link} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                      Join Chat →
                    </a>
                  ) : (
                    <span className="group-chat-pending">Link coming soon</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RECENT CLUB UPDATES */}
        <div className="admin-panel" style={{ marginTop: 32 }}>
          <h2 className="admin-panel-title">Recent Club Updates</h2>
          {recentPosts.length === 0 && recentArticles.length === 0 ? (
            <p className="admin-empty">Nothing new yet — check back soon.</p>
          ) : (
            <ul className="admin-list">
              {recentPosts.map((p) => (
                <li key={p.id}>
                  <div className="admin-list-main">
                    <strong>{p.subject}</strong>
                    <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Newsletter · {new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                  <Link to="/blog" className="btn btn-outline btn-sm">Read →</Link>
                </li>
              ))}
              {recentArticles.map((a) => (
                <li key={a.id}>
                  <div className="admin-list-main">
                    <strong>{a.title}</strong>
                    <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>{a.category || 'Article'}</span>
                  </div>
                  {a.body ? (
                    <Link to={`/blog/${a.id}`} className="btn btn-outline btn-sm">Read →</Link>
                  ) : (
                    <a href={a.source_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Read →</a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* RSVP HISTORY */}
        <div className="admin-panel" style={{ marginTop: 32 }}>
          <h2 className="admin-panel-title">My Event RSVPs</h2>
          {rsvps.length === 0 ? (
            <p className="admin-empty">You haven't RSVP'd to any events yet. Browse <Link to="/events">upcoming events</Link>.</p>
          ) : (
            <ul className="admin-list">
              {rsvps.map((r) => (
                <li key={r.id}>
                  <div className="admin-list-main">
                    <strong>{r.event_name}</strong>
                    <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                  <span className="badge badge-green">RSVP Confirmed</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {isAdmin && (
          <div className="admin-panel" style={{ marginTop: 32 }}>
            <h2 className="admin-panel-title">Admin Access</h2>
            <p className="admin-subtitle">Your account has admin privileges.</p>
            <Link to="/admin" className="btn btn-navy">Open Admin Console</Link>
          </div>
        )}
      </motion.div>
    </section>
  );
}
