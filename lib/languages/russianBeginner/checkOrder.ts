import type { LearningLesson } from '../types';

type Check = NonNullable<LearningLesson['checks']>[number];

function numericSeed(seed: number | string): number {
  if (typeof seed === 'number') return Math.abs(Math.trunc(seed));
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash;
}

/** Vary answer positions by lesson, but keep them stable across restarts. */
export function orderChecks(checks: Check[], seed: number | string): Check[] {
  const base = numericSeed(seed);
  return checks.map((check, index) => {
    const n = check.choices.length;
    const offset = (base + index) % n;
    return {
      ...check,
      choices: [...check.choices.slice(offset), ...check.choices.slice(0, offset)],
      correctIndex: (check.correctIndex + n - offset) % n,
    };
  });
}
