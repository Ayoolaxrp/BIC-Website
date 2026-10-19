import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  cameFromRecoveryLink,
  getCurrentUser,
  getMyApplication,
  getMyExecutiveAccess,
  getMyRsvps,
  getProfile,
  isDemoMode,
  onAuthChange,
  requestPasswordReset,
  signIn,
  signInWithGoogle,
  signOut,
  signUp,
  updatePassword,
  updateProfile,
} from '../lib/auth';
import { googleAuthEnabled } from '../lib/config';
import Seo from '../components/Seo';
import { fetchArticles, fetchNewsletterPosts, fetchResources } from '../lib/api';
import { GROUP_LINKS, SECTORS, sectorLabel } from '../lib/sectors';
import { CLUB_PHONE, whatsapp } from '../lib/contact';

const BABCOCK_EMAIL = /^[^\s@]+@babcock\.edu\.ng$/i;
const MIN_PASSWORD = 8;

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

function Status({ msg }) {
  if (!msg) return null;
  return (
    <div className={`form-status visible ${msg.type}`} role={msg.type === 'error' ? 'alert' : 'status'}>
      {msg.text}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Signed out: sign in, create an account, or ask for a reset link.
 * ------------------------------------------------------------------------ */
function AuthScreen({ onSignedIn }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const go = (m) => {
    setMode(m);
    setMsg(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    const cleanEmail = email.trim();

    if (mode === 'signup' && !BABCOCK_EMAIL.test(cleanEmail)) {
      setMsg({ type: 'error', text: 'Use your Babcock email (name.lastname@babcock.edu.ng) to create an account.' });
      return;
    }
    setBusy(true);
    if (mode === 'forgot') {
      const res = await requestPasswordReset(cleanEmail);
      setBusy(false);
      setMsg(res.ok
        ? { type: 'success', text: 'If that email has an account, a reset link is on its way. Check your inbox and spam folder.' }
        : { type: 'error', text: res.error });
      return;
    }
    const res = mode === 'signup' ? await signUp(cleanEmail, pass, name.trim()) : await signIn(cleanEmail, pass);
    setBusy(false);
    if (!res.ok) {
      setMsg({ type: 'error', text: res.error });
    } else if (mode === 'signup') {
      setMsg({ type: 'success', text: 'Account created. Open the confirmation link we sent to your Babcock email, then sign in.' });
      setMode('signin');
      setPass('');
    } else {
      onSignedIn(res.user);
    }
  };

  const title = { signin: 'Sign in to BIC.', signup: 'Create your account.', forgot: 'Reset your password.' }[mode];
  const sub = {
    signin: 'See your membership, your sector and the events you have signed up for.',
    signup: 'Use the same Babcock email as your membership application, so we can link the two.',
    forgot: 'Enter your account email and we will send you a link to choose a new password.',
  }[mode];
  const cta = { signin: 'Sign in', signup: 'Create account', forgot: 'Send reset link' }[mode];

  return (
    <section className="mp-auth">
      <div className="mp-auth-card">
        <h1>{title}</h1>
        <p className="mp-auth-sub">{sub}</p>
        <Status msg={msg} />
        <form onSubmit={submit} noValidate={false}>
          {mode === 'signup' && (
            <div className="form-group">
              <label htmlFor="mp-name">Full name</label>
              <input id="mp-name" type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="mp-email">{mode === 'signup' ? 'Babcock email' : 'Email'}</label>
            <input
              id="mp-email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name.lastname@babcock.edu.ng"
            />
          </div>
          {mode !== 'forgot' && (
            <div className="form-group">
              <div className="mp-label-row">
                <label htmlFor="mp-pass">Password</label>
                {mode === 'signin' && (
                  <button type="button" className="link-btn" onClick={() => go('forgot')}>Forgot password?</button>
                )}
              </div>
              <input
                id="mp-pass"
                type="password"
                required
                minLength={mode === 'signup' ? MIN_PASSWORD : undefined}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder={mode === 'signup' ? `At least ${MIN_PASSWORD} characters` : ''}
              />
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-full" disabled={busy}>
            {busy ? 'One moment…' : cta}
          </button>
        </form>

        {mode === 'signin' && !isDemoMode && googleAuthEnabled && (
          <button type="button" className="btn btn-outline btn-full mp-google" onClick={() => signInWithGoogle()}>
            Continue with Google
          </button>
        )}

        <p className="mp-switch">
          {mode === 'signin' && (
            <>New to the portal? <button type="button" className="link-btn" onClick={() => go('signup')}>Create an account</button></>
          )}
          {mode === 'signup' && (
            <>Already have an account? <button type="button" className="link-btn" onClick={() => go('signin')}>Sign in</button></>
          )}
          {mode === 'forgot' && (
            <>Remembered it? <button type="button" className="link-btn" onClick={() => go('signin')}>Back to sign in</button></>
          )}
        </p>
      </div>
      <p className="mp-auth-foot">
        Not a member yet? <Link to="/membership">Apply to join BIC</Link>. The portal is for students who have applied.
      </p>
    </section>
  );
}

/* --------------------------------------------------------------------------
 * After a reset link: choose a new password before anything else.
 * ------------------------------------------------------------------------ */
function NewPassword({ onDone, title = 'Choose a new password.', compact = false }) {
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (pass.length < MIN_PASSWORD) return setMsg({ type: 'error', text: `Use at least ${MIN_PASSWORD} characters.` });
    if (pass !== confirm) return setMsg({ type: 'error', text: 'The two passwords do not match.' });
    setBusy(true);
    const res = await updatePassword(pass);
    setBusy(false);
    if (!res.ok) return setMsg({ type: 'error', text: res.error });
    setPass('');
    setConfirm('');
    setMsg({ type: 'success', text: 'Password updated.' });
    onDone?.();
  };

  const form = (
    <form onSubmit={submit} className="mp-pass-form">
      <Status msg={msg} />
      <div className="form-group">
        <label htmlFor="np-pass">New password</label>
        <input id="np-pass" type="password" required minLength={MIN_PASSWORD} autoComplete="new-password" value={pass} onChange={(e) => setPass(e.target.value)} />
      </div>
      <div className="form-group">
        <label htmlFor="np-confirm">Type it again</label>
        <input id="np-confirm" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</button>
    </form>
  );

  if (compact) return form;
  return (
    <section className="mp-auth">
      <div className="mp-auth-card">
        <h1>{title}</h1>
        <p className="mp-auth-sub">You followed a reset link. Pick a password you have not used here before.</p>
        {form}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
 * Membership: three honest steps, each one either done or the next action.
 * ------------------------------------------------------------------------ */
function MembershipSteps({ application }) {
  const paid = application?.payment_status === 'paid';
  const method = application?.payment_method;
  const steps = [
    { title: 'Portal account', done: true, text: 'Created and confirmed.' },
    {
      title: 'Membership application',
      done: !!application,
      text: application
        ? `Received ${fmtDate(application.created_at)}.`
        : 'We could not find an application for this email.',
      action: !application && <Link to="/membership" className="btn btn-primary btn-sm">Apply now</Link>,
    },
    {
      title: '₦2,500 membership fee',
      done: paid,
      text: paid
        ? `Paid${method === 'cash' ? ' in cash' : method === 'transfer' ? ' by bank transfer' : method === 'paystack' || application?.paystack_ref ? ' online' : ''}${application?.payment_verified_at ? `, recorded ${fmtDate(application.payment_verified_at)}` : ''}.`
        : application
          ? 'Not recorded yet. Pay the membership team at a session, or message them to arrange a transfer. It shows here once they record it.'
          : 'Due after you apply.',
      action: application && !paid && (
        <a className="btn btn-outline btn-sm" href={whatsapp(`Hello BIC, I applied with ${application.email} and want to pay my ₦2,500 membership fee.`)} target="_blank" rel="noreferrer">
          Message the team
        </a>
      ),
    },
  ];
  const complete = steps.every((s) => s.done);

  return (
    <section className="mp-block" aria-labelledby="mp-membership">
      <div className="mp-block-head">
        <h2 id="mp-membership">Membership</h2>
        <p className={`mp-state${complete ? ' is-done' : ''}`}>{complete ? 'Active member' : 'In progress'}</p>
      </div>
      <ol className="mp-steps">
        {steps.map((s) => (
          <li key={s.title} className={s.done ? 'is-done' : ''}>
            <span className="mp-dot" aria-hidden="true" />
            <div>
              <h3>{s.title}<span className="sr-only">{s.done ? ' (done)' : ' (to do)'}</span></h3>
              <p>{s.text}</p>
              {s.action && <div className="mp-step-action">{s.action}</div>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* --------------------------------------------------------------------------
 * Signed in.
 * ------------------------------------------------------------------------ */
function Dashboard({ user, onSignOut }) {
  const [profile, setProfile] = useState(null);
  const [executiveAccess, setExecutiveAccess] = useState(null);
  const [application, setApplication] = useState(undefined); // undefined = loading
  const [rsvps, setRsvps] = useState([]);
  const [resources, setResources] = useState([]);
  const [updates, setUpdates] = useState([]);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', sector: '', phone: '', bio: '' });
  const [editMsg, setEditMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    let live = true;
    getProfile(user.id).then((p) => {
      if (!live) return;
      setProfile(p);
      setForm({
        full_name: p?.full_name || user.user_metadata?.full_name || '',
        sector: p?.sector || '',
        phone: p?.phone || '',
        bio: p?.bio || '',
      });
    });
    getMyExecutiveAccess(user.id).then((nextAccess) => live && setExecutiveAccess(nextAccess));
    getMyApplication(user.email).then((a) => live && setApplication(a));
    getMyRsvps(user.email).then((r) => live && setRsvps(r));
    fetchResources().then((r) => live && setResources(r));
    Promise.all([fetchNewsletterPosts(), fetchArticles()]).then(([posts, articles]) => {
      if (!live) return;
      setUpdates([
        ...posts.slice(0, 3).map((p) => ({ id: `n-${p.id}`, title: p.subject, meta: `Newsletter, ${fmtDate(p.created_at)}`, to: '/blog' })),
        ...articles.slice(0, 3).map((a) => ({ id: `a-${a.id}`, title: a.title, meta: a.category || 'Article', to: a.body ? `/blog/${a.id}` : null, href: a.body ? null : a.source_url })),
      ]);
    });
    return () => {
      live = false;
    };
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) return setEditMsg({ type: 'error', text: 'Please enter your name.' });
    setSaving(true);
    const updates = {
      full_name: form.full_name.trim(),
      sector: form.sector || null,
      phone: form.phone.trim() || null,
      bio: form.bio.trim() || null,
    };
    const res = await updateProfile(user.id, updates);
    setSaving(false);
    if (!res.ok) return setEditMsg({ type: 'error', text: res.error });
    setProfile((p) => ({ ...p, ...updates }));
    setEditMsg({ type: 'success', text: 'Profile saved.' });
    setEditing(false);
  };

  const paid = application?.payment_status === 'paid';
  const sector = application?.sector || profile?.sector || null;
  const campus = application?.campus || profile?.campus || null;
  const groupLink = sector && GROUP_LINKS[sector];
  const groupReady = groupLink && !groupLink.includes('REPLACE_');
  const sectorResources = resources.filter((r) => !r.sector || !sector || r.sector === sector);
  const firstName = (profile?.full_name || user.user_metadata?.full_name || '').split(' ')[0];
  const isAdmin = profile?.role === 'admin' || !!executiveAccess;

  return (
    <>
      <header className="mp-head surface-dark">
        <div className="container mp-head-inner">
          <div>
            <h1>{firstName ? `Hello, ${firstName}.` : 'Your BIC portal.'}</h1>
            <p>{user.email}</p>
          </div>
          <div className="mp-head-actions">
            {isAdmin && <Link to="/admin" className="btn btn-glass">Admin console</Link>}
            <button type="button" className="btn btn-glass" onClick={onSignOut}>Sign out</button>
          </div>
        </div>
      </header>

      <div className="container mp-grid">
        <div className="mp-main">
          {application === undefined ? (
            <section className="mp-block" aria-busy="true"><p className="mp-muted">Loading your membership…</p></section>
          ) : (
            <MembershipSteps application={application} />
          )}

          <section className="mp-block" aria-labelledby="mp-sector">
            <div className="mp-block-head">
              <h2 id="mp-sector">Your sector</h2>
              {sector && !paid && <button type="button" className="link-btn" onClick={() => setEditing(true)}>Change</button>}
            </div>
            {sector ? (
              <>
                <p className="mp-sector-name">{sectorLabel(sector)}</p>
                {campus && <p className="mp-muted">{campus} campus</p>}
                <p className="mp-muted">{SECTORS.find((s) => s.value === sector)?.desc}</p>
                {paid && <p className="mp-muted">Your sector is locked after activation. Contact the membership team to request a change.</p>}
                <div className="mp-row">
                  {groupReady ? (
                    <a href={groupLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Join the sector chat</a>
                  ) : (
                    <p className="mp-muted">The sector chair will add you to the group chat. The invite link will also appear here.</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="mp-muted">Pick the market you want to learn. It tells the club which sector to place you in.</p>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Choose a sector</button>
              </>
            )}

            <h3 className="mp-sub">Resources</h3>
            {!paid ? (
              <p className="mp-muted">Sector materials unlock automatically after your membership payment is verified.</p>
            ) : sectorResources.length === 0 ? (
              <p className="mp-muted">Nothing here yet. Session slides and reading lists appear here when the club uploads them.</p>
            ) : (
              <ul className="mp-list">
                {sectorResources.map((r) => (
                  <li key={r.id}>
                    <div>
                      <strong>{r.title}</strong>
                      <span>{[r.sector && sectorLabel(r.sector), r.size_label, r.description].filter(Boolean).join(' · ')}</span>
                    </div>
                    <a href={r.file_url} className="btn btn-outline btn-sm" download target="_blank" rel="noreferrer">Download</a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mp-block" aria-labelledby="mp-events">
            <div className="mp-block-head">
              <h2 id="mp-events">Your events</h2>
              <Link to="/events" className="link-btn">See all events</Link>
            </div>
            {rsvps.length === 0 ? (
              <p className="mp-muted">You have not signed up for an event yet.</p>
            ) : (
              <ul className="mp-list">
                {rsvps.map((r) => (
                  <li key={r.id}>
                    <div>
                      <strong>{r.event_name || 'Club event'}</strong>
                      <span>Signed up {fmtDate(r.created_at)}. We email the details once the date is set.</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {updates.length > 0 && (
            <section className="mp-block" aria-labelledby="mp-updates">
              <h2 id="mp-updates">From the club</h2>
              <ul className="mp-list">
                {updates.map((u) => (
                  <li key={u.id}>
                    <div>
                      <strong>{u.title}</strong>
                      <span>{u.meta}</span>
                    </div>
                    {u.to ? (
                      <Link to={u.to} className="btn btn-outline btn-sm">Read</Link>
                    ) : u.href ? (
                      <a href={u.href} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Read</a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="mp-side">
          <section className="mp-block" aria-labelledby="mp-profile">
            <div className="mp-block-head">
              <h2 id="mp-profile">Profile</h2>
              {!editing && <button type="button" className="link-btn" onClick={() => { setEditing(true); setEditMsg(null); }}>Edit</button>}
            </div>
            {!editing && <Status msg={editMsg} />}
            {editing ? (
              <form onSubmit={save}>
                <Status msg={editMsg} />
                <div className="form-group">
                  <label htmlFor="pf-name">Full name</label>
                  <input id="pf-name" type="text" autoComplete="name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="pf-sector">Sector</label>
                  <select id="pf-sector" value={form.sector} disabled={paid} onChange={(e) => setForm({ ...form, sector: e.target.value })}>
                    <option value="">Not chosen yet</option>
                    {SECTORS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="pf-phone">Phone (optional)</label>
                  <input id="pf-phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234" />
                </div>
                <div className="form-group">
                  <label htmlFor="pf-bio">About you (optional)</label>
                  <textarea id="pf-bio" rows={3} maxLength={300} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Your level, course and what you want to learn" />
                </div>
                <div className="mp-row">
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditing(false); setEditMsg(null); }}>Cancel</button>
                </div>
              </form>
            ) : (
              <dl className="mp-facts">
                <div><dt>Name</dt><dd>{profile?.full_name || 'Not set'}</dd></div>
                <div><dt>Sector</dt><dd>{sector ? sectorLabel(sector) : 'Not chosen yet'}</dd></div>
                <div><dt>Phone</dt><dd>{profile?.phone || 'Not added'}</dd></div>
                {profile?.bio && <div><dt>About</dt><dd>{profile.bio}</dd></div>}
              </dl>
            )}
          </section>

          <section className="mp-block" aria-labelledby="mp-security">
            <div className="mp-block-head">
              <h2 id="mp-security">Password</h2>
              {!changingPass && <button type="button" className="link-btn" onClick={() => setChangingPass(true)}>Change</button>}
            </div>
            {changingPass ? (
              <NewPassword compact onDone={() => setTimeout(() => setChangingPass(false), 1500)} />
            ) : (
              <p className="mp-muted">Use at least {MIN_PASSWORD} characters.</p>
            )}
          </section>

          <section className="mp-block mp-help">
            <h2>Need help?</h2>
            <p className="mp-muted">Message the membership team on WhatsApp at {CLUB_PHONE}.</p>
            <a className="btn btn-outline btn-sm" href={whatsapp('Hello BIC, I need help with the member portal.')} target="_blank" rel="noreferrer">Open WhatsApp</a>
          </section>
        </aside>
      </div>
    </>
  );
}

function MemberPortal() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [recovering, setRecovering] = useState(cameFromRecoveryLink());

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setReady(true);
    });
    return onAuthChange((u) => setUser(u));
  }, []);

  const doSignOut = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <>
      <Seo title="Member portal" noindex />
      {!ready ? (
        <section className="mp-auth" aria-busy="true" />
      ) : !user ? (
        <AuthScreen onSignedIn={setUser} />
      ) : recovering ? (
        <NewPassword
          onDone={() => {
            window.history.replaceState(null, '', '/member');
            setTimeout(() => setRecovering(false), 1200);
          }}
        />
      ) : (
        <Dashboard user={user} onSignOut={doSignOut} />
      )}
    </>
  );
}

/**
 * Member accounts need Supabase Auth. Until it is connected, show a plain
 * "coming soon" page instead of a demo login that stores nothing.
 */
function MemberComingSoon() {
  return (
    <>
      <Seo title="Member portal" noindex />
      <header className="page-hero">
        <div className="container">
          <h1>Member accounts are coming soon.</h1>
          <p>
            Once they are live you will be able to see your membership status, RSVPs and member
            resources here. Until then, apply on the membership page and the team will contact you.
          </p>
          <div className="h-actions" style={{ marginTop: 28 }}>
            <Link to="/membership" className="btn btn-primary">Join BIC</Link>
            <Link to="/contact" className="btn btn-outline">Contact the club</Link>
          </div>
        </div>
      </header>
    </>
  );
}

export default function Member() {
  return isDemoMode ? <MemberComingSoon /> : <MemberPortal />;
}
