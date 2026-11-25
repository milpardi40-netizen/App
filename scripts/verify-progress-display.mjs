#!/usr/bin/env node
/**
 * Progress-display audit — "is the progress actually saved, and does the bar read it?"
 *
 * The level page prints `completed / lessons` and fills a track from the same numbers. That display is
 * only as trustworthy as the read path, so this script drives the real stores in Node with an
 * in-memory device storage and a fake account backend:
 *
 *   1. complete lessons → re-read → the ids are still there (the write reached the device),
 *   2. the level metrics count them, so the bar has something to fill,
 *   3. progress survives a restart (a second module instance reads the same device storage),
 *   4. a slow or dead account backend never leaves the screen at zero (bounded, local-first read).
 *
 * Run: npm run validate:progress
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = path.join(root, 'node_modules', '.cache', 'progress-audit');
fs.mkdirSync(cache, { recursive: true });

let checks = 0;
const problems = [];
function check(condition, message) {
  if (!condition) problems.push(message);
  else checks += 1;
}

/* ── fixtures: device storage + fake account backend ─────────────────────────────────────────── */

process.env.EXPO_PUBLIC_SUPABASE_URL ||= 'https://audit.invalid';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||= 'audit';

const deviceStorage = new Map();
globalThis.__miloDeviceStorage = deviceStorage;

const storageStub = `
const store = globalThis.__miloDeviceStorage;
const api = {
  getItem: async key => (store.has(key) ? store.get(key) : null),
  setItem: async (key, value) => { store.set(key, String(value)); },
  removeItem: async key => { store.delete(key); },
  multiGet: async keys => keys.map(key => [key, store.has(key) ? store.get(key) : null]),
  multiSet: async pairs => { for (const [key, value] of pairs) store.set(key, String(value)); },
  getAllKeys: async () => [...store.keys()],
};
module.exports = api;
module.exports.default = api;
`;

const supabaseStub = `
const mode = () => globalThis.__miloCloudMode || 'offline';
const chain = {
  select: () => chain,
  eq: () => chain,
  maybeSingle: async () => {
    if (mode() === 'hang') return new Promise(() => {});
    return { data: null, error: null };
  },
  upsert: async () => ({ data: null, error: null }),
  update: () => chain,
  insert: async () => ({ data: null, error: null }),
  abortSignal: () => chain,
  then: resolve => resolve({ data: null, error: null }),
};
const client = {
  auth: {
    getSession: async () => {
      if (mode() === 'hang') return new Promise(() => {});
      return { data: { session: null } };
    },
    signInAnonymously: async () => ({ data: { user: null }, error: { message: 'anonymous disabled' } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
  },
  from: () => chain,
  storage: { from: () => ({}) },
  functions: { invoke: async () => ({ data: null }) },
};
module.exports = { createClient: () => client, default: { createClient: () => client } };
`;

const reactNativeStub = `
const noop = () => {};
module.exports = {
  Platform: { get OS() { return globalThis.__miloPlatform ?? 'android'; }, select: options => options.android ?? options.default },
  StyleSheet: { create: value => value, flatten: value => value, hairlineWidth: 1 },
  Dimensions: { get: () => ({ width: 390, height: 800 }) },
  I18nManager: { isRTL: false },
  Appearance: { getColorScheme: () => 'light' },
  NativeModules: {},
  TurboModuleRegistry: { get: () => null, getEnforcing: () => null },
  NativeEventEmitter: class { addListener() { return { remove: noop }; } },
  DeviceEventEmitter: { addListener: () => ({ remove: noop }), emit: noop },
};
`;

const plugins = [{
  name: 'progress-audit-stubs',
  setup(build) {
    const virtual = {
      '@react-native-async-storage/async-storage': storageStub,
      '@supabase/supabase-js': supabaseStub,
      'react-native': reactNativeStub,
    };
    build.onResolve({ filter: /.*/ }, args => {
      if (args.kind === 'entry-point') return null;
      if (!args.path.startsWith('.') && !args.path.startsWith('/') && !args.path.startsWith('node:')) {
        return { path: args.path, namespace: 'audit' };
      }
      return null;
    });
    build.onLoad({ filter: /.*/, namespace: 'audit' }, args => ({
      contents: virtual[args.path] ?? 'module.exports = {};',
      loader: 'js',
    }));
  },
}];

