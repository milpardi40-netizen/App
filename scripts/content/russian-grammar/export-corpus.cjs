// Build-time input for build-index.py. Usage: node export-corpus.cjs > /tmp/ru-corpus.json
const esbuild = require('esbuild');
(async () => {
  const { outputFiles } = await esbuild.build({ stdin: { contents: `export { RUSSIAN_LESSONS } from './lib/languages/russian'; export { exchangeForLesson } from './lib/languages/russianExchange';`, resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false,
    plugins: [{ name: 'content-only', setup(b) {
      b.onResolve({ filter: /createCourseProgressStore$/ }, () => ({ path: 'unused', namespace: 'storage' }));
      b.onLoad({ filter: /.*/, namespace: 'storage' }, () => ({ contents: 'export const createCourseProgressStore = () => ({})' }));
    } }] });
  const db = { exports: {} }; new Function('module', 'exports', outputFiles[0].text)(db, db.exports);
  const { RUSSIAN_LESSONS, exchangeForLesson } = db.exports;
  const result = RUSSIAN_LESSONS.map(l => {
    const lines = [...l.sentences, ...l.dialogue.map((s,i) => ({ ...s, id: `d:${i}` }))];
    const refs = new Map(lines.map(s => [s.text, s.id]));
    const scene = exchangeForLesson(l); lines.push(scene.opening);
    const collect = m => { lines.push(m.say, m.reply); m.next.forEach(collect); };
    [...scene.learnerFirst, ...scene.partnerFirst].forEach(collect);
    return { id: l.id, level: l.levelId, lines: [...new Map(lines.map(x => [x.text, [x.text, x.fa, refs.get(x.text) ?? null]])).values()],
      notes: [l.teachingFa || '', ...l.sentences.map(s => s.pattern || ''), ...(l.checks || []).flatMap(q => [q.promptFa, ...q.choices, q.explanationFa])] };
  });
  process.stdout.write(JSON.stringify(result));
})().catch(e => { console.error(e); process.exitCode = 1; });
