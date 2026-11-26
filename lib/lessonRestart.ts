import { resetLessonChunks } from './lessonChunks';

let restartSequence = 0;
/** Token forces a clean lesson component, even when restarting the currently visible route. */
export function lessonRestartTarget(pathname: string, id: string) {
  if (!id.trim()) throw new Error('درس معتبر نیست.');
  return { pathname, params: { id, fromStart: '1', restartToken: `${Date.now()}-${++restartSequence}` } };
}

export async function prepareLessonRestart(pathname: string, id: string) {
  // Starting at sentence one must also work for a previously chunked 40–50 sentence lesson.
  await resetLessonChunks(id);
  return lessonRestartTarget(pathname, id);
}

/** Select the first authored lesson of the active/selected band, never hard-code Pre-A1. */
export function firstLessonInLevel<T extends { id: string; levelId: number }>(lessons: readonly T[], levelId: number) {
  return lessons.find(lesson => lesson.levelId === levelId);
}
