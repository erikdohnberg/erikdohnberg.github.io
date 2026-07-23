import * as React from 'react';

export type CardVariant = 'bordered' | 'elevated';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `bordered` = hairline outline (list cards), `elevated` = padded with soft shadow. */
  variant?: CardVariant;
  /** Turn the border orange on hover — use for clickable cards. */
  interactive?: boolean;
  /** Dark-section styling (translucent cream border on a faint fill). */
  dark?: boolean;
  children?: React.ReactNode;
}

/**
 * Surface container with a 4px radius. `bordered` is the light hairline card
 * used for lists; `elevated` adds padding and a soft warm shadow for feature
 * cards. Set `interactive` so the border warms to orange on hover.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'bordered', interactive = false, dark = false, className, children, ...rest }, ref) => {
    const cls = [
      'ed-card',
      variant === 'elevated' && 'ed-card--elevated',
      interactive && 'ed-card--interactive',
      dark && 'ed-card--dark',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <div ref={ref} className={cls} {...rest}>
        {children}
      </div>
    );
  },
);
Card.displayName = 'Card';
