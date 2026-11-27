import { courseResumeLesson } from './courseResume';
import { expandedChoiceChecks } from './lessonAssessment';
import type { LanguageId } from './languages/registry';
import type { StudyState } from './englishStudyState';
import { courseTallies, type PositionMap, type ProgressLesson } from './levelProgress';
import { shuffleChecks } from './shuffleChecks';
import { loadChunkMap } from './lessonChunks';
import type { CourseProgress } from './courseProgress';

type Positions = { sessions: PositionMap; unreadable: boolean; study?: StudyState; checks?: Record<string, number> };
interface Source {
  lessons: readonly ProgressLesson[];
  levels: readonly { id: number; title: string; cefr: string }[];
  read: () => Promise<CourseProgress>;
  positions: () => Promise<Positions>;
  stages: number;
  answerKey?: (lessonId: string) => number[];
}
// Do not evaluate the five other curricula to open a single language's map.
async function sourceFor(id: LanguageId): Promise<Source> {
  if (id === 'en') {
    const [{ SENTENCE_LESSONS: lessons, COURSE_LEVELS: levels }, { readLocalProgress: read }, { loadStudy, withStudyStorageLock }, { ENGLISH_ENGINE_STEPS }] = await Promise.all([
      import('./courseContent'), import('./courseProgress'), import('./englishStudyState'), import('./englishLearningEngine'),
    ]);
    return { lessons, levels, read, stages: ENGLISH_ENGINE_STEPS.length, positions: async () => {
      const [study, { englishEvidenceFor }, { loadSupplement }] = await Promise.all([
        withStudyStorageLock(loadStudy), import('./lessonEvidenceBank'), import('./englishSupplement/progress'),
      ]);
      const extra = await loadSupplement().catch(() => null);
      const checks: Record<string, number> = {};
      for (const lesson of lessons) {
        const session = study.sessions[lesson.id];
        if (session && session.stage !== 8) continue; // a restart does not inherit an old attempt's checks
        const tasks = englishEvidenceFor(lesson).map(task => task.id);
        const evidence = session?.attempt ? session.attemptEvidence : { ...extra?.evidence, ...study.lessonEvidence[lesson.id] };
        if (evidence) checks[lesson.id] = tasks.filter(task => Object.hasOwn(evidence, task)).length / tasks.length;
      }
      return { sessions: study.sessions, study, checks, unreadable: !extra };
    } };
  }
  if (id === 'ru') {
    const [c, s] = await Promise.all([import('./languages/russian'), import('./languages/russianStudyState')]);
    return { answerKey: id => shuffleChecks(id, expandedChoiceChecks(c.RUSSIAN_LESSONS.find(l => l.id === id)!)).map(q => q.correctIndex), lessons: c.RUSSIAN_LESSONS, levels: c.RUSSIAN_LEVELS, read: c.russianProgress.getCourseProgress, stages: c.RUSSIAN_LESSON_STAGES.length, positions: s.loadRussianPositions };
  }
  if (id === 'tr') {
    const [c, s] = await Promise.all([import('./languages/turkish'), import('./languages/turkishStudyState')]);
    return { answerKey: id => shuffleChecks(id, expandedChoiceChecks(c.TURKISH_LESSONS.find(l => l.id === id)!)).map(q => q.correctIndex), lessons: c.TURKISH_LESSONS, levels: c.TURKISH_LEVELS, read: c.turkishProgress.getCourseProgress, stages: c.TURKISH_LESSON_STAGES.length, positions: s.loadTurkishPositions };
  }
  if (id === 'ar') {
    const [{ ARABIC_LESSONS, ARABIC_LEVELS }, { ARABIC_ENGINE_STEPS, arabicLessonToLearningLesson }, { getArabicProgress }, { loadArabicStudy }] = await Promise.all([
      import('./arabic/content'), import('./arabic/engine'), import('./arabic/progress'), import('./arabic/studyState'),
    ]);
    return {
      lessons: ARABIC_LESSONS.map(l => ({ ...arabicLessonToLearningLesson(l), levelId: l.levelId, order: l.order })),
      levels: ARABIC_LEVELS,
      read: getArabicProgress,
      stages: ARABIC_ENGINE_STEPS.length,
      positions: async () => ({ sessions: (await loadArabicStudy()).sessions, unreadable: false }),
    };
  }
  const [{ NEW_COURSES }, { ENGLISH_ENGINE_STEPS }] = await Promise.all([import('./languages/newCourses'), import('./englishLearningEngine')]);
  const c = NEW_COURSES[id];
  const { starterDisplayChecks } = await import('./languages/starterEditorial');
  return { answerKey: id => shuffleChecks(id, expandedChoiceChecks({ ...c.lessons.find(l => l.id === id)!, checks: starterDisplayChecks(c.lessons.find(l => l.id === id)!) })).map(q => q.correctIndex), lessons: c.lessons, levels: c.levels, read: c.progress.getCourseProgress, stages: ENGLISH_ENGINE_STEPS.length, positions: c.sessions.loadStarterPositions };
}

export async function loadCourseSnapshot(id: LanguageId) {
  const source = await sourceFor(id);
  const [progress, positions, chunks] = await Promise.all([
    source.read(), source.positions().catch((): Positions => ({ sessions: {}, unreadable: true })),
    id === 'en' ? loadChunkMap().catch(() => null) : {} as Record<string, number[]>,
  ]);
  const { lessons, levels } = source;
  const known = new Map(lessons.map(l => [l.id, l]));
  const sessions = Object.fromEntries(Object.entries(positions.sessions).filter(([id]) => known.has(id)));
  const current = courseResumeLesson(lessons, progress, sessions, chunks ?? {}, positions.checks);
  const resumeForLevel = (levelId: number) => courseResumeLesson(lessons.filter(lesson => lesson.levelId === levelId), progress, sessions, chunks ?? {}, positions.checks);
  const validCards = progress.reviewCards.filter(card => card.id === `${card.lessonId}:${card.sentenceId}` && Number.isFinite(Date.parse(card.dueAt)) &&
    Number.isInteger(card.repetitions) && card.repetitions >= 0 && Number.isInteger(card.lapses) && card.lapses >= 0 && known.get(card.lessonId)?.sentences.some(s => s.id === card.sentenceId));
  return { id, progress, sessions, resumeForLevel, answerKey: source.answerKey, study: positions.study, lessons, current, validCards,
    unreadable: positions.unreadable || chunks === null,
    ...courseTallies(lessons, progress.completedLessonIds, sessions, source.stages, chunks ?? {}, positions.checks), levelDefinitions: levels };
}
export type CourseSnapshot = Awaited<ReturnType<typeof loadCourseSnapshot>>;
