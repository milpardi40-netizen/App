import { LocalizedText as Text } from '@/components/LocalizedText';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowRight, Check, ChevronLeft, MessageSquareQuote, Mic2, Play, RefreshCw, Sparkles, Volume2 } from 'lucide-react-native';
import SpeakCheck from '@/components/SpeakCheck';
import { ArabicBottomNav } from './ArabicBottomNav';
import { ReviewRatingGrid } from '@/components/ReviewRecall';
import { useStudyTimer } from '@/components/useEnglishStudyTimer';
import { speakPersian } from '@/lib/persianSpeech';
import {
  ARABIC_NORMAL_SPEECH_RATE,
  ARABIC_SLOW_SPEECH_RATE,
  playArabicSpeech,
  stopArabicSpeech,
  warmArabicSpeech,
} from '@/lib/arabic/speech';
import { getArabicWordLabWords, type ArabicWordLabItem } from '@/lib/arabic/engine';
import type { WordLabWord } from '@/lib/languages/wordLab';
import {
  buildWordSession,
  rateWordCard,
  wordReason,
  wordStats,
  type WordCard,
  type WordProgress,
} from '@/lib/wordLabProgress';
import { notifyLearningChange } from '@/lib/learningChanges';
import { markPlanStep } from '@/lib/dailyPlan';
import type { ReviewRating } from '@/lib/courseProgress';
import { toPersianDigits as fa } from '@/lib/format';
import { Typography } from '@/lib/theme';

const C = {
  ink: '#0F172A',
  text: '#475569',
  muted: '#64748B',
  primary: '#4338CA',
  primaryDark: '#3730A3',
  primarySoft: '#EEF2FF',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  bg: '#F8FAFC',
  success: '#15803D',
  successSoft: '#DCFCE7',
  warning: '#B45309',
  warningSoft: '#FEF3C7',
  danger: '#B91C1C',
};

const AR_WORDLAB_STORAGE_KEY = 'milo.wordlab.v1.ar';

type ArabicWordLabCard = WordLabWord & {
  plain: string;
  root?: string;
  lessonTitle: string;
};

type Phase = 'loading' | 'intro' | 'listen' | 'sentence' | 'recall' | 'rate' | 'done';

function toLabWord(item: ArabicWordLabItem): ArabicWordLabCard {
  return {
    id: item.id,
    target: item.target,
    plain: item.plain,
    fa: item.fa,
    root: item.root,
    note: item.note,
    exampleTarget: item.exampleTarget,
    exampleFa: item.exampleFa,
    examplePronunciation: item.examplePronunciation,
    order: item.order,
    frequencyRank: item.frequencyRank,
    levelId: item.levelId,
    curated: item.curated,
    lessonTitle: item.lessonTitle,
  };
}

function validCard(value: unknown): value is WordCard {
  if (!value || typeof value !== 'object') return false;
  const card = value as Partial<WordCard>;
  return (
    typeof card.id === 'string' &&
    typeof card.dueAt === 'string' &&
    Number.isFinite(Date.parse(card.dueAt)) &&
    typeof card.introducedAt === 'string' &&
    Number.isFinite(Date.parse(card.introducedAt)) &&
    [card.intervalDays, card.ease, card.repetitions, card.lapses, card.spokenSuccess, card.listened].every(
      n => typeof n === 'number' && Number.isFinite(n) && n >= 0,
    ) &&
    (card.ease ?? 0) >= 1.3 &&
    (card.ease ?? 0) <= 3
  );
}

async function loadArabicWordProgress(): Promise<WordProgress> {
  try {
    const raw =
      Platform.OS === 'web'
        ? window.localStorage.getItem(AR_WORDLAB_STORAGE_KEY)
        : await AsyncStorage.getItem(AR_WORDLAB_STORAGE_KEY);
    if (!raw) return { cards: {} };
    const parsed = JSON.parse(raw) as Partial<WordProgress>;
    const cards: Record<string, WordCard> = {};
    for (const [id, card] of Object.entries(parsed.cards ?? {})) {
      if (validCard(card) && card.id === id) cards[id] = card;
    }
    return { cards };
  } catch {
    return { cards: {} };
  }
}

