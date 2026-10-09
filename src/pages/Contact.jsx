import FadeIn from '../components/FadeIn';
import PageHero from '../components/PageHero';
import Seo from '../components/Seo';
import OfflineNotice from '../components/OfflineNotice';
import useSubmission from '../hooks/useSubmission';
import { supabaseConfigured } from '../lib/config';
import {
  CLUB_EMAIL, CLUB_PHONE, CLUB_PHONE_E164, RESPONSE_TIME,
  BIC_INSTAGRAM, BIC_LINKEDIN, mailto, whatsapp,
} from '../lib/contact';

const channels = [
  { label: 'Email', value: CLUB_EMAIL, href: mailto('Hello BIC') },
  { label: 'Phone', value: CLUB_PHONE, href: `tel:+${CLUB_PHONE_E164}` },
  { label: 'WhatsApp', value: CLUB_PHONE, href: whatsapp('Hello BIC'), external: true },
  { label: 'Instagram', value: '@babcock_investors_club', href: BIC_INSTAGRAM, external: true },
  { label: 'LinkedIn', value: 'Babcock Investors Club', href: BIC_LINKEDIN, external: true },
];

export default function Contact() {
  const { status, submit, reset } = useSubmission('contact_messages');

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
      <Seo
        title="Contact"
        description={`Questions about membership, events or partnerships? Reach the Babcock Investors Club executive team. We reply ${RESPONSE_TIME}.`}
      />
      <PageHero
        crumb="Contact"
        title="Talk to the club."
        description={`Questions about membership, events or partnerships. The executive team replies ${RESPONSE_TIME}.`}
      />

      <section className="section">
        <div className="container contact-layout">
          <FadeIn>
            <h2 className="sec-title">Reach us directly.</h2>
            <ul className="channel-list">
              {channels.map((c) => (
                <li key={c.label}>
                  <span>{c.label}</span>
                  <a href={c.href} {...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})}>{c.value}</a>
                </li>
              ))}
              <li>
                <span>Where</span>
                <p>Babcock University, Ilishan-Remo, Ogun State</p>
              </li>
            </ul>
          </FadeIn>

          {supabaseConfigured ? (
            <div className="contact-form-box">
              <h3 className="form-title">Send a message</h3>
              <form onSubmit={handleSubmit}>
                <div className="grid-2" style={{ gap: 16 }}>
                  <div className="form-group">
                    <label htmlFor="c-first">First name</label>
                    <input id="c-first" type="text" name="first_name" required autoComplete="given-name" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="c-last">Last name</label>
                    <input id="c-last" type="text" name="last_name" required autoComplete="family-name" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="c-email">Email</label>
                  <input id="c-email" type="email" name="email" required autoComplete="email" />
                </div>
                <div className="form-group">
                  <label htmlFor="c-subject">About</label>
                  <select id="c-subject" name="subject" required defaultValue="">
                    <option value="" disabled>Choose one</option>
                    <option value="membership">Membership</option>
                    <option value="events">Events</option>
                    <option value="partnership">Partnership or sponsorship</option>
                    <option value="other">Something else</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="c-message">Message</label>
                  <textarea id="c-message" name="message" required></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8 }} disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send message'}
                </button>
                {status === 'success' && (
                  <div className="form-status visible success" role="status">Message sent. We reply {RESPONSE_TIME}.</div>
                )}
                {status === 'error' && (
                  <div className="form-status visible error" role="alert">That didn't send. Please email us instead.</div>
                )}
              </form>
            </div>
          ) : (
            <OfflineNotice
              title="Send us a message"
              text="The contact form is not switched on yet."
              subject="Question for BIC"
            />
          )}
        </div>
      </section>
    </>
  );
}
