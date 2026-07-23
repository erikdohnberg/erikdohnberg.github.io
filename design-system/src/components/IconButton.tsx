import * as React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label — required, since the button is icon-only. */
  label: string;
  /** Smaller 36px variant (used in the top bar); default is 44px. */
  size?: 'sm' | 'md';
  /** Use cream/light styling on dark backgrounds. */
  dark?: boolean;
  /** The icon element (e.g. an inline SVG). */
  children?: React.ReactNode;
}

/**
 * Circular, hairline-outlined icon button — used for carousel nav, the top-bar
 * social links, and the scroll-to-top control. Border and icon turn orange on
 * hover. `label` becomes the aria-label.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, size = 'md', dark = false, type = 'button', className, children, ...rest }, ref) => {
    const cls = [
      'ed-icon-btn',
      size === 'sm' && 'ed-icon-btn--sm',
      dark && 'ed-icon-btn--dark',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <button ref={ref} type={type} aria-label={label} className={cls} {...rest}>
        {children}
      </button>
    );
  },
);
IconButton.displayName = 'IconButton';
