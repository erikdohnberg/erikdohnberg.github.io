import * as React from 'react';

export interface FadeSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Element/tag to render as. Defaults to `div`. */
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
}

const canObserve = typeof window !== 'undefined' && typeof IntersectionObserver !== 'undefined';

/**
 * Scroll-reveal wrapper: children start slightly lowered and transparent, then
 * fade and rise into place when the block enters the viewport (easing
 * `cubic-bezier(0.23, 1, 0.32, 1)`). Honors `prefers-reduced-motion`. Content
 * already in view on mount reveals immediately, so it never hides above the fold.
 */
export const FadeSection = ({
  as: Tag = 'div',
  className,
  children,
  ...rest
}: FadeSectionProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(!canObserve);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || !canObserve) {
      setVisible(true);
      return;
    }
    // Already on screen (e.g. above the fold) → reveal now without waiting for scroll.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const cls = ['ed-fade', visible && 'ed-fade--visible', className].filter(Boolean).join(' ');
  return React.createElement(Tag, { ref, className: cls, ...rest }, children);
};
FadeSection.displayName = 'FadeSection';
