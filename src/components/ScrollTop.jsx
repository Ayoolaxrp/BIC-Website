import { useEffect, useState } from 'react';

/**
 * Back-to-top control — appears after the reader has scrolled into the
 * page, scrolls smoothly, and respects prefers-reduced-motion.
 */
export default function ScrollTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      className={`scroll-top${visible ? ' visible' : ''}`}
      onClick={toTop}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
    >
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
