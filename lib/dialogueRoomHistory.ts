import type { RoomPracticeMode } from './dialogueRoomCoach';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Dialogue-room run history — the room's own memory of past executions per
 * lesson. Powers the progress trend («بهتر از اجرای قبل») and the repeated-
 * error flags in the final report. Scores only; no audio, no transcripts.
 */

export type DialogueRun = {
  /** Overall score 0..100 for the learner's lines in that run. */
  score: number;
  mode?: RoomPracticeMode;
  helped?: number;
  /** How many of the learner's turns were attempted. */
  attempted: number;
  /** How many learner turns exist in a full run. */
  total: number;
  /** Words the recogniser did not hear cleanly (miss + near), lower-cased. */
  missed: string[];
  at: number;
};

const KEY = 'dialogue_room_runs_v1';
const MAX_RUNS_PER_LESSON = 10;

type RunMap = Record<string, DialogueRun[]>;

function normalise(word: string): string {
  return word.trim().toLocaleLowerCase();
}

export function uniqueMissedWords(missed: readonly string[]): string[] {
  const seen = new Set<string>();
  for (const word of missed) {
    const key = normalise(word);
    if (key) seen.add(key);
  }
  return [...seen];
}

export async function loadRuns(lessonId: string): Promise<DialogueRun[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const map = JSON.parse(raw) as RunMap;
    return Array.isArray(map[lessonId]) ? map[lessonId] : [];
  } catch {
    return [];
  }
}

export async function saveRun(lessonId: string, run: DialogueRun): Promise<DialogueRun[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const map = (raw ? JSON.parse(raw) as RunMap : {}) as RunMap;
    const runs = [...(Array.isArray(map[lessonId]) ? map[lessonId] : []), run].slice(-MAX_RUNS_PER_LESSON);
    map[lessonId] = runs;
    await AsyncStorage.setItem(KEY, JSON.stringify(map));
    return runs;
  } catch {
    return [];
  }
}
