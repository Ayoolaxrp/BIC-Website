import FadeIn from '../components/FadeIn';
import PageHero from '../components/PageHero';
import Seo from '../components/Seo';
import { asset } from '../lib/assets';

const values = [
  {
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
    ),
    title: 'Education',
    text: 'We believe financial literacy is a fundamental right. We provide comprehensive resources to demystify investing.',
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    ),
    title: 'Professionalism',
    text: 'We uphold corporate standards in all our activities, preparing our members for elite roles in the finance industry.',
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    ),
    title: 'Community',
    text: 'Growth happens together. We foster a collaborative environment where networking and peer mentorship thrive.',
  },
];

// Executive roster sourced from the club's official 'EXECUTIVE POST RESULTS' file.
const team = [
  {
    group: 'Executive Board',
    members: [
      { name: 'Okara Nissi Bisindor', role: 'President' },
      { name: 'Raimi Azeezat Pelumi', role: 'Vice President' },
      { name: 'Okorie Justine', role: 'General Secretary' },
      { name: 'Adetunji Rebecca', role: 'Treasurer' },
      { name: 'Adebayo Adetutu Mosadoluwa', role: 'Chaplain' },
      { name: 'Odekale Dorcas', role: 'Associate General Secretary' },
    ],
  },
  {
    group: 'Directors & Operations',
    members: [
      { name: 'Awolaja Ayomide Oreoluwa', role: 'Director of Activities' },
      { name: 'Obiajulu Daniela Chidubem', role: 'Director of Public Relations' },
      { name: 'Akindehinde Favour Eniola', role: 'Director of Welfare' },
      { name: 'Momoh Favour Oloruntobi', role: 'Associate Director of Activities' },
      { name: 'Amorin Samuel', role: 'Associate Public Relations Officer' },
      { name: 'Banwat Bamji', role: 'Associate Director of Welfare' },
    ],
  },
  {
    group: 'Sector Chairpersons',
    members: [
      { name: 'Awodeyi Ayoolamikun', role: 'Chairperson, Crypto & Digital Assets' },
      { name: 'Obiokor Samuel Okeoghene', role: 'Chairperson, Forex' },
      { name: 'Inofe Peace Otsebholu', role: 'Chairperson, Securities' },
      { name: 'Okunubi Kehinde Sabirat', role: 'Chairperson, Real Estate' },
    ],
  },
  {
    group: 'Committee Heads',
    members: [
      { name: 'Okoye Favour Chinemerem', role: 'Head, PR/Media Committee' },
      { name: 'Oladimeji Sharon Oluwanifemi', role: 'Head, Welfare Committee' },
      { name: 'Onaolapo Aanuoluwapo Alleluia', role: 'Head, Finance & Fundraising' },
      { name: 'Atolagbe Precious Olawole', role: 'Head, Events & Logistics' },
      { name: 'Adebayo Kehinde Abraham', role: 'Head, Membership' },
      { name: 'Opara Emmanuel Chinemerem', role: 'Head, Educational Research' },
      { name: 'Okere Nelson Chineze', role: 'Head, Training & Partnership' },
    ],
  },
];

const objectives = [
  'Build financial literacy through structured education and workshops',
  'Equip members with real-world investment and market analysis skills',
  'Develop entrepreneurship, pitching, and business-model capabilities',
  'Create mentorship and networking opportunities with industry professionals',
  'Grow leadership capacity through committees and club operations',
  'Prepare members for careers in finance, consulting, and business',
];

const achievements = [
  {
    title: 'Stock Pitch 2.0',
    text: 'Our student stock pitch competition, with ₦370,000 in prizes at the 2026 Investment Seminar.',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 21h8m-4-4v4m-7-4h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    ),
  },
  {
    title: '150+ Active Members',
    text: 'Students from across departments who attend sessions and run the committees.',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    ),
  },
  {
    title: 'Annual Investment Seminar',
    text: 'Our flagship event, sponsored in 2026 by Fundbox, Leadway Assurance, More Ladda and Chapel Hill Denham.',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
    ),
  },
  {
    title: 'Certificates of Recognition',
    text: 'The club presents certificates to executives and members for their service.',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
    ),
  },
];

export default function About() {
  return (
    <>
      <Seo
        title="About Us"
        description="Discover the roots of the Babcock Investors Club and the principles that guide our community of student investors at Babcock University."
      />
      <PageHero
        crumb="About Us"
        title="Our History & Vision"
        description="Discover the roots of the Babcock Investors Club and the principles that guide our community."
      />

      {/* STORY */}
      <FadeIn className="section container">
        <div className="grid-2 align-center">
          <div className="about-img-wrap">
            <img src={asset('/images/bic-2025-3.webp')} alt="Two BIC members presenting at a club seminar" width={1600} height={1067} style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', width: '100%', display: 'block' }} />
          </div>
          <div>
            <h2 className="sec-title">A club for students who want to understand money.</h2>
            <p style={{ marginBottom: 20 }}>
              Most students graduate knowing how to earn but not how to invest. BIC started at
              Babcock University to close that gap with practical sessions, run by students, on
              how markets actually work.
            </p>
            <p>
              Members join a sector, research real companies and assets, pitch them to each other
              and compete in trading challenges. Committees run the events, the money and the
              media, so leading the club is part of the learning too.
            </p>
          </div>
        </div>
      </FadeIn>

      {/* VISION & MISSION + OBJECTIVES */}
      <FadeIn className="section bg-off-white">
        <div className="container">
          <div className="sec-head">
            <div>
              <h2 className="sec-title">Why we exist.</h2>
            </div>
          </div>
          <div className="vm-grid">
            <div className="vm-card">
              <h3>Our Vision</h3>
              <p>
                To be Nigeria's premier student-led investment community, producing financially
                intelligent graduates who build wealth, lead markets, and shape the future of the
                economy.
              </p>
            </div>
            <div className="vm-card">
              <h3>Our Mission</h3>
              <p>
                To empower every student with practical financial literacy, real-world investment
                skills, and professional networks through structured learning, mentorship, and
                hands-on experience. No barriers, just growth.
              </p>
            </div>
          </div>
          <div className="objectives">
            <h3>Our Objectives</h3>
            <ul>
              {objectives.map((o) => (
                <li key={o}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </FadeIn>

      {/* VALUES */}
      <FadeIn className="section container">
        <div className="sec-head">
          <div>
            <h2 className="sec-title">
              What drives us.
            </h2>
          </div>
        </div>
        <div className="values-grid">
          {values.map((v) => (
            <div className="value-card" key={v.title}>
              <div className="value-icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* ACHIEVEMENTS */}
      <FadeIn className="section container">
        <div className="sec-head">
          <div>
            <h2 className="sec-title">Achievements &amp; recognition.</h2>
            <p className="sec-sub">
              A growing record of competition wins, community impact, and institutional recognition.
            </p>
          </div>
        </div>
        <div className="achievements-grid">
          {achievements.map((a) => (
            <div className="achievement-card" key={a.title}>
              <div className="achievement-icon">{a.icon}</div>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* TEAM */}
      <FadeIn className="team-section">
        <div className="container">
          <div className="sec-head">
            <div>
              <h2 className="sec-title">The people leading it.</h2>
              <p className="sec-sub">
                Meet the dedicated students driving the vision and operations of Babcock Investors Club.
              </p>
            </div>
          </div>

          {team.map(({ group, members }) => (
            <div key={group}>
              <h3 className="team-group-title">{group}</h3>
              <ul className="team-list">
                {members.map((m) => (
                  <li key={m.name}>
                    <strong>{m.name}</strong>
                    <span>{m.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </FadeIn>
    </>
  );
}
