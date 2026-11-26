/** Lesson-based coaching only: transcript matching is not semantic or acoustic evaluation. */
export type RoomPracticeMode = 'guided' | 'cued' | 'exam';

export function firstWordCue(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return 'به معنی جمله فکر کن؛ نمونه را در صورت نیاز باز کن.';
  // Never accidentally reveal the whole answer, including short two-word lines.
  return `${words.slice(0, words.length > 5 ? 2 : 1).join(' ')} …`;
}

export function roomNextStep(attempted: number, total: number, weak: number, mode: RoomPracticeMode): string {
  if (attempted === 0) return 'قدم بعدی: دسترسی میکروفن را بررسی کن، نمونه را بشنو و دوباره امتحان کن.';
  if (attempted < total) return 'قدم بعدی: از بخش تمرین اشتباه‌ها، جمله‌های گفته‌نشده را تمرین کن.';
  if (weak > 0) return 'قدم بعدی: نمونهٔ جمله‌های مشخص‌شده را بشنو و دوباره بگو؛ خطای تشخیص دستگاه هم ممکن است.';
  return mode === 'guided'
    ? 'قدم بعدی: همین موقعیت را در مسیر «با اشاره» و با راهنمای کمتر تمرین کن.'
    : mode === 'cued'
      ? 'قدم بعدی: حالت آزمون را امتحان کن و جمله‌ها را از حافظه بگو.'
      : 'قدم بعدی: به درس بعد برو و جمله‌های تازه را در یک موقعیت دیگر تمرین کن.';
}

export function comparableRoomRuns<T extends { mode?: RoomPracticeMode }>(runs: readonly T[], mode: RoomPracticeMode): T[] {
  // Legacy runs used the guided path. Never compare hidden-text and guided results.
  return runs.filter(run => (run.mode ?? 'guided') === mode);
}
