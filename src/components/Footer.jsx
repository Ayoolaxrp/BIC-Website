import { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitRecord } from '../lib/store';

export const BIC_LINKEDIN = 'https://www.linkedin.com/company/babcock-investors-club/';

export const BIC_INSTAGRAM = 'https://www.instagram.com/babcock_investors_club/';

const IG = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const LI = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
export default function Footer() {
  const [newsStatus, setNewsStatus] = useState(null); // null | 'sending' | 'success' | 'error'

  const handleNewsletter = async (e) => {
    e.preventDefault();
    setNewsStatus('sending');
    const data = new FormData(e.target);
    const res = await submitRecord('subscribers', { email: data.get('email') });
    if (res.ok) {
      e.target.reset();
      setNewsStatus('success');
      setTimeout(() => setNewsStatus(null), 5000);
    } else {
      setNewsStatus('error');
      setTimeout(() => setNewsStatus(null), 5000);
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/images/logo.jpg" alt="BIC" style={{ height: 40 }} />
              <div className="logo-text">
                <span className="logo-name">BIC</span>
                <span className="logo-tagline">Babcock Investors Club</span>
              </div>
            </div>
            <p>Empowering students through financial education, investment awareness, and professional networking.</p>
            <div className="footer-social">
              {[
                [BIC_INSTAGRAM, <IG />, 'Instagram'],
                [BIC_LINKEDIN, <LI />, 'LinkedIn'],
              ].map(([href, icon, label], i) => (
                <a key={i} href={href} target="_blank" rel="noreferrer" className="social-icon" aria-label={label}>{icon}</a>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <h5>Quick Links</h5>
            <ul>
              {[['/', 'Home'], ['/about', 'About BIC'], ['/membership', 'Membership'], ['/events', 'Events'], ['/blog', 'Blog'], ['/member', 'Member Portal'], ['/contact', 'Contact']].map(([to, label]) => (
                <li key={to}><Link to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h5>Partnerships</h5>
            <ul>
              <li><Link to="/sponsorship">Become a Sponsor</Link></li>
              <li><Link to="/sponsorship">Sponsorship Tiers</Link></li>
              <li><Link to="/sponsorship">Brand Collaboration</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Newsletter</h5>
            <p style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.5)', marginBottom: 16 }}>Get market updates and event news.</p>
            <form className="footer-newsletter" onSubmit={handleNewsletter}>
              <input type="email" name="email" placeholder="Email address" required />
              <button type="submit" className="btn btn-primary btn-full" style={{ padding: '10px' }} disabled={newsStatus === 'sending'}>
                {newsStatus === 'sending' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            {newsStatus === 'success' && (
              <p className="news-status ok">✓ Subscribed! Watch your inbox for market updates.</p>
            )}
            {newsStatus === 'error' && (
              <p className="news-status err">Couldn't subscribe right now — please try again.</p>
            )}
          </div>
        </div>
        <p className="footer-disclaimer">
          Babcock Investors Club content is for educational purposes only and does not constitute
          financial, investment, or legal advice. The club is a student-led organization at Babcock University.
        </p>
        <div className="footer-bottom">
          <p>© 2026 Babcock Investors Club. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link to="/legal#privacy">Privacy Policy</Link>
            <Link to="/legal#terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
