// Exercise the REAL screen prop expressions and the REAL room/production renderers.
// Only native views, speech events, navigation and device storage are simulated.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const esbuild = require('esbuild');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');
const { loadInventory } = require('./helpers/practical-inventory.cjs');
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.__a1Disk = new Map();
globalThis.window = { localStorage: { getItem: k => globalThis.__a1Disk.get(k) ?? null, setItem: (k,v) => globalThis.__a1Disk.set(k,v) } };
const mocks = {
  'react-native': `export const View='View', Pressable='Pressable', Platform={OS:'web'}; export const StyleSheet={create:x=>x,absoluteFillObject:{}}; export const AccessibilityInfo={isReduceMotionEnabled:async()=>true,addEventListener:()=>({remove(){}})}; export const Easing={inOut:x=>x,ease:x=>x}; export const Animated={View:'AnimatedView',Value:class{setValue(){} interpolate(){return 1}},loop:()=>({start(){},stop(){}}),sequence:()=>({}),timing:()=>({})};`,
  '@react-native-async-storage/async-storage': `export default {getItem:async k=>globalThis.__a1Disk.get(k)??null,setItem:async(k,v)=>globalThis.__a1Disk.set(k,v)};`,
  'expo-router': `export const useRouter=()=>({push(){}});`,
  'react-native-svg': `export default 'Svg'; export const Circle='Circle';`,
  'lucide-react-native': `export const Bot='Bot',ChevronLeft='ChevronLeft',EyeOff='EyeOff',Headphones='Headphones',MessageCircle='MessageCircle',Mic='Mic',RefreshCw='RefreshCw',UserRound='UserRound',Volume2='Volume2',Check='Check',Mic2='Mic2',PenLine='PenLine';`,
  '@/components/LocalizedText': `export const LocalizedText='Text',LocalizedTextInput='TextInput';`,
  '@/components/SpeakCheck': `import React from 'react';export default function Check(props){return React.createElement('SpeakCheck',props)}`,
  '@/components/EnglishSupplementTask': `export const EnglishPalette=new Proxy({},{get:()=> '#5146E5'});`,
  '@/lib/operatorSpeech': `export const stopOperatorSpeech=async()=>{};`,
  '@/lib/theme': `export const Radius={},Shadows={},Spacing={},Typography={sizes:{}};`,
  '@/lib/format': `export const toPersianDigits=String;`,
  '@/lib/haptics': `export const hapticTap=()=>{};`,
};
function propExpression(tag, name) {
  const file = 'components/StarterLesson.tsx';
  const source = fs.readFileSync(file, 'utf8');
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let expression;
  function visit(node) {
    if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(ast) === tag) {
      for (const prop of node.attributes.properties) if (ts.isJsxAttribute(prop) && prop.name.getText(ast) === name) expression = prop.initializer.expression.getText(ast);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast); assert.ok(expression, `${tag}.${name} must be wired by the actual screen`);
  return expression;
}
(async () => {
  const built = await esbuild.build({ stdin: { contents: `
    export * from './lib/languages/germanA1Practice'; export * from './lib/languages/germanA1Scope';
    export * from './lib/languages/frenchA1Practice'; export * from './lib/languages/frenchA1Scope';
    export * from './lib/languages/spanishA1Practice'; export * from './lib/languages/spanishA1Scope';
    export {default as Room} from './components/LessonDialogueRoom';
    export {default as Production} from './components/ProductionTask';
     
      export {b1Production} from './lib/languages/b1Production'; export {b2Production} from './lib/languages/b2Production'; export {practicalRoomRevision} from './lib/languages/preA1Practical/balanceRevision'; export {default as Skill} from './components/StarterA1Skill';
    export * from './lib/lessonDialoguePairs';
    
    export * from './lib/dialogueRoomHistory';
  `, resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false, jsx: 'automatic', external: ['react', 'react/jsx-runtime'], plugins: [{ name: 'device-boundaries', setup(build) {
    build.onResolve({ filter: /.*/ }, args => mocks[args.path] ? { path: args.path, namespace: 'mock' } : undefined);
    build.onLoad({ filter: /.*/, namespace: 'mock' }, args => ({ contents: mocks[args.path], loader: 'js' }));
  } }] });
  const module = { exports: {} }; new Function('module', 'exports', 'require', built.outputFiles[0].text)(module, module.exports, require);
  const api = module.exports;
  const feed = (tag, name) => new Function('lesson', 'course', ...Object.keys(api), `return (${propExpression(tag, name)});`);
  const pairsFor = feed('LessonDialogueRoom', 'pairs');
  const revisionFor = feed('LessonDialogueRoom', 'contentRevision');
  const productionFor = feed('ProductionTask', 'explicit');
  const productionRevisionFor = feed('ProductionTask', 'contentRevision');
  const examplesFor = feed('ProductionTask', 'examples');
  const labelFor = feed('ProductionTask', 'levelLabel');
  const evaluate = (fn, lesson) => fn(lesson, {id: lesson.id.slice(0,2)}, ...Object.values(api));
  const inventory = await loadInventory();
  const a1 = inventory.de.filter(l => api.isGermanA1Core(l.id));
  // Every other German lesson, still receives the exact original pairs, prompt and history revision.
  for (const lesson of [...inventory.de,...inventory.fr,...inventory.es].filter(l => !api.isGermanA1Core(l.id) && !api.isFrenchA1Core(l.id) && !api.isSpanishA1Core(l.id))) {
    assert.deepEqual(evaluate(pairsFor, lesson), api.lessonDialoguePairs(lesson.sentences, lesson.dialogue));
    assert.deepEqual(evaluate(productionFor, lesson), lesson.levelId === 3 ? api.b1Production(lesson.id.slice(0,2),lesson.id) : lesson.levelId === 4 ? api.b2Production(lesson.id.slice(0,2),lesson.id) : undefined);
    assert.equal(evaluate(labelFor, lesson), undefined);
    assert.equal(evaluate(revisionFor, lesson), lesson.levelId === 0 ? api.practicalRoomRevision(lesson.id) : undefined);
  }
  // Check the REAL render guard, not just props on a manually mounted ProductionTask.
  const src=fs.readFileSync('components/StarterLesson.tsx','utf8'),ast=ts.createSourceFile('screen.tsx',src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let guard;
  function findGuard(n){if(ts.isJsxSelfClosingElement(n)&&n.tagName.getText(ast)==='ProductionTask'&&ts.isConditionalExpression(n.parent))guard=n.parent.condition.getText(ast);ts.forEachChild(n,findGuard)}findGuard(ast);assert.ok(guard);
  const mountedAt=new Function('lesson','stage','foundation',...Object.keys(api),`return (${guard});`);
  for(const lesson of a1){assert.equal(mountedAt(lesson,8,false,...Object.values(api)),true);assert.equal(mountedAt(lesson,7,false,...Object.values(api)),false);}
  for(const lesson of [...inventory.de,...inventory.fr,...inventory.es].filter(l=>l.levelId<3&&!api.isGermanA1Core(l.id)&&!api.isFrenchA1Core(l.id)&&!api.isSpanishA1Core(l.id)))assert.equal(mountedAt(lesson,8,lesson.id.includes('foundation'),...Object.values(api)),false,'no production outside approved scopes or higher levels');
  let room;
  let production;
  let covered = 0;
  let executions = 0;
  const fold = line => ({ text: line.text, fa: line.fa });
  const renderedText = tree => tree.root.findAllByType('Text').map(n => n.children.filter(c => typeof c === 'string').join('')).join('\n');
  try {
    for (const lesson of a1) {
      const pairs = evaluate(pairsFor, lesson);
      const revision = evaluate(revisionFor, lesson);
      const explicit = evaluate(productionFor, lesson);
      const levelLabel = evaluate(labelFor, lesson);
      assert.equal(revision, api.GERMAN_A1_ROOM_REVISION);
      assert.equal(levelLabel, 'A1');
      const writing = api.germanA1Production(lesson.id).writing;
      assert.equal(explicit.writing, writing, 'actual production instruction equals authored task');
      assert.ok(!explicit.writing.includes('هر جمله فعل') && !explicit.checklist.some(s => s.startsWith('هر جمله فعل')));
      const productionRevision = evaluate(productionRevisionFor, lesson);
      assert.equal(productionRevision, api.GERMAN_A1_CONTENT_REVISION);
      const legacyDraftKey = `lesson_production_v1:${lesson.id}`;
      const legacyDraft = JSON.stringify({text: 'OLD ANSWER TO OLD TASK', checks: [0,1,2]});
      globalThis.__a1Disk.set(legacyDraftKey, legacyDraft);
      assert.deepEqual(pairs.filter(p => p.section === 'review').map(p => p.sentenceId), lesson.sentences.map(s => s.id));
      await act(async () => { production = create(React.createElement(api.Production, { source: lesson, explicit, levelLabel, contentRevision: productionRevision, examples: evaluate(examplesFor, lesson), onSpeak() {} })); });
      const productionText = renderedText(production);
      assert.ok(productionText.includes('تولید آزاد · A1') && !productionText.includes('تولید آزاد · B1'));
      assert.ok(productionText.includes(writing));
      assert.equal(production.root.findByType('TextInput').props.value, '', 'old draft never pre-populates a changed task');
      assert.equal(globalThis.__a1Disk.get(legacyDraftKey), legacyDraft, 'raw old draft retained');
      await act(async () => { production.unmount(); }); production = null;
      for (const starter of ['operator', 'me']) {
        const expected = api.dialoguePairLines(pairs, starter);
        assert.deepEqual(expected.slice(0, lesson.dialogue.length).map(fold), lesson.dialogue.map(fold), 'authored scene stays contiguous in BOTH role choices');
        const oldKey = `${lesson.id}:${api.LESSON_DIALOGUE_REVISION}:original`;
        const newKey = `${lesson.id}:${api.LESSON_DIALOGUE_REVISION}:${revision}`;
        const oldRun = { score: 21, attempted: 16, total: 16, missed: ['retired'], at: 1 };
        const raw = JSON.stringify({ [oldKey]: [oldRun] });
        globalThis.__a1Disk.set('dialogue_room_runs_v1', raw);
        const spoken = [];
        const user = [];
        await act(async () => { room = create(React.createElement(api.Room, { language: 'de', lessonId: lesson.id, lessonTitle: lesson.title, levelId: 1, situation: lesson.situation, pairs, contentRevision: revision, locale: 'de-DE', onSpeak() {}, onSpeakOperator: (text, done) => spoken.push({ text, done }) })); });
        assert.equal(globalThis.__a1Disk.get('dialogue_room_runs_v1'), raw, 'loading new room never modifies old history');
        assert.ok(renderedText(room).includes('ابتدا مکالمهٔ پیوسته'));
        const click = name => room.root.findAllByType('Pressable').find(n => n.props.accessibilityLabel === name).props.onPress();
        if (starter === 'me') await act(async () => { click('من شروع می‌کنم'); });
        await act(async () => { click('شروع گفت‌وگو'); });
        for (let i = 0; i < expected.length; i++) {
          if (i === lesson.dialogue.length) assert.ok(renderedText(room).includes('بخش دوم · مرور همهٔ جمله‌های آموزشی'));
          const operator = (i % 2 === 0) === (starter === 'operator');
          if (operator) {
            assert.equal(room.root.findAllByType('SpeakCheck').length, 0);
            const event = spoken.shift(); assert.ok(event); assert.equal(event.text, expected[i].text);
            await act(async () => { event.done(); });
          } else {
            const check = room.root.findByType('SpeakCheck');
            assert.equal(check.props.text, expected[i].text);
            user.push(check.props.text);
            await act(async () => { check.props.onResult({ score: 100, heard: check.props.text, words: [] }); });
          }
        }
        const reviewTargets = user.slice(lesson.dialogue.length / 2);
        assert.deepEqual(reviewTargets, lesson.sentences.map(s => s.text), `${lesson.id}/${starter}: EVERY educational sentence really reaches SpeakCheck`);
        assert.equal((await api.loadRuns(newKey)).length, 1);
        assert.deepEqual(await api.loadRuns(oldKey), [oldRun], 'old scores retained under old key');
        assert.equal((await api.loadRuns(newKey))[0].total, pairs.length);
        assert.ok(!renderedText(room).includes('نسبت به اجرای قبل'), 'old-content score never appears as a new-script trend');
        covered += reviewTargets.length; executions++;
        await act(async () => { room.unmount(); }); room = null;
      }
    }
    assert.equal(covered, 1392);
    // Real optional-skill renderer: the listening transcript is hidden until a correct answer.
    for (const lesson of a1) for (const task of api.germanA1Skills(lesson.id)) {
      let skill;
      try {
        await act(async () => {skill = create(React.createElement(api.Skill, {task, onSpeak() {}}));});
        await act(async () => {skill.root.findAllByType('Pressable')[0].props.onPress();});
        const before = renderedText(skill);
        if (task.kind === 'listening') assert.ok(!before.includes(task.passage));
        else assert.ok(before.includes(task.passage));
        const choice = skill.root.findAllByType('Pressable').filter(n => n.props.accessibilityRole === 'radio')[task.correctIndex];
        await act(async () => {choice.props.onPress();});
        assert.ok(renderedText(skill).includes(task.passage));
      } finally {if (skill) await act(async () => {skill.unmount();});}
    }
    console.log(`German A1 integration passed: ${executions} complete rendered room runs, 696/696 educational sentences for EACH starter (1392 checked learner targets), contiguous scenes, 56 rendered A1 writing tasks, 112 optional comprehension tasks, isolated old/new drafts and room histories; unchanged non-core wiring including Pre-A1 and A2–C1.`);

  } finally {
    if (room) await act(async () => { room.unmount(); });
    if (production) await act(async () => { production.unmount(); });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
