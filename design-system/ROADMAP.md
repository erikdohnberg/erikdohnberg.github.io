# Design System — components & roadmap

## Shipping now (v0.1)

Extracted from the patterns already on erikdohnberg.com:

| Component | From the site |
|---|---|
| `Section` | The `paper` / `light` / `dark` alternating section backgrounds |
| `SectionHeader` | Every `h2` with its orange underline bar |
| `Eyebrow` | The uppercase "Senior Product Manager · Toronto" kicker |
| `Button` | The Substack `Subscribe` CTA (outline → fill) |
| `IconButton` | Carousel nav, top-bar social icons, scroll-to-top |
| `InlineLink` | Body links with the orange underline |
| `Card` | Writing cards (`bordered`) and the Helm project card (`elevated`) |
| `Testimonial` | The orange-left-rule pull quotes |
| `HandwrittenAccent` | Caveat "Read ↗", "scroll", the footer sign-off |
| `FadeSection` | The scroll-reveal wrapper on every section |

## Worth designing next

Patterns that exist on the site as one-off inline markup and would earn their
place as real, reusable components — flagged for a future pass:

- **`Tag` / `Badge`** — the site hand-rolls several: the orange "Read ↗" and
  "coming soon" labels on writing cards, and the 🏆 "MarCom Gold Award" line.
  A small pill with `tone` (accent / neutral / award) variants would replace all
  of them.
- **`TextField`** — the Substack email capture in the Writing section is styled
  entirely inline (transparent input, orange focus border). It's a clear input
  primitive with a focus state already defined.
- **`Pager` / `CarouselControls`** — the "‹ 1/4 ›" control under "Some work I'm
  proud of" pairs two `IconButton`s with a position counter. Worth packaging as
  one accessible unit.
- **`Prose`** — the `.body-text` treatment (17px Raleway, 1.8 line-height,
  `text-wrap: pretty`, `<strong>`/`<em>` emphasis) is used throughout. A `Prose`
  wrapper would standardize long-form copy blocks.
- **`Avatar`** — testimonials currently have no author image; an avatar would
  round out attribution and reuse on an About/bio block.
- **`Divider`** — the soft top/bottom edge gradients on paper sections are a
  reusable separator.
- **`Wordmark`** — "Erik Dohnberg." with the orange first name appears in both
  the hero and the top bar; a single wordmark component would keep them in sync.
- **`Annotation`** — the handwritten margin notes / scribbles (currently stubbed
  out as no-ops in `components.jsx`) are a distinctive brand device worth
  building properly for docs and marketing pages.

## Notes

- Styling is class-based against `src/styles.css` (tokens + component CSS) — no
  CSS-in-JS. New components should define their classes in `src/components.css`
  using the `--ed-*` custom properties, never hard-coded values.
- Every component forwards native element props and (where it takes a ref)
  forwards the ref, so they compose into forms and layouts without escape
  hatches.
