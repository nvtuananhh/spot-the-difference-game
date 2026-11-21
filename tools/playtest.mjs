// playtest.mjs — dev-only scripted playtest, NOT shipped.
// Drives the real game in headless Chromium: click a difference, click a
// miss, finish all rounds by clicking every difference, restart, and
// exercise keyboard play. Reports state after each step.
import { chromium } from '/home/hatch/workspace/makefun/.pwtest/node_modules/playwright-core/index.mjs';

const browser = await chromium.launch({
  executablePath: '/home/hatch/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1280,720'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console.error: ${m.text()}`); });
page.on('pageerror', (e) => errors.push(`pageerror: ${String(e)}`));

await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'load' });
await page.waitForTimeout(500);
const probe = () => page.evaluate(() => {
  const g = window.__game;
  const s = g.state;
  return {
    screen: s.screen, round: s.roundIndex + 1,
    found: [...s.found], mistakes: s.mistakes, score: s.score,
    remaining: g.currentLevel().differences.length - s.found.size,
    timeLeft: Math.round(s.timeLeft), hintsLeft: s.hintsLeft,
    overlayHidden: document.getElementById('overlay').hidden,
    remainingText: document.getElementById('remaining').textContent,
  };
});
const clickScene = async (x, y) => {
  // Left canvas box in the 1280x720 viewport.
  const box = await page.evaluate(() => {
    const r = document.getElementById('panel-left').getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  });
  await page.mouse.click(box.left + (x / 600) * box.width, box.top + (y / 440) * box.height);
  await page.waitForTimeout(120);
};
const clickAllRound = async () => {
  const diffs = await page.evaluate(() => window.__game.currentLevel().differences);
  for (const d of diffs) await clickScene(d.x, d.y);
  await page.waitForTimeout(200);
};

console.log('initial:', JSON.stringify(await probe()));
await page.click('#start-btn');
await page.waitForTimeout(300);
console.log('after start:', JSON.stringify(await probe()));

// Click a real difference (sun, round 1) on the LEFT panel.
await clickScene(500, 70);
console.log('after real click:', JSON.stringify(await probe()));
// Click a non-difference (empty sky).
await clickScene(220, 80);
console.log('after miss click:', JSON.stringify(await probe()));
// Keyboard: move reticle and select with Enter on a difference.
// Reticle starts at 300,220; move to the cat at 110,328 via arrows is
// slow, so set reticle via probe then press Enter (keyboard path).
await page.evaluate(() => { window.__game.state.reticle = { x: 110, y: 328 }; window.__game.state.reticleVisible = true; });
await page.keyboard.press('Enter');
await page.waitForTimeout(150);
console.log('after keyboard Enter on cat:', JSON.stringify(await probe()));
// Hint key.
await page.keyboard.press('KeyH');
await page.waitForTimeout(150);
console.log('after H hint:', JSON.stringify(await probe()));
// Finish round 1, advance, finish rounds 2 and 3.
await clickAllRound();
console.log('after round1 complete:', JSON.stringify(await probe()));
await page.evaluate(() => window.__game.nextRound());
await page.waitForTimeout(200);
await clickAllRound();
console.log('after round2 complete:', JSON.stringify(await probe()));
await page.evaluate(() => window.__game.nextRound());
await page.waitForTimeout(200);
await clickAllRound();
console.log('after round3 (game complete):', JSON.stringify(await probe()));
// Restart via R key from the end screen path: play again, then R.
await page.evaluate(() => window.__game.startGame());
await page.waitForTimeout(200);
await page.keyboard.press('KeyR');
await page.waitForTimeout(200);
console.log('after R restart:', JSON.stringify(await probe()));
// Pause / resume.
await page.keyboard.press('KeyP');
await page.waitForTimeout(150);
console.log('after P pause:', JSON.stringify(await probe()));
await page.keyboard.press('KeyP');
await page.waitForTimeout(150);
console.log('after P resume:', JSON.stringify(await probe()));

console.log('ERRORS:', errors.length ? errors.join('\n') : 'none');
await browser.close();
console.log('playtest done');
