import type { PositionMap } from './levelProgress';

/** Explicit navigation is independent of historical completion and unrelated activity timestamps. */
export interface CourseResume {
  currentLessonId: string;
  resumeUpdatedAt?: string;
  resumePoints?: Record<string, string>;
}
const validTime = (value: unknown): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value));
export function validResumePoints(value: unknown, lessons: readonly { id: string }[]): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const known = new Set(lessons.map(lesson => lesson.id));
  return Object.fromEntries(Object.entries(value).filter(([id, at]) => known.has(id) && validTime(at))) as Record<string, string>;
}
export function resumeAt(progress: CourseResume, lessonId: string, at: string): CourseResume {
  return { currentLessonId: lessonId, resumeUpdatedAt: at, resumePoints: { ...progress.resumePoints, [lessonId]: at } };
}
export function mergedResume(a: CourseResume, b: CourseResume): CourseResume {
  const points: Record<string, string> = {};
  for (const source of [a, b]) {
    for (const [id, at] of Object.entries(source.resumePoints ?? {})) if (validTime(at) && (!points[id] || Date.parse(at) > Date.parse(points[id]))) points[id] = at;
    if (validTime(source.resumeUpdatedAt) && (!points[source.currentLessonId] || Date.parse(source.resumeUpdatedAt) > Date.parse(points[source.currentLessonId]))) points[source.currentLessonId] = source.resumeUpdatedAt;
  }
  const latest = Object.entries(points).sort(([idA, atA], [idB, atB]) => Date.parse(atB) - Date.parse(atA) || idA.localeCompare(idB))[0];
  return latest ? { currentLessonId: latest[0], resumeUpdatedAt: latest[1], resumePoints: points } : { currentLessonId: a.currentLessonId, resumePoints: points };
}

/** Pass one band's lessons to get that band's independent continue target. */
export function courseResumeLesson<T extends { id: string }>(lessons: readonly T[], progress: CourseResume & { completedLessonIds: readonly string[] }, sessions: PositionMap, chunks: Record<string, number[]> = {}, checks: Record<string, number> = {}): T | undefined {
  const completed = new Set(progress.completedLessonIds);
  const pending = lessons.filter(lesson => !completed.has(lesson.id));
  const points = validResumePoints(progress.resumePoints, lessons);
  if (validTime(progress.resumeUpdatedAt) && lessons.some(lesson => lesson.id === progress.currentLessonId)) points[progress.currentLessonId] = progress.resumeUpdatedAt;
  const explicit = Object.entries(points).sort((a, b) => Date.parse(b[1]) - Date.parse(a[1]) || a[0].localeCompare(b[0]))[0];
  const saved = lessons.find(lesson => lesson.id === (explicit?.[0] ?? progress.currentLessonId) && (explicit || !completed.has(lesson.id)));
  // A reset creates many fresh stage-zero sessions: none of them is newer actual learning.
  const meaningful = (id: string) => {
    const session = sessions[id];
    return (session && (session.stage > 0 || session.sentenceIndex > 0 || Object.keys(session.answers ?? {}).length > 0 || Object.keys(session.attemptEvidence ?? {}).length > 0)) || chunks[id]?.length || checks[id];
  };
  const latest = pending.filter(lesson => meaningful(lesson.id)).sort((a, b) => (sessions[b.id]?.updatedAt ?? '').localeCompare(sessions[a.id]?.updatedAt ?? ''))[0];
  const positionAt = latest && sessions[latest.id]?.updatedAt;
  const preferPosition = latest && (!saved || (positionAt ? Date.parse(positionAt) > (Date.parse(explicit?.[1] ?? progress.resumeUpdatedAt ?? '') || 0) : !explicit && !progress.resumeUpdatedAt && !sessions[saved.id]));
  return preferPosition ? latest : saved ?? pending[0] ?? lessons[0];
}
