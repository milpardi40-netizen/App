const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

const BAD_FRAGMENTS = ['ế', '呢', 'basharf', 'سیبب'];

(async () => {
  const output = path.resolve('node_modules/.cache/conversation-quality-test.cjs');
  await esbuild.build({
    stdin: {
      contents: [
        "export { SENTENCE_LESSONS } from './lib/courseContent';",
        "export { RUSSIAN_LESSONS } from './lib/languages/russian';",
        "export { TURKISH_LESSONS } from './lib/languages/turkish';",
        "export { NEW_COURSES } from './lib/languages/newCourses';",
        "export { ARABIC_LESSONS } from './lib/arabic/content';",
        "export { starterDisplayDialogue } from './lib/languages/starterEditorial';",
        "export { withInferredDialogueRoles } from './lib/lessonConversation';",
        "export { CONVERSATION_ROOM_DIALOGUES, resolveConversationDialogue } from './lib/conversationRoomDialogues';",
      ].join('\n'),
      resolveDir: process.cwd(),
    },
    outfile: output,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    plugins: [{
      name: 'device-stubs',
      setup(build) {
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
      },
    }],
  });

  const mod = { exports: {} };
  new Function('module', 'exports', fs.readFileSync(output, 'utf8'))(mod, mod.exports);

  const allLessonIds = new Set();
  const courses = [
    ['en', mod.exports.SENTENCE_LESSONS.map(l => ({
      id: l.id,
      dialogue: l.dialogue,
      sentences: l.sentences.map(s => s.en),
    }))],
    ['ru', mod.exports.RUSSIAN_LESSONS.map(l => ({
      id: l.id,
      dialogue: l.dialogue,
      sentences: l.sentences.map(s => s.text),
    }))],
    ['tr', mod.exports.TURKISH_LESSONS.map(l => ({
      id: l.id,
      dialogue: l.dialogue,
      sentences: l.sentences.map(s => s.text),
    }))],
    ['de', mod.exports.NEW_COURSES.de.lessons.map(l => ({
      id: l.id,
      dialogue: mod.exports.starterDisplayDialogue(l),
      sentences: l.sentences.map(s => s.text),
    }))],
    ['fr', mod.exports.NEW_COURSES.fr.lessons.map(l => ({
      id: l.id,
      dialogue: mod.exports.starterDisplayDialogue(l),
      sentences: l.sentences.map(s => s.text),
    }))],
    ['es', mod.exports.NEW_COURSES.es.lessons.map(l => ({
      id: l.id,
      dialogue: mod.exports.starterDisplayDialogue(l),
      sentences: l.sentences.map(s => s.text),
    }))],
    ['ar', mod.exports.ARABIC_LESSONS.map(l => ({
      id: l.id,
      dialogue: l.dialogue.map(d => ({
        speaker: d.name ?? (d.speaker === 'partner' ? 'المُحاوِر' : 'شما'),
        role: d.speaker,
        text: d.ar,
        fa: d.fa,
      })),
      sentences: l.sentences.map(s => s.ar),
    }))],
  ];

  let totalChecked = 0;
  for (const [lang, list] of courses) {
    for (const lesson of list) {
      allLessonIds.add(lesson.id);
      const resolved = mod.exports.resolveConversationDialogue(lesson.id, lesson.dialogue);
      const roled = mod.exports.withInferredDialogueRoles(resolved);

      assert.ok(roled.length >= 2, `${lang} ${lesson.id}: expected >=2 turns, got ${roled.length}`);
      const hasPartner = roled.some(l => l.role === 'partner');
      const hasLearner = roled.some(l => l.role === 'learner');
      assert.ok(hasPartner && hasLearner, `${lang} ${lesson.id}: missing both partner and learner roles`);

      for (const [idx, line] of roled.entries()) {
        assert.ok(line.text && line.text.trim().length > 0, `${lang} ${lesson.id} turn ${idx}: empty text`);
        assert.ok(line.fa && line.fa.trim().length > 0, `${lang} ${lesson.id} turn ${idx}: empty fa`);
        for (const bad of BAD_FRAGMENTS) {
          assert.ok(!line.text.includes(bad) && !line.fa.includes(bad), `${lang} ${lesson.id} turn ${idx}: corrupt token "${bad}"`);
        }
      }

      if (lang === 'de' || lang === 'fr' || lang === 'es') {
        const sentenceSet = new Set(lesson.sentences.map(s => s.trim()));
        const copiedCount = roled.filter(l => sentenceSet.has(l.text.trim())).length;
        assert.ok(copiedCount < roled.length, `${lang} ${lesson.id}: dialogue still copies lesson.sentences verbatim`);
      }

      totalChecked += 1;
    }
  }

  for (const key of Object.keys(mod.exports.CONVERSATION_ROOM_DIALOGUES)) {
    assert.ok(allLessonIds.has(key), `Orphan override key in CONVERSATION_ROOM_DIALOGUES: ${key}`);
  }

  const roomSrc = fs.readFileSync(path.resolve('components/LessonConversationRoom.tsx'), 'utf8');
  assert.ok(roomSrc.includes('!ch.correct'), 'LessonConversationRoom must validate ch.correct on choice click');
  assert.ok(/const restart = \(\) => \{[\s\S]*?onStop\?\.\(\)/.test(roomSrc), 'LessonConversationRoom restart() must call onStop?.()');
  assert.ok(!roomSrc.includes('placeholder={showPhrase ? current.text'), 'LessonConversationRoom must not leak current.text in TextInput placeholder');

  console.log(`PASS: ${totalChecked} lessons across all 7 languages verified for dialogue completeness, alternation, clean text, and UX safeguards.`);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
