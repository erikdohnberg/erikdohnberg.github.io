import * as React from 'react';
import { FadeSection, SectionHeader, Card } from '@erikdohnberg/design-system';

export const Revealed = () => (
  <FadeSection>
    <SectionHeader>Side Projects</SectionHeader>
    <Card variant="elevated" style={{ maxWidth: 460, marginTop: 24 }}>
      <h3 style={{ fontFamily: "'Sanchez', serif", fontSize: 22, color: '#333', margin: '0 0 4px' }}>Helm</h3>
      <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: 15, color: '#999', fontStyle: 'italic', margin: 0 }}>
        Keep strategy on course.
      </p>
    </Card>
  </FadeSection>
);

export const PlainBlock = () => (
  <FadeSection>
    <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: 17, lineHeight: 1.8, color: '#333', maxWidth: 460, margin: 0 }}>
      This block starts lowered and transparent, then fades and rises into place as it enters
      the viewport. Content already on screen reveals immediately.
    </p>
  </FadeSection>
);
