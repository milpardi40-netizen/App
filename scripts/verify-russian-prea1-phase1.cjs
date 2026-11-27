// Russian Pre-A1 phase 1: reviewed corrections, actual screen/room rendering and storage isolation.
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const esbuild = require('esbuild');
const {loadInventory} = require('./helpers/practical-inventory.cjs');
const {verifyApprovedRussianPreA1} = require('./helpers/approved-russian-prea1.cjs');
const before = require('./fixtures/russian-prea1-phase1-before.json');
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const {phase1Pre}=require('./helpers/approved-russian-prea1.cjs');
const lightId='ru-pre-12-verbs';
const teensId = 'ru-pre-29-numbers-teens';
async function main() {
  const inventory = await loadInventory();
  verifyApprovedRussianPreA1(inventory.ru);
  for(const [language,lessons] of Object.entries(inventory)) {
    assert.equal(digest(language==='ru'?lessons.filter(l=>l.levelId!==0):lessons),before.protected[language],`${language}: every out-of-scope lesson is byte-identical`);
  }
  const built = await esbuild.build({stdin:{contents:`
    export * from './lib/languages/russianA1Practice';
    export * from './lib/languages/russianPersianBridge';
    export * from './lib/lessonAssessment';
  `,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false});
  const mod={exports:{}};new Function('module','exports',built.outputFiles[0].text)(mod,mod.exports);
  const api=mod.exports;
  assert.equal(digest(inventory.ru.filter(l=>l.levelId!==0).map(api.russianLessonRoomPairs)),before.rooms,'A1 and higher room payloads unchanged');
  assert.equal(digest(phase1Pre(inventory.ru).flatMap(l=>l.sentences.map(s=>api.bridgeFor(s)))),before.bridges,'unscoped bridge payloads unchanged, including higher levels');
  const pre=inventory.ru.filter(l=>l.levelId===0);
  for(const lesson of require('./helpers/approved-russian-prea1.cjs').phase2Pre(pre)) {
    const old=before.pre.find(l=>l.id===lesson.id);
    assert.deepEqual(lesson.dialogue,old.dialogue,'all 31 original authored scenes retained');
    if(lesson.id!==teensId&&lesson.id!==lightId)assert.deepEqual(lesson.checks,old.checks,'only the teens authored question changes');
    for(const [i,sentence] of lesson.sentences.entries()) {
      if(lesson.id!==teensId&&lesson.id!==lightId) assert.equal(sentence.text,old.sentences[i].text,'no curriculum rewrite in phase 1');
    }
    assert.equal(api.assessmentRevisionFor('ru',lesson.id),require('./fixtures/russian-prea1-phase3-approved.json').contexts.some(d=>d.id===lesson.id&&JSON.stringify(d.before.checks)!==JSON.stringify(d.after.checks))?'ru-pre-a1-self-contained-contexts-v1':lesson.id===lightId?'ru-pre-a1-light-verbs-checks-v1':lesson.id===teensId?'ru-pre-a1-teens-stress-v1':api.LESSON_ASSESSMENT_REVISION);
  }
  const teens=pre.find(l=>l.id===teensId);
  assert.ok(teens.sentences[1].text.includes('двена́дцать') && teens.sentences[1].text.includes('трина́дцать'));
  assert.ok(teens.sentences[2].text.includes('четы́рнадцать'),'14 already had the right stress: do NOT move it to на');
  assert.ok(!/две́надцать|три́надцать/i.test(JSON.stringify(teens)),'no stale stress in text, vocabulary or authored answers');
  const question=teens.checks.find(q=>q.promptFa.includes('«دوازده»'));
  assert.equal(question.choices[question.correctIndex],'Двена́дцать.');
  assert.ok(!/две́надцать|три́надцать/i.test(JSON.stringify(api.expandedChoiceChecks(teens))));
  for(const [text,id,pattern]of [
    ['У меня есть текст.','have',/نبودن فعل/],
    ['У меня текст.','have-short',/کل جمله/],
    ['Мне нравится чай.','dative-feel',/«чай» فاعل دستوری/],
    ['Это дом.','eto',/معمولاً/],
    ['Я студент.','copula',/معمولاً/],
    ['Я не знаю.','negation',/واژه‌ای جدا/],
    ['Я иду.','motion',/جملهٔ کاملی/],
  ]) {
    const corrected=api.bridgeFor({text,fa:''},true).rule;
    assert.equal(corrected.id,id);assert.match(corrected.note,pattern);
    assert.notEqual(corrected.note,api.bridgeFor({text,fa:''}).rule.note,'correction only when Pre-A1 scope is requested');
  }
  const possession=pre.flatMap(l=>l.sentences).filter(s=>s.text.startsWith('У меня́'));
  for(const s of possession)for(const word of s.vocabulary)if(word.word==='Меня́')assert.notEqual(word.meaning,'مرا');
  const naming=pre.find(l=>l.id==='ru-pre-13-greeting-name-phrases').sentences.find(s=>s.text==='Меня́ зову́т Али́.');
  assert.ok(naming.vocabulary.some(w=>w.word==='Меня́'&&w.meaning==='مرا'),'accusative gloss remains valid in the naming pattern');

  // Shared runner evaluates the REAL RussianLesson JSX props, then executes the REAL room.
  // Native views, speech callbacks and disk are simulated; no claim about actual device audio.
  await require('./audit-russian-prea1.cjs').main({verifyPhase1:true,output:'reports/russian-prea1-phase2-metrics.json'});

  const app=await require('./helpers/practical-storage.cjs').modules();
  globalThis.__practicalMemory=new Map();
  globalThis.window={localStorage:{getItem:k=>globalThis.__practicalMemory.get(k)??null,setItem:(k,v)=>globalThis.__practicalMemory.set(k,v)}};
  const base={stage:7,stageVersion:2,sentenceIndex:2,revealed:true,answers:{0:1,3:2},showCheckAnswers:true};
  let restores=0;
  for(const os of ['web','android']) {
    globalThis.__practicalOS=os;
    for(const revision of [undefined,'ru-pre-a1-practical-v6',api.LESSON_ASSESSMENT_REVISION]) {
      const sessions=Object.fromEntries(pre.map(l=>[l.id,{...base,checksRevision:l.id===teensId?revision:api.assessmentRevisionFor('ru',l.id)}]));
      const raw=JSON.stringify({schema:1,sessions});
      globalThis.__practicalMemory.set(app.ru.RUSSIAN_STUDY_STORAGE_KEY,raw);
      for(const lesson of pre) {
        const restored=await app.ru.loadRussianLessonSession(lesson.id);
        assert.equal(restored.stage,base.stage);assert.equal(restored.sentenceIndex,base.sentenceIndex);
        assert.equal(restored.revealed,true);
        assert.deepEqual(restored.answers,lesson.id===teensId?{}:base.answers);
        assert.equal(restored.showCheckAnswers,lesson.id!==teensId);
        restores++;
      }
      assert.equal(globalThis.__practicalMemory.get(app.ru.RUSSIAN_STUDY_STORAGE_KEY),raw,'reads never rewrite historical sessions');
      const current={...base,checksRevision:api.assessmentRevisionFor('ru',teensId)};
      await app.ru.saveRussianLessonSession(teensId,current);
      assert.deepEqual((await app.ru.loadRussianLessonSession(teensId)).answers,base.answers,'new answers survive a save/reload');
      const saved=JSON.parse(globalThis.__practicalMemory.get(app.ru.RUSSIAN_STUDY_STORAGE_KEY));
      for(const lesson of pre.filter(l=>l.id!==teensId))assert.deepEqual(saved.sessions[lesson.id],sessions[lesson.id],'all other raw sessions preserved');
    }
    const historical={assessment:{correct:5,total:5,at:'2026-11-25T12:00:00Z',contentRevision:api.LESSON_ASSESSMENT_REVISION}};
    const key=`ru:${teensId}`,other=`ru:${pre[0].id}`;
    const raw=JSON.stringify({[key]:historical,[other]:historical});
    globalThis.__practicalMemory.set('milo_lesson_outcomes_v1',raw);
    assert.equal((await app.outcomes.getLessonOutcome('ru',teensId)).assessment,undefined);
    assert.equal((await app.outcomes.getLessonOutcome('ru',pre[0].id)).assessment.correct,5);
    assert.equal(globalThis.__practicalMemory.get('milo_lesson_outcomes_v1'),raw);
    await app.outcomes.saveLessonOutcome('ru',teensId,{assessment:{correct:4,total:5,at:'2026-11-26T12:00:00Z'}});
    const saved=JSON.parse(globalThis.__practicalMemory.get('milo_lesson_outcomes_v1'));
    assert.deepEqual(saved[`${key}:previous:${api.LESSON_ASSESSMENT_REVISION}`],historical,'old assessment is archived before a new save');
    assert.deepEqual(saved[other],historical);
    assert.equal((await app.outcomes.getLessonOutcome('ru',teensId)).assessment.correct,4);
  }
  console.log(`Russian Pre-A1 phase 1 PASS: 31 contiguous scenes, 62 actual room runs / 628 learner targets, original IDs and scenes, ${restores} web/native session restores, old room/assessment history retained; all seven out-of-scope inventories and higher-level room/bridge payloads unchanged.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
