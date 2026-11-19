import { useCallback, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import type { LanguageId } from '@/lib/languages/registry';
import { addPracticeActivity } from '@/lib/practiceActivity';
import { addStudyTime, measuredInterval, studyDay } from '@/lib/englishStudyState';

/** Focused, foreground engagement only; do not convert a lesson's suggested duration into study time. */
export function useStudyTimer(enabled = true, language: LanguageId = 'en') {
  const touch = useRef(Date.now());
  const flush = useRef<(() => void) | null>(null);
  const [error, setError] = useState('');
  const interact = useCallback(() => {
    const now = Date.now();
    if (now - touch.current > 60_000) flush.current?.(); // don't credit the idle interval before a tap
    touch.current = now;
  }, []);
  useFocusEffect(useCallback(() => {
    if (!enabled) return;
    const web = Platform.OS === 'web' && typeof document !== 'undefined';
    let previous = Date.now(), active = !AppState.currentState || AppState.currentState === 'active';
    let visible = !web || document.visibilityState === 'visible', mounted = true;
    touch.current = previous;
    function record(day: string, ms: number) {
      if (ms <= 0) return;
      void (language === 'en' ? addStudyTime(day, ms) : addPracticeActivity(language, day, { ms }))
        .then(() => { if (mounted) setError(''); }).catch(() => { if (mounted) setError('زمان این بخش ذخیره نشد؛ فضای دستگاه را بررسی کنید.'); });
    }
    function tick() {
      const now = Date.now(), start = previous;
      const amount = measuredInterval(start, now, touch.current, active && visible);
      previous = now;
      if (!amount) return;
      const midnight = new Date(start); midnight.setHours(24, 0, 0, 0);
      const first = Math.min(amount, midnight.getTime() - start);
      record(studyDay(new Date(start)), first);
      record(studyDay(midnight), amount - first);
    }
    flush.current = tick;
    const timer = setInterval(tick, 5000);
    const subscription = AppState.addEventListener('change', state => { tick(); active = state === 'active'; });
    const visibility = () => { tick(); visible = document.visibilityState === 'visible'; };
    const events = ['pointerdown', 'keydown', 'scroll'] as const;
    if (web) { events.forEach(e => document.addEventListener(e, interact, true)); document.addEventListener('visibilitychange', visibility); }
    return () => {
      mounted = false; tick(); flush.current = null; clearInterval(timer); subscription.remove();
      if (web) { events.forEach(e => document.removeEventListener(e, interact, true)); document.removeEventListener('visibilitychange', visibility); }
    };
  }, [enabled, interact, language]));
  return { interact, error };
}
export const useEnglishStudyTimer = useStudyTimer;
