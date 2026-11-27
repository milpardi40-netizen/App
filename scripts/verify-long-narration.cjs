// No real microphone/audio: exercise actual screen callbacks and native TTS with a virtual clock.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),esbuild=require('esbuild');
function clock(){let now=0,id=0;const timers=new Map();return {setTimeout(fn,ms){const key=++id;timers.set(key,{fn,at:now+ms});return key},clearTimeout(id){timers.delete(id)},advance(ms){now+=ms;for(const [key,t]of [...timers])if(t.at<=now){timers.delete(key);t.fn()}},timers};}
(async()=>{
 const c=clock(),spoken=[];globalThis.__longSpeech={spoken,speaking:false};
 const build=await esbuild.build({stdin:{contents:`export * from './lib/courseSpeech';export * from './lib/speechChunks';`,resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'cjs',plugins:[{name:'native',setup(b){b.onResolve({filter:/^react-native$|^expo-speech$/},a=>({path:a.path,namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:a.path==='react-native'?`export const Platform={OS:'android'};`:`export const maxSpeechInputLength=80;export const speak=(text,options)=>globalThis.__longSpeech.spoken.push({text,options});export const stop=async()=>{};export const isSpeakingAsync=async()=>globalThis.__longSpeech.speaking;`}));}}]});
 const m={exports:{}};new Function('module','exports','setTimeout','clearTimeout',build.outputFiles[0].text)(m,m.exports,c.setTimeout,c.clearTimeout);const api=m.exports;
 let cases=0;
 for(const [locale,word]of [['en-US','example'],['ru-RU','пример'],['tr-TR','örnek'],['de-DE','Beispiel'],['fr-FR','exemple'],['es-ES','ejemplo'],['ar-SA','مِثَالٌ']])for(const n of [1,10,20,40,100,1000]){
   await api.stop();spoken.length=0;let done=0,started=0;
   const text=Array(n).fill(word).join(' ')+'.';api.speak(text,{language:locale,onStart:()=>started++,onDone:()=>done++});
   let index=0;
   while(index<spoken.length){const event=spoken[index];assert.ok(event.text.length<=80);assert.equal(event.options.language,locale);event.options.onStart();c.advance(120000);assert.equal(done,0,'no elapsed-time completion while still speaking');if(event.options.onBoundary)event.options.onBoundary({charIndex:0,charLength:1});event.options.onDone();event.options.onDone();index++;assert.ok(index<2000);}
   assert.equal(spoken.map(e=>e.text).join(''),text,'every requested character reaches the engine, in order');assert.equal(done,1);assert.equal(started,1);cases++;
 }
 // Cancellation cannot enqueue a remaining chunk or notify completion of a retired request.
 await api.stop();spoken.length=0;let cancelledDone=0;api.speak('long text '.repeat(100),{onDone:()=>cancelledDone++});const retired=spoken[0];await api.stop();retired.options.onDone();c.advance(120000);assert.equal(spoken.length,1);assert.equal(cancelledDone,0);
 // A genuinely silent engine still reports failure; this watchdog is ONLY for startup.
 let failures=0;api.speak('silent',{onError:()=>failures++});c.advance(3000);await Promise.resolve();await Promise.resolve();assert.equal(failures,1);
 for(const limit of [2,3,7,80,4000])for(const text of ['😀'.repeat(100),'word '.repeat(2000),'مَرْحَبًا، بِكُمْ. '.repeat(100),'a'.repeat(500)]){
  const parts=api.splitSpeechText(text,limit);assert.equal(parts.join(''),text);assert.ok(parts.every(p=>p.length<=limit));assert.ok(parts.every(p=>!/[\uD800-\uDBFF]$/.test(p)&&! /^[\uDC00-\uDFFF]/.test(p)));
 }
 // Execute the exact automatic narration callback from all five screen implementations (seven languages).
 const files=['EnglishLessonRoute','RussianLesson','TurkishLesson','StarterLesson','arabic/ArabicLessonScreen'];
 let handoffs=0;
 for(const file of files){
   const source=fs.readFileSync(`components/${file}.tsx`,'utf8'),ast=ts.createSourceFile('screen.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let expression;
   const visit=n=>{if(ts.isVariableDeclaration(n)&&n.name.getText(ast)==='speakForTarget')expression=n.initializer.getText(ast);ts.forEachChild(n,visit)};visit(ast);assert.ok(expression);
   const js=ts.transpileModule(`const callback=${expression};`,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
   const locales=file==='StarterLesson'?['de-DE','fr-FR','es-ES']:['default'];
   for(const locale of locales){
    let mic=null,callbacks;const token={current:0},timer={current:null},clock2=clock();
    const positional=(text,rate,error,done)=>{callbacks={onError:error,onDone:done}};
    const bindings={useCallback:fn=>fn,setAudioNotice:()=>{},setSpeechError:()=>{},setMicReadyKey:v=>{mic=v},clearNarratorFallback:()=>{},narratorTokenRef:token,narratorFallbackRef:timer,playResponsiveSpeech:opts=>{callbacks=opts},playArabicSpeech:(text,opts)=>{callbacks=opts},playRussianSpeech:positional,playTurkishSpeech:positional,playStarterSpeech:(locale,text,rate,error,region,done)=>{callbacks={onError:error,onDone:done}},course:{locale},setTimeout:clock2.setTimeout,clearTimeout:clock2.clearTimeout};
    const speak=new Function(...Object.keys(bindings),js+'return callback;')(...Object.values(bindings));
    const text=Array(100).fill('example').join(' ');speak(text,1,'target');clock2.advance(120000);assert.equal(mic,null,file+': no premature microphone/TTS stop');callbacks.onDone();assert.equal(mic,'target');
    speak(text,1,'old');const old=callbacks;speak(text,1,'new');old.onDone();assert.equal(mic,null,'stale completion must not arm a different sentence');callbacks.onDone();assert.equal(mic,'new');
    speak(text,1,'error');callbacks.onError();assert.equal(mic,'error','actual failure retains recovery path');handoffs++;
   }
 }
 const room=fs.readFileSync('components/LessonDialogueRoom.tsx','utf8');assert.ok(!room.includes('Math.min(30000, Math.max(15000'),'room has no operator duration cap');assert.ok(room.includes('onSpeakOperatorRef.current(line.text, () => advanceFor(turn))'));
 // Run the real room turn and sample effects with the same virtual two-minute playback.
 const roomAst=ts.createSourceFile('room.tsx',room,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const effects=[];
 const findEffects=n=>{if(ts.isCallExpression(n)&&n.expression.getText(roomAst)==='useEffect')effects.push(n.getText(roomAst));ts.forEachChild(n,findEffects)};findEffects(roomAst);
 for(const sample of [false,true]){
   const effect=effects.find(e=>sample?e.includes('if (!samplePlaying'):e.includes('let watchdog:'));assert.ok(effect);
   const clock3=clock();let callback,advances=0,stops=0,playing=true,cleanup;
   const speak=(text,done)=>{assert.equal(text,'long room text');callback=done};
   const bindings={useEffect:fn=>{cleanup=fn()},phase:'run',turn:0,starter:'operator',samplePlaying:sample,linesRef:{current:[{text:'long room text'}]},spokenRef:{current:new Set()},onSpeakOperatorRef:{current:speak},speakerOf:()=> 'operator',advanceFor:()=>advances++,stopCourseSpeech:async()=>{stops++},setSamplePlaying:v=>{playing=v},slowSpeakRef:{current:speak},onSpeakRef:{current:speak},setTimeout:clock3.setTimeout,clearTimeout:clock3.clearTimeout};
   const js=ts.transpileModule(effect,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
   new Function(...Object.keys(bindings),js)(...Object.values(bindings));await Promise.resolve();assert.equal(typeof callback,'function');const initialStops=stops;clock3.advance(120000);assert.equal(stops,initialStops);assert.equal(advances,0);if(sample)assert.equal(playing,true);callback();if(sample)assert.equal(playing,false);else assert.equal(advances,1);cleanup();
 }
 console.log(`Long narration passed: ${cases} seven-locale/length runs (1–1000 words), exact unlimited-text chunk coverage, cancellation, silent-engine recovery and ${handoffs} REAL screen completion-only microphone handoffs. No changes to recognition timing or lesson content.`);
})().catch(e=>{console.error(e);process.exitCode=1});
