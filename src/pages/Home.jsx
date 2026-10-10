import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { asset } from '../lib/assets';
import { mailto } from '../lib/contact';

// Next major event, as the club asked it to be shown: month and place only.
// Matches the first entry on the Events page (club calendar, Oct 2026).
const NEXT_EVENT = {
  title: 'BIC 2026/2027: Welcome to the Next Chapter',
  when: 'November 2026',
  where: 'Babcock University',
};

// Every figure here is club-confirmed or printed on the club's own posters:
// 150+ members (club, Oct 2026); ₦370,000 prizes (Stock Pitch 2.0 poster);
// ₦2,500 membership fee (club). No counts of things listed elsewhere on the page.
const proof = [
  { value: '150+', label: 'members in the 2025/2026 session' },
  { value: '₦370k', label: 'awarded at Stock Pitch 2.0' },
  { value: '₦2,500', label: 'to join, for any Babcock student' },
];

const sponsors = [
  { name: 'Fundbox', detail: 'Financial Services' },
  { name: 'Leadway', detail: 'Assurance' },
  { name: 'More Ladda', detail: 'by Meristem' },
  { name: 'Chapel Hill Denham', detail: 'Investment Management' },
];

const sectors = [
  { name: 'Securities', text: 'Equity research, earnings and portfolio building on the Nigerian Exchange.' },
  { name: 'Forex', text: 'Currency markets, position sizing and practice on simulated accounts.' },
  { name: 'Crypto & digital assets', text: 'How blockchains and digital assets work, and how to manage the risk.' },
  { name: 'Real estate', text: 'Property, REITs and the basics of building wealth through land.' },
];

const gallery = [
  { src: '/images/bic-audience-2026.webp', w: 1080, h: 718, alt: 'Students in the seminar hall waving at the camera', cls: 'g-wide' },
  { src: '/images/bic-seminar-practical.webp', w: 1200, h: 1600, alt: 'A facilitator holding up a dollar note during a forex practical session', cls: 'g-tall' },
  { src: '/images/bic-exec-group-2026.webp', w: 1080, h: 810, alt: 'The BIC executive team in club polos with members' },
  { src: '/images/bic-2025-10.webp', w: 1600, h: 1181, alt: 'A member receiving a certificate of recognition from the club' },
];

export default function Home() {
  return (
    <>
      <Seo />

      {/* HERO: a full-bleed club photograph, one message, one action.
          The next event floats on a translucent material strip. */}
      <header className="hx surface-dark" data-testid="home-hero">
        <img
          className="hx-photo"
          src={asset('/images/bic-2025-1.webp')}
          alt=""
          width={1600}
          height={1067}
          fetchPriority="high"
          decoding="async"
        />
        <div className="hx-scrim" aria-hidden="true" />
        <div className="container hx-inner">
          <h1>Learn to invest before you graduate.</h1>
          <p className="hx-sub">
            The student investment club at Babcock University. Stocks, forex, crypto and real
            estate, taught by students, for students.
          </p>
          <div className="h-actions">
            <Link to="/membership" className="btn btn-primary btn-lg">Join BIC</Link>
            <Link to="/events" className="btn btn-glass btn-lg">See events</Link>
          </div>
        </div>
        <Link to="/events" className="hx-next" data-testid="next-event-link">
          <span className="hx-next-kicker">Next</span>
          <span className="hx-next-title">{NEXT_EVENT.title}</span>
          <span className="hx-next-meta">{NEXT_EVENT.when}, {NEXT_EVENT.where}</span>
          <span className="hx-next-arrow" aria-hidden="true">→</span>
        </Link>
      </header>

      {/* PROOF: only numbers the club can stand behind */}
      <section className="hp" aria-label="BIC in numbers">
        <div className="container">
          <dl className="hp-grid hp-grid-3">
            {proof.map((f) => (
              <div key={f.label}>
                <dd>{f.value}</dd>
                <dt>{f.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* SECTORS */}
      <section className="h-section">
        <div className="container">
          <div className="h-head">
            <h2>Choose a market to study.</h2>
            <p>
              Each member joins a student-led sector and learns through research, discussion,
              pitches and paper trading.
            </p>
          </div>
          <ul className="hs-grid">
            {sectors.map((s) => (
              <li key={s.name}>
                <h3>{s.name}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CLUB LIFE: real photography, nothing laid over it */}
      <section className="h-section h-section-flush">
        <div className="container">
          <div className="h-head">
            <h2>Inside a BIC session.</h2>
          </div>
          <div className="h-gallery">
            {gallery.map((g) => (
              <figure key={g.src} className={g.cls || ''}>
                <img
                  src={asset(g.src)}
                  alt={g.alt}
                  width={g.w}
                  height={g.h}
                  loading={g.cls === 'g-wide' ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </figure>
            ))}
          </div>
          <p className="h-caption">
            Sessions from the 2025/2026 club year. <Link to="/events" className="text-link">See events</Link>
          </p>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="h-section bg-off-white">
        <div className="container hb">
          <div>
            <h2 className="hb-title">Backed by people who work in the markets.</h2>
            <ul className="hb-list" aria-label="2025/2026 seminar sponsors">
              {sponsors.map((sponsor) => (
                <li key={sponsor.name}>
                  <span className="hb-wordmark">
                    <strong>{sponsor.name}</strong>
                    <small>{sponsor.detail}</small>
                  </span>
                </li>
              ))}
            </ul>
            <p className="hb-note">These organisations sponsored the BIC Annual Investment Seminar during the completed 2025/2026 session.</p>
          </div>
          <div className="hb-cta">
            <h3 className="hb-cta-title">Your organisation could be next.</h3>
            <p>
              Sponsor a seminar, speak at a session or meet students who already research
              companies and pitch them.
            </p>
            <div className="h-actions">
              <Link to="/sponsorship" className="btn btn-primary">Partner with BIC</Link>
              <a href={mailto('Partnership with BIC')} className="btn btn-outline">Email the club</a>
            </div>
          </div>
        </div>
      </section>

      {/* JOIN: the closing statement */}
      <section className="hj surface-dark">
        <div className="container">
          <h2>Join for ₦2,500.</h2>
          <p className="hj-sub">
            Open to every Babcock student, in any department. Apply with your Babcock email in
            about two minutes, then pick the market you want to learn.
          </p>
          <div className="h-actions hj-actions">
            <Link to="/membership" className="btn btn-primary btn-lg">Join BIC</Link>
            <Link to="/membership#faq" className="btn btn-glass btn-lg">Read the FAQ</Link>
          </div>
        </div>
      </section>
    </>
  );
}
