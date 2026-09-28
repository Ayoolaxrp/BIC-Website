/**
 * Premium refinement pass: pointer-tilt and glare effects removed.
 * Kept as a transparent wrapper so call sites don't change; cards now
 * rely on CSS-only elevation (border, soft shadow, calm hover) instead
 * of physics-style motion.
 */
export default function TiltCard({ children, className = '', style, ...rest }) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
