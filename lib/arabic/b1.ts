import type { ArabicLesson } from './content';
import { ARABIC_B1_PART1 } from './b1Part1';
import { ARABIC_B1_PART2 } from './b1Part2';

export const ARABIC_B1_LESSONS: ArabicLesson[] = [
  ...ARABIC_B1_PART1,
  ...ARABIC_B1_PART2,
];
