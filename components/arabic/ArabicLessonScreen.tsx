import { prepareLessonRestart } from '@/lib/lessonRestart';
import { LocalizedText as Text, PERSIAN_TRANSLATION_COLOR } from '@/components/LocalizedText';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Check, ChevronLeft, Headphones, Mic2, RotateCcw, Sparkles, Volume2 } from 'lucide-react-native';
import { ARABIC_LESSONS, ARABIC_LEVELS, getArabicLesson } from '@/lib/arabic/content';
import {
  ARABIC_ENGINE_STEPS,
  getArabicLessonPatterns,
  getArabicLessonVocabulary,
} from '@/lib/arabic/engine';
import {
  addArabicSentenceToReview,
  completeArabicLesson,
  getArabicDueReviewCards,
} from '@/lib/arabic/progress';
import {
  ARABIC_NATURAL_SPEECH_RATE,
  ARABIC_NORMAL_SPEECH_RATE,
  ARABIC_SLOW_SPEECH_RATE,
  playArabicSpeech,
  stopArabicSpeech,
  warmArabicSpeech,
} from '@/lib/arabic/speech';
import {
  freshArabicSession,
  loadArabicStudy,
  resetArabicLessonSession,
  saveArabicLessonSession,
  type ArabicLessonAttempt,
} from '@/lib/arabic/studyState';
import { saveLessonOutcome, weakSpokenSentences } from '@/lib/lessonOutcomes';
import { LESSON_STAGE_VERSION } from '@/lib/lessonStages';
import { nextLessonInOrder, previousSentenceIndex } from '@/lib/englishLessonNavigation';
import { recordStudyDay } from '@/lib/studyStreak';
import { finishLessonRewards } from '@/lib/lessonRewards';
import { CHUNK_THRESHOLD, lessonChunks, loadCompletedChunks, markChunkDone } from '@/lib/lessonChunks';
import { useSpeakAutoAdvance } from '@/lib/useSpeakAutoAdvance';
import { autoRead } from '@/lib/autoRead';
import { useFirstTimeHint } from '@/lib/useFirstTimeHint';
import { useStudyTimer } from '@/components/useEnglishStudyTimer';
import { toPersianDigits } from '@/lib/format';
import { Colors, Radius, Spacing, Typography } from '@/lib/theme';
import { EnglishPalette as Palette } from '@/components/EnglishSupplementTask';
import { ENGLISH_LEVEL_GRADIENTS } from '@/components/EnglishUI';
import BlindListeningList from '@/components/BlindListeningList';
import { FitScrollView, lessonScrollOffset } from '@/components/FitScrollView';
import { GrammarNoteCard, GrammarPatternCard, GrammarStageHeader } from '@/components/GrammarUsage';
import LessonCelebration, { type CelebrationStats } from '@/components/LessonCelebration';
import LessonFinalHub, { type FinalSection } from '@/components/LessonFinalHub';
import { MiloGlobeHeadphoneMark } from '@/components/MiloBrandMark';
import { PageNavigation } from '@/components/PageNavigation';
import ReadingFirstBlock from '@/components/ReadingFirstBlock';
import RevealText from '@/components/RevealText';
import SpeakCheck from '@/components/SpeakCheck';
import LessonDialogueRoom from '@/components/LessonDialogueRoom';
import SpeakDrill, { type SpeakDrillResult } from '@/components/SpeakDrill';
import { ArabicLessonEvidence } from './ArabicLessonEvidence';
import { ArabicSentenceBuilder } from './ArabicSentenceBuilder';

const stages = ARABIC_ENGINE_STEPS;

