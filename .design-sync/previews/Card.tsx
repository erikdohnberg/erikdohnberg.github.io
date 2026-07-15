import * as React from 'react';
import { Card, HandwrittenAccent } from '@erikdohnberg/design-system';

export const Bordered = () => (
  <Card style={{ maxWidth: 420 }}>
    <h3 style={{ fontFamily: "'Sanchez', serif", fontSize: 18, color: '#333', margin: '0 0 6px' }}>
      The whiteboard remembers what transcripts don't
    </h3>
    <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: 15, color: '#888', margin: 0, lineHeight: 1.5 }}>
      AI gives you retrieval infrastructure. Whiteboarding gives you encoded memory.
    </p>
  </Card>
);

export const Elevated = () => (
  <Card variant="elevated" style={{ maxWidth: 460 }}>
    <h3 style={{ fontFamily: "'Sanchez', serif", fontSize: 26, color: '#333', margin: '0 0 4px' }}>Helm</h3>
    <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: 15, color: '#999', fontStyle: 'italic', margin: '0 0 16px' }}>
      Keep strategy on course.
    </p>
    <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: 15, color: '#333', lineHeight: 1.7, margin: 0 }}>
      An AI layer that connects to the tools a team already uses and flags when day-to-day decisions drift from intent.
    </p>
  </Card>
);

export const Interactive = () => (
  <Card interactive style={{ maxWidth: 420, position: 'relative' }}>
    <HandwrittenAccent accent style={{ position: 'absolute', top: 12, right: 14, fontSize: 14 }}>Read ↗</HandwrittenAccent>
    <h3 style={{ fontFamily: "'Sanchez', serif", fontSize: 18, color: '#333', margin: '0 0 6px', paddingRight: 60 }}>
      AI Made Your Junior Team Faster
    </h3>
    <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: 15, color: '#888', margin: 0, lineHeight: 1.5 }}>
      The work didn't disappear. It just moved upstairs.
    </p>
  </Card>
);

export const OnDark = () => (
  <div style={{ background: '#1f1d1b', padding: 24, borderRadius: 4 }}>
    <Card dark interactive style={{ maxWidth: 420, position: 'relative' }}>
      <HandwrittenAccent accent style={{ position: 'absolute', top: 12, right: 14, fontSize: 14 }}>Read ↗</HandwrittenAccent>
      <h3 style={{ fontFamily: "'Sanchez', serif", fontSize: 18, color: '#f5f0e8', margin: '0 0 6px', paddingRight: 60 }}>
        Turning strategic drift into product leverage
      </h3>
      <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: 15, color: '#9a958d', margin: 0, lineHeight: 1.5 }}>
        The best PM moves don't look heroic. They look like timing.
      </p>
    </Card>
  </div>
);
