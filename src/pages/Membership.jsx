import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import FadeIn from '../components/FadeIn';
import PageHero from '../components/PageHero';
import Seo from '../components/Seo';
import OfflineNotice from '../components/OfflineNotice';
import usePaystack from '../hooks/usePaystack';
import { submitRecord } from '../lib/store';
import { SECTORS } from '../lib/sectors';
import { PAYSTACK_PUBLIC_KEY, paystackConfigured, supabaseConfigured } from '../lib/config';

const MEMBERSHIP_FEE = 2500; // NGN, set by the club Oct 2026

// Only what the club actually runs (calendar, posters, club structure).
const benefits = [
  { title: 'Sector sessions', text: 'Regular sessions in the market you choose, led by a student chairperson.' },
  { title: 'Competitions', text: 'The stock pitch challenge and trading challenges. Stock Pitch 2.0 carried ₦370,000 in prizes.' },
  { title: 'Speakers and sponsors', text: 'Seminars with finance professionals and the club’s corporate sponsors.' },
  { title: 'Leadership', text: 'Join a committee and help run events, finance, media or research.' },
  { title: 'Recognition', text: 'Certificates of recognition for executives and active members.' },
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
    title: 'Complete the form',
    text: 'Tell us about yourself. It takes about two minutes.',
  },
  {
    title: 'Pay the ₦2,500 fee',
    text: 'Pay securely through Paystack, or in person while online payment is being set up.',
  },
  {
    title: 'Get onboarded',
    text: 'Join our sessions, pick a committee, and start learning.',
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
    q: 'What does the ₦2,500 membership fee cover?',
    a: 'The fee funds club sessions, educational resources, event logistics, and prizes. Members get access to all weekly sessions, sector communities, committees, and discounted or free entry to flagship events.',
  },
  {
    q: 'How much of my time does membership require?',
    a: 'As little as one or two hours a week. Attend sessions that fit your schedule, and optionally join a committee or sector to go deeper. Commitment scales with how much you want to get out of it.',
  },
  {
    q: 'Is this investment advice?',
    a: 'No. BIC content, workshops, and competitions are strictly educational. We teach you how markets and investing work. We never advise you to buy or sell any specific asset.',
  },
  {
    q: 'What happens after I graduate?',
    a: 'Active members receive certificates of service, and you stay part of the BIC alumni network after you graduate.',
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

  const handleSubmit = async (e) => {
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

    // When Paystack isn't configured yet, still accept the application so no
    // lead is lost. The club follows up manually to collect the fee.
    if (!paystackConfigured) {
      setSubmitting(true);
      const res = await submitRecord('member_applications', {
        ...pendingRef.current,
        payment_status: 'pending',
      });
      finish();
      if (res.ok) {
        setFormMsg({
          type: 'success',
          text: 'Application received! Online payment is being set up, so the membership team will contact you at your Babcock email to complete your ₦2,500 registration.',
        });
        formRef.current.reset();
        setSelectedInterests([]);
        pendingRef.current = null;
      } else {
        setFormMsg({ type: 'error', text: 'Something went wrong saving your application. Please try again or reach us via the contact page.' });
      }
      return;
    }

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
      <Seo
        title="Membership"
        description="Join the Babcock Investors Club: open to every Babcock student. Apply in two minutes; the membership fee is ₦2,500."
      />
      <PageHero
        crumb="Membership"
        title="Join the club."
        description="Open to every Babcock student, in any department. No finance background needed."
        image="/images/bic-audience-2026.webp"
        imagePosition="50% 40%"
      />

      <FadeIn className="section container">
        {/* HOW IT WORKS */}
        <h2 className="sec-title">Three steps to joining.</h2>
        <ol className="h-steps mb-steps">
          {steps.map((s) => (
            <li key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>

        <div className="membership-grid">
          {/* BENEFITS */}
          <div>
            <h2 className="sec-title">What members get.</h2>
            <ul className="mb-benefits">
              {benefits.map((b) => (
                <li key={b.title}>
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* REGISTRATION FORM */}
          <div>
            {!supabaseConfigured ? (
              <OfflineNotice
                title="Apply to join BIC"
                text="Online applications are not switched on yet. The membership fee is ₦2,500."
                subject="Membership application"
                message={'Hello BIC, I would like to join the club.\nFull name: \nMatric number: \nDepartment: \nLevel: \nSector of interest: '}
              />
            ) : (
            <div className="registration-box">
              <h3>Membership application</h3>
              <form ref={formRef} onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="full_name" required />
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
                    disabled={submitting}
                  >
                    {submitting
                      ? paystackConfigured
                        ? 'Preparing payment...'
                        : 'Submitting application...'
                      : paystackConfigured
                        ? 'Proceed to Payment (₦2,500)'
                        : 'Submit Application'}
                  </button>
                  {!paystackConfigured && (
                    <p className="form-note" style={{ marginTop: 10 }}>
                      Online payment is being set up. Submit your application now and the
                      membership team will contact you to complete your ₦2,500 registration.{' '}
                      <Link to="/contact">Questions? Contact us.</Link>
                    </p>
                  )}
                </div>

                {formMsg && (
                  <div className={`form-status visible ${formMsg.type}`}>{formMsg.text}</div>
                )}

                {paystackConfigured && (
                  <div className="paystack-badge">
                    Secured by <span style={{ color: '#011B33', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.5px' }}>paystack</span>
                  </div>
                )}
                <p className="form-note">
                  Fees fund club activities and resources. BIC content is educational only and is not financial advice.
                </p>
              </form>
            </div>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="faq-section mb-faq">
          <div>
            <h2 className="sec-title">Questions, answered.</h2>
            <p className="sec-sub">Anything else? <Link to="/contact">Ask us directly.</Link></p>
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
