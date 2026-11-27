import changedSlots from './spanishA1ChangedSlots.generated.json';
import {withMergedRatings, validHistory, type RatingHistory} from '../reviewHistory';
/** Exact approved Spanish core scope. Every other band and language is excluded. */
export const SPANISH_A1_IDS = [
  "es-a1-greetings",
  "es-a1-profile",
  "es-a1-asking-help",
  "es-a1-nationalities",
  "es-a1-numbers-age",
  "es-a1-nouns-gender-plural",
  "es-a1-articles",
  "es-a1-subject-pronouns",
  "es-a1-verb-to-be",
  "es-a1-family",
  "es-a1-possessives",
  "es-a1-demonstratives",
  "es-a1-descriptions",
  "es-a1-colors",
  "es-a1-feelings",
  "es-a1-simple-verbs",
  "es-a1-verb-conjugation",
  "es-a1-present-tense",
  "es-a1-positive-negative-questions",
  "es-a1-question-words",
  "es-a1-wants-needs",
  "es-a1-ability",
  "es-a1-dates-and-time",
  "es-a1-forms-information",
  "es-a1-daily-routine",
  "es-a1-weekly-schedule",
  "es-a1-work-study",
  "es-a1-past-events",
  "es-a1-instructions",
  "es-a1-location",
  "es-a1-prepositions",
  "es-a1-home-furniture",
  "es-a1-ordering-food",
  "es-a1-cafe",
  "es-a1-shopping-payment",
  "es-a1-supermarket",
  "es-a1-clothes-shopping",
  "es-a1-preferences",
  "es-a1-comparisons",
  "es-a1-leisure",
  "es-a1-weather",
  "es-a1-connectors",
  "es-a1-future-plans",
  "es-a1-invitations",
  "es-a1-suggestions",
  "es-a1-social-chat",
  "es-a1-directions",
  "es-a1-metro-directions",
  "es-a1-public-transport",
  "es-a1-travel-tickets",
  "es-a1-hotel-stay",
  "es-a1-polite-requests",
  "es-a1-phone-messages",
  "es-a1-doctor-symptoms",
  "es-a1-reasons",
  "es-a1-connected-conversation"
] as const;
const ids = new Set<string>(SPANISH_A1_IDS);
export const isSpanishA1Core = (id: string): boolean => ids.has(id);
export const SPANISH_A1_CONTENT_REVISION = 'es-a1-sequenced-content-v1';
export const SPANISH_A1_ASSESSMENT_REVISION = 'es-a1-sequenced-assessment-v1';
export const SPANISH_A1_ROOM_REVISION = 'es-a1-scene-and-coverage-v1';
export const spanishA1SentenceRevision = (id: string): string | undefined => isSpanishA1Core(id) ? SPANISH_A1_CONTENT_REVISION : undefined;
export function resumeSpanishA1Samples<T extends { sampleRevision?: string; revealed: boolean }>(id: string, session: T): T {
  const revision = spanishA1SentenceRevision(id);
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
export type PreviousSpanishA1ReviewContent = ReviewContent;
/** Stable slots with changed meanings start fresh scheduling, preserving the old content's record. */
export function reviseSpanishA1ReviewCard<T extends ReviewContent & {lessonId: string; sentenceId: string; previousContent?: ReviewContent}>(card: T): T {
  const changed = (changedSlots as Record<string, string[]>)[card.lessonId];
  if (!changed?.includes(card.sentenceId) || card.contentRevision === SPANISH_A1_CONTENT_REVISION) return card;
  const previousContent: ReviewContent = {
    contentRevision: card.contentRevision, dueAt: card.dueAt, intervalDays: card.intervalDays,
    ease: card.ease, repetitions: card.repetitions, lapses: card.lapses,
    lastReviewedAt: card.lastReviewedAt, ratingHistory: card.ratingHistory,
  };
  return {...card, contentRevision: SPANISH_A1_CONTENT_REVISION, previousContent,
    dueAt: new Date(0).toISOString(), intervalDays: 0, ease: 2.3, repetitions: 0, lapses: 0,
    lastReviewedAt: undefined, ratingHistory: undefined};
}

/** Merge each content generation independently: a stale device cannot transfer old mastery to new text. */
export function mergeSpanishReviewCards<T extends ReviewContent & {lessonId: string; sentenceId: string; previousContent?: ReviewContent}>(left: T, right: T): T {
  const a = reviseSpanishA1ReviewCard(left), b = reviseSpanishA1ReviewCard(right);
  const merge = <C extends ReviewContent>(x: C, y: C): C => {
    const time = (c: C) => Date.parse(c.lastReviewedAt ?? '1970-01-01') || 0;
    const preferX = time(x) > time(y) || (time(x) === time(y) && JSON.stringify(x) >= JSON.stringify(y));
    return preferX ? withMergedRatings(x, y) : withMergedRatings(y, x);
  };
  const merged = merge(a, b);
  if (!isSpanishA1Core(left.lessonId)) return merged;
  const previous = a.previousContent && b.previousContent ? merge(a.previousContent, b.previousContent) : a.previousContent ?? b.previousContent;
  return previous ? {...merged, previousContent: previous} : merged;
}

/** A malformed optional archive must not become NaN review totals during import. */
export function validSpanishReviewArchive(value: unknown): value is PreviousSpanishA1ReviewContent {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const c=value as Partial<PreviousSpanishA1ReviewContent>;
  return (c.contentRevision===undefined || typeof c.contentRevision==='string')
    && typeof c.dueAt==='string' && Number.isFinite(Date.parse(c.dueAt))
    && typeof c.intervalDays==='number' && Number.isFinite(c.intervalDays) && c.intervalDays>=0
    && typeof c.ease==='number' && Number.isFinite(c.ease) && c.ease>=1.3 && c.ease<=3
    && Number.isInteger(c.repetitions) && c.repetitions!>=0 && Number.isInteger(c.lapses) && c.lapses!>=0
    && (c.lastReviewedAt===undefined || (typeof c.lastReviewedAt==='string' && Number.isFinite(Date.parse(c.lastReviewedAt))))
    && validHistory(c.ratingHistory);
}
