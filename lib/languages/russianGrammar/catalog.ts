import index from './verbs.generated.json';
import { GRAMMAR_UNITS, type GrammarUnit } from './units';
import type { LearningLesson } from '../types';
export const VERBS = index.verbs;
export type Verb = typeof VERBS[number];
export const normalize = (s: string) => s.trim().toLowerCase().replace(/\u0301/g, '').replace(/ё/g, 'е').replace(/ي/g, 'ی').replace(/ك/g, 'ک');
const tokens = (s: string) => (s.match(/[а-яё\u0301]+(?:-[а-яё\u0301]+)*/gi) ?? []).map(normalize);
export const lessonVerbs = (id: string) => (index.byLesson as Record<string, string[]>)[id] ?? [];
export function relatedUnits(lesson: LearningLesson & { levelId: number }) {
  const words = new Set([...lesson.sentences, ...lesson.dialogue].flatMap(l => tokens(l.text)));
  const rank = (u: GrammarUnit) => tokens(u.forms).filter(f => words.has(f)).length + (u.id === 'want' && lessonVerbs(lesson.id).includes('хотеть') ? 5 : 0);
  return GRAMMAR_UNITS.filter(u => u.level <= Math.max(1, lesson.levelId) && rank(u) > 0).sort((a,b) => rank(b) - rank(a)).slice(0, 4);
}
export function lessonExample(verb: Verb, lesson?: LearningLesson) {
  if (!lesson) return;
  const ref = (index.references as Record<string, Record<string, string[]>>)[lesson.id]?.[verb.lemma];
  if (!ref) return;
  const [key, form] = ref;
  const s = key.startsWith('d:') ? lesson.dialogue[Number(key.slice(2))] : lesson.sentences.find(s => s.id === key);
  // The index is built from a snapshot of the course, so a rewritten or moved line leaves a reference that
  // points at a sentence no longer carrying the form. The workshop labels that example «از همین درس», so an
  // out-of-date pointer falls back to the trail example instead of showing a line that proves nothing.
  if (s && tokens(s.text).includes(normalize(form))) return { text: s.text, fa: s.fa, form };
}
export function verbExamples(verb: Verb, lesson?: LearningLesson) {
  const local = lessonExample(verb, lesson);
  return [...new Map((local ? [local, ...verb.examples] : verb.examples).map(s => [s.text, s])).values()];
}
export function gapFor(text: string, form: string) {
  // Whole tokens only: «я» inside a word is not a pronoun and «ел» inside «делал» isn't «ate».
  return text.replace(/[А-Яа-яЁё\u0301]+/g, w => normalize(w) === normalize(form) ? '____' : w);
}
