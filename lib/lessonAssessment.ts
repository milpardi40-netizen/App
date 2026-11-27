import { russianPreA1ContextChecksRevisionFor } from './languages/russianPreA1Phase3';
import { RUSSIAN_PRE_A1_LIGHT_VERBS_ID, RUSSIAN_PRE_A1_LIGHT_CHECKS_REVISION } from './languages/russianPreA1Phase2';
import {isArabicA1Core, ARABIC_A1_ASSESSMENT_REVISION} from './arabic/a1Scope';
import {isTurkishA1Core, TURKISH_A1_ASSESSMENT_REVISION} from './languages/turkishA1Scope';
import {isSpanishA1Core, SPANISH_A1_ASSESSMENT_REVISION} from './languages/spanishA1Scope';
import {isFrenchA1Core, FRENCH_A1_ASSESSMENT_REVISION} from './languages/frenchA1Scope';
import {isGermanA1Core, GERMAN_A1_ASSESSMENT_REVISION} from './languages/germanA1Scope';
import {isEnglishA1Core, ENGLISH_A1_ASSESSMENT_REVISION} from './englishA1Scope';
import type { Task } from './englishSupplement/content';
import { normalizeArabic } from './arabic/text';

export const LESSON_ASSESSMENT_REVISION = 'adaptive-lesson-assessment-v1';
export interface AssessmentSample { id: string; text?: string; en?: string; ar?: string; fa: string }
export interface LessonChoiceCheck { promptFa: string; choices: string[]; correctIndex: number; explanationFa: string }
// Revisions are scoped to the courses or individual lessons whose questions changed.
export const RUSSIAN_A1_ASSESSMENT_REVISION = 'ru-a1-sequenced-assessment-v1';
export function assessmentRevisionFor(language: string, lessonId: string): string {
  const contextRevision = language === 'ru' ? russianPreA1ContextChecksRevisionFor(lessonId) : undefined;
  if (contextRevision) return contextRevision;
  if (language === 'ru' && lessonId === RUSSIAN_PRE_A1_LIGHT_VERBS_ID) return RUSSIAN_PRE_A1_LIGHT_CHECKS_REVISION;
  if (language === 'ru' && lessonId === 'ru-pre-29-numbers-teens') return 'ru-pre-a1-teens-stress-v1';
  if (language === 'ar' && isArabicA1Core(lessonId)) return ARABIC_A1_ASSESSMENT_REVISION;
  if (language === 'tr' && isTurkishA1Core(lessonId)) return TURKISH_A1_ASSESSMENT_REVISION;
  if (language === 'es' && isSpanishA1Core(lessonId)) return SPANISH_A1_ASSESSMENT_REVISION;
  if (language === 'fr' && isFrenchA1Core(lessonId)) return FRENCH_A1_ASSESSMENT_REVISION;
  if (language === 'de' && isGermanA1Core(lessonId)) return GERMAN_A1_ASSESSMENT_REVISION;
  if (language === 'en' && isEnglishA1Core(lessonId)) return ENGLISH_A1_ASSESSMENT_REVISION;
  return language === 'ru' && lessonId.startsWith('ru-a1-')
    ? RUSSIAN_A1_ASSESSMENT_REVISION : LESSON_ASSESSMENT_REVISION;
}
export function shortAssessmentCount(sentenceCount: number): number {
  return sentenceCount <= 10 ? 5 : sentenceCount <= 16 ? 6 : sentenceCount <= 24 ? 7 : 8;
}
export function assessmentText(sample: AssessmentSample): string { return sample.text ?? sample.en ?? sample.ar ?? ''; }
const key = (text: string) => normalizeArabic(text.normalize('NFKC')).toLocaleLowerCase().replace(/[.!?،؛:«»“”"']/g, '').replace(/\s+/g, ' ').trim();

/** Keep all authored checks; add lesson-local recognition/retrieval, spread across the lesson. */
function extraChecks(samples: readonly AssessmentSample[], limit: number): Array<LessonChoiceCheck & { sample: AssessmentSample; reverse: boolean; construction?: boolean }> {
  const result: Array<LessonChoiceCheck & { sample: AssessmentSample; reverse: boolean; construction?: boolean }> = [];
  const order = Array.from({ length: Math.min(limit, samples.length) }, (_, i) => Math.round(i * (samples.length - 1) / Math.max(1, Math.min(limit, samples.length) - 1)));
  const indexes = [...new Set([...order, ...samples.map((_, i) => i)])];
  for (const reverse of [false, true]) for (const index of indexes) {
    const sample = samples[index];
    const text = assessmentText(sample);
    if (!text.trim() || !sample.fa.trim()) continue;
    const answer = reverse ? text : sample.fa;
    const distractors: string[] = [];
    const seen = new Set([key(answer)]);
    for (let offset = 1; offset < samples.length; offset++) {
      const other = samples[(index + offset) % samples.length];
      // Synonyms / alternative sentences with the same meaning must not become wrong options.
      if (key(other.fa) === key(sample.fa) || key(assessmentText(other)) === key(text)) continue;
      const choice = reverse ? assessmentText(other) : other.fa;
      if (!key(choice) || seen.has(key(choice))) continue;
      seen.add(key(choice)); distractors.push(choice);
      if (distractors.length === 3) break;
    }
    if (!distractors.length) continue;
    const choices = [answer, ...distractors];
    const rotate = (index + Number(reverse)) % choices.length;
    choices.push(...choices.splice(0, rotate));
    result.push({ sample, reverse,
      promptFa: reverse ? `در متن همین درس، برای «${sample.fa}» کدام عبارت آمده است؟` : `در همین درس، «${text}» چه معنایی دارد؟`,
      choices, correctIndex: choices.indexOf(answer), explanationFa: `${text} — ${sample.fa}`,
    });
  }
  const construction = indexes.flatMap(index => {
    const sample = samples[index];
    const text = assessmentText(sample);
    const words = text.trim().split(/\s+/);
    if (words.length < 3) return [];
    const variants = [words.slice().reverse().join(' '), [...words.slice(1), words[0]].join(' ')];
    const choices = [text, ...variants.filter((value, i, all) => key(value) !== key(text) && all.indexOf(value) === i)];
    if (choices.length < 3) return [];
    const rotate = index % choices.length;
    choices.push(...choices.splice(0, rotate));
    return [{ sample, reverse: true, construction: true,
      promptFa: `ترتیب واژه‌ها را مطابق نمونهٔ همین درس انتخاب کن: «${words.slice().reverse().join(' / ')}»\nمعنی: ${sample.fa}`,
      choices, correctIndex: choices.indexOf(text), explanationFa: `${text} — ${sample.fa}` }];
  });
  // Interleave skills instead of filling the short assessment with one repeated question type.
  const meanings = result.filter(item => !item.reverse);
  const retrieval = result.filter(item => item.reverse);
  const varied: typeof result = [];
  for (let i = 0; i < Math.max(meanings.length, retrieval.length); i++) {
    if (construction[i]) varied.push(construction[i]);
    if (meanings.length) varied.push(meanings[(i + Math.floor(meanings.length / 3)) % meanings.length]);
    if (retrieval.length) varied.push(retrieval[(i + Math.floor(retrieval.length * 2 / 3)) % retrieval.length]);
  }
  const seenSamples = new Set<string>();
  const first: typeof result = [], rest: typeof result = [];
  for (const check of varied) {
    if (seenSamples.has(check.sample.id)) rest.push(check);
    else { seenSamples.add(check.sample.id); first.push(check); }
  }
  return [...first, ...rest];
}

export function expandedChoiceChecks(lesson: { sentences: readonly AssessmentSample[]; checks?: readonly LessonChoiceCheck[] }): LessonChoiceCheck[] {
  const authored = [...(lesson.checks ?? [])];
  const target = Math.max(authored.length, shortAssessmentCount(lesson.sentences.length));
  if (authored.length >= target) return authored; // No discarded question construction on navigation.
  const seen = new Set(authored.map(item => key(item.promptFa)));
  const additional = extraChecks(lesson.sentences, target).filter(item => {
    const signature = key(item.promptFa);
    if (seen.has(signature)) return false;
    seen.add(signature); return true;
  });
  return [...authored, ...additional.slice(0, target - authored.length).map(({ sample, reverse, construction, ...check }) => check)];
}

/** Existing task IDs remain valid; only new questions get new IDs. No old evidence is deleted. */
export function expandedEvidenceTasks(lesson: { id: string; sentences: readonly AssessmentSample[] }, authored: readonly Task[] = []): Task[] {
  const target = Math.max(authored.length, shortAssessmentCount(lesson.sentences.length));
  if (authored.length >= target) return [...authored];
  let hasListening = authored.some(task => task.skill === 'listening');
  const additions = extraChecks(lesson.sentences, target).slice(0, target - authored.length).map((check): Task => {
    const listening = !check.reverse && !hasListening;
    if (listening) hasListening = true;
    return {
      id: `${LESSON_ASSESSMENT_REVISION}:${lesson.id}:${check.sample.id}:${check.construction ? 'order' : check.reverse ? 'retrieve' : 'meaning'}`,
      skill: listening ? 'listening' : 'reading',
      prompt: listening ? 'نمونهٔ همین درس را کامل بشنو و معنی آن را انتخاب کن.' : check.promptFa,
      ...(listening ? { audio: assessmentText(check.sample) } : {}),
      options: check.choices, answers: [check.choices[check.correctIndex]], explanation: check.explanationFa,
    };
  });
  if (additions.length >= 3) {
    const sample = lesson.sentences[Math.floor(lesson.sentences.length / 2)];
    const text = assessmentText(sample);
    additions[additions.length - 1] = {
      id: `${LESSON_ASSESSMENT_REVISION}:${lesson.id}:${sample.id}:write`, skill: 'writing',
      prompt: `عبارت همین درس را برای «${sample.fa}» بنویس.`,
      answers: [...new Set(lesson.sentences.filter(item => key(item.fa) === key(sample.fa)).map(assessmentText))],
      explanation: `${text} — ${sample.fa}`,
    };
  }
  return [...authored, ...additions];
}

export function reviseExpandedEvidence<T extends { evidencePassed: boolean; attemptEvidence?: Record<string, boolean>; checksRevision?: string }>(_language: string, _id: string, session: T): T {
  const revision = _language === 'ar' && isArabicA1Core(_id) ? ARABIC_A1_ASSESSMENT_REVISION : _language === 'en' && isEnglishA1Core(_id) ? ENGLISH_A1_ASSESSMENT_REVISION : LESSON_ASSESSMENT_REVISION;
  return session.checksRevision === revision ? session : { ...session, checksRevision: revision, evidencePassed: false,
    ...((_language === 'ar' && isArabicA1Core(_id)) || (_language === 'en' && isEnglishA1Core(_id)) ? {attemptEvidence: {}} : {}),
  };
}
