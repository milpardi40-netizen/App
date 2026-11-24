import { lazy, Suspense } from 'react';
import ScreenLoading from '@/components/ScreenLoading';

const ArabicReviewScreen = lazy(() => import('@/components/arabic/ArabicReviewScreen'));

export default function ArabicReviewRoute() {
  return (
    <Suspense fallback={<ScreenLoading />}>
      <ArabicReviewScreen />
    </Suspense>
  );
}
