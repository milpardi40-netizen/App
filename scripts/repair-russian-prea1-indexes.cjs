#!/usr/bin/env node
/**
 * Keep the Pre-A1 word bank and the verb-example index honest after a content rewrite.
 *
 * 1. TARGETS is the level's glossary: a key no line of the band uses is dropped, so the bank is exactly the
 *    vocabulary this level teaches (the same 150-family ceiling COURSE_SPEC puts on the band).
 * 2. `verbs.generated.json` maps lesson → (sentence address, verb form). That index is built from a snapshot
 *    of the course, so a rewritten line leaves a pointer at a sentence that no longer carries the form; the
 *    verb workshop then cannot claim the example is «from this very lesson». Each stale pointer is moved to a
 *    line that really contains a form of the verb, or removed when the lesson stopped teaching it.
 *
 * Usage: node scripts/repair-russian-prea1-indexes.cjs [--check]
 */
const fs = require('fs');
const path = require('path');
const { build } = require('esbuild');

const ROOT = process.cwd();
const CHECK = process.argv.includes('--check');
const BAND = path.join(ROOT, 'lib/languages/russianPreA1.ts');
const INDEX = path.join(ROOT, 'lib/languages/russianGrammar/verbs.generated.json');
const STUB = path.join(ROOT, 'scripts/test-stubs/react-native.js');

const norm = (s) => s.trim().toLowerCase().replace(/[\u0301]/g, '').replace(/ё/g, 'е').replace(/ي/g, 'ی').replace(/ك/g, 'ک');
const targetsFold = (s) => s.toLowerCase().replace(/[\u0301]/g, '');
const bandTokens = (s) => targetsFold(s).match(/[а-яё]+/gu) ?? []; // mirrors the shipped targets() — ё stays a letter
const tokens = (s) => s.match(/[а-яё\u0301]+(?:-[а-яё\u0301]+)*/giu)?.map(norm) ?? [];

(async () => {
  const band = fs.readFileSync(BAND, 'utf8');
  const result = await build({
    stdin: { contents: `export { RUSSIAN_STARTER_STEPS } from ${JSON.stringify(BAND)};`, resolveDir: ROOT, loader: 'ts' },
    platform: 'node', format: 'cjs', bundle: true, logLevel: 'silent', write: false,
    plugins: [{ name: 'stubs', setup(api) {
      api.onResolve({ filter: /^(react-native|expo|@expo|@react-native|@react-navigation|@react-native-async-storage)/ }, () => ({ path: STUB }));
      api.onResolve({ filter: /checkOrder$/ }, () => ({ path: path.join(ROOT, 'lib/languages/russianBeginner/checkOrder.ts') }));
    } }],
  });
  const mod = { exports: {} };
  new Function('module', 'exports', result.outputFiles[0].text)(mod, mod.exports);
  const steps = mod.exports.RUSSIAN_STARTER_STEPS;

  // ---------- 1. TARGETS prune ----------
  const body = /const TARGETS: Record<string,string> = \{([\s\S]*?)\};/.exec(band);
  const map = new Function(`return {${body[1]}};`)();
  const used = new Set(steps.flatMap((s) => [...s.oral, s.ending, ...s.read].flatMap((l) => bandTokens(l.text))));
  const keys = Object.keys(map);
  const unused = keys.filter((k) => !used.has(k));
  const kept = keys.filter((k) => used.has(k));
  process.stdout.write(`TARGETS: ${keys.length} → ${kept.length} keys (dropped ${unused.length} never used in the band)\n`);
  if (unused.length) process.stdout.write(`  dropped: ${unused.join(', ')}\n`);
  if (!CHECK && unused.length) {
    const rebuilt = kept.map((k) => `'${k}':'${map[k].replace(/'/g, "\\'")}'`).join(', ');
    fs.writeFileSync(BAND, band.replace(body[0], `const TARGETS: Record<string,string> = {${rebuilt}};`));
    process.stdout.write('  written\n');
  }

  // ---------- 2. verb references ----------
  const index = JSON.parse(fs.readFileSync(INDEX, 'utf8'));
  const formsByLemma = new Map(index.verbs.map((v) => [v.lemma, new Set(v.forms.map(norm))]));
  let moved = 0, removed = 0, ok = 0;
  for (const [lessonId, perLemma] of Object.entries(index.references)) {
    const step = steps.find((s) => `ru-pre-${s.id}` === lessonId);
    if (!step) continue; // only the rewritten band is authoritative here
    // Exactly the two addresses the lesson exposes: sentences are [oral…, read…] and dialogue is the
    // five-line conversation the studio plays.
    const sentences = [...step.oral, ...step.read];
    const dialogue = [step.oral[0], step.oral[1], step.oral[2], step.oral[5], step.ending];
    const lines = sentences.map((l, i) => ({ id: `ru-pre-${step.id}-${String(i + 1).padStart(2, '0')}`, text: l.text }))
      .concat(dialogue.map((l, i) => ({ id: `d:${i}`, text: l.text })));
    const resolve = (key) => key.startsWith('d:') ? dialogue[Number(key.slice(2))]?.text
      : sentences[Number(key.slice(-2)) - 1]?.text;
    for (const [lemma, ref] of Object.entries(perLemma)) {
      const [key, form] = ref;
      const target = resolve(key);
      if (target && tokens(target).includes(norm(form))) { ok += 1; continue; }
      const want = formsByLemma.get(lemma);
      const found = want && lines.find((l) => tokens(l.text).some((t) => want.has(t)));
      if (found) {
        const surface = tokens(found.text).find((t) => want.has(t));
        const realForm = found.text.match(/[А-Яа-яё\u0301-]+/gu).find((w) => norm(w) === surface);
        perLemma[lemma] = [found.id, realForm];
        moved += 1;
        process.stdout.write(`  ${lessonId} · ${lemma}: → ${found.id} «${found.text}» (${realForm})\n`);
      } else {
        delete perLemma[lemma];
        removed += 1;
        process.stdout.write(`  ${lessonId} · ${lemma}: removed (no line of the lesson carries a form of it)\n`);
      }
    }
    if (!Object.keys(perLemma).length) delete index.references[lessonId];
  }
  process.stdout.write(`verb references of the band: ${ok} still valid · ${moved} moved · ${removed} removed\n`);
  if (!CHECK && (moved || removed)) fs.writeFileSync(INDEX, `${JSON.stringify(index, null, 1)}\n`);
})().catch((e) => { process.stderr.write(`${e.stack ?? e.message}\n`); process.exit(1); });
