import type { LearningLesson } from '../types';

export const PRACTICAL_PRE_A1_REVISION = 'pre-a1-practical-six-v1';
export type PracticalRow = readonly [text: string, fa: string, pronunciation: string, word: string, meaning: string];
export interface PracticalPlan {
  goal: string;
  scene: string;
  tip: string;
  change: string;
  pattern?: string;
  intent?: readonly string[];
  /** New core exchanges occupy existing sentence slots; IDs and counts never change. */
  rows?: readonly PracticalRow[];
  /** For existing well-authored content; indices refer to this lesson only. */
  turns?: readonly number[];
}
export function practicalRows<T extends { id: string; text: string; fa: string; pronunciation: string; pattern?: string; vocabulary: Array<{ word: string; meaning: string }> }>(sentences: readonly T[], plan: PracticalPlan): T[] {
  return sentences.map((sentence, index) => {
    const row = plan.rows?.[index];
    return { ...sentence, ...(row ? { text: row[0], fa: row[1], pronunciation: row[2], vocabulary: row[0] === sentence.text ? sentence.vocabulary : [{ word: row[3], meaning: row[4] }], pattern: row[0] === sentence.text ? sentence.pattern : undefined } : {}), ...(row && index === 1 && plan.pattern ? { pattern: plan.pattern } : {}) };
  });
}
export function practicalNotes(plan: PracticalPlan) {
  return { situation: `هدف: بتوانم ${plan.goal}\nموقعیت: ${plan.scene}`, teachingFa: `${plan.tip}\nتمرین اصلی: ${plan.change}` };
}
export function practicalDialogue(sentences: LearningLesson['sentences'], plan: PracticalPlan): LearningLesson['dialogue'] {
  return (plan.turns ?? [0, 1, 2, 3]).map((index, turn) => ({ speaker: turn % 2 ? 'زبان‌آموز' : 'هم‌صحبت', role: turn % 2 ? 'learner' : 'partner', text: sentences[index].text, fa: sentences[index].fa }));
}
export function practicalChecks(sentences: LearningLesson['sentences'], plan: PracticalPlan, count: number): NonNullable<LearningLesson['checks']> {
  const dialogue = practicalDialogue(sentences, plan);
  const answer = dialogue[1];
  const wrong = ['نوبت صحبت طرف مقابل را مشخص می‌کند.', 'زمان گذشته را روایت می‌کند.', 'نشانی محل زندگی را می‌پرسد.'];
  const checks = [
    { promptFa: `در گفت‌وگوی همین درس، پاسخ به «${dialogue[0].text}» چه بود؟`, choices: [answer.text, ...Array.from(new Set(sentences.filter(s => s.text !== answer.text).map(s => s.text))).slice(-3)], correctIndex: 0, explanationFa: `پاسخ این گفت‌وگو: ${answer.text} — ${answer.fa}` },
    { promptFa: `در موقعیت «${plan.scene}»، عبارت آغاز گفت‌وگو چه کاری انجام می‌دهد؟`, choices: [plan.intent?.[0] ?? plan.goal, ...(plan.intent?.slice(1) ?? wrong)], correctIndex: 0, explanationFa: `${plan.tip} هدف این تمرین: ${plan.goal}` },
    { promptFa: `در همین گفت‌وگو، «${dialogue[2].text}» یعنی چه؟`, choices: [dialogue[2].fa, ...Array.from(new Set(sentences.filter(s => s.fa !== dialogue[2].fa).map(s => s.fa))).slice(-3)], correctIndex: 0, explanationFa: `${dialogue[2].text} یعنی ${dialogue[2].fa}` },
  ];
  return checks.slice(0, count);
}
