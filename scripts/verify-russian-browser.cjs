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
      localStorage.setItem('russian_lesson_sessions_v1',JSON.stringify({schema:1,sessions:{'ru-pre-18-sentences-verbs':old,'ru-a1-introducing-yourself':old,'ru-pre-01-hello':{...old,stage:6},'ru-c1-certainty-evidence':old}}));
    });
    // OS boundary fixture only. Exercise the shipped Expo Web Speech adapter, real screen,
    // resolver and storage. Explicitly clock the end of TTS and ASR independently.
    await page.addInitScript(() => {
      const qa = window.qa = { starts:0, lines:[], mic:null, utterance:null, deny:false };
      const voices=[{name:'QA Russian',lang:'ru-RU',voiceURI:'fixture:ru'}];
      Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:class {constructor(text){this.text=text;}}});
      Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>voices,cancel(){qa.utterance=null;},speak(u){if(qa.mic)throw Error('overlap');qa.utterance=u;qa.lines.push(u.text);u.onstart?.();}}});
      qa.finish=()=>{const u=qa.utterance;qa.utterance=null;u?.onend?.();};
      class Recognition extends EventTarget { start(){if(qa.utterance)throw Error('overlap');qa.starts++;qa.mic=this;this.dispatchEvent(new Event('start'));
          if(qa.deny){this.dispatchEvent(Object.assign(new Event('error'),{error:'not-allowed'}));this.abort();}}
        abort(){if(qa.mic===this)qa.mic=null;this.dispatchEvent(new Event('end'));} stop(){this.abort();} }
      Object.defineProperty(window,'webkitSpeechRecognition',{configurable:true,value:Recognition});
      qa.say=(transcript,isFinal)=>{const row=Object.assign([{transcript,confidence:1}],{isFinal});qa.mic.dispatchEvent(Object.assign(new Event('result'),{resultIndex:0,results:[row]}));};
      qa.end=()=>qa.mic?.stop();
    });
    const base = process.env.EXPO_PUBLIC_WEB_ROOT === 'true' ? origin : `${origin}/App`, click = name => page.getByRole('button',{ name, exact:true }).click();
    const text = s => page.getByText(s,{exact:true}).filter({visible:true}).first().waitFor();
    const shot = async name => { if(process.env.RU_STUDIO_SCREENSHOTS) await page.screenshot({path:path.join(process.env.RU_STUDIO_SCREENSHOTS,name+'.png')}); };
    await page.goto(`${base}/learn/ru`); await click('اتاق آموزش افعال'); await click('خواستن، خواندن و گفتن'); await click('شروع تمرین صوتی');
    for (const line of ['хоте́ть', 'Я хочу́ чай.', 'Повтори́те предложе́ние.']) {await page.waitForFunction(l=>qa.utterance?.text===l,line);assert(!await page.evaluate(()=>qa.mic));await page.evaluate(()=>qa.finish());}
    await page.waitForFunction(()=>!!qa.mic);await page.evaluate(()=>{qa.say('хочу',true);qa.end();});await page.waitForFunction(()=>!!qa.utterance);await click('مکث تمرین');await click('مرور ۱ پاسخ ثبت‌شده');await text('در متن شنیده نشد: я، чай');await click('بازگشت به اتاق افعال');
    await page.goto(`${base}/learn/ru/grammar`); await text('از فعل تا جمله'); await shot('workshop');
    await click('شروع با «خواستن»'); await text('خوانش تقریبی: خاتِتْ'); await click('دیدن مثال'); await text('Я хочу́ чай.'); await shot('example');
    await click('تمرین همین مثال'); await click('хо́чет'); await text('یک بار دیگر'); await click('хочу́'); await text('درست است');
    await click('همین فعل در A1'); await click('دیدن مثال'); await text('Ты хо́чешь во́ду?');
    await click('سطح C1'); await click('دیدن مثال'); await text('Я не хочу́ сказа́ть, что ме́тод бесполе́зен.');
    await click('بازگشت به فهرست کارگاه'); await click('ضمیرها و الگوها'); await click('من می‌خواهم؛ تو می‌خواهی؟');
    await text('Я хочу́ чай.'); await click('مثال بعدی'); await text('Ты хо́чешь чай?'); await click('نوبت تو'); await click('хо́чешь'); await text('درست است');
    await click('بازگشت به فهرست کارگاه'); await click('واژه‌نامهٔ فعل'); await page.getByLabel('جست‌وجوی فعل').fill('хочу');
    await click('хотеть · خواستن'); await text('اول خودِ فعل'); await page.reload(); await page.getByRole('button',{name:'تمرین «خواندن»',exact:true}).waitFor();
    await page.goto(`${base}/learn/ru/lesson?id=ru-pre-01-hello`); await click('فعل و ضمیر همین درس'); await text('مثال‌ها و ساخت‌های مرتبط با «بله، خیر، سلام و خداحافظ»'); await page.goBack(); await page.getByRole('button',{name:'فعل و ضمیر همین درس'}).waitFor();
    console.log('PASS basic-to-C1 tutor, actual examples, retry, independent marks, pronouns, inflected search and lesson entry.');
    const mic = () => page.waitForFunction(()=>!!qa.mic), voiced = line => page.waitForFunction(l=>qa.utterance?.text===l,line);
    const finish=()=>page.evaluate(()=>qa.finish()), say=async v=>{await mic();await page.evaluate(v=>{qa.say(v,true);qa.end();},v);};
    await page.goto(`${base}/learn/ru`); await click('اتاق مکالمهٔ روسی'); await text('بله، خیر، سلام و خداحافظ'); assert.equal(await page.evaluate(()=>qa.starts),0);
    await click('من شروع می‌کنم');await say('привет');await voiced('Приве́т! Спаси́бо.'); await finish();await mic();await click('مکث مکالمه');assert(!await page.evaluate(()=>qa.mic));
    await click('موقعیت بعدی'); await text('من، تو، این و آن');assert(!await page.evaluate(()=>qa.mic));
    assert(!await page.evaluate(()=>JSON.parse(localStorage.getItem('sentence_course_progress_ru_v2')||'{}').completedLessonIds?.length));
    await page.goto(`${base}/learn/ru/lesson?id=ru-pre-18-sentences-verbs`); await click('ادامه'); await click('هم‌صحبت شروع کنه');
    await voiced('Чай и́ли ко́фе?'); assert(!await page.evaluate(()=>qa.mic)); await finish(); await mic();
    await page.evaluate(()=>qa.say('нет',false)); assert.equal(await page.evaluate(()=>qa.lines.length),1);
    await say('нет спасибо я хочу воду'); await voiced('Сок и́ли ко́фе?'); await text('нет спасибо я хочу воду'); await shot('voice'); await page.reload(); await text('Сок и́ли ко́фе?'); assert.equal(await page.evaluate(()=>qa.starts),0);
    const done=page.getByRole('button',{name:'پایان درس',exact:true}); assert.equal(await done.count(),0);
    await click('ادامهٔ مکالمهٔ صوتی'); await voiced('Сок и́ли ко́фе?'); await finish(); await say('я люблю кофе'); await page.waitForFunction(()=>!document.querySelector('[aria-label="پایان درس"]')?.disabled);await page.getByText('گفت‌وگو کامل شد',{exact:true}).filter({visible:true}).first().waitFor(); assert(await done.isEnabled());
    await click('پایان درس');await page.waitForFunction(()=>JSON.parse(localStorage.getItem('sentence_course_progress_ru_v2')||'{}').completedLessonIds?.includes('ru-pre-18-sentences-verbs'));
    assert(!await page.evaluate(()=>JSON.parse(localStorage.getItem('russian_lesson_sessions_v1')).sessions['ru-pre-18-sentences-verbs']));
    console.log('PASS home rehearsal, no auto mic on entry/reload, voice starter, pause, saved finale and gated completion.');
    await page.goto(`${base}/learn/ru/lesson?id=ru-c1-certainty-evidence`); await click('ادامه'); await page.evaluate(()=>qa.deny=true); await click('من شروع می‌کنم');
    await page.getByText(/^دسترسی میکروفون یا تشخیص گفتار داده نشد/).waitFor();await click('تمرین بدون میکروفون');await click('عوض کردن شروع‌کننده');await click('هم‌صحبت شروع کنه');
    const input=page.getByLabel('پاسخ من به روسی');await input.fill('не знаю');await click('فرستادن پاسخ');await page.getByText(/^منظورت روشن نشد/).waitFor();await input.fill('нет они указывают на возможную связь но другие объяснения не исключены');await click('فرستادن پاسخ');
    await text('Тогда́ в вы́воде ну́жно сохрани́ть э́ту огово́рку.');await text('нет они указывают на возможную связь но другие объяснения не исключены');
    await page.goto(`${base}/learn/ru/lesson?id=ru-a1-introducing-yourself`); await click('ادامه'); await click('هم‌صحبت شروع کنه');
    await voiced('Здра́вствуйте! Меня́ зову́т А́нна. Как вас зову́т?'); await finish();
    for(const [answer,reply] of [['здравствуйте меня зовут сара','О́чень прия́тно! Отку́да вы?'],['я из ирана я живу в тегеране','Кто э́то?']]) {
      await say(answer); await voiced(reply); await finish();
    }
    await say('это мой друг реза до свидания'); await page.getByText('گفت‌وگو کامل شد',{exact:true}).first().waitFor();
    assert(await page.getByRole('button',{name:'پایان درس',exact:true}).isEnabled());
    await page.goto(`${base}/lang`); await page.waitForURL('**/languages'); await page.getByRole('button',{name:'ورود به زبان روسی', exact:true}).waitFor(); assert.equal(await page.getByRole('button',{name:/^ورود به زبان /}).count(),1);
    assert.deepEqual(errors,[]); console.log('PASS advanced authored intent, unknown-input clarification and Russian-only route guard.');
  } finally { await browser.close(); }
})().catch(e=>{ console.error(e); process.exitCode=1; });
