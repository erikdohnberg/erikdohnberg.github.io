import * as React from 'react';

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading level to render. Defaults to `h2`. */
  as?: 'h1' | 'h2' | 'h3';
  /** Use the cream color for dark sections. */
  dark?: boolean;
  children?: React.ReactNode;
}

/**
 * Sanchez slab-serif heading with the signature 44×3px orange bar beneath it.
 * The bar is the design system's most recognizable motif — every section
 * header carries one. Pass `dark` on charcoal backgrounds.
 */
export const SectionHeader = ({
  as: Tag = 'h2',
  dark = false,
  className,
  children,
  ...rest
}: SectionHeaderProps) => {
  const cls = ['ed-section-header', dark && 'ed-section-header--dark', className]
    .filter(Boolean)
    .join(' ');
  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
};
SectionHeader.displayName = 'SectionHeader';
