import { useLocalSearchParams } from 'expo-router';
import { lazy, Suspense } from 'react';
import ScreenLoading from '@/components/ScreenLoading';

const ArabicLessonScreen = lazy(() => import('@/components/arabic/ArabicLessonScreen'));

export default function ArabicLessonRoute() {
  const { restartToken } = useLocalSearchParams<{ restartToken?: string }>();
  return (
    <Suspense fallback={<ScreenLoading />}>
      <ArabicLessonScreen key={restartToken ?? "resume"} />
    </Suspense>
  );
}
