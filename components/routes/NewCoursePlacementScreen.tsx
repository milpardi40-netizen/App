import { useLocalSearchParams } from 'expo-router';
import { StarterPlacement } from '@/components/LevelStudioRoutes';
import { NEW_COURSES } from '@/lib/languages/newCourses';
import { isNewLanguage } from '@/lib/languages/newLanguageIds';

/** The entry placement test of a German/French/Spanish course. */
export default function NewCoursePlacementScreen() {
  const { language } = useLocalSearchParams<{ language: string }>();
  if (!isNewLanguage(language)) return null;
  return <StarterPlacement key={language} course={NEW_COURSES[language]} />;
}
