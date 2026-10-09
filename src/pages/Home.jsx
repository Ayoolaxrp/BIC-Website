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
// 150+ members (club, Oct 2026); ₦370,000 prizes and the four sponsors
// (Investment Seminar 2026 posters); four sectors (club structure).
const proof = [
  { value: '150+', label: 'active members' },
  { value: '₦370k', label: 'in Stock Pitch 2.0 prizes, 2026' },
  { value: '4', label: 'market sectors' },
  { value: '4', label: 'corporate sponsors in 2026' },
];

const sponsors = ['Fundbox Financial Services', 'Leadway Assurance', 'More Ladda (Meristem)', 'Chapel Hill Denham'];

const sectors = [
  { name: 'Securities', text: 'Equity research, earnings and portfolio building on the Nigerian Exchange.' },
  { name: 'Forex', text: 'Currency markets, position sizing and practice on simulated accounts.' },
  { name: 'Crypto & digital assets', text: 'How blockchains and digital assets work, and how to manage the risk.' },
  { name: 'Real estate', text: 'Property, REITs and the basics of building wealth through land.' },
];

const steps = [
  { title: 'Apply', text: 'Fill in the form with your Babcock email. It takes about two minutes.' },
  { title: 'Pay ₦2,500', text: 'The membership fee. The membership team will tell you how to pay.' },
  { title: 'Pick a sector', text: 'Join a market sector, and a committee if you want to help run the club.' },
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
      <header className="hx surface-dark">
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
        <Link to="/events" className="hx-next">
          <span className="hx-next-kicker">Next</span>
          <span className="hx-next-title">{NEXT_EVENT.title}</span>
          <span className="hx-next-meta">{NEXT_EVENT.when}, {NEXT_EVENT.where}</span>
          <span className="hx-next-arrow" aria-hidden="true">→</span>
        </Link>
      </header>

      {/* PROOF: only numbers the club can stand behind */}
      <section className="hp" aria-label="BIC in numbers">
        <div className="container">
          <dl className="hp-grid">
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
            <h2>Four markets. Pick one and go deep.</h2>
            <p>
              Every member joins a sector led by a student chairperson. You learn a market by
              researching it, pitching it and trading it on paper.
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
            <h2>What a BIC session looks like.</h2>
          </div>
          <div className="h-gallery">
            {gallery.map((g) => (
              <figure key={g.src} className={g.cls || ''}>
                <img src={asset(g.src)} alt={g.alt} width={g.w} height={g.h} loading="lazy" decoding="async" />
              </figure>
            ))}
          </div>
          <p className="h-caption">
            Club seminars, 2025 and 2026. <Link to="/events" className="text-link">See events</Link>
          </p>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="h-section bg-off-white">
        <div className="container hb">
          <div>
            <p className="hb-kicker">Backed by</p>
            <ul className="hb-list">
              {sponsors.map((name) => <li key={name}>{name}</li>)}
            </ul>
            <p className="hb-note">Sponsors of the BIC Annual Investment Seminar 2026.</p>
          </div>
          <div className="hb-cta">
            <h2>Reach students who care about money.</h2>
            <p>
              Sponsor a seminar, speak at a session or recruit interns. Partners are named on this
              site, on our event posters and across our socials.
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
          <h2>Joining takes a few minutes.</h2>
          <p className="hj-sub">Open to every Babcock student, in any department. No finance background needed.</p>
          <ol className="hj-steps">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span className="hj-num">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          <Link to="/membership" className="btn btn-primary btn-lg">Join BIC</Link>
        </div>
      </section>
    </>
  );
}
