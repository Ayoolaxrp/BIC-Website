import useInView from '../hooks/useInView';
import useCountUp from '../hooks/useCountUp';

/**
 * Animated impact metric — React port of the static site's
 * `.counter[data-target]` animation, triggered on viewport scroll.
 */
export default function Counter({ target, suffix = '', label }) {
  const [ref, inView] = useInView(0.5);
  const value = useCountUp(target, inView);

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
