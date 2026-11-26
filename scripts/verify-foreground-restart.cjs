const assert = require('node:assert/strict');
const fs = require('node:fs');
const esbuild = require('esbuild');
const React = require('react');
const { act, create } = require('react-test-renderer');
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.__chunkStorage = new Map();
globalThis.__wakeCalls = [];
globalThis.__appState = { currentState: 'active', addEventListener: (_, callback) => { globalThis.__stateChanged = callback; return { remove() {} }; } };
const mocks = {
  'react-native': `export const View='View',Pressable='Pressable',ScrollView='ScrollView',Modal='Modal';export const StyleSheet={create:x=>x};export const useWindowDimensions=()=>globalThis.__viewport||({width:360,height:480});export const AppState=globalThis.__appState,Platform={OS:'android'};export const Animated={View:'AnimatedView',Value:class{setValue(){}},parallel:()=>({start(){}}),spring:()=>({}),timing:()=>({})};`,
  'expo-keep-awake': `export const activateKeepAwakeAsync=async()=>{globalThis.__wakeCalls.push('activate')};export const deactivateKeepAwake=async()=>{globalThis.__wakeCalls.push('deactivate')};`,
  'react-native-safe-area-context': `export const useSafeAreaInsets=()=>({top:24,bottom:16,left:0,right:0});`,
  'lucide-react-native': `export const ArrowLeft='ArrowLeft',CheckCircle2='CheckCircle2',Flame='Flame',RefreshCw='RefreshCw',Trophy='Trophy';`,
  '@/components/LocalizedText': `export const LocalizedText='Text';`,
  '@/components/EnglishSupplementTask': `export const EnglishPalette=new Proxy({},{get:()=> '#5146E5'});`,
  '@/lib/theme': `export const Typography={fontFamily:'Test'};`,
  '@/lib/haptics': `export const hapticTap=()=>{};`,
  '@react-native-async-storage/async-storage': `export default {getItem:async key=>globalThis.__chunkStorage.get(key)??null,setItem:async(key,value)=>{if(globalThis.__storageFail)throw Error('unavailable');globalThis.__chunkStorage.set(key,value)}};`,
};
async function bundle(contents) {
  const output = await esbuild.build({ stdin: { contents, resolveDir: process.cwd() }, bundle:true,platform:'node',format:'cjs',write:false,jsx:'automatic',external:['react','react/jsx-runtime'], plugins:[{name:'feature-mocks',setup(build){
    build.onResolve({filter:/.*/},args=>mocks[args.path]?{path:args.path,namespace:'mock'}:/learningChanges$/.test(args.path)?{path:'changes',namespace:'mock'}:undefined);
    build.onLoad({filter:/.*/,namespace:'mock'},args=>({contents:mocks[args.path]||'export const notifyLearningChange=()=>{};',loader:'js'}));
  }}] });
  const module={exports:{}};new Function('module','exports','require',output.outputFiles[0].text)(module,module.exports,require);return module.exports;
}
(async()=>{
  const api=await bundle(`export * from './hooks/useForegroundKeepAwake';export * from './lib/lessonRestart';export * from './lib/lessonChunks';export {default as Celebration} from './components/LessonCelebration';`);
  let tree;
  function Screen(){api.useForegroundKeepAwake();return null;}
  await act(async()=>{tree=create(React.createElement(Screen));});
  assert.deepEqual(globalThis.__wakeCalls,['activate']);
  await act(async()=>{globalThis.__appState.currentState='background';globalThis.__stateChanged();});
  assert.equal(globalThis.__wakeCalls.at(-1),'deactivate');
  await act(async()=>{globalThis.__appState.currentState='active';globalThis.__stateChanged();});
  assert.equal(globalThis.__wakeCalls.at(-1),'activate');
  await act(async()=>{tree.unmount();});
  assert.equal(globalThis.__wakeCalls.at(-1),'deactivate');
  const order=[];let release;
  const lease=api.foregroundWakeLease(()=>new Promise(resolve=>{order.push('start');release=resolve;}),async()=>order.push('release'));
  const activating=lease.setActive(true);await Promise.resolve();await Promise.resolve();
  const closing=lease.dispose();release();await activating;await closing;
  assert.deepEqual(order,['start','release'],'late native activation is released after background/unmount');
  const throwing=api.foregroundWakeLease(async()=>{throw Error('unsupported');},async()=>{});
  await throwing.setActive(true);await throwing.dispose();

  const key='milo_lesson_chunks_done_v1';
  globalThis.__chunkStorage.set(key,JSON.stringify({long:[1,2,3],other:[1,2]}));
  const a=await api.prepareLessonRestart('/course/lesson','long');
  const b=await api.prepareLessonRestart('/course/lesson','long');
  assert.equal(a.params.id,'long');assert.equal(a.params.fromStart,'1');assert.notEqual(a.params.restartToken,b.params.restartToken);
  assert.deepEqual(JSON.parse(globalThis.__chunkStorage.get(key)),{other:[1,2]});
  assert.equal(api.lessonChunks('long',50,await api.loadCompletedChunks('long')).start,0);
  await Promise.all([api.markChunkDone('other',3),api.resetLessonChunks('long')]);
  assert.deepEqual(await api.loadCompletedChunks('other'),[1,2,3]);
  assert.equal(api.firstLessonInLevel([{id:'pre',levelId:0},{id:'a2-first',levelId:2},{id:'a2-second',levelId:2}],2).id,'a2-first');
  globalThis.__storageFail=true;await assert.rejects(()=>api.prepareLessonRestart('/course/lesson','long'));globalThis.__storageFail=false;

  const stats={sentences:50,practiceTotal:8,practiceFirstTry:5,practiceSeconds:120,speakingAverage:80,assessmentTotal:8,assessmentCorrect:7,streak:20,streakExtendedToday:true};
  const props={visible:true,lessonTitle:'عنوان بلند درس برای آزمایش',stats,hasNextLesson:true,onContinue(){},onRestart:async()=>{},dueReviews:42,onReview(){},newAchievements:Array.from({length:8},(_,id)=>({id:String(id),title:'مدال '+id,description:'توضیح کامل مدال بدون حذف محتوا'})),levelFinished:{title:'سطح پایان‌یافته',lessons:31,onStart(){}}};
  await act(async()=>{tree=create(React.createElement(api.Celebration,props));});
  const card=tree.root.findByType('AnimatedView');
  const flatten=style=>Object.assign({},...(Array.isArray(style)?style:[style]));
  assert.equal(flatten(card.props.style).maxHeight,408,'480px height minus safe areas and margins');
  const scroll=tree.root.findByType('ScrollView');
  assert.equal(scroll.findAllByType('Text').filter(node=>node.children.join('').startsWith('مدال ')).length,8,'all medals remain available inside scroll');
  assert.equal(scroll.findAllByType('Pressable').filter(node=>node.props.accessibilityLabel==='شروع از ابتدای این درس').length,0,'restart stays outside scrolling body');
  const restart=()=>tree.root.findAllByType('Pressable').find(node=>node.props.accessibilityLabel==='شروع از ابتدای این درس');
  let count=0,complete;
  await act(async()=>{tree.update(React.createElement(api.Celebration,{...props,onRestart:()=>{count++;return new Promise(resolve=>{complete=resolve;});}}));});
  await act(async()=>{restart().props.onPress();restart().props.onPress();});assert.equal(count,1);assert.equal(restart().props.disabled,true);
  await act(async()=>{complete();});assert.equal(restart().props.disabled,false);
  globalThis.__viewport={width:640,height:320};
  await act(async()=>{tree.update(React.createElement(api.Celebration,{...props,onRestart:async()=>{throw Error('failed');}}));});
  assert.equal(flatten(tree.root.findByType('AnimatedView').props.style).maxHeight,248);
  await act(async()=>{restart().props.onPress();});assert.ok(tree.root.findAllByType('Text').some(node=>node.props.accessibilityRole==='alert'));
  await act(async()=>{tree.unmount();});
  for(const file of ['components/RussianHome.tsx','components/TurkishHome.tsx','components/StarterHome.tsx','app/lang/index.tsx','components/arabic/ArabicHomeScreen.tsx','components/RussianLibrary.tsx','components/TurkishLibrary.tsx','components/StarterLibrary.tsx','app/lang/library.tsx','components/arabic/ArabicLibraryScreen.tsx'])assert.ok(fs.readFileSync(file,'utf8').includes('<LessonRestartActions'),file);
  for(const file of ['components/RussianLesson.tsx','components/TurkishLesson.tsx','components/StarterLesson.tsx','components/EnglishLessonRoute.tsx','components/arabic/ArabicLessonScreen.tsx'])assert.ok(fs.readFileSync(file,'utf8').includes('<LessonCelebration onRestart='),file);
  console.log('Foreground wake lifecycle, delayed-activation cleanup, same-route restart tokens, selected-level targeting, chunk reset/isolation, small/landscape modal bounds, all medals, sticky actions and retry guards passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
