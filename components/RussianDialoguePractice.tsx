import type { LearningLesson } from '@/lib/languages/types';
import LanguageDialoguePractice, { type DialogueMode } from '@/components/LanguageDialoguePractice';

/** Russian guided dialogue. Layout is shared; only the recall hint names the language. */
export default function RussianDialoguePractice({ dialogue, sentences, onSpeak, locale, defaultMode }: {
  dialogue: LearningLesson['dialogue'];
  sentences?: LearningLesson['sentences'];
  onSpeak: (text: string) => void;
  locale?: string;
  defaultMode?: DialogueMode;
}) {
  const source = sentences?.length ? sentences.map((line, index) => ({ speaker: index % 2 === 0 ? 'هم‌صحبت' : 'زبان‌آموز', text: line.text, fa: line.fa })) : dialogue;
  return <LanguageDialoguePractice dialogue={source} onSpeak={onSpeak} languageLabel="روسی" locale={locale} localScriptOnly productive defaultMode={defaultMode} />;
}
