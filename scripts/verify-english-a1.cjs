const assert = require('node:assert/strict');
const fs = require('node:fs');
const {createHash} = require('node:crypto');
const esbuild = require('esbuild');
const {loadInventory} = require('./helpers/practical-inventory.cjs');
const before = require('./fixtures/english-a1-before.json');
const design = require('../docs/english-a1-design/design.json');
const migration = require('../docs/english-a1-design/runtime/migration.json');
const hash = x => createHash('sha256').update(JSON.stringify(x)).digest('hex');
const norm = x => x.normalize('NFKC').toLowerCase().replace(/’/g,"'");

async function main() {
  const inventory = await loadInventory();
  const ids = new Set(design.lessons.map(l => l.id));
  for (const [lang,bank] of Object.entries(inventory)) {
    if (lang === 'ar') { require('./helpers/approved-arabic-a1.cjs').verifyApprovedArabicA1(bank); continue; }
    if (lang === 'tr') {
      require('./helpers/approved-turkish-a1.cjs').verifyApprovedTurkishA1(bank);
    } else if (lang === 'es') {
      const spanish=require('./fixtures/spanish-a1-before.json');
      assert.equal(hash(bank.filter(l=>l.levelId!==1)),spanish.protected.es,'Spanish outside its separately approved A1 scope');
    } else if (lang === 'fr') {
      const french=require('./fixtures/french-a1-before.json');
      assert.equal(hash(bank.filter(l=>l.levelId!==1)),french.protected.fr,'French outside its separately approved A1 scope');
    } else if (lang === 'de') {
      const german=require('./fixtures/german-a1-before.json');
      assert.equal(hash(bank.filter(l=>l.levelId!==1)),german.protected.de,'German outside its separately approved A1 scope');
    } else assert.equal(hash(lang === 'en' ? bank.filter(l => !ids.has(l.id)) : bank), before.protected[lang], `${lang}: every non-target assembled lesson stays byte-identical`);
  }
  for (const [path,expected] of Object.entries(before.protectedSources)) assert.equal(createHash('sha256').update(fs.readFileSync(path)).digest('hex'),expected,`${path}: protected source`);
  const memory = new Map();
  globalThis.__englishA1Memory = memory;
  globalThis.__englishA1OS = 'web';
  globalThis.window = {localStorage:{getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)}};
  const b = await esbuild.build({stdin:{contents:`
    export * from './lib/englishA1Scope';
    export * from './lib/englishA1.generated';
    export * from './lib/englishA1Practice';
    export * from './lib/englishStudyState';
    export * from './lib/lessonAssessment';
    export * from './lib/lessonEvidenceBank';
    export * from './lib/englishFoundationEvidence';
    export * from './lib/courseProgress';
    export * as backup from './lib/englishBackup';
    export {mergeCourseProgress as sharedMerge} from './lib/createCourseProgressStore';
    export {ratingsOf,datedRatings} from './lib/reviewHistory';
    export * as chunks from './lib/lessonChunks';
    export * as outcomes from './lib/lessonOutcomes';
    export {isCorrect} from './lib/englishSupplement/content';
  `,resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'cjs',plugins:[{name:'device-storage-only',setup(build){
    build.onResolve({filter:/^(react-native|@react-native-async-storage\/async-storage)$|personalLearningSync$|learningChanges$|supabase$/},a=>({path:a.path.split('/').at(-1),namespace:'stub'}));
    build.onLoad({filter:/.*/,namespace:'stub'},a=>({contents:{
      'react-native':`export const Platform={get OS(){return globalThis.__englishA1OS;}};`,
      'async-storage':`export default {async getItem(k){return globalThis.__englishA1Memory.get(k)??null},async setItem(k,v){globalThis.__englishA1Memory.set(k,v)}};`,
      'personalLearningSync':`export const schedulePersonalLearningSync=()=>{};`,
      'learningChanges':`export const notifyLearningChange=()=>{};export const positionTimestamp=()=>new Date().toISOString();`,
      'supabase':`export const supabase={auth:{async getSession(){return {data:{session:null}}}}};export const isSupabaseConfigured=()=>false;`,
    }[a.path]}));
  }}]});
  const m={exports:{}};new Function('module','exports',b.outputFiles[0].text)(m,m.exports);const api=m.exports;
  const core = inventory.en.filter(l=>ids.has(l.id));
  assert.deepEqual(core.map(l=>l.id),api.ENGLISH_A1_IDS);
  assert.deepEqual(core.map(l=>l.id),design.lessons.map(l=>l.id));
  assert.equal(core.length,29);assert.equal(new Set(design.lessons.map(l=>l.module)).size,9);
  assert.equal(hash(Object.fromEntries(Object.entries(api.CORE_LESSON_EVIDENCE).filter(([id])=>!ids.has(id)))),before.protectedEvidence,'all non-core evidence banks unchanged');
  let changed=0;
  for(const [i,l] of core.entries()) {
    const old=before.core.find(x=>x.id===l.id),plan=design.lessons[i];
    assert.equal(l.order,i+15);assert.equal(l.levelId,1);assert.equal(l.sentences.length,50);
    assert.deepEqual(l.sentences.map(s=>s.id),old.sentences.map(s=>s.id));
    assert.equal(new Set(l.sentences.map(s=>norm(s.en))).size,50);
    assert.deepEqual(l.sentences.slice(0,6).map(s=>({en:s.en,fa:s.fa})),plan.examples);
    for(const dep of plan.prerequisiteIds)assert.ok(core.findIndex(x=>x.id===dep)<i);
    assert.ok(l.teachingFa.includes(plan.grammarFa)&&l.teachingFa.includes(plan.writingFa));
    for(const s of l.sentences) {
      assert.ok(s.en&&s.fa&&s.pronunciation&&s.vocabulary.length);
      assert.ok(!/[a-z]/i.test(s.pronunciation),'Persian pronunciation, not mixed-script placeholders');
      assert.ok(!/[{}]/.test(s.en+s.fa));
      for(const v of s.vocabulary)assert.ok(v.word&&v.meaning&&norm(s.en).includes(norm(v.word)),`${l.id}/${s.id}: literal vocabulary ${v.word}`);
    }
    assert.equal(l.dialogue.length,6);assert.ok(l.dialogue.every((t,i)=>t.role===(i%2?'learner':'partner')&&t.speaker===t.role));
    assert.deepEqual(l.dialogue.slice(0,4).map(t=>({en:t.text,fa:t.fa,role:t.role})),plan.scene);
    const actualChanged=l.sentences.filter((s,i)=>s.en!==old.sentences[i].en||s.fa!==old.sentences[i].fa).map(s=>s.id);
    assert.deepEqual(migration[l.id].changedSentenceIds,actualChanged);changed+=actualChanged.length;
    const tasks=api.englishEvidenceFor(l);
    assert.equal(tasks.length,8);assert.deepEqual(tasks,api.CORE_LESSON_EVIDENCE[l.id]);
    assert.ok(tasks.every(t=>t.id.startsWith(`en-a1-sequenced-v1:${l.id}:`)));
    assert.equal(new Set(tasks.map(t=>t.id)).size,8);
    for(const t of tasks){
      assert.ok(t.prompt&&t.explanation&&t.answers.length);
      assert.ok(t.answers.every(answer=>api.isCorrect(t,answer)));
      if(t.options){assert.equal(t.options.length,3);assert.equal(new Set(t.options).size,3);assert.ok(t.options.includes(t.answers[0]));assert.ok(t.options.filter(o=>!t.answers.includes(o)).every(o=>!api.isCorrect(t,o)));}
    }
    assert.deepEqual(api.englishA1Skills(l.id).map(t=>t.kind),['listening','reading']);
    assert.equal(api.assessmentRevisionFor('en',l.id),api.ENGLISH_A1_ASSESSMENT_REVISION);
    assert.equal(api.currentEnglishEvidenceComplete(l,{'old-question':{correct:true,heard:true}}),false);
  }
  let migrations=0;
  for(const os of ['web','ios']) {
    globalThis.__englishA1OS=os;memory.clear();
    for(const l of core) {
      const session={stage:8,stageVersion:2,sentenceIndex:31,revealed:true,evidencePassed:true,attempt:{generation:1,id:'existing-attempt'},attemptEvidence:{'old-question':true},checksRevision:api.LESSON_ASSESSMENT_REVISION};
      const raw=JSON.stringify({version:1,sessions:{[l.id]:session},days:{'2026-11-25':4000},lessonEvidence:{[l.id]:{'old-question':{skill:'writing',correct:true,heard:false,attempts:1}}}});
      memory.set(api.STUDY_KEY,raw);
      const state=await api.loadStudy(),current=state.sessions[l.id];
      assert.equal(current.stage,8);assert.equal(current.sentenceIndex,31);assert.deepEqual(current.attempt,session.attempt);
      assert.equal(current.revealed,false);assert.equal(current.evidencePassed,false);assert.deepEqual(current.attemptEvidence,{});
      assert.equal(current.checksRevision,api.ENGLISH_A1_ASSESSMENT_REVISION);
      assert.equal(state.lessonEvidence[l.id]['old-question'].attempts,1);assert.equal(state.days['2026-11-25'],4000);
      assert.equal(memory.get(api.STUDY_KEY),raw,'read migration never mutates raw storage');
      await api.saveLessonSession(l.id,{...current,revealed:true,evidencePassed:true,attemptEvidence:{'new-question':true}});
      const again=(await api.loadStudy()).sessions[l.id];assert.equal(again.revealed,true);assert.equal(again.evidencePassed,true);assert.equal(again.attemptEvidence['new-question'],true);
      const chunkRaw=JSON.stringify({[l.id]:[1,2,3,4,5],'unrelated':[1]});memory.set('milo_lesson_chunks_done_v1',chunkRaw);
      assert.deepEqual(await api.chunks.loadCompletedChunks(l.id),[]);
      await api.chunks.markChunkDone(l.id,1);assert.deepEqual(await api.chunks.loadCompletedChunks(l.id),[1]);
      assert.deepEqual(api.currentEnglishChunkMap(await api.chunks.loadChunkMap())[l.id],[1], 'resume/tallies consume only the current chunk generation');
      assert.deepEqual(JSON.parse(memory.get('milo_lesson_chunks_done_v1'))[l.id],[1,2,3,4,5]);
      await api.chunks.resetLessonChunks(l.id);assert.deepEqual(await api.chunks.loadCompletedChunks(l.id),[]);
      const historical={speaking:{average:99,scores:{[l.sentences[0].id]:99},at:'2026-11-25T00:00:00Z'},assessment:{correct:8,total:8,at:'2026-11-25T00:00:00Z',contentRevision:api.LESSON_ASSESSMENT_REVISION}};
      const historyRaw=JSON.stringify({[`en:${l.id}`]:historical});memory.set('milo_lesson_outcomes_v1',historyRaw);
      const filtered=await api.outcomes.getLessonOutcome('en',l.id);assert.equal(filtered.speaking,undefined);assert.equal(filtered.assessment,undefined);
      assert.equal(memory.get('milo_lesson_outcomes_v1'),historyRaw);
      await api.outcomes.saveLessonOutcome('en',l.id,historical);assert.equal((await api.outcomes.getLessonOutcome('en',l.id)).speaking.average,99);
      const changedId=migration[l.id].changedSentenceIds[0];
      const oldCard={id:`${l.id}:${changedId}`,lessonId:l.id,sentenceId:changedId,dueAt:'2030-01-01T00:00:00Z',intervalDays:40,ease:2.5,repetitions:10,lapses:2,lastReviewedAt:'2026-11-25T00:00:00Z'};
      const progress=api.parseCourseProgressBackup({completedLessonIds:[l.id],currentLessonId:l.id,reviewCards:[oldCard]});
      assert.deepEqual(progress.completedLessonIds,[l.id]);assert.equal(progress.currentLessonId,l.id);
      const card=progress.reviewCards.find(c=>c.id===oldCard.id);assert.equal(card.repetitions,0);assert.equal(card.intervalDays,0);
      assert.equal(card.previousContent.repetitions,10);assert.equal(card.previousContent.dueAt,oldCard.dueAt);
      assert.deepEqual(api.reviseEnglishA1ReviewCard(card),card,'revision is idempotent');
      assert.equal(oldCard.repetitions,10,'caller-owned old card never mutated');
      memory.set(api.COURSE_PROGRESS_STORAGE_KEY,JSON.stringify({completedLessonIds:[l.id],currentLessonId:l.id,reviewCards:[oldCard]}));
      const rated=await api.rateReviewCard(oldCard.id,'good',new Date('2026-11-26T12:00:00Z'));
      assert.equal(rated.repetitions,1);assert.equal(rated.intervalDays,1,'new meaning starts a new review interval');
      assert.equal(rated.previousContent.repetitions,10);assert.equal((await api.readLocalProgress()).reviewCards.find(c=>c.id===oldCard.id).repetitions,1);

      // Legacy device has a later clock and an independent old-content rating.
      const stale={...oldCard,lastReviewedAt:'2027-01-01T00:00:00Z',ratingHistory:{days:{},undated:12,lowerBound:true,writers:{oldDevice:{'2026-11-25':1}}}};
      const currentCard={...rated,ratingHistory:{days:{},undated:0,lowerBound:false,writers:{newDevice:{'2026-11-26':1}}}};
      const mergeCard=api.mergeEnglishReviewCards;
      const merged=mergeCard(currentCard,stale);
      assert.equal(merged.repetitions,1);assert.equal(merged.lastReviewedAt,currentCard.lastReviewedAt);
      assert.deepEqual(merged.ratingHistory,currentCard.ratingHistory,'historical mastery never becomes currentCard mastery');
      assert.ok(merged.previousContent.ratingHistory.writers.oldDevice);
      assert.deepEqual(mergeCard(stale,currentCard),merged,'commutative generation merge');
      assert.deepEqual(mergeCard(merged,stale),merged,'repeat sync is idempotent');
      const withCard=c=>({...api.parseCourseProgressBackup({}),reviewCards:[c]});
      const shared=api.sharedMerge(withCard(currentCard),withCard(stale),mergeCard).reviewCards[0];
      assert.deepEqual(shared,merged,'cloud shared merge uses generation-aware card resolver');
      const restored=api.backup.mergeEnglishCourseProgress(withCard(stale),withCard(currentCard)).reviewCards.find(c=>c.id===currentCard.id);
      assert.deepEqual(restored,merged,'backup restore normalizes before choosing schedule');
      const roundtrip=api.parseCourseProgressBackup(JSON.parse(JSON.stringify(withCard(restored)))).reviewCards[0];
      assert.deepEqual(roundtrip,JSON.parse(JSON.stringify(merged)),'archive and currentCard ratings survive backup JSON round trip');
      const total=c=>{const h=api.ratingsOf(c);return h.undated+Object.values(api.datedRatings(h)).reduce((a,b)=>a+b,0)};
      assert.equal(total(merged)+total(merged.previousContent),14,'13 old reviews plus one currentCard review remain in historical totals');
      migrations++;
    }
    for(const l of inventory.en.filter(l=>!ids.has(l.id))) {
      assert.equal(api.englishA1Production(l.id),undefined);assert.deepEqual(api.englishA1Skills(l.id),[]);
      const session={stage:4,stageVersion:2,sentenceIndex:0,revealed:true,evidencePassed:true,checksRevision:api.LESSON_ASSESSMENT_REVISION};
      const state=api.parseStudy(JSON.stringify({version:1,sessions:{[l.id]:session},days:{},lessonEvidence:{}}));
      // Pre-A1's pre-existing balancing migration is outside this scope; unchanged higher bands/labs are exact.
      if(l.levelId!==0)assert.deepEqual(state.sessions[l.id],session);
      const oldCard={id:`${l.id}:${l.sentences[0].id}`,lessonId:l.id,sentenceId:l.sentences[0].id,dueAt:'2030-01-01T00:00:00Z',intervalDays:40,ease:2.5,repetitions:10,lapses:2};
      assert.deepEqual(api.reviseEnglishA1ReviewCard(oldCard),oldCard);
    }
  }
  console.log(`English A1 data/progress passed: 29/29 approved lessons, 1450 stable slots (${changed} changed meanings/texts), 232 versioned tasks, 58 web/native session+outcome+chunk+review migrations; preserved IDs/completions/resume/history, protected all six other languages and English non-core/labs/evidence/supplement.`);
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={main};
