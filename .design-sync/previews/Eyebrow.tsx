import * as React from 'react';
import { Eyebrow } from '@erikdohnberg/design-system';

export const Default = () => <Eyebrow>Senior Product Manager · Toronto</Eyebrow>;

export const Category = () => <Eyebrow>Side Projects</Eyebrow>;

export const OnDark = () => (
  <div style={{ background: '#1f1d1b', padding: 24, borderRadius: 4 }}>
    <Eyebrow dark>New on Substack</Eyebrow>
  </div>
);
