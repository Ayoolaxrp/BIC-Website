import { Children, cloneElement, isValidElement } from 'react';

/*
 * Section wrappers. These used to hide content until it scrolled into view,
 * which made pages look empty while loading and pulled in the animation
 * library on every page. Content now renders immediately (Apple design:
 * respond instantly, never make people wait for decoration). The components
 * keep their props so call sites do not change.
 */

export default function FadeIn({ children, className = '', style, ...rest }) {
  return (
    <div className={className} style={style} {...rest}>
      {children}
    </div>
  );
}

export function RevealGroup({ children, className = '', stagger, delay, style, ...rest }) {
  const items = Children.map(children, (child, i) => (isValidElement(child) ? cloneElement(child, { index: i }) : child));
  return (
    <div className={className} style={style} {...rest}>
      {items}
    </div>
  );
}

export function RevealItem({ children, className = '', as, lift, index, style, ...rest }) {
  const Tag = as || 'div';
  return (
    <Tag className={className} style={style} {...rest}>
      {children}
    </Tag>
  );
}
