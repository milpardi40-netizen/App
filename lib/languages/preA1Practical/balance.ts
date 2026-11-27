import type { LearningLesson, LearningSentence } from '../types';
import authored from './balance.json';
import manifest from './balanceManifest.json';

type Row = readonly [text: string, fa: string, pronunciation: string, word: string, meaning: string, pattern?: string];
type BalancePlan = { language: string; append?: Row[]; split?: Record<string, Row[]>; order?: number[]; turns?: number[]; note?: string };
const plans = authored as unknown as Record<string, BalancePlan>;

/** Additive IDs never depend on catalogue order, and an original split row keeps its own ID. */
export function balanceSamples<T extends LearningSentence>(lessonId: string, original: readonly T[]): T[] {
  const plan = plans[lessonId];
  if (!plan) return [...original];
  const make = (template: T, id: string, row: Row): T => ({
    ...template, id, text: row[0], fa: row[1], pronunciation: row[2],
    vocabulary: [{ word: row[3], meaning: row[4] }], pattern: row[5],
  });
  const result = original.flatMap((sentence, index) => {
    const parts = plan.split?.[String(index)];
    return parts ? parts.map((row, part) => make(sentence, part ? `${sentence.id}-part-${part + 1}` : sentence.id, row)) : [sentence];
  });
  for (const [index, row] of (plan.append ?? []).entries()) result.push(make(original[0], `${lessonId}-balance-${String(index + 1).padStart(2, '0')}`, row));
  return plan.order ? plan.order.map(index => result[index]) : result;
}

export function balancedTeaching(lessonId: string, teaching: string | undefined): string | undefined {
  const note = plans[lessonId]?.note;
  return note ? `${teaching ?? ''}\nتکمیل درس: ${note}` : teaching;
}

export function balancedDialogue(lessonId: string, sentences: readonly LearningSentence[]): Array<{ speaker: 'partner' | 'learner'; role: 'partner' | 'learner'; text: string; fa: string }> | undefined {
  return plans[lessonId]?.turns?.map((index, turn) => ({
    speaker: turn % 2 ? 'learner' : 'partner', role: turn % 2 ? 'learner' : 'partner', text: sentences[index].text, fa: sentences[index].fa,
  }));
}

/** Keep the number and shape of checks; version only questions changed by this completion pass. */
export function balancedChecks(lessonId: string, checks: LearningLesson['checks'], sentences: readonly LearningSentence[], dialogue: LearningLesson['dialogue']): LearningLesson['checks'] {
  const plan = plans[lessonId];
  if (!plan || !checks?.length) return checks;
  const meta = (manifest as Record<string, { newIds: string[] }>)[lessonId];
  const focus = sentences.find(sentence => sentence.id === meta.newIds.at(-1))!;
  return checks.map((check, index) => {
    if (index === checks.length - 1) {
      const others = [...new Set(sentences.map(s => s.fa).filter(fa => fa !== focus.fa))].slice(0, check.choices.length - 1);
      return { promptFa: `در همین درس، «${focus.text}» یعنی چه؟`, choices: [focus.fa, ...others], correctIndex: 0, explanationFa: `${focus.text} یعنی ${focus.fa}` };
    }
    if (index === 0 && plan.turns && dialogue.length >= 2) {
      const answer = dialogue[1];
      const others = [...new Set(sentences.map(s => s.text).filter(text => text !== answer.text))].slice(-check.choices.length + 1);
      return { promptFa: `در گفت‌وگوی همین درس، پاسخ به «${dialogue[0].text}» چه بود؟`, choices: [answer.text, ...others], correctIndex: 0, explanationFa: `${answer.text} — ${answer.fa}` };
    }
    return check;
  });
}
