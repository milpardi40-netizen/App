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
export function verbExamples(verb: Verb, lesson?: LearningLesson) {
  const examples = [...verb.examples];
  if (lesson && lessonVerbs(lesson.id).includes(verb.lemma)) {
    const ref = (index.references as Record<string, Record<string, string[]>>)[lesson.id]?.[verb.lemma];
    if (ref) {
      const [key, form] = ref;
      const sample = key.startsWith('d:') ? lesson.dialogue[Number(key.slice(2))] : lesson.sentences.find(s => s.id === key);
      if (sample) examples.unshift({ text: sample.text, fa: sample.fa, form });
    }
  }
  return [...new Map(examples.map(s => [s.text, s])).values()];
}
export function gapFor(text: string, form: string) {
  // Whole tokens only: «я» inside a word is not a pronoun and «ел» inside «делал» isn't «ate».
  return text.replace(/[А-Яа-яЁё\u0301]+/g, w => normalize(w) === normalize(form) ? '____' : w);
}
