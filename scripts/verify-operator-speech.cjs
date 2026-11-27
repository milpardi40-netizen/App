const assert = require('node:assert/strict');
const esbuild = require('esbuild');
(async () => {
  const spoken = [], fallback = [], stops = [];
  globalThis.__operatorTest = { spoken, fallback, stops };
  const built = await esbuild.build({ entryPoints: ['lib/operatorSpeech.ts'], bundle: true, write: false, platform: 'node', format: 'cjs', plugins: [{ name: 'speech-mocks', setup(build) {
    build.onResolve({ filter: /courseSpeech$|packAudio$|speechFallback$/ }, args => ({ path: args.path.split('/').at(-1), namespace: 'mock' }));
    build.onLoad({ filter: /.*/, namespace: 'mock' }, args => ({ contents: {
      courseSpeech: `export const speak=(text,options)=>globalThis.__operatorTest.spoken.push({text,options});export const stop=async()=>{globalThis.__operatorTest.stops.push('tts');};`,
      packAudio: `export const stopRecorded=()=>globalThis.__operatorTest.stops.push('recording');`,
      speechFallback: `export const playOperatorFallback=(text,rate,language,done,current)=>new Promise((resolve,reject)=>globalThis.__operatorTest.fallback.push({text,rate,language,done,current,resolve,reject}));`,
    }[args.path] }));
  } }] });
  const mod = { exports: {} }; new Function('module', 'exports', built.outputFiles[0].text)(mod, mod.exports);
  const { speakOperator, stopOperatorSpeech } = mod.exports;
  const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
  let completed = 0;
  for (const [course, locale] of [['en','en-US'],['de','de-DE'],['fr','fr-FR'],['es','es-ES'],['tr','tr-TR'],['ru','ru-RU'],['ar','ar-SA']]) {
    speakOperator('test', locale, course, () => completed++); await flush();
    const opts = spoken.at(-1).options;
    assert.equal(opts.language, locale); assert.equal(opts.voice, undefined);
    assert.equal(opts.pitch, 1); assert.equal(opts.rate, 1);
    opts.onDone(); opts.onDone(); assert.equal(fallback.length, 0);
  }
  assert.equal(completed, 7, 'completion once per successful TTS');
  speakOperator('failed', 'en-US', 'en', () => completed++); await flush();
  spoken.at(-1).options.onError(); spoken.at(-1).options.onStopped(); await flush();
  assert.equal(fallback.length, 1, 'one fallback only after failure');
  fallback.at(-1).done(); fallback.at(-1).resolve(true); await flush();
  assert.equal(completed, 8);
  speakOperator('pending', 'en-US', 'en', () => completed++); await flush();
  spoken.at(-1).options.onError(); await flush();
  const late = fallback.at(-1);
  await stopOperatorSpeech(); assert.equal(late.current(), false, 'late index fetch cannot start a recording after leaving');
  late.done(); late.resolve(false); await flush(); assert.equal(completed, 8);
  speakOperator('cancelled', 'en-US', 'en', () => completed++); await flush();
  const cancelled = spoken.at(-1); await stopOperatorSpeech();
  cancelled.options.onStopped(); await flush(); assert.equal(fallback.length, 2, 'intentional stop never triggers fallback');
  speakOperator('fallback unavailable', 'ar-SA', 'ar', () => completed++); await flush();
  spoken.at(-1).options.onError(); await flush(); fallback.at(-1).reject(new Error('offline')); await flush();
  assert.equal(completed, 9, 'unavailable fallback advances safely');
  speakOperator('old', 'en-US', 'en', () => completed++);
  speakOperator('new', 'en-US', 'en', () => completed++); await flush();
  assert.equal(spoken.at(-1).text, 'new'); assert.ok(!spoken.some(item => item.text === 'old'));
  await stopOperatorSpeech();
  console.log('Operator speech passed: seven device-default locales, normal pitch/rate, fallback-only-on-failure, one completion, cancellation and asynchronous fallback guards.');
})().catch(error => { console.error(error); process.exitCode = 1; });
