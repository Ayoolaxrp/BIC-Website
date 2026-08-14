import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import FadeIn from '../components/FadeIn';
import PageHero from '../components/PageHero';
import SpotlightCard from '../components/SpotlightCard';
import TiltCard from '../components/TiltCard';
import usePaystack from '../hooks/usePaystack';
import { submitRecord } from '../lib/store';
import { SECTORS } from '../lib/sectors';
import { PAYSTACK_PUBLIC_KEY, paystackConfigured } from '../lib/config';

const MEMBERSHIP_FEE = 5000; // NGN

const benefits = [
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
    ),
    title: 'Educational Resources',
    text: 'Access exclusive market research, trading tutorials, and premium financial literacy content.',
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    ),
    title: 'Elite Networking',
    text: 'Connect with industry professionals, alumni, and top students across multiple disciplines.',
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
    ),
    title: 'Event Discounts & Priority',
    text: 'Get priority seating, RSVP access, and heavy discounts on all our premium summits and workshops.',
  },
];

const interests = [
  'Crypto assets',
  'Stocks & equities',
  'Personal finance',
  'Real estate',
  'Forex',
  'Business & entrepreneurship',
  'I want exposure to all areas',
];

// Committees with named executive heads (matches the About page roster)
const committees = [
  'PR/Media',
  'Welfare',
  'Finance & Fundraising',
  'Events & Logistics',
  'Membership',
  'Educational Research',
  'Training & Partnership',
];

const steps = [
  {
    title: 'Complete the Form',
    text: 'Tell us about yourself — it takes less than two minutes.',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    ),
  },
  {
    title: 'Pay the ₦5,000 Fee',
    text: 'Check out securely via Paystack to activate your membership.',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h2m-5 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2z" /></svg>
    ),
  },
  {
    title: 'Get Onboarded',
    text: 'Join our sessions, pick a committee, and start learning.',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  },
];

const faqs = [
  {
    q: 'Do I need a finance background to join?',
    a: 'Not at all. BIC is open to every student and department. We run beginner-friendly bootcamps and sessions that take you from the very basics of saving and investing to market analysis.',
  },
  {
    q: 'Who can become a member?',
    a: 'Any registered Babcock University student, from 100 to 500 level, in any department. Just use your official @babcock.edu.ng email to register.',
  },
  {
    q: 'What does the ₦5,000 membership fee cover?',
    a: 'The fee funds club sessions, educational resources, event logistics, and prizes. Members get access to all weekly sessions, sector communities, committees, and discounted or free entry to flagship events.',
  },
  {
    q: 'How much of my time does membership require?',
    a: 'As little as 1–2 hours a week. Attend sessions that fit your schedule, and optionally join a committee or sector to go deeper. Commitment scales with how much you want to get out of it.',
  },
  {
    q: 'Is this investment advice?',
    a: 'No. BIC content, workshops, and competitions are strictly educational. We teach you how markets and investing work — we never advise you to buy or sell any specific asset.',
  },
  {
    q: 'What happens after I graduate?',
    a: 'Active members receive certificates of service, and you become part of the BIC alumni network — many of whom now work in banking, audit, asset management, and venture capital.',
  },
];

