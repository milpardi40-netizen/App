import type { LearningLesson } from '@/lib/languages/types';
import LanguageDialoguePractice, { type DialogueMode } from '@/components/LanguageDialoguePractice';

/** Turkish live conversation practice backed by the unified conversation engine. */
export default function TurkishDialoguePractice({
  dialogue,
  onSpeak,
  onSpeakDone,
  onStop,
  locale,
  branchPool,
  defaultMode,
  lessonId,
  levelId,
  situation,
}: {
  dialogue: LearningLesson['dialogue'];
  onSpeak: (text: string) => void;
  onSpeakDone?: (text: string, onDone: () => void) => void;
  onStop?: () => void;
  locale?: string;
  branchPool?: ReadonlyArray<{ text: string; fa: string }>;
  defaultMode?: DialogueMode;
  lessonId?: string;
  levelId?: number;
  situation?: string;
}) {
  return (
    <LanguageDialoguePractice
      dialogue={dialogue}
      onSpeak={onSpeak}
      onSpeakDone={onSpeakDone}
      onStop={onStop}
      languageLabel="ترکی"
      locale={locale}
      branchPool={branchPool}
      productive
      defaultMode={defaultMode}
      lessonId={lessonId}
      levelId={levelId}
      situation={situation}
    />
  );
}
