import * as Speech from '@/lib/courseSpeech';
import { speechTagFor } from '@/lib/speechLanguage';

export const ARABIC_SPEECH_LOCALE = 'ar-SA';
export const ARABIC_NORMAL_SPEECH_RATE = 1;
export const ARABIC_SLOW_SPEECH_RATE = 0.55;
export const ARABIC_NATURAL_SPEECH_RATE = 1.08;

let activeRequestId = 0;
let speaking = false;
let warmed = false;

export function playArabicSpeech(
  text: string,
  options?: {
    slow?: boolean;
    rate?: number;
    onDone?: () => void;
    onError?: () => void;
  },
) {
  const trimmed = text.trim();
  if (!trimmed) {
    options?.onDone?.();
    return;
  }

  const reqId = ++activeRequestId;
  const rate = options?.rate ?? (options?.slow ? ARABIC_SLOW_SPEECH_RATE : ARABIC_NORMAL_SPEECH_RATE);

  const start = () => {
    if (reqId !== activeRequestId) return;
    speaking = true;
    try {
      Speech.speak(trimmed, {
        language: speechTagFor(ARABIC_SPEECH_LOCALE),
        rate,
        pitch: 1.0,
        onDone: () => {
          if (reqId !== activeRequestId) return;
          speaking = false;
          options?.onDone?.();
        },
        onStopped: () => {
          if (reqId !== activeRequestId) return;
          speaking = false;
        },
        onError: () => {
          if (reqId !== activeRequestId) return;
          speaking = false;
          options?.onError?.();
        },
      });
    } catch {
      speaking = false;
      options?.onError?.();
    }
  };

  if (speaking) {
    void Speech.stop().catch(() => undefined).finally(start);
  } else {
    start();
  }
}

export function stopArabicSpeech() {
  activeRequestId += 1;
  speaking = false;
  return Speech.stop().catch(() => undefined);
}

export function warmArabicSpeech() {
  if (warmed) return;
  warmed = true;
}
