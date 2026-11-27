import { splitSpeechText } from './speechChunks';
import * as NativeSpeech from 'expo-speech';
import { Platform } from 'react-native';

export * from 'expo-speech';

const START_WATCHDOG_MS = 3000;
let generation = 0;
const activeTimers = new Set<ReturnType<typeof setTimeout>>();

function clearAllWatchdogs() {
  for (const timer of activeTimers) clearTimeout(timer);
  activeTimers.clear();
}

export function stop(): Promise<void> {
  generation++;
  clearAllWatchdogs();
  return NativeSpeech.stop();
}

export function speak(text: string, options: NativeSpeech.SpeechOptions = {}): void {
  if (Platform.OS === 'web') {
    NativeSpeech.speak(text, options);
    return;
  }

  const run = generation;
  const engineLimit = NativeSpeech.maxSpeechInputLength;
  const limit = Number.isFinite(engineLimit) && engineLimit >= 2 ? engineLimit : 4000;
  if (text.length > limit) {
    const chunks = splitSpeechText(text, limit);
    let began = false, offset = 0;
    const next = (index: number) => {
      if (run !== generation) return;
      if (index === chunks.length) { options.onDone?.(); return; }
      speak(chunks[index], {
        ...options,
        onStart: () => { if (!began) { began = true; options.onStart?.(); } },
        onBoundary: (event: {charIndex: number; charLength: number}) => {
          if (run !== generation || !options.onBoundary) return;
          const boundary = event;
          (options.onBoundary as (event: {charIndex: number; charLength: number}) => void)({...boundary,charIndex:offset+boundary.charIndex});
        },
        onDone: () => { offset += chunks[index].length; next(index + 1); },
      });
    };
    next(0);
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
    if (run !== generation || started || settled) return;
    const verify = typeof NativeSpeech.isSpeakingAsync === 'function'
      ? NativeSpeech.isSpeakingAsync().catch(() => false)
      : Promise.resolve(false);
    void verify.then((speaking) => {
      if (run !== generation || started || settled) return;
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
        if (run !== generation || settled) return;
        started = true;
        cleanup();
        options.onStart?.();
      },
      onDone: () => {
        if (run !== generation || settled) return;
        settled = true;
        cleanup();
        options.onDone?.();
      },
      onStopped: () => {
        if (run !== generation || settled) return;
        settled = true;
        cleanup();
        options.onStopped?.();
      },
      onError: (error: Error) => {
        if (run !== generation || settled) return;
        settled = true;
        cleanup();
        options.onError?.(error);
      },
    });
  } catch (error) {
    if (run === generation && !settled) {
      settled = true;
      cleanup();
      options.onError?.(error instanceof Error ? error : new Error('Device speech failed'));
    }
  }
}
