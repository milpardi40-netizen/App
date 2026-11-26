// Exercise the actual compiled curriculum, branch resolver, offline catalogue and persisted attempts.
const assert = require('node:assert/strict');
const path = require('node:path');
const es = require('esbuild');
(async () => {
  const modules = ['russian', 'russianPreA1', 'russianStudyState', 'russianExchange', 'russianGrammar/catalog', 'russianGrammar/units', 'russianStarterRounds'];
  const result = await es.build({ stdin: { contents: modules.map(m => `export * from './lib/languages/${m}'`).join(';'), resolveDir: process.cwd() },
    platform: 'node', format: 'cjs', bundle: true, write: false, plugins: [{ name: 'local-stores', setup(b) {
      b.onResolve({filter:/^react-native$/}, () => ({ path: path.resolve('scripts/test-stubs/react-native.js') }));
      b.onResolve({filter:/^@react-native-async-storage\/async-storage$/}, () => ({ path:'disk', namespace:'qa' }));
      b.onResolve({filter:/createCourseProgressStore$/}, () => ({ path:'store', namespace:'qa' }));
      b.onLoad({filter:/.*/,namespace:'qa'}, a => ({contents:a.path === 'store' ? 'export const createCourseProgressStore=()=>({});' : 'export default {getItem:async k=>globalThis.storage.get(k)??null,setItem:async(k,v)=>globalThis.storage.set(k,v),removeItem:async k=>globalThis.storage.delete(k)}'}));
    } }] });
  const mod = {exports:{}}; new Function('module','exports',result.outputFiles[0].text)(mod,mod.exports); const x = mod.exports;
  const ids = [
    'ru-pre-01-hello', 'ru-pre-02-i-you-this-that', 'ru-pre-03-family-home', 'ru-pre-04-food-study-daily',
    'ru-pre-05-pronouns-family', 'ru-pre-06-people-objects', 'ru-pre-07-food-drinks', 'ru-pre-08-animals-colors',
    'ru-pre-09-numbers', 'ru-pre-10-days-places', 'ru-pre-11-adjectives', 'ru-pre-12-verbs',
    'ru-pre-13-greeting-name-phrases', 'ru-pre-14-polite-phrases', 'ru-pre-15-combos-pronoun-demo', 'ru-pre-16-combos-adj-verb',
    'ru-pre-17-sentences-be-have', 'ru-pre-18-sentences-verbs', 'ru-pre-19-questions-basic', 'ru-pre-20-questions-whose-yesno-count',
    'ru-pre-21-daily-identity-family-age', 'ru-pre-22-daily-likes-needs-wants', 'ru-pre-23-daily-descriptions',
    'ru-pre-29-numbers-teens', 'ru-pre-30-question-words-2', 'ru-pre-31-more-descriptions',
    'ru-pre-24-conv-greeting-intro', 'ru-pre-25-conv-family-home', 'ru-pre-26-conv-objects',
    'ru-pre-27-conv-food-shopping', 'ru-pre-28-conv-classroom',
  ];
  const lessons = x.RUSSIAN_LESSONS, starter = lessons.filter(l => l.levelId === 0);
  assert.deepEqual(starter.map(l => l.id), ids);
  starter.forEach(lesson => {
    assert.equal(x.starterStep(lesson.id), undefined);
    assert.deepEqual(lesson.sentences.map(s => s.id), Array.from({ length: 8 }, (_, i) => `${lesson.id}-${String(i + 1).padStart(2, '0')}`));
    assert.equal(lesson.dialogue.length, 4);
    assert.equal(lesson.checks.length, 3);
    for (const q of lesson.checks) {
      assert.equal(q.choices.length, 4);
      assert(q.correctIndex >= 0 && q.correctIndex < 4);
    }
  });
  for (const [mode, n] of [['exam', 20], ['practice', 10], ['warmup', 31]]) {
    for (const seed of [1, 2, 7, '2026-11-18']) {
      const items = x.russianStarterRound(lessons, mode, seed);
      assert.equal(items.length, n);
      for (const item of items) {
        const index = Number(item.sentenceId.slice(-2));
        assert(index >= 1 && index <= 8);
        assert(item.kind === 'listen' || item.kind === 'truefalse');
      }
    }
  }
  let paths = 0;
  for (const l of lessons) for (const starterRole of ['learner', 'partner']) {
    const scene = x.exchangeForLesson(l);
    const allowed = new Set([...l.sentences, ...l.dialogue].map(line => line.text + '|' + line.fa));
    function visit(picks) {
      const path = { starter: starterRole, picks }, view = x.exchangeView(scene, path);
      assert(x.validExchangePath(scene, path));
      assert(view.history.every(h => allowed.has(h.line.text + '|' + h.line.fa)), `Out-of-lesson model in ${l.id}`);
      if (view.history.length) assert.equal(view.history[0].who, starterRole);
      for (let i = 1; i < view.history.length; i++) assert.notEqual(view.history[i].who, view.history[i - 1].who);

      if (view.complete) {
        paths++;
        if (l.levelId === 1) assert.deepEqual(view.history.map(h => h.line.text), l.dialogue.map(d => d.text));
        return;
      }
      assert(view.options.every(m => x.replyPhrases(m.say).every(t => allowed.has(t + '|' + m.say.fa))));
      assert(view.options.length >= 1);
      assert.equal(new Set(view.options.map(m => x.plainRussian(m.reply?.text ?? m.say.text))).size, view.options.length, l.id);
      view.options.forEach((m, i) => {
        assert.equal(x.matchExchangeReply(m.say.text, view.options), i, `${l.id}: ${m.say.text}`);
        const nextView = x.exchangeView(scene, { starter: starterRole, picks: [...picks, i] });
        assert.equal(nextView.history.at(-1).line.text, m.reply?.text ?? m.say.text);
        visit([...picks, i]);
      });
    }
    visit([]);
    assert.equal(x.exchangeView(scene, { starter: starterRole, picks: [15] }), null);
  }
  // Test exact exchange matching and near-miss rejection on a Pre-A1 lesson dialogue.
  const l = lessons.find(l => l.id === 'ru-pre-18-sentences-verbs'), scene = x.exchangeForLesson(l);
  const turn = x.exchangeView(scene, { starter: 'partner', picks: [] });
  assert.deepEqual(turn.options.map(o => o.say.text), [l.dialogue[1].text]);
  const expectedReply = x.plainRussian(turn.options[0].say.text);
  for (const [text, i] of [[expectedReply, 0], [expectedReply.split(' ')[0], -1], ['нет спасибо', -1], ['', -1]])
    assert.equal(x.matchExchangeReply(text, turn.options), i);
  assert.equal(x.exchangeView(scene, { starter: 'learner', picks: [0] }).history.at(-1).line.text, l.dialogue[1].text);
  assert(x.validExchangePath(scene, { starter: 'partner', picks: [0], said: { 0: expectedReply } }));
  assert(!x.validExchangePath(scene, { starter: 'partner', picks: [0], said: { 0: 'нет' } }));

  const all = new Set(x.VERBS.map(v => v.lemma));
  assert.equal(all.size, x.VERBS.length);
  for (const v of x.VERBS) {
    assert(v.fa && v.forms.length && v.examples.length && v.level >= 0 && v.level <= 5);
    for (const s of v.examples) assert(s.fa && x.gapFor(s.text, s.form).includes('____'), v.lemma);
  }
  for (const l of lessons) for (const v of x.lessonVerbs(l.id)) assert(all.has(v));
  assert.deepEqual(x.GRAMMAR_BANDS.map((_, i) => x.GRAMMAR_UNITS.some(u => u.level === i)), Array(6).fill(true));
  assert(x.relatedUnits(l).some(u => u.id === 'want'));
  assert(x.lessonVerbs(l.id).includes('хотеть'));
  for (const u of x.GRAMMAR_UNITS) {
    assert(u.choices.includes(u.answer) && new Set(u.choices).size === u.choices.length);
    assert(u.examples.length >= 2 && u.examples.every(s => s.pronunciation && s.fa));
  }
  for (const platform of ['web', 'android']) {
    global.__RN_OS__ = platform;
    global.storage = new Map();
    global.window = { localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v), removeItem: k => storage.delete(k) } };
    const key = x.RUSSIAN_STUDY_STORAGE_KEY, old = { stage: 9, stageVersion: 2, sentenceIndex: 5, revealed: true, answers: { 0: 1 }, showCheckAnswers: true };
    const other = lessons.find(l => l.levelId === 5).id;
    storage.set(key, JSON.stringify({ schema: 1, sessions: { [l.id]: old, [other]: old } }));
    storage.set('sentence_course_progress_ru_v2', 'existing-completions-and-cards');
    const loaded = await x.loadRussianPositions();
    assert(!loaded.unreadable);
    assert.deepEqual(loaded.sessions[l.id].answers, {});
    assert.equal(loaded.sessions[l.id].showCheckAnswers, false);
    assert.equal(loaded.sessions[l.id].sentenceIndex, 5);
    assert.equal(loaded.sessions[l.id].stage, 9);
    assert.deepEqual(loaded.sessions[other].answers, old.answers);
    const ladder = x.RUSSIAN_LESSON_STAGES.length;
    const beginner = lessons.find(l => l.levelId === 1).id;
    storage.set(key, JSON.stringify({ schema: 1, sessions: { [beginner]: { stage: ladder - 1, stageVersion: undefined, sentenceIndex: 5, revealed: true, answers: { 0: 3 }, showCheckAnswers: true, exchange: { starter: 'partner', picks: [0] } } } }));
    const migrated = await x.loadRussianLessonSession(beginner);
    assert.equal(migrated.stage, ladder - 2);
    assert.deepEqual(migrated.answers, {});
    assert.equal(migrated.exchange, undefined);
    assert.equal(migrated.showCheckAnswers, false);
    storage.set(key, JSON.stringify({ schema: 1, sessions: { [l.id]: { ...old, stage: ladder, stageVersion: undefined } } }));
    assert.equal((await x.loadRussianLessonSession(l.id)).stage, ladder - 1);
    await x.saveRussianLessonSession(l.id, { ...old, stage: ladder - 1, exchange: { starter: 'partner', picks: [0], said: { 0: 'нет спасибо я хочу воду' } } });
    const saved = await x.loadRussianLessonSession(l.id);
    assert.equal(saved.stage, ladder - 1);
    assert.deepEqual(saved.answers, old.answers);
    assert(saved.showCheckAnswers);
    assert.equal(saved.exchange, undefined);
    await x.resetRussianLessonSession(l.id);
    assert.equal((await x.loadRussianLessonSession(l.id)).stage, 0);
    assert.equal(storage.get('sentence_course_progress_ru_v2'), 'existing-completions-and-cards');
  }
  console.log(`PASS: 31 Pre-A1 steps (zero-to-dialogue); ${paths} complete paths across all ${lessons.length} lessons; ${x.VERBS.length} verbs; ${x.GRAMMAR_UNITS.length} guided units; both session backends.`);
})().catch(e => { console.error(e); process.exitCode = 1; });
