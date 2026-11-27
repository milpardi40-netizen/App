const assert = require('node:assert/strict');
const { loadInventory, verifyScope } = require('./helpers/practical-inventory.cjs');
const { modules } = require('./helpers/practical-storage.cjs');
(async () => {
  const inventory = await loadInventory(); verifyScope(inventory);
  const app = await modules();
  const { expandedChoiceChecks, shortAssessmentCount, LESSON_ASSESSMENT_REVISION } = app.assessment;
  let lessons = 0, questions = 0, pairs = 0;
  for (const [language, bank] of Object.entries(inventory)) for (const lesson of bank) {
    const before = JSON.stringify(lesson);
    const tasks = language === 'en' ? app.bank.englishEvidenceFor(lesson) : language === 'ar' ? app.bank.arabicEvidenceFor(lesson) : expandedChoiceChecks(lesson);
    assert.equal(tasks.length, Math.max(shortAssessmentCount(lesson.sentences.length), language === 'en' ? (tasks.filter(task => !task.id.startsWith(LESSON_ASSESSMENT_REVISION)).length) : lesson.checks?.length ?? 0), lesson.id);
    assert.ok(tasks.length >= 5 && tasks.length <= 8);
    for (const [index, task] of tasks.entries()) {
      const options = task.options ?? task.choices;
      if (options) {
        const generated = task.id ? task.id.startsWith(LESSON_ASSESSMENT_REVISION) : index >= (lesson.checks?.length ?? 0);
        if (generated) assert.equal(new Set(options).size, options.length, lesson.id + ': new options are distinct');
        if (task.choices) assert.ok(options[task.correctIndex]);
        else assert.equal(options.filter(option => task.answers.includes(option)).length, 1);
      } else assert.ok(task.answers?.length);
    }
    if (['en', 'ar'].includes(language)) {
      assert.equal(new Set(tasks.map(task => task.id)).size, tasks.length, 'unique task IDs');
      assert.deepEqual(tasks, language === 'en' ? app.bank.englishEvidenceFor(lesson) : app.bank.arabicEvidenceFor(lesson), 'stable on reload');
      assert.ok(new Set(tasks.map(task => task.skill)).size >= 2, lesson.id + ': varied skills');
    } else assert.deepEqual(tasks.slice(0, lesson.checks?.length ?? 0), lesson.checks ?? [], 'keep authored checks');
    const authored = lesson.dialogue.map(line => ({ text: line.text ?? line.ar, fa: line.fa }));
    const practice = app.pairs.lessonDialoguePairs(lesson.sentences, authored);
    for (const starter of ['operator', 'me']) {
      const lines = app.pairs.dialoguePairLines(practice, starter);
      assert.equal(lines.length, lesson.sentences.length * 2);
      assert.deepEqual(lines.filter((_, i) => i % 2 === (starter === 'operator' ? 1 : 0)).map(line => line.text), lesson.sentences.map(sample => sample.text ?? sample.en ?? sample.ar));
    }
    assert.equal(JSON.stringify(lesson), before, 'presentation never mutates source content');
    lessons++; questions += tasks.length; pairs += practice.length;
  }
  assert.deepEqual([5, 10, 11, 16, 17, 24, 25, 50].map(shortAssessmentCount), [5, 5, 6, 6, 7, 7, 8, 8]);
  const old = { evidencePassed: true, attemptEvidence: { originalTask: true }, stage: 9, sentenceIndex: 4 };
  const migrated = app.assessment.reviseExpandedEvidence('en', 'id', old);
  assert.equal(migrated.evidencePassed, false); assert.deepEqual(migrated.attemptEvidence, old.attemptEvidence);
  assert.equal(migrated.stage, 9); assert.equal(migrated.sentenceIndex, 4); assert.equal(old.evidencePassed, true);
  globalThis.__practicalMemory = new Map();
  globalThis.window = { localStorage: { getItem: k => globalThis.__practicalMemory.get(k) ?? null, setItem: (k, v) => globalThis.__practicalMemory.set(k, v) } };
  for (const platform of ['web', 'android']) {
    globalThis.__practicalOS = platform;
    for (const language of ['de','fr','es','tr','ru']) {
      const lesson = inventory[language].find(l => l.levelId === 0);
      const checks = expandedChoiceChecks(lesson);
      const slot = checks.length - 1;
      const session = { stage: 7, stageVersion: 2, sentenceIndex: 2, revealed: true, answers: { [slot]: checks[slot].correctIndex }, showCheckAnswers: true };
      const starter = ['de','fr','es'].includes(language) ? app.starter.createStarterSessions(language, inventory[language]) : null;
      const save = starter ? starter.saveStarterLessonSession : language === 'tr' ? app.tr.saveTurkishLessonSession : app.ru.saveRussianLessonSession;
      const load = starter ? starter.loadStarterLessonSession : language === 'tr' ? app.tr.loadTurkishLessonSession : app.ru.loadRussianLessonSession;
      await save(lesson.id, session);
      const restored = await load(lesson.id);
      assert.deepEqual(restored.answers, session.answers, platform + language + ': added answer slots persist');
      assert.equal(restored.checksRevision, LESSON_ASSESSMENT_REVISION);
      assert.equal(restored.stage, session.stage);
      assert.equal(restored.sentenceIndex, session.sentenceIndex);
      const key = starter ? `${language}_starter_lesson_sessions_v1` : language === 'tr' ? app.tr.TURKISH_STUDY_STORAGE_KEY : app.ru.RUSSIAN_STUDY_STORAGE_KEY;
      const raw = JSON.parse(globalThis.__practicalMemory.get(key));
      raw.sessions[lesson.id].checksRevision = language === 'ru' ? app.previousRussianRevisionFor(lesson.id) : app.revisions.practicalAssessmentRevision(language, lesson.id);
      raw.sessions[lesson.id].answers = { 0: 1 };
      const previousRaw = JSON.stringify(raw);
      globalThis.__practicalMemory.set(key, previousRaw);
      const upgraded = await load(lesson.id);
      assert.deepEqual(upgraded.answers, { 0: 1 }, 'valid original authored answers survive augmentation');
      assert.equal(upgraded.showCheckAnswers, false, 'new questions are not accidentally revealed');
      assert.equal(globalThis.__practicalMemory.get(key), previousRaw, 'migration read never rewrites history');
    }
  }
  // Changed assessment revisions must never retire unchanged sentence outcomes.
  const lessonId = inventory.en.find(l => l.levelId === 1).id;
  await app.outcomes.saveLessonOutcome('en', lessonId, { speaking: { average: 90, scores: { original: 90 }, at: 'now' } });
  assert.equal((await app.outcomes.getLessonOutcome('en', lessonId)).speaking.average, 90);
  console.log(`Adaptive assessment passed: ${lessons} lessons, ${questions} questions, ${pairs} complete sentence pairs, untouched curriculum, unique evidence IDs, 5–8 counts, skill variety and web/native added-answer round trips.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
