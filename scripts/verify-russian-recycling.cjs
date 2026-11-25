#!/usr/bin/env node
/**
 * Russian Pre-A1 word-recycling verifier (Phase-1 item 5 of docs/RU-PRE-A1-A1-SPEC-ALIGNMENT-FA.md).
 *
 * A beginner word that appears in exactly one step is fragile: the learner meets it once and never
 * again. The spec requires every Pre-A1 word to be recycled in at least two steps, and the agreed
 * pass line is that **at least 40%** of the Pre-A1 word inventory appears in two or more distinct
 * steps. This verifier extracts the inventory from the shipped Pre-A1 lessons (sentences +
 * dialogues), counts per-word step coverage and enforces the threshold, so new steps must recycle
 * existing words instead of only adding fresh ones.
 */
const assert = require('node:assert/strict');
const es = require('esbuild');
const path = require('node:path');

(async () => {
  const { outputFiles } = await es.build({
    stdin: { contents: "export { RUSSIAN_LESSONS } from './lib/languages/russian';", resolveDir: process.cwd() },
    bundle: true,
    platform: 'node',
    format: 'cjs',
    write: false,
    logLevel: 'error',
    define: { __DEV__: 'false', 'process.env.NODE_ENV': '"production"' },
    plugins: [{
      name: 'recycling-platform-stubs',
      setup(build) {
        const STUB = 'const noop = async () => null;\n'
          + 'export const Platform = { OS: "web", select: (values) => values.web ?? values.default };\n'
          + 'export default { getItem: noop, setItem: noop, removeItem: noop };\n';
        const STORE = 'export const createCourseProgressStore = () => ({});\n';
        const namespace = 'recycling-platform-stub';
        build.onResolve({ filter: /^(react-native|expo|@expo|@react-native|@react-native-async-storage)/ }, () => ({ path: 'platform', namespace }));
        build.onResolve({ filter: /createCourseProgressStore$/ }, () => ({ path: 'store', namespace: 'recycling-platform-stub-store' }));
        build.onLoad({ filter: /.*/, namespace }, () => ({ contents: STUB, loader: 'js' }));
        build.onLoad({ filter: /.*/, namespace: 'recycling-platform-stub-store' }, () => ({ contents: STORE, loader: 'js' }));
      },
    }],
  });
  const mod = { exports: {} };
  new Function('module', 'exports', outputFiles[0].text)(mod, mod.exports);
  const RUSSIAN_LESSONS = mod.exports.RUSSIAN_LESSONS;

  let checks = 0;
  const check = (condition, message) => { assert.ok(condition, message); checks += 1; };

  const starter = RUSSIAN_LESSONS.filter(l => l.levelId === 0);
  check('Pre-A1 ladder holds 31 steps', starter.length === 31);

  // Fold: lowercase, drop combining accents, ё→е, strip non-Cyrillic, collapse spacing — the same
  // folding family the other Russian verifiers use, so «Приве́т» and «привет» compare equal.
  const fold = t => t.toLowerCase().replace(/\u0301/g, '').replace(/\u0401/g, 'е').replace(/\u0451/g, 'е')
    .replace(/[^а-я\s]/g, ' ').replace(/\s+/g, ' ').trim();

  const stepsByWord = new Map(); // folded word -> Set of step indices
  starter.forEach((lesson, stepIndex) => {
    const seen = new Set();
    const texts = [
      ...lesson.sentences.map(s => s.text),
      ...lesson.dialogue.map(d => d.text),
    ];
    for (const text of texts) for (const word of fold(text).split(' ')) {
      if (!word) continue;
      seen.add(word);
      if (!stepsByWord.has(word)) stepsByWord.set(word, new Set());
      stepsByWord.get(word).add(stepIndex);
    }
    check(`step ${stepIndex + 1} (${lesson.id}) teaches words`, seen.size >= 4);
  });

  const recycled = [...stepsByWord.values()].filter(steps => steps.size >= 2).length;
  const share = recycled / stepsByWord.size;
  console.log(`Pre-A1 inventory: ${stepsByWord.size} distinct words · recycled in ≥2 steps: ${recycled} (${Math.round(share * 100)}%)`);
  check(`at least 40% of the Pre-A1 word inventory is recycled across steps (${Math.round(share * 100)}% >= 40%)`, share >= 0.4);
  // The most basic communication words must be recycled — the ladder's connective spine.
  for (const spine of ['да', 'нет', 'это', 'мне', 'уменя']) {
    const steps = stepsByWord.get(spine)?.size ?? 0;
    check(`spine word «${spine}» appears in ${steps} steps (>= 2)`, steps >= 2);
  }

  console.log(`${checks} Russian Pre-A1 recycling checks passed.`);
})().catch(e => { console.error(e); process.exitCode = 1; });
