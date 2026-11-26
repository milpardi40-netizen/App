const assert=require('node:assert/strict');
const esbuild=require('esbuild');
const React=require('react');
const {act,create}=require('react-test-renderer');
// Every real microphone call site must provide actual navigation, not just render a skip label.
const ts=require('typescript');const fs=require('node:fs');
const {createHash}=require('node:crypto');
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
// Pin the actual release72 source, not assumptions about what its device lifecycle should do.
// Remove ONLY the isolated skip addition; everything else must match byte for byte.
let release72 = fs.readFileSync('components/SpeakCheck.tsx', 'utf8')
 .replace('ChevronLeft, Mic2, RefreshCw, Square, Volume2', 'Mic2, RefreshCw, Square, Volume2')
 .replace('  onSkip?: () => void;\n', '')
 .replace('title, onResult, onSkip, autoStart', 'title, onResult, autoStart')
 .replace("  const skipped = useRef(false);\n  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);\n", '')
 .replace('    skipped.current = false;\n', '')
 .replace(/  const skip = \(\) => \{[\s\S]*?\n  \};\n(?=  \/\*\* One-tap flow)/, '')
 .replace('if (skipped.current || !text ||', 'if (!text ||')
 .replace('    const handle = setTimeout(() => { autoTimer.current = null; void startRef.current?.(); }, 420);\n    autoTimer.current = handle;', '    const handle = setTimeout(() => { void startRef.current?.(); }, 420);')
 .replace('    if (skipped.current) return;\n', '')
 .replace('          skipped.current = false;\n', '')
 .split('\n').filter(line=>!line.includes('{onSkip ? <Pressable')&&!line.startsWith('  skipButton:')&&!line.startsWith('  skipText:')).join('\n');
assert.equal(createHash('sha256').update(release72).digest('hex'), '6f775dae4e4b94422823575fdbfeb40d963508ccf586a7c7d4a987b03fc835d8', 'non-skip code must exactly equal release72 (003d9d9), including all auto-start, recognizer and result handlers');
(async()=>{
const output=await esbuild.build({entryPoints:['components/SpeakCheck.tsx'],bundle:true,platform:'node',format:'cjs',write:false,jsx:'automatic',external:['react','react/jsx-runtime'],plugins:[{name:'speech-mocks',setup(b){b.onResolve({filter:/.*/},a=>mocks[a.path]?{path:a.path,namespace:'mock'}:undefined);b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:mocks[a.path],loader:'js'}));}}]});
const mod={exports:{}};new Function('module','exports','require',output.outputFiles[0].text)(mod,mod.exports,require);const Check=mod.exports.default;
let tree,skips=0,results=0;
const props={text:'Hello',locale:'en-US',onSkip:()=>skips++,onResult:()=>results++};
const button=label=>tree.root.findAllByType('Pressable').find(n=>n.props.accessibilityLabel===label);
const starts=()=>globalThis.__speechCalls.filter(call=>call[0]==='start');
const waitAuto=()=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,470));});
// release72 did not depend on nested navigator focus or transient AppState for capture.
globalThis.__focused=false;state.currentState='inactive';
// A new, unresolved native stop promise must not prevent capture after narration has ended.
globalThis.__ttsRelease=new Promise(()=>{});
for (const [locale,text] of [['ru-RU','Привет'],['en-US','Hello'],['tr-TR','Merhaba'],['de-DE','Hallo'],['fr-FR','Bonjour'],['es-ES','Hola'],['ar-SA','مرحبا']]) {
 await act(async()=>{tree=create(React.createElement(Check,{...props,text,locale,autoStart:false}));});
 const before=starts().length;
 await waitAuto();assert.equal(starts().length,before,'no capture during narration');
 await act(async()=>{tree.update(React.createElement(Check,{...props,text,locale,autoStart:true}));});
 await waitAuto();assert.equal(starts().length,before+1,locale+': automatic capture after narration, without a button press');
 assert.deepEqual(starts().at(-1)[1],{lang:locale,interimResults:true,continuous:false,maxAlternatives:5,contextualStrings:[text],requiresOnDeviceRecognition:false,addsPunctuation:false},'exact release72 recognition options; no added offline preference');
 await act(async()=>{tree.update(React.createElement(Check,{...props,text,locale,autoStart:true,accent:'#123456'}));});
 await waitAuto();assert.equal(starts().length,before+1,'no duplicate capture on re-render');
 await act(async()=>{globalThis.__speechEvents.start();});
 await act(async()=>{tree.unmount();});
}
// Permission completion must not depend on unrelated navigation focus changes.
let allow;globalThis.__permission=()=>new Promise(resolve=>allow=resolve);
await act(async()=>{tree=create(React.createElement(Check,{...props,autoStart:true}));});
await waitAuto();const beforePermission=starts().length;
await act(async()=>{allow({granted:true});});assert.equal(starts().length,beforePermission+1);
await act(async()=>{globalThis.__speechEvents.start();button('رد شو').props.onPress();button('رد شو').props.onPress();});
await act(async()=>{globalThis.__speechEvents.result({isFinal:true,results:[{transcript:'Hello'}]});globalThis.__speechEvents.end();globalThis.__speechEvents.error({error:'no-speech'});});
assert.equal(skips,1);assert.equal(results,0);assert.equal(globalThis.__activityWrites||0,0);assert.ok(globalThis.__speechCalls.some(call=>call[0]==='abort'));
await act(async()=>{tree.unmount();});
// Skip during permission and skip before the 420ms timer must cancel, without affecting normal handoff.
await act(async()=>{tree=create(React.createElement(Check,{...props,autoStart:true}));});
await waitAuto();const beforeSkip=starts().length;
await act(async()=>{button('رد شو').props.onPress();allow({granted:true});});assert.equal(starts().length,beforeSkip);
await act(async()=>{tree.unmount();});
globalThis.__permission=async()=>({granted:true});
await act(async()=>{tree=create(React.createElement(Check,{...props,autoStart:true}));});
await act(async()=>{button('رد شو').props.onPress();});await waitAuto();assert.equal(starts().length,beforeSkip);
const flatten=value=>Object.assign({},...(Array.isArray(value)?value:[value]));
const skipStyle=flatten(button('رد شو').props.style({pressed:false}));
assert.equal(skipStyle.minHeight,48);assert.equal(skipStyle.paddingHorizontal,22);assert.equal(skipStyle.borderRadius,999);assert.equal(skipStyle.backgroundColor,'#D97706');
await act(async()=>{tree.unmount();});
// Same mounted component: the next word still opens automatically after its narration.
await act(async()=>{tree=create(React.createElement(Check,{...props,autoStart:true}));});await waitAuto();
await act(async()=>{globalThis.__speechEvents.start();});
await act(async()=>{tree.update(React.createElement(Check,{...props,text:'Next word',autoStart:false}));});
const beforeNext=starts().length;
await act(async()=>{tree.update(React.createElement(Check,{...props,text:'Next word',autoStart:true}));});await waitAuto();assert.equal(starts().length,beforeNext+1);
await act(async()=>{globalThis.__speechEvents.start();globalThis.__speechEvents.result({isFinal:true,results:[{transcript:'Next word'}]});globalThis.__speechEvents.end();});
assert.equal(results,1);assert.equal(globalThis.__activityWrites,1,'real heard speech still records activity');
await act(async()=>{tree.unmount();});
console.log('Release72 source parity passed (all non-skip code). Seven-language narration → automatic microphone, unchanged native options, non-blocking TTS stop, delayed permission, next-word handoff, real results and isolated styled skip passed. Physical-phone testing is still required.');
})().catch(error=>{console.error(error);process.exitCode=1;});
