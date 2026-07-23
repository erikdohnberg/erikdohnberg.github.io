// scripts/screenshot-compass.mjs
//
// Regenerates the Compass Digital carousel image from the self-contained
// concept design. Renders the HTML in headless Chromium at 1440×900 @2x,
// waits for web fonts, captures the viewport (the SANDWICH SPECIAL popover
// is open on load), then writes an optimized WebP + PNG fallback to /images.
//
// The source HTML is intentionally NOT committed to the repo — pass its path
// as the first argument (or set COMPASS_HTML). Run:
//   node scripts/screenshot-compass.mjs /path/to/centric-forecasting-confidence-concept.html
//
// On CI, `npx playwright install chromium` provides the browser. In
// environments with a pre-installed Chromium, set CHROMIUM_PATH to its binary.

import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'node:fs';
import { join, dirname, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const IMAGES_DIR = join(ROOT, 'images');

const htmlArg = process.argv[2] || process.env.COMPASS_HTML;
if (!htmlArg) {
  console.error('Usage: node scripts/screenshot-compass.mjs <path-to-concept.html>');
  process.exit(1);
}
const htmlPath = isAbsolute(htmlArg) ? htmlArg : join(process.cwd(), htmlArg);
if (!existsSync(htmlPath)) {
  console.error(`Concept HTML not found: ${htmlPath}`);
  process.exit(1);
}

const OUT_BASE = 'compass-forecasting';
const MAX_BYTES = 400 * 1024;

const launchOpts = { args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'] };
if (process.env.CHROMIUM_PATH) launchOpts.executablePath = process.env.CHROMIUM_PATH;

const browser = await chromium.launch(launchOpts);
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle', timeout: 30000 });
  // Ensure web fonts are fully loaded before capture.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);

  // Full viewport (not full page) — the open popover sits within 900px height.
  const pngBuffer = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1440, height: 900 } });

  mkdirSync(IMAGES_DIR, { recursive: true });

  // WebP (primary). Quality tuned to land well under the size budget.
  let quality = 82;
  let webp;
  do {
    webp = await sharp(pngBuffer).webp({ quality, effort: 6 }).toBuffer();
    if (webp.length <= MAX_BYTES) break;
    quality -= 6;
  } while (quality >= 50);
  await sharp(webp).toFile(join(IMAGES_DIR, `${OUT_BASE}.webp`));

  // PNG fallback, compressed. Palette-quantize since the UI is mostly flat color.
  const png = await sharp(pngBuffer)
    .png({ compressionLevel: 9, quality: 90, effort: 10, palette: true })
    .toBuffer();
  await sharp(png).toFile(join(IMAGES_DIR, `${OUT_BASE}.png`));

  const kb = (n) => `${(n / 1024).toFixed(1)}KB`;
  console.log(`Wrote images/${OUT_BASE}.webp (${kb(webp.length)} @ q${quality})`);
  console.log(`Wrote images/${OUT_BASE}.png  (${kb(png.length)})`);
  if (webp.length > MAX_BYTES) console.warn(`WARNING: WebP exceeds ${kb(MAX_BYTES)} budget.`);
} finally {
  await browser.close();
}
