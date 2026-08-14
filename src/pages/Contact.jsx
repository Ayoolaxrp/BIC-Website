import FadeIn from '../components/FadeIn';
import PageHero from '../components/PageHero';
import TiltCard from '../components/TiltCard';
import SpotlightCard from '../components/SpotlightCard';
import useSubmission from '../hooks/useSubmission';

const infoItems = [
  {
    label: 'Email Address',
    value: 'info@babcockinvestorsclub.org',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    ),
  },
  {
    label: 'Phone Number',
    value: '+234 (0) 800 BIC INFO',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
    ),
  },
  {
    label: 'Location',
    value: 'Babcock University\nIlishan-Remo, Ogun State',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    ),
  },
  {
    label: 'Office Hours',
    value: 'Mon – Fri: 9:00 AM – 5:00 PM\nWeekends: By appointment',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  },
];

const socials = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/babcock_investors_club/',
    icon: (
      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/babcock-investors-club/',
    icon: (
      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
    ),
  },
];

export default function Contact() {
  const { status, result, submit, reset } = useSubmission('contact_messages');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const ok = await submit({
      first_name: data.get('first_name'),
      last_name: data.get('last_name'),
      email: data.get('email'),
      subject: data.get('subject'),
      message: data.get('message'),
    });
    if (ok) e.target.reset();
    setTimeout(reset, 6000);
  };

  return (
    <>
      <PageHero
        crumb="Contact Us"
        title="Get in Touch"
        description="Have questions about membership, events, or partnerships? Our executive team is here to help."
      />

      <FadeIn className="section container">
        <div className="contact-grid">
          {/* INFO BOX */}
          <div className="contact-info">
            <div className="contact-info-content">
              <h3>Contact Information</h3>
              <p>Reach out to us directly or fill out the form, and we will respond within 24 hours.</p>

              <div className="info-items">
                {infoItems.map((item) => (
                  <TiltCard className="info-item" key={item.label} max={6}>
                    <div className="info-icon">{item.icon}</div>
                    <div className="info-text">
                      <h6>{item.label}</h6>
                      <p style={{ whiteSpace: 'pre-line' }}>{item.value}</p>
                    </div>
                  </TiltCard>
                ))}
              </div>

              <div className="contact-social">
                {socials.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}>
                    {s.icon}
                  </a>
                ))}
              </div>

              <div className="map-frame">
                <iframe
                  title="Babcock University location map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=3.6752%2C6.8712%2C3.7652%2C6.9112&layer=mapnik&marker=6.8914%2C3.7206"
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>

          {/* FORM */}
          <SpotlightCard className="contact-form-box" radius={360}>
            <h3>Send a Message</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid-2" style={{ gap: 16 }}>
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" name="first_name" required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" name="last_name" required />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" required />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select name="subject" required defaultValue="">
                  <option value="" disabled>Select Topic</option>
                  <option value="membership">Membership Inquiry</option>
                  <option value="events">Events & Ticketing</option>
                  <option value="partnership">Partnership / Sponsorship</option>
                  <option value="other">General Inquiry</option>
                </select>
              </div>
              <div className="form-group">
                <label>Your Message</label>
                <textarea name="message" required placeholder="How can we help you?"></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-navy"
                style={{ width: '100%', justifyContent: 'center', padding: 14, marginTop: 8 }}
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>

              {status === 'success' && (
                <div className="form-status visible success">
                  ✓ Message sent! {result?.source === 'local'
                    ? 'Saved on this device — connect Supabase to store it in the cloud.'
                    : "We'll get back to you within 24 hours."}
                </div>
              )}
              {status === 'error' && (
                <div className="form-status visible error">Something went wrong. Please try again.</div>
              )}
            </form>
          </SpotlightCard>
        </div>
      </FadeIn>
    </>
  );
}
