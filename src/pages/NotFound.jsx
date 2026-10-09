import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

const quickLinks = [
  { to: '/', label: 'Home', desc: 'Back to the homepage' },
  { to: '/events', label: 'Events', desc: 'Summits, workshops & competitions' },
  { to: '/membership', label: 'Membership', desc: 'Join 150+ student investors' },
  { to: '/blog', label: 'Blog', desc: 'Curated market insights' },
];

export default function NotFound() {
  return (
    <>
      <Seo title="Page Not Found" description="The page you are looking for does not exist." />
      <section className="notfound-section">
        <div className="container text-center">
          <p className="notfound-code" aria-hidden="true">404</p>
          <h1 className="section-title" style={{ marginBottom: 12 }}>
            This page <span>took a market dip.</span>
          </h1>
          <p className="section-subtitle" style={{ marginBottom: 36 }}>
            The page you're looking for doesn't exist or may have moved. Let's get you back on track.
          </p>
          <div className="notfound-grid">
            {quickLinks.map((l) => (
              <Link to={l.to} className="notfound-card" key={l.to}>
                <strong>{l.label}</strong>
                <span>{l.desc}</span>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
