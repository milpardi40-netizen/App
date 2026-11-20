// Exercise the actual compiled curriculum, branch resolver, offline catalogue and persisted attempts.
const assert = require('node:assert/strict');
const path = require('node:path');
const es = require('esbuild');
(async () => {
  const modules = ['russian', 'russianPreA1', 'russianStudyState', 'russianExchange', 'russianGrammar/catalog', 'russianGrammar/units', 'russianStarterRounds'];
  const result = await es.build({ stdin: { contents: modules.map(m => `export * from './lib/languages/${m}'`).join(';'), resolveDir: process.cwd() },
    platform: 'node', format: 'cjs', bundle: true, write: false, plugins: [{ name: 'local-stores', setup(b) {
      b.onResolve({filter:/^react-native$/}, () => ({ path: path.resolve('scripts/test-stubs/react-native.js') }));
      b.onResolve({filter:/^@react-native-async-storage\/async-storage$/}, () => ({ path:'disk', namespace:'qa' }));
      b.onResolve({filter:/createCourseProgressStore$/}, () => ({ path:'store', namespace:'qa' }));
      b.onLoad({filter:/.*/,namespace:'qa'}, a => ({contents:a.path === 'store' ? 'export const createCourseProgressStore=()=>({});' : 'export default {getItem:async k=>globalThis.storage.get(k)??null,setItem:async(k,v)=>globalThis.storage.set(k,v),removeItem:async k=>globalThis.storage.delete(k)}'}));
    } }] });
  const mod = {exports:{}}; new Function('module','exports',result.outputFiles[0].text)(mod,mod.exports); const x = mod.exports;
  const ids = 'hello name yes-no i-am numbers-1-10 please-thanks this-is i-have family where-is drinks time places shopping health days people adjectives colors family-more numbers-teens questions food week home city work review'.split(' ').map(s => `ru-pre-${s}`);
  const lessons = x.RUSSIAN_LESSONS, starter = lessons.filter(l => l.levelId === 0), letters = new Set();
  assert.deepEqual(starter.map(l=>l.id), ids);
  starter.forEach(lesson => {
    const step = x.starterStep(lesson.id); for (const letter of step.letters) { assert(!letters.has(letter)); letters.add(letter); }
    assert.deepEqual(lesson.sentences.map(s=>s.id),Array.from({length:8},(_,i)=>`${lesson.id}-${String(i+1).padStart(2,'0')}`));
    for (const word of step.read) for (const ch of word.text.toUpperCase().match(/[А-ЯЁ]/g)) assert(letters.has(ch), `${lesson.id} requires untaught ${ch}`);
    assert.deepEqual(lesson.sentences.slice(6).map(s=>s.text),step.read.map(w=>w.text));
    const [hearing, situation, reading] = lesson.checks;
    assert.equal(hearing.choices[hearing.correctIndex],step.oral[2].fa);
    assert(situation.choices.every(c=>step.oral.some(l=>l.text === c && l.pronunciation)));
    assert(reading.promptFa.includes(step.read[1].text)); assert.equal(reading.choices[reading.correctIndex],step.read[1].fa);
  });
  assert.deepEqual([...letters].sort(),[...x.RUSSIAN_ALPHABET].sort());
  for (const [mode,n] of [['exam',20],['practice',10],['warmup',28]]) {
    for (const seed of [1,2,7,'2026-11-18']) {
      const items = x.russianStarterRound(lessons,mode,seed); assert.equal(items.length,n);
      for (const item of items) {
        const index = Number(item.sentenceId.slice(-2));
        assert((item.kind === 'listen' && index <= 6) || (item.kind === 'truefalse' && index > 6));
      }
    }
  }
  let paths = 0;
  for (const l of lessons) for (const starter of ['learner','partner']) {
    const scene = x.exchangeForLesson(l);
    const allowed = new Set([...l.sentences, ...l.dialogue].map(line=>line.text+'|'+line.fa));
    function visit(picks) {
      const path={starter,picks}, view=x.exchangeView(scene,path); assert(x.validExchangePath(scene,path));
      assert(view.history.every(h => allowed.has(h.line.text+'|'+h.line.fa)), `Out-of-lesson model in ${l.id}`);
      if (view.history.length) assert.equal(view.history[0].who,starter);
      for(let i=1;i<view.history.length;i++) assert.notEqual(view.history[i].who,view.history[i-1].who);

      if(view.complete) {
        paths++;
        if(l.levelId===1) assert.deepEqual(view.history.map(h=>h.line.text),l.dialogue.map(d=>d.text));
        return;
      }
      assert(view.options.every(m => x.replyPhrases(m.say).every(t=>allowed.has(t+'|'+m.say.fa))));
      assert(view.options.length>=1); assert.equal(new Set(view.options.map(m=>x.plainRussian(m.reply?.text ?? m.say.text))).size,view.options.length,l.id);
      view.options.forEach((m,i)=>{ assert.equal(x.matchExchangeReply(m.say.text, view.options),i,`${l.id}: ${m.say.text}`); const n=x.exchangeView(scene,{starter,picks:[...picks,i]}); assert.equal(n.history.at(-1).line.text,m.reply?.text ?? m.say.text); visit([...picks,i]); });
    }
    visit([]); assert.equal(x.exchangeView(scene,{starter,picks:[15]}),null);
  }
  // Pre-A1 «ч и й: want and show» opens the finale itself: two taught lines, each with its own partner reply.
  // The lines are the fixture's content of the lesson; what is under test is the resolver: two options, an exact
  // match for each, nothing matched by a near-miss, and a reply that belongs to the branch chosen.
  const l=lessons.find(l=>l.id==='ru-pre-this-is'), scene=x.exchangeForLesson(l), turn=x.exchangeView(scene,{starter:'partner',picks:[]});
  assert.deepEqual(turn.options.map(o=>o.say.text), ['Да, я хочу́ чай.','Нет, я не хочу́ чай.']);
  for(const [text,i] of [['да я хочу чай',0],['нет я не хочу чай',1],['я хочу чай',-1],['что ты хочешь',-1],['это мама',-1],['чай или воду',-1],['',-1]]) assert.equal(x.matchExchangeReply(text,turn.options),i);
  assert(x.exchangeView(scene,{starter:'learner',picks:[0]}).history.at(-1).line.text.includes('вот'));
  assert(x.exchangeView(scene,{starter:'learner',picks:[1]}).history.at(-1).line.text.includes('хо́чешь'));
  // the drink choice lives in its own lesson now: its opening question is legal there, not here; a bare
  // word from the middle of the sentence is a near-miss, not a match.
  const drinkScene=x.exchangeForLesson(lessons.find(d=>d.id==='ru-pre-drinks'));
  assert.equal(x.matchExchangeReply('чай или воду', x.exchangeView(drinkScene,{starter:'learner',picks:[]}).options), 0);
  assert.equal(x.matchExchangeReply('воду', x.exchangeView(drinkScene,{starter:'learner',picks:[]}).options), -1);
  assert(!x.validExchangePath(scene,{starter:'partner',picks:[1],said:{0:'я не хочу воду'}}));
  const all = new Set(x.VERBS.map(v=>v.lemma)); assert.equal(all.size,x.VERBS.length);
  for(const v of x.VERBS) { assert(v.fa && v.forms.length && v.examples.length && v.level>=0 && v.level<=5); for(const s of v.examples) assert(s.fa && x.gapFor(s.text,s.form).includes('____'), v.lemma); }
  for(const l of lessons) for(const v of x.lessonVerbs(l.id)) assert(all.has(v));
  assert.deepEqual(x.GRAMMAR_BANDS.map((_,i)=>x.GRAMMAR_UNITS.some(u=>u.level===i)),Array(6).fill(true));
  assert(x.relatedUnits(l).some(u=>u.id==='want')); assert(x.lessonVerbs(l.id).includes('хотеть'));
  for(const u of x.GRAMMAR_UNITS){ assert(u.choices.includes(u.answer)&&new Set(u.choices).size===u.choices.length); assert(u.examples.length>=2&&u.examples.every(s=>s.pronunciation&&s.fa)); }
  for(const platform of ['web','android']) {
    global.__RN_OS__=platform; global.storage=new Map(); global.window={localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}};
    const key=x.RUSSIAN_STUDY_STORAGE_KEY, old={stage:9,stageVersion:2,sentenceIndex:5,revealed:true,answers:{0:1},showCheckAnswers:true};
    const other=lessons.find(l=>l.levelId===5).id;
    storage.set(key,JSON.stringify({schema:1,sessions:{[l.id]:old,[other]:old}})); storage.set('sentence_course_progress_ru_v2','existing-completions-and-cards');
    const loaded=await x.loadRussianPositions(); assert(!loaded.unreadable); assert.deepEqual(loaded.sessions[l.id].answers,{}); assert.equal(loaded.sessions[l.id].showCheckAnswers,false); assert.equal(loaded.sessions[l.id].sentenceIndex,5); assert.equal(loaded.sessions[l.id].stage,9); assert.deepEqual(loaded.sessions[other].answers,old.answers);
    // The ladder is exactly RUSSIAN_LESSON_STAGES long, so a legacy save on the old speaking-check stage
    // (10, before the blitz round was dropped) migrates down and never escapes the ladder. A turn-exchange
    // is live dialogue state, not session state: whatever a stale save carries with it is dropped.
    const ladder=x.RUSSIAN_LESSON_STAGES.length;
    const beginner=lessons.find(l=>l.levelId===1).id;
    storage.set(key,JSON.stringify({schema:1,sessions:{[beginner]:{stage:ladder-1,stageVersion:undefined,sentenceIndex:5,revealed:true,answers:{0:3},showCheckAnswers:true,exchange:{starter:'partner',picks:[0]}}}}));
    const migrated=await x.loadRussianLessonSession(beginner);
    assert.equal(migrated.stage,ladder-2);assert.deepEqual(migrated.answers,{});assert.equal(migrated.exchange,undefined);assert.equal(migrated.showCheckAnswers,false);
    storage.set(key,JSON.stringify({schema:1,sessions:{[l.id]:{...old,stage:ladder,stageVersion:undefined}}})); assert.equal((await x.loadRussianLessonSession(l.id)).stage,ladder-1);
    await x.saveRussianLessonSession(l.id,{...old,stage:ladder-1,exchange:{starter:'partner',picks:[1],said:{0:'я хочу воду'}}});
    const saved=await x.loadRussianLessonSession(l.id); assert.equal(saved.stage,ladder-1); assert.deepEqual(saved.answers,old.answers); assert(saved.showCheckAnswers); assert.equal(saved.exchange,undefined);
    await x.resetRussianLessonSession(l.id); assert.equal((await x.loadRussianLessonSession(l.id)).stage,0); assert.equal(storage.get('sentence_course_progress_ru_v2'),'existing-completions-and-cards');
  }
  console.log(`PASS: 28 stable steps / 33 decodable letters; ${paths} complete paths across all ${lessons.length} lessons; ${x.VERBS.length} verbs; ${x.GRAMMAR_UNITS.length} guided units; both session backends and both starter modes.`);
})().catch(e=>{console.error(e);process.exitCode=1});
