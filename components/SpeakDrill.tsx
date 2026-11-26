import { LocalizedText as Text } from '@/components/LocalizedText';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AlertCircle, CheckCircle2, ChevronLeft, Flame, Sparkles, Trophy, Volume2 } from 'lucide-react-native';
import SpeakCheck, { type SpeakCheckResult } from '@/components/SpeakCheck';
import { toPersianDigits as fa } from '@/lib/format';
import { Typography } from '@/lib/theme';
import { EnglishPalette as Palette } from '@/components/EnglishSupplementTask';

type Item = { id: string; text: string; fa?: string };
export type ItemAttemptSummary = {
  attemptScores: number[];
  mistakes: number;
  missedWords: string[];
  passed: boolean;
  effectiveScore: number;
};
export type SpeakDrillResult = {
  points?: number;
  average: number;
  scores: Record<string, number>;
  mistakes?: number;
  attempts?: Record<string, ItemAttemptSummary>;
};
type Props = {
  items: Item[];
  locale: string;
  accent?: string;
  onSpeak?: (text: string, onDone?: () => void) => void;
  /** Called once when the learner reaches the result page. */
  onFinish?: (result: SpeakDrillResult) => void;
};

const PASS_THRESHOLD = 70;
const AUTO_ADVANCE_MS = 950;

function computeEffectiveScore(attemptScores: readonly number[], mistakes: number): number {
  if (!attemptScores.length) return 0;
  const mean = Math.round(attemptScores.reduce((sum, value) => sum + value, 0) / attemptScores.length);
  if (mistakes > 0 || attemptScores.some(score => score < 100)) {
    return Math.min(99, mean);
  }
  return mean;
}

/**
 * «آزمون گفتاری» — a speaking checkpoint shared across all 6 languages:
 * for each item, the device speaks the target text first, automatically opens the microphone,
 * records every real attempt (including mistakes),
 * and produces a final non-repeatable honest evaluation.
 */
