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
  sentences: ReadonlyArray<{ en: string; fa: string }>;
  defaultMode?: DialogueMode;
}) {
  // The final conversation is an exact lesson rehearsal: one line per source sentence,
  // with no generated follow-ups, branches, or cross-lesson filler.
  const lines = useMemo(() => sentences.map((line, index) => ({
    speaker: index % 2 === 0 ? PARTNER : LEARNER, text: line.en, fa: line.fa,
  })), [dialogue, sentences]);
  useEffect(() => () => { void stopResponsiveSpeech(); }, []);
  const speak = (text: string) => playResponsiveSpeech({ text, locale: 'en-US', rate: 0.76 });
  return <LanguageDialoguePractice dialogue={lines} onSpeak={speak} languageLabel="انگلیسی" locale="en-US" productive defaultMode={defaultMode} localScriptOnly fixedRole={LEARNER} autoPlayPartner />;
}
