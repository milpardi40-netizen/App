import changedSlots from './a1ChangedSlots.generated.json';
import {withMergedRatings, validHistory, type RatingHistory} from '../reviewHistory';
/** Exact approved Arabic core scope. Every other band and language is excluded. */
export const ARABIC_A1_IDS = [
  "ar-a1-01-personal-info-nationalities-languages",
  "ar-a1-13-negation-questions-nominal-verbal",
  "ar-a1-02-family-relatives-descriptions",
  "ar-a1-03-jobs-studies-workplace",
  "ar-a1-04-home-furniture-prepositions",
  "ar-a1-05-daily-routine-present-conjugation",
  "ar-a1-06-clock-days-months-dates",
  "ar-a1-12-ability-wants-needs-hobbies",
  "ar-a1-08-food-drinks-restaurant-orders",
  "ar-a1-07-clothes-colors-shopping",
  "ar-a1-09-city-places-directions-imperative",
  "ar-a1-10-transport-trips-tickets",
  "ar-a1-11-intro-past-tense-yesterday",
  "ar-a1-14-a1-real-life-conversations-capstone"
] as const;
const ids = new Set<string>(ARABIC_A1_IDS);
export const isArabicA1Core = (id: string): boolean => ids.has(id);
export const ARABIC_A1_CONTENT_REVISION = 'ar-a1-sequenced-content-v1';
export const ARABIC_A1_ASSESSMENT_REVISION = 'ar-a1-sequenced-assessment-v1';
export const ARABIC_A1_ROOM_REVISION = 'ar-a1-scene-and-coverage-v1';
export const arabicA1SentenceRevision = (id: string): string | undefined => isArabicA1Core(id) ? ARABIC_A1_CONTENT_REVISION : undefined;
export function resumeArabicA1Samples<T extends { sampleRevision?: string; revealed: boolean }>(id: string, session: T): T {
  const revision = arabicA1SentenceRevision(id);
  return revision && session.sampleRevision !== revision ? { ...session, sampleRevision: revision, revealed: false } : session;
}

