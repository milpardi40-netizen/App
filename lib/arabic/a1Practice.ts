import type {ArabicLesson} from './content';
import {ARABIC_A1_SKILLS, ARABIC_A1_PRODUCTION} from './a1Sequenced.generated';
import {isArabicA1Core} from './a1Scope';
import {lessonDialoguePairs, type LessonDialoguePair} from '../lessonDialoguePairs';

/** A continuous scene is not a substitute for practising every stable learner row. */
export function arabicLessonRoomPairs(lesson: Pick<ArabicLesson,'id'|'sentences'|'dialogue'>): LessonDialoguePair[] {
  if(!isArabicA1Core(lesson.id)) return lessonDialoguePairs(lesson.sentences,lesson.dialogue.map(l=>({text:l.ar,fa:l.fa})));
  return lesson.sentences.map(s=>{
    const learner={text:s.ar,fa:s.fa};
    return {sentenceId:s.id,operator:{text:`كَرِّرْ: ${s.ar}`,fa:`تکرار کنید: ${s.fa}`},learner,learnerFirst:[learner,learner] as const,kind:'echo',section:'review'};
  });
}
export const arabicA1RoomScene=(lesson: Pick<ArabicLesson,'id'|'dialogue'>)=>isArabicA1Core(lesson.id)?lesson.dialogue.map(l=>({speaker:l.speaker,text:l.ar,fa:l.fa})):undefined;
export const arabicA1Production=(id:string)=>isArabicA1Core(id)?ARABIC_A1_PRODUCTION[id]:undefined;
export const arabicA1Skills=(id:string)=>isArabicA1Core(id)?ARABIC_A1_SKILLS[id]:undefined;
