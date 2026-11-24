import { LocalizedText as Text } from '@/components/LocalizedText';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Check, Lightbulb, RotateCcw, Volume2 } from 'lucide-react-native';
import type { ArabicSentence } from '@/lib/arabic/content';
import { toPersianDigits as fa } from '@/lib/format';
import {
  buildChunkPieces,
  buildSentenceStructureSummary,
  buildWordPieces,
  diagnoseSentenceBuild,
  formatBuiltSentence,
  scrambleSentencePieces,
} from '@/lib/sentenceBuilderEngine';
import { Typography } from '@/lib/theme';
import { ArabicPalette as Palette } from './ArabicUI';

export interface ArabicSentenceBuilderProps {
  sentence: ArabicSentence;
  guided?: boolean;
  pattern?: string;
  explanation?: string;
  lessonNote?: string;
  levelId?: number;
  sentenceIndex?: number;
  sentenceCount?: number;
  builtCount?: number;
  onSpeak?: (text: string) => void;
  onBuilt?: (sentenceId: string) => void;
  onNextSentence?: () => void;
}

/**
 * RTL-native Sentence Builder for Arabic (Pre-A1 through C1), mirrored on EnglishSentenceBuilder:
 * - Tiles and chosen slots flow right-to-left (`flexDirection: 'row-reverse'`) so Arabic word order reads naturally.
 * - Normalizes harakat/hamza/punctuation in `sentenceBuilderEngine` without leaking tile order.
 */
