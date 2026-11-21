#!/usr/bin/env node
/**
 * Author/rebuild the Russian Pre-A1 band content in place.
 *
 * The band is content-only: ids, letters, the nine Step fields and everything derived from them are frozen,
 * so a rewrite is a splice, not a regeneration. This script takes a batch file (qa-tmp/prea1_batch*.json),
 * rebuilds the matching step objects inside lib/languages/russianPreA1.ts, and refuses a batch that would
 * move an id, change a `letters` set, or use a shape the gates reject.
 *
 *   node scripts/splice-russian-prea1.cjs --batch <file.json> [--targets <file.json>] [--check]
 *
 * --check  lint + report only, nothing is written (register caps, TARGETS rows, A1 collisions).
 * --targets append curated glossary keys / repair glosses in the TARGETS map (Move 0 of the rebuild).
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BAND = path.join(ROOT, 'lib/languages/russianPreA1.ts');
const A1_FILES = ['russianBeginner/a1Band1.ts', 'russianBeginner/a1Band2.ts'];
const EXPECTED_IDS = ['hello', 'name', 'yes-no', 'i-am', 'numbers-1-10', 'please-thanks', 'this-is', 'i-have', 'family',
  'where-is', 'drinks', 'time', 'places', 'shopping', 'health', 'days', 'people', 'adjectives', 'colors', 'family-more',
  'numbers-teens', 'questions', 'food', 'week', 'home', 'city', 'work', 'review'];
const BASE_COMMIT = 'b63d25f';
const PREPOSITIONS = ['в', 'во', 'на', 'у', 'к', 'ко', 'с', 'со', 'для', 'от', 'до', 'по', 'о', 'об', 'из', 'над', 'под', 'возле', 'около', 'рядом', 'между'];
// A draft is written by hand, so a run of Latin letters inside Persian prose is always a leftover placeholder
// («Где_twóрь?», «more») — never a word the learner can use. Persian text carries no Latin at all.
const LATIN = /[A-Za-z\u00C0-\u024F]{2,}/;
const noLatin = (where, text) => { const hit = LATIN.exec(text ?? ''); if (hit) fail(`${where}: «${hit[0]}» is not a Persian word — a placeholder or a leaked token`); };
const argv = process.argv.slice(2);
const at = (flag) => (argv.includes(flag) ? path.resolve(argv[argv.indexOf(flag) + 1]) : null);
const CHECK = argv.includes('--check');
const batchPath = at('--batch');
const targetsPath = at('--targets');
if (!batchPath && !targetsPath) { process.stderr.write('need --batch <file.json> (optionally --targets <file.json>)\n'); process.exit(1); }

const cp = require('child_process');
const read = (file) => fs.readFileSync(file, 'utf8');
/** The band as it stood before this rebuild: a rewritten step must not smuggle an old sentence back in.
 *  Single-word cards (read/echo lines) are exempt — the alphabet ramp forces the same handful of words. */
