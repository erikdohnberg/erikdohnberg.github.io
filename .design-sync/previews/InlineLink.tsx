import * as React from 'react';
import { InlineLink } from '@erikdohnberg/design-system';

export const InBody = () => (
  <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: 17, lineHeight: 1.8, color: '#333', maxWidth: 460, margin: 0 }}>
    Most of what I know I learned from other people in the tech scene — see the{' '}
    <InlineLink href="https://substack.com/@heyerikd">full archive on Substack</InlineLink> for more.
  </p>
);

export const Standalone = () => (
  <InlineLink href="https://github.com/erikdohnberg/helm">→ github.com/erikdohnberg/helm</InlineLink>
);

export const OnDark = () => (
  <div style={{ background: '#1f1d1b', padding: 24, borderRadius: 4 }}>
    <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: 17, lineHeight: 1.8, color: '#d8d2c6', margin: 0 }}>
      New posts land on <InlineLink href="https://substack.com/@heyerikd" dark>Substack</InlineLink>.
    </p>
  </div>
);
