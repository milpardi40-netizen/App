import { lessonRestartTarget } from './lessonRestart';
import { resetLessonChunks } from './lessonChunks';

/** Reset attempts in exactly one band. Keep completion history, review schedules and other bands. */
export async function prepareLevelRestart(pathname: string, firstId: string) {
  if (pathname === '/course/lesson') {
    const [{ SENTENCE_LESSONS }, { resetLessonSession }, { setCurrentLesson }] = await Promise.all([
      import('./courseContent'), import('./englishStudyState'), import('./courseProgress'),
    ]);
    const first = SENTENCE_LESSONS.find(item => item.id === firstId);
    if (!first) throw new Error('Unknown lesson');
    const level = SENTENCE_LESSONS.filter(item => item.levelId === first.levelId);
    for (const lesson of level) { await resetLessonSession(lesson.id); await resetLessonChunks(lesson.id); }
    await setCurrentLesson(level[0].id);
    return lessonRestartTarget(pathname, level[0].id);
  }
  const language = pathname.split('/')[2];
  if (language === 'ru' || language === 'tr') {
    const [course, study] = language === 'ru'
      ? await Promise.all([import('./languages/russian'), import('./languages/russianStudyState')])
      : await Promise.all([import('./languages/turkish'), import('./languages/turkishStudyState')]);
    const lessons = 'RUSSIAN_LESSONS' in course ? course.RUSSIAN_LESSONS : course.TURKISH_LESSONS;
    const progress = 'russianProgress' in course ? course.russianProgress : course.turkishProgress;
    const reset = 'resetRussianLessonSession' in study ? study.resetRussianLessonSession : study.resetTurkishLessonSession;
    const first = lessons.find(item => item.id === firstId);
    if (!first) throw new Error('Unknown lesson');
    const level = lessons.filter(item => item.levelId === first.levelId);
    for (const lesson of level) { await reset(lesson.id); await resetLessonChunks(lesson.id); }
    await progress.setCurrentLesson(level[0].id);
    return lessonRestartTarget(pathname, level[0].id);
  }
  if (language === 'ar') {
    const [{ ARABIC_LESSONS }, { resetArabicLessonSession }, { setArabicCurrentLesson }] = await Promise.all([
      import('./arabic/content'), import('./arabic/studyState'), import('./arabic/progress'),
    ]);
    const first = ARABIC_LESSONS.find(item => item.id === firstId);
    if (!first) throw new Error('Unknown lesson');
    const level = ARABIC_LESSONS.filter(item => item.levelId === first.levelId);
    for (const lesson of level) { await resetArabicLessonSession(lesson.id); await resetLessonChunks(lesson.id); }
    await setArabicCurrentLesson(level[0].id);
    return lessonRestartTarget(pathname, level[0].id);
  }
  const { NEW_COURSES, isNewLanguage } = await import('./languages/newCourses');
  if (!isNewLanguage(language)) throw new Error('Unknown course');
  const course = NEW_COURSES[language];
  const first = course.lessons.find(item => item.id === firstId);
  if (!first) throw new Error('Unknown lesson');
  const level = course.lessons.filter(item => item.levelId === first.levelId);
  for (const lesson of level) { await course.sessions.resetStarterLessonSession(lesson.id); await resetLessonChunks(lesson.id); }
  await course.progress.setCurrentLesson(level[0].id);
  return lessonRestartTarget(pathname, level[0].id);
}
