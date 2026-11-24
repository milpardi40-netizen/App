import LessonConversationHub, {
  type ConversationRoomLevel,
  type ConversationRoomPayload,
  type ConversationRoomSummary,
} from '@/components/LessonConversationHub';
import { conversationPracticeForLesson } from '@/lib/branchingConversation';
import { COURSE_LEVELS, SENTENCE_LESSONS, getSentenceLesson } from '@/lib/courseContent';
import { playResponsiveSpeech, stopResponsiveSpeech } from '@/lib/responsiveSpeech';
import { useCallback, useMemo } from 'react';

const LEVEL_MAP: readonly ConversationRoomLevel[] = COURSE_LEVELS.map(level => ({
  id: level.id,
  cefr: level.cefr,
  title: level.title,
  description: level.description,
  color: level.color,
}));

export default function EnglishConversationRooms() {
  const summariesByLevel = useMemo(() => {
    const grouped: Record<number, ConversationRoomSummary[]> = {};
    for (const level of COURSE_LEVELS) grouped[level.id] = [];
    for (const lesson of SENTENCE_LESSONS) {
      const hasDialogue = lesson.dialogue.some(line => line.text.trim());
      const lineCount = hasDialogue
        ? lesson.dialogue.filter(line => line.text.trim()).length
        : lesson.sentences.filter(sentence => sentence.en.trim()).length;
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
    const lesson = getSentenceLesson(lessonId);
    if (!lesson) return null;
    return {
      dialogue: lesson.dialogue,
      fallback: lesson.sentences.map(sentence => ({ text: sentence.en, fa: sentence.fa })),
      semanticPractice: conversationPracticeForLesson(lesson, 'en-US'),
    };
  }, []);

  const onSpeak = useCallback((text: string, onDone: () => void) => {
    playResponsiveSpeech({ text, locale: 'en-US', onDone, onError: onDone });
  }, []);

  const onStop = useCallback(() => {
    void stopResponsiveSpeech();
  }, []);

  return (
    <LessonConversationHub
      courseId="en"
      languageName="انگلیسی"
      nativeName="English"
      locale="en-US"
      backFallback="/lang"
      accentColor="#6356d9"
      levels={LEVEL_MAP}
      summariesForLevel={summariesForLevel}
      buildPayload={buildPayload}
      onSpeak={onSpeak}
      onStop={onStop}
    />
  );
}
