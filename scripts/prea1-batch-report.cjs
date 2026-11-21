#!/usr/bin/env node
/**
 * Before/after table for one Pre-A1 rebuild batch.
 *
 * The review unit the user asked for is a step: every line of the old step, in Russian and Persian, next to
 * the new one. The "before" side is read from the commit the rebuild started from, so it cannot drift as the
 * band is rewritten.
 *
 * Usage: node scripts/prea1-batch-report.cjs [--ids a,b,c] [--format md|text]
 */
const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const { build } = require('esbuild');

const ROOT = process.cwd();
const BASE = 'b63d25f';
const argv = process.argv.slice(2);
const at = (flag) => (argv.includes(flag) ? argv[argv.indexOf(flag) + 1] : null);
const FORMAT = at('--format') ?? 'md';
const BAND = 'lib/languages/russianPreA1.ts';

const load = async (source, name) => {
  const file = path.join(ROOT, 'lib/languages', `.qa-${name}.ts`);
  fs.writeFileSync(file, source);
  const result = await build({
    stdin: { contents: `export { RUSSIAN_STARTER_STEPS } from ${JSON.stringify(file)};`, resolveDir: ROOT, loader: 'ts' },
    platform: 'node', format: 'cjs', bundle: true, logLevel: 'silent', write: false,
    plugins: [{ name: 'device-stubs', setup(api) {
      api.onResolve({ filter: /^(react-native|expo|@expo|@react-native|@react-navigation|@react-native-async-storage)/ }, () => ({ path: path.join(ROOT, 'scripts/test-stubs/react-native.js') }));
    } }],
  });
  const mod = { exports: {} };
  new Function('module', 'exports', result.outputFiles[0].text)(mod, mod.exports);
  fs.unlinkSync(file);
  return mod.exports.RUSSIAN_STARTER_STEPS;
};
const cells = (step) => [...step.oral, step.ending, ...step.read].map((l) => [l.text, l.fa]);
const fold = (t) => t.toLowerCase().replace(/[\u0301]/g, '').replace(/ё/g, 'е').replace(/[^а-яё]/g, '');
const table = (rows) => FORMAT === 'md'
  ? `| ${rows[0].join(' | ')} |\n|${rows[0].map(() => '---').join('|')}|\n${rows.slice(1).map((r) => `| ${r.join(' | ')} |`).join('\n')}`
  : rows.map((r) => r.join('  ·  ')).join('\n');

(async () => {
  const before = await load(cp.execSync(`git show ${BASE}:${BAND}`, { encoding: 'utf8' }), 'before');
  const after = await load(fs.readFileSync(path.join(ROOT, BAND), 'utf8'), 'after');
  const wanted = at('--ids') ? at('--ids').split(',') : after.map((s) => s.id);
  const rows = [['گام', 'جای خط', 'پیش از این', 'اکنون', 'وضعیت']];
  const keptWords = new Map();
  let changed = 0;
  // Retention is measured against the WHOLE old band, not one step: a line reused from another step is still reused.
  const oldFolded = new Map(before.flatMap((s) => cells(s).map(([t], i) => [fold(t), `${s.id}·خط${i + 1}: ${t}`])));
  for (const step of after) {
    if (!wanted.includes(step.id)) continue;
    const old = before.find((s) => s.id === step.id);
    cells(step).forEach(([text, fa], i) => {
      const wasThere = oldFolded.has(fold(text));
      const wordCount = (text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[а-яё]+/gu) ?? []).length;
      if (wasThere) keptWords.set(text, (keptWords.get(text) ?? 0) + 1);
      if (!wasThere) changed += 1;
      rows.push([`${step.id}·${i + 1}`, step.letters, `${old ? cells(old)[i][0] : ''} ⟵ ${old ? cells(old)[i][1] : ''}`, `${text} ⟵ ${fa}`,
        wasThere ? `همان واژه در «${oldFolded.get(fold(text))}»` : 'نو']);
    });
  }
  process.stdout.write(`${table(rows)}\n\n`);
  const multiKept = rows.slice(1).filter((r) => r[4] !== 'نو' && Number(r[4].match(/\((\d+) واژه\)/)?.[1] ?? 1) > 1);
  process.stdout.write(`خط‌های بررسی‌شده: ${rows.length - 1} · کاملاً نو: ${changed} · تک‌واژه‌هایی که دوباره آمده‌اند: ${rows.length - 1 - changed} · جمله‌های قدیمیِ مانده: ${multiKept.length}\n`);
  process.stdout.write(`واژه‌هایی که از قبل مانده‌اند: ${[...keptWords.keys()].map((k) => `«${k}»`).join('، ') || 'هیچ'}\n`);
  const stillIn = before.flatMap((s) => cells(s)).filter(([t]) => after.some((a) => cells(a).some(([x]) => fold(x) === fold(t))));
  process.stdout.write(`از ${before.reduce((a, s) => a + cells(s).length, 0)} خطِ قدیمی سطح، ${stillIn.length} خط هنوز در باند پیدا می‌شود:`
    + ` ${stillIn.slice(0, 40).map(([t]) => `«${t}»`).join('، ')}${stillIn.length > 40 ? '، …' : ''}\n`);
})().catch((error) => { process.stderr.write(`${error.stack ?? error.message}\n`); process.exit(1); });
