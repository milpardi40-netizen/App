/** Technical update events only; no lesson content, contacts, location or device fingerprint. */
export type UpdateEventKind = 'session' | 'download_verified' | 'installer_requested' | 'upgrade_observed';
export interface UpdateBuild { package: string; code: number; name: string }
export interface UpdateReportEvent { id: string; owner: string; build: UpdateBuild; kind: UpdateEventKind; at: string; previous?: number }
interface SavedReports { events: UpdateReportEvent[]; seen: Record<string, number> }
export interface UpdateReportingDependencies {
 read(): Promise<string | null>; write(value: string): Promise<void>;
 user(): Promise<string | null>; build(): UpdateBuild | null;
 send(event: UpdateReportEvent): Promise<boolean>; uuid(): string; now(): number;
}
export const UPDATE_REPORT_QUEUE_KEY = 'milo_update_reports_v1';
export const UPDATE_SESSION_GAP_MS = 30 * 60 * 1000;
const MAX_AGE_MS = 90 * 86400000;
/** All writes serialize; sending is separate, so a slow server cannot stall a download. */
export function createUpdateReporter(deps: UpdateReportingDependencies) {
 let serial: Promise<unknown> = Promise.resolve();
 let flushing = false;
 let session = '';
 const reported = new Set<string>();
 function mutate<T>(fn: (saved: SavedReports) => Promise<T>): Promise<T> {
  const job = serial.catch(() => undefined).then(async () => {
   const raw = await deps.read();
   const value = raw ? JSON.parse(raw) as SavedReports : { events: [], seen: {} };
   if (!Array.isArray(value.events) || !value.seen || typeof value.seen !== 'object') throw Error('INVALID_REPORT_QUEUE');
   return fn(value);
  });
  serial = job; return job;
 }
 async function flush() {
  if (flushing) return;
  flushing = true;
  try {
   const owner = await deps.user(); if (!owner) return;
   for (let i = 0; i < 25; i++) {
    const event = await mutate(async value => value.events.find(e => e.owner === owner));
    if (!event || await deps.user() !== owner || !await deps.send(event)) return;
    await mutate(async value => { value.events = value.events.filter(e => e.id !== event.id || e.owner !== owner); await deps.write(JSON.stringify(value)); });
   }
  } catch { /* Retry on next foreground/auth change/event. Never interrupt study or installing. */ }
  finally { flushing = false; }
 }
 async function record(kind: UpdateEventKind, target?: UpdateBuild) {
  try {
   const owner = await deps.user(), build = target ?? deps.build();
   if (!owner || !build || !build.package || !Number.isSafeInteger(build.code) || build.code <= 0) return;
   if (!session) session = deps.uuid();
   const marker = `${owner}:${build.package}:${build.code}:${session}`;
   await mutate(async value => {
    if (kind === 'session' && reported.has(marker)) return;
    const at = new Date(deps.now()).toISOString();
    value.events = value.events.filter(e => Date.parse(e.at) >= deps.now() - MAX_AGE_MS);
    const add = (eventKind: UpdateEventKind, previous?: number) => value.events.push({ id: deps.uuid(), owner, build, kind: eventKind, at, ...(previous ? { previous } : {}) });
    add(kind);
    if (kind === 'session') {
     const key = `${owner}:${build.package}`, previous = value.seen[key];
     if (previous && previous < build.code) add('upgrade_observed', previous);
     value.seen[key] = build.code;
    }
    value.events = value.events.slice(-500);
    await deps.write(JSON.stringify(value));
    if (kind === 'session') reported.add(marker);
   });
   void flush();
  } catch { /* Best effort, bounded local queue. No fabricated past events. */ }
 }
 return { record, flush, newSession() { session = deps.uuid(); reported.clear(); } };
}
