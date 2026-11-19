#!/usr/bin/env node
// Opt-in end-to-end test of the Russian-only static export (fresh offline browser context).
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
  page.setDefaultTimeout(12000);
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
      if (localStorage.getItem('ru-seeded')) return;
      localStorage.setItem('ru-seeded','1');
      localStorage.setItem('milo_local_profile_v1', JSON.stringify({ fullName: 'Local Test', email:'local@example.test', code:'123456', createdAt:new Date().toISOString() }));
      const old = { stageVersion:2, stage:9, sentenceIndex:0,revealed:false,answers:{0:2},showCheckAnswers:true };
      localStorage.setItem('russian_lesson_sessions_v1',JSON.stringify({schema:1,sessions:{'ru-pre-this-is':old,'ru-pre-hello':{...old,stage:6},'ru-c1-certainty-evidence':old}}));
    });
    const base = `${origin}/App`, click = name => page.getByRole('button',{ name, exact:true }).click();
    const text = s => page.getByText(s,{exact:true}).first().waitFor();
    await page.goto(`${base}/learn/ru`); await click('فعل و ضمیر');
    await page.getByRole('button',{name:/Pre-A1 · من می‌خواهم/}).click();
    await text('Я хочу́ чай.'); await text('Ты хо́чешь чай?'); await click('хо́чешь');
    await page.getByText(/^درست است\./).first().waitFor(); await click('بازگشت به فهرست کارگاه');
    await page.getByRole('button',{name:/^فعل‌ها ·/}).click(); await page.getByLabel('جست‌وجوی فعل').fill('хочу');
    await click('хотеть · خواستن'); await click('تمرین همین مثال');
    await page.getByText(/____/).first().waitFor();
    console.log('PASS standalone learning, conjugation and inflected verb search.');
    await page.goto(`${base}/learn/ru/lesson?id=ru-pre-hello`); await click('فعل و ضمیر همین درس');
    await text('مثال‌ها و ساخت‌های مرتبط با «اولین سلام»'); await page.goBack(); await page.getByRole('button',{name:'فعل و ضمیر همین درس'}).waitFor();
    await page.goto(`${base}/learn/ru/lesson?id=ru-pre-this-is`);
    await click('ادامه'); await click('هم‌صحبت شروع کنه'); await text('Что ты хо́чешь?');
    await click('بگو: Я хочу́ во́ду.'); await text('Вот твоя́ вода́.'); await page.reload(); await text('Вот твоя́ вода́.');
    const done=page.getByRole('button',{name:'پایان درس',exact:true}); assert(await done.isDisabled());
    await click('بگو: А ты хо́чешь во́ду?'); await text('Нет, я хочу́ чай.'); assert(await done.isEnabled());
    await click('عوض کردن شروع‌کننده'); await click('من شروع می‌کنم'); await click('بگو: Я хочу́ чай.'); await text('Вот твой чай.');
    await click('بگو: Спаси́бо!'); await text('Пожа́луйста!'); await click('پایان درس');
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem('sentence_course_progress_ru_v2')||'{}').completedLessonIds?.includes('ru-pre-this-is'));
    assert(!await page.evaluate(()=>JSON.parse(localStorage.getItem('russian_lesson_sessions_v1')).sessions['ru-pre-this-is']));
    console.log('PASS both starters, distinct tea/water replies, reload, gated completion and progress.');
    await page.goto(`${base}/learn/ru/lesson?id=ru-c1-certainty-evidence`); await click('ادامه'); await click('هم‌صحبت شروع کنه');
    const input=page.getByLabel('پاسخ من به روسی'); await input.fill('не знаю'); await click('فرستادن پاسخ');
    await page.getByText(/^منظورت روشن نشد/).waitFor(); await input.fill('нет выборка слишком мала'); await click('فرستادن پاسخ');
    await text('Тогда отдельно укажем размер выборки.'); await text('нет выборка слишком мала');
    await page.goto(`${base}/lang`); await page.waitForURL('**/languages'); await page.getByRole('button',{name:'ورود به زبان روسی', exact:true}).waitFor(); assert.equal(await page.getByRole('button',{name:/^ورود به زبان /}).count(),1);
    assert.deepEqual(errors,[]); console.log('PASS advanced authored intent, unknown-input clarification and Russian-only route guard.');
  } finally { await browser.close(); }
})().catch(e=>{ console.error(e); process.exitCode=1; });
