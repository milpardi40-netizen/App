import changedSlots from './germanA1ChangedSlots.generated.json';
import {withMergedRatings, validHistory, type RatingHistory} from '../reviewHistory';
/** Exact approved German core scope. Every other band and language is excluded. */
export const GERMAN_A1_IDS = [
  "de-a1-greetings",
  "de-a1-profile",
  "de-a1-asking-help",
  "de-a1-nationalities",
  "de-a1-numbers-age",
  "de-a1-nouns-gender-plural",
  "de-a1-articles",
  "de-a1-subject-pronouns",
  "de-a1-verb-to-be",
  "de-a1-family",
  "de-a1-possessives",
  "de-a1-demonstratives",
  "de-a1-descriptions",
  "de-a1-colors",
  "de-a1-feelings",
  "de-a1-simple-verbs",
  "de-a1-verb-conjugation",
  "de-a1-present-tense",
  "de-a1-positive-negative-questions",
  "de-a1-question-words",
  "de-a1-wants-needs",
  "de-a1-ability",
  "de-a1-dates-and-time",
  "de-a1-forms-information",
  "de-a1-daily-routine",
  "de-a1-weekly-schedule",
  "de-a1-work-study",
  "de-a1-instructions",
  "de-a1-location",
  "de-a1-prepositions",
  "de-a1-home-furniture",
  "de-a1-room-search",
  "de-a1-ordering-food",
  "de-a1-cafe",
  "de-a1-shopping-payment",
  "de-a1-supermarket",
  "de-a1-clothes-shopping",
  "de-a1-preferences",
  "de-a1-comparisons",
  "de-a1-leisure",
  "de-a1-weather",
  "de-a1-connectors",
  "de-a1-future-plans",
  "de-a1-invitations",
  "de-a1-suggestions",
  "de-a1-social-chat",
  "de-a1-directions",
  "de-a1-public-transport",
  "de-a1-travel-tickets",
  "de-a1-hotel-stay",
  "de-a1-polite-requests",
  "de-a1-phone-messages",
  "de-a1-doctor-symptoms",
  "de-a1-past-events",
  "de-a1-reasons",
  "de-a1-connected-conversation"
] as const;
const ids = new Set<string>(GERMAN_A1_IDS);
export const isGermanA1Core = (id: string): boolean => ids.has(id);
export const GERMAN_A1_CONTENT_REVISION = 'de-a1-sequenced-content-v1';
export const GERMAN_A1_ASSESSMENT_REVISION = 'de-a1-sequenced-assessment-v1';
export const GERMAN_A1_ROOM_REVISION = 'de-a1-scene-and-coverage-v1';
export const germanA1SentenceRevision = (id: string): string | undefined => isGermanA1Core(id) ? GERMAN_A1_CONTENT_REVISION : undefined;
export function resumeGermanA1Samples<T extends { sampleRevision?: string; revealed: boolean }>(id: string, session: T): T {
  const revision = germanA1SentenceRevision(id);
  return revision && session.sampleRevision !== revision ? { ...session, sampleRevision: revision, revealed: false } : session;
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
export type PreviousGermanA1ReviewContent = ReviewContent;
/** Stable slots with changed meanings start fresh scheduling, preserving the old content's record. */
export function reviseGermanA1ReviewCard<T extends ReviewContent & {lessonId: string; sentenceId: string; previousContent?: ReviewContent}>(card: T): T {
  const changed = (changedSlots as Record<string, string[]>)[card.lessonId];
  if (!changed?.includes(card.sentenceId) || card.contentRevision === GERMAN_A1_CONTENT_REVISION) return card;
  const previousContent: ReviewContent = {
    contentRevision: card.contentRevision, dueAt: card.dueAt, intervalDays: card.intervalDays,
    ease: card.ease, repetitions: card.repetitions, lapses: card.lapses,
    lastReviewedAt: card.lastReviewedAt, ratingHistory: card.ratingHistory,
  };
  return {...card, contentRevision: GERMAN_A1_CONTENT_REVISION, previousContent,
    dueAt: new Date(0).toISOString(), intervalDays: 0, ease: 2.3, repetitions: 0, lapses: 0,
    lastReviewedAt: undefined, ratingHistory: undefined};
}

/** Merge each content generation independently: a stale device cannot transfer old mastery to new text. */
export function mergeGermanReviewCards<T extends ReviewContent & {lessonId: string; sentenceId: string; previousContent?: ReviewContent}>(left: T, right: T): T {
  const a = reviseGermanA1ReviewCard(left), b = reviseGermanA1ReviewCard(right);
  const merge = <C extends ReviewContent>(x: C, y: C): C => {
    const time = (c: C) => Date.parse(c.lastReviewedAt ?? '1970-01-01') || 0;
    const preferX = time(x) > time(y) || (time(x) === time(y) && JSON.stringify(x) >= JSON.stringify(y));
    return preferX ? withMergedRatings(x, y) : withMergedRatings(y, x);
  };
  const merged = merge(a, b);
  if (!isGermanA1Core(left.lessonId)) return merged;
  const previous = a.previousContent && b.previousContent ? merge(a.previousContent, b.previousContent) : a.previousContent ?? b.previousContent;
  return previous ? {...merged, previousContent: previous} : merged;
}

/** A malformed optional archive must not become NaN review totals during import. */
export function validGermanReviewArchive(value: unknown): value is PreviousGermanA1ReviewContent {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const c=value as Partial<PreviousGermanA1ReviewContent>;
  return (c.contentRevision===undefined || typeof c.contentRevision==='string')
    && typeof c.dueAt==='string' && Number.isFinite(Date.parse(c.dueAt))
    && typeof c.intervalDays==='number' && Number.isFinite(c.intervalDays) && c.intervalDays>=0
    && typeof c.ease==='number' && Number.isFinite(c.ease) && c.ease>=1.3 && c.ease<=3
    && Number.isInteger(c.repetitions) && c.repetitions!>=0 && Number.isInteger(c.lapses) && c.lapses!>=0
    && (c.lastReviewedAt===undefined || (typeof c.lastReviewedAt==='string' && Number.isFinite(Date.parse(c.lastReviewedAt))))
    && validHistory(c.ratingHistory);
}
