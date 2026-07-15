import * as React from 'react';
import { IconButton } from '@erikdohnberg/design-system';

const Chevron = ({ dir }: { dir: 'left' | 'right' | 'up' }) => {
  const points =
    dir === 'left' ? '15 18 9 12 15 6' : dir === 'right' ? '9 18 15 12 9 6' : '18 15 12 9 6 15';
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={points} />
    </svg>
  );
};

export const Previous = () => (
  <IconButton label="Previous">
    <Chevron dir="left" />
  </IconButton>
);

export const Next = () => (
  <IconButton label="Next">
    <Chevron dir="right" />
  </IconButton>
);

export const Small = () => (
  <IconButton label="Scroll to top" size="sm">
    <Chevron dir="up" />
  </IconButton>
);

export const OnDark = () => (
  <div style={{ background: '#1f1d1b', padding: 24, borderRadius: 4 }}>
    <IconButton label="Next" dark>
      <Chevron dir="right" />
    </IconButton>
  </div>
);
