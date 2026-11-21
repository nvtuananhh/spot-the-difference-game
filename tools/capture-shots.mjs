// capture-shots.mjs — dev-only tooling, NOT shipped: main.ts copies
// only game/ and screenshots/, so this file never reaches /output.
// Takes the 4 entry screenshots at 1280x720 and checks determinism by
// re-taking the cover shot and comparing bytes.
import { chromium } from '/home/hatch/workspace/makefun/.pwtest/node_modules/playwright-core/index.mjs';
import { writeFileSync, readFileSync } from 'node:fs';

const BASE = 'http://127.0.0.1:8080/index.html';
const OUT = '/home/hatch/workspace/makefun/best-spot-the-difference-game-20261121-0451-entry/screenshots';

const browser = await chromium.launch({
  executablePath: '/home/hatch/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1280,720'],
});

async function shot(name, query) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errors.push(`${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${String(e)}`));
  await page.goto(`${BASE}${query}`, { waitUntil: 'load' });
  await page.waitForTimeout(700);
  const path = `${OUT}/${name}`;
  await page.screenshot({ path, type: 'jpeg', quality: 82 });
  console.log(name, 'errors:', errors.length ? errors.join(' | ') : 'none');
  await page.close();
  return path;
}

await shot('1-cover.jpg', '?shot=play&seed=1&level=2');
await shot('2-start.jpg', '?shot=start&seed=1');
await shot('3-library.jpg', '?shot=play&seed=1&level=3');
await shot('4-complete.jpg', '?shot=end&seed=1');

// Determinism: re-take the cover and compare bytes.
const again = '/tmp/spot-cover-again.jpg';
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(`${BASE}?shot=play&seed=1&level=2`, { waitUntil: 'load' });
await page.waitForTimeout(700);
await page.screenshot({ path: again, type: 'jpeg', quality: 82 });
await page.close();
const a = readFileSync(`${OUT}/1-cover.jpg`);
const b = readFileSync(again);
console.log('determinism cover bytes equal:', a.equals(b), a.length, b.length);
await browser.close();
console.log('done');
