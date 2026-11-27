import { assessmentText, type AssessmentSample } from './lessonAssessment';

export const LESSON_DIALOGUE_REVISION = 'full-lesson-pairs-v1';
export interface LessonDialogueLine { text: string; fa: string }
export interface LessonDialoguePair {
  sentenceId: string;
  operator: LessonDialogueLine;
  learner: LessonDialogueLine;
  kind: 'exchange' | 'echo';
  /** Optional authored order for role-swapped scenes; legacy courses retain pair reversal. */
  learnerFirst?: readonly [LessonDialogueLine, LessonDialogueLine];
  section?: 'dialogue' | 'review';
}
const same = (a: string, b: string) => a.normalize('NFKC').trim() === b.normalize('NFKC').trim();

/** Every taught sentence is a learner target once; never invent a reply or an unrelated question. */
export function lessonDialoguePairs(samples: readonly AssessmentSample[], authored: readonly LessonDialogueLine[] = []): LessonDialoguePair[] {
  return samples.map(sample => {
    const learner = { text: assessmentText(sample), fa: sample.fa };
    const index = authored.findIndex(line => same(line.text, learner.text));
    // Only an actual, authored preceding turn is treated as a conversational prompt.
    const previous = index > 0 ? authored[index - 1] : undefined;
    return { sentenceId: sample.id, learner, operator: previous ? { ...previous } : { ...learner }, kind: previous ? 'exchange' : 'echo' };
  });
}

export function dialoguePairLines(pairs: readonly LessonDialoguePair[], starter: 'operator' | 'me'): LessonDialogueLine[] {
  return pairs.flatMap(pair => starter === 'operator' ? [pair.operator, pair.learner] : pair.learnerFirst ? [...pair.learnerFirst] : [pair.learner, pair.operator]);
}
