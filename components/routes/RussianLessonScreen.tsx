import { useLocalSearchParams } from 'expo-router';
import { CoursePage } from '@/components/LanguageCourseUI';
import RussianLesson from '@/components/RussianLesson';
import { findRussianLesson, RUSSIAN_LESSONS } from '@/lib/languages/russian';

/** One Russian lesson. The Russian course is only evaluated when a Russian lesson is opened. */
export default function RussianLessonScreen() {
  const { id, fromStart } = useLocalSearchParams<{ id?: string; fromStart?: string }>();
  const lesson = id ? findRussianLesson(id) : RUSSIAN_LESSONS[0];
  if (!lesson) return <CoursePage title="درس پیدا نشد">{null}</CoursePage>;
  return <RussianLesson key={lesson.id} lesson={lesson} fromStart={fromStart === '1'} />;
}
