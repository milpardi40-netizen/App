import { CHUNK_SIZE, CHUNK_THRESHOLD } from './lessonChunks';
import { toPersianDigits as fa } from './format';

export type ProgressLesson = { id: string; levelId: number; title: string; sentences: readonly { id: string }[]; checks?: readonly { correctIndex: number }[] };
export type SavedPosition = { stage: number; sentenceIndex: number; updatedAt?: string; answers?: Record<string, number>; attemptEvidence?: Record<string, boolean> };
export type PositionMap = Record<string, SavedPosition>;
export type ProgressTally = { total: number; completed: number; partial: number; percent: number };

/** A stage index counts *previous* stages. Chunks partition the sentence stage, not the whole lesson. */
function lessonFraction(lesson: ProgressLesson, session: SavedPosition | undefined, stages: number, chunks: readonly number[] = [], checkFraction = 0) {
  const n = lesson.sentences.length;
  const stage = session?.stage ?? 0;
  let units = stage;
  if (stage === 1 && n) units += Math.min(n - 1, Math.max(0, session!.sentenceIndex)) / n;
  if (stage === 8 && lesson.checks?.length && session?.answers) {
    units += Math.min(1, Object.keys(session.answers).length / lesson.checks.length);
  }
  if (checkFraction > 0 && (!session || stage === 8)) units += Math.min(1, checkFraction);
  if (n > CHUNK_THRESHOLD && chunks.length) {
    const covered = [...new Set(chunks)].filter(c => Number.isInteger(c) && c >= 1 && c <= Math.ceil(n / CHUNK_SIZE))
      .reduce((sum, c) => sum + Math.min(CHUNK_SIZE, n - (c - 1) * CHUNK_SIZE), 0);
    if (covered) units = Math.max(units, 1 + covered / n);
  }
  return Math.min(stages - 1, Math.max(0, units)) / stages;
}

export function courseTallies(lessons: readonly ProgressLesson[], completedIds: readonly string[], sessions: PositionMap, stages: number, chunks: Record<string, number[]> = {}, checks: Record<string, number> = {}) {
  const ids = new Set(completedIds);
  const empty = (): ProgressTally => ({ total: 0, completed: 0, partial: 0, percent: 0 });
  const course = empty(), levels: Record<number, ProgressTally> = {};
  for (const lesson of lessons) {
    const done = ids.has(lesson.id);
    const credit = done ? 1 : lessonFraction(lesson, sessions[lesson.id], stages, chunks[lesson.id], checks[lesson.id]);
    for (const tally of [course, levels[lesson.levelId] ??= empty()]) {
      tally.total++; tally.completed += Number(done); tally.partial += Number(!done && credit > 0); tally.percent += credit;
    }
  }
  for (const tally of [course, ...Object.values(levels)]) tally.percent = tally.total ? 100 * tally.percent / tally.total : 0;
  return { course, levels };
}

export function progressLabel(tally: ProgressTally | undefined) {
  return tally ? `${fa(tally.completed)} از ${fa(tally.total)} درس${tally.partial ? ` · ${fa(tally.partial)} نیمه‌تمام` : ''}` : '…';
}
export function formatPercent(percent: number) {
  if (percent > 0 && percent < .1) return 'کمتر از ۰٫۱٪';
  if (percent > 99.9 && percent < 100) return 'بیش از ۹۹٫۹٪';
  return `${fa(Number(percent.toFixed(1))).replace('.', '٫')}٪`;
}
