// Real phase-3 views; only device speech, native primitives and persistence are simulated.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const esbuild = require('esbuild');
const React = require('react');
const {act, create} = require('react-test-renderer');
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.__phase3Speech = [];
globalThis.__phase3Writes = 0;
const mocks = {
  'react-native': `export const View='View',Pressable='Pressable'; export const StyleSheet={create:x=>x};`,
  '@/components/LocalizedText': `export const LocalizedText='Text',LocalizedTextInput='TextInput';`,
  '@/lib/theme': `export const Typography={},Colors={primary:{500:'#5146E5',700:'#3730A3'},accent:{500:'#0EAA83'}},DESIGN_VARIANT='test';`,
  '@/lib/courseSpeech': `export const stop=async()=>{};export const speak=(text,options)=>globalThis.__phase3Speech.push({text,options});`,
  '@/lib/speechLanguage': `export const speechTagFor=x=>x;`,
  '@/lib/englishSupplement/progress': `export const recordEvidence=async()=>{globalThis.__phase3Writes++;throw Error('optional practice must not persist')};`,
};
const text = view => view.root.findAllByType('Text').map(n=>n.children.filter(c=>typeof c==='string').join('')).join('\n');
const buttons = view => view.root.findAllByType('Pressable');
const button = (view,label) => buttons(view).find(n=>n.findAllByType('Text').some(t=>t.children.join('')===label));
const click = async node => {assert.ok(node,'button exists');await act(async()=>{await node.props.onPress();});};
const hash = v => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
async function main() {
  const built=await esbuild.build({stdin:{contents:`
    export {default as Listening} from './components/EnglishA1ListeningTransfer';
    export {default as Interaction} from './components/EnglishA1Interaction';
    export * from './components/EnglishA1Support'; export * from './lib/englishA1SupplementMap';
    export * from './lib/englishA1Interactions'; export * from './lib/englishA1.generated';
    export * from './lib/englishA1Scope'; export * from './lib/englishSupplement/content';
  `,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,jsx:'automatic',external:['react','react/jsx-runtime'],plugins:[{name:'devices',setup(build){
    build.onResolve({filter:/.*/},args=>mocks[args.path]?{path:args.path,namespace:'mock'}:undefined);
    build.onLoad({filter:/.*/,namespace:'mock'},args=>({contents:mocks[args.path]}));
  }}]});
  const m={exports:{}};new Function('module','exports','require',built.outputFiles[0].text)(m,m.exports,require);const a=m.exports;
  for(const [key,expected] of Object.entries(require('./fixtures/english-a1-phase2-preserved.json'))) assert.equal(hash(a[key]),expected,`${key} unchanged from completed phase 2`);
  const authored=require('../docs/english-a1-design/runtime/listeningApplications.json');
  assert.equal(Object.keys(authored).length,29);
  const passages=new Set();
  let listeningCount=0, interactionRuns=0, previews=0;
  for(const id of a.ENGLISH_A1_IDS) {
    const task=a.ENGLISH_A1_SKILLS[id].find(t=>t.kind==='listening');
    assert.deepEqual(task,authored[id]);assert.equal(task.choices.length,3);assert.equal(new Set(task.choices).size,3);
    assert.ok(task.correctIndex>=0&&task.correctIndex<3&&Number.isInteger(task.correctIndex));
    assert.ok(!a.ENGLISH_A1_EVIDENCE[id].some(t=>t.audio===task.passage||t.source===task.passage),'fresh passage, not saved evidence');
    passages.add(task.passage);
    let view;
    try {
      await act(async()=>{view=create(React.createElement(a.Listening,{lessonId:id,task}));});
      await click(buttons(view)[0]);
      assert.ok(!text(view).includes(task.passage));
      assert.ok(button(view,'بررسی پاسخ').props.disabled);
      // Choosing an answer is not enough: real task handler refuses before complete playback.
      await click(buttons(view).filter(n=>n.props.accessibilityRole==='radio')[task.correctIndex]);
      await click(button(view,'بررسی پاسخ'));
      assert.ok(!text(view).includes(task.passage));
      await click(button(view,'شنیدن سؤال'));
      const utterance=globalThis.__phase3Speech.at(-1);
      assert.equal(utterance.text,task.passage);assert.equal(utterance.options.rate,1);
      await act(async()=>utterance.options.onError());
      assert.ok(button(view,'بررسی پاسخ').props.disabled,'failed playback does not count');
      assert.match(text(view),/صدا کامل پخش نشد/);
      await click(button(view,'شنیدن آهسته'));assert.equal(globalThis.__phase3Speech.at(-1).options.rate,0.5);
      await act(async()=>globalThis.__phase3Speech.at(-1).options.onDone());
      const radios=buttons(view).filter(n=>n.props.accessibilityRole==='radio');
      await click(radios[(task.correctIndex+1)%3]);await click(button(view,'بررسی پاسخ'));
      assert.match(text(view),/دوباره تلاش کنید/);assert.ok(!text(view).includes(task.passage));
      await click(radios[task.correctIndex]);await click(button(view,'بررسی پاسخ'));
      assert.ok(text(view).includes(task.passage));assert.ok(text(view).includes(task.explanationFa));
      await click(buttons(view)[0]);await click(buttons(view)[0]);
      assert.ok(!text(view).includes(task.passage),'closing resets optional state');
      assert.ok(button(view,'بررسی پاسخ').props.disabled);
      listeningCount++;
    } finally {if(view)await act(async()=>view.unmount());}
  }
  assert.equal(passages.size,29);
  assert.deepEqual(a.ENGLISH_A1_SUPPLEMENT_MAP.map(x=>x.unitId).sort(),a.ENGLISH_A1_COURSE_UNITS.map(x=>x.id).sort());
  assert.equal(new Set(a.ENGLISH_A1_SUPPLEMENT_MAP.map(x=>x.unitId)).size,20);
  for(const item of a.ENGLISH_A1_SUPPLEMENT_MAP){
    assert.ok(a.ENGLISH_A1_IDS.includes(item.afterLessonId));
    assert.ok(['prepare','review','extend'].includes(item.role));
    assert.ok(item.relatedLessonIds.every(id=>a.ENGLISH_A1_IDS.includes(id)));
    assert.ok(item.reasonFa.length>30);
    const target=a.englishA1SupportPreview(item.unitId);assert.ok(target);
    let view;const core=[],speech=[];let courses=0;
    try {
      await act(async()=>{view=create(React.createElement(a.EnglishA1SupportPreview,{unitId:item.unitId,onOpenCore:id=>core.push(id),onOpenCourse:()=>courses++,onSpeak:t=>speech.push(t)}));});
      assert.ok(text(view).includes(item.reasonFa));
      assert.match(text(view),/فقط مرور آموزش/);
      assert.equal(buttons(view).filter(n=>n.props.accessibilityRole==='radio').length,0,'preview has no evidence form');
      for(const section of target.unit.teaching)assert.ok(text(view).includes(section.example));
      const plays=buttons(view).filter(n=>n.props.accessibilityLabel?.startsWith('شنیدن آموزش:'));
      assert.equal(plays.length,target.unit.teaching.length);for(const play of plays)await click(play);
      assert.equal(speech.length,plays.length);
      await click(button(view,'بازکردن درس پیشنهادی مسیر اصلی'));assert.deepEqual(core,[item.afterLessonId]);
      await click(button(view,'مسیر تمرین مکمل با شرایط قبلی'));assert.equal(courses,1);previews++;
    }finally{if(view)await act(async()=>view.unmount());}
  }
  for(const id of a.ENGLISH_A1_IDS){
    let view;const opened=[];
    try{
      await act(async()=>{view=create(React.createElement(a.EnglishA1SupportLinks,{lessonId:id,onOpen:id=>opened.push(id)}));});
      const expected=a.englishA1SupportForLesson(id);assert.equal(buttons(view).length,expected.length);
      for(const b of buttons(view))await click(b);assert.deepEqual(opened,expected.map(x=>x.unitId));
    }finally{if(view)await act(async()=>view.unmount());}
  }
  assert.equal(a.englishA1SupportForLesson('ru-a1-example').length,0);
  assert.equal(a.englishA1SupportForLesson('foundation-1').length,0);
  assert.equal(a.englishA1SupportForUnit('foundation-1'),undefined);
  assert.equal(a.englishA1SupportPreview('unknown'),undefined);
  assert.equal(a.englishA1SupportForUnit('a1-weather-plans').afterLessonId,a.ENGLISH_A1_IDS[20]);
  for(const [id,task]of Object.entries(a.ENGLISH_A1_INTERACTIONS)){
    assert.ok(a.ENGLISH_A1_IDS.includes(id));assert.equal(task.branches.length,2);assert.equal(task.checksFa.length,3);
    for(let branch=0;branch<2;branch++){
      let view;const spoken=[];
      try{
        await act(async()=>{view=create(React.createElement(a.Interaction,{lessonId:id,onSpeak:(...args)=>spoken.push(args)}));});
        await click(buttons(view)[0]);assert.ok(!text(view).includes(task.first.example));
        assert.match(text(view),/صدایت را نمی‌شنود/);
        await click(button(view,'شنیدن مخاطب'));await click(button(view,'دوباره و آهسته'));
        assert.deepEqual(spoken,[[task.first.text,1],[task.first.text,0.5]]);
        await click(button(view,'پاسخ اول را گفتم؛ دیدن یک نمونه'));assert.ok(text(view).includes(task.first.example));
        await click(button(view,task.branches[branch].labelFa));assert.ok(text(view).includes(task.branches[branch].text));
        const exactExamples = () => view.root.findAllByType('Text').filter(n=>n.children.join('')===task.branches[branch].example).length;
        const beforeExample = exactExamples();
        await click(button(view,'پاسخ دوم را گفتم؛ دیدن یک نمونه'));assert.equal(exactExamples(),beforeExample+1);
        const checks=buttons(view).filter(n=>n.props.accessibilityRole==='checkbox');assert.equal(checks.length,3);
        await click(checks[0]);assert.equal(checks[0].props.accessibilityState.checked,true);
        await click(button(view,'تمرین دوباره با مسیر دیگر'));assert.ok(!text(view).includes(task.first.example));
        assert.equal(buttons(view).filter(n=>n.props.accessibilityRole==='checkbox').length,0);interactionRuns++;
      }finally{if(view)await act(async()=>view.unmount());}
    }
  }
  for(const id of ['non-a1','foundation-introducing-yourself']) {
    let view;await act(async()=>{view=create(React.createElement(a.Interaction,{lessonId:id,onSpeak(){}}));});assert.equal(view.toJSON(),null);await act(async()=>view.unmount());
  }
  assert.equal(globalThis.__phase3Writes,0,'no optional activity writes to evidence/drafts/history');
  const route=fs.readFileSync('components/EnglishLessonRoute.tsx','utf8');
  assert.match(route,/stage === 9 && isEnglishA1Core\(lesson.id\) && <EnglishA1Interaction/);
  assert.match(route,/stage === 0 && isEnglishA1Core\(lesson.id\) && <EnglishA1SupportLinks/);
  assert.match(route,/task.kind === 'listening' && isEnglishA1Core\(lesson.id\)[\s\S]*?<EnglishA1ListeningTransfer/);
  const screen=fs.readFileSync('app/lang/a1-support.tsx','utf8');
  assert.match(screen,/pathname:'\/course\/lesson',params:\{id\}/);assert.match(screen,/stopResponsiveSpeech/);
  assert.ok(!/recordEvidence|saveDraft|saveChecklist|canOpenUnit/.test(screen));
  const supplement=fs.readFileSync('app/lang/supplement.tsx','utf8');
  assert.match(supplement,/open = canOpenUnit\(item.id, p\)/);assert.match(supplement,/disabled=\{!open\}/);
  console.log(`English A1 phase 3 passed: ${listeningCount} real fresh-listening renders (failed/completed audio, wrong/correct answers, reset); ${previews} read-only supplement previews and all 29 lesson link groups; ${interactionRuns} scripted branch rehearsals; zero optional writes; phase-2 core/evidence/production hashes preserved.`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