export default function ArabicLessonScreen() {
  const router = useRouter();
  const { id, fromStart } = useLocalSearchParams<{ id?: string; fromStart?: string }>();
  const resolvedLesson = getArabicLesson(id);
  const lesson = resolvedLesson ?? ARABIC_LESSONS[0];
  const levelInfo = ARABIC_LEVELS.find(item => item.id === lesson?.levelId) ?? ARABIC_LEVELS[0];

  const [stage, setStage] = useState(0);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [evidencePassed, setEvidencePassed] = useState(false);
  const [attemptEvidence, setAttemptEvidence] = useState<Record<string, boolean> | undefined>(undefined);
  const [builtSentences, setBuiltSentences] = useState<Record<string, boolean>>({});
  const [doneChunks, setDoneChunks] = useState<number[]>([]);
  const [sessionReady, setSessionReady] = useState(false);
  const [invalidLesson, setInvalidLesson] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [completionError, setCompletionError] = useState('');
  const [audioNotice, setAudioNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [reload, setReload] = useState(0);
  const [listenRun, setListenRun] = useState(0);
  const [micReadyKey, setMicReadyKey] = useState<string | null>(null);
  const [chunkCelebration, setChunkCelebration] = useState<{
    chunk: number;
    total: number;
    done: number;
    nextStart: number;
  } | null>(null);
  const [celebration, setCelebration] = useState<{
    stats: CelebrationStats;
    next: () => void;
    dueReviews: number;
    review: () => void;
    levelFinished?: {
      title: string;
      lessons: number;
      onStart?: () => void;
      readiness?: number;
    };
    newAchievements?: readonly { id: string; title: string; description: string }[];
  } | null>(null);

  const speakResult = useRef<SpeakDrillResult | null>(null);
  const attempt = useRef<ArabicLessonAttempt | undefined>(undefined);
  const completing = useRef(false);
  const resettingRef = useRef(false);
  const loadedLesson = useRef<string | null>(null);
  const screenRun = useRef(0);
  const lessonScrollRef = useRef<ScrollView>(null);
  const showHint = useFirstTimeHint(`ar:${stage}`);

  const stageOffsetRef = useRef(0);
  const contentOffsetRef = useRef(0);
  const [headerSpacer, setHeaderSpacer] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [stageHeight, setStageHeight] = useState(0);
  const scrollScale = lessonScrollOffset(1, Dimensions.get('window').width, stage === 6 ? 'classic' : 'default');
  const bottomSpacer = Math.max(headerSpacer, Math.ceil(viewportHeight / scrollScale) - stageHeight + 8);
  const scrollKey = stage === 1 ? sentenceIndex : -1;

  useEffect(() => {
    const target = () =>
      Math.max(
        0,
        lessonScrollOffset(
          contentOffsetRef.current + (stage === 1 ? stageOffsetRef.current : 0),
          Dimensions.get('window').width,
        ),
      );
    const first = setTimeout(() => lessonScrollRef.current?.scrollTo({ y: target(), animated: true }), 10);
    const second = setTimeout(() => lessonScrollRef.current?.scrollTo({ y: target(), animated: true }), 260);
    return () => {
      clearTimeout(first);
      clearTimeout(second);
    };
  }, [stage, scrollKey]);

  const stageChangedAt = useRef(0);
  useEffect(() => {
    stageChangedAt.current = Date.now();
  }, [stage, scrollKey]);
  useEffect(() => {
    if (Date.now() - stageChangedAt.current > 3000) return;
    const handle = setTimeout(
      () =>
        lessonScrollRef.current?.scrollTo({
          y: Math.max(
            0,
            lessonScrollOffset(
              contentOffsetRef.current + (stage === 1 ? stageOffsetRef.current : 0),
              Dimensions.get('window').width,
            ),
          ),
          animated: true,
        }),
      10,
    );
    return () => clearTimeout(handle);
  }, [headerSpacer, stage]);

  const narratorTokenRef = useRef(0);
  const narratorFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearNarratorFallback = useCallback(() => {
    if (narratorFallbackRef.current) {
      clearTimeout(narratorFallbackRef.current);
      narratorFallbackRef.current = null;
    }
  }, []);
  useEffect(
    () => () => {
      clearNarratorFallback();
      narratorTokenRef.current += 1;
    },
    [clearNarratorFallback],
  );

  const timer = useStudyTimer(
    sessionReady && !resetting && !celebration && !chunkCelebration && !!lesson && !invalidLesson,
    'ar',
  );

  useFocusEffect(
    useCallback(() => {
      warmArabicSpeech();
      return () => {
        void stopArabicSpeech();
      };
    }, []),
  );

  useEffect(() => {
    let alive = true;
    const run = ++screenRun.current;
    speakResult.current = null;
    loadedLesson.current = null;
    resettingRef.current = false;
    setAudioNotice('');
    setSessionError('');
    setResetting(false);
    setSessionReady(false);
    setBuiltSentences({});
    const missing = !!id && !getArabicLesson(id);
    setInvalidLesson(missing || !lesson);
    if (missing || !lesson) return;

    void loadCompletedChunks(lesson.id)
      .then(chunks => {
        if (alive) setDoneChunks(chunks);
      })
      .catch(() => undefined);

    const startFromBeginning = fromStart === '1';
    void (startFromBeginning ? resetArabicLessonSession(lesson.id) : loadArabicStudy())
      .then(state => {
        if (!alive || screenRun.current !== run) return;
        const saved = state.sessions[lesson.id] ?? freshArabicSession();
        attempt.current = saved.attempt;
        setAttemptEvidence(saved.attempt ? (saved.attemptEvidence ?? {}) : undefined);
        setStage(Math.min(saved.stage, stages.length - 1));
        setSentenceIndex(Math.min(saved.sentenceIndex, Math.max(0, lesson.sentences.length - 1)));
        setRevealed(saved.revealed);
        setEvidencePassed(saved.evidencePassed);
        setCompletionError('');
        loadedLesson.current = lesson.id;
        setSessionReady(true);
        if (startFromBeginning) router.setParams({ fromStart: undefined });
      })
      .catch(() => {
        if (alive) {
          setSessionError(
            startFromBeginning
              ? 'شروع مجدد ذخیره نشد؛ اطلاعات قبلی حفظ شده‌اند. دوباره تلاش کنید.'
              : 'جلسهٔ قبلی خوانده نشد؛ برای حفظ اطلاعات، ذخیره متوقف است. صفحه را دوباره باز کنید.',
          );
        }
      });

    return () => {
      alive = false;
      screenRun.current += 1;
      void stopArabicSpeech();
    };
  }, [lesson?.id, id, fromStart, reload, router]);

  useEffect(() => {
    let currentSave = true;
    const run = screenRun.current;
    if (
      lesson &&
      sessionReady &&
      loadedLesson.current === lesson.id &&
      !completing.current &&
      !resettingRef.current &&
      !sessionError
    ) {
      void saveArabicLessonSession(lesson.id, {
        stageVersion: LESSON_STAGE_VERSION,
        stage,
        sentenceIndex,
        revealed,
        evidencePassed,
        attempt: attempt.current,
        attemptEvidence,
      })
        .then(() => {
          if (currentSave && screenRun.current === run) setSessionError('');
        })
        .catch(() => {
          if (currentSave && screenRun.current === run) {
            setSessionError('جلسه ذخیره نشد؛ درس را دوباره باز کنید.');
          }
        });
    }
    return () => {
      currentSave = false;
    };
  }, [
    lesson,
    sessionReady,
    stage,
    sentenceIndex,
    revealed,
    evidencePassed,
    attemptEvidence,
    resetting,
    sessionError,
  ]);

  const markBuiltSentence = useCallback((sentenceId: string) => {
    setBuiltSentences(prev => (prev[sentenceId] ? prev : { ...prev, [sentenceId]: true }));
  }, []);

  const chunks = lessonChunks(lesson?.id ?? '', lesson?.sentences.length ?? 0, doneChunks);
  useEffect(() => {
    if (chunks.chunked && sentenceIndex < chunks.start) setSentenceIndex(chunks.start);
  }, [chunks.chunked, chunks.start, lesson?.id, sentenceIndex]);

  const chunkLastIndex =
    chunks.chunked && lesson
      ? Math.min(lesson.sentences.length - 1, chunks.end - 1)
      : Math.max(0, (lesson?.sentences.length ?? 1) - 1);
  const current = lesson?.sentences[Math.min(sentenceIndex, Math.max(0, (lesson?.sentences.length ?? 1) - 1))];

  const vocabulary = useMemo(() => (lesson ? getArabicLessonVocabulary(lesson) : []), [lesson]);
  const patterns = useMemo(() => (lesson ? getArabicLessonPatterns(lesson) : []), [lesson]);

  const speakForTarget = useCallback(
    (text: string, rate: number | undefined, targetKey: string | null) => {
      setAudioNotice('');
      setMicReadyKey(null);
      clearNarratorFallback();
      const token = ++narratorTokenRef.current;
      const armMic = () => {
        if (narratorTokenRef.current !== token) return;
        clearNarratorFallback();
        if (targetKey) setMicReadyKey(targetKey);
      };
      if (targetKey) {
        narratorFallbackRef.current = setTimeout(armMic, Math.min(7500, Math.max(2400, text.length * 130)));
      }
      playArabicSpeech(text, {
        rate,
        onDone: armMic,
        onError: () => {
          setAudioNotice('پخش خودکار ممکن نشد. یکی از دکمه‌های پخش را بزنید و صدای دستگاه را بررسی کنید.');
          armMic();
        },
      });
    },
    [clearNarratorFallback],
  );

  const firstVocabWord = vocabulary[0]?.word ?? '';

  useEffect(() => {
    if (!lesson || !sessionReady || loadedLesson.current !== lesson.id || !current) return;
    if (stage === 1 || stage === 3) {
      speakForTarget(current.ar, ARABIC_NORMAL_SPEECH_RATE, `${stage}:${current.id}`);
      return;
    }
    if (stage === 5 && firstVocabWord) {
      speakForTarget(firstVocabWord, ARABIC_NORMAL_SPEECH_RATE, `5:0:${firstVocabWord}`);
      return;
    }
    clearNarratorFallback();
    narratorTokenRef.current += 1;
    setMicReadyKey(null);
    if (stage !== 9) void stopArabicSpeech();
  }, [
    lesson?.id,
    sessionReady,
    stage,
    sentenceIndex,
    current?.id,
    current?.ar,
    firstVocabWord,
    speakForTarget,
    clearNarratorFallback,
  ]);

  const speak = useCallback(
    (text: string, rate?: number, onDone?: () => void) => {
      setAudioNotice('');
      const targetKey = (stage === 1 || stage === 3) && !onDone && current ? `${stage}:${current.id}` : null;
      if (targetKey) {
        speakForTarget(text, rate, targetKey);
        return;
      }
      playArabicSpeech(text, {
        rate,
        onDone,
        onError: () => {
          setAudioNotice('پخش صدا ممکن نشد. صدای دستگاه و اجازهٔ پخش مرورگر را بررسی کنید.');
          onDone?.();
        },
      });
    },
    [stage, current, speakForTarget],
  );


  const listenListOffsetRef = useRef(0);
  const vocabListOffsetRef = useRef(0);
  const vocabCardYsRef = useRef<Record<number, number>>({});
  const scrollToContentY = useCallback((contentY: number) => {
    const targetY = Math.max(
      0,
      lessonScrollOffset(contentOffsetRef.current + contentY - 16, Dimensions.get('window').width),
    );
    lessonScrollRef.current?.scrollTo({ y: targetY, animated: true });
  }, []);
  const { scheduleOnPass, cancel: cancelSpeakingAdvance } = useSpeakAutoAdvance(`${lesson?.id ?? 'none'}:${stage}:${sentenceIndex}`);
  const skipSpeakingSentence = () => {
    cancelSpeakingAdvance();
    setMicReadyKey('');
    const last = stage === 1 ? chunkLastIndex : lesson.sentences.length - 1;
    if (sentenceIndex < last) { setSentenceIndex(sentenceIndex + 1); setRevealed(false); }
    else { void next(); }
  };


  useEffect(() => {
    if (stage !== 2 || !lesson) return;
    return autoRead(
      lesson.sentences.length,
      index =>
        new Promise<void>(resolve => {
          let settled = false;
          const done = () => {
            if (!settled) {
              settled = true;
              resolve();
            }
          };
          setSentenceIndex(index);
          setAudioNotice('');
          playArabicSpeech(lesson.sentences[index].ar, {
            onDone: done,
            onError: () => {
              setAudioNotice('پخش صدا ممکن نشد. صدای دستگاه و اجازهٔ پخش مرورگر را بررسی کنید.');
              done();
            },
          });
        }),
      undefined,
      850,
      () => {
        void stopArabicSpeech();
      },
    );
  }, [stage, lesson?.id, listenRun]);

  const selectListeningSentence = (idx: number) => {
    if (!lesson) return;
    setSentenceIndex(idx);
    if (stage === 2 || idx === sentenceIndex) speak(lesson.sentences[idx].ar);
  };

  const restartListening = () => {
    void stopArabicSpeech();
    setSentenceIndex(0);
    setListenRun(n => n + 1);
  };

  const next = async () => {
    if (!lesson || !sessionReady || sessionError || completing.current || resettingRef.current) return;
    if (stage === 1 && sentenceIndex < chunkLastIndex) {
      setSentenceIndex(value => value + 1);
      setRevealed(false);
      return;
    }
    if (stage === 1 && chunks.chunked && chunks.end < lesson.sentences.length && lesson.sentences.length >= CHUNK_THRESHOLD) {
      const nextDone = await markChunkDone(lesson.id, chunks.current).catch(() => doneChunks);
      setDoneChunks(nextDone);
      setChunkCelebration({
        chunk: chunks.current,
        total: chunks.total,
        done: lesson.sentences.length,
        nextStart: chunks.end,
      });
      return;
    }
    if (stage < stages.length - 1) {
      setStage(value => value + 1);
      setSentenceIndex(0);
      setRevealed(false);
      return;
    }
    if (saving) return;
    completing.current = true;
    setSaving(true);
    setCompletionError('');
    try {
      const nextLesson = nextLessonInOrder(ARABIC_LESSONS, lesson.id);
      await completeArabicLesson(lesson.id, nextLesson?.id);
      const weak = weakSpokenSentences(speakResult.current ? { ...speakResult.current, at: '' } : null);
      for (const sId of weak) await addArabicSentenceToReview(sId, lesson.id).catch(() => undefined);

      await saveArabicLessonSession(lesson.id, {
        stageVersion: LESSON_STAGE_VERSION,
        stage,
        sentenceIndex,
        revealed,
        evidencePassed,
        attempt: attempt.current,
        attemptEvidence,
      });
      void stopArabicSpeech();
      const streak = await recordStudyDay();
      const rewards = await finishLessonRewards().catch(() => ({ medals: [], studiedDay: '' }));
      const dueReviews = await getArabicDueReviewCards().then(cards => cards.length).catch(() => 0);
      setCelebration({
        stats: {
          sentences: lesson.sentences.length,
          practiceTotal: 0,
          practiceFirstTry: 0,
          practiceSeconds: 0,
          speakingAverage: speakResult.current?.average,
          streak: streak.count,
          streakExtendedToday: streak.extendedToday,
        },
        next: () => {
          if (nextLesson) router.replace({ pathname: '/learn/ar/lesson', params: { id: nextLesson.id } } as never);
          else router.replace('/learn/ar' as never);
        },
        dueReviews,
        review: () => router.replace('/learn/ar/review' as never),
        newAchievements: rewards.medals,
        levelFinished:
          !nextLesson || nextLesson.levelId !== lesson.levelId
            ? {
                title: ARABIC_LEVELS.find(item => item.id === lesson.levelId)?.title ?? '',
                lessons: ARABIC_LESSONS.filter(item => item.levelId === lesson.levelId).length,
              }
            : undefined,
      });
    } catch {
      setCompletionError('پایان درس ذخیره نشد؛ دوباره تلاش کنید.');
    } finally {
      completing.current = false;
      setSaving(false);
    }
  };

  const goToPreviousSentence = () => {
    if (!sessionReady || saving || !!sessionError || stage !== 1) return;
    setSentenceIndex(previousSentenceIndex(sentenceIndex));
    setRevealed(false);
  };

  if (invalidLesson || !lesson) {
    return (
      <View style={styles.root}>
        <PageNavigation backFallback="/learn/ar/library" />
        <Text style={styles.stageDesc}>درس پیدا نشد.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/learn/ar/library' as never)}>
          <Text style={styles.stageTitle}>فهرست درس‌ها</Text>
        </Pressable>
      </View>
    );
  }

  if (!sessionReady) {
    return (
      <View style={styles.root}>
        <PageNavigation backFallback="/learn/ar" />
        <Text style={styles.stageDesc}>{sessionError || 'در حال بازیابی جلسه…'}</Text>
        {!!sessionError && (
          <Pressable accessibilityRole="button" onPress={() => setReload(value => value + 1)}>
            <Text style={styles.stageTitle}>تلاش دوباره</Text>
          </Pressable>
        )}
      </View>
    );
  }

  const progressPercent = Math.round(((stage + 1) / stages.length) * 100);

  return (
    <View style={styles.root} onTouchStart={timer.interact}>
      {resetting && (
        <Text accessibilityLiveRegion="polite" style={styles.stageDesc}>
          در حال ذخیرهٔ شروع مجدد…
        </Text>
      )}
      <FitScrollView
        ref={lessonScrollRef}
        variant={stage === 6 ? 'classic' : 'default'}
        onLayout={event => setViewportHeight(event.nativeEvent.layout.height)}
        pointerEvents={resetting ? 'none' : 'auto'}
        style={styles.lessonScroll}
        contentContainerStyle={styles.lessonScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          onLayout={event => {
            const h = event.nativeEvent.layout.height;
            contentOffsetRef.current = h;
            setHeaderSpacer(Math.round(h));
          }}
        >
          <View style={styles.brandRow}>
            <MiloGlobeHeadphoneMark size={48} />
            <PageNavigation backFallback="/learn/ar" />
          </View>
          <LinearGradient
            colors={ENGLISH_LEVEL_GRADIENTS[levelInfo.id]}
            start={{ x: 0.95, y: 0 }}
            end={{ x: 0.05, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerTop}>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>{lesson.title}</Text>
                <Text style={styles.headerSub}>
                  {`${stages[stage].title} · مرحله ${toPersianDigits(stage + 1)} از ${toPersianDigits(stages.length)}`}
                </Text>
              </View>
              <View style={styles.percentBadge}>
                <Text style={styles.percent}>{`${toPersianDigits(progressPercent)}٪`}</Text>
                <Text style={styles.percentLabel}>پیشرفت</Text>
              </View>
            </View>
          </LinearGradient>
          <View style={styles.stepperCard}>
            <View style={styles.stepperHeading}>
              <View />
              <View style={styles.stepperNow}>
                <Text style={styles.stepperNowFa}>{stages[stage].title}</Text>
              </View>
            </View>
            <View style={styles.stepSegments}>
              {stages.map((item, index) => (
                <View
                  key={item.key}
                  accessibilityLabel={`${item.title} ${index + 1} از ${stages.length}`}
                  style={[
                    styles.stepSegment,
                    index <= stage && styles.stepSegmentDone,
                    index === stage && styles.stepSegmentCurrent,
                  ]}
                />
              ))}
            </View>
            {chunks.chunked ? (
              <View style={styles.chunkBar}>
                <Text style={styles.chunkText}>
                  بخش {toPersianDigits(chunks.current)} از {toPersianDigits(chunks.total)} · جملهٔ{' '}
                  {toPersianDigits(sentenceIndex + 1)} تا {toPersianDigits(chunks.end)}
                </Text>
                <View style={styles.chunkTrack}>
                  {Array.from({ length: chunks.total }).map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.chunkDot,
                        doneChunks.includes(index + 1) && styles.chunkDotDone,
                        index + 1 === chunks.current && styles.chunkDotNow,
                      ]}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </View>
          {!!(sessionError || timer.error) && (
            <Text style={styles.speechError}>{sessionError || timer.error}</Text>
          )}
        </View>

        <View
          style={styles.content}
          onLayout={event => setStageHeight(Math.round(event.nativeEvent.layout.height))}
        >
          {stage === 0 && (
            <View style={styles.centerStage}>
              <View style={styles.bigIcon}>
                <Sparkles size={34} color={Colors.accent[400]} />
              </View>
              <Text style={styles.stageTitle}>{lesson.title}</Text>
              <Text style={styles.situation}>{lesson.situation}</Text>
              {lesson.levelId >= 3 ? (
                <ReadingFirstBlock
                  lessonId={lesson.id}
                  lines={lesson.sentences.map((sentence, index) => ({
                    speaker: index % 2 ? 'شما' : 'المُحاوِر',
                    text: sentence.ar,
                    fa: sentence.fa,
                  }))}
                  onSpeak={text => speak(text)}
                  foreignStyle={styles.practiceForeign}
                  accent={Colors.primary[500]}
                />
              ) : null}
              {lesson.teachingFa ? (
                <View style={styles.teachingCard}>
                  <Text style={styles.teachingTitle}>چطور این درس را یاد بگیریم</Text>
                  {lesson.teachingFa.split('\n').map(line => (
                    <Text key={line} style={styles.teachingLine}>
                      {line}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
          )}

          {stage === 1 && current && (
            <View
              style={styles.sentenceStage}
              onLayout={event => {
                stageOffsetRef.current = event.nativeEvent.layout.y;
              }}
            >
              <Text style={styles.counter}>
                جمله {toPersianDigits(sentenceIndex + 1)} از {toPersianDigits(lesson.sentences.length)}
              </Text>
              <View style={styles.sentenceCard}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`پخش نمونهٔ صوتی جمله: ${current.ar}`}
                  accessibilityHint="فقط نمونهٔ گفتاری پخش می‌شود؛ میکروفن فعال نیست."
                  style={styles.soundButton}
                  onPress={() => speak(current.ar, ARABIC_NORMAL_SPEECH_RATE)}
                >
                  <Volume2 size={25} color={Colors.onColor} />
                </Pressable>
                <Text style={styles.arabic}>{current.ar}</Text>
                <Text style={styles.pronunciation}>{current.pronunciation}</Text>
                <View style={styles.divider} />
                {lesson.levelId >= 3 ? (
                  <RevealText text={current.fa} style={styles.persian} resetKey={current.id} />
                ) : (
                  <Text keepColor style={styles.persian}>
                    {current.fa}
                  </Text>
                )}
                {current.pattern ? (
                  <View style={styles.pattern}>
                    <Text style={styles.patternLabel}>الگو</Text>
                    <Text style={styles.patternArabic}>{current.pattern}</Text>
                  </View>
                ) : null}
              </View>
              <ArabicSpeechRateControls onPlay={rate => speak(current.ar, rate)} />
              {!!audioNotice && (
                <Text accessibilityLiveRegion="polite" style={styles.speechError}>
                  {audioNotice}
                </Text>
              )}
              <SpeakCheck
                key={current.id}
                onSkip={skipSpeakingSentence}
                text={current.ar}
                locale="ar-SA"
                accent={Colors.success[400]}
                autoStart={micReadyKey === `1:${current.id}`}
                onResult={result => {
                  if (sentenceIndex < chunkLastIndex) {
                    scheduleOnPass(result, () => {
                      setSentenceIndex(sentenceIndex + 1);
                      setRevealed(false);
                    });
                  }
                }}
              />
            </View>
          )}

          {stage === 2 && (
            <View style={styles.centerStage}>
              <View style={styles.bigIcon}>
                <Headphones size={34} color={Colors.primary[400]} />
              </View>
              <Text style={styles.stageTitle}>شنیدن جمله‌ها</Text>
              {showHint && (
                <Text style={styles.stageDesc}>هر جمله را گوش دهید و معنی‌اش را به یاد بیاورید.</Text>
              )}
              <View
                style={{ width: '100%' }}
                onLayout={event => {
                  listenListOffsetRef.current = event.nativeEvent.layout.y;
                }}
              >
                <BlindListeningList
                  items={lesson.sentences.map(sentence => ({
                    id: sentence.id,
                    text: sentence.ar,
                    fa: sentence.fa,
                  }))}
                  activeIndex={sentenceIndex}
                  onSelect={selectListeningSentence}
                  onRestart={restartListening}
                  restartSignal={listenRun}
                  onActiveItemY={yInList => scrollToContentY(listenListOffsetRef.current + yInList)}
                  accent={Palette.primary}
                  foreignStyle={styles.listenArabic}
                />
              </View>
              <View style={styles.shadowTip}>
                <Headphones size={18} color={Colors.primary[400]} />
                <Text style={styles.shadowText}>
                  جمله‌ها به‌ترتیب خودکار پخش می‌شوند؛ هر زمان خواستید «ادامه» را بزنید.
                </Text>
              </View>
            </View>
          )}

          {stage === 3 && current && (
            <View style={styles.centerStage}>
              <View style={styles.bigIcon}>
                <Mic2 size={34} color={Colors.success[400]} />
              </View>
              <Text style={styles.stageTitle}>سایه‌خوانی · Shadowing</Text>
              {showHint && (
                <Text style={styles.stageDesc}>بشنوید، مکث کنید و با همان آهنگ تکرار کنید.</Text>
              )}
              <View style={styles.speechPractice}>
                <Text style={styles.speechTitle}>جملهٔ انتخاب‌شده</Text>
                <Text style={styles.speechSentence}>{current.ar}</Text>
                <ArabicSpeechRateControls onPlay={rate => speak(current.ar, rate)} />
                {!!audioNotice && (
                  <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.speechError}>
                    {audioNotice}
                  </Text>
                )}
                <Text style={styles.speechHint}>پس از شنیدن، جمله را با صدای بلند تکرار کنید.</Text>
                <SpeakCheck
                  key={`shadow-${current.id}`}
                  onSkip={skipSpeakingSentence}
                  text={current.ar}
                  locale="ar-SA"
                  accent={Colors.success[400]}
                  autoStart={micReadyKey === `3:${current.id}`}
                  onResult={result => {
                    if (sentenceIndex < lesson.sentences.length - 1) {
                      scheduleOnPass(result, () => setSentenceIndex(sentenceIndex + 1));
                    }
                  }}
                />
              </View>
              <View style={styles.dots}>
                {lesson.sentences.map((sentence, index) => (
                  <Pressable
                    key={sentence.id}
                    accessibilityRole="button"
                    accessibilityLabel={`جمله ${index + 1}`}
                    onPress={() => selectListeningSentence(index)}
                    style={[styles.dot, index === sentenceIndex && styles.dotActive]}
                  />
                ))}
              </View>
            </View>
          )}

          {stage === 4 && current && (
            <View style={styles.centerStage}>
              <View style={styles.bigIcon}>
                <RotateCcw size={33} color={Colors.success[400]} />
              </View>
              <Text style={styles.stageTitle}>ساخت جمله</Text>
              {showHint && (
                <Text style={styles.stageDesc}>
                  {lesson.levelId <= 0
                    ? 'جمله و الگویش را ببینید و واژه‌ها را به همان ترتیب راست‌به‌چپ بچینید.'
                    : 'الگوی ساختار و واژه‌های کلیدی را ببینید و جمله را بسازید.'}
                </Text>
              )}
              <ArabicSentenceBuilder
                sentence={current}
                guided={lesson.levelId <= 0}
                pattern={current.pattern || patterns[0]?.pattern}
                lessonNote={lesson.teachingFa}
                levelId={lesson.levelId}
                sentenceIndex={sentenceIndex}
                sentenceCount={lesson.sentences.length}
                builtCount={Object.keys(builtSentences).length}
                onSpeak={text => speak(text)}
                onBuilt={markBuiltSentence}
                onNextSentence={
                  sentenceIndex < lesson.sentences.length - 1
                    ? () => setSentenceIndex(sentenceIndex + 1)
                    : undefined
                }
              />
              <View style={styles.dots}>
                {lesson.sentences.map((sentence, index) => (
                  <Pressable
                    key={sentence.id}
                    accessibilityRole="button"
                    accessibilityLabel={`جمله ${index + 1}`}
                    onPress={() => setSentenceIndex(index)}
                    style={[styles.dot, index === sentenceIndex && styles.dotActive]}
                  />
                ))}
              </View>
            </View>
          )}

          {stage === 5 && (
            <View style={styles.centerStage}>
              <View style={styles.bigIcon}>
                <Sparkles size={34} color={Colors.warning[400]} />
              </View>
              <Text style={styles.stageTitle}>واژگان از دل جمله‌ها</Text>
              {showHint && (
                <Text style={styles.stageDesc}>هر واژه را با معنی، ریشه و جمله‌اش مرور کنید.</Text>
              )}
              <View
                style={styles.vocabList}
                onLayout={event => {
                  vocabListOffsetRef.current = event.nativeEvent.layout.y;
                }}
              >
                {vocabulary.map((item, vocabIndex) => (
                  <View
                    key={`${item.plain}-${vocabIndex}`}
                    onLayout={event => {
                      vocabCardYsRef.current[vocabIndex] = event.nativeEvent.layout.y;
                    }}
                    style={styles.vocabCard}
                  >
                    <View style={styles.vocabTop}>
                      <Text style={styles.vocabWord}>{item.word}</Text>
                      <Text style={styles.vocabMeaning}>{item.meaning}</Text>
                    </View>
                    {item.root ? <Text style={styles.vocabRoot}>ریشه: {item.root}</Text> : null}
                    <Text style={styles.vocabExample}>{item.sentenceAr}</Text>
                    <Text keepColor style={styles.bubbleFa}>
                      {item.sentenceFa}
                    </Text>
                    <SpeakCheck
                      compact
                      text={item.word}
                      locale="ar-SA"
                      accent={Colors.success[400]}
                      autoStart={micReadyKey === `5:${vocabIndex}:${item.word}`}
                      onSkip={() => {
                        cancelSpeakingAdvance();
                        setMicReadyKey('');
                        if (vocabIndex < vocabulary.length - 1) {
                          const nextVocab = vocabulary[vocabIndex + 1];
                          scrollToContentY(
                          vocabListOffsetRef.current + (vocabCardYsRef.current[vocabIndex + 1] ?? 0),
                          );
                          speakForTarget(
                          nextVocab.word,
                          ARABIC_NORMAL_SPEECH_RATE,
                          `5:${vocabIndex + 1}:${nextVocab.word}`,
                          );
                        } else { void next(); }
                      }}
                      onResult={result => {
                        if (vocabIndex < vocabulary.length - 1) {
                          const nextVocab = vocabulary[vocabIndex + 1];
                          scheduleOnPass(result, () => {
                            scrollToContentY(
                              vocabListOffsetRef.current + (vocabCardYsRef.current[vocabIndex + 1] ?? 0),
                            );
                            speakForTarget(
                              nextVocab.word,
                              ARABIC_NORMAL_SPEECH_RATE,
                              `5:${vocabIndex + 1}:${nextVocab.word}`,
                            );
                          });
                        }
                      }}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

          {stage === 6 && (
            <View style={styles.grammarStage}>
              <GrammarStageHeader
                title="دستور در کاربرد"
                description={
                  showHint ? 'الگوی هر جمله را ببینید و مثالش را بشنوید.' : undefined
                }
              />
              {lesson.teachingFa ? <GrammarNoteCard title="نکتهٔ آموزشی درس" text={lesson.teachingFa} /> : null}
              {patterns.map((p, idx) => (
                <GrammarPatternCard
                  key={`${p.pattern}-${idx}`}
                  index={idx + 1}
                  pattern={p.pattern}
                  example={p.exampleAr}
                  translation={p.exampleFa}
                  onSpeak={() => speak(p.exampleAr)}
                />
              ))}
            </View>
          )}

          {(stage === 7 || stage === 8) && (
            <View style={styles.centerStage}>
              {(() => {
                const finalSections: FinalSection[] = [
                  {
                    id: 'speak',
                    title: 'آزمون گفتاری',
                    subtitle: `${toPersianDigits(lesson.sentences.length)} جمله؛ هر کدام را بلند بگو و امتیاز بگیر.`,
                    render: () => (
                      <SpeakDrill
                        key={`${lesson.id}-drill`}
                        items={lesson.sentences.map(s => ({ id: s.id, text: s.ar, fa: s.fa }))}
                        locale="ar-SA"
                        accent={Colors.success[400]}
                        onSpeak={(text, onDone) => speak(text, ARABIC_NORMAL_SPEECH_RATE, onDone)}
                        onFinish={result => {
                          speakResult.current = result;
                          void saveLessonOutcome('ar', lesson.id, {
                            speaking: { ...result, at: new Date().toISOString() },
                          });
                        }}
                      />
                    ),
                  },
                  {
                    id: 'checks',
                    title: 'سنجش کوتاه',
                    subtitle: 'چند سؤال کوتاه برای مرور همین درس.',
                    render: () =>
                      evidencePassed ? (
                        <Text style={styles.stageDesc}>سنجش کوتاه این درس با پاسخ درست ثبت شد ✓</Text>
                      ) : (
                        <ArabicLessonEvidence
                          key={`${lesson.id}-${attempt.current?.id ?? 'base'}`}
                          lesson={lesson}
                          attemptEvidence={attemptEvidence}
                          onAttemptResult={(taskId, ok) => {
                            if (!resettingRef.current) {
                              setAttemptEvidence(prev => (prev ? { ...prev, [taskId]: ok } : prev));
                            }
                          }}
                          onPassed={() => {
                            if (!resettingRef.current) setEvidencePassed(true);
                          }}
                        />
                      ),
                  },
                ];
                return (
                  <>
                    {stage === 7 ? <LessonFinalHub only="checks" sections={finalSections} /> : null}
                    {stage === 8 ? <LessonFinalHub only="speak" sections={finalSections} /> : null}
                  </>
                );
              })()}
            </View>
          )}


          {stage === 9 && (
            <LessonDialogueRoom
              key={lesson.id}
              language="ar"
              lessonId={lesson.id}
              lessonTitle={lesson.title}
              levelId={lesson.levelId}
              situation={lesson.situation}
              lines={lesson.sentences.map(sentence => ({ text: sentence.ar, fa: sentence.fa }))}
              locale="ar-SA"
              onSpeak={(text, onDone) => playArabicSpeech(text, { rate: ARABIC_NORMAL_SPEECH_RATE, onDone, onError: onDone })}
              onSpeakOperator={(text, onDone) => playArabicSpeech(text, { rate: ARABIC_NORMAL_SPEECH_RATE, pitch: 0.82, onDone, onError: onDone })}
              onSpeakSlow={(text, onDone) => playArabicSpeech(text, { rate: ARABIC_SLOW_SPEECH_RATE, onDone, onError: onDone })}
            />
          )}
          {!!completionError && <Text style={styles.speechError}>{completionError}</Text>}
        </View>

        <View style={{ height: bottomSpacer }} />
      </FitScrollView>

      <View pointerEvents={resetting ? 'none' : 'auto'} style={styles.footer}>
        <View style={styles.footerButtons}>
          {stage === 1 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="جملهٔ قبلی"
              accessibilityState={{ disabled: saving || !!sessionError || sentenceIndex === 0 }}
              disabled={saving || !!sessionError || sentenceIndex === 0}
              onPress={goToPreviousSentence}
              style={[
                styles.previousButton,
                (saving || !!sessionError || sentenceIndex === 0) && { opacity: 0.45 },
              ]}
            >
              <Text style={styles.secondaryControlText}>جمله قبلی</Text>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: saving || !!sessionError }}
            disabled={saving || !!sessionError}
            style={[styles.nextButton, (saving || !!sessionError) && { opacity: 0.45 }]}
            onPress={() => void next()}
          >
            <Text style={styles.nextText}>
              {stage === stages.length - 1
                ? 'پایان درس'
                : stage === 1 && sentenceIndex < lesson.sentences.length - 1
                  ? 'جمله بعدی'
                  : 'ادامه'}
            </Text>
            {stage === stages.length - 1 ? (
              <Check size={20} color={Colors.onColor} />
            ) : (
              <ChevronLeft size={20} color={Colors.onColor} />
            )}
          </Pressable>
        </View>
      </View>

      {chunkCelebration ? (
        <View style={styles.chunkOverlay}>
          <View style={styles.chunkCard}>
            <Text style={styles.chunkTitle}>
              بخش {toPersianDigits(chunkCelebration.chunk)} از {toPersianDigits(chunkCelebration.total)} تمام شد
            </Text>
            <Text style={styles.chunkBody}>
              یک برد واقعی گرفتی. اگر وقت داری بخش بعدی را ادامه بده؛ اگر نه، همین‌جا بمان و فردا از بخش بعد شروع کن.
            </Text>
            <Pressable
              accessibilityRole="button"
              style={styles.chunkPrimary}
              onPress={() => {
                setChunkCelebration(null);
                setSentenceIndex(chunkCelebration.nextStart);
              }}
            >
              <Text style={styles.chunkPrimaryText}>ادامهٔ بخش بعدی</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={styles.chunkSecondary}
              onPress={() => {
                setChunkCelebration(null);
                void markChunkDone(lesson.id, chunkCelebration.chunk)
                  .then(setDoneChunks)
                  .catch(() => undefined);
                router.replace('/learn/ar' as never);
              }}
            >
              <Text style={styles.chunkSecondaryText}>ذخیره و بازگشت به خانه</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <LessonCelebration onRestart={async () => { const target = await prepareLessonRestart('/learn/ar/lesson', lesson.id); router.replace(target as never); }}
        visible={!!celebration}
        lessonTitle={lesson.title}
        stats={
          celebration?.stats ?? {
            sentences: 0,
            practiceTotal: 0,
            practiceFirstTry: 0,
            practiceSeconds: 0,
            streak: 0,
            streakExtendedToday: false,
          }
        }
        hasNextLesson={!!nextLessonInOrder(ARABIC_LESSONS, lesson.id)}
        onContinue={() => {
          const go = celebration?.next;
          setCelebration(null);
          go?.();
        }}
        dueReviews={celebration?.dueReviews ?? 0}
        onReview={() => {
          const go = celebration?.review;
          setCelebration(null);
          go?.();
        }}
        newAchievements={celebration?.newAchievements}
        levelFinished={
          celebration?.levelFinished
            ? {
                ...celebration.levelFinished,
                onStart: celebration.levelFinished.onStart
                  ? () => {
                      const go = celebration.levelFinished!.onStart!;
                      setCelebration(null);
                      go();
                    }
                  : undefined,
              }
            : undefined
        }
      />
    </View>
  );
}

function ArabicSpeechRateControls({
  onPlay,
  disabled = false,
}: {
  onPlay: (rate: number) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.replayRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="پخش آهستهٔ جملهٔ عربی"
        accessibilityState={{ disabled }}
        disabled={disabled}
        style={[styles.replayButton, disabled && styles.replayDisabled]}
        onPress={() => onPlay(ARABIC_SLOW_SPEECH_RATE)}
      >
        <Volume2 size={18} color={Palette.primary} />
        <Text style={styles.replayText}>آهسته</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="پخش معمولی جملهٔ عربی"
        accessibilityState={{ disabled }}
        disabled={disabled}
        style={[styles.replayButton, disabled && styles.replayDisabled]}
        onPress={() => onPlay(ARABIC_NORMAL_SPEECH_RATE)}
      >
        <Volume2 size={18} color={Palette.primary} />
        <Text style={styles.replayText}>معمولی</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="پخش با سرعت طبیعی"
        accessibilityState={{ disabled }}
        disabled={disabled}
        style={[styles.replayButton, disabled && styles.replayDisabled]}
        onPress={() => onPlay(ARABIC_NATURAL_SPEECH_RATE)}
      >
        <Volume2 size={18} color={Palette.primary} />
        <Text style={styles.replayText}>طبیعی</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.canvas },
  lessonScroll: { flex: 1, minHeight: 0 },
  lessonScrollContent: { paddingBottom: 28 },
  brandRow: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 6,
  },
  header: {
    width: '100%',
    maxWidth: 900,
    minHeight: 64,
    alignSelf: 'center',
    paddingTop: 12,
    paddingHorizontal: 15,
    paddingBottom: 7,
    gap: 8,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  headerTop: { width: '100%', maxWidth: 900, alignSelf: 'center', flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  headerText: { flex: 1, alignItems: 'flex-end', gap: 2 },
  practiceForeign: { fontFamily: Typography.boldFontFamily, writingDirection: 'rtl' },
  headerTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  headerSub: {
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  percentBadge: {
    minWidth: 50,
    height: 50,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  percent: { fontFamily: Typography.fontFamily, fontSize: 16, lineHeight: 18, fontWeight: '400', color: '#FFFFFF', writingDirection: 'rtl' },
  percentLabel: { fontFamily: Typography.fontFamily, color: 'rgba(255,255,255,0.72)', fontSize: 9, fontWeight: '400', writingDirection: 'rtl' },
  stepperCard: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 18,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 10,
    shadowColor: '#211A68',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  stepperHeading: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  stepperNow: { alignItems: 'flex-end', gap: 1 },
  stepperNowFa: { fontFamily: Typography.fontFamily, color: Palette.muted, fontSize: 10, fontWeight: '400', writingDirection: 'rtl' },
  stepSegments: { flexDirection: 'row-reverse', gap: 4 },
  stepSegment: { flex: 1, height: 5, borderRadius: 999, backgroundColor: Palette.border },
  stepSegmentDone: { backgroundColor: Palette.primary },
  stepSegmentCurrent: { height: 8, marginTop: -1.5, backgroundColor: Palette.teal },
  chunkBar: { marginTop: 10, gap: 6 },
  chunkText: { fontFamily: Typography.fontFamily, fontSize: 11, color: '#475569', textAlign: 'right', writingDirection: 'rtl' },
  chunkTrack: { flexDirection: 'row-reverse', gap: 5 },
  chunkDot: { flex: 1, height: 5, borderRadius: 3, backgroundColor: '#E2E8F0' },
  chunkDotDone: { backgroundColor: '#15803D' },
  chunkDotNow: { backgroundColor: '#4338CA' },
  chunkOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(15,23,42,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 40 },
  chunkCard: { width: '100%', maxWidth: 360, borderRadius: 22, backgroundColor: '#FFFFFF', padding: 20, gap: 10, alignItems: 'stretch' },
  chunkTitle: { fontFamily: Typography.fontFamily, fontSize: 18, color: '#0F172A', textAlign: 'center', writingDirection: 'rtl' },
  chunkBody: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 20, color: '#475569', textAlign: 'center', writingDirection: 'rtl' },
  chunkPrimary: { minHeight: 44, borderRadius: 12, backgroundColor: '#4338CA', alignItems: 'center', justifyContent: 'center' },
  chunkPrimaryText: { fontFamily: Typography.fontFamily, fontSize: 13, color: '#FFFFFF', writingDirection: 'rtl' },
  chunkSecondary: { minHeight: 40, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  chunkSecondaryText: { fontFamily: Typography.fontFamily, fontSize: 12, color: '#475569', writingDirection: 'rtl' },
  content: { width: '100%', maxWidth: 900, alignSelf: 'center', paddingHorizontal: 15, paddingTop: 9, paddingBottom: 22, gap: 11 },
  centerStage: { alignItems: 'center', width: '100%' },
  grammarStage: { width: '100%', alignItems: 'stretch' },
  bigIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Palette.primarySoft,
    borderWidth: 1,
    borderColor: '#DDE2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.lg,
  },
  stageTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: 27,
    lineHeight: 36,
    fontWeight: '400',
    color: Palette.ink,
    textAlign: 'right',
    writingDirection: 'rtl',
    alignSelf: 'stretch',
  },
  stageDesc: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.sm + 2,
    fontWeight: '400',
    color: Palette.text,
    textAlign: 'right',
    writingDirection: 'rtl',
    alignSelf: 'stretch',
    lineHeight: 23,
    marginTop: Spacing.sm,
  },
  situation: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.md + 2,
    fontWeight: '400',
    color: Palette.text,
    textAlign: 'right',
    writingDirection: 'rtl',
    alignSelf: 'stretch',
    lineHeight: 27,
    marginTop: Spacing.md,
  },
  teachingCard: {
    width: '100%',
    borderRadius: Radius.xl,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Palette.border,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  teachingTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.sm + 3,
    fontWeight: '400',
    color: Palette.primaryDark,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  teachingLine: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.sm + 2,
    fontWeight: '400',
    color: Palette.text,
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 24,
    marginTop: 6,
  },
  sentenceStage: { alignItems: 'center', paddingTop: 10, width: '100%' },
  counter: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xs + 2,
    fontWeight: '400',
    color: Palette.muted,
    marginBottom: Spacing.md,
    alignSelf: 'flex-end',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sentenceCard: {
    width: '100%',
    borderRadius: Radius.xl,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#172033',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  replayRow: { width: '100%', maxWidth: 320, flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 12 },
  replayButton: {
    flex: 1,
    minWidth: 96,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.primary,
    backgroundColor: '#FFFFFF',
  },
  replayText: { fontFamily: Typography.fontFamily, fontSize: 14, color: Palette.primary, writingDirection: 'rtl' },
  replayDisabled: { opacity: 0.45 },
  soundButton: { width: 54, height: 54, borderRadius: 27, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  arabic: {
    fontFamily: Typography.boldFontFamily,
    width: '100%',
    fontSize: 25,
    lineHeight: 40,
    color: Palette.ink,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  pronunciation: {
    fontFamily: Typography.fontFamily,
    width: '100%',
    fontSize: Typography.sizes.sm + 2,
    fontWeight: '400',
    color: Palette.primaryDark,
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 24,
    marginTop: 6,
  },
  divider: { width: '70%', height: 1, backgroundColor: Palette.border, marginVertical: 12 },
  persian: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.lg + 2,
    fontWeight: '400',
    color: PERSIAN_TRANSLATION_COLOR,
    textAlign: 'right',
    writingDirection: 'rtl',
    alignSelf: 'stretch',
  },
  pattern: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    alignSelf: 'flex-end',
    backgroundColor: Palette.warningSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    marginTop: Spacing.md,
  },
  patternLabel: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs + 2, fontWeight: '400', color: Palette.warning, writingDirection: 'rtl' },
  patternArabic: { fontFamily: Typography.boldFontFamily, fontSize: Typography.sizes.xs + 2, color: Palette.warning, textAlign: 'right', writingDirection: 'rtl' },
  listenArabic: { fontFamily: Typography.boldFontFamily, flex: 1, fontSize: 16, lineHeight: 26, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  speechPractice: {
    width: '100%',
    borderRadius: Radius.xl,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
    shadowColor: '#172033',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  speechTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md + 2, fontWeight: '400', color: Palette.ink, textAlign: 'right', writingDirection: 'rtl', alignSelf: 'stretch' },
  speechSentence: {
    fontFamily: Typography.boldFontFamily,
    width: '100%',
    fontSize: 21,
    lineHeight: 34,
    color: Palette.ink,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginTop: Spacing.sm,
  },
  speechHint: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xs + 2,
    fontWeight: '400',
    color: Palette.muted,
    textAlign: 'right',
    writingDirection: 'rtl',
    alignSelf: 'stretch',
    lineHeight: 19,
    marginTop: 6,
  },
  speechError: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xs + 2,
    fontWeight: '400',
    color: Palette.danger,
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 19,
    marginTop: Spacing.sm,
  },
  shadowTip: {
    width: '100%',
    marginTop: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Palette.warningSoft,
    padding: Spacing.md,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  shadowText: { flex: 1, fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs + 2, fontWeight: '400', color: Palette.text, textAlign: 'right', writingDirection: 'rtl', lineHeight: 19 },
  dots: { flexDirection: 'row', gap: 8, marginTop: Spacing.lg },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Palette.border },
  dotActive: { width: 24, backgroundColor: Palette.primary },
  vocabList: { width: '100%', gap: Spacing.sm, marginTop: Spacing.xl },
  vocabCard: { borderRadius: Radius.lg, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border, padding: Spacing.md },
  vocabTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  vocabWord: { fontFamily: Typography.boldFontFamily, fontSize: 19, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  vocabMeaning: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm + 2, fontWeight: '400', color: Palette.primaryDark, textAlign: 'left', writingDirection: 'rtl' },
  vocabRoot: { fontFamily: Typography.fontFamily, fontSize: 12, color: Palette.warning, textAlign: 'right', writingDirection: 'rtl', marginTop: 4 },
  vocabExample: { fontFamily: Typography.boldFontFamily, fontSize: 15, lineHeight: 26, color: Palette.text, textAlign: 'right', writingDirection: 'rtl', marginTop: 8 },
  bubbleFa: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs + 2, fontWeight: '400', color: PERSIAN_TRANSLATION_COLOR, textAlign: 'right', writingDirection: 'rtl', marginTop: 5 },
  footer: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: 15,
    paddingTop: 7,
    paddingBottom: 10,
    backgroundColor: Palette.canvas,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
    shadowColor: '#211A68',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 5,
  },
  footerButtons: { width: '100%', flexDirection: 'row', gap: 8, alignItems: 'center' },
  previousButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  secondaryControlText: { fontFamily: Typography.fontFamily, color: Palette.primaryDark, fontSize: 13, textAlign: 'center', writingDirection: 'rtl' },
  nextButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 54,
    borderRadius: 17,
    backgroundColor: Palette.primary,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Palette.primary,
    shadowOpacity: 0.2,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  nextText: { fontFamily: Typography.boldFontFamily, fontSize: Typography.sizes.md + 2, fontWeight: '400', color: Colors.onColor, writingDirection: 'rtl' },
});
