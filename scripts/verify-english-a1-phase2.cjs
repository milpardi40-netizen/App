// English A1 phase 2: actual scaffold renderer + transfer/production authoring boundaries.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const esbuild = require('esbuild');
const React = require('react');
const {act, create} = require('react-test-renderer');
const applications = require('../docs/english-a1-design/runtime/applications.json');
const design = require('../docs/english-a1-design/design.json').lessons;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const mocks = {
  'react-native': `export const View='View',Pressable='Pressable';export const StyleSheet={create:x=>x};`,
  '@/components/LocalizedText': `export const LocalizedText='Text';`,
  '@/lib/theme': `export const Typography={fontFamily:'test',boldFontFamily:'test-bold',latinFontFamily:'test-latin'};`,
  '@/lib/format': `export const toPersianDigits=String;`,
};
const textOf = node => node.findAllByType('Text').map(n=>n.children.filter(c=>typeof c==='string').join('')).join('\n');
async function main() {
  const b = await esbuild.build({stdin:{contents:`
    export {default as Scaffold} from './components/EnglishA1Scaffold';
    export * from './lib/englishA1Scaffolding';
    export * from './lib/englishA1Scope'; export * from './lib/englishA1.generated';
  `,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,jsx:'automatic',external:['react','react/jsx-runtime'],plugins:[{name:'view-boundaries',setup(build){
    build.onResolve({filter:/.*/},args=>mocks[args.path]?{path:args.path,namespace:'mock'}:undefined);
    build.onLoad({filter:/.*/,namespace:'mock'},args=>({contents:mocks[args.path]}));
  }}]});
  const m={exports:{}};new Function('module','exports','require',b.outputFiles[0].text)(m,m.exports,require);const a=m.exports;
  assert.deepEqual(Object.keys(a.ENGLISH_A1_SCAFFOLDS),[a.ENGLISH_A1_IDS[8],a.ENGLISH_A1_IDS[20]]);
  assert.equal(a.englishA1Scaffold(a.ENGLISH_A1_IDS[0]),undefined);
  assert.equal(a.englishA1Scaffold('ru-a1-example'),undefined);
  assert.equal(a.ENGLISH_A1_SCAFFOLDS[a.ENGLISH_A1_IDS[8]].steps.length,4);
  assert.equal(a.ENGLISH_A1_SCAFFOLDS[a.ENGLISH_A1_IDS[20]].steps.length,5);
  assert.notEqual(a.ENGLISH_A1_PRODUCTION_REVISION,a.ENGLISH_A1_CONTENT_REVISION);
  assert.equal(a.ENGLISH_A1_ASSESSMENT_REVISION,'en-a1-sequenced-assessment-v2');
  assert.equal(a.ENGLISH_A1_ROOM_REVISION,'en-a1-scene-and-coverage-v2');
  assert.equal(a.englishA1ProductionRevision('non-a1-lesson'),undefined);
  assert.equal(Object.keys(applications).length,29);
  const passages=new Set(), rubrics=new Set();
  for(const id of a.ENGLISH_A1_IDS) {
    const plan=design.find(l=>l.id===id), skill=a.ENGLISH_A1_SKILLS[id].find(t=>t.kind==='reading'), production=a.ENGLISH_A1_PRODUCTION[id];
    assert.deepEqual(skill,applications[id]);
    assert.equal(skill.choices.length,3);assert.equal(new Set(skill.choices).size,3);
    assert.ok(Number.isInteger(skill.correctIndex) && skill.correctIndex>=0 && skill.correctIndex<3);
    assert.ok(skill.passage && skill.promptFa && skill.explanationFa);
    assert.ok(!a.ENGLISH_A1_EVIDENCE[id].some(t=>t.source===skill.passage||t.audio===skill.passage),'optional transfer is not a duplicate of saved evidence');
    passages.add(skill.passage);
    assert.equal(production.writing,plan.writingFa);assert.equal(production.speaking,plan.speakingFa);
    assert.deepEqual(production.checklist,plan.productionSelfCheckFa);
    assert.equal(production.checklist.length,3);rubrics.add(JSON.stringify(production.checklist));
    assert.match(production.writing,/خیالی|غیرواقعی/,'task does not demand disclosure of personal information');
    assert.ok(!/واژهٔ پرتکرار|هدف همین تمرین را/.test(production.checklist.join(' ')));
    assert.equal(a.englishA1ProductionRevision(id),a.ENGLISH_A1_PRODUCTION_REVISION);
    assert.equal(a.englishA1SentenceRevision(id),a.ENGLISH_A1_CONTENT_REVISION,'no sentence/draft revision coupling');
    assert.ok(!/\b(?:fuck|fucking|shit)\b/i.test(skill.passage));
  }
  assert.equal(passages.size,29);assert.equal(rubrics.size,29);
  assert.match(a.ENGLISH_A1_PRODUCTION['survival-renting-a-home'].writing,/آگهی خیالی:/,'room advertisement is present, not an absent external dependency');
  // One visible teaching contrast at a time, error feedback, retrieval with hidden examples,
  // navigation both ways and exact authored speech without a recording/mastery side effect.
  let completedSteps=0;
  for(const [lessonId, scaffold]of Object.entries(a.ENGLISH_A1_SCAFFOLDS)) {
    let view;const spoken=[];
    try {
      await act(async()=>{view=create(React.createElement(a.Scaffold,{lessonId,overviewFa:'FULL OVERVIEW ONLY ON REQUEST',onSpeak:t=>spoken.push(t)}))});
      const button = label => view.root.findAllByType('Pressable').find(p=>p.findAllByType('Text').some(n=>n.children.join('')===label));
      assert.ok(!textOf(view.root).includes('FULL OVERVIEW ONLY ON REQUEST'));
      assert.match(textOf(view.root),/ذخیره نمی‌شوند/);
      assert.match(textOf(view.root),/هر زمان با «ادامه»/,'main lesson remains skippable, not a new gate');
      for(const [index,step]of scaffold.steps.entries()) {
        assert.ok(textOf(view.root).includes(step.titleFa));
        for(const other of scaffold.steps.filter(s=>s!==step)) assert.ok(!textOf(view.root).includes(other.titleFa),'no wall of all rules');
        assert.ok(textOf(view.root).includes(step.examples[0].en));
        const speak=view.root.findAllByType('Pressable').find(p=>p.props.accessibilityLabel===`شنیدن نمونه: ${step.examples[0].en}`);
        await act(async()=>speak.props.onPress());assert.equal(spoken.at(-1),step.examples[0].en);
        await act(async()=>button('نمونه‌ها را پنهان کن و بازیابی کن').props.onPress());
        assert.equal(view.root.findAllByType('Pressable').filter(p=>p.props.accessibilityLabel?.startsWith('شنیدن نمونه:')).length,0);
        assert.ok(textOf(view.root).includes(step.recallFa));
        const choices=()=>view.root.findAllByType('Pressable').filter(p=>p.props.accessibilityRole==='radio');
        await act(async()=>choices()[(step.correctIndex+1)%3].props.onPress());
        assert.ok(textOf(view.root).includes('این گزینه درست نیست.'));
        assert.ok(textOf(view.root).includes(step.feedbackFa));
        if(index<scaffold.steps.length-1) {
          assert.equal(button('گام بعد').props.disabled,true);
          await act(async()=>button('گام بعد').props.onPress());assert.ok(textOf(view.root).includes(step.titleFa));
        }
        await act(async()=>choices()[step.correctIndex].props.onPress());
        assert.ok(textOf(view.root).includes('این پاسخ درست است.'));
        if(index<scaffold.steps.length-1) {assert.equal(button('گام بعد').props.disabled,false);await act(async()=>button('گام بعد').props.onPress());}
        completedSteps++;
      }
      assert.match(textOf(view.root),/تسلط مستقل را ثابت نمی‌کند/);
      await act(async()=>button('گام قبل').props.onPress());
      assert.ok(textOf(view.root).includes(scaffold.steps.at(-2).titleFa));
      await act(async()=>button('گام بعد').props.onPress());
      await act(async()=>button('نقشهٔ کامل درس و تکلیف تولیدی +').props.onPress());
      assert.ok(textOf(view.root).includes('FULL OVERVIEW ONLY ON REQUEST'));
      await act(async()=>button('مرور از گام اول').props.onPress());
      assert.ok(textOf(view.root).includes(scaffold.steps[0].titleFa));
    } finally {if(view) await act(async()=>view.unmount());}
  }
  assert.equal(completedSteps,9);
  let absent;await act(async()=>{absent=create(React.createElement(a.Scaffold,{lessonId:'unknown',overviewFa:'',onSpeak(){}}))});
  assert.equal(absent.toJSON(),null);await act(async()=>absent.unmount());
  const route=fs.readFileSync('components/EnglishLessonRoute.tsx','utf8');
  assert.match(route,/englishA1Scaffold\(lesson.id\) \? <EnglishA1ScaffoldCard key=\{lesson.id\}/);
  assert.match(route,/key=\{`\$\{lesson.id\}-grammar`\}/,'grammar stage also uses the staged view, not a wall of patterns');
  assert.match(route,/contentRevision=\{englishA1ProductionRevision\(lesson.id\)\}/);
  assert.match(route,/headingFa=\{task.kind === 'reading' \? 'تمرین اختیاری · کاربرد در اطلاعات تازه'/);
  console.log('English A1 phase 2 PASS: 4+5 rendered micro-steps with retrieval/error/navigation/speech checks; 29 distinct functional transfer readings; 29 task-specific production rubrics; production-only revision, sentence content revision unchanged.');
}
main().catch(error=>{console.error(error);process.exitCode=1});
