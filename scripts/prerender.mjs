import puppeteer from 'puppeteer';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.jsx':  'application/javascript',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.svg':  'image/svg+xml',
  '.txt':  'text/plain',
  '.xml':  'application/xml',
};

const server = createServer((req, res) => {
  const filePath = join(ROOT, req.url === '/' ? 'index.html' : req.url);
  try {
    const body = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
});

server.listen(3000, async () => {
  console.log('Server running on :3000');
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForSelector('#root > div', { timeout: 15000 });
    await new Promise(r => setTimeout(r, 3000)); // Babel compile + React paint buffer
    // Strip Babel-injected inline compiled scripts before capturing — they contain the full
    // transpiled source + a massive base64 source map that pushes body content past fetcher limits
    await page.evaluate(() => {
      document.querySelectorAll('script').forEach(s => {
        if (s.textContent.trimStart().startsWith('"use strict";')) s.remove();
      });
    });
    const html = await page.content();
    writeFileSync(join(ROOT, 'index.html'), html, 'utf-8');
    console.log('Pre-render written to index.html');
  } finally {
    await browser.close();
    server.close();
  }
});
