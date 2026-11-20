const assert=require('node:assert/strict');
const es=require('esbuild');
(async()=>{
const {outputFiles}=await es.build({stdin:{contents:`export * from './lib/gender/lesson';export * from './lib/gender/sentence';export * from './lib/gender/english';export * from './lib/gender/russian';export {SENTENCE_LESSONS} from './lib/courseContent';export {RUSSIAN_LESSONS} from './lib/languages/russian';`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,plugins:[{name:'content',setup(b){b.onResolve({filter:/createCourseProgressStore$/},()=>({path:'stub',namespace:'qa'}));b.onLoad({filter:/.*/,namespace:'qa'},()=>({contents:'export const createCourseProgressStore=()=>({})'}));}}]});
const mod={exports:{}};new Function('module','exports',outputFiles[0].text)(mod,mod.exports);const x=mod.exports;
for(const [lang,db,authored] of [['en',x.SENTENCE_LESSONS,x.english],['ru',x.RUSSIAN_LESSONS,x.russian]]){
 const ids=new Set(db.map(l=>l.id));for(const id of Object.keys(authored))assert(ids.has(id),id);
 let count=0;for(const l of db){const c=x.genderLesson(lang,l);if(l.levelId===0)assert(c,l.id);if(!c)continue;count++;
 const rows=c.kind==='common'?[c.shared]:[c.masculine,c.feminine,...(c.neuter?[c.neuter]:[])];assert.equal(new Set(rows.map(r=>r[0])).size,rows.length);assert(rows.every(([t,f])=>t.trim()&&/[\u0600-\u06ff]/.test(f)));if(l.levelId===0)assert(rows.every(([t])=>t.split(' ').length<=5));
 // A level-0 card must quote a line the learner actually meets in that lesson: when a step is rewritten,
 // its card travels with it, instead of pointing at a sentence that left the course.
 const fold=t=>t.toLowerCase().replace(/\u0301/g,'').replace(/\u0401/g,'\u0435').replace(/[^а-яё]/g,'');
 if(l.levelId===0&&authored[l.id]){const said=new Set([...(l.sentences||[]),...(l.dialogue||[])].map(se=>fold(se&&se.text||'')));
  for(const [t] of rows)assert(said.has(fold(t)),`${l.id}: card line «${t}» is not in this lesson`);} }
 console.log(`${lang}: ${count} linked lesson cards`);
}
for(const [t,expected] of [['Я немно́го уста́ла.','مؤنث'],['Я потеря́л ключ.','مذکر'],['Ты гото́ва?', 'مؤنث']]) assert(x.sentenceGender('ru',t).startsWith(expected));
assert.equal(x.sentenceGender('ru','Моя́ вода́.'),undefined);assert(x.sentenceGender('en','I am a teacher.').startsWith('مشترک'));assert(x.sentenceGender('en','Her name is Laleh.').includes('صاحب'));assert.equal(x.sentenceGender('en','Here is a pen.'),undefined);
})().catch(e=>{console.error(e);process.exitCode=1});
