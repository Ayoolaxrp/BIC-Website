import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import FadeIn, { RevealGroup, RevealItem } from '../components/FadeIn';
import Counter from '../components/Counter';
import TiltCard from '../components/TiltCard';
import MagneticButton from '../components/MagneticButton';
import StickyCta from '../components/StickyCta';
import Seo from '../components/Seo';
import useCountdown from '../hooks/useCountdown';
import { asset } from '../lib/assets';

// Next flagship session — mirrors the Events page countdown target.
const NEXT_EVENT_DATE = '2026-11-01T10:00:00';

const metrics = [
  { target: 150, suffix: '+', label: 'Active Student Members' },
  { target: 13000, suffix: '+', label: 'Student Population Reach' },
  { target: 25, suffix: '+', label: 'Seminars & Workshops' },
  { target: 100, suffix: '%', label: 'Practical & Engaging' },
];

// Real club structure from the official executive results / club documentation.
// BIV-style program cards: description + stat chips (cadence · group size · level)
const sectors = [
  {
    title: 'Crypto & Digital Assets',
    text: 'Understand blockchain, digital assets, and the crypto market — from the fundamentals to risk-aware trading.',
    chips: [
      ['Weekly', 'Sessions'],
      ['30+', 'Members'],
      ['Beginner', 'Friendly'],
    ],
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  },
  {
    title: 'Forex',
    text: 'Master currency markets, pips, and position sizing through sector sessions and simulated trading.',
    chips: [
      ['Weekly', 'Sessions'],
      ['Mock', 'Trading'],
      ['Technical', 'Analysis'],
    ],
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0 0v3m0 0V4" /></svg>
    ),
  },
  {
    title: 'Securities',
    text: 'Follow the Nigerian Exchange: equity research, earnings analysis, and portfolio construction.',
    chips: [
      ['NGX', 'Focused'],
      ['Pitch', 'Nights'],
      ['Research', 'Led'],
    ],
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    ),
  },
  {
    title: 'Real Estate',
    text: 'Explore property investment, REITs, and the fundamentals of real-estate wealth building.',
    chips: [
      ['Bi-weekly', 'Sessions'],
      ['REITs', 'Covered'],
      ['Case', 'Studies'],
    ],
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4m-6-9h.01M15 12h.01" /></svg>
    ),
  },
];

// Committees with named executive heads (matches the About page roster)
const committees = [
  { name: 'PR/Media', head: 'Okoye Favour Chinemerem' },
  { name: 'Welfare', head: 'Oladimeji Sharon Oluwanifemi' },
  { name: 'Finance & Fundraising', head: 'Onaolapo Aanuoluwapo Alleluia' },
  { name: 'Events & Logistics', head: 'Atolagbe Precious Olawole' },
  { name: 'Membership', head: 'Adebayo Kehinde Abraham' },
  { name: 'Educational Research', head: 'Opara Emmanuel Chinemerem' },
  { name: 'Training & Partnership', head: 'Okere Nelson Chineze' },
];

// ---- BIV-style "Three Ways to Engage" — one card per audience/goal ----
const TickIcon = () => (
  <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" /></svg>
);

const engageWays = [
  {
    kind: 'Join the Club',
    kindCls: 'k-blue',
    title: 'Membership',
    audience: 'For every Babcock student',
    steps: [
      'Complete the 2-minute application',
      'Pay the ₦5,000 semester fee',
      'Get onboarded into a sector & committee',
    ],
    cta: { to: '/membership', label: 'Become a Member', cls: 'btn-primary' },
  },
  {
    kind: 'Weekly Sessions',
    kindCls: 'k-green',
    title: 'Sector Communities',
    audience: 'For members deep-diving a market',
    steps: [
      'Pick your track — Crypto, Forex, Securities, Real Estate',
      'Join chairperson-led weekly sessions',
      'Practice with mock trading & pitch nights',
    ],
    cta: { to: '/about', label: 'Explore Sectors', cls: 'btn-outline' },
  },
  {
    kind: 'Brand & Sponsor',
    kindCls: 'k-navy',
    title: 'Partnerships',
    audience: 'For brands & employers',
    steps: [
      'Choose a tier — Headline, Gold, or Silver',
      'Reach 13,000+ students on campus',
      'Speak, exhibit, and recruit at our events',
    ],
    cta: { to: '/sponsorship', label: 'Partner With BIC', cls: 'btn-navy' },
  },
];

