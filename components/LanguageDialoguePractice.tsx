import { useCallback, useMemo, useRef } from 'react';
import LessonConversationRoom from '@/components/LessonConversationRoom';
import { conversationPracticeForLesson, type BranchingLocale } from '@/lib/branchingConversation';
import type { LearningLesson } from '@/lib/languages/types';

/**
 * Shared live conversation practice for Turkish, German, French, and Spanish.
 * Delegates to the unified non-fake `LessonConversationRoom` + `conversationPracticeForLesson`
 * engine while preserving backwards compatibility with `modeForLevel` and `DialogueMode`.
 */
export type DialogueMode = 'guide' | 'cloze' | 'free';
export const modeForLevel = (levelId: number): DialogueMode => (levelId <= 0 ? 'guide' : levelId <= 2 ? 'cloze' : 'free');

const EXPLICIT_LEARNER_SPEAKERS = new Set(['learner', 'you', 'شما', 'زبان‌آموز', 'زبانآموز']);

function toBranchingLocale(locale?: string): BranchingLocale {
  const code = (locale ?? '').toLowerCase();
  if (code.startsWith('ru')) return 'ru-RU';
  if (code.startsWith('tr')) return 'tr-TR';
  if (code.startsWith('de')) return 'de-DE';
  if (code.startsWith('fr')) return 'fr-FR';
  if (code.startsWith('es')) return 'es-ES';
  return 'en-US';
}

function levelFromMode(mode?: DialogueMode, levelId?: number): number {
  if (typeof levelId === 'number') return levelId;
  if (mode === 'guide') return 0;
  if (mode === 'cloze') return 2;
  if (mode === 'free') return 3;
  return 1;
}

function withInferredRoles(dialogue: LearningLesson['dialogue']): Array<{ speaker: string; role: 'learner' | 'partner'; text: string; fa: string }> {
  const valid = dialogue.filter(line => line.text.trim());
  const names = [...new Set(valid.map(line => line.speaker).filter(Boolean))];
  const explicit = names.find(name => EXPLICIT_LEARNER_SPEAKERS.has(name.toLocaleLowerCase('fa-IR')));
  const inferredLearner = explicit ?? names[1] ?? null;

  return valid.map((line, index) => {
    const existing = (line as { role?: 'learner' | 'partner' }).role;
    const role: 'learner' | 'partner' = existing
      ? existing
      : inferredLearner
        ? (line.speaker === inferredLearner ? 'learner' : 'partner')
        : (index % 2 === 1 ? 'learner' : 'partner');
    return { speaker: line.speaker || (role === 'learner' ? 'learner' : 'partner'), role, text: line.text, fa: line.fa };
  });
}

export default function LanguageDialoguePractice({
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
  languageLabel: string;
  locale?: string;
  branchPool?: ReadonlyArray<{ text: string; fa: string }>;
  productive?: boolean;
  defaultMode?: DialogueMode;
  lessonId?: string;
  levelId?: number;
  situation?: string;
}) {
  const branchingLocale = toBranchingLocale(locale);
  const effectiveLevelId = levelFromMode(defaultMode, levelId);
  const roledDialogue = useMemo(() => withInferredRoles(dialogue), [dialogue]);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSpeak = useCallback((text: string, onDone: () => void) => {
    if (onSpeakDone) {
      onSpeakDone(text, onDone);
      return;
    }
    onSpeak(text);
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    fallbackTimerRef.current = setTimeout(onDone, Math.min(5500, Math.max(1400, text.length * 85)));
  }, [onSpeak, onSpeakDone]);

  const semanticPractice = useMemo(
    () =>
      conversationPracticeForLesson(
        {
          id: lessonId ?? `dlg-${branchingLocale}-${effectiveLevelId}`,
          levelId: effectiveLevelId,
          sentences: branchPool ?? [],
          dialogue: roledDialogue,
        },
        branchingLocale,
      ),
    [lessonId, effectiveLevelId, branchPool, roledDialogue, branchingLocale],
  );

  return (
    <LessonConversationRoom
      lessonId={lessonId ?? `dlg-${branchingLocale}-${effectiveLevelId}`}
      situation={situation}
      partnerRole="طرف مقابل"
      dialogue={roledDialogue}
      fallback={branchPool}
      locale={branchingLocale}
      onSpeak={handleSpeak}
      onStop={onStop}
      semanticPractice={semanticPractice}
      levelId={effectiveLevelId}
    />
  );
}
