const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const esbuild = require('esbuild');
(async () => {
  const build = await esbuild.build({ stdin: { contents: "export * from './lib/languages/russianPreA1'; export { narrationRate } from './lib/narration';", resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false });
  const mod = { exports: {} }; new Function('module', 'exports', build.outputFiles[0].text)(mod, mod.exports);
  const { RUSSIAN_PRE_A1_LESSONS: lessons, narrationRate } = mod.exports;
  assert.equal(lessons.length, 31);
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(require('./helpers/approved-russian-prea1.cjs').historicalPre(lessons))).digest('hex'), 'c30f3da3e50a0d5e57df73bd1788ca12b3d22b1225a11399357d98508003865a', 'historical content plus separately guarded phase-1/2 corrections');
  assert.equal(narrationRate('ru-RU', 'listen'), narrationRate('ru-RU', 'normal'), 'removed replay really duplicates the retained sound button');
  assert.equal(new Set(['slow', 'normal', 'natural'].map(pace => narrationRate('ru-RU', pace))).size, 3);
  const source = fs.readFileSync('components/RussianLesson.tsx', 'utf8');
  // The same cleanup is now authorised for all languages/levels, not only Pre-A1.
  assert.ok(!source.includes('style={styles.stepperHeading}'));
  assert.ok(!source.includes('<Text style={styles.stageTitle}>{lesson.title}</Text>'));
  assert.ok(!source.includes('accessibilityLabel="پخش معمولی جمله"'));
  assert.equal((source.match(/<LessonGenderCard /g) || []).length, 1, 'one identical gender card, retained in grammar');
  assert.ok(source.includes('<LessonGenderCard language="ru" lesson={lesson} speak={speak} />'));
  assert.ok(source.includes('showHint && lesson.id === RUSSIAN_HELLO_LESSON_ID'), 'unique listening intent coaching retained');
  assert.ok(source.includes('lesson.id === RUSSIAN_HELLO_LESSON_ID ? <Text style={styles.speechHint}>'), 'unique stress coaching retained');
  assert.ok(source.includes('const headerError = speechError || timer.error;'));
  assert.ok(source.includes('{sessionError || completionError}</Text>'), 'one error display retained beside retry');
  const stageMarkers = ['lesson.situation', 'current.pronunciation', '<BlindListeningList', 'styles.speechSentence', '<RussianSentenceBuilder', 'vocabulary.map', '<GrammarPatternCard', 'only="checks"', 'only="speak"', '<LessonDialogueRoom'];
  for (const lesson of lessons) for (const marker of stageMarkers) {
    assert.ok(source.includes(marker), lesson.id + ': teaching stage retained');
    assert.ok(lesson.sentences.length && lesson.checks.length && lesson.dialogue.length);
  }
  console.log('31 Russian Pre-A1 lessons retain the approved current content SHA-256, ten stages, unique lesson-one coaching, grammar gender card and all distinct playback speeds under the shared seven-language cleanup.');
})().catch(error => { console.error(error); process.exitCode = 1; });
