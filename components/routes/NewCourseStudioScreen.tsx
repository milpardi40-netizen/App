import { useLocalSearchParams } from 'expo-router';
import { StarterLevelStudio } from '@/components/LevelStudioRoutes';
import { NEW_COURSES } from '@/lib/languages/newCourses';
import { isNewLanguage } from '@/lib/languages/newLanguageIds';

/** The level exam and daily supplement of a German/French/Spanish course. */
export default function NewCourseStudioScreen() {
  const { language } = useLocalSearchParams<{ language: string }>();
  if (!isNewLanguage(language)) return null;
  return <StarterLevelStudio key={language} course={NEW_COURSES[language]} />;
}
