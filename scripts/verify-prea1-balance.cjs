const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const { loadInventory, verifyScope } = require('./helpers/practical-inventory.cjs');
const { modules } = require('./helpers/practical-storage.cjs');
const before = require('./fixtures/prea1-balance-before.json');
const expected = {
  'prea1-05-numbers': 12, 'prea1-07-i-have': 10, 'prea1-09-this-is': 10, 'prea1-12-people': 10, 'prea1-13-every-day': 10,
  'de-foundation-words-2': 10, 'de-pre-5': 10, 'de-pre-6': 10, 'de-pre-11': 10, 'de-pre-20': 10, 'de-pre-21': 12,
  'fr-pre-5': 13, 'fr-pre-11': 10, 'fr-pre-12': 10, 'fr-pre-13': 10, 'fr-pre-20': 12, 'fr-pre-21': 12,
  'es-pre-5': 13, 'es-pre-8': 10, 'es-pre-11': 10, 'es-pre-12': 10, 'es-pre-13': 10, 'es-pre-20': 12, 'es-pre-21': 12,
  'tr-prea1-descriptions-and-family': 10, 'tr-prea1-08-simple-questions': 12, 'tr-prea1-time-and-calendar-sentences': 10, 'tr-prea1-10-first-conversation': 10,
  'ar-prea1-02-first-words-core-nouns': 17, 'ar-prea1-03-basic-family-home-objects': 14, 'ar-prea1-04-food-colors-numbers-places': 16, 'ar-prea1-05-adjectives-verbs-time-feelings': 12,
};
(async () => {
  const inventory = await loadInventory(); verifyScope(inventory);
  const app = await modules(); const { SAMPLE_BALANCE: plans, BALANCED_PRE_A1_REVISION: version } = app.balanceRevision;
  assert.deepEqual(Object.keys(plans).sort(), Object.keys(expected).sort());
  const counts = { en: 124, de: 230, fr: 235, es: 237, tr: 210, ar: 189 };
  for (const [language, total] of Object.entries(counts)) {
    const lessons = inventory[language].filter(l => l.levelId === 0);
    assert.equal(lessons.reduce((n, l) => n + l.sentences.length, 0), total);
    for (const lesson of lessons) {
      const texts = lesson.sentences.map(s => s.text ?? s.en ?? s.ar);
      assert.equal(new Set(texts).size, texts.length, lesson.id + ': no padding with duplicate examples');
      if (expected[lesson.id]) assert.equal(lesson.sentences.length, expected[lesson.id]);
      else assert.equal(lesson.sentences.length, before[language].find(l => l.id === lesson.id).sentences.length);
      if (plans[lesson.id]) {
        assert.equal(app.balanceRevision.practicalRoomRevision(lesson.id), version);
      }
    }
  }
  const lesson = (lang, id) => inventory[lang].find(l => l.id === id);
  assert.deepEqual(lesson('de', 'de-foundation-words-2').sentences.map(s => s.text), ['eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn']);
  assert.deepEqual(lesson('en', 'prea1-05-numbers').sentences.slice(0, 10).map(s => s.en), ['One.', 'Two.', 'Three.', 'Four.', 'Five.', 'Six.', 'Seven.', 'Eight.', 'Nine.', 'Ten.']);
  for (const [lang, names] of [['fr', ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']], ['es', ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']], ['de', ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']]]) {
    const text = lesson(lang, `${lang}-pre-20`).sentences.map(s => s.text).join(' ').toLowerCase();
    for (const name of names) assert.ok(text.includes(name.toLowerCase()), lang + ': all seven weekdays are taught');
  }
  for (const id of Object.keys(plans).filter(id => plans[id].language === 'ar')) {
    const current = lesson('ar', id);
    assert.equal(current.dialogue.length, 0);
    for (const sentence of current.sentences) assert.ok(!/[،,\/]/.test(sentence.ar), id + ': no bundled word-list cards');
    assert.ok(current.checks.every(check => check.id.endsWith(version)), 'revised Arabic questions have disjoint IDs from the previous revision');
    for (const check of current.checks) if (check.options) {
      const accepted = check.options.filter(option => check.answers.some(answer => app.normalizeArabic(answer) === app.normalizeArabic(option)));
      assert.equal(accepted.length, 1, id + ': precisely one accepted choice under the real Arabic normalizer');
    }
  }
  // Every old position, on web and native storage, reopens at the same stable original sentence ID.
  // Merely reading never rewrites a store or changes historical completion/day/evidence records.
  globalThis.__practicalMemory = new Map();
  globalThis.window = { localStorage: { getItem: k => globalThis.__practicalMemory.get(k) ?? null, setItem: (k, v) => globalThis.__practicalMemory.set(k, v) } };
  let positions = 0;
  for (const platform of ['web', 'android']) {
    globalThis.__practicalOS = platform;
    for (const [id, plan] of Object.entries(plans)) {
      const lang = plan.language, current = lesson(lang, id), old = before[lang].find(l => l.id === id);
      const starter = ['de', 'fr', 'es'].includes(lang) ? app.starter.createStarterSessions(lang, inventory[lang]) : null;
      const key = starter ? `${lang}_starter_lesson_sessions_v1` : lang === 'en' ? app.en.STUDY_KEY : lang === 'ar' ? app.ar.ARABIC_STUDY_KEY : app.tr.TURKISH_STUDY_STORAGE_KEY;
      const load = starter ? () => starter.loadStarterLessonSession(id) : lang === 'tr' ? () => app.tr.loadTurkishLessonSession(id) : async () => (await (lang === 'en' ? app.en.loadStudy() : app.ar.loadArabicStudy())).sessions[id];
      const save = starter ? session => starter.saveStarterLessonSession(id, session) : lang === 'tr' ? session => app.tr.saveTurkishLessonSession(id, session) : lang === 'en' ? session => app.en.saveLessonSession(id, session) : session => app.ar.saveArabicLessonSession(id, session);
      for (let index = 0; index < old.sentences.length; index++) {
        const saved = { stage: 3, stageVersion: 2, sentenceIndex: index, revealed: true, answers: { 0: 1 }, showCheckAnswers: true, evidencePassed: true, attempt: { generation: 2, id: 'before-balance' }, attemptEvidence: { oldQuestion: true }, checksRevision: 'pre-a1-practical-six-v1' };
        const historical = { version: 1, sessions: { [id]: saved }, days: { '2026-11-01': 12000 }, lessonEvidence: { [id]: { oldQuestion: { skill: 'reading', correct: true, heard: false, attempts: 2 } } } };
        const raw = JSON.stringify(starter || lang === 'tr' ? { schema: 1, sessions: { [id]: saved } } : historical);
        globalThis.__practicalMemory.set(key, raw);
        globalThis.__practicalMemory.set('balance-progress-sentinel', 'historical-completion-is-not-reset');
        const restored = await load();
        assert.equal(restored.stage, 3); assert.equal(restored.sampleRevision, version);
        assert.equal(current.sentences[restored.sentenceIndex].id, old.sentences[index].id, `${platform} ${id} old index ${index}`);
        assert.equal(globalThis.__practicalMemory.get(key), raw, 'read is non-destructive');
        if (app.balanceRevision.balancedAssessmentRevision(lang, id)) {
          if (starter || lang === 'tr') { assert.deepEqual(restored.answers, {}); assert.equal(restored.showCheckAnswers, false); }
          else { assert.equal(restored.evidencePassed, false); assert.deepEqual(restored.attemptEvidence, {}); }
        } else if (lang === 'en') assert.equal(restored.evidencePassed, true, 'unchanged English checks keep valid evidence');
        await save(restored); const reloaded = await load();
        assert.equal(reloaded.sentenceIndex, restored.sentenceIndex, 'mapping is applied once, not on every reload');
        assert.equal(globalThis.__practicalMemory.get('balance-progress-sentinel'), 'historical-completion-is-not-reset');
        if (lang === 'en' || lang === 'ar') {
          const persisted = JSON.parse(globalThis.__practicalMemory.get(key)); assert.deepEqual(persisted.days, historical.days); assert.deepEqual(persisted.lessonEvidence, historical.lessonEvidence);
        }
        positions++;
      }
      const oldOutcome = { speaking: { average: 100, scores: { [old.sentences[0].id]: 100 }, at: 'old' }, assessment: { correct: 3, total: 3, at: 'old' } };
      globalThis.__practicalMemory.set('milo_lesson_outcomes_v1', JSON.stringify({ [`${lang}:${id}`]: oldOutcome }));
      assert.equal((await app.outcomes.getLessonOutcome(lang, id)).speaking, undefined, 'old denominator/content is not a new speaking result');
      assert.deepEqual((await app.outcomes.loadLessonOutcomes())[`${lang}:${id}`], oldOutcome, 'historical outcome survives');
    }
  }
  // The actual Arabic chunk expression keeps these newly split word lists on their original ten-stage path.
  const source = fs.readFileSync('components/arabic/ArabicLessonScreen.tsx', 'utf8');
  const ast = ts.createSourceFile('ArabicLessonScreen.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX); let expression;
  function visit(node) { if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'chunks') expression = node.initializer.getText(ast); ts.forEachChild(node, visit); } visit(ast);
  const chunkFor = new Function('lesson', 'lessonChunks', 'doneChunks', `return (${expression});`);
  for (const n of [8, 12, 14, 16, 17]) {
    const state = chunkFor({ id: 'test', levelId: 0, sentences: Array(n) }, app.chunks.lessonChunks, []);
    assert.equal(state.chunked, false); assert.equal(state.end, n);
  }
  assert.equal(chunkFor({ id: 'test-a1', levelId: 1, sentences: Array(25) }, app.chunks.lessonChunks, []).chunked, true, 'higher-level chunks are untouched');
  console.log(`Pre-A1 balance passed: 140 lessons, 1225 independent examples, 32 targeted plans, full number/day coverage, ${positions} web/native saved-position round trips, scoped answer/score revisions, original IDs and progress retained, unchanged Russian/A1–C1 and ten-stage flow.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
