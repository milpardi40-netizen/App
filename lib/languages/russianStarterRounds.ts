import { buildLessonPractice, type PracticeItem } from '../lessonPractice';
import type { LearningLesson } from './types';

/** Level-wide Pre-A1 practice tests the same listening & recognition skills across all 8 sentences of each lesson. */
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
    if (read && lesson.sentences.length >= 2) {
      const idx = (offset + i) % lesson.sentences.length;
      const otherIdx = (idx + 1) % lesson.sentences.length;
      const sentence = lesson.sentences[idx];
      const other = lesson.sentences[otherIdx];
      const isTrue = (offset + i) % 4 < 2;
      result.push({
        id: `${sentence.id}-read-${i}`,
        kind: 'truefalse',
        sentenceId: sentence.id,
        answerText: sentence.text,
        answerFa: sentence.fa,
        speakText: sentence.text,
        isTrue,
        shownFa: isTrue ? sentence.fa : other.fa,
      });
    } else {
      const [item] = buildLessonPractice({ id: lesson.id, sentences: lesson.sentences }, { count: 1, kinds: ['listen'], seedSalt: `${mode}/${salt}/${i}` });
      if (item) result.push({ ...item, id: `${item.id}/${i}` });
    }
  }
  return result;
}
