import * as React from 'react';

export interface InlineLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Use cream text on dark backgrounds. */
  dark?: boolean;
  children?: React.ReactNode;
}

/**
 * Inline text link with the brand's orange bottom-border underline; the text
 * itself turns orange on hover. Use inside body copy for outbound and internal
 * links. Forwards all native anchor props (href, target, rel…).
 */
export const InlineLink = React.forwardRef<HTMLAnchorElement, InlineLinkProps>(
  ({ dark = false, className, children, ...rest }, ref) => {
    const cls = ['ed-link', dark && 'ed-link--dark', className].filter(Boolean).join(' ');
    return (
      <a ref={ref} className={cls} {...rest}>
        {children}
      </a>
    );
  },
);
InlineLink.displayName = 'InlineLink';
