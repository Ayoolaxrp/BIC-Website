import PageHero from '../components/PageHero';
import Seo from '../components/Seo';
import { asset } from '../lib/assets';

const values = [
  {
    title: 'Education',
    text: 'We believe financial literacy is a fundamental right. We make investing understandable for every student.',
  },
  {
    title: 'Professionalism',
    text: 'We uphold corporate standards in all our activities, preparing members for careers in finance and business.',
  },
  {
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


// Facts the club can stand behind (club-confirmed or on its own posters).
const proof = [
  { value: '150+', label: 'members in the 2025/2026 session' },
  { value: '₦370k', label: 'awarded at Stock Pitch 2.0, 2025/2026' },
  { value: '4', label: 'seminar sponsors in 2025/2026' },
  { value: '7', label: 'student-run committees' },
];

export default function About() {
  return (
    <>
      <Seo
        title="About"
        description="The Babcock Investors Club is the student investment club at Babcock University: its story, vision, values and the students who run it."
      />
      <PageHero
        crumb="About"
        title="Built by students who wanted to understand money."
        description="Who we are, what we believe and the people running the club this session."
        image="/images/bic-exec-group-2026.webp"
        imagePosition="50% 35%"
      />

      {/* STORY */}
      <section className="section">
        <div className="container ab-story">
          <figure className="ab-photo">
            <img src={asset('/images/bic-2025-3.webp')} alt="Two BIC members presenting at a club seminar" width={1600} height={1067} loading="lazy" decoding="async" />
          </figure>
          <div>
            <h2 className="sec-title">A club for students who want to understand money.</h2>
            <p>
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
      </section>

      {/* VISION & MISSION: two statements, no boxes */}
      <section className="section bg-off-white">
        <div className="container">
          <div className="ab-vm">
            <div>
              <p className="ab-kicker">Our vision</p>
              <p className="ab-statement">
                To be Nigeria's premier student-led investment community, producing financially
                intelligent graduates who build wealth, lead markets, and shape the future of the
                economy.
              </p>
            </div>
            <div>
              <p className="ab-kicker">Our mission</p>
              <p className="ab-statement">
                To empower every student with practical financial literacy, real-world investment
                skills, and professional networks through structured learning, mentorship, and
                hands-on experience. No barriers, just growth.
              </p>
            </div>
          </div>
          <h3 className="ab-sub">Our objectives</h3>
          <ul className="ab-objectives">
            {objectives.map((o) => <li key={o}>{o}</li>)}
          </ul>
        </div>
      </section>

      {/* VALUES: three plain columns */}
      <section className="section">
        <div className="container">
          <h2 className="sec-title">What drives us.</h2>
          <ul className="ab-values">
            {values.map((v) => (
              <li key={v.title}>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* IN NUMBERS: same navy strip as the homepage */}
      <section className="hp" aria-label="BIC in numbers">
        <div className="container">
          <h2 className="ab-proof-title">The club so far.</h2>
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

      {/* TEAM */}
      <section className="section">
        <div className="container">
          <h2 className="sec-title">The people leading it.</h2>
          <p className="sec-sub" style={{ marginBottom: 12 }}>The students running the club in the 2026/2027 session.</p>
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
      </section>
    </>
  );
}
