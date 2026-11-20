#!/usr/bin/env node
/**
 * Reproducible vocabulary meter for the Russian beginner bands.
 *
 * The single "readiness %" number hid the real gap (docs/RU-PRE-A1-A1-SPEC-ALIGNMENT-FA.md §3),
 * so the size of a band is measured here in plain counts per level:
 *   lessons      — guided lessons in the band
 *   lines        — one sentence per line of dialogue
 *   words/line   — how much new language a line carries
 *   forms        — distinct word forms (stress marks folded, ё → е)
 *   lemmas       — forms after stripping only the endings a beginner band inflects
 *   recycled     — lemmas that show up in at least two lessons (spaced repetition inside the band)
 *
 * Usage: node scripts/measure-russian-lexicon.cjs [--root <checkout>] [--json]
 */
const fs = require('fs');
const path = require('path');
const { build } = require('esbuild');

const argv = process.argv.slice(2);
const rootIndex = argv.indexOf('--root');
const ROOT = rootIndex >= 0 ? path.resolve(argv[rootIndex + 1]) : process.cwd();
const AS_JSON = argv.includes('--json');
const STUB = path.join(ROOT, 'scripts/test-stubs/react-native.js');
if (!fs.existsSync(STUB)) {
  process.stderr.write(`no react-native stub at ${STUB} — point --root at a full checkout\n`);
  process.exit(1);
}

/** Endings a Pre-A1/A1 band produces: verbal, then nominal. Matched longest-first. */
const SUFFIXES = [
  'ываешь', 'иваешь', 'ывайте', 'ивайте', 'уется', 'уешься', 'уемся', 'ается', 'аются', 'яется', 'ваются',
  'ал', 'ял', 'ел', 'ил', 'ул', 'ло', 'ла', 'ли', 'лы', 'ем', 'ет', 'ёет', 'ите', 'им', 'ят', 'ут', 'ют', 'ат', 'ят',
  'ешь', 'ишь', 'уешь', 'иите', 'ей', 'её',
  'ость', 'ата', 'ята', 'ого', 'его', 'ому', 'ему', 'ыми', 'ими', 'ах', 'ях', 'ах',
  'ами', 'ями', 'ов', 'ев', 'ий', 'ый', 'ая', 'яя', 'ое', 'ее', 'ие', 'ой', 'ей',
  'ах', 'ях', 'ам', 'ям', 'ов', 'ев', 'а', 'я', 'ы', 'и', 'у', 'ю', 'о', 'е', 'ь',
].sort((left, right) => right.length - left.length);

const normalize = (word) => word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ё/g, 'е');

/** A deliberately rough stem: one beginner-band ending, never a full morphological analyser. */
function lemma(form) {
  for (const suffix of SUFFIXES) {
    if (form.length - suffix.length >= 3) return form.slice(0, form.length - suffix.length);
  }
  return form;
}

async function load() {
  const result = await build({
    stdin: { contents: "export * from './lib/languages/russian'", resolveDir: ROOT, loader: 'ts' },
    platform: 'node',
    format: 'cjs',
    bundle: true,
    logLevel: 'silent',
    write: false,
    plugins: [{
      name: 'device-stubs',
      setup(api) {
        api.onResolve({ filter: /^(react-native|expo|@expo|@react-native|@react-navigation|@react-native-async-storage)/ }, () => ({ path: STUB }));
        api.onResolve({ filter: /createCourseProgressStore$/ }, () => ({ path: 'device-store', namespace: 'milo' }));
        api.onLoad({ filter: /.*/, namespace: 'milo' }, () => ({
          contents: 'export const createCourseProgressStore=()=>({ getState:()=>({}) });export const Platform={OS:"web",select:v=>v.web??v.default};export default {};',
          loader: 'ts',
        }));
      },
    }],
  });
  const mod = { exports: {} };
  new Function('module', 'exports', result.outputFiles[0].text)(mod, mod.exports);
  return mod.exports;
}

const BANDS = [['Pre-A1', 0], ['A1', 1]];

(async () => {
  const app = await load();
  const rows = [];
  for (const [band, levelId] of BANDS) {
    const lessons = app.RUSSIAN_LESSONS.filter((lesson) => lesson.levelId === levelId);
    const forms = new Set();
    const lessonsPerLemma = new Map();
    let words = 0;
    let lines = 0;
    for (const lesson of lessons) {
      for (const sentence of lesson.sentences) {
        lines += 1;
        const tokens = (sentence.text.match(/[А-Яа-я]+/g) ?? []).map(normalize);
        words += tokens.length;
        for (const lemmaKey of new Set(tokens.map(lemma))) {
          if (!lessonsPerLemma.has(lemmaKey)) lessonsPerLemma.set(lemmaKey, new Set());
          lessonsPerLemma.get(lemmaKey).add(lesson.id);
        }
        for (const token of tokens) forms.add(token);
      }
    }
    const lemmas = lessonsPerLemma.size;
    const recycled = [...lessonsPerLemma.values()].filter((set) => set.size >= 2).length;
    rows.push({
      band,
      lessons: lessons.length,
      lines,
      wordsPerLine: lines ? +(words / lines).toFixed(2) : 0,
      forms: forms.size,
      lemmas,
      recycled,
      recycledPercent: lemmas ? Math.round((recycled / lemmas) * 100) : 0,
    });
  }
  if (AS_JSON) {
    process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
    return;
  }
  process.stdout.write(`root: ${ROOT}\n`);
  for (const row of rows) {
    process.stdout.write(
      `${row.band.padEnd(6)} lessons=${String(row.lessons).padStart(3)} lines=${String(row.lines).padStart(4)}`
      + ` words/line=${String(row.wordsPerLine).padEnd(5)} forms=${String(row.forms).padStart(4)}`
      + ` lemmas=${String(row.lemmas).padStart(4)} recycled=${String(row.recycled).padStart(4)}/${row.lemmas} (${row.recycledPercent}%)\n`,
    );
  }
})().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exit(1);
});
