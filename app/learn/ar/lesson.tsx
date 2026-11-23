import { lazy, Suspense } from 'react';
import ScreenLoading from '@/components/ScreenLoading';

const ArabicLessonScreen = lazy(() => import('@/components/arabic/ArabicLessonScreen'));

export default function ArabicLessonRoute() {
  return (
    <Suspense fallback={<ScreenLoading />}>
      <ArabicLessonScreen />
    </Suspense>
  );
}
