import * as React from 'react';
import { Testimonial } from '@erikdohnberg/design-system';

export const Light = () => (
  <div style={{ maxWidth: 560 }}>
    <Testimonial
      quote="Erik consistently proved himself as the go-to problem solver when the team faced ambiguity, changing priorities, or tight deadlines."
      author="Anas Herzallah"
      role="Associate Product Manager at Bounteous"
    />
  </div>
);

export const NoRole = () => (
  <div style={{ maxWidth: 560 }}>
    <Testimonial
      quote="Erik's communication-first mindset ensures that the right opinions are heard up front."
      author="Will Badger"
    />
  </div>
);

export const OnDark = () => (
  <div style={{ background: '#1f1d1b', padding: 28, borderRadius: 4, maxWidth: 560 }}>
    <Testimonial
      dark
      quote="While at 500px, Erik delivered a complex content feed experience working with the AI teams, development, and design. Erik is one of the good ones."
      author="James Manson"
      role="VP of Products at 500px"
    />
  </div>
);
