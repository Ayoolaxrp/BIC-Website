import FadeIn from '../components/FadeIn';
import PageHero from '../components/PageHero';
import Seo from '../components/Seo';
import useSubmission from '../hooks/useSubmission';
import OfflineNotice from '../components/OfflineNotice';
import { supabaseConfigured } from '../lib/config';
import { RESPONSE_TIME, mailto } from '../lib/contact';

const Check = ({ size = 18 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
);

// Verified partners from the club's official "Meet Our Sponsors" poster (2026 seminar & Stock Pitch 2.0).
const partners = [
  { name: 'Fundbox Financial Services', note: 'Annual Investment Seminar 2026' },
  { name: 'Leadway Assurance', note: 'Annual Investment Seminar 2026' },
  { name: 'More Ladda (Meristem)', note: 'Annual Investment Seminar 2026' },
  { name: 'Chapel Hill Denham', note: 'Annual Investment Seminar 2026' },
];

const offers = [
  { title: 'Meet students early', text: 'Speak at sessions, judge the stock pitch and mentor members studying finance, business and tech.' },
  { title: 'Be seen on campus', text: 'Your brand on event posters, stage banners, this site and our socials.' },
  { title: 'Recruit interns', text: 'Reach members who already research companies and trade on paper.' },
  { title: 'Fund financial literacy', text: 'Back free sessions that teach students to budget, save and invest.' },
];

const tiers = [
  {
    name: 'Headline Partner',
    desc: 'Our exclusive top tier, with the most visibility, direct student engagement and year-round recognition.',
    features: [
      'Main logo placement across campus events',
      'Speaking slot at the flagship seminar',
      'Recruitment access to members',
      'A co-branded bootcamp or project',
      'Recognition in club media all year',
    ],
  },
  {
    name: 'Gold Partner',
    desc: 'Strong event presence and digital recognition, with direct time with students.',
    features: [
      'Logo on the homepage and event banners',
      'Speaking slot at one major workshop',
      'A dedicated newsletter feature',
      'CV pool of active members',
    ],
  },
  {
    name: 'Silver Partner',
    desc: 'Visibility across selected programmes and club channels.',
    features: [
      'Logo on the partners section of this site',
      'Recognition in post-event emails',
      'One social media feature per term',
      'Passes to flagship club events',
    ],
  },
];

const steps = [
  { title: 'Send an enquiry', text: `Tell us what you want to achieve. We reply ${RESPONSE_TIME}.` },
  { title: 'Agree the plan', text: 'We talk through the options and agree what you get, and when.' },
  { title: 'Run it and report', text: 'We deliver the partnership and report back on attendance and reach.' },
];

const scrollToInquiry = (e) => {
  e.preventDefault();
  document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' });
};

export default function Sponsorship() {
  const { status, submit, reset } = useSubmission('sponsorship_inquiries');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const ok = await submit({
      contact_name: data.get('contact_name'),
      company_name: data.get('company_name'),
      email: data.get('email'),
      phone: data.get('phone'),
      sponsorship_interest: data.get('sponsorship_interest'),
      message: data.get('message'),
    });
    if (ok) e.target.reset();
    setTimeout(reset, 6000);
  };

  return (
    <>
      <Seo
        title="Partner with BIC"
        description="Sponsor a seminar, speak to members or recruit interns at Babcock University's student investment club."
      />
      <PageHero
        crumb="Partners"
        title="Partner with BIC"
        description="Sponsor a seminar, speak to members or recruit interns. We work with organisations that want to reach Babcock students who take money seriously."
      >
        <div className="h-actions" style={{ marginTop: 28 }}>
          <a href="#inquiry-form" className="btn btn-primary" onClick={scrollToInquiry}>Send an enquiry</a>
          <a href={mailto('Partnership with BIC')} className="btn btn-outline">Email the club</a>
        </div>
      </PageHero>

      {/* PAST PARTNERS: names only, no category labels */}
      <section className="section">
        <div className="container">
          <FadeIn className="sec-head">
            <h2 className="sec-title">Organisations that have backed BIC.</h2>
          </FadeIn>
          <ul className="partner-list">
            {partners.map((p) => (
              <li key={p.name}>
                <strong>{p.name}</strong>
                <span>{p.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="section bg-off-white">
        <div className="container">
          <FadeIn className="sec-head">
            <h2 className="sec-title">What a partnership gets you.</h2>
          </FadeIn>
          <ul className="offer-list">
            {offers.map((o) => (
              <li key={o.title}>
                <h3>{o.title}</h3>
                <p>{o.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* TIERS: equal standing, no "most popular" */}
      <section className="section" id="benefits">
        <div className="container">
          <FadeIn className="sec-head">
            <h2 className="sec-title">Three ways to partner.</h2>
            <p className="sec-sub">Send an enquiry for prices and details. If none of these fit, tell us what you have in mind.</p>
          </FadeIn>
          <div className="tier-grid">
            {tiers.map((t) => (
              <div className="tier-card" key={t.name}>
                <h3>{t.name}</h3>
                <p className="tier-desc">{t.desc}</p>
                <ul className="tier-features">
                  {t.features.map((f) => (
                    <li key={f}><Check /> {f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS + FORM */}
      <section className="section bg-off-white" id="inquiry-form">
        <div className="container partner-form-layout">
          <div>
            <h2 className="sec-title">How it works.</h2>
            <ol className="h-steps h-steps-stack">
              {steps.map((s) => (
                <li key={s.title}>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>

          {supabaseConfigured ? (
          <div className="partner-form-box">
            <h3 className="form-title">Partnership enquiry</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid-2" style={{ gap: 16 }}>
                <div className="form-group">
                  <label htmlFor="p-name">Your name</label>
                  <input id="p-name" type="text" name="contact_name" required autoComplete="name" />
                </div>
                <div className="form-group">
                  <label htmlFor="p-company">Organisation</label>
                  <input id="p-company" type="text" name="company_name" required autoComplete="organization" />
                </div>
              </div>
              <div className="grid-2" style={{ gap: 16 }}>
                <div className="form-group">
                  <label htmlFor="p-email">Work email</label>
                  <input id="p-email" type="email" name="email" required autoComplete="email" />
                </div>
                <div className="form-group">
                  <label htmlFor="p-phone">Phone</label>
                  <input id="p-phone" type="tel" name="phone" required autoComplete="tel" placeholder="+234" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="p-interest">Interested in</label>
                <select id="p-interest" name="sponsorship_interest" required defaultValue="">
                  <option value="" disabled>Choose one</option>
                  <option value="headline">Headline Partner</option>
                  <option value="gold">Gold Partner</option>
                  <option value="silver">Silver Partner</option>
                  <option value="custom">Something else</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="p-message">What would you like to do with BIC?</label>
                <textarea id="p-message" name="message" required></textarea>
              </div>

              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8 }} disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send enquiry'}
              </button>

              {status === 'success' && (
                <div className="form-status visible success" role="status">
                  Enquiry sent. We reply {RESPONSE_TIME}.
                </div>
              )}
              {status === 'error' && (
                <div className="form-status visible error" role="alert">That didn't send. Please email us instead.</div>
              )}
            </form>
          </div>
          ) : (
            <OfflineNotice
              title="Partnership enquiry"
              text="The enquiry form is not switched on yet."
              subject="Partnership with BIC"
              message="Hello BIC, we would like to talk about partnering with the club. Organisation: "
            />
          )}
        </div>
      </section>
    </>
  );
}
