const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

(async () => {
  const outfile = path.resolve('node_modules/.cache/shared-level-test.cjs');
  // sharedLevel pulls the local course-progress chain, which touches native
  // modules; stub them so the pure level/lesson logic can run under node.
  const stubNative = {
    name: 'stub-native',
    setup(build) {
      build.onResolve({ filter: /^react-native$/ }, () => ({ path: 'react-native', namespace: 'stub' }));
      build.onResolve({ filter: /^@react-native-async-storage\/async-storage$/ }, () => ({ path: 'async-storage', namespace: 'stub' }));
      build.onResolve({ filter: /^expo$/ }, () => ({ path: 'expo', namespace: 'stub' }));
      build.onResolve({ filter: /milo-chat-foreground/ }, () => ({ path: 'milo-chat-foreground', namespace: 'stub' }));
      build.onResolve({ filter: /^@\// }, (args) => {
        const base = path.resolve(args.path.replace(/^@\//, ''));
        const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, path.join(base, 'index.ts'), path.join(base, 'index.tsx'), path.join(base, 'index.js')];
        const found = candidates.find(candidate => {
          try { return fs.statSync(candidate).isFile(); } catch { return false; }
        });
        return { path: found || base };
      });
      build.onLoad({ filter: /.*/, namespace: 'stub' }, (args) => {
        if (args.path === 'react-native') {
          return { contents: 'module.exports = { Platform: { OS: "ios" } };', loader: 'js' };
        }
        if (args.path === 'expo') {
          return { contents: 'module.exports = { requireNativeModule: () => ({}) };', loader: 'js' };
        }
        if (args.path === 'milo-chat-foreground') {
          return { contents: 'module.exports = { startChatForegroundService: () => {}, stopChatForegroundService: () => {} };', loader: 'js' };
        }
        return { contents: 'module.exports = { getItem: async () => null, setItem: async () => {}, removeItem: async () => {}, multiGet: async () => [] };', loader: 'js' };
      });
    },
  };
  await esbuild.build({
    stdin: {
      contents: "export * from './lib/sharedLevel'; export * from './lib/turnConversation'; export { SENTENCE_LESSONS } from './lib/courseContent'; export { RUSSIAN_LESSONS } from './lib/languages/russian';",
      resolveDir: '.',
    },
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile,
    plugins: [stubNative],
  });
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', fs.readFileSync(outfile, 'utf8'))(mod, mod.exports, require);
  const api = mod.exports;

  // --- Encoding / parsing completed levels for both English & Russian -------
  const encoded = api.encodeCourseLevels({ en: [0, 1, 2], ru: [0] });
  assert.equal(encoded, 'en:0,1,2;ru:0');
  const parsed = api.parseStoredCourseLevels(encoded);
  assert.deepEqual(parsed.en.completed, [0, 1, 2]);
  assert.deepEqual(parsed.ru.completed, [0]);
  assert.equal(parsed.en.known, true);
  assert.equal(parsed.ru.known, true);

  const emptyEncoded = api.encodeCourseLevels({ en: [], ru: [] });
  assert.equal(emptyEncoded, 'en:-;ru:-');
  const emptyParsed = api.parseStoredCourseLevels(emptyEncoded);
  assert.deepEqual(emptyParsed.en.completed, []);
  assert.deepEqual(emptyParsed.ru.completed, []);

  // Legacy values
  assert.deepEqual(api.parseStoredCourseLevels('Foundation').en.completed, []);
  assert.deepEqual(api.parseStoredCourseLevels(null).en.completed, []);
  assert.deepEqual(api.parseStoredCourseLevels('A2').en.completed, [0, 1, 2]);
  assert.equal(api.levelIdFromStoredLevel('A2', 'en'), 2);
  assert.equal(api.levelIdFromStoredLevel('Foundation', 'en'), 0);
  assert.equal(api.cefrOfLevel(0), 'Pre-A1');
  assert.equal(api.cefrOfLevel(3), 'B1');
  assert.equal(api.cefrOfLevel(99), 'C1');
  assert.equal(api.cefrOfLevel(-2), 'Pre-A1');

  // --- Completed level detection from course progress -----------------------
  const a1Lessons = api.SENTENCE_LESSONS.filter(l => l.levelId === 1).map(l => l.id);
  const ruPreLessons = api.RUSSIAN_LESSONS.filter(l => l.levelId === 0).map(l => l.id);
  assert.deepEqual(api.completedLevelIdsFromProgress(api.SENTENCE_LESSONS, a1Lessons), [1]);
  assert.deepEqual(api.completedLevelIdsFromProgress(api.SENTENCE_LESSONS, a1Lessons.slice(0, 3)), []);
  assert.deepEqual(api.completedLevelIdsFromProgress(api.RUSSIAN_LESSONS, ruPreLessons), [0]);

  // --- Shared level: highest level BOTH learners have completed -------------
  const m1 = api.sharedCompletedLevel([0, 1, 2], [0, 1]);
  assert.equal(m1.sharedLevelId, 1);
  assert.equal(m1.myHighest, 2);
  assert.equal(m1.partnerHighest, 1);
  assert.equal(m1.bothCompleted, true);

  const m2 = api.sharedCompletedLevel([0, 2], [0, 1]);
  assert.equal(m2.sharedLevelId, 0, 'only level 0 is completed by both');
  assert.equal(m2.bothCompleted, true);

  const m3 = api.sharedCompletedLevel([0, 1], []);
  assert.equal(m3.sharedLevelId, 0, 'falls back to Pre-A1 when partner completed nothing');
  assert.equal(m3.partnerHighest, null);
  assert.equal(m3.bothCompleted, false);

  assert.equal(api.sharedLevelOf(3, 2), 2);
  assert.equal(api.sharedLevelOf(0, 5), 0);

  // --- Lessons & level-adapted turn plans for BOTH English & Russian --------
  const expectedTurns = [3, 4, 5, 5, 6, 6];
  for (const language of ['en', 'ru']) {
    for (const levelId of [0, 1, 2, 3, 4, 5]) {
      const lessons = api.lessonsOfLevel(levelId, language);
      assert.ok(lessons.length > 0, `${language} level ${levelId} has lessons`);
      assert.ok(lessons.every(lesson => lesson.levelId === levelId && lesson.language === language), `${language} level ${levelId} lessons are scoped`);
      const orders = lessons.map(lesson => lesson.order);
      assert.deepEqual(orders, [...orders].sort((a, b) => a - b), `${language} level ${levelId} lessons are in course order`);

      const sampleLesson = lessons[0];
      assert.equal(api.findSharedLesson(sampleLesson.id)?.language, language);
      const plan = api.buildLessonTurnPlan(sampleLesson, language);
      assert.equal(plan.language, language);
      assert.equal(plan.turns.length, expectedTurns[levelId], `${language} level ${levelId} has ${expectedTurns[levelId]} turns`);
      assert.equal(plan.levelLabel, api.cefrOfLevel(levelId));
      assert.equal(plan.topicFa, sampleLesson.title);
      assert.equal(plan.missionFa, sampleLesson.situation);
      assert.ok(plan.difficultyLabel, 'difficultyLabel is set');

      for (const turn of plan.turns) {
        for (const prompt of [turn.first, turn.second]) {
          assert.ok(prompt.text.trim().length > 0, 'prompt has a mission sentence');
          assert.ok(prompt.hint.trim().length > 0, 'prompt has a Persian hint');
          assert.equal(
            api.isAnswerOnMission(prompt.text, prompt),
            true,
            `${language} L${levelId} sentence accepted: ${prompt.text}`,
          );
          assert.equal(api.isAnswerOnMission('hi', prompt), false, 'generic greeting blocked');
          assert.equal(api.isAnswerOnMission('random weather banana', prompt), false, 'off-mission blocked');
        }
      }
    }
  }

  // --- Session boundary: a new lesson restarts the practice -----------------
  const ruLesson = api.lessonsOfLevel(1, 'ru')[0];
  const ruPlan = api.buildLessonTurnPlan(ruLesson, 'ru');
  const message = (id, senderId, body, type = 'text', seconds = 0) => ({
    id: String(id),
    conversationId: 'conversation',
    senderId,
    type,
    body,
    mediaPath: null,
    readAt: null,
    createdAt: new Date(2026, 0, 1, 0, 0, seconds).toISOString(),
  });
  const before = [
    message(1, 'me', 'Привет, меня зовут Сара.', 'text', 1),
    message(2, 'partner', 'Привет, меня зовут Али.', 'text', 2),
  ];
  const marker = message(3, 'me', `lesson:${ruLesson.id}`, 'system', 3);
  const after = [message(4, 'me', ruPlan.turns[0].first.text, 'text', 4)];
  const all = [...before, marker, ...after];

  const withBoundary = api.turnStateFromMessages(all, ruPlan, 'me', marker.createdAt);
  assert.equal(withBoundary.sessionAnswers.length, 1, 'answers before the lesson marker are dropped');
  assert.equal(withBoundary.sessionStart, 2, 'hidden answers are counted for the history note');
  assert.equal(withBoundary.sessionAnswers[0].id, '4');

  console.log('Shared-level checks passed: EN & RU, highest common completed level, scaled turns/difficulty, mission gate, session boundary');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
