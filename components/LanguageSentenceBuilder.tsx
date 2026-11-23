import { LocalizedText as Text } from '@/components/LocalizedText';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Volume2 } from 'lucide-react-native';
import type { LearningSentence } from '@/lib/languages/types';
import { EnglishPalette as Palette } from '@/components/EnglishSupplementTask';
import { Typography } from '@/lib/theme';
import { toPersianDigits as fa } from '@/lib/format';
import {
  buildChunkPieces,
  buildSentenceStructureSummary,
  buildWordPieces,
  diagnoseSentenceBuild,
  formatBuiltSentence,
  scrambleSentencePieces,
  type BridgeCue,
} from '@/lib/sentenceBuilderEngine';

export interface LanguageSentenceBuilderProps {
  sentence: LearningSentence;
  /** Shown in the empty answer area before the learner picks a word. */
  placeholder: string;
  /** Absolute-beginner mode: keep the target sentence visible above the word bank. */
  guided?: boolean;
  pattern?: string;
  explanation?: string;
  bridge?: BridgeCue;
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
 * Unified structure-bound Sentence Builder for Russian, Turkish, German, French, and Spanish
 * across every level (Pre-A1 through C1).
 */
export default function LanguageSentenceBuilder({
  sentence,
  placeholder,
  guided = false,
  pattern,
  explanation,
  bridge,
  lessonNote,
  levelId = 1,
  sentenceIndex,
  sentenceCount,
  builtCount,
  onSpeak,
  onBuilt,
  onNextSentence,
}: LanguageSentenceBuilderProps) {
  const anchors = useMemo(
    () => (sentence.vocabulary ?? []).map(v => ({ word: v.word, meaning: v.meaning })),
    [sentence.vocabulary],
  );
  const structure = useMemo(
    () =>
      buildSentenceStructureSummary({
        text: sentence.text,
        pattern: pattern || sentence.pattern,
        explanation,
        bridge,
        lessonNote,
        vocabulary: anchors,
      }),
    [sentence.text, pattern, sentence.pattern, explanation, bridge, lessonNote, anchors],
  );

  const wordPieces = useMemo(() => buildWordPieces(sentence.text, anchors), [sentence.text, anchors]);
  const chunkPieces = useMemo(() => buildChunkPieces(sentence.text, anchors), [sentence.text, anchors]);
  const supportsChunkMode = chunkPieces.length >= 3 && chunkPieces.length < wordPieces.length && wordPieces.length >= 7;

  const [buildMode, setBuildMode] = useState<'word' | 'chunk'>(
    supportsChunkMode && levelId >= 3 && wordPieces.length >= 9 ? 'chunk' : 'word',
  );
  const activeMode = supportsChunkMode ? buildMode : 'word';
  const targetPieces = activeMode === 'chunk' ? chunkPieces : wordPieces;
  const shuffled = useMemo(
    () => scrambleSentencePieces(targetPieces, `${sentence.id}:${activeMode}`),
    [targetPieces, sentence.id, activeMode],
  );

  const [selected, setSelected] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [hintPieceId, setHintPieceId] = useState<number | null>(null);
  const [showVocab, setShowVocab] = useState(levelId <= 2);

  useEffect(() => {
    setSelected([]);
    setChecked(false);
    setHintPieceId(null);
    setBuildMode(supportsChunkMode && levelId >= 3 && wordPieces.length >= 9 ? 'chunk' : 'word');
    setShowVocab(levelId <= 2);
  }, [sentence.id, supportsChunkMode, levelId, wordPieces.length]);

  const chosenPieces = useMemo(
    () => selected.map(id => targetPieces.find(item => item.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p)),
    [selected, targetPieces],
  );

  const diagnosis = useMemo(
    () => diagnoseSentenceBuild(targetPieces, chosenPieces, structure.patternLabel),
    [targetPieces, chosenPieces, structure.patternLabel],
  );

  const formattedBuilt = useMemo(
    () => formatBuiltSentence(targetPieces, selected),
    [targetPieces, selected],
  );

  useEffect(() => {
    if (checked && diagnosis.correct) onBuilt?.(sentence.id);
  }, [checked, diagnosis.correct, onBuilt, sentence.id]);

  const choose = (id: number) => {
    if (selected.includes(id)) return;
    setSelected(current => [...current, id]);
    setChecked(false);
    setHintPieceId(null);
  };

  const remove = (position: number) => {
    setSelected(current => current.filter((_, idx) => idx !== position));
    setChecked(false);
    setHintPieceId(null);
  };

  const revealNextStep = () => {
    const nextPiece = targetPieces[diagnosis.matchedPrefix];
    if (!nextPiece) return;
    setHintPieceId(nextPiece.id);
  };

  const switchMode = (nextMode: 'word' | 'chunk') => {
    if (nextMode === activeMode) return;
    setBuildMode(nextMode);
    setSelected([]);
    setChecked(false);
    setHintPieceId(null);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.kicker}>ساخت جمله بر پایهٔ ساختار درس</Text>
        {typeof sentenceIndex === 'number' && typeof sentenceCount === 'number' ? (
          <Text style={styles.counterBadge}>
            جمله {fa(sentenceIndex + 1)} از {fa(sentenceCount)}
            {typeof builtCount === 'number' && builtCount > 0 ? ` · ساخته‌شده ${fa(builtCount)}` : ''}
          </Text>
        ) : null}
      </View>

      <View style={styles.structureBox}>
        <View style={styles.structureHead}>
          <Text style={styles.structureLabel}>الگوی ساخت</Text>
          <Text style={styles.patternPill}>{structure.patternLabel}</Text>
        </View>
        {structure.explanationFa ? <Text style={styles.structureNote}>{structure.explanationFa}</Text> : null}
        {structure.bridge ? (
          <Text style={styles.bridgeText}>
            پل فارسی ({structure.bridge.title}): {structure.bridge.summary}
          </Text>
        ) : null}
        {structure.clauseHintFa ? <Text style={styles.clauseHint}>{structure.clauseHintFa}</Text> : null}
      </View>

      {structure.anchors.length > 0 ? (
        <View style={styles.vocabSection}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showVocab ? 'بستن واژه‌های کلیدی جمله' : 'نمایش واژه‌های کلیدی جمله'}
            onPress={() => setShowVocab(v => !v)}
            style={styles.vocabToggle}
          >
            <Text style={styles.vocabToggleText}>
              واژه‌های کلیدی این جمله ({fa(structure.anchors.length)}) {showVocab ? '▾' : '◂'}
            </Text>
          </Pressable>
          {showVocab ? (
            <View style={styles.anchorList}>
              {structure.anchors.map(anchor => (
                <View key={anchor.word} style={styles.anchorChip}>
                  <Text style={styles.anchorWord}>{anchor.word}</Text>
                  <Text style={styles.anchorMeaning}>{anchor.meaning}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {guided ? (
        <View style={styles.guidedCard}>
          <View style={styles.guidedTop}>
            <Text style={styles.guidedLabel}>الگوی راهنما (گام نخست)</Text>
            {onSpeak ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="شنیدن جملهٔ راهنما"
                onPress={() => onSpeak(sentence.text)}
                style={styles.speakIconBtn}
              >
                <Volume2 size={15} color={Palette.primary} />
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.guidedSentence}>{sentence.text}</Text>
          {sentence.pronunciation ? <Text style={styles.guidedPron}>{sentence.pronunciation}</Text> : null}
        </View>
      ) : null}

      <Text style={styles.translation}>{sentence.fa}</Text>

      {supportsChunkMode ? (
        <View style={styles.modeRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="حالت چیدمان تک‌واژه"
            onPress={() => switchMode('word')}
            style={[styles.modePill, activeMode === 'word' && styles.modePillActive]}
          >
            <Text style={[styles.modePillText, activeMode === 'word' && styles.modePillTextActive]}>تک‌واژه</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="حالت چیدمان عبارت‌های ساختاری"
            onPress={() => switchMode('chunk')}
            style={[styles.modePill, activeMode === 'chunk' && styles.modePillActive]}
          >
            <Text style={[styles.modePillText, activeMode === 'chunk' && styles.modePillTextActive]}>عبارت‌های ساختاری</Text>
          </Pressable>
        </View>
      ) : null}

      <View accessibilityLabel="جملهٔ ساخته‌شده" style={styles.answerArea}>
        {chosenPieces.length ? (
          chosenPieces.map((piece, position) => {
            const slotState = checked ? diagnosis.slotStates[position] : undefined;
            return (
              <Pressable
                key={`${piece.id}-${position}`}
                accessibilityRole="button"
                accessibilityLabel={`حذف واژهٔ ${piece.label}`}
                onPress={() => remove(position)}
                style={[
                  styles.answerChip,
                  slotState === 'ok' && styles.answerChipOk,
                  slotState === 'wrong' && styles.answerChipWrong,
                ]}
              >
                <Text style={styles.answerText}>{piece.label}</Text>
              </Pressable>
            );
          })
        ) : (
          <Text style={styles.placeholder}>
            {activeMode === 'chunk' ? 'عبارت‌های ساختاری را به ترتیب جمله بچینید.' : placeholder}
          </Text>
        )}
      </View>

      <View style={styles.wordBank}>
        {shuffled.map(piece => {
          const used = selected.includes(piece.id);
          const highlighted = hintPieceId === piece.id && !used;
          return (
            <Pressable
              key={`${sentence.id}-${activeMode}-${piece.id}`}
              accessibilityRole="button"
              accessibilityLabel={`افزودن ${piece.label}`}
              accessibilityState={{ disabled: used }}
              disabled={used}
              onPress={() => choose(piece.id)}
              style={[
                styles.wordChip,
                piece.isAnchor && styles.anchorWordChip,
                highlighted && styles.hintedChip,
                used && styles.usedChip,
              ]}
            >
              <Text style={[styles.wordText, used && styles.usedText]}>{piece.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !selected.length }}
          disabled={!selected.length}
          style={[styles.primaryButton, !selected.length && styles.disabled]}
          onPress={() => setChecked(true)}
        >
          <Text style={styles.primaryButtonText}>بررسی ساختار</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="راهنمای گام بعدی"
          style={styles.hintButton}
          onPress={revealNextStep}
        >
          <Text style={styles.secondaryButtonText}>گام بعدی</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={styles.secondaryButton}
          onPress={() => {
            setSelected([]);
            setChecked(false);
            setHintPieceId(null);
          }}
        >
          <Text style={styles.secondaryButtonText}>از نو</Text>
        </Pressable>
      </View>

      {hintPieceId !== null && !checked ? (
        <Text style={styles.hintBanner}>
          بخش پیشنهادی بعدی ({fa(diagnosis.matchedPrefix + 1)}): «{targetPieces.find(p => p.id === hintPieceId)?.label}»
        </Text>
      ) : null}

      {checked ? (
        <View style={[styles.resultBox, diagnosis.correct ? styles.resultOk : styles.resultWarn]}>
          <Text accessibilityLiveRegion="polite" style={[styles.feedback, diagnosis.correct ? styles.success : styles.tryAgain]}>
            {diagnosis.feedbackFa}
          </Text>
          {diagnosis.correct ? (
            <View style={styles.solvedRow}>
              <Text style={styles.solvedSentence}>{formattedBuilt}</Text>
              <View style={styles.solvedActions}>
                {onSpeak ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="شنیدن جملهٔ ساخته‌شده"
                    onPress={() => onSpeak(sentence.text)}
                    style={styles.speakChip}
                  >
                    <Volume2 size={14} color={Palette.primary} />
                    <Text style={styles.speakChipText}>بشنو</Text>
                  </Pressable>
                ) : null}
                {onNextSentence ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="رفتن به جملهٔ بعدی"
                    onPress={onNextSentence}
                    style={styles.nextChip}
                  >
                    <Text style={styles.nextChipText}>جملهٔ بعدی</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', backgroundColor: Palette.surface, borderRadius: 18, borderWidth: 1, borderColor: Palette.border, padding: 16, gap: 12, marginTop: 18 },
  headerRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  kicker: { fontFamily: Typography.fontFamily, fontSize: 12, fontWeight: '400', color: Palette.primary, textAlign: 'right', writingDirection: 'rtl' },
  counterBadge: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.muted, backgroundColor: Palette.surfaceMuted, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, writingDirection: 'rtl' },
  structureBox: { borderRadius: 13, backgroundColor: Palette.surfaceMuted, borderWidth: 1, borderColor: Palette.border, padding: 11, gap: 6 },
  structureHead: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  structureLabel: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.muted, writingDirection: 'rtl' },
  patternPill: { fontFamily: 'Times New Roman', fontSize: 12, fontWeight: '800', color: Palette.primary, backgroundColor: Palette.primarySoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  structureNote: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 19, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  bridgeText: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 19, color: Palette.primary, textAlign: 'right', writingDirection: 'rtl' },
  clauseHint: { fontFamily: Typography.fontFamily, fontSize: 11, lineHeight: 18, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  vocabSection: { gap: 7 },
  vocabToggle: { alignSelf: 'flex-end' },
  vocabToggleText: { fontFamily: Typography.fontFamily, fontSize: 12, color: Palette.primary, writingDirection: 'rtl' },
  anchorList: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 },
  anchorChip: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, borderRadius: 9, backgroundColor: Palette.surfaceMuted, borderWidth: 1, borderColor: Palette.border, paddingHorizontal: 8, paddingVertical: 4 },
  anchorWord: { fontFamily: 'Times New Roman', fontSize: 12, fontWeight: '800', color: Palette.ink, writingDirection: 'ltr' },
  anchorMeaning: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.muted, writingDirection: 'rtl' },
  guidedCard: { borderRadius: 12, backgroundColor: Palette.primarySoft, borderWidth: 1, borderColor: Palette.border, paddingHorizontal: 12, paddingVertical: 10, gap: 4 },
  guidedTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  guidedLabel: { fontFamily: Typography.fontFamily, fontSize: 11, fontWeight: '400', color: Palette.primary, textAlign: 'right', writingDirection: 'rtl' },
  speakIconBtn: { width: 30, height: 30, borderRadius: 999, backgroundColor: Palette.surface, alignItems: 'center', justifyContent: 'center' },
  guidedSentence: { fontFamily: 'Times New Roman', fontSize: 18, lineHeight: 26, fontWeight: '800', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  guidedPron: { fontFamily: Typography.fontFamily, fontSize: 12, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  translation: { fontFamily: Typography.fontFamily, fontSize: 17, lineHeight: 28, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  modeRow: { flexDirection: 'row-reverse', gap: 8 },
  modePill: { borderRadius: 999, borderWidth: 1, borderColor: Palette.border, backgroundColor: Palette.surfaceMuted, paddingHorizontal: 11, paddingVertical: 5 },
  modePillActive: { borderColor: Palette.primary, backgroundColor: Palette.primarySoft },
  modePillText: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.muted, writingDirection: 'rtl' },
  modePillTextActive: { color: Palette.primary },
  answerArea: { minHeight: 76, borderRadius: 13, borderWidth: 1, borderColor: Palette.primary, backgroundColor: Palette.primarySoft, padding: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 7, alignItems: 'center' },
  placeholder: { flex: 1, fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 21, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  answerChip: { borderRadius: 9, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.primary, paddingHorizontal: 9, paddingVertical: 7 },
  answerChipOk: { borderColor: Palette.success, backgroundColor: 'rgba(16, 185, 129, 0.14)' },
  answerChipWrong: { borderColor: Palette.warning, backgroundColor: 'rgba(245, 158, 11, 0.15)' },
  answerText: { fontFamily: 'Times New Roman', color: Palette.ink, fontSize: 13, fontWeight: '800', writingDirection: 'ltr' },
  wordBank: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 8 },
  wordChip: { borderRadius: 10, backgroundColor: Palette.surfaceMuted, borderWidth: 1, borderColor: Palette.border, paddingHorizontal: 10, paddingVertical: 8 },
  anchorWordChip: { borderColor: Palette.primary },
  hintedChip: { borderColor: Palette.success, backgroundColor: 'rgba(16, 185, 129, 0.16)' },
  usedChip: { opacity: .38 },
  wordText: { fontFamily: 'Times New Roman', color: Palette.ink, fontSize: 13, fontWeight: '800', writingDirection: 'ltr' },
  usedText: { color: Palette.muted },
  actions: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  primaryButton: { flex: 1, minHeight: 44, backgroundColor: Palette.primary, borderRadius: 12, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { fontFamily: Typography.fontFamily, color: '#FFFFFF', fontSize: 14, fontWeight: '400', writingDirection: 'rtl' },
  hintButton: { minHeight: 44, backgroundColor: Palette.primarySoft, borderRadius: 12, borderWidth: 1, borderColor: Palette.border, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  secondaryButton: { minHeight: 44, backgroundColor: Palette.surfaceMuted, borderRadius: 12, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { fontFamily: Typography.fontFamily, color: Palette.ink, fontSize: 13, fontWeight: '400', writingDirection: 'rtl' },
  disabled: { opacity: .45 },
  hintBanner: { fontFamily: Typography.fontFamily, fontSize: 12, color: Palette.primary, textAlign: 'right', writingDirection: 'rtl' },
  resultBox: { borderRadius: 12, borderWidth: 1, padding: 11, gap: 8 },
  resultOk: { borderColor: Palette.success, backgroundColor: 'rgba(16, 185, 129, 0.10)' },
  resultWarn: { borderColor: Palette.warning, backgroundColor: 'rgba(245, 158, 11, 0.10)' },
  feedback: { fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 20, textAlign: 'right', writingDirection: 'rtl' },
  success: { color: Palette.success },
  tryAgain: { color: Palette.warning },
  solvedRow: { gap: 8 },
  solvedSentence: { fontFamily: 'Times New Roman', fontSize: 16, lineHeight: 24, fontWeight: '800', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  solvedActions: { flexDirection: 'row-reverse', gap: 8, alignItems: 'center' },
  speakChip: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, borderRadius: 10, borderWidth: 1, borderColor: Palette.border, backgroundColor: Palette.surface, paddingHorizontal: 11, paddingVertical: 7 },
  speakChipText: { fontFamily: Typography.fontFamily, fontSize: 12, color: Palette.primary, writingDirection: 'rtl' },
  nextChip: { borderRadius: 10, backgroundColor: Palette.primary, paddingHorizontal: 12, paddingVertical: 7 },
  nextChipText: { fontFamily: Typography.fontFamily, fontSize: 12, color: '#FFFFFF', writingDirection: 'rtl' },
});
