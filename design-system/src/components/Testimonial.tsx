import * as React from 'react';

export interface TestimonialProps extends React.HTMLAttributes<HTMLQuoteElement> {
  /** The quote text (rendered without surrounding quotation marks — they're added). */
  quote: string;
  /** Attribution name. */
  author: string;
  /** Optional role/relationship line (e.g. "VP of Products at 500px"). */
  role?: string;
  /** Dark-section styling. */
  dark?: boolean;
}

/**
 * Pull quote with the brand's orange left rule. Italic, light-weight Raleway
 * quote text over a muted attribution footer. Used for testimonials.
 */
export const Testimonial = ({
  quote,
  author,
  role,
  dark = false,
  className,
  ...rest
}: TestimonialProps) => {
  const cls = ['ed-testimonial', dark && 'ed-testimonial--dark', className]
    .filter(Boolean)
    .join(' ');
  return (
    <blockquote className={cls} {...rest}>
      <p className="ed-testimonial__quote">“{quote}”</p>
      <footer className="ed-testimonial__footer">
        — {author}
        {role ? `, ${role}` : ''}
      </footer>
    </blockquote>
  );
};
Testimonial.displayName = 'Testimonial';
