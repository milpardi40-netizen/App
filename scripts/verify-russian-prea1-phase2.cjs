const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const esbuild=require('esbuild');
const React=require('react');
const {act,create}=require('react-test-renderer');
const {loadInventory}=require('./helpers/practical-inventory.cjs');
const before=require('./fixtures/russian-prea1-phase2-before.json');
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const fold=x=>x.toLowerCase().replace(/\u0301/g,'');
const words=x=>fold(x).match(/[а-яё]+/g)??[];
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
async function main(){
 const inv=await loadInventory(),id=before.lesson.id,lesson=inv.ru.find(l=>l.id===id);
 for(const [lang,lessons]of Object.entries(inv))assert.equal(digest(lang==='ru'?require('./helpers/approved-russian-prea1.cjs').phase2Pre(lessons).filter(l=>l.id!==id):lessons),before.protected[lang],`${lang}: no other phase-2 curriculum bytes change after restoring approved phase-3 contexts`);
 const built=await esbuild.build({stdin:{contents:`
 export {default as Scaffold,RussianPreA1VerbPacing as Pacing} from './components/RussianPreA1Scaffold';
 export * from './lib/languages/russianPreA1Reading';
 export * from './lib/languages/russianPreA1Phase2';
 export {assessmentRevisionFor,expandedChoiceChecks} from './lib/lessonAssessment';
 `,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,jsx:'automatic',external:['react','react/jsx-runtime'],plugins:[{name:'native-view-only',setup(b){
 const mocks={'react-native':`export const View='View',Pressable='Pressable';export const StyleSheet={create:x=>x};`,'@/components/LocalizedText':`export const LocalizedText='Text';`,'@/lib/theme':`export const Typography={};`};
 b.onResolve({filter:/.*/},a=>mocks[a.path]?{path:a.path,namespace:'mock'}:undefined);
 b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:mocks[a.path],loader:'js'}));
 }}]});
 const m={exports:{}};new Function('module','exports','require',built.outputFiles[0].text)(m,m.exports,require);const api=m.exports;
 const pre=inv.ru.filter(l=>l.levelId===0);
 assert.equal(Object.keys(api.RUSSIAN_PRE_A1_READING).length,31);
 assert.deepEqual(Object.keys(api.RUSSIAN_PRE_A1_READING),pre.map(l=>l.id),'reading sequence follows display order, including stable nonsequential IDs');
 const known=new Set(),introduced=new Set();let renders=0;
 const textNodes=v=>v.root.findAllByType('Text').map(n=>n.children.filter(c=>typeof c==='string').join(''));
 const button=(view,label)=>view.root.findAllByType('Pressable').find(n=>n.props.accessibilityLabel===label);
 let view;
 try{
  for(const [i,l]of pre.entries()){
   const card=api.russianPreA1Reading(l.id);
   const taught=new Set(l.sentences.flatMap(s=>words(s.text)));
   assert.equal(card.chunks.join(''),card.word,'no unspoken spaces/letters invented by segmentation');
   assert.ok(taught.has(fold(card.word)),`${l.id}: decoding word already appears in this lesson`);
   assert.ok(taught.has(fold(card.distractor)),`${l.id}: distractor is also a real taught word`);
   assert.notEqual(fold(card.word),fold(card.distractor));
   for(const c of words(card.letters).join('')){known.add(c);introduced.add(c);}
   for(const c of words(card.word).join(''))assert.ok(known.has(c),`${l.id}: ${c} in target word has a just-in-time introduction`);
   assert.equal(card.showAidInitially,i<6,'assistance fades, but remains accessible');
   const spoken=[];
   await act(async()=>{view=create(React.createElement(api.Scaffold,{lessonId:l.id,onSpeak:t=>spoken.push(t)}));});
   assert.ok(textNodes(view).includes('خواندن سیریلیک · یک گام کوتاه'));
   assert.equal(button(view,'راهنمای خواندن سیریلیک').props.accessibilityState.expanded,card.showAidInitially);
   await act(async()=>button(view,`واژهٔ خواندن: ${card.distractor}`).props.onPress());
   assert.ok(textNodes(view).some(t=>t.startsWith('این انتخاب با معنی')));
   assert.equal(spoken.length,0,'practice selection is NOT falsely treated as completed listening');
   await act(async()=>button(view,`واژهٔ خواندن: ${card.word}`).props.onPress());
   assert.ok(textNodes(view).some(t=>t.startsWith('این انتخاب درست است')));
   await act(async()=>button(view,'شنیدن واژهٔ خواندن').props.onPress());
   assert.deepEqual(spoken,[card.word]);
   await act(async()=>button(view,'راهنمای خواندن سیریلیک').props.onPress());
   assert.equal(button(view,'راهنمای خواندن سیریلیک').props.accessibilityState.expanded,!card.showAidInitially);
   if(l.id===id){
    for(let step=0;step<3;step++){
     await act(async()=>button(view,`گام کوتاه افعال ${step+1}`).props.onPress());
     const s=api.RUSSIAN_PRE_A1_VERB_STEPS[step];
     const targets=api.RUSSIAN_PRE_A1_LIGHT_VERBS.slice(s.start,s.end);
     for(const target of targets)assert.ok(textNodes(view).includes(target.text));
     await act(async()=>button(view,'نمایش نمونه‌های گام افعال').props.onPress());
     for(const target of targets)assert.ok(!textNodes(view).includes(target.text),'full examples can be hidden for recall');
    }
   }
   await act(async()=>view.update(React.createElement(api.Scaffold,{lessonId:pre[(i+1)%pre.length].id,onSpeak(){}})));
   assert.ok(!textNodes(view).some(t=>t.startsWith('این انتخاب درست است')),'changing lessons resets ephemeral answers');
   await act(async()=>view.unmount());view=null;renders++;
  }
  assert.equal(introduced.size,32,'32 letters/signs introduced; ъ explicitly deferred, not fabricated into a word');
  for(const lessonId of [inv.ru.find(l=>l.levelId===1).id,'en-prea1-test','missing']){
   await act(async()=>{view=create(React.createElement(api.Scaffold,{lessonId,onSpeak(){throw Error('unexpected audio');}}));});
   assert.equal(view.toJSON(),null);await act(async()=>view.unmount());view=null;
  }
  const tokens=lesson.sentences.flatMap(s=>words(s.text));
  assert.equal(tokens.length,23);assert.equal(before.lesson.sentences.flatMap(s=>words(s.text)).length,55);
  assert.equal(lesson.sentences.length,8);assert.ok(lesson.sentences.every(s=>words(s.text).length<=3));
  assert.ok(lesson.sentences.every(s=>(s.text.match(/[.!?]/g)??[]).length===1),'every row is now one short sentence');
  assert.deepEqual(lesson.sentences.map(s=>s.id),before.lesson.sentences.map(s=>s.id));
  assert.deepEqual(lesson.dialogue,before.lesson.dialogue,'phase-1 scene preserved');
  assert.equal(lesson.checks.length,3);assert.equal(api.expandedChoiceChecks(lesson).length,5);
  for(const [index,s]of lesson.sentences.entries()){
   for(const entry of s.vocabulary)assert.ok(fold(s.text).includes(fold(entry.word)),'no old multi-clause vocabulary left in a shortened target');
   await act(async()=>{view=create(React.createElement(api.Pacing,{lessonId:id,sentenceIndex:index}));});
   assert.ok(textNodes(view).includes(api.russianPreA1VerbStep(id,index).title));
   await act(async()=>view.unmount());view=null;
  }
  assert.equal(api.russianPreA1VerbStep(pre[0].id,0),undefined);
  assert.equal(api.russianPreA1VerbStep(id,8),undefined);
 }finally{if(view)await act(async()=>view.unmount());}
 const route=fs.readFileSync('components/RussianLesson.tsx','utf8');
 assert.ok(route.includes("{lesson.levelId === 0 ? <RussianPreA1Scaffold key={lesson.id} lessonId={lesson.id} onSpeak={text => speak(text)} /> : null}"),'actual introduction wires the optional reading card with lesson identity and audio');
 assert.ok(route.includes("{lesson.levelId === 0 ? <RussianPreA1VerbPacing lessonId={lesson.id} sentenceIndex={sentenceIndex} /> : null}"),'actual sentence page carries the microstep labels');
 // No extra completion condition, no persistence in the optional component.
 const component=fs.readFileSync('components/RussianPreA1Scaffold.tsx','utf8');
 assert.ok(!/AsyncStorage|localStorage|saveLesson|saveRun|setItem/.test(component));

 const app=await require('./helpers/practical-storage.cjs').modules();
 globalThis.__practicalMemory=new Map();globalThis.window={localStorage:{getItem:k=>globalThis.__practicalMemory.get(k)??null,setItem:(k,v)=>globalThis.__practicalMemory.set(k,v)}};
 const base={stage:4,stageVersion:2,sentenceIndex:7,revealed:true,answers:{0:1,4:2},showCheckAnswers:true};
 let restores=0;
 for(const os of ['web','android']){
  globalThis.__practicalOS=os;
  for(const revision of [undefined,'ru-pre-a1-practical-v6',app.assessment.LESSON_ASSESSMENT_REVISION]){
   const sessions=Object.fromEntries(pre.map(l=>[l.id,{...base,checksRevision:l.id===id?revision:api.assessmentRevisionFor('ru',l.id)}]));
   const raw=JSON.stringify({schema:1,sessions});globalThis.__practicalMemory.set(app.ru.RUSSIAN_STUDY_STORAGE_KEY,raw);
   for(const l of pre){
    const saved=await app.ru.loadRussianLessonSession(l.id);
    assert.equal(saved.stage,4);assert.equal(saved.sentenceIndex,7);assert.equal(saved.revealed,true);
    assert.deepEqual(saved.answers,l.id===id?{}:base.answers);assert.equal(saved.showCheckAnswers,l.id!==id);restores++;
   }
   assert.equal(globalThis.__practicalMemory.get(app.ru.RUSSIAN_STUDY_STORAGE_KEY),raw);
   await app.ru.saveRussianLessonSession(id,base);
   assert.deepEqual((await app.ru.loadRussianLessonSession(id)).answers,base.answers,'fresh light-lesson answers round-trip');
   const updated=JSON.parse(globalThis.__practicalMemory.get(app.ru.RUSSIAN_STUDY_STORAGE_KEY));
   for(const l of pre.filter(l=>l.id!==id))assert.deepEqual(updated.sessions[l.id],sessions[l.id]);
  }
  const history={speaking:{average:96,scores:{[lesson.sentences[0].id]:96},at:'2026-11-25T12:00:00Z'},assessment:{correct:5,total:5,at:'2026-11-25T12:00:00Z',contentRevision:app.assessment.LESSON_ASSESSMENT_REVISION}};
  const key=`ru:${id}`,other=`ru:${pre[0].id}`,raw=JSON.stringify({[key]:history,[other]:history});
  globalThis.__practicalMemory.set('milo_lesson_outcomes_v1',raw);
  const hidden=await app.outcomes.getLessonOutcome('ru',id);assert.equal(hidden.speaking,undefined);assert.equal(hidden.assessment,undefined);
  assert.equal(globalThis.__practicalMemory.get('milo_lesson_outcomes_v1'),raw);
  await app.outcomes.saveLessonOutcome('ru',id,{assessment:{correct:4,total:5,at:'2026-11-26T12:00:00Z'},speaking:{average:82,scores:{},at:'2026-11-26T12:00:00Z'}});
  const saved=JSON.parse(globalThis.__practicalMemory.get('milo_lesson_outcomes_v1'));
  assert.deepEqual(saved[`${key}:previous:${app.assessment.LESSON_ASSESSMENT_REVISION}`],history,'old sentence and assessment scores archived, never attached to new targets');
  assert.deepEqual(saved[other],history);assert.equal((await app.outcomes.getLessonOutcome('ru',id)).speaking.average,82);
 }
 const {spawnSync}=require('node:child_process');
 const wl=spawnSync(process.execPath,['scripts/verify-word-lab-core.mjs'],{encoding:'utf8'});assert.equal(wl.status,0,wl.stdout+wl.stderr);
 const lab=require('../node_modules/.cache/word-lab-core-test.cjs');
 const helper=require('./helpers/approved-russian-prea1.cjs');
 for(const [lang,v]of Object.entries(before.wordLab)){
  for(const [kind,data]of [['core',lab.CORE_WORDS[lang]],['cards',lab.WORD_LAB_WORDS[lang]]]){
   assert.equal(digest(data.map(c=>c.id)),v[kind==='core'?'coreIds':'cardIds'],`${lang}/${kind}: every ID and its order survive`);
   if(lang==='ru')helper.phase1WordLab(kind,data);else assert.equal(digest(data),v[kind]);
  }
  assert.equal(digest(lab.UNRESOLVED_CORE_TARGETS[lang]),v.unresolved);
 }
 const prefix=new Set(pre.slice(0,11).flatMap(l=>l.sentences.flatMap(s=>words(s.text))));
 const novel=rows=>[...new Set(rows.flatMap(s=>words(s.text)))].filter(w=>!prefix.has(w));
 const summary={scope:'Russian Pre-A1 phase 2 only',date:'2026-11-26',lesson12:{beforeTokens:55,afterTokens:23,beforeNewSurfaceForms:novel(before.lesson.sentences),afterNewSurfaceForms:novel(lesson.sentences),targets:8,microsteps:3},reading:{cards:renders,introducedLettersAndSigns:introduced.size,persianAidInitiallyShown:6,persianAidInitiallyHidden:25,deferred:'ъ'},webNativeSessionRestores:restores,wordLab:{ruCore:lab.CORE_WORDS.ru.length,ruCards:lab.WORD_LAB_WORDS.ru.length,idsAndOrderPreserved:true},otherLessonsUnchanged:true,limitations:'Native views, speech and storage boundaries are simulated. No real device audio, learner trial or CEFR certification.'};
 fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/russian-prea1-phase2-validation.json',JSON.stringify(summary,null,2)+'\n');
 console.log(`Russian Pre-A1 phase 2 PASS: ${renders} real decoding cards, 32 contextual letters/signs, 8 short verb targets / 3 microsteps, 55→23 tokens, ${restores} web/native session restores, old outcomes archived; all other phase-2 lesson bytes protected through the explicit phase-3 context adapter; every word-lab ID/order preserved. Run phase-1 verification for the 62 complete room executions.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
