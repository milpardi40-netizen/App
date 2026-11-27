import type {StarterLesson} from './newCourses';
import {SPANISH_A1_CONTENT, SPANISH_A1_SKILLS, SPANISH_A1_PRODUCTION} from './spanishA1.generated';
import {SPANISH_A1_IDS, isSpanishA1Core} from './spanishA1Scope';
import {lessonDialoguePairs, type LessonDialoguePair} from '../lessonDialoguePairs';

/** Final overlay after all legacy seed/extension/editorial construction. Stable slots stay local to their lesson. */
export function arrangeSpanishA1(lessons: StarterLesson[]): StarterLesson[] {
  const originals=new Map(lessons.filter(l=>isSpanishA1Core(l.id)).map(l=>[l.id,l]));
  if (originals.size!==SPANISH_A1_IDS.length) throw Error('Spanish A1 source inventory changed.');
  let next=0;
  return lessons.map(slot=>{
    if (!isSpanishA1Core(slot.id)) return slot;
    const id=SPANISH_A1_IDS[next++], previous=originals.get(id)!, authored=SPANISH_A1_CONTENT[id];
    if (previous.sentences.length!==authored.sentences.length || previous.sentences.some((s,i)=>s.id!==authored.sentences[i].id)) throw Error(`Spanish A1 stable slots changed: ${id}`);
    return {...previous,...authored,order:slot.order};
  });
}
export function spanishLessonRoomPairs(lesson: Pick<StarterLesson,'id'|'sentences'|'dialogue'>): LessonDialoguePair[] {
  if (!isSpanishA1Core(lesson.id)) return lessonDialoguePairs(lesson.sentences,lesson.dialogue);
  const pairs: LessonDialoguePair[]=[];
  for(let i=0;i+1<lesson.dialogue.length;i+=2){
    const operator=lesson.dialogue[i],learner=lesson.dialogue[i+1];
    pairs.push({sentenceId:`${lesson.id}:scene:${i/2+1}`,operator,learner,learnerFirst:[operator,learner],kind:'exchange',section:'dialogue'});
  }
  return [...pairs,...lesson.sentences.map(s=>{
    const learner={text:s.text,fa:s.fa};
    return {sentenceId:s.id,operator:{text:`Repita, por favor: ${s.text}`,fa:`لطفاً تکرار کنید: ${s.fa}`},learner,learnerFirst:[learner,learner] as const,kind:'echo' as const,section:'review' as const};
  })];
}
export const spanishA1Production=(id:string)=>isSpanishA1Core(id)?SPANISH_A1_PRODUCTION[id]:undefined;
export const spanishA1Skills=(id:string)=>isSpanishA1Core(id)?SPANISH_A1_SKILLS[id]:undefined;
