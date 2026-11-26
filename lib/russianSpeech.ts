import * as Speech from './courseSpeech';
import { stopRecorded } from '@/lib/content/packAudio';
import { playPreferredRecording, playFallbackRecording, noteSpeechSuccess } from '@/lib/content/speechFallback';
import { speechTagFor } from './speechLanguage';
import { voiceFor, warmVoices } from './voiceRotation';
import { recordedPlaybackRate } from './narration';

// Serialize stop/start requests: an asynchronous stop must not cancel the next
// sentence after it has started. Only the most recent request may speak.
let requestId = 0;
let queue: Promise<void> = Promise.resolve();

function enqueue(operation: () => Promise<void>): Promise<void> {
  queue = queue.catch(() => undefined).then(operation);
  return queue;
}

const warmed = { value: false };

/** Start the engine and its voice list while the lesson is still painting, so the first tap speaks. */
export function warmRussianSpeech(): void {
  if (warmed.value) return;
  warmed.value = true;
  warmVoices();
  void Speech.stop().catch(() => undefined);
}

export function playRussianSpeech(text: string, rate: number, onError?: () => void, onDone?: () => void, options?: { pitch?: number }): Promise<void> {
  const request = ++requestId;
  stopRecorded();
  const current = () => request === requestId;
  return enqueue(async () => {
    if (request !== requestId) return;
    await Speech.stop().catch(() => undefined);
    if (request !== requestId) return;
    // Device TTS stays primary; recordings are used only on devices that opted in, and at the tempo
    // the shared narration contract defines for this language.
    const recordedRate = recordedPlaybackRate('ru-RU', rate);
    if (await playPreferredRecording(text, recordedRate, 'ru', () => { if (request === requestId) onDone?.(); }, current)) return;
    if (request !== requestId) return;
    const voice = await voiceFor('ru-RU', text).catch(() => undefined);
    if (request !== requestId) return;
    const say = (withVoice: boolean) => {
      try {
        Speech.speak(text, {
          language: speechTagFor('ru-RU'),
          ...(withVoice && voice ? { voice } : {}),
          rate,
          ...(options?.pitch !== undefined ? { pitch: options.pitch } : {}),
          onDone: () => { if (request === requestId) { noteSpeechSuccess(); onDone?.(); } },
          // A rotated voice that fails to start falls back to the device default once,
          // then to a recording on devices whose engine is unreliable.
          onError: () => {
            if (request !== requestId) return;
            if (withVoice && voice) { say(false); return; }
            void playFallbackRecording(text, recordedRate, 'ru', () => { if (request === requestId) onDone?.(); }, current).then(ok => { if (current() && !ok) onError?.(); }).catch(() => { if (current()) onError?.(); });
          },
        });
      } catch {
        if (request !== requestId) return;
        if (withVoice && voice) { say(false); return; }
        void playFallbackRecording(text, recordedRate, 'ru', () => { if (request === requestId) onDone?.(); }, current).then(ok => { if (current() && !ok) onError?.(); }).catch(() => { if (current()) onError?.(); });
      }
    };
    say(true);
  });
}

export function stopRussianSpeech(): Promise<void> {
  const request = ++requestId;
  stopRecorded();
  return enqueue(async () => {
    if (request !== requestId) return;
    await Speech.stop().catch(() => undefined);
  });
}
