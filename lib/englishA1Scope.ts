import changedSlots from './englishA1ChangedSlots.generated.json';
import {withMergedRatings, type RatingHistory} from './reviewHistory';
/** Exact approved English core scope. Vocabulary labs and every other band are excluded. */
export const ENGLISH_A1_IDS = [
  'foundation-introducing-yourself', 'foundation-alphabet-and-spelling',
  'foundation-asking-for-help', 'foundation-pronouns-and-be',
  'foundation-numbers-and-contact', 'foundation-family-and-possessions',
  'foundation-objects-and-places', 'foundation-time-and-calendar',
  'foundation-everyday-routine', 'survival-current-activities',
  'survival-hobbies-and-free-time', 'survival-weather-and-seasons',
  'foundation-buying-something', 'survival-shopping-and-clothing',
  'survival-cafe-and-food', 'survival-directions-and-neighborhood',
  'survival-public-transport', 'survival-appointments-and-time',
  'survival-school-and-learning', 'survival-invitations-and-plans',
  'survival-past-and-future-plans', 'survival-job-interview',
  'survival-personal-information', 'survival-renting-a-home',
  'survival-travel-and-tickets', 'survival-hotel-and-stay',
  'survival-phone-and-messages', 'survival-services-and-post-office',
  'survival-health-and-pharmacy',
] as const;
const ids = new Set<string>(ENGLISH_A1_IDS);
export const isEnglishA1Core = (id: string): boolean => ids.has(id);
export const ENGLISH_A1_CONTENT_REVISION = 'en-a1-sequenced-content-v1';
export const ENGLISH_A1_ASSESSMENT_REVISION = 'en-a1-sequenced-assessment-v2';
export const ENGLISH_A1_ROOM_REVISION = 'en-a1-scene-and-coverage-v2';
/** Production tasks changed, not the meaning/order of the 1450 sentence slots. */
export const ENGLISH_A1_PRODUCTION_REVISION = 'en-a1-production-transfer-v2';
export const englishA1ProductionRevision = (id: string): string | undefined => isEnglishA1Core(id) ? ENGLISH_A1_PRODUCTION_REVISION : undefined;
export const englishA1SentenceRevision = (id: string): string | undefined => isEnglishA1Core(id) ? ENGLISH_A1_CONTENT_REVISION : undefined;
/** Keep completed chunks for the old meaning as history, not as skips in the rewritten lesson. */
export const englishA1ChunkKey = (id: string): string => isEnglishA1Core(id) ? `${id}:${ENGLISH_A1_CONTENT_REVISION}` : id;
export function resumeEnglishA1Samples<T extends { sampleRevision?: string; revealed: boolean }>(id: string, session: T): T {
  const revision = englishA1SentenceRevision(id);
  return revision && session.sampleRevision !== revision ? { ...session, sampleRevision: revision, revealed: false } : session;
}

/** Project the current generation to ordinary lesson IDs for resume/tally consumers. Raw map is untouched. */
export function currentEnglishChunkMap(raw: Record<string, number[]>): Record<string, number[]> {
  const current = {...raw};
  for (const id of ENGLISH_A1_IDS) current[id] = raw[englishA1ChunkKey(id)] ?? [];
  return current;
}

interface ReviewContent {
  contentRevision?: string;
  dueAt: string;
  intervalDays: number;
  ease: number;
  repetitions: number;
  lapses: number;
  lastReviewedAt?: string;
  ratingHistory?: RatingHistory;
}
export type PreviousEnglishA1ReviewContent = ReviewContent;
/** Stable slots with changed meanings start fresh scheduling, preserving the old content's record. */
export function reviseEnglishA1ReviewCard<T extends ReviewContent & {lessonId: string; sentenceId: string; previousContent?: ReviewContent}>(card: T): T {
  const changed = (changedSlots as Record<string, string[]>)[card.lessonId];
  if (!changed?.includes(card.sentenceId) || card.contentRevision === ENGLISH_A1_CONTENT_REVISION) return card;
  const previousContent: ReviewContent = {
    contentRevision: card.contentRevision, dueAt: card.dueAt, intervalDays: card.intervalDays,
    ease: card.ease, repetitions: card.repetitions, lapses: card.lapses,
    lastReviewedAt: card.lastReviewedAt, ratingHistory: card.ratingHistory,
  };
  return {...card, contentRevision: ENGLISH_A1_CONTENT_REVISION, previousContent,
    dueAt: new Date(0).toISOString(), intervalDays: 0, ease: 2.3, repetitions: 0, lapses: 0,
    lastReviewedAt: undefined, ratingHistory: undefined};
}

/** Merge each content generation independently: a stale device cannot transfer old mastery to new text. */
export function mergeEnglishReviewCards<T extends ReviewContent & {lessonId: string; sentenceId: string; previousContent?: ReviewContent}>(left: T, right: T): T {
  const a = reviseEnglishA1ReviewCard(left), b = reviseEnglishA1ReviewCard(right);
  const merge = <C extends ReviewContent>(x: C, y: C): C => {
    const time = (c: C) => Date.parse(c.lastReviewedAt ?? '1970-01-01') || 0;
    const preferX = time(x) > time(y) || (time(x) === time(y) && JSON.stringify(x) >= JSON.stringify(y));
    return preferX ? withMergedRatings(x, y) : withMergedRatings(y, x);
  };
  const merged = merge(a, b);
  if (!isEnglishA1Core(left.lessonId)) return merged;
  const previous = a.previousContent && b.previousContent ? merge(a.previousContent, b.previousContent) : a.previousContent ?? b.previousContent;
  return previous ? {...merged, previousContent: previous} : merged;
}
