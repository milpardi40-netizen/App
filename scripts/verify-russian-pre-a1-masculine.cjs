const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const esbuild = require('esbuild');

const fold = text => text.toLowerCase().replace(/\u0301/g, '').replace(/ё/g, 'е');
// Explicit inventory from the retired Pre-A1 content, including inflected forms.
// Not an ending-based gender classifier: па́па, де́душка and ко́фе remain valid masculine nouns.
const forbiddenStems = /^(?:мам|комнат|двер|окн|вод(?:а|у|ы|е|ой)|книг|ручк|ноч|имя|имен|слов|семь[яюие]|семе|сестр|подруг|учительниц|студентк|девоч|сумк|яблок|молок|кошк|собак|птиц|рыб|сред(?:а|у|ы|е|ой)|пятниц|суббот|воскресен|школ|кафе|улиц|утр|иранк|тетрад|кухн|чаш|евро|свидан|дела|сар(?:а|у|ы)|анн(?:а|у|ы)|мин(?:а|у|ы))/;
const feminineLessons = /ru-pre-0[35]-/;
const restoredForms = new Set(['мама','сестра','моя','она']);
const forbiddenForms = new Set(('она оно ее ей моя мое твоя твое чья чье какая какое одна одно нужна рада эта та то белая белое черная черное красная красное зеленая зеленое большая большое маленькая маленькое хорошая хорошее новая новое старая плохая красивая красивое добрая умная вкусная свежее тихая светлая интересная синяя желтое хорошего всего').split(' '));
function audit(value, context) {
  if (typeof value === 'string') {
    for (const token of fold(value).match(/[а-я]+/g) ?? []) {
      assert.ok((!forbiddenStems.test(token) && !forbiddenForms.has(token)) || (feminineLessons.test(context) && (restoredForms.has(token) || (context.endsWith('.stem') && token === 'мам'))), `${context}: retired form ${token}`);
    }
    assert.ok(!/خنثی/.test(value) && (!/مؤنث|مونث/.test(value) || feminineLessons.test(context)), `${context}: obsolete gender teaching`);
  } else if (Array.isArray(value)) value.forEach((item, index) => audit(item, `${context}[${index}]`));
  else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) audit(item, `${context}.${key}`);
}
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

