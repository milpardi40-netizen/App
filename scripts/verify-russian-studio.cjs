#!/usr/bin/env node
// Compiled app content and actual duplex/audio adapters. Only OS events, speakers and disk are faked.
const { build } = require('esbuild');
const assert = require('node:assert/strict');
const flush = () => new Promise((r) => setImmediate(r));
(async () => {
  const subs = new Map(),
    starts = [],
    spoken = [],
    photos = [],
    saved = [],
    disk = new Map();
  const emit = (type, value) => [...(subs.get(type) || [])].forEach((fn) => fn(value));
  let available = true,
    grant = true,
    request = async () => ({ granted: grant }),
    recording = false,
    speech = null,
    abortEnds = true;
  global.mic = {
    isRecognitionAvailable: () => available,
    getPermissionsAsync: async () => ({ granted: grant, canAskAgain: true }),
    requestPermissionsAsync: () => request(),
    addListener(type, fn) {
      if (!subs.has(type)) subs.set(type, new Set());
      subs.get(type).add(fn);
      return { remove: () => subs.get(type).delete(fn) };
    },
    start(options) {
      assert(!recording && !speech, 'microphone overlapped another turn');
      recording = true;
      starts.push(options);
      emit('start');
    },
    abort() {
      recording = false;
      if (abortEnds) emit('end');
    },
  };
  const end = () => {
      recording = false;
      emit('end');
    },
    result = (text, final = true) => emit('result', { isFinal: final, results: [{ transcript: text }] });
  global.stopTTS = async () => {
    speech = null;
  };
  global.tts = async (text, rate, fail, done) => {
    assert(!recording && !speech, 'audible reply overlapped mic');
    speech = { text, fail, done };
    spoken.push(text);
  };
  global.storage = { getItem: async (k) => disk.get(k) ?? null, setItem: async (k, v) => disk.set(k, v) };
  const observers = new Set();
  global.appState = {
    currentState: 'active',
    addEventListener: (_, cb) => {
      observers.add(cb);
      return { remove: () => observers.delete(cb) };
    },
  };
  const activity = (s) => {
    global.appState.currentState = s;
    for (const cb of [...observers]) cb(s);
  };
  const stubs = {
    'react-native': 'export const AppState=globalThis.appState',
    'expo-speech-recognition': 'export const ExpoSpeechRecognitionModule=globalThis.mic',
    './russianSpeech': 'export const playRussianSpeech=globalThis.tts, stopRussianSpeech=globalThis.stopTTS',
    '@react-native-async-storage/async-storage': 'export default globalThis.storage',
  };
  const exports = [
    'languages/russian',
    'languages/russianExchange',
    'languages/russianVoiceExchange',
    'languages/russianShadowRoom',
    'languages/russianGrammar/catalog',
    'languages/russianGrammar/marks',
    'languages/russianGrammar/trails',
    'languages/russianGrammar/verbLesson',
    'russianTurnAudio',
  ];
  const {
    outputFiles: [out],
  } = await build({
    stdin: { contents: exports.map((f) => `export * from './lib/${f}'`).join(';'), resolveDir: process.cwd() },
    bundle: true,
    format: 'cjs',
    platform: 'node',
    write: false,
    plugins: [
      {
        name: 'device',
        setup(b) {
          b.onResolve({ filter: /.*/ }, ({ path }) =>
            stubs[path] || path.endsWith('createCourseProgressStore') ? { path, namespace: 'os' } : undefined,
          );
          b.onLoad({ filter: /.*/, namespace: 'os' }, ({ path }) => ({
            contents: stubs[path] || 'export const createCourseProgressStore=()=>({})',
          }));
        },
      },
    ],
  });
  const mod = { exports: {} };
  new Function('module', 'exports', out.text)(mod, mod.exports);
  const x = mod.exports;
  assert.equal(x.VERB_TRAILS.length, 6);
  assert.equal(x.VERB_TRAILS[0].lemma, 'хотеть');
  for (const t of x.VERB_TRAILS) {
    assert(x.VERBS.some((v) => v.lemma === t.lemma));
    assert.equal(t.rungs.length, 6);
    assert.equal(new Set(t.rungs.map((r) => r.text)).size, 6);
  }
  let bands = 0,
    drills = 0;
  for (const v of x.VERBS)
    for (let b = 0; b < 6; b++) {
      const samples = x.studyExamples(v, b);
      assert(samples.length > 0);
      const voiceCards = x.verbVoiceCards(v, b);
      assert(voiceCards.length && voiceCards.every(card => card.text.includes(' ') && card.fa && x.gapFor(card.text, card.form).includes('____')), `${v.lemma} lacks a contextual voice model at band ${b}`);
      bands++;
      for (const s of samples) {
        assert(s.fa && s.source && x.gapFor(s.text, s.form).includes('____'), `${v.lemma}:${s.text}`);
        const c = x.drillFor(v, s, b);
        assert(c.prompt && c.why && c.answer);
        if (c.write) assert(b === 5 && c.cue.includes('____'));
        else {
          assert(c.choices.length >= 2 && c.choices.includes(c.answer));
          assert.equal(new Set(c.choices.map(x.normalize)).size, c.choices.length);
        }
        drills++;
      }
    }
  const lesson = x.findRussianLesson('ru-pre-14-i-like'),
    verb = x.VERBS.find((v) => v.lemma === 'хотеть');
  assert.equal(x.studyExamples(verb, 0, lesson)[0].source, 'از همین درس');
  // …and that claim must be true for every beginner lesson: a «from this very lesson» example has to
  // contain a real form of the verb it demonstrates. Content is rewritten in place; the index is not.
  {
    const words = (t) => t.toLowerCase().replace(/\u0301/g, '').replace(/ё/g, 'е').split(/[^а-яe]+/).filter(Boolean);
    let cited = 0;
    for (const l of x.RUSSIAN_LESSONS.filter((l) => l.levelId <= 1)) {
      for (const lemma of x.lessonVerbs(l.id)) {
        const v = x.VERBS.find((entry) => entry.lemma === lemma);
        if (!v) continue;
        const first = x.studyExamples(v, l.levelId, l)[0];
        if (!first || first.source !== 'از همین درس') continue;
        cited += 1;
        assert(words(first.text).includes(x.normalize(first.form)), `${l.id}: «${first.text}» does not contain ${first.form}`);
      }
    }
    assert(cited > 0, 'no beginner lesson cites its own verb example at all');
    console.log(`${cited} beginner verb examples verified against their own lesson line`);
  }
  await Promise.all([x.markPractised('хотеть', 0), x.markPractised('читать', 4), x.markPractised('хотеть', 0)]);
  assert.deepEqual(await x.readMarks(), ['хотеть:0', 'читать:4']);
  console.log(
    `PASS six authored spiral trails, ${bands} verb/level views and ${drills} drills; contextual priority and independent durable workshop marks.`,
  );
  const scene = x.exchangeForLesson(lesson),
    p = { starter: 'learner', picks: [] };
  let c;
  const begin = (path = p, replay = path.starter === 'partner') => {
    c = new AbortController();
    return x.runVoiceExchange(
      scene,
      path,
      replay,
      x.russianTurnAudio,
      c.signal,
      (v) => saved.push(v),
      (v) => photos.push(v),
    );
  };
  const done = () => {
    const s = speech;
    assert(s);
    speech = null;
    s.done();
  };
  let job = begin();
  await flush();
  assert(recording);
  assert.deepEqual(spoken, []);
  assert.equal(starts[0].lang, 'ru-RU');
  assert.equal(starts[0].recordingOptions.persist, false);
  result('это мама', false);
  assert.equal(saved.length, 0);
  result('хочешь чай');
  result('чаю');
  await flush();
  assert.equal(saved.length, 0, 'wait for native end');
  end();
  await flush();
  assert.equal(speech.text, 'Да, пожа́луйста. Я люблю́ чай.');
  assert.equal(saved.at(-1).said[0], 'хочешь чай');
  assert(!recording);
  done();
  await flush();
  assert(recording);
  end();
  result('это для тебя это хорошо');
  await flush();
  assert.equal(speech.text, 'Да, о́чень хорошо́. Спаси́бо!');
  done();
  await job;
  assert.equal(starts.length, 2);
  assert.equal(photos.at(-1).phase, 'done');
  assert(x.validExchangePath(scene, saved.at(-1)));
  const count = saved.length;
  job = begin({ starter: 'partner', picks: [] });
  await flush();
  assert.equal(speech.text, scene.opening.text);
  assert(!recording);
  const stale = speech.done;
  done();
  await flush();
  result('я не хочу чай');
  end();
  await flush();
  assert.equal(speech.text, scene.partnerFirst[0].say.text);
  assert.equal(saved.length, count);
  done();
  await flush();
  result('чай или воду');
  end();
  await job;
  assert.equal(photos.at(-1).phase, 'paused');
  assert.equal(saved.length, count);
  // No interim-only commits; no accidental retry loop on silence, denied permission, or unavailable engines.
  job = begin();
  await flush();
  result('чай', false);
  end();
  await assert.rejects(job, /صدای روشنی/);
  assert.equal(saved.length, count);
  grant = false;
  await assert.rejects(begin(), /دسترسی/);
  assert(!recording);
  available = false;
  await assert.rejects(begin(), /در دسترس نیست/);
  available = true;
  let answerPerm;
  request = () =>
    new Promise((r) => {
      answerPerm = r;
    });
  job = begin();
  await flush();
  c.abort();
  answerPerm({ granted: true });
  await assert.rejects(job, /cancelled/);
  assert(!recording);
  // The first-ever permission dialog can background the Activity. Granting it is part
  // of the original tap; only resume a recognizer after the actual foreground event.
  job = begin();
  await flush();
  assert(x.showingRussianPermissionDialog(c.signal));
  activity('background');
  answerPerm({ granted: true });
  await flush();
  assert(!recording);
  activity('active');
  await flush();
  assert(recording && !x.showingRussianPermissionDialog(c.signal));
  c.abort();
  await assert.rejects(job, /cancelled/);
  job = begin();
  await flush();
  activity('background');
  answerPerm({ granted: true });
  await assert.rejects(job, /مکث/);
  activity('active');
  assert(!recording);
  grant = true;
  job = begin({ starter: 'partner', picks: [] });
  await flush();
  c.abort();
  stale();
  await assert.rejects(job, /cancelled/);
  assert(!recording);
  job = begin();
  await flush();
  abortEnds = false;
  c.abort();
  const stopped = assert.rejects(job, /cancelled/);
  const before = starts.length;
  const newer = begin();
  await flush();
  assert.equal(starts.length, before, 'wait for abort end');
  result('чай');
  end();
  await stopped;
  await flush();
  assert.equal(starts.length, before + 1);
  assert.equal(saved.length, count);
  abortEnds = true;
  emit('error', { error: 'network' });
  end();
  await assert.rejects(newer, /شبکه/);
  job = begin({ starter: 'partner', picks: [] });
  await flush();
  speech.fail();
  speech = null;
  await assert.rejects(job, /پخش نشد/);
  assert(!recording);
  assert.equal(saved.length, count);
  const resumed = { starter: 'partner', picks: [0], said: { 0: 'да пожалуйста я люблю чай' } };
  job = begin(resumed, true);
  await flush();
  assert.equal(speech.text, 'Э́то для тебя́. Э́то хорошо́?');
  done();
  await flush();
  result('да очень хорошо спасибо');
  end();
  await flush();
  await job;
  assert.equal(saved.at(-1).said[0], 'да пожалуйста я люблю чай');
  assert.equal(saved.at(-1).picks.length, 2);
  const card = x.verbVoiceCards(verb, 0)[0];
  const answers = [], phases = [], ctrl = new AbortController();
  const guide = x.shadowCards([card, card], 0, x.russianTurnAudio, ctrl.signal, phase => phases.push(phase), line => answers.push(line));
  for (const spokenLine of [card.lemma, card.text, 'Повтори́те предложе́ние.']) {
    await flush(); assert.equal(speech.text, spokenLine); assert(!recording); done();
  }
  await flush(); assert(recording); result('вода', false); assert(!answers.length);
  result('вода'); end(); await flush(); assert.equal(speech.text, card.lemma); assert.deepEqual(answers, ['вода']);
  ctrl.abort(); await assert.rejects(guide); assert(!recording && !speech);
  assert.deepEqual(phases.slice(0,5), ['verb','sentence','prompt','ready','listen']);
  assert(x.reviewLine('Я хочу́ чай.', 'я хочу чай').matched);
  assert(x.reviewLine('Я хочу́ чай.', 'чай хочу я').order);
  assert.deepEqual(x.reviewLine('Я хочу́ чай.', 'я хочу воду'), {missing:['чай'],extra:['воду'],order:false,matched:false});
  console.log(`PASS independent narrator for ${x.VERBS.length} verbs, three sequential prompts, final-only recognition, cancellation and word-level feedback.`);
  for (const list of subs.values()) assert.equal(list.size, 0);
  console.log(
    'PASS two hands-free starters, conditional replies, late/duplicate/interim events, one spoken clarification, silence, permission denial, busy abort drain, background cancellation, TTS error, final stop and path resume.',
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
