import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import PageHero from '../components/PageHero';
import FadeIn from '../components/FadeIn';

const sections = [
  {
    id: 'privacy',
    title: 'Privacy Policy',
    body: [
      'Babcock Investors Club ("BIC", "we", "us") operates this website to connect students with financial education, events, and community resources. This policy explains what information we collect and how we use it.',
      'Information we collect: when you submit a membership application, RSVP, contact form, sponsorship inquiry, or newsletter signup, we receive the details you provide (name, email, phone, department, interests, etc.). We use this information solely to process your request, manage membership, and send club communications you have opted into.',
      'Payments: membership fees are processed by Paystack. We do not see or store your card details — Paystack handles all payment data under its own privacy policy.',
      'Storage: form submissions are stored in our Supabase database. Before Supabase is configured, submissions are stored locally in your browser only. We do not sell or share personal data with third parties except the processors needed to operate the site (hosting, payments, email).',
      'Your rights: you may request access to, correction of, or deletion of your personal data at any time by contacting info@babcockinvestorsclub.org.',
      'Cookies: we use local storage for session preferences (e.g. signed-in session). No advertising or cross-site tracking cookies are used.',
    ],
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    body: [
      'By using this website you agree to these terms. BIC is a student-led organization at Babcock University operating for educational purposes.',
      'Educational content: all articles, resources, guides, and workshop content are provided for educational purposes only and do not constitute financial, investment, legal, or tax advice. Nothing on this site should be read as a recommendation to buy or sell any asset. Investing involves risk, including loss of capital.',
      'Membership: membership is open to registered Babcock University students. The membership fee funds club activities and resources. Membership benefits are provided at the club\'s discretion and may change as the club evolves.',
      'Acceptable use: you agree not to misuse the site, attempt to access areas you are not authorized for, or submit false or misleading information in forms.',
      'Content ownership: original BIC content (guides, resources, and articles written by the club) is owned by BIC. Curated articles belong to their original publishers and are linked for educational reference with attribution.',
      'Liability: to the maximum extent permitted by law, BIC is not liable for any loss arising from use of this site or participation in club activities. Third-party links (Paystack, Formspree, external articles, social media) are governed by their own terms.',
      'Changes: we may update these terms or the privacy policy at any time. Continued use of the site after changes constitutes acceptance.',
      'Contact: questions about these terms can be sent to info@babcockinvestorsclub.org.',
    ],
  },
];

export default function Legal() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [hash]);

  return (
    <>
      <PageHero crumb="Legal" title="Privacy Policy & Terms" description="How we handle your data and the terms that govern your use of this website." />
      <FadeIn className="section container">
        <div className="legal-tabs" style={{ display: 'flex', gap: 10, marginBottom: 40 }}>
          {sections.map((s) => (
            <Link
              key={s.id}
              to={`/legal#${s.id}`}
              className={`btn ${hash === `#${s.id}` ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '10px 22px' }}
            >
              {s.title}
            </Link>
          ))}
        </div>

        {sections.map((s) => (
          <div key={s.id} id={s.id} className="legal-section" style={{ marginBottom: 48, scrollMarginTop: 110 }}>
            <h2 className="section-title" style={{ fontSize: '1.7rem', marginBottom: 20 }}>{s.title}</h2>
            {s.body.map((p, i) => (
              <p key={i} style={{ marginBottom: 16, lineHeight: 1.8, color: 'var(--gray-700)' }}>{p}</p>
            ))}
          </div>
        ))}

        <p className="text-center" style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>
          Last updated: August 2026 · <Link to="/contact" className="link-btn">Contact us</Link> with any questions.
        </p>
      </FadeIn>
    </>
  );
}
