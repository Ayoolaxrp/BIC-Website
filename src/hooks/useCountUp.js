import { useEffect, useState } from 'react';

/**
 * Animates from 0 to `target` while `active` is true.
 * Port of the static site's animateCounter() using rAF instead of setInterval.
 */
export default function useCountUp(target, active, { duration = 2000 } = {}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);

  return value;
}
