import { lazy, Suspense } from 'react';
import ScreenLoading from '@/components/ScreenLoading';

const ArabicVocabularyScreen = lazy(() => import('@/components/arabic/ArabicVocabularyScreen'));

export default function ArabicVocabularyRoute() {
  return (
    <Suspense fallback={<ScreenLoading />}>
      <ArabicVocabularyScreen />
    </Suspense>
  );
}
