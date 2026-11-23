import type { ArabicLesson } from './content';
import { ARABIC_C1_PART1 } from './c1Part1';
import { ARABIC_C1_PART2 } from './c1Part2';

export const ARABIC_C1_LESSONS: ArabicLesson[] = [
  ...ARABIC_C1_PART1,
  ...ARABIC_C1_PART2,
];
