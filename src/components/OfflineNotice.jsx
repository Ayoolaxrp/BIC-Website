import { mailto, whatsapp, CLUB_EMAIL, RESPONSE_TIME } from '../lib/contact';

/**
 * Shown in place of a form while the database (Supabase) is not connected.
 * Before this existed, forms "succeeded" by saving to the visitor's own
 * browser, so nobody at the club ever received anything. This gives people
 * a path that actually reaches the club today.
 */
export default function OfflineNotice({ title, text, subject, message, dark = false }) {
  return (
    <div className={`offline-notice${dark ? ' surface-dark' : ''}`} role="note">
      <h3>{title}</h3>
      <p>
        {text || 'Online forms are not switched on yet.'} Email or WhatsApp the club and we will
        reply {RESPONSE_TIME}.
      </p>
      <div className="h-actions">
        <a className="btn btn-primary" href={whatsapp(message || subject)} target="_blank" rel="noreferrer">
          Message on WhatsApp
        </a>
        <a className="btn btn-outline" href={mailto(subject, message)}>
          Email {CLUB_EMAIL}
        </a>
      </div>
    </div>
  );
}