export function ArabicSentenceBuilder({
  sentence,
  guided = false,
  pattern,
  explanation,
  lessonNote,
  levelId = 1,
  sentenceIndex,
  sentenceCount,
  builtCount,
  onSpeak,
  onBuilt,
  onNextSentence,
}: ArabicSentenceBuilderProps) {
  const anchors = useMemo(
    () => (sentence.vocabulary ?? []).map(v => ({ word: v.word, meaning: v.meaning })),
    [sentence.vocabulary],
  );
  const structure = useMemo(
    () =>
      buildSentenceStructureSummary({
        text: sentence.ar,
        pattern: pattern || sentence.pattern,
        explanation,
        lessonNote,
        vocabulary: anchors,
      }),
    [sentence.ar, pattern, sentence.pattern, explanation, lessonNote, anchors],
  );

  const wordPieces = useMemo(() => buildWordPieces(sentence.ar, anchors), [sentence.ar, anchors]);
  const chunkPieces = useMemo(() => buildChunkPieces(sentence.ar, anchors), [sentence.ar, anchors]);
  const supportsChunkMode =
    chunkPieces.length >= 3 && chunkPieces.length < wordPieces.length && wordPieces.length >= 7;

  const [buildMode, setBuildMode] = useState<'word' | 'chunk'>(
    supportsChunkMode && levelId >= 3 && wordPieces.length >= 9 ? 'chunk' : 'word',
  );
  const activeMode = supportsChunkMode ? buildMode : 'word';
  const targetPieces = activeMode === 'chunk' ? chunkPieces : wordPieces;
  const shuffled = useMemo(
    () => scrambleSentencePieces(targetPieces, `${sentence.id}:${activeMode}`),
    [targetPieces, sentence.id, activeMode],
  );

  const [chosen, setChosen] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [hintPieceId, setHintPieceId] = useState<number | null>(null);
  const [showVocab, setShowVocab] = useState(levelId <= 2);

  useEffect(() => {
    setChosen([]);
    setChecked(false);
    setHintPieceId(null);
    setBuildMode(supportsChunkMode && levelId >= 3 && wordPieces.length >= 9 ? 'chunk' : 'word');
    setShowVocab(levelId <= 2);
  }, [sentence.id, supportsChunkMode, levelId, wordPieces.length]);

  const chosenPieces = useMemo(
    () => chosen.map(id => targetPieces.find(p => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p)),
    [chosen, targetPieces],
  );

  const diagnosis = useMemo(
    () => diagnoseSentenceBuild(targetPieces, chosenPieces, structure.patternLabel),
    [targetPieces, chosenPieces, structure.patternLabel],
  );

  const formattedBuilt = useMemo(
    () => formatBuiltSentence(targetPieces, chosen),
    [targetPieces, chosen],
  );

  useEffect(() => {
    if (checked && diagnosis.correct) onBuilt?.(sentence.id);
  }, [checked, diagnosis.correct, onBuilt, sentence.id]);

  const addPiece = (id: number) => {
    if (chosen.includes(id)) return;
    setChecked(false);
    setHintPieceId(null);
    setChosen(prev => [...prev, id]);
  };

  const removePiece = (id: number) => {
    setChecked(false);
    setChosen(prev => prev.filter(item => item !== id));
  };

  const revealNextHint = () => {
    const nextIdx = diagnosis.matchedPrefix;
    const expected = targetPieces[nextIdx];
    if (expected) setHintPieceId(expected.id);
  };

  const reset = () => {
    setChosen([]);
    setChecked(false);
    setHintPieceId(null);
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.counter}>
          {sentenceIndex !== undefined && sentenceCount
            ? `جمله ${fa(sentenceIndex + 1)} از ${fa(sentenceCount)}`
            : 'ساخت جملهٔ عربی'}
          {builtCount !== undefined && sentenceCount ? ` · ساخته‌شده: ${fa(builtCount)}/${fa(sentenceCount)}` : ''}
        </Text>
        {supportsChunkMode ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setBuildMode(prev => (prev === 'word' ? 'chunk' : 'word'))}
            style={styles.modeChip}
          >
            <Text style={styles.modeChipText}>{activeMode === 'chunk' ? 'حالت واژه‌به‌واژه' : 'حالت عبارتی'}</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.prompt}>{sentence.fa}</Text>

      {guided ? (
        <View style={styles.guideBox}>
          <Text style={styles.guideTitle}>الگوی راهنما</Text>
          <Text style={styles.guideAr}>{sentence.ar}</Text>
        </View>
      ) : null}

      <View style={styles.patternBox}>
        <Text style={styles.patternTitle}>ساختار: {structure.patternLabel}</Text>
        {structure.explanationFa ? <Text style={styles.patternDesc}>{structure.explanationFa}</Text> : null}
        {structure.clauseHintFa ? <Text style={styles.patternDesc}>{structure.clauseHintFa}</Text> : null}
      </View>

      {anchors.length > 0 ? (
        <View style={styles.vocabSection}>
          <Pressable accessibilityRole="button" onPress={() => setShowVocab(v => !v)} style={styles.vocabToggle}>
            <Text style={styles.vocabToggleText}>
              {showVocab ? 'پنهان‌کردن واژه‌های کلیدی' : `نمایش واژه‌های کلیدی (${fa(anchors.length)})`}
            </Text>
          </Pressable>
          {showVocab ? (
            <View style={styles.anchorRow}>
              {anchors.map((a, idx) => (
                <View key={`${a.word}-${idx}`} style={styles.anchorChip}>
                  <Text style={styles.anchorWord}>{a.word}</Text>
                  <Text style={styles.anchorMeaning}>{a.meaning}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.builtBox}>
        <Text style={styles.slotLabel}>جملهٔ ساخته‌شده (راست به چپ):</Text>
        {chosenPieces.length === 0 ? (
          <Text style={styles.placeholder}>روی واژه‌های پایین بزنید تا از راست به چپ چیده شوند…</Text>
        ) : (
          <View style={styles.rtlChipWrap}>
            {chosenPieces.map((piece, idx) => {
              const slotState = checked ? diagnosis.slotStates[idx] : undefined;
              return (
                <Pressable
                  key={`chosen-${piece.id}`}
                  accessibilityRole="button"
                  onPress={() => removePiece(piece.id)}
                  style={[
                    styles.slotChip,
                    slotState === 'ok' && styles.slotChipOk,
                    slotState === 'wrong' && styles.slotChipWrong,
                  ]}
                >
                  <Text style={styles.slotChipText}>{piece.label}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
        {checked && diagnosis.correct ? (
          <View style={styles.solvedPreview}>
            <Text style={styles.solvedText}>{formattedBuilt}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.rtlChipWrap}>
        {shuffled.map(piece => {
          const used = chosen.includes(piece.id);
          const hinted = hintPieceId === piece.id && !used;
          return (
            <Pressable
              key={`pool-${piece.id}`}
              accessibilityRole="button"
              disabled={used}
              onPress={() => addPiece(piece.id)}
              style={[
                styles.poolChip,
                piece.isAnchor && styles.poolChipAnchor,
                hinted && styles.poolChipHint,
                used && styles.poolChipUsed,
              ]}
            >
              <Text style={[styles.poolChipText, used && styles.poolChipTextUsed]}>{piece.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {checked ? (
        <View style={[styles.feedbackBox, diagnosis.correct ? styles.feedbackOk : styles.feedbackWarn]}>
          <Text style={[styles.feedbackText, diagnosis.correct ? styles.feedbackOkText : styles.feedbackWarnText]}>
            {diagnosis.feedbackFa}
          </Text>
          {!diagnosis.correct && diagnosis.nextExpected ? (
            <Text style={styles.feedbackSub}>نخستین جایگاه نیازمند اصلاح: «{diagnosis.nextExpected}»</Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        <Pressable
          accessibilityRole="button"
          disabled={chosen.length === 0}
          onPress={() => setChecked(true)}
          style={[styles.primaryBtn, chosen.length === 0 && styles.disabledBtn]}
        >
          <Check size={16} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>بررسی جمله</Text>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={revealNextHint} style={styles.secondaryBtn}>
          <Lightbulb size={15} color={Palette.gold} />
          <Text style={styles.secondaryBtnText}>راهنما</Text>
        </Pressable>

        {onSpeak ? (
          <Pressable accessibilityRole="button" onPress={() => onSpeak(sentence.ar)} style={styles.secondaryBtn}>
            <Volume2 size={15} color={Palette.primary} />
            <Text style={styles.secondaryBtnText}>شنیدن</Text>
          </Pressable>
        ) : null}

        <Pressable accessibilityRole="button" onPress={reset} style={styles.iconBtn} accessibilityLabel="شروع دوبارهٔ جمله">
          <RotateCcw size={16} color={Palette.muted} />
        </Pressable>
      </View>

      {checked && diagnosis.correct && onNextSentence ? (
        <Pressable accessibilityRole="button" onPress={onNextSentence} style={styles.nextBtn}>
          <Text style={styles.nextBtnText}>جملهٔ بعدی</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    padding: 16,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  counter: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 12,
    color: Palette.primaryDark,
    writingDirection: 'rtl',
  },
  modeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Palette.primarySoft,
  },
  modeChipText: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 11,
    color: Palette.primaryDark,
    writingDirection: 'rtl',
  },
  prompt: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 16,
    lineHeight: 26,
    color: Palette.ink,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  guideBox: {
    borderRadius: 14,
    backgroundColor: Palette.surfaceSoft,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 10,
    gap: 4,
  },
  guideTitle: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 11,
    color: Palette.primaryDark,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  guideAr: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 18,
    lineHeight: 30,
    color: Palette.ink,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  patternBox: {
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    gap: 4,
  },
  patternTitle: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 12,
    color: Palette.ink,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  patternDesc: {
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    lineHeight: 20,
    color: Palette.text,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  vocabSection: { gap: 8 },
  vocabToggle: { alignSelf: 'flex-end' },
  vocabToggleText: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 12,
    color: Palette.primary,
    writingDirection: 'rtl',
  },
  anchorRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
  },
  anchorChip: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    gap: 2,
  },
  anchorWord: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 14,
    color: Palette.ink,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  anchorMeaning: {
    fontFamily: Typography.fontFamily,
    fontSize: 11,
    color: Palette.muted,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  builtBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    padding: 12,
    minHeight: 74,
    gap: 8,
  },
  slotLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: 11,
    color: Palette.muted,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  placeholder: {
    fontFamily: Typography.fontFamily,
    fontSize: 13,
    color: Palette.muted,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlChipWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.primary,
    backgroundColor: Palette.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  slotChipOk: {
    borderColor: '#16A34A',
    backgroundColor: Palette.successSoft,
  },
  slotChipWrong: {
    borderColor: '#DC2626',
    backgroundColor: Palette.dangerSoft,
  },
  slotChipText: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 16,
    color: Palette.ink,
    writingDirection: 'rtl',
  },
  solvedPreview: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
  },
  solvedText: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 17,
    lineHeight: 28,
    color: Palette.success,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  poolChip: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  poolChipAnchor: {
    borderColor: '#99F6E4',
    backgroundColor: '#F0FDFA',
  },
  poolChipHint: {
    borderColor: Palette.gold,
    backgroundColor: Palette.goldSoft,
  },
  poolChipUsed: {
    opacity: 0.35,
  },
  poolChipText: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 16,
    color: Palette.ink,
    writingDirection: 'rtl',
  },
  poolChipTextUsed: {
    color: Palette.muted,
  },
  feedbackBox: {
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    gap: 4,
  },
  feedbackOk: {
    backgroundColor: Palette.successSoft,
    borderColor: '#86EFAC',
  },
  feedbackWarn: {
    backgroundColor: Palette.dangerSoft,
    borderColor: '#FECACA',
  },
  feedbackText: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 12.5,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  feedbackOkText: { color: Palette.success },
  feedbackWarnText: { color: Palette.danger },
  feedbackSub: {
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    color: Palette.text,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  actionsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: Palette.primary,
  },
  disabledBtn: { opacity: 0.45 },
  primaryBtnText: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 13,
    color: '#FFFFFF',
    writingDirection: 'rtl',
  },
  secondaryBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    minHeight: 42,
    paddingHorizontal: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  secondaryBtnText: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 12.5,
    color: Palette.ink,
    writingDirection: 'rtl',
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtn: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: Palette.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 13,
    color: '#FFFFFF',
    writingDirection: 'rtl',
  },
});
