# design-sync notes — @erikdohnberg/design-system

Repo-specific gotchas for future syncs.

## Build

- The DS is a subpackage at `design-system/` in the `erikdohnberg.github.io`
  repo (the site itself is the static files at repo root — unrelated to the DS).
- `cfg.buildCmd` = `npm run build`, run from `design-system/`. It does two things:
  `tsup` (JS + `.d.ts` → `dist/`) **and** `build:css` (esbuild bundles
  `src/styles.css` → `dist/styles.css`, flattening local `@import`s and copying
  the woff2 files into `dist/` with hashed names). `cfg.cssEntry` points at the
  flattened `dist/styles.css` — **not** `src/styles.css`, which is only `@import`
  lines and scrapes to 0 KB.
- Converter invocation (from repo root):
  `node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./design-system/node_modules --entry ./design-system/dist/index.js --out ./ds-bundle`

## Fonts — self-hosted, do not revert to the CDN

- Brand fonts (Caveat, Raleway, Sanchez) are **self-hosted** as woff2 under
  `design-system/src/fonts/`, wired via `src/fonts.css`. The original site used a
  Google Fonts `@import`, but that renders in a **fallback serif** in the capture
  environment (and would be equally fragile in claude.ai/design) — the Caveat
  handwritten accents were completely lost until self-hosting. Keep them local.
- Latin subset only. Caveat/Raleway are variable fonts, so esbuild dedupes the
  per-weight woff2 to one file each by content hash — expected, not a bug.
- To refresh/extend weights: re-run the fetch (`/tmp/fetch-fonts.mjs` pattern —
  fetch Google Fonts css2 with a Chrome UA, download the `/* latin */` woff2s,
  regenerate `src/fonts.css`), then `npm run build`.

## Render check

- Playwright **1.56.0** matches the cached chromium build (1194) at
  `/opt/pw-browsers`. Installed in `.ds-sync/`. A different playwright version
  fails with "Executable doesn't exist".

## Known render warns

- `[FONT_REMOTE]` should **not** appear anymore (fonts are local). If it returns,
  a remote `@import` crept back into the stylesheet.

## Re-sync risks (watch-list)

- **Fonts**: if someone re-adds the Google Fonts `@import` to `tokens.css`/`styles.css`,
  the self-hosted faces get bypassed and personality fonts silently fall back.
  The `dist/styles.css` must contain `@font-face ... url(./*.woff2)`, no `googleapis` URL.
- **Preview grades**: all 10 components graded `good` on the absolute rubric and
  carried by the uploaded `_ds_sync.json`. Grades follow the authored
  `.design-sync/previews/*.tsx`; editing a preview re-keys and re-grades it.
- **New components**: adding an export to `design-system/src/index.ts` + a
  component file is all that's needed; author a `.design-sync/previews/<Name>.tsx`
  so it ships a real card instead of the floor card. See `design-system/ROADMAP.md`
  for flagged candidates (Tag, TextField, Pager, Prose, Avatar, Divider,
  Wordmark, Annotation).
- **CSS-in-JS**: none. Styling is class-based against `styles.css`; `_ds_bundle.css`
  is where the component classes and tokens live for designs (via the styles.css
  `@import` closure).
