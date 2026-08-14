import FadeIn from '../components/FadeIn';
import PageHero from '../components/PageHero';
import TiltCard from '../components/TiltCard';
import { getInitials } from '../utils/initials';

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
    title: 'AVA Trading Competition',
    text: 'Members have placed and won in national trading competitions.',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 21h8m-4-4v4m-7-4h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    ),
  },
  {
    title: '50+ Active Members',
    text: 'A growing community of engaged, active student investors on campus.',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    ),
  },
  {
    title: '25+ Seminars & Workshops',
    text: 'Masterclasses on stocks, forex, crypto, and personal finance.',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
    ),
  },
  {
    title: 'Certificates of Service',
    text: 'Executives and active members are recognized at convocation.',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
    ),
  },
];

const LinkedInIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export default function About() {
  return (
    <>
      <PageHero
        crumb="About Us"
        title="Our History & Vision"
        description="Discover the roots of the Babcock Investors Club and the principles that guide our community."
      />

      {/* STORY */}
      <FadeIn className="section container">
        <div className="grid-2 align-center">
          <TiltCard className="about-img-wrap" max={5}>
            <img src="/images/about.png" alt="About BIC" style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', width: '100%', display: 'block' }} />
          </TiltCard>
          <div style={{ paddingLeft: 24 }}>
            <span className="section-label">Our Story</span>
            <h2 className="section-title">
              Empowering the next generation of <span>investors.</span>
            </h2>
            <div className="gold-line left"></div>
            <p style={{ marginBottom: 20 }}>
              The Babcock Investors Club (BIC) was founded with a clear mission: to bridge the gap
              between academic knowledge and real-world financial acumen for university students.
            </p>
            <p style={{ marginBottom: 20 }}>
              We recognized that many students graduate without the practical skills needed to
              manage wealth, understand markets, and build financial independence. BIC was created
              to be the premier platform for students to learn, network, and grow.
            </p>
            <p>
              Today, we are a thriving community of aspiring analysts, entrepreneurs, and future
              industry leaders, driven by excellence, professionalism, and innovation.
            </p>
          </div>
        </div>
      </FadeIn>

      {/* VISION & MISSION + OBJECTIVES */}
      <FadeIn className="section bg-off-white">
        <div className="container">
          <div className="text-center">
            <span className="section-label">Vision &amp; Mission</span>
            <h2 className="section-title">Why We <span>Exist</span></h2>
            <div className="gold-line"></div>
          </div>
          <div className="vm-grid">
            <TiltCard className="vm-card" max={6}>
              <h3>Our Vision</h3>
              <p>
                To be Nigeria's premier student-led investment community — producing financially
                intelligent graduates who build wealth, lead markets, and shape the future of the
                economy.
              </p>
            </TiltCard>
            <TiltCard className="vm-card" max={6}>
              <h3>Our Mission</h3>
              <p>
                To empower every student with practical financial literacy, real-world investment
                skills, and professional networks through structured learning, mentorship, and
                hands-on experience — no barriers, just growth.
              </p>
            </TiltCard>
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
        <div className="text-center">
          <span className="section-label">Core Values</span>
          <h2 className="section-title">
            What <span>Drives</span> Us
          </h2>
          <div className="gold-line"></div>
        </div>
        <div className="values-grid">
          {values.map((v) => (
            <TiltCard className="value-card" key={v.title} max={8}>
              <div className="value-icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </TiltCard>
          ))}
        </div>
      </FadeIn>

      {/* ACHIEVEMENTS */}
      <FadeIn className="section container">
        <div className="text-center">
          <span className="section-label">Track Record</span>
          <h2 className="section-title">Achievements &amp; <span>Recognition</span></h2>
          <div className="gold-line"></div>
          <p className="section-subtitle">
            A growing record of competition wins, community impact, and institutional recognition.
          </p>
        </div>
        <div className="achievements-grid">
          {achievements.map((a) => (
            <TiltCard className="achievement-card" key={a.title} max={8}>
              <div className="achievement-icon">{a.icon}</div>
              <h4>{a.title}</h4>
              <p>{a.text}</p>
            </TiltCard>
          ))}
        </div>
      </FadeIn>

      {/* TEAM */}
      <FadeIn className="team-section">
        <div className="container">
          <div className="text-center">
            <span className="section-label">Executive Team</span>
            <h2 className="section-title">Leadership</h2>
            <div className="gold-line"></div>
            <p className="section-subtitle">
              Meet the dedicated students driving the vision and operations of Babcock Investors Club.
            </p>
          </div>

          {team.map(({ group, members }) => (
            <div key={group}>
              <h3 className="team-group-title">{group}</h3>
              <div className="team-grid">
                {members.map((m) => (
                  <TiltCard className="team-card" key={m.name} max={7} glare={false}>
                    <div className="team-img placeholder-avatar">
                      <span>{getInitials(m.name)}</span>
                    </div>
                    <div className="team-info">
                      <h4>{m.name}</h4>
                      <p>{m.role}</p>
                      <div className="team-social">
                        <a
                          href="https://www.linkedin.com/company/babcock-investors-club/"
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${m.name} — BIC on LinkedIn`}
                          title="BIC on LinkedIn"
                        >
                          <LinkedInIcon />
                        </a>
                      </div>
                    </div>
                  </TiltCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      </FadeIn>
    </>
  );
}
