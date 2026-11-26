import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

/** Serialize native transitions so a late activation cannot leave the screen awake in background. */
export function foregroundWakeLease(activate: () => Promise<void>, deactivate: () => Promise<void>) {
  let active = false;
  let disposed = false;
  let queue = Promise.resolve();
  const setActive = (next: boolean) => {
    if (disposed && next) return;
    active = next;
    queue = queue.catch(() => undefined).then(async () => {
      if (active && !disposed) await activate();
      else await deactivate();
    }).catch(() => undefined); // Unsupported browser / unavailable Activity must not crash navigation.
    return queue;
  };
  return { setActive, dispose: () => { disposed = true; return setActive(false); } };
}

export function useForegroundKeepAwake() {
  useEffect(() => {
    const tag = 'milo-foreground-screen';
    const lease = foregroundWakeLease(() => activateKeepAwakeAsync(tag), () => deactivateKeepAwake(tag));
    const update = () => {
      const visible = Platform.OS !== 'web' || typeof document === 'undefined' || document.visibilityState === 'visible';
      void lease.setActive(AppState.currentState === 'active' && visible);
    };
    update();
    const subscription = AppState.addEventListener('change', update);
    if (Platform.OS === 'web' && typeof document !== 'undefined') document.addEventListener('visibilitychange', update);
    return () => {
      subscription.remove();
      if (Platform.OS === 'web' && typeof document !== 'undefined') document.removeEventListener('visibilitychange', update);
      void lease.dispose();
    };
  }, []);
}
