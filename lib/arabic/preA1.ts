import { enrichArabicPreA1 } from '../languages/preA1Practical/arabic';
import type { ArabicLesson } from './content';
import { ARABIC_PRE_A1_PART1 } from './preA1Part1';
import { ARABIC_PRE_A1_PART2 } from './preA1Part2';

export const ARABIC_PRE_A1_LESSONS: ArabicLesson[] = [
  ...ARABIC_PRE_A1_PART1.map(enrichArabicPreA1),
  ...ARABIC_PRE_A1_PART2.map(enrichArabicPreA1),
];
