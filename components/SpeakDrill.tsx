import { LocalizedText as Text } from '@/components/LocalizedText';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CheckCircle2, ChevronLeft, Flame, RotateCcw, Sparkles, Trophy, Volume2 } from 'lucide-react-native';
import SpeakCheck, { type SpeakCheckResult } from '@/components/SpeakCheck';
import { toPersianDigits as fa } from '@/lib/format';
import { Typography } from '@/lib/theme';
import { EnglishPalette as Palette } from '@/components/EnglishSupplementTask';

type Item = { id: string; text: string; fa?: string };
export type SpeakDrillResult = { average: number; scores: Record<string, number> };
type Props = { items: Item[]; locale: string; accent?: string; onSpeak?: (text: string) => void; /** Called once when the learner reaches the result page. */ onFinish?: (result: SpeakDrillResult) => void };

const PASS_THRESHOLD = 85;
const AUTO_ADVANCE_MS = 1100;

/**
 * «آزمون گفتاری» — a speaking checkpoint shared across all 6 languages:
 * the learner says every sentence of the lesson one by one, earns points and streak bonuses
 * when pronouncing accurately (≥ 85%), automatically advances to the next item on pass, and
 * sees a full score + points summary at the end.
 */
export default function SpeakDrill({ items, locale, accent = Palette.primary, onSpeak, onFinish }: Props) {
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [passNotice, setPassNotice] = useState<{ score: number; gained: number; last: boolean } | null>(null);
  const [done, setDone] = useState(false);

  const indexRef = useRef(0);
  const scoresRef = useRef<Record<string, number>>({});
  const streakRef = useRef(0);
  const awardedIdsRef = useRef<Set<string>>(new Set());
  const doneRef = useRef(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingAdvance = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearPendingAdvance(), [clearPendingAdvance]);

  useEffect(() => {
    clearPendingAdvance();
    indexRef.current = 0;
    scoresRef.current = {};
    streakRef.current = 0;
    awardedIdsRef.current = new Set();
    doneRef.current = false;
    setIndex(0);
    setScores({});
    setPoints(0);
    setStreak(0);
    setPassNotice(null);
    setDone(false);
  }, [items, clearPendingAdvance]);

  const current = items[index];
  const currentScore = current ? scores[current.id] : undefined;
  const answered = currentScore !== undefined;
  const passedCount = useMemo(
    () => items.filter(item => (scores[item.id] ?? 0) >= PASS_THRESHOLD).length,
    [items, scores],
  );
  const average = useMemo(() => {
    const values = items.map(item => scores[item.id]).filter((value): value is number => value !== undefined);
    return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
  }, [items, scores]);

  if (!items.length) return null;

  const completeQuiz = (latestScores: Record<string, number>) => {
    clearPendingAdvance();
    if (doneRef.current) return;
    doneRef.current = true;
    const filled: Record<string, number> = {};
    for (const item of items) filled[item.id] = latestScores[item.id] ?? 0;
    const values = items.map(item => latestScores[item.id]).filter((value): value is number => value !== undefined);
    const finalAverage = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
    setPassNotice(null);
    setDone(true);
    onFinish?.({ average: finalAverage, scores: filled });
  };

  const advanceFrom = (fromIndex: number, latestScores: Record<string, number>) => {
    clearPendingAdvance();
    if (doneRef.current || indexRef.current !== fromIndex) return;
    if (fromIndex < items.length - 1) {
      const nextIndex = fromIndex + 1;
      indexRef.current = nextIndex;
      setPassNotice(null);
      setIndex(nextIndex);
      return;
    }
    completeQuiz(latestScores);
  };

  const restart = () => {
    clearPendingAdvance();
    indexRef.current = 0;
    scoresRef.current = {};
    streakRef.current = 0;
    awardedIdsRef.current = new Set();
    doneRef.current = false;
    setIndex(0);
    setScores({});
    setPoints(0);
    setStreak(0);
    setPassNotice(null);
    setDone(false);
  };

  const next = () => {
    advanceFrom(indexRef.current, scoresRef.current);
  };

  const onResult = (result: SpeakCheckResult) => {
    const activeIndex = indexRef.current;
    const activeItem = items[activeIndex];
    if (!activeItem || doneRef.current) return;

    const updatedScores = {
      ...scoresRef.current,
      [activeItem.id]: Math.max(scoresRef.current[activeItem.id] ?? 0, result.score),
    };
    scoresRef.current = updatedScores;
    setScores(updatedScores);

    clearPendingAdvance();

    if (result.score >= PASS_THRESHOLD) {
      let gained = 0;
      if (!awardedIdsRef.current.has(activeItem.id)) {
        awardedIdsRef.current.add(activeItem.id);
        const nextStreak = streakRef.current + 1;
        streakRef.current = nextStreak;
        setStreak(nextStreak);
        const base = result.score >= 95 ? 15 : 10;
        const bonus = nextStreak >= 2 ? 5 : 0;
        gained = base + bonus;
        setPoints(prev => prev + gained);
      }

      if (Platform.OS !== 'web') {
        try { void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); } catch { /* ignore */ }
      }

      const isLast = activeIndex >= items.length - 1;
      setPassNotice({ score: result.score, gained, last: isLast });
      advanceTimerRef.current = setTimeout(() => {
        advanceFrom(activeIndex, scoresRef.current);
      }, AUTO_ADVANCE_MS);
    } else {
      streakRef.current = 0;
      setStreak(0);
      setPassNotice(null);
    }
  };

  if (done) {
    const color = average >= PASS_THRESHOLD ? '#15803D' : average >= 60 ? '#B45309' : '#B91C1C';
    return (
      <View style={styles.card}>
        <View style={styles.headRow}><Trophy size={20} color={accent} /><Text style={styles.title}>نتیجهٔ آزمون گفتاری</Text></View>
        <Text keepColor style={[styles.bigScore, { color }]}>{fa(average)}٪</Text>
        <View style={styles.summaryBadges}>
          <View style={styles.pointsBadge}>
            <Sparkles size={14} color="#B45309" />
            <Text keepColor style={styles.pointsBadgeText}>{fa(points)} امتیاز</Text>
          </View>
          <View style={styles.passedBadge}>
            <CheckCircle2 size={14} color="#15803D" />
            <Text keepColor style={styles.passedBadgeText}>{fa(passedCount)} از {fa(items.length)} قبول (≥{fa(PASS_THRESHOLD)}٪)</Text>
          </View>
        </View>
        <Text style={styles.summary}>{average >= PASS_THRESHOLD ? 'روان، دقیق و مسلط!' : average >= 60 ? 'خوب؛ جمله‌های کم‌امتیاز را دوباره بگو.' : 'سایه‌خوانی را یک بار دیگر مرور کن.'}</Text>
        <View style={styles.list}>{items.map((item, i) => {
          const value = scores[item.id] ?? 0;
          return <View key={item.id} style={styles.listRow}><Text keepColor style={[styles.listScore, { color: value >= PASS_THRESHOLD ? '#15803D' : value >= 50 ? '#B45309' : '#B91C1C' }]}>{fa(value)}٪</Text><Text style={styles.listText} numberOfLines={2}>{fa(i + 1)}. {item.text}</Text></View>;
        })}</View>
        <Pressable accessibilityRole="button" style={[styles.button, { backgroundColor: accent }]} onPress={restart}><RotateCcw size={16} color="#FFFFFF" /><Text keepColor style={styles.buttonText}>آزمون دوباره</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.progressRow}>{items.map((item, i) => {
        const itemPassed = (scores[item.id] ?? 0) >= PASS_THRESHOLD;
        return <View key={item.id} style={[styles.segment, (i < index || itemPassed) && styles.segmentDone, i === index && { backgroundColor: accent }]} />;
      })}</View>
      <View style={styles.statsRow}>
        <Text style={styles.counter}>{fa(index + 1)} / {fa(items.length)}</Text>
        <View style={styles.statsPills}>
          <View style={styles.pointsPill}>
            <Sparkles size={12} color="#B45309" />
            <Text keepColor style={styles.pointsPillText}>{fa(points)} امتیاز</Text>
          </View>
          {streak >= 2 ? (
            <View style={styles.streakPill}>
              <Flame size={12} color="#C2410C" />
              <Text keepColor style={styles.streakPillText}>{fa(streak)}× پیاپی</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Text style={styles.sentence}>{current.text}</Text>
      {current.fa ? <Text keepColor style={styles.persian}>{current.fa}</Text> : null}
      {onSpeak ? <Pressable accessibilityRole="button" accessibilityLabel="شنیدن نمونه" style={styles.listen} onPress={() => onSpeak(current.text)}><Volume2 size={16} color={accent} /><Text keepColor style={[styles.listenText, { color: accent }]}>شنیدن نمونه</Text></Pressable> : null}
      <SpeakCheck key={current.id} text={current.text} locale={locale} accent={accent} title="بگو" onResult={onResult} />
      {passNotice ? (
        <View style={styles.passBanner}>
          <CheckCircle2 size={16} color="#15803D" />
          <Text keepColor style={styles.passBannerText}>
            {`عالی! ${fa(passNotice.score)}٪${passNotice.gained > 0 ? ` · +${fa(passNotice.gained)} امتیاز` : ''} · ${passNotice.last ? 'ثبت نتیجه…' : 'انتقال خودکار به مورد بعدی…'}`}
          </Text>
        </View>
      ) : answered && (currentScore ?? 0) < PASS_THRESHOLD ? (
        <Text style={styles.retryHint}>برای امتیاز و انتقال خودکار حداقل {fa(PASS_THRESHOLD)}٪ لازم است؛ دوباره بگو یا رد شو.</Text>
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
  progressRow: { flexDirection: 'row', gap: 4, width: '100%', marginTop: 2 },
  segment: { flex: 1, height: 5, borderRadius: 3, backgroundColor: Palette.border },
  segmentDone: { backgroundColor: '#86EFAC' },
  statsRow: { width: '100%', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  statsPills: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  pointsPill: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: '#FEF3C7' },
  pointsPillText: { fontFamily: Typography.fontFamily, fontSize: 11, fontWeight: '700', color: '#92400E', writingDirection: 'rtl' },
  streakPill: { flexDirection: 'row-reverse', alignItems: 'center', gap: 3, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: '#FFEDD5' },
  streakPillText: { fontFamily: Typography.fontFamily, fontSize: 11, fontWeight: '700', color: '#C2410C', writingDirection: 'rtl' },
  counter: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.muted, writingDirection: 'rtl' },
  sentence: { fontFamily: Typography.latinFontFamily, fontSize: 21, fontWeight: '800', color: Palette.ink, textAlign: 'center', lineHeight: 32, writingDirection: 'ltr' },
  persian: { fontFamily: Typography.fontFamily, fontSize: 13, color: Palette.muted, textAlign: 'center', writingDirection: 'rtl' },
  listen: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: Palette.primarySoft },
  listenText: { fontFamily: Typography.fontFamily, fontSize: 12, writingDirection: 'rtl' },
  passBanner: { width: '100%', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#86EFAC' },
  passBannerText: { fontFamily: Typography.fontFamily, fontSize: 12, fontWeight: '700', color: '#166534', textAlign: 'center', writingDirection: 'rtl' },
  retryHint: { fontFamily: Typography.fontFamily, fontSize: 11.5, lineHeight: 18, color: '#92400E', textAlign: 'center', writingDirection: 'rtl' },
  actions: { width: '100%', alignItems: 'center', marginTop: 2 },
  button: { minHeight: 48, flexDirection: 'row-reverse', alignItems: 'center', gap: 7, paddingHorizontal: 22, borderRadius: 999 },
  buttonText: { fontFamily: Typography.fontFamily, color: '#FFFFFF', fontSize: 13, writingDirection: 'rtl' },
  bigScore: { fontSize: 40, fontWeight: '900' },
  list: { width: '100%', gap: 6 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  listScore: { width: 48, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  listText: { flex: 1, fontFamily: Typography.latinFontFamily, fontSize: 14, color: '#334155', writingDirection: 'ltr', textAlign: 'left' },
});
