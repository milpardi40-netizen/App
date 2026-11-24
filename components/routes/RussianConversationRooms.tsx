import LessonConversationHub, {
  type ConversationRoomLevel,
  type ConversationRoomPayload,
  type ConversationRoomSummary,
} from '@/components/LessonConversationHub';
import { conversationPracticeForLesson } from '@/lib/branchingConversation';
import { findRussianLesson, RUSSIAN_LESSONS, RUSSIAN_LEVELS } from '@/lib/languages/russian';
import { narrationRate } from '@/lib/narration';
import { playRussianSpeech, stopRussianSpeech } from '@/lib/russianSpeech';
import { useCallback, useMemo } from 'react';

const LEVEL_MAP: readonly ConversationRoomLevel[] = RUSSIAN_LEVELS.map(level => ({
  id: level.id,
  cefr: level.cefr,
  title: level.title,
  description: level.description,
  color: level.color,
}));

export default function RussianConversationRooms() {
  const summariesByLevel = useMemo(() => {
    const grouped: Record<number, ConversationRoomSummary[]> = {};
    for (const level of RUSSIAN_LEVELS) grouped[level.id] = [];
    for (const lesson of RUSSIAN_LESSONS) {
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
    const lesson = findRussianLesson(lessonId);
    if (!lesson) return null;
    return {
      dialogue: lesson.dialogue,
      fallback: lesson.sentences.map(sentence => ({ text: sentence.text, fa: sentence.fa })),
      semanticPractice: conversationPracticeForLesson(lesson, 'ru-RU'),
    };
  }, []);

  const onSpeak = useCallback((text: string, onDone: () => void) => {
    void playRussianSpeech(text, narrationRate('ru-RU', 'normal'), onDone, onDone);
  }, []);

  const onStop = useCallback(() => {
    void stopRussianSpeech();
  }, []);

  return (
    <LessonConversationHub
      courseId="ru"
      languageName="روسی"
      nativeName="Русский"
      locale="ru-RU"
      backFallback="/learn/ru"
      accentColor="#4267a8"
      levels={LEVEL_MAP}
      summariesForLevel={summariesForLevel}
      buildPayload={buildPayload}
      onSpeak={onSpeak}
      onStop={onStop}
    />
  );
}
