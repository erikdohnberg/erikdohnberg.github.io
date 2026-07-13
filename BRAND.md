# Erik Dohnberg — Brand & Design System

A reference for keeping docs, decks, and future pages visually consistent with
[erikdohnberg.com](https://erikdohnberg.com). The live system lives in the
`<style>` block of `index.html` and the inline styles in `components.jsx`.
(`style.css` is legacy and unused by the current React app.)

**One-line summary:** Warm neutrals + a single orange accent · Sanchez headings,
Raleway body, Caveat for personality · 4px radius · 640px text column · an orange
bar under every heading.

---

## Color palette

| Role | Value | Notes |
|---|---|---|
| **Accent (brand orange)** | `#ff9900` | The one signature color — underlines, links, focus rings, CTA borders |
| Accent hover (dark bg) | `#ffb84d` | Lightened orange for hovers on dark sections |
| Ink / body text | `#333333` | Primary text on light backgrounds |
| Page background | `#fdfcf8` | Warm off-white (near-paper) |
| "Paper" section bg | `#faf6ef` | Carries a subtle dotted + ruled texture overlay |
| "Light" section bg | `#ffffff` | Clean white |
| "Dark" section bg | `#1f1d1b` | Warm charcoal, faint orange-dot texture |
| Cream (text on dark) | `#f5f0e8` | Headings & body on dark sections |
| Muted on dark | `#d8d2c6`, `#9a958d` | Secondary / footnote text |
| Muted on light | `#888888`, `#999999` | Captions, roles, metadata |
| Selection highlight | `rgba(255,153,0,0.25)` | Orange tint |

The scheme is **warm neutrals with a single orange accent** — no secondary brand
color. Backgrounds are never pure white or black; they lean cream and
warm-charcoal.

---

## Typography

Three Google Fonts, each with a clear job:

- **Sanchez** (slab serif) — all headings, the name, display type. Slightly
  tightened: `letter-spacing: -0.01em`.
- **Raleway** (sans-serif; weights 300 / 400 / 500 / 600) — body copy and all UI.
- **Caveat** (handwritten) — accent & personality only: scroll hint, "Read ↗"
  tags, footer line, confirmation messages. Use sparingly.

Font load:

```html
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&family=Raleway:wght@300;400;500;600&family=Sanchez&display=swap" rel="stylesheet">
```

### Scale & treatments

| Element | Font | Size | Notes |
|---|---|---|---|
| Hero name | Sanchez | `clamp(52px, 8vw, 80px)` | First name in orange, `-0.01em` |
| Eyebrow / role | Raleway | `clamp(13px, 2.5vw, 15px)` | UPPERCASE, `letter-spacing: 0.06em`, `#888` |
| Section header (h2) | Sanchez | `clamp(24px, 6vw, 36px)` | `-0.01em`; **44×3px orange bar underneath** |
| Card title (h3) | Sanchez | 18–28px | — |
| Body | Raleway | 17px | `line-height: 1.8`, `text-wrap: pretty` |

The **orange bar under every section header** is the recurring brand motif:

```css
.section-header::after {
  content: ''; display: block;
  width: 44px; height: 3px;
  background: #ff9900; margin-top: 10px;
}
```

---

## Layout & spacing

- Text column max-width **640px** (880px for the work carousel, 800px for hero).
- Section rhythm: **120px** vertical padding on desktop → 80px → 64px on smaller
  screens.
- **4px border-radius** everywhere (cards, buttons, inputs); circular (`50%`) for
  icon and nav buttons.
- Body: 17px Raleway, `line-height: 1.7`.
- Alternating section backgrounds — **paper → light → dark → paper** — give the
  long scroll its cadence.

---

## Components

- **Cards** — 1px hairline border, 4px radius; border turns orange on hover. Dark
  variant uses translucent cream borders on a faint cream fill.
- **Primary button** (`.substack-btn`) — transparent with orange outline and
  orange text; **fills solid orange with white text on hover.**
- **Inline links** — orange bottom-border underline; text shifts to orange on
  hover.
- **Focus ring** — `2px solid #ff9900`, `outline-offset: 3px` (accessible and
  on-brand).
- **Nav / carousel buttons** — 44px circle, thin border → orange on hover,
  `scale(0.97)` on press.

---

## Motion

- Sections fade and rise on scroll: `translateY(30px)` → `0`, `0.5s`, easing
  `cubic-bezier(0.23, 1, 0.32, 1)`, triggered via `IntersectionObserver`.
- Hover transitions ~`0.3s`; buttons compress to `scale(0.97)` on press.
- **`prefers-reduced-motion` is respected** — drops the translate and shortens the
  duration to a plain fade.

---

## Voice & personality

The visual system is quiet and editorial; the personality comes through in the
**handwritten Caveat accents**, the **orange underline motif**, and warm paper
textures. Tone touchpoints:

> Made in Toronto 🇨🇦 fuelled by espresso ☕️ and built with AI 🤖

Plus the playful AI-crawler easter eggs in `llms.txt`. When writing docs, aim for
**plain-spoken, outcome-driven, lightly self-aware** — confident without being
loud.

---

## Copy-paste tokens

```css
:root {
  /* Color */
  --color-accent:        #ff9900;
  --color-accent-hover:  #ffb84d;
  --color-ink:           #333333;
  --color-bg:            #fdfcf8;
  --color-bg-paper:      #faf6ef;
  --color-bg-light:      #ffffff;
  --color-bg-dark:       #1f1d1b;
  --color-cream:         #f5f0e8;
  --color-muted-dark:    #9a958d;
  --color-muted-light:   #888888;
  --color-selection:     rgba(255,153,0,0.25);

  /* Type */
  --font-display: 'Sanchez', serif;
  --font-body:    'Raleway', sans-serif;
  --font-accent:  'Caveat', cursive;

  /* Shape & rhythm */
  --radius:            4px;
  --measure:          640px;
  --section-padding:  120px;
  --ease-out-strong:  cubic-bezier(0.23, 1, 0.32, 1);
}
```
