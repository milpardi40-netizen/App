import { LocalizedText as Text } from '@/components/LocalizedText';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Volume2 } from 'lucide-react-native';
import type { CourseSentence } from '@/lib/courseContent';
import { EnglishPalette as Palette } from './EnglishSupplementTask';
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

export interface EnglishSentenceBuilderProps {
  sentence: CourseSentence;
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
 * Structure-bound Sentence Builder for English (Pre-A1 through C1):
 * - Strips punctuation from movable tiles so punctuation never leaks word order,
 *   then restores exact punctuation in the solved preview and TTS playback.
 * - Connects each sentence's grammar pattern, lesson note, and vocabulary anchors
 *   directly into the building workspace.
 * - Supports both word-by-word and clause-chunk building for longer B1–C1 sentences,
 *   plus slot-by-slot structural diagnosis and next-slot guidance.
 */
export function EnglishSentenceBuilder({
  sentence,
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
}: EnglishSentenceBuilderProps) {
  const anchors = useMemo(
    () => (sentence.vocabulary ?? []).map(v => ({ word: v.word, meaning: v.meaning })),
    [sentence.vocabulary],
  );
  const structure = useMemo(
    () =>
      buildSentenceStructureSummary({
        text: sentence.en,
        pattern: pattern || sentence.pattern,
        explanation,
        bridge,
        lessonNote,
        vocabulary: anchors,
      }),
    [sentence.en, pattern, sentence.pattern, explanation, bridge, lessonNote, anchors],
  );

  const wordPieces = useMemo(() => buildWordPieces(sentence.en, anchors), [sentence.en, anchors]);
  const chunkPieces = useMemo(() => buildChunkPieces(sentence.en, anchors), [sentence.en, anchors]);
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

  const choose = (pieceId: number) => {
    if (chosen.includes(pieceId)) return;
    setChosen(current => [...current, pieceId]);
    setChecked(false);
    setHintPieceId(null);
  };

  const remove = (position: number) => {
    setChosen(current => current.filter((_, index) => index !== position));
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
    setChosen([]);
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

      {/* Structure & pattern linkage */}
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

      {/* Vocabulary anchors connecting meaning to sentence slots */}
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
                onPress={() => onSpeak(sentence.en)}
                style={styles.speakIconBtn}
              >
                <Volume2 size={15} color={Palette.primary} />
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.guidedSentence}>{sentence.en}</Text>
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
                accessibilityLabel={`حذف ${piece.label}`}
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
            {activeMode === 'chunk'
              ? 'عبارت‌های ساختاری را به ترتیب منطقی جمله بچینید.'
              : 'واژه‌ها را به ترتیب درست جمله انتخاب کنید.'}
          </Text>
        )}
      </View>

      <View style={styles.wordBank}>
        {shuffled.map(piece => {
          const used = chosen.includes(piece.id);
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
          accessibilityState={{ disabled: !chosen.length }}
          disabled={!chosen.length}
          style={[styles.primaryButton, !chosen.length && styles.disabledBtn]}
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
            setChosen([]);
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
                    onPress={() => onSpeak(sentence.en)}
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
  card: { width: '100%', backgroundColor: Palette.surface, borderRadius: 18, borderWidth: 1, borderColor: Palette.border, padding: 16, gap: 12 },
  headerRow: { flexDirection: 'row-reverse' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, gap: 8, flexWrap: 'wrap' as const },
  kicker: { fontFamily: 'Beiruti', fontSize: 12, fontWeight: '400' as const, color: Palette.primary, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  counterBadge: { fontFamily: 'Beiruti', fontSize: 11, color: Palette.muted, backgroundColor: Palette.surfaceMuted, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, writingDirection: 'rtl' as const },
  structureBox: { borderRadius: 13, backgroundColor: Palette.surfaceMuted, borderWidth: 1, borderColor: Palette.border, padding: 11, gap: 6 },
  structureHead: { flexDirection: 'row-reverse' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, gap: 8, flexWrap: 'wrap' as const },
  structureLabel: { fontFamily: 'Beiruti', fontSize: 11, color: Palette.muted, writingDirection: 'rtl' as const },
  patternPill: { fontFamily: 'Times New Roman', fontSize: 12, fontWeight: '800' as const, color: Palette.primary, backgroundColor: Palette.primarySoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  structureNote: { fontFamily: 'Beiruti', fontSize: 12, lineHeight: 19, color: Palette.ink, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  bridgeText: { fontFamily: 'Beiruti', fontSize: 12, lineHeight: 19, color: Palette.primary, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  clauseHint: { fontFamily: 'Beiruti', fontSize: 11, lineHeight: 18, color: Palette.muted, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  vocabSection: { gap: 7 },
  vocabToggle: { alignSelf: 'flex-end' as const },
  vocabToggleText: { fontFamily: 'Beiruti', fontSize: 12, color: Palette.primary, writingDirection: 'rtl' as const },
  anchorList: { flexDirection: 'row-reverse' as const, flexWrap: 'wrap' as const, gap: 6 },
  anchorChip: { flexDirection: 'row-reverse' as const, alignItems: 'center' as const, gap: 6, borderRadius: 9, backgroundColor: Palette.surfaceMuted, borderWidth: 1, borderColor: Palette.border, paddingHorizontal: 8, paddingVertical: 4 },
  anchorWord: { fontFamily: 'Times New Roman', fontSize: 12, fontWeight: '800' as const, color: Palette.ink, writingDirection: 'ltr' as const },
  anchorMeaning: { fontFamily: 'Beiruti', fontSize: 11, color: Palette.muted, writingDirection: 'rtl' as const },
  guidedCard: { borderRadius: 12, backgroundColor: Palette.primarySoft, borderWidth: 1, borderColor: Palette.border, paddingHorizontal: 12, paddingVertical: 10, gap: 4 },
  guidedTop: { flexDirection: 'row-reverse' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const },
  guidedLabel: { fontFamily: 'Beiruti', fontSize: 11, fontWeight: '400' as const, color: Palette.primary, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  speakIconBtn: { width: 30, height: 30, borderRadius: 999, backgroundColor: Palette.surface, alignItems: 'center' as const, justifyContent: 'center' as const },
  guidedSentence: { fontFamily: 'Times New Roman', fontSize: 18, lineHeight: 26, fontWeight: '800' as const, color: Palette.ink, textAlign: 'left' as const, writingDirection: 'ltr' as const },
  guidedPron: { fontFamily: 'Beiruti', fontSize: 12, color: Palette.muted, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  translation: { fontFamily: 'Beiruti', fontSize: 17, lineHeight: 28, color: Palette.ink, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  modeRow: { flexDirection: 'row-reverse' as const, gap: 8 },
  modePill: { borderRadius: 999, borderWidth: 1, borderColor: Palette.border, backgroundColor: Palette.surfaceMuted, paddingHorizontal: 11, paddingVertical: 5 },
  modePillActive: { borderColor: Palette.primary, backgroundColor: Palette.primarySoft },
  modePillText: { fontFamily: 'Beiruti', fontSize: 11, color: Palette.muted, writingDirection: 'rtl' as const },
  modePillTextActive: { color: Palette.primary },
  answerArea: { minHeight: 76, borderRadius: 13, borderWidth: 1, borderColor: Palette.primary, backgroundColor: Palette.primarySoft, padding: 10, flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 7, alignItems: 'center' as const },
  placeholder: { flex: 1, fontFamily: 'Beiruti', fontSize: 13, lineHeight: 21, color: Palette.muted, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  answerChip: { borderRadius: 9, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.primary, paddingHorizontal: 9, paddingVertical: 7 },
  answerChipOk: { borderColor: Palette.success, backgroundColor: 'rgba(16, 185, 129, 0.14)' },
  answerChipWrong: { borderColor: Palette.warning, backgroundColor: 'rgba(245, 158, 11, 0.15)' },
  answerText: { fontFamily: 'Times New Roman', color: Palette.ink, fontSize: 13, fontWeight: '800' as const, writingDirection: 'ltr' as const },
  wordBank: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, justifyContent: 'flex-start' as const, gap: 8 },
  wordChip: { borderRadius: 10, backgroundColor: Palette.surfaceMuted, borderWidth: 1, borderColor: Palette.border, paddingHorizontal: 10, paddingVertical: 8 },
  anchorWordChip: { borderColor: Palette.primary },
  hintedChip: { borderColor: Palette.success, backgroundColor: 'rgba(16, 185, 129, 0.16)' },
  usedChip: { opacity: .38 },
  wordText: { fontFamily: 'Times New Roman', color: Palette.ink, fontSize: 13, fontWeight: '800' as const, writingDirection: 'ltr' as const },
  usedText: { color: Palette.muted },
  actions: { flexDirection: 'row-reverse' as const, alignItems: 'center' as const, gap: 8 },
  primaryButton: { flex: 1, minHeight: 44, backgroundColor: Palette.primary, borderRadius: 12, paddingHorizontal: 12, alignItems: 'center' as const, justifyContent: 'center' as const },
  disabledBtn: { opacity: .45 },
  primaryButtonText: { fontFamily: 'Beiruti', color: '#FFFFFF', fontSize: 14, fontWeight: '400' as const, writingDirection: 'rtl' as const },
  hintButton: { minHeight: 44, backgroundColor: Palette.primarySoft, borderRadius: 12, borderWidth: 1, borderColor: Palette.border, paddingHorizontal: 12, alignItems: 'center' as const, justifyContent: 'center' as const },
  secondaryButton: { minHeight: 44, backgroundColor: Palette.surfaceMuted, borderRadius: 12, paddingHorizontal: 12, alignItems: 'center' as const, justifyContent: 'center' as const },
  secondaryButtonText: { fontFamily: 'Beiruti', color: Palette.ink, fontSize: 13, fontWeight: '400' as const, writingDirection: 'rtl' as const },
  hintBanner: { fontFamily: 'Beiruti', fontSize: 12, color: Palette.primary, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  resultBox: { borderRadius: 12, borderWidth: 1, padding: 11, gap: 8 },
  resultOk: { borderColor: Palette.success, backgroundColor: 'rgba(16, 185, 129, 0.10)' },
  resultWarn: { borderColor: Palette.warning, backgroundColor: 'rgba(245, 158, 11, 0.10)' },
  feedback: { fontFamily: 'Beiruti', fontSize: 13, lineHeight: 20, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  success: { color: Palette.success },
  tryAgain: { color: Palette.warning },
  solvedRow: { gap: 8 },
  solvedSentence: { fontFamily: 'Times New Roman', fontSize: 16, lineHeight: 24, fontWeight: '800' as const, color: Palette.ink, textAlign: 'left' as const, writingDirection: 'ltr' as const },
  solvedActions: { flexDirection: 'row-reverse' as const, gap: 8, alignItems: 'center' as const },
  speakChip: { flexDirection: 'row-reverse' as const, alignItems: 'center' as const, gap: 5, borderRadius: 10, borderWidth: 1, borderColor: Palette.border, backgroundColor: Palette.surface, paddingHorizontal: 11, paddingVertical: 7 },
  speakChipText: { fontFamily: 'Beiruti', fontSize: 12, color: Palette.primary, writingDirection: 'rtl' as const },
  nextChip: { borderRadius: 10, backgroundColor: Palette.primary, paddingHorizontal: 12, paddingVertical: 7 },
  nextChipText: { fontFamily: 'Beiruti', fontSize: 12, color: '#FFFFFF', writingDirection: 'rtl' as const },
});
