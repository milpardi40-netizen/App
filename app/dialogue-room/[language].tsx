import { PRE_A1_CONTENT_REVISION, russianRoomLines } from '@/lib/languages/russianPreA1';
import { LocalizedText as Text } from '@/components/LocalizedText';
import LessonDialogueRoom from '@/components/LessonDialogueRoom';
import { PageNavigation } from '@/components/PageNavigation';
import { EnglishPalette as Palette } from '@/components/EnglishSupplementTask';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ENGLISH_NORMAL_SPEECH_RATE, ENGLISH_SLOW_SPEECH_RATE, playResponsiveSpeech } from '@/lib/responsiveSpeech';
import { narrationRate } from '@/lib/narration';
import { playRussianSpeech } from '@/lib/russianSpeech';
import { playTurkishSpeech } from '@/lib/turkishSpeech';
import { playStarterSpeech } from '@/lib/starterSpeech';
import { ARABIC_NORMAL_SPEECH_RATE, ARABIC_SLOW_SPEECH_RATE, playArabicSpeech } from '@/lib/arabic/speech';
import { ENGLISH_LEARNER_LESSONS as SENTENCE_LESSONS } from '@/lib/courseContent';
import { RUSSIAN_LESSONS, russianProgress } from '@/lib/languages/russian';
import { TURKISH_LESSONS, turkishProgress } from '@/lib/languages/turkish';
import { NEW_COURSES } from '@/lib/languages/newCourses';
import { ARABIC_LESSONS } from '@/lib/arabic/content';
import { getArabicProgress } from '@/lib/arabic/progress';
import { readLocalProgress } from '@/lib/courseProgress';
import { Radius, Spacing, Typography } from '@/lib/theme';

/** «اتاق گفت‌وگو» — direct entry: opens the closing dialogue room of a lesson without walking the lesson stages. */

type RoomLesson = { id: string; title: string; levelId: number; situation: string; locale: string; lines: { text: string; fa: string }[] };
type ProgressLike = { getCourseProgress: () => Promise<{ completedLessonIds: string[] }> };

// TurkishLesson keeps its normal voice rate as a module constant; the room entry uses the same value.
const TR_NORMAL_SPEECH_RATE = 0.85;

async function completedOf(store: ProgressLike): Promise<readonly string[]> {
  try {
    return (await store.getCourseProgress()).completedLessonIds ?? [];
  } catch {
    return [];
  }
}

function pickLessonId(ids: readonly string[], completed: readonly string[], lessonIdParam: string): string | null {
  if (lessonIdParam && ids.includes(lessonIdParam)) return lessonIdParam;
  // No explicit lesson: open the learner's current one — first unfinished, else the last.
  return ids.find(id => !completed.includes(id)) ?? ids[ids.length - 1] ?? null;
}

const ROOM_LANGUAGES = ['en', 'ru', 'tr', 'de', 'fr', 'es', 'ar'] as const;

async function resolveRoomLesson(rawLanguage: string, lessonIdParam: string): Promise<RoomLesson | null> {
  // An unknown or missing language must never end in a dead end: fall back to the first course.
  const language = (ROOM_LANGUAGES as readonly string[]).includes(rawLanguage) ? rawLanguage : 'en';
  try {
    return await resolveFor(language, lessonIdParam) ?? (language === 'en' ? null : await resolveFor('en', lessonIdParam));
  } catch {
    return null;
  }
}

async function resolveFor(language: string, lessonIdParam: string): Promise<RoomLesson | null> {
  switch (language) {
    case 'en': {
      const completed = await completedOf({ getCourseProgress: readLocalProgress });
      const id = pickLessonId(SENTENCE_LESSONS.map(lesson => lesson.id), completed, lessonIdParam);
      const lesson = SENTENCE_LESSONS.find(item => item.id === id);
      if (!lesson) return null;
      return { id: lesson.id, title: lesson.title, levelId: lesson.levelId, situation: lesson.situation, locale: 'en-US', lines: lesson.sentences.map(sentence => ({ text: sentence.en, fa: sentence.fa })) };
    }
    case 'ru': {
      const completed = await completedOf(russianProgress);
      const id = pickLessonId(RUSSIAN_LESSONS.map(lesson => lesson.id), completed, lessonIdParam);
      const lesson = RUSSIAN_LESSONS.find(item => item.id === id);
      if (!lesson) return null;
      return { id: lesson.id, title: lesson.title, levelId: lesson.levelId, situation: lesson.situation, locale: 'ru-RU', lines: russianRoomLines(lesson) };
    }
    case 'tr': {
      const completed = await completedOf(turkishProgress);
      const id = pickLessonId(TURKISH_LESSONS.map(lesson => lesson.id), completed, lessonIdParam);
      const lesson = TURKISH_LESSONS.find(item => item.id === id);
      if (!lesson) return null;
      return { id: lesson.id, title: lesson.title, levelId: lesson.levelId, situation: lesson.situation, locale: 'tr-TR', lines: lesson.sentences.map(sentence => ({ text: sentence.text, fa: sentence.fa })) };
    }
    case 'de':
    case 'fr':
    case 'es': {
      const course = NEW_COURSES[language];
      if (!course) return null;
      const completed = await completedOf(course.progress);
      const id = pickLessonId(course.lessons.map(lesson => lesson.id), completed, lessonIdParam);
      const lesson = course.lessons.find(item => item.id === id);
      if (!lesson) return null;
      return { id: lesson.id, title: lesson.title, levelId: lesson.levelId, situation: lesson.situation, locale: course.locale, lines: lesson.sentences.map(sentence => ({ text: sentence.text, fa: sentence.fa })) };
    }
    case 'ar': {
      const completed = await completedOf({ getCourseProgress: getArabicProgress });
      const id = pickLessonId(ARABIC_LESSONS.map(lesson => lesson.id), completed, lessonIdParam);
      const lesson = ARABIC_LESSONS.find(item => item.id === id);
      if (!lesson) return null;
      return { id: lesson.id, title: lesson.title, levelId: lesson.levelId, situation: lesson.situation, locale: 'ar-SA', lines: lesson.sentences.map(sentence => ({ text: sentence.ar, fa: sentence.fa })) };
    }
    default:
      return null;
  }
}

