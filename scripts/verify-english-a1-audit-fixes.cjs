// Regression tests for the English-A1-only editorial audit. No network or real-device speech.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createHash } = require('node:crypto');
const esbuild = require('esbuild');
const React = require('react');
const { act, create } = require('react-test-renderer');
const before = require('./fixtures/english-a1-audit-before.json');
const { loadInventory, verifyScope } = require('./helpers/practical-inventory.cjs');
const hash = x => createHash('sha256').update(JSON.stringify(x)).digest('hex');
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.__auditDisk = new Map();
globalThis.__auditOS = 'web';
globalThis.window = { localStorage: { getItem: k => globalThis.__auditDisk.get(k) ?? null, setItem: (k,v) => globalThis.__auditDisk.set(k,v) } };
const plugin = { name: 'device-boundaries', setup(build) {
  build.onResolve({ filter: /^(react-native|@react-native-async-storage\/async-storage)$|personalLearningSync$|learningChanges$|supabase$/ }, args => ({ path: args.path.split('/').at(-1), namespace: 'mock' }));
  build.onLoad({ filter: /.*/, namespace: 'mock' }, args => ({ contents: {
    'react-native': `export const Platform={get OS(){return globalThis.__auditOS}};`,
    'async-storage': `export default {async getItem(k){return globalThis.__auditDisk.get(k)??null},async setItem(k,v){globalThis.__auditDisk.set(k,v)}};`,
    personalLearningSync: `export const schedulePersonalLearningSync=()=>{};`,
    learningChanges: `export const notifyLearningChange=()=>{};export const positionTimestamp=()=>new Date().toISOString();`,
    supabase: `export const supabase={auth:{async getSession(){return {data:{session:null}}}}};export const isSupabaseConfigured=()=>false;`,
  }[args.path] }));
} };
async function bundle(contents, plugins = [plugin]) {
  const b = await esbuild.build({ stdin: { contents, resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false, jsx: 'automatic', external: ['react','react/jsx-runtime'], plugins });
  const m = { exports: {} }; new Function('module','exports','require',b.outputFiles[0].text)(m,m.exports,require); return m.exports;
}
async function main() {
  // These hashes cover every other band/language and the archived lab payloads, not just file names.
  verifyScope(await loadInventory());
  const a = await bundle(`
    export * from './lib/courseContent'; export * from './lib/englishLessonAvailability';
    export * from './lib/englishA1.generated'; export * from './lib/englishA1Scope';
    export * from './lib/englishLearningEngine'; export * from './lib/englishPodcastEpisodes';
    export * from './lib/englishSupplement/content'; export * from './lib/englishSupplement/progress';
    export * from './lib/englishSupplement/assessments'; export * from './lib/courseProgress';
    export * from './lib/courseSnapshot'; export * from './lib/englishStudyState';
  `);
  assert.equal(hash(a.ENGLISH_FOUNDATION_UNITS), before.foundationUnits, 'all Foundation supplement units unchanged');
  assert.equal(hash(a.FOUNDATION_FINAL_CHECK), before.foundationFinal, 'Foundation final assessment unchanged');
  assert.equal(hash(a.PRE_A1_EVIDENCE), before.preA1Evidence, 'all Pre-A1 evidence unchanged');
  assert.equal(hash(a.PODCAST_EPISODES.filter(l=>l.levelId!==1)), before.nonA1Podcast, 'other podcast content/IDs/numbers unchanged');
  assert.equal(hash(Object.fromEntries(Object.entries(a.ENGLISH_A1_CONTENT).map(([id,l])=>[id,l.sentences.map(s=>({id:s.id,en:s.en,fa:s.fa}))]))), before.coreSentences, 'all 1450 English/Persian sentence slots unchanged');
  const core = a.ENGLISH_LEARNER_LESSONS.filter(l=>l.levelId===1);
  assert.deepEqual(core.map(l=>l.id),a.ENGLISH_A1_IDS);
  assert.equal(core.length,29); assert.equal(a.SENTENCE_LESSONS.filter(l=>l.levelId===1).length,37);
  assert.equal(a.ENGLISH_LEARNER_LESSONS.length,a.SENTENCE_LESSONS.length-8);
  assert.equal(a.getEnglishLevelMetrics(1,a.RETIRED_ENGLISH_A1_LAB_IDS).completedLessonCount,0);
  assert.equal(a.getEnglishLevelMetrics(1).lessonCount,29);
  for (const id of a.RETIRED_ENGLISH_A1_LAB_IDS) {
    assert.ok(a.SENTENCE_LESSONS.some(l=>l.id===id), 'historical inventory retained');
    assert.equal(a.getSentenceLesson(id),undefined, 'normal lookup cannot open a retired lab');
    assert.ok(!a.PODCAST_EPISODES.some(p=>p.lessonId===id), 'no podcast speech backdoor');
  }
  for (const l of core) for (const s of l.sentences) {
    assert.ok(!/\b(?:shit|fuck|fucking)\b/i.test(s.en));
    assert.ok(s.vocabulary.every(v=>v.meaning!=='واژهٔ پرتکرار'));
    assert.ok(!s.vocabulary.some(v=>v.word.toLowerCase()==='work on'));
    assert.ok(!s.vocabulary.some(v=>v.word.toLowerCase()==='there' && /^(?:there (?:is|are)|is there|are there)/i.test(s.en)));
  }
  const sentence = (id,en) => a.ENGLISH_A1_CONTENT[id].sentences.find(s=>s.en===en);
  const farewell = sentence('foundation-introducing-yourself','Goodbye, Anna. See you tomorrow.');
  assert.match(farewell.vocabulary.find(v=>v.word==='See you').meaning,/می‌بینمت/);
  assert.match(sentence('survival-travel-and-tickets','What time does the train leave?').vocabulary.find(v=>v.word==='leave').meaning,/حرکت/);
  assert.equal(sentence('survival-cafe-and-food','I would like my drink without sugar.').vocabulary.find(v=>v.word==='drink').meaning,'نوشیدنی');
  assert.equal(sentence('survival-hotel-and-stay','There is no towel in my room.').pattern,'There is no + singular noun');
  // Phase 3 replaces optional listening, not the corrected saved evidence.
  assert.equal(a.ENGLISH_A1_EVIDENCE['foundation-alphabet-and-spelling'].find(t=>t.id.endsWith(':listening')).audio,'T. I. M.');
  assert.match(a.ENGLISH_A1_EVIDENCE['survival-weather-and-seasons'].find(t=>t.id.endsWith(':listening')).audio,/not sunny/);
  assert.equal(a.ENGLISH_A1_EVIDENCE['survival-weather-and-seasons'].find(t=>t.id.endsWith(':reading')).prompt,'آنا کدام فصل را دوست دارد؟');
  assert.equal(a.ENGLISH_A1_CONTENT['foundation-objects-and-places'].dialogue[4].text,'My bag is under the chair. Thank you.');
  const tasks = a.ENGLISH_A1_COURSE_UNITS.flatMap(u=>[...u.practice,...u.checkpoint]);
  assert.ok(tasks.filter(t=>t.options).every(t=>t.skill!=='writing'));
  assert.ok(a.A1_FINAL_CHECK.every(t=>t.skill!=='writing'));
  assert.deepEqual(Object.fromEntries(Object.keys(a.SKILLS).map(s=>[s,a.A1_FINAL_CHECK.filter(t=>t.skill===s).length])),{reading:8,listening:8,writing:0,grammar:16});
  assert.match(a.A1_FINAL_CHECK.find(t=>t.id==='a1-final-l6').prompt,/خواهر/);
  const revised = tasks.filter(t=>t.id.endsWith(':audit-v2'));
  assert.equal(revised.length,4); assert.equal(new Set(tasks.map(t=>t.id)).size,tasks.length);
  const weather = revised.find(t=>t.id.startsWith('a1-weather'));
  assert.ok(a.isCorrect(weather,'بعدازظهر قرار است باران ببارد')); assert.ok(!a.isCorrect(weather,'بارانی است'));
  assert.match(revised.find(t=>t.id.startsWith('a1-travel')).prompt,/شمارهٔ ۴/);
  assert.match(revised.find(t=>t.id.startsWith('a1-free-time')).prompt,/پیشنهاد/);
  assert.match(revised.find(t=>t.id.startsWith('a1-notices')).audio,/until seven/);
  for (const t of [...tasks,...a.A1_FINAL_CHECK]) {
    assert.ok(t.answers.every(answer=>a.isCorrect(t,answer)));
    if(t.options) assert.ok(t.answers.every(answer=>t.options.includes(answer)));
  }
  for (const os of ['web','ios']) {
    globalThis.__auditOS=os;globalThis.__auditDisk.clear();
    const id='lab-en-a1-06', oldLesson=a.SENTENCE_LESSONS.find(l=>l.id===id), sid=oldLesson.sentences[0].id;
    const card={id:`${id}:${sid}`,lessonId:id,sentenceId:sid,dueAt:'2026-01-01T00:00:00Z',intervalDays:9,ease:2.3,repetitions:4,lapses:1};
    const legacy={completedLessonIds:[id],currentLessonId:id,reviewCards:[card],totalMinutes:40};
    assert.ok(a.parseCourseProgressBackup(legacy).completedLessonIds.includes(id),'old backup remains importable');
    globalThis.__auditDisk.set(a.COURSE_PROGRESS_STORAGE_KEY,JSON.stringify(legacy));
    const progress=await a.readLocalProgress();
    assert.ok(progress.completedLessonIds.includes(id)); assert.deepEqual(progress.reviewCards.find(c=>c.id===card.id),card);
    assert.equal((await a.getDueReviewCards()).filter(c=>c.lessonId===id).length,0);
    await assert.rejects(a.setCurrentLesson(id)); await assert.rejects(a.completeSentenceLesson(id));
    const snapshot=await a.loadCourseSnapshot('en');
    assert.ok(snapshot.current && !a.isRetiredEnglishA1Lab(snapshot.current.id));
    assert.equal(snapshot.lessons.filter(l=>l.levelId===1).length,29);
    assert.ok(!snapshot.validCards.some(c=>c.lessonId===id));
    // Old completed units, labels, drafts and answer records survive. New question versions cannot inherit them.
    const p=a.emptyProgress();p.drafts.message='Hi Ben.';
    p.assessmentAttempts=[{id:'legacy-final',level:'A1',startedAt:'2026-11-25T10:00:00Z',completedAt:'2026-11-25T10:10:00Z',answers:Object.fromEntries(a.A1_FINAL_CHECK.map(t=>[t.id,{correct:true,heard:!!t.audio}]))}];
    for(const t of tasks) p.evidence[t.id.replace(':audit-v2','')]={skill:t.options && !t.audio && !t.source?'writing':t.skill,correct:true,heard:!!t.audio,attempts:2};
    const raw=JSON.stringify(p);globalThis.__auditDisk.set(a.SUPPLEMENT_KEY,raw);
    const loaded=await a.loadSupplement();assert.deepEqual(loaded,p);assert.equal(globalThis.__auditDisk.get(a.SUPPLEMENT_KEY),raw);
    assert.equal(a.unitPassed('a1-weather-plans',loaded),false);
    assert.equal(a.unitPassed('a1-travel',loaded),false);
    const writingIds=new Set(tasks.filter(t=>t.skill==='writing').map(t=>t.id));
    assert.equal(a.skillReport(loaded,'writing').answered,writingIds.size,'old MCQ labels do not inflate writing');
    const listening=revised.find(t=>t.audio);
    await assert.rejects(a.recordEvidence(listening,true,false));
    for(const t of revised) await a.recordEvidence(t,true,!!t.audio);
    const updated=await a.loadSupplement();assert.ok(a.unitPassed('a1-weather-plans',updated));assert.ok(a.unitPassed('a1-travel',updated));
    assert.equal(updated.drafts.message,'Hi Ben.');
    assert.deepEqual(updated.assessmentAttempts,p.assessmentAttempts,'historical final attempts stay intact');
    assert.equal(a.assessmentScore(a.latestAssessment(updated,'A1')).percent,100);
    assert.equal(a.assessmentBreakdown(a.latestAssessment(updated,'A1')).find(row=>row.skill==='writing').total,0);
    for(const t of revised) assert.equal(updated.evidence[t.id.replace(':audit-v2','')].attempts,2,'old answers retained');
    const lessonId=a.ENGLISH_A1_IDS[11];
    const session={stage:7,stageVersion:2,sentenceIndex:12,revealed:true,evidencePassed:true,checksRevision:'en-a1-sequenced-assessment-v1',attempt:{id:'old-attempt',generation:1},attemptEvidence:{'en-a1-sequenced-v1:old':true}};
    const studyRaw=JSON.stringify({version:1,sessions:{[lessonId]:session},days:{},lessonEvidence:{[lessonId]:{'en-a1-sequenced-v1:old':{skill:'listening',correct:true,heard:true,attempts:2}}}});
    globalThis.__auditDisk.set(a.STUDY_KEY,studyRaw);
    const study=await a.loadStudy();assert.equal(study.sessions[lessonId].stage,7);assert.equal(study.sessions[lessonId].sentenceIndex,12);
    assert.equal(study.sessions[lessonId].evidencePassed,false);assert.deepEqual(study.sessions[lessonId].attemptEvidence,{});
    assert.equal(study.lessonEvidence[lessonId]['en-a1-sequenced-v1:old'].attempts,2);assert.equal(globalThis.__auditDisk.get(a.STUDY_KEY),studyRaw);
  }
  // Every learner projection imports the active inventory; persistence keeps the full one.
  for(const file of ['app/lang/index.tsx','app/lang/library.tsx','app/review/index.tsx','app/dialogue-room/[language].tsx','components/EnglishLessonRoute.tsx','components/LevelStudioRoutes.tsx','lib/englishLearningEngine.ts','lib/languages/catalog.ts','lib/languages/wordLab.ts','lib/languages/wordLabCore.ts','lib/sharedLevel.ts','lib/englishPodcastQuiz.ts','lib/essential504.ts','lib/emma.ts']) {
    assert.match(fs.readFileSync(file,'utf8'),/ENGLISH_LEARNER_LESSONS as SENTENCE_LESSONS/,`${file}: active projection`);
  }
  // Actual route: all eight retired links (including array params) must stop BEFORE the lazy lesson mounts.
  let opened='';globalThis.__auditRouteMounted=0;
  const route=await bundle(`export {default as Screen} from './app/course/lesson';`,[{name:'route-boundaries',setup(build){
    const mocks={
      'react-native': `export const View='View',Pressable='Pressable',ActivityIndicator='ActivityIndicator';`,
      'expo-router': `export const useLocalSearchParams=()=>globalThis.__auditParams;export const useRouter=()=>({replace:x=>globalThis.__auditReplace(x)});`,
      '@/components/LocalizedText': `export const LocalizedText='Text';`,
    };
    build.onResolve({filter:/.*/},args=>mocks[args.path]?{path:args.path,namespace:'route'}:args.path.includes('components/EnglishLessonRoute')?{path:'lesson',namespace:'route'}:undefined);
    build.onLoad({filter:/.*/,namespace:'route'},args=>({contents:args.path==='lesson'?`import React from 'react';export default function Lesson(){globalThis.__auditRouteMounted++;return React.createElement('Lesson');}`:mocks[args.path]}));
  }}]);
  globalThis.__auditReplace=x=>{opened=x};
  for(const id of a.RETIRED_ENGLISH_A1_LAB_IDS) for(const param of [id,[id]]) {
    globalThis.__auditParams={id:param};let view;
    await act(async()=>{view=create(React.createElement(route.Screen))});
    assert.match(JSON.stringify(view.toJSON()),/سابقه و پیشرفت قبلی شما حذف نشده/);
    await act(async()=>view.root.findByType('Pressable').props.onPress());assert.equal(opened,'/lang/library?level=1');
    await act(async()=>view.unmount());
  }
  assert.equal(globalThis.__auditRouteMounted,0);
  console.log('English A1 audit fixes PASS: 29 active core lessons / 8 quarantined legacy labs; exact 1450 EN/FA slots, other six languages and non-A1 content preserved; corrected glosses/questions/taxonomy, web+native old backups/evidence/resume, 16 rendered retired-link guards.');
}
main().catch(error=>{console.error(error);process.exitCode=1});
