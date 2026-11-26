import chromiumPkg from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const chromium = chromiumPkg.default ?? chromiumPkg;
const browser = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: [...chromium.args, '--no-sandbox', '--disable-gpu'], headless: 'shell' });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
const logs = [];
page.on('pageerror', e => logs.push('PAGEERROR: ' + e.message.slice(0, 300)));
page.on('console', m => { if (['error','warning'].includes(m.type())) logs.push(m.type().toUpperCase() + ': ' + m.text().slice(0, 220)); });
await page.setRequestInterception(true);
page.on('request', r => {
  const url = r.url();
  if (url.includes('supabase') || url.includes('e2b.app') && !url.includes('127.0.0.1')) return r.respond({ status: 200, contentType: 'application/json', body: '[]' });
  return r.continue();
});

async function visit(path, ms = 30000) {
  await page.goto('http://127.0.0.1:8081' + path, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, ms));
  const state = await page.evaluate(() => ({
    url: location.href,
    text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 220),
    len: document.body.innerText.length,
  }));
  console.log(`VISIT ${path} ->`, JSON.stringify(state));
  return state;
}

await visit('/App/');
await visit('/App/dialogue-room/ru');
await visit('/App/dialogue-room/ru/', 20000);
await visit('/App/conversations', 15000);
await page.evaluate(() => {
  const btn = [...document.querySelectorAll('[aria-label]')].find(el => (el.getAttribute('aria-label') || '').includes('اتاق گفت‌وگو'));
  if (btn) btn.click(); else return 'no-button';
});
await new Promise(r => setTimeout(r, 6000));
const after = await page.evaluate(() => ({ url: location.href, text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 220) }));
console.log('AFTER CLICK ->', JSON.stringify(after));
console.log('--- console/errors:', logs.slice(0, 10).join(' ;; ') || 'none');
await browser.close();
