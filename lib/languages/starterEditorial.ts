import type { StarterLesson } from './newCourses';

type Check = NonNullable<StarterLesson['checks']>[number];
type Editorial = { prompts?: Record<number, string>; explanations?: Record<number, string>; teachingFa?: string };

/**
 * Display-only editorial clarifications. The stored lesson, its ID, question
 * order, choice indexes and old saved answers are deliberately unchanged.
 * Avoid treating these wording improvements as external expert review.
 */
const EDITORIAL: Record<string, Editorial> = {
  'fr-foundation-words-1': {prompts:{0:'کدام سلام رایج و خنثی یا «روز بخیر» است، نه سلام دوستانه؟'}},
  'es-foundation-chunks-1': {prompts:{1:'در این درس معنی «Hasta luego» کدام است؟'}},
};

/** Display-only pronunciation corrections; original sentence IDs and review data stay stable.
 * Persian transliteration is an approximation, not a substitute for audio. */
export function starterDisplayPronunciation(sentence: StarterLesson['sentences'][number]): string {
  const exact: Record<string,string> = {
    'fr-a1-shopping-payment-s5':'وو زَکسِپته لِ کارت',
    'fr-a1-greetings-s5':'تْغِه بیَن، مِرسی',
    'fr-a1-cafe-s3':'اِ یون بوتِی دو، سیل وو پله',
    'es-a1-directions-s2':'اِستا خونتو آ لا پلاثا',
  };
  let result = exact[sentence.id] ?? sentence.pronunciation;
  if (sentence.id.startsWith('de-')) {
    if (/können/i.test(sentence.text)) result = result.replace(/کِنِن/g, 'کونِن');
    if (/sprechen/i.test(sentence.text)) result = result.replace(/اِشپرِخِن/g, 'اِشپرِشِن');
  }
  if (sentence.id.startsWith('es-')) {
    if (/izquierda/i.test(sentence.text)) result = result.replace(/ایسکیِردا/g, 'ایثکیِردا');
    if (/tarjeta/i.test(sentence.text)) result = result.replace(/تارهِتا/g, 'تارخِتا');
  }
  return result;
}

export function starterTeachingNote(lesson: StarterLesson): string | undefined {
  return EDITORIAL[lesson.id]?.teachingFa ?? lesson.teachingFa;
}

export function starterDisplayChecks(lesson: StarterLesson): Check[] {
  const editorial = EDITORIAL[lesson.id];
  return (lesson.checks ?? []).map((check, index) => ({
    ...check,
    promptFa: editorial?.prompts?.[index] ?? check.promptFa,
    explanationFa: editorial?.explanations?.[index] ?? check.explanationFa,
  }));
}

/** Correct dialogue speaker labels at presentation time without changing saved lessons. */
export function starterDisplayDialogue(lesson: StarterLesson): StarterLesson['dialogue'] {
  // The original records stay byte-for-byte stable; only the presented roles change.
  // German Pre-A1 is authored with its own alternating roles, so it needs no relabeling here.
  if (/^(fr|es)-(a1-cafe|pre-18)$/.test(lesson.id) || lesson.id === 'de-a1-cafe') {
    return lesson.dialogue.map((line, index) => ({...line, speaker:index % 2 === 0 ? 'کارمند کافه' : 'مشتری'}));
  }
  // Sara speaks twice at the end; her partner is Lena/Léa/Lucía.
  if (/^(de|fr|es)-a1-greetings$/.test(lesson.id)) {
    return lesson.dialogue.map((line, index) => index === 5 ? {...line, speaker: lesson.dialogue[0].speaker} : line);
  }
  // The person giving their age returns the question to the other speaker.
  if (/^(de|fr|es)-a1-numbers-age$/.test(lesson.id)) {
    return lesson.dialogue.map((line, index) => index === 2 ? {...line, speaker: lesson.dialogue[1].speaker} : index === 3 ? {...line, speaker: lesson.dialogue[0].speaker} : line);
  }
  return lesson.dialogue;
}
