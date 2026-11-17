#!/usr/bin/env node
/**
 * Narration contract audit — German and Russian.
 *
 * Answers three questions, for exactly the two languages this was ordered for:
 *
 *   1. Does every lesson, level and vocabulary screen speak through the same narrator?
 *      (one locale, one pace ladder, one engine path — no screen with a private rate)
 *   2. Do pre-rendered pack recordings and the phone's own voice land on the same tempo at the same pace?
 *      (`recordedPlaybackRate` — the single calibration point)
 *   3. How much spoken material does that cover? Lessons, sentences and lab words are counted from the
 *      shipped course data, not from a hard-coded list.
 *
 * Run: npm run validate:narration     (prints the matrix, exits non-zero on drift)
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = path.join(root, 'node_modules', '.cache');
fs.mkdirSync(cache, { recursive: true });

const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const check = (value, message) => { assert.ok(value, message); checks++; };
let checks = 0;

/* ── 1. the contract itself ───────────────────────────────────────────────────────────────────── */

const narrationBundle = path.join(cache, 'narration-contract.mjs');
await esbuild.build({
  entryPoints: [path.join(root, 'lib/narration.ts')],
  bundle: true, format: 'esm', platform: 'node', outfile: narrationBundle, logLevel: 'silent',
});
const { narrationRate, narrationLocale, narrationLadder, recordedPlaybackRate, narrationLanguageOf, NARRATION_PACES } =
  await import(`file://${narrationBundle}`);

const de = 'de-DE';
const ru = 'ru-RU';

check(narrationLocale('de') === de && narrationLocale('ru') === ru && narrationLocale('fr') === 'fr-FR', 'every course maps to one speech locale');
check(narrationLanguageOf('DE_de') === 'de' && narrationLanguageOf('ru') === 'ru', 'language ids and locales resolve to the same language');
check(narrationRate('xx-XX', 'listen') === 1, 'an unknown language falls back to the engine default instead of throwing');

for (const [label, locale] of [['German', de], ['Russian', ru]]) {
  const ladder = narrationLadder(locale);
  check(NARRATION_PACES.every(pace => typeof ladder[pace] === 'number' && ladder[pace] > 0), `${label}: every pace is defined`);
  check(ladder.slow < ladder.listen && ladder.listen < ladder.normal, `${label}: slow < listen < normal`);
  check(ladder.normal <= ladder.natural, `${label}: «natural» is never slower than «normal»`);
  // This is the harmony the order asked for: a word in the lab is read at exactly the pace of a lesson
  // line, and an example sentence only a touch slower — never with the lab's old private 0.72/0.68.
  check(ladder.word === ladder.listen, `${label}: the word lab reads words at the lesson's listening pace`);
  check(ladder.sentence < ladder.word && ladder.sentence > ladder.slow, `${label}: example sentences stay just under the word pace`);
}

// Recordings must land on the voice's own natural tempo at the language's reference pace.
check(recordedPlaybackRate(de, 1) === 1, 'German recordings play at the pace the lesson asked for');
check(recordedPlaybackRate(ru, 0.78) === 1, 'Russian recordings are calibrated to the voice at its 0.78 pace');
check(recordedPlaybackRate(ru, 1) > 1 && recordedPlaybackRate(de, 0.5) === 0.5, 'recordings and the voice scale together');
check(recordedPlaybackRate(ru, 0) === recordedPlaybackRate(ru, 1) && recordedPlaybackRate(ru, 99) === 1.6
  && recordedPlaybackRate(de, 0.01) === 0.4, 'playback speed stays inside the engine-safe range');

/* ── 2. no screen may talk around the narrator ────────────────────────────────────────────────── */

