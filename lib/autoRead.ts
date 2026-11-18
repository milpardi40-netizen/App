import * as Speech from './courseSpeech';
import { stopRecorded } from '@/lib/content/packAudio';

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Read a list of items aloud one after another using the caller's own `speakOne`.
 * When `speakOne` returns a Promise that settles on speech completion, waits for that
 * exact completion (with a safety cap) before pausing and moving to the next item;
 * otherwise falls back to polling `isSpeakingAsync`.
 */
export function autoRead(
  count: number,
  speakOne: (index: number) => void | Promise<void>,
  onIndex?: (index: number) => void,
  gapMs = 850,
  onCancel?: () => void,
) {
  let cancelled = false;
  void (async () => {
    await wait(350);
    for (let index = 0; index < count && !cancelled; index++) {
      onIndex?.(index);
      const pending = speakOne(index);
      if (pending && typeof (pending as Promise<void>).then === 'function') {
        await Promise.race([pending, wait(16000)]);
      } else {
        // The speech helpers may enumerate voices before speaking; give them time to start.
        await wait(1200);
        let idle = 0;
        while (!cancelled) {
          const speaking = await Speech.isSpeakingAsync().catch(() => false);
          if (speaking) { idle = 0; } else if (++idle >= 2) break;
          await wait(250);
        }
      }
      if (cancelled) return;
      await wait(gapMs);
    }
  })();
  return () => {
    cancelled = true;
    onCancel?.();
    stopRecorded();
    void Speech.stop().catch(() => undefined);
  };
}
