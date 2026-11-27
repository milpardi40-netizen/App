import changedSlots from './turkishA1ChangedSlots.generated.json';
import {withMergedRatings, validHistory, type RatingHistory} from '../reviewHistory';
/** Exact approved Turkish core scope. Every other band and language is excluded. */
export const TURKISH_A1_IDS = [
  "tr-l1-greetings",
  "tr-l1-alphabet-pronunciation",
  "tr-l2-asking-help-problems",
  "tr-l1-introductions",
  "tr-l1-vowel-harmony",
  "tr-l1-word-order",
  "tr-l1-personal-pronouns",
  "tr-l1-nominal-sentences",
  "tr-l1-nationality-language-residence",
  "tr-l1-numbers-age-info",
  "tr-l1-singular-plural",
  "tr-l1-demonstratives",
  "tr-l1-describing-things",
  "tr-l1-colors-shapes-appearance",
  "tr-l2-feelings-daily-states",
  "tr-l1-family",
  "tr-l1-possession-suffixes",
  "tr-l1-var-yok",
  "tr-l1-infinitive-verb-stem",
  "tr-l1-simple-verbal-sentences",
  "tr-l1-present-continuous",
  "tr-l1-common-verbs-present",
  "tr-l1-affirmative-negative-interrogative",
  "tr-l1-question-words",
  "tr-l1-location-position",
  "tr-l1-locative-case",
  "tr-l1-dative-case",
  "tr-l1-ablative-case",
  "tr-l1-accusative-case",
  "tr-l1-postpositions-spatial",
  "tr-l2-home-furniture",
  "tr-l1-likes-wants-needs",
  "tr-l1-ability-inability",
  "tr-l1-requests-permission-imperative",
  "tr-l1-ordinals-time-date",
  "tr-l1-daily-routine-habits",
  "tr-l2-weekly-schedule",
  "tr-l2-work-study-talk",
  "tr-l2-asking-info-forms",
  "tr-l2-simple-instructions",
  "tr-l2-ordering-food-drinks",
  "tr-l2-restaurant-cafe",
  "tr-l2-shopping-price-payment",
  "tr-l2-store-supermarket",
  "tr-l2-clothes-shopping",
  "tr-l2-preferences-choices",
  "tr-l2-simple-comparisons",
  "tr-l2-leisure-hobbies",
  "tr-l2-weather",
  "tr-l1-conjunctions",
  "tr-l2-near-future-plans",
  "tr-l2-invitations",
  "tr-l2-suggestions-advice",
  "tr-l2-social-situations",
  "tr-l2-directions-navigation",
  "tr-l2-public-transport-taxi",
  "tr-l2-travel-airport-tickets",
  "tr-l2-hotel-accommodation",
  "tr-l2-polite-requests-permission",
  "tr-l2-phone-short-messages",
  "tr-l2-doctor-symptoms",
  "tr-l2-recent-past-basics",
  "tr-l2-simple-reason-result",
  "tr-l2-connected-conversation"
] as const;
const ids = new Set<string>(TURKISH_A1_IDS);
export const isTurkishA1Core = (id: string): boolean => ids.has(id);
export const TURKISH_A1_CONTENT_REVISION = 'tr-a1-sequenced-content-v1';
export const TURKISH_A1_ASSESSMENT_REVISION = 'tr-a1-sequenced-assessment-v1';
export const TURKISH_A1_ROOM_REVISION = 'tr-a1-scene-and-coverage-v1';
export const turkishA1SentenceRevision = (id: string): string | undefined => isTurkishA1Core(id) ? TURKISH_A1_CONTENT_REVISION : undefined;
export function resumeTurkishA1Samples<T extends { sampleRevision?: string; revealed: boolean }>(id: string, session: T): T {
  const revision = turkishA1SentenceRevision(id);
  return revision && session.sampleRevision !== revision ? { ...session, sampleRevision: revision, revealed: false } : session;
}

