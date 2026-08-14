import { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

const IS_COARSE_POINTER =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

/**
 * Spotlight card — a soft radial highlight + faint border glow follows the
 * cursor inside the card. Decorative layer is pointer-events: none; the card
 * itself stays fully interactive. Touch devices simply don't get the effect.
 *
 * Use sparingly: cards that already use TiltCard don't need this too.
 */
export default function SpotlightCard({ children, className = '', radius = 320, ...rest }) {
  const ref = useRef(null);
  const px = useMotionValue(-500);
  const py = useMotionValue(-500);

  const bg = useMotionTemplate`radial-gradient(${radius}px circle at ${px}px ${py}px, rgba(14,165,233,0.12), transparent 65%)`;
  const border = useMotionTemplate`radial-gradient(${radius}px circle at ${px}px ${py}px, rgba(14,165,233,0.35), transparent 70%)`;

  const handleMove = (e) => {
    if (IS_COARSE_POINTER) return;
    const rect = ref.current.getBoundingClientRect();
    px.set(e.clientX - rect.left);
    py.set(e.clientY - rect.top);
  };

  const handleLeave = () => {
    px.set(-500);
    py.set(-500);
  };

  return (
    <div
      ref={ref}
      className={`spotlight-card${className ? ` ${className}` : ''}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...rest}
    >
      <motion.div className="spotlight-overlay" style={{ background: bg }} aria-hidden="true" />
      <motion.div className="spotlight-border" style={{ background: border }} aria-hidden="true" />
      <div className="spotlight-content">{children}</div>
    </div>
  );
}
