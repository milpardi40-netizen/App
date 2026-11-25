import { LocalizedText as Text } from '@/components/LocalizedText';
import { LearningHomeColors as HomeColors } from '@/components/LearningHomeStyles';
import type {
  ConversationRoomLevel,
  ConversationRoomPayload,
  ConversationRoomSummary,
} from '@/components/LessonConversationHub';
import SpeakCheck from '@/components/SpeakCheck';
import type { BranchingLocale } from '@/lib/branchingConversation';
import { toPersianDigits } from '@/lib/format';
import type { SpeechLevel } from '@/lib/speechTiming';
import { Colors, Spacing, Typography } from '@/lib/theme';
import { ArrowLeft, CheckCircle2, Eye, RefreshCw, Sparkles, Volume2 } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

type FreeTurn = {
  lessonId: string;
  lessonTitle: string;
  situation: string;
  partnerSpeaker?: string;
  partnerText?: string;
  partnerFa?: string;
  text: string;
  fa: string;
};

const TARGET_TURN_COUNT = 12;

function toSpeechLevel(cefr: string): SpeechLevel {
  if (cefr === 'Pre-A1' || cefr === 'A1' || cefr === 'A2' || cefr === 'B1' || cefr === 'B2' || cefr === 'C1') {
    return cefr;
  }
  return 'A1';
}

function pickLevelTurns(
  summaries: readonly ConversationRoomSummary[],
  buildPayload: (lessonId: string) => ConversationRoomPayload | null,
  round: number,
): FreeTurn[] {
  if (!summaries.length) return [];

  type CandidateItem = {
    partnerSpeaker?: string;
    partnerText?: string;
    partnerFa?: string;
    text: string;
    fa: string;
  };
  const candidates: { summary: ConversationRoomSummary; items: CandidateItem[] }[] = [];
  for (const summary of summaries) {
    const payload = buildPayload(summary.id);
    if (!payload) continue;
    const dlg = (payload.dialogue ?? []).filter(
      line => line.text.trim() && (line.fa ?? '').trim(),
    );
    const learnerPairs: CandidateItem[] = [];
    for (let idx = 0; idx < dlg.length; idx++) {
      const line = dlg[idx];
      if (line.role !== 'learner') continue;
      const prev = idx > 0 ? dlg[idx - 1] : undefined;
      const partner = prev && prev.role !== 'learner' ? prev : undefined;
      learnerPairs.push({
        partnerSpeaker: partner?.speaker,
        partnerText: partner?.text.trim(),
        partnerFa: partner?.fa?.trim(),
        text: line.text.trim(),
        fa: (line.fa ?? '').trim(),
      });
    }
    const anyDialogueLines = dlg.map(line => ({
      text: line.text.trim(),
      fa: (line.fa ?? '').trim(),
    }));
    const fallbackLines = (payload.fallback ?? [])
      .filter(line => line.text.trim() && line.fa.trim())
      .map(line => ({ text: line.text.trim(), fa: line.fa.trim() }));

    const source: CandidateItem[] = learnerPairs.length
      ? learnerPairs
      : anyDialogueLines.length
        ? anyDialogueLines
        : fallbackLines;

    if (source.length) candidates.push({ summary, items: source });
  }

  if (!candidates.length) return [];

  const desiredCount = Math.min(TARGET_TURN_COUNT, candidates.length);
  const picked: FreeTurn[] = [];
  const usedKeys = new Set<string>();

  for (let slot = 0; slot < desiredCount; slot++) {
    const baseIndex = Math.floor((slot * candidates.length) / desiredCount);
    const shiftedIndex = (baseIndex + round * 3 + slot * round) % candidates.length;
    const entry = candidates[shiftedIndex];
    const item = entry.items[(round + slot) % entry.items.length];
    const key = `${entry.summary.id}:${item.text}`;
    if (!usedKeys.has(key)) {
      usedKeys.add(key);
      picked.push({
        lessonId: entry.summary.id,
        lessonTitle: entry.summary.title,
        situation: entry.summary.situation || entry.summary.subtitle || '',
        partnerSpeaker: item.partnerSpeaker,
        partnerText: item.partnerText,
        partnerFa: item.partnerFa,
        text: item.text,
        fa: item.fa,
      });
    }
  }

  // If a level has fewer than 10 lessons (or deduplication skipped any), top up from remaining items up to 10–12 turns.
  if (picked.length < Math.min(TARGET_TURN_COUNT, candidates.reduce((sum, c) => sum + c.items.length, 0))) {
    for (let pass = 0; pass < 4 && picked.length < TARGET_TURN_COUNT; pass++) {
      for (let i = 0; i < candidates.length && picked.length < TARGET_TURN_COUNT; i++) {
        const entry = candidates[(i + round) % candidates.length];
        const item = entry.items[(pass + round) % entry.items.length];
        const key = `${entry.summary.id}:${item.text}`;
        if (usedKeys.has(key)) continue;
        usedKeys.add(key);
        picked.push({
          lessonId: entry.summary.id,
          lessonTitle: entry.summary.title,
          situation: entry.summary.situation || entry.summary.subtitle || '',
          partnerSpeaker: item.partnerSpeaker,
          partnerText: item.partnerText,
          partnerFa: item.partnerFa,
          text: item.text,
          fa: item.fa,
        });
      }
    }
  }

  return picked;
}

