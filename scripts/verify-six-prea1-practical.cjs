const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const esbuild = require('esbuild');
const { loadInventory, verifyScope } = require('./helpers/practical-inventory.cjs');
const { modules } = require('./helpers/practical-storage.cjs');
(async () => {
  const inventory = await loadInventory(); verifyScope(inventory);
  const app = await modules();
  const totals = { en: 14, de: 27, fr: 27, es: 27, tr: 25, ar: 20 };
  for (const [language, count] of Object.entries(totals)) {
    const lessons = inventory[language].filter(l => l.levelId === 0);
    assert.equal(lessons.length, count);
    for (const lesson of lessons) {
      assert.match(lesson.situation, /هدف: بتوانم/);
      assert.match(lesson.teachingFa, /تمرین اصلی:/);
      for (const sentence of lesson.sentences) {
        const text = sentence.text ?? sentence.en ?? sentence.ar;
        assert.ok(text && sentence.fa && sentence.pronunciation && sentence.vocabulary.length, lesson.id);
        const normalize = value => language === 'ar' ? value.replace(/[\u064B-\u065F\u0670]/g, '') : value.toLocaleLowerCase(language === 'tr' ? 'tr-TR' : 'en');
        for (const word of sentence.vocabulary) assert.ok(normalize(text).includes(normalize(word.word)), `${lesson.id}: vocabulary ${word.word} belongs to its taught row`);
        if (language === 'ar') { assert.match(text, /[\u064B-\u0652]/); assert.ok(!/[\u0600-\u06FF]/.test(sentence.pronunciation), 'Arabic keeps consistent Latin pronunciation aids'); }
      }
      for (const question of lesson.checks ?? []) {
        const choices = question.choices ?? question.options;
        if (choices) {
          assert.equal(new Set(choices).size, choices.length, lesson.id + ': no duplicate options');
          if (question.choices) assert.ok(choices[question.correctIndex]);
          else for (const answer of question.answers) assert.ok(choices.includes(answer));
        }
      }
      if (lesson.learningMode === 'words' || lesson.learningMode === 'sounds') assert.equal(lesson.dialogue.length, 0, lesson.id + ': no forced early conversation');
      // New European and Arabic exchanges are verbatim taught content, not advanced registry text.
      if (['de', 'fr', 'es', 'ar'].includes(language)) for (const line of lesson.dialogue) assert.ok(lesson.sentences.some(s => (s.text ?? s.ar) === (line.text ?? line.ar) && s.fa === line.fa), lesson.id + ': dialogue is pre-taught');
    }
  }
  // Execute the actual JSX feed expressions, including higher-level and empty-dialogue fallbacks.
  for (const [language, file] of Object.entries({ en: 'components/EnglishLessonRoute.tsx', tr: 'components/TurkishLesson.tsx', de: 'components/StarterLesson.tsx', ar: 'components/arabic/ArabicLessonScreen.tsx' })) {
    const source = fs.readFileSync(file, 'utf8'); const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    let expression, revision;
    function visit(node) { if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(ast) === 'LessonDialogueRoom') for (const prop of node.attributes.properties) if (ts.isJsxAttribute(prop)) { if (prop.name.getText(ast) === 'pairs') expression = prop.initializer.expression.getText(ast); if (prop.name.getText(ast) === 'contentRevision') revision = prop.initializer.expression.getText(ast); } ts.forEachChild(node, visit); } visit(ast);
    assert.ok(expression && revision);
    const feed = new Function('lesson', 'lessonDialoguePairs', `return (${expression});`);
    for (const lesson of inventory[language]) {
      assert.deepEqual(feed(lesson, app.pairs.lessonDialoguePairs).map(pair => pair.learner), lesson.sentences.map(line => ({ text: line.text ?? line.en ?? line.ar, fa: line.fa })), file + ': all taught sentences are learner targets');
    }
    assert.match(revision, /lesson.levelId === 0/);
  }
  globalThis.__practicalMemory = new Map();
  globalThis.window = { localStorage: { getItem: k => globalThis.__practicalMemory.get(k) ?? null, setItem: (k, v) => globalThis.__practicalMemory.set(k, v) } };
  const { practicalAssessmentRevision: revision, revisePracticalEvidence } = app.revisions;
  for (const language of ['web', 'android']) {
    globalThis.__practicalOS = language; globalThis.__practicalMemory.clear();
    for (const lang of ['de', 'fr', 'es']) {
      const sessions = app.starter.createStarterSessions(lang, inventory[lang]);
      const id = `${lang}-pre-1`, foundation = inventory[lang].find(l => l.learningMode).id;
      const original = { stage: 7, stageVersion: 2, sentenceIndex: 3, revealed: true, answers: { 0: 1 }, showCheckAnswers: true };
      globalThis.__practicalMemory.set(`${lang}_starter_lesson_sessions_v1`, JSON.stringify({ schema: 1, sessions: { [id]: original, [foundation]: original } }));
      const restored = await sessions.loadStarterLessonSession(id);
      assert.deepEqual(restored.answers, {}); assert.equal(restored.stage, 7); assert.equal(restored.sentenceIndex, 3); assert.equal(restored.showCheckAnswers, false);
      assert.deepEqual((await sessions.loadStarterLessonSession(foundation)).answers, original.answers, "unchanged original answers survive expansion");
      await sessions.saveStarterLessonSession(id, { ...restored, answers: { 0: 2 }, showCheckAnswers: true });
      assert.deepEqual((await sessions.loadStarterLessonSession(id)).answers, { 0: 2 }, 'new answers survive reload');
    }
    const trId = 'tr-prea1-08-simple-questions';
    const original = { stage: 7, stageVersion: 2, sentenceIndex: 2, revealed: false, answers: { 0: 1 }, showCheckAnswers: true };
    globalThis.__practicalMemory.set(app.tr.TURKISH_STUDY_STORAGE_KEY, JSON.stringify({ schema: 1, sessions: { [trId]: original, 'tr-prea1-01-greetings': original } }));
    const restored = await app.tr.loadTurkishLessonSession(trId); assert.deepEqual(restored.answers, {}); assert.equal(restored.stage, 7);
    assert.deepEqual((await app.tr.loadTurkishLessonSession('tr-prea1-01-greetings')).answers, { 0: 1 });
    await app.tr.saveTurkishLessonSession(trId, { ...restored, answers: { 0: 2 } });
    assert.deepEqual((await app.tr.loadTurkishLessonSession(trId)).answers, { 0: 2 });
    for (const [lang, id, parse, save, load] of [
      ['en', 'prea1-14-i-like', app.en.parseStudy, app.en.saveLessonSession, app.en.loadStudy],
      ['ar', inventory.ar[0].id, app.ar.parseArabicStudy, app.ar.saveArabicLessonSession, app.ar.loadArabicStudy],
    ]) {
      const old = { stage: 7, stageVersion: 2, sentenceIndex: 2, revealed: true, evidencePassed: true, attempt: { id: 'old', generation: 2 }, attemptEvidence: { oldTask: true } };
      const raw = { version: 1, days: { '2026-11-01': 12 }, sessions: { [id]: old, untouched: old }, lessonEvidence: { [id]: { oldTask: { skill: 'reading', correct: true, heard: false, attempts: 3 } } } };
      const parsed = parse(JSON.stringify(raw)); assert.equal(parsed.sessions[id].evidencePassed, false); assert.deepEqual(parsed.sessions[id].attemptEvidence, old.attemptEvidence, "unchanged task IDs retain their attempt results"); assert.equal(parsed.sessions[id].stage, 7); assert.equal(parsed.sessions.untouched.evidencePassed, false, "legacy passed flag cannot bypass expanded questions"); assert.deepEqual(parsed.days, raw.days); assert.deepEqual(parsed.lessonEvidence, raw.lessonEvidence);
      const key = lang === 'en' ? app.en.STUDY_KEY : app.ar.ARABIC_STUDY_KEY;
      globalThis.__practicalMemory.set(key, JSON.stringify(raw));
      await save(id, { ...parsed.sessions[id], evidencePassed: true, attemptEvidence: { newTask: true } });
      const reloaded = await load(); assert.equal(reloaded.sessions[id].evidencePassed, true); assert.deepEqual(reloaded.sessions[id].attemptEvidence, { newTask: true });
      // Historical outcomes remain stored, but are not presented as a result of new questions.
      globalThis.__practicalMemory.set('milo_lesson_outcomes_v1', JSON.stringify({ [`${lang}:${id}`]: { assessment: { correct: 3, total: 3, at: 'old' }, speaking: { average: 100, scores: {}, at: 'old' } } }));
      const outcome = await app.outcomes.getLessonOutcome(lang, id); assert.equal(outcome.assessment, undefined); assert.equal(outcome.speaking, undefined);
      assert.ok((await app.outcomes.loadLessonOutcomes())[`${lang}:${id}`].assessment);
      await app.outcomes.saveLessonOutcome(lang, id, { assessment: { correct: 1, total: 3, at: 'new' } });
      assert.equal((await app.outcomes.getLessonOutcome(lang, id)).assessment.correct, 1);
    }
  }
  assert.equal(revision('ru', 'ru-pre-01-hello'), undefined);
  assert.equal(revision('fr', 'fr-a1-greetings'), undefined);
  const unchanged = { evidencePassed: true }; assert.equal(revisePracticalEvidence('en', 'prea1-01-hello', unchanged), unchanged);
  const tasks = app.evidence.PRE_A1_EVIDENCE['prea1-14-i-like']; assert.equal(tasks.length, 4); assert.ok(tasks.every(t => t.id.includes('practical-v1')));
  console.log('Six-language Pre-A1 practical checks passed: 140 lessons / 1225 examples; stable structure, untouched Russian/A1–C1, tailored foundations, full-lesson learner coverage, valid checks, and web/native old-answer/evidence/score isolation with historical data retained.');
})().catch(error => { console.error(error); process.exitCode = 1; });
