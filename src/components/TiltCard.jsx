import { useRef } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';

/**
 * 3D tilt card — tracks the pointer and rotates the card in 3D space
 * with a soft glare highlight. Falls back gracefully under
 * prefers-reduced-motion (handled in CSS via the media query).
 */
export default function TiltCard({ children, className = '', max = 12, glare = true, style, ...rest }) {
  const ref = useRef(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 260, damping: 20 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 260, damping: 20 });
  const scale = useSpring(useTransform(px, [0, 1], [1, 1.015]), { stiffness: 260, damping: 20 });
  const glareX = useTransform(px, [0, 1], ['15%', '85%']);
  const glareY = useTransform(py, [0, 1], ['15%', '85%']);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.22), transparent 55%)`;

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      className={`tilt-card${className ? ` ${className}` : ''}`}
      style={{
        ...style,
        rotateX,
        rotateY,
        scale,
        transformStyle: 'preserve-3d',
        transformPerspective: 900,
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...rest}
    >
      {children}
      {glare && <motion.div className="tilt-glare" style={{ background: glareBg }} aria-hidden="true" />}
    </motion.div>
  );
}
