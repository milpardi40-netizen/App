// Read-only audit of the assembled course and actual screen feed expressions.
// Writes this report's evidence, never runtime content or saved learner data.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const esbuild = require('esbuild');
const ts = require('typescript');
const { loadInventory } = require('../../scripts/helpers/practical-inventory.cjs');
const languages = ['en', 'de', 'fr', 'es', 'tr', 'ar'];
const text = s => s.text ?? s.en ?? s.ar ?? '';
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const fold = value => value.normalize('NFKC').toLowerCase().replace(/[\p{P}\p{Z}\s]+/gu, ' ').trim();
const count = (items, fn) => items.filter(fn).length;
const sum = (items, fn) => items.reduce((n,item) => n + fn(item), 0);
function roomExpression(file) {
  const source = fs.readFileSync(file, 'utf8');
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found = {};
  function visit(node) {
    if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(ast) === 'LessonDialogueRoom') {
      for (const p of node.attributes.properties) if (ts.isJsxAttribute(p) && ['pairs', 'contentRevision'].includes(p.name.getText(ast))) found[p.name.getText(ast)] = p.initializer.expression.getText(ast);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast); assert.ok(found.pairs && found.contentRevision, file);
  return found;
}
(async () => {
  process.chdir(path.resolve(__dirname, '../..'));
  const inventory = await loadInventory();
  const before = digest(inventory);
  const bundle = await esbuild.build({ stdin: { contents: `export * from './lib/lessonDialoguePairs'; export {A1_SKILLS} from './lib/languages/a1Skills'; export {englishEvidenceFor,arabicEvidenceFor} from './lib/lessonEvidenceBank'; export {expandedChoiceChecks} from './lib/lessonAssessment';`, resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false, plugins: [{ name: 'content-only', setup(build) {
    build.onResolve({filter:/createCourseProgressStore$/}, () => ({path:'store',namespace:'mock'}));
    build.onLoad({filter:/.*/,namespace:'mock'}, () => ({contents:'export const createCourseProgressStore=()=>({});'}));
  } }] });
  const m = {exports:{}};new Function('module','exports',bundle.outputFiles[0].text)(m,m.exports);
  const app = m.exports;
  const screens = {en:'components/EnglishLessonRoute.tsx',de:'components/StarterLesson.tsx',fr:'components/StarterLesson.tsx',es:'components/StarterLesson.tsx',tr:'components/TurkishLesson.tsx',ar:'components/arabic/ArabicLessonScreen.tsx'};
  const result = {date:'2026-11-26',scope:'Read-only initial audit; not a full linguistic/CEFR review or implementation approval.',inventoryHashes:Object.fromEntries(Object.entries(inventory).map(([id,bank])=>[id,digest(bank)])),languages:{}};
  for (const language of languages) {
    const all = inventory[language];
    const pre = all.filter(l => l.levelId === 0);
    const band = all.filter(l => l.levelId === 1);
    const core = band.filter(l => !l.id.startsWith('lab-'));
    const labs = band.filter(l => l.id.startsWith('lab-'));
    const preLines = new Set(pre.flatMap(l => l.sentences.map(s => fold(text(s)))));
    const feed = roomExpression(screens[language]);
    const roomFeed = new Function('lesson','lessonDialoguePairs', `return (${feed.pairs});`);
    const lessons = core.map(l => {
      const pairs = roomFeed(l, app.lessonDialoguePairs);
      const targets = l.sentences.map(text);
      for (const starter of ['operator','me']) {
        const lines = app.dialoguePairLines(pairs, starter);
        const user = lines.filter((_,i) => i % 2 === (starter === 'operator' ? 1 : 0)).map(text);
        assert.deepEqual(user, targets, `${language}/${l.id}/${starter}: full learner coverage`);
      }
      const tasks = app.A1_SKILLS[l.id] ?? [];
      const checks = language === 'en' ? app.englishEvidenceFor(l) : language === 'ar' ? app.arabicEvidenceFor(l) : app.expandedChoiceChecks(l);
      return {
        id:l.id,order:l.order,title:l.title,sentences:l.sentences.length,
        totalWhitespaceWords:sum(l.sentences,s=>text(s).split(/\s+/).length),
        longestRowWords:Math.max(...l.sentences.map(s=>text(s).split(/\s+/).length)),
        teachingNote:!!l.teachingFa?.trim(),patterns:count(l.sentences,s=>!!s.pattern),
        pronunciationGuides:count(l.sentences,s=>!!s.pronunciation?.trim()),
        authoredDialogueTurns:l.dialogue.length,
        dialogueRowsExactlyInLesson:count(l.dialogue,d=>l.sentences.some(s=>fold(text(s))===fold(text(d)))),
        roomPairs:pairs.length,echoPairs:count(pairs,p=>p.kind==='echo'),exchangePairs:count(pairs,p=>p.kind==='exchange'),
        allLearnerSentencesCoveredBothStarters:true,
        exactPreA1ReusedRows:count(l.sentences,s=>preLines.has(fold(text(s)))),
        optionalSkills:tasks.map(t=>t.kind),runtimeAssessmentTasks:checks.length,
      };
    });
    result.languages[language] = {
      preA1:{lessons:pre.length,rows:sum(pre,l=>l.sentences.length)},
      a1:{coreLessons:core.length,coreRows:sum(core,l=>l.sentences.length),labLessons:labs.length,labRows:sum(labs,l=>l.sentences.length)},
      totals:{teachingNotes:count(lessons,l=>l.teachingNote),authoredDialogueTurns:sum(lessons,l=>l.authoredDialogueTurns),echoPairs:sum(lessons,l=>l.echoPairs),exchangePairs:sum(lessons,l=>l.exchangePairs),optionalListeningLessons:count(lessons,l=>l.optionalSkills.includes('listening')),optionalReadingLessons:count(lessons,l=>l.optionalSkills.includes('reading')),runtimeAssessmentTasks:sum(lessons,l=>l.runtimeAssessmentTasks),exactPreA1ReusedRows:sum(lessons,l=>l.exactPreA1ReusedRows)},
      screen:screens[language],roomFeed:feed,lessons,
      labs:labs.map(l=>({id:l.id,title:l.title,sentences:l.sentences.length})),
    };
    console.log(language, JSON.stringify({pre:result.languages[language].preA1,a1:result.languages[language].a1,totals:result.languages[language].totals}));
  }
  assert.equal(digest(inventory), before, 'audit never mutates assembled content');
  assert.deepEqual(Object.fromEntries(Object.entries(await loadInventory()).map(([id,bank])=>[id,digest(bank)])), result.inventoryHashes, 'second assembly stays byte-identical for all seven courses');
  fs.writeFileSync(path.join(__dirname,'evidence.json'),JSON.stringify(result,null,2)+'\n');
  console.log('PASS read-only six-language audit; real screen pair expressions cover every core A1 row for both starters.');
})().catch(e=>{console.error(e);process.exitCode=1;});
