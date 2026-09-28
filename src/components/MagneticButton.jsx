/**
 * Premium refinement pass: cursor-magnetism removed. Transparent wrapper —
 * children render exactly as authored; hover feedback is CSS-only.
 */
export default function MagneticButton({ children, className = '', style, ...rest }) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
