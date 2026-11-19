#!/usr/bin/env node
/**
 * Render and bundle offline speech for every core lesson, word-lab item and
 * pronunciation drill across all six languages (`en`, `de`, `fr`, `es`, `ru`, `tr`).
 *
 *   node scripts/content/renderCoreAudio.mjs --workers 8
 *   node scripts/content/renderCoreAudio.mjs --dry-run
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { mp3DurationMs } from './mp3Duration.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve('content-packs');
const audioRoot = path.join(root, 'core-audio');
const bundleDir = path.join(root, 'core-bundles');
const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const arg = (name, fallback) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : fallback; };
const workers = Number(arg('--workers', Math.max(2, Math.min(8, os.cpus().length))));
const chunkSize = Number(arg('--chunk-size', 700));

const bundled = await build({
  stdin: {
    contents: `
      import { RUSSIAN_LESSONS } from './lib/languages/russian';
      import { TURKISH_LESSONS } from './lib/languages/turkish';
      import { NEW_COURSES } from './lib/languages/newCourses';
      import { SENTENCE_LESSONS } from './lib/courseContent';
      import { WORD_LAB_WORDS } from './lib/languages/wordLab';
      import { pronunciationUnits } from './lib/languages/pronunciationCourse';
      export { RUSSIAN_LESSONS, TURKISH_LESSONS, NEW_COURSES, SENTENCE_LESSONS, WORD_LAB_WORDS, pronunciationUnits };
    `,
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
  logLevel: 'silent',
  plugins: [{
    name: 'course-stubs',
    setup(b) {
      b.onResolve({ filter: /^(react-native|@react-native-async-storage\/async-storage|expo.*|@expo\/.*|.*\/supabase)$/ }, a => ({ path: a.path, namespace: 'stub' }));
      b.onLoad({ filter: /.*/, namespace: 'stub' }, ({ path: p }) => {
        if (p === 'react-native') return { contents: "export const Platform = { OS: 'node', select: v => v.default ?? v.native }; export const StyleSheet = { create: s => s }; export const Dimensions = { get: () => ({ width: 390, height: 844 }) }; export const I18nManager = {};" };
        if (p.includes('async-storage')) return { contents: 'const s = { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} }; export default s;' };
        if (p.includes('supabase')) return { contents: 'export const supabase = {};' };
        return { contents: 'export default {};' };
      });
    },
  }],
});

const mod = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);

const LANGUAGES = ['en', 'de', 'fr', 'es', 'ru', 'tr'];
const norm = text => String(text || '').normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();
const byLang = Object.fromEntries(LANGUAGES.map(l => [l, new Map()]));
const add = (lang, raw) => {
  const text = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!text || !byLang[lang]) return;
  const k = norm(text);
  if (!byLang[lang].has(k)) byLang[lang].set(k, text);
};

for (const lesson of mod.SENTENCE_LESSONS) {
  for (const s of lesson.sentences || []) add('en', s.en);
  for (const d of lesson.dialogue || []) add('en', d.text);
  for (const q of lesson.practice || []) add('en', q.prompt);
}
for (const [lang, course] of Object.entries(mod.NEW_COURSES || {})) {
  for (const lesson of course.lessons || []) {
    for (const s of lesson.sentences || []) add(lang, s.text);
    for (const d of lesson.dialogue || []) add(lang, d.text);
  }
}
for (const lesson of mod.RUSSIAN_LESSONS || []) {
  for (const s of lesson.sentences || []) add('ru', s.text);
  for (const d of lesson.dialogue || []) add('ru', d.text);
}
for (const lesson of mod.TURKISH_LESSONS || []) {
  for (const s of lesson.sentences || []) add('tr', s.text);
  for (const d of lesson.dialogue || []) add('tr', d.text);
}
for (const [lang, list] of Object.entries(mod.WORD_LAB_WORDS || {})) {
  for (const w of list || []) {
    add(lang, w.word);
    add(lang, w.text);
    add(lang, w.example);
  }
}
for (const lang of LANGUAGES) {
  for (const unit of mod.pronunciationUnits(lang) || []) {
    for (const ex of unit.examples || []) add(lang, ex.text);
    add(lang, unit.practiceText);
  }
}

const tasks = [];
const perLangLists = {};
for (const lang of LANGUAGES) {
  const list = [...byLang[lang].values()];
  perLangLists[lang] = list;
  for (const text of list) {
    const id = crypto.createHash('sha1').update(`${lang}:${text}`).digest('hex').slice(0, 16);
    tasks.push({
      id: `${lang}-${id}`,
      lang,
      text,
      out: path.join(audioRoot, lang, `${id}.mp3`),
    });
  }
}

console.log(`core audio: ${tasks.length} unique phrases (${LANGUAGES.map(l => `${l}=${perLangLists[l].length}`).join(', ')})`);
if (dryRun) process.exit(0);

const chunks = Array.from({ length: workers }, () => []);
tasks.forEach((task, i) => chunks[i % workers].push(task));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'milo-core-tts-'));
const chunkFiles = chunks.map((chunk, i) => {
  const file = path.join(tmp, `chunk-${i}.json`);
  fs.writeFileSync(file, JSON.stringify(chunk));
  return file;
});
const results = await Promise.all(chunkFiles.map(file => new Promise(resolve => {
  const child = spawn(process.execPath, [path.join(here, 'offlineTtsWorker.mjs'), file], { stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', d => process.stdout.write(d));
  child.stderr.on('data', d => process.stderr.write(d));
  child.on('exit', code => resolve(code ?? 1));
})));
fs.rmSync(tmp, { recursive: true, force: true });

if (results.some(code => code !== 0)) {
  console.error('Some core audio renders failed; aborting bundle step.');
  process.exit(1);
}

fs.mkdirSync(bundleDir, { recursive: true });
const index = { schema: 1, languages: {} };
let totalBundles = 0, totalBytes = 0;

for (const lang of LANGUAGES) {
  const list = perLangLists[lang];
  const entries = [];
  for (let start = 0, part = 0; start < list.length; start += chunkSize, part++) {
    const slice = list.slice(start, start + chunkSize);
    const bundleName = `core-${lang}-${part}.mp3`;
    const buffers = [];
    let offset = 0;
    for (const text of slice) {
      const id = crypto.createHash('sha1').update(`${lang}:${text}`).digest('hex').slice(0, 16);
      const mp3Path = path.join(audioRoot, lang, `${id}.mp3`);
      const mp3 = fs.readFileSync(mp3Path);
      const ms = Math.max(120, Math.round(mp3DurationMs(mp3)));
      entries.push({ text, audio: `milo-segment:${bundleName}?start=${offset}&dur=${ms}` });
      buffers.push(mp3);
      offset += ms;
    }
    const bundle = Buffer.concat(buffers);
    fs.writeFileSync(path.join(bundleDir, bundleName), bundle);
    totalBundles++;
    totalBytes += bundle.length;
    console.log(`${bundleName}: ${slice.length} phrases · ${(bundle.length / 1048576).toFixed(2)} MB · ${(offset / 1000).toFixed(1)} s`);
  }
  index.languages[lang] = entries;
}

fs.writeFileSync(path.join(root, 'core-audio-index.json'), JSON.stringify(index));
console.log(`core-audio-index.json: ${totalBundles} bundles · ${(totalBytes / 1048576).toFixed(1)} MB total`);
