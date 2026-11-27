import {ENGLISH_A1_EVIDENCE} from './englishA1.generated';
import type { Skill, Task } from './englishSupplement/content';
import { SURVIVAL_EXPANSION_EVIDENCE } from './englishSurvivalEvidence';
import { EVERYDAY_LESSON_EVIDENCE } from './englishEverydayEvidence';
import { B1_INDEPENDENT_EVIDENCE } from './englishB1IndependentEvidence';
import { C1_EVIDENCE } from './englishC1Evidence';
import { B2_UPPER_INTERMEDIATE_EVIDENCE } from './englishB2UpperIntermediateEvidence';
import { A2_FOUNDATION_EVIDENCE } from './englishA2FoundationEvidence';
import { A2_SITUATIONS_EVIDENCE } from './englishA2SituationsEvidence';
import { PRE_A1_EVIDENCE } from './englishSupplement/content';

/** Current authored A1 tasks; retired answers remain in storage under their old IDs. */
export const FOUNDATION_LESSON_EVIDENCE: Readonly<Record<string, readonly Task[]>> = Object.fromEntries(
  Object.entries(ENGLISH_A1_EVIDENCE).filter(([id]) => id.startsWith('foundation-')),
);
export const SURVIVAL_LESSON_EVIDENCE: Readonly<Record<string, readonly Task[]>> = {
  ...Object.fromEntries(Object.entries(ENGLISH_A1_EVIDENCE).filter(([id]) => id === 'survival-job-interview' || id === 'survival-renting-a-home')),
  ...SURVIVAL_EXPANSION_EVIDENCE,
};
export const FOUNDATION_EVIDENCE_TASKS_PER_LESSON = 8;
export const SURVIVAL_EVIDENCE_TASKS_PER_LESSON = 8;
export const EVERYDAY_EVIDENCE_TASKS_PER_LESSON = 6;

export interface FoundationEvidenceResult {
  skill: Skill;
  correct: boolean;
  heard: boolean;
  attempts: number;
}

export const CORE_LESSON_EVIDENCE: Readonly<Record<string, readonly Task[]>> = {
  // Pre-A1 first: absolute beginners get choice/gap questions and never a typed sentence.
  ...PRE_A1_EVIDENCE,
  ...FOUNDATION_LESSON_EVIDENCE,
  ...SURVIVAL_LESSON_EVIDENCE,
  ...EVERYDAY_LESSON_EVIDENCE,
  ...A2_FOUNDATION_EVIDENCE,
  ...A2_SITUATIONS_EVIDENCE,
  ...B1_INDEPENDENT_EVIDENCE,
  ...B2_UPPER_INTERMEDIATE_EVIDENCE,
  ...C1_EVIDENCE,
};

function isLessonEvidenceComplete(
  lessonId: string,
  evidence: Record<string, FoundationEvidenceResult>,
  taskBank: Readonly<Record<string, readonly Task[]>>,
): boolean {
  const tasks = taskBank[lessonId];
  return !!tasks?.length && tasks.every(item => {
    const result = evidence[item.id];
    return !!result?.correct && (item.skill !== 'listening' || result.heard);
  });
}

export function isFoundationLessonEvidenceComplete(
  lessonId: string,
  evidence: Record<string, FoundationEvidenceResult> = {},
): boolean {
  return isLessonEvidenceComplete(lessonId, evidence, FOUNDATION_LESSON_EVIDENCE);
}

export function isSurvivalLessonEvidenceComplete(
  lessonId: string,
  evidence: Record<string, FoundationEvidenceResult> = {},
): boolean {
  return isLessonEvidenceComplete(lessonId, evidence, SURVIVAL_LESSON_EVIDENCE);
}

export function isCoreLessonEvidenceComplete(
  lessonId: string,
  evidence: Record<string, FoundationEvidenceResult> = {},
): boolean {
  return isLessonEvidenceComplete(lessonId, evidence, CORE_LESSON_EVIDENCE);
}
