import * as NativeSpeech from 'expo-speech';
import { Platform } from 'react-native';

export * from 'expo-speech';

const START_WATCHDOG_MS = 3000;
const activeTimers = new Set<ReturnType<typeof setTimeout>>();

function clearAllWatchdogs() {
  for (const timer of activeTimers) clearTimeout(timer);
  activeTimers.clear();
}

export function stop(): Promise<void> {
  clearAllWatchdogs();
  return NativeSpeech.stop();
}

export function speak(text: string, options: NativeSpeech.SpeechOptions = {}): void {
  if (Platform.OS === 'web') {
    NativeSpeech.speak(text, options);
    return;
  }

  let started = false;
  let settled = false;
  let watchdog: ReturnType<typeof setTimeout> | undefined;

  const cleanup = () => {
    if (watchdog !== undefined) {
      clearTimeout(watchdog);
      activeTimers.delete(watchdog);
      watchdog = undefined;
    }
  };

  watchdog = setTimeout(() => {
    if (started || settled) return;
    const verify = typeof NativeSpeech.isSpeakingAsync === 'function'
      ? NativeSpeech.isSpeakingAsync().catch(() => false)
      : Promise.resolve(false);
    void verify.then((speaking) => {
      if (started || settled) return;
      if (speaking) {
        started = true;
        cleanup();
        return;
      }
      settled = true;
      cleanup();
      options.onError?.(new Error('Device speech engine did not start'));
    });
  }, START_WATCHDOG_MS);
  (watchdog as { unref?: () => void }).unref?.();
  activeTimers.add(watchdog);

  try {
    NativeSpeech.speak(text, {
      ...options,
      onStart: () => {
        if (settled) return;
        started = true;
        cleanup();
        options.onStart?.();
      },
      onDone: () => {
        if (settled) return;
        settled = true;
        cleanup();
        options.onDone?.();
      },
      onStopped: () => {
        if (settled) return;
        settled = true;
        cleanup();
        options.onStopped?.();
      },
      onError: (error: Error) => {
        if (settled) return;
        settled = true;
        cleanup();
        options.onError?.(error);
      },
    });
  } catch (error) {
    if (!settled) {
      settled = true;
      cleanup();
      options.onError?.(error instanceof Error ? error : new Error('Device speech failed'));
    }
  }
}
