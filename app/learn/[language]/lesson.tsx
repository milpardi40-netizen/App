import { useLocalSearchParams } from 'expo-router';
import { lazy, Suspense } from 'react';
import { CoursePage } from '@/components/LanguageCourseUI';
import ScreenLoading from '@/components/ScreenLoading';
import { isNewLanguage } from '@/lib/languages/newLanguageIds';

/**
 * A lesson screen is loaded on demand, and the language's course with it.
 *
 * The route used to import the German/French/Spanish courses plus the Russian and Turkish lesson data to
 * decide which one to show, so every lesson paid for every language. Each screen now owns its own data.
 */
const NewCourseLessonScreen = lazy(() => import('@/components/routes/NewCourseLessonScreen'));
const RussianLessonScreen = lazy(() => import('@/components/routes/RussianLessonScreen'));
const TurkishLessonScreen = lazy(() => import('@/components/routes/TurkishLessonScreen'));

export default function LanguageLessonRoute() {
  const { language } = useLocalSearchParams<{ language: string }>();
  if (isNewLanguage(language)) return <Suspense fallback={<ScreenLoading />}><NewCourseLessonScreen /></Suspense>;
  if (language === 'ru') return <Suspense fallback={<ScreenLoading tone="dark" />}><RussianLessonScreen /></Suspense>;
  if (language === 'tr') return <Suspense fallback={<ScreenLoading tone="dark" />}><TurkishLessonScreen /></Suspense>;
  return <CoursePage title="درس پیدا نشد">{null}</CoursePage>;
}
