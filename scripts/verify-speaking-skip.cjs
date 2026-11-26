const assert=require('node:assert/strict');
const esbuild=require('esbuild');
const React=require('react');
const {act,create}=require('react-test-renderer');
// Every real microphone call site must provide actual navigation, not just render a skip label.
const ts=require('typescript');const fs=require('node:fs');
for (const file of ['components/RussianLesson.tsx','components/TurkishLesson.tsx','components/StarterLesson.tsx','components/EnglishLessonRoute.tsx','components/arabic/ArabicLessonScreen.tsx','components/LessonDialogueRoom.tsx','components/SpeakDrill.tsx','components/WordLab.tsx','components/arabic/ArabicVocabularyScreen.tsx','components/ReviewRecall.tsx']) {
 const ast=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const visit=node=>{if(ts.isJsxSelfClosingElement(node)&&node.tagName.getText(ast)==='SpeakCheck')assert.ok(node.attributes.properties.some(p=>ts.isJsxAttribute(p)&&p.name.getText(ast)==='onSkip'),file+': missing real skip callback');ts.forEachChild(node,visit);};visit(ast);
}
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
globalThis.__speechEvents={};globalThis.__speechCalls=[];globalThis.__focused=true;
const state={currentState:'active',addEventListener(_,fn){globalThis.__speechAppState=fn;return{remove(){}};}};
globalThis.__nativeAppState=state;
globalThis.__permission=async()=>({granted:true});
const mocks={
'react-native':`export const View='View',Pressable='Pressable',StyleSheet={create:x=>x},Platform={OS:'android'},AppState=globalThis.__nativeAppState;`,
'@react-navigation/native':`export const useIsFocused=()=>globalThis.__focused;`,
'expo-speech-recognition':`import {useEffect,useRef} from 'react';export const useSpeechRecognitionEvent=(name,fn)=>{const latest=useRef(fn);latest.current=fn;useEffect(()=>{globalThis.__speechEvents[name]=(...args)=>latest.current(...args);return()=>delete globalThis.__speechEvents[name]},[name])};export const ExpoSpeechRecognitionModule={isRecognitionAvailable:()=>true,requestPermissionsAsync:()=>globalThis.__permission(),start:options=>globalThis.__speechCalls.push(['start',options]),abort:()=>globalThis.__speechCalls.push(['abort']),stop:()=>globalThis.__speechCalls.push(['stop'])};`,
'lucide-react-native':`export const ChevronLeft='ChevronLeft',Mic2='Mic',RefreshCw='Refresh',Square='Square',Volume2='Volume';`,
'@/components/LocalizedText':`export const LocalizedText='Text';`,
'@/lib/theme':`export const Typography={};`,
'@/lib/courseSpeech':`export const stop=async()=>{globalThis.__speechCalls.push(['tts-stop']);await globalThis.__ttsRelease;};export const speak=()=>{};`,
'@/lib/practiceActivity':`export const addPracticeActivity=async()=>{globalThis.__activityWrites=(globalThis.__activityWrites||0)+1;};`,
'@/lib/reviewHistory':`export const localDay=()=> '2026-11-26';`,
'@/lib/languages/registry':`export const isLanguageId=()=>true;`,
};
(async()=>{
const output=await esbuild.build({entryPoints:['components/SpeakCheck.tsx'],bundle:true,platform:'node',format:'cjs',write:false,jsx:'automatic',external:['react','react/jsx-runtime'],plugins:[{name:'speech-mocks',setup(b){b.onResolve({filter:/.*/},a=>mocks[a.path]?{path:a.path,namespace:'mock'}:undefined);b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:mocks[a.path],loader:'js'}));}}]});
const mod={exports:{}};new Function('module','exports','require',output.outputFiles[0].text)(mod,mod.exports,require);const Check=mod.exports.default;
let tree,skips=0,results=0;
const props={text:'Это моя мама.',locale:'ru-RU',onSkip:()=>skips++,onResult:()=>results++};
const button=label=>tree.root.findAllByType('Pressable').find(n=>n.props.accessibilityLabel===label);
await act(async()=>{tree=create(React.createElement(Check,props));});
let allow;globalThis.__permission=()=>new Promise(resolve=>allow=resolve);
await act(async()=>{button('شروع گفتن').props.onPress();});
await act(async()=>{button('رد شو').props.onPress();button('رد شو').props.onPress();});
await act(async()=>{allow({granted:true});});
assert.equal(skips,1);assert.equal(results,0);assert.equal(globalThis.__speechCalls.filter(x=>x[0]==='start').length,0,'skip invalidates pending permission');
globalThis.__permission=async()=>({granted:true});
await act(async()=>{tree.update(React.createElement(Check,{...props,text:'Hello'}));});
let releaseTts;globalThis.__ttsRelease=new Promise(resolve=>releaseTts=resolve);
await act(async()=>{button('شروع گفتن').props.onPress();});
assert.equal(globalThis.__speechCalls.at(-1)[0],'tts-stop');
assert.equal(globalThis.__speechCalls.filter(x=>x[0]==='start').length,0,'recognizer waits for TTS release');
await act(async()=>{releaseTts();});
const options=globalThis.__speechCalls.find(x=>x[0]==='start')[1];assert.equal(options.requiresOnDeviceRecognition,false);assert.equal(options.androidIntentOptions.EXTRA_PREFER_OFFLINE,true,'existing device packs preferred, no forced download');
await act(async()=>{globalThis.__speechEvents.start();button('رد شو').props.onPress();});
await act(async()=>{globalThis.__speechEvents.result({isFinal:true,results:[{transcript:'Hello'}]});globalThis.__speechEvents.end();globalThis.__speechEvents.error({error:'no-speech'});});
assert.equal(results,0);assert.equal(globalThis.__activityWrites||0,0);assert.equal(globalThis.__speechCalls.at(-1)[0],'tts-stop');assert.ok(globalThis.__speechCalls.some(x=>x[0]==='abort'));
await act(async()=>{tree.update(React.createElement(Check,{...props,text:'Next',autoStart:true}));});
await act(async()=>{button('رد شو').props.onPress();});
const starts=globalThis.__speechCalls.filter(x=>x[0]==='start').length;
await act(async()=>{await new Promise(resolve=>setTimeout(resolve,470));});
assert.equal(globalThis.__speechCalls.filter(x=>x[0]==='start').length,starts,'skip cancels queued auto-mic');
await act(async()=>{tree.update(React.createElement(Check,{...props,text:'Focused'}));});
await act(async()=>{button('شروع گفتن').props.onPress();});
await act(async()=>{globalThis.__focused=false;tree.update(React.createElement(Check,{...props,text:'Focused'}));});
assert.equal(globalThis.__speechCalls.at(-1)[0],'abort');
await act(async()=>{tree.unmount();});
// Reproduce the reported regression: narration finishes while inactive, or a permission
// dialog interrupts the queued auto-start. The same item must start on returning active.
globalThis.__focused=true;
state.currentState='inactive';
const beforeAuto=globalThis.__speechCalls.filter(x=>x[0]==='start').length;
await act(async()=>{tree=create(React.createElement(Check,{...props,text:'After narration',autoStart:true}));});
await act(async()=>{await new Promise(resolve=>setTimeout(resolve,470));});
assert.equal(globalThis.__speechCalls.filter(x=>x[0]==='start').length,beforeAuto);
await act(async()=>{state.currentState='active';globalThis.__speechAppState('active');});
await act(async()=>{await new Promise(resolve=>setTimeout(resolve,470));});
assert.equal(globalThis.__speechCalls.filter(x=>x[0]==='start').length,beforeAuto+1,'same narrated item auto-starts when foreground returns');
await act(async()=>{tree.unmount();});
let permissionResolved;
globalThis.__permission=()=>new Promise(resolve=>permissionResolved=resolve);
await act(async()=>{tree=create(React.createElement(Check,{...props,text:'Permission dialog',autoStart:true}));});
await act(async()=>{await new Promise(resolve=>setTimeout(resolve,470));});
await act(async()=>{state.currentState='inactive';globalThis.__speechAppState('inactive');});
await act(async()=>{permissionResolved({granted:true});});
globalThis.__permission=async()=>({granted:true});
await act(async()=>{state.currentState='active';globalThis.__speechAppState('active');});
const beforeReturn=globalThis.__speechCalls.filter(x=>x[0]==='start').length;
await act(async()=>{await new Promise(resolve=>setTimeout(resolve,470));});
assert.equal(globalThis.__speechCalls.filter(x=>x[0]==='start').length,beforeReturn+1,'permission interruption does not permanently consume automatic microphone');
const beforeBatchedReturn=globalThis.__speechCalls.filter(x=>x[0]==='start').length;
await act(async()=>{state.currentState='inactive';globalThis.__speechAppState('inactive');state.currentState='active';globalThis.__speechAppState('active');});
await act(async()=>{await new Promise(resolve=>setTimeout(resolve,470));});
assert.equal(globalThis.__speechCalls.filter(x=>x[0]==='start').length,beforeBatchedReturn+1,'batched permission-dialog events also re-arm the microphone');
const flatten=x=>Object.assign({},...(Array.isArray(x)?x:[x]));
const skipStyle=flatten(button('رد شو').props.style({pressed:false}));
assert.equal(skipStyle.minHeight,48);assert.equal(skipStyle.paddingHorizontal,22);assert.equal(skipStyle.borderRadius,999);assert.equal(skipStyle.backgroundColor,'#D97706');
assert.equal(button('رد شو').findAllByType('ChevronLeft').length,1);
await act(async()=>{tree.unmount();});
// Normal narration handoff: no microphone before autoStart, exactly one after completion,
// no duplicate from unrelated re-render, and another automatic start for the next item.
const countStarts=()=>globalThis.__speechCalls.filter(x=>x[0]==='start').length;
await act(async()=>{tree=create(React.createElement(Check,{...props,text:'Narrated sentence',autoStart:false}));});
const beforeNarration=countStarts();
await act(async()=>{await new Promise(resolve=>setTimeout(resolve,470));});assert.equal(countStarts(),beforeNarration);
await act(async()=>{tree.update(React.createElement(Check,{...props,text:'Narrated sentence',autoStart:true}));});
await act(async()=>{await new Promise(resolve=>setTimeout(resolve,470));});assert.equal(countStarts(),beforeNarration+1);
await act(async()=>{tree.update(React.createElement(Check,{...props,text:'Narrated sentence',autoStart:true,accent:'#123456'}));});
await act(async()=>{await new Promise(resolve=>setTimeout(resolve,470));});assert.equal(countStarts(),beforeNarration+1);
await act(async()=>{tree.update(React.createElement(Check,{...props,text:'Next narrated word',autoStart:false}));});
await act(async()=>{tree.update(React.createElement(Check,{...props,text:'Next narrated word',autoStart:true}));});
await act(async()=>{await new Promise(resolve=>setTimeout(resolve,470));});assert.equal(countStarts(),beforeNarration+2);
await act(async()=>{tree.unmount();});
console.log('Real SpeakCheck tests passed: narration-to-auto-mic handoff, normal and batched foreground/permission recovery, styled real skip, permission/TTS/auto-start cancellation, one skip only, abort + late-result suppression, no fabricated score/activity, focus cleanup and existing-pack preference. Device/VPN behaviour requires a physical phone.');
})().catch(e=>{console.error(e);process.exitCode=1;});
