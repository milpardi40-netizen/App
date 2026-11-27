import { RUSSIAN_PRE_A1_LIGHT_VERBS_ID, RUSSIAN_PRE_A1_LIGHT_ROOM_REVISION } from './russianPreA1Phase2';
import { lessonDialoguePairs, type LessonDialogueLine, type LessonDialoguePair } from '../lessonDialoguePairs';
import { productionPrompt, type ProductionPrompt, type ProductionSource } from '../productionPrompt';
import type { LearningLesson } from './types';

/** New Pre-A1 scenes must not inherit scores from the old echo-only room. Raw runs survive. */
export const RUSSIAN_PRE_A1_ROOM_REVISION = 'ru-pre-a1-scene-and-review-v1';
/** Separate A1 history from release-179's different scripts; unchanged by the Pre-A1 repair. */
export const RUSSIAN_A1_ROOM_REVISION = 'ru-a1-dialogue-and-coverage-v1';
export const russianPreA1RoomRevisionFor = (id:string) => id === RUSSIAN_PRE_A1_LIGHT_VERBS_ID ? RUSSIAN_PRE_A1_LIGHT_ROOM_REVISION : RUSSIAN_PRE_A1_ROOM_REVISION;
export const isRussianA1 = (lesson: { id: string }) => lesson.id.startsWith('ru-a1-');

type RoomLesson = Pick<LearningLesson, 'id' | 'sentences' | 'dialogue'>;

/** The actual scene first; explicit whole-lesson rehearsal second. Pre-A1 shares the scene/review presentation; higher bands keep their path. */
export function russianLessonRoomPairs(lesson: RoomLesson): LessonDialoguePair[] {
  if (!isRussianA1(lesson) && !lesson.id.startsWith('ru-pre-')) return lessonDialoguePairs(lesson.sentences, lesson.dialogue);
  const scene: LessonDialoguePair[] = [];
  for (let i = 0; i + 1 < lesson.dialogue.length; i += 2) {
    const operator = lesson.dialogue[i];
    const learner = lesson.dialogue[i + 1];
    scene.push({
      sentenceId: `${lesson.id}:scene:${i / 2 + 1}`,
      operator, learner, kind: 'exchange', section: 'dialogue',
      // Choosing to open the conversation swaps the roles, NOT the order of its lines.
      learnerFirst: [operator, learner],
    });
  }
  const review: LessonDialoguePair[] = lesson.sentences.map(sentence => {
    const learner: LessonDialogueLine = { text: sentence.text, fa: sentence.fa };
    return {
      sentenceId: sentence.id, learner, kind: 'echo', section: 'review',
      operator: { text: `Повтори́те, пожа́луйста: ${sentence.text}`, fa: `لطفاً تکرار کنید: ${sentence.fa}` },
      // Learner-first rehearsal: retrieve first, then hear the unmodified model.
      learnerFirst: [learner, learner],
    };
  });
  return [...scene, ...review];
}

/** Derive both tasks from the authored, self-contained instruction shown at lesson entry. */
export function russianA1Production(lesson: ProductionSource & { teachingFa?: string }): ProductionPrompt | undefined {
  if (!isRussianA1(lesson)) return undefined;
  const prefix = 'نوشتن اختیاری در دفتر: ';
  const writing = lesson.teachingFa?.split('\n').find(line => line.startsWith(prefix))?.slice(prefix.length);
  if (!writing) throw new Error(`Russian A1 lesson ${lesson.id} has no authored production instruction.`);
  return productionPrompt(lesson, {
    writing,
    minWords: lesson.id.endsWith('alphabet-and-spelling') ? 1 : 6,
    speaking: `همین تکلیف را این بار شفاهی انجام بده: ${writing}\nاز جمله‌های کوتاه و الگوهای همین درس استفاده کن؛ آوردن دلیل فقط وقتی لازم است که در تکلیف خواسته شده باشد.`,
    checklist: [
      'همان اطلاعاتی را گفته‌ام که تکلیف همین درس می‌خواهد',
      'از واژه‌ها و الگوهای همین درس و درس‌های قبلی استفاده کرده‌ام',
      'در جملهٔ اسمیِ حال مثل «Я студент» فعل «است» اضافه نکرده‌ام؛ اگر فعل دارد، آن را با فاعل هماهنگ کرده‌ام',
      'پاسخم را با نمونه‌های درس مقایسه کرده‌ام؛ نمرهٔ خودکار ندارد',
    ],
  });
}

/** Label correction is scoped to Russian A1; other courses retain their existing presentation. */
export function russianA1ProductionLabel(lesson: { id: string }): 'A1' | undefined {
  return isRussianA1(lesson) ? 'A1' : undefined;
}