async function bundle(name) {
  const outfile = path.join(cache, `${name}.cjs`);
  await esbuild.build({
    stdin: {
      contents: `
        export { loadCourseSnapshot } from './lib/courseSnapshot';
        export { formatPercent } from './lib/levelProgress';
        export * as profile from './lib/learnerProfile';
        export * as practice from './lib/practiceActivity';
        export * as history from './lib/reviewHistory';
        export * as calendar from './lib/activityCalendar';
        export * as study from './lib/englishStudyState';
        export * as ruSessions from './lib/languages/russianStudyState';
        export * as trSessions from './lib/languages/turkishStudyState';
        export * as chunks from './lib/lessonChunks';
        export { recordObjectiveCheck } from './lib/lessonOutcomes';
        export { saveLevelAssessment } from './lib/levelAssessment';
        export * as english from './lib/courseProgress';
        export * as engine from './lib/englishLearningEngine';
        export * as russian from './lib/languages/russian';
        export * as turkish from './lib/languages/turkish';
        export * as newCourses from './lib/languages/newCourses';
        export * as content from './lib/courseContent';
      `,
      resolveDir: root,
      sourcefile: 'progress-audit-entry.ts',
      loader: 'ts',
    },
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile,
    logLevel: 'silent',
    plugins,
    define: {
      'process.env.EXPO_PUBLIC_SUPABASE_URL': '"https://audit.invalid"',
      'process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY': '"audit"',
      // Test every course irrespective of which scoped APK is building this gate.
      'process.env.EXPO_PUBLIC_LANGUAGE_SCOPE': '"en,ru,tr,de,fr,es"',
      __DEV__: 'false',
    },
    jsx: 'automatic',
  });
  return outfile;
}

/** Load the bundle as a fresh module — the same app code on a new launch, sharing the device storage. */
function launch(outfile) {
  const source = fs.readFileSync(outfile, 'utf8');
  const module = { exports: {} };
  // The audit runs without account credentials; the bundled console notice about that is expected.
  const { error, warn } = console;
  const quiet = (write) => (...args) => {
    if (String(args[0]).includes('[supabase]')) return;
    write(...args);
  };
  console.error = quiet(error);
  console.warn = quiet(warn);
  try {
    new Function('module', 'exports', 'require', '__filename', '__dirname', source)(
      module, module.exports, () => ({}), outfile, path.dirname(outfile),
    );
  } finally {
    console.error = error;
    console.warn = warn;
  }
  return module.exports;
}

async function timed(task) {
  const started = Date.now();
  const value = await task;
  return { value, ms: Date.now() - started };
}

/* ── run the audit ───────────────────────────────────────────────────────────────────────────── */

const outfile = await bundle('progress');
const first = launch(outfile);
const { english, engine, russian, turkish, newCourses, content } = first;

const row = (label, detail) => console.log(`  ${label.padEnd(34)} ${detail}`);
console.log('\nProgress display audit\n');

/* 1 — English course, the level page in the report (lib/courseProgress.ts). */
globalThis.__miloCloudMode = 'offline';

const freshProgress = await english.getCourseProgress();
check(Array.isArray(freshProgress.completedLessonIds), 'English: a fresh device reads a valid progress object');
check(freshProgress.completedLessonIds.length === 0, 'English: a fresh device starts with nothing completed');
row('English fresh device', `${freshProgress.completedLessonIds.length} completed · valid`);

const levels = [...new Set(content.SENTENCE_LESSONS.map(lesson => lesson.levelId))].sort();
const preA1 = content.SENTENCE_LESSONS.filter(lesson => lesson.levelId === levels[0]);
check(preA1.length > 0, 'English: the first level has lessons to measure against');
row('English first level', `${levels[0]} · ${preA1.length} lessons in the shipped curriculum`);