// ---- BIV-style numbered pipeline — the member journey, 01–05 ----
const journey = [
  { num: '01', title: 'Apply', text: 'Fill the membership form with your Babcock email — takes less than two minutes.' },
  { num: '02', title: 'Activate', text: 'Pay the ₦5,000 fee to unlock sessions, resources, and the member portal.' },
  { num: '03', title: 'Learn', text: 'Bootcamps and weekly sector sessions take you from basics to real analysis.' },
  { num: '04', title: 'Compete', text: 'Pitch challenges, mock trading tournaments, and inter-university trading leagues.' },
  { num: '05', title: 'Lead', text: 'Join a committee, head a sector, and graduate with a CV-worthy track record.' },
];

// ---- BIV-style photo wall — real club photography, mono-tagged mosaic ----
const photoWall = [
  {
    img: '/images/bic-panel-wide-2026.webp',
    alt: 'Speaker panel on stage at the Annual Investment Seminar 2026',
    tag: 'Annual Seminar · Stage Panel',
    cls: 'pw-feature',
  },
  {
    img: '/images/bic-speaker-stage-wide-2026.webp',
    alt: 'Speaker addressing the hall from the podium',
    tag: 'Opening Address',
  },
  {
    img: '/images/bic-audience-clapping-2026.webp',
    alt: 'Members applauding from the blue seminar seats',
    tag: 'Applause',
  },
  {
    img: '/images/bic-speaker-glasses-2026.webp',
    alt: 'Speaker in black taking questions on stage',
    tag: 'Speaker Session',
  },
  {
    img: '/images/bic-speaker-rollup-2026.webp',
    alt: 'Guest speaker presenting beside the club rollup banner',
    tag: 'Guest Speaker',
  },
  {
    img: '/images/bic-audience-engaged.webp',
    alt: 'BIC members listening in the audience',
    tag: 'The Audience',
  },
  {
    img: '/images/bic-seminar-practical.webp',
    alt: 'Hands-on forex practical session with live charts',
    tag: 'Forex Practical Lab',
  },
  {
    img: '/images/bic-exec-group-2026.webp',
    alt: 'BIC executive team in club polos',
    tag: 'The Executive Team',
  },
  {
    img: '/images/bic-welcome-desk-2026.webp',
    alt: 'Wealth ambassador welcoming guests at the registration desk',
    tag: 'Welcome Desk',
  },
];

const programmes = [
  'Annual Student Finance Summit',
  'Stock Pitch Challenge',
  'Technical Analysis Masterclass',
  'Mock Trading Tournament',
  'Sector Forums',
  'Personal Finance Bootcamps',
  'End of Semester Mixer',
];

const events = [
  {
    img: asset('/images/bic-2025-2.webp'),
    alt: 'Annual Student Finance Summit',
    badges: [{ label: 'Flagship Summit', cls: 'badge-gold' }],
    title: 'Annual Student Finance Summit',
    meta: 'Flagship annual event · Panels & masterclasses',
    desc: 'Industry leaders and alumni join students to discuss market trends, investment strategies, and career growth.',
  },
  {
    img: asset('/images/bic-2025-4.webp'),
    alt: 'Technical Analysis Masterclass',
    badges: [{ label: 'Workshop', cls: 'badge-green' }],
    title: 'Technical Analysis Masterclass',
    meta: 'Hands-on workshop · Virtual + on-campus',
    desc: 'Learn how to read charts, identify patterns, and make data-driven trading decisions.',
  },
  {
    img: asset('/images/bic-2025-8.webp'),
    alt: 'End of Semester Mixer',
    badges: [{ label: 'Networking', cls: 'badge-navy' }],
    title: 'End of Semester Mixer',
    meta: 'Networking · Student Center',
    desc: 'Connect with fellow members, share ideas, and build your professional network.',
  },
];

