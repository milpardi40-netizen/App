import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { CORE_AUDIO_INDEX } from './audioRelease';
import { registerPackAudio } from './packAudio';
import { loadPacks } from './packs';
import type { CourseLanguage } from './readiness';

export interface CoreAudioIndex {
  schema: 1;
  languages: Partial<Record<CourseLanguage, Array<{ text: string; audio: string }>>>;
}

const STORE_KEY = 'milo_core_audio_index_v1';
const FETCH_TIMEOUT_MS = 8000;
let memoryIndex: CoreAudioIndex | null = null;
let inflight: Promise<void> | null = null;
let lastFailedAt = 0;
const registeredLanguages = new Set<CourseLanguage>();

async function readLocal(): Promise<string | null> {
  try { return Platform.OS === 'web' ? window.localStorage.getItem(STORE_KEY) : await AsyncStorage.getItem(STORE_KEY); }
  catch { return null; }
}

async function writeLocal(value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') window.localStorage.setItem(STORE_KEY, value);
    else await AsyncStorage.setItem(STORE_KEY, value);
  } catch { /* best-effort cache */ }
}

function isValidIndex(value: unknown): value is CoreAudioIndex {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Partial<CoreAudioIndex>;
  return obj.schema === 1 && !!obj.languages && typeof obj.languages === 'object';
}

function registerLanguageFromIndex(language: CourseLanguage, index: CoreAudioIndex): void {
  if (registeredLanguages.has(language)) return;
  const entries = index.languages[language];
  if (!Array.isArray(entries) || !entries.length) return;
  for (const entry of entries) {
    if (entry && typeof entry.text === 'string' && typeof entry.audio === 'string') {
      registerPackAudio(entry.text, entry.audio);
    }
  }
  registeredLanguages.add(language);
}

export async function loadCoreAudio(language: CourseLanguage): Promise<void> {
  if (registeredLanguages.has(language)) return;
  if (memoryIndex) {
    registerLanguageFromIndex(language, memoryIndex);
    return;
  }
  if (!inflight && Date.now() - lastFailedAt > 30000) {
    inflight = (async () => {
      const localRaw = await readLocal();
      if (localRaw) {
        try {
          const parsed = JSON.parse(localRaw) as unknown;
          if (isValidIndex(parsed)) memoryIndex = parsed;
        } catch { /* ignore corrupt cache */ }
      }
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS) : null;
      try {
        const response = await fetch(CORE_AUDIO_INDEX, {
          signal: controller?.signal,
          headers: { 'cache-control': 'no-cache' },
        });
        if (response.ok) {
          const remote = await response.json() as unknown;
          if (isValidIndex(remote)) {
            memoryIndex = remote;
            await writeLocal(JSON.stringify(remote));
          }
        }
      } catch {
        if (!memoryIndex) lastFailedAt = Date.now();
      } finally {
        if (timer) clearTimeout(timer);
        inflight = null;
      }
    })();
  }
  if (inflight) await inflight;
  if (memoryIndex) registerLanguageFromIndex(language, memoryIndex);
}

const prepared = new Map<CourseLanguage, Promise<void>>();

export function ensureRecordedAudio(language: CourseLanguage): Promise<void> {
  const existing = prepared.get(language);
  if (existing) return existing;
  const task = Promise.all([
    loadCoreAudio(language).catch(() => undefined),
    loadPacks(language).catch(() => undefined),
  ]).then(() => undefined);
  prepared.set(language, task);
  void task.then(() => {
    if (!registeredLanguages.has(language)) prepared.delete(language);
  });
  return task;
}