const lesson = preA1[0];
if (lesson) {
  await english.completeSentenceLesson(lesson.id, preA1[1]?.id);
  const after = await english.getCourseProgress();
  check(after.completedLessonIds.includes(lesson.id), 'English: completing a lesson stores its id');
  const metrics = engine.getEnglishLevelMetrics(lesson.levelId, after.completedLessonIds);
  check(metrics.completedLessonCount === 1, 'English: the level metrics count the completed lesson');
  const percent = Math.round((metrics.completedLessonCount / metrics.lessonCount) * 100);
  check(percent > 0, 'English: the level progress bar receives a non-zero width');
  row('English after one lesson', `${metrics.completedLessonCount}/${metrics.lessonCount} lessons · ${percent}% fill`);

  /* 2 — restart: a new app launch must see the same progress. */
  const relaunch = launch(outfile);
  const persisted = await relaunch.english.getCourseProgress();
  check(persisted.completedLessonIds.includes(lesson.id), 'English: progress survives a restart');
  row('English after restart', persisted.completedLessonIds.includes(lesson.id) ? 'completed lesson restored' : 'LOST');

  /* 3 — every level must have something to show once a lesson in it is completed. */
  const lastLevel = levels[levels.length - 1];
  const lastLesson = content.SENTENCE_LESSONS.find(item => item.levelId === lastLevel);
  if (lastLesson) {
    await relaunch.english.completeSentenceLesson(lastLesson.id);
    const all = await relaunch.english.getCourseProgress();
    const perLevel = levels.map(id => {
      const m = engine.getEnglishLevelMetrics(id, all.completedLessonIds);
      return `${id}:${m.completedLessonCount}/${m.lessonCount}`;
    });
    const expected = new Map(levels.map(id => [
      id,
      content.SENTENCE_LESSONS.filter(item => item.levelId === id && all.completedLessonIds.includes(item.id)).length,
    ]));
    check(levels.every(id => engine.getEnglishLevelMetrics(id, all.completedLessonIds).completedLessonCount === expected.get(id)),
      'English: every level counts only its own completed lessons');
    row('English per level', perLevel.join('  '));
  }

  /* 4 — a dead account backend must not hold the screen at zero. */
  globalThis.__miloCloudMode = 'hang';
  const hung = launch(outfile);
  const bounded = await timed(Promise.race([
    hung.english.getCourseProgress(),
    new Promise(resolve => setTimeout(() => resolve('timeout'), 5000)),
  ]));
  const localDuringHang = bounded.value === 'timeout' ? null : bounded.value;
  check(localDuringHang !== null, 'English: the level page reads local progress even when the account backend never answers');
  check(!!localDuringHang && localDuringHang.completedLessonIds.includes(lesson.id),
    'English: the local progress shown during a dead connection is the saved one');
  check(bounded.ms < 3000, 'English: a dead connection resolves quickly instead of blocking the page');
  row('English with dead backend', localDuringHang === null ? `BLOCKED >${bounded.ms}ms` : `${bounded.ms}ms · ${localDuringHang.completedLessonIds.length} completed shown`);
  globalThis.__miloCloudMode = 'offline';
}

/* 5 — the per-language courses (lib/createCourseProgressStore.ts): same round trip in every language. */
const languageCourses = [
  ['Russian', russian.russianProgress, russian.RUSSIAN_LESSONS ?? []],
  ['Turkish', turkish.turkishProgress, turkish.TURKISH_LESSONS ?? []],
  ['German', newCourses.NEW_COURSES?.de?.progress, newCourses.NEW_COURSES?.de?.lessons ?? []],
  ['French', newCourses.NEW_COURSES?.fr?.progress, newCourses.NEW_COURSES?.fr?.lessons ?? []],
  ['Spanish', newCourses.NEW_COURSES?.es?.progress, newCourses.NEW_COURSES?.es?.lessons ?? []],
];

