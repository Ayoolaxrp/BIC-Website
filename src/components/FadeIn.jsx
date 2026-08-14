import { motion } from 'framer-motion';

/**
 * Scroll-reveal wrapper (framer-motion). Fades + slides content in with
 * a subtle 3D perspective pop when it enters the viewport, once.
 * Restrained by design: 3° rotateX, 28px rise — depth without gimmick.
 */
export default function FadeIn({ children, className = '', delay = 0, y = 28, style, ...rest }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, rotateX: 3 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      style={{ ...style, transformPerspective: 1200 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