function speakFor(language: string, locale: string, pitch?: number, slow = false): (text: string, onDone: () => void) => void {
  return (text, onDone) => {
    switch (language) {
      case 'en':
        playResponsiveSpeech({ text, locale: 'en-US', rate: slow ? ENGLISH_SLOW_SPEECH_RATE : ENGLISH_NORMAL_SPEECH_RATE, pitch, onDone, onError: onDone });
        return;
      case 'ru':
        void playRussianSpeech(text, narrationRate('ru-RU', slow ? 'slow' : 'normal'), onDone, onDone, { pitch });
        return;
      case 'tr':
        void playTurkishSpeech(text, slow ? 0.5 : TR_NORMAL_SPEECH_RATE, onDone, onDone, { pitch });
        return;
      case 'de':
      case 'fr':
      case 'es':
        void playStarterSpeech(locale, text, narrationRate(locale, slow ? 'slow' : 'normal'), onDone, undefined, onDone, { pitch });
        return;
      case 'ar':
        playArabicSpeech(text, { rate: slow ? ARABIC_SLOW_SPEECH_RATE : ARABIC_NORMAL_SPEECH_RATE, pitch, onDone, onError: onDone });
        return;
      default:
        onDone();
    }
  };
}

export default function DialogueRoomScreen() {
  const params = useLocalSearchParams<{ language?: string | string[]; lessonId?: string | string[] }>();
  const language = typeof params.language === 'string' ? params.language : '';
  const lessonIdParam = typeof params.lessonId === 'string' ? params.lessonId : '';
  const [lesson, setLesson] = useState<RoomLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    resolveRoomLesson(language, lessonIdParam)
      .then(found => {
        if (!alive) return;
        setLesson(found);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setLesson(null);
        setLoading(false);
      });
    return () => { alive = false; };
  }, [language, lessonIdParam, reload]);

  const speak = useCallback((text: string, onDone: () => void) => speakFor(language, lesson?.locale ?? '')(text, onDone), [language, lesson?.locale]);
  const speakSlow = useCallback((text: string, onDone: () => void) => speakFor(language, lesson?.locale ?? '', undefined, true)(text, onDone), [language, lesson?.locale]);
  const speakOperator = useCallback((text: string, onDone: () => void) => speakFor(language, lesson?.locale ?? '', 0.82)(text, onDone), [language, lesson?.locale]);

  return (
    <View style={styles.root}>
      <PageNavigation backFallback="/conversations" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingWrap}><ActivityIndicator color={Palette.primary} size="large" /></View>
        ) : lesson ? (
          <LessonDialogueRoom
            key={`${language}-${lesson.id}`}
            language={language}
            lessonId={lesson.id}
            contentRevision={language === 'ru' && lesson.id.startsWith('ru-pre-') ? PRE_A1_CONTENT_REVISION : undefined}
            lessonTitle={lesson.title}
            levelId={lesson.levelId}
            situation={lesson.situation}
            lines={lesson.lines}
            locale={lesson.locale}
            onSpeak={speak}
            onSpeakOperator={speakOperator}
            onSpeakSlow={speakSlow}
          />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              هنوز درسی برای گفت‌وگو آماده نیست. از صفحهٔ اصلی یک زبان را باز کنید، چند درس را بگذرانید و دوباره بیایید.
            </Text>
          </View>
        )}
        {!loading && !lesson ? (
          <Text style={styles.retry} onPress={() => setReload(value => value + 1)}>تلاش دوباره</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.canvas },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md, width: '100%', maxWidth: 720, alignSelf: 'center' },
  loadingWrap: { width: '100%', alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyCard: { width: '100%', borderWidth: 1, borderColor: Palette.border, borderRadius: Radius.lg, backgroundColor: Palette.surface, padding: Spacing.lg },
  emptyText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Palette.text, textAlign: 'right', lineHeight: 24, writingDirection: 'rtl' },
  retry: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Palette.primary, textAlign: 'center', padding: Spacing.sm },
});
