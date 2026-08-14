import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Auth helpers (Supabase email/password) with a DEMO MODE fallback.
 *
 * Until Supabase is configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY),
 * two test accounts are available so the Admin Console and Member Portal can
 * be previewed end-to-end. Sessions are held in localStorage.
 *
 * ⚠️ TEST-ONLY — remove or replace with real Supabase users before launch.
 */
const DEMO_SESSION_KEY = 'bic-demo-session';

// No test accounts ship in the bundle. Demo mode (running without Supabase
// keys) still works, but there are no pre-loaded users to sign in as.
export const DEMO_USERS = [];

export const isDemoMode = !isSupabaseConfigured;

function getDemoSession() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

function setDemoSession(user) {
  try {
    if (user) localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    /* storage unavailable */
  }
}

/** Shape demo accounts like Supabase user objects so pages work identically. */
function toUser(demo) {
  return {
    id: `demo-${demo.email}`,
    email: demo.email,
    user_metadata: {
      full_name: demo.full_name,
      sector: demo.sector || null,
      phone: demo.phone || null,
      bio: demo.bio || null,
    },
    role: demo.role,
  };
}

export async function getSession() {
  if (isDemoMode) {
    const demo = getDemoSession();
    return demo ? { user: toUser(demo) } : null;
  }
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Auth state subscribers. In demo mode there are no real auth events, so
 * signIn/signOut notify subscribers directly — this keeps the Navbar and any
 * other listener in sync on every page.
 */
const authListeners = new Set();

export function onAuthChange(callback) {
  if (!isDemoMode) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      callback(session?.user ?? null),
    );
    return () => data.subscription.unsubscribe();
  }
  authListeners.add(callback);
  const demo = getDemoSession();
  callback(demo ? toUser(demo) : null);
  return () => authListeners.delete(callback);
}

/** Notify all listeners of an auth change (used in demo mode). */
function emitAuthChange(user) {
  authListeners.forEach((cb) => cb(user));
}

export async function signIn(email, password) {
  const cleanEmail = String(email || '').trim().toLowerCase();

  if (isDemoMode) {
    const match = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password,
    );
    if (!match) {
      return {
        ok: false,
        error:
          'Demo mode has no test accounts configured. Set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY to sign in for real.',
      };
    }
    const user = toUser(match);
    setDemoSession({ email: match.email, role: match.role, full_name: match.full_name });
    emitAuthChange(user);
    return { ok: true, user };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });
  if (!error) setDemoSession(null); // drop any stale demo session
  return error ? { ok: false, error: error.message } : { ok: true, user: data.user };
}

/**
 * Google OAuth. Requires Supabase configured with the Google provider enabled
 * (Authentication → Providers → Google) — see README for the setup steps.
 */
export async function signInWithGoogle() {
  if (isDemoMode) {
    return {
      ok: false,
      error: 'Google sign-in activates once Supabase is connected (see README setup). For now, use the test accounts below.',
    };
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Update the user's own profile row (full_name, sector, phone, bio...). */
export async function updateProfile(userId, updates) {
  if (isDemoMode) {
    const demo = getDemoSession();
    if (demo && `demo-${demo.email}` === userId) {
      const next = { ...demo, ...updates };
      setDemoSession(next);
      emitAuthChange(toUser(next));
      return { ok: true };
    }
    return { ok: false, error: 'Profile not found in demo mode.' };
  }
  if (!supabase || !userId) return { ok: false, error: 'Not signed in.' };
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function signUp(email, password, fullName) {
  if (isDemoMode) {
    return {
      ok: false,
      error:
        'Demo mode: accounts are fixed for preview. Use the test admin or test member login instead (see hint).',
    };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, user: data.user };
}

export async function signOut() {
  setDemoSession(null); // clear demo session in both modes
  emitAuthChange(null);
  if (isDemoMode) return;
  await supabase.auth.signOut();
}

/** Load the user's profile row (role, full_name, sector, phone, bio). */
export async function getProfile(userId) {
  if (isDemoMode) {
    const demo = getDemoSession();
    if (!demo || `demo-${demo.email}` !== userId) return null;
    return {
      id: userId,
      email: demo.email,
      full_name: demo.full_name,
      role: demo.role,
      sector: demo.sector || null,
      phone: demo.phone || null,
      bio: demo.bio || null,
    };
  }
  if (!supabase || !userId) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) return null;
  return data;
}

/** The user's own member application (membership status). */
export async function getMyApplication(email) {
  if (!isSupabaseConfigured || !email) {
    // Demo seed so the portal previews fully populated (clearly test data).
    if (isDemoMode && email === DEMO_USERS[1]?.email) {
      return {
        id: 'demo-application',
        email,
        full_name: 'Awodeyi Ayoola',
        status: 'received',
        paystack_ref: 'DEMO-TXN-0001',
        created_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
      };
    }
    return null;
  }
  const { data, error } = await supabase
    .from('member_applications')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return data;
}

/** The user's own RSVPs. */
export async function getMyRsvps(email) {
  if (!isSupabaseConfigured || !email) {
    if (isDemoMode && email === DEMO_USERS[1]?.email) {
      return [
        {
          id: 'demo-rsvp-1',
          email,
          event_name: 'Annual Student Finance Summit 2026',
          created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        },
        {
          id: 'demo-rsvp-2',
          email,
          event_name: 'Technical Analysis Masterclass',
          created_at: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
        },
      ];
    }
    return [];
  }
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}
