import * as React from 'react';
import { HandwrittenAccent } from '@erikdohnberg/design-system';

export const Default = () => (
  <HandwrittenAccent style={{ fontSize: 26 }}>
    Made in Toronto 🇨🇦 fuelled by espresso ☕️
  </HandwrittenAccent>
);

export const Accent = () => <HandwrittenAccent accent style={{ fontSize: 22 }}>Read ↗</HandwrittenAccent>;

export const ScrollHint = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
    <HandwrittenAccent style={{ fontSize: 18 }}>scroll</HandwrittenAccent>
    <HandwrittenAccent style={{ fontSize: 18 }}>↓</HandwrittenAccent>
  </div>
);

export const OnDark = () => (
  <div style={{ background: '#1f1d1b', padding: 24, borderRadius: 4 }}>
    <HandwrittenAccent dark style={{ fontSize: 22 }}>check your inbox ✓</HandwrittenAccent>
  </div>
);
