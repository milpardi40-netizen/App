import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import StarterLibrary from '@/components/StarterLibrary';
import { NEW_COURSES } from '@/lib/languages/newCourses';
import { isNewLanguage } from '@/lib/languages/newLanguageIds';
import { prefetchLater } from '@/lib/afterPaint';

/**
 * The level list of a German/French/Spanish course; loads the course data only for those languages.
 * The lesson screen is warmed while the learner reads the list, so starting a lesson answers at once.
 */
export default function NewCourseLibraryScreen() {
  const { language } = useLocalSearchParams<{ language: string }>();
  useEffect(() => prefetchLater([() => import('@/components/routes/NewCourseLessonScreen')], 1800), []);
  if (!isNewLanguage(language)) return null;
  return <StarterLibrary key={language} course={NEW_COURSES[language]} />;
}
