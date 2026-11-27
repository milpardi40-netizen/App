const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const esbuild = require('esbuild');
const React = require('react');
const { act, create } = require('react-test-renderer');
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const files = ['components/RussianLesson.tsx', 'components/TurkishLesson.tsx', 'components/StarterLesson.tsx', 'components/EnglishLessonRoute.tsx', 'components/arabic/ArabicLessonScreen.tsx'];
function parse(file) {
  const source = fs.readFileSync(file, 'utf8');
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const functions = {}; let mainResult;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer && ts.isArrowFunction(node.initializer)) functions[node.name.text] = node.initializer.getText(ast);
    if (!mainResult && ts.isJsxSelfClosingElement(node) && node.tagName.getText(ast) === 'SpeakCheck') {
      const result = node.attributes.properties.find(p => ts.isJsxAttribute(p) && p.name.getText(ast) === 'onResult');
      mainResult = result.initializer.expression.getText(ast);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return { source, functions, mainResult };
}
function evaluate(code, env) {
  const js = ts.transpile(`const callback = ${code};`, { target: ts.ScriptTarget.ES2022 });
  return new Function(...Object.keys(env), js + ';return callback;')(...Object.values(env));
}
(async () => {
  for (const file of files) {
    const { source, functions, mainResult } = parse(file);
    assert.ok(source.includes('{stage >= 2 && <Pressable accessibilityRole="button" accessibilityLabel="مرحلهٔ قبل"'), file + ': footer back control from listening through dialogue');
    assert.ok(source.includes('onPress={goToPreviousStage}'), file);
    // Execute actual source callbacks, including the existing chunk-boundary logic.
    for (const count of [1, 2, 12, 13, 17, 25]) for (const index of [...new Set([0, Math.min(9, count - 1), count - 1])]) {
      const state = { stage: 1, index, chunk: null };
      const env = {
        sessionReady: true, saving: false, sessionError: '', completing: { current: false }, resettingRef: { current: false },
        stage: 1, sentenceIndex: index, chunkLastIndex: count > 12 && index < 10 ? 9 : count - 1,
        lesson: { id: 'test', sentences: Array.from({ length: count }, (_, id) => ({ id })) }, course: { id: 'fr' },
        stages: Array(10), chunks: { chunked: count > 12, current: index < 10 ? 1 : Math.ceil(count / 10), total: Math.ceil(count / 10), end: count > 12 && index < 10 ? 10 : count },
        doneChunks: [], CHUNK_THRESHOLD: 12,
        setCompletionError() {}, setRevealed() {}, setDoneChunks() {}, markChunkDone: async () => [1],
        setChunkCelebration: value => { state.chunk = value; }, trackStageReached() {},
        setSentenceIndex: value => { state.index = typeof value === 'function' ? value(state.index) : value; },
        setStage: value => { state.stage = typeof value === 'function' ? value(state.stage) : value; },
        stopRussianSpeech() {}, stopTurkishSpeech() {}, stopStarterSpeech() {},
      };
      const next = evaluate(functions.next, env);
      let scheduled, nextPromise;
      evaluate(mainResult, { scheduleOnPass: (result, callback) => { assert.equal(result.score, 100); scheduled = callback; }, next: () => { nextPromise = next(); } })({ score: 100 });
      assert.equal(state.stage, 1, file + ': wait for passing feedback');
      assert.equal(typeof scheduled, 'function', file + ': even final sentence schedules navigation');
      scheduled(); await nextPromise;
      if (index === count - 1) {
        assert.equal(state.stage, 2, file + ': final sentence enters listening');
        assert.equal(state.index, 0);
      } else if (functions.next.includes('markChunkDone') && env.chunks.chunked && index === env.chunkLastIndex) {
        assert.ok(state.chunk, file + ': existing chunk milestone retained');
        assert.equal(state.stage, 1, file + ': chunk boundary is not the last sentence');
      } else {
        assert.equal(state.stage, 1); assert.equal(state.index, index + 1);
      }
    }
    for (let stage = 2; stage <= 9; stage++) {
      const state = { stage, cancelled: 0, stopped: 0, index: 5 };
      const env = { sessionReady: true, saving: false, sessionError: '', completing: { current: false }, resettingRef: { current: false }, stage,
        cancelSpeakingAdvance: () => state.cancelled++, setMicReadyKey: value => assert.equal(value, null),
        setStage: value => { state.stage = value; }, setSentenceIndex: value => { state.index = value; },
        setRevealed() {}, setSpeechError() {}, setSpeechResult() {},
      };
      for (const stop of ['stopRussianSpeech', 'stopTurkishSpeech', 'stopStarterSpeech', 'stopResponsiveSpeech', 'stopArabicSpeech']) env[stop] = () => state.stopped++;
      evaluate(functions.goToPreviousStage, env)();
      assert.equal(state.stage, stage - 1, file + ': previous stage, not previous lesson');
      assert.equal(state.index, 0); assert.equal(state.cancelled, 1); assert.equal(state.stopped, 1);
      for (const guard of ['saving', 'sessionError']) {
        state.stage = stage;
        evaluate(functions.goToPreviousStage, { ...env, [guard]: true })();
        assert.equal(state.stage, stage, file + ': guarded during save/error');
      }
    }
  }
  const build = await esbuild.build({ entryPoints: ['lib/useSpeakAutoAdvance.ts'], bundle: true, platform: 'node', format: 'cjs', write: false, external: ['react'] });
  const module = { exports: {} };
  new Function('module', 'exports', 'require', build.outputFiles[0].text)(module, module.exports, require);
  let api, tree, advances = 0;
  function Screen({ resetKey }) { api = module.exports.useSpeakAutoAdvance(resetKey, 25); return null; }
  const wait = () => act(async () => { await new Promise(resolve => setTimeout(resolve, 45)); });
  await act(async () => { tree = create(React.createElement(Screen, { resetKey: 'main:0' })); });
  await act(async () => { api.scheduleOnPass({ score: 69 }, () => advances++); }); await wait(); assert.equal(advances, 0);
  await act(async () => { api.scheduleOnPass({ score: 70 }, () => advances++); }); await wait(); assert.equal(advances, 1);
  await act(async () => { api.scheduleOnPass({ score: 100 }, () => advances++); api.cancel(); }); await wait(); assert.equal(advances, 1);
  await act(async () => { api.scheduleOnPass({ score: 100 }, () => advances++); tree.update(React.createElement(Screen, { resetKey: 'listening:0' })); }); await wait(); assert.equal(advances, 1);
  await act(async () => { api.scheduleOnPass({ score: 100 }, () => advances++); tree.unmount(); }); await wait(); assert.equal(advances, 1);
  console.log('All seven languages: main-sentence pass advances, final sentence enters listening, existing chunk milestones retained, previous-stage actions from listening through dialogue, and pass/fail/timer cancellation checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