const engines = ['lib/starterSpeech.ts', 'lib/russianSpeech.ts', 'lib/turkishSpeech.ts'];
for (const file of engines) {
  const source = read(file);
  check(/from '\.\/narration'/.test(source), `${file} takes its recorded tempo from the shared contract`);
  check(/recordedPlaybackRate\(/.test(source), `${file} calibrates recordings through the contract`);
  check(!/rate\s*\/\s*0\.78/.test(source), `${file} no longer divides by a private 0.78`);
}

const stripComments = source => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
check(/Speech\.speak\(/.test(stripComments(read('components/RussianReview.tsx'))) === false, 'Russian review speaks through the same engine as the lesson');
check(/playRussianSpeech\(/.test(read('components/RussianReview.tsx')), 'Russian review uses the Russian narrator');

const surfaces = [
  'components/StarterLesson.tsx',
  'components/StarterLibrary.tsx',
  'components/StarterTopicPractice.tsx',
  'components/StarterReview.tsx',
  'components/StarterLearningStudio.tsx',
  'components/StarterSkillsAssessment.tsx',
  'components/StarterC1Curriculum.tsx',
  'components/StarterA1Checkpoint.tsx',
  'components/StarterB1Scenarios.tsx',
  'components/StarterB2Workshops.tsx',
  'components/StarterB2GrammarLab.tsx',
  'components/StarterBranchConversations.tsx',
  'components/LevelStudioRoutes.tsx',
  'components/RussianLesson.tsx',
  'components/RussianLibrary.tsx',
  'components/RussianReview.tsx',
  'components/WordLab.tsx',
];
for (const file of surfaces) {
  const source = read(file);
  const literal = /play(?:Starter|Russian|Turkish)Speech\([^)]*,\s*\d*\.\d+\s*,/.exec(source);
  check(!literal, `${file} asks for a named pace instead of a private rate${literal ? ` (found ${literal[0].slice(0, 60)})` : ''}`);
  if (/play(?:Starter|Russian|Turkish)Speech\(/.test(source)) {
    check(/from '@\/lib\/narration'/.test(source), `${file} reads its pace from the narrator`);
  }
}

// Parity between the two languages the review asked about: the same kind of screen asks for the same
// named pace in German and in Russian, so the narrator never changes character between them.
for (const [files, pace, label] of [
  [['components/StarterReview.tsx', 'components/RussianReview.tsx'], "'normal'", 'review sentences'],
  [['components/StarterTopicPractice.tsx', 'components/LevelStudioRoutes.tsx'], "'listen'", 'level practice cards'],
  [['components/StarterLesson.tsx', 'components/RussianLesson.tsx'], "'listen'", 'the first read and the auto-read pass'],
  [['components/WordLab.tsx'], "'word'", 'single words in the lab'],
  [['components/WordLab.tsx'], "'sentence'", 'example sentences in the lab'],
]) {
  for (const file of files) {
    check(read(file).includes(pace), `${file} uses the ${label} pace ${pace}`);
  }
}

// The engine is started while the screen paints, so the first tap is not the slow one.
for (const [file, warm] of [
  ['components/StarterLesson.tsx', 'warmStarterSpeech'],
  ['components/StarterLibrary.tsx', 'warmStarterSpeech'],
  ['components/RussianLesson.tsx', 'warmRussianSpeech'],
  ['components/RussianLibrary.tsx', 'warmRussianSpeech'],
  ['components/RussianReview.tsx', 'warmRussianSpeech'],
]) {
  const source = read(file);
  check(new RegExp(`${warm}\\(`).test(source.split('\n').slice(1).join('\n')), `${file} warms the phone voice before the first tap`);
}
check(/language === 'ru' \? warmRussianSpeech\(\) : warmStarterSpeech\(locale\)/.test(read('components/WordLab.tsx'))
  || (/warmRussianSpeech\(\)/.test(read('components/WordLab.tsx')) && /warmStarterSpeech\(locale\)/.test(read('components/WordLab.tsx'))),
  'the word lab warms the voice of the language it is open in');

/* ── 3. how much spoken material this covers ──────────────────────────────────────────────────── */

const auditEntry = path.join(root, 'scripts', '.narration-audit-entry.ts');
fs.writeFileSync(auditEntry, `export { NEW_COURSES } from '../lib/languages/newCourses';
export { RUSSIAN_LESSONS } from '../lib/languages/russian';
export { WORD_LAB_WORDS } from '../lib/languages/wordLab';
`);
const auditBundle = path.join(cache, 'narration-audit.cjs');
await esbuild.build({
  entryPoints: [auditEntry], bundle: true, platform: 'node', format: 'cjs', outfile: auditBundle, logLevel: 'silent',
  define: {
    'process.env.EXPO_PUBLIC_SUPABASE_URL': '"https://audit.invalid"',
    'process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY': '"audit"',
  },
  plugins: [{
    name: 'narration-audit-stubs',
    setup(build) {
      // Course data imports progress storage and media; the audit only needs the lesson text.
      build.onResolve({ filter: /frequency\/[a-z]+\.json$/ }, args => ({ path: path.join(root, 'lib/content/frequency', args.path.split('/').pop()) }));
      build.onResolve({ filter: /^[^./]/ }, args => ({ path: args.path, namespace: 'audit-stub' }));
      build.onResolve({ filter: /\.(png|jpg|jpeg|wav|mp3|m4a)$/ }, args => ({ path: args.path, namespace: 'audit-stub' }));
      build.onLoad({ filter: /.*/, namespace: 'audit-stub' }, args => {
        if (args.path === 'react-native') return { contents: 'module.exports={Platform:{OS:"web"},StyleSheet:{create:v=>v,flatten:v=>v,hairlineWidth:1},Dimensions:{get:()=>({width:390,height:800})},I18nManager:{isRTL:false},Appearance:{getColorScheme:()=>"light"},NativeModules:{},TurboModuleRegistry:{get:()=>null,getEnforcing:()=>null},NativeEventEmitter:class{addListener(){return{remove(){}}}},DeviceEventEmitter:{addListener:()=>({remove(){}})}};', loader: 'js' };
        if (args.path === '@supabase/supabase-js') return { contents: 'const c={auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:null})})})}),functions:{invoke:async()=>({data:null})},storage:{from:()=>({})},channel:()=>({on(){return this},subscribe(){return this}}),removeChannel(){}};module.exports={createClient:()=>c};', loader: 'js' };
        return { contents: 'module.exports={};', loader: 'js' };
      });
    },
  }],
});
const data = await import(`file://${auditBundle}`).then(module => module.default ?? module);
fs.rmSync(auditEntry, { force: true });

const counts = {
  German: {
    lessons: data.NEW_COURSES.de.lessons.length,
    sentences: data.NEW_COURSES.de.lessons.reduce((total, lesson) => total + lesson.sentences.length, 0),
    words: data.WORD_LAB_WORDS.de.length,
  },
  Russian: {
    lessons: data.RUSSIAN_LESSONS.length,
    sentences: data.RUSSIAN_LESSONS.reduce((total, lesson) => total + lesson.sentences.length, 0),
    words: data.WORD_LAB_WORDS.ru.length,
  },
};
for (const [label, value] of Object.entries(counts)) {
  check(value.lessons > 0 && value.sentences >= value.lessons && value.words > 0, `${label}: course, lesson and word-lab material is countable`);
}

/* ── report ───────────────────────────────────────────────────────────────────────────────────── */

const matrix = pace => ['German', 'Russian'].map(label => `${label} ${(narrationRate(label === 'German' ? de : ru, pace) * 100).toFixed(0)}%`).join(' · ');
console.log('Narration contract — one voice, one tempo (device TTS + pre-rendered packs)\n');
console.log('pace      German / Russian          where it is used');
for (const [pace, where] of [
  ['listen', 'first read of a line, level practice, review cards, lab words'],
  ['word', 'a single vocabulary word'],
  ['sentence', 'a vocabulary example sentence'],
  ['normal', 'the «معمولی» replay button'],
  ['slow', 'the «آهسته» replay button'],
  ['natural', 'conversational pace'],
]) console.log(`${pace.padEnd(9)} ${matrix(pace).padEnd(25)} ${where}`);
console.log('\nrecordings: German plays 1:1 with the voice · Russian is calibrated to 0.78 so a recording and the voice share one tempo');
console.log('\nspoken material covered by this narrator:');
for (const [label, value] of Object.entries(counts)) {
  console.log(`  ${label.padEnd(8)} ${String(value.lessons).padStart(4)} lessons · ${String(value.sentences).padStart(5)} sentences · ${String(value.words).padStart(4)} word-lab words`);
}
console.log(`\n${checks} narration checks passed.`);
