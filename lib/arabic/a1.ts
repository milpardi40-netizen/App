import {ARABIC_A1_CONTENT} from './a1Sequenced.generated';
import type { ArabicLesson } from './content';
import { ARABIC_A1_PART1 } from './a1Part1';
import { ARABIC_A1_PART2 } from './a1Part2';

export const ARABIC_A1_LESSONS: ArabicLesson[] = [
  ...ARABIC_A1_PART1,
  ...ARABIC_A1_PART2,
].map(lesson => {
  const content=ARABIC_A1_CONTENT[lesson.id];
  if(!content || lesson.sentences.length!==8 || lesson.sentences.some((s,i)=>s.id!==content.sentences[i].id) || lesson.dialogue.length!==content.dialogue.length) throw Error(`Arabic A1 stable inventory changed: ${lesson.id}`);
  return {...lesson,...content};
}).sort((a,b)=>a.order-b.order);