async function saveArabicWordProgress(progress: WordProgress): Promise<void> {
  try {
    const raw = JSON.stringify(progress);
    if (Platform.OS === 'web') window.localStorage.setItem(AR_WORDLAB_STORAGE_KEY, raw);
    else await AsyncStorage.setItem(AR_WORDLAB_STORAGE_KEY, raw);
    notifyLearningChange();
  } catch {
    /* Local-only progress; a storage failure must never block the drill. */
  }
}

function hasArabicSentence(word: ArabicWordLabCard): boolean {
  const tokens = word.exampleTarget.replace(/[.!?؟،…]/gu, '').split(/\s+/).filter(Boolean);
  return tokens.length >= 2 && word.exampleTarget.trim() !== word.target.trim();
}

function firstArabicHint(word: ArabicWordLabCard): string {
  const source = hasArabicSentence(word) ? word.exampleTarget : word.target;
  const first = source.trim().split(/\s+/)[0] ?? word.target;
  return `با «${first}…» شروع می‌شود`;
}

export default function ArabicVocabularyScreen() {
  const router = useRouter();
  const words = useMemo(() => getArabicWordLabWords().map(toLabWord), []);
  const home = '/learn/ar';

  const [reloadToken, setReloadToken] = useState(0);
  const [phase, setPhase] = useState<Phase>('loading');
  const [progress, setProgress] = useState<WordProgress | null>(null);
  const [queue, setQueue] = useState<readonly ArabicWordLabCard[]>([]);
  const [index, setIndex] = useState(0);
  const [sessionInfo, setSessionInfo] = useState({ dueCount: 0, newCount: 0 });
  const [spoken, setSpoken] = useState(false);
  const [spokenScore, setSpokenScore] = useState<number | null>(null);
  const [autoAdvancing, setAutoAdvancing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [recallMicReady, setRecallMicReady] = useState(true);
  const playback = useRef(0);
  const autoChain = useRef(0);
  const autoPlayed = useRef('');
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAdvancedCard = useRef('');

  const timer = useStudyTimer(
    phase === 'listen' || phase === 'sentence' || phase === 'recall' || phase === 'rate',
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
    void (async () => {
      const stored = await loadArabicWordProgress();
      const session = buildWordSession(words, stored, new Date());
      if (session.introduced !== stored) await saveArabicWordProgress(session.introduced);
      if (!alive) return;
      setProgress(session.introduced);
      setQueue(session.queue as ArabicWordLabCard[]);
      setIndex(0);
      autoPlayed.current = '';
      setSessionInfo({ dueCount: session.dueCount, newCount: session.newCount });
      setPhase(session.queue.length ? 'intro' : 'done');
    })();
    return () => {
      alive = false;
      autoChain.current += 1;
      playback.current += 1;
      void stopArabicSpeech();
    };
  }, [reloadToken, words]);

  const stats = useMemo(() => (progress ? wordStats(words, progress) : null), [progress, words]);
  const word = queue[index];

  const stopAll = useCallback(() => {
    autoChain.current += 1;
    playback.current += 1;
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
    void stopArabicSpeech();
  }, []);

  const sayTarget = useCallback(async (item: ArabicWordLabCard, rate: number) => {
    setVoiceError('');
    await new Promise<void>(resolve => {
      let settled = false;
      const done = () => {
        if (!settled) {
          settled = true;
          clearTimeout(fallbackTimer);
          resolve();
        }
      };
      const fallbackTimer = setTimeout(done, 4000);
      playArabicSpeech(item.target, {
        rate,
        onDone: done,
        onError: () => {
          setVoiceError('صدای این دستگاه برای عربی در دسترس نیست؛ متن و ترجمه همچنان دیده می‌شوند.');
          done();
        },
      });
    });
  }, []);

  const saySentence = useCallback(async (item: ArabicWordLabCard, rate: number) => {
    if (!hasArabicSentence(item)) return;
    setVoiceError('');
    await new Promise<void>(resolve => {
      let settled = false;
      const done = () => {
        if (!settled) {
          settled = true;
          clearTimeout(fallbackTimer);
          resolve();
        }
      };
      const fallbackTimer = setTimeout(done, 6000);
      playArabicSpeech(item.exampleTarget, {
        rate,
        onDone: done,
        onError: () => {
          setVoiceError('صدای این دستگاه برای عربی در دسترس نیست؛ متن و ترجمه همچنان دیده می‌شوند.');
          done();
        },
      });
    });
  }, []);

  const playOnce = useCallback(
    async (item: ArabicWordLabCard) => {
      const token = ++playback.current;
      await sayTarget(item, ARABIC_SLOW_SPEECH_RATE);
      if (token !== playback.current) return;
      await new Promise<void>(resolve => {
        speakPersian(item.fa);
        setTimeout(resolve, Math.min(3200, 900 + item.fa.length * 90));
      });
    },
    [sayTarget],
  );

  const playSentence = useCallback(
    async (item: ArabicWordLabCard) => {
      const token = ++playback.current;
      await saySentence(item, ARABIC_NORMAL_SPEECH_RATE);
      if (token !== playback.current) return;
      await new Promise<void>(resolve => {
        speakPersian(item.exampleFa);
        setTimeout(resolve, Math.min(3600, 900 + item.exampleFa.length * 90));
      });
    },
    [saySentence],
  );

  const resetWord = useCallback(() => {
    setSpoken(false);
    setSpokenScore(null);
    setAutoAdvancing(false);
    setRecallMicReady(true);
    setError('');
    setVoiceError('');
    stopAll();
  }, [stopAll]);

  const goNext = useCallback(() => {
    resetWord();
    const nextIdx = index + 1;
    setIndex(nextIdx);
    setPhase(nextIdx < queue.length ? 'listen' : 'done');
  }, [index, queue.length, resetWord]);

  const rate = useCallback(
    async (rating: ReviewRating) => {
      if (!word || !progress || saving) return;
      setSaving(true);
      const nextProgress = rateWordCard(progress, word.id, rating, spoken, new Date());
      await saveArabicWordProgress(nextProgress);
      setProgress(nextProgress);
      if (spoken) void markPlanStep('speak').catch(() => undefined);
      setSaving(false);
      goNext();
    },
    [word, progress, spoken, saving, goNext],
  );

  const autoAdvanceAfterPass = useCallback(() => {
    if (!word || !progress) return;
    const cardKey = `${word.id}:${index}`;
    if (autoAdvancedCard.current === cardKey) return;
    autoAdvancedCard.current = cardKey;
    setAutoAdvancing(true);
    const nextProgress = rateWordCard(progress, word.id, 'good', true, new Date());
    setProgress(nextProgress);
    void saveArabicWordProgress(nextProgress).catch(() => undefined);
    void markPlanStep('speak').catch(() => undefined);
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = setTimeout(() => {
      autoAdvanceTimer.current = null;
      goNext();
    }, 900);
  }, [goNext, index, progress, word]);

  useEffect(() => {
    if (phase !== 'listen' || !word) return;
    const card = `${word.id}:${index}`;
    if (autoPlayed.current === card) return;
    autoPlayed.current = card;
    const token = ++autoChain.current;
    void (async () => {
      await playOnce(word);
      if (autoChain.current !== token) return;
      if (hasArabicSentence(word)) {
        setPhase('sentence');
        await playSentence(word);
        if (autoChain.current !== token) return;
      }
      await new Promise<void>(resolve => setTimeout(resolve, 350));
      if (autoChain.current !== token) return;
      setPhase('recall');
    })();
  }, [phase, word, index, playOnce, playSentence]);

  const startLearning = () => setPhase('listen');

  const goToSentence = useCallback(() => {
    stopAll();
    setPhase('sentence');
    if (word) void playSentence(word);
  }, [playSentence, stopAll, word]);

  const practiceText = word ? (hasArabicSentence(word) ? word.exampleTarget : word.target) : '';

  return (
    <View style={styles.root} onTouchStart={timer.interact}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="بازگشت"
          onPress={() => {
            stopAll();
            router.replace(home as never);
          }}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <ArrowRight size={20} color={C.ink} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>واژه‌های عربی</Text>
          <Text style={styles.headerSub}>می‌بینی، می‌شنوی، بعد از فارسی می‌گویی</Text>
        </View>
        <Sparkles size={22} color={C.primary} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!!timer.error && <Text style={styles.hintError}>{timer.error}</Text>}
        {phase === 'loading' ? (
          <View style={styles.centerCard}>
            <ActivityIndicator color={C.primary} />
            <Text style={styles.bodyText}>در حال آماده‌کردن واژه‌ها…</Text>
          </View>
        ) : null}

        {phase === 'intro' && word ? (
          <View style={styles.centerCard}>
            <View style={styles.bigIcon}>
              <Sparkles size={30} color={C.primary} />
            </View>
            <Text style={styles.title}>سه قدم برای هر واژه</Text>
            <View style={styles.stepList}>
              <Text style={styles.stepLine}>۱. واژهٔ عربی را می‌شنوی و معنی فارسی‌اش را می‌بینی.</Text>
              <Text style={styles.stepLine}>۲. یک جملهٔ واقعی با همان واژه می‌شنوی.</Text>
              <Text style={styles.stepLine}>۳. خودت همان جمله را می‌گویی؛ میکروفن خودش باز می‌شود.</Text>
            </View>
            <Text style={styles.smallText}>
              {fa(sessionInfo.newCount)} واژهٔ تازه · {fa(sessionInfo.dueCount)} مرور سررسید · هر واژه حدود نیم دقیقه
            </Text>
            {stats ? (
              <Text style={styles.smallText}>
                معرفی‌شده: {fa(stats.introduced)} از {fa(stats.total)} · مسلط گفتاری: {fa(stats.mastered)}
              </Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={startLearning}
              style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
            >
              <Play size={16} color="#FFFFFF" />
              <Text style={styles.primaryText}>شروع؛ خودش می‌گوید</Text>
            </Pressable>
          </View>
        ) : null}

        {phase === 'listen' && word ? (
          <View style={styles.wordCard}>
            <Text style={styles.stepLabel}>قدم ۱ از ۳ · می‌بینی و می‌شنوی</Text>
            <Text keepColor style={styles.bigWord}>
              {word.target}
            </Text>
            <Text style={styles.wordFa}>{word.fa}</Text>
            <View style={styles.autoBox}>
              <Volume2 size={16} color={C.primary} />
              <Text style={styles.autoText}>واژه به عربی، بعد معنی فارسی — سپس جمله خودش پخش می‌شود</Text>
            </View>
            {word.exampleTarget && word.exampleTarget !== word.target ? (
              <View style={styles.exampleBox}>
                <Text keepColor style={styles.exampleTarget}>
                  {word.exampleTarget}
                </Text>
                <Text style={styles.exampleFa}>{word.exampleFa}</Text>
              </View>
            ) : null}
            {word.note ? <Text style={styles.note}>{word.note}</Text> : null}
            {!!voiceError && <Text style={styles.hintWarm}>{voiceError}</Text>}
            <View style={styles.rowButtons}>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  autoChain.current += 1;
                  void playOnce(word);
                }}
                style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
              >
                <RefreshCw size={14} color={C.primaryDark} />
                <Text style={styles.ghostText}>دوباره بشنو</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={goToSentence}
                style={({ pressed }) => [styles.primary, styles.grow, pressed && styles.pressed]}
              >
                <MessageSquareQuote size={15} color="#FFFFFF" />
                <Text style={styles.primaryText}>جمله را بشنو</Text>
                <ChevronLeft size={15} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        ) : null}

        {phase === 'sentence' && word ? (
          <View style={styles.wordCard}>
            <Text style={styles.stepLabel}>قدم ۲ از ۳ · جمله را می‌شنوی</Text>
            <View style={styles.sentenceBox}>
              <Text keepColor style={styles.sentenceTarget}>
                {hasArabicSentence(word) ? word.exampleTarget : word.target}
              </Text>
              <Text style={styles.sentenceFa}>{hasArabicSentence(word) ? word.exampleFa : word.fa}</Text>
              {word.examplePronunciation ? (
                <Text style={styles.sentencePronunciation}>{word.examplePronunciation}</Text>
              ) : null}
            </View>
            <View style={styles.wordChip}>
              <Text keepColor style={styles.wordChipTarget}>
                {word.target}
              </Text>
              <Text style={styles.wordChipFa}>{word.fa}</Text>
              {word.root ? <Text style={styles.wordChipFa}>· ریشه: {word.root}</Text> : null}
            </View>
            <View style={styles.autoBox}>
              <Volume2 size={16} color={C.primary} />
              <Text style={styles.autoText}>جمله یک بار با صدای گوشی، بعد معنی فارسی‌اش</Text>
            </View>
            {!!voiceError && <Text style={styles.hintWarm}>{voiceError}</Text>}
            <View style={styles.rowButtons}>
              <Pressable
                accessibilityRole="button"
                onPress={() => void playSentence(word)}
                style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
              >
                <RefreshCw size={14} color={C.primaryDark} />
                <Text style={styles.ghostText}>دوباره بشنو</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  stopAll();
                  setPhase('recall');
                }}
                style={({ pressed }) => [styles.primary, styles.grow, pressed && styles.pressed]}
              >
                <Mic2 size={15} color="#FFFFFF" />
                <Text style={styles.primaryText}>حالا من می‌گویم</Text>
                <ChevronLeft size={15} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        ) : null}

        {phase === 'recall' && word ? (
          <View style={styles.wordCard}>
            <Text style={styles.stepLabel}>قدم ۳ از ۳ · جمله را تو می‌گویی</Text>
            <View style={styles.reversePrompt}>
              <Text style={styles.reverseLabel}>معنی فارسی جمله</Text>
              <Text style={styles.reverseFa}>{hasArabicSentence(word) ? word.exampleFa : word.fa}</Text>
              {hasArabicSentence(word) ? <Text style={styles.reverseWord}>با واژهٔ «{word.target}»</Text> : null}
            </View>
            <SpeakCheck
              key={`${word.id}-recall`}
              text={practiceText}
              locale="ar-SA"
              accent={C.primary}
              title={hasArabicSentence(word) ? 'جملهٔ عربی را بگو' : 'واژهٔ عربی را بگو'}
              autoStart={recallMicReady}
              onResult={result => {
                setError('');
                setSpokenScore(result.score);
                if (result.score >= 70) {
                  setSpoken(true);
                  autoAdvanceAfterPass();
                } else {
                  setError('نزدیک بود؛ یک بار دیگر آهسته‌تر و واضح‌تر بگو.');
                }
              }}
            />
            <View style={styles.rowButtons}>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setRecallMicReady(false);
                  void playSentence(word).finally(() => setRecallMicReady(true));
                }}
                style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
              >
                <Volume2 size={14} color={C.primaryDark} />
                <Text style={styles.ghostText}>جمله را بشنو</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setRecallMicReady(false);
                  void playOnce(word).finally(() => setRecallMicReady(true));
                }}
                style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
              >
                <Volume2 size={14} color={C.primaryDark} />
                <Text style={styles.ghostText}>واژه را بشنو</Text>
              </Pressable>
            </View>
            {spoken ? (
              <View style={styles.okBox}>
                <Check size={15} color={C.success} />
                <Text style={styles.okText}>
                  {autoAdvancing ? 'درست گفتی؛ انتقال خودکار به واژهٔ بعدی…' : 'درست گفتی؛ گفتار موفق ثبت شد.'}
                </Text>
              </View>
            ) : null}
            {!spoken && spokenScore !== null ? (
              <Text style={styles.hintWarm}>
                راهنمایی: {firstArabicHint(word)} · آهسته‌تر بگو یا این واژه را بعداً تمرین کن.
              </Text>
            ) : null}
            {!!error && <Text style={styles.hintError}>{error}</Text>}
            {!!voiceError && <Text style={styles.hintWarm}>{voiceError}</Text>}
            <Pressable
              accessibilityRole="button"
              onPress={() => setPhase('rate')}
              style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
            >
              <Text style={styles.primaryText}>{spoken ? 'ادامه' : 'بعداً تمرین می‌کنم'}</Text>
              <ChevronLeft size={15} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : null}

        {phase === 'rate' && word ? (
          <View style={styles.wordCard}>
            <Text style={styles.stepLabel}>مرور</Text>
            <Text style={styles.title}>این واژه چطور بود؟</Text>
            <Text keepColor style={styles.bigWordSmall}>
              {word.target}
            </Text>
            <Text style={styles.wordFa}>{word.fa}</Text>
            {word.root ? <Text style={styles.note}>ریشه: {word.root}</Text> : null}
            {hasArabicSentence(word) ? (
              <Text keepColor style={styles.exampleTarget}>
                {word.exampleTarget}
              </Text>
            ) : null}
            <Text style={styles.smallText}>چرا الان؟ {wordReason(progress?.cards[word.id])}</Text>
            <ReviewRatingGrid saving={saving} score={spokenScore} onRate={rating => void rate(rating)} />
            {!spoken ? (
              <Text style={styles.smallText}>
                بدون گفتار موفق، «تسلط گفتاری» ثبت نمی‌شود؛ کارت زودتر برمی‌گردد.
              </Text>
            ) : null}
          </View>
        ) : null}

        {phase === 'done' ? (
          <View style={styles.centerCard}>
            <View style={[styles.bigIcon, { backgroundColor: C.successSoft }]}>
              <Check size={30} color={C.success} />
            </View>
            <Text style={styles.title}>{queue.length ? 'تمرین امروز تمام شد' : 'برای امروز چیزی نمانده'}</Text>
            <Text style={styles.bodyText}>
              {queue.length
                ? `${fa(sessionInfo.newCount)} واژهٔ تازه و ${fa(sessionInfo.dueCount)} مرور انجام شد.`
                : 'همهٔ مرورهای امروز انجام شده‌اند؛ فردا دوباره سر بزن.'}
            </Text>
            {stats ? (
              <Text style={styles.smallText}>
                معرفی‌شده: {fa(stats.introduced)} از {fa(stats.total)} · مسلط گفتاری: {fa(stats.mastered)} · سررسید:{' '}
                {fa(stats.due)}
              </Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={() => setReloadToken(value => value + 1)}
              style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
            >
              <RefreshCw size={15} color="#FFFFFF" />
              <Text style={styles.primaryText}>یک دور دیگر</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace(home as never)}
              style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
            >
              <Text style={styles.ghostText}>بازگشت به خانه</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
      {phase === 'loading' || phase === 'intro' || phase === 'done' ? <ArabicBottomNav /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  back: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  headerCopy: { flex: 1, alignItems: 'flex-end', gap: 2 },
  headerTitle: { fontFamily: Typography.fontFamily, fontSize: 17, color: C.ink, textAlign: 'right', writingDirection: 'rtl' },
  headerSub: { fontFamily: Typography.fontFamily, fontSize: 10, color: C.muted, textAlign: 'right', writingDirection: 'rtl' },
  scroll: { flex: 1 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 16, paddingBottom: 32, gap: 12 },
  centerCard: {
    width: '100%',
    borderRadius: 22,
    padding: 22,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    gap: 12,
  },
  wordCard: {
    width: '100%',
    borderRadius: 22,
    padding: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  bigIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: Typography.fontFamily, fontSize: 20, color: C.ink, textAlign: 'right', writingDirection: 'rtl' },
  bodyText: { fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 22, color: C.text, textAlign: 'right', writingDirection: 'rtl' },
  smallText: { fontFamily: Typography.fontFamily, fontSize: 11, lineHeight: 18, color: C.muted, textAlign: 'right', writingDirection: 'rtl' },
  stepLabel: { fontFamily: Typography.fontFamily, fontSize: 11, color: C.primaryDark, textAlign: 'right', writingDirection: 'rtl' },
  stepList: { width: '100%', gap: 6 },
  stepLine: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 20, color: C.text, textAlign: 'right', writingDirection: 'rtl' },
  bigWord: { fontFamily: Typography.boldFontFamily, fontSize: 36, lineHeight: 54, color: C.ink, textAlign: 'center', writingDirection: 'rtl' },
  bigWordSmall: { fontFamily: Typography.boldFontFamily, fontSize: 28, lineHeight: 42, color: C.ink, textAlign: 'center', writingDirection: 'rtl' },
  sentenceBox: { width: '100%', gap: 6, padding: 14, borderRadius: 16, backgroundColor: C.primarySoft },
  sentenceTarget: { fontFamily: Typography.boldFontFamily, fontSize: 22, lineHeight: 36, color: C.ink, textAlign: 'center', writingDirection: 'rtl' },
  sentenceFa: { fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 22, color: C.text, textAlign: 'center', writingDirection: 'rtl' },
  sentencePronunciation: { fontFamily: Typography.fontFamily, fontSize: 11, lineHeight: 20, color: C.muted, textAlign: 'center', writingDirection: 'rtl' },
  wordChip: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' },
  wordChipTarget: { fontFamily: Typography.boldFontFamily, fontSize: 17, color: C.primaryDark, writingDirection: 'rtl' },
  wordChipFa: { fontFamily: Typography.fontFamily, fontSize: 12, color: C.muted, writingDirection: 'rtl' },
  reverseWord: { fontFamily: Typography.fontFamily, fontSize: 12, color: C.primaryDark, textAlign: 'center', writingDirection: 'rtl' },
  wordFa: { fontFamily: Typography.fontFamily, fontSize: 17, color: C.text, textAlign: 'center', writingDirection: 'rtl' },
  autoBox: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 7, padding: 10, borderRadius: 12, backgroundColor: C.primarySoft },
  autoText: { fontFamily: Typography.fontFamily, fontSize: 11, color: C.primaryDark, writingDirection: 'rtl', textAlign: 'right' },
  exampleBox: { width: '100%', gap: 4, padding: 12, borderRadius: 14, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  exampleTarget: { fontFamily: Typography.boldFontFamily, fontSize: 17, lineHeight: 28, color: C.ink, textAlign: 'center', writingDirection: 'rtl' },
  exampleFa: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 20, color: C.muted, textAlign: 'center', writingDirection: 'rtl' },
  rowButtons: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  grow: { flex: 1 },
  primary: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 46, paddingHorizontal: 18, borderRadius: 14, backgroundColor: C.primary },
  primaryText: { fontFamily: Typography.fontFamily, fontSize: 13, color: '#FFFFFF', writingDirection: 'rtl' },
  ghostButton: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 46, paddingHorizontal: 14, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  ghostText: { fontFamily: Typography.fontFamily, fontSize: 12, color: C.text, writingDirection: 'rtl' },
  pressed: { opacity: 0.82 },
  note: { fontFamily: Typography.fontFamily, fontSize: 11, lineHeight: 19, color: C.warning, textAlign: 'center', writingDirection: 'rtl' },
  hintError: { fontFamily: Typography.fontFamily, fontSize: 11, color: C.danger, textAlign: 'right', writingDirection: 'rtl' },
  hintWarm: { fontFamily: Typography.fontFamily, fontSize: 11, color: C.warning, textAlign: 'right', writingDirection: 'rtl' },
  okBox: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, padding: 9, borderRadius: 12, backgroundColor: C.successSoft },
  okText: { fontFamily: Typography.fontFamily, fontSize: 11, color: C.success, writingDirection: 'rtl' },
  reversePrompt: { width: '100%', padding: 14, borderRadius: 16, backgroundColor: C.primarySoft, gap: 4, alignItems: 'center' },
  reverseLabel: { fontFamily: Typography.fontFamily, fontSize: 10, color: C.primaryDark, writingDirection: 'rtl' },
  reverseFa: { fontFamily: Typography.fontFamily, fontSize: 22, lineHeight: 34, color: C.ink, textAlign: 'center', writingDirection: 'rtl' },
});
