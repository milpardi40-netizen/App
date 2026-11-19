import { useCallback, useEffect, useRef } from 'react';
import type { SpeakCheckResult } from '@/lib/speechScore';

const SPEAK_PASS_THRESHOLD = 70;

/**
 * Schedules a clean auto-advance callback after a passing pronunciation attempt (`score >= 70`),
 * cancelling automatically if the learner switches stage, item, or leaves the screen.
 */
export function useSpeakAutoAdvance(resetKey: string | number, delayMs = 900) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    cancel();
    return cancel;
  }, [resetKey, cancel]);

  const scheduleOnPass = useCallback((result: SpeakCheckResult, onPass: () => void) => {
    cancel();
    if (result.score < SPEAK_PASS_THRESHOLD) return;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onPass();
    }, delayMs);
  }, [cancel, delayMs]);

  return { scheduleOnPass, cancel };
}
