import { lazy, Suspense } from 'react';
import ScreenLoading from '@/components/ScreenLoading';

const ArabicPronunciationScreen = lazy(() => import('@/components/arabic/ArabicPronunciationScreen'));

export default function ArabicPronunciationRoute() {
  return (
    <Suspense fallback={<ScreenLoading />}>
      <ArabicPronunciationScreen />
    </Suspense>
  );
}
