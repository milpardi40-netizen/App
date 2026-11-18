const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const esbuild = require('esbuild');
const path = require('node:path');
const introCompatibility = require('./fixtures/a1-intro-compat.json');
const editedIntroSentences = new Set([
  'fr-a1-daily-routine-s5','de-a1-daily-routine-s5','es-a1-daily-routine-s5',
  'fr-a1-comparisons-s6','fr-a1-comparisons-s8',
  'de-a1-comparisons-s6','de-a1-future-plans-s6','de-a1-future-plans-s7','de-a1-future-plans-s8',
  'es-a1-comparisons-s6','es-a1-comparisons-s8','es-a1-demonstratives-s5','es-a1-demonstratives-s6',
  'es-a1-past-events-s3','es-a1-past-events-s4','es-a1-past-events-s5','es-a1-past-events-s6','es-a1-past-events-s7','es-a1-past-events-s8',
  'es-a1-future-plans-s7','es-a1-past-events-s1','es-a1-past-events-s2',
  'es-a1-ordering-food-s1','es-a1-ordering-food-s7','es-a1-supermarket-s5',
  'es-a1-polite-requests-s1','es-a1-polite-requests-s6',
  // German A1 revision: lower early grammar load, clearer routine/tense examples
  // and the tightened connected-conversation closing.
  'de-a1-nouns-gender-plural-s1','de-a1-nouns-gender-plural-s2',
  'de-a1-present-tense-s3','de-a1-present-tense-s4','de-a1-present-tense-s5','de-a1-present-tense-s6',
  'de-a1-positive-negative-questions-s3','de-a1-positive-negative-questions-s4',
  'de-a1-question-words-s6','de-a1-question-words-s8',
  'de-a1-location-s1','de-a1-location-s2','de-a1-connectors-s5','de-a1-ordering-food-s8',
  'de-a1-hotel-stay-s1','de-a1-doctor-symptoms-s6','de-a1-work-study-s5','de-a1-work-study-s7',
  'de-a1-polite-requests-s7','de-a1-suggestions-s4','de-a1-forms-information-s4',
  'de-a1-clothes-shopping-s6','de-a1-reasons-s3',
  'de-a1-connected-conversation-s1','de-a1-connected-conversation-s2','de-a1-connected-conversation-s3',
  'de-a1-connected-conversation-s4','de-a1-connected-conversation-s6',
]);
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
// Loaders add bookkeeping (stageVersion); the learner fields must round-trip exactly.
const sameSession = (stored, expected) => ['stage','sentenceIndex','revealed','answers','showCheckAnswers']
  .every(key => JSON.stringify(stored[key]) === JSON.stringify(expected[key]));

