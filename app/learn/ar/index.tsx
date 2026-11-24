import { lazy, Suspense } from 'react';
import ScreenLoading from '@/components/ScreenLoading';

const ArabicHomeScreen = lazy(() => import('@/components/arabic/ArabicHomeScreen'));

export default function ArabicHomeRoute() {
  return (
    <Suspense fallback={<ScreenLoading />}>
      <ArabicHomeScreen />
    </Suspense>
  );
}
