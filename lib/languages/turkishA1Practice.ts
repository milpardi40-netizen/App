import type {TurkishCourseLesson} from './turkish';
import {TURKISH_A1_CONTENT, TURKISH_A1_SKILLS, TURKISH_A1_PRODUCTION} from './turkishA1.generated';
import {TURKISH_A1_IDS, isTurkishA1Core} from './turkishA1Scope';
import {lessonDialoguePairs, type LessonDialoguePair} from '../lessonDialoguePairs';

/** Replace only approved A1 slots AFTER Pre-A1/lab construction. Stable identity survives reordering. */
export function arrangeTurkishA1(lessons: TurkishCourseLesson[]): TurkishCourseLesson[] {
  const originals=new Map(lessons.filter(l=>isTurkishA1Core(l.id)).map(l=>[l.id,l]));
  if(originals.size!==64) throw Error('Turkish A1 source inventory changed.');
  let next=0;
  return lessons.map(slot=>{
    if(!isTurkishA1Core(slot.id)) return slot;
    const id=TURKISH_A1_IDS[next++],previous=originals.get(id)!,authored=TURKISH_A1_CONTENT[id];
    if(previous.sentences.length!==8||previous.sentences.some((s,i)=>s.id!==authored.sentences[i].id)) throw Error(`Turkish A1 stable slots changed: ${id}`);
    return {...previous,...authored,order:slot.order};
  });
}
/** The authored scene is passed separately, including its final unpaired turn. */
export function turkishLessonRoomPairs(lesson: Pick<TurkishCourseLesson,'id'|'sentences'|'dialogue'>): LessonDialoguePair[] {
  if(!isTurkishA1Core(lesson.id)) return lessonDialoguePairs(lesson.sentences,lesson.dialogue);
  return lesson.sentences.map(s=>{
    const learner={text:s.text,fa:s.fa};
    return {sentenceId:s.id,operator:{text:`Lütfen tekrar edin: ${s.text}`,fa:`لطفاً تکرار کنید: ${s.fa}`},learner,learnerFirst:[learner,learner] as const,kind:'echo',section:'review'};
  });
}
export const turkishA1RoomScene=(lesson: Pick<TurkishCourseLesson,'id'|'dialogue'>)=>isTurkishA1Core(lesson.id)?lesson.dialogue:undefined;
export const turkishA1Production=(id:string)=>isTurkishA1Core(id)?TURKISH_A1_PRODUCTION[id]:undefined;
export const turkishA1Skills=(id:string)=>isTurkishA1Core(id)?TURKISH_A1_SKILLS[id]:undefined;