export interface ArabicA1CompletionHistory {
  arabicA1CompletionRevisions?: Record<string, string>;
  previousArabicA1CompletedLessonIds?: string[];
}
export function validArabicA1CompletionHistory(value: ArabicA1CompletionHistory): boolean {
  const revisions=value.arabicA1CompletionRevisions,previous=value.previousArabicA1CompletedLessonIds;
  return (revisions===undefined || (!!revisions && typeof revisions==='object' && !Array.isArray(revisions) && Object.entries(revisions).every(([id,r])=>isArabicA1Core(id)&&typeof r==='string')))
    && (previous===undefined || (Array.isArray(previous)&&previous.every(id=>typeof id==='string'&&isArabicA1Core(id))));
}
/** Legacy completion is historical activity, not completion of a rewritten curriculum. */
export function reviseArabicA1Completions<T extends ArabicA1CompletionHistory & {completedLessonIds: string[]}>(value: T): T {
  const target=value.completedLessonIds.filter(isArabicA1Core);
  if(!target.length && !value.previousArabicA1CompletedLessonIds && !value.arabicA1CompletionRevisions) return value;
  const revisions: Record<string,string>={};
  for(const id of ARABIC_A1_IDS) if(value.arabicA1CompletionRevisions?.[id]===ARABIC_A1_CONTENT_REVISION) revisions[id]=ARABIC_A1_CONTENT_REVISION;
  const historical=Array.isArray(value.previousArabicA1CompletedLessonIds)?value.previousArabicA1CompletedLessonIds.filter(id=>typeof id==='string'&&isArabicA1Core(id)):[];
  return {...value,completedLessonIds:value.completedLessonIds.filter(id=>!isArabicA1Core(id)||revisions[id]===ARABIC_A1_CONTENT_REVISION),arabicA1CompletionRevisions:revisions,previousArabicA1CompletedLessonIds:[...new Set([...historical,...target.filter(id=>!revisions[id])])].sort()};
}
export function mergeArabicA1Completions<T extends ArabicA1CompletionHistory & {completedLessonIds:string[]}>(a:T,b:T): ArabicA1CompletionHistory {
  const x=reviseArabicA1Completions(a),y=reviseArabicA1Completions(b);
  if(!x.arabicA1CompletionRevisions&&!y.arabicA1CompletionRevisions) return {};
  return {arabicA1CompletionRevisions:{...x.arabicA1CompletionRevisions,...y.arabicA1CompletionRevisions},previousArabicA1CompletedLessonIds:[...new Set([...(x.previousArabicA1CompletedLessonIds??[]),...(y.previousArabicA1CompletedLessonIds??[])])].sort()};
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
export type PreviousArabicA1ReviewContent = ReviewContent;
/** Stable slots with changed meanings start fresh scheduling, preserving the old content's record. */
export function reviseArabicA1ReviewCard<T extends ReviewContent & {lessonId: string; sentenceId: string; previousContent?: ReviewContent}>(card: T): T {
  const changed = (changedSlots as Record<string, string[]>)[card.lessonId];
  if (!changed?.includes(card.sentenceId) || card.contentRevision === ARABIC_A1_CONTENT_REVISION) return card;
  const previousContent: ReviewContent = {
    contentRevision: card.contentRevision, dueAt: card.dueAt, intervalDays: card.intervalDays,
    ease: card.ease, repetitions: card.repetitions, lapses: card.lapses,
    lastReviewedAt: card.lastReviewedAt, ratingHistory: card.ratingHistory,
  };
  return {...card, contentRevision: ARABIC_A1_CONTENT_REVISION, previousContent,
    dueAt: new Date(0).toISOString(), intervalDays: 0, ease: 2.3, repetitions: 0, lapses: 0,
    lastReviewedAt: undefined, ratingHistory: undefined};
}

/** Merge each content generation independently: a stale device cannot transfer old mastery to new text. */
export function mergeArabicReviewCards<T extends ReviewContent & {lessonId: string; sentenceId: string; previousContent?: ReviewContent}>(left: T, right: T): T {
  const a = reviseArabicA1ReviewCard(left), b = reviseArabicA1ReviewCard(right);
  const merge = <C extends ReviewContent>(x: C, y: C): C => {
    const time = (c: C) => Date.parse(c.lastReviewedAt ?? '1970-01-01') || 0;
    const preferX = time(x) > time(y) || (time(x) === time(y) && JSON.stringify(x) >= JSON.stringify(y));
    return preferX ? withMergedRatings(x, y) : withMergedRatings(y, x);
  };
  const merged = merge(a, b);
  if (!isArabicA1Core(left.lessonId)) return merged;
  const previous = a.previousContent && b.previousContent ? merge(a.previousContent, b.previousContent) : a.previousContent ?? b.previousContent;
  return previous ? {...merged, previousContent: previous} : merged;
}

/** A malformed optional archive must not become NaN review totals during import. */
export function validArabicReviewArchive(value: unknown): value is PreviousArabicA1ReviewContent {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const c=value as Partial<PreviousArabicA1ReviewContent>;
  return (c.contentRevision===undefined || typeof c.contentRevision==='string')
    && typeof c.dueAt==='string' && Number.isFinite(Date.parse(c.dueAt))
    && typeof c.intervalDays==='number' && Number.isFinite(c.intervalDays) && c.intervalDays>=0
    && typeof c.ease==='number' && Number.isFinite(c.ease) && c.ease>=1.3 && c.ease<=3
    && Number.isInteger(c.repetitions) && c.repetitions!>=0 && Number.isInteger(c.lapses) && c.lapses!>=0
    && (c.lastReviewedAt===undefined || (typeof c.lastReviewedAt==='string' && Number.isFinite(Date.parse(c.lastReviewedAt))))
    && validHistory(c.ratingHistory);
}
