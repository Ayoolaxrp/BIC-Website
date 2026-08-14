import { Link } from 'react-router-dom';
import FadeIn from '../components/FadeIn';
import PageHero from '../components/PageHero';
import TiltCard from '../components/TiltCard';
import SpotlightCard from '../components/SpotlightCard';
import useSubmission from '../hooks/useSubmission';
import { SECTORS } from '../lib/sectors';

const Check = ({ size = 24 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
);

const whyPartner = [
  {
    title: 'Access Emerging Talent',
    text: 'Connect with ambitious, career-ready students pursuing professional paths in finance, business management, technology, entrepreneurship, corporate consulting, and asset/investment management.',
  },
  {
    title: 'Strengthen Brand Presence',
    text: 'Increase your corporate visibility among the campus student population through workshops, flagship conferences, panel networking events, customized digital campaigns, and targeted campus initiatives.',
  },
  {
    title: 'Support Financial Literacy',
    text: "Demonstrate your organization's social commitment to corporate responsibility by actively developing financially informed, capable university students and preparing future national business leaders.",
  },
  {
    title: 'Build Strategic Relationships',
    text: 'Engage directly with the student population through mentorship programs, speaking opportunities, pitch competitions, exclusive recruitment initiatives, and collaborative educational partnerships.',
  },
];

const impactList = [
  { title: 'Babcock University', text: "Rooted in one of Nigeria's premier private universities with a reputation for academic excellence." },
  { title: '13,000+ Reach', text: 'Direct exposure and engagement across a diverse, active, and fast-growing campus community.' },
  { title: 'Programs & Literacy', text: 'Continuous investment masterclasses, simulated portfolios, and personal finance bootcamps.' },
  { title: 'Networking Events', text: 'Interactive career meetups linking ambitious students with successful alumni and top corporate managers.' },
  { title: 'Workshops & Seminars', text: 'Year-round professional training programs covering critical market strategies and business analysis tools.' },
  { title: 'Career & Business', text: 'Incubating student entrepreneurship initiatives and prepping members for corporate roles.' },
];

const interestTags = [
  'Finance & Investment',
  'Entrepreneurship',
  'Business Strategy',
  'Technology & Innovation',
  'Wealth Building',
  'Leadership Development',
];

const deckUrl = '/resources/bic-sponsorship-deck.pdf';

const howItWorks = [
  {
    step: '01',
    title: 'Send an Inquiry',
    text: 'Tell us about your goals via the inquiry form below — most partners hear back within 24 hours.',
  },
  {
    step: '02',
    title: 'Review the Deck',
    text: 'We share our sponsorship prospectus with full tier details, reach, and activations. It is also available as a free download.',
  },
  {
    step: '03',
    title: 'Activate & Measure',
    text: 'We agree on deliverables, activate the partnership, and report on engagement and outcomes throughout the term.',
  },
];

const tiers = [
  {
    name: 'Headline Partner',
    tag: 'Strategic Partner',
    featured: true,
    desc: 'Exclusive strategic partnership. Maximum brand visibility, direct student engagement, premium event slots, and year-round corporate recognition.',
    features: [
      'Maximum campus visibility & logo placement',
      'Headline speaking slot at flagship Summit',
      'Direct talent recruitment & pipeline access',
      'Custom-branded educational bootcamp or project',
      'Year-round recognition in all club media',
    ],
    cta: 'Choose Headline',
  },
  {
    name: 'Gold Partner',
    tag: 'Enhanced Visibility',
    featured: false,
    desc: 'Enhanced brand visibility. Strong event presence, digital media recognition, direct student interaction opportunities, and program exposure.',
    features: [
      'Prominent logo placement on homepage & banners',
      'Dedicated speaking slot at 1 major Workshop',
      'Digital promo & dedicated student newsletter blast',
      'CV pool access of top-performing members',
    ],
    cta: 'Choose Gold',
  },
  {
    name: 'Silver Partner',
    tag: 'Community Sponsor',
    featured: false,
    desc: 'Community support partner. Meaningful visibility across selected educational programs, summits, and communication channels.',
    features: [
      'Logo display on website partners section',
      'Group recognition in post-event emails',
      'Social media shoutout (1x per term)',
      'VIP access passes to flagship club events',
    ],
    cta: 'Choose Silver',
  },
];

const partnerBenefits = [
  'Direct access to highly motivated student talent',
  'Premium corporate brand visibility on university campus',
  'High-impact event speaking & presentation opportunities',
  'Fast-track recruitment and student hiring channels',
  'Product awareness campaigns & direct campus demos',
  'Strategic social media exposure to target demographics',
  'Measurable community impact and CSR recognition',
  'Long-term strategic relationships with future leaders',
];

const customPlans = [
  'Educational Collaborations',
  'In-Kind Sponsorships',
  'Career Development Programs',
  'Recruitment Initiatives',
  'Product Demonstrations',
  'Training Partnerships',
  'Strategic Alliances',
];

const scrollToInquiry = (e) => {
  e.preventDefault();
  document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' });
};

export default function Sponsorship() {
  const { status, result, submit, reset } = useSubmission('sponsorship_inquiries');

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
      <PageHero crumb="Partners" title="Partner With BIC">
        <p style={{ fontSize: '1.3rem', color: 'var(--sky-blue-light)', marginBottom: 24, fontWeight: 500 }}>
          Invest in the next generation of investors, entrepreneurs, and business leaders.
        </p>
        <p style={{ maxWidth: 800, margin: '0 auto 32px', lineHeight: 1.8, fontSize: '1.05rem' }}>
          Babcock Investors Club (BIC) provides organizations with meaningful opportunities to engage
          ambitious university students through financial literacy initiatives, investment education,
          entrepreneurship programs, industry events, and career development experiences. Whether your
          goal is brand visibility, talent acquisition, community impact, or strategic engagement, BIC
          offers a platform to connect with future professionals and decision-makers.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <a href="#inquiry-form" className="btn btn-primary" style={{ padding: '14px 28px' }} onClick={scrollToInquiry}>
            Become a Partner
          </a>
          <Link to="/contact" className="btn btn-outline" style={{ padding: '14px 28px' }}>
            Request Sponsorship Deck
          </Link>
        </div>
      </PageHero>

      <FadeIn className="deck-cta-band">
        <div className="container deck-cta-inner">
          <div>
            <h3>Want the full breakdown?</h3>
            <p>Get the complete prospectus — tiers, reach, activations, and pricing — as a PDF.</p>
          </div>
          <a href={deckUrl} download className="btn btn-primary">
            Download Sponsorship Deck (PDF)
          </a>
        </div>
      </FadeIn>

      {/* WHY PARTNER */}
      <FadeIn className="section container">
        <div className="text-center">
          <span className="section-label">Engagement Value</span>
          <h2 className="section-title">
            Why Leading Organizations <span>Choose BIC</span>
          </h2>
          <div className="gold-line"></div>
        </div>
        <div className="why-partner-grid">
          {whyPartner.map((w) => (
            <TiltCard className="why-partner-card" key={w.title} max={6}>
              <h3>{w.title}</h3>
              <p>{w.text}</p>
            </TiltCard>
          ))}
        </div>
      </FadeIn>

      {/* IMPACT */}
      <FadeIn className="section container" style={{ borderTop: '1px solid var(--gray-100)' }}>
        <div className="text-center">
          <span className="section-label">Club Reach</span>
          <h2 className="section-title">
            Our <span>Impact</span>
          </h2>
          <div className="gold-line"></div>
        </div>
        <div className="impact-list-grid">
          {impactList.map((i) => (
            <TiltCard className="impact-list-item" key={i.title} max={6}>
              <Check size={24} />
              <div>
                <h4>{i.title}</h4>
                <p>{i.text}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </FadeIn>

      {/* COMMUNITY */}
      <FadeIn className="section container" style={{ borderTop: '1px solid var(--gray-100)' }}>
        <div className="community-grid">
          <div>
            <span className="section-label">Our Member Base</span>
            <h2 className="section-title">
              Engage a Diverse Community of <span>Future Leaders</span>
            </h2>
            <div className="gold-line left"></div>
            <p style={{ lineHeight: 1.7, marginBottom: 20, fontSize: '1.05rem', color: 'var(--gray-700)' }}>
              Babcock Investors Club (BIC) attracts a highly motivated, cross-disciplinary community of
              students. Our members represent the next generation of financial analysts, corporate
              founders, strategic consultants, savvy investors, corporate executives, and key
              decision-makers.
            </p>
            <p style={{ fontSize: '0.95rem', color: 'var(--gray-500)' }}>
              Our platform allows partner organizations to strategically interact with student
              demographics matching their recruitment and marketing profiles.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'var(--navy)', marginBottom: 16, fontSize: '1.1rem', fontWeight: 700 }}>
              Our members actively pursue growth in:
            </h4>
            <div className="interest-tag-grid">
              {interestTags.map((t) => (
                <div className="interest-tag-item" key={t}>{t}</div>
              ))}
            </div>
            <div className="sector-preview">
              <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: 10 }}>
                Members also join <strong>sector communities</strong>, each led by an executive:
              </p>
              <div className="sector-chip-row">
                {SECTORS.filter((s) => s.value !== 'General').map((s) => (
                  <Link to="/membership" className="sector-chip" key={s.value} title={`${s.label} — ${s.desc} (join via membership)`}>
                    {s.label.split(' &')[0]} →
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* HOW IT WORKS */}
      <FadeIn className="section container" style={{ borderTop: '1px solid var(--gray-100)' }}>
        <div className="text-center">
          <span className="section-label">Simple Process</span>
          <h2 className="section-title">
            How <span>Partnership Works</span>
          </h2>
          <div className="gold-line"></div>
        </div>
        <div className="steps-grid">
          {howItWorks.map((s) => (
            <TiltCard className="step-card" key={s.step} max={7}>
              <div className="step-num">{s.step}</div>
              <h4>{s.title}</h4>
              <p>{s.text}</p>
            </TiltCard>
          ))}
        </div>
        <div className="text-center" style={{ marginTop: 40 }}>
          <a href={deckUrl} download className="btn btn-navy" style={{ padding: '14px 32px' }}>
            Download Sponsorship Deck (PDF)
          </a>
        </div>
      </FadeIn>

      {/* TIERS */}
      <FadeIn className="tiers-section" id="benefits">
        <div className="container">
          <div className="text-center">
            <span className="section-label">Sponsorship Tiers</span>
            <h2 className="section-title">
              Partnership <span>Opportunities</span>
            </h2>
            <div className="gold-line"></div>
            <p className="section-subtitle">
              Select a sponsorship tier that aligns with your corporate objectives and engagement plans.
            </p>
          </div>

          <div className="tier-grid">
            {tiers.map((t) => (
              <TiltCard className={`tier-card${t.featured ? ' featured' : ''}`} key={t.name} max={6}>
                <div
                  className="tier-tag"
                  style={
                    t.name === 'Gold Partner'
                      ? { background: 'rgba(22,101,52,0.1)', color: 'var(--green)' }
                      : t.name === 'Silver Partner'
                        ? { background: 'rgba(15,23,42,0.05)', color: 'var(--navy)' }
                        : undefined
                  }
                >
                  {t.tag}
                </div>
                <h3>{t.name}</h3>
                <p className="tier-desc">{t.desc}</p>
                <ul className="tier-features">
                  {t.features.map((f) => (
                    <li key={f}><Check size={18} /> {f}</li>
                  ))}
                </ul>
                <a href="#inquiry-form" className={t.featured ? 'btn btn-primary' : 'btn btn-outline'} style={{ width: '100%', justifyContent: 'center' }} onClick={scrollToInquiry}>
                  {t.cta}
                </a>
              </TiltCard>
            ))}
          </div>

          <div className="custom-partner-card">
            <h3>Custom Partnership</h3>
            <p>
              Not every organization fits a standard corporate package. We actively welcome
              discussions regarding unique engagement plans and targeted collaborations that benefit
              both your business and our members.
            </p>
            <ul className="custom-list">
              {customPlans.map((c) => <li key={c}>{c}</li>)}
            </ul>
            <a href="#inquiry-form" className="btn btn-navy" style={{ marginTop: 24, padding: '14px 32px' }} onClick={scrollToInquiry}>
              Discuss Custom Plans
            </a>
          </div>
        </div>
      </FadeIn>

      {/* BENEFITS */}
      <FadeIn className="benefits-section">
        <div className="container">
          <div className="text-center">
            <span className="section-label">Outcome-Focused Results</span>
            <h2 className="section-title">
              What Our <span>Partners Receive</span>
            </h2>
            <div className="gold-line"></div>
            <p style={{ color: 'var(--gray-500)', maxWidth: 600, margin: '0 auto' }}>
              Our corporate packages are structured to yield specific, measurable outcomes that match
              your organization's core business priorities.
            </p>
          </div>
          <div className="benefits-grid">
            {partnerBenefits.map((b) => (
              <TiltCard className="benefit-item" key={b} max={7}>
                <Check size={24} />
                {b}
              </TiltCard>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* COMMITMENT */}
      <FadeIn className="commitment-section">
        <div className="container">
          <div className="commitment-box">
            <h3>Our Commitment</h3>
            <p>
              BIC is committed to delivering measurable value to our partners through professional
              execution, transparent communication, brand visibility, student engagement
              opportunities, and meaningful collaboration. We view every sponsorship as a long-term
              strategic relationship rather than a one-time transaction.
            </p>
          </div>
        </div>
      </FadeIn>

      {/* INQUIRY FORM */}
      <FadeIn className="partner-form-section" id="inquiry-form">
        <div className="container">
          <SpotlightCard className="partner-form-box" radius={380}>
            <div className="text-center" style={{ marginBottom: 32 }}>
              <h3 style={{ color: 'var(--navy)', fontSize: '1.8rem', fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>
                Partnership Inquiry
              </h3>
              <p style={{ color: 'var(--gray-500)' }}>
                Fill out the form below and our partnerships team will get back to you shortly.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid-2" style={{ gap: 16 }}>
                <div className="form-group">
                  <label>Contact Name</label>
                  <input type="text" name="contact_name" required placeholder="Jane Doe" />
                </div>
                <div className="form-group">
                  <label>Company / Organization Name</label>
                  <input type="text" name="company_name" required placeholder="Acme Corporation" />
                </div>
              </div>
              <div className="grid-2" style={{ gap: 16 }}>
                <div className="form-group">
                  <label>Corporate Email</label>
                  <input type="email" name="email" required placeholder="partner@acme.com" />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" required placeholder="+234 800 000 0000" />
                </div>
              </div>
              <div className="form-group">
                <label>Sponsorship Interest</label>
                <select name="sponsorship_interest" required defaultValue="">
                  <option value="" disabled>Select an option</option>
                  <option value="headline">Headline Partner</option>
                  <option value="gold">Gold Partner</option>
                  <option value="silver">Silver Sponsor</option>
                  <option value="custom">Custom Collaboration / Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Message / Details</label>
                <textarea
                  name="message"
                  required
                  placeholder="Tell us about your organization's goals and how you'd like to collaborate..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: 16, fontSize: '1.05rem', justifyContent: 'center', marginTop: 16 }}
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Sending...' : 'Submit Inquiry'}
              </button>

              {status === 'success' && (
                <div className="form-status visible success">
                  ✓ Inquiry sent! {result?.source === 'local'
                    ? 'Saved on this device — connect Supabase to store it in the cloud.'
                    : "We'll respond within 24 hours."}
                </div>
              )}
              {status === 'error' && (
                <div className="form-status visible error">Something went wrong. Please try again.</div>
              )}
            </form>
          </SpotlightCard>
        </div>
      </FadeIn>

      {/* FINAL CTA */}
      <FadeIn className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 style={{ fontSize: '2.2rem', marginBottom: 16 }}>Let's Build the Future Together</h2>
            <p style={{ marginBottom: 32, fontSize: '1.1rem', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
              Partner with BIC to empower financial literacy, support student development, and engage
              the next generation of investors, entrepreneurs, and industry leaders.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              <a href="#inquiry-form" className="btn btn-primary" style={{ padding: '14px 28px' }} onClick={scrollToInquiry}>
                Become a Partner
              </a>
              <Link to="/contact" className="btn btn-outline" style={{ padding: '14px 28px', borderColor: 'var(--white)', color: 'var(--white)' }}>
                Request deck
              </Link>
            </div>
          </div>
        </div>
      </FadeIn>
    </>
  );
}
