const assert=require('node:assert/strict');
const esbuild=require('esbuild');
globalThis.__levelOps=[];
const stubs={
  englishStudyState:`export const resetLessonSessions=async ids=>{globalThis.__levelOps.push(['batch',ids]);for(const id of ids)globalThis.__levelOps.push(['reset',id]);};`,
  russianStudyState:`export const resetRussianLessonSessions=async ids=>{globalThis.__levelOps.push(['batch',ids]);for(const id of ids)globalThis.__levelOps.push(['reset',id]);};`,
  turkishStudyState:`export const resetTurkishLessonSessions=async ids=>{globalThis.__levelOps.push(['batch',ids]);for(const id of ids)globalThis.__levelOps.push(['reset',id]);};`,
  'arabic/studyState':`export const resetArabicLessonSessions=async ids=>{globalThis.__levelOps.push(['batch',ids]);for(const id of ids)globalThis.__levelOps.push(['reset',id]);};`,
  courseProgress:`export const setCurrentLesson=async id=>{globalThis.__levelOps.push(['pointer',id]);};`,
  'arabic/progress':`export const setArabicCurrentLesson=async id=>{globalThis.__levelOps.push(['pointer',id]);};`,
  createCourseProgressStore:`export const createCourseProgressStore=()=>({setCurrentLesson:async id=>{globalThis.__levelOps.push(['pointer',id]);}});`,
  starterSessions:`export const createStarterSessions=()=>({resetStarterLessonSessions:async ids=>{globalThis.__levelOps.push(['batch',ids]);for(const id of ids)globalThis.__levelOps.push(['reset',id]);}});`,
  lessonChunks:`export const resetLessonChunks=async id=>{globalThis.__levelOps.push(['chunks',id]);};export const resetLessonsChunks=async ids=>{globalThis.__levelOps.push(['batch-chunks',ids]);for(const id of ids)globalThis.__levelOps.push(['chunks',id]);};`,
};
(async()=>{
 const result=await esbuild.build({stdin:{contents:`export * from './lib/levelRestart';export {SENTENCE_LESSONS as en} from './lib/courseContent';export {RUSSIAN_LESSONS as ru} from './lib/languages/russian';export {TURKISH_LESSONS as tr} from './lib/languages/turkish';export {ARABIC_LESSONS as ar} from './lib/arabic/content';export {NEW_COURSES} from './lib/languages/newCourses';`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,plugins:[{name:'reset-spies',setup(b){b.onResolve({filter:/.*/},a=>{const key=Object.keys(stubs).find(key=>a.path.endsWith('/'+key));return key?{path:key,namespace:'mock'}:undefined;});b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:stubs[a.path],loader:'js'}));}}]});
 const mod={exports:{}};new Function('module','exports',result.outputFiles[0].text)(mod,mod.exports);const api=mod.exports;
 for(const language of ['en','ru','tr','ar','de','fr','es']){
   const lessons=api[language]??api.NEW_COURSES[language].lessons;
   const selected=lessons.find(l=>l.levelId===2);assert.ok(selected,language);
   const expected=lessons.filter(l=>l.levelId===selected.levelId).map(l=>l.id);
   globalThis.__levelOps=[];
   const target=await api.prepareLevelRestart(language==='en'?'/course/lesson':`/learn/${language}/lesson`,selected.id);
   assert.deepEqual(globalThis.__levelOps.filter(o=>o[0]==='reset').map(o=>o[1]),expected,language+': resets all and only selected level attempts');
   assert.deepEqual(globalThis.__levelOps.filter(o=>o[0]==='pointer'),[['pointer',expected[0]]]);
   assert.equal(target.params.id,expected[0]);assert.equal(target.params.fromStart,'1');assert.ok(target.params.restartToken);
   const chunkIds=globalThis.__levelOps.filter(o=>o[0]==='chunks').map(o=>o[1]);
   assert.deepEqual(chunkIds,expected);
   assert.equal(globalThis.__levelOps.filter(o=>o[0]==='batch').length,1);
   assert.equal(globalThis.__levelOps.filter(o=>o[0]==='batch-chunks').length,1);
   console.log(`${language}: ${expected.length} selected-level attempts reset; other bands untouched`);
 }
 globalThis.__levelOps=[];await assert.rejects(()=>api.prepareLevelRestart('/learn/ru/lesson','not-a-lesson'));assert.deepEqual(globalThis.__levelOps,[]);
 console.log('Seven-language level restart dispatch passed with real course inventories and reset/pointer spies. No all-progress clear API is called.');
})().catch(e=>{console.error(e);process.exitCode=1;});
