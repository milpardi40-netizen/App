const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createHash } = require('node:crypto');
const esbuild = require('esbuild');
const { loadInventory, verifyScope } = require('./helpers/practical-inventory.cjs');
const { modules } = require('./helpers/practical-storage.cjs');
const baseline = require('./fixtures/russian-a1-before.json');
const plan = require('../docs/russian-a1-architecture/blueprint.json');
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const words = text => text.toLowerCase().replace(/\u0301/g, '').match(/[а-яё]+(?:-[а-яё]+)*/g) ?? [];
(async () => {
  const inventory = await loadInventory();
  verifyScope(inventory);
  for (const [language, lessons] of Object.entries(inventory)) {
    if (language === 'ar') { require('./helpers/approved-arabic-a1.cjs').verifyApprovedArabicA1(lessons); continue; }
    if (language === 'tr') {
      require('./helpers/approved-turkish-a1.cjs').verifyApprovedTurkishA1(lessons);
    } else if (language === 'es') {
      const spanish=require('./fixtures/spanish-a1-before.json');
      assert.equal(digest(lessons.filter(l=>l.levelId!==1)),spanish.protected.es,'Spanish outside its separately approved A1 scope');
    } else if (language === 'fr') {
      const french=require('./fixtures/french-a1-before.json');
      assert.equal(digest(lessons.filter(l=>l.levelId!==1)),french.protected.fr,'French outside its separately approved A1 scope');
    } else if (language === 'de') {
      const german=require('./fixtures/german-a1-before.json');
      assert.equal(digest(lessons.filter(l=>l.levelId!==1)),german.protected.de,'German outside its separately approved A1 scope');
    } else if (language === 'en') {
      const english = require('./fixtures/english-a1-before.json');
      const ids = new Set(english.core.map(l=>l.id));
      assert.equal(digest(lessons.filter(l=>!ids.has(l.id))), english.protected.en, 'English outside its separately approved A1 scope stays byte-identical');
    } else {
    assert.equal(digest(language === 'ru' ? lessons.filter(l => l.levelId !== 1) : lessons), baseline.protected[language], `${language}: all non-target content byte-identical`);
    }
  }
  // The approved correction changes only four A1 wiring points, not the ten-stage layout.
  const screen = fs.readFileSync('components/RussianLesson.tsx', 'utf8');
  // The separately requested playback fix removes ONLY this early-microphone timer.
  // Restore it for this older layout/content hash; verify-long-narration executes the new behavior.
  assert.equal((screen.match(/Recognition starts only on playback completion\/error, never on an estimated duration\./g) || []).length, 1);
  assert.ok(!screen.includes('setTimeout(armMic,'));
  const beforeWiring = screen
    .replace('    // Recognition starts only on playback completion/error, never on an estimated duration.', '    if (targetKey) {\n      narratorFallbackRef.current = setTimeout(armMic, Math.min(7500, Math.max(2400, text.length * 130)));\n    }')
    .replace("import { russianLessonRoomPairs, russianA1Production, russianA1ProductionLabel, isRussianA1, RUSSIAN_A1_ROOM_REVISION } from '@/lib/languages/russianA1Practice';", "import { lessonDialoguePairs } from '@/lib/lessonDialoguePairs';")
    .replace('          explicit={russianA1Production(lesson)}\n          levelLabel={russianA1ProductionLabel(lesson)}\n', '')
    .replace('pairs={russianLessonRoomPairs(lesson)}', 'pairs={lessonDialoguePairs(lesson.sentences, lesson.dialogue)}')
    .replace("contentRevision={isRussianA1(lesson) ? RUSSIAN_A1_ROOM_REVISION : lesson.id.startsWith('ru-pre-') ? PRE_A1_CONTENT_REVISION : undefined}", "contentRevision={lesson.id.startsWith('ru-pre-') ? PRE_A1_CONTENT_REVISION : undefined}");
  assert.equal(createHash('sha256').update(beforeWiring).digest('hex'), baseline.stageSourceHash, 'outside the approved A1 wiring the screen, layout and stages stay identical');
  const built = await esbuild.build({ stdin: { contents: `
    export {RUSSIAN_A1_SKILLS as skills} from './lib/languages/russianA1Skills';
    export {russianRoomLines} from './lib/languages/russianPreA1';
    export {resolveConversationDialogue} from './lib/conversationRoomDialogues';
    export {russian as cards} from './lib/gender/russian';
    export {courseResumeLesson} from './lib/courseResume';
  `, resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false });
  const module = { exports: {} }; new Function('module', 'exports', built.outputFiles[0].text)(module, module.exports);
  const content = module.exports;
  assert.equal(digest(Object.fromEntries(Object.entries(content.cards).filter(([id]) => !id.startsWith('ru-a1-')))), baseline.protectedGender);
  const a1 = inventory.ru.filter(l => l.levelId === 1);
  const verbIndex = require('../lib/languages/russianGrammar/verbs.generated.json');
  const outsideA1 = entries => Object.fromEntries(Object.entries(entries).filter(([id]) => !id.startsWith('ru-a1-')));
  assert.equal(digest({ verbs: verbIndex.verbs, byLesson: outsideA1(verbIndex.byLesson), references: outsideA1(verbIndex.references) }), baseline.protectedVerbIndex, 'global verb dictionary and all non-A1 references unchanged');
  for (const lesson of a1) for (const lemma of verbIndex.byLesson[lesson.id]) {
    const [id, form] = verbIndex.references[lesson.id][lemma];
    const line = id.startsWith('d:') ? lesson.dialogue[Number(id.slice(2))] : lesson.sentences.find(s => s.id === id);
    assert.ok(line && words(line.text).includes(words(form)[0]), `${lesson.id}: stale verb-workshop pointer`);
  }
  assert.deepEqual(a1.map(l => l.id), plan.lessons.map(l => l.id), 'all 29 in approved order');
  assert.deepEqual(new Set(a1.map(l => l.module)), new Set(plan.modules.map(m => m.titleFa)), 'same nine module slots, approved grouping');
  const taught = new Set(inventory.ru.filter(l => l.levelId === 0).flatMap(l => l.sentences.flatMap(s => words(s.text))));
  for (const lesson of a1) {
    for (const sentence of lesson.sentences) {
      assert.ok(sentence.pronunciation && sentence.pattern && sentence.vocabulary.length, sentence.id);
      assert.ok(!/авто́бус|работа́ет|во́сьми|стро́чная/u.test(sentence.text));
      words(sentence.text).forEach(word => taught.add(word));
    }
    assert.ok(lesson.teachingFa.includes('مرور') && lesson.teachingFa.includes('خودبررسی') && lesson.teachingFa.includes('اختیاری'));
    assert.deepEqual(content.russianRoomLines(lesson), lesson.dialogue);
    assert.deepEqual(content.resolveConversationDialogue(lesson.id, []), lesson.dialogue, 'room never shadows the revised dialogue');
    lesson.dialogue.forEach((line, index) => {
      assert.equal(line.role, index % 2 ? 'learner' : 'partner');
      assert.ok(line.pronunciation && line.fa);
      for (const word of words(line.text)) assert.ok(taught.has(word), `${lesson.id}: untaught dialogue form ${word}`);
    });
    const tasks = content.skills[lesson.id];
    assert.deepEqual(tasks.map(t => t.kind), ['listening', 'reading']);
    for (const task of tasks) {
      assert.equal(new Set(task.choices).size, 3);
      assert.ok(task.choices[task.correctIndex]);
      assert.ok(!lesson.sentences.some(s => s.text === task.passage), 'comprehension must recombine, not copy a single row');
      for (const word of words(task.passage)) assert.ok(taught.has(word), `${lesson.id}: untaught task form ${word}`);
    }
    const card = content.cards[lesson.id];
    assert.ok(card);
    const examples = card.kind === 'common' ? [card.shared] : [card.masculine, card.feminine, ...(card.neuter ? [card.neuter] : [])];
    for (const [text] of examples) assert.ok(lesson.sentences.some(s => s.text === text), `${lesson.id}: stale gender card`);
  }
  // Saved navigation/completion is ID-based: reordering may change the next unvisited
  // lesson, never the user's explicit current lesson or historical completions.
  const oldOrder = baseline.a1Structure.map(l => l.id);
  const completedLessonIds = oldOrder.slice(0, 10);
  const target = oldOrder[10];
  const progress = { currentLessonId: target, completedLessonIds, resumeUpdatedAt: '2026-11-25T12:00:00Z' };
  const before = JSON.stringify(progress);
  assert.equal(content.courseResumeLesson(a1, progress, {}).id, target);
  assert.equal(JSON.stringify(progress), before);
  const withoutCursor = { currentLessonId: 'retired', completedLessonIds };
  assert.equal(content.courseResumeLesson(a1, withoutCursor, {}).id, a1.find(l => !completedLessonIds.includes(l.id)).id);

  const app = await modules();
  globalThis.__practicalMemory = new Map();
  globalThis.window = { localStorage: { getItem: k => globalThis.__practicalMemory.get(k) ?? null, setItem: (k,v) => globalThis.__practicalMemory.set(k,v) } };
  let migrated = 0;
  for (const platform of ['web', 'android']) {
    globalThis.__practicalOS = platform;
    for (const lesson of a1) for (const revision of [undefined, app.previousRussianRevisionFor(lesson.id), app.assessment.LESSON_ASSESSMENT_REVISION]) {
      const state = { stage: 8, stageVersion: 2, sentenceIndex: lesson.sentences.length - 1, revealed: true, answers: { 0: 1, 5: 3 }, showCheckAnswers: true, ...(revision ? { checksRevision: revision } : {}), updatedAt: '2026-11-25T12:00:00Z' };
      const raw = JSON.stringify({ schema: 1, sessions: { [lesson.id]: state } });
      globalThis.__practicalMemory.set(app.ru.RUSSIAN_STUDY_STORAGE_KEY, raw);
      const read = await app.ru.loadRussianLessonSessionWithPresence(lesson.id);
      assert.equal(read.hasSavedSession, true);
      assert.deepEqual(read.session.answers, {}, 'retire both authored and generated old meanings');
      assert.equal(read.session.showCheckAnswers, false);
      for (const field of ['stage', 'stageVersion', 'sentenceIndex', 'revealed', 'updatedAt']) assert.equal(read.session[field], state[field]);
      assert.equal(globalThis.__practicalMemory.get(app.ru.RUSSIAN_STUDY_STORAGE_KEY), raw, 'reads leave stored history untouched');
      const current = { ...read.session, answers: { 0: 1, 5: 0 }, showCheckAnswers: true };
      await app.ru.saveRussianLessonSession(lesson.id, current);
      const restored = await app.ru.loadRussianLessonSession(lesson.id);
      assert.deepEqual(restored.answers, current.answers);
      assert.equal(restored.showCheckAnswers, true);
      assert.equal(restored.checksRevision, app.assessment.RUSSIAN_A1_ASSESSMENT_REVISION);
      migrated++;
    }
    for (const lesson of inventory.ru.filter(l => l.levelId !== 1)) {
      assert.equal(app.assessment.assessmentRevisionFor('ru', lesson.id), app.assessment.LESSON_ASSESSMENT_REVISION);
    }
  }
  const historical = { speaking: { average: 91, scores: { [a1[0].sentences[0].id]: 91 }, at: '2026-11-25T12:00:00Z' }, assessment: { correct: 6, total: 6, at: '2026-11-25T12:00:00Z', contentRevision: app.assessment.LESSON_ASSESSMENT_REVISION } };
  const historyRaw = JSON.stringify({ [`ru:${a1[0].id}`]: historical, 'ru:ru-l3-past-simple': historical });
  globalThis.__practicalMemory.set('milo_lesson_outcomes_v1', historyRaw);
  const filtered = await app.outcomes.getLessonOutcome('ru', a1[0].id);
  assert.equal(filtered.speaking, undefined);
  assert.equal(filtered.assessment, undefined);
  assert.equal(globalThis.__practicalMemory.get('milo_lesson_outcomes_v1'), historyRaw, 'historical scores never deleted or rewritten on read');
  assert.equal((await app.outcomes.getLessonOutcome('ru', 'ru-l3-past-simple')).speaking.average, 91, 'unchanged A2 utterance scores survive');
  await app.outcomes.saveLessonOutcome('ru', a1[0].id, historical);
  assert.equal((await app.outcomes.getLessonOutcome('ru', a1[0].id)).speaking.average, 91, 'new A1 score round-trips with current content revision');
  console.log(`Russian A1 verified: 29 ordered lessons, 9 modules, 58 pre-taught comprehension tasks, synchronized rooms/cards, ${migrated} old-session migrations, historical scores retained, unchanged IDs/UI/schema/non-A1 content and ID-based resume.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