export interface TurkishA1CompletionHistory {
  turkishA1CompletionRevisions?: Record<string, string>;
  previousTurkishA1CompletedLessonIds?: string[];
}
export function validTurkishA1CompletionHistory(value: TurkishA1CompletionHistory): boolean {
  const revisions=value.turkishA1CompletionRevisions,previous=value.previousTurkishA1CompletedLessonIds;
  return (revisions===undefined || (!!revisions && typeof revisions==='object' && !Array.isArray(revisions) && Object.entries(revisions).every(([id,r])=>isTurkishA1Core(id)&&typeof r==='string')))
    && (previous===undefined || (Array.isArray(previous)&&previous.every(id=>typeof id==='string'&&isTurkishA1Core(id))));
}
/** Legacy completion is historical activity, not completion of a rewritten curriculum. */
export function reviseTurkishA1Completions<T extends TurkishA1CompletionHistory & {completedLessonIds: string[]}>(value: T): T {
  const target=value.completedLessonIds.filter(isTurkishA1Core);
  if(!target.length && !value.previousTurkishA1CompletedLessonIds && !value.turkishA1CompletionRevisions) return value;
  const revisions: Record<string,string>={};
  for(const id of TURKISH_A1_IDS) if(value.turkishA1CompletionRevisions?.[id]===TURKISH_A1_CONTENT_REVISION) revisions[id]=TURKISH_A1_CONTENT_REVISION;
  const historical=Array.isArray(value.previousTurkishA1CompletedLessonIds)?value.previousTurkishA1CompletedLessonIds.filter(id=>typeof id==='string'&&isTurkishA1Core(id)):[];
  return {...value,completedLessonIds:value.completedLessonIds.filter(id=>!isTurkishA1Core(id)||revisions[id]===TURKISH_A1_CONTENT_REVISION),turkishA1CompletionRevisions:revisions,previousTurkishA1CompletedLessonIds:[...new Set([...historical,...target.filter(id=>!revisions[id])])].sort()};
}
export function mergeTurkishA1Completions<T extends TurkishA1CompletionHistory & {completedLessonIds:string[]}>(a:T,b:T): TurkishA1CompletionHistory {
  const x=reviseTurkishA1Completions(a),y=reviseTurkishA1Completions(b);
  if(!x.turkishA1CompletionRevisions&&!y.turkishA1CompletionRevisions) return {};
  return {turkishA1CompletionRevisions:{...x.turkishA1CompletionRevisions,...y.turkishA1CompletionRevisions},previousTurkishA1CompletedLessonIds:[...new Set([...(x.previousTurkishA1CompletedLessonIds??[]),...(y.previousTurkishA1CompletedLessonIds??[])])].sort()};
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
export type PreviousTurkishA1ReviewContent = ReviewContent;
/** Stable slots with changed meanings start fresh scheduling, preserving the old content's record. */
export function reviseTurkishA1ReviewCard<T extends ReviewContent & {lessonId: string; sentenceId: string; previousContent?: ReviewContent}>(card: T): T {
  const changed = (changedSlots as Record<string, string[]>)[card.lessonId];
  if (!changed?.includes(card.sentenceId) || card.contentRevision === TURKISH_A1_CONTENT_REVISION) return card;
  const previousContent: ReviewContent = {
    contentRevision: card.contentRevision, dueAt: card.dueAt, intervalDays: card.intervalDays,
    ease: card.ease, repetitions: card.repetitions, lapses: card.lapses,
    lastReviewedAt: card.lastReviewedAt, ratingHistory: card.ratingHistory,
  };
  return {...card, contentRevision: TURKISH_A1_CONTENT_REVISION, previousContent,
    dueAt: new Date(0).toISOString(), intervalDays: 0, ease: 2.3, repetitions: 0, lapses: 0,
    lastReviewedAt: undefined, ratingHistory: undefined};
}

/** Merge each content generation independently: a stale device cannot transfer old mastery to new text. */
export function mergeTurkishReviewCards<T extends ReviewContent & {lessonId: string; sentenceId: string; previousContent?: ReviewContent}>(left: T, right: T): T {
  const a = reviseTurkishA1ReviewCard(left), b = reviseTurkishA1ReviewCard(right);
  const merge = <C extends ReviewContent>(x: C, y: C): C => {
    const time = (c: C) => Date.parse(c.lastReviewedAt ?? '1970-01-01') || 0;
    const preferX = time(x) > time(y) || (time(x) === time(y) && JSON.stringify(x) >= JSON.stringify(y));
    return preferX ? withMergedRatings(x, y) : withMergedRatings(y, x);
  };
  const merged = merge(a, b);
  if (!isTurkishA1Core(left.lessonId)) return merged;
  const previous = a.previousContent && b.previousContent ? merge(a.previousContent, b.previousContent) : a.previousContent ?? b.previousContent;
  return previous ? {...merged, previousContent: previous} : merged;
}

/** A malformed optional archive must not become NaN review totals during import. */
export function validTurkishReviewArchive(value: unknown): value is PreviousTurkishA1ReviewContent {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const c=value as Partial<PreviousTurkishA1ReviewContent>;
  return (c.contentRevision===undefined || typeof c.contentRevision==='string')
    && typeof c.dueAt==='string' && Number.isFinite(Date.parse(c.dueAt))
    && typeof c.intervalDays==='number' && Number.isFinite(c.intervalDays) && c.intervalDays>=0
    && typeof c.ease==='number' && Number.isFinite(c.ease) && c.ease>=1.3 && c.ease<=3
    && Number.isInteger(c.repetitions) && c.repetitions!>=0 && Number.isInteger(c.lapses) && c.lapses!>=0
    && (c.lastReviewedAt===undefined || (typeof c.lastReviewedAt==='string' && Number.isFinite(Date.parse(c.lastReviewedAt))))
    && validHistory(c.ratingHistory);
}
