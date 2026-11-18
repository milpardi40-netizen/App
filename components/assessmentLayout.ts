import { StyleSheet } from 'react-native';
import { EnglishPalette as Palette } from '@/components/EnglishSupplementTask';
import { Typography } from '@/lib/theme';

/**
 * One layout for the «سنجش کوتاه» page, shared by every language.
 *
 * The assessment used to be built from each language's own copy of these styles: prompts sat on the
 * right, Latin choices on the left, cards grew and shrank with the length of the text, and the buttons
 * were aligned differently in German, Russian and Turkish. The six courses now share the values below,
 * so the page reads as one tidy, centred column of equally sized cards in every language.
 *
 * These are presentation values only: no question, choice, explanation or answer key is touched.
 */
export const ASSESSMENT_MAX_WIDTH = 560;

/**
 * The answer rows are the equal-sized boxes: every choice has the same height in every language, so a
 * stack of two-line Persian options and a stack of one-word Latin options line up the same way.
 * A question itself is never padded out to a fixed height — that left short questions floating in
 * empty cards with their text in the middle, which is what made the page look untidy.
 */
export const ASSESSMENT_CHOICE_MIN_HEIGHT = 48;
/** Minimum height for the one framed surface that holds the questions. */
export const ASSESSMENT_CARD_MIN_HEIGHT = 0;

export const assessmentStyles = StyleSheet.create({
  /** Page column: centred, capped, equal gaps. */
  assessmentPage: {
    width: '100%',
    maxWidth: ASSESSMENT_MAX_WIDTH,
    alignSelf: 'center',
    alignItems: 'stretch',
    minWidth: 0,
    gap: 14,
  },
  /**
   * One framed surface holds the whole assessment. Every question used to be its own floating card,
   * which read as a loose pile of tiles; the questions are now even sections of a single card.
   */
  evidenceCard: {
    width: '100%',
    maxWidth: ASSESSMENT_MAX_WIDTH,
    alignSelf: 'center',
    alignItems: 'stretch',
    minWidth: 0,
    marginTop: 18,
    gap: 10,
    padding: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    shadowColor: '#211A68',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  /**
   * A question is an inset panel of that card: same padding, same radius, same gap for every question,
   * and no forced height, so the stack is even without leaving empty space in short questions.
   */
  question: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    gap: 9,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7F2',
    backgroundColor: '#FBFBFF',
  },
  questionHeader: { width: '100%', flexDirection: 'row-reverse', alignItems: 'center', gap: 9 },
  questionBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: Palette.primarySoft },
  questionBadgeText: { fontFamily: Typography.fontFamily, color: Palette.primaryDark, fontSize: 11, textAlign: 'center', writingDirection: 'rtl' },
  questionRule: { height: 1, flex: 1, backgroundColor: '#E8EAF4' },
  questionPrompt: {
    fontFamily: Typography.fontFamily,
    fontSize: 13,
    lineHeight: 24,
    color: Palette.ink,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  choice: {
    width: '100%',
    alignSelf: 'stretch',
    flexGrow: 0,
    minHeight: ASSESSMENT_CHOICE_MIN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row-reverse',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  choiceLabel: { flex: 1, minWidth: 0, textAlign: 'center' },
  choiceIndicator: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#C9CEE2', alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.surface },
  choiceIndicatorActive: { borderColor: Palette.primary, backgroundColor: Palette.primary },
  choiceIndicatorText: { fontFamily: Typography.boldFontFamily, color: '#FFFFFF', fontSize: 13, lineHeight: 18 },
  choiceSelected: { borderColor: Palette.primary, backgroundColor: Palette.primarySoft },
  choiceCorrect: { borderColor: Palette.success, backgroundColor: Palette.successSoft },
  choiceTarget: {
    fontFamily: 'Times New Roman',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 21,
    color: Palette.ink,
    textAlign: 'center',
    writingDirection: 'ltr',
  },
  choicePersian: {
    fontFamily: Typography.fontFamily,
    fontSize: 13,
    lineHeight: 21,
    color: Palette.ink,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  feedbackBox: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 12,
    backgroundColor: Palette.surface,
  },
  feedbackTitle: {
    fontFamily: Typography.fontFamily,
    color: Palette.success,
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  feedbackError: {
    fontFamily: Typography.fontFamily,
    color: Palette.danger,
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  feedbackText: {
    fontFamily: Typography.fontFamily,
    color: Palette.text,
    fontSize: 11,
    lineHeight: 19,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  retryAnswer: {
    alignSelf: 'center',
    minHeight: 40,
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  retryAnswerText: {
    fontFamily: Typography.fontFamily,
    color: Palette.primary,
    fontSize: 11,
    fontWeight: '400',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  showAnswersButton: {
    width: '100%',
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  showAnswersText: {
    fontFamily: Typography.fontFamily,
    color: Palette.primaryDark,
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
