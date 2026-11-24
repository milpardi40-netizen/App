import { notifyLearningChange } from './learningChanges';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Results of the two optional closing stages (speaking check, short assessment), kept per lesson so
 * they feed the celebration sheet and the spaced-repetition deck instead of vanishing. Local only,
 * best-effort: a failed write never blocks finishing a lesson.
 */
export interface SpeakingOutcome { attemptedOnly?: true; points?: number; average: number; scores: Record<string, number>; at: string }
export interface AssessmentOutcome { attemptedOnly?: true; correct: number; total: number; at: string }
export interface OralExamOutcome {
  mode: 'oral-exam' | 'guided-practice';
  overall: number;
  bestOverall: number;
  pronunciation: number;
  semantic: number;
  independence: number;
  interaction: number;
  grade: 'A' | 'B' | 'C' | 'needs-work';
  passed: boolean;
  voiceTurns: number;
  totalTurns: number;
  at: string;
}
export interface LessonOutcome { speaking?: SpeakingOutcome; assessment?: AssessmentOutcome; oralExam?: OralExamOutcome }

const KEY = 'milo_lesson_outcomes_v1';
/** Sentences spoken below this score go to the review deck. */
export const WEAK_SPEAKING_SCORE = 60;

type Store = Record<string, LessonOutcome>;

async function readAll(): Promise<Store> {
  const raw = Platform.OS === 'web' ? window.localStorage.getItem(KEY) : await AsyncStorage.getItem(KEY);
  if (!raw) return {};
  const value = JSON.parse(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('نتایج تمرین خوانده نشد.');
  return value;
}
async function writeAll(store: Store): Promise<void> {
  const raw = JSON.stringify(store);
  if (Platform.OS === 'web') window.localStorage.setItem(KEY, raw); else await AsyncStorage.setItem(KEY, raw);
}

let queue = Promise.resolve();
export async function loadLessonOutcomes() { await queue; return readAll(); }

const keyOf = (course: string, lessonId: string) => `${course}:${lessonId}`;

export async function getLessonOutcome(course: string, lessonId: string): Promise<LessonOutcome | null> {
  const all = await loadLessonOutcomes().catch(() => ({} as Store));
  return all[keyOf(course, lessonId)] ?? null;
}

export function saveLessonOutcome(course: string, lessonId: string, patch: Partial<LessonOutcome>): Promise<void> {
  queue = queue.then(async () => {
    const all = await readAll();
    const key = keyOf(course, lessonId);
    const prevOral = all[key]?.oralExam;
    const nextOral = patch.oralExam
      ? {
          ...patch.oralExam,
          bestOverall: Math.max(patch.oralExam.bestOverall, patch.oralExam.overall, prevOral?.bestOverall ?? 0),
        }
      : undefined;
    all[key] = { ...(all[key] ?? {}),
      ...(patch.speaking ? { speaking: { ...patch.speaking, attemptedOnly: true } } : {}),
      ...(patch.assessment ? { assessment: { ...patch.assessment, attemptedOnly: true } } : {}),
      ...(nextOral ? { oralExam: nextOral } : {}),
    };
    // One result per catalogue lesson/task, not one entry per replay. Do not evict other courses.
    await writeAll(all);
    notifyLearningChange();
  }).catch(() => undefined);
  return queue;
}

/** Sentence ids whose speaking score is below the weak threshold. */
export const weakSpokenSentences = (speaking: SpeakingOutcome | undefined | null): string[] =>
  speaking ? Object.entries(speaking.scores).filter(([, score]) => score < WEAK_SPEAKING_SCORE).map(([id]) => id) : [];

/** Objective extra checks only, never a production self-rating or CEFR certification. */
export function recordObjectiveCheck(course: string, task: string, correct: number, total: number) {
  return saveLessonOutcome(course, `extra:${task}`, { assessment: { correct, total, at: new Date().toISOString() } });
}
