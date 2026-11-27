import type {SentenceLesson} from './courseContent';
import {ENGLISH_A1_CONTENT, ENGLISH_A1_PRODUCTION, ENGLISH_A1_SKILLS} from './englishA1.generated';
import {ENGLISH_A1_IDS, isEnglishA1Core} from './englishA1Scope';
import {lessonDialoguePairs, type LessonDialoguePair} from './lessonDialoguePairs';

/** Applied after legacy extensions/completions, before final course numbering. */
export function arrangeEnglishA1(lessons: SentenceLesson[]): SentenceLesson[] {
  const original = new Map(lessons.filter(l => isEnglishA1Core(l.id)).map(l => [l.id, l]));
  if (original.size !== ENGLISH_A1_IDS.length) throw new Error('English A1 source lesson inventory changed.');
  let index = 0;
  return lessons.map(lesson => {
    if (!isEnglishA1Core(lesson.id)) return lesson;
    const id = ENGLISH_A1_IDS[index++];
    const previous = original.get(id)!;
    const authored = ENGLISH_A1_CONTENT[id];
    if (previous.sentences.length !== authored.sentences.length
      || previous.sentences.some((s, i) => s.id !== authored.sentences[i].id)) {
      throw new Error(`English A1 stable sentence slots changed: ${id}`);
    }
    return {...previous, ...authored};
  });
}

export function englishLessonRoomPairs(lesson: SentenceLesson): LessonDialoguePair[] {
  if (!isEnglishA1Core(lesson.id)) return lessonDialoguePairs(lesson.sentences, lesson.dialogue);
  const scene: LessonDialoguePair[] = [];
  for (let i = 0; i + 1 < lesson.dialogue.length; i += 2) {
    const operator = lesson.dialogue[i], learner = lesson.dialogue[i + 1];
    scene.push({sentenceId: `${lesson.id}:scene:${i / 2 + 1}`, operator, learner,
      kind: 'exchange', section: 'dialogue', learnerFirst: [operator, learner]});
  }
  const review: LessonDialoguePair[] = lesson.sentences.map(sentence => {
    const learner = {text: sentence.en, fa: sentence.fa};
    return {sentenceId: sentence.id, learner, kind: 'echo', section: 'review',
      operator: {text: `Please repeat: ${sentence.en}`, fa: `لطفاً تکرار کنید: ${sentence.fa}`},
      learnerFirst: [learner, learner]};
  });
  return [...scene, ...review];
}
export const englishA1Production = (id: string) => isEnglishA1Core(id) ? ENGLISH_A1_PRODUCTION[id] : undefined;
export const englishA1ProductionLabel = (id: string): 'A1' | undefined => isEnglishA1Core(id) ? 'A1' : undefined;
export const englishA1Skills = (id: string) => isEnglishA1Core(id) ? ENGLISH_A1_SKILLS[id] : [];
