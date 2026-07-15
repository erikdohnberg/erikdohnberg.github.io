import * as React from 'react';
import { Section, SectionHeader } from '@erikdohnberg/design-system';

const Body = ({ dark }: { dark?: boolean }) => (
  <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: 17, lineHeight: 1.8, color: dark ? '#d8d2c6' : '#333', marginTop: 24, marginBottom: 0 }}>
    The contexts look different, but the actual problems — user adoption, competitor pressure,
    regulatory fog — show up time and time again.
  </p>
);

export const Paper = () => (
  <Section theme="paper" style={{ padding: '48px 32px' }}>
    <SectionHeader>About</SectionHeader>
    <Body />
  </Section>
);

export const Light = () => (
  <Section theme="light" style={{ padding: '48px 32px' }}>
    <SectionHeader>Some work I'm proud of</SectionHeader>
    <Body />
  </Section>
);

export const Dark = () => (
  <Section theme="dark" style={{ padding: '48px 32px' }}>
    <SectionHeader dark>Things I think about</SectionHeader>
    <Body dark />
  </Section>
);
