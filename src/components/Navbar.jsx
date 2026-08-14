import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, isDemoMode, onAuthChange, signOut } from '../lib/auth';
import './Navbar.css';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/membership', label: 'Membership' },
  { to: '/events', label: 'Events' },
  { to: '/blog', label: 'Blog' },
  { to: '/sponsorship', label: 'Partners' },
  { to: '/contact', label: 'Contact' },
];

function initials(name, email) {
  const source = (name || email || 'BIC').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  // Email-only display names: use the local-part's leading letters, e.g. aa@… → AA
  const local = source.includes('@') ? source.split('@')[0] : source;
  return (local[0] + (local.split('.')[1]?.[0] || local[1] || '')).toUpperCase();
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
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

  const toggleMenu = () => {
    const next = !open;
    setOpen(next);
    document.body.style.overflow = next ? 'hidden' : '';
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
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo">
            <img src="/images/logo.jpg" alt="BIC Logo" />
            <div className="logo-text">
              <span className="logo-name">BIC</span>
              <span className="logo-tagline">Babcock Investors</span>
            </div>
          </Link>
          <div className="navbar-links">
            {links.map(l => (
              <Link key={l.to} to={l.to} className={pathname === l.to ? 'active' : ''}>
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
                <Link to="/member" className="navbar-login-link" aria-label="Member login">
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span>Login</span>
                </Link>
                <Link to="/membership" className="btn btn-primary">Join the Club</Link>
              </>
            )}
          </div>
          <button className={`hamburger${open ? ' open' : ''}`} onClick={toggleMenu} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`mobile-nav${open ? ' open' : ''}`}>
        <button className="mobile-close" onClick={toggleMenu} aria-label="Close menu">✕</button>
        {links.map(l => (
          <Link key={l.to} to={l.to} className={pathname === l.to ? 'active' : ''}>
            {l.label}
          </Link>
        ))}
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
            <Link to="/member" className="navbar-login-link" style={{ marginTop: 8, justifyContent: 'center' }}>
              <span>Member Login</span>
            </Link>
            <Link to="/membership" className="btn btn-primary" style={{ marginTop: 20 }}>
              Join the Club
            </Link>
          </>
        )}
        {isDemoMode && user && (
          <span className="demo-badge" style={{ position: 'static' }}>Demo session</span>
        )}
      </div>
    </>
  );
}
