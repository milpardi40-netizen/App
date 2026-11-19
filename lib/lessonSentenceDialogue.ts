export type LessonSentenceDialogueLine = {
  speaker: string;
  text: string;
  fa: string;
};

/** Build a one-to-one rehearsal from only the current lesson's sentence list. */
export function lessonSentenceDialogue<T extends { fa: string }>(
  sentences: readonly T[],
  textOf: (sentence: T) => string,
  speakers: { partner: string; learner: string },
): LessonSentenceDialogueLine[] {
  return sentences.map((sentence, index) => {
    const text = textOf(sentence);
    if (!text.trim()) throw new Error(`Lesson sentence ${index + 1} has no dialogue text.`);
    return {
      speaker: index % 2 === 0 ? speakers.partner : speakers.learner,
      text,
      fa: sentence.fa,
    };
  });
}
