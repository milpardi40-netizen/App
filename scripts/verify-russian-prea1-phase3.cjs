const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const esbuild=require('esbuild');
const React=require('react');
const {act,create}=require('react-test-renderer');
const {loadInventory}=require('./helpers/practical-inventory.cjs');
const helper=require('./helpers/approved-russian-prea1.cjs');
const before=require('./fixtures/russian-prea1-phase3-before.json');
const approved=require('./fixtures/russian-prea1-phase3-approved.json');
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const words=x=>x.toLowerCase().replace(/\u0301/g,'').match(/[а-яё]+/g)??[];
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
(async()=>{
 const inv=await loadInventory(),pre=inv.ru.filter(l=>l.levelId===0);
 helper.verifyApprovedRussianPreA1(inv.ru);
 for(const [language,lessons]of Object.entries(inv))assert.equal(digest(language==='ru'?helper.phase2Pre(lessons):lessons),before.hashes[language],`${language}: only the five reviewed context/check deltas`);
 assert.equal(pre.length,31);assert.equal(pre.flatMap(l=>l.sentences).length,252);
 const built=await esbuild.build({stdin:{contents:`
 export {default as Transfer,RussianPreA1Everyday as Everyday} from './components/RussianPreA1Transfer';
 export * from './lib/languages/russianPreA1Phase3';
 export {assessmentRevisionFor} from './lib/lessonAssessment';
 export {bridgeFor} from './lib/languages/russianPersianBridge';
 `,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,jsx:'automatic',external:['react','react/jsx-runtime'],plugins:[{name:'native-views',setup(b){
 const mocks={'react-native':`export const View='View',Pressable='Pressable';export const StyleSheet={create:x=>x};`,'@/components/LocalizedText':`export const LocalizedText='Text',LocalizedTextInput='TextInput';`,'@/lib/theme':`export const Typography={};`};
 b.onResolve({filter:/.*/},a=>mocks[a.path]?{path:a.path,namespace:'mock'}:undefined);b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:mocks[a.path],loader:'js'}));
 }}]});
 const m={exports:{}};new Function('module','exports','require',built.outputFiles[0].text)(m,m.exports,require);const api=m.exports;
 const everyday=api.RUSSIAN_PRE_A1_EVERYDAY,transfers=api.RUSSIAN_PRE_A1_TRANSFERS;
 assert.equal(Object.keys(everyday).length,6);assert.equal(Object.keys(transfers).length,6);
 assert.deepEqual(api.RUSSIAN_PRE_A1_CONTEXT_CHECK_IDS,approved.contexts.filter(d=>digest(d.before.checks)!==digest(d.after.checks)).map(d=>d.id));
 assert.equal(Object.values(everyday).flatMap(p=>p.rows).length,12);
 for(const [id,panel]of Object.entries(everyday)){
  assert.ok(pre.some(l=>l.id===id));assert.ok(panel.noteFa&&panel.titleFa);
  assert.equal(new Set(panel.rows.map(r=>r.id)).size,panel.rows.length);
  for(const row of panel.rows)for(const field of ['text','fa','pronunciationFa','noteFa','labelFa'])assert.ok(row[field],`${id}/${row.id}/${field}`);
 }
 for(const text of ['Э́то кни́га.','Э́то ру́чка.','Во́ду, пожа́луйста.','Я ра́да.','Я студе́нтка.','Я ира́нка.','Я из Ира́на.'])assert.ok(Object.values(everyday).some(p=>p.rows.some(r=>r.text===text)),`reviewed practical/identity alternative: ${text}`);
 const coreTexts=new Set(pre.flatMap(l=>l.sentences.map(s=>s.text)));
 for(const [id,practice]of Object.entries(transfers)){
  const index=pre.findIndex(l=>l.id===id);assert.ok(index>=0);assert.equal(practice.cases.length,2);
  const known=new Set(pre.slice(0,index+1).flatMap(l=>l.sentences.flatMap(s=>words(s.text))));
  for(const c of practice.cases){
   assert.ok(!coreTexts.has(c.sample),`${id}: new information, not a verbatim core target`);
   // New proper names are supplied explicitly on the information card; everything else is recycled.
   for(const word of words(c.sample))assert.ok(known.has(word)||words(c.factsFa).includes(word),`${id}: unintroduced target word ${word}`);
   assert.ok(c.factsFa&&c.taskFa&&c.sampleFa&&c.feedbackFa);
  }
 }
 const route=fs.readFileSync('components/RussianLesson.tsx','utf8');
 assert.ok(route.indexOf('<RussianPreA1Transfer key=')>route.indexOf('{stage === 4'));
 assert.ok(route.indexOf('<RussianPreA1Transfer key=')<route.indexOf('{stage === 5'));
 assert.ok(route.indexOf('<RussianPreA1Everyday key=')>route.indexOf('{stage === 5'));
 assert.ok(route.indexOf('<RussianPreA1Everyday key=')<route.indexOf('{stage === 6 &&'));
 for(const component of ['RussianPreA1Transfer','RussianPreA1Everyday'])assert.ok(route.includes(`{lesson.levelId === 0 ? <${component} key={lesson.id} lessonId={lesson.id} onSpeak={text => { cancelSpeakingAdvance(); speakForTarget(text, pace('normal'), null); }} /> : null}`),'support audio has no core recognition target and cancels scheduled advancement');
 const source=fs.readFileSync('components/RussianPreA1Transfer.tsx','utf8');assert.ok(!/AsyncStorage|localStorage|saveLesson|saveRun|setItem|SpeakCheck/.test(source),'no persistence, ASR, grade or completion dependency');
 const getText=v=>v.root.findAllByType('Text').map(n=>n.children.filter(c=>typeof c==='string').join(''));
 const button=(v,label)=>v.root.findAllByType('Pressable').find(n=>n.props.accessibilityLabel===label);
 let view;let examples=0,cases=0;
 try{
  for(const [id,panel]of Object.entries(everyday)){
   const spoken=[];await act(async()=>{view=create(React.createElement(api.Everyday,{lessonId:id,onSpeak:t=>spoken.push(t)}));});
   for(const [i,row]of panel.rows.entries()){
    if(panel.rows.length>1)await act(async()=>button(view,`عبارت کاربردی: ${row.id}`).props.onPress());
    assert.ok(getText(view).includes(row.text));assert.ok(getText(view).includes(row.pronunciationFa));
    await act(async()=>button(view,'شنیدن عبارت کاربردی').props.onPress());assert.equal(spoken.at(-1),row.text);examples++;
   }
   const next=Object.keys(everyday).find(k=>k!==id);await act(async()=>view.update(React.createElement(api.Everyday,{lessonId:next,onSpeak(){}})));
   assert.ok(getText(view).includes(everyday[next].rows[0].text),'new lesson resets selection');
   await act(async()=>view.unmount());view=null;
  }
  for(const [id,practice]of Object.entries(transfers)){
   const spoken=[];await act(async()=>{view=create(React.createElement(api.Transfer,{lessonId:id,onSpeak:t=>spoken.push(t)}));});
   assert.equal(view.root.findAllByType('TextInput').length,0,'closed initially');
   await act(async()=>button(view,'بازکردن تمرین انتقال روسی').props.onPress());
   for(const [i,c]of practice.cases.entries()){
    if(i)await act(async()=>button(view,`کارت تازه ${i+1}`).props.onPress());
    assert.ok(getText(view).includes(c.factsFa));assert.ok(!getText(view).includes(c.sample),'sample hidden before independent attempt');
    assert.equal(view.root.findByType('TextInput').props.value,'','draft resets between information cards');
    await act(async()=>view.root.findByType('TextInput').props.onChangeText('پاسخ آزمایشی'));
    assert.equal(view.root.findByType('TextInput').props.value,'پاسخ آزمایشی');assert.equal(spoken.length,i,'typing never triggers audio or a score');
    await act(async()=>button(view,'راهنمای کوتاه انتقال').props.onPress());assert.ok(getText(view).includes(practice.hintFa));
    await act(async()=>button(view,'مقایسه با یک نمونه روسی').props.onPress());assert.ok(getText(view).includes(c.sample));assert.ok(getText(view).includes(c.feedbackFa));
    assert.ok(getText(view).some(t=>t.includes('درست/غلط اعلام نمی‌کند')));
    await act(async()=>button(view,'شنیدن نمونهٔ انتقال').props.onPress());assert.equal(spoken.at(-1),c.sample);
    await act(async()=>button(view,'مقایسه با یک نمونه روسی').props.onPress());assert.ok(!getText(view).includes(c.sample));cases++;
   }
   await act(async()=>button(view,'بازکردن تمرین انتقال روسی').props.onPress());
   await act(async()=>button(view,'بازکردن تمرین انتقال روسی').props.onPress());assert.equal(view.root.findByType('TextInput').props.value,'','closing clears ephemeral draft');
   const next=Object.keys(transfers).find(k=>k!==id);await act(async()=>view.update(React.createElement(api.Transfer,{lessonId:next,onSpeak(){}})));
   assert.equal(view.root.findAllByType('TextInput').length,0,'new lesson starts closed');
   await act(async()=>view.unmount());view=null;
  }
  for(const Component of [api.Transfer,api.Everyday])for(const lessonId of [pre[0].id,inv.ru.find(l=>l.levelId===1).id,'en-pre-test','missing']){
   await act(async()=>{view=create(React.createElement(Component,{lessonId,onSpeak(){throw Error('unexpected audio');}}));});assert.equal(view.toJSON(),null);await act(async()=>view.unmount());view=null;
  }
 }finally{if(view)await act(async()=>view.unmount());}
 const app=await require('./helpers/practical-storage.cjs').modules();
 globalThis.__practicalMemory=new Map();globalThis.window={localStorage:{getItem:k=>globalThis.__practicalMemory.get(k)??null,setItem:(k,v)=>globalThis.__practicalMemory.set(k,v)}};
 const changed=new Set(api.RUSSIAN_PRE_A1_CONTEXT_CHECK_IDS);
 const base={stage:4,stageVersion:2,sentenceIndex:3,revealed:true,answers:{0:1,4:2},showCheckAnswers:true,updatedAt:'2026-11-25T12:00:00Z'};
 let restores=0,archives=0;
 for(const os of ['web','android']){
  globalThis.__practicalOS=os;
  for(const revision of [undefined,'ru-pre-a1-practical-v6',app.assessment.LESSON_ASSESSMENT_REVISION]){
   const sessions=Object.fromEntries(pre.map(l=>[l.id,{...base,checksRevision:changed.has(l.id)?revision:api.assessmentRevisionFor('ru',l.id)}]));
   const raw=JSON.stringify({schema:1,sessions});globalThis.__practicalMemory.set(app.ru.RUSSIAN_STUDY_STORAGE_KEY,raw);
   for(const l of pre){const saved=await app.ru.loadRussianLessonSession(l.id);for(const field of ['stage','stageVersion','sentenceIndex','revealed','updatedAt'])assert.equal(saved[field],base[field]);assert.deepEqual(saved.answers,changed.has(l.id)?{}:base.answers);assert.equal(saved.showCheckAnswers,!changed.has(l.id));restores++;}
   assert.equal(globalThis.__practicalMemory.get(app.ru.RUSSIAN_STUDY_STORAGE_KEY),raw,'read does not mutate history');
   for(const id of changed){await app.ru.saveRussianLessonSession(id,base);const saved=await app.ru.loadRussianLessonSession(id);assert.deepEqual(saved.answers,base.answers);assert.equal(saved.checksRevision,api.RUSSIAN_PRE_A1_CONTEXT_CHECKS_REVISION);}
   const saved=JSON.parse(globalThis.__practicalMemory.get(app.ru.RUSSIAN_STUDY_STORAGE_KEY));for(const l of pre.filter(l=>!changed.has(l.id)))assert.deepEqual(saved.sessions[l.id],sessions[l.id]);
  }
  for(const id of changed){
   const speaking={average:93,scores:{[`${id}-01`]:93},at:'2026-11-25T12:00:00Z'};
   const old={speaking,assessment:{correct:5,total:5,at:speaking.at,contentRevision:app.assessment.LESSON_ASSESSMENT_REVISION}};
   const key=`ru:${id}`,other='ru:ru-pre-05-pronouns-family',raw=JSON.stringify({[key]:old,[other]:old});globalThis.__practicalMemory.set('milo_lesson_outcomes_v1',raw);
   const filtered=await app.outcomes.getLessonOutcome('ru',id);assert.deepEqual(filtered.speaking,speaking,'same utterances retain speaking scores');assert.equal(filtered.assessment,undefined);
   assert.equal(globalThis.__practicalMemory.get('milo_lesson_outcomes_v1'),raw);
   await app.outcomes.saveLessonOutcome('ru',id,{assessment:{correct:4,total:5,at:'2026-11-26T12:00:00Z'}});
   const saved=JSON.parse(globalThis.__practicalMemory.get('milo_lesson_outcomes_v1'));assert.deepEqual(saved[`${key}:previous:${app.assessment.LESSON_ASSESSMENT_REVISION}`],old);assert.deepEqual(saved[other],old);assert.deepEqual(saved[key].speaking,speaking);assert.equal((await app.outcomes.getLessonOutcome('ru',id)).assessment.correct,4);archives++;
  }
 }
 for(const delta of approved.contexts){const l=pre.find(l=>l.id===delta.id);assert.ok(!/عکس|نقشه|تصویر|می‌بینی/.test(l.situation));assert.ok(!/عکس|می‌بینی|اشاره می‌کنند/.test(l.checks.map(c=>c.promptFa).join(' ')));assert.deepEqual(l.checks.map(c=>[c.choices,c.correctIndex,c.explanationFa]),delta.before.checks.map(c=>[c.choices,c.correctIndex,c.explanationFa]),'only context prompts changed, no answer substitutions');}
 assert.ok(!api.bridgeFor({text:'Я рад.',fa:'خوشحالم'},true).rule.note.includes('فقط صورت مذکر'));
 const summary={date:'2026-11-26',scope:'Russian Pre-A1 only',lessons:31,coreRows:252,rewrittenCoreTargets:0,explicitContexts:5,revisedCheckPrompts:4,everydayPanels:6,everydayExamplesRendered:examples,transferPanels:6,transferCasesRendered:cases,webNativeSessionRestores:restores,historicalOutcomeArchives:archives,completionGatesAdded:0,limitations:'React rendering with native views/storage/audio boundaries mocked; no real-device audio/ASR or learner trial. Optional examples are not mastery evidence.'};
 fs.writeFileSync('reports/russian-prea1-phase3-validation.json',JSON.stringify(summary,null,2)+'\n');console.log('Russian Pre-A1 phase 3 PASS',JSON.stringify(summary));
})().catch(e=>{console.error(e);process.exitCode=1;});
