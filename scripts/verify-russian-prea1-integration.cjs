// Integrated route checks: REAL RussianLesson, scaffold, transfer and sentence builder.
// Native views, device speech/recognition and peripheral platform services are boundaries.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const esbuild=require('esbuild');
const React=require('react');
const {act,create}=require('react-test-renderer');
const {loadInventory}=require('./helpers/practical-inventory.cjs');
// A tiny deterministic clock for the route's one-shot UI timers; no real sleeps.
function virtualClock(){
 const original={setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout};
 let now=0,sequence=0;const pending=new Map();
 globalThis.setTimeout=(fn,delay=0,...args)=>{const id=++sequence;pending.set(id,{at:now+Number(delay),fn:()=>fn(...args)});return id;};
 globalThis.clearTimeout=id=>pending.delete(id);
 return {tick(ms){const end=now+ms;let guard=0;for(;;){const due=[...pending].filter(([,v])=>v.at<=end).sort((a,b)=>a[1].at-b[1].at||a[0]-b[0])[0];if(!due)break;assert.ok(++guard<10000,'timer loop');now=due[1].at;pending.delete(due[0]);due[1].fn();}now=end;},uninstall(){globalThis.setTimeout=original.setTimeout;globalThis.clearTimeout=original.clearTimeout;pending.clear();}};
}
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
globalThis.__ruRoute={disk:new Map(),speech:[],events:[],os:'web',failRead:false,failWrite:false};
const state=globalThis.__ruRoute;
globalThis.window={localStorage:{getItem:k=>{if(state.failRead)throw Error('read failed');return state.disk.get(k)??null;},setItem:(k,v)=>{if(state.failWrite)throw Error('write failed');state.disk.set(k,v);},removeItem:k=>state.disk.delete(k)}};
const host=(name)=>`import React from 'react';export default function Boundary(p){return React.createElement('${name}',p,p.children)}`;
const mocks={
 'react-native':`export const View='View',Pressable='Pressable',ScrollView='ScrollView',ActivityIndicator='ActivityIndicator';export const StyleSheet={create:x=>x};export const Dimensions={get:()=>({width:390,height:844})};export const Platform={get OS(){return globalThis.__ruRoute.os}};`,
 '@react-native-async-storage/async-storage':`export default {getItem:async k=>{if(globalThis.__ruRoute.failRead)throw Error('read failed');return globalThis.__ruRoute.disk.get(k)??null},setItem:async(k,v)=>{if(globalThis.__ruRoute.failWrite)throw Error('write failed');globalThis.__ruRoute.disk.set(k,v)},removeItem:async k=>globalThis.__ruRoute.disk.delete(k)};`,
 'expo-router':`const router={back(){},replace(p){globalThis.__ruRoute.events.push(['replace',p])},push(){},setParams(){}};export const useRouter=()=>router,useLocalSearchParams=()=>({});`,
 '@react-navigation/native':`export const useIsFocused=()=>true;`,
 'expo-linear-gradient':`export const LinearGradient='LinearGradient';`,
 'lucide-react-native':`export const CheckCircle2='CheckCircle2',ClipboardCheck='ClipboardCheck',ArrowRight='ArrowRight',ChevronLeft='ChevronLeft',Headphones='Headphones',Mic2='Mic2',RefreshCw='RefreshCw',RotateCcw='RotateCcw',Sparkles='Sparkles',Volume2='Volume2';`,
 '@/components/LocalizedText':`export const LocalizedText='Text',LocalizedTextInput='TextInput',PERSIAN_TRANSLATION_COLOR='#444';`,
 '@/components/FitScrollView':`import React from 'react';export const FitScrollView=React.forwardRef((p,ref)=>{React.useImperativeHandle(ref,()=>({scrollTo(){}}));return React.createElement('ScrollView',p,p.children)});export const lessonScrollOffset=x=>x;`,
 '@/components/EnglishSupplementTask':`export const EnglishPalette=new Proxy({},{get:()=> '#5146E5'});`,
 '@/components/EnglishUI':`export const ENGLISH_LEVEL_GRADIENTS=new Proxy({},{get:()=>['#111','#222']});`,
 '@/lib/theme':`export const Typography={};`,
 '@/lib/format':`export const toPersianDigits=String;`,
 '@/lib/useFirstTimeHint':`export const useFirstTimeHint=()=>true;`,
 '@/components/useEnglishStudyTimer':`export const useStudyTimer=()=>({interact(){},error:''});`,
 '@/lib/russianSpeech':`export const warmRussianSpeech=()=>{};export const stopRussianSpeech=async()=>{globalThis.__ruRoute.speech.push({stop:true})};export const playRussianSpeech=async(text,rate,onError,onDone)=>{globalThis.__ruRoute.speech.push({text,rate,onError,onDone});};`,
 '@/lib/courseSpeech':`export const getAvailableVoicesAsync=async()=>[],stop=async()=>{};`,
 '@/lib/content/coreAudio':`export const ensureRecordedAudio=async()=>{};`,
 '@/lib/operatorSpeech':`export const speakOperator=(text,locale,language,done)=>done?.();`,
 '@/lib/autoRead':`export const autoRead=()=>()=>{};`,
 '@/lib/lessonRestart':`export const prepareLessonRestart=async()=>({});`,
 '@/lib/studyStreak':`export const recordStudyDay=async()=>({count:1,extendedToday:false});`,
 '@/lib/lessonRewards':`export const finishLessonRewards=async()=>({medals:[]});`,
 '@/lib/analyticsSession':`export const trackLessonStarted=()=>{},trackStageReached=()=>{},trackLessonCompleted=()=>{};`,
 '@/lib/content/courseAudit':`export const auditLessonsFromEnglish=x=>x,auditLessonsFromLearning=x=>x,courseReadiness=()=>({});`,
 '@/lib/content/readiness':`export const bandReadinessForLevel=()=>undefined;`,
 '@/components/SpeakCheck':host('SpeakCheck'),
 '@/components/SpeakDrill':host('SpeakDrill'),
 '@/components/LessonDialogueRoom':host('LessonDialogueRoom'),
 '@/components/ReadingFirstBlock':host('ReadingFirstBlock'),
 '@/components/ProductionTask':host('ProductionTask'),
 '@/components/StarterA1Skill':host('StarterA1Skill'),
 '@/components/RevealText':host('RevealText'),
 '@/components/BlindListeningList':host('BlindListeningList'),
 '@/components/LessonCelebration':host('LessonCelebration'),
 '@/components/PersianBridgeCard':`export const PersianBridgeCard='PersianBridgeCard',RuleCard='RuleCard';`,
 './LessonGenderCard':`export const LessonGenderCard='LessonGenderCard',SentenceGenderLabel='SentenceGenderLabel';`,
 '@/components/GrammarUsage':`export const GrammarNoteCard='GrammarNoteCard',GrammarPatternCard='GrammarPatternCard',GrammarStageHeader='GrammarStageHeader';`,
 '@/components/MiloBrandMark':`export const MiloGlobeHeadphoneMark='MiloGlobeHeadphoneMark';`,
 '@/components/RussianWorkshopUI':`export const GrammarLink='GrammarLink';`,
};
(async()=>{
 const inv=await loadInventory();require('./helpers/approved-russian-prea1.cjs').verifyApprovedRussianPreA1(inv.ru);
 const built=await esbuild.build({stdin:{contents:`export {default as Screen} from './components/RussianLesson';export * from './lib/languages/russianStudyState';export * from './lib/lessonAssessment';export * from './lib/languages/russianPreA1Reading';export * from './lib/languages/russianPreA1Phase3';export * from './lib/languages/russianPreA1Phase2';export {russianPreA1RoomRevisionFor,russianLessonRoomPairs} from './lib/languages/russianA1Practice';`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,jsx:'automatic',external:['react','react/jsx-runtime'],plugins:[{name:'device-boundaries',setup(b){
 b.onResolve({filter:/.*/},a=>{
  if(mocks[a.path])return {path:a.path,namespace:'mock'};
  if(/createCourseProgressStore$/.test(a.path))return {path:'progress',namespace:'mock'};
  if(/personalLearningSync$|learningChanges$/.test(a.path))return {path:'sync',namespace:'mock'};
 });
 b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:mocks[a.path]??(a.path==='progress'?`export const createCourseProgressStore=()=>({getCourseProgress:async()=>({}),completeSentenceLesson:async(id,next)=>globalThis.__ruRoute.events.push(['complete',id,next]),getDueReviewCards:async()=>[],addSentenceToReview:async()=>{}});`:`export const schedulePersonalLearningSync=()=>{},notifyLearningChange=()=>{},positionTimestamp=()=>new Date().toISOString();`),loader:'js'}));
 }}]});
 const m={exports:{}};new Function('module','exports','require',built.outputFiles[0].text)(m,m.exports,require);const api=m.exports;
 const pre=inv.ru.filter(l=>l.levelId===0),key=api.RUSSIAN_STUDY_STORAGE_KEY;
 const clock=virtualClock();
 const texts=v=>v.root.findAllByType('Text').map(n=>n.children.filter(x=>typeof x==='string').join(''));
 const byLabel=(v,label)=>{const button=v.root.findAllByType('Pressable').find(n=>n.props.accessibilityLabel===label);assert.ok(button,`missing button ${label}`);return button;};
 const next=v=>{const button=v.root.findAllByType('Pressable').find(n=>n.findAllByType('Text').some(t=>['ادامه','جملهٔ بعدی'].includes(t.children.join(''))));assert.ok(button,'footer Continue');assert.ok(!button.props.disabled,'optional support never blocks Continue');return button;};
 const saved=id=>JSON.parse(state.disk.get(key)).sessions[id];
 const seed=(lesson,stage=0)=>{state.disk.set(key,JSON.stringify({schema:1,sessions:{[lesson.id]:{stage,stageVersion:2,sentenceIndex:0,revealed:false,answers:{},showCheckAnswers:false,checksRevision:api.assessmentRevisionFor('ru',lesson.id)}}}));state.speech.length=0;};
 let view;const mount=async lesson=>{await act(async()=>{view=create(React.createElement(api.Screen,{lesson}));});assert.ok(!texts(view).includes('در حال بازیابی جلسهٔ روسی…'));};
 const press=async button=>{await act(async()=>button.props.onPress());};
 const unmount=async()=>{if(view){await act(async()=>view.unmount());view=null;}};
 const summary={date:'2026-11-26',scope:'Russian Pre-A1 integration, no curriculum edits',boundaries:'Full RussianLesson + real scaffold, transfer, builder, assessment and session storage logic. Native views, speech/ASR, room renderer, progress/rewards services and other peripheral platform services are simulated. No real device visual/audio/ASR test.',platforms:[],lessonsWalked:0,coreTargetsRendered:0,transferCases:0,everydayExamples:0,sessionRoundTrips:0};
 try{
  for(const os of ['web','android']){
   state.os=os;
   for(const lesson of pre){
    seed(lesson);await mount(lesson);
    assert.ok(texts(view).includes(lesson.situation),'actual stage 0 has the authored context');
    assert.ok(texts(view).includes('خواندن سیریلیک · یک گام کوتاه'),'real reading support on route');
    // Leave the optional decoding unanswered; core route must remain open.
    await press(next(view));assert.equal(saved(lesson.id).stage,1);
    for(const [i,sentence]of lesson.sentences.entries()){
     assert.ok(texts(view).includes(sentence.text));assert.ok(texts(view).includes(sentence.pronunciation));
     const check=view.root.findByType('SpeakCheck');assert.equal(check.props.text,sentence.text);assert.equal(check.props.autoStart,false,'mic waits for actual playback completion');
     const request=state.speech.filter(x=>x.text).at(-1);assert.equal(request.text,sentence.text);
     await act(async()=>request.onDone());assert.equal(view.root.findByType('SpeakCheck').props.autoStart,true);
     await press(next(view));summary.coreTargetsRendered++;
    }
    assert.equal(saved(lesson.id).stage,2);await press(next(view));assert.equal(saved(lesson.id).stage,3);
    await press(next(view));assert.equal(saved(lesson.id).stage,4);
    assert.equal(!!view.root.findAllByType('Text').find(t=>t.children.join('')==='کاربرد کوتاه با اطلاعات تازه'),!!api.RUSSIAN_PRE_A1_TRANSFERS[lesson.id]);
    if(api.RUSSIAN_PRE_A1_TRANSFERS[lesson.id]){
     await press(byLabel(view,'بازکردن تمرین انتقال روسی'));
     const practice=api.RUSSIAN_PRE_A1_TRANSFERS[lesson.id];
     for(const [i,item]of practice.cases.entries()){
      if(i)await press(byLabel(view,`کارت تازه ${i+1}`));
      assert.ok(texts(view).includes(item.factsFa));assert.ok(!texts(view).includes(item.sample));
      await act(async()=>view.root.findByType('TextInput').props.onChangeText('آزمونِ موقت'));
      await press(byLabel(view,'مقایسه با یک نمونه روسی'));assert.ok(texts(view).includes(item.sample));
      await press(byLabel(view,'شنیدن نمونهٔ انتقال'));const audio=state.speech.filter(x=>x.text).at(-1);assert.equal(audio.text,item.sample);
      await act(async()=>audio.onDone());assert.equal(saved(lesson.id).stage,4);assert.equal(view.root.findAllByType('SpeakCheck').length,0);summary.transferCases++;
     }
    }
    // Builder completion and transfer success are NOT necessary for progression.
    await press(next(view));assert.equal(saved(lesson.id).stage,5);
    assert.equal(view.root.findAllByType('TextInput').length,0,'draft not carried into vocabulary');
    const panel=api.RUSSIAN_PRE_A1_EVERYDAY[lesson.id];
    if(panel){
     // Simulate a core vocabulary pass whose delayed advancement must be cancelled by support audio.
     const main=view.root.findAllByType('SpeakCheck')[0];await act(async()=>main.props.onResult({score:100}));
     for(const row of panel.rows){
      if(panel.rows.length>1)await press(byLabel(view,`عبارت کاربردی: ${row.id}`));
      await press(byLabel(view,'شنیدن عبارت کاربردی'));
      const audio=state.speech.filter(x=>x.text).at(-1);assert.equal(audio.text,row.text);
      await act(async()=>audio.onDone());assert.ok(view.root.findAllByType('SpeakCheck').every(c=>!c.props.autoStart),'support audio must not arm core mic');
      const count=state.speech.filter(x=>x.text).length;await act(async()=>clock.tick(950));assert.equal(state.speech.filter(x=>x.text).length,count,'support audio cancels pending auto-advance');summary.everydayExamples++;
     }
    }
    const snapshot=saved(lesson.id);assert.equal(snapshot.stage,5);assert.ok(!JSON.stringify(snapshot).includes('آزمونِ موقت'));
    await unmount();await mount(lesson);assert.equal(saved(lesson.id).stage,5);assert.ok(!texts(view).includes('خواندن سیریلیک · یک گام کوتاه'));summary.sessionRoundTrips++;
    await press(next(view));assert.equal(saved(lesson.id).stage,6);
    await press(byLabel(view,'مرحلهٔ قبل'));assert.equal(saved(lesson.id).stage,5);
    await press(next(view));await press(next(view));assert.equal(saved(lesson.id).stage,7);
    const questions=api.expandedChoiceChecks(lesson);
    assert.equal(view.root.findAllByType('Pressable').filter(n=>n.props.accessibilityRole==='radio').length,questions.reduce((n,q)=>n+q.choices.length,0));
    for(const question of questions)assert.ok(texts(view).includes(question.promptFa),'actual quiz rendered');
    const answerButton=view.root.findAllByType('Pressable').find(n=>n.props.accessibilityRole==='radio');
    await press(answerButton);assert.deepEqual(saved(lesson.id).answers,{'0':0});
    await unmount();await mount(lesson);assert.deepEqual(saved(lesson.id).answers,{'0':0});
    summary.assessmentQuestionsRendered=(summary.assessmentQuestionsRendered??0)+questions.length;
    // Quiz data and revisions stay on the actual screen path; no added support answers in storage.
    assert.equal(saved(lesson.id).checksRevision,api.assessmentRevisionFor('ru',lesson.id));
    await press(next(view));assert.equal(saved(lesson.id).stage,8);assert.deepEqual(view.root.findByType('SpeakDrill').props.items.map(x=>x.id),lesson.sentences.map(x=>x.id));
    await press(next(view));assert.equal(saved(lesson.id).stage,9);
    const room=view.root.findByType('LessonDialogueRoom');assert.equal(room.props.contentRevision,api.russianPreA1RoomRevisionFor(lesson.id));assert.deepEqual(room.props.pairs,api.russianLessonRoomPairs(lesson));
    await press(next(view));
    assert.ok(view.root.findByType('LessonCelebration').props.visible,`normal footer can finish with optional support unanswered/ungraded: ${texts(view).join(' | ')}`);
    assert.ok(!JSON.parse(state.disk.get(key)??'{"sessions":{}}').sessions[lesson.id],'completed session cleared by real storage logic');
    assert.ok(state.events.some(e=>e[0]==='complete'&&e[1]===lesson.id));
    summary.completionInvocations=(summary.completionInvocations??0)+1;
    await unmount();summary.lessonsWalked++;
   }
   // Reuse the same mounted route instance: no previous draft or session may leak.
   const first=pre.find(l=>l.id==='ru-pre-12-verbs'),second=pre.find(l=>l.id==='ru-pre-13-greeting-name-phrases');
   seed(first,4);
   const secondSession={stage:1,stageVersion:2,sentenceIndex:3,revealed:true,answers:{},showCheckAnswers:false,checksRevision:api.assessmentRevisionFor('ru',second.id)};
   const both=JSON.parse(state.disk.get(key));both.sessions[second.id]=secondSession;state.disk.set(key,JSON.stringify(both));
   await mount(first);await press(byLabel(view,'بازکردن تمرین انتقال روسی'));
   await act(async()=>view.root.findByType('TextInput').props.onChangeText('نباید به درس بعد برود'));
   await act(async()=>view.update(React.createElement(api.Screen,{lesson:second})));
   assert.equal(saved(second.id).stage,1,'reused route preserves destination stage');
   assert.equal(saved(second.id).sentenceIndex,3,'reused route preserves destination sentence');
   assert.equal(view.root.findAllByType('TextInput').length,0);
   assert.ok(texts(view).includes(second.sentences[3].text));
   await unmount();summary.lessonSwitches=(summary.lessonSwitches??0)+1;

   // Delayed device callbacks must never arm a different sentence or stage.
   seed(first,1);await mount(first);const stale=state.speech.filter(x=>x.text).at(-1);
   await press(next(view));const active=state.speech.filter(x=>x.text).at(-1);
   await act(async()=>stale.onDone());assert.equal(view.root.findByType('SpeakCheck').props.autoStart,false);
   await act(async()=>active.onError());assert.equal(view.root.findByType('SpeakCheck').props.autoStart,true);
   assert.ok(texts(view).some(t=>t.includes('صدای روسی دستگاه در دسترس نیست')));
   assert.ok(!next(view).props.disabled,'missing device audio does not block learning');
   await unmount();summary.audioFallbacks=(summary.audioFallbacks??0)+1;

   // Failed reads cannot overwrite original history; the real Retry restores the route.
   seed(first);const intact=state.disk.get(key);state.failRead=true;
   await act(async()=>{view=create(React.createElement(api.Screen,{lesson:first}));});
   assert.ok(texts(view).some(t=>t.includes('جلسهٔ قبلی خوانده نشد')));assert.equal(state.disk.get(key),intact);
   state.failRead=false;
   const retry=view.root.findAllByType('Pressable').find(n=>n.findAllByType('Text').some(t=>t.children.join('')==='تلاش دوباره'));
   assert.ok(retry);await press(retry);assert.ok(texts(view).includes('خواندن سیریلیک · یک گام کوتاه'));
   state.failWrite=true;
   const continueButton=next(view);await press(continueButton);
   assert.ok(texts(view).some(t=>t.includes('جلسه ذخیره نشد')));
   const disabledContinue=view.root.findAllByType('Pressable').find(n=>n.findAllByType('Text').some(t=>t.children.join('')==='جملهٔ بعدی'));
   assert.ok(disabledContinue.props.disabled,'failed save prevents claiming persisted progress');
   state.failWrite=false;
   const retrySave=view.root.findAllByType('Pressable').find(n=>n.findAllByType('Text').some(t=>t.children.join('')==='تلاش دوباره برای ذخیرهٔ جلسه'));
   assert.ok(retrySave);await press(retrySave);assert.equal(saved(first.id).stage,1);assert.ok(!next(view).props.disabled);
   await unmount();summary.storageFailureRecoveries=(summary.storageFailureRecoveries??0)+2;
   // Real higher-band screens must not acquire any of the optional Pre-A1 widgets.
   for(const level of [...new Set(inv.ru.filter(l=>l.levelId>0).map(l=>l.levelId))]){
    const lesson=inv.ru.find(l=>l.levelId===level);
    for(const stage of [0,4,5]){
     seed(lesson,stage);await mount(lesson);
     assert.ok(!texts(view).includes('خواندن سیریلیک · یک گام کوتاه'));
     assert.ok(!texts(view).includes('کاربرد کوتاه با اطلاعات تازه'));
     assert.ok(!view.root.findAllByType('Pressable').some(n=>n.props.accessibilityLabel==='شنیدن عبارت کاربردی'));
     await unmount();summary.higherBandRenders=(summary.higherBandRenders??0)+1;
    }
   }
   summary.platforms.push(os);
  }
 }finally{await unmount();clock.uninstall();}
 fs.writeFileSync('reports/russian-prea1-integration-validation.json',JSON.stringify(summary,null,2)+'\n');console.log('Russian Pre-A1 integrated route PASS',JSON.stringify(summary));
})().catch(e=>{console.error(e);process.exitCode=1;});
