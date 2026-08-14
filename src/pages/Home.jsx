import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import FadeIn from '../components/FadeIn';
import Counter from '../components/Counter';
import TiltCard from '../components/TiltCard';
import MagneticButton from '../components/MagneticButton';
import StickyCta from '../components/StickyCta';
import useCountdown from '../hooks/useCountdown';
import { asset } from '../lib/assets';

// Next flagship session — mirrors the Events page countdown target.
const NEXT_EVENT_DATE = '2026-10-24T10:00:00';

const whyJoin = [
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
    ),
    title: 'Financial Literacy',
    text: 'Gain a complete, foundational understanding of personal budgeting, investment concepts, capital markets, and wealth creation strategies designed for long-term growth.',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    ),
    title: 'Industry Connections',
    text: 'Meet top executives, industry professionals, and corporate leaders through panel discussions, masterclasses, networking events, and career mentorship.',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
    ),
    title: 'Entrepreneurship Skills',
    text: 'Develop hands-on business modeling, marketing strategies, pitching experience, and startup skills. Turn your ideas into functional ventures with our network.',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
    ),
    title: 'Committee Leadership',
    text: 'Take charge by joining one of our key committees (Welfare, Media, Membership, etc.) and coordinate real club activities to build solid, resume-worthy leadership skills.',
  },
];

const metrics = [
  { target: 50, suffix: '+', label: 'Active Student Members' },
  { target: 13000, suffix: '+', label: 'Student Population Reach' },
  { target: 25, suffix: '+', label: 'Seminars & Workshops' },
  { target: 100, suffix: '%', label: 'Practical & Engaging' },
];

// Real club structure from the official executive results / club documentation.
const sectors = [
  {
    title: 'Crypto & Digital Assets',
    text: 'Understand blockchain, digital assets, and the crypto market — from the fundamentals to risk-aware trading.',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  },
  {
    title: 'Forex',
    text: 'Master currency markets, pips, and position sizing through sector sessions and simulated trading.',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0 0v3m0 0V4" /></svg>
    ),
  },
  {
    title: 'Securities',
    text: 'Follow the Nigerian Exchange: equity research, earnings analysis, and portfolio construction.',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    ),
  },
  {
    title: 'Real Estate',
    text: 'Explore property investment, REITs, and the fundamentals of real-estate wealth building.',
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
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
    alt: 'Annual Student Finance Summit',
    badges: [{ label: 'Flagship Summit', cls: 'badge-gold' }],
    title: 'Annual Student Finance Summit',
    meta: 'Flagship annual event · Panels & masterclasses',
    desc: 'Industry leaders and alumni join students to discuss market trends, investment strategies, and career growth.',
  },
  {
    img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
    alt: 'Technical Analysis Masterclass',
    badges: [{ label: 'Workshop', cls: 'badge-green' }],
    title: 'Technical Analysis Masterclass',
    meta: 'Hands-on workshop · Virtual + on-campus',
    desc: 'Learn how to read charts, identify patterns, and make data-driven trading decisions.',
  },
  {
    img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=800',
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
  'Practical financial education & simulated market trading.',
  'Direct exposure to leading industry experts & corporate partners.',
  'Collaborative committees designed for hands-on leadership development.',
];

