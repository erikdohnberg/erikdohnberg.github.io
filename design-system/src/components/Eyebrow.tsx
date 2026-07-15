import * as React from 'react';

export interface EyebrowProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Use muted cream for dark sections. */
  dark?: boolean;
  children?: React.ReactNode;
}

/**
 * Small uppercase, letter-spaced label used above a heading — the role/kicker
 * line (e.g. "Senior Product Manager · Toronto"). Raleway, muted color.
 */
export const Eyebrow = ({ dark = false, className, children, ...rest }: EyebrowProps) => {
  const cls = ['ed-eyebrow', dark && 'ed-eyebrow--dark', className].filter(Boolean).join(' ');
  return (
    <p className={cls} {...rest}>
      {children}
    </p>
  );
};
Eyebrow.displayName = 'Eyebrow';