(async () => {
  const { outputFiles } = await esbuild.build({
    stdin: { contents: `
      export { LESSON_ASSESSMENT_REVISION } from './lib/lessonAssessment';
      export * from './lib/languages/russian';
      export * from './lib/languages/russianPreA1';
      export * from './lib/languages/russianStudyState';
      export { lessonChunks } from './lib/lessonChunks';
      export { russian as genderCards } from './lib/gender/russian';
      export { bridgeFor, bridgeRulesForLesson } from './lib/languages/russianPersianBridge';
      export { resolveConversationDialogue } from './lib/conversationRoomDialogues';
      export { GRAMMAR_UNITS } from './lib/languages/russianGrammar/units';
      export { VERBS, lessonVerbs, relatedUnits } from './lib/languages/russianGrammar/catalog';
      export { studyExamples } from './lib/languages/russianGrammar/verbLesson';
    `, resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false,
    plugins: [{ name: 'pre-a1-platform-stubs', setup(build) {
      build.onResolve({ filter: /createCourseProgressStore$/ }, () => ({ path: 'store', namespace: 'stub' }));
      build.onResolve({ filter: /^react-native$/ }, () => ({ path: 'platform', namespace: 'stub' }));
      build.onResolve({ filter: /^@react-native-async-storage\/async-storage$/ }, () => ({ path: 'storage', namespace: 'stub' }));
      build.onLoad({ filter: /.*/, namespace: 'stub' }, args => ({ contents: args.path === 'store' ? 'export const createCourseProgressStore=()=>({});' : args.path === 'platform' ? 'export const Platform={OS:"web"};' : 'export default {};' }));
    }}],
  });
  const mod = { exports: {} };
  new Function('module', 'exports', outputFiles[0].text)(mod, mod.exports);
  const app = mod.exports;
  const pre = app.RUSSIAN_LESSONS.filter(lesson => lesson.levelId === 0);
  assert.equal(pre.length, 31);
  for (const lesson of pre) {
    audit(lesson, lesson.id);
    audit(app.RUSSIAN_PRE_A1_SUBTITLES[lesson.id], `${lesson.id}.subtitle`);
    audit(app.genderCards[lesson.id], `${lesson.id}.genderCard`);
    audit(app.resolveConversationDialogue(lesson.id, lesson.dialogue), `${lesson.id}.room`);
    audit(app.bridgeRulesForLesson(lesson.sentences, true), `${lesson.id}.bridgeSummary`);
    lesson.sentences.forEach(sentence => audit(app.bridgeFor(sentence, true), `${sentence.id}.bridge`));
    assert.equal(lesson.sentences.length, lesson.id === app.RUSSIAN_HELLO_LESSON_ID ? 12 : 8, lesson.id);
    assert.equal(lesson.dialogue.length, 4, lesson.id);
    assert.equal(lesson.checks.length, 3, lesson.id);
    for (const [index, sentence] of lesson.sentences.entries()) {
      assert.equal(sentence.id, `${lesson.id}-${String(index + 1).padStart(2, '0')}`);
      assert.ok(sentence.fa && sentence.pronunciation && sentence.vocabulary.length);
      for (const entry of sentence.vocabulary) assert.ok(fold(sentence.text).includes(fold(entry.word)), `${sentence.id}: vocabulary ${entry.word} not in its sentence`);
    }
    for (const check of lesson.checks) {
      assert.equal(check.choices.length, 4);
      assert.equal(new Set(check.choices).size, 4);
      assert.ok(check.choices[check.correctIndex] && check.explanationFa);
    }
    assert.equal(app.genderCards[lesson.id].kind, 'common', 'no feminine/neuter comparison rows');
    assert.ok(app.relatedUnits(lesson).every(unit => unit.level === 0), 'Pre-A1 links cannot pull A1 gender contrasts into a lesson');
  }
  const hello = pre[0];
  const listening = app.russianListeningItems(hello);
  assert.equal(listening.length, 12);
  assert.equal(new Set(listening.map(item => item.fa)).size, 12, 'distinct listening intentions');
  assert.ok(listening[8].fa.includes('پذیرفتن'));
  assert.ok(listening[9].fa.includes('ردکردن'));
  assert.ok(listening[10].fa.includes('پرسیدن حال'));
  assert.ok(listening[11].fa.includes('طرف مقابل'));
  assert.equal(hello.sentences[10].text, 'Как ты?');
  assert.equal(hello.sentences[11].text, 'Хорошо́, спаси́бо. А ты?');
  assert.equal(listening[8].text, hello.sentences[8].text);
  assert.deepEqual(app.russianListeningItems(pre[1]), pre[1].sentences.map(({id, text, fa}) => ({id, text, fa})), 'other listening sources remain unchanged');
  assert.equal(app.lessonChunks(hello.id, hello.sentences.length).chunked, false, 'enrichment keeps the single ten-stage path');
  assert.equal(hello.dialogue[0].text, 'Приве́т! Как ты?');
  assert.equal(hello.dialogue[1].text, 'Приве́т! Хорошо́, спаси́бо. А ты?');
  assert.equal(hello.dialogue[2].text, 'Хорошо́, спаси́бо. Уви́димся!');
  const taught = new Set(hello.sentences.flatMap(sentence => fold(sentence.text).split(/[^а-яё]+/)).filter(Boolean));
  assert.deepEqual(app.resolveConversationDialogue(hello.id, []), hello.dialogue, 'room override matches the authored dialogue');
  assert.deepEqual(app.russianRoomLines(hello), hello.dialogue, 'both entry points use the connected dialogue');
  assert.deepEqual(app.russianRoomLines(pre[1]), pre[1].dialogue, 'Pre-A1 rooms use taught dialogue');
  hello.dialogue.forEach((line, index) => {
    assert.equal(line.role, index % 2 ? 'learner' : 'partner');
    for (const word of fold(line.text).split(/[^а-яё]+/).filter(Boolean)) assert.ok(taught.has(word), `untaught room word: ${word}`);
  });
  assert.ok(hello.sentences[6].vocabulary.some(item => fold(item.word) === 'спасибо'));
  assert.ok(hello.sentences[6].vocabulary.some(item => fold(item.word) === 'пожалуйста'));
  for (const answer of ['Приве́т! Хорошо́, спаси́бо. А ты?']) {
    assert.ok(hello.checks.some(check => check.choices[check.correctIndex] === answer), `context check for ${answer}`);
  }
  assert.ok(pre.every(lesson => lesson.situation.startsWith('هدف: بتوانم') && lesson.teachingFa.includes('اختیاری')), 'all 31 have a goal and optional extra practice');
  audit(app.GRAMMAR_UNITS.filter(unit => unit.level === 0), 'preGrammar');
  for (const verb of app.VERBS) audit(app.studyExamples(verb, 0), `preVerb.${verb.lemma}`);

  // Snapshots of the base commit's shipped content, not source-format hashes.
  assert.equal(digest(app.RUSSIAN_LESSONS.filter(lesson => lesson.levelId > 0)), 'eb3cf3027a6fd16cefb00ca3d92851c61907e0d77d906cf20943a813a47a9141', 'A1–C1 content must remain byte-for-byte identical after JSON serialization');
  assert.equal(digest(Object.fromEntries(Object.entries(app.genderCards).filter(([id]) => !id.startsWith('ru-pre-')))), '6da0679bc49c08fcc2ef626e6fac5a1046beac85240f3161062b25283619f01b', 'higher-level gender cards unchanged');
  assert.equal(digest(app.GRAMMAR_UNITS.filter(unit => unit.level > 0)), 'bba9124c2105b0a983d63566e89456a4716fdb6f7cf2e5c0da36bb915c5318ce', 'higher-level grammar units unchanged');

  const memory = new Map();
  global.window = { localStorage: { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value), removeItem: key => memory.delete(key) } };
  const fields = { stage: 4, stageVersion: 2, sentenceIndex: 2, revealed: true, answers: { 0: 1 }, showCheckAnswers: true, checksRevision: app.STARTER_CHECKS_REVISION };
  const a1 = app.RUSSIAN_LESSONS.find(lesson => lesson.levelId === 1);
  memory.set(app.RUSSIAN_STUDY_STORAGE_KEY, JSON.stringify({ schema: 1, sessions: { [pre[0].id]: fields, [a1.id]: fields } }));
  const before = JSON.parse(memory.get(app.RUSSIAN_STUDY_STORAGE_KEY));
  before.sessions[pre[0].id].checksRevision = 'ru-pre-01-communication-v4';
  before.sessions[pre[1].id] = { ...fields, checksRevision: app.PRE_A1_CONTENT_REVISION };
  memory.set(app.RUSSIAN_STUDY_STORAGE_KEY, JSON.stringify(before));
  const unchanged = await app.loadRussianLessonSession(pre[1].id);
  assert.deepEqual(unchanged.answers, fields.answers, 'lesson-two answers survive the lesson-one revision');
  const migrated = await app.loadRussianLessonSession(pre[0].id);
  assert.deepEqual(migrated.answers, {}, 'retire only the replaced Pre-A1 question answers');
  assert.equal(migrated.sentenceIndex, fields.sentenceIndex);
  const preserved = await app.loadRussianLessonSession(a1.id);
  assert.deepEqual(preserved.answers, fields.answers, 'A1 saved answers are not invalidated');
  await app.saveRussianLessonSession(pre[0].id, fields);
  assert.equal(JSON.parse(memory.get(app.RUSSIAN_STUDY_STORAGE_KEY)).sessions[pre[0].id].checksRevision, app.LESSON_ASSESSMENT_REVISION);
  // Retired experimental metadata must not block resuming the restored ten-page path.
  const rollbackState = JSON.parse(memory.get(app.RUSSIAN_STUDY_STORAGE_KEY));
  rollbackState.sessions[pre[0].id].sixTaskIndex = 8;
  memory.set(app.RUSSIAN_STUDY_STORAGE_KEY, JSON.stringify(rollbackState));
  const restored = await app.loadRussianLessonSession(pre[0].id);
  assert.equal(restored.stage, fields.stage, 'original stage preserved after rollback');
  assert.equal(restored.sentenceIndex, fields.sentenceIndex, 'original sentence preserved after rollback');
  assert.deepEqual(restored.answers, fields.answers, 'current authored answers preserved');
  assert.ok(!('sixTaskIndex' in restored), 'retired experimental cursor is ignored');
  await app.saveRussianLessonSession(pre[0].id, restored);
  assert.ok(!('sixTaskIndex' in JSON.parse(memory.get(app.RUSSIAN_STUDY_STORAGE_KEY)).sessions[pre[0].id]), 'next save retires experimental metadata');
  assert.deepEqual((await app.loadRussianLessonSession(a1.id)).answers, fields.answers, 'A1 remains intact after rollback');
  delete global.window;
  console.log('31 Russian Pre-A1 lessons passed scoped gender audits (mother/sister and agreement restored only in lessons 03/05): all lesson fields, vocabulary, dialogue overrides, checks, cards, bridge notes, grammar and verb examples. A1–C1 content snapshots and saved A1 answers are unchanged.');
})().catch(error => { console.error(error); process.exitCode = 1; });
