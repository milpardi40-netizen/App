/**
 * Standard, level- and length-calibrated speech recognition timing windows.
 *
 * Beginners (Pre-A1 / A1) get extra thinking and articulation headroom so a learner
 * recalling a word or pausing mid-phrase is never cut off prematurely, while single-word
 * targets stay responsive and multi-word sentences scale proportionally by word & character count.
 */

export type SpeechLevel = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export type SpeechTiming = {
  level: SpeechLevel;
  wordCount: number;
  charCount: number;
  /** Minimum recognition window before silence may conclude the session (ms). */
  minimumMs: number;
  /** Silence duration after speech before considering the turn complete (ms). */
  completeSilenceMs: number;
  /** Possibly-complete silence threshold for Android RecognizerIntent (ms). */
  possiblyCompleteSilenceMs: number;
  /** Total listening window budget including thinking pause + speaking + tail silence (ms). */
  maxWindowMs: number;
  /** Rounded window in seconds for clear UI display. */
  maxWindowSeconds: number;
};

type LevelProfile = {
  thinkBaseMs: number;
  perWordMs: number;
  perCharMs: number;
  silenceBaseMs: number;
  maxCapMs: number;
};

const PROFILES: Record<SpeechLevel, LevelProfile> = {
  'Pre-A1': { thinkBaseMs: 3800, perWordMs: 1200, perCharMs: 55, silenceBaseMs: 3200, maxCapMs: 24000 },
  'A1':     { thinkBaseMs: 3400, perWordMs: 1050, perCharMs: 48, silenceBaseMs: 2900, maxCapMs: 23000 },
  'A2':     { thinkBaseMs: 3000, perWordMs: 920,  perCharMs: 44, silenceBaseMs: 2600, maxCapMs: 22000 },
  'B1':     { thinkBaseMs: 2800, perWordMs: 840,  perCharMs: 40, silenceBaseMs: 2500, maxCapMs: 23000 },
  'B2':     { thinkBaseMs: 2800, perWordMs: 800,  perCharMs: 38, silenceBaseMs: 2500, maxCapMs: 25000 },
  'C1':     { thinkBaseMs: 2800, perWordMs: 780,  perCharMs: 38, silenceBaseMs: 2600, maxCapMs: 27000 },
};

const LEVEL_BY_ID: Record<number, SpeechLevel> = {
  0: 'Pre-A1',
  1: 'A1',
  2: 'A2',
  3: 'B1',
  4: 'B2',
  5: 'C1',
};

export function speechLevelFromId(levelId?: number): SpeechLevel {
  if (typeof levelId !== 'number' || Number.isNaN(levelId)) return 'A1';
  return LEVEL_BY_ID[Math.max(0, Math.min(5, Math.round(levelId)))] ?? 'A1';
}

export function computeSpeechTiming({
  text,
  level,
  levelId,
}: {
  text: string;
  level?: SpeechLevel;
  levelId?: number;
}): SpeechTiming {
  const resolvedLevel = level ?? speechLevelFromId(levelId);
  const profile = PROFILES[resolvedLevel];
  const trimmed = text.trim();
  const wordCount = Math.max(1, trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 1);
  const charCount = trimmed.length;

  const rawMinMs = profile.thinkBaseMs + wordCount * profile.perWordMs + charCount * profile.perCharMs;
  const minimumMs = Math.min(profile.maxCapMs, Math.max(4200, Math.round(rawMinMs)));

  const lengthSilenceBonus = Math.min(1400, Math.max(0, wordCount - 1) * 180);
  const completeSilenceMs = Math.min(4800, profile.silenceBaseMs + lengthSilenceBonus);
  const possiblyCompleteSilenceMs = Math.round(completeSilenceMs * 0.85);

  const maxWindowMs = Math.min(35000, minimumMs + completeSilenceMs + 3000);
  const maxWindowSeconds = Math.max(6, Math.round(maxWindowMs / 1000));

  return {
    level: resolvedLevel,
    wordCount,
    charCount,
    minimumMs,
    completeSilenceMs,
    possiblyCompleteSilenceMs,
    maxWindowMs,
    maxWindowSeconds,
  };
}
