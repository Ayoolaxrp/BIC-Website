import { useEffect, useRef, useState, Children, cloneElement, isValidElement } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * One-shot viewport trigger shared by the reveal components.
 * Falls back to "revealed" when IntersectionObserver is missing or
 * when the user prefers reduced motion (content renders static).
 */
function useRevealed() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: '-60px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  return [ref, revealed];
}

/**
 * Scroll-reveal wrapper. Fades + rises content in when it enters the
 * viewport, once. 3° rotateX for depth without gimmick. Driven by CSS
 * (.fade-io in index.css) so the reveal never depends on the animation
 * library's observer behavior. Honors prefers-reduced-motion.
 */
export default function FadeIn({ children, className = '', style, ...rest }) {
  const [ref, revealed] = useRevealed();
  return (
    <div ref={ref} className={`fade-io ${revealed ? 'in' : ''} ${className}`} style={style} {...rest}>
      {children}
    </div>
  );
}

/**
 * Scroll-driven reveal groups (Apple keynote rhythm): a parent group
 * orchestrates its RevealItem children into a short cascade when the
 * group enters the viewport, once. Items settle with a soft ease;
 * hover lifts are spring-eased CSS (see the motion layer in index.css).
 *
 *   <RevealGroup className="grid-3" stagger={0.08}>
 *     <RevealItem className="card" lift={4}>…</RevealItem>
 *   </RevealGroup>
 *
 * Stagger is computed by child index and applied as a keyframe delay,
 * so it can never fight hover transitions. Honors prefers-reduced-motion.
 */
export function RevealGroup({ children, className = '', stagger = 0.07, delay = 0.05, style, ...rest }) {
  const [ref, revealed] = useRevealed();
  const indexed = Children.map(children, (child, i) =>
    isValidElement(child) ? cloneElement(child, { index: i }) : child,
  );
  return (
    <div
      ref={ref}
      className={`rg ${revealed ? 'rg-in' : ''} ${className}`}
      style={{ '--rg-stagger': `${stagger}s`, '--rg-delay': `${delay}s`, ...style }}
      {...rest}
    >
      {indexed}
    </div>
  );
}

export function RevealItem({ children, className = '', as, lift = 0, index = 0, style, ...rest }) {
  const Tag = as || 'div';
  return (
    <Tag
      className={`ri ${lift ? 'ri-lift' : ''} ${className}`}
      style={{ '--ri': index, ...(lift ? { '--ri-lift': `${lift}px` } : {}), ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
