const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const esbuild=require('esbuild');
const ts=require('typescript');
const {loadInventory}=require('./helpers/practical-inventory.cjs');
const before=require('./fixtures/turkish-a1-before.json');
const design=require('../docs/turkish-a1-design/design.json');
const changed=require('../lib/languages/turkishA1ChangedSlots.generated.json');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
async function main(){
 const inventory=await loadInventory();
 for(const [lang,bank]of Object.entries(inventory)){if(lang==='ar'){require('./helpers/approved-arabic-a1.cjs').verifyApprovedArabicA1(bank);continue;}assert.equal(hash(lang==='tr'?bank.filter(l=>l.levelId!==1):bank),before.protected[lang],lang+': non-target inventory');}
 require('./helpers/approved-turkish-a1.cjs').verifyApprovedTurkishA1(inventory.tr);
 const memory=new Map();globalThis.__trMemory=memory;globalThis.__trOS='web';
 globalThis.window={localStorage:{getItem:k=>memory.get(k)??null,setItem:(k,v)=>{if(globalThis.__trFail===k)throw Error('Injected storage failure');memory.set(k,v)},removeItem:k=>memory.delete(k)}};
 const b=await esbuild.build({stdin:{contents:`
 export * from './lib/languages/turkish'; export * from './lib/languages/turkishStudyState';
 export * from './lib/languages/turkishA1Scope'; export * from './lib/languages/turkishA1Practice';
 export * from './lib/lessonAssessment'; export * from './lib/createCourseProgressStore';
 export * as outcomes from './lib/lessonOutcomes'; export * from './lib/reviewHistory';
 export * from './lib/lessonDialoguePairs';
 `,resolveDir:process.cwd()},bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'device-boundaries',setup(build){
 build.onResolve({filter:/^(react-native|@react-native-async-storage\/async-storage)$|learningChanges$|personalLearningSync$|supabase$/},a=>({path:a.path.split('/').at(-1),namespace:'stub'}));
 build.onLoad({filter:/.*/,namespace:'stub'},a=>({contents:{
 'react-native':`export const Platform={get OS(){return globalThis.__trOS;}};`,
 'async-storage':`export default {async getItem(k){return globalThis.__trMemory.get(k)??null},async setItem(k,v){if(globalThis.__trFail===k)throw Error('Injected storage failure');globalThis.__trMemory.set(k,v)},async removeItem(k){globalThis.__trMemory.delete(k)}};`,
 'learningChanges':`export const notifyLearningChange=()=>{};export const positionTimestamp=()=>new Date().toISOString();`,
 'personalLearningSync':`export const schedulePersonalLearningSync=()=>{};`,
 'supabase':`export const supabase={auth:{async getSession(){return {data:{session:null}}}}};`,
 }[a.path]}));}}]});
 const m={exports:{}};new Function('module','exports',b.outputFiles[0].text)(m,m.exports);const api=m.exports;
 const core=api.TURKISH_LESSONS.filter(l=>api.isTurkishA1Core(l.id));
 assert.deepEqual(core.map(l=>l.id),design.lessons.map(l=>l.id));assert.equal(core.length,64);
 assert.deepEqual(api.TURKISH_LEVELS.find(l=>l.id===1).modules,core.map(l=>l.title));
 assert.equal(api.TURKISH_LESSON_STAGES.length,10);
 const screen=fs.readFileSync('components/TurkishLesson.tsx','utf8'),ast=ts.createSourceFile('screen.tsx',screen,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let nextExpression,skillsExpression;
 const tasks=[];
 function visit(n){
  if(ts.isVariableDeclaration(n)&&n.name.getText(ast)==='nextSession')nextExpression=n.initializer.getText(ast);
  if(ts.isVariableDeclaration(n)&&n.name.getText(ast)==='skills')skillsExpression=n.initializer.getText(ast);
  if(ts.isJsxSelfClosingElement(n)&&n.tagName.getText(ast)==='StarterA1Skill')for(const p of n.attributes.properties)if(ts.isJsxAttribute(p)&&p.name.getText(ast)==='task')tasks.push(p.initializer.expression.getText(ast));
  ts.forEachChild(n,visit);
 }visit(ast);assert.deepEqual(tasks.sort(),['listeningTask','readingTask']);assert.ok(nextExpression&&skillsExpression);
 const nextFromScreen=new Function('lesson','LESSON_STAGE_VERSION','stage','sentenceIndex','revealed','answers','showCheckAnswers',...Object.keys(api),`return (${nextExpression});`);
 const skillsFromScreen=new Function('lesson',...Object.keys(api),`return (${skillsExpression});`);
 const words=s=>s.toLocaleLowerCase('tr').match(/[a-zçğıöşüâîû]+/gu)??[];
 const taught=new Set(api.TURKISH_LESSONS.filter(l=>l.levelId===0).flatMap(l=>l.sentences.flatMap(s=>words(s.text))));
 let rewrites=0,expanded=0;const done=new Set();
 for(const [i,l]of core.entries()){
  const old=before.core.find(t=>t.id===l.id),plan=design.lessons[i];
  for(const id of plan.prerequisiteIds)assert.ok(done.has(id),'forward prerequisite '+id);done.add(l.id);
  for(const id of plan.preA1Ids)assert.ok(api.TURKISH_LESSONS.some(t=>t.id===id&&t.levelId===0));
  assert.equal(l.order,i+26);assert.equal(l.sentences.length,8);assert.equal(l.levelId,1);
  assert.deepEqual(l.sentences.map(s=>s.id),old.sentences.map(s=>s.id));
  assert.equal(new Set(l.sentences.map(s=>s.text.toLocaleLowerCase('tr'))).size,8);
  assert.deepEqual(l.dialogue.map(t=>({tr:t.text,fa:t.fa})),plan.scene.map(t=>({tr:t.tr,fa:t.fa})));
  assert.equal(l.dialogue.length,old.dialogue.length);assert.equal(l.checks.length,2);
  assert.ok(l.teachingFa.includes(plan.grammarFa)&&l.teachingFa.includes(plan.productionFa));
  for(const s of l.sentences){assert.ok(s.text&&s.fa&&s.pattern&&s.pronunciation);assert.ok(!/[a-zçğıöşü]/i.test(s.pronunciation));assert.ok(s.vocabulary.length);for(const v of s.vocabulary){assert.ok(s.text.toLocaleLowerCase('tr').includes(v.word.toLocaleLowerCase('tr')));assert.ok(v.meaning&&!v.meaning.includes('واژهٔ پرتکرار'));}}
  const actual=l.sentences.filter((s,i)=>s.text!==old.sentences[i].text||s.fa!==old.sentences[i].fa).map(s=>s.id);assert.deepEqual(actual,changed[l.id]);rewrites+=actual.length;
  for(const s of l.sentences.filter(s=>!actual.includes(s.id))){const card={lessonId:l.id,sentenceId:s.id,dueAt:'2030-01-01T00:00:00Z',intervalDays:40,ease:2.5,repetitions:10,lapses:2};assert.strictEqual(api.reviseTurkishA1ReviewCard(card),card);}
  const checks=api.expandedChoiceChecks(l);assert.equal(checks.length,5);expanded+=checks.length;
  for(const q of checks){assert.equal(new Set(q.choices).size,q.choices.length);assert.ok(q.choices[q.correctIndex]);assert.ok(q.promptFa&&q.explanationFa);}
  for(const text of [...l.sentences.map(s=>s.text),l.teachingFa])for(const w of words(text))taught.add(w);
  const skills=skillsFromScreen(l,...Object.values(api));assert.deepEqual(skills,api.turkishA1Skills(l.id));assert.deepEqual(skills.map(t=>t.kind),['listening','reading']);
  for(const t of [...skills,...l.dialogue.map(d=>({passage:d.text}))])for(const w of words(t.passage))assert.ok(taught.has(w),l.id+': untaught task/scene form '+w);
  for(const [j,t]of skills.entries()){const p=plan[j===0?'listening':'reading'];assert.equal(t.passage,p.passage);assert.equal(t.choices[t.correctIndex],p.answer);assert.equal(t.promptFa,p.questionFa);assert.equal(new Set(t.choices).size,3);}
  assert.notEqual(skills[0].passage,skills[1].passage);
  assert.equal(api.turkishA1Production(l.id).writing,plan.productionFa);
  assert.deepEqual(api.turkishLessonRoomPairs(l).map(p=>p.sentenceId),l.sentences.map(s=>s.id));
 }
 assert.equal(rewrites,511);assert.equal(expanded,320);
 let cases=0;
 for(const os of ['web','ios']){
  globalThis.__trOS=os;memory.clear();
  for(const l of core){
   const sessionKey=api.TURKISH_STUDY_STORAGE_KEY;
   const old={stage:7,stageVersion:2,sentenceIndex:7,revealed:true,answers:{0:0,1:1,2:7},showCheckAnswers:true,updatedAt:'2026-10-01T00:00:00Z'};
   const raw=JSON.stringify({schema:1,sessions:{[l.id]:old,unrelated:old}});memory.set(sessionKey,raw);
   const current=await api.loadTurkishLessonSession(l.id);
   assert.equal(current.stage,0);assert.equal(current.sentenceIndex,0);assert.equal(current.revealed,false);assert.deepEqual(current.answers,{});assert.equal(current.showCheckAnswers,false);
   assert.equal(current.sampleRevision,api.TURKISH_A1_CONTENT_REVISION);assert.equal(current.checksRevision,api.TURKISH_A1_ASSESSMENT_REVISION);assert.equal(memory.get(sessionKey),raw);
   await assert.rejects(api.saveTurkishLessonSession(l.id,old),/محتوای درس/);
   const ui=nextFromScreen(l,2,7,7,true,{0:1},true,...Object.values(api));
   const archiveKey=sessionKey+':history:'+l.id+':legacy:legacy';
   globalThis.__trFail=archiveKey;await assert.rejects(api.saveTurkishLessonSession(l.id,ui),/Injected/);assert.equal(memory.get(sessionKey),raw);
   globalThis.__trFail=sessionKey;await assert.rejects(api.saveTurkishLessonSession(l.id,ui),/Injected/);assert.equal(memory.get(sessionKey),raw);assert.deepEqual(JSON.parse(memory.get(archiveKey)),old);
   globalThis.__trFail=undefined;await api.saveTurkishLessonSession(l.id,ui);
   const saved=await api.loadTurkishLessonSession(l.id);assert.equal(saved.stage,7);assert.deepEqual(saved.answers,{0:1});assert.equal(saved.revealed,true);assert.deepEqual(JSON.parse(memory.get(sessionKey)).sessions.unrelated,old);
   const historical={speaking:{average:90,scores:{[l.sentences[0].id]:90},at:'2026-10-01T00:00:00Z'},assessment:{correct:5,total:5,at:'2026-10-01T00:00:00Z'}};
   const outcomeRaw=JSON.stringify({['tr:'+l.id]:historical});memory.set('milo_lesson_outcomes_v1',outcomeRaw);
   const outcome=await api.outcomes.getLessonOutcome('tr',l.id);assert.equal(outcome.speaking,undefined);assert.equal(outcome.assessment,undefined);assert.equal(memory.get('milo_lesson_outcomes_v1'),outcomeRaw);
   await api.outcomes.saveLessonOutcome('tr',l.id,historical);assert.equal((await api.outcomes.getLessonOutcome('tr',l.id)).speaking.contentRevision,api.TURKISH_A1_CONTENT_REVISION);assert.deepEqual(JSON.parse(memory.get('milo_lesson_outcomes_v1'))['tr:'+l.id+':previous:legacy'],historical);
   const sid=changed[l.id][0],card={id:`${l.id}:${sid}`,lessonId:l.id,sentenceId:sid,dueAt:'2030-01-01T00:00:00Z',intervalDays:40,ease:2.5,repetitions:10,lapses:2,lastReviewedAt:'2026-10-01T00:00:00Z'};
   const key='sentence_course_progress_tr_v1';memory.set(key,JSON.stringify({completedLessonIds:[l.id],currentLessonId:l.id,totalMinutes:55,reviewCards:[card]}));
   const loaded=await api.turkishProgress.getCourseProgress(),fresh=loaded.reviewCards.find(c=>c.id===card.id);
   assert.equal(loaded.currentLessonId,l.id);assert.ok(!loaded.completedLessonIds.includes(l.id));assert.ok(loaded.previousTurkishA1CompletedLessonIds.includes(l.id));assert.equal(loaded.totalMinutes,55);
   assert.equal(fresh.repetitions,0);assert.equal(fresh.intervalDays,0);assert.equal(fresh.previousContent.repetitions,10);
   const rated=await api.turkishProgress.rateReviewCard(card.id,'good',new Date('2026-11-26T12:00:00Z'));assert.equal(rated.repetitions,1);assert.equal(rated.previousContent.repetitions,10);
   const stale={...card,lastReviewedAt:'2027-01-01T00:00:00Z'};
   const merged=api.mergeTurkishReviewCards(rated,stale);assert.equal(merged.repetitions,1);assert.equal(merged.previousContent.lastReviewedAt,stale.lastReviewedAt);assert.deepEqual(api.mergeTurkishReviewCards(stale,rated),merged);assert.deepEqual(api.mergeTurkishReviewCards(merged,stale),merged);
   const completed=await api.turkishProgress.completeSentenceLesson(l.id);assert.ok(completed.completedLessonIds.includes(l.id));assert.equal(completed.turkishA1CompletionRevisions[l.id],api.TURKISH_A1_CONTENT_REVISION);
   const input={...loaded,completedLessonIds:[l.id],turkishA1CompletionRevisions:undefined,reviewCards:[stale]};const synced=await api.turkishProgress.mergeRemoteProgress(input);
   assert.ok(synced.completedLessonIds.includes(l.id));assert.equal(synced.reviewCards.find(c=>c.id===card.id).repetitions,1);
   const blank=api.reviseTurkishA1Completions({...loaded,completedLessonIds:[]});const oldDevice={...blank,completedLessonIds:[l.id],turkishA1CompletionRevisions:undefined};
   assert.ok(!api.mergeCourseProgress(blank,oldDevice).completedLessonIds.includes(l.id),'stale cloud cannot resurrect old completion');
   const backup=await api.turkishProgress.exportProgress(),restored=await api.turkishProgress.restoreProgress(backup);assert.ok(restored.completedLessonIds.includes(l.id));assert.equal(restored.reviewCards.find(c=>c.id===card.id).previousContent.repetitions,10);
   const invalid=JSON.parse(backup);invalid.progress.reviewCards[0].previousContent={};const safeRaw=memory.get(key);await assert.rejects(api.turkishProgress.restoreProgress(JSON.stringify(invalid)));assert.equal(memory.get(key),safeRaw);
   for(const badHistory of [{turkishA1CompletionRevisions:[]},{previousTurkishA1CompletedLessonIds:['not-a-lesson']}]) {
     const invalidHistory=JSON.parse(backup);Object.assign(invalidHistory.progress,badHistory);
     await assert.rejects(api.turkishProgress.restoreProgress(JSON.stringify(invalidHistory)));assert.equal(memory.get(key),safeRaw,'malformed completion archive cannot overwrite local data');
   }
   memory.delete(sessionKey);const first=await api.loadTurkishLessonSessionWithPresence(l.id);assert.equal(first.hasSavedSession,false);assert.equal(first.session.sampleRevision,api.TURKISH_A1_CONTENT_REVISION);
   const reset=await api.resetTurkishLessonSession(l.id);assert.equal(reset.stage,0);assert.equal(reset.checksRevision,api.TURKISH_A1_ASSESSMENT_REVISION);cases++;
  }
 }
 for(const bank of Object.values(inventory))for(const l of bank.filter(l=>!api.isTurkishA1Core(l.id))){assert.equal(api.turkishA1Skills(l.id),undefined);assert.equal(api.turkishA1Production(l.id),undefined);assert.equal(api.turkishA1SentenceRevision(l.id),undefined);if(inventory.tr.some(t=>t.id===l.id))assert.deepEqual(api.turkishLessonRoomPairs(l),api.lessonDialoguePairs(l.sentences,l.dialogue));}
 assert.ok(fs.readFileSync('app/foundation/[language].tsx','utf8').includes("language === 'tr') return <Redirect href={'/learn/tr/library?level=1'"));
 console.log(`Turkish A1 passed: 64 lessons, 512 stable rows (${rewrites} changed/1 unchanged), 228 exact scene turns, 128 authored/320 expanded checks, 128 skills/64 production; ${cases} web/native-stub migration/archive/failure/stale-autosave/outcome/review/completion/backup/cloud cases. All non-target inventories protected.`);
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});
module.exports={main};
