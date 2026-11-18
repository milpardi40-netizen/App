import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import StarterHome from '@/components/StarterHome';
import { NEW_COURSES } from '@/lib/languages/newCourses';
import { isNewLanguage } from '@/lib/languages/newLanguageIds';
import { prefetchLater } from '@/lib/afterPaint';

/**
 * The home of a German/French/Spanish course.
 *
 * Kept in its own module so that only this branch evaluates the course data: routing for the other
 * languages stays free of the German/French/Spanish lesson literals. The level list is warmed while the
 * learner is still reading the home, because that is the card they tap next.
 */
export default function NewCourseHomeScreen() {
  const { language } = useLocalSearchParams<{ language: string }>();
  useEffect(() => prefetchLater([() => import('@/components/routes/NewCourseLibraryScreen')]), []);
  if (!isNewLanguage(language)) return null;
  return <StarterHome key={language} course={NEW_COURSES[language]} />;
}
