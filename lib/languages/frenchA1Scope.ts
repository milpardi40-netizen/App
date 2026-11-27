import changedSlots from './frenchA1ChangedSlots.generated.json';
import {withMergedRatings, validHistory, type RatingHistory} from '../reviewHistory';
/** Exact approved French core scope. Every other band and language is excluded. */
export const FRENCH_A1_IDS = [
  "fr-a1-greetings",
  "fr-a1-profile",
  "fr-a1-asking-help",
  "fr-a1-nationalities",
  "fr-a1-numbers-age",
  "fr-a1-nouns-gender-plural",
  "fr-a1-articles",
  "fr-a1-subject-pronouns",
  "fr-a1-verb-to-be",
  "fr-a1-family",
  "fr-a1-possessives",
  "fr-a1-demonstratives",
  "fr-a1-descriptions",
  "fr-a1-colors",
  "fr-a1-feelings",
  "fr-a1-simple-verbs",
  "fr-a1-verb-conjugation",
  "fr-a1-present-tense",
  "fr-a1-positive-negative-questions",
  "fr-a1-question-words",
  "fr-a1-wants-needs",
  "fr-a1-ability",
  "fr-a1-dates-and-time",
  "fr-a1-appointment-time",
  "fr-a1-forms-information",
  "fr-a1-daily-routine",
  "fr-a1-weekly-schedule",
  "fr-a1-work-study",
  "fr-a1-instructions",
  "fr-a1-location",
  "fr-a1-prepositions",
  "fr-a1-home-furniture",
  "fr-a1-ordering-food",
  "fr-a1-cafe",
  "fr-a1-shopping-payment",
  "fr-a1-supermarket",
  "fr-a1-clothes-shopping",
  "fr-a1-preferences",
  "fr-a1-comparisons",
  "fr-a1-leisure",
  "fr-a1-weather",
  "fr-a1-connectors",
  "fr-a1-future-plans",
  "fr-a1-invitations",
  "fr-a1-suggestions",
  "fr-a1-social-chat",
  "fr-a1-directions",
  "fr-a1-public-transport",
  "fr-a1-travel-tickets",
  "fr-a1-hotel-stay",
  "fr-a1-polite-requests",
  "fr-a1-phone-messages",
  "fr-a1-doctor-symptoms",
  "fr-a1-past-events",
  "fr-a1-reasons",
  "fr-a1-connected-conversation"
] as const;
const ids = new Set<string>(FRENCH_A1_IDS);
export const isFrenchA1Core = (id: string): boolean => ids.has(id);
export const FRENCH_A1_CONTENT_REVISION = 'fr-a1-sequenced-content-v1';
export const FRENCH_A1_ASSESSMENT_REVISION = 'fr-a1-sequenced-assessment-v1';
export const FRENCH_A1_ROOM_REVISION = 'fr-a1-scene-and-coverage-v1';
export const frenchA1SentenceRevision = (id: string): string | undefined => isFrenchA1Core(id) ? FRENCH_A1_CONTENT_REVISION : undefined;
export function resumeFrenchA1Samples<T extends { sampleRevision?: string; revealed: boolean }>(id: string, session: T): T {
  const revision = frenchA1SentenceRevision(id);
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
export type PreviousFrenchA1ReviewContent = ReviewContent;
/** Stable slots with changed meanings start fresh scheduling, preserving the old content's record. */
export function reviseFrenchA1ReviewCard<T extends ReviewContent & {lessonId: string; sentenceId: string; previousContent?: ReviewContent}>(card: T): T {
  const changed = (changedSlots as Record<string, string[]>)[card.lessonId];
  if (!changed?.includes(card.sentenceId) || card.contentRevision === FRENCH_A1_CONTENT_REVISION) return card;
  const previousContent: ReviewContent = {
    contentRevision: card.contentRevision, dueAt: card.dueAt, intervalDays: card.intervalDays,
    ease: card.ease, repetitions: card.repetitions, lapses: card.lapses,
    lastReviewedAt: card.lastReviewedAt, ratingHistory: card.ratingHistory,
  };
  return {...card, contentRevision: FRENCH_A1_CONTENT_REVISION, previousContent,
    dueAt: new Date(0).toISOString(), intervalDays: 0, ease: 2.3, repetitions: 0, lapses: 0,
    lastReviewedAt: undefined, ratingHistory: undefined};
}

/** Merge each content generation independently: a stale device cannot transfer old mastery to new text. */
export function mergeFrenchReviewCards<T extends ReviewContent & {lessonId: string; sentenceId: string; previousContent?: ReviewContent}>(left: T, right: T): T {
  const a = reviseFrenchA1ReviewCard(left), b = reviseFrenchA1ReviewCard(right);
  const merge = <C extends ReviewContent>(x: C, y: C): C => {
    const time = (c: C) => Date.parse(c.lastReviewedAt ?? '1970-01-01') || 0;
    const preferX = time(x) > time(y) || (time(x) === time(y) && JSON.stringify(x) >= JSON.stringify(y));
    return preferX ? withMergedRatings(x, y) : withMergedRatings(y, x);
  };
  const merged = merge(a, b);
  if (!isFrenchA1Core(left.lessonId)) return merged;
  const previous = a.previousContent && b.previousContent ? merge(a.previousContent, b.previousContent) : a.previousContent ?? b.previousContent;
  return previous ? {...merged, previousContent: previous} : merged;
}

/** A malformed optional archive must not become NaN review totals during import. */
export function validFrenchReviewArchive(value: unknown): value is PreviousFrenchA1ReviewContent {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const c=value as Partial<PreviousFrenchA1ReviewContent>;
  return (c.contentRevision===undefined || typeof c.contentRevision==='string')
    && typeof c.dueAt==='string' && Number.isFinite(Date.parse(c.dueAt))
    && typeof c.intervalDays==='number' && Number.isFinite(c.intervalDays) && c.intervalDays>=0
    && typeof c.ease==='number' && Number.isFinite(c.ease) && c.ease>=1.3 && c.ease<=3
    && Number.isInteger(c.repetitions) && c.repetitions!>=0 && Number.isInteger(c.lapses) && c.lapses!>=0
    && (c.lastReviewedAt===undefined || (typeof c.lastReviewedAt==='string' && Number.isFinite(Date.parse(c.lastReviewedAt))))
    && validHistory(c.ratingHistory);
}
