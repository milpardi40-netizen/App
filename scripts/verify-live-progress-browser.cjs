#!/usr/bin/env node
// Opt-in browser regression against the actual learner export. See docs/learning-progress.md.
// The fixture is isolated in a fresh browser context. No network service, microphone or account.
const { chromium } = require('playwright-core');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');

(async () => {
  const dist = path.resolve(__dirname, '../dist'), origin = 'http://milo.test';
  const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || undefined, headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) return route.abort();
      const file = path.resolve(dist, '.' + decodeURIComponent(url.pathname.replace(/^\/App(?=\/)/, '')));
      if (!file.startsWith(dist + path.sep)) return route.abort();
      for (const candidate of [file, file + '.html', path.join(file, 'index.html')]) {
        if (await fs.stat(candidate).then(s => s.isFile(), () => false)) return route.fulfill({ path: candidate });
      }
      return route.fulfill({ status: 404, body: 'not found' });
    });
    await page.addInitScript(() => {
      if (localStorage.getItem('qa-progress-seeded')) return;
      localStorage.setItem('qa-progress-seeded', '1');
      const now = new Date().toISOString();
      localStorage.setItem('milo_local_profile_v1', JSON.stringify({ fullName: 'Offline Test', email: 'local@example.test', code: '123456',
        createdAt: now, verifiedAt: now, lastSeenAt: now }));
      localStorage.setItem('russian_lesson_sessions_v1', JSON.stringify({ schema: 1, sessions: {
        'ru-pre-hello': { stage: 4, stageVersion: 2, sentenceIndex: 0, revealed: false, answers: {}, showCheckAnswers: false, updatedAt: now },
      } }));
    });
    const map = `${origin}/App/learn/ru/library?level=0`;
    const selector = '[role="progressbar"][aria-valuenow]';
    const waitPercent = min => page.waitForFunction(({ selector, min }) =>
      Number(document.querySelector(selector)?.getAttribute('aria-valuenow')) > min, { selector, min });
    await page.goto(map); await waitPercent(2);
    for (const dir of ['rtl', 'ltr']) {
      await page.evaluate(d => { document.documentElement.dir = d; document.querySelector('#root').style.direction = d; }, dir);
      const box = await page.locator(selector).first().evaluate(e => {
        const t = e.getBoundingClientRect(), fill = e.firstElementChild.getBoundingClientRect();
        return { width: t.width, fill: fill.width, right: t.right - fill.right, pct: Number(e.getAttribute('aria-valuenow')) };
      });
      assert.ok(box.width > 160 && box.fill > 0 && Math.abs(box.right) < 1, JSON.stringify(box));
      assert.ok(Math.abs(box.fill - box.width * box.pct / 100) < 1, 'pixels must agree with the accessible percentage');
    }
    assert.ok((await page.locator('body').innerText()).includes('۰ از ۱۷ درس · ۱ نیمه‌تمام'));
    // Simulate data arriving while the page is still focused. No remount is required.
    await page.evaluate(() => {
      const key = 'russian_lesson_sessions_v1', data = JSON.parse(localStorage.getItem(key));
      data.sessions['ru-pre-hello'].stage = 8; localStorage.setItem(key, JSON.stringify(data)); window.dispatchEvent(new Event('storage'));
    });
    await waitPercent(100 * 8 / (11 * 17) - .05);
    await page.getByText('ادامهٔ درس این سطح', {exact:true}).click();
    await page.getByText('ادامه', {exact:true}).last().click();
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('russian_lesson_sessions_v1')).sessions['ru-pre-hello'].stage === 9);
    await page.goBack(); await waitPercent(100 * 9 / (11 * 17) - .05);
    await page.reload(); await waitPercent(100 * 9 / (11 * 17) - .05);
    await page.goto(`${origin}/App/profile`);
    await page.getByRole('tab', { name: 'زبان‌ها' }).click();
    await page.getByText('روسی', {exact:true}).first().waitFor();
    const text = await page.locator('body').innerText();
    assert.ok(text.includes('۰ از ۲۰۳ درس · ۱ نیمه‌تمام') && text.includes('۰ از ۱۷ درس · ۱ نیمه‌تمام'));
    assert.deepEqual(errors, []);
    console.log('PASS: Russian Pre-A1 at mobile width in RTL/LTR; storage refresh, real lesson advance, back, reload, and profile.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
