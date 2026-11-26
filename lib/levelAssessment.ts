import { notifyLearningChange } from './learningChanges';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildLessonPractice, WARM_UP_KINDS, type PracticeItem } from './lessonPractice';
import type { LearningLesson } from './languages/types';

type LevelId = number;
type LevelLesson = Pick<LearningLesson, 'id' | 'title' | 'sentences'> & { levelId: LevelId };

/** End-of-level assessment and daily supplementary practice, shared by every non-English course. */
export const ASSESSMENT_QUESTIONS = 20;
export const ASSESSMENT_PASS_PERCENT = 70;
export const SUPPLEMENT_QUESTIONS = 10;

const keyFor = (courseId: string) => `milo.${courseId}.levelAssessment.v1`;
export interface LevelAssessmentRecord { bestPercent: number; lastPercent: number; attempts: number; passedAt?: string; lastAt: string }
export type LevelAssessmentState = Partial<Record<LevelId, LevelAssessmentRecord>>;

export async function loadLevelAssessments(courseId: string): Promise<LevelAssessmentState> {
  try { const raw = await AsyncStorage.getItem(keyFor(courseId)); return raw ? JSON.parse(raw) as LevelAssessmentState : {}; } catch { return {}; }
}
export async function saveLevelAssessment(courseId: string, levelId: LevelId, percent: number): Promise<LevelAssessmentRecord> {
  const state = await loadLevelAssessments(courseId);
  const previous = state[levelId];
  const now = new Date().toISOString();
  const record: LevelAssessmentRecord = {
    bestPercent: Math.max(previous?.bestPercent ?? 0, percent), lastPercent: percent, attempts: (previous?.attempts ?? 0) + 1, lastAt: now,
    passedAt: previous?.passedAt ?? (percent >= ASSESSMENT_PASS_PERCENT ? now : undefined),
  };
  try { await AsyncStorage.setItem(keyFor(courseId), JSON.stringify({ ...state, [levelId]: record })); notifyLearningChange(); } catch { /* local only */ }
  return record;
}

/** A pooled pseudo-lesson with every sentence of the level, so items can draw distractors from the whole level. */
export function levelPool(courseId: string, allLessons: readonly LevelLesson[], levelId: LevelId) {
  const lessons = allLessons.filter(lesson => lesson.levelId === levelId);
  return { id: `${courseId}-level-${levelId}`, title: lessons[0]?.title ?? '', sentences: lessons.flatMap(lesson => lesson.sentences) };
}

function dayKey(): string { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }

/** Exam: fixed count, seeded per attempt so a retake is a different paper. */
export function buildLevelExam(pool: ReturnType<typeof levelPool>, attempt: number): PracticeItem[] {
  return buildLessonPractice(pool, { count: ASSESSMENT_QUESTIONS, seedSalt: `exam-${attempt}` });
}

/**
 * The seven «می‌توانم» bands of the end-of-level exam (spec, final-exam criteria):
 * every exam question comes from a lesson sentence, and each lesson groups into one
 * band — so the result card can say «در کدام توانمندی‌ها قوی بودید», not just a percent.
 * Matching is keyword-based on the lesson id, so it works for every course that
 * renders the level studio; unmatched sentences fall through to the daily-life band.
 */
export interface CanDoBand { id: string; label: string; keywords: readonly string[] }
export const CAN_DO_BANDS: readonly CanDoBand[] = [
  { id: 'self', label: 'معرفی و اطلاعات شخصی', keywords: ['introducing', 'personal', 'job', 'pronoun', 'numbers', 'alphabet', 'family', 'spelling'] },
  { id: 'shopping', label: 'خرید و قیمت', keywords: ['shopping', 'buying', 'clothing', 'market', 'post-office', 'services'] },
  { id: 'food', label: 'غذا و کافه', keywords: ['food', 'cafe', 'restaurant', 'drink', 'menu'] },
  { id: 'city', label: 'مسیر، شهر و سفر', keywords: ['directions', 'transport', 'travel', 'hotel', 'renting', 'places', 'neighborhood'] },
  { id: 'daily', label: 'زندگی روزمره و سرگرمی', keywords: ['routine', 'hobbies', 'weather', 'seasons', 'school', 'current'] },
  { id: 'health', label: 'سلامتی و کمک‌خواستن', keywords: ['health', 'pharmacy', 'asking-for-help'] },
  { id: 'plans', label: 'زمان، قرار و ارتباط', keywords: ['time', 'appointments', 'invitations', 'plans', 'phone', 'messages'] },
];

/** `ru-a1-cafe-and-food-03` → `ru-a1-cafe-and-food`; other sentence ids keep their lesson part. */
function lessonPartOf(sentenceId: string): string {
  return sentenceId.replace(/-\d{2,3}(-r)?$/, '');
}

export function canDoBandForSentence(sentenceId: string): CanDoBand {
  const lessonId = lessonPartOf(sentenceId).toLowerCase();
  for (const band of CAN_DO_BANDS) if (band.keywords.some(keyword => lessonId.includes(keyword))) return band;
  return CAN_DO_BANDS[4];
}

export interface ExamItemResult { sentenceId: string; correct: boolean }
export interface CanDoScore { band: string; label: string; correct: number; total: number }

/** Per-band exam outcome, in the fixed band order; bands the paper did not touch are omitted. */
export function examCanDoBreakdown(results: readonly ExamItemResult[]): CanDoScore[] {
  const scores = new Map<string, { correct: number; total: number }>();
  for (const item of results) {
    const band = canDoBandForSentence(item.sentenceId);
    const score = scores.get(band.id) ?? { correct: 0, total: 0 };
    if (item.correct) score.correct += 1;
    score.total += 1;
    scores.set(band.id, score);
  }
  return CAN_DO_BANDS.filter(band => scores.has(band.id))
    .map(band => ({ band: band.id, label: band.label, ...scores.get(band.id)! }));
}
/** Supplement: a fresh short round every day; one item is typed («بنویس»).
 * Typed production starts at A2 by default; the Russian course asks for it from A1,
 * because its A1 band already teaches the case endings the typed sentence needs. */
export function buildLevelSupplement(pool: ReturnType<typeof levelPool>, levelId?: LevelId, writeFromLevel: LevelId = 2): PracticeItem[] {
  return buildLessonPractice(pool, { count: SUPPLEMENT_QUESTIONS, seedSalt: `daily-${dayKey()}`, write: (levelId ?? 0) >= writeFromLevel });
}

/**
 * «گرم‌کردن کامل سطح» — one warm-up item from EVERY lesson of the level (not a random sample),
 * so the round walks through the whole level in order; a fresh paper each day.
 */
export function buildLevelWarmUp(allLessons: readonly LevelLesson[], levelId: LevelId): PracticeItem[] {
  const lessons = allLessons.filter(lesson => lesson.levelId === levelId);
  const salt = `level-warmup-${dayKey()}`;
  return lessons.flatMap((lesson, index) => buildLessonPractice(lesson, { count: 1, kinds: index % 4 === 3 ? ['match'] : WARM_UP_KINDS, seedSalt: salt }));
}
