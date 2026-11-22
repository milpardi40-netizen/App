const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const esbuild = require('esbuild');

(async () => {
  const output = path.resolve('node_modules/.cache/russian-course-test.cjs');
  await esbuild.build({
    stdin: {
      contents: [
        "export * from './lib/languages/russian';",
        "export * from './lib/languages/russianPreA1';",
        "export * from './lib/languages/russianA1Skills';",
        "export * from './lib/languages/catalog';",
        "export * from './lib/languages/russianStudyState';",
        "export * from './lib/englishLessonNavigation';",
        "export * from './lib/courseContent';",
        "export * from './lib/englishLearningEngine';",
        "export * from './lib/content/readiness';",
        "export * from './lib/content/courseSpec';",
        "export { familyKey, sameFamily } from './lib/content/morphology';",
        "export { default as ruBeginner } from './lib/content/frequency/ru-beginner.json';",
        "export { default as ruFrequency } from './lib/content/frequency/ru.json';",
      ].join('\n'),
      resolveDir: process.cwd(),
    },
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: output,
    plugins: [{
      name: 'local-course-test-stubs',
      setup(build) {
        build.onResolve({ filter: /^\.\/supabase$/ }, args => args.importer.endsWith('/lib/createCourseProgressStore.ts')
          ? { path: 'supabase', namespace: 'russian-supabase-stub' }
          : null);
        build.onLoad({ filter: /.*/, namespace: 'russian-supabase-stub' }, () => ({
          contents: 'export const supabase = { auth: { async getSession() { globalThis.__russianSupabaseCalls = (globalThis.__russianSupabaseCalls || 0) + 1; return { data: { session: null } }; }, async signInAnonymously() { globalThis.__russianSupabaseCalls = (globalThis.__russianSupabaseCalls || 0) + 1; return { data: { user: null }, error: null }; } }, from() { globalThis.__russianSupabaseCalls = (globalThis.__russianSupabaseCalls || 0) + 1; return { upsert: async () => ({ data: null, error: null }) }; } };',
          loader: 'js',
        }));
        build.onResolve({ filter: /^@react-native-async-storage\/async-storage$/ }, () => ({ path: 'async-storage', namespace: 'russian-storage-stub' }));
        build.onLoad({ filter: /.*/, namespace: 'russian-storage-stub' }, () => ({ contents: 'export default { async getItem() { return null; }, async setItem() {}, async removeItem() {} };', loader: 'js' }));
        build.onResolve({ filter: /^react-native$/ }, () => ({ path: 'react-native', namespace: 'russian-platform-stub' }));
        build.onLoad({ filter: /.*/, namespace: 'russian-platform-stub' }, () => ({ contents: 'export const Platform = { OS: "web" };', loader: 'js' }));
      },
    }],
  });

  const app = require(output);
  const checks = [];
  const check = (label, value) => { assert(value, label); checks.push(label); };
  const sentenceCount = app.RUSSIAN_LESSONS.reduce((sum, lesson) => sum + lesson.sentences.length, 0);
  const expectedPreA1Ids = [
    'ru-pre-01-hello', 'ru-pre-02-bye', 'ru-pre-03-yes-no', 'ru-pre-04-i-am',
    'ru-pre-05-numbers', 'ru-pre-06-how-are-you', 'ru-pre-07-i-have', 'ru-pre-08-please-thankyou',
    'ru-pre-09-this-is', 'ru-pre-10-review', 'ru-pre-11-at-home', 'ru-pre-12-people',
    'ru-pre-13-every-day', 'ru-pre-14-i-like',
  ];
  const expectedA1Ids = [
    'ru-a1-introducing-yourself', 'ru-a1-asking-for-help', 'ru-a1-buying-something',
    'ru-a1-alphabet-and-spelling', 'ru-a1-pronouns-and-be', 'ru-a1-numbers-and-contact',
    'ru-a1-family-and-possessions', 'ru-a1-time-and-calendar', 'ru-a1-everyday-routine',
    'ru-a1-objects-and-places', 'ru-a1-job-interview', 'ru-a1-renting-a-home',
    'ru-a1-personal-information', 'ru-a1-directions-and-neighborhood', 'ru-a1-public-transport',
    'ru-a1-cafe-and-food', 'ru-a1-shopping-and-clothing', 'ru-a1-appointments-and-time',
    'ru-a1-health-and-pharmacy', 'ru-a1-hobbies-and-free-time', 'ru-a1-invitations-and-plans',
    'ru-a1-weather-and-seasons', 'ru-a1-travel-and-tickets', 'ru-a1-hotel-and-stay',
    'ru-a1-phone-and-messages', 'ru-a1-services-and-post-office', 'ru-a1-school-and-learning',
    'ru-a1-current-activities', 'ru-a1-past-and-future-plans',
  ];
  const expectedLessonIds = [...expectedA1Ids, 'ru-l3-past-simple','ru-l3-future-simple','ru-l3-plans','ru-l3-appearance','ru-l3-comparisons','ru-l3-advice','ru-l3-likes-opinions','ru-l3-work-study','ru-l3-home','ru-l3-hobbies-sport','ru-l3-travel','ru-l3-conditions','ru-l3-daily-sequence','ru-l3-shopping-return','ru-l3-health-doctor','ru-l3-phone-internet','ru-l3-public-service','ru-l3-weather-seasons','ru-l3-cooking-food','ru-l3-conversation-tools'];

  check('Cyrillic alphabet has 33 unique letters', app.RUSSIAN_ALPHABET.length === 33 && new Set(app.RUSSIAN_ALPHABET).size === 33);
  const b1Ids = ['cases-genitive', 'cases-in-context', 'aspect-and-future', 'narration-sequence', 'movement-prefixes',
    'reflexive-imperative', 'conditions-reasons', 'relative-and-reported', 'words-and-degree', 'coherent-opinions',
    'life-experience', 'relationships-and-repair', 'travel-problems', 'home-repairs', 'work-study-interview',
    'health-lifestyle', 'services-complaints', 'phone-email-tech', 'culture-media', 'planning-and-instructions'].map(id => `ru-b1-${id}`);
  const b2Ids = ['case-government','aspect-reporting','motion-meaning','conditional-counterfactual','logical-links','relative-clauses','reported-speech','modality-register','passive-nominal','vocabulary-style','society-policy','technology-ai','environment-energy','education-health','work-negotiation','employment-contracts','formal-complaint-tech','travel-disruption','culture-critique','presentation-summary'].map(id => `ru-b2-${id}`);
  const c1Ids = ['case-relations','aspect-argument','motion-metaphor','time-counterfactual','complex-clauses','impersonal-passive','nominal-information','certainty-evidence','lexical-precision','style-cohesion','social-evidence','debate-critique','sensitive-negotiation','meeting-presentation','formal-writing','critical-media','culture-literature','intercultural-tone','professional-interview','analytical-report'].map(id => `ru-c1-${id}`);
  const stableIds = [...expectedPreA1Ids, ...expectedLessonIds, ...b1Ids, ...b2Ids, ...c1Ids];
  const allIds = app.RUSSIAN_LESSONS.map(lesson => lesson.id);
  let cursor = 0;
  for (const id of allIds) if (id === stableIds[cursor]) cursor += 1;
  check('Russian course keeps every lesson in order across Pre-A1..C1 and practice labs', app.RUSSIAN_LESSONS.length === 180
    && cursor === stableIds.length
    && app.RUSSIAN_LESSONS.every(lesson => /^lab-ru-[a-z0-9]+-\d{2}$/.test(lesson.id) || (lesson.title && lesson.situation)));
  check('Russian course keeps aligned sentence counts per level (Pre-A1: 8, A1: 16, A2..C1: 8, labs: 10/12)', sentenceCount === 1712
    && app.RUSSIAN_LESSONS.filter(lesson => !lesson.id.startsWith('lab-')).every(lesson => lesson.sentences.length === (lesson.levelId === 1 ? 16 : 8))
    && app.RUSSIAN_LESSONS.filter(lesson => lesson.id.startsWith('lab-')).every(lesson => [10, 12].includes(lesson.sentences.length)));
  check('Russian roadmap now has six levels', app.RUSSIAN_LEVELS.map(level => level.id).join('|') === '0|1|2|3|4|5'
    && app.RUSSIAN_LEVELS.length === 6
    && app.RUSSIAN_LEVELS.every((level, index) => level.title && level.description && level.modules.length > 0 && level.id === app.COURSE_LEVELS[index].id));
  const lessonsByLevel = [0, 1, 2, 3, 4, 5].map(levelId => app.RUSSIAN_LESSONS.filter(lesson => lesson.levelId === levelId));
  check('Russian roadmap groups lessons by level in order, from Pre-A1 through C1', app.RUSSIAN_LESSONS.every((lesson, index) => lesson.order === index + 1 && lesson.subtitle)
    && app.RUSSIAN_LESSONS.every((lesson, index) => index === 0 || lesson.levelId >= app.RUSSIAN_LESSONS[index - 1].levelId)
    && lessonsByLevel.map(lessons => lessons.length).join('|') === '14|29|37|37|33|30'
    && lessonsByLevel.every(lessons => lessons.length > 0)
    && lessonsByLevel.flat().length === app.RUSSIAN_LESSONS.length);
  check('Pre-A1 lesson IDs and English-aligned 14-lesson order remain stable', lessonsByLevel[0].map(lesson => lesson.id).join('|') === expectedPreA1Ids.join('|'));
  check('Pre-A1 uses 8 sentences, 4-line guided dialogue, explicit patterns and no letter-pair gating', lessonsByLevel[0].every(lesson =>
    app.starterStep(lesson.id) === undefined
    && lesson.sentences.length === 8
    && lesson.dialogue.length === 4
    && lesson.dialogue.every((line, i) => line.role === (i % 2 === 0 ? 'partner' : 'learner') || line.role === (i % 2 === 0 ? 'learner' : 'partner'))
    && lesson.sentences.every((sentence, idx) => sentence.id === `${lesson.id}-${String(idx + 1).padStart(2, '0')}`
      && sentence.vocabulary.every(item => sentence.text.toLocaleLowerCase('ru-RU').includes(item.word.toLocaleLowerCase('ru-RU'))))));
  const preA1Modules = app.RUSSIAN_LEVELS[0].modules;
  const a1Modules = app.RUSSIAN_LEVELS[1].modules;
  check('Pre-A1 has four populated curriculum modules and all 14 lessons are assigned', preA1Modules.length === 4
    && lessonsByLevel[0].every(lesson => preA1Modules.includes(lesson.module))
    && preA1Modules.every(module => lessonsByLevel[0].some(lesson => lesson.module === module)));
  check('A1 has nine populated curriculum modules and all 29 lessons are assigned', a1Modules.length === 9
    && lessonsByLevel[1].every(lesson => a1Modules.includes(lesson.module))
    && a1Modules.every(module => lessonsByLevel[1].some(lesson => lesson.module === module)));
  const russianLibrarySource = fs.readFileSync('components/RussianLibrary.tsx', 'utf8');
  check('Pre-A1 and A1 library views group lessons by module while higher levels keep their existing groups', russianLibrarySource.includes('selected.modules.map(module => selectedLessons.filter(item => item.module === module)')
    && russianLibrarySource.includes('for (let index = 0; index < selectedLessons.length; index += LESSONS_PER_GROUP)'));
  check('B1 and B2 are available', app.RUSSIAN_LEVELS[3].status === 'available'
    && app.RUSSIAN_LEVELS[4].status === 'available'
    && app.RUSSIAN_LEVELS[2].status === 'available');
  const b1 = app.RUSSIAN_LESSONS.filter(lesson => lesson.id.startsWith('ru-b1-'));
  check('B1 has two ordered thematic blocks without changing the lesson flow', b1.length === 20
    && b1.slice(0, 10).every(lesson => lesson.subtitle.startsWith('Foundation ·'))
    && b1.slice(10).every(lesson => lesson.subtitle.startsWith('Survival ·')));
  const normalizeRussian = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('ru-RU');
  check('B1 sentence ids are stable within each named lesson and all examples have attached vocabulary', b1.every(lesson =>
    lesson.sentences.every((sentence, index) => sentence.id === `${lesson.id}-${String(index + 1).padStart(2, '0')}`
      && sentence.text && sentence.fa && sentence.pronunciation && sentence.vocabulary.every(item => item.word && item.meaning
        && normalizeRussian(sentence.text).includes(normalizeRussian(item.word))))));
  check('B1 offers contextual notes, formative checks and guided dialogues', b1.every(lesson => lesson.teachingFa && lesson.dialogue.length >= 3
    && lesson.checks.length === 2 && lesson.sentences.some(sentence => sentence.pattern)));
  check('B1 has contextual reading, discussion and self-guided writing without claiming independent assessment', b1.filter(lesson => lesson.teachingFa.includes('خواندن:')).length >= 3
    && b1.filter(lesson => lesson.teachingFa.includes('نوشتن:') || lesson.teachingFa.includes('در دفتر')).length >= 3
    && b1.filter(lesson => lesson.teachingFa.includes('تمرین گفتاری:')).length >= 2);
  const b1Lesson = id => b1.find(lesson => lesson.id === `ru-b1-${id}`);
  const travelDialogue = b1Lesson('travel-problems').dialogue;
  const jobDialogue = b1Lesson('work-study-interview').dialogue;
  check('B1 travel and job dialogues include five paired turns with a practical follow-up', travelDialogue.length === 5
    && travelDialogue[2].text.includes('Ско́лько вре́мени') && travelDialogue[3].text.includes('полчаса́')
    && travelDialogue[4].text.includes('подожду́') && jobDialogue.length === 5
    && jobDialogue[3].text.includes('Как вы помога́ете') && jobDialogue[4].text.includes('отвеча́ем на вопро́сы'));
  const workNote = b1Lesson('work-study-interview').teachingFa;
  const repairNote = b1Lesson('home-repairs').teachingFa;
  check('B1 work and housing readings include five-sentence texts, questions and answer guidance', workNote.includes('Мари́я рабо́тала в магази́не два го́да.')
    && workNote.includes('Она́ хо́чет развива́ться и учи́ться но́вому.') && workNote.includes('О своём о́пыте')
    && repairNote.includes('У А́нны в кварти́ре протека́ет кран.') && repairNote.includes('ма́стер придёт по́сле обе́да.')
    && [workNote, repairNote].every(note => note.includes('پرسش‌ها:') && note.includes('پاسخ برای بررسی:') && note.includes('معنی متن:')));
  const lifeWriting = b1Lesson('life-experience').teachingFa;
  const complaintWriting = b1Lesson('services-complaints').teachingFa;
  check('B1 experience and complaint writing provide a model, criteria and self-review guidance', lifeWriting.includes('пото́му что я учу́сь но́вому')
    && lifeWriting.includes('переехал برای مرد و переехала برای زن') && complaintWriting.includes('Мо́жно верну́ть де́ньги?')
    && complaintWriting.includes('купила برای زن و купил برای مرد') && [lifeWriting, complaintWriting].every(note =>
      note.includes('نمونه:') && note.includes('۱)') && note.includes('۲)') && note.includes('۳)') && note.includes('خودتان آن را با نمونه مقایسه کنید')));
  check('B1 checks have varied answer positions and coherent answer explanations', new Set(b1.flatMap(lesson => lesson.checks.map(q => q.correctIndex))).size === 3
    && b1.every(lesson => lesson.checks.every(q => q.explanationFa && q.choices[q.correctIndex])));
  check('B1 has no mixed Latin in Russian examples and uses Cyrillic stress marks on vowels only', b1.every(lesson => [...lesson.sentences, ...lesson.dialogue].every(item =>
    !/[A-Za-zÀ-ÿ]/.test(item.text) && !/[^аеёиоуыэюяАЕЁИОУЫЭЮЯ]\u0301/.test(item.text))));
  const b2 = app.RUSSIAN_LESSONS.filter(lesson => lesson.id.startsWith('ru-b2-'));
  check('B2 has 20 lessons in two ordered blocks with contextual examples, notes and dialogue', b2.length === 20
    && b2.slice(0, 10).every(lesson => lesson.subtitle.startsWith('Foundation ·'))
    && b2.slice(10).every(lesson => lesson.subtitle.startsWith('Survival ·'))
    && b2.every(lesson => lesson.sentences.length === 8 && lesson.checks.length === 2 && lesson.teachingFa && lesson.dialogue.length >= 3
      && lesson.sentences.some(sentence => sentence.pattern)));
  check('B2 ids and vocabulary correspond to stable lesson examples', b2.every(lesson => lesson.sentences.every((sentence, index) =>
    sentence.id === `${lesson.id}-${String(index + 1).padStart(2, '0')}` && sentence.vocabulary.every(item => item.word && item.meaning
      && normalizeRussian(sentence.text).includes(normalizeRussian(item.word))))));
  check('B2 checks vary answer positions and have explanations', new Set(b2.flatMap(lesson => lesson.checks.map(q => q.correctIndex))).size === 3
    && b2.every(lesson => lesson.checks.every(q => q.explanationFa && q.choices[q.correctIndex])));
  check('B2 Russian examples use Cyrillic and valid stress marks', b2.every(lesson => [...lesson.sentences, ...lesson.dialogue].every(item =>
    !/[A-Za-zÀ-ÿʒ]/.test(item.text) && !/[^аеёиоуыэюяАЕЁИОУЫЭЮЯ]\u0301/.test(item.text))));
  check('B2 includes four fictional reading examples with questions and two modelled self-review writing tasks',
    ['society-policy','technology-ai','employment-contracts','culture-critique'].every(id => {
      const note = b2.find(lesson => lesson.id === `ru-b2-${id}`).teachingFa;
      return note.includes('پرسش‌ها:') && note.includes('پاسخ:');
    }) && ['formal-complaint-tech','presentation-summary'].every(id => {
      const note = b2.find(lesson => lesson.id === `ru-b2-${id}`).teachingFa;
      return note.includes('خودارزیابی') && note.includes('نمونهٔ فرضی:') && note.includes('معنی:');
    }));
  const b2Lesson = id => b2.find(lesson => lesson.id === `ru-b2-${id}`);
  const cultureDialogue = b2Lesson('culture-critique').dialogue;
  const negotiationDialogue = b2Lesson('work-negotiation').dialogue;
  check('B2 respectful debate and professional negotiation include complete extended dialogue turns',
    cultureDialogue.length === 8 && cultureDialogue[4].text.includes('Я понима́ю ва́шу то́чку зре́ния')
    && cultureDialogue[7].text.includes('Наприме́р') && negotiationDialogue.length === 7
    && negotiationDialogue[5].text.includes('к пя́тнице') && negotiationDialogue[6].text.includes('пересмо́трим срок')
    && [...cultureDialogue, ...negotiationDialogue].every(turn => turn.speaker && turn.text && turn.fa));
  check('B2 supplementary social and media readings include fictional passages, inference questions, supported answers and translations',
    ['society-policy', 'culture-critique'].every(id => {
      const note = b2Lesson(id).teachingFa;
      return note.includes('خواندن تکمیلی') && note.includes('متن فرضی') && note.includes('ایدهٔ اصلی')
        && note.includes('پاسخ برای بررسی:') && note.includes('معنی متن:') && note.includes('واژه‌های راهنما:');
    }) && b2Lesson('society-policy').teachingFa.includes('обе позиции заслуживают внимания')
      && b2Lesson('culture-critique').teachingFa.includes('проверка не менее необходима'));
  check('B2 argument and report writing provide guided tasks, Russian models, Persian translations and self-review criteria',
    ['environment-energy', 'presentation-summary'].every(id => {
      const note = b2Lesson(id).teachingFa;
      return note.includes('نوشتن هدایت‌شده') && note.includes('تکلیف:') && note.includes('نمونهٔ فرضی:')
        && note.includes('معنی نمونه:') && note.includes('معیار خودارزیابی:') && note.includes('برنامه')
        && note.includes('تصحیح نمی‌کند');
    }) && b2Lesson('environment-energy').teachingFa.includes('обоснованное решение')
      && b2Lesson('presentation-summary').teachingFa.includes('выводы остаются предварительными'));
  const c1 = app.RUSSIAN_LESSONS.filter(lesson => lesson.id.startsWith('ru-c1-'));
  check('C1 contains 20 lessons in two thematic blocks with eight examples and two checks each', c1.length === 20
    && c1.slice(0, 10).every(lesson => lesson.subtitle.startsWith('Foundation ·'))
    && c1.slice(10).every(lesson => lesson.subtitle.startsWith('Survival ·'))
    && c1.every(lesson => lesson.sentences.length === 8 && lesson.checks.length === 2 && lesson.teachingFa && lesson.dialogue.length >= 3
      && lesson.sentences.some(sentence => sentence.pattern)));
  check('C1 has stable ids, sentence-linked vocabulary, clean Russian and varied question positions', c1.every(lesson =>
    lesson.sentences.every((sentence, index) => sentence.id === `${lesson.id}-${String(index + 1).padStart(2, '0')}`
      && sentence.vocabulary.every(item => item.word && item.meaning && normalizeRussian(sentence.text).includes(normalizeRussian(item.word))))
    && [...lesson.sentences, ...lesson.dialogue].every(item => !/[A-Za-zÀ-ÿʒ]/.test(item.text) && !/[^аеёиоуыэюяАЕЁИОУЫЭЮЯ]\u0301/.test(item.text))
    && lesson.checks.every(q => q.explanationFa && q.choices[q.correctIndex]))
    && new Set(c1.flatMap(lesson => lesson.checks.map(q => q.correctIndex))).size === 3);
  check('C1 includes contextual fictional analytical readings and modelled self-review writing',
    ['social-evidence', 'critical-media', 'culture-literature'].every(id => {
      const note = c1.find(lesson => lesson.id === `ru-c1-${id}`).teachingFa;
      return note.includes('فرضی') && note.includes('پرسش') && note.includes('پاسخ:') && note.includes('معنی:');
    }) && c1.find(lesson => lesson.id === 'ru-c1-social-evidence').teachingFa.includes('تمرین نوشتن استدلالی خودارزیابی')
    && ['formal-writing', 'analytical-report'].every(id => {
      const note = c1.find(lesson => lesson.id === `ru-c1-${id}`).teachingFa;
      return note.includes('خودارزیابی') && note.includes('نمونهٔ فرضی:') && note.includes('معیار') && note.includes('تصحیح نمی');
    }));
  const c1Lesson = id => c1.find(lesson => lesson.id === `ru-c1-${id}`);
  const c1Debate = c1Lesson('social-evidence').dialogue;
  const c1Negotiation = c1Lesson('sensitive-negotiation').dialogue;
  check('C1 respectful debate and tentative professional negotiation each have eight complete turns',
    c1Debate.length === 8 && c1Debate[6].text.includes('ра́зные сезо́ны')
    && c1Debate[7].text.includes('недоста́точно') && c1Debate[7].text.includes('ра́зные пери́оды')
    && c1Negotiation.length === 8 && c1Negotiation[6].text.includes('резе́рвный срок')
    && c1Negotiation[7].text.includes('по́сле согласова́ния')
    && [...c1Debate, ...c1Negotiation].every(turn => turn.speaker && turn.text && turn.fa)
    && c1Lesson('sensitive-negotiation').checks.some(q => q.explanationFa.includes('پس از تأیید')));
  const c1Reading = c1Lesson('critical-media').teachingFa;
  check('C1 additional analytical reading presents evidence, inference questions, answers and translation',
    c1Reading.includes('خواندن تکمیلی C1') && c1Reading.includes('متن فرضی')
    && c1Reading.includes('Из 120 посетителей, добровольно ответивших на вопросы, 80')
    && c1Reading.includes('استدلال اصلی') && c1Reading.includes('به‌طور ضمنی')
    && c1Reading.includes('پاسخ برای بررسی:') && c1Reading.includes('معنی متن:')
    && c1Reading.includes('رابطهٔ علّی نیست'));
  check('C1 summary and paraphrase task use the same text, with models, translation and self-assessment',
    c1Reading.includes('تمرین خلاصه‌نویسی و بازنویسی · خودارزیابی')
    && c1Reading.includes('متن بالا را بیرون از برنامه') && c1Reading.includes('نمونهٔ خلاصه:')
    && c1Reading.includes('معنی نمونهٔ خلاصه:') && c1Reading.includes('نمونهٔ بازنویسی:')
    && c1Reading.includes('пока они не доказывают') && c1Reading.includes('معیار خودارزیابی:')
    && c1Reading.includes('پاسخ آزاد به‌طور خودکار ذخیره یا تصحیح نمی‌شود'));
  const allRussianIds = app.RUSSIAN_LESSONS.flatMap(lesson => [lesson.id, ...lesson.sentences.map(sentence => sentence.id)]);
  check('Russian lesson and sentence IDs are unique', new Set(allRussianIds).size === allRussianIds.length);
  const coreLessons = app.RUSSIAN_LESSONS.filter(lesson => !lesson.id.startsWith('lab-'));
  check('Russian target sentences use Cyrillic and every pronunciation is complete and contains no Cyrillic', coreLessons.every(lesson => lesson.sentences.every(sentence => /[А-Яа-яЁё]/.test(sentence.text)
    && !!sentence.fa && !!sentence.pronunciation && !/[А-Яа-яЁё]/.test(sentence.pronunciation) && sentence.vocabulary.length > 0)
    && lessonsByLevel.slice(0, 2).flat().every(lesson => lesson.dialogue.every(turn => !!turn.pronunciation && !/[А-Яа-яЁё]/.test(turn.pronunciation)))));
  check('Russian practice-lab sentences keep Cyrillic text, translation, a guide and vocabulary', app.RUSSIAN_LESSONS.filter(lesson => lesson.id.startsWith('lab-')).every(lesson => lesson.sentences.every(sentence => /[А-Яа-яЁё]/.test(sentence.text)
    && !!sentence.fa && !!sentence.pronunciation && sentence.vocabulary.length > 0)));
  check('every lesson has a short dialogue and valid self-study checks', coreLessons.every(lesson => lesson.dialogue.length >= 3
    && lesson.dialogue.every(line => /[А-Яа-яЁё]/.test(line.text) && !!line.fa)
    && lesson.checks.length === (lesson.levelId === 0 ? 3 : 2) && lesson.checks.every(question => question.choices.length === (lesson.levelId === 0 ? 4 : 3)
      && new Set(question.choices).size === question.choices.length && question.correctIndex >= 0 && question.correctIndex < question.choices.length)));
  check('sentence-builder grammar notes stay attached to original Russian examples', app.RUSSIAN_LESSONS.every(lesson => lesson.sentences.filter(sentence => sentence.pattern)
    .every(sentence => sentence.text && sentence.fa)));
  // Keep the A1 examples aligned with the 29-lesson Foundation (10) + Survival (19) English structure.
  const a1 = app.RUSSIAN_LESSONS.filter(lesson => lesson.levelId === 1);
  check('A1 has 29 lessons × 16 sentences = 464 sentences with stable lesson-prefixed IDs and clean stress marks', a1.length === 29
    && a1.every(lesson => lesson.sentences.length === 16
      && lesson.sentences.every((sentence, idx) => sentence.id === `${lesson.id}-${String(idx + 1).padStart(2, '0')}`)
      && [...lesson.sentences, ...lesson.dialogue].every(item => !/[A-Za-zÀ-ÿ]/.test(item.text) && !/[^аеёиоуыэюяАЕЁИОУЫЭЮЯ]\u0301/.test(item.text))));
  const preLines = new Set(lessonsByLevel[0].flatMap(l => l.sentences.map(s => normalizeRussian(s.text).replace(/[^а-я0-9 ]/g,''))));
  const shared = a1.flatMap(l => l.sentences.filter(s => preLines.has(normalizeRussian(s.text).replace(/[^а-я0-9 ]/g,''))));
  check('A1 does not duplicate the Pre-A1 utterance list and teaches Cyrillic reading/spelling in its dedicated alphabet lesson', !shared.length
    && a1.filter(l => l.id !== 'ru-a1-alphabet-and-spelling').every(l => !l.teachingFa.includes('الفبا')));
  // Optional cold comprehension for the Russian A1 band (lib/languages/russianA1Skills.ts).
  const a1Skills = app.RUSSIAN_A1_SKILLS;
  const a1SkillTasks = Object.values(a1Skills).flat();
  check('A1 independent reading/listening tasks point at real A1 lessons', Object.keys(a1Skills).every(id => lessonsByLevel[1].some(lesson => lesson.id === id)));
  check('every A1 lesson with a cold message has one listening and one reading task', Object.values(a1Skills).every(tasks => tasks.length === 2
    && tasks.some(task => task.kind === 'listening') && tasks.some(task => task.kind === 'reading')));
  check('A1 cold messages are decodable Russian with three distinct Persian choices and a valid answer', a1SkillTasks.every(task => /[А-Яа-я]/.test(task.passage)
    && !/[A-Za-z]/.test(task.passage) && /\u0301/.test(task.passage) && task.passage.split(/\s+/).length >= 5
    && task.choices.length === 3 && new Set(task.choices).size === 3
    && task.choices.every(choice => /[\u0600-\u06FF]/.test(choice) && !/[А-Яа-я]/.test(choice))
    && task.correctIndex >= 0 && task.correctIndex < 3 && !!task.promptFa && !!task.explanationFa));
  const bandLines = new Set(lessonsByLevel[0].concat(lessonsByLevel[1]).flatMap(lesson => lesson.sentences.map(sentence => sentence.text)));
  check('A1 cold messages never reuse a rehearsed dialogue line', !a1SkillTasks.some(task => bandLines.has(task.passage)));
  check('A1 cold messages stay inside the vocabulary the two bands already show', (() => {
    const fold = value => value.toLowerCase().replace(/\u0301/g, '').replace(/ё/g, 'е');
    const words = value => (value.match(/[А-Яа-яЁё\u0301]+(?:-[А-Яа-яЁё\u0301]+)*/g) ?? []).map(fold);
    const taught = new Set();
    for (const lesson of lessonsByLevel[0].concat(lessonsByLevel[1])) {
      for (const sentence of lesson.sentences) {
        for (const word of words(sentence.text)) taught.add(word);
        for (const entry of sentence.vocabulary ?? []) for (const word of words(entry.word)) taught.add(word);
      }
      for (const turn of lesson.dialogue ?? []) for (const word of words(turn.text)) taught.add(word);
    }
    const stems = new Set([...taught].filter(word => word.length > 3).map(word => word.slice(0, 4)));
    const known = word => word.length <= 2 || taught.has(word) || word.startsWith('по-')
      || stems.has(word.slice(0, 4)) || (word.endsWith('ла') && taught.has(word.slice(0, -2) + 'л'));
    const unknown = new Set();
    for (const task of a1SkillTasks) for (const word of words(task.passage)) if (!known(word)) unknown.add(word);
    if (unknown.size) process.stdout.write(`  untaught in cold messages: ${[...unknown].join(', ')}\n`);
    return unknown.size === 0;
  })());

  check('A1 cold messages do not leak the answer through a fixed slot', new Set(a1SkillTasks.map(task => task.correctIndex)).size >= 2
    && a1SkillTasks.length >= 14);

  check('A1 cold messages stay optional: the graded checks of an A1 lesson are still two', a1.every(lesson => lesson.checks.length === 2));

  check('A1 rehearses complete 6-turn guided dialogues and explicit slot patterns', a1.every(l => l.dialogue.length === 6 && l.sentences.some(s => !!s.pattern)));
  check('A1 exit tasks have unique situations and valid 3-choice checks', new Set(a1.map(l => l.checks[0].promptFa)).size === 29
    && a1.every(l => l.checks.length === 2 && l.checks.every(c => c.choices.length === 3 && c.explanationFa)));
  check('A1 vocabulary remains anchored to the exact spoken line', a1.every(l => l.sentences.every(s => s.vocabulary.every(v => normalizeRussian(s.text).includes(normalizeRussian(v.word)) && v.meaning))));
  // In-place A2 revisions must keep the review-card and session addresses stable.
  const a2 = app.RUSSIAN_LESSONS.filter(lesson => lesson.id.startsWith('ru-l3-'));
  const a2Sentences = a2.flatMap(lesson => lesson.sentences);
  const a2Sentence = id => a2Sentences.find(sentence => sentence.id === id);
  const a2Note = id => a2.find(lesson => lesson.id === id)?.teachingFa || '';
  check('A2 retains twenty lessons and its ordered 160 review sentence IDs', a2.length === 20
    && a2.every(lesson => lesson.sentences.length === 8)
    && a2Sentences.map(sentence => sentence.id).join('|') === Array.from({ length: 160 }, (_, i) => `ru3-${String(i + 1).padStart(2, '0')}`).join('|'));
  const a2Examples = {
    'ru3-19': 'начнётся', 'ru3-30': 'мою́ сестру́', 'ru3-37': 'така́я же тяжёлая',
    'ru3-54': 'предпочита́ю чай ко́фе', 'ru3-59': 'экза́мен', 'ru3-61': 'пе́рвого ма́я',
    'ru3-66': 'аре́нда', 'ru3-87': 'регистра́ция на рейс', 'ru3-95': 'что́бы найти́ рабо́ту',
    'ru3-110': 'приме́рить', 'ru3-111': 'со ски́дкой', 'ru3-115': 'сдать ана́лиз',
    'ru3-119': 'температу́ра и ка́шель', 'ru3-126': 'сообще́ние', 'ru3-139': 'стано́вятся',
    'ru3-146': 'Два килогра́мма', 'ru3-150': 'без лу́ка', 'ru3-155': 'поняла́',
  };
  check('A2 grammar and practical examples remain in their original slots', Object.entries(a2Examples).every(([id, text]) => a2Sentence(id)?.text.includes(text)));
  check('A2 spoken sentences do not contain gender-choice parentheses', a2Sentences.every(sentence => !/[()]/.test(sentence.text)));
  check('A2 notes distinguish grammar, pronunciation and practical message writing', a2Note('ru-l3-past-simple').includes('книга → книгу')
    && a2Note('ru-l3-past-simple').includes('تکیه') && a2Note('ru-l3-appearance').includes('حالت فاعلی')
    && a2Note('ru-l3-work-study').includes('داتیو') && a2Note('ru-l3-travel').includes('Иду / еду')
    && a2Note('ru-l3-daily-sequence').includes('перед сном با حالت ابزاری')
    && a2Note('ru-l3-phone-internet').includes('تمرین نوشتن'));
  const travelReading = a2Note('ru-l3-travel');
  const phoneReading = a2Note('ru-l3-phone-internet');
  check('A2 has two short contextual readings with questions and answer guidance', travelReading.includes('За́втра мы е́дем в Каза́нь на по́езде.')
    && travelReading.includes('پرسش: هتل کجاست؟') && travelReading.includes('Ря́дом с вокза́лом')
    && phoneReading.includes('Я не могу́ отве́тить.') && phoneReading.includes('پرسش: فرستنده چه زمانی دوباره تماس می‌گیرد؟')
    && phoneReading.includes('پاسخ برای بررسی: Че́рез час'));
  check('A2 message writing remains a self-guided activity with concrete substitution and comparison', phoneReading.includes('در دفتر یا بیرون از برنامه')
    && phoneReading.includes('за́втра یا в три ча́са') && phoneReading.includes('با نمونه مقایسه کنید'));
  const shoppingDialogue = a2.find(lesson => lesson.id === 'ru-l3-shopping-return').dialogue;
  const doctorDialogue = a2.find(lesson => lesson.id === 'ru-l3-health-doctor').dialogue;
  check('A2 shopping and doctor dialogues keep three turns and pair a follow-up with its response', shoppingDialogue.length === 3
    && shoppingDialogue[1].text.includes('Вам ну́жен друго́й цвет?') && shoppingDialogue[2].text.includes('си́ний цвет')
    && doctorDialogue.length === 3 && doctorDialogue[1].text.includes('Мне ну́жен ана́лиз?')
    && doctorDialogue[2].text.includes('осмотрю́ го́рло') && doctorDialogue[2].text.includes('пото́м реши́м'));
  const shoppingCheck = a2.find(lesson => lesson.id === 'ru-l3-shopping-return').checks[1];
  check('A2 shopping spelling correction preserves the saved answer slot', shoppingCheck.correctIndex === 0
    && shoppingCheck.choices[0] === 'чек' && shoppingCheck.choices[2] === 'ски́дка');
  const timeCheck = app.RUSSIAN_LESSONS.find(lesson => lesson.id === 'ru-a1-time-and-calendar').checks[0];
  check('A1 calendar check tests yesterday/day comprehension', timeCheck.choices[timeCheck.correctIndex] === 'دیروز یکشنبه بود.');
  check('Russian follows the shared ten-stage lesson flow with conversation after speaking', app.RUSSIAN_LESSON_STAGES.length === 10
    && app.RUSSIAN_LESSON_STAGES.every((stage, index) => stage.id === app.ENGLISH_ENGINE_STEPS[index].id
      && stage.labelFa === app.ENGLISH_ENGINE_STEPS[index].labelFa
      && stage.labelEn === app.ENGLISH_ENGINE_STEPS[index].labelEn));
  const russianLessonScreen = fs.readFileSync('components/RussianLesson.tsx', 'utf8');
  check('Russian conversation stage runs the lesson dialogue with its own roles and the Russian voice', /stage === 9 &&[\s\S]*<LessonConversationRoom/.test(russianLessonScreen)
    && russianLessonScreen.includes('dialogue={lesson.dialogue}')
    && russianLessonScreen.includes('fallback={lesson.sentences.map(sentence => ({ text: sentence.text, fa: sentence.fa }))}')
    && russianLessonScreen.includes('locale="ru-RU"')
    // the room is shared: the dialogue must drive the roles, and a stuck learner must always have a way on
    && fs.readFileSync('components/LessonConversationRoom.tsx', 'utf8').includes('result.heard.trim()')
    && fs.readFileSync('components/LessonConversationRoom.tsx', 'utf8').includes('setTyped(true)'));
  check('Russian speaking test is optional and Continue remains available', !russianLessonScreen.includes('speakingTestComplete')
    && russianLessonScreen.includes('disabled={saving || !!sessionError}'));
  check('English lesson scope includes the original material, Pre-A1, practice labs and the A2, B1 and B2 lessons', app.SENTENCE_LESSONS.length === 274
    && app.SENTENCE_LESSONS.reduce((sum, lesson) => sum + lesson.sentences.length, 0) === 4852
    && app.SENTENCE_LESSONS.filter(lesson => lesson.levelId === 0).length === 14
    && app.SENTENCE_LESSONS.filter(lesson => lesson.levelId === 0).reduce((sum, lesson) => sum + lesson.sentences.length, 0) === 112
    && app.SENTENCE_LESSONS.filter(lesson => lesson.levelId === 2).length === 37
    && app.SENTENCE_LESSONS.filter(lesson => lesson.levelId === 2).reduce((sum, lesson) => sum + lesson.sentences.length, 0) === 1170
    && app.SENTENCE_LESSONS.filter(lesson => lesson.levelId === 3 && !lesson.b1Section).length === 26
    && app.SENTENCE_LESSONS.filter(lesson => lesson.levelId === 3 && !lesson.b1Section).reduce((sum, lesson) => sum + lesson.sentences.length, 0) === 860);
  check('language picker adds tr without changing existing en/ru locales', app.LANGUAGES.map(language => language.id).slice(0, 3).join('|') === 'en|ru|tr'
    && app.LANGUAGES.find(language => language.id === 'en').speechLocale === 'en-US'
    && app.LANGUAGES.find(language => language.id === 'ru').speechLocale === 'ru-RU'
    && app.LANGUAGES.find(language => language.id === 'tr').speechLocale === 'tr-TR');
  check('Russian lesson count and home route are registered', app.LANGUAGES.find(language => language.id === 'ru').lessonsCount === app.RUSSIAN_LESSONS.length
    && app.LANGUAGES.find(language => language.id === 'ru').home === '/learn/ru'
    && app.russianProgress && typeof app.russianProgress.completeSentenceLesson === 'function');
  check('Russian has independent progress and draft/session storage namespaces', app.RUSSIAN_STUDY_STORAGE_KEY === 'russian_lesson_sessions_v1'
    && app.RUSSIAN_STUDY_STORAGE_KEY !== 'sentence_course_progress_ru_v2');
  check('Russian lesson navigation follows all course boundaries and stops at the end', app.RUSSIAN_LESSONS.every((lesson, index) =>
    app.nextLessonInOrder(app.RUSSIAN_LESSONS, lesson.id)?.id === app.RUSSIAN_LESSONS[index + 1]?.id)
    && app.nextLessonInOrder(app.RUSSIAN_LESSONS, 'unknown') === undefined);
  check('previous sentence is bounded at the start', app.previousSentenceIndex(0) === 0 && app.previousSentenceIndex(4) === 3);
  const russianHome = fs.readFileSync('components/RussianHome.tsx', 'utf8');
  const russianLesson = fs.readFileSync('components/RussianLesson.tsx', 'utf8');
  const russianRoute = fs.readFileSync('app/learn/ru/lesson.tsx', 'utf8');
  check('Russian home resets the displayed lesson while level replay is separate', russianHome.includes("id: heroLesson.id, fromStart: '1'")
    && russianHome.includes('id: RUSSIAN_LESSONS[0].id, levelReplay:') && russianRoute.includes("fromStart === '1'"));
  check('Russian restart saves a fresh session and completion navigates after saving', russianLesson.includes('resetRussianLessonSession(lesson.id)')
    && russianLesson.includes('await russianProgress.completeSentenceLesson') && russianLesson.includes('params: { id: nextLesson.id }')
    && russianLesson.includes('currentProgressIndex > nextIndex') && russianLesson.includes('جملهٔ قبلی'));

  const memory = new Map();
  global.__russianSupabaseCalls = 0;
  global.window = { localStorage: {
    getItem(key) { return memory.has(key) ? memory.get(key) : null; },
    setItem(key, value) { memory.set(key, String(value)); },
    removeItem(key) { memory.delete(key); },
  } };
  const firstLesson = app.RUSSIAN_LESSONS[0];
  const firstLoad = await app.loadRussianLessonSessionWithPresence(firstLesson.id);
  check('new Russian session reports no saved session', !firstLoad.hasSavedSession && firstLoad.session.stage === 0);
  const fresh = await app.loadRussianLessonSession(firstLesson.id);
  check('new Russian session starts at stage one without writing another language key', fresh.stage === 0 && memory.size === 0);
  const saved = { stage: 4, sentenceIndex: 2, revealed: true, answers: { '0': 1 }, showCheckAnswers: false };
  // Loaders may add bookkeeping such as stageVersion; the saved learner fields must survive untouched.
  const sameSession = (stored, expected) => ['stage', 'sentenceIndex', 'revealed', 'answers', 'showCheckAnswers']
    .every(key => JSON.stringify(stored[key]) === JSON.stringify(expected[key]));
  await app.saveRussianLessonSession(firstLesson.id, saved);
  const restored = await app.loadRussianLessonSession(firstLesson.id);
  const savedLoad = await app.loadRussianLessonSessionWithPresence(firstLesson.id);
  check('saved Russian session presence is detected without changing stored data', savedLoad.hasSavedSession && sameSession(savedLoad.session, saved));
  check('Russian session resumes its stage, sentence and local check answer', sameSession(restored, saved));
  check('session data is stored only under the Russian session key', memory.size === 1 && memory.has(app.RUSSIAN_STUDY_STORAGE_KEY));
  const invalid = { ...saved, stage: 99 };
  await assert.rejects(() => app.saveRussianLessonSession(firstLesson.id, invalid));
  const storedAfterInvalidSave = JSON.parse(memory.get(app.RUSSIAN_STUDY_STORAGE_KEY));
  check('invalid Russian session cannot overwrite stored progress', storedAfterInvalidSave.schema === 1
    && Object.keys(storedAfterInvalidSave.sessions).length === 1 && sameSession(storedAfterInvalidSave.sessions[firstLesson.id], saved));
  await app.clearRussianLessonSession(firstLesson.id);
  check('clearing the Russian lesson session does not touch course-progress storage', memory.size === 0);
  memory.set(app.RUSSIAN_STUDY_STORAGE_KEY, JSON.stringify({ schema: 1, sessions: {
    [firstLesson.id]: { ...saved, checksRevision: 'ru-pre-a1-a1-content-3' },
  } }));
  const migratedSession = await app.loadRussianLessonSession(firstLesson.id);
  check('revised lesson checks retire only old answers while preserving the saved lesson position', migratedSession.stage === saved.stage
    && migratedSession.sentenceIndex === saved.sentenceIndex && migratedSession.revealed === saved.revealed
    && Object.keys(migratedSession.answers).length === 0 && !migratedSession.showCheckAnswers);
  await app.clearRussianLessonSession(firstLesson.id);
  await app.russianProgress.completeSentenceLesson(firstLesson.id, app.RUSSIAN_LESSONS[1].id);
  const savedProgress = await app.russianProgress.getCourseProgress();
  check('Russian lesson completion persists under its own progress key and advances', savedProgress.completedLessonIds.includes(firstLesson.id)
    && savedProgress.currentLessonId === app.RUSSIAN_LESSONS[1].id
    && memory.has('sentence_course_progress_ru_v2')
    && !memory.has('sentence_course_progress_v1')
    && !memory.has('sentence_course_progress_de_v1'));
  check('Russian completion enrolls only its eight sentences in local spaced review', (await app.russianProgress.getDueReviewCards()).length === 8
    && (await app.russianProgress.getDueReviewCards()).every(card => card.lessonId === firstLesson.id));
  check('Russian completion does not invent study minutes or English vocabulary mastery', savedProgress.totalMinutes === 0
    && savedProgress.learnedEssential504Words.length === 0);
  check('Russian progress never calls the Supabase cloud client', global.__russianSupabaseCalls === 0);

  // ── phase 3: how the course is measured ────────────────────────────────────────────────
  const core = app.ruBeginner;
  const CORE_NOISE = ['млн', 'млрд', 'тыс', 'области', 'района', 'партии', 'президента', 'правительства', 'апреля', 'июня', 'населения', 'смерти', 'организации', 'депутатов'];
  check('the beginner core is a teachable word list: bare lowercase Cyrillic, unique, sized for the beginner bands',
    Array.isArray(core.words) && core.words.length >= app.COURSE_SPEC.pre.vocabularyCeiling
      && core.words.length <= app.COURSE_SPEC.A1.vocabularyCeiling
      && core.words.every(word => /^[а-яё]+$/.test(word))
      && new Set(core.words).size === core.words.length
      && core.words.every(word => !CORE_NOISE.includes(word)));
  check('the beginner core names the bands it measures, and only those', JSON.stringify(core.bands) === JSON.stringify(['pre', 'A1']));
  const readinessAudit = app.RUSSIAN_LESSONS.map(lesson => ({
    id: lesson.id, levelId: lesson.levelId, title: lesson.title, sentences: lesson.sentences,
    hasDialogue: (lesson.dialogue || []).length > 0, checks: (lesson.checks || []).length,
  }));
  const onCorpus = app.computeReadiness('ru', readinessAudit, app.ruFrequency, 60);
  const onCore = app.computeReadiness('ru', readinessAudit, app.ruFrequency, 60, undefined, { beginnerFrequency: core });
  check('Pre-A1 and A1 are measured on the beginner core, the bands above stay on the corpus list',
    onCore.bands[0].vocabularyTarget === 'beginner' && onCore.bands[1].vocabularyTarget === 'beginner'
      && onCore.bands.slice(2).every(band => band.vocabularyTarget === 'corpus'));
  check('the beginner core measures at least what the corpus list credited, and reports its target size',
    onCore.bands[0].coverage >= onCorpus.bands[0].coverage && onCore.bands[1].coverage >= onCorpus.bands[1].coverage
      && onCore.bands[0].vocabularyTargetSize === app.COURSE_SPEC.pre.vocabularyCeiling
      && onCore.bands[1].vocabularyTargetSize === core.words.length);
  check('one family gets one target slot: no beginner word is listed twice under two case forms',
    core.words.filter((word, index) => core.words.some((other, position) => position < index
      && word.length >= 5 && other.length >= 5 && word.slice(0, 5) === other.slice(0, 5) && Math.abs(word.length - other.length) <= 3)).length === 0);
  check('an inflected taught form credits its dictionary word (хочу counts for хотеть, пишет for писать)',
    app.sameFamily(app.familyKey('ru', 'хотеть'), app.familyKey('ru', 'хочу'))
      && app.sameFamily(app.familyKey('ru', 'писать'), app.familyKey('ru', 'пишет'))
      && app.sameFamily(app.familyKey('ru', 'мочь'), app.familyKey('ru', 'может'))
      && app.sameFamily(app.familyKey('ru', 'жена'), app.familyKey('ru', 'жену'))
      && !app.sameFamily(app.familyKey('ru', 'жена'), app.familyKey('ru', 'женщина'))
      && app.familyKey('de', 'kommen') === null);
  check('the structure branch averages the signals the course data carries, and skips the ones it does not',
    onCore.bands.every(band => {
      if (!band.lessons) return band.structureScore === 0;
      const ratio = (value, total) => total <= 0 ? 100 : Math.max(0, Math.min(100, Math.round((value / total) * 100)));
      const signals = [ratio(band.lessons, band.lessonsTarget), ratio(band.sentences, band.sentencesTarget), ratio(band.lessonsWithChecks, band.lessons)];
      return band.structureScore === Math.round(signals.reduce((sum, signal) => sum + signal, 0) / signals.length);
    }));
  check('readiness is the weaker of the two branches and never counts content packs in the headline',
    onCore.bands.every(band => band.readiness === (band.lessons ? Math.min(band.structureScore, band.coverage) : 0))
      && onCore.packsIncluded === false
      && (() => {
        // Any word the band does not teach will do; taking the last entry of the list went stale as soon as
        // the course grew into it, and the branch then silently stopped being exercised.
        const untaught = onCore.bands[1].gaps[0] ?? core.words[core.words.length - 1];
        const withPacks = app.computeReadiness('ru', readinessAudit, app.ruFrequency, 60, { A1: [untaught] }, { beginnerFrequency: core });
        const a1 = withPacks.bands[1];
        // Percentages are rounded, so compare the counts: one extra pack word must move the side figure and
        // leave the headline exactly where the course alone put it.
        return withPacks.packsIncluded === true && a1.coveredWordsWithPacks > a1.coveredWords && a1.coverage === a1.coverageCourse
          && a1.coveredWords === a1.coveredWordsCourse && a1.coverageWithPacks >= a1.coverage;
      })());
  const readinessLine = fs.readFileSync('components/LevelReadinessLine.tsx', 'utf8');
  check('the level card shows both readiness branches and keeps the pack number beside the vocabulary branch',
    readinessLine.includes('label="ساختار"') && readinessLine.includes("'واژگان مقدماتی'")
      && readinessLine.includes("'واژگان پربسامد'") && readinessLine.includes('band.structureScore')
      && readinessLine.includes('band.coverageWithPacks > band.coverage') && readinessLine.includes('vocabularyTargetSize'));

  console.log(`${checks.length} Russian curriculum, lesson flow, registry, session-resume and language-isolation checks passed (${sentenceCount} Russian sentences).`);
})().catch(error => { console.error(error); process.exit(1); });