const tiers = [
  {
    name: 'Headline Partner',
    tagline: 'Exclusive Strategic Partnership',
    text: 'Maximum visibility, direct engagement opportunities, premium event presence, speaking opportunities, and year-round recognition.',
    featured: false,
  },
  {
    name: 'Gold Partner',
    tagline: 'Enhanced Brand Visibility',
    text: 'Strong event presence, digital recognition, student engagement opportunities, and promotional exposure.',
    featured: true,
  },
  {
    name: 'Silver Partner',
    tagline: 'Community Support Partner',
    text: 'Meaningful visibility across selected programs, events, and communication channels.',
    featured: false,
  },
];

const whyList = [
  'Practical financial education, from budgeting to capital markets & simulated trading.',
  'Direct exposure to industry experts through panels, masterclasses & mentorship.',
  'Hands-on entrepreneurship: business modeling, pitching, and venture skills.',
  'Committee leadership that builds solid, resume-worthy experience.',
];

export default function Home() {
  const countdown = useCountdown(NEXT_EVENT_DATE);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  // Scroll parallax — every range collapses to static under prefers-reduced-motion.
  const heroY = useTransform(scrollY, [0, 700], reduceMotion ? [0, 0] : [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 550], reduceMotion ? [1, 1] : [1, 0.35]);
  const badgeScale = useTransform(scrollY, [0, 300], reduceMotion ? [1, 1] : [1, 0.92]);
  const badgeY = useTransform(scrollY, [0, 300], reduceMotion ? [0, 0] : [0, -18]);

  // Layered scroll parallax — each orb moves at a different rate (3D depth)
  const orb1Y = useTransform(scrollY, [0, 700], reduceMotion ? [0, 0] : [0, -70]);
  const orb2Y = useTransform(scrollY, [0, 700], reduceMotion ? [0, 0] : [0, -140]);
  const orb3Y = useTransform(scrollY, [0, 700], reduceMotion ? [0, 0] : [0, -40]);
  const bgY = useTransform(scrollY, [0, 700], reduceMotion ? [0, 0] : [0, 40]); // background drifts slower (see-through depth)

  return (
    <>
      <Seo />
      {/* HERO */}
      <header className="hero">
        <motion.div className="hero-bg-img" style={{ y: bgY }} aria-hidden="true" />
        <motion.div className="hero-orbs" aria-hidden="true" style={{ y: orb2Y }}>
          <motion.div className="hero-orb one" style={{ y: orb1Y }}></motion.div>
          <div className="hero-orb two"></div>
          <motion.div className="hero-orb three" style={{ y: orb3Y }}></motion.div>
        </motion.div>
        <div className="hero-overlay"></div>

        <div className="container relative" style={{ zIndex: 2 }}>
          <motion.div className="hero-content fade-in visible" style={{ y: heroY, opacity: heroOpacity }}>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 110, damping: 20, delay: 0.08 }}
            >
            {/* BIV-style announcement ribbon — live event banner */}
            {countdown && (
              <Link to="/events" className="hero-ribbon">
                <span className="ribbon-tag">Next Up</span>
                <span>
                  <strong>BIC Welcome Seminar: The Next Chapter</strong>
                  <span className="ribbon-sep"> · </span>
                  Nov 1, 2026 · Babcock University
                </span>
                <svg className="ribbon-arrow" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
              </Link>
            )}
            <motion.div className="hero-badge" style={{ scale: badgeScale, y: badgeY }}>
              <span className="dot"></span> Leading Student Investment Community
            </motion.div>
            <h1>
              Empowering <span className="gold">students</span> through financial education.
            </h1>
            <p className="hero-desc">
              Babcock Investors Club (BIC) is a premier student-led community focused on investment
              awareness, networking, leadership, and growth opportunities.
            </p>

            {countdown && (
              <Link to="/events" className="hero-next-event">
                <span className="hero-next-dot" aria-hidden="true"></span>
                Annual Summit in
                <strong>
                  {countdown.days}d · {countdown.hours}h · {countdown.minutes}m
                </strong>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
              </Link>
            )}

            <div className="hero-actions">
              <MagneticButton>
                <Link to="/membership" className="btn btn-primary">Become a Member</Link>
              </MagneticButton>
              <MagneticButton>
                <Link to="/events" className="btn btn-outline">View Upcoming Events</Link>
              </MagneticButton>
            </div>

            {/* BIV-style credibility strip — replaces the old floating feature items */}
            <div className="hero-stat-strip">
              <div className="hstat">
                <span className="hstat-num">150+</span>
                <span className="hstat-label">Active student members</span>
              </div>
              <div className="hstat">
                <span className="hstat-num">13,000+</span>
                <span className="hstat-label">Student population reach</span>
              </div>
              <div className="hstat">
                <span className="hstat-num">25+</span>
                <span className="hstat-label">Seminars &amp; workshops</span>
              </div>
              <div className="hstat-join" aria-hidden="true">
                <div className="hstat-avatars">
                  <span>AO</span>
                  <span>FB</span>
                  <span>+</span>
                </div>
                Join the community
              </div>
            </div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* ABOUT BIC */}
      <FadeIn className="intro-section container">
        <div className="intro-grid">
          <div>
            <span className="section-label">About BIC</span>
            <h2 className="sec-title">
              Building the next generation of <span>financial leaders.</span>
            </h2>
            <p style={{ marginBottom: 24, fontSize: '1.1rem', lineHeight: 1.8 }}>
              The Babcock Investors Club aims to build a platform that equips university students
              with financial literacy, investment knowledge, entrepreneurship skills, and industry
              connections.
            </p>

            <div style={{ marginBottom: 32 }}>
              <h3 style={{ color: 'var(--navy)', marginBottom: 16, fontSize: '1.1rem', fontWeight: 700 }}>
                Why BIC?
              </h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {whyList.map((item) => (
                  <li
                    key={item}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: '0.95rem', color: 'var(--gray-700)' }}
                  >
                    <svg width="18" height="18" fill="none" stroke="#047857" viewBox="0 0 24 24" style={{ flexShrink: 0, color: '#047857' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Link to="/about" className="btn btn-navy">Learn Our History</Link>
          </div>
          <div style={{ position: 'relative', paddingRight: 24 }}>
            <TiltCard className="intro-img" max={5}>
              <img src={asset('/images/bic-group-2026.webp')} alt="BIC members" width={1080} height={1080} />
            </TiltCard>
          </div>
        </div>
      </FadeIn>

      {/* THREE WAYS TO ENGAGE — BIV-style */}
      <section className="engage-section">
        <div className="container">
          <FadeIn>
          <div className="sec-head">
            <div>
              <span className="section-label">How BIC Works</span>
              <h2 className="sec-title">
                Three ways to <span>engage</span> with BIC.
              </h2>
              <p className="sec-sub">
                Not sure where to start? Here's the clear difference between our three core
                offerings — each designed for a different goal and commitment level.
              </p>
            </div>
            <Link to="/membership" className="sec-more">
              Become a member
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          </FadeIn>
          <RevealGroup className="engage-grid" stagger={0.08}>
            {engageWays.map((w) => (
              <RevealItem className="engage-card" key={w.title} lift={4}>
                <span className={`engage-kind ${w.kindCls}`}>{w.kind}</span>
                <h3>{w.title}</h3>
                <p className="engage-audience">{w.audience}</p>
                <ul className="engage-steps">
                  {w.steps.map((s) => (
                    <li key={s}>
                      <span className="step-tick"><TickIcon /></span>
                      {s}
                    </li>
                  ))}
                </ul>
                <Link to={w.cta.to} className={`btn ${w.cta.cls} engage-cta`}>
                  {w.cta.label}
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* IMPACT METRICS */}
      <section className="metrics-section">
        <div className="container">
          <FadeIn>
          <div className="sec-head">
            <div>
              <span className="section-label" style={{ color: "var(--sky-blue-light)", }}>Our Achievements</span>
              <h2 className="sec-title">
                The numbers <span>behind the club.</span>
              </h2>
              <p className="sec-sub">
                Through strategic execution and academic collaboration, we have expanded our reach
                and empowered students across the campus.
              </p>
            </div>
          </div>
          </FadeIn>
          <RevealGroup className="metrics-grid" stagger={0.08}>
            {metrics.map((m) => (
              <RevealItem key={m.label} lift={3}>
                <Counter target={m.target} suffix={m.suffix} label={m.label} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* CLUB LIFE PHOTO WALL — editorial mosaic, real club photography */}
      <section className="photowall-section">
        <div className="container">
          <FadeIn>
          <div className="pw-head">
            <div>
              <span className="section-label">Club Life</span>
              <h2 className="pw-title">Inside BIC sessions.</h2>
              <p className="pw-sub">
                Panels, sector labs, and summit days — the faces behind the numbers,
                photographed by our own media team.
              </p>
            </div>
            <Link to="/events" className="pw-more">
              See the full gallery
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          </FadeIn>
          <RevealGroup className="photowall-grid" stagger={0.05}>
            {photoWall.map((p) => (
              <RevealItem as="figure" className={`pw-tile ${p.cls || ''}`} key={p.alt} lift={4}>
                <img src={asset(p.img)} alt={p.alt} loading="lazy" />
                <figcaption className="pw-tag">{p.tag}</figcaption>
              </RevealItem>
            ))}
          </RevealGroup>
          <FadeIn>
          <p className="pw-caption">
            <span>09</span> photographs · Annual Investment Seminar 2026 · BIC Media Team
          </p>
          </FadeIn>
        </div>
      </section>

      {/* MEMBER JOURNEY — BIV-style numbered pipeline */}
      <section className="pipeline-section">
        <div className="container">
          <FadeIn>
          <div className="sec-head">
            <div>
              <span className="section-label" style={{ color: 'var(--sky-blue-light)' }}>From Application to Alumni</span>
              <h2 className="sec-title">
                Your BIC <span>journey.</span>
              </h2>
              <p className="sec-sub">
                Five stages from first click to a CV-worthy track record — structured, supported,
                and built around real market practice.
              </p>
            </div>
          </div>
          </FadeIn>
          <RevealGroup className="pipeline-track" stagger={0.08}>
            {journey.map((step) => (
              <RevealItem className="pipeline-step" key={step.num} lift={3}>
                <span className="pipe-num">{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </RevealItem>
            ))}
          </RevealGroup>
          <FadeIn>
          <div className="text-center" style={{ marginTop: 44 }}>
            <Link to="/membership" className="btn btn-primary">Start Stage 01 — Apply Now</Link>
          </div>
          </FadeIn>
        </div>
      </section>

      {/* SECTOR COMMUNITIES — BIV-style program cards with stat chips */}
      <section className="spotlight-section">
        <div className="container">
          <FadeIn>
          <div className="sec-head">
            <div>
              <span className="section-label">Sector Communities</span>
              <h2 className="sec-title">
                Pick your market. <span>Learn it for real.</span>
              </h2>
              <p className="sec-sub">
                Members join sector communities led by dedicated chairpersons — real markets, real
                analysis, guided by experienced student leaders.
              </p>
            </div>
          </div>
          </FadeIn>
          <RevealGroup className="programs-grid" stagger={0.08}>
            {sectors.map((s) => (
              <RevealItem className="program-card" key={s.title} lift={4}>
                <div className="program-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <div className="program-chips">
                  {s.chips.map(([num, label]) => (
                    <span className="program-chip" key={label}>
                      <strong>{num}</strong>
                      <span>{label}</span>
                    </span>
                  ))}
                </div>
                <Link to="/membership" className="btn btn-outline program-cta">
                  Join This Sector
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
          <FadeIn>
          <div className="text-center" style={{ marginTop: 56 }}>
            <h3 style={{ color: 'var(--navy)', fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>
              Hands-on leadership through our committees
            </h3>
            <div className="committee-grid" style={{ maxWidth: 680, margin: '0 auto' }}>
              {committees.map((c) => (
                <div className="committee-chip" key={c.name}>
                  <strong>{c.name}</strong>
                  <span>{c.head}</span>
                </div>
              ))}
            </div>
          </div>
          </FadeIn>
        </div>
      </section>

      {/* SIGNATURE PROGRAMMES MARQUEE */}
      <FadeIn className="sponsors-section">
        <div className="container text-center">
          <h3 style={{ color: '#55617e', marginBottom: 32, fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Programmes &amp; Activities
          </h3>
          <div className="marquee">
            <div className="marquee-track">
              {[...programmes, ...programmes].map((p, i) => (
                <span key={`${p}-${i}`} className="programme-chip">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* EVENTS PREVIEW */}
      <section className="events-preview">
        <div className="container">
          <FadeIn>
          <div className="sec-head">
            <div>
              <span className="section-label">What We Do</span>
              <h2 className="sec-title">
                Flagship <span>programmes.</span>
              </h2>
              <p className="sec-sub">
                Three signature programmes anchor the calendar — summits, masterclasses, and
                evenings that turn classmates into contacts.
              </p>
            </div>
            <Link to="/events" className="sec-more">
              See the full calendar
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          </FadeIn>
          <RevealGroup className="grid-3" stagger={0.09}>
            {events.map((ev) => (
              <RevealItem className="event-card" key={ev.title} lift={5}>
                <div className="event-img">
                  <img src={ev.img} alt={ev.alt} loading="lazy" />
                </div>
                <div className="event-content">
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    {ev.badges.map((b) => (
                      <div className={`badge ${b.cls}`} key={b.label} style={{ alignSelf: 'flex-start' }}>
                        {b.label}
                      </div>
                    ))}
                  </div>
                  <h3 className="event-title">{ev.title}</h3>
                  <div className="event-meta">
                    <div>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      {ev.meta}
                    </div>
                  </div>
                  <p className="event-desc">{ev.desc}</p>
                  <Link to="/events" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                    See Upcoming Sessions
                  </Link>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <FadeIn>
          <div className="text-center" style={{ marginTop: 48 }}>
            <Link to="/events" className="btn btn-navy">View All Events</Link>
          </div>
          </FadeIn>
        </div>
      </section>

      {/* SPONSORSHIP BRIEF */}
      <section className="section bg-off-white">
        <div className="container">
          <FadeIn>
          <div className="sec-head">
            <div>
              <span className="section-label">Partnership Opportunities</span>
              <h2 className="sec-title">
                Invest in the <span>next generation.</span>
              </h2>
              <p className="sec-sub">
                BIC offers flexible partnership options designed to align with your organization's
                objectives and desired level of engagement.
              </p>
            </div>
            <Link to="/sponsorship" className="sec-more">
              View tiers
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          </FadeIn>
          <RevealGroup className="grid-3" stagger={0.09}>
            {tiers.map((t) => (
              <RevealItem
                className="card partner-tier-card"
                key={t.name}
                lift={5}
                style={{
                  padding: 32,
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  ...(t.featured
                    ? { background: 'linear-gradient(150deg, var(--navy) 0%, var(--navy-mid) 100%)', color: 'var(--white)', border: '1px solid rgba(14,165,233,0.5)', boxShadow: '0 24px 60px rgba(10,25,49,0.35)' }
                    : {}),
                }}
              >
                {t.featured && (
                  <span className="tier-flag">Most Popular</span>
                )}
                <h3 style={{ color: t.featured ? 'var(--white)' : 'var(--navy)', marginBottom: 6, fontSize: '1.35rem' }}>{t.name}</h3>
                <p style={{ color: 'var(--sky-blue-dark)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
                  {t.tagline}
                </p>
                <p style={{ color: t.featured ? 'rgba(255,255,255,0.75)' : '#55617e', fontSize: '0.95rem', marginBottom: 26, flex: 1 }}>
                  {t.text}
                </p>
                <Link
                  to="/sponsorship"
                  className={t.featured ? 'btn btn-primary' : 'btn btn-outline'}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  View Benefits
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
          <FadeIn>
          <div className="text-center" style={{ marginTop: 48 }}>
            <p style={{ color: '#55617e', marginBottom: 16 }}>
              Not every organization fits a standard package. We welcome custom discussions.
            </p>
            <Link to="/sponsorship" className="btn btn-navy">Discuss Custom Plans</Link>
          </div>
          </FadeIn>
        </div>
      </section>

      {/* MOBILE STICKY CTA — keeps Join BIC reachable while scrolling (mobile only) */}
      <StickyCta />

      {/* CTA */}
      <FadeIn className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to start your investment journey?</h2>
            <p>
              Join a growing community of students learning, growing, and investing together. Access exclusive
              resources, events, and a powerful network.
            </p>
            <MagneticButton>
              <Link to="/membership" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
                Join BIC Today
              </Link>
            </MagneticButton>
          </div>
        </div>
      </FadeIn>
    </>
  );
}
