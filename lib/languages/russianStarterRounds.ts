import { buildLessonPractice, type PracticeItem } from '../lessonPractice';
import type { LearningLesson } from './types';

/** Level-wide Pre-A1 practice tests the same skills as the lessons. Spoken chunks never
 * become spelling/order tasks. The daily variation pack is intentionally not this syllabus. */
export function russianStarterRound(lessons: readonly Pick<LearningLesson, 'id' | 'sentences'>[], mode: 'warmup'|'exam'|'practice', seed: number | string) {
  const starter = lessons.filter(l => l.id.startsWith('ru-pre-'));
  if (!starter.length) return [];
  const salt = String(seed);
  let offset = 0; for (const c of salt) offset = (31 * offset + c.charCodeAt(0)) >>> 0;
  const count = mode === 'warmup' ? starter.length : mode === 'exam' ? 20 : 10;
  const result: PracticeItem[] = [];
  for (let i = 0; i < count; i++) {
    const lesson = starter[(i + (mode === 'warmup' ? 0 : offset % starter.length)) % starter.length];
    const read = (i + offset) % 3 === 0;
    if (read) {
      const pair = lesson.sentences.slice(6), idx = (offset + i) % 2;
      const sentence = pair[idx], isTrue = (offset + i) % 4 < 2;
      result.push({ id: `${sentence.id}-read-${i}`, kind: 'truefalse', sentenceId: sentence.id, answerText: sentence.text,
        answerFa: sentence.fa, speakText: sentence.text, isTrue, shownFa: pair[isTrue ? idx : 1-idx].fa });
    } else {
      const [item] = buildLessonPractice({ id: lesson.id, sentences: lesson.sentences.slice(0,6) }, { count: 1, kinds: ['listen'], seedSalt: `${mode}/${salt}/${i}` });
      if (item) result.push({ ...item, id: `${item.id}/${i}` });
    }
  }
  return result;
}
