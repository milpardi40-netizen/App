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
  '@/lib/arabic/speech': `export const playArabicSpeech=(text,options)=>globalThis.__arAudio.push({text,options});`,
  './ArabicUI': `export const ArabicPalette=new Proxy({},{get:()=> '#5146E5'});`,
  '@/lib/haptics': `export const hapticTap=()=>{};`,
};
function propExpression(tag, name) {
  const file = 'components/arabic/ArabicLessonScreen.tsx';
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
    
    
    export * from './lib/arabic/a1Practice'; export * from './lib/arabic/a1Scope';
    export {default as Room} from './components/LessonDialogueRoom';
    export {default as Production} from './components/ProductionTask';
    export {ArabicLessonEvidence as Evidence} from './components/arabic/ArabicLessonEvidence';
    export {arabicEvidenceFor} from './lib/lessonEvidenceBank';
     
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
  const sceneFor = feed('LessonDialogueRoom', 'scene');
  const productionFor = feed('ProductionTask', 'explicit');
  const productionRevisionFor = feed('ProductionTask', 'contentRevision');
  const examplesFor = feed('ProductionTask', 'examples');
  const labelFor = feed('ProductionTask', 'levelLabel');
  const evaluate = (fn, lesson) => fn(lesson, {id: lesson.id.slice(0,2)}, ...Object.values(api));
  const inventory = await loadInventory();
  const a1 = inventory.ar.filter(l => api.isArabicA1Core(l.id));
  // Every other Arabic lesson, still receives the exact original pairs, prompt and history revision.
  for (const lesson of [...inventory.ar].filter(l => !api.isArabicA1Core(l.id))) {
    assert.deepEqual(evaluate(pairsFor, lesson), api.lessonDialoguePairs(lesson.sentences, lesson.dialogue.map(l=>({text:l.ar,fa:l.fa}))));
    assert.deepEqual(evaluate(productionFor, lesson), undefined);
    assert.equal(evaluate(labelFor, lesson), undefined);
    assert.equal(evaluate(revisionFor, lesson), lesson.levelId === 0 ? api.practicalRoomRevision(lesson.id) : undefined);
  }
  // Check the REAL render guard, not just props on a manually mounted ProductionTask.
  const src=fs.readFileSync('components/arabic/ArabicLessonScreen.tsx','utf8'),ast=ts.createSourceFile('screen.tsx',src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let guard;
  function findGuard(n){if(ts.isJsxSelfClosingElement(n)&&n.tagName.getText(ast)==='ProductionTask'&&ts.isConditionalExpression(n.parent))guard=n.parent.condition.getText(ast);ts.forEachChild(n,findGuard)}findGuard(ast);assert.ok(guard);
  const mountedAt=new Function('lesson','stage','foundation',...Object.keys(api),`return (${guard});`);
  for(const lesson of a1){assert.equal(mountedAt(lesson,8,false,...Object.values(api)),true);assert.equal(mountedAt(lesson,7,false,...Object.values(api)),false);}
  for(const lesson of [...inventory.ar].filter(l=>l.levelId<3&&!api.isArabicA1Core(l.id)))assert.equal(mountedAt(lesson,8,lesson.id.includes('foundation'),...Object.values(api)),false,'no production outside approved scopes or higher levels');
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
      assert.equal(revision, api.ARABIC_A1_ROOM_REVISION);
      assert.equal(levelLabel, 'A1');
      const writing = api.arabicA1Production(lesson.id).writing;
      assert.equal(explicit.writing, writing, 'actual production instruction equals authored task');
      assert.ok(!explicit.writing.includes('هر جمله فعل') && !explicit.checklist.some(s => s.startsWith('هر جمله فعل')));
      const productionRevision = evaluate(productionRevisionFor, lesson);
      assert.equal(productionRevision, api.ARABIC_A1_CONTENT_REVISION);
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
        const scene = evaluate(sceneFor, lesson);
        const expected = [...scene,...api.dialoguePairLines(pairs, starter)];
        assert.deepEqual(expected.slice(0, lesson.dialogue.length).map(fold), lesson.dialogue.map(l=>({text:l.ar,fa:l.fa})), 'authored scene stays contiguous in BOTH role choices');
        const oldKey = `${lesson.id}:${api.LESSON_DIALOGUE_REVISION}:original`;
        const newKey = `${lesson.id}:${api.LESSON_DIALOGUE_REVISION}:${revision}`;
        const oldRun = { score: 21, attempted: 16, total: 16, missed: ['retired'], at: 1 };
        const raw = JSON.stringify({ [oldKey]: [oldRun] });
        globalThis.__a1Disk.set('dialogue_room_runs_v1', raw);
        const spoken = [];
        const user = [];
        await act(async () => { room = create(React.createElement(api.Room, { language: 'ar', lessonId: lesson.id, lessonTitle: lesson.title, levelId: 1, situation: lesson.situation, pairs, scene, contentRevision: revision, locale: 'ar-SA', onSpeak() {}, onSpeakOperator: (text, done) => spoken.push({ text, done }) })); });
        assert.equal(globalThis.__a1Disk.get('dialogue_room_runs_v1'), raw, 'loading new room never modifies old history');
        assert.ok(renderedText(room).includes('ابتدا مکالمهٔ پیوسته'));
        const click = name => room.root.findAllByType('Pressable').find(n => n.props.accessibilityLabel === name).props.onPress();
        if (starter === 'me') await act(async () => { click('من شروع می‌کنم'); });
        await act(async () => { click('شروع گفت‌وگو'); });
        for (let i = 0; i < expected.length; i++) {
          if (i === lesson.dialogue.length) assert.ok(renderedText(room).includes('بخش دوم · مرور همهٔ جمله‌های آموزشی'));
          const local = i < scene.length ? i : i - scene.length;
          const operator = (local % 2 === 0) === (starter === 'operator');
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
        const sceneLearnerCount = starter === 'operator' ? Math.floor(scene.length/2) : Math.ceil(scene.length/2);
        const reviewTargets = user.slice(sceneLearnerCount);
        assert.deepEqual(reviewTargets, lesson.sentences.map(s => s.ar), `${lesson.id}/${starter}: EVERY educational sentence really reaches SpeakCheck`);
        assert.equal((await api.loadRuns(newKey)).length, 1);
        assert.deepEqual(await api.loadRuns(oldKey), [oldRun], 'old scores retained under old key');
        assert.equal((await api.loadRuns(newKey))[0].total, user.length);
        assert.ok(!renderedText(room).includes('نسبت به اجرای قبل'), 'old-content score never appears as a new-script trend');
        covered += reviewTargets.length; executions++;
        await act(async () => { room.unmount(); }); room = null;
      }
    }
    assert.equal(covered, 224);
    // Real optional-skill renderer: the listening transcript is hidden until a correct answer.
    for (const lesson of a1) for (const task of api.arabicA1Skills(lesson.id)) {
      let skill;
      try {
        const audio=[];
        await act(async () => {skill = create(React.createElement(api.Skill, {task, onSpeak:(...args)=>audio.push(args)}));});
        await act(async () => {skill.root.findAllByType('Pressable')[0].props.onPress();});
        const before = renderedText(skill);
        if (task.kind === 'listening') {
          assert.ok(!before.includes(task.passage));
          await act(async()=>{skill.root.findAllByType('Pressable').find(n=>n.props.accessibilityLabel==='پخش پیام تمرین شنیداری').props.onPress();});
          assert.deepEqual(audio,[[task.passage,0.8]],'the real audio action sends the independent passage at the requested rate');
          const wrong=skill.root.findAllByType('Pressable').filter(n=>n.props.accessibilityRole==='radio')[(task.correctIndex+1)%3];
          await act(async()=>{wrong.props.onPress();});assert.ok(!renderedText(skill).includes(task.passage),'wrong answer must not expose the listening transcript');
        } else assert.ok(before.includes(task.passage));
        const choice = skill.root.findAllByType('Pressable').filter(n => n.props.accessibilityRole === 'radio')[task.correctIndex];
        await act(async () => {choice.props.onPress();});
        assert.ok(renderedText(skill).includes(task.passage));
      } finally {if (skill) await act(async () => {skill.unmount();});}
    }
    // Real short-assessment UI cannot restore legacy task IDs or pass listening before audio finishes.
    let evidenceCount=0;
    for(const lesson of a1){
      const tasks=api.arabicEvidenceFor(lesson);let evidence,passed=0;
      globalThis.__arAudio=[];
      const legacy=Object.fromEntries((require('./fixtures/arabic-a1-before.json').core.find(l=>l.id===lesson.id).checks).map(t=>[t.id,{skill:t.skill,correct:true,heard:true,attempts:1}]));
      globalThis.__a1Disk.set('arabic_study_state_v1',JSON.stringify({version:1,sessions:{},days:{},lessonEvidence:{[lesson.id]:legacy}}));
      try{
        await act(async()=>{evidence=create(React.createElement(api.Evidence,{lesson,onPassed:()=>passed++}));});
        assert.equal(passed,0);assert.ok(!renderedText(evidence).includes('ثبت شد ✓'));
        const cardFor=task=>evidence.root.findAllByType('Text').find(n=>n.props.children===task.prompt).parent;
        const pressAnswer=(task,answer)=>cardFor(task).findAllByType('Pressable').find(n=>n.findAllByType('Text').some(t=>t.props.children===answer)).props.onPress();
        for(const task of tasks){
          if(task.skill==='listening'){
            await act(async()=>{pressAnswer(task,task.answers[0]);});
            assert.ok(renderedText(evidence).includes('ابتدا فایل صوتی'));assert.equal(passed,0);
            await act(async()=>{cardFor(task).findAllByType('Pressable')[0].props.onPress();});
            const event=globalThis.__arAudio.shift();assert.equal(event.text,task.audio);
            await act(async()=>{event.options.onDone();});
          }
          if(task.options){await act(async()=>{pressAnswer(task,task.answers[0]);});}
          else{
            await act(async()=>{cardFor(task).findByType('TextInput').props.onChangeText(task.answers[0].replace(/[\u064b-\u065f\u0670]/g,''));});
            await act(async()=>{cardFor(task).findAllByType('Pressable')[0].props.onPress();});
          }
        }
        assert.equal(passed,1);assert.equal(evidence.root.findAllByType('Text').filter(t=>String(t.props.children).includes('ثبت شد ✓')).length,5);
        const disk=JSON.parse(globalThis.__a1Disk.get('arabic_study_state_v1')).lessonEvidence[lesson.id];
        for(const [id,result] of Object.entries(legacy))assert.deepEqual(disk[id],result);
        assert.equal(Object.keys(disk).length,Object.keys(legacy).length+5);evidenceCount++;
      }finally{if(evidence)await act(async()=>{evidence.unmount();});}
    }
    assert.equal(evidenceCount,14);
    console.log(`Arabic A1 integration passed: ${executions} complete rendered room runs, 112/112 educational sentences for EACH starter (224 checked learner targets), contiguous scenes, 14 rendered A1 writing tasks, 28 optional comprehension tasks, 14 rendered short assessments (70 answers with listening gates), isolated old/new drafts and room histories; unchanged non-core wiring including Pre-A1 and A2–C1.`);

  } finally {
    if (room) await act(async () => { room.unmount(); });
    if (production) await act(async () => { production.unmount(); });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
