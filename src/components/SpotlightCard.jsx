/**
 * Premium refinement pass: cursor spotlight removed. Transparent wrapper —
 * cards rely on static, restrained elevation.
 */
export default function SpotlightCard({ children, className = '', style, ...rest }) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
