import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Thin gold scroll-progress bar pinned to the top of the viewport.
 * Gives every page a premium scroll-transition cue. Decorative only
 * (aria-hidden); transform-based so it never triggers layout.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });

  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