function baseLines() {
  try {
    const src = cp.execSync(`git show ${BASE_COMMIT}:lib/languages/russianPreA1.ts`, { cwd: ROOT, encoding: 'utf8' });
    return new Set([...src.matchAll(/p\("([^"]+)"/g)].map((m) => m[1]).map((t) => t.toLowerCase().replace(/[\u0301]/g, '').replace(/ё/g, 'е').replace(/[^а-яё]/g, '')));
  } catch { return null; }
}
const failures = [];
const fail = (message) => { failures.push(message); };
/** Persian text never carries a double quote, but a stray one (or a literal \u escape) breaks the file. */
const esc = (text) => {
  if (/["\\]/.test(text)) fail(`unescaped quote or backslash in: ${text.slice(0, 60)}`);
  if (/\\u/.test(text)) fail(`literal \\u escape in: ${text.slice(0, 60)}`);
  if (/[{}\[\]]/.test(text)) fail(`brace or bracket in: ${text.slice(0, 60)}`);
  return text;
};
const line = (l) => `p("${esc(l[0])}", "${esc(l[1])}", "${esc(l[2])}")`;
// Exactly the fold of the shipped targets(): lowercase, drop the combining acute, keep й and ё as letters.
const tokens = (text) => (text.toLowerCase().replace(/[\u0301]/g, '').match(/[а-яё]+/gu) ?? []);

/** The step object that starts at `from` (a `{ id: "x",`), found by brace counting that skips string literals. */
function span(source, from) {
  let depth = 0;
  for (let i = from; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '"') { i += 1; while (i < source.length && source[i] !== '"') i += source[i] === '\\' ? 2 : 1; continue; }
    if (ch === '{') depth += 1;
    else if (ch === '}') { depth -= 1; if (depth === 0) return [from, i + 1]; }
  }
  return null;
}

const stepSource = (step) => [
  `  { id: "${step.id}", title: "${esc(step.title)}", letters: "${step.letters}", goal: "${esc(step.goal)}",`,
  `    note: "${esc(step.note)}", situationCheck: "${esc(step.situationCheck)}",`,
  `    oral: [`,
  ...step.oral.map((l, i) => `      ${line(l)}${i === 5 ? '' : ','}`),
  `    ],`,
  `    ending: ${line(step.ending)},`,
  `    read: [${step.read.map(line).join(', ')}] }`,
].join('\n');

const source = read(BAND);

// ---------- TARGETS (the word bank that gives every line a real vocabulary row) ----------
let nextSource = source;
const batchEarly = batchPath ? JSON.parse(read(batchPath)) : null;
const spec = targetsPath ? JSON.parse(read(targetsPath)) : {};
// A batch may bring its own few words: the bank grows with the content it has to serve, not before.
const addMap = { ...(spec.add ?? {}), ...(batchEarly.targets ?? {}) };
if (targetsPath || batchEarly?.targets) {
  const body = /const TARGETS: Record<string,string> = \{([\s\S]*?)\};/.exec(source);
  if (!body) fail('TARGETS map not found');
  else {
    const existing = new Function(`return {${body[1]}};`)();
    const fresh = Object.entries(addMap).filter(([key]) => !(key in existing));
    const already = Object.keys(addMap).filter((key) => key in existing);
    const fixes = Object.entries(spec.fix ?? {}).filter(([key, value]) => existing[key] && existing[key] !== value);
    const insert = fresh.map(([key, value]) => `'${key}':'${value}'`).join(', ');
    let patchedBody = body[1].replace(/,?\s*$/, '') + (fresh.length ? `, ${insert}` : '');
    for (const [key, value] of fixes) patchedBody = patchedBody.replace(new RegExp(`'${key}':'[^']*'`), `'${key}':'${value}'`);
    nextSource = source.replace(body[0], `const TARGETS: Record<string,string> = {${patchedBody}};`);
    process.stdout.write(`TARGETS: ${Object.keys(existing).length} keys → ${Object.keys(existing).length + fresh.length}`
      + ` (+${fresh.length} new, ${already.length} already present, ${fixes.length} gloss repaired)\n`);
    if (already.length) process.stdout.write(`  skipped (already taught): ${already.join(', ')}\n`);
  }
}

// ---------- batch lint ----------
const batch = batchEarly;
const targetsMap = new Function(`return {${/const TARGETS: Record<string,string> = \{([\s\S]*?)\};/.exec(nextSource)[1]}};`)();
const baseSet = baseLines();
const kept = [];
const a1Lines = new Set(A1_FILES.flatMap((file) => [...read(path.join(ROOT, 'lib/languages', file)).matchAll(/p\("([^"]+)"/g)].map((m) => m[1])));
const stats = [];
if (batch) {
  for (const step of batch.steps) {
    const start = nextSource.indexOf(`  { id: "${step.id}",`);
    if (start < 0) { fail(`no such step id in the band: ${step.id}`); continue; }
    const found = span(nextSource, start);
    if (!found) { fail(`unbalanced braces for ${step.id}`); continue; }
    const [, to] = found;
    const current = nextSource.slice(start, to);
    const currentLetters = /letters: "([^"]*)"/.exec(current)[1];
    if (step.letters !== currentLetters) fail(`${step.id}: letters changed (${currentLetters} → ${step.letters}) — frozen`);
    if (step.oral.length !== 6) fail(`${step.id}: oral must be 6 lines`);
    if (step.read.length !== 2) fail(`${step.id}: read must be 2 lines`);
        for (const field of ['goal', 'note', 'situationCheck']) if (!step[field] || step[field].length < 20) fail(`${step.id}.${field}: empty or too short`);
    if (!step.title || step.title.length < 8) fail(`${step.id}.title: empty or too short`);
    for (const field of ['title', 'goal', 'situationCheck', 'note']) noLatin(`${step.id}.${field}`, step[field]);
    for (const l of [...step.oral, ...step.read, step.ending]) {
      noLatin(`${step.id}.fa`, l[1]); noLatin(`${step.id}.pronunciation`, l[2]);
      // The course gate refuses a Cyrillic letter inside the transliteration: that field is Persian script
      // only (a `fa` gloss may quote a Russian word, and the shipped band does that five times).
      if (/[А-Яа-яЁё\u0301]/.test(l[2] ?? '')) fail(`${step.id}.pronunciation: «${l[2]}» carries Cyrillic — the guide is Persian script only`);
      if (!(l[2] ?? '').trim()) fail(`${step.id}: «${l[0]}» has no pronunciation guide`);
    }
    if (!step.note.includes('تمرین نوشتن اختیاری')) fail(`${step.id}.note: optional-writing disclaimer missing`);
    const lines = [...step.oral, step.ending, ...step.read]; // the ending is graded too — lint it like a line
    for (const l of lines) {
      const [ru, , pron] = l;
      const toks = tokens(ru);
      if (!toks.length) continue;
      const isRead = step.read.some((r) => r[0] === ru);
      if (!toks.some((t) => t in targetsMap) && !(isRead && toks.length === 1)) fail(`${step.id}: no TARGETS row for «${ru}»`);
      if (toks.some((t) => PREPOSITIONS.includes(t))) fail(`${step.id}: preposition in «${ru}»`);
      // A bare word card may be lowercase; a sentence may not — the studio reads it aloud as a sentence.
      if (/[.!?]$/.test(ru.trim()) && /^[а-яё]/.test(ru.trim())) fail(`${step.id}: «${ru}» is a sentence and must start with a capital letter`);
      if (a1Lines.has(ru)) fail(`${step.id}: line collides with shipped A1: «${ru}»`);
      if (baseSet && baseSet.has(ru.toLowerCase().replace(/[\u0301]/g, '').replace(/[^а-яё]/g, ''))) {
        if (toks.length > 1) fail(`${step.id}: old band line kept verbatim: «${ru}»`);
        else kept.push(`${step.id}:${ru}`);
      }
      // A line of monosyllables needs no mark; anything with a multi-syllable word must show where the stress falls.
      const polysyllabic = (ru.match(/[А-Яа-яё][^\u0301]*[аеёиоуыэюя][^\s]*[аеёиоуыэюя]/gu) ?? []).length;
      // «ё» is always the stressed vowel, so it marks its own word; a polysyllabic line with neither is unmarked.
      if (polysyllabic && !/[\u0301]/.test(ru) && !/ё/i.test(ru)) fail(`${step.id}: no stress mark in «${ru}»`);
      if (!pron) fail(`${step.id}: empty respelling in «${ru}»`);
    }
    // Both reading gates (verify-russian-course, verify-russian-redesign) forbid a read line that uses a
    // letter no earlier step introduced — the one thing about this band that is not content.
    const taughtUpTo = new Set();
    const letterOrder = [...nextSource.matchAll(/^  \{ id: "([^"]+)",[^\n]*letters: "([^"]*)"/gm)];
    for (const [, id, set] of letterOrder) {
      for (const ch of set.toUpperCase()) taughtUpTo.add(ch);
      if (id === step.id) break;
    }
    for (const [ru] of step.read) {
      for (const ch of (ru.toUpperCase().match(/[А-ЯЁ]/g) ?? [])) if (!taughtUpTo.has(ch)) fail(`${step.id}: read line «${ru}» requires untaught ${ch}`);
    }
    const quoted = /«([А-Яа-яЁё][^»]*[?!.])»/.exec(step.situationCheck);
    if (quoted) {
      const norm = (s) => s.toLowerCase().replace(/[\u0301]/g, '').replace(/ё/g, 'е').replace(/[^а-я0-9 ]/g, '').trim();
      const asked = norm(quoted[1]);
      if (asked === norm(step.oral[1][0])) fail(`${step.id}: situation prompt quotes the graded line itself`);
      if (/(кто|что|где|когда|почему|зачем|сколько|како[йая]|кака[яое])/.test(asked) && /^да\b/.test(norm(step.oral[1][0]))) {
        fail(`${step.id}: wh-question graded with «Да, …»`);
      }
    }
    stats.push({ id: step.id, words: lines.map((l) => tokens(l[0]).length), avg: +(lines.reduce((a, l) => a + tokens(l[0]).length, 0) / lines.length).toFixed(2) });
  }
  if (kept.length) process.stdout.write(`  single-word echoes of the old band (words, not sentences): ${kept.join(' ')}\n`);
  for (const s of stats) process.stdout.write(`  ${s.id.padEnd(15)} words/line ${s.avg}  [${s.words.join(',')}]\n`);
}

if (failures.length) {
  process.stderr.write(`refused — ${failures.length} problem(s):\n${failures.map((f) => `  · ${f}`).join('\n')}\n`);
  process.exit(1);
}
if (CHECK) { process.stdout.write(`check passed · ${batch ? batch.steps.length : 0} step(s) linted · nothing written\n`); process.exit(0); }

// ---------- splice ----------
if (batch) {
  for (const step of batch.steps) {
    const start = nextSource.indexOf(`  { id: "${step.id}",`);
    const [, to] = span(nextSource, start);
    nextSource = nextSource.slice(0, start) + stepSource(step) + nextSource.slice(to);
  }
}
const ids = [...nextSource.matchAll(/^  \{ id: "([^"]+)"/gm)].map((m) => m[1]);
if (ids.length !== EXPECTED_IDS.length || ids.join('|') !== EXPECTED_IDS.join('|')) {
  process.stderr.write(`refused — step id order moved (${ids.length} ids)\n`);
  process.exit(1);
}
fs.writeFileSync(BAND, nextSource);
process.stdout.write(`spliced ${batch ? batch.steps.length : 0} step(s)${targetsPath ? ' + TARGETS' : ''} into ${path.relative(ROOT, BAND)} (${ids.length} ids intact)\n`);
