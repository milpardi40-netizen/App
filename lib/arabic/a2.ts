import type { ArabicLesson } from './content';
import { ARABIC_A2_PART1 } from './a2Part1';
import { ARABIC_A2_PART2 } from './a2Part2';

export const ARABIC_A2_LESSONS: ArabicLesson[] = [
  ...ARABIC_A2_PART1,
  ...ARABIC_A2_PART2,
];
