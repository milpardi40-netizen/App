import { useLocalSearchParams } from 'expo-router';
import StarterReview from '@/components/StarterReview';
import { NEW_COURSES } from '@/lib/languages/newCourses';
import { isNewLanguage } from '@/lib/languages/newLanguageIds';

/** The review session of a German/French/Spanish course. */
export default function NewCourseReviewScreen() {
  const { language } = useLocalSearchParams<{ language: string }>();
  if (!isNewLanguage(language)) return null;
  return <StarterReview key={language} course={NEW_COURSES[language]} />;
}
