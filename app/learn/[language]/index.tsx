import { Redirect, useLocalSearchParams } from 'expo-router';
import { lazy, Suspense } from 'react';
import { CoursePage } from '@/components/LanguageCourseUI';
import ScreenLoading from '@/components/ScreenLoading';
import { isNewLanguage } from '@/lib/languages/newLanguageIds';
import { FEATURES } from '@/lib/features';

/**
 * Each course home is loaded on demand, and each one is a separate module.
 *
 * Tapping the German card used to evaluate the German, French, Spanish, Russian and Turkish homes — and
 * the course data of the first three — before anything could be painted. Now only the tapped language is
 * prepared, and the spinner answers the tap while it happens.
 */
const NewCourseHomeScreen = lazy(() => import('@/components/routes/NewCourseHomeScreen'));
const RussianHome = lazy(() => import('@/components/RussianHome'));
const TurkishHome = lazy(() => import('@/components/TurkishHome'));

export default function LearningHomeRoute() {
  const { language } = useLocalSearchParams<{ language: string }>();
  if (language === 'en') return <Redirect href={'/lang' as never} />;
  if (language === 'ru' && !FEATURES.russianCourse) return <Redirect href={'/languages' as never} />;
  if (isNewLanguage(language)) return <Suspense fallback={<ScreenLoading />}><NewCourseHomeScreen /></Suspense>;
  if (language === 'ru') return <Suspense fallback={<ScreenLoading tone="dark" />}><RussianHome /></Suspense>;
  if (language === 'tr') return <Suspense fallback={<ScreenLoading tone="dark" />}><TurkishHome /></Suspense>;
  return <CoursePage title="این مسیر آموزشی پیدا نشد">{null}</CoursePage>;
}
