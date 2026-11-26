import { useLocalSearchParams } from 'expo-router';
import { CoursePage } from '@/components/LanguageCourseUI';
import TurkishLesson from '@/components/TurkishLesson';
import { findTurkishLesson, TURKISH_LESSONS } from '@/lib/languages/turkish';

/** One Turkish lesson. The Turkish course is only evaluated when a Turkish lesson is opened. */
export default function TurkishLessonScreen() {
  const { id, fromStart, restartToken } = useLocalSearchParams<{ id?: string; fromStart?: string; restartToken?: string }>();
  const lesson = id ? findTurkishLesson(id) : TURKISH_LESSONS[0];
  if (!lesson) return <CoursePage title="درس ترکی استانبولی پیدا نشد" back="/learn/tr/library">{null}</CoursePage>;
  return <TurkishLesson key={`${lesson.id}:${restartToken ?? "resume"}`} lesson={lesson} fromStart={fromStart === '1'} />;
}
