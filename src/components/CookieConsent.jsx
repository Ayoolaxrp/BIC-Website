import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'bic-cookie-consent';

/** Read the stored consent decision, if any. Shape: { choice, at } */
export function getConsent() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveConsent(choice) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, at: new Date().toISOString() }));
  } catch {
    /* private mode — banner will simply reappear next visit */
  }
  window.dispatchEvent(new CustomEvent('bic:consent', { detail: choice }));
}

/**
 * Lightweight cookie-consent banner, inspired by babcockinnovation.com's.
 * A quiet card pinned bottom-left (above the mobile sticky CTA), with
 * Decline / Accept All. The choice persists in localStorage; the footer's
 * "Cookie Preferences" link re-opens the banner via the `bic:open-consent`
 * event so visitors can change their mind at any time.
 *
 * No trackers are loaded based on the choice today — this exists to be
 * transparent and to future-proof analytics adoption.
 */
export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Always listen for the footer's "Cookie Preferences" event
    const reopen = () => setOpen(true);
    window.addEventListener('bic:open-consent', reopen);
    if (!getConsent()) {
      // Small delay so the banner never fights the page's entrance animation
      const t = setTimeout(() => setOpen(true), 1400);
      return () => {
        clearTimeout(t);
        window.removeEventListener('bic:open-consent', reopen);
      };
    }
    return () => window.removeEventListener('bic:open-consent', reopen);
  }, []);

  const decide = (choice) => {
    saveConsent(choice);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          className="cookie-card"
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="cookie-title">We value your privacy</p>
          <p className="cookie-text">
            We use cookies to keep the site working, understand which events and articles
            students find useful, and improve the club experience. Read our{' '}
            <Link to="/legal#privacy">Privacy Policy</Link>.
          </p>
          <div className="cookie-actions">
            <button type="button" className="btn cookie-decline" onClick={() => decide('declined')}>
              Decline
            </button>
            <button type="button" className="btn btn-primary cookie-accept" onClick={() => decide('accepted')}>
              Accept All
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
