const assert = require('node:assert/strict');
const esbuild = require('esbuild');
const fs = require('node:fs');
async function bundle() {
  const built = await esbuild.build({ stdin: { contents: `
    export * from './lib/courseResume';
    export * from './lib/courseSnapshot';
    export * from './lib/levelRestart';
    export {mergeCourseProgress} from './lib/createCourseProgressStore';
    export * as english from './lib/courseProgress';
    export * as arabic from './lib/arabic/progress';
    export * as russian from './lib/languages/russian';
    export * as turkish from './lib/languages/turkish';
    export {NEW_COURSES} from './lib/languages/newCourses';
    export * as study from './lib/englishStudyState';
  `, resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'cjs', plugins: [{ name: 'device-only', setup(build) {
    build.onResolve({filter: /^react-native$|^@react-native-async-storage\/async-storage$/}, args=>({path:args.path,namespace:'mock'}));
    build.onResolve({filter:/supabase$|personalLearningSync$/}, args=>({path:args.path.endsWith('supabase')?'backend':'sync',namespace:'mock'}));
    build.onLoad({filter:/.*/,namespace:'mock'},args=>({contents: {
      'react-native': `export const Platform={get OS(){return globalThis.__resumeOS}};`,
      '@react-native-async-storage/async-storage': `export default {async getItem(k){return globalThis.__resumeStorage.get(k)??null},async setItem(k,v){globalThis.__resumeStorage.set(k,v)},async removeItem(k){globalThis.__resumeStorage.delete(k)}};`,
      backend: `export const supabase=null;`,
      sync: `export const schedulePersonalLearningSync=()=>{};`,
    }[args.path]}));
  }}] });
  const mod = {exports:{}};new Function('module','exports',built.outputFiles[0].text)(mod,mod.exports);return mod.exports;
}
(async()=>{
  globalThis.__resumeStorage=new Map();
  globalThis.window={localStorage:{getItem:k=>globalThis.__resumeStorage.get(k)??null,setItem:(k,v)=>globalThis.__resumeStorage.set(k,v),removeItem:k=>globalThis.__resumeStorage.delete(k)}};
  let checks=0;
  for(const os of ['android','web']) {
    globalThis.__resumeOS=os;globalThis.__resumeStorage.clear();
    const api=await bundle();
    for(const language of ['en','ru','tr','ar','de','fr','es']) {
      const snapshot=await api.loadCourseSnapshot(language);
      const lessons=snapshot.lessons.filter(l=>l.levelId===1);
      const store=language==='en'?{getCourseProgress:api.english.readLocalProgress,setCurrentLesson:api.english.setCurrentLesson,completeSentenceLesson:api.english.completeSentenceLesson}:language==='ar'?{getCourseProgress:api.arabic.getArabicProgress,setCurrentLesson:api.arabic.setArabicCurrentLesson,completeSentenceLesson:api.arabic.completeArabicLesson}:language==='ru'?api.russian.russianProgress:language==='tr'?api.turkish.turkishProgress:api.NEW_COURSES[language].progress;
      const n=Math.min(20,lessons.length-2);
      for(let i=0;i<n;i++)await store.completeSentenceLesson(lessons[i].id,lessons[i+1].id);
      await store.setCurrentLesson(lessons[n].id);
      const before=await store.getCourseProgress();
      const path=language==='en'?'/course/lesson':`/learn/${language}/lesson`;
      await api.prepareLevelRestart(path,lessons[0].id);
      // A fresh module (app killed/reopened), not an in-memory selector, must reopen the replay.
      const reopened=await bundle();
      let next=await reopened.loadCourseSnapshot(language);
      assert.equal(next.current.id,lessons[0].id,os+language+': restart wins over old completion');checks++;
      assert.equal(next.resumeForLevel(1).id,lessons[0].id);checks++;
      assert.deepEqual(new Set(next.progress.completedLessonIds),new Set(before.completedLessonIds),'history retained');checks++;
      await store.completeSentenceLesson(lessons[0].id,lessons[1].id);
      next=await reopened.loadCourseSnapshot(language);
      assert.equal(next.resumeForLevel(1).id,lessons[1].id,'replay goes to lesson two, not historical lesson twenty');checks++;
      const other=next.lessons.find(l=>l.levelId===2);
      await store.setCurrentLesson(other.id);
      next=await reopened.loadCourseSnapshot(language);
      assert.equal(next.current.id,other.id);checks++;
      assert.equal(next.resumeForLevel(1).id,lessons[1].id,'other levels cannot erase this level cursor');checks++;
      await store.completeSentenceLesson(lessons[1].id,lessons[2].id);
      next=await reopened.loadCourseSnapshot(language);
      assert.equal(next.resumeForLevel(1).id,lessons[2].id,'replay also advances after visiting another level');checks++;
      const newerActivity={...before,updatedAt:'2099-01-01T00:00:00.000Z'};
      const merged=api.mergeCourseProgress(next.progress,newerActivity);
      assert.equal(api.courseResumeLesson(lessons,merged,{}).id,lessons[2].id,'unrelated newer activity cannot resurrect an older cursor');checks++;
    }
  }
  const api=await bundle();
  const lessons=[{id:'a'},{id:'b'},{id:'c'}];
  const progress={completedLessonIds:['a'],currentLessonId:'a',resumeUpdatedAt:'2026-11-01T10:00:00Z'};
  assert.equal(api.courseResumeLesson(lessons,progress,{c:{stage:0,sentenceIndex:0,updatedAt:'2026-11-01T11:00:00Z'}}).id,'a','bulk reset timestamps are not learning');checks++;
  assert.equal(api.courseResumeLesson(lessons,progress,{b:{stage:3,sentenceIndex:0,updatedAt:'2026-11-01T11:00:00Z'}}).id,'b','real later unfinished work remains resumable');checks++;
  assert.deepEqual(api.validResumePoints({a:'bad',b:'2026-11-01T00:00:00Z',unknown:'2026-11-01T00:00:00Z'},lessons),{b:'2026-11-01T00:00:00Z'});checks++;
  for(const file of ['app/lang/library.tsx','components/RussianLibrary.tsx','components/TurkishLibrary.tsx','components/StarterLibrary.tsx','components/arabic/ArabicLibraryScreen.tsx']){assert.ok(fs.readFileSync(file,'utf8').includes('snapshot?.resumeForLevel(selected.id)'));checks++;}
  console.log(`Level resume: ${checks} checks passed; seven real courses on web/native, 20-lesson history → restart → cold reopen → sequential replay, cross-level and sync isolation.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
