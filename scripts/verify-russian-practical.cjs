const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const esbuild = require('esbuild');
const fs = require('node:fs');

(async () => {
  const { outputFiles } = await esbuild.build({ stdin: { contents: `
    export * from './lib/languages/russianPreA1';
    export * from './lib/languages/russianPreA1Practical';
    export { resolveConversationDialogue } from './lib/conversationRoomDialogues';
  `, resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false });
  const module = { exports: {} };
  new Function('module', 'exports', outputFiles[0].text)(module, module.exports);
  const app = module.exports;
  const lessons = app.RUSSIAN_PRE_A1_LESSONS;
  const fold = text => text.toLowerCase().replace(/\u0301/g, '').replace(/ё/g, 'е');
  const words = text => fold(text).match(/[а-я]+/g) ?? [];
  const known = new Set();
  assert.equal(lessons.length, 31);
  assert.deepEqual(Object.keys(app.RUSSIAN_PRE_A1_PRACTICAL).sort(), lessons.map(l => l.id).sort());
  const family = lessons.find(l => l.id === 'ru-pre-03-family-home');
  const pronouns = lessons.find(l => l.id === 'ru-pre-05-pronouns-family');
  assert.ok(family.sentences.some(s => fold(s.text) === 'это моя мама.' && s.fa === 'این مادر من است.'));
  assert.ok(family.sentences.some(s => fold(s.text) === 'это моя сестра.'));
  assert.ok(pronouns.sentences.some(s => fold(s.text) === 'она мама.'));
  assert.ok(pronouns.sentences.some(s => fold(s.text) === 'она сестра.'));
  assert.equal(app.RUSSIAN_PRE_A1_PRACTICAL_REVISION, 'ru-pre-a1-practical-v6', 'unchanged questions retain release72 answers');
  const ids = lessons.map(lesson => [lesson.id, lesson.sentences.map(sentence => sentence.id)]);
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(ids)).digest('hex'), 'b2dd01e69f0832b2ef2418ffffb05b992cdda91739775b80c39a1a23ab5abddb', 'all 31 lesson IDs, all 252 expression IDs and ordering survive');
  assert.equal(new Set(lessons.map(l => l.situation)).size, 31);
  for (const lesson of lessons) {
    const plan = app.RUSSIAN_PRE_A1_PRACTICAL[lesson.id];
    assert.equal(app.russianChecksRevisionFor(lesson.id), app.RUSSIAN_PRE_A1_PRACTICAL_REVISION);
    assert.ok(lesson.situation.includes(plan.goal) && lesson.situation.includes(plan.scene));
    assert.ok(lesson.teachingFa.includes('اختیاری') && lesson.teachingFa.includes('از حافظه'));
    assert.ok(lesson.teachingFa.includes(plan.contrast[2]));
    for (const index of plan.contrast.slice(0, 2)) {
      assert.ok(lesson.sentences[index], `${lesson.id}: missing contrast example`);
      assert.equal(lesson.sentences[index].pattern, plan.contrast[2]);
    }
    lesson.sentences.forEach(sentence => words(sentence.text).forEach(word => known.add(word)));
    assert.equal(lesson.dialogue.length, 4, 'short complete main conversation');
    for (const [index, line] of lesson.dialogue.entries()) {
      assert.equal(line.role, index % 2 ? 'learner' : 'partner');
      assert.ok(line.fa && line.pronunciation);
      for (const word of words(line.text)) assert.ok(known.has(word), `${lesson.id}: untaught dialogue form ${word}`);
    }
    assert.deepEqual(app.russianRoomLines(lesson), lesson.dialogue);
    assert.deepEqual(app.resolveConversationDialogue(lesson.id, []), lesson.dialogue, 'no stale room override');
    assert.equal(lesson.checks.length, 3, 'short main check set, not a growing exam');
    const response = lesson.checks.find(check => check.promptFa === plan.response[0]);
    assert.ok(response);
    assert.equal(response.choices[response.correctIndex], lesson.dialogue[1].text);
    const intent = lesson.checks.find(check => check.promptFa === plan.intent[0]);
    assert.ok(intent);
    assert.equal(intent.choices[intent.correctIndex], plan.intent[1]);
    for (const check of lesson.checks) {
      assert.equal(check.choices.length, 4);
      assert.equal(new Set(check.choices).size, 4);
      assert.ok(check.explanationFa);
    }
  }
  assert.equal(app.russianChecksRevisionFor('ru-a1-alphabet-and-spelling'), app.STARTER_CHECKS_REVISION);
  assert.deepEqual(app.russianRoomLines({ id: 'ru-a1-test', sentences: [{ text: 'Original', fa: 'اصلی' }], dialogue: [] }), [{ text: 'Original', fa: 'اصلی' }]);
  const screen = fs.readFileSync('components/RussianLesson.tsx', 'utf8');
  for (let stage = 0; stage < 10; stage++) assert.ok(screen.includes(`stage === ${stage}`), `original page ${stage + 1}`);
  console.log('31 practical Pre-A1 plans passed: stable 252 IDs, individual goals, in-context contrast, 62 situational checks, fully pre-taught alternating dialogues, both room sources and revision isolation.');
})().catch(error => { console.error(error); process.exitCode = 1; });
