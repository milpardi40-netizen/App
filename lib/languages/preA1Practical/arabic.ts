import { balanceSamples, balancedTeaching } from './balance';
import { balancedAssessmentRevision } from './balanceRevision';
import { shuffleChecks } from '../../shuffleChecks';
import type { ArabicCheck, ArabicLesson } from '../../arabic/content';
import plans from './arabic.json';
import { practicalNotes, PRACTICAL_PRE_A1_REVISION, type PracticalPlan } from './model';

const GRAMMAR: Record<string, readonly [string, string, readonly string[], string]> = {
  'ar-prea1-02-first-words-core-nouns': ['کدام ضمیر یعنی «او (زن)»؟', 'هِيَ', ['هُوَ', 'أَنَا'], 'هي برای او (زن)، هو برای او (مرد) و أنا برای من است.'],
  'ar-prea1-08-word-pairs-nouns-adjectives': ['کدام ترکیب برای «کیف نو» هماهنگ است؟', 'حَقِيبَةٌ جَدِيدَةٌ.', ['حَقِيبَةٌ جَدِيدٌ.', 'كِتَابٌ جَدِيدَةٌ.'], 'حقيبة مؤنث است و صفت آن جديدة می‌آید.'],
  'ar-prea1-11-first-sentences-actions-negation': ['برای «نمی‌فهمم» کدام صورت درست است؟', 'لَا أَفْهَمُ.', ['أَنَا أَفْهَمُ.', 'أَعْرِفُ الْجَوَابَ.'], 'لا پیش از أفهم آن را منفی می‌کند.'],
  'ar-prea1-14-basic-grammar-nouns-pronouns': ['برای اشاره به یک کیف کدام صورت هماهنگ است؟', 'هَذِهِ حَقِيبَةٌ.', ['هَذَا حَقِيبَةٌ.', 'هَذِهِ كِتَابٌ.'], 'حقيبة مؤنث است و با هذه می‌آید.'],
  'ar-prea1-15-basic-grammar-verbs-possessives-prepositions': ['برای «او (مرد) می‌نویسد» کدام درست است؟', 'هُوَ يَكْتُبُ.', ['هُوَ أَكْتُبُ.', 'هُوَ تَكْتُبُ.'], 'با هو از يكتب استفاده می‌کنیم.'],
  'ar-prea1-20-language-skills-capstone': ['برای «نام من» کدام ترکیب درست است؟', 'اِسْمِي', ['اسْمُكَ', 'اسْمُكِ'], 'پسوند ي به گوینده مربوط است؛ كَ/كِ به مخاطب مربوط‌اند.'],
};
export function enrichArabicPreA1(lesson: ArabicLesson): ArabicLesson {
  const plan = (plans as unknown as Record<string, PracticalPlan>)[lesson.id];
  if (lesson.levelId !== 0 || !plan?.rows) return lesson;
  let rows = plan.rows;
  let sentences = lesson.sentences.map((sentence, index) => {
    const row = rows[index];
    return { ...sentence, ar: row[0], arPlain: row[0].replace(/[\u064B-\u065F\u0670]/g, ''), fa: row[1], pronunciation: row[2], pattern: index === 1 ? plan.pattern : undefined, vocabulary: [{ word: row[3], meaning: row[4], core: true as const }] };
  });
  const dialogue = (plan.turns ?? []).map((index, turn) => ({ speaker: turn % 2 ? 'learner' as const : 'partner' as const, ar: rows[index][0], fa: rows[index][1], pronunciation: rows[index][2] }));
  sentences = balanceSamples(lesson.id, sentences.map(sentence => ({ ...sentence, text: sentence.ar }))).map(({ text, ...sentence }) => ({
    ...sentence, ar: text, arPlain: text.replace(/[\u064B-\u065F\u0670]/g, ''), vocabulary: sentence.vocabulary.map(item => ({ ...item, core: true as const })),
  }));
  const revision = balancedAssessmentRevision('ar', lesson.id) ?? PRACTICAL_PRE_A1_REVISION;
  if (balancedAssessmentRevision('ar', lesson.id)) rows = sentences.map(sentence => [sentence.ar, sentence.fa, sentence.pronunciation, sentence.vocabulary[0].word, sentence.vocabulary[0].meaning]);
  const checks: ArabicCheck[] = (lesson.checks ?? []).map((check, index) => {
    const target = rows[check.skill === 'listening' ? 1 : check.skill === 'writing' ? 4 : 2];
    const id = `${check.id}:${revision}`;
    if (check.skill === 'grammar') {
      const [prompt, answer, others, explanation] = GRAMMAR[lesson.id];
      return { id, skill: check.skill, prompt, answers: [answer], options: [answer, ...others], explanation };
    }
    if (check.skill === 'writing') return { id, skill: check.skill, prompt: 'واژه یا ترکیب عربیِ تمرین‌شده را بنویسید.', source: target[4], answers: [target[3]], explanation: `${target[3]} یعنی ${target[4]}. اعراب‌گذاری در پاسخ اجباری نیست.` };
    const listening = check.skill === 'listening';
    const correct = listening ? target[0] : target[1];
    const alternatives = [...new Set(rows.map(row => row[listening ? 0 : 1]).filter(text => text !== correct))].slice(-2);
    return { id, skill: check.skill, prompt: listening ? 'همان عبارت کوتاهی را که می‌شنوید انتخاب کنید.' : `در موقعیت همین درس، «${target[0]}» چه معنی می‌دهد؟`, ...(listening ? { audio: target[0] } : { source: target[0] }), options: [correct, ...alternatives], answers: [correct], explanation: `${target[0]} — ${target[1]}` };
  });
  const shuffled = shuffleChecks(`${lesson.id}:${revision}`, checks.map(check => ({
    promptFa: check.prompt, choices: check.options ?? [], correctIndex: 0, explanationFa: check.explanation,
  })));
  return { ...lesson, ...practicalNotes(plan), teachingFa: balancedTeaching(lesson.id, practicalNotes(plan).teachingFa), sentences, dialogue, checks: checks.map((check, index) => check.options ? { ...check, options: shuffled[index].choices } : check) };
}
