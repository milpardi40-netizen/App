import AsyncStorage from '@react-native-async-storage/async-storage';

// Workshop practice must not change the course's lesson/session completion counters.
const key = 'milo_ru_grammar_steps_v1';
export const markKey = (lemma: string, band: number) => `${lemma}:${band}`;
export async function readMarks(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || !data.every((s) => typeof s === 'string'))
    throw new Error('Unreadable workshop progress');
  return data;
}
let queue: Promise<unknown> = Promise.resolve();
export function markPractised(lemma: string, band: number): Promise<string[]> {
  const item = markKey(lemma, band);
  const save = queue
    .catch(() => {})
    .then(async () => {
      const items = await readMarks();
      if (!items.includes(item)) {
        items.push(item);
        await AsyncStorage.setItem(key, JSON.stringify(items));
      }
      return items;
    });
  queue = save;
  return save;
}
