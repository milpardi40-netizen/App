import { lazy, Suspense } from 'react';
import ScreenLoading from '@/components/ScreenLoading';

const ArabicLibraryScreen = lazy(() => import('@/components/arabic/ArabicLibraryScreen'));

export default function ArabicLibraryRoute() {
  return (
    <Suspense fallback={<ScreenLoading />}>
      <ArabicLibraryScreen />
    </Suspense>
  );
}