export default function Home() {
  const countdown = useCountdown(NEXT_EVENT_DATE);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 700], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 550], [1, 0.35]);
  const badgeScale = useTransform(scrollY, [0, 300], [1, 0.92]);
  const badgeY = useTransform(scrollY, [0, 300], [0, -18]);

  // Layered scroll parallax — each orb moves at a different rate (3D depth)
  const orb1Y = useTransform(scrollY, [0, 700], [0, -70]);
  const orb2Y = useTransform(scrollY, [0, 700], [0, -140]);
  const orb3Y = useTransform(scrollY, [0, 700], [0, -40]);
  const bgY = useTransform(scrollY, [0, 700], [0, 40]); // background drifts slower (see-through depth)

  return (
    <>
      {/* HERO */}
      <header className="hero">
        <motion.div className="hero-bg-img" style={{ y: bgY }} aria-hidden="true" />
        <motion.div className="hero-orbs" aria-hidden="true" style={{ y: orb2Y }}>
          <motion.div className="hero-orb one" style={{ y: orb1Y }}></motion.div>
          <div className="hero-orb two"></div>
          <motion.div className="hero-orb three" style={{ y: orb3Y }}></motion.div>
        </motion.div>
        <div className="hero-overlay"></div>
        <div className="hero-grid"></div>

        <div className="container relative" style={{ zIndex: 2 }}>
          <motion.div className="hero-content fade-in visible" style={{ y: heroY, opacity: heroOpacity }}>
            <motion.div className="hero-badge" style={{ scale: badgeScale, y: badgeY }}>
              <span className="dot"></span> Leading Student Investment Community
            </motion.div>
            <h1>
              Empowering <span className="gold">Students</span> Through Financial Education.
            </h1>
            <p className="hero-desc">
              Babcock Investors Club (BIC) is a premier student-led community focused on investment
              awareness, networking, leadership, and growth opportunities.
            </p>

            {countdown && (
              <Link to="/events" className="hero-next-event" aria-label="Next flagship event countdown — see events">
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

            <div className="hero-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Financial Literacy</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Elite Networking</span>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* ABOUT BIC */}
      <FadeIn className="intro-section container">
        <div className="intro-grid">
          <div>
            <span className="section-label">About BIC</span>
            <h2 className="section-title">
              Building the next generation of <span>financial leaders.</span>
            </h2>
            <div className="gold-line left"></div>
            <p style={{ marginBottom: 24, fontSize: '1.1rem', lineHeight: 1.8 }}>
              The Babcock Investors Club aims to build a platform that equips university students
              with financial literacy, investment knowledge, entrepreneurship skills, and industry
              connections.
            </p>

            <div style={{ marginBottom: 32 }}>
              <h4 style={{ color: 'var(--navy)', marginBottom: 16, fontSize: '1.1rem', fontWeight: 700 }}>
                Why BIC?
              </h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {whyList.map((item) => (
                  <li
                    key={item}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: '0.95rem', color: 'var(--gray-700)' }}
                  >
                    <svg width="18" height="18" fill="none" stroke="var(--green)" viewBox="0 0 24 24" style={{ flexShrink: 0, color: 'var(--green)' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Link to="/about" className="btn btn-navy">Learn Our History</Link>
          </div>
          <div style={{ position: 'relative', paddingRight: 24 }}>
            <TiltCard className="intro-img" max={5}>
              <img src={asset('/images/about.png')} alt="BIC students" />
            </TiltCard>
          </div>
        </div>
      </FadeIn>

      {/* WHY JOIN BIC */}
      <FadeIn className="why-join-section">
        <div className="container">
          <div className="text-center">
            <span className="section-label">Why Join Us</span>
            <h2 className="section-title">
              Unlock Premium <span>Opportunities</span>
            </h2>
            <div className="gold-line"></div>
            <p className="section-subtitle">
              BIC is more than just a club. We are a launchpad for future financial analysts,
              successful entrepreneurs, and strategic business leaders.
            </p>
          </div>
          <div className="why-join-grid">
            {whyJoin.map((card, i) => (
              <TiltCard className="why-join-card" key={card.title}>
                <div className="why-join-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* IMPACT METRICS */}
      <FadeIn className="metrics-section">
        <div className="container">
          <div className="text-center">
            <span className="section-label" style={{ color: 'var(--sky-blue)' }}>Our Achievements</span>
            <h2 className="section-title" style={{ color: 'var(--white)' }}>
              BIC <span>Impact Metrics</span>
            </h2>
            <div className="gold-line"></div>
            <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: 600, margin: '0 auto 48px' }}>
              Through strategic execution and academic collaboration, we have expanded our reach
              and empowered students across the campus.
            </p>
          </div>
          <div className="metrics-grid">
            {metrics.map((m) => (
              <TiltCard key={m.label} max={7}>
                <Counter target={m.target} suffix={m.suffix} label={m.label} />
              </TiltCard>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* SECTORS & COMMITTEES */}
      <FadeIn className="spotlight-section">
        <div className="container">
          <div className="text-center">
            <span className="section-label">Sector Communities</span>
            <h2 className="section-title">
              Learn, Trade &amp; Grow in Your <span>Favourite Market</span>
            </h2>
            <div className="gold-line"></div>
            <p className="section-subtitle">
              Members join sector communities led by dedicated chairpersons — real markets, real
              analysis, guided by experienced student leaders.
            </p>
          </div>
          <div className="why-join-grid">
            {sectors.map((s) => (
              <TiltCard className="why-join-card" key={s.title} max={7}>
                <div className="why-join-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </TiltCard>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: 56 }}>
            <h4 style={{ color: 'var(--navy)', fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>
              Hands-on leadership through our committees
            </h4>
            <div className="committee-grid" style={{ maxWidth: 680, margin: '0 auto' }}>
              {committees.map((c) => (
                <div className="committee-chip" key={c.name}>
                  <strong>{c.name}</strong>
                  <span>{c.head}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* SIGNATURE PROGRAMMES MARQUEE */}
      <FadeIn className="sponsors-section">
        <div className="container text-center">
          <h4 style={{ color: 'var(--gray-500)', marginBottom: 32, fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Programmes &amp; Activities
          </h4>
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
      <FadeIn className="events-preview">
        <div className="container">
          <div className="text-center" style={{ marginBottom: 56 }}>
            <span className="section-label">What We Do</span>
            <h2 className="section-title">
              Flagship <span>Programmes</span>
            </h2>
            <div className="gold-line"></div>
          </div>

          <div className="grid-3">
            {events.map((ev) => (
              <TiltCard className="event-card" key={ev.title} max={6}>
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
              </TiltCard>
            ))}
          </div>

          <div className="text-center" style={{ marginTop: 48 }}>
            <Link to="/events" className="btn btn-navy">View All Events</Link>
          </div>
        </div>
      </FadeIn>

      {/* SPONSORSHIP BRIEF */}
      <FadeIn className="section bg-off-white">
        <div className="container">
          <div className="text-center" style={{ marginBottom: 56 }}>
            <span className="section-label">Partnership Opportunities</span>
            <h2 className="section-title">
              Invest in the <span>next generation.</span>
            </h2>
            <div className="gold-line"></div>
            <p className="section-subtitle">
              BIC offers flexible partnership options designed to align with your organization's
              objectives and desired level of engagement.
            </p>
          </div>
          <div className="grid-3">
            {tiers.map((t) => (
              <TiltCard
                className="card"
                key={t.name}
                style={{
                  padding: 32,
                  textAlign: 'center',
                  ...(t.featured
                    ? { background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)', color: 'var(--white)', border: '1px solid var(--sky-blue)' }
                    : {}),
                }}
              >
                <h3 style={{ color: t.featured ? 'var(--white)' : 'var(--navy)', marginBottom: 12 }}>{t.name}</h3>
                <p style={{ color: 'var(--sky-blue)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: 16 }}>
                  {t.tagline}
                </p>
                <p style={{ color: t.featured ? 'rgba(255,255,255,0.7)' : 'var(--gray-500)', fontSize: '0.95rem', marginBottom: 24 }}>
                  {t.text}
                </p>
                <Link
                  to="/sponsorship"
                  className={t.featured ? 'btn btn-primary' : 'btn btn-outline'}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  View Benefits
                </Link>
              </TiltCard>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: 48 }}>
            <p style={{ color: 'var(--gray-500)', marginBottom: 16 }}>
              Not every organization fits a standard package. We welcome custom discussions.
            </p>
            <Link to="/sponsorship" className="btn btn-navy">Discuss Custom Plans</Link>
          </div>
        </div>
      </FadeIn>

      {/* MOBILE STICKY CTA — keeps Join BIC reachable while scrolling (mobile only) */}
      <StickyCta />

      {/* CTA */}
      <FadeIn className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Your Investment Journey?</h2>
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
