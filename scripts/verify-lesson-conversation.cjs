const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

(async () => {
  const output = path.resolve('node_modules/.cache/lesson-conversation-test.cjs');
  await esbuild.build({
    stdin: {
      contents: [
        "export { SENTENCE_LESSONS } from './lib/courseContent';",
        "export { RUSSIAN_LESSONS } from './lib/languages/russian';",
        "export { TURKISH_LESSONS } from './lib/languages/turkish';",
        "export { NEW_COURSES } from './lib/languages/newCourses';",
        "export { starterDisplayDialogue } from './lib/languages/starterEditorial';",
        "export * from './lib/lessonConversation';",
      ].join('\n'),
      resolveDir: process.cwd(),
    },
    outfile: output,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    plugins: [{ name: 'device-stubs', setup(build) {
      build.onResolve({ filter: /^react-native$/ }, () => ({ path: 'react-native', namespace: 'stub' }));
      build.onResolve({ filter: /^@react-native-async-storage\/async-storage$/ }, () => ({ path: 'storage', namespace: 'stub' }));
      build.onResolve({ filter: /createCourseProgressStore$/ }, () => ({ path: 'progress', namespace: 'stub' }));
      build.onLoad({ filter: /.*/, namespace: 'stub' }, args => ({
        loader: 'js',
        contents: args.path === 'react-native'
          ? 'export const Platform={OS:"web"};'
          : args.path === 'storage'
            ? 'export default {getItem:async()=>null,setItem:async()=>{},removeItem:async()=>{}};'
            : 'export const createCourseProgressStore=()=>({});',
      }));
    } }],
  });
  const mod = { exports: {} };
  new Function('module', 'exports', require('node:fs').readFileSync(output, 'utf8'))(mod, mod.exports);
  const { SENTENCE_LESSONS, RUSSIAN_LESSONS, TURKISH_LESSONS, NEW_COURSES, starterDisplayDialogue, normalizeLessonConversation, isLessonConversationSession, withInferredDialogueRoles } = mod.exports;
  const check = (condition, message) => assert.ok(condition, message);

  check(SENTENCE_LESSONS.length > 0 && RUSSIAN_LESSONS.length > 0 && TURKISH_LESSONS.length > 0, 'all course catalogues load');
  for (const lesson of SENTENCE_LESSONS) {
    check(lesson.dialogue.length >= 2, `English ${lesson.id} has a dialogue`);
    check(lesson.dialogue.every(line => line.text.trim() && line.fa.trim()), `English ${lesson.id} dialogue lines are complete`);
    check(lesson.dialogue.every(line => line.role === line.speaker), `English ${lesson.id} has explicit roles`);
    check(new Set(lesson.dialogue.map(line => line.role)).size === 2, `English ${lesson.id} has learner and partner roles`);
  }
  for (const lesson of RUSSIAN_LESSONS) {
    check(lesson.dialogue.length >= 2, `Russian ${lesson.id} has a dialogue`);
    check(lesson.dialogue.every(line => line.text.trim() && line.fa.trim()), `Russian ${lesson.id} dialogue lines are complete`);
    const learnerSpeakers = new Set(lesson.dialogue.filter(line => line.role === 'learner').map(line => line.speaker));
    const partnerSpeakers = new Set(lesson.dialogue.filter(line => line.role === 'partner').map(line => line.speaker));
    check(learnerSpeakers.size === 1 && partnerSpeakers.size >= 1, `Russian ${lesson.id} has one explicit learner and at least one partner role`);
  }
  for (const [id, course] of [['tr', { lessons: TURKISH_LESSONS }], ...['de', 'fr', 'es'].map(code => [code, NEW_COURSES[code]])]) {
    for (const lesson of course.lessons) {
      const sourceDialogue = id === 'tr' ? lesson.dialogue : starterDisplayDialogue(lesson);
      if (sourceDialogue.length) {
        const roled = withInferredDialogueRoles(sourceDialogue);
        check(roled.length >= 2 && roled.every(line => line.text.trim() && line.fa.trim()), `${id} ${lesson.id} dialogue lines are complete`);
        check(new Set(roled.map(line => line.role)).size === 2, `${id} ${lesson.id} resolves distinct partner and learner roles`);
      } else {
        check(lesson.sentences.length >= 2, `${id} ${lesson.id} fallback sentences provide conversation turns`);
      }
    }
  }

  const restored = normalizeLessonConversation({ started: true, currentTurn: 3, myRole: 'learner', attempts: 2, revealed: true, completed: false }, 5, ['partner', 'learner'], 'learner');
  check(isLessonConversationSession(restored), 'conversation session is serializable and valid');
  check(restored.started && restored.currentTurn === 3 && restored.myRole === 'learner', 'conversation resumes the saved turn and role');
  const completed = normalizeLessonConversation({ started: true, currentTurn: 99, myRole: 'learner', attempts: 4, revealed: false, completed: false }, 5, ['partner', 'learner'], 'learner');
  check(completed.completed && completed.currentTurn === 5, 'conversation clamps and marks a completed transcript');

  const room = fs.readFileSync('components/LessonConversationRoom.tsx', 'utf8');
  const english = fs.readFileSync('components/EnglishLessonRoute.tsx', 'utf8');
  const russian = fs.readFileSync('components/RussianLesson.tsx', 'utf8');
  const starter = fs.readFileSync('components/StarterLesson.tsx', 'utf8');
  const turkish = fs.readFileSync('components/TurkishLesson.tsx', 'utf8');
  const arabic = fs.readFileSync('components/arabic/ArabicLessonScreen.tsx', 'utf8');
  check(room.includes('normalizeLessonConversation') && room.includes('onSessionChange') && room.includes('initialSession'), 'room hydrates and emits durable state');
  check(room.includes("'oral-exam'") && room.includes('blindExam') && room.includes('saveLessonOutcome'), 'room provides blind oral exam mode and durable outcome grading');
  for (const [label, src] of [['English', english], ['Russian', russian], ['DE/FR/ES', starter], ['Turkish', turkish], ['Arabic', arabic]]) {
    check(src.includes('onSessionChange={setConversation}') && src.includes('initialSession={conversation}') && src.includes('<LessonConversationRoom') && src.includes('<RealConversationEntry'), `${label} wires LessonConversationRoom with durable session persistence`);
    check(!src.includes('ابتدا تمرین مکالمهٔ همین درس را کامل کنید'), `${label} keeps the conversation room optional instead of blocking lesson completion`);
  }
  console.log(`PASS: ${SENTENCE_LESSONS.length} English, ${RUSSIAN_LESSONS.length} Russian, ${TURKISH_LESSONS.length} Turkish, and DE/FR/ES lessons have explicit conversation roles, durable resume state, optional oral exam mode, and real grading.`);
})().catch(error => { console.error(error); process.exit(1); });
