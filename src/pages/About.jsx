import PageHero from '../components/PageHero';
import Seo from '../components/Seo';
import { asset } from '../lib/assets';

const values = [
  {
    title: 'Education',
    text: 'Investing should make sense to every student, whatever they study.',
  },
  {
    title: 'Professionalism',
    text: 'We run the club the way a firm would: prepared, on time and accountable.',
  },
  {
    title: 'Community',
    text: 'Members learn from each other. Seniors mentor juniors and sectors share their research.',
  },
];

// Executive roster sourced from the club's official 'EXECUTIVE POST RESULTS' file
// and the Iperu campus executive update shared by the club president on 15 October 2026.
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
      {
        name: 'Obiajulu Daniela Chidubem',
        role: 'Director of Public Relations',
        linkedin: 'https://www.linkedin.com/in/obiajulu-daniela-39836b353',
        email: 'obiajuluD0850@student.babcock.edu.ng',
      },
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
      {
        name: 'Inofe Peace Otsebholu',
        role: 'Chairperson, Securities',
        linkedin: 'https://www.linkedin.com/in/inofe-peace-6876b8306',
        email: 'inofep5668@student.babcock.edu.ng',
      },
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
  {
    group: 'Iperu Campus Executives',
    members: [
      {
        name: 'Monima Edward Karibi-Whyte',
        role: 'Associate General Secretary',
        linkedin: 'https://www.linkedin.com/in/monima-edward-karibi-whyte-668452317',
        email: 'karibi-whytem6125@student.babcock.edu.ng',
      },
      {
        name: 'Daniella Georgewill Fabia',
        role: 'Associate Director of Public Relations & Acting Associate Director of Welfare',
        linkedin: 'https://www.linkedin.com/in/daniella-fabia-georgewill-9824b7384',
        email: 'georgewilld4473@student.babcock.edu.ng',
      },
      { name: 'Sheyindemi Adetomilola Kehinde', role: 'Vice President, Iperu Campus' },
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
        imagePosition="50% 30%"
      />

      {/* STORY */}
      <section className="section">
        <div className="container ab-story">
          <figure className="ab-photo">
            <img src={asset('/images/bic-2025-6.webp')} alt="A BIC member speaking at a club seminar" width={1063} height={1600} loading="lazy" decoding="async" />
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
              and compete in trading challenges. Seven student committees run the events, the money
              and the media, so leading the club is part of the learning too.
            </p>
          </div>
        </div>
      </section>

      {/* VISION & MISSION: two statements, no boxes */}
      <section className="section bg-off-white">
        <div className="container">
          <div className="ab-vm">
            <div>
              <h2 className="ab-vm-title">Our vision</h2>
              <p className="ab-statement">
                To be Nigeria's premier student-led investment community, producing financially
                intelligent graduates who build wealth, lead markets, and shape the future of the
                economy.
              </p>
            </div>
            <div>
              <h2 className="ab-vm-title">Our mission</h2>
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


      {/* TEAM */}
      <section className="section">
        <div className="container">
          <h2 className="sec-title">The people leading it.</h2>
          <p className="sec-sub" style={{ marginBottom: 12 }}>The students running the club across Babcock campuses in the 2026/2027 session.</p>
          {team.map(({ group, members }) => (
            <div key={group}>
              <h3 className="team-group-title">{group}</h3>
              <ul className="team-list">
                {members.map((m) => (
                  <li key={m.name}>
                    <strong>{m.name}</strong>
                    <span>{m.role}</span>
                    {(m.linkedin || m.email) && (
                      <div className="team-contact-links">
                        {m.linkedin && (
                          <a
                            href={m.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`${m.name} on LinkedIn`}
                          >
                            LinkedIn
                          </a>
                        )}
                        {m.email && (
                          <a href={`mailto:${m.email}`} aria-label={`Email ${m.name}`}>
                            Email
                          </a>
                        )}
                      </div>
                    )}
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