type Props = {
  courseId: string;
  languageName: string;
  locale: BranchingLocale;
  level: ConversationRoomLevel;
  summaries: readonly ConversationRoomSummary[];
  buildPayload: (lessonId: string) => ConversationRoomPayload | null;
  onSpeak: (text: string, onDone: () => void) => void;
  onStop: () => void;
  onBack: () => void;
};

export default function LevelFreeConversationRoom({
  courseId,
  languageName,
  locale,
  level,
  summaries,
  buildPayload,
  onSpeak,
  onStop,
  onBack,
}: Props) {
  const [round, setRound] = useState(0);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [spokenTurns, setSpokenTurns] = useState<Record<number, boolean>>({});
  const [lastHeard, setLastHeard] = useState('');

  const turns = useMemo(
    () => pickLevelTurns(summaries, buildPayload, round),
    [summaries, buildPayload, round],
  );

  useEffect(() => {
    setIndex(0);
    setRevealed(false);
    setSpokenTurns({});
    setLastHeard('');
    onStop();
  }, [level.id, round, onStop]);

  useEffect(() => () => onStop(), [onStop]);

  const current = index < turns.length ? turns[index] : undefined;
  const completed = turns.length > 0 && index >= turns.length;
  const spokenCount = Object.values(spokenTurns).filter(Boolean).length;
  const isArabic = courseId === 'ar';

  const handleRemix = useCallback(() => {
    onStop();
    setRound(prev => prev + 1);
  }, [onStop]);

  const handleSpeakPartner = useCallback(() => {
    if (!current?.partnerText) return;
    onSpeak(current.partnerText, () => undefined);
  }, [current, onSpeak]);

  const handleRevealAndSpeak = useCallback(() => {
    if (!current) return;
    setRevealed(true);
    onSpeak(current.text, () => undefined);
  }, [current, onSpeak]);

  const handleNext = useCallback(() => {
    onStop();
    setRevealed(false);
    setLastHeard('');
    setIndex(prev => prev + 1);
  }, [onStop]);

  if (!turns.length) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>برای این سطح جمله‌ای آماده نشده است.</Text>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>بازگشت به فهرست سطح</Text>
        </Pressable>
      </View>
    );
  }

  if (completed) {
    return (
      <View style={styles.card}>
        <View style={[styles.doneIcon, { backgroundColor: `${level.color}16` }]}>
          <CheckCircle2 size={32} color={level.color} />
        </View>
        <Text style={styles.doneTitle}>گفت‌وگوی آزاد سطح {level.cefr} انجام شد!</Text>
        <Text style={styles.doneBody}>
          {toPersianDigits(turns.length)} موقعیت مختلف از این سطح را مرور کردی
          {spokenCount > 0 ? ` (${toPersianDigits(spokenCount)} مورد با صدای خودت بیان شد)` : ''}.
          بدون نمره و استرس — هر زمان بخواهی می‌توانی با ترکیب جدید دوباره حرف بزنی.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="ترکیب تازه از جمله‌های همین سطح"
          onPress={handleRemix}
          style={({ pressed }) => [styles.primaryButton, { backgroundColor: level.color }, pressed && styles.pressed]}
        >
          <RefreshCw size={16} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>ترکیب تازه</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="بازگشت به فهرست سطح"
          onPress={onBack}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryButtonText}>بازگشت به فهرست {level.cefr}</Text>
        </Pressable>
      </View>
    );
  }

  if (!current) return null;

  const progressRatio = Math.round(((index + 1) / turns.length) * 100);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <Sparkles size={16} color={level.color} />
            <Text style={styles.headerTitle}>گفت‌وگوی آزاد پایان سطح · {level.cefr}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="ترکیب تازه"
            onPress={handleRemix}
            style={({ pressed }) => [styles.remixChip, pressed && styles.pressed]}
          >
            <RefreshCw size={13} color={HomeColors.ink} />
            <Text style={styles.remixChipText}>ترکیب تازه</Text>
          </Pressable>
        </View>
        <Text style={styles.progressLabel}>
          نوبت {toPersianDigits(index + 1)} از {toPersianDigits(turns.length)} · تمرین شبیه‌سازی‌شده (بدون نمره)
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressRatio}%`, backgroundColor: level.color }]} />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.contextBox}>
          <Text style={styles.contextLesson}>{current.lessonTitle}</Text>
          {!!current.situation && <Text style={styles.contextSituation}>{current.situation}</Text>}
        </View>

        {current.partnerText ? (
          <View style={styles.partnerBubble}>
            <View style={styles.partnerHeaderRow}>
              <Text style={styles.partnerName}>
                {current.partnerSpeaker && current.partnerSpeaker !== 'partner'
                  ? current.partnerSpeaker
                  : 'هم‌صحبت'}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="شنیدن پرسش هم‌صحبت"
                onPress={handleSpeakPartner}
                style={({ pressed }) => [styles.partnerSpeakBtn, pressed && styles.pressed]}
              >
                <Volume2 size={14} color={level.color} />
                <Text style={[styles.partnerSpeakText, { color: level.color }]}>بشنو</Text>
              </Pressable>
            </View>
            <Text style={[styles.partnerTarget, isArabic && styles.revealTargetArabic]}>
              {current.partnerText}
            </Text>
            {!!current.partnerFa && <Text style={styles.partnerFa}>{current.partnerFa}</Text>}
          </View>
        ) : null}

        <Text style={styles.promptLabel}>
          {current.partnerText
            ? `پاسخ خودت به ${languageName} (هدف معنایی):`
            : `این جمله را به ${languageName} بیان کنید:`}
        </Text>
        <Text style={styles.promptFa}>{current.fa}</Text>

        {revealed ? (
          <View style={styles.revealBox}>
            <Text
              style={[
                styles.revealTarget,
                isArabic && styles.revealTargetArabic,
              ]}
            >
              {current.text}
            </Text>
          </View>
        ) : null}

        {!!lastHeard && !revealed ? (
          <View style={styles.heardNote}>
            <Text style={styles.heardNoteText}>صدای شما دریافت شد. برای دیدن متنِ مرجع می‌توانید «راهنما / شنیدن» را بزنید یا به موقعیت بعدی بروید.</Text>
          </View>
        ) : null}

        <SpeakCheck
          key={`${round}:${index}:${current.lessonId}`}
          text={current.text}
          locale={locale}
          accent={level.color}
          level={toSpeechLevel(level.cefr)}
          levelId={level.id}
          adaptiveTiming
          singleAttempt
          blindExam={!revealed}
          title={`با صدای بلند به ${languageName} بگو`}
          onResult={result => {
            if (result.heard.trim()) {
              setSpokenTurns(prev => ({ ...prev, [index]: true }));
              setLastHeard(result.heard.trim());
            }
          }}
        />

        <View style={styles.actionsRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'شنیدن دوبارهٔ راهنما' : 'راهنما و شنیدن جمله'}
            onPress={handleRevealAndSpeak}
            style={({ pressed }) => [styles.hintButton, pressed && styles.pressed]}
          >
            {revealed ? <Volume2 size={16} color={HomeColors.ink} /> : <Eye size={16} color={HomeColors.ink} />}
            <Text style={styles.hintButtonText}>{revealed ? 'پخش دوباره' : 'راهنما / شنیدن'}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={index === turns.length - 1 ? 'پایان گفت‌وگو' : 'موقعیت بعدی'}
            onPress={handleNext}
            style={({ pressed }) => [styles.nextButton, { backgroundColor: level.color }, pressed && styles.pressed]}
          >
            <Text style={styles.nextButtonText}>
              {index === turns.length - 1 ? 'پایان' : 'رد شو / بعدی'}
            </Text>
            <ArrowLeft size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  headerCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: HomeColors.surface,
    borderWidth: 1,
    borderColor: HomeColors.border,
    gap: 8,
  },
  headerRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: 14.5,
    lineHeight: 22,
    color: HomeColors.ink,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  remixChip: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F3F1EA',
  },
  remixChipText: {
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    lineHeight: 17,
    color: HomeColors.ink,
  },
  progressLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    color: HomeColors.muted,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#EAE6DC',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  card: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: HomeColors.surface,
    borderWidth: 1,
    borderColor: HomeColors.border,
    gap: 12,
  },
  contextBox: {
    padding: 11,
    borderRadius: 13,
    backgroundColor: '#F6F4ED',
    gap: 3,
  },
  contextLesson: {
    fontFamily: Typography.fontFamily,
    fontSize: 13,
    lineHeight: 20,
    color: HomeColors.ink,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  contextSituation: {
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    color: HomeColors.muted,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  partnerBubble: {
    padding: 13,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E0D6',
    gap: 6,
  },
  partnerHeaderRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  partnerName: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 12,
    lineHeight: 18,
    color: HomeColors.muted,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  partnerSpeakBtn: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F6F4ED',
    borderWidth: 1,
    borderColor: '#E2E0D6',
  },
  partnerSpeakText: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 11.5,
    lineHeight: 16,
  },
  partnerTarget: {
    fontFamily: Typography.latinFontFamily,
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '700',
    color: HomeColors.ink,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  partnerFa: {
    fontFamily: Typography.fontFamily,
    fontSize: 13,
    lineHeight: 20,
    color: HomeColors.muted,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  promptLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: 12.5,
    lineHeight: 19,
    color: HomeColors.muted,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  promptFa: {
    fontFamily: Typography.fontFamily,
    fontSize: 20,
    lineHeight: 32,
    color: HomeColors.ink,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  revealBox: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  revealTarget: {
    fontFamily: Typography.latinFontFamily,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '700',
    color: Colors.primary[800],
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  revealTargetArabic: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  heardNote: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 11,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  heardNoteText: {
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    color: '#065F46',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  actionsRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  hintButton: {
    flex: 1,
    minHeight: 46,
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 13,
    backgroundColor: '#F3F1EA',
    borderWidth: 1,
    borderColor: HomeColors.border,
  },
  hintButtonText: {
    fontFamily: Typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
    color: HomeColors.ink,
  },
  nextButton: {
    flex: 1,
    minHeight: 46,
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 13,
  },
  nextButtonText: {
    fontFamily: Typography.fontFamily,
    fontSize: 13.5,
    lineHeight: 20,
    color: '#FFFFFF',
  },
  doneIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: 19,
    lineHeight: 28,
    color: HomeColors.ink,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  doneBody: {
    fontFamily: Typography.fontFamily,
    fontSize: 13.5,
    lineHeight: 22,
    color: HomeColors.muted,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 14,
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    fontFamily: Typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: HomeColors.border,
    backgroundColor: '#F6F4ED',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontFamily: Typography.fontFamily,
    fontSize: 13.5,
    lineHeight: 20,
    color: HomeColors.ink,
  },
  emptyText: {
    fontFamily: Typography.fontFamily,
    fontSize: 13.5,
    color: HomeColors.muted,
    textAlign: 'center',
  },
  pressed: { opacity: 0.85 },
});
