import * as React from 'react';
import { Button } from '@erikdohnberg/design-system';

export const Primary = () => <Button>Subscribe</Button>;

export const Solid = () => <Button variant="solid">Subscribe</Button>;

export const Ghost = () => <Button variant="ghost">Read the post</Button>;

export const Disabled = () => (
  <Button disabled>Subscribing…</Button>
);

export const Row = () => (
  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
    <Button variant="primary">Subscribe</Button>
    <Button variant="solid">Get in touch</Button>
    <Button variant="ghost">Read more</Button>
  </div>
);
