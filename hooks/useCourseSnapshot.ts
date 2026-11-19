import { useCallback } from 'react';
import { loadCourseSnapshot } from '@/lib/courseSnapshot';
import type { LanguageId } from '@/lib/languages/registry';
import { useFocusedLearningData } from './useFocusedLearningData';
export function useCourseSnapshot(id: LanguageId) {
  const result = useFocusedLearningData(useCallback(() => loadCourseSnapshot(id), [id]));
  return { ...result, data: result.data?.id === id ? result.data : null };
}
