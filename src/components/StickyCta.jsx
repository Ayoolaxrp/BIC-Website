import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Mobile-only sticky bottom CTA — keeps the primary conversion action
 * (Join BIC) reachable while scrolling on phones. Hidden on desktop
 * (min-width 641px) so it never eats real estate on large screens.
 * Slides in after the page settles; safe-area aware via CSS.
 */
export default function StickyCta() {
  return (
    <motion.div
      className="sticky-cta"
      initial={{ y: 90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="sticky-cta-info">
        <strong>Join the Club</strong>
        <span>₦5,000 once · 50+ student members</span>
      </div>
      <Link to="/membership" className="btn btn-primary sticky-cta-btn">
        Join Now
      </Link>
    </motion.div>
  );
}
