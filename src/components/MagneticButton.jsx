import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// Hoisted so it's computed once, not on every mousemove
const IS_COARSE_POINTER =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

const MAX_MOVE = 8; // px — subtle, bounded travel (per design brief)

/**
 * Magnetic button — the element is gently attracted toward the cursor while
 * hovered and springs back on leave. Movement is clamped to ±8px so it stays
 * subtle. Enhancement layer only: without a mouse it renders identically.
 */
export default function MagneticButton({ children, className = '', strength = 0.3, style, ...rest }) {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 20, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 260, damping: 20, mass: 0.5 });

  const handleMove = (e) => {
    if (IS_COARSE_POINTER) return; // no hover on touch
    const rect = ref.current.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
    x.set(Math.max(-MAX_MOVE, Math.min(MAX_MOVE, dx)));
    y.set(Math.max(-MAX_MOVE, Math.min(MAX_MOVE, dy)));
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`magnetic-wrap${className ? ` ${className}` : ''}`}
      style={{ ...style, x: sx, y: sy, display: 'inline-block', willChange: 'transform' }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
