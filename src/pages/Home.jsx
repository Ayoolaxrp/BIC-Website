import { Link } from 'react-router-dom';
import FadeIn from '../components/FadeIn';
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

// Sponsors of the 2026 Investment Seminar, from the club's "Meet our sponsors" poster.
const sponsors = ['Fundbox Financial Services', 'Leadway Assurance', 'More Ladda (Meristem)', 'Chapel Hill Denham'];

const sectors = [
  { name: 'Securities', text: 'Equity research, earnings and portfolio building on the Nigerian Exchange.' },
  { name: 'Forex', text: 'Currency markets, position sizing and practice on simulated accounts.' },
  { name: 'Crypto & digital assets', text: 'How blockchains and digital assets work, and how to manage the risk.' },
  { name: 'Real estate', text: 'Property, REITs and the basics of building wealth through land.' },
];

// Only figures the club has confirmed (150+ members, Oct 2026) or that
// are structural facts of the club itself.
const facts = [
  { value: '150+', label: 'active members' },
  { value: '4', label: 'market sectors' },
  { value: '7', label: 'student committees' },
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

      {/* HERO: one message, one action, one real photograph */}
      <header className="h-hero surface-dark">
        <div className="container h-hero-grid">
          <div className="h-hero-copy">
            <h1>Learn to invest before you graduate.</h1>
            <p className="h-hero-sub">
              The student investment club at Babcock University. Sessions on stocks, forex,
              crypto and real estate, run by students.
            </p>
            <div className="h-actions">
              <Link to="/membership" className="btn btn-primary">Join BIC</Link>
              <Link to="/events" className="btn btn-outline">See events</Link>
            </div>
          </div>
          <figure className="h-hero-media">
            <img
              src={asset('/images/bic-2025-1.webp')}
              alt="A BIC member presenting at the podium beside two fellow members"
              width={1600}
              height={1067}
              fetchPriority="high"
              decoding="async"
            />
          </figure>
        </div>
      </header>

      {/* NEXT EVENT: month and place only, as the club asked */}
      <section className="h-next" aria-label="Next event">
        <div className="container h-next-inner">
          <div>
            <p className="h-next-kicker">Upcoming event</p>
            <p className="h-next-title">{NEXT_EVENT.title}</p>
            <p className="h-next-meta">{NEXT_EVENT.when}, {NEXT_EVENT.where}</p>
          </div>
          <Link to="/events" className="btn btn-outline">Event details</Link>
        </div>
      </section>

      {/* SECTORS: a plain two-column list, no cards */}
      <section className="h-section">
        <div className="container">
          <FadeIn className="h-head">
            <h2>Four markets. Pick one and go deep.</h2>
            <p>
              Every member joins a sector led by a student chairperson. You learn a market by
              researching it, pitching it and trading it on paper.
            </p>
          </FadeIn>
          <ul className="h-sectors">
            {sectors.map((s) => (
              <li key={s.name}>
                <h3>{s.name}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CLUB LIFE: real photography, no overlays */}
      <section className="h-section h-section-flush">
        <div className="container">
          <FadeIn className="h-head">
            <h2>What a BIC session looks like.</h2>
          </FadeIn>
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

      {/* MEMBERSHIP: how joining works, plus the facts we can stand behind */}
      <section className="h-section bg-off-white">
        <div className="container">
          <FadeIn className="h-head">
            <h2>Joining takes a few minutes.</h2>
            <p>Open to every Babcock student, in any department. No finance background needed.</p>
          </FadeIn>
          <ol className="h-steps">
            {steps.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="h-join">
            <dl className="h-facts">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
            <Link to="/membership" className="btn btn-primary">Join BIC</Link>
          </div>
        </div>
      </section>

      {/* PARTNERS: who has backed the club, then one quiet tile */}
      <section className="h-section">
        <div className="container">
          <div className="h-sponsors">
            <p>Our 2026 Investment Seminar was sponsored by</p>
            <ul>
              {sponsors.map((name) => <li key={name}>{name}</li>)}
            </ul>
          </div>
          <FadeIn className="h-partner surface-dark">
            <div>
              <h2>Reach students who care about money.</h2>
              <p>
                Sponsor a seminar, speak at a session or recruit interns. Partners are named on
                this site, on our event posters and across our socials.
              </p>
            </div>
            <div className="h-actions">
              <Link to="/sponsorship" className="btn btn-primary">Partner with BIC</Link>
              <a href={mailto('Partnership with BIC')} className="btn btn-outline">Email the club</a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