// Snapshot of the 21 lessons shipped before the redesign, excluding presentation
// order. This catches changed sentence IDs/text, translations, checks, dialogue
// and answer order: old saved sessions and review-card IDs depend on them.
const legacyHashes = {
  de:'8b03356e6eaa85a0d0eddcd2c1816e36c0e9be3564d543f2490efc5566a42272',
  fr:'cec5f39f6b6dfff9e15fa70e040db7124fe5c6ee82ca7b0b565c2ee696d73943',
  es:'d059f180d4af984a909374aff8f240bda1c8dd0610ff2853d758dd756e7fb85f',
};
(async () => {
  const outfile = path.resolve('node_modules/.cache/new-language-samples.cjs');
  await esbuild.build({entryPoints:['lib/languages/newCourses.ts'],bundle:true,platform:'node',format:'cjs',outfile,plugins:[{name:'stubs',setup(build){
    build.onResolve({filter:/^\.\/supabase$/},args=>args.importer.endsWith('createCourseProgressStore.ts') ? {path:'supabase',namespace:'stub'} : null);
    build.onResolve({filter:/^@react-native-async-storage\/async-storage$/},()=>({path:'storage',namespace:'stub'}));
    build.onResolve({filter:/^react-native$/},()=>({path:'platform',namespace:'stub'}));
    build.onLoad({filter:/.*/,namespace:'stub'},args=>({loader:'js',contents:args.path==='platform'?'export const Platform={get OS(){return globalThis.__starterOS || "web"}};':args.path==='storage'?'export default {async getItem(k){return globalThis.__starterNative.get(k) ?? null},async setItem(k,v){globalThis.__starterNative.set(k,String(v))},async removeItem(k){globalThis.__starterNative.delete(k)}}':'export const supabase={};'}));
  }}]});
  const memory = new Map();
  global.window = {localStorage:{getItem:k=>memory.get(k) ?? null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)}};
  const {NEW_COURSES} = require(outfile);
  const editorialFile = path.resolve('node_modules/.cache/starter-editorial.cjs');
  const practiceFile = path.resolve('node_modules/.cache/starter-extra-practice.cjs');
  await esbuild.build({entryPoints:['lib/languages/starterEditorial.ts'],bundle:true,platform:'node',format:'cjs',outfile:editorialFile});
  await esbuild.build({entryPoints:['lib/languages/starterExtraPractice.ts'],bundle:true,platform:'node',format:'cjs',outfile:practiceFile});
  const {starterDisplayChecks, starterDisplayPronunciation, starterTeachingNote} = require(editorialFile);
  const {buildExtraPractice} = require(practiceFile);
  const skillsFile = path.resolve('node_modules/.cache/a1-skills.cjs');
  await esbuild.build({entryPoints:['lib/languages/a1Skills.ts'],bundle:true,platform:'node',format:'cjs',outfile:skillsFile});
  const {A1_SKILLS} = require(skillsFile);
  const topicFile=path.resolve('node_modules/.cache/a1-independent-topics.cjs');
  await esbuild.build({stdin:{contents:"export {INDEPENDENT_A1_TOPIC_SLUGS} from './lib/languages/a1IndependentSkills'; export {A1_EXTENSION_SLUGS} from './lib/languages/a1TopicExtensions';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',outfile:topicFile});
  const {INDEPENDENT_A1_TOPIC_SLUGS,A1_EXTENSION_SLUGS}=require(topicFile);
  assert.equal(INDEPENDENT_A1_TOPIC_SLUGS.length,43);
  assert.deepEqual([...INDEPENDENT_A1_TOPIC_SLUGS].sort(),[...A1_EXTENSION_SLUGS].sort());
  const introHashes={de:'8964317ece56c4cff172788206d2878e36e90bc257590d128989e1827ca773ba',fr:'ef684767a9645b32460c2ad91f8345e8c03016093a3ddd72c206837666b84083',es:'c176c1d74746c49d89d358c495b42fff5c96afec4bbf80ac2e5fa7d286e1cf6e'};
  // The Pre-A1 published sets were rewritten as authored lessons, so only the
  // two live editorial clarifications remain keyed to a generated lesson.
  const clarified = {
    'fr-foundation-words-1': [0, 'نه سلام دوستانه'], 'es-foundation-chunks-1': [1, 'در این درس'],
  };
  const a1Hashes = {de:'ba0ee1f5e0454761d9bb7e9d1807ef29d74da56193b4717a2a78717a027d0122',fr:'2f5144201c18aa2c736b0752d5d97ee90102a987f89824b84fb9dfd0c9a09471',es:'e7ba034289a6e8e98dc10c77de595472adc6c185e7a0b672722fb6ea749ab86c'};
  const newSlugs = {de:'room-search',fr:'appointment-time',es:'metro-directions'};
  const seenClarifications = new Set();
  const allIds = new Set();
  for (const id of ['de','fr','es']) {
    const course = NEW_COURSES[id];
    const structuralBaseline = {
      de:'4cd3f041e314a7ff768e6780c6fb9c77e54635e646ad560d53e82a3c1b62c5e6',
      fr:'a8ae91713175069f4a762a2ed52b866edd29a3208d3c61a017108b80ed7b8851',
      es:'52fdfa768213c2f8834492f62e049780fea24967054ab1d2ac2138ae99cdc4ea',
    };
    const structure = course.lessons.filter(l=>l.levelId!==2 && l.levelId!==3 && l.levelId!==4).map(l=>({id:l.id,levelId:l.levelId,order:l.order,sentences:l.sentences.map(s=>s.id),dialogueCount:l.dialogue.length,checks:l.checks.map(q=>({correctIndex:q.correctIndex,choiceCount:q.choices.length}))}));
    assert.equal(hash(structure),structuralBaseline[id],`${id}: lesson and sentence identities, order, dialogue and saved answer slots unchanged`);
    assert.equal(course.lessons.length,218);
    assert.equal(course.lessons.reduce((sum,lesson)=>sum+lesson.sentences.length,0),2210);
    assert.deepEqual(course.levels.map(level=>level.id),[0,1,2,3,4,5]);
    // Level 0 is the Pre-A1 band: six word-lab lessons plus twenty-one authored lessons.
    const preA1 = course.lessons.filter(lesson=>lesson.levelId===0);
    assert.equal(preA1.length,27, `${id}: Pre-A1 band size`);
    assert.equal(preA1.filter(lesson=>lesson.learningMode && lesson.id.startsWith(`${id}-foundation-`)).length,6, `${id}: Pre-A1 word lab lessons`);
    assert.equal(preA1.filter(lesson=>new RegExp(`^${id}-pre-\\d+$`).test(lesson.id) && !lesson.learningMode).length,21, `${id}: authored Pre-A1 lessons`);
    assert(preA1.every(lesson=>lesson.sentences.length===8));
    assert.equal(course.levels.find(level=>level.id===1).status,'available');
    assert.equal(course.levels.find(level=>level.id===2).status,'available');
    assert.equal(course.levels.find(level=>level.id===3).status,'available');
    assert.equal(course.levels.find(level=>level.id===4).status,'available');
    assert.equal(course.levels.find(level=>level.id===5).status,'available'); // C1 has independent topic lessons, not sentence sessions.
    assert(course.levels.filter(level=>level.id!==0 && level.id!==1 && level.id!==2 && level.id!==3 && level.id!==4 && level.id!==5).every(level=>level.status==='planned'));
    assert.deepEqual(course.lessons.map(l=>l.order),Array.from({length:218},(_,i)=>i+1));
    assert.deepEqual(course.lessons.slice(0,6).map(l=>l.learningMode),['sounds','sounds','words','words','chunks','chunks']);
    for (const lesson of course.lessons) {
      assert(!allIds.has(lesson.id)); allIds.add(lesson.id);
      // Practice-lab lessons live under a shared `lab-<lang>-…` id namespace.
      assert((lesson.id.startsWith(id+'-') || lesson.id.startsWith('lab-'+id+'-')) && [0,1,2,3,4,5].includes(lesson.levelId) && lesson.teachingFa);
      const intro = /-a1-(nouns-gender-plural|demonstratives|descriptions|colors|articles|ordering-food|travel-tickets|hotel-stay|doctor-symptoms|weather|simple-verbs|present-tense|verb-conjugation|positive-negative-questions|question-words|location|wants-needs|ability|prepositions|daily-routine|connectors|social-chat|phone-messages|invitations|polite-requests|past-events|future-plans|feelings|comparisons|reasons|dates-and-time|public-transport|work-study|forms-information|supermarket|home-furniture|instructions|suggestions|clothes-shopping|leisure|weekly-schedule|preferences|connected-conversation)$/.test(lesson.id);
      const expectedSentenceLength = (lesson.levelId === 2 || lesson.levelId === 3 || lesson.levelId === 4) ? (lesson.id.endsWith('-a2-present') ? 12 : 8) : intro ? 12 : /-a1-(greetings|subject-pronouns|verb-to-be|nationalities|numbers-age|family|possessives|shopping-payment|directions|asking-help)$/.test(lesson.id) ? 12 : lesson.levelId === 1 ? 20 : 8;
      assert(lesson.id.startsWith('lab-')
        ? [10, 12].includes(lesson.sentences.length)
        : lesson.sentences.length === expectedSentenceLength, `${lesson.id}: sentence count`);
      if (lesson.levelId === 1) {
        assert(lesson.id.startsWith(`${id}-a1-`));
        assert.equal(lesson.checks.length,4);
        assert.equal(new Set(lesson.sentences.map(x=>x.text)).size,lesson.sentences.length);
        if (!intro && !/-a1-(greetings|subject-pronouns|verb-to-be|nationalities|numbers-age|family|possessives|shopping-payment|directions|asking-help)$/.test(lesson.id)) assert(lesson.sentences.filter(x=>x.pattern).length >= 5);
        for (const q of lesson.checks) { assert.equal(q.choices.length,4); assert.equal(new Set(q.choices).size,4); assert(q.choices.every(choice=>lesson.sentences.some(x=>x.text===choice))); }
      }
      if (lesson.learningMode) {
        assert.equal(lesson.dialogue.length,0,`${lesson.id}: no premature dialogue`);
        assert.equal(lesson.checks.length,3);
        assert.equal(new Set(lesson.sentences.map(s=>s.fa)).size,8,`${lesson.id}: distinct answer meanings`);
        assert.equal(new Set(lesson.sentences.map(s=>s.text.toLowerCase())).size,8,`${lesson.id}: distinct options`);
        if (lesson.learningMode !== 'chunks') assert(lesson.sentences.every(s=>!s.text.trim().includes(' ')),`${lesson.id}: independent words only`);
        for (const q of lesson.checks) {
          assert.equal(q.choices.length,4); assert.equal(new Set(q.choices).size,4);
          assert(q.choices[q.correctIndex]);
          const target=lesson.sentences.find(s=>q.explanationFa===`${s.text} یعنی ${s.fa}.`);
          assert(target && (q.choices[q.correctIndex]===target.text || q.choices[q.correctIndex]===target.fa));
        }
      } else if (!lesson.id.startsWith('lab-')) {
        assert(lesson.dialogue.length>=3);
        assert(lesson.dialogue.every((line,idx) => line.speaker === (idx % 2 ? 'همراه' : 'زبان‌آموز') && lesson.sentences.some(s => s.text === line.text && s.fa === line.fa)), `${lesson.id}: dialogue turns use this lesson`);
      } else {
        // Practice labs reuse their target words in short guided turns.
        assert(lesson.dialogue.length>=3 && lesson.dialogue.every(line => line.speaker && line.text && line.fa), `${lesson.id}: lab dialogue turns`);
      }
      for (const sentence of lesson.sentences) {
        assert(!allIds.has(sentence.id)); allIds.add(sentence.id);
        assert(sentence.text && sentence.fa && sentence.pronunciation && sentence.vocabulary.every(v=>v.word && v.meaning && sentence.text.toLocaleLowerCase().includes(v.word.toLocaleLowerCase())));
      }
      for (const q of lesson.checks) assert(q.correctIndex>=0 && q.correctIndex<q.choices.length && q.explanationFa);
      const original = JSON.stringify(lesson);
      const display = starterDisplayChecks(lesson);
      assert.equal(display.length, lesson.checks.length);
      display.forEach((q, i) => {
        assert.deepEqual(q.choices, lesson.checks[i].choices, `${lesson.id}: old choice ordering`);
        assert.equal(q.correctIndex, lesson.checks[i].correctIndex, `${lesson.id}: old saved answer still valid`);
      });
      if (clarified[lesson.id]) {
        const [i, phrase] = clarified[lesson.id];
        assert(display[i].promptFa.includes(phrase), `${lesson.id}: editorial prompt applied`);
        assert.notEqual(display[i].promptFa, lesson.checks[i].promptFa);
        seenClarifications.add(lesson.id);
      }
      if (lesson.id === 'de-pre-15') assert(starterTeachingNote(lesson).includes('Woher kommen Sie'));
      const extra = buildExtraPractice(lesson);
      assert.equal(extra.length, intro ? 5 : 3, `${lesson.id}: optional questions include new samples`);
      assert.deepEqual(extra.map(q=>q.correctIndex),extra.map((_,i)=>(i+1)%4));
      if (intro) assert(extra.slice(3).every(q=>lesson.sentences.slice(8).some(s=>s.text===q.target)), `${lesson.id}: exercise tests appended samples`);
      for (const q of extra) {
        assert.equal(q.choices.length,4);
        assert.equal(new Set(q.choices).size,4);
        const matching=lesson.sentences.filter(item=>item.text===q.target);
        assert.equal(matching.length,1);
        assert.equal(q.choices[q.correctIndex],matching[0].fa);
        assert(q.choices.every(choice=>lesson.sentences.some(item=>item.fa===choice)));
      }
      assert.equal(JSON.stringify(lesson),original, `${lesson.id}: editorial and optional practice do not mutate data`);
    }
    const intros=course.lessons.filter(l=>INDEPENDENT_A1_TOPIC_SLUGS.some(slug=>l.id===`${id}-a1-${slug}`));
    assert.equal(intros.length,43);
    const beforeExtension=intros.map(l=>({id:l.id,sentences:l.sentences.slice(0,8),dialogue:l.dialogue,checks:l.checks})).sort((a,b)=>a.id.localeCompare(b.id));
    assert.equal(hash(beforeExtension),introHashes[id],`${id}: current edited intro content snapshot`);
    for(const lesson of intros) {
      const prior = introCompatibility[lesson.id];
      assert(prior, `${lesson.id}: compatibility baseline exists`);
      const initial = lesson.sentences.slice(0,8);
      initial.forEach((sentence,index) => {
        if (!editedIntroSentences.has(sentence.id)) assert.equal(hash(sentence), prior.sentences[index], `${sentence.id}: untouched content remains stable`);
        else assert.notEqual(hash(sentence), prior.sentences[index], `${sentence.id}: intentional change is covered by the whitelist`);
      });
      assert.deepEqual(lesson.dialogue.map(turn => initial.findIndex(s => s.text===turn.text)),prior.dialogue,`${lesson.id}: dialogue sentence positions preserved`);
      assert.deepEqual(lesson.checks.map(q => ({choices:q.choices.map(choice=>initial.findIndex(s=>s.text===choice)),correctIndex:q.correctIndex})), prior.checks, `${lesson.id}: answer positions and choice-to-sentence mapping preserved`);
      assert.deepEqual(lesson.sentences.map(s=>s.id),Array.from({length:12},(_,i)=>`${lesson.id}-s${i+1}`));
      for(const task of A1_SKILLS[lesson.id]) {
        assert(task.passage.split(/\s+/).length>=3, `${lesson.id}: contextual message`);
        assert(!lesson.sentences.some(s=>s.text===task.passage), `${lesson.id}: independent message, not a lesson sentence`);
        assert(!task.promptFa.includes('معنی جمله'), `${lesson.id}: ask about the message`);
        assert(task.explanationFa.includes(task.choices[task.correctIndex]));
      }
    }
    // Edits correct misleading translations and lower the early grammar load.
    const routine = course.lessons.find(l=>l.id===`${id}-a1-daily-routine`);
    assert.equal(routine.sentences[4].fa,'ساعت هفت از خواب بلند می‌شوم.');
    assert.equal(course.lessons.find(l=>l.id===`${id}-a1-present-tense`).sentences[9].vocabulary[0].meaning,'هر صبح');
    assert.equal(course.lessons.find(l=>l.id===`${id}-a1-doctor-symptoms`).sentences[8].vocabulary[0].meaning,'گلودرد');
    const future = course.lessons.find(l=>l.id===`${id}-a1-future-plans`);
    if (id==='de') {
      assert(!/Futur|werden/.test(future.teachingFa));
      assert(!future.sentences.some(s=>/\b(werde|wird|werden)\b/i.test(s.text)));
    }
    if (id==='es') {
      const past=course.lessons.find(l=>l.id==='es-a1-past-events');
      assert(!/perfecto|indefinido|he hablado/.test(past.teachingFa));
      assert(past.sentences.every(s=>!/\b(trabajé|trabajaste|estudié|estudiaste|descansé|hablé)\b/i.test(s.text)));
      assert(past.title.includes('امروز'));
      assert(!past.sentences.some(s=>/\b(he|has|hemos|habéis|han)\s+/i.test(s.text)));
      assert(A1_SKILLS[past.id].every(t=>!/\b(he|has|hemos|habéis|han)\s+/i.test(t.passage)));
    }
    const samples={fr:['fr-a1-shopping-payment-s5','وو زَکسِپته لِ کارت'],de:['de-a1-profile-s14','کونِن زی داس بیتِه ویدِرهولِن'],es:['es-a1-cafe-s12','پوئِدو پاگار کون تارخِتا']};
    const [correctedId,correctedPronunciation]=samples[id], corrected=course.lessons.flatMap(l=>l.sentences).find(s=>s.id===correctedId);
    const correctedBefore=JSON.stringify(corrected);
    assert.equal(starterDisplayPronunciation(corrected),correctedPronunciation);
    assert.equal(JSON.stringify(corrected),correctedBefore,`${id}: display-only pronunciation does not mutate sentence`);
    const legacy = course.lessons.filter(l=>l.id.startsWith(`${id}-pre-`));
    assert.equal(legacy.length,21);
    const normalized = legacy.map(({order,...rest})=>rest).sort((a,b)=>a.id.localeCompare(b.id));
    assert.equal(crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex'), legacyHashes[id],`${id}: all shipped lesson content is unchanged`);
    // The six Pre-A1 word-lab lessons come first, then the twenty-one authored lessons.
    assert.deepEqual(legacy.map(lesson=>lesson.id),Array.from({length:21},(_,i)=>`${id}-pre-${i+1}`));
    assert.deepEqual(course.lessons.slice(6,27).map(lesson=>lesson.id),legacy.map(lesson=>lesson.id));
    assert.deepEqual(course.lessons.filter(l=>[`${id}-a1-profile`,`${id}-a1-cafe`].includes(l.id)).map(l=>l.id),[`${id}-a1-profile`,`${id}-a1-cafe`]);
    const oldA1=course.lessons.filter(l=>[`${id}-a1-profile`,`${id}-a1-cafe`].includes(l.id)).map(({order,...rest})=>rest).sort((a,b)=>a.id.localeCompare(b.id));
    assert.equal(crypto.createHash('sha256').update(JSON.stringify(oldA1)).digest('hex'),a1Hashes[id],`${id}: initial A1 content unchanged`);
    const newLesson = course.lessons.find(l=>l.id === `${id}-a1-${newSlugs[id]}`);
    assert.equal(newLesson.id,`${id}-a1-${newSlugs[id]}`);
    const tasks = A1_SKILLS[newLesson.id];
    assert.deepEqual(tasks.map(t=>t.kind),['listening','reading']);
    for (const task of tasks) {
      assert(task.passage && task.promptFa && task.explanationFa);
      assert.equal(task.choices.length,3);
      assert.equal(new Set(task.choices).size,3);
      assert(task.choices[task.correctIndex]);
    }
    const otherId = id === 'de' ? 'fr' : 'de';
    await assert.rejects(course.sessions.loadStarterLessonSession(`${otherId}-a1-${newSlugs[otherId]}`));
    const newSession={stage:2,sentenceIndex:0,revealed:false,answers:{},showCheckAnswers:false};
    await course.sessions.saveStarterLessonSession(newLesson.id,newSession);
    assert(sameSession(await course.sessions.loadStarterLessonSession(newLesson.id),newSession));
    await course.sessions.clearStarterLessonSession(newLesson.id);
    const a1Lessons = course.lessons.filter(lesson=>lesson.levelId===1);
    assert.equal(course.levels.find(l=>l.id===1).modules.length,56);
    const firstA1 = a1Lessons[0];
    assert.equal(firstA1.dialogue.length,6);
    const a1Session={stage:8,sentenceIndex:0,revealed:false,answers:{'0':0,'1':1},showCheckAnswers:false};
    await course.sessions.saveStarterLessonSession(firstA1.id,a1Session);
    assert(sameSession(await course.sessions.loadStarterLessonSession(firstA1.id),a1Session));
    await assert.rejects(course.sessions.saveStarterLessonSession(firstA1.id,{...a1Session,answers:{'0':4}}));
    await course.sessions.clearStarterLessonSession(firstA1.id);

    // Learners who finished the earlier eight-example intro retain their
    // completion, answer indices and scheduled cards; appended cards are due.
    const expanded=intros.find(l=>l.id===`${id}-a1-colors`);
    const expandedReview={id:`${expanded.id}:${expanded.sentences[0].id}`,lessonId:expanded.id,sentenceId:expanded.sentences[0].id,dueAt:new Date(0).toISOString(),intervalDays:9,ease:2.5,repetitions:3,lapses:0};
    const expandedSession={stage:8,sentenceIndex:7,revealed:false,answers:{'0':0,'1':1,'2':2,'3':3},showCheckAnswers:false};
    memory.set(`sentence_course_progress_${id}_starter_v1`,JSON.stringify({completedLessonIds:[expanded.id],currentLessonId:expanded.id,reviewCards:[expandedReview]}));
    await course.sessions.saveStarterLessonSession(expanded.id,expandedSession);
    const expandedProgress=await course.progress.getCourseProgress();
    assert(expandedProgress.completedLessonIds.includes(expanded.id));
    assert.equal(expandedProgress.currentLessonId,expanded.id);
    assert.equal(expandedProgress.reviewCards.filter(c=>c.lessonId===expanded.id).length,12);
    assert.equal(expandedProgress.reviewCards.find(c=>c.id===expandedReview.id).intervalDays,9);
    assert(sameSession(await course.sessions.loadStarterLessonSession(expanded.id),expandedSession));
    await course.sessions.clearStarterLessonSession(expanded.id);

    // A returning A1 learner retains the exact saved lesson, answers and review
    // schedule despite insertion of new lessons earlier in the curriculum.
    const savedA1 = {stage:8,sentenceIndex:2,revealed:false,answers:{'0':0},showCheckAnswers:false};
    const cafeId = `${id}-a1-cafe`, priorA1 = course.lessons.find(l=>l.id===cafeId);
    const a1Review = {id:`${cafeId}:${priorA1.sentences[0].id}`,lessonId:cafeId,sentenceId:priorA1.sentences[0].id,dueAt:new Date(0).toISOString(),intervalDays:7,ease:2.3,repetitions:2,lapses:0};
    memory.set(`sentence_course_progress_${id}_starter_v1`, JSON.stringify({completedLessonIds:[firstA1.id,cafeId],currentLessonId:newLesson.id,reviewCards:[a1Review]}));
    await course.sessions.saveStarterLessonSession(cafeId,savedA1);
    const returningA1 = await course.progress.getCourseProgress();
    assert.equal(returningA1.currentLessonId,newLesson.id);
    assert(returningA1.completedLessonIds.includes(cafeId));
    assert.equal(returningA1.reviewCards.find(c=>c.id===a1Review.id).intervalDays,7);
    assert(sameSession(await course.sessions.loadStarterLessonSession(cafeId),savedA1));
    const freshCore = course.lessons.find(l=>l.id===`${id}-a1-subject-pronouns`);
    await course.progress.completeSentenceLesson(freshCore.id,returningA1.currentLessonId);
    const afterCore = await course.progress.getCourseProgress();
    assert.equal(afterCore.currentLessonId,newLesson.id);
    assert.equal(afterCore.reviewCards.find(c=>c.id===a1Review.id).intervalDays,7);
    assert.equal(afterCore.reviewCards.filter(c=>c.lessonId===freshCore.id).length,12);
    assert(sameSession(await course.sessions.loadStarterLessonSession(cafeId),savedA1));
    await course.sessions.clearStarterLessonSession(cafeId);

    const oldLesson=legacy.find(l=>l.id===`${id}-pre-1`);
    const oldCard={id:`${oldLesson.id}:${oldLesson.sentences[0].id}`,lessonId:oldLesson.id,sentenceId:oldLesson.sentences[0].id,dueAt:new Date(0).toISOString(),intervalDays:5,ease:2.4,repetitions:2,lapses:0};
    const completed=legacy.map(l=>l.id);
    memory.set(`sentence_course_progress_${id}_starter_v1`,JSON.stringify({completedLessonIds:completed,currentLessonId:`${id}-pre-20`,reviewCards:[oldCard]}));
    const migrated=await course.progress.getCourseProgress();
    assert.deepEqual(migrated.completedLessonIds,completed);
    assert.equal(migrated.currentLessonId,`${id}-pre-20`);
    assert.equal(migrated.reviewCards.find(c=>c.id===oldCard.id).intervalDays,5);
    assert.equal(migrated.reviewCards.length,168);
    assert.equal(course.lessons.find(item=>!migrated.completedLessonIds.includes(item.id)).id,`${id}-foundation-sounds-1`);
    const oldSession={stage:8,sentenceIndex:3,revealed:false,answers:{'0':0},showCheckAnswers:false};
    await course.sessions.saveStarterLessonSession(oldLesson.id,oldSession);
    assert(sameSession(await course.sessions.loadStarterLessonSession(oldLesson.id),oldSession));
    const first=course.lessons[0];
    const foundationSession={stage:7,sentenceIndex:2,revealed:false,answers:{},showCheckAnswers:false};
    await course.sessions.saveStarterLessonSession(first.id,foundationSession);
    assert(sameSession(await course.sessions.loadStarterLessonSession(first.id),foundationSession));
    await assert.rejects(course.sessions.saveStarterLessonSession(first.id,{...foundationSession,stage:99}));
    await course.progress.completeSentenceLesson(first.id,migrated.currentLessonId);
    const after=await course.progress.getCourseProgress();
    assert.equal(after.currentLessonId,`${id}-pre-20`);
    assert(after.completedLessonIds.includes(first.id));
    assert.equal(after.reviewCards.filter(card=>card.lessonId===first.id).length,8);
    assert.equal(after.reviewCards.find(c=>c.id===oldCard.id).intervalDays,5);
    await course.progress.completeSentenceLesson(firstA1.id,`${id}-a1-cafe`);
    const withA1=await course.progress.getCourseProgress();
    assert(withA1.completedLessonIds.includes(firstA1.id));
    assert.equal(withA1.reviewCards.filter(card=>card.lessonId===firstA1.id).length,firstA1.sentences.length);
    assert.equal(withA1.reviewCards.find(c=>c.id===oldCard.id).intervalDays,5);
    assert(sameSession(await course.sessions.loadStarterLessonSession(oldLesson.id),oldSession));
    await course.sessions.clearStarterLessonSession(first.id);
    assert.equal((await course.sessions.loadStarterLessonSessionWithPresence(first.id)).hasSavedSession,false);
  }
  // Completing or saving one language must not modify another's persisted state.
  const unrelatedKeys = ['de','es'].flatMap(id=>[`sentence_course_progress_${id}_starter_v1`,`${id}_starter_lesson_sessions_v1`]);
  const untouched = unrelatedKeys.map(key=>memory.get(key));
  const frenchNew = NEW_COURSES.fr.lessons.find(l=>l.id === 'fr-a1-appointment-time');
  await NEW_COURSES.fr.sessions.saveStarterLessonSession(frenchNew.id,{stage:8,sentenceIndex:1,revealed:false,answers:{'0':0},showCheckAnswers:false});
  await NEW_COURSES.fr.progress.completeSentenceLesson(frenchNew.id);
  assert.deepEqual(unrelatedKeys.map(key=>memory.get(key)),untouched,'other languages retain their progress and sessions');
  assert.equal((await NEW_COURSES.fr.progress.getCourseProgress()).reviewCards.filter(card=>card.lessonId===frenchNew.id).length,20);
  assert.equal(Object.keys(A1_SKILLS).length,168);
  for (const [lessonId, tasks] of Object.entries(A1_SKILLS)) {
    assert(['de','fr','es'].some(id=>NEW_COURSES[id].lessons.some(l=>l.id===lessonId)));
    assert.deepEqual(tasks.map(t=>t.kind),['listening','reading']);
    for(const task of tasks) { assert(task.passage && task.promptFa && task.explanationFa); assert.equal(new Set(task.choices).size,3); assert(task.choices[task.correctIndex]); }
  }
  assert.deepEqual([...seenClarifications].sort(),Object.keys(clarified).sort());
  assert.equal([...memory.keys()].filter(k=>/^sentence_course_progress_(de|fr|es)_starter_v1$/.test(k)).length,3);
  global.__starterOS='ios'; global.__starterNative = new Map();
  for (const id of ['de','fr','es']) {
    const course=NEW_COURSES[id], first=course.lessons[0];
    const session={stage:2,sentenceIndex:1,revealed:false,answers:{},showCheckAnswers:false};
    await course.sessions.saveStarterLessonSession(first.id,session);
    assert(sameSession(await course.sessions.loadStarterLessonSession(first.id),session));
    await course.progress.completeSentenceLesson(first.id);
    assert((await course.progress.getCourseProgress()).completedLessonIds.includes(first.id));
    assert.equal((await course.progress.getDueReviewCards()).length,8);
  }
  assert.equal([...global.__starterNative.keys()].filter(k=>k.includes('_starter_v1')).length,3);
  console.log('Three beginner paths, Pre-A1 to A2: 654 lessons / 6630 examples; legacy snapshots, A1 structure, checks, independent progress, sessions and review migration passed.');
})().catch(e=>{console.error(e);process.exit(1)});
