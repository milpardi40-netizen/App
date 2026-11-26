const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');
const React = require('react');
const { act, create } = require('react-test-renderer');
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const history = [{ score: 20, attempted: 1, total: 1, missed: [], at: 1 }];
globalThis.__roomHistory = history;
const mocks = {
  'react-native': `export const View='View', Pressable='Pressable'; export const StyleSheet={create:x=>x,absoluteFillObject:{}}; export const AccessibilityInfo={isReduceMotionEnabled:async()=>true,addEventListener:()=>({remove(){}})}; export const Easing={inOut:x=>x,ease:x=>x}; export const Animated={View:'AnimatedView',Value:class{setValue(){} interpolate(){return 1}},loop:()=>({start(){},stop(){}}),sequence:()=>({}),timing:()=>({})};`,
  'expo-router': `export const useRouter=()=>({push(){}});`,
  'react-native-svg': `export default 'Svg'; export const Circle='Circle';`,
  'lucide-react-native': `export const Bot='Bot',ChevronLeft='ChevronLeft',EyeOff='EyeOff',Headphones='Headphones',MessageCircle='MessageCircle',Mic='Mic',RefreshCw='RefreshCw',UserRound='UserRound',Volume2='Volume2';`,
  '@/components/LocalizedText': `export const LocalizedText='Text';`,
  '@/components/SpeakCheck': `import React from 'react'; export default function Check(props){return React.createElement('SpeakCheck',props)}`,
  '@/components/EnglishSupplementTask': `export const EnglishPalette=new Proxy({},{get:()=> '#5146E5'});`,
  '@/lib/courseSpeech': `export const stop=async()=>{};`,
  '@/lib/theme': `export const Radius={},Shadows={},Spacing={},Typography={sizes:{}};`,
  '@/lib/format': `export const toPersianDigits=String;`,
  '@/lib/dialogueRoomHistory': `export const loadRuns=async(key)=>{globalThis.__roomLoadKey=key;return [...globalThis.__roomHistory]}; export const saveRun=async(key,run)=>{globalThis.__roomSaveKey=key;globalThis.__roomHistory.push(run);return [...globalThis.__roomHistory]};export const uniqueMissedWords=x=>x;`,
};
(async () => {
  const outfile = path.resolve('node_modules/.cache/dialogue-room-test.cjs');
  await esbuild.build({ entryPoints: ['components/LessonDialogueRoom.tsx'], outfile, bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic', external: ['react', 'react/jsx-runtime'], plugins: [{ name: 'room-platform-mocks', setup(build) {
    build.onResolve({ filter: /.*/ }, args => mocks[args.path] ? { path: args.path, namespace: 'room-mock' } : undefined);
    build.onLoad({ filter: /.*/, namespace: 'room-mock' }, args => ({ contents: mocks[args.path], loader: 'js', resolveDir: process.cwd() }));
  }}] });
  const Room = require(outfile).default;
  const helperCode = await esbuild.transform(fs.readFileSync('lib/dialogueRoomCoach.ts', 'utf8'), { loader: 'ts', format: 'cjs' });
  const helperModule = { exports: {} };
  new Function('module', 'exports', helperCode.code)(helperModule, helperModule.exports);
  const { firstWordCue, roomNextStep, comparableRoomRuns } = helperModule.exports;
  assert.equal(firstWordCue('Hello there'), 'Hello …');
  assert.ok(!firstWordCue('Hello').includes('Hello'));
  assert.ok(firstWordCue('كيف حالك اليوم').startsWith('كيف'));
  assert.ok(roomNextStep(0, 4, 4, 'guided').includes('میکروفن'));
  assert.ok(roomNextStep(4, 4, 0, 'guided').includes('با اشاره'));
  assert.equal(comparableRoomRuns([{ score: 1 }, { score: 2, mode: 'exam' }], 'guided').length, 1);
  let tree;
  const spoken = [];
  const slowSamples = [];
  const props = { language: 'en', lessonId: 'test-lesson', lessonTitle: 'Hello', levelId: 0, situation: 'Greeting', locale: 'en-US', lines: [{ text: 'Hello', fa: 'سلام' }, { text: 'Hi there', fa: 'سلام' }], onSpeak: (text, done) => spoken.push({ text, done }), onSpeakSlow: (text, done) => slowSamples.push({ text, done }) };
  const button = label => tree.root.findAllByType('Pressable').find(node => node.props.accessibilityLabel === label);
  const text = () => JSON.stringify(tree.toJSON());
  try {
    await act(async () => { tree = create(React.createElement(Room, props)); });
    assert.equal(globalThis.__roomLoadKey, 'test-lesson', 'unrevised history keys remain stable');
    assert.ok(button('شروع گفت‌وگو'), 'single primary start action');
    assert.equal(button('حالت آزمون').props.accessibilityState.checked, false);
    assert.equal(spoken.length, 0, 'no audio before start');
    await act(async () => { button('حالت آزمون').props.onPress(); });
    assert.equal(button('حالت آزمون').props.accessibilityState.checked, true);
    await act(async () => { button('حالت آزمون').props.onPress(); });
    await act(async () => { button('شروع گفت‌وگو').props.onPress(); });
    assert.equal(spoken.length, 1);
    assert.equal(spoken[0].text, 'Hello');
    await act(async () => { spoken[0].done(); });
    assert.equal(tree.root.findByType('SpeakCheck').props.text, 'Hi there');
    assert.equal(tree.root.findByType('SpeakCheck').props.roomMode, true);
    assert.ok(!text().includes('"Hello"'), 'earlier sentence is collapsed');
    await act(async () => { tree.root.findByType('SpeakCheck').props.onResult({ score: 80, heard: 'Hi', words: [{ word: 'Hi', ok: true, state: 'ok' }, { word: 'there', ok: false, state: 'miss' }] }); });
    assert.equal(history.length, 2, 'completed run saved once');
    assert.ok(text().includes('+60'), 'trend uses previous run, not current save');
    await act(async () => { button('تمرین اشتباه‌ها').props.onPress(); });
    assert.equal(tree.root.findByType('SpeakCheck').props.text, 'Hi there');
    assert.equal(history.length, 2, 'review does not overwrite full-run score');
    await act(async () => { button('شروع مجدد گفت‌وگو').props.onPress(); });
    await act(async () => { button('من شروع می‌کنم').props.onPress(); });
    await act(async () => { button('شروع گفت‌وگو').props.onPress(); });
    assert.equal(tree.root.findByType('SpeakCheck').props.text, 'Hello');
    await act(async () => { tree.root.findByType('SpeakCheck').props.onResult({ score: 100, heard: 'Hello', words: [{ word: 'Hello', ok: true, state: 'ok' }] }); });
    await act(async () => { spoken.at(-1).done(); });
    assert.equal(history.length, 3, 'restart saves a new run');
    assert.ok(text().includes('+20'), 'restart compares against the latest completed run');
    assert.equal(button('تمرین اشتباه‌ها'), undefined, 'perfect run needs no error drill');
    await act(async () => { button('شروع مجدد گفت‌وگو').props.onPress(); });
    await act(async () => { button('مسیر با اشاره').props.onPress(); });
    assert.equal(button('مسیر با اشاره').props.accessibilityState.selected, true);
    await act(async () => { button('شروع گفت‌وگو').props.onPress(); });
    const visibleText = () => tree.root.findAllByType('Text').map(node => node.children.filter(child => typeof child === 'string').join('')).join(' ');
    assert.ok(!visibleText().includes('Hello'), 'cued path hides the target sentence');
    await act(async () => { button('کمک می‌خواهم').props.onPress(); });
    await act(async () => { button('یک اشاره').props.onPress(); });
    assert.ok(!visibleText().includes('Hello'), 'single-word hint does not leak the entire answer');
    await act(async () => { button('نمونه پاسخ').props.onPress(); });
    assert.ok(visibleText().includes('Hello'), 'target appears only on explicit sample request');
    await act(async () => { button('آهسته‌تر بگو').props.onPress(); });
    assert.equal(tree.root.findAllByType('SpeakCheck').length, 0, 'mic unmounts during sample playback');
    assert.equal(slowSamples.length, 1, 'uses genuine slow narration callback');
    await act(async () => { slowSamples[0].done(); });
    assert.equal(tree.root.findAllByType('SpeakCheck').length, 1, 'mic resumes after the sample');
    await act(async () => { tree.root.findByType('SpeakCheck').props.onResult({ score: 90, heard: 'Hello', words: [{ word: 'Hello', ok: true, state: 'ok' }] }); });
    await act(async () => { spoken.at(-1).done(); });
    assert.equal(history.at(-1).mode, 'cued');
    assert.equal(history.at(-1).helped, 1, 'multiple help actions count as one assisted turn');
    assert.ok(!text().includes('نسبت به اجرای قبل'), 'different practice paths are not compared');
    await act(async () => { button('شروع مجدد گفت‌وگو').props.onPress(); });
    await act(async () => { button('حالت آزمون').props.onPress(); });
    await act(async () => { button('شروع گفت‌وگو').props.onPress(); });
    assert.equal(button('کمک می‌خواهم'), undefined, 'exam never offers hints');
    assert.equal(tree.root.findByType('SpeakCheck').props.blindExam, true);
    const savedCount = history.length;
    await act(async () => { tree.root.findByType('SpeakCheck').props.onResult({ score: 0, heard: '', words: [] }); });
    await act(async () => { spoken.at(-1).done(); });
    assert.equal(history.length, savedCount, 'silence is not persisted as a fake zero score');
    assert.ok(text().includes('گفتاری برای مقایسه دریافت نشد'));
    assert.ok(button('تمرین اشتباه‌ها'), 'unheard turns remain available for review');
    assert.equal(globalThis.__roomSaveKey, 'test-lesson');
    await act(async () => { tree.unmount(); });
    await act(async () => { tree = create(React.createElement(Room, { ...props, contentRevision: 'v4' })); });
    assert.equal(globalThis.__roomLoadKey, 'test-lesson:v4', 'revised dialogue never loads old-content trends');
    await act(async () => { button('شروع گفت‌وگو').props.onPress(); });
    await act(async () => { spoken.at(-1).done(); });
    await act(async () => { tree.root.findByType('SpeakCheck').props.onResult({ score: 100, heard: 'Hi there', words: [] }); });
    assert.equal(globalThis.__roomSaveKey, 'test-lesson:v4', 'new-content run uses the same versioned history key');
    console.log('Dialogue-room checks passed: guided/cued/exam, help, safe sample playback, silent attempts, matching-only feedback, mode-specific trends and restart.');
  } finally {
    if (tree) await act(async () => { tree.unmount(); });
    fs.rmSync(outfile, { force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