export default function Membership() {
  const formRef = useRef(null);
  const pendingRef = useRef(null); // payload captured before checkout
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [emailError, setEmailError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState(null); // { type: 'success' | 'error', text }
  const [openFaq, setOpenFaq] = useState(null);
  const { status: paystackStatus, pay } = usePaystack();

  const toggleInterest = (value) => {
    setSelectedInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return; // block double submission
    setFormMsg(null);
    setEmailError('');

    const data = new FormData(formRef.current);
    const email = String(data.get('email') || '').trim();

    // Babcock email validation (runs after the browser's native `required` checks)
    if (!/^[^\s@]+@babcock\.edu\.ng$/i.test(email)) {
      setEmailError('Please enter a valid Babcock email address (name.lastname@babcock.edu.ng).');
      return;
    }

    // Snapshot the application so it can be stored after a successful payment
    pendingRef.current = {
      full_name: data.get('full_name'),
      matric_number: data.get('matric_number'),
      phone_number: data.get('phone_number'),
      department: data.get('department'),
      level: data.get('level'),
      email,
      knowledge_level: data.get('knowledge_level'),
      interests: selectedInterests,
      sector: data.get('sector'),
      committee: data.get('committee'),
    };

    const finish = () => setSubmitting(false);

    const checkout = () => {
      const opened = pay({
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: MEMBERSHIP_FEE,
        // Lets the paystack-webhook verify this is a membership payment server-side
        metadata: {
          payment_type: 'membership',
          full_name: pendingRef.current?.full_name ?? '',
        },
        onSuccess: (response) => {
          finish();
          // Persist the application (Supabase, or local queue as fallback)
          submitRecord('member_applications', {
            ...pendingRef.current,
            paystack_ref: response.reference,
          });
          setFormMsg({
            type: 'success',
            text: `Payment complete! Reference: ${response.reference}. Your registration has been received.`,
          });
          formRef.current.reset();
          setSelectedInterests([]);
          pendingRef.current = null;
        },
        onClose: () => {
          finish();
          setFormMsg({ type: 'error', text: 'Transaction window closed. You can retry whenever you are ready.' });
        },
      });
      if (!opened) {
        finish();
        setFormMsg({ type: 'error', text: 'Payment gateway is still loading. Please wait a moment and try again.' });
      }
    };

    setSubmitting(true);
    if (paystackStatus === 'ready') {
      checkout();
    } else {
      // Wait briefly for the dynamically-loaded Paystack script
      setTimeout(() => {
        if (window.PaystackPop) checkout();
        else {
          finish();
          setFormMsg({ type: 'error', text: 'Payment gateway could not be loaded. Check your connection and try again.' });
        }
      }, 800);
    }
  };

  return (
    <>
      <PageHero
        crumb="Membership"
        title="Join the Club"
        description="Unlock exclusive educational resources, professional networks, and career opportunities by becoming a registered member."
      />

      <FadeIn className="section container">
        {/* HOW IT WORKS */}
        <div className="text-center" style={{ marginBottom: 40 }}>
          <span className="section-label">How It Works</span>
          <h2 className="section-title">Three Steps to <span>Joining</span></h2>
          <div className="gold-line"></div>
        </div>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <TiltCard className="step-card" key={s.title} max={7}>
              <div className="step-num">{i + 1}</div>
              <div className="step-icon">{s.icon}</div>
              <h4>{s.title}</h4>
              <p>{s.text}</p>
            </TiltCard>
          ))}
        </div>

        <div className="membership-grid">
          {/* BENEFITS */}
          <div>
            <span className="section-label">Why Join?</span>
            <h2 className="section-title">
              Invest in your <span>Future.</span>
            </h2>
            <div className="gold-line left"></div>
            <p>
              Membership at the Babcock Investors Club provides you with the ultimate toolkit to
              master financial markets, build a professional network, and accelerate your career in
              finance and business.
            </p>

            <ul className="benefits-list">
              {benefits.map((b) => (
                <li key={b.title}>
                  <div className="benefit-icon">{b.icon}</div>
                  <div className="benefit-text">
                    <h4>{b.title}</h4>
                    <p>{b.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* REGISTRATION FORM */}
          <div>
            <SpotlightCard className="registration-box" radius={360}>
              <h3>Membership Application</h3>
              <form ref={formRef} onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="full_name" required placeholder="John Doe" />
                </div>
                <div className="grid-2" style={{ gap: 16 }}>
                  <div className="form-group">
                    <label>Matric Number</label>
                    <input type="text" name="matric_number" required placeholder="20/0123" />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phone_number" required placeholder="+234 800 000 0000" />
                  </div>
                </div>
                <div className="grid-2" style={{ gap: 16 }}>
                  <div className="form-group">
                    <label>Department</label>
                    <input type="text" name="department" required placeholder="Finance / Economics" />
                  </div>
                  <div className="form-group">
                    <label>Level</label>
                    <select name="level" required defaultValue="">
                      <option value="" disabled>Select Level</option>
                      {['100', '200', '300', '400', '500'].map((l) => (
                        <option key={l} value={l}>{l} Level</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Babcock Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name.lastname@babcock.edu.ng"
                    className={emailError ? 'input-error' : ''}
                  />
                  {emailError && <span className="field-error">{emailError}</span>}
                </div>

                <div className="form-group">
                  <label>Current Knowledge Level in Finance &amp; Investment</label>
                  <select name="knowledge_level" required defaultValue="">
                    <option value="" disabled>Select Knowledge Level</option>
                    {['Beginner', 'Intermediate', 'Expert'].map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ marginBottom: 12, display: 'block' }}>
                    Areas of Interest (Select all that apply)
                  </label>
                  <div className="checkbox-group">
                    {interests.map((i) => (
                      <label key={i}>
                        <input
                          type="checkbox"
                          name="interest"
                          value={i}
                          checked={selectedInterests.includes(i)}
                          onChange={() => toggleInterest(i)}
                        />
                        {i}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 16 }}>
                  <label>Which sector would you like to focus on? (Select one)</label>
                  <select name="sector" required defaultValue="">
                    <option value="" disabled>Select Sector</option>
                    {SECTORS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginTop: 16 }}>
                  <label>Which committee would you like to be part of? (Select one)</label>
                  <select name="committee" required defaultValue="">
                    <option value="" disabled>Select Committee</option>
                    {committees.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop: 32 }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: 16, fontSize: '1.05rem', justifyContent: 'center' }}
                    disabled={submitting || !paystackConfigured}
                    title={!paystackConfigured ? 'Payments are enabled once the Paystack key is configured.' : undefined}
                  >
                    {submitting
                      ? 'Preparing payment...'
                      : paystackConfigured
                        ? 'Proceed to Payment (₦5,000)'
                        : 'Payments enabled after setup'}
                  </button>
                  {!paystackConfigured && (
                    <p className="form-note" style={{ marginTop: 10 }}>
                      The club has not connected Paystack yet — check back soon or contact us via the{' '}
                      <Link to="/contact">contact page</Link>.
                    </p>
                  )}
                </div>

                {formMsg && (
                  <div className={`form-status visible ${formMsg.type}`}>{formMsg.text}</div>
                )}

                <div className="paystack-badge">
                  Secured by <span style={{ color: '#011B33', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.5px' }}>paystack</span>
                </div>
                <p className="form-note">
                  Fees fund club activities and resources. BIC content is educational only and is not financial advice.
                </p>
              </form>
            </SpotlightCard>
          </div>
        </div>

        {/* FAQ */}
        <div className="faq-section">
          <div className="text-center" style={{ marginBottom: 40 }}>
            <span className="section-label">FAQ</span>
            <h2 className="section-title">Frequently Asked <span>Questions</span></h2>
            <div className="gold-line"></div>
          </div>
          <div className="accordion">
            {faqs.map((f, i) => (
              <div className={`accordion-item${openFaq === i ? ' open' : ''}`} key={f.q}>
                <button
                  type="button"
                  className="accordion-header"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-panel-${i}`}
                >
                  {f.q}
                  <span className="accordion-chevron" aria-hidden="true">▾</span>
                </button>
                <div className="accordion-content" id={`faq-panel-${i}`} role="region" aria-label={f.q}>
                  <p>{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </>
  );
}
