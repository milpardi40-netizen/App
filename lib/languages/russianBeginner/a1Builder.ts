import { orderChecks } from './checkOrder';
import type { LearningLesson } from '../types';

/** One authored scene powers listening, shadowing, vocabulary, role play and the exit checks.
 * start is an existing review-card address, never an index into a filtered list. */
export function scene(id: string, start: number, roles: [string, string], title: string, situation: string, teachingFa: string,
  lines: readonly [string, string, string][], glossary: Record<string,string>,
  check: [string, string[], number]): LearningLesson {
  const prefix = id.startsWith('ru-l1-') ? 'ru1-' : 'ru2-';
  const sentences = lines.map(([text, fa, pronunciation], i) => {
    const vocabulary = (text.match(/[А-ЯЁа-яё\u0301-]+/g) ?? []).flatMap(word => {
      const meaning = glossary[word.toLowerCase().replace(/\u0301/g,'')];
      return meaning ? [{word,meaning}] : [];
    });
    return {id: prefix + String(start+i).padStart(2,'0'), text, fa, pronunciation,
      vocabulary: vocabulary.length ? vocabulary : [{word: text.replace(/[.!?]+$/, ''), meaning: fa}],
      ...(i === check[2] ? {pattern: teachingFa} : {})};
  });
  const dialogue = sentences.map(({text, fa, pronunciation}, i) => ({speaker: roles[i % 2], text, fa, pronunciation}));
  const evidence = sentences[check[2]];
  return {id, title, situation, durationMinutes: 9, teachingFa, sentences, dialogue, checks: orderChecks([
    {promptFa: check[0], choices: check[1], correctIndex: 0, explanationFa: `${evidence.text} — ${evidence.fa}`},
    {promptFa: `نقش تو: «${sentences[7].fa}». در پاسخ به «${sentences[6].text}» چه می‌گویی؟`,
      choices: [sentences[1].text, sentences[7].text, sentences[3].text], correctIndex: 1, explanationFa: `${sentences[7].text} — ${sentences[7].fa}`},
  ], start)};
}
