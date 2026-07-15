import * as React from 'react';
import { SectionHeader, Eyebrow } from '@erikdohnberg/design-system';

export const Default = () => <SectionHeader>Some work I'm proud of</SectionHeader>;

export const WithEyebrow = () => (
  <div>
    <Eyebrow>Selected work</Eyebrow>
    <SectionHeader style={{ marginTop: 8 }}>Things I think about</SectionHeader>
  </div>
);

export const AsH1 = () => <SectionHeader as="h1">About</SectionHeader>;

export const OnDark = () => (
  <div style={{ background: '#1f1d1b', padding: 28, borderRadius: 4 }}>
    <SectionHeader dark>What it's like working with me</SectionHeader>
  </div>
);
