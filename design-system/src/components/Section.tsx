import * as React from 'react';

export type SectionTheme = 'paper' | 'light' | 'dark';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Background treatment. `paper` = warm textured, `light` = white, `dark` = charcoal. */
  theme?: SectionTheme;
  /** Constrain content to the readable 640px column. */
  contained?: boolean;
  children?: React.ReactNode;
}

/**
 * Full-bleed page section with one of the three brand background treatments.
 * Alternating `paper → light → dark` sections give a long page its cadence.
 * Set `contained` to wrap children in the 640px readable column.
 */
export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ theme = 'light', contained = true, className, children, ...rest }, ref) => {
    const cls = ['ed-section', `ed-section--${theme}`, className].filter(Boolean).join(' ');
    return (
      <section
        ref={ref}
        className={cls}
        data-dark-section={theme === 'dark' ? 'true' : undefined}
        {...rest}
      >
        {contained ? <div className="ed-section__inner">{children}</div> : children}
      </section>
    );
  },
);
Section.displayName = 'Section';
