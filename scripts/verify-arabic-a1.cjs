// Real Arabic curriculum, renderer feeds and stores; native device boundaries are simulated.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const esbuild=require('esbuild');
const ts=require('typescript');
const {loadInventory}=require('./helpers/practical-inventory.cjs');
const before=require('./fixtures/arabic-a1-before.json');
const design=require('../docs/arabic-a1-design/design.json');
const changed=require('../lib/arabic/a1ChangedSlots.generated.json');
const introduced=require('../docs/arabic-a1-design/runtime/introduced-forms.json');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
(async()=>{
 const inventory=await loadInventory();
 for(const [lang,bank] of Object.entries(inventory))assert.equal(hash(lang==='ar'?bank.filter(l=>l.levelId!==1):bank),before.protected[lang],lang+': protected inventory');
 require('./helpers/approved-arabic-a1.cjs').verifyApprovedArabicA1(inventory.ar);
 const memory=new Map();globalThis.__arDisk=memory;globalThis.__arOS='web';
 const put=(k,v)=>{if(globalThis.__arFail===k)throw Error('Injected storage failure');memory.set(k,v)};
 globalThis.window={localStorage:{getItem:k=>memory.get(k)??null,setItem:put,removeItem:k=>memory.delete(k)}};
 const b=await esbuild.build({stdin:{contents:`
 export * from './lib/arabic/content'; export * from './lib/arabic/engine';
 export * from './lib/arabic/studyState'; export * from './lib/arabic/progress';
 export * from './lib/arabic/a1Scope'; export * from './lib/arabic/a1Practice';
 export * from './lib/lessonAssessment'; export * from './lib/lessonEvidenceBank';
 export * from './lib/createCourseProgressStore'; export * as outcomes from './lib/lessonOutcomes';
 export * from './lib/reviewHistory'; export * from './lib/lessonDialoguePairs';
 `,resolveDir:process.cwd()},bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'device-boundaries',setup(build){
 build.onResolve({filter:/^(react-native|@react-native-async-storage\/async-storage)$|learningChanges$|personalLearningSync$|supabase$/},a=>({path:a.path.split('/').at(-1),namespace:'stub'}));
 build.onLoad({filter:/.*/,namespace:'stub'},a=>({contents:{
 'react-native':`export const Platform={get OS(){return globalThis.__arOS;}};`,
 'async-storage':`export default {async getItem(k){return globalThis.__arDisk.get(k)??null},async setItem(k,v){if(globalThis.__arFail===k)throw Error('Injected storage failure');globalThis.__arDisk.set(k,v)},async removeItem(k){globalThis.__arDisk.delete(k)}};`,
 'learningChanges':`export const notifyLearningChange=()=>{};export const positionTimestamp=()=>new Date().toISOString();`,
 'personalLearningSync':`export const schedulePersonalLearningSync=()=>{};`,
 'supabase':`export const supabase={auth:{async getSession(){return {data:{session:null}}}}};`,
 }[a.path]}));}}]});
 const m={exports:{}};new Function('module','exports',b.outputFiles[0].text)(m,m.exports);const api=m.exports;
 const core=api.ARABIC_LESSONS.filter(l=>l.levelId===1);
 assert.deepEqual(core.map(l=>l.id),design.lessons.map(l=>l.id));assert.equal(core.length,14);
 assert.equal(api.ARABIC_ENGINE_STEPS.length,10);
 const screen=fs.readFileSync('components/arabic/ArabicLessonScreen.tsx','utf8');
 const ast=ts.createSourceFile('screen.tsx',screen,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const saves=[],skills=[];
 function visit(n){
  if(ts.isCallExpression(n)&&n.expression.getText(ast)==='saveArabicLessonSession')saves.push(n.arguments[1].getText(ast));
  if(ts.isJsxSelfClosingElement(n)&&n.tagName.getText(ast)==='StarterA1Skill'){
   skills.push(n.attributes.properties.find(p=>p.name?.getText(ast)==='task').initializer.expression.getText(ast));
  }
  ts.forEachChild(n,visit);
 }visit(ast);assert.equal(saves.length,2);assert.deepEqual(skills,['t','t']);
 assert.ok(screen.includes("arabicA1Skills(lesson.id)?.filter(t=>t.kind==='listening')")&&screen.includes("arabicA1Skills(lesson.id)?.filter(t=>t.kind==='reading')"));
 const uiSaves=saves.map(expression=>new Function('lesson','stage','sentenceIndex','revealed','evidencePassed','attempt','attemptEvidence','LESSON_STAGE_VERSION',...Object.keys(api),`return (${expression});`));
 const words=s=>s.replace(/[\u064b-\u065f\u0670ـ]/g,'').match(/[ء-ي]+/g)??[];
 const taught=new Set(before.preA1.flatMap(l=>l.sentences.flatMap(s=>words(s.ar))));
 const done=new Set();let changes=0,checks=0;
 for(const [i,l] of core.entries()){
  const old=before.core.find(o=>o.id===l.id),plan=design.lessons[i];
  assert.equal(l.order,i+1);assert.equal(l.sentences.length,8);assert.equal(l.dialogue.length,old.dialogue.length);
  assert.deepEqual(l.sentences.map(s=>s.id),old.sentences.map(s=>s.id));
  assert.deepEqual(l.checks.map(s=>s.id),old.checks.map(s=>s.id));
  for(const id of plan.prerequisiteIds)assert.ok(done.has(id),'forward dependency '+id);done.add(l.id);
  for(const id of plan.preA1Ids)assert.ok(before.preA1.some(p=>p.id===id));
  assert.ok(l.teachingFa.includes(plan.grammarFa)&&l.teachingFa.includes(plan.productionFa));
  assert.equal(new Set(l.sentences.map(s=>words(s.ar).join(' '))).size,8);
  for(const s of l.sentences){assert.ok(s.ar&&s.fa&&s.pronunciation&&s.pattern);assert.match(s.ar,/[\u064b-\u0652]/);assert.ok(!/[ء-ي]/.test(s.pronunciation));assert.equal(s.arPlain,s.ar.replace(/[\u064b-\u065f\u0670ـ]/g,''));assert.ok(s.vocabulary.length);for(const v of s.vocabulary){assert.ok(s.ar.includes(v.word));assert.ok(v.meaning&&!v.meaning.includes('واژهٔ پرتکرار'));}for(const w of words(s.ar))taught.add(w);}
  const actual=l.sentences.filter((s,j)=>s.ar!==old.sentences[j].ar||s.fa!==old.sentences[j].fa).map(s=>s.id);assert.deepEqual(actual,changed[l.id]);changes+=actual.length;
  const tasks=api.arabicEvidenceFor(l);assert.equal(tasks.length,5);checks+=tasks.length;
  assert.equal(new Set(tasks.map(t=>t.id)).size,5);
  for(const t of tasks){assert.ok(t.id.startsWith(api.ARABIC_A1_ASSESSMENT_REVISION+':'));assert.ok(t.prompt&&t.explanation&&t.answers.length);if(t.options){assert.equal(new Set(t.options).size,t.options.length);assert.equal(t.options.filter(o=>t.answers.includes(o)).length,1);}}
  assert.ok(tasks.every(t=>!old.checks.some(o=>o.id===t.id)),'legacy evidence cannot answer any current task');
  for(const [w,meaning] of Object.entries(introduced[l.id])){assert.ok(l.teachingFa.includes(w+' = '+meaning));taught.add(w);}
  const independent=api.arabicA1Skills(l.id);assert.deepEqual(independent.map(t=>t.kind),['listening','reading']);
  assert.notEqual(independent[0].passage,independent[1].passage);
  for(const t of [...independent,...l.dialogue.map(t=>({passage:t.ar}))])for(const w of words(t.passage))assert.ok(taught.has(w),l.id+': unintroduced message form '+w);
  for(const [j,t] of independent.entries()){assert.deepEqual(t,plan.skills[j]);assert.equal(new Set(t.choices).size,3);assert.ok(t.choices[t.correctIndex]);}
  assert.equal(api.arabicA1Production(l.id).writing,plan.productionFa);
  assert.deepEqual(api.arabicLessonRoomPairs(l).map(p=>p.sentenceId),l.sentences.map(s=>s.id));
 }
 assert.equal(changes,112);assert.equal(checks,70);assert.equal(core.reduce((n,l)=>n+l.dialogue.length,0),61);
 let cases=0;
 for(const os of ['web','android']){
  globalThis.__arOS=os;memory.clear();
  for(const l of core){
   const key=api.ARABIC_STUDY_KEY,progressKey=api.ARABIC_PROGRESS_STORAGE_KEY;
   const old={stage:9,stageVersion:2,sentenceIndex:7,revealed:true,evidencePassed:true,attempt:{generation:3,id:'legacy'},attemptEvidence:{oldTask:true},updatedAt:'2026-10-01T00:00:00Z'};
   const other={...api.freshArabicSession(),checksRevision:api.assessmentRevisionFor('ar','unrelated')};
   const historicalEvidence={oldTask:{skill:'reading',correct:true,heard:true,attempts:3}};
   const original={version:1,sessions:{[l.id]:old,unrelated:other},days:{'2026-10-01':130},lessonEvidence:{[l.id]:historicalEvidence}};
   const raw=JSON.stringify(original);memory.set(key,raw);
   const state=await api.loadArabicStudy(),current=state.sessions[l.id];
   assert.equal(current.stage,0);assert.equal(current.sentenceIndex,0);assert.equal(current.evidencePassed,false);assert.equal(current.revealed,false);assert.deepEqual(current.attemptEvidence,{});
   assert.equal(current.sampleRevision,api.ARABIC_A1_CONTENT_REVISION);assert.equal(current.checksRevision,api.ARABIC_A1_ASSESSMENT_REVISION);assert.equal(current.attempt.generation,4);
   assert.equal(memory.get(key),raw,'loading never rewrites raw history');
   const historyKey='legacy:legacy';assert.deepEqual(state.previousA1Sessions[l.id][historyKey],old);
   await assert.rejects(api.saveArabicLessonSession(l.id,old),/محتوای درس/);assert.equal(memory.get(key),raw);
   const ui=uiSaves[0](l,7,5,true,true,{current:current.attempt},{newTask:true},2,...Object.values(api));
   assert.equal(ui.sampleRevision,api.ARABIC_A1_CONTENT_REVISION);assert.equal(ui.checksRevision,api.ARABIC_A1_ASSESSMENT_REVISION);
   assert.deepEqual(uiSaves[1](l,7,5,true,true,{current:current.attempt},{newTask:true},2,...Object.values(api)),ui,'both real autosave/completion feeds stamp the generation');
   globalThis.__arFail=key;await assert.rejects(api.saveArabicLessonSession(l.id,ui),/Injected/);assert.equal(memory.get(key),raw);
   globalThis.__arFail=undefined;await api.saveArabicLessonSession(l.id,ui);
   let saved=await api.loadArabicStudy();assert.equal(saved.sessions[l.id].stage,7);assert.deepEqual(saved.sessions[l.id].attemptEvidence,{newTask:true});
   assert.deepEqual(saved.previousA1Sessions[l.id][historyKey],old);assert.deepEqual(saved.days,original.days);assert.deepEqual(saved.lessonEvidence,original.lessonEvidence);assert.deepEqual(saved.sessions.unrelated,other);
   const task=api.arabicEvidenceFor(l)[0];await api.recordArabicLessonEvidence(l.id,task.id,task.skill,true,true);
   assert.deepEqual((await api.loadArabicStudy()).lessonEvidence[l.id].oldTask,historicalEvidence.oldTask);
   const reset=(await api.resetArabicLessonSession(l.id)).sessions[l.id];assert.equal(reset.stage,0);assert.equal(reset.attempt.generation,5);assert.equal(reset.sampleRevision,api.ARABIC_A1_CONTENT_REVISION);
   const afterReset=memory.get(key);await assert.rejects(api.saveArabicLessonSession(l.id,ui),/تلاش/);assert.equal(memory.get(key),afterReset,'stale attempt cannot undo reset');
   await api.saveArabicLessonSession(l.id,{...reset,stage:2});assert.equal((await api.loadArabicStudy()).sessions[l.id].stage,2);
   const malformed=JSON.parse(memory.get(key));malformed.previousA1Sessions[l.id].bad={};memory.set(key,JSON.stringify(malformed));const badRaw=memory.get(key);
   await assert.rejects(api.saveArabicLessonSession(l.id,reset));assert.equal(memory.get(key),badRaw,'corrupt history never overwritten');memory.set(key,afterReset);
   const historical={speaking:{average:90,scores:{[l.sentences[0].id]:90},at:'2026-10-01T00:00:00Z'},assessment:{correct:5,total:5,at:'2026-10-01T00:00:00Z'}};
   const outcomeRaw=JSON.stringify({['ar:'+l.id]:historical});memory.set('milo_lesson_outcomes_v1',outcomeRaw);
   const outcome=await api.outcomes.getLessonOutcome('ar',l.id);assert.equal(outcome.speaking,undefined);assert.equal(outcome.assessment,undefined);assert.equal(memory.get('milo_lesson_outcomes_v1'),outcomeRaw);
   await api.outcomes.saveLessonOutcome('ar',l.id,historical);assert.equal((await api.outcomes.getLessonOutcome('ar',l.id)).speaking.contentRevision,api.ARABIC_A1_CONTENT_REVISION);assert.deepEqual(JSON.parse(memory.get('milo_lesson_outcomes_v1'))['ar:'+l.id+':previous:legacy'],historical);
   const sid=changed[l.id][0],card={id:`${l.id}:${sid}`,lessonId:l.id,sentenceId:sid,dueAt:'2030-01-01T00:00:00Z',intervalDays:40,ease:2.5,repetitions:10,lapses:2,lastReviewedAt:'2026-10-01T00:00:00Z'};
   memory.set(progressKey,JSON.stringify({completedLessonIds:[l.id],currentLessonId:l.id,totalMinutes:55,reviewCards:[card]}));
   const loaded=await api.getArabicProgress(),fresh=loaded.reviewCards.find(c=>c.id===card.id);
   assert.equal(loaded.currentLessonId,l.id);assert.ok(!loaded.completedLessonIds.includes(l.id));assert.ok(loaded.previousArabicA1CompletedLessonIds.includes(l.id));assert.equal(loaded.totalMinutes,55);
   assert.equal(fresh.repetitions,0);assert.equal(fresh.intervalDays,0);assert.equal(fresh.previousContent.repetitions,10);
   const rated=await api.rateArabicReviewCard(card.id,'good',new Date('2026-11-26T12:00:00Z'));assert.equal(rated.repetitions,1);assert.equal(rated.previousContent.repetitions,10);
   const stale={...card,lastReviewedAt:'2027-01-01T00:00:00Z'};
   const merged=api.mergeArabicReviewCards(rated,stale);assert.equal(merged.repetitions,1);assert.equal(merged.previousContent.lastReviewedAt,stale.lastReviewedAt);assert.deepEqual(api.mergeArabicReviewCards(stale,rated),merged);assert.deepEqual(api.mergeArabicReviewCards(merged,stale),merged);
   const completed=await api.completeArabicLesson(l.id);assert.ok(completed.completedLessonIds.includes(l.id));assert.equal(completed.arabicA1CompletionRevisions[l.id],api.ARABIC_A1_CONTENT_REVISION);
   const oldDevice={...loaded,completedLessonIds:[l.id],arabicA1CompletionRevisions:undefined,reviewCards:[stale]};
   const mergedProgress=api.mergeCourseProgress(completed,oldDevice);assert.ok(mergedProgress.completedLessonIds.includes(l.id));assert.equal(mergedProgress.reviewCards.find(c=>c.id===card.id).repetitions,1);
   const blank=api.reviseArabicA1Completions({...loaded,completedLessonIds:[]});assert.ok(!api.mergeCourseProgress(blank,oldDevice).completedLessonIds.includes(l.id),'old import cannot resurrect legacy completion');
   const backup=await api.exportArabicProgress(),restored=await api.restoreArabicProgress(backup);assert.ok(restored.completedLessonIds.includes(l.id));assert.equal(restored.reviewCards.find(c=>c.id===card.id).previousContent.repetitions,10);
   const safeRaw=memory.get(progressKey);
   for(const patch of [{arabicA1CompletionRevisions:[]},{previousArabicA1CompletedLessonIds:['invalid']}]){const invalid=JSON.parse(backup);Object.assign(invalid.progress,patch);await assert.rejects(api.restoreArabicProgress(JSON.stringify(invalid)));assert.equal(memory.get(progressKey),safeRaw);}
   const invalid=JSON.parse(backup);invalid.progress.reviewCards[0].previousContent={};await assert.rejects(api.restoreArabicProgress(JSON.stringify(invalid)));assert.equal(memory.get(progressKey),safeRaw);
   memory.delete(key);const first=api.freshArabicSession(l.id);assert.equal(first.sampleRevision,api.ARABIC_A1_CONTENT_REVISION);await api.saveArabicLessonSession(l.id,first);assert.equal((await api.loadArabicStudy()).sessions[l.id].stage,0);cases++;
  }
 }
 for(const bank of Object.values(inventory))for(const l of bank.filter(l=>!api.isArabicA1Core(l.id))){assert.equal(api.arabicA1Skills(l.id),undefined);assert.equal(api.arabicA1Production(l.id),undefined);assert.equal(api.arabicA1SentenceRevision(l.id),undefined);}
 assert.ok(fs.readFileSync('components/arabic/ArabicLibraryScreen.tsx','utf8').includes('.sort((a, b) => a.order - b.order)'),'the actual library uses authored order');
 console.log(`Arabic A1 passed: 14 lessons/112 stable changed rows/61 exact scene turns/43 authored→70 expanded checks/28 independent skills/14 production; ${cases} web/native-stub migration, archive, reset, stale autosave, failure, outcome, SRS, completion and backup scenarios; all six other languages and Arabic non-A1 byte-identical.`);
})().catch(e=>{console.error(e);process.exitCode=1});
