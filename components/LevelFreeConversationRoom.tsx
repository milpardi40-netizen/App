import { LocalizedText as Text, LocalizedTextInput as TextInput } from '@/components/LocalizedText';
import { LearningHomeColors as HomeColors } from '@/components/LearningHomeStyles';
import type {
  ConversationRoomLevel,
  ConversationRoomPayload,
  ConversationRoomSummary,
} from '@/components/LessonConversationHub';
import SpeakCheck from '@/components/SpeakCheck';
import type { BranchingLocale } from '@/lib/branchingConversation';
import { hostFor } from '@/lib/conversationHosts';
import { toPersianDigits } from '@/lib/format';
import type { SpeechLevel } from '@/lib/speechTiming';
import { Colors, Typography } from '@/lib/theme';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Keyboard,
  MessageCircle,
  Mic2,
  RefreshCw,
  Send,
  Sparkles,
  Volume2,
} from 'lucide-react-native';
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

type CompletedChatEntry = FreeTurn & {
  learnerReply: string;
  /** True when the reply was actually produced (typed/spoken), not the ready-made sample. */
  produced?: boolean;
};

type FreeMode = 'guided' | 'type' | 'voice';

const TARGET_TURN_COUNT = 10;

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

  // «یک روز با میزبان» — walk the level's lessons IN ORDER (each round starts one scene
  // further), so the free conversation reads as one coherent day, not shuffled snippets.
  for (let slot = 0; slot < desiredCount; slot++) {
    const entry = candidates[(slot + round) % candidates.length];
    const layer = Math.floor(slot / candidates.length);
    const item = entry.items[(layer + round) % entry.items.length];
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
  const isBeginner = level.cefr === 'Pre-A1' || level.cefr === 'A1';
  const [round, setRound] = useState(0);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(isBeginner);
  const [mode, setMode] = useState<FreeMode>(isBeginner ? 'guided' : 'type');
  const [draft, setDraft] = useState('');
  const [transcript, setTranscript] = useState<CompletedChatEntry[]>([]);
  const [spokenTurns, setSpokenTurns] = useState<Record<number, boolean>>({});
  const [lastHeard, setLastHeard] = useState('');

  const turns = useMemo(
    () => pickLevelTurns(summaries, buildPayload, round),
    [summaries, buildPayload, round],
  );

  useEffect(() => {
    setIndex(0);
    setRevealed(isBeginner);
    setMode(isBeginner ? 'guided' : 'type');
    setDraft('');
    setTranscript([]);
    setSpokenTurns({});
    setLastHeard('');
    onStop();
  }, [level.id, round, isBeginner, onStop]);

  useEffect(() => () => onStop(), [onStop]);

  const current = index < turns.length ? turns[index] : undefined;
  const completed = turns.length > 0 && index >= turns.length;
  const spokenCount = Object.values(spokenTurns).filter(Boolean).length;
  const producedCount = transcript.filter(item => item.produced).length;
  const producedPercent = transcript.length ? Math.round((producedCount / transcript.length) * 100) : 0;
  const host = hostFor(courseId, level.id);
  const isArabic = courseId === 'ar';

  // Full speech: the partner's incoming line is voiced as it lands, and the learner's
  // target line is voiced as a model whenever it is not hidden (blind practice stays blind).
  useEffect(() => {
    if (!current) return;
    if (current.partnerText) {
      onSpeak(current.partnerText, () => {
        if (revealed) onSpeak(current.text, () => undefined);
      });
    } else if (revealed) {
      onSpeak(current.text, () => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.lessonId, current?.text, index, round]);

  const handleRemix = useCallback(() => {
    onStop();
    setRound(prev => prev + 1);
  }, [onStop]);

  const handleSpeakText = useCallback((text: string) => {
    onSpeak(text, () => undefined);
  }, [onSpeak]);

  const submitTurn = useCallback((replyText: string) => {
    if (!current) return;
    onStop();
    const cleaned = replyText.trim() || current.text;
    const produced = (mode === 'voice' && replyText.trim().length > 0) || (mode === 'type' && draft.trim().length > 0);
    setTranscript(prev => [...prev, { ...current, learnerReply: cleaned, produced }]);
    setDraft('');
    setLastHeard('');
    setRevealed(isBeginner);
    setIndex(prev => prev + 1);
  }, [current, isBeginner, onStop, mode, draft]);

  if (!turns.length) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>برای این سطح گفت‌وگویی آماده نشده است.</Text>
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
        <Text style={styles.doneTitle}>
          {host ? `یک روز با ${host.name} تمام شد!` : `گفت‌وگوی پیوستهٔ سطح ${level.cefr} تمام شد!`}
        </Text>
        <Text style={styles.doneBody}>
          {toPersianDigits(turns.length)} صحنهٔ این سطح را به‌ترتیب پشت سر گذاشتی
          {spokenCount > 0 ? ` (${toPersianDigits(spokenCount)} مورد با صدای خودت)` : ''}.
        </Text>
        <View style={styles.engagementCard}>
          <Text style={styles.engagementTitle}>مشارکت شخصی</Text>
          <Text style={styles.engagementValue}>
            {toPersianDigits(producedPercent)}٪ · {toPersianDigits(producedCount)} پاسخ از خودت از {toPersianDigits(transcript.length)} نوبت
          </Text>
          <Text style={styles.engagementHint}>
            هر نوبتی که با نوشتن یا صدای خودت جواب گرفتی کامل شمرده می‌شود.
          </Text>
        </View>

        <View style={styles.recapList}>
          <Text style={styles.recapHeading}>مرور پیام‌های این گفت‌وگو</Text>
          {transcript.map((item, idx) => (
            <View key={`recap-${idx}`} style={styles.recapGroup}>
              {item.partnerText ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => handleSpeakText(item.partnerText!)}
                  style={[styles.chatBubble, styles.partnerChatBubble]}
                >
                  <Text style={styles.bubbleLabel}>{item.lessonTitle}</Text>
                  <Text style={[styles.bubbleForeign, isArabic && styles.rtlForeign]}>{item.partnerText}</Text>
                  {item.partnerFa ? <Text style={styles.bubbleFa}>{item.partnerFa}</Text> : null}
                </Pressable>
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={() => handleSpeakText(item.text)}
                style={[styles.chatBubble, styles.learnerChatBubble]}
              >
                <Text style={styles.bubbleLabel}>پاسخ شما</Text>
                <Text style={[styles.bubbleForeign, isArabic && styles.rtlForeign]}>{item.learnerReply}</Text>
                <Text style={styles.bubbleFa}>{item.fa}</Text>
              </Pressable>
            </View>
          ))}
        </View>

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
  const recentTranscript = transcript.slice(-3);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <Sparkles size={16} color={level.color} />
            <Text style={styles.headerTitle}>{host ? `یک روز با ${host.name} · سطح ${level.cefr}` : `گفت‌وگوی آزاد سطح ${level.cefr}`}</Text>
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
          موقعیت {toPersianDigits(index + 1)} از {toPersianDigits(turns.length)} · بدون زمان‌سنج · {host ? `همراه با ${host.name} ${host.emoji}` : 'همراه میزبان سطح'}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressRatio}%`, backgroundColor: level.color }]} />
        </View>
      </View>

      {/* Scene chip: each new lessonTitle is the next stop of the same day */}
      <View style={[styles.sceneChip, { borderColor: `${level.color}55` }]}>
        <Text style={[styles.sceneChipText, { color: level.color }]}>صحنهٔ الآن: {current.lessonTitle}</Text>
      </View>

      {recentTranscript.length > 0 ? (
        <View style={styles.recentThread}>
          {recentTranscript.map((item, idx) => (
            <View key={`hist-${idx}`} style={styles.recapGroup}>
              {item.partnerText ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => handleSpeakText(item.partnerText!)}
                  style={[styles.chatBubble, styles.partnerChatBubble]}
                >
                  <Text style={[styles.bubbleForeign, isArabic && styles.rtlForeign]}>{item.partnerText}</Text>
                </Pressable>
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={() => handleSpeakText(item.text)}
                style={[styles.chatBubble, styles.learnerChatBubble]}
              >
                <Text style={[styles.bubbleForeign, isArabic && styles.rtlForeign]}>{item.learnerReply}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

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
                onPress={() => handleSpeakText(current.partnerText!)}
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

        <View style={styles.promptRow}>
          <Text style={styles.promptLabel}>پاسخ شما به {languageName}:</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setRevealed(v => !v)}
            style={styles.revealToggleChip}
          >
            {revealed ? <EyeOff size={13} color={HomeColors.ink} /> : <Eye size={13} color={HomeColors.ink} />}
            <Text style={styles.revealToggleText}>{revealed ? 'مخفی کردن الگو' : 'نمایش راهنما'}</Text>
          </Pressable>
        </View>
        <Text style={styles.promptFa}>{current.fa}</Text>

        {revealed ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => handleSpeakText(current.text)}
            style={styles.revealBox}
          >
            <Text style={[styles.revealTarget, isArabic && styles.revealTargetArabic]}>
              {current.text}
            </Text>
            <Volume2 size={16} color={Colors.primary[700]} />
          </Pressable>
        ) : null}

        <View style={styles.modeBar}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setMode('guided')}
            style={[styles.modeBtn, mode === 'guided' && { backgroundColor: level.color }]}
          >
            <MessageCircle size={13} color={mode === 'guided' ? '#FFFFFF' : HomeColors.ink} />
            <Text style={[styles.modeBtnText, mode === 'guided' && styles.modeBtnTextActive]}>پاسخ آماده</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setMode('type')}
            style={[styles.modeBtn, mode === 'type' && { backgroundColor: level.color }]}
          >
            <Keyboard size={13} color={mode === 'type' ? '#FFFFFF' : HomeColors.ink} />
            <Text style={[styles.modeBtnText, mode === 'type' && styles.modeBtnTextActive]}>نوشتن</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setMode('voice')}
            style={[styles.modeBtn, mode === 'voice' && { backgroundColor: level.color }]}
          >
            <Mic2 size={13} color={mode === 'voice' ? '#FFFFFF' : HomeColors.ink} />
            <Text style={[styles.modeBtnText, mode === 'voice' && styles.modeBtnTextActive]}>گفتار (اختیاری)</Text>
          </Pressable>
        </View>

        {mode === 'guided' ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => submitTurn(current.text)}
            style={({ pressed }) => [styles.primaryButton, { backgroundColor: level.color }, pressed && styles.pressed]}
          >
            <Send size={15} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>
              {index === turns.length - 1 ? 'ارسال و پایان گفت‌وگو' : 'ارسال پاسخ در چت'}
            </Text>
          </Pressable>
        ) : null}

        {mode === 'type' ? (
          <View style={styles.composeRow}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={() => submitTurn(draft)}
              returnKeyType="send"
              placeholder="پاسخ خودت را بنویس…"
              placeholderTextColor={HomeColors.muted}
              accessibilityLabel="پاسخ شما"
              style={[styles.composeInput, isArabic && styles.composeInputRtl]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="ارسال پیام"
              onPress={() => submitTurn(draft)}
              style={[styles.sendBtn, { backgroundColor: level.color }]}
            >
              <Send size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : null}

        {mode === 'voice' ? (
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
                submitTurn(result.heard.trim());
              }
            }}
          />
        ) : null}

        {!!lastHeard ? (
          <View style={styles.heardNote}>
            <Text style={styles.heardNoteText}>صدای شما در گفت‌وگو ثبت شد.</Text>
          </View>
        ) : null}
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
  recentThread: {
    gap: 6,
    padding: 10,
    borderRadius: 16,
    backgroundColor: '#F6F4ED',
    borderWidth: 1,
    borderColor: HomeColors.border,
  },
  sceneChip: { alignSelf: 'flex-end', borderRadius: 999, borderWidth: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 5 },
  sceneChipText: { fontFamily: Typography.boldFontFamily, fontSize: 11, writingDirection: 'rtl' },
  engagementCard: { width: '100%', borderRadius: 16, backgroundColor: '#F8FAFF', borderWidth: 1, borderColor: HomeColors.border, padding: 12, gap: 4 },
  engagementTitle: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: HomeColors.muted, textAlign: 'right', writingDirection: 'rtl' },
  engagementValue: { fontFamily: Typography.boldFontFamily, fontSize: 15, color: HomeColors.ink, textAlign: 'right', writingDirection: 'rtl' },
  engagementHint: { fontFamily: Typography.fontFamily, fontSize: 11, lineHeight: 18, color: HomeColors.muted, textAlign: 'right', writingDirection: 'rtl' },
  recapList: { gap: 8 },
  recapHeading: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 13,
    color: HomeColors.ink,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  recapGroup: { gap: 5 },
  chatBubble: {
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 3,
    maxWidth: '90%',
  },
  partnerChatBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E0D6',
  },
  learnerChatBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  bubbleLabel: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 10.5,
    color: HomeColors.muted,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  bubbleForeign: {
    fontFamily: Typography.latinFontFamily,
    fontSize: 14.5,
    lineHeight: 22,
    fontWeight: '700',
    color: HomeColors.ink,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  rtlForeign: {
    fontFamily: Typography.boldFontFamily,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  bubbleFa: {
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    color: HomeColors.muted,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  card: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: HomeColors.surface,
    borderWidth: 1,
    borderColor: HomeColors.border,
    gap: 11,
  },
  contextBox: {
    padding: 10,
    borderRadius: 13,
    backgroundColor: '#F6F4ED',
    gap: 3,
  },
  contextLesson: {
    fontFamily: Typography.boldFontFamily,
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
    borderRadius: 15,
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
  promptRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  promptLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: 12.5,
    lineHeight: 19,
    color: HomeColors.muted,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  revealToggleChip: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F3F1EA',
    borderWidth: 1,
    borderColor: HomeColors.border,
  },
  revealToggleText: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 11,
    color: HomeColors.ink,
    writingDirection: 'rtl',
  },
  promptFa: {
    fontFamily: Typography.fontFamily,
    fontSize: 18,
    lineHeight: 29,
    color: HomeColors.ink,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  revealBox: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: 13,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  revealTarget: {
    flex: 1,
    fontFamily: Typography.latinFontFamily,
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '700',
    color: Colors.primary[800],
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  revealTargetArabic: {
    fontFamily: Typography.boldFontFamily,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  modeBar: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    gap: 6,
    padding: 3,
    borderRadius: 12,
    backgroundColor: '#F3F1EA',
  },
  modeBtn: {
    flex: 1,
    minHeight: 34,
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 9,
    paddingHorizontal: 6,
  },
  modeBtnText: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 11.5,
    color: HomeColors.ink,
    writingDirection: 'rtl',
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
  },
  composeRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  composeInput: {
    flex: 1,
    minHeight: 44,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: HomeColors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    fontFamily: Typography.latinFontFamily,
    fontSize: 15,
    color: HomeColors.ink,
  },
  composeInputRtl: {
    fontFamily: Typography.fontFamily,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
