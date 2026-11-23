const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

(async () => {
  const output = path.resolve('node_modules/.cache/conversation-levels-test.cjs');
  await esbuild.build({
    stdin: {
      contents: [
        "export { SENTENCE_LESSONS } from './lib/courseContent';",
        "export { RUSSIAN_LESSONS } from './lib/languages/russian';",
        "export { TURKISH_LESSONS } from './lib/languages/turkish';",
        "export { NEW_COURSES } from './lib/languages/newCourses';",
        "export { starterDisplayDialogue } from './lib/languages/starterEditorial';",
        "export { withInferredDialogueRoles } from './lib/lessonConversation';",
        "export { conversationPracticeForLesson } from './lib/branchingConversation';",
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
      build.onLoad({ filter: /.*/, namespace: 'stub' }, args => ({ loader: 'js', contents: args.path === 'react-native' ? 'export const Platform={OS:"web"};' : args.path === 'storage' ? 'export default {getItem:async()=>null,setItem:async()=>{},removeItem:async()=>{}};' : 'export const createCourseProgressStore=()=>({});' }));
    } }],
  });
  const mod = { exports: {} };
  new Function('module', 'exports', fs.readFileSync(output, 'utf8'))(mod, mod.exports);
  const modes = ['guided', 'controlled', 'semi-free', 'semantic', 'branching', 'open-roleplay'];
  const expected = { 0: 'Pre-A1', 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1' };
  let checked = 0;
  for (const [language, lessons, locale] of [
    ['English', mod.exports.SENTENCE_LESSONS, 'en-US'],
    ['Russian', mod.exports.RUSSIAN_LESSONS, 'ru-RU'],
    ['Turkish', mod.exports.TURKISH_LESSONS, 'tr-TR'],
    ['German', mod.exports.NEW_COURSES.de.lessons, 'de-DE'],
    ['French', mod.exports.NEW_COURSES.fr.lessons, 'fr-FR'],
    ['Spanish', mod.exports.NEW_COURSES.es.lessons, 'es-ES'],
  ]) {
    for (const lesson of lessons) {
      const rawDialogue = (language === 'German' || language === 'French' || language === 'Spanish')
        ? mod.exports.starterDisplayDialogue(lesson)
        : lesson.dialogue;
      const dialogue = (language === 'English' || language === 'Russian')
        ? rawDialogue
        : mod.exports.withInferredDialogueRoles(rawDialogue);
      const practice = mod.exports.conversationPracticeForLesson({ ...lesson, dialogue }, locale);
      assert.equal(practice.level, expected[lesson.levelId] || 'A1', `${language} ${lesson.id} level`);
      assert.ok(modes.includes(practice.mode), `${language} ${lesson.id} mode`);
      const learnerLines = dialogue.length
        ? dialogue.filter(line => line.role === 'learner' || line.speaker === 'learner')
        : lesson.sentences.filter((_, index) => index % 2 === 1);
      assert.ok(learnerLines.length > 0, `${language} ${lesson.id} learner lines`);
      assert.ok(learnerLines.every(line => Object.values(practice.turns).some(turn => turn.targetText === line.text.trim())), `${language} ${lesson.id} learner turns generated`);
      checked += 1;
    }
  }
  console.log(`PASS: ${checked} lessons across EN/RU/TR/DE/FR/ES receive level-aware conversation modes from Pre-A1 through C1.`);
})().catch(error => { console.error(error); process.exit(1); });
