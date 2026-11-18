import { localDay } from './reviewHistory';

export function dayOffset(day: string, delta: number) {
  const [y, m, d] = day.split('-').map(Number);
  return localDay(new Date(y, m - 1, d + delta, 12)); // local noon, not 86,400,000 ms across DST
}
export function noteDate(days: Set<string>, at?: string | null) {
  if (!at) return;
  if (/^\d{4}-\d{2}-\d{2}$/.test(at)) days.add(at);
  else if (Date.parse(at) > 0) days.add(localDay(new Date(at)));
}
/** A legacy streak attests to consecutive days, but not to minutes or ratings on those days. */
export function addStreakDays(days: Set<string>, last: string | null, count: number) {
  if (!last || !/^\d{4}-\d{2}-\d{2}$/.test(last)) return;
  for (let i = 0; i < Math.max(1, Math.min(36600, count)); i++) days.add(dayOffset(last, -i));
}
export function calendarStreak(days: Set<string>, today: string) {
  let last: string | null = null, run = 0, best = 0;
  for (const day of [...days].filter(d => d <= today).sort()) {
    run = last === dayOffset(day, -1) ? run + 1 : 1;
    best = Math.max(best, run); last = day;
  }
  return { current: last === today || last === dayOffset(today, -1) ? run : 0, best, last };
}
