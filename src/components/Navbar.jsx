import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, isDemoMode, onAuthChange, signOut } from '../lib/auth';
import './Navbar.css';
import { asset } from '../lib/assets';
import { supabaseConfigured } from '../lib/config';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/membership', label: 'Membership' },
  { to: '/events', label: 'Events' },
  { to: '/blog', label: 'Blog' },
  { to: '/sponsorship', label: 'Partners' },
];

const signalReticle = (name, data = {}) => {
  if (!import.meta.env.DEV) return;
  import('@reticlehq/react').then(({ reticle }) => reticle.signal(name, data)).catch(() => {});
};

function initials(name, email) {
  const source = (name || email || 'BIC').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  // Email-only display names: use the local-part's leading letters, e.g. aa@… → AA
  const local = source.includes('@') ? source.split('@')[0] : source;
  return (local[0] + (local.split('.')[1]?.[0] || local[1] || '')).toUpperCase();
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const mobileNavRef = useRef(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const updateMaterial = () => setScrolled(window.scrollY > 24);
    updateMaterial();
    window.addEventListener('scroll', updateMaterial, { passive: true });
    return () => window.removeEventListener('scroll', updateMaterial);
  }, []);

  useEffect(() => {
    getCurrentUser().then(setUser);
    const unsub = onAuthChange((u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
    document.body.style.overflow = '';
    signalReticle('navigation:route-ready', { pathname });
  }, [pathname]);

  // Close the user dropdown when clicking anywhere outside it.
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      if (!e.target.closest('.navbar-user')) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  useEffect(() => {
    if (!open) return undefined;
    mobileNavRef.current?.querySelector('a, button')?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        document.body.style.overflow = '';
        menuButtonRef.current?.focus();
      }
      if (event.key !== 'Tab') return;
      const controls = [...mobileNavRef.current.querySelectorAll('a, button:not([disabled])')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const toggleMenu = () => {
    const next = !open;
    setOpen(next);
    document.body.style.overflow = next ? 'hidden' : '';
    signalReticle('navigation:menu-changed', { open: next });
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setMenuOpen(false);
    navigate('/');
  };

  const profileName = user?.user_metadata?.full_name || user?.email;

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`} aria-label="Main">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo">
            <img src={asset('/images/logo.png')} alt="" width={36} height={36} />
            <span className="logo-name">Babcock Investors Club</span>
          </Link>
          <div className="navbar-links">
            {links.map(l => (
              <Link key={l.to} to={l.to} className={pathname === l.to ? 'active' : ''} aria-current={pathname === l.to ? 'page' : undefined}>
                {l.label}
              </Link>
            ))}
          </div>
          <div className="navbar-cta">
            {user ? (
              <>
                <div className="navbar-user">
                  <button
                    type="button"
                    className="navbar-user-btn"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-haspopup="true"
                    aria-expanded={menuOpen}
                  >
                    <span className="navbar-avatar">{initials(profileName, user.email)}</span>
                    <span className="navbar-user-name">{profileName.split(' ')[0]}</span>
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {menuOpen && (
                    <div className="navbar-dropdown">
                      <div className="navbar-dropdown-head">
                        <span className="navbar-avatar">{initials(profileName, user.email)}</span>
                        <div>
                          <strong>{profileName}</strong>
                          <small>{user.email}</small>
                        </div>
                      </div>
                      <Link to="/member" className="navbar-dropdown-link">My Profile</Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="navbar-dropdown-link">Admin Console</Link>
                      )}
                      <button type="button" className="navbar-dropdown-link" onClick={handleSignOut}>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {supabaseConfigured && <Link to="/member" className="navbar-login-link">Log in</Link>}
                <Link to="/membership" className="btn btn-primary">Join BIC</Link>
              </>
            )}
          </div>
          <button ref={menuButtonRef} data-testid="mobile-menu-toggle" className={`hamburger${open ? ' open' : ''}`} onClick={toggleMenu} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-nav">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div ref={mobileNavRef} id="mobile-nav" data-testid="mobile-navigation" className={`mobile-nav${open ? ' open' : ''}`} aria-hidden={!open} inert={!open}>
        <span className="mobile-nav-label">Explore</span>
        <div className="mobile-nav-links">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={pathname === l.to ? 'active' : ''} aria-current={pathname === l.to ? 'page' : undefined}>
              <span>{l.label}</span>
              <span className="mobile-nav-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
        <div className="mobile-nav-actions">
        {user ? (
          <>
            <Link to="/member" className="navbar-login-link" style={{ marginTop: 8, justifyContent: 'center' }}>
              <span>My Profile</span>
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="navbar-login-link" style={{ justifyContent: 'center' }}>
                <span>Admin Console</span>
              </Link>
            )}
            <button
              type="button"
              className="btn btn-outline"
              style={{ marginTop: 20, borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            {supabaseConfigured && <Link to="/member" className="navbar-login-link">Log in</Link>}
            <Link to="/membership" className="btn btn-primary">Join BIC</Link>
          </>
        )}
        </div>
        {isDemoMode && user && (
          <span className="demo-badge" style={{ position: 'static' }}>Demo session</span>
        )}
      </div>
    </>
  );
}
