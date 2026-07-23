# Erik Dohnberg Design System — how to build with it

Warm, editorial personal-brand system: warm neutrals + a single orange accent,
a slab-serif display face, and handwritten accents for personality.

## Setup

Import components from `@erikdohnberg/design-system`, and import the stylesheet
**once** at the app root:

```jsx
import '@erikdohnberg/design-system/styles.css';
import { Section, SectionHeader, Button } from '@erikdohnberg/design-system';
```

There is **no provider or context** — components are self-contained. The only
requirement is that `styles.css` is loaded; without it everything renders
unstyled. It ships the design tokens, the self-hosted brand fonts (Sanchez,
Raleway, Caveat — no font CDN needed), and every component's classes.

## Styling idiom — CSS custom properties, not utility classes

Components style themselves via class names against `styles.css`. There are **no
utility classes and no CSS-in-JS**. When you write your own layout glue around
these components, style it with the same `--ed-*` custom properties so it stays
on-brand — never hard-code hexes or fonts.

Tokens (all defined in the shipped stylesheet):

| Token | Value | Use |
|---|---|---|
| `--ed-color-accent` | `#ff9900` | the one brand color — links, CTAs, the header bar |
| `--ed-color-accent-hover` | `#ffb84d` | accent hover on dark |
| `--ed-color-ink` | `#333333` | body text on light |
| `--ed-color-bg` | `#fdfcf8` | warm page background |
| `--ed-color-bg-paper` | `#faf6ef` | textured paper section |
| `--ed-color-bg-light` | `#ffffff` | white section |
| `--ed-color-bg-dark` | `#1f1d1b` | charcoal section |
| `--ed-color-cream` | `#f5f0e8` | text on dark |
| `--ed-color-muted-light` / `--ed-color-muted-dark` | `#888888` / `#9a958d` | captions/metadata |
| `--ed-font-display` | `'Sanchez', serif` | headings, display |
| `--ed-font-body` | `'Raleway', sans-serif` | body & UI |
| `--ed-font-accent` | `'Caveat', cursive` | handwritten accents (use sparingly) |
| `--ed-radius` | `4px` | all corners |
| `--ed-measure` | `640px` | readable text column |
| `--ed-section-padding` | `120px` | section vertical rhythm |
| `--ed-ease-out-strong` | `cubic-bezier(0.23,1,0.32,1)` | reveal/entrance easing |

## Components (all exported from the package)

- **`Section`** — full-bleed section; `theme="paper|light|dark"`. Alternate
  `paper → light → dark` down a page for cadence. `contained` wraps children in
  the 640px column.
- **`SectionHeader`** — Sanchez heading; **automatically** carries the signature
  orange bar beneath it. `as="h1|h2|h3"`, `dark` on charcoal.
- **`Eyebrow`** — uppercase, letter-spaced kicker above a header.
- **`Button`** — `variant="primary"` (orange outline → fills on hover, the
  default CTA), `"solid"`, or `"ghost"`.
- **`IconButton`** — circular icon-only button; requires `label`; `size="sm|md"`,
  `dark`.
- **`InlineLink`** — body link with the orange underline; `dark` on charcoal.
- **`Card`** — `variant="bordered|elevated"`, `interactive` (border warms on
  hover), `dark`.
- **`Testimonial`** — pull quote with the orange left rule; `quote`, `author`,
  `role`, `dark`.
- **`HandwrittenAccent`** — Caveat text; `accent` (orange), `dark`.
- **`FadeSection`** — scroll-reveal wrapper; content in view reveals immediately.

On dark (`theme="dark"`) sections, pass `dark` to the components used inside and
color your own text `var(--ed-color-cream)`.

## Where the truth lives

Read `styles.css` (and its `@import`s — tokens, fonts, `_ds_bundle.css`) for the
exact classes and token values, and each component's `<Name>.d.ts` (props) and
`<Name>.prompt.md` (usage) before composing.

## One idiomatic build snippet

```jsx
<Section theme="paper">
  <Eyebrow>Selected work</Eyebrow>
  <SectionHeader>Some work I'm proud of</SectionHeader>
  <p style={{ fontFamily: 'var(--ed-font-body)', color: 'var(--ed-color-ink)',
              lineHeight: 1.8, maxWidth: 'var(--ed-measure)' }}>
    Four industries. Real products that shipped, with real teams.{' '}
    <InlineLink href="https://example.com">Read the case study</InlineLink>.
  </p>
  <Button variant="primary">Get in touch</Button>
</Section>
```
