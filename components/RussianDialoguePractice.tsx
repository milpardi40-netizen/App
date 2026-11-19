import { useMemo } from 'react';
import type { LearningLesson } from '@/lib/languages/types';
import { lessonSentenceDialogue } from '@/lib/lessonSentenceDialogue';
import LanguageDialoguePractice, { type DialogueMode } from '@/components/LanguageDialoguePractice';

/** Russian guided dialogue. Layout is shared; only the recall hint names the language. */
export default function RussianDialoguePractice({ sentences, onSpeak, locale, defaultMode }: {
  sentences: LearningLesson['sentences'];
  onSpeak: (text: string) => void;
  locale?: string;
  defaultMode?: DialogueMode;
}) {
  const source = useMemo(() => lessonSentenceDialogue(sentences, line => line.text, {
    partner: 'هم‌صحبت',
    learner: 'زبان‌آموز',
  }), [sentences]);
  return <LanguageDialoguePractice dialogue={source} onSpeak={onSpeak} languageLabel="روسی" locale={locale} localScriptOnly productive defaultMode={defaultMode} />;
}
