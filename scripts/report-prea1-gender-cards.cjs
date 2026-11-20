const assert=require('node:assert/strict');const es=require('esbuild');
(async()=>{
const {outputFiles}=await es.build({stdin:{contents:`export * from './lib/gender/lesson';export * from './lib/gender/sentence';export * from './lib/gender/russian';export {RUSSIAN_LESSONS} from './lib/languages/russian';`,resolveDir:'/home/user/App'},bundle:true,platform:'node',format:'cjs',write:false,plugins:[{name:'content',setup(b){b.onResolve({filter:/createCourseProgressStore$/},()=>({path:'stub',namespace:'qa'}));b.onLoad({filter:/.*/,namespace:'qa'},()=>({contents:'export const createCourseProgressStore=()=>({})'}));}}]});
const mod={exports:{}};new Function('module','exports',outputFiles[0].text)(mod,mod.exports);const x=mod.exports;
const fold=t=>String(t||'').toLowerCase().replace(/\u0301/g,'').replace(/[^а-яё]/g,'');
const bad=[];
for(const l of x.RUSSIAN_LESSONS.filter(l=>l.levelId===0)){
  const c=x.genderLesson('ru',l); if(!c||!x.russian[l.id]) continue;
  const rows=c.kind==='common'?[c.shared]:[c.masculine,c.feminine,...(c.neuter?[c.neuter]:[])];
  const said=new Set([...(l.sentences||[]),...(l.dialogue||[])].map(s=>fold(s&&s.text)));
  for(const [t] of rows) if(!said.has(fold(t))) bad.push(`${l.id} (${c.kind}) → «${t}»`);
}
console.log('کارت‌های گیرکرده بر خطِ رفتۀ درس:', bad.length);
for(const b of bad) console.log('  '+b);
})().catch(e=>{console.error(e.message)});
