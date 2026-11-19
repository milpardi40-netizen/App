import { useCallback, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { onLearningChange } from '@/lib/learningChanges';

/** Local reads only. Coalesce writes and discard a read overtaken by a sync, blur or language switch. */
export function useFocusedLearningData<T>(load: () => Promise<T>, refreshClock = false) {
  const [data, setData] = useState<T | null>(null);
  const [failed, setFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true, dirty = false, running = false;
    const refresh = async () => {
      dirty = true;
      if (running) return;
      running = true;
      while (active && dirty) {
        dirty = false;
        try {
          const next = await load();
          if (active && !dirty) { setData(next); setFailed(false); }
        } catch { if (active && !dirty) setFailed(true); }
      }
      running = false;
    };
    void refresh();
    const unsubscribe = onLearningChange(refresh);
    const app = AppState.addEventListener('change', state => { if (state === 'active') void refresh(); });
    const web = Platform.OS === 'web' && typeof window !== 'undefined';
    if (web) { window.addEventListener('focus', refresh); window.addEventListener('storage', refresh); }
    const clock = refreshClock ? setInterval(refresh, 60_000) : undefined;
    return () => {
      active = false; unsubscribe(); app.remove(); clearInterval(clock);
      if (web) { window.removeEventListener('focus', refresh); window.removeEventListener('storage', refresh); }
    };
  }, [load, retryKey, refreshClock]));
  return { data, failed, retry: () => setRetryKey(n => n + 1) };
}
