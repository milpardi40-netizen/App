import LessonConversationHub, {
  type ConversationRoomLevel,
  type ConversationRoomPayload,
  type ConversationRoomSummary,
} from '@/components/LessonConversationHub';
import { ARABIC_LESSONS, ARABIC_LEVELS, getArabicLesson } from '@/lib/arabic/content';
import { arabicLessonToLearningLesson } from '@/lib/arabic/engine';
import { ARABIC_NORMAL_SPEECH_RATE, playArabicSpeech, stopArabicSpeech } from '@/lib/arabic/speech';
import { conversationPracticeForLesson } from '@/lib/branchingConversation';
import { resolveConversationDialogue } from '@/lib/conversationRoomDialogues';
import { useCallback, useMemo } from 'react';

const LEVEL_MAP: readonly ConversationRoomLevel[] = ARABIC_LEVELS.map(level => ({
  id: level.id,
  cefr: level.cefr,
  title: level.title,
  description: level.subtitle,
  color: level.accent,
}));

export default function ArabicConversationRooms() {
  const summariesByLevel = useMemo(() => {
    const grouped: Record<number, ConversationRoomSummary[]> = {};
    for (const level of ARABIC_LEVELS) grouped[level.id] = [];
    for (const lesson of ARABIC_LESSONS) {
      const rawDialogue = lesson.dialogue.map(line => ({
        speaker: line.name ?? (line.speaker === 'partner' ? 'المُحاوِر' : 'شما'),
        role: line.speaker,
        text: line.ar,
        fa: line.fa,
      }));
      const resolved = resolveConversationDialogue(lesson.id, rawDialogue);
      const hasDialogue = resolved.some(line => line.text.trim());
      const lineCount = hasDialogue
        ? resolved.filter(line => line.text.trim()).length
        : lesson.sentences.filter(sentence => sentence.ar.trim()).length;
      if (!grouped[lesson.levelId]) grouped[lesson.levelId] = [];
      grouped[lesson.levelId].push({
        id: lesson.id,
        order: lesson.order,
        levelId: lesson.levelId,
        title: lesson.title,
        subtitle: lesson.subtitle,
        situation: lesson.situation,
        lineCount,
        usesSentenceFallback: !hasDialogue,
      });
    }
    return grouped;
  }, []);

  const summariesForLevel = useCallback(
    (levelId: number) => summariesByLevel[levelId] ?? [],
    [summariesByLevel],
  );

  const buildPayload = useCallback((lessonId: string): ConversationRoomPayload | null => {
    const lesson = getArabicLesson(lessonId);
    if (!lesson) return null;
    const learningLesson = arabicLessonToLearningLesson(lesson);
    const rawDialogue = lesson.dialogue.map(line => ({
      speaker: line.name ?? (line.speaker === 'partner' ? 'المُحاوِر' : 'شما'),
      role: line.speaker,
      text: line.ar,
      fa: line.fa,
    }));
    const dialogue = resolveConversationDialogue(lesson.id, rawDialogue);
    return {
      dialogue,
      fallback: lesson.sentences.map(sentence => ({ text: sentence.ar, fa: sentence.fa })),
      semanticPractice: conversationPracticeForLesson({ ...learningLesson, dialogue, levelId: lesson.levelId }, 'ar-SA'),
    };
  }, []);

  const onSpeak = useCallback((text: string, onDone: () => void) => {
    playArabicSpeech(text, { rate: ARABIC_NORMAL_SPEECH_RATE, onDone, onError: onDone });
  }, []);

  const onStop = useCallback(() => {
    void stopArabicSpeech();
  }, []);

  return (
    <LessonConversationHub
      courseId="ar"
      languageName="عربی"
      nativeName="العربية"
      locale="ar-SA"
      backFallback="/learn/ar"
      accentColor="#0F766E"
      levels={LEVEL_MAP}
      summariesForLevel={summariesForLevel}
      buildPayload={buildPayload}
      onSpeak={onSpeak}
      onStop={onStop}
    />
  );
}
