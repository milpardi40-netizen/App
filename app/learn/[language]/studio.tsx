import { Redirect, useLocalSearchParams } from 'expo-router';
import { lazy, Suspense } from 'react';
import { CoursePage } from '@/components/LanguageCourseUI';
import ScreenLoading from '@/components/ScreenLoading';
import { isNewLanguage } from '@/lib/languages/newLanguageIds';
import { FEATURES } from '@/lib/features';

/**
 * The exam/supplement studios are loaded on demand. The shared wiring module also prepares the English,
 * Russian and Turkish studios, which a German learner never opens.
 */
const NewCourseStudioScreen = lazy(() => import('@/components/routes/NewCourseStudioScreen'));
const EnglishLevelStudio = lazy(() => import('@/components/LevelStudioRoutes').then(module => ({ default: module.EnglishLevelStudio })));
const RussianLevelStudio = lazy(() => import('@/components/LevelStudioRoutes').then(module => ({ default: module.RussianLevelStudio })));
const TurkishLevelStudio = lazy(() => import('@/components/LevelStudioRoutes').then(module => ({ default: module.TurkishLevelStudio })));

export default function LanguageStudioRoute() {
  const { language } = useLocalSearchParams<{ language: string }>();
  if (language === 'en') return <Suspense fallback={<ScreenLoading />}><EnglishLevelStudio /></Suspense>;
  if (isNewLanguage(language)) return <Suspense fallback={<ScreenLoading />}><NewCourseStudioScreen /></Suspense>;
  if (language === 'ru') return FEATURES.russianCourse ? <Suspense fallback={<ScreenLoading tone="dark" />}><RussianLevelStudio /></Suspense> : <Redirect href={'/languages' as never} />;
  if (language === 'tr') return <Suspense fallback={<ScreenLoading tone="dark" />}><TurkishLevelStudio /></Suspense>;
  return <CoursePage title="مسیر تکمیلی پیدا نشد">{null}</CoursePage>;
}
