/** Device writes and successful account restores invalidate focused views, never initiate an upload. */
const listeners = new Set<() => void>();
export function notifyLearningChange() { for (const listener of listeners) listener(); }
export function onLearningChange(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

let lastPositionTime = 0;
/** Several queued writes (resume/restart/placement) can land in the same clock millisecond. */
export function positionTimestamp() {
  lastPositionTime = Math.max(Date.now(), lastPositionTime + 1);
  return new Date(lastPositionTime).toISOString();
}
