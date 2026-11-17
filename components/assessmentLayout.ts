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
export const ASSESSMENT_MAX_WIDTH = 620;

/** Height floor for one question card and for one choice, so the cards never look uneven. */
export const ASSESSMENT_CARD_MIN_HEIGHT = 148;
export const ASSESSMENT_CHOICE_MIN_HEIGHT = 48;

export const assessmentStyles = StyleSheet.create({
  /** Page column: centred, capped, equal gaps. */
  assessmentPage: {
    width: '100%',
    maxWidth: ASSESSMENT_MAX_WIDTH,
    alignSelf: 'center',
    alignItems: 'stretch',
    gap: 14,
  },
  /** Outer container of the assessment; the questions themselves are the cards. */
  evidenceCard: {
    width: '100%',
    maxWidth: ASSESSMENT_MAX_WIDTH,
    alignSelf: 'center',
    marginTop: 18,
    gap: 14,
    padding: 0,
    backgroundColor: 'transparent',
  },
  /** Every question is its own card, with the same floor height whatever its text length. */
  question: {
    width: '100%',
    minHeight: ASSESSMENT_CARD_MIN_HEIGHT,
    justifyContent: 'center',
    gap: 11,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    shadowColor: '#211A68',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  questionPrompt: {
    fontFamily: Typography.fontFamily,
    fontSize: 13,
    lineHeight: 24,
    color: Palette.text,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  choice: {
    width: '100%',
    minHeight: ASSESSMENT_CHOICE_MIN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
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
    borderRadius: 14,
    padding: 12,
    backgroundColor: Palette.surfaceMuted,
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
