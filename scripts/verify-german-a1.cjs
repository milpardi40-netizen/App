const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const esbuild=require('esbuild');
const ts=require('typescript');
const {loadInventory}=require('./helpers/practical-inventory.cjs');
const before=require('./fixtures/german-a1-before.json');
const design=require('../docs/german-a1-design/design.json');
const changed=require('../lib/languages/germanA1ChangedSlots.generated.json');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
async function main(){
 const inventory=await loadInventory();
 for(const [lang,bank]of Object.entries(inventory)){if(lang==='ar'){require('./helpers/approved-arabic-a1.cjs').verifyApprovedArabicA1(bank);continue;}if(lang==='tr'){require('./helpers/approved-turkish-a1.cjs').verifyApprovedTurkishA1(bank);continue;}if(lang==='es'){assert.equal(hash(bank.filter(l=>l.levelId!==1)),require('./fixtures/spanish-a1-before.json').protected.es,'Spanish non-A1 protected');continue;}assert.equal(hash(['de','fr'].includes(lang)?bank.filter(l=>l.levelId!==1):bank),lang==='fr'?require('./fixtures/french-a1-before.json').protected.fr:before.protected[lang],lang+': non-target assembled inventory');}
 const memory=new Map();globalThis.__germanMemory=memory;globalThis.__germanOS='web';
 globalThis.window={localStorage:{getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)}};
 const b=await esbuild.build({stdin:{contents:`
 export {NEW_COURSES} from './lib/languages/newCourses';
 export * from './lib/languages/germanA1Scope'; export * from './lib/languages/germanA1Practice';
 export * from './lib/languages/frenchA1Scope'; export * from './lib/languages/frenchA1Practice';
 export * from './lib/languages/spanishA1Scope'; export * from './lib/languages/spanishA1Practice';

 export * from './lib/languages/starterEditorial';
 export * from './lib/languages/a1Curriculum';
 export * from './lib/lessonAssessment';
 export * from './lib/createCourseProgressStore';
 export * from './lib/reviewHistory';
 export * as outcomes from './lib/lessonOutcomes';
 `,resolveDir:process.cwd()},bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'device-only',setup(build){
 build.onResolve({filter:/^(react-native|@react-native-async-storage\/async-storage)$|learningChanges$|personalLearningSync$|supabase$/},a=>({path:a.path.split('/').at(-1),namespace:'stub'}));
 build.onLoad({filter:/.*/,namespace:'stub'},a=>({contents:{
 'react-native':`export const Platform={get OS(){return globalThis.__germanOS;}};`,
 'async-storage':`export default {async getItem(k){return globalThis.__germanMemory.get(k)??null},async setItem(k,v){globalThis.__germanMemory.set(k,v)}};`,
 'learningChanges':`export const notifyLearningChange=()=>{};export const positionTimestamp=()=>new Date().toISOString();`,
 'personalLearningSync':`export const schedulePersonalLearningSync=()=>{};`,
 'supabase':`export const supabase={auth:{async getSession(){return {data:{session:null}}}}};`,
 }[a.path]}));}}]});
 const m={exports:{}};new Function('module','exports',b.outputFiles[0].text)(m,m.exports);const api=m.exports;
 const course=api.NEW_COURSES.de,core=course.lessons.filter(l=>api.isGermanA1Core(l.id));
 assert.deepEqual(core.map(l=>l.id),design.lessons.map(l=>l.id));assert.equal(core.length,56);
 const syllabus=api.getA1Curriculum('de');assert.deepEqual(syllabus.map(s=>s.topics.length),[25,30]);
 assert.deepEqual(syllabus.flatMap(s=>s.topics.flatMap(t=>t.relatedLessonIds)),api.GERMAN_A1_IDS);
 // Execute the actual autosave object expression: room-only tests cannot catch missing revision stamps.
 const screen=fs.readFileSync('components/StarterLesson.tsx','utf8');const ast=ts.createSourceFile('screen.tsx',screen,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let nextExpression;
 function visit(n){if(ts.isVariableDeclaration(n)&&n.name.getText(ast)==='nextSession')nextExpression=n.initializer.getText(ast);ts.forEachChild(n,visit)}visit(ast);assert.ok(nextExpression);
 const nextFromScreen=new Function('lesson','LESSON_STAGE_VERSION','stage','sentenceIndex','revealed','answers','showCheckAnswers',...Object.keys(api),`return (${nextExpression});`);
 const words=s=>s.toLocaleLowerCase('de').match(/[a-zäöüßé]+/gu)??[];
 const taught=new Set(course.lessons.filter(l=>l.levelId===0).flatMap(l=>l.sentences.flatMap(s=>words(s.text))));
 let rewrites=0,tasks=0;
 for(const [i,l]of core.entries()){
  const old=before.core.find(x=>x.id===l.id),plan=design.lessons[i];
  assert.equal(l.order,i+28);assert.equal(l.levelId,1);assert.equal(l.sentences.length,old.sentences.length);
  assert.deepEqual(l.sentences.map(s=>s.id),old.sentences.map(s=>s.id));
  assert.equal(new Set(l.sentences.map(s=>s.text.toLowerCase())).size,l.sentences.length);
  assert.deepEqual(l.sentences.slice(0,plan.scene.length).map(s=>({de:s.text,fa:s.fa})),plan.scene.map(t=>({de:t.de,fa:t.fa})));
  assert.equal(l.dialogue.length,old.dialogue.length);assert.deepEqual(api.starterDisplayDialogue(l),l.dialogue,'no retired role/editorial overrides');
  assert.ok(l.teachingFa.includes(plan.grammarFa)&&l.teachingFa.includes(plan.productionFa));
  for(const s of l.sentences){assert.ok(s.text&&s.fa&&s.pronunciation&&s.pattern&&s.vocabulary.length);assert.ok(!/[a-zäöüß]/i.test(s.pronunciation));assert.equal(api.starterDisplayPronunciation(s),s.pronunciation);for(const v of s.vocabulary)assert.ok(s.text.toLowerCase().includes(v.word.toLowerCase())&&v.meaning);}
  const actual=l.sentences.filter((s,i)=>s.text!==old.sentences[i].text||s.fa!==old.sentences[i].fa).map(s=>s.id);
  assert.deepEqual(actual,changed[l.id]);rewrites+=actual.length;
  assert.equal(l.checks.length,4);assert.deepEqual(api.starterDisplayChecks(l),l.checks);
  const checks=api.expandedChoiceChecks(l);assert.equal(checks.length,api.shortAssessmentCount(l.sentences.length));tasks+=checks.length;
  for(const check of checks){assert.equal(new Set(check.choices).size,check.choices.length);assert.ok(check.choices[check.correctIndex]);assert.ok(check.promptFa&&check.explanationFa);}
  for(const t of [...l.sentences.map(s=>s.text),l.teachingFa])for(const word of words(t))taught.add(word);
  const skills=api.germanA1Skills(l.id);assert.deepEqual(skills.map(t=>t.kind),['listening','reading']);
  for(const skill of skills)for(const word of words(skill.passage))assert.ok(taught.has(word),l.id+': untaught comprehension form '+word);
  assert.notEqual(skills[0].passage,skills[1].passage);assert.ok(skills.every(t=>new Set(t.choices).size===3&&t.choices[t.correctIndex]));
  assert.equal(api.germanA1Production(l.id).writing,plan.productionFa);
 }
 assert.equal(tasks,339);assert.equal(core.reduce((n,l)=>n+l.sentences.length,0),696);
 let cases=0;
 for(const os of ['web','ios']){
  globalThis.__germanOS=os;memory.clear();
  const progress=course.progress,sessions=course.sessions;
  for(const l of core){
   const sessionKey='de_starter_lesson_sessions_v1';
   const oldSession={stage:7,stageVersion:2,sentenceIndex:l.sentences.length-1,revealed:true,answers:{0:0,1:1},showCheckAnswers:true,updatedAt:'2026-10-01T00:00:00Z'};
   const raw=JSON.stringify({schema:1,sessions:{[l.id]:oldSession,unrelated:oldSession}});memory.set(sessionKey,raw);
   const current=await sessions.loadStarterLessonSession(l.id);
   assert.equal(current.stage,7);assert.equal(current.sentenceIndex,l.sentences.length-1);assert.equal(current.revealed,false);assert.deepEqual(current.answers,{});assert.equal(current.showCheckAnswers,false);
   assert.equal(current.checksRevision,api.GERMAN_A1_ASSESSMENT_REVISION);assert.equal(current.sampleRevision,api.GERMAN_A1_CONTENT_REVISION);assert.equal(memory.get(sessionKey),raw,'read migration never mutates original bytes');
   await assert.rejects(sessions.saveStarterLessonSession(l.id,oldSession),/محتوای درس/,'old-client autosave must not restamp old answers as new');
   const uiSave=nextFromScreen(l,2,current.stage,current.sentenceIndex,true,{0:1},true,...Object.values(api));
   await sessions.saveStarterLessonSession(l.id,uiSave);
   assert.deepEqual(JSON.parse(memory.get(sessionKey+':history:'+l.id+':legacy')),oldSession,'prior answers and position are archived before current autosave');
   const reload=await sessions.loadStarterLessonSession(l.id);assert.deepEqual(reload.answers,{0:1});assert.equal(reload.revealed,true);assert.deepEqual(JSON.parse(memory.get(sessionKey)).sessions.unrelated,oldSession);
   const outcomeKey='milo_lesson_outcomes_v1';const historical={speaking:{average:90,scores:{[l.sentences[0].id]:90},at:'2026-10-01T00:00:00Z'},assessment:{correct:6,total:6,at:'2026-10-01T00:00:00Z'}};
   const oldOut=JSON.stringify({['de:'+l.id]:historical});memory.set(outcomeKey,oldOut);
   const outcome=await api.outcomes.getLessonOutcome('de',l.id);assert.equal(outcome.speaking,undefined);assert.equal(outcome.assessment,undefined);assert.equal(memory.get(outcomeKey),oldOut);
   await api.outcomes.saveLessonOutcome('de',l.id,historical);assert.equal((await api.outcomes.getLessonOutcome('de',l.id)).speaking.contentRevision,api.GERMAN_A1_CONTENT_REVISION);
   assert.deepEqual(JSON.parse(memory.get(outcomeKey))['de:'+l.id+':previous:legacy'],historical,'old scores retained even after saving the new-content attempt');
   const sid=changed[l.id][0];assert.ok(sid);
   const card={id:`${l.id}:${sid}`,lessonId:l.id,sentenceId:sid,dueAt:'2030-01-01T00:00:00Z',intervalDays:40,ease:2.5,repetitions:10,lapses:2,lastReviewedAt:'2026-10-01T00:00:00Z'};
   const key='sentence_course_progress_de_starter_v1';
   memory.set(key,JSON.stringify({completedLessonIds:[l.id],currentLessonId:l.id,totalMinutes:55,reviewCards:[card]}));
   const loaded=await progress.getCourseProgress();const fresh=loaded.reviewCards.find(c=>c.id===card.id);
   assert.equal(loaded.currentLessonId,l.id);assert.ok(loaded.completedLessonIds.includes(l.id));assert.equal(loaded.totalMinutes,55);
   assert.equal(fresh.repetitions,0);assert.equal(fresh.intervalDays,0);assert.equal(fresh.previousContent.repetitions,10);assert.equal(fresh.previousContent.lastReviewedAt,card.lastReviewedAt);
   assert.deepEqual(api.reviseGermanA1ReviewCard(fresh),fresh);
   const rated=await progress.rateReviewCard(card.id,'good',new Date('2026-11-26T12:00:00Z'));assert.equal(rated.repetitions,1);assert.equal(rated.intervalDays,1);assert.equal(rated.previousContent.repetitions,10);
   const stale={...card,lastReviewedAt:'2027-01-01T00:00:00Z',ratingHistory:{days:{},undated:12,lowerBound:true,writers:{oldDevice:{'2026-11-25':1}}}};
   const merged=api.mergeGermanReviewCards(rated,stale);assert.equal(merged.repetitions,1);assert.equal(merged.lastReviewedAt,rated.lastReviewedAt);assert.equal(merged.previousContent.lastReviewedAt,stale.lastReviewedAt);
   assert.deepEqual(api.mergeGermanReviewCards(stale,rated),merged);assert.deepEqual(api.mergeGermanReviewCards(merged,stale),merged);
   const input={...loaded,reviewCards:[stale]};const synced=await progress.mergeRemoteProgress(input);const currentCard=synced.reviewCards.find(c=>c.id===card.id);assert.equal(currentCard.repetitions,1);assert.ok(currentCard.previousContent.ratingHistory.writers.oldDevice);
   const backup=await progress.exportProgress();const restored=await progress.restoreProgress(backup);assert.deepEqual(restored.reviewCards.find(c=>c.id===card.id),JSON.parse(JSON.stringify(currentCard)));
   const invalid=JSON.parse(backup);invalid.progress.reviewCards[0].previousContent={};const safeBefore=memory.get(key);await assert.rejects(progress.restoreProgress(JSON.stringify(invalid)));assert.equal(memory.get(key),safeBefore,'invalid archive cannot overwrite local progress');
   const total=c=>{const h=api.ratingsOf(c);return h.undated+Object.values(api.datedRatings(h)).reduce((a,b)=>a+b,0);};assert.equal(total(currentCard)+total(currentCard.previousContent),14);
   cases++;
  }
 }
 for(const [lang,bank]of Object.entries(inventory))for(const l of bank.filter(l=>!api.isGermanA1Core(l.id))){assert.equal(api.germanA1Production(l.id),undefined);assert.equal(api.germanA1SentenceRevision(l.id),undefined);assert.equal(api.germanA1Skills(l.id),undefined);}
 console.log(`German A1 passed: 56 lessons, 696 stable slots (${rewrites} text/meaning changes), 250 scene turns, 339 final checks, 112 independent skills; ${cases} web/native-stub session/outcome/review/backup/cloud conflict cases; all six other languages and German outside A1 protected.`);
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});
module.exports={main};
