#!/usr/bin/env node
/**
 * Difficulty meter for the Russian Pre-A1 band (level 0).
 *
 * The band was rebuilt to start from single words, so "readiness %" says nothing about it. These are
 * the counts the rewrite is judged on, per batch of steps and for the whole band:
 *   lines           — oral + ending + read lines (9 per step): the closing line is graded too
 *   words/line      — mean + median + share of lines at 1–2 words  (register cap: mean ≤1.8, median 1, ≥80%)
 *   rows            — lines that get at least one real TARGETS row (cap: 100%)
 *   new stems/step  — first-time word stems per step (cap: ≤4)
 *   hapax           — stems used in exactly one step (cap: ≤12%)
 *   stress          — share of lines / words carrying a stress mark (caps: ≥95% / ≥75%)
 *   prepositions    — lines using a preposition, banned in this band (cap: 0)
 *   A1 collisions   — lines identical to a shipped A1 line (cap: 0)
 *
 * Usage: node scripts/measure-russian-prea1.cjs [--steps <file.ts>] [--targets <file.ts>] [--json]
 *   --steps  a file exporting RUSSIAN_STARTER_STEPS (default: lib/languages/russianPreA1.ts)
 *   --targets a file holding the TARGETS map to score rows against (default: the live band)
 *   --only    comma-separated step ids to measure (default: the whole band)
 */
const fs = require('fs');
const path = require('path');
const { build } = require('esbuild');

const argv = process.argv.slice(2);
const at = (flag) => (argv.includes(flag) ? path.resolve(argv[argv.indexOf(flag) + 1]) : null);
const AS_JSON = argv.includes('--json');
const ROOT = process.cwd();
const STEPS_SRC = at('--steps') ?? path.join(ROOT, 'lib/languages/russianPreA1.ts');
// --only hello,name restricts every count to a batch: the band average only reaches the caps after all six moves.
const ONLY = argv.includes('--only') ? argv[argv.indexOf('--only') + 1].split(',') : null;
const TARGETS_SRC = at('--targets') ?? path.join(ROOT, 'lib/languages/russianPreA1.ts');
const STUB = path.join(ROOT, 'scripts/test-stubs/react-native.js');

// Same fold as the shipped targets(): accents off, ё kept — so a row is counted exactly as the app counts it.
const fold = (word) => word.toLowerCase().replace(/[\u0301]/g, '');
const tokens = (text) => (fold(text).match(/[а-яё]+/gu) ?? []);
const rawWords = (text) => text.match(/[А-Яа-яё\u0301]+/gu) ?? [];
const SUFFIXES = ['ываешь', 'иваешь', 'ала', 'яла', 'уешь', 'ишь', 'ешь', 'ает', 'ют', 'ут', 'ят', 'ем', 'ет', 'ите', 'им',
  'ого', 'его', 'ому', 'ему', 'ыми', 'ями', 'ах', 'ях', 'ам', 'ям', 'ов', 'ев', 'ая', 'яя', 'ое', 'ее', 'ий', 'ый', 'ой',
  'а', 'я', 'ы', 'и', 'у', 'ю', 'о', 'е', 'ь'].sort((l, r) => r.length - l.length);
const stem = (form) => {
  for (const s of SUFFIXES) if (form.length - s.length >= 3) return form.slice(0, form.length - s.length);
  return form;
};
/** Banned in Pre-A1: a line is either a word, «Это X», «Я хочу X» or «Где X?». */
const PREPOSITIONS = ['в', 'во', 'на', 'у', 'к', 'ко', 'с', 'со', 'для', 'от', 'до', 'по', 'о', 'об', 'из', 'над', 'под', 'возле', 'около', 'рядом', 'между']; // the same list the splice linter refuses

/** The TARGETS map is module-private; read the shipped one so the row count matches the app exactly. */
function shippedTargets() {
  const source = fs.readFileSync(TARGETS_SRC, 'utf8');
  const body = /const TARGETS: Record<string,string> = \{([\s\S]*?)\};/.exec(source);
  if (!body) throw new Error('TARGETS map not found in russianPreA1.ts');
  return new Function(`return {${body[1]}};`)();
}

async function loadSteps() {
  const result = await build({
    stdin: { contents: `export { RUSSIAN_STARTER_STEPS } from ${JSON.stringify(STEPS_SRC)};`, resolveDir: ROOT, loader: 'ts' },
    platform: 'node', format: 'cjs', bundle: true, logLevel: 'silent', write: false,
    plugins: [{ name: 'device-stubs', setup(api) {
      api.onResolve({ filter: /^(react-native|expo|@expo|@react-native|@react-navigation|@react-native-async-storage)/ }, () => ({ path: STUB }));
      api.onResolve({ filter: /checkOrder$/ }, () => ({ path: path.join(ROOT, 'lib/languages/russianBeginner/checkOrder.ts') }));
    } }],
  });
  const mod = { exports: {} };
  new Function('module', 'exports', result.outputFiles[0].text)(mod, mod.exports);
  return mod.exports.RUSSIAN_STARTER_STEPS;
}

