const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

(async () => {
  const output = path.resolve('node_modules/.cache/english-lesson-flow-test.cjs');
  await esbuild.build({
    stdin: { contents: "export * from './lib/englishLessonNavigation'; export * from './lib/responsiveSpeech'; export * from './lib/speechLanguage'; export * from './lib/courseContent';", resolveDir: process.cwd() },
    outfile: output, bundle: true, platform: 'node',
    plugins: [{ name: 'speech-stub', setup(build) {
      build.onResolve({ filter: /^expo-speech$/ }, () => ({ path: 'speech', namespace: 'stub' }));
      build.onResolve({ filter: /^react-native$/ }, () => ({ path: 'react-native', namespace: 'stub' }));
      // Recorded-audio helpers pull in expo-audio; this test only covers spoken playback.
      build.onResolve({ filter: /content\/packAudio$/ }, () => ({ path: 'packAudio', namespace: 'stub' }));
      build.onResolve({ filter: /content\/speechFallback$/ }, () => ({ path: 'speechFallback', namespace: 'stub' }));
      build.onLoad({ filter: /.*/, namespace: 'stub' }, args => ({ contents: args.path === 'packAudio'
        ? 'export function stopRecorded(){} export async function playRecorded(){return false}'
        : args.path === 'speechFallback'
        ? 'export async function playPreferredRecording(){return false} export async function playFallbackRecording(){return false} export function noteSpeechSuccess(){} export function noteSpeechFailure(){}'
        : args.path === 'react-native'
        ? [
          'export const Platform = { get OS(){ return globalThis.__speechPlatform || "web"; } };',
          'export const PixelRatio = { get: () => 1, getFontScale: () => 1 };',
          'export const NativeModules = {};',
          'export const TurboModuleRegistry = { get: () => null, getEnforcing: () => null };',
          'export const NativeEventEmitter = class { addListener() { return { remove() {} }; } removeAllListeners() {} };',
          'export const DeviceEventEmitter = { addListener: () => ({ remove() {} }) };',
          'export const StyleSheet = { create: value => value, flatten: value => value, hairlineWidth: 1 };',
          'export const Text = function Text() {}; export const View = function View() {};',
          'export const AppRegistry = { registerComponent() {} }; export const LogBox = { ignoreLogs() {} };',
          'export const Dimensions = { get: () => ({ width: 390, height: 800 }) };',
          'export default {};',
        ].join(' ')
        : 'export function speak(text,options){globalThis.__utterances.push({text,options})} export function stop(){globalThis.__stops++;return Promise.resolve()} export function getAvailableVoicesAsync(){return Promise.resolve([])}', loader: 'js' }));
    } }],
  });
  // Expo modules read __DEV__ from the Metro runtime; Node has no such global.
  globalThis.__DEV__ = false;
  // expo-modules-core reads the Expo runtime global that Metro installs on devices.
  globalThis.expo = globalThis.expo || {
    // Any native module the speech stack asks for resolves to an inert object.
    modules: new Proxy({}, { get: () => ({}), has: () => true }),
    NativeModule: class NativeModule {},
    SharedObject: class SharedObject {},
    SharedRef: class SharedRef {},
    EventEmitter: class EventEmitter { addListener() { return { remove() {} }; } removeAllListeners() {} },
  };
  const { previousSentenceIndex: prev, nextLessonInOrder: next, SENTENCE_LESSONS: lessons, playResponsiveSpeech: play, stopResponsiveSpeech: stop, speechTagFor, ENGLISH_NORMAL_SPEECH_RATE: normalRate, ENGLISH_SLOW_SPEECH_RATE: slowRate } = require(output);
  let checks = 0;
  const check = (condition, message) => { assert.ok(condition, message); checks++; };
  check(next(lessons, lessons[0].id).id === lessons[1].id, 'first lesson advances to the next course lesson');
  check(next(lessons, lessons[lessons.length - 1].id) === undefined, 'end of course has no phantom lesson');
  check(next(lessons, 'missing') === undefined, 'an invalid lesson cannot jump to the first lesson');
  check(next(lessons, 'survival-past-and-future-plans').id === 'lab-en-a1-01', 'the A1 band continues into its practice lab');
  check(next(lessons, 'lab-en-a1-08').id === 'a2-foundation-past', 'the A1 lab hands over to the A2 bridge');
  check(next(lessons, 'lab-en-a2-12').id === 'communication-university-discussion', 'the A2 lab hands over to the communication band');
  check(next(lessons, 'a2-foundation-past').id === 'a2-foundation-future', 'A2 bridge lessons are consecutive');
  check(next(lessons, 'a2-foundation-advice').id === 'everyday-managing-a-busy-day', 'A2 bridge leads to the first existing situation');
  check(next(lessons, 'everyday-sharing-opinions').id === 'everyday-facing-a-challenge', 'existing legacy lessons follow the situation block');
  check(next(lessons, 'everyday-handling-an-emergency').id === 'lab-en-a2-01', 'the final A2 situation leads into the A2 practice lab');
  check(next(lessons, 'b1-survival-culture-digital').id === 'lab-en-b1-01', 'the final B1 addition leads into the B1 practice lab');
  check(next(lessons, 'lab-en-b1-11').id === 'b2-foundation-time-hypotheses', 'the B1 lab leads into B2');
  check(next(lessons, 'b2-foundation-synthesis-writing').id === 'b2-survival-society-negotiation', 'B2 foundation leads to B2 survival');
  check(next(lessons, 'b2-survival-audience-feedback').id === lessons.find(lesson => lesson.levelId === 4 && lesson.contentKind === 'scenario').id, 'B2 additions lead to preserved advanced lessons');
  check(next(lessons, lessons.filter(lesson => lesson.levelId === 4).at(-1).id).id === 'c1-foundation-abstract-time', 'preserved advanced material leads to C1');
  check(next(lessons, 'c1-foundation-synthesis-precision').id === 'c1-survival-debate-negotiation', 'C1 foundation leads to C1 survival');
  check(prev(5) === 4, 'previous button returns to preceding sentence');
  check(prev(0) === 0, 'previous button stops at the first sentence');
  global.__utterances = []; global.__stops = 0;
  let oldDone = 0, oldError = 0, newDone = 0;
  // Playback now resolves the preferred recording first, so each start settles on a tick.
  const settle = () => new Promise(resolve => setTimeout(resolve, 0));
  play({ text: 'First sentence.', locale: 'en-US', rate: .85, onDone: () => oldDone++, onError: () => oldError++ });
  await settle();
  const first = global.__utterances[0];
  check(first.text === 'First sentence.' && first.options.rate === .85, 'visible sentence and speaking rate match');
  play({ text: 'Second sentence.', locale: 'en-US', rate: .85, onDone: () => newDone++ });
  first.options.onDone(); first.options.onError();
  check(oldDone === 0 && oldError === 0, 'cancelled speech cannot advance or report errors');
  await settle();
  const second = global.__utterances[1];
  check(second.text === 'Second sentence.' && global.__stops > 0, 'new sentence replaces old audio');
  second.options.onDone();
  check(newDone === 1, 'current utterance delivers its completion callback');
  await stop();
  second.options.onDone();
  check(newDone === 1, 'stopping invalidates callbacks');
  global.__speechPlatform = 'android';
  play({ text: 'English on Android.', locale: 'en-US' });
  await settle();
  check(global.__utterances.at(-1).options.language === 'en', 'Android English uses a supported bare language tag');
  check(speechTagFor('ru-RU') === 'ru', 'Android Russian keeps its bare language tag');
  await stop();
  global.__speechPlatform = 'ios';
  play({ text: 'English on iOS.', locale: 'en-US' });
  await settle();
  check(global.__utterances.at(-1).options.language === 'en-US' && speechTagFor('ru-RU') === 'ru-RU', 'iOS retains full locale tags');
  await stop();
  global.__speechPlatform = 'web';
  play({ text: 'English on web.', locale: 'en-US' });
  await settle();
  check(global.__utterances.at(-1).options.language === 'en-US' && speechTagFor('ru-RU') === 'ru-RU', 'web retains full locale tags');
  await stop();
  check(normalRate === 1 && slowRate === 0.5 && slowRate < normalRate, 'the two English replay speeds are distinct and explicit');
  const currentSentence = lessons[0].sentences[0].en;
  play({ text: currentSentence, locale: 'en-US', rate: slowRate });
  await settle();
  check(global.__utterances.at(-1).text === currentSentence && global.__utterances.at(-1).options.rate === slowRate, 'slow replay speaks the current sentence at the slow rate');
  play({ text: currentSentence, locale: 'en-US', rate: normalRate });
  await settle();
  check(global.__utterances.at(-1).text === currentSentence && global.__utterances.at(-1).options.rate === normalRate, 'normal replay interrupts slow speech and uses the normal rate');
  play({ text: currentSentence, locale: 'en-US', rate: normalRate });
  await settle();
  check(global.__utterances.at(-1).options.rate === normalRate, 'repeated normal taps do not silently alternate speed');
  const nextSentence = lessons[0].sentences[1].en;
  play({ text: nextSentence, locale: 'en-US', rate: slowRate });
  await settle();
  await new Promise(resolve => setImmediate(resolve));
  check(global.__utterances.at(-1).text === nextSentence && global.__utterances.at(-1).options.rate === slowRate, 'replay can follow the newly selected sentence');
  await stop();
  // app/course/lesson.tsx is only a Suspense shell; the lesson logic lives in
  // components/EnglishLessonRoute.tsx. Assert the real order, not just presence.
  const screen = fs.readFileSync('components/EnglishLessonRoute.tsx', 'utf8');
  const room = fs.readFileSync('components/LessonConversationRoom.tsx', 'utf8');
  const speakCheck = fs.readFileSync('components/SpeakCheck.tsx', 'utf8');
  const atComplete = screen.indexOf('await completeSentenceLesson(');
  const atSave = screen.indexOf('await saveLessonSession(lesson.id,');
  const atNavigate = screen.indexOf("params: { id: nextLesson.id }");
  check(
    atComplete !== -1 && atSave !== -1 && atNavigate !== -1
      && atComplete < atSave && atSave < atNavigate,
    'navigation occurs after durable progress and session saves',
  );
  check(!screen.includes('saveLessonSession(lesson.id,freshSession())'), 'completion does not erase the saved session');
  check(screen.includes('stage === 9 && <LessonConversationRoom')
    && screen.includes('dialogue={lesson.dialogue}') && screen.includes('locale="en-US"')
    && room.includes('requestPermissionsAsync') && room.includes('autoStart')
    && room.includes('const PASS = 70') && room.includes('result.score >= PASS') && room.includes('sendTyped')
    && room.includes('speak(current.text, index)') && speakCheck.includes('const retry = autoStart && !stoppingByUser.current;'),
    'the final English stage is a chat over the lesson dialogue: roles come from the data, a turn advances only on a passing answer, and a learner without a microphone can type the answer');
  check(!screen.includes('speakingTestComplete') && screen.includes('disabled={saving || !!sessionError}'), 'the English speaking test is optional and Continue remains available');
  const home = fs.readFileSync('app/lang/index.tsx', 'utf8');
  const library = fs.readFileSync('app/lang/library.tsx', 'utf8');
  check(home.includes('شروع از ابتدا') && home.includes("params: { id: currentLesson.id, fromStart: '1' }") && home.includes('SENTENCE_LESSONS[0].id'), 'home restart opens the selected lesson, while beginner restart opens the first lesson');
  check(library.includes("params: { id: lessons[0].id, fromStart: '1' }"), 'level restart opens its first lesson with the one-shot reset');
  check(home.includes("params: { id: currentLesson.id }") && screen.includes('withStudyStorageLock(loadStudy)'), 'normal entry still resumes without resetting');
  check(screen.includes('جمله قبلی') && screen.includes('stage === 1') && !screen.includes('گوش‌دادن از ابتدا'), 'previous sentence is beside next, and old replay control is removed');
  check((screen.match(/<EnglishSpeechRateControls onPlay=\{rate => speak\(current\.en, rate\)\}/g) || []).length === 2, 'sentence and shadowing stages replay the selected English sentence');
  check(screen.includes('onPress={() => onPlay(ENGLISH_SLOW_SPEECH_RATE)}') && screen.includes('onPress={() => onPlay(ENGLISH_NORMAL_SPEECH_RATE)}'), 'both labelled buttons pass an explicit rate');
  check(screen.includes("fromStart === '1'") && screen.includes('resetLessonSession(lesson.id)') && !screen.includes('preserveExistingSession'), 'one-shot restart durably replaces the current attempt instead of replaying a stale session');
  check(screen.includes('await resetLessonSession(lesson.id)') && screen.includes('setStage(saved.stage)') && screen.includes('setEvidencePassed(false)'), 'in-lesson restart waits for persistence before presenting the fresh attempt');
  console.log(`${checks} lesson navigation and speech lifecycle checks passed.`);
})().catch(error => { console.error(error); process.exit(1); });
