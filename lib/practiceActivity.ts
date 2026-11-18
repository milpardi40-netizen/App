import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LanguageId } from './languages/registry';
import { notifyLearningChange } from './learningChanges';

/** Small local day buckets, not transcripts, recordings or drafts. English time already has a store. */
export interface PracticeDay { ms: number; spoken: number; scoreSum: number; rounds: number }
const empty = (): PracticeDay => ({ ms: 0, spoken: 0, scoreSum: 0, rounds: 0 });
const key = (id: LanguageId) => `milo.practiceDays.${id}.v1`;
const writes = new Map<LanguageId, Promise<void>>();
async function read(id: LanguageId): Promise<Record<string, PracticeDay>> {
  const raw = await AsyncStorage.getItem(key(id));
  const days = raw === null ? {} : JSON.parse(raw);
  if (!days || typeof days !== 'object' || Array.isArray(days) || Object.entries(days).some(([date, bucket]) => {
    const row = bucket as PracticeDay;
    return !/^\d{4}-\d{2}-\d{2}$/.test(date) || !row || ![row.ms,row.spoken,row.scoreSum,row.rounds].every(n => Number.isFinite(n) && n >= 0)
      || row.scoreSum > row.spoken * 100;
  })) throw new Error('سابقهٔ تمرین خوانده نشد.');
  return days;
}
export async function loadPracticeDays(id: LanguageId) { await writes.get(id); return read(id); }
export function addPracticeActivity(id: LanguageId, day: string, delta: Partial<PracticeDay>) {
  const job = (writes.get(id) ?? Promise.resolve()).then(async () => {
    const days = await read(id), entry = days[day] ?? empty();
    for (const k of Object.keys(delta) as (keyof PracticeDay)[]) entry[k] += delta[k]!;
    days[day] = entry;
    await AsyncStorage.setItem(key(id), JSON.stringify(days));
    notifyLearningChange();
  });
  writes.set(id, job.catch(() => undefined));
  return job;
}