(async () => {
  let steps = await loadSteps();
  if (ONLY) steps = steps.filter((step) => ONLY.includes(step.id));
  const targets = shippedTargets();
  const a1Lines = new Set();
  for (const file of ['russianBeginner/a1Band1.ts', 'russianBeginner/a1Band2.ts']) {
    const source = fs.readFileSync(path.join(ROOT, 'lib/languages', file), 'utf8');
    for (const m of source.matchAll(/p\("([^"]+)"/g)) a1Lines.add(m[1]);
  }
  const lines = steps.flatMap((step) => [...step.oral, step.ending, ...step.read]);
  const counts = lines.map((line) => tokens(line.text).length);
  const sorted = [...counts].sort((a, b) => a - b);
  const median = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  const realRows = lines.filter((line) => tokens(line.text).some((token) => token in targets)).length;
  // A line made only of monosyllables has no stress to mark; counting it as "unmarked" would hide the real gaps.
  const needsStress = (text) => rawWords(text).some((word) => (word.match(/[аеёиоуыэюя]/gi) ?? []).length > 1);
  const stressable = lines.filter((line) => needsStress(line.text));
  // «ё» is always the stressed vowel, so it marks a word the same way the combining acute does.
  const markedStress = (text) => /[\u0301]/.test(text) || /ё/i.test(text);
  const stressed = stressable.filter((line) => markedStress(line.text)).length;
  const wordsAll = lines.flatMap((line) => rawWords(line.text)).filter((word) => (word.match(/[аеёиоуыэюя]/gi) ?? []).length > 1);
  const stressedWords = wordsAll.filter((word) => markedStress(word)).length;
  const prepLines = lines.filter((line) => tokens(line.text).some((token) => PREPOSITIONS.includes(token)));
  const collisions = lines.filter((line) => a1Lines.has(line.text)).length;
  const stemsByStep = [];
  const seen = new Set();
  const stepOf = new Map();
  steps.forEach((step, index) => {
    const fresh = new Set();
    for (const line of [...step.oral, step.ending, ...step.read]) {
      for (const token of new Set(tokens(line.text))) {
        const key = stem(token);
        if (!stepOf.has(key)) stepOf.set(key, new Set());
        stepOf.get(key).add(index);
        if (!seen.has(key)) { seen.add(key); fresh.add(key); }
      }
    }
    stemsByStep.push(fresh.size);
  });
  const once = [...stepOf.values()].filter((set) => set.size === 1).length;
  const out = {
    steps: steps.length,
    lines: lines.length,
    wordsPerLine: +(counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(2),
    medianWords: median,
    shareShort: Math.round((counts.filter((c) => c <= 2).length / counts.length) * 100),
    realRows: `${realRows}/${lines.length} (${Math.round((realRows / lines.length) * 100)}%)`,
    targetsKeys: Object.keys(targets).length,
    newStemsMean: +(stemsByStep.reduce((a, b) => a + b, 0) / stemsByStep.length).toFixed(2),
    newStemsWorst: Math.max(...stemsByStep),
    stemsTotal: seen.size,
    hapaxPercent: Math.round((once / seen.size) * 100),
    stressLines: `${stressed}/${stressable.length} (${Math.round((stressed / stressable.length) * 100)}%)`, 
    stressWords: `${stressedWords}/${wordsAll.length} (${Math.round((stressedWords / wordsAll.length) * 100)}%)`,
    prepositionLines: prepLines.length,
    a1Collisions: collisions,
    perStep: steps.map((step, index) => ({ id: step.id, letters: step.letters, words: counts.slice(index * 9, index * 9 + 9).join(','), newStems: stemsByStep[index] })),
  };
  if (AS_JSON) { process.stdout.write(`${JSON.stringify(out, null, 2)}\n`); return; }
  const { perStep, ...head } = out;
  for (const [key, value] of Object.entries(head)) process.stdout.write(`${key}: ${value}\n`);
  process.stdout.write(`\nper step (words/line, new stems):\n`);
  for (const row of perStep) process.stdout.write(`  ${row.id.padEnd(15)} ${row.letters.padEnd(4)} ${row.words.padEnd(22)} +${row.newStems}\n`);
})().catch((error) => { process.stderr.write(`${error.stack ?? error.message}\n`); process.exit(1); });
