import { useLocalSearchParams } from 'expo-router';
import { lazy, Suspense } from 'react';
import { CoursePage } from '@/components/LanguageCourseUI';
import ScreenLoading from '@/components/ScreenLoading';
import { isNewLanguage } from '@/lib/languages/newLanguageIds';

/** Each library is its own module, so a level tap only prepares the language it opens. */
const NewCourseLibraryScreen = lazy(() => import('@/components/routes/NewCourseLibraryScreen'));
const RussianLibrary = lazy(() => import('@/components/RussianLibrary'));
const TurkishLibrary = lazy(() => import('@/components/TurkishLibrary'));

export default function LanguageLibraryRoute() {
  const { language } = useLocalSearchParams<{ language: string }>();
  if (isNewLanguage(language)) return <Suspense fallback={<ScreenLoading />}><NewCourseLibraryScreen /></Suspense>;
  if (language === 'ru') return <Suspense fallback={<ScreenLoading tone="dark" />}><RussianLibrary /></Suspense>;
  if (language === 'tr') return <Suspense fallback={<ScreenLoading tone="dark" />}><TurkishLibrary /></Suspense>;
  return <CoursePage title="این مسیر آموزشی پیدا نشد">{null}</CoursePage>;
}
