import { useLocalSearchParams } from 'expo-router';
import { CoursePage } from '@/components/LanguageCourseUI';
import StarterLesson from '@/components/StarterLesson';
import { NEW_COURSES } from '@/lib/languages/newCourses';
import { isNewLanguage } from '@/lib/languages/newLanguageIds';

/** One lesson of a German/French/Spanish course, resolved against that course only. */
export default function NewCourseLessonScreen() {
  const { language, id, fromStart, restartToken } = useLocalSearchParams<{ language: string; id?: string; fromStart?: string; restartToken?: string }>();
  if (!isNewLanguage(language)) return null;
  const course = NEW_COURSES[language];
  const lesson = id ? course.lessons.find(item => item.id === id) : course.lessons[0];
  if (!lesson) return <CoursePage title="درس پیدا نشد" back={`${course.home}/library`}>{null}</CoursePage>;
  return <StarterLesson key={`${lesson.id}:${restartToken ?? "resume"}`} course={course} lesson={lesson} fromStart={fromStart === '1' ? 'listen' : fromStart === 'restart' ? 'restart' : undefined} />;
}