for (const [name, store, lessons] of languageCourses) {
  check(!!store && lessons.length > 0, `${name}: the course exposes a progress store and a curriculum`);
  if (!store || !lessons.length) continue;
  const target = lessons[Math.min(1, lessons.length - 1)];
  await store.completeSentenceLesson(target.id);
  const after = await store.getCourseProgress();
  check(after.completedLessonIds.includes(target.id), `${name}: completing a lesson stores its id`);
  const relaunch = launch(outfile);
  const relaunchStore = {
    Russian: () => relaunch.russian.russianProgress,
    Turkish: () => relaunch.turkish.turkishProgress,
    German: () => relaunch.newCourses.NEW_COURSES.de.progress,
    French: () => relaunch.newCourses.NEW_COURSES.fr.progress,
    Spanish: () => relaunch.newCourses.NEW_COURSES.es.progress,
  }[name]();
  const persisted = await relaunchStore.getCourseProgress();
  check(persisted.completedLessonIds.includes(target.id), `${name}: progress survives a restart`);
  const timedRead = await timed(relaunchStore.getCourseProgress());
  check(timedRead.ms < 300, `${name}: the level page reads its progress from the device (no network wait)`);
  const level = target.levelId;
  const inLevel = lessons.filter(item => item.levelId === level).length;
  const doneInLevel = lessons.filter(item => item.levelId === level && persisted.completedLessonIds.includes(item.id)).length;
  check(doneInLevel > 0 && inLevel > 0, `${name}: the level page can show a non-zero progress line`);
  row(`${name} after restart`, `${timedRead.ms}ms · level ${level} ${doneInLevel}/${inLevel}`);
}

