/** A lapse resets SRS repetitions, but must not erase the number of reviews actually performed. */
export interface RatingHistory {
  days: Record<string, number>; // dated evidence from pre-history cards
  undated: number;
  lowerBound: boolean;
  // Independent installations/offline sessions can rate the same card on the same date. Merge
  // their increments by writer, not by sum (double counts syncs) or max per day (loses reviews).
  writers?: Record<string, Record<string, number>>;
}
export type RatedCard = { repetitions: number; lapses: number; lastReviewedAt?: string; ratingHistory?: RatingHistory };
export const localDay = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const writer = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const validDayCounts = (value: unknown) => !!value && typeof value === 'object' && !Array.isArray(value) &&
  Object.entries(value).every(([day, n]) => /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isSafeInteger(n) && n >= 0);
export function validHistory(h: RatingHistory | undefined) {
  return h === undefined || (!!h && Number.isSafeInteger(h.undated) && h.undated >= 0 && typeof h.lowerBound === 'boolean' && validDayCounts(h.days) &&
    (h.writers === undefined || (!!h.writers && typeof h.writers === 'object' && !Array.isArray(h.writers) && Object.values(h.writers).every(validDayCounts))));
}
export function ratingsOf(card: RatedCard): RatingHistory {
  if (card.ratingHistory && validHistory(card.ratingHistory)) return card.ratingHistory;
  const dated = !!card.lastReviewedAt && Number.isFinite(Date.parse(card.lastReviewedAt));
  return { days: dated ? { [localDay(new Date(card.lastReviewedAt!))]: 1 } : {},
    undated: Math.max(0, card.repetitions + card.lapses - Number(dated)), lowerBound: card.lapses > 0 };
}
export function datedRatings(h: RatingHistory) {
  const result = { ...h.days };
  for (const days of Object.values(h.writers ?? {})) for (const [d, n] of Object.entries(days)) result[d] = (result[d] ?? 0) + n;
  return result;
}
export function addRating(card: RatedCard, now: Date): RatingHistory {
  const h = ratingsOf(card), day = localDay(now), days = h.writers?.[writer] ?? {};
  return { ...h, writers: { ...h.writers, [writer]: { ...days, [day]: (days[day] ?? 0) + 1 } } };
}
const sum = (days: Record<string, number>) => Object.values(days).reduce((n, v) => n + v, 0);
const maxima = (a: Record<string, number>, b: Record<string, number>) => Object.fromEntries(
  [...new Set([...Object.keys(a), ...Object.keys(b)])].sort().map(d => [d, Math.max(a[d] ?? 0, b[d] ?? 0)]));
export function withMergedRatings<T extends RatedCard>(preferred: T, other: T): T {
  if (!preferred.ratingHistory && !other.ratingHistory) return preferred;
  const a = ratingsOf(preferred), b = ratingsOf(other), days = maxima(a.days, b.days);
  const writers = Object.fromEntries([...new Set([...Object.keys(a.writers ?? {}), ...Object.keys(b.writers ?? {})])].sort()
    .map(k => [k, maxima(a.writers?.[k] ?? {}, b.writers?.[k] ?? {})]));
  return { ...preferred, ratingHistory: { days, undated: Math.max(0, Math.max(sum(a.days) + a.undated, sum(b.days) + b.undated) - sum(days)),
    lowerBound: a.lowerBound || b.lowerBound, writers } };
}
