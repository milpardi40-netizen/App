// Read-only pedagogical audit instrumentation. Does NOT edit course/runtime data or real progress.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {createHash} = require('node:crypto');
const esbuild = require('esbuild');
const ts = require('typescript');
const React = require('react');
const {act,create} = require('react-test-renderer');
const {loadInventory} = require('./helpers/practical-inventory.cjs');
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const fold = value => value.toLowerCase().replace(/\u0301/g,'').replace(/ё/g,'е');
const words = value => fold(value).match(/[а-я]+/g) ?? [];
const mocks = {
  'react-native': `export const View='View',Pressable='Pressable';export const StyleSheet={create:x=>x};export const AccessibilityInfo={isReduceMotionEnabled:async()=>true,addEventListener:()=>({remove(){}})};export const Easing={inOut:x=>x,ease:x=>x};export const Animated={View:'AnimatedView',Value:class{setValue(){}interpolate(){return 1}},loop:()=>({start(){},stop(){}}),sequence:()=>({}),timing:()=>({})};`,
  'expo-router': `export const useRouter=()=>({push(){}});`,
  'react-native-svg': `export default 'Svg';export const Circle='Circle';`,
  'lucide-react-native': `export const Bot='Bot',ChevronLeft='ChevronLeft',EyeOff='EyeOff',Eye='Eye',Headphones='Headphones',MessageCircle='MessageCircle',Mic='Mic',RefreshCw='RefreshCw',UserRound='UserRound',Volume2='Volume2',Check='Check',X='X',RotateCcw='RotateCcw';`,
  '@/components/LocalizedText': `export const LocalizedText='Text';`,
  '@/components/SpeakCheck': `import React from 'react';export default function Check(props){return React.createElement('SpeakCheck',props);}`,
  '@/components/EnglishSupplementTask': `export const EnglishPalette=new Proxy({},{get:()=>'#5146E5'});`,
  '@/lib/operatorSpeech': `export const stopOperatorSpeech=async()=>{};`,
  '@react-native-async-storage/async-storage': `export default {getItem:async k=>globalThis.__ruAuditDisk.get(k)??null,setItem:async(k,v)=>globalThis.__ruAuditDisk.set(k,v)};`,
  '@/lib/theme': `export const Radius={},Shadows={},Spacing={},Typography={sizes:{}};`,
  '@/lib/format': `export const toPersianDigits=String;`,
  '@/lib/haptics': `export const hapticTap=()=>{};`,
};
const routePath = 'components/RussianLesson.tsx';
function prop(tag,name) {
  const source=fs.readFileSync(routePath,'utf8');
  const ast=ts.createSourceFile(routePath,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  let value;
  function visit(node){
    if(ts.isJsxSelfClosingElement(node)&&node.tagName.getText(ast)===tag)for(const p of node.attributes.properties)if(ts.isJsxAttribute(p)&&p.name.getText(ast)===name)value=p.initializer.expression.getText(ast);
    ts.forEachChild(node,visit);
  }
  visit(ast);assert.ok(value,`${tag}.${name} wired`);return value;
}
const visible = view => view.root.findAllByType('Text').map(n=>n.children.filter(c=>typeof c==='string').join('')).join('\n');
async function main({verifyPhase1=false, output='reports/russian-prea1-latest-metrics.json'}={}){
  globalThis.__ruAuditDisk = new Map();
  const inventory=await loadInventory();
  const before=digest(inventory);
  const lessons=inventory.ru.filter(l=>l.levelId===0);
  const built=await esbuild.build({stdin:{contents:`
    export * from './lib/languages/russianPreA1';
    export * from './lib/languages/russianA1Practice';
    export * from './lib/languages/russianPersianBridge';
    export {expandedChoiceChecks} from './lib/lessonAssessment';
    export * from './lib/lessonDialoguePairs';
    export * from './lib/dialogueRoomHistory';
    export {default as Room} from './components/LessonDialogueRoom';
    export {default as Builder} from './components/RussianSentenceBuilder';
    export {default as Listening} from './components/BlindListeningList';
  `,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,jsx:'automatic',external:['react','react/jsx-runtime'],plugins:[{name:'audit-device-boundaries',setup(build){
    build.onResolve({filter:/.*/},args=>mocks[args.path]?{path:args.path,namespace:'mock'}:undefined);
    build.onLoad({filter:/.*/,namespace:'mock'},args=>({contents:mocks[args.path],loader:'js'}));
  }}]});
  const m={exports:{}};new Function('module','exports','require',built.outputFiles[0].text)(m,m.exports,require);const api=m.exports;
  const pairsFor=new Function('lesson',...Object.keys(api),`return (${prop('LessonDialogueRoom','pairs')});`);
  const revisionFor=new Function('lesson',...Object.keys(api),`return (${prop('LessonDialogueRoom','contentRevision')});`);
  const guidedFor=new Function('lesson','sentenceIndex',...Object.keys(api),`return (${prop('RussianSentenceBuilder','guided')});`);
  const known=new Set(),formLessons=new Map();
  let roomRuns=0,renderedLearnerTargets=0;
  const rows=[];
  for(const [index,lesson]of lessons.entries()){
    const tokens=lesson.sentences.flatMap(s=>words(s.text));
    const unique=[...new Set(tokens)];const novel=unique.filter(w=>!known.has(w));
    unique.forEach(w=>{known.add(w);formLessons.set(w,(formLessons.get(w)||0)+1);});
    const pairs=pairsFor(lesson,...Object.values(api));
    const revision=revisionFor(lesson,...Object.values(api));
    if(verifyPhase1){
      assert.equal(revision,api.russianPreA1RoomRevisionFor(lesson.id));
      assert.deepEqual(pairs.filter(p=>p.section==='dialogue').flatMap(p=>[p.operator.text,p.learner.text]),lesson.dialogue.map(l=>l.text));
      assert.deepEqual(pairs.filter(p=>p.section==='review').map(p=>p.sentenceId),lesson.sentences.map(s=>s.id));
    }
    const spokenTexts=pairs.flatMap(p=>[p.operator.text,p.learner.text]);
    const missingScene=lesson.dialogue.filter(line=>!spokenTexts.includes(line.text));
    const sceneKinds=pairs.reduce((out,p)=>(out[p.kind]=(out[p.kind]||0)+1,out),{});
    const roleInversions=pairs.filter(p=>p.kind==='exchange'&&lesson.dialogue.find(l=>l.text===p.learner.text)?.role==='partner');
    const guided=lesson.sentences.filter((s,i)=>guidedFor(lesson,i,...Object.values(api))).length;
    for(const starter of ['operator','me']){
      const events=[];let room;
      const oldKey=`${lesson.id}:${api.LESSON_DIALOGUE_REVISION}:${api.PRE_A1_CONTENT_REVISION}`;
      const newKey=`${lesson.id}:${api.LESSON_DIALOGUE_REVISION}:${revision}`;
      const phase1Key=`${lesson.id}:${api.LESSON_DIALOGUE_REVISION}:${api.RUSSIAN_PRE_A1_ROOM_REVISION}`;
      const oldRun={score:21,attempted:lesson.sentences.length,total:lesson.sentences.length,missed:['retired'],at:1};
      globalThis.__ruAuditDisk.set('dialogue_room_runs_v1',JSON.stringify({[oldKey]:[oldRun],...(phase1Key!==newKey?{[phase1Key]:[oldRun]}:{})}));
      try{
        await act(async()=>{room=create(React.createElement(api.Room,{language:'ru',lessonId:lesson.id,lessonTitle:lesson.title,levelId:0,situation:lesson.situation,pairs,contentRevision:revision,locale:'ru-RU',onSpeak(){},onSpeakOperator:(text,done)=>events.push({text,done})}));});
        const button=label=>room.root.findAllByType('Pressable').find(n=>n.props.accessibilityLabel===label);
        if(starter==='me')await act(async()=>button('من شروع می‌کنم').props.onPress());
        await act(async()=>button('شروع گفت‌وگو').props.onPress());
        const expected=api.dialoguePairLines(pairs,starter);
        if(verifyPhase1){
          assert.deepEqual(expected.slice(0,4).map(l=>l.text),lesson.dialogue.map(l=>l.text),'independent authored scene order, for BOTH starters');
          assert.equal(pairs.length,lesson.sentences.length+2);
          assert.equal(expected.length,lesson.sentences.length*2+4);
          assert.ok(visible(room).includes('مکالمهٔ پیوسته'));
          for(const [i,sentence]of lesson.sentences.entries()){
            const review=expected.slice(4+i*2,6+i*2);
            assert.equal(review[starter==='operator'?1:0].text,sentence.text);
            assert.equal(review[starter==='operator'?0:1].text,starter==='operator'?`Повтори́те, пожа́луйста: ${sentence.text}`:sentence.text);
          }
        }
        for(let step=0;step<expected.length;step++){
          if((step%2===0)===(starter==='operator')){
            const event=events.shift();assert.ok(event);assert.equal(event.text,expected[step].text);
            await act(async()=>event.done());
          }else{
            const target=room.root.findByType('SpeakCheck');assert.equal(target.props.text,expected[step].text);
            renderedLearnerTargets++;await act(async()=>target.props.onResult({score:100,heard:target.props.text,words:[]}));
          }
        }
        if(verifyPhase1){
          assert.deepEqual(await api.loadRuns(oldKey),[oldRun],'old room runs are not rewritten/deleted');
          if(phase1Key!==newKey)assert.deepEqual(await api.loadRuns(phase1Key),[oldRun],'phase-1 room history remains separate from changed lesson-12 targets');
          const runs=await api.loadRuns(newKey);assert.equal(runs.length,1);assert.equal(runs[0].total,pairs.length);
          assert.equal(runs[0].attempted,pairs.length);
        }
        roomRuns++;
      }finally{if(room)await act(async()=>room.unmount());}
    }
    rows.push({order:index+1,id:lesson.id,title:lesson.title,durationMinutes:lesson.durationMinutes,expressions:lesson.sentences.length,tokens:tokens.length,meanTokensPerExpression:tokens.length/lesson.sentences.length,firstSeenSurfaceForms:novel,authoredChecks:lesson.checks.length,renderedChecks:api.expandedChoiceChecks(lesson).length,room:sceneKinds,authoredSceneTurns:lesson.dialogue.length,authoredSceneTurnsFoundVerbatim:lesson.dialogue.length-missingScene.length,missingSceneTurns:missingScene.map(l=>l.text),partnerLinesAssignedToLearner:roleInversions.map(p=>p.learner.text),guidedBuilderTargets:guided,bridges:api.bridgeRulesForLesson(lesson.sentences,true).map(r=>({id:r.id,title:r.title,note:r.note}))});
  }
  // Observe the actual listening component, not just authored task labels.
  let listening, builder;const first=lessons[0];
  try{
    const items=api.russianListeningItems(first);
    await act(async()=>{listening=create(React.createElement(api.Listening,{items,activeIndex:0,onSelect(){}}));});
    assert.ok(!visible(listening).includes(first.sentences[0].text));
    const option=listening.root.findAllByType('Pressable').find(n=>n.findAllByType('Text').some(t=>t.children.join('')===items[0].fa));
    await act(async()=>option.props.onPress());
    assert.ok(visible(listening).includes(first.sentences[0].text),'text can be revealed by choosing an option without a playback-completion event');
    const sample=lessons[11].sentences[1];
    await act(async()=>{builder=create(React.createElement(api.Builder,{sentence:sample,guided:true,levelId:0,onSpeak(){}}));});
    assert.ok(visible(builder).includes(sample.text),'dense verb row remains visible as a guided model');
  }finally{if(listening)await act(async()=>listening.unmount());if(builder)await act(async()=>builder.unmount());}
  const expressions=lessons.flatMap(l=>l.sentences);
  const corpus=expressions.map(s=>s.text).join('\n');
  const result={scope:'Russian Pre-A1 only; read-only audit, not a proficiency test',date:'2026-11-26',method:'Cyrillic tokens; acute stress removed and ё folded to е. Unique forms are NOT lemmas or independently taught vocabulary items. Renderer uses simulated native views, speech callbacks and isolated in-memory history using the real history module; no device audio evaluated.',totals:{lessons:lessons.length,expressions:expressions.length,authoredSceneTurns:rows.reduce((n,r)=>n+r.authoredSceneTurns,0),authoredChecks:rows.reduce((n,r)=>n+r.authoredChecks,0),renderedChecks:rows.reduce((n,r)=>n+r.renderedChecks,0),estimatedMinutes:rows.reduce((n,r)=>n+r.durationMinutes,0),tokens:expressions.flatMap(s=>words(s.text)).length,distinctSurfaceForms:known.size,formsPresentInOnlyOneLesson:[...formLessons.values()].filter(n=>n===1).length,roomEchoPairs:rows.reduce((n,r)=>n+(r.room.echo||0),0),roomExchangePairs:rows.reduce((n,r)=>n+(r.room.exchange||0),0),authoredSceneTurnsFoundVerbatim:rows.reduce((n,r)=>n+r.authoredSceneTurnsFoundVerbatim,0),lessonsWithFullSceneVerbatim:rows.filter(r=>r.authoredSceneTurnsFoundVerbatim===r.authoredSceneTurns).length,partnerLinesAssignedToLearner:rows.reduce((n,r)=>n+r.partnerLinesAssignedToLearner.length,0),guidedBuilderTargets:rows.reduce((n,r)=>n+r.guidedBuilderTargets,0),roomRunsRendered:roomRuns,learnerTargetsRendered:renderedLearnerTargets},observations:{firstNameIntroductionAt:lessons.findIndex(l=>l.sentences.some(s=>fold(s.text).includes('меня зовут')))+1,repetitionRequestAt:lessons.findIndex(l=>l.sentences.some(s=>fold(s.text).includes('повторите')))+1,pictureOrMapContexts:lessons.filter(l=>/عکس|نقشه/.test(l.situation)).map(l=>({id:l.id,context:l.situation})),guidedExceptions:expressions.filter(s=>{const l=lessons.find(l=>l.sentences.some(x=>x.id===s.id));return !guidedFor(l,l.sentences.indexOf(s),...Object.values(api));}).map(s=>s.id),twelveThirteenVariants:[...new Set(corpus.match(/[Дд]ве\u0301?на\u0301?дцать|[Тт]ри\u0301?на\u0301?дцать/g)||[])],listeningAllowsRevealWithoutCompletedPlayback:true,courseInventoriesUnchanged:digest(await loadInventory())===before},inventoryHashes:Object.fromEntries(Object.entries(inventory).map(([k,v])=>[k,digest(v)])),lessons:rows};
  assert.ok(result.observations.courseInventoriesUnchanged);
  fs.mkdirSync('reports',{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result.totals,null,2));console.log('Read-only renderer/data audit complete. Course inventories unchanged; findings are not a PASS/FAIL CEFR certification.');
}
module.exports={main};
if(require.main===module)main({output:process.argv[2]||'reports/russian-prea1-latest-metrics.json'}).catch(error=>{console.error(error);process.exitCode=1;});
