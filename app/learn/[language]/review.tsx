import { useLocalSearchParams } from 'expo-router';
import { lazy, Suspense } from 'react';
import { CoursePage } from '@/components/LanguageCourseUI';
import ScreenLoading from '@/components/ScreenLoading';
import { isNewLanguage } from '@/lib/languages/newLanguageIds';

/** Reviews are loaded on demand, one language at a time, so the tap answers before the cards are built. */
const NewCourseReviewScreen = lazy(() => import('@/components/routes/NewCourseReviewScreen'));
const RussianReview = lazy(() => import('@/components/RussianReview'));
const TurkishReview = lazy(() => import('@/components/TurkishReview'));

export default function LanguageReviewRoute() {
  const { language } = useLocalSearchParams<{ language: string }>();
  if (isNewLanguage(language)) return <Suspense fallback={<ScreenLoading />}><NewCourseReviewScreen /></Suspense>;
  if (language === 'ru') return <Suspense fallback={<ScreenLoading tone="dark" />}><RussianReview /></Suspense>;
  if (language === 'tr') return <Suspense fallback={<ScreenLoading tone="dark" />}><TurkishReview /></Suspense>;
  return <CoursePage title="مرور پیدا نشد">{null}</CoursePage>;
}
