import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Small delay lets the AnimatePresence exit animation finish before
    // snapping to the top of the next page.
    const t = setTimeout(() => window.scrollTo(0, 0), 260);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
