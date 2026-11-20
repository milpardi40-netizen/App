/** Before/after report for Pre-A1 steps 11–28: reads HEAD vs the working tree and writes
 *  a markdown table file plus a self-contained HTML file (inline styles, no external assets). */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const cur = readFileSync('lib/languages/russianPreA1.ts', 'utf8');
const head = execSync('git show HEAD:lib/languages/russianPreA1.ts', { encoding: 'utf8', maxBuffer: 1e8 });

/** Parse every `  { id: "…" … } ` object of the steps array into its named fields. */
function parse(src) {
  const out = new Map();
  for (const part of src.split('\n  { id: "').slice(1)) {
    const body = part.slice(0, part.search(/\n  \{ id: "/) < 0 ? part.length : part.search(/\n  \{ id: "/));
    const id = body.slice(0, body.indexOf('"'));
    const field = (name) => {
      const i = body.indexOf(name + ': ');
      if (i < 0) return '';
      let depth = 0, j = i + name.length + 1;
      for (; j < body.length; j++) {
        const c = body[j];
        if (c === '"' && body[j - 1] !== '\\') { let k = j + 1; while (body[k] !== '"' || body[k - 1] === '\\') k++; j = k; continue; }
        if (c === '[' || c === '{') depth++;
        if (c === ']' || c === '}') { if (!--depth) break; }
      }
      return body.slice(i + name.length + 2, j + 1).trim().replace(/,$/, '');
    };
    const lines = (block) => [...block.matchAll(/p\("([^"]*)", "([^"]*)"(?:, "([^"]*)")?\)/g)].map(m => ({ text: m[1], fa: m[2], pron: m[3] || '' }));
    const str = (raw) => (raw.match(/^\s*"((?:[^"\\]|\\.)*)"/s) || [])[1] || raw;
    out.set(id, {
      title: str(field('title')), letters: str(field('letters')), goal: str(field('goal')),
      note: str(field('note')), situation: str(field('situationCheck')),
      oral: lines(field('oral')), ending: lines(field('ending'))[0], read: lines(field('read')),
    });
  }
  return out;
}

const H = parse(head), C = parse(cur);
const ids = [...C.keys()].slice(10);            // steps 11..28 (the file keeps its order)
const row = (label, before, after) => `| ${label} | ${before} | ${after} |\n`;
const pair = (o) => o ? `${o.text}<br><sub>${o.fa}</sub>` : '—';

let md = `# بازنویسی Pre-A1 — گام‌های ۱۱ تا ۲۸ (دسته‌های ۳ تا ۶)\n\n`
  + `مقایسۀ «پیش» (کامیت HEAD) و «اکنون» (درخت کاری). هر گام هفت خانۀ گفتاری دارد: شش خط شنیداری، خط پایانی و دو کارت خواندن.\n\n`;
let html = `<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><title>Pre-A1 · گام ۱۱ تا ۲۸ · پیش/اکنون</title>
<style>
body{margin:0;padding:24px;background:#0f1115;color:#e8eaf0;font:15px/1.85 "Segoe UI",Tahoma,sans-serif}
h1{font-size:22px;margin:0 0 4px}p.lead{color:#9aa3b5;margin:0 0 22px;font-size:13px}
.step{background:#161a22;border:1px solid #232a38;border-radius:14px;padding:14px 16px;margin:0 0 14px}
.step h2{font-size:16px;margin:0 0 2px;color:#ffd479}.step h2 span{color:#6d7688;font-weight:400;font-size:12px;margin-inline-start:8px}
.row{display:grid;grid-template-columns:118px 1fr 1fr;gap:10px;padding:8px 0;border-top:1px solid #1f2532}
.row b{color:#8fa9ff;font-weight:600;font-size:12px;padding-top:3px}
.cell{background:#111521;border-radius:10px;padding:8px 10px;min-height:20px}
.cell.before{color:#9aa3b5;text-decoration:line-through;text-decoration-color:#4d2530}
.cell.after{color:#eef2fa}.cell.ru{font-weight:600;letter-spacing:.2px}
sub{color:#7d879b;font-size:11px;display:block;margin-top:2px}
.kv{display:grid;grid-template-columns:118px 1fr 1fr;gap:10px;padding:6px 0;border-top:1px solid #1f2532;font-size:13px}
.kv b{color:#8fa9ff;font-weight:600;font-size:12px;padding-top:2px}
.note{color:#9aa3b5;font-size:12px;line-height:1.7}
table{border-collapse:collapse;width:100%;font-size:13px}
</style>
<h1>بازنویسی محتوای Pre-A1 — گام‌های ۱۱ تا ۲۸</h1>
<p class="lead">«پیش» = همان گام در کامیت HEAD · «اکنون» = متن جدید. شناسهٔ گام‌ها و پیشرفت ذخیرۀ زبان‌آموز دست‌نخورده مانده است.</p>`;

for (const id of ids) {
  const b = H.get(id) || {}, a = C.get(id);
  const n = Math.max(a.oral.length, b.oral?.length || 0);
  md += `\n## ${ids.indexOf(id) + 11}. \`${id}\` — «${a.title}»\n\n`
      + row('', '**پیش**', '**اکنون**').replace('\n', '\n| --- | --- | --- |\n') + row('تیتر', `«${b.title}»`, `«${a.title}»`)
      + row('هدف', b.goal, a.goal) + row('موقعیت', b.situation, a.situation);
  for (let i = 0; i < n; i++) md += row(`شنیداری ${i + 1}`, pair(b.oral?.[i]), pair(a.oral[i]));
  md += row('پایانی', pair(b.ending), pair(a.ending));
  md += row('خواندن ۱', pair(b.read?.[0]), pair(a.read[0])) + row('خواندن ۲', pair(b.read?.[1]), pair(a.read[1])) + '\n';
  html += `<div class="step"><h2>${ids.indexOf(id) + 11}. ${a.title}<span>${id}${a.letters ? ' · حروف ' + a.letters : ''}</span></h2>`;
  html += `<div class="kv"><b>هدف</b><div class="cell before">${b.goal || '—'}</div><div class="cell after">${a.goal}</div></div>`;
  html += `<div class="kv"><b>موقعیت</b><div class="cell before">${b.situation || '—'}</div><div class="cell after">${a.situation}</div></div>`;
  for (let i = 0; i < n; i++) {
    html += `<div class="row"><b>شنیداری ${i + 1}</b><div class="cell before">${b.oral?.[i]?.text || '—'}<sub>${b.oral?.[i]?.fa || ''}</sub></div>`
          + `<div class="cell after ru">${a.oral[i].text}<sub>${a.oral[i].fa}</sub></div></div>`;
  }
  html += `<div class="row"><b>پایانی</b><div class="cell before">${b.ending?.text || '—'}<sub>${b.ending?.fa || ''}</sub></div><div class="cell after ru">${a.ending.text}<sub>${a.ending.fa}</sub></div></div>`;
  a.read.forEach((r, i) => {
    html += `<div class="row"><b>خواندن ${i + 1}</b><div class="cell before">${b.read?.[i]?.text || '—'}<sub>${b.read?.[i]?.fa || ''}</sub></div><div class="cell after ru">${r.text}<sub>${r.fa}</sub></div></div>`;
  });
  html += `<div class="kv"><b>یادداشت</b><div class="cell before note">${b.note || '—'}</div><div class="cell after note">${a.note}</div></div></div>`;
}
mkdirSync('docs/reports', { recursive: true });
writeFileSync('docs/reports/prea1-batch3456-before-after.md', md);
writeFileSync('docs/reports/prea1-batch3456-preview.html', html + '</body></html>');
console.log('steps:', ids.length, '· md bytes:', md.length, '· html bytes:', html.length);
