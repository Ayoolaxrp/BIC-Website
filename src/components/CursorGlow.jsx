import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const IS_COARSE_POINTER =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

/**
 * Global cursor-following glow. A soft radial highlight trails the cursor
 * across the ENTIRE page (not just the hero), giving consistent mouse-tracking
 * depth on every section. Decorative only: pointer-events none, hidden on
 * touch devices, springs keep it smooth without re-renders.
 */
export default function CursorGlow() {
  const x = useMotionValue(-600);
  const y = useMotionValue(-600);
  const sx = useSpring(x, { stiffness: 140, damping: 26, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 140, damping: 26, mass: 0.4 });

  useEffect(() => {
    if (IS_COARSE_POINTER) return; // no hover on touch
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);

  if (IS_COARSE_POINTER) return null;

  return (
    <motion.div
      className="cursor-glow"
      aria-hidden="true"
      style={{
        x: sx,
        y: sy,
        background:
          'radial-gradient(480px circle at 0 0, rgba(14,165,233,0.09), transparent 65%)',
      }}
    />
  );
}
