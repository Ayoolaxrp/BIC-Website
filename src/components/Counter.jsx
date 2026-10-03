import { useReducedMotion } from 'framer-motion';
import useInView from '../hooks/useInView';
import useCountUp from '../hooks/useCountUp';

/**
 * Animated impact metric — React port of the static site's
 * `.counter[data-target]` animation, triggered on viewport scroll.
 */
export default function Counter({ target, suffix = '', label }) {
  const [ref, inView] = useInView(0.5);
  const reduce = useReducedMotion();
  // Reduced motion: skip the count-up entirely — land on the target instantly.
  const value = useCountUp(target, inView, { duration: reduce ? 0 : 2000 });

  return (
    <div className="metric-card" ref={ref}>
      <div className="metric-num">
        {value.toLocaleString()}
        {suffix}
      </div>
      <div className="metric-label">{label}</div>
    </div>
  );
}
