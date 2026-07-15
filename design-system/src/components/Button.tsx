import * as React from 'react';

export type ButtonVariant = 'primary' | 'solid' | 'ghost';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * `primary` = orange outline that fills solid on hover (the default CTA),
   * `solid` = filled orange, `ghost` = neutral hairline outline.
   */
  variant?: ButtonVariant;
  children?: React.ReactNode;
}

/**
 * Text button. The signature `primary` variant is a transparent orange-outlined
 * pill that fills solid orange with white text on hover. Compresses slightly on
 * press. Forwards all native button props (onClick, type, disabled…).
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', type = 'button', className, children, ...rest }, ref) => {
    const cls = ['ed-btn', `ed-btn--${variant}`, className].filter(Boolean).join(' ');
    return (
      <button ref={ref} type={type} className={cls} {...rest}>
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
