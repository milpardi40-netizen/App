import type {Task} from './englishSupplement/content';
import {ENGLISH_A1_EVIDENCE} from './englishA1.generated';

/** The same 17 selected Survival lesson IDs; all current tasks are versioned and lesson-local. */
export const SURVIVAL_EXPANSION_EVIDENCE: Readonly<Record<string, readonly Task[]>> = Object.fromEntries(
  Object.entries(ENGLISH_A1_EVIDENCE).filter(([id]) => id.startsWith('survival-') && id !== 'survival-job-interview' && id !== 'survival-renting-a-home'),
);
