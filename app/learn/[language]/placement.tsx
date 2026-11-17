import { Redirect, useLocalSearchParams } from 'expo-router';
import { lazy, Suspense } from 'react';
import { CoursePage } from '@/components/LanguageCourseUI';
import ScreenLoading from '@/components/ScreenLoading';
import { isNewLanguage } from '@/lib/languages/newLanguageIds';
import { FEATURES } from '@/lib/features';

/** The placement test is loaded on demand, so its course wiring never blocks the tap. */
const NewCoursePlacementScreen = lazy(() => import('@/components/routes/NewCoursePlacementScreen'));
const EnglishPlacement = lazy(() => import('@/components/LevelStudioRoutes').then(module => ({ default: module.EnglishPlacement })));
const RussianPlacement = lazy(() => import('@/components/LevelStudioRoutes').then(module => ({ default: module.RussianPlacement })));
const TurkishPlacement = lazy(() => import('@/components/LevelStudioRoutes').then(module => ({ default: module.TurkishPlacement })));

export default function LanguagePlacementRoute() {
  const { language } = useLocalSearchParams<{ language: string }>();
  if (language === 'en') return <Suspense fallback={<ScreenLoading />}><EnglishPlacement /></Suspense>;
  if (isNewLanguage(language)) return <Suspense fallback={<ScreenLoading />}><NewCoursePlacementScreen /></Suspense>;
  if (language === 'ru') return FEATURES.russianCourse ? <Suspense fallback={<ScreenLoading tone="dark" />}><RussianPlacement /></Suspense> : <Redirect href={'/languages' as never} />;
  if (language === 'tr') return <Suspense fallback={<ScreenLoading tone="dark" />}><TurkishPlacement /></Suspense>;
  return <CoursePage title="آزمون تعیین سطح پیدا نشد">{null}</CoursePage>;
}