export default function SpeakDrill({ items, locale, accent = Palette.primary, onSpeak, onFinish }: Props) {
  const isRtlLocale = locale.toLowerCase().startsWith('ar');
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [attemptMap, setAttemptMap] = useState<Record<string, ItemAttemptSummary>>({});
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [micReady, setMicReady] = useState(false);
  const [passNotice, setPassNotice] = useState<{ score: number; effectiveScore: number; mistakes: number; gained: number; last: boolean } | null>(null);
  const [done, setDone] = useState(false);

  const itemsKey = useMemo(() => items.map(item => item.id).join('|'), [items]);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const onSpeakRef = useRef(onSpeak);
  onSpeakRef.current = onSpeak;

  const indexRef = useRef(0);
  const scoresRef = useRef<Record<string, number>>({});
  const attemptsRef = useRef<Record<string, ItemAttemptSummary>>({});
  const pointsRef = useRef(0);
  const streakRef = useRef(0);
  const awardedIdsRef = useRef<Set<string>>(new Set());
  const lockedIdsRef = useRef<Set<string>>(new Set());
  const doneRef = useRef(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speakFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speakTokenRef = useRef(0);

  const clearPendingAdvance = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  const clearSpeakFallback = useCallback(() => {
    if (speakFallbackRef.current) {
      clearTimeout(speakFallbackRef.current);
      speakFallbackRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    clearPendingAdvance();
    clearSpeakFallback();
    speakTokenRef.current += 1;
  }, [clearPendingAdvance, clearSpeakFallback]);

  const speakAndOpenMic = useCallback((text: string) => {
    clearSpeakFallback();
    const token = ++speakTokenRef.current;
    const openMic = () => {
      if (speakTokenRef.current !== token || doneRef.current) return;
      clearSpeakFallback();
      setMicReady(true);
    };
    const speaker = onSpeakRef.current;
    if (!speaker) {
      setMicReady(true);
      return;
    }
    setMicReady(false);
    const fallbackMs = Math.min(7500, Math.max(2500, text.length * 140));
    speakFallbackRef.current = setTimeout(openMic, fallbackMs);
    speaker(text, openMic);
  }, [clearSpeakFallback]);

  // Key reset only on item IDs (navigating to a different lesson).
  useEffect(() => {
    clearPendingAdvance();
    clearSpeakFallback();
    speakTokenRef.current += 1;
    indexRef.current = 0;
    scoresRef.current = {};
    attemptsRef.current = {};
    streakRef.current = 0;
    awardedIdsRef.current = new Set();
    lockedIdsRef.current = new Set();
    doneRef.current = false;
    setIndex(0);
    setScores({});
    setAttemptMap({});
    pointsRef.current = 0;
    setPoints(0);
    setStreak(0);
    setMicReady(false);
    setPassNotice(null);
    setDone(false);
  }, [itemsKey, clearPendingAdvance, clearSpeakFallback]);

  const computeFinalAverage = useCallback((list: Item[], latestAttempts: Record<string, ItemAttemptSummary>) => {
    if (!list.length) return 0;
    const sum = list.reduce((acc, item) => acc + (latestAttempts[item.id]?.effectiveScore ?? 0), 0);
    const rawAverage = Math.round(sum / list.length);
    const anyMistakeOrSkip = list.some(item => {
      const rec = latestAttempts[item.id];
      return !rec || rec.mistakes > 0 || rec.effectiveScore < 100;
    });
    return anyMistakeOrSkip ? Math.min(99, rawAverage) : rawAverage;
  }, []);

  const completeQuiz = useCallback((latestScores: Record<string, number>, latestAttempts: Record<string, ItemAttemptSummary>) => {
    clearPendingAdvance();
    if (doneRef.current) return;
    doneRef.current = true;
    const list = itemsRef.current;
    const finalAverage = computeFinalAverage(list, latestAttempts);
    const totalMistakes = list.reduce((acc, item) => acc + (latestAttempts[item.id]?.mistakes ?? 0), 0);
    setPassNotice(null);
    setDone(true);
    const anyAttempt = list.some(item => (latestAttempts[item.id]?.attemptScores.length ?? 0) > 0);
    if (anyAttempt) {
      onFinishRef.current?.({
        average: finalAverage,
        scores: { ...latestScores },
        points: pointsRef.current,
        mistakes: totalMistakes,
        attempts: { ...latestAttempts },
      });
    }
  }, [clearPendingAdvance, computeFinalAverage]);

  const advanceFrom = useCallback((fromIndex: number, latestScores: Record<string, number>, latestAttempts: Record<string, ItemAttemptSummary>) => {
    clearPendingAdvance();
    if (doneRef.current || indexRef.current !== fromIndex) return;
    const list = itemsRef.current;
    if (fromIndex < list.length - 1) {
      const nextIndex = fromIndex + 1;
      indexRef.current = nextIndex;
      setPassNotice(null);
      setIndex(nextIndex);
      return;
    }
    completeQuiz(latestScores, latestAttempts);
  }, [clearPendingAdvance, completeQuiz]);

  const onResult = useCallback((result: SpeakCheckResult) => {
    const activeIndex = indexRef.current;
    const list = itemsRef.current;
    const activeItem = list[activeIndex];
    if (!result.heard.trim() || !activeItem || doneRef.current || lockedIdsRef.current.has(activeItem.id)) return;

    const prevRecord = attemptsRef.current[activeItem.id] ?? {
      attemptScores: [],
      mistakes: 0,
      missedWords: [],
      passed: false,
      effectiveScore: 0,
    };

    const isPass = result.score >= PASS_THRESHOLD;
    const nextAttemptScores = [...prevRecord.attemptScores, result.score];
    const nextMistakes = prevRecord.mistakes + (isPass ? 0 : 1);
    const newMissed = result.words.filter(w => !w.ok).map(w => w.word);
    const mergedMissed = [...new Set([...prevRecord.missedWords, ...newMissed])];
    const effectiveScore = computeEffectiveScore(nextAttemptScores, nextMistakes);

    const nextRecord: ItemAttemptSummary = {
      attemptScores: nextAttemptScores,
      mistakes: nextMistakes,
      missedWords: mergedMissed,
      passed: prevRecord.passed || isPass,
      effectiveScore,
    };

    const updatedAttempts = { ...attemptsRef.current, [activeItem.id]: nextRecord };
    attemptsRef.current = updatedAttempts;
    setAttemptMap(updatedAttempts);

    const updatedScores = { ...scoresRef.current, [activeItem.id]: effectiveScore };
    scoresRef.current = updatedScores;
    setScores(updatedScores);

    clearPendingAdvance();

    if (isPass) {
      lockedIdsRef.current.add(activeItem.id);
      let gained = 0;
      if (!awardedIdsRef.current.has(activeItem.id)) {
        awardedIdsRef.current.add(activeItem.id);
        if (nextMistakes === 0) {
          const nextStreak = streakRef.current + 1;
          streakRef.current = nextStreak;
          setStreak(nextStreak);
          const base = result.score >= 95 ? 15 : result.score >= 85 ? 12 : 10;
          const bonus = nextStreak >= 2 ? 5 : 0;
          gained = base + bonus;
        } else {
          streakRef.current = 0;
          setStreak(0);
          gained = Math.max(3, Math.round(effectiveScore / 15));
        }
        pointsRef.current += gained;
        setPoints(pointsRef.current);
      }

      if (Platform.OS !== 'web') {
        try { void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); } catch { /* ignore */ }
      }

      const isLast = activeIndex >= list.length - 1;
      setPassNotice({ score: result.score, effectiveScore, mistakes: nextMistakes, gained, last: isLast });
      advanceTimerRef.current = setTimeout(() => {
        advanceFrom(activeIndex, scoresRef.current, attemptsRef.current);
      }, AUTO_ADVANCE_MS);
    } else {
      streakRef.current = 0;
      setStreak(0);
      setPassNotice(null);
    }
  }, [advanceFrom, clearPendingAdvance]);

  const current = items[index];
  const currentRecord = current ? attemptMap[current.id] : undefined;
  const answered = (currentRecord?.attemptScores.length ?? 0) > 0;
  const currentPassed = currentRecord?.passed ?? false;
  const totalMistakes = useMemo(
    () => items.reduce((acc, item) => acc + (attemptMap[item.id]?.mistakes ?? 0), 0),
    [items, attemptMap],
  );
  const firstTryCleanCount = useMemo(
    () => items.filter(item => {
      const rec = attemptMap[item.id];
      return rec && rec.passed && rec.mistakes === 0;
    }).length,
    [items, attemptMap],
  );
  const passedAfterRetryCount = useMemo(
    () => items.filter(item => {
      const rec = attemptMap[item.id];
      return rec && rec.passed && rec.mistakes > 0;
    }).length,
    [items, attemptMap],
  );
  const missedOrSkippedCount = items.length - firstTryCleanCount - passedAfterRetryCount;
  const average = useMemo(() => computeFinalAverage(items, attemptMap), [items, attemptMap, computeFinalAverage]);
  const anyAnswered = useMemo(() => items.some(item => (attemptMap[item.id]?.attemptScores.length ?? 0) > 0), [items, attemptMap]);

  // Auto-pronounce each item first, then automatically open the microphone right after playback finishes.
  useEffect(() => {
    if (done || !current) return;
    speakAndOpenMic(current.text);
  }, [done, current?.id, current?.text, speakAndOpenMic]);

  if (!items.length) return null;

  const next = () => {
    streakRef.current = 0; setStreak(0);
    advanceFrom(indexRef.current, scoresRef.current, attemptsRef.current);
  };

  if (done) {
    const color = !anyAnswered ? '#B91C1C' : average >= 80 && totalMistakes === 0 ? '#15803D' : average >= 60 ? '#B45309' : '#B91C1C';
    return (
      <View style={styles.card}>
        <View style={styles.headRow}><Trophy size={20} color={accent} /><Text style={styles.title}>ارزیابی نهایی آزمون گفتاری</Text></View>
        <Text keepColor style={[styles.bigScore, { color }]}>{anyAnswered ? `${fa(average)}٪` : '۰٪ (بدون پاسخ)'}</Text>
        <View style={styles.summaryBadges}>
          <View style={styles.pointsBadge}>
            <Sparkles size={14} color="#B45309" />
            <Text keepColor style={styles.pointsBadgeText}>{fa(points)} امتیاز واقعی</Text>
          </View>
          <View style={totalMistakes === 0 && missedOrSkippedCount === 0 ? styles.passedBadge : styles.mistakeBadge}>
            {totalMistakes === 0 && missedOrSkippedCount === 0
              ? <CheckCircle2 size={14} color="#15803D" />
              : <AlertCircle size={14} color="#B91C1C" />}
            <Text keepColor style={totalMistakes === 0 && missedOrSkippedCount === 0 ? styles.passedBadgeText : styles.mistakeBadgeText}>
              {totalMistakes === 0 ? 'بدون خطای تلفظی' : `${fa(totalMistakes)} اشتباه تلفظی ثبت‌شده`}
            </Text>
          </View>
        </View>
        <View style={styles.breakdownGrid}>
          <View style={styles.breakdownCell}>
            <Text keepColor style={[styles.breakdownNum, { color: '#15803D' }]}>{fa(firstTryCleanCount)}</Text>
            <Text style={styles.breakdownLabel}>درست در تلاش اول</Text>
          </View>
          <View style={styles.breakdownCell}>
            <Text keepColor style={[styles.breakdownNum, { color: '#B45309' }]}>{fa(passedAfterRetryCount)}</Text>
            <Text style={styles.breakdownLabel}>اصلاح‌شده با تکرار</Text>
          </View>
          <View style={styles.breakdownCell}>
            <Text keepColor style={[styles.breakdownNum, { color: '#B91C1C' }]}>{fa(missedOrSkippedCount)}</Text>
            <Text style={styles.breakdownLabel}>ناتمام یا ضعیف</Text>
          </View>
        </View>
        <Text style={styles.summary}>
          {!anyAnswered
            ? 'پاسخ گفتاری ثبت نشد.'
            : totalMistakes === 0 && missedOrSkippedCount === 0
              ? 'تمام موارد را بدون اشتباه و در اولین تلاش درست ادا کردید.'
              : 'نمرهٔ نهایی بر اساس همهٔ تلاش‌ها، خطاهای قبلی و موارد ردشده محاسبه شده است تا وضعیت واقعی تلفظ شما مشخص باشد.'}
        </Text>
        <View style={styles.list}>{items.map((item, i) => {
          const rec = attemptMap[item.id];
          const value = rec?.effectiveScore ?? 0;
          const attemptCount = rec?.attemptScores.length ?? 0;
          const itemMistakes = rec?.mistakes ?? 0;
          const statusNote = attemptCount === 0
            ? 'پاسخ داده نشد (۰٪)'
            : itemMistakes === 0 && rec?.passed
              ? 'درست در تلاش اول'
              : itemMistakes > 0 && rec?.passed
                ? `${fa(itemMistakes)} اشتباه پیش از پاسخ درست`
                : `${fa(itemMistakes)} تلاش ناموفق`;
          return (
            <View key={item.id} style={styles.listRowBlock}>
              <View style={styles.listRow}>
                <Text keepColor style={[styles.listScore, { color: attemptCount === 0 ? '#B91C1C' : value >= PASS_THRESHOLD && itemMistakes === 0 ? '#15803D' : value >= 50 ? '#B45309' : '#B91C1C' }]}>
                  {attemptCount === 0 ? '۰٪' : `${fa(value)}٪`}
                </Text>
                <View style={styles.listTextCol}>
                  <Text style={[styles.listText, isRtlLocale && styles.rtlListText]} numberOfLines={2}>{fa(i + 1)}. {item.text}</Text>
                  <Text style={styles.listSubNote}>{statusNote}</Text>
                </View>
              </View>
              {rec && rec.missedWords.length > 0 ? (
                <Text style={styles.missedWordsLine}>واژه‌های دارای خطا: {rec.missedWords.join(' · ')}</Text>
              ) : null}
            </View>
          );
        })}</View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.progressRow}>{items.map((item, i) => {
        const rec = attemptMap[item.id];
        const itemPassed = rec?.passed ?? false;
        return <View key={item.id} style={[styles.segment, (i < index || itemPassed) && styles.segmentDone, i === index && { backgroundColor: accent }]} />;
      })}</View>
      <View style={styles.statsRow}>
        <Text style={styles.counter}>{fa(index + 1)} / {fa(items.length)}</Text>
        <View style={styles.statsPills}>
          <View style={styles.pointsPill}>
            <Sparkles size={12} color="#B45309" />
            <Text keepColor style={styles.pointsPillText}>{fa(points)} امتیاز</Text>
          </View>
          {totalMistakes > 0 ? (
            <View style={styles.mistakePill}>
              <AlertCircle size={12} color="#B91C1C" />
              <Text keepColor style={styles.mistakePillText}>{fa(totalMistakes)} خطا</Text>
            </View>
          ) : null}
          {streak >= 2 ? (
            <View style={styles.streakPill}>
              <Flame size={12} color="#C2410C" />
              <Text keepColor style={styles.streakPillText}>{fa(streak)}× پیاپی</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Text style={[styles.sentence, isRtlLocale && styles.rtlSentence]}>{current.text}</Text>
      {current.fa ? <Text keepColor style={styles.persian}>{current.fa}</Text> : null}
      {onSpeak ? <Pressable accessibilityRole="button" accessibilityLabel="شنیدن نمونه" style={styles.listen} onPress={() => speakAndOpenMic(current.text)}><Volume2 size={16} color={accent} /><Text keepColor style={[styles.listenText, { color: accent }]}>شنیدن نمونه</Text></Pressable> : null}
      <SpeakCheck key={current.id} text={current.text} locale={locale} accent={accent} title="بگو" autoStart={micReady && !passNotice} onResult={onResult} />
      {passNotice ? (
        <View style={styles.passBanner}>
          <CheckCircle2 size={16} color="#15803D" />
          <Text keepColor style={styles.passBannerText}>
            {passNotice.mistakes > 0
              ? `تلفظ تأیید شد · نمرهٔ واقعی با احتساب ${fa(passNotice.mistakes)} خطا: ${fa(passNotice.effectiveScore)}٪ · +${fa(passNotice.gained)} امتیاز`
              : `عالی! ${fa(passNotice.score)}٪${passNotice.gained > 0 ? ` · +${fa(passNotice.gained)} امتیاز` : ''} · ${passNotice.last ? 'ثبت نتیجه…' : 'انتقال خودکار به مورد بعدی…'}`}
          </Text>
        </View>
      ) : answered && !currentPassed ? (
        <Text style={styles.retryHint}>
          خطای تلفظ ثبت شد ({fa(currentRecord?.mistakes ?? 1)} خطا؛ این خطا در نمرهٔ نهایی لحاظ می‌شود). دوباره بگو یا رد شو.
        </Text>
      ) : null}
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" style={[styles.button, { backgroundColor: answered ? accent : '#D97706' }]} onPress={next}><Text keepColor style={styles.buttonText}>{index < items.length - 1 ? (answered ? 'جملهٔ بعدی' : 'رد کردن') : 'پایان آزمون'}</Text><ChevronLeft size={17} color="#FFFFFF" /></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', marginTop: 18, padding: 18, borderRadius: 22, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border, gap: 10, alignItems: 'center', shadowColor: '#172033', shadowOpacity: .04, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  headRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  title: { fontFamily: Typography.fontFamily, fontSize: 15, color: Palette.ink, writingDirection: 'rtl' },
  summary: { fontFamily: Typography.fontFamily, fontSize: 12.5, lineHeight: 20, color: Palette.text, textAlign: 'center', writingDirection: 'rtl' },
  summaryBadges: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  pointsBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A' },
  pointsBadgeText: { fontFamily: Typography.fontFamily, fontSize: 12, fontWeight: '700', color: '#92400E', writingDirection: 'rtl' },
  passedBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#BBF7D0' },
  passedBadgeText: { fontFamily: Typography.fontFamily, fontSize: 12, fontWeight: '700', color: '#166534', writingDirection: 'rtl' },
  mistakeBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FECACA' },
  mistakeBadgeText: { fontFamily: Typography.fontFamily, fontSize: 12, fontWeight: '700', color: '#991B1B', writingDirection: 'rtl' },
  breakdownGrid: { width: '100%', flexDirection: 'row-reverse', gap: 8 },
  breakdownCell: { flex: 1, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: Palette.border, paddingVertical: 8, paddingHorizontal: 6, alignItems: 'center', gap: 2 },
  breakdownNum: { fontFamily: Typography.boldFontFamily, fontSize: 18, fontWeight: '800' },
  breakdownLabel: { fontFamily: Typography.fontFamily, fontSize: 10.5, color: Palette.muted, textAlign: 'center', writingDirection: 'rtl' },
  progressRow: { flexDirection: 'row', gap: 4, width: '100%', marginTop: 2 },
  segment: { flex: 1, height: 5, borderRadius: 3, backgroundColor: Palette.border },
  segmentDone: { backgroundColor: '#86EFAC' },
  statsRow: { width: '100%', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  statsPills: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  pointsPill: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: '#FEF3C7' },
  pointsPillText: { fontFamily: Typography.fontFamily, fontSize: 11, fontWeight: '700', color: '#92400E', writingDirection: 'rtl' },
  mistakePill: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: '#FEE2E2' },
  mistakePillText: { fontFamily: Typography.fontFamily, fontSize: 11, fontWeight: '700', color: '#991B1B', writingDirection: 'rtl' },
  streakPill: { flexDirection: 'row-reverse', alignItems: 'center', gap: 3, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: '#FFEDD5' },
  streakPillText: { fontFamily: Typography.fontFamily, fontSize: 11, fontWeight: '700', color: '#C2410C', writingDirection: 'rtl' },
  counter: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.muted, writingDirection: 'rtl' },
  sentence: { fontFamily: Typography.latinFontFamily, fontSize: 21, fontWeight: '800', color: Palette.ink, textAlign: 'center', lineHeight: 32, writingDirection: 'ltr' },
  rtlSentence: { fontFamily: Typography.boldFontFamily, writingDirection: 'rtl' },
  persian: { fontFamily: Typography.fontFamily, fontSize: 13, color: Palette.muted, textAlign: 'center', writingDirection: 'rtl' },
  listen: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: Palette.primarySoft },
  listenText: { fontFamily: Typography.fontFamily, fontSize: 12, writingDirection: 'rtl' },
  passBanner: { width: '100%', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#86EFAC' },
  passBannerText: { fontFamily: Typography.fontFamily, fontSize: 12, fontWeight: '700', color: '#166534', textAlign: 'center', writingDirection: 'rtl' },
  retryHint: { fontFamily: Typography.fontFamily, fontSize: 11.5, lineHeight: 18, color: '#991B1B', textAlign: 'center', writingDirection: 'rtl' },
  actions: { width: '100%', alignItems: 'center', marginTop: 2 },
  button: { minHeight: 48, flexDirection: 'row-reverse', alignItems: 'center', gap: 7, paddingHorizontal: 22, borderRadius: 999 },
  buttonText: { fontFamily: Typography.fontFamily, color: '#FFFFFF', fontSize: 13, writingDirection: 'rtl' },
  bigScore: { fontSize: 38, fontWeight: '900' },
  list: { width: '100%', gap: 6 },
  listRowBlock: { width: '100%', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 3 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  listScore: { width: 48, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  listTextCol: { flex: 1, gap: 2 },
  listText: { fontFamily: Typography.latinFontFamily, fontSize: 14, color: '#334155', writingDirection: 'ltr', textAlign: 'left' },
  rtlListText: { fontFamily: Typography.boldFontFamily, writingDirection: 'rtl', textAlign: 'right' },
  listSubNote: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  missedWordsLine: { fontFamily: Typography.latinFontFamily, fontSize: 11.5, color: '#B91C1C', textAlign: 'right', writingDirection: 'rtl', paddingRight: 4 },
});
