import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { Skill } from '@/lib/englishSupplement/content';
import { LESSON_STAGE_VERSION, resumeStage } from '@/lib/lessonStages';
import { ARABIC_ENGINE_STEPS } from './engine';

export const ARABIC_STUDY_KEY = 'arabic_study_state_v1';

export interface ArabicLessonAttempt {
  generation: number;
  id: string;
}

export interface ArabicLessonSession {
  stage: number;
  updatedAt?: string;
  stageVersion?: number;
  sentenceIndex: number;
  revealed: boolean;
  evidencePassed: boolean;
  attempt?: ArabicLessonAttempt;
  attemptEvidence?: Record<string, boolean>;
}

export interface ArabicCourseLessonEvidence {
  skill: Skill;
  correct: boolean;
  attempts: number;
  heard: boolean;
}

export interface ArabicStudyState {
  version: 1;
  sessions: Record<string, ArabicLessonSession>;
  days: Record<string, number>;
  lessonEvidence: Record<string, Record<string, ArabicCourseLessonEvidence>>;
}

export const arabicStudyDay = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const freshArabicSession = (): ArabicLessonSession => ({
  stage: 0,
  stageVersion: LESSON_STAGE_VERSION,
  sentenceIndex: 0,
  revealed: false,
  evidencePassed: false,
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

const validSkills = new Set<Skill>(['reading', 'listening', 'writing', 'grammar']);

export function parseArabicStudy(raw: string | null): ArabicStudyState {
  if (raw === null) return { version: 1, sessions: {}, days: {}, lessonEvidence: {} };
  const parsed = JSON.parse(raw) as Partial<ArabicStudyState> | null;
  if (
    !parsed ||
    parsed.version !== 1 ||
    !isRecord(parsed.sessions) ||
    !isRecord(parsed.days) ||
    Object.values(parsed.days).some(v => typeof v !== 'number' || !Number.isFinite(v) || v < 0) ||
    Object.values(parsed.sessions).some(
      value =>
        !value ||
        resumeStage(Number(value.stage), (value as { stageVersion?: unknown }).stageVersion, ARABIC_ENGINE_STEPS.length) === null ||
        !Number.isInteger(value.sentenceIndex) ||
        value.sentenceIndex < 0 ||
        typeof value.revealed !== 'boolean' ||
        typeof value.evidencePassed !== 'boolean' ||
        (value.attempt !== undefined &&
          (!isRecord(value.attempt) ||
            !Number.isSafeInteger(value.attempt.generation) ||
            value.attempt.generation < 1 ||
            typeof value.attempt.id !== 'string' ||
            !value.attempt.id ||
            value.attempt.id.length > 128)) ||
        (value.attemptEvidence !== undefined &&
          (!value.attempt || !isRecord(value.attemptEvidence) || Object.values(value.attemptEvidence).some(r => typeof r !== 'boolean'))),
    )
  ) {
    throw Error('اطلاعات جلسهٔ عربی معتبر نیست؛ داده‌های قبلی حفظ شدند.');
  }

  const lessonEvidence = parsed.lessonEvidence ?? {};
  if (
    !isRecord(lessonEvidence) ||
    Object.values(lessonEvidence).some(
      results =>
        !isRecord(results) ||
        Object.values(results).some(
          result =>
            !result ||
            !validSkills.has(result.skill as Skill) ||
            typeof result.correct !== 'boolean' ||
            typeof result.heard !== 'boolean' ||
            !Number.isSafeInteger(result.attempts) ||
            result.attempts < 1,
        ),
    )
  ) {
    throw Error('سنجش درس عربی معتبر نیست؛ داده‌های قبلی حفظ شدند.');
  }

  const sessions: Record<string, ArabicLessonSession> = {};
  for (const [id, value] of Object.entries(parsed.sessions as Record<string, ArabicLessonSession>)) {
    const stage = resumeStage(value.stage, value.stageVersion, ARABIC_ENGINE_STEPS.length);
    if (stage === null) continue;
    sessions[id] = { ...value, stage, stageVersion: LESSON_STAGE_VERSION };
    if (typeof value.updatedAt !== 'string' || !Number.isFinite(Date.parse(value.updatedAt))) {
      delete sessions[id].updatedAt;
    }
  }

  return {
    version: 1,
    sessions,
    days: parsed.days as Record<string, number>,
    lessonEvidence: lessonEvidence as Record<string, Record<string, ArabicCourseLessonEvidence>>,
  };
}

export async function loadArabicStudy(): Promise<ArabicStudyState> {
  return parseArabicStudy(
    Platform.OS === 'web'
      ? typeof window === 'undefined'
        ? null
        : window.localStorage.getItem(ARABIC_STUDY_KEY)
      : await AsyncStorage.getItem(ARABIC_STUDY_KEY),
  );
}

let queue: Promise<unknown> = Promise.resolve();
export function withArabicStudyStorageLock<T>(operation: () => Promise<T>): Promise<T> {
  const job = queue.then(operation);
  queue = job.catch(() => {});
  return job;
}

export function compareArabicLessonAttempts(left?: ArabicLessonAttempt, right?: ArabicLessonAttempt): number {
  const generation = (left?.generation ?? 0) - (right?.generation ?? 0);
  if (generation) return Math.sign(generation);
  const a = left?.id ?? '';
  const b = right?.id ?? '';
  return a === b ? 0 : a < b ? -1 : 1;
}

function update(change: (state: ArabicStudyState) => void): Promise<ArabicStudyState> {
  return withArabicStudyStorageLock(async () => {
    const state = await loadArabicStudy();
    change(state);
    const raw = JSON.stringify(state);
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') throw Error('ذخیره‌سازی در دسترس نیست.');
      window.localStorage.setItem(ARABIC_STUDY_KEY, raw);
    } else {
      await AsyncStorage.setItem(ARABIC_STUDY_KEY, raw);
    }
    return state;
  });
}

export async function saveArabicLessonSession(lessonId: string, session: ArabicLessonSession): Promise<ArabicStudyState> {
  return update(state => {
    state.sessions[lessonId] = {
      ...session,
      stageVersion: LESSON_STAGE_VERSION,
      updatedAt: new Date().toISOString(),
    };
  });
}

export async function resetArabicLessonSession(lessonId: string): Promise<ArabicStudyState> {
  return update(state => {
    const prev = state.sessions[lessonId];
    const nextGen = (prev?.attempt?.generation ?? 0) + 1;
    state.sessions[lessonId] = {
      ...freshArabicSession(),
      updatedAt: new Date().toISOString(),
      attempt: {
        generation: nextGen,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      },
      attemptEvidence: {},
    };
  });
}

export async function recordArabicLessonEvidence(
  lessonId: string,
  taskId: string,
  skill: Skill,
  correct: boolean,
  heard: boolean,
): Promise<ArabicStudyState> {
  return update(state => {
    if (!state.lessonEvidence[lessonId]) state.lessonEvidence[lessonId] = {};
    const prev = state.lessonEvidence[lessonId][taskId];
    state.lessonEvidence[lessonId][taskId] = {
      skill,
      correct: Boolean(prev?.correct || correct),
      attempts: (prev?.attempts ?? 0) + 1,
      heard: Boolean(prev?.heard || heard),
    };
  });
}

export async function recordArabicStudyTime(seconds: number): Promise<ArabicStudyState> {
  if (!Number.isFinite(seconds) || seconds <= 0) return loadArabicStudy();
  return update(state => {
    const key = arabicStudyDay();
    state.days[key] = Math.round(((state.days[key] ?? 0) + seconds) * 10) / 10;
  });
}
