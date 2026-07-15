import * as React from 'react';

export interface HandwrittenAccentProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Render in the orange accent color. */
  accent?: boolean;
  /** Cream color for dark backgrounds. */
  dark?: boolean;
  children?: React.ReactNode;
}

/**
 * Caveat handwritten-style text for personality accents — scroll hints, "Read ↗"
 * tags, the footer sign-off. Use sparingly; it's the system's one informal
 * voice. Pass `accent` for the orange treatment.
 */
export const HandwrittenAccent = ({
  accent = false,
  dark = false,
  className,
  children,
  ...rest
}: HandwrittenAccentProps) => {
  const cls = [
    'ed-accent',
    accent && 'ed-accent--accent',
    dark && 'ed-accent--dark',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  );
};
HandwrittenAccent.displayName = 'HandwrittenAccent';
