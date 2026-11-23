import type { ArabicLesson } from './content';
import { ARABIC_A1_PART1 } from './a1Part1';
import { ARABIC_A1_PART2 } from './a1Part2';

export const ARABIC_A1_LESSONS: ArabicLesson[] = [
  ...ARABIC_A1_PART1,
  ...ARABIC_A1_PART2,
];
