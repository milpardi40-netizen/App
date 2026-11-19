import { useEffect, useMemo } from 'react';
import { playResponsiveSpeech, stopResponsiveSpeech } from '@/lib/responsiveSpeech';
import type { SentenceLesson } from '@/lib/courseContent';
import LanguageDialoguePractice, { type DialogueMode } from '@/components/LanguageDialoguePractice';

const LEARNER = 'شما';
const PARTNER = 'طرف مقابل';

/**
 * English guided dialogue. Uses the shared dialogue engine (guide / cloze / free modes and
 * unexpected-question branches) with the learner fixed to their own role and the partner's
 * line auto-played, which is how the English course has always behaved.
 */
export function EnglishDialoguePractice({ dialogue, sentences, defaultMode = 'guide' }: {
  dialogue: SentenceLesson['dialogue'];
  sentences?: ReadonlyArray<{ en: string; fa: string }>;
  defaultMode?: DialogueMode;
}) {
  // The final conversation is a controlled recycle of this lesson only: no cross-lesson
  // filler is introduced, and every displayed line is one of the lesson's source sentences.
  const lines = useMemo(() => (sentences?.length ? sentences : dialogue.map(line => ({ en: line.text, fa: line.fa }))).map((line, index) => ({
    speaker: index % 2 === 0 ? PARTNER : LEARNER, text: line.en, fa: line.fa,
  })), [dialogue, sentences]);
  const pool = useMemo(() => sentences?.map(sentence => ({ text: sentence.en, fa: sentence.fa })), [sentences]);
  useEffect(() => () => { void stopResponsiveSpeech(); }, []);
  const speak = (text: string) => playResponsiveSpeech({ text, locale: 'en-US', rate: 0.76 });
  return <LanguageDialoguePractice dialogue={lines} onSpeak={speak} languageLabel="انگلیسی" locale="en-US" productive defaultMode={defaultMode} branchPool={pool} fixedRole={LEARNER} autoPlayPartner />;
}