// Drive the same view model as the map and profile, not a test-only count of IDs.
const must = Object.fromEntries(['equal','ok','notEqual','deepEqual'].map(key => [key,(...args) => { assert[key](...args); checks++; }]));
for (const os of ['android', 'web']) {
  deviceStorage.clear(); globalThis.__miloPlatform = os;
  const webStorage = new Map();
  globalThis.window = { localStorage: { getItem: k => webStorage.get(k) ?? null, setItem: (k,v) => webStorage.set(k, String(v)), removeItem: k => webStorage.delete(k) } };
  const app = launch(outfile);
  const today = app.history.localDay(), yesterday = app.calendar.dayOffset(today, -1);
  const ready = await app.profile.loadLearnerProfileSummary();
  must.equal(ready.activeLanguages, 0); must.equal(ready.reviewsDone, 0); must.equal(ready.languages.length, 6);
  const suites = [
    ['en', app.english, app.study.saveLessonSession], ['ru', app.russian.russianProgress, app.ruSessions.saveRussianLessonSession],
    ['tr', app.turkish.turkishProgress, app.trSessions.saveTurkishLessonSession],
    ...['de', 'fr', 'es'].map(id => [id, app.newCourses.NEW_COURSES[id].progress, app.newCourses.NEW_COURSES[id].sessions.saveStarterLessonSession]),
  ];
  for (const [id, store, save] of suites) {
    let snap = await app.loadCourseSnapshot(id);
    must.equal(snap.course.completed, 0); must.equal(snap.course.percent, 0);
    must.equal(snap.levelDefinitions.length, 6);
    const a = snap.lessons[0], c1 = snap.lessons.find(l => l.levelId === 5);
    const intro = { stageVersion: 2, stage: 0, sentenceIndex: 0, revealed: false, answers: {}, showCheckAnswers: false, evidencePassed: false };
    await save(a.id, intro); must.equal((await app.loadCourseSnapshot(id)).course.percent, 0);
    await save(a.id, { ...intro, stage: 1, sentenceIndex: 1 });
    snap = await app.loadCourseSnapshot(id);
    const t = snap.levels[a.levelId];
    must.equal(t.completed, 0); must.equal(t.partial, 1);
    must.ok(Math.abs(t.percent - 100 * (1 + 1/a.sentences.length) / (9 * t.total)) < 1e-9);
    must.notEqual(app.formatPercent(t.percent), '۰٪');
    await save(c1.id, { ...intro, stage: 8 });
    const restored = await launch(outfile).loadCourseSnapshot(id);
    must.equal(restored.sessions[c1.id].stage, 8); must.equal(restored.current.id, c1.id); must.equal(restored.levels[5].partial, 1);
    await store.completeSentenceLesson(a.id); await store.completeSentenceLesson(a.id); // replay
    snap = await app.loadCourseSnapshot(id); must.equal(snap.course.completed, 1); must.equal(snap.course.partial, 1);
    must.equal(snap.validCards.length, a.sentences.length);
    // Both writes must survive, including a lapse. Adding due cards is not a performed review.
    await Promise.all([store.rateReviewCard(snap.validCards[0].id, 'good'), store.rateReviewCard(snap.validCards[0].id, 'again')]);
    snap = await app.loadCourseSnapshot(id);
    const card = snap.validCards[0]; must.equal(card.repetitions, 0); must.equal(app.history.datedRatings(app.history.ratingsOf(card))[today], 2);
    const due = snap.validCards.filter(c => Date.parse(c.dueAt) <= Date.now()).length; must.equal(due, a.sentences.length - 1);
    await app.practice.addPracticeActivity(id, today, { spoken: 2, scoreSum: 110 });
    await app.recordObjectiveCheck(id, 'test-only', 1, 2);
    if (id !== 'en') { await app.practice.addPracticeActivity(id, yesterday, { ms: 60000 }); await app.saveLevelAssessment(id, 5, 75); }
    else { await app.study.addStudyTime(today, 6000); await app.study.addStudyTime(today, 4000); }
  }
  const p = await launch(outfile).profile.loadLearnerProfileSummary();
  must.deepEqual(p.unavailable, []); must.equal(p.activeLanguages, 6); must.equal(p.completedLessons, 6);
  must.equal(p.reviewsDone, 12); must.equal(p.reviewLowerBound, false);
  must.equal(p.currentStreak, 2); must.equal(p.week.at(-1).reviews, 12);
  must.ok(Math.abs(p.totalMinutes - (5 + 1/6)) < 1e-6); must.equal(p.todayMinutes, 1/6);
  for (const l of p.languages) {
    must.equal(l.partial, 1); must.equal(l.completedLessons, 1); must.equal(l.speaking.average, 55); must.equal(l.speaking.drillAverage, null);
    must.equal(l.assessment.answered, 2); must.equal(l.assessment.correct, 1);
    must.equal(l.levels[5].exam?.last ?? null, l.id === 'en' ? null : 75);
  }
  const long = app.content.SENTENCE_LESSONS.find(l => l.sentences.length >= 30);
  await app.chunks.markChunkDone(long.id, 1); await app.chunks.markChunkDone(long.id, 1);
  const chunked = await app.loadCourseSnapshot('en'); must.equal(chunked.course.partial, 2);
  // One malformed individual position must not erase a second valid one or the completion store.
  const disk = os === 'web' ? webStorage : deviceStorage, key = app.ruSessions.RUSSIAN_STUDY_STORAGE_KEY;
  const bad = JSON.parse(disk.get(key)); bad.sessions[app.russian.RUSSIAN_LESSONS[1].id] = {stage:'invalid'}; disk.set(key, JSON.stringify(bad));
  const damaged = await app.loadCourseSnapshot('ru'); must.equal(damaged.unreadable, true); must.equal(damaged.course.completed, 1); must.equal(damaged.course.partial, 1);
  // Offline devices rate the same card on the same day: union distinct ratings, don't count a backup twice.
  const seed = { repetitions: 0, lapses: 0 }, otherProcess = launch(outfile);
  const a = { ...seed, ratingHistory: app.history.addRating(seed, new Date()) }, b = { ...seed, ratingHistory: otherProcess.history.addRating(seed, new Date()) };
  const merged = app.history.withMergedRatings(a,b); must.equal(app.history.datedRatings(merged.ratingHistory)[today],2);
  must.deepEqual(app.history.withMergedRatings(merged,a),merged);
  const legacy = app.history.ratingsOf({ repetitions: 2, lapses: 1, lastReviewedAt: new Date().toISOString() });
  must.equal(legacy.lowerBound, true); must.equal(legacy.undated, 2);
  row(`${os}: six live profiles`, `${p.completedLessons} complete · 6 partial · ${p.reviewsDone} actual ratings · ${p.currentStreak} dated days`);
}

if (problems.length) {
  console.error('\n✖ Progress display audit failed:');
  for (const problem of problems) console.error(`  · ${problem}`);
  console.error(`\n${checks} checks passed, ${problems.length} failed.\n`);
  process.exit(1);
}

console.log(`\n✔ Progress is written to the device, survives a restart, and is displayed without waiting for the account backend (${checks} checks).\n`);
