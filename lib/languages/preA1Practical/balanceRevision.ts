import authored from './balanceManifest.json';
import { PRACTICAL_PRE_A1_REVISION } from './model';

export const BALANCED_PRE_A1_REVISION = 'pre-a1-balanced-v1';
export const SAMPLE_BALANCE = authored as Record<string, { language: string; count: number; oldCount: number; newIds: string[]; indexMap: number[]; split: boolean }>;

export function balancedSampleRevision(lessonId: string): string | undefined {
  return SAMPLE_BALANCE[lessonId] ? BALANCED_PRE_A1_REVISION : undefined;
}
export function balancedAssessmentRevision(language: string, lessonId: string): string | undefined {
  const plan = SAMPLE_BALANCE[lessonId];
  return plan?.language === language && (['de', 'fr', 'es', 'ar'].includes(language) || lessonId === 'tr-prea1-08-simple-questions') ? BALANCED_PRE_A1_REVISION : undefined;
}
export function practicalRoomRevision(lessonId: string): string {
  return balancedSampleRevision(lessonId) ?? PRACTICAL_PRE_A1_REVISION;
}

/** Keep the same saved sentence ID when inserted independent words shift numerical positions. */
export function resumeBalancedSamples<T extends { sentenceIndex: number; sampleRevision?: string }>(lessonId: string, session: T): T {
  const plan = SAMPLE_BALANCE[lessonId];
  if (!plan || session.sampleRevision === BALANCED_PRE_A1_REVISION) return session;
  return { ...session, sentenceIndex: plan.indexMap[session.sentenceIndex] ?? Math.min(Math.max(0, session.sentenceIndex), plan.count - 1), sampleRevision: BALANCED_PRE_A1_REVISION };
}
