import type { ArabicLesson } from './content';
import { ARABIC_B2_PART1 } from './b2Part1';
import { ARABIC_B2_PART2 } from './b2Part2';

export const ARABIC_B2_LESSONS: ArabicLesson[] = [
  ...ARABIC_B2_PART1,
  ...ARABIC_B2_PART2,
];
