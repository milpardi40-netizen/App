import LessonConversationHub, {
  type ConversationRoomLevel,
  type ConversationRoomPayload,
  type ConversationRoomSummary,
} from '@/components/LessonConversationHub';
import { conversationPracticeForLesson, type BranchingLocale } from '@/lib/branchingConversation';
import { NEW_COURSES, type NewLanguageId } from '@/lib/languages/newCourses';
import { starterDisplayDialogue } from '@/lib/languages/starterEditorial';
import { findLanguageEntry } from '@/lib/languages/registry';
import { withInferredDialogueRoles } from '@/lib/lessonConversation';
import { narrationRate } from '@/lib/narration';
import { playStarterSpeech, stopStarterSpeech } from '@/lib/starterSpeech';
import { useCallback, useMemo } from 'react';

type Props = {
  language: NewLanguageId;
};

export default function StarterConversationRooms({ language }: Props) {
  const course = NEW_COURSES[language];
  const entry = findLanguageEntry(language);

  const levels = useMemo<readonly ConversationRoomLevel[]>(
    () =>
      course.levels.map(level => ({
        id: level.id,
        cefr: level.cefr,
        title: level.title,
        description: level.description,
        color: level.color,
      })),
    [course.levels],
  );

  const summariesByLevel = useMemo(() => {
    const grouped: Record<number, ConversationRoomSummary[]> = {};
    for (const level of course.levels) grouped[level.id] = [];
    for (const lesson of course.lessons) {
      const displayDialogue = starterDisplayDialogue(lesson);
      const hasDialogue = displayDialogue.some(line => line.text.trim());
      const lineCount = hasDialogue
        ? displayDialogue.filter(line => line.text.trim()).length
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
  }, [course.levels, course.lessons]);

  const summariesForLevel = useCallback(
    (levelId: number) => summariesByLevel[levelId] ?? [],
    [summariesByLevel],
  );

  const buildPayload = useCallback(
    (lessonId: string): ConversationRoomPayload | null => {
      const lesson = course.lessons.find(item => item.id === lessonId);
      if (!lesson) return null;
      const roledDialogue = withInferredDialogueRoles(starterDisplayDialogue(lesson));
      return {
        dialogue: roledDialogue,
        fallback: lesson.sentences.map(sentence => ({ text: sentence.text, fa: sentence.fa })),
        semanticPractice: conversationPracticeForLesson(
          { id: lesson.id, levelId: lesson.levelId, sentences: lesson.sentences, dialogue: roledDialogue },
          course.locale as BranchingLocale,
        ),
      };
    },
    [course.lessons, course.locale],
  );

  const onSpeak = useCallback(
    (text: string, onDone: () => void) => {
      void playStarterSpeech(course.locale, text, narrationRate(course.locale, 'normal'), onDone, undefined, onDone);
    },
    [course.locale],
  );

  const onStop = useCallback(() => {
    void stopStarterSpeech();
  }, []);

  return (
    <LessonConversationHub
      courseId={language}
      languageName={entry?.name ?? course.name}
      nativeName={entry?.nativeName ?? course.name}
      locale={course.locale as BranchingLocale}
      backFallback={course.home}
      accentColor={entry?.accent ?? '#365A7D'}
      levels={levels}
      summariesForLevel={summariesForLevel}
      buildPayload={buildPayload}
      onSpeak={onSpeak}
      onStop={onStop}
    />
  );
}
