import type { LearningLesson } from '../types';

type Check = NonNullable<LearningLesson['checks']>[number];

/** Vary answer positions by lesson, but keep them stable across restarts. */
export function orderChecks(checks: Check[], seed: number): Check[] {
  return checks.map((check, index) => {
    const n = check.choices.length;
    const offset = (seed + index) % n;
    return {
      ...check,
      choices: [...check.choices.slice(offset), ...check.choices.slice(0, offset)],
      correctIndex: (check.correctIndex + n - offset) % n,
    };
  });
}
