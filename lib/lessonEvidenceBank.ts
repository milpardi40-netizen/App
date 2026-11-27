import {isArabicA1Core, ARABIC_A1_ASSESSMENT_REVISION} from './arabic/a1Scope';
import { SENTENCE_LESSONS, type SentenceLesson } from './courseContent';
import type { ArabicLesson } from './arabic/content';
import type { Task } from './englishSupplement/content';
import { CORE_LESSON_EVIDENCE } from './englishFoundationEvidence';
import { expandedEvidenceTasks } from './lessonAssessment';

export function englishEvidenceFor(lesson: SentenceLesson): Task[] {
  return expandedEvidenceTasks(lesson, CORE_LESSON_EVIDENCE[lesson.id] ?? fallbackEnglish(lesson));
}
export function arabicEvidenceFor(lesson: ArabicLesson): Task[] {
  const tasks=expandedEvidenceTasks(lesson, lesson.checks?.length ? lesson.checks : fallbackArabic(lesson));
  return isArabicA1Core(lesson.id) ? tasks.map(t=>({...t,id:`${ARABIC_A1_ASSESSMENT_REVISION}:${t.id}`})) : tasks;
}
export function currentEnglishEvidenceComplete(lesson: SentenceLesson, evidence: Record<string, { correct: boolean; heard: boolean }> = {}): boolean {
  const tasks = englishEvidenceFor(lesson);
  return tasks.length > 0 && tasks.every(task => evidence[task.id]?.correct && (task.skill !== 'listening' || evidence[task.id]?.heard));
}

// The immutable curriculum pool is shared across fallback lessons, built only if needed.
let englishFallbackMeanings: string[] | undefined;

// Retain the original fallback question IDs/meaning so their evidence is still usable.
function fallbackEnglish(lesson: SentenceLesson): Task[] {
  const sentence = lesson.sentences[0], other = lesson.sentences[1] ?? sentence;
  if (!sentence) return [];
  const meanings = englishFallbackMeanings ??= [...new Set(SENTENCE_LESSONS.flatMap(item => item.sentences.map(entry => entry.fa)))];
  const distractors = meanings.filter(value => value !== sentence.fa).slice(0, 2);
  const options = [sentence.fa, ...distractors];
  const offset = lesson.order % options.length;
  options.push(...options.splice(0, offset));
  return [
    { id: `legacy-${lesson.id}-listening`, skill: 'listening', prompt: 'جمله را بشنوید و معنی آن را انتخاب کنید.', audio: sentence.en, options, answers: [sentence.fa], explanation: 'به واژه‌ها و معنی جمله در همین درس برگردید.' },
    { id: `legacy-${lesson.id}-writing`, skill: 'writing', prompt: 'جملهٔ انگلیسیِ مربوط به این معنی را مطابق متن همین درس بنویسید.', source: other.fa, answers: [other.en], explanation: `الگوی درس: ${other.en}` },
  ];
}
function fallbackArabic(lesson: ArabicLesson): Task[] {
  const first = lesson.sentences[0], second = lesson.sentences[1] ?? first;
  if (!first) return [];
  const distractors = [...new Set(lesson.sentences.map(entry => entry.fa))].filter(value => value !== first.fa).slice(0, 2);
  return [
    { id: `${lesson.id}-listening`, skill: 'listening', prompt: 'جملهٔ عربی را بشنوید و معنی درست آن را انتخاب کنید.', audio: first.ar, options: [first.fa, ...distractors], answers: [first.fa], explanation: 'به واژه‌ها و صدای جمله در بخش جمله‌های اصلی برگردید.' },
    { id: `${lesson.id}-writing`, skill: 'writing', prompt: 'جملهٔ عربیِ متناظر با این معنی را بنویسید (بدون اعراب هم پذیرفته می‌شود).', source: second.fa, answers: [second.ar, second.arPlain ?? second.ar], explanation: `الگوی درس: ${second.ar}` },
  ];
}
