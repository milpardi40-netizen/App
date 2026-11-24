import LessonConversationHub, {
  type ConversationRoomLevel,
  type ConversationRoomPayload,
  type ConversationRoomSummary,
} from '@/components/LessonConversationHub';
import { conversationPracticeForLesson } from '@/lib/branchingConversation';
import { findTurkishLesson, TURKISH_LESSONS, TURKISH_LEVELS } from '@/lib/languages/turkish';
import { withInferredDialogueRoles } from '@/lib/lessonConversation';
import { playTurkishSpeech, stopTurkishSpeech } from '@/lib/turkishSpeech';
import { useCallback, useMemo } from 'react';

const NORMAL_SPEECH_RATE = 0.85;

const LEVEL_MAP: readonly ConversationRoomLevel[] = TURKISH_LEVELS.map(level => ({
  id: level.id,
  cefr: level.cefr,
  title: level.title,
  description: level.description,
  color: level.color,
}));

export default function TurkishConversationRooms() {
  const summariesByLevel = useMemo(() => {
    const grouped: Record<number, ConversationRoomSummary[]> = {};
    for (const level of TURKISH_LEVELS) grouped[level.id] = [];
    for (const lesson of TURKISH_LESSONS) {
      const hasDialogue = lesson.dialogue.some(line => line.text.trim());
      const lineCount = hasDialogue
        ? lesson.dialogue.filter(line => line.text.trim()).length
        : lesson.sentences.filter(sentence => sentence.text.trim()).length;
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
    const lesson = findTurkishLesson(lessonId);
    if (!lesson) return null;
    const roledDialogue = withInferredDialogueRoles(lesson.dialogue);
    return {
      dialogue: roledDialogue,
      fallback: lesson.sentences.map(sentence => ({ text: sentence.text, fa: sentence.fa })),
      semanticPractice: conversationPracticeForLesson({ ...lesson, dialogue: roledDialogue }, 'tr-TR'),
    };
  }, []);

  const onSpeak = useCallback((text: string, onDone: () => void) => {
    void playTurkishSpeech(text, NORMAL_SPEECH_RATE, onDone, onDone);
  }, []);

  const onStop = useCallback(() => {
    void stopTurkishSpeech();
  }, []);

  return (
    <LessonConversationHub
      courseId="tr"
      languageName="ترکی استانبولی"
      nativeName="İstanbul Türkçesi"
      locale="tr-TR"
      backFallback="/learn/tr"
      accentColor="#C94F62"
      levels={LEVEL_MAP}
      summariesForLevel={summariesForLevel}
      buildPayload={buildPayload}
      onSpeak={onSpeak}
      onStop={onStop}
    />
  );
}
