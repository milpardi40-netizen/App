import { InteractionManager } from 'react-native';

/**
 * Small scheduling helpers for work that must not delay the first paint.
 *
 * Opening a language used to block the JS thread with work nobody can see yet: the daily plan, the saved
 * spot of the current lesson, the saved spots of every other level, the grammar sections below the fold.
 * The screen therefore appeared only after all of it, and on a phone the tap felt frozen. Deferring that
 * work keeps the tap instant: the screen paints, then the rest lands a frame or two later.
 *
 * Every helper returns a cancel function and always runs its task within a bounded delay, so nothing is
 * silently dropped when the runtime never reports an idle moment.
 */

type Task = () => void;

type IdleWindow = typeof globalThis & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const idleWindow = globalThis as IdleWindow;

/** Runs `task` right after the current frame: on the interaction queue, and at most ~60 ms later. */
export function afterPaint(task: Task, fallbackDelay = 60): () => void {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    task();
  };
  const timer = setTimeout(run, fallbackDelay);
  const interaction = InteractionManager?.runAfterInteractions?.(run);
  return () => {
    done = true;
    clearTimeout(timer);
    interaction?.cancel?.();
  };
}

/** Runs `task` when the JS thread is idle, and at most `fallbackDelay` later. */
export function whenIdle(task: Task, fallbackDelay = 400): () => void {
  let done = false;
  let handle: number | undefined;
  const run = () => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    task();
  };
  const timer = setTimeout(run, fallbackDelay);
  if (typeof idleWindow.requestIdleCallback === 'function') {
    handle = idleWindow.requestIdleCallback(run, { timeout: fallbackDelay });
  }
  return () => {
    done = true;
    clearTimeout(timer);
    if (handle !== undefined) idleWindow.cancelIdleCallback?.(handle);
  };
}

/**
 * Loads screen modules before they are needed.
 *
 * A learner reads the language chooser for a second or two before tapping a card, and the language home
 * for another moment before tapping a level. Warming the module the next tap will open — on idle, one at
 * a time — means the tap itself only has to mount a screen that is already in memory.
 */
export function prefetchLater(loaders: ReadonlyArray<() => Promise<unknown>>, delay = 900): () => void {
  let cancelled = false;
  const run = async () => {
    for (const load of loaders) {
      if (cancelled) return;
      try {
        await load();
      } catch {
        // A screen that cannot be loaded now is still loaded when it is opened; nothing to report here.
      }
    }
  };
  const stop = whenIdle(() => { void run(); }, delay);
  return () => {
    cancelled = true;
    stop();
  };
}
