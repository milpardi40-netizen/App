// Count actual bridge writes for the real seven-language level restart and home snapshot paths.
// Storage/backend boundaries are simulated; no claim of physical-device frame timings.
const assert=require('node:assert/strict'),esbuild=require('esbuild'),fs=require('node:fs');
(async()=>{
 const disk=new Map(),ops=[];globalThis.__navDisk=disk;globalThis.__navOps=ops;globalThis.__navOS='android';
 const get=k=>{ops.push(['get',k]);return disk.get(k)??null};
 const set=(k,v)=>{ops.push(['set',k]);if(globalThis.__navFail===k)throw Error('Injected write failure');disk.set(k,v)};
 globalThis.window={localStorage:{getItem:get,setItem:set,removeItem:k=>disk.delete(k)}};
 const b=await esbuild.build({stdin:{contents:`
 export * from './lib/levelRestart';export * as enStudy from './lib/englishStudyState';export * as arStudy from './lib/arabic/studyState';
 export * as trStudy from './lib/languages/turkishStudyState';export * as ruStudy from './lib/languages/russianStudyState';
 export {SENTENCE_LESSONS as en} from './lib/courseContent';export {RUSSIAN_LESSONS as ru} from './lib/languages/russian';export {TURKISH_LESSONS as tr} from './lib/languages/turkish';export {ARABIC_LESSONS as ar} from './lib/arabic/content';export {NEW_COURSES} from './lib/languages/newCourses';
 export {loadCourseSnapshot} from './lib/courseSnapshot';export {assessmentRevisionFor} from './lib/lessonAssessment';export {englishA1ChunkKey} from './lib/englishA1Scope';
 `,resolveDir:process.cwd()},bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'device',setup(build){
 build.onResolve({filter:/^(react-native|@react-native-async-storage\/async-storage)$|supabase$|personalLearningSync$/},a=>({path:a.path.split('/').at(-1),namespace:'mock'}));
 build.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:{
 'react-native':`export const Platform={get OS(){return globalThis.__navOS}};`,
 'async-storage':`export default {async getItem(k){globalThis.__navOps.push(['get',k]);return globalThis.__navDisk.get(k)??null},async setItem(k,v){globalThis.__navOps.push(['set',k]);if(globalThis.__navFail===k)throw Error('Injected write failure');globalThis.__navDisk.set(k,v)},async removeItem(k){globalThis.__navDisk.delete(k)}};`,
 'supabase':`export const supabase={auth:{getSession:async()=>new Promise(()=>{})},from:()=>{throw Error('Navigation must stay local')}};`,
 'personalLearningSync':`export const schedulePersonalLearningSync=()=>{};`,
 }[a.path]}));}}]});
 const m={exports:{}};new Function('module','exports',b.outputFiles[0].text)(m,m.exports);const api=m.exports;
 const stateKey=id=>id==='en'?'english_study_state_v1':id==='ar'?'arabic_study_state_v1':id==='ru'?'russian_lesson_sessions_v1':id==='tr'?'turkish_lesson_sessions_v1':`${id}_starter_lesson_sessions_v1`;
 // The actual English key is exported by its store (not guessed).
 const keyFor=id=>id==='en'?api.enStudy.STUDY_KEY:stateKey(id);
 let scenarios=0;
 for(const os of ['web','android'])for(const id of ['en','ru','tr','de','fr','es','ar'])for(const level of [0,1,4]){
  globalThis.__navOS=os;disk.clear();ops.length=0;
  const lessons=api[id]??api.NEW_COURSES[id].lessons,selected=lessons.filter(l=>l.levelId===level),other=lessons.find(l=>l.levelId===2);
  const key=keyFor(id),old={stage:4,stageVersion:2,sentenceIndex:0,revealed:false,evidencePassed:false,answers:{},showCheckAnswers:false,checksRevision:api.assessmentRevisionFor(id,other.id),updatedAt:'2026-10-01T00:00:00Z'};
  const selectedOld={...old,checksRevision:undefined,attempt:{generation:3,id:'old'},attemptEvidence:{}};
  const original={...(id==='en'||id==='ar'?{version:1,days:{'2026-10-01':100},lessonEvidence:{historic:{q:{skill:'reading',correct:true,heard:true,attempts:1}}}}:{schema:1}),sessions:{[other.id]:old,[selected[0].id]:selectedOld}};
  disk.set(key,JSON.stringify(original));const chunksKey='milo_lesson_chunks_done_v1';disk.set(chunksKey,JSON.stringify({unrelated:[2],[api.englishA1ChunkKey(selected[0].id)]:[1]}));
  const target=await api.prepareLevelRestart(id==='en'?'/course/lesson':`/learn/${id}/lesson`,selected[0].id);
  const saved=JSON.parse(disk.get(key));assert.deepEqual(saved.sessions[other.id],old,id+': other bands untouched');
  for(const l of selected){assert.equal(saved.sessions[l.id].stage,0);assert.equal(saved.sessions[l.id].sentenceIndex,0);assert.equal(saved.sessions[l.id].revealed,false);}
  assert.equal(ops.filter(([op,k])=>op==='set'&&k===key).length,1,id+': exactly ONE primary study write for the whole level');
  assert.equal(ops.filter(([op,k])=>op==='set'&&k===chunksKey).length,1,id+': exactly ONE chunk-map write');
  assert.deepEqual(JSON.parse(disk.get(chunksKey)),{unrelated:[2]});assert.equal(target.params.id,selected[0].id);assert.equal(target.params.fromStart,'1');
  if(id==='en'||id==='ar'){assert.deepEqual(saved.days,original.days);assert.deepEqual(saved.lessonEvidence,original.lessonEvidence);assert.ok(saved.sessions[selected[0].id].attempt.generation>3);}
  if(level===1&&id==='ar')assert.deepEqual(saved.previousA1Sessions[selected[0].id]['legacy:legacy'],JSON.parse(JSON.stringify(selectedOld)));
  if(level===1&&['tr','de','fr','es'].includes(id))assert.ok([...disk.keys()].some(k=>k.includes(':history:'+selected[0].id+':')),'legacy session archive still written');
  // A failed study write must not proceed to chunk deletion/navigation; retry must still work.
  disk.set(key,JSON.stringify(original));const originalRaw=disk.get(key),chunksBefore=disk.get(chunksKey);globalThis.__navFail=key;
  await assert.rejects(api.prepareLevelRestart(id==='en'?'/course/lesson':`/learn/${id}/lesson`,selected[0].id),/Injected/);
  assert.equal(disk.get(key),originalRaw);assert.equal(disk.get(chunksKey),chunksBefore);globalThis.__navFail=undefined;
  await api.prepareLevelRestart(id==='en'?'/course/lesson':`/learn/${id}/lesson`,selected[0].id);scenarios++;
 }
 // Home reads must not wait for the intentionally never-resolving backend.
 globalThis.__navOS='android';disk.clear();
 for(const id of ['en','ru','tr','de','fr','es','ar']){
   let timer;const snap=await Promise.race([api.loadCourseSnapshot(id),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Snapshot blocked on backend')),1500)})]).finally(()=>clearTimeout(timer));
   assert.equal(snap.course.completed,0);assert.equal(snap.id,id);
 }
 assert.ok(fs.readFileSync('app/languages.tsx','utf8').includes('useFocusEffect(useCallback(() => {\n    const stops = ['),'off-screen language prefetch cancels on blur');
 console.log(`Navigation performance passed: ${scenarios} real seven-language/web/native level batches (Pre-A1, A1, B2), one study + one chunk write per batch, preserved other bands/history, failure/retry, seven offline home reads. No content/order/IDs modified.`);
})().catch(e=>{console.error(e);process.exitCode=1});
