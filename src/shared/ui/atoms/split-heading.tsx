import React from 'react';

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'p';

interface SplitHeadingProps {
  children: React.ReactNode;
  as?: HeadingTag;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * RSC — wraps each child in .split-line > span for CSS-driven reveal animations.
 * The RevealObserver client component adds .in class via IntersectionObserver.
 */
export default function SplitHeading({
  children,
  as: As = 'h2',
  className = '',
  style,
}: SplitHeadingProps) {
  const parts = Array.isArray(children) ? children : [children];
  return (
    <As className={className} style={style}>
      {parts.map((part, i) => (
        <span className="split-line" key={i}>
          <span style={{ transitionDelay: `${i * 0.08}s` }}>{part}</span>
        </span>
      ))}
    </As>
  );
}
