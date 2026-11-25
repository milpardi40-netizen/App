import { EN_RU_DIALOGUE_OVERRIDES } from './dialogues/enRuOverrides';
import { STARTER_A1_PART1_DIALOGUES } from './dialogues/starterA1Part1';
import { STARTER_A1_PART2_DIALOGUES } from './dialogues/starterA1Part2';
import { STARTER_A2_DIALOGUES } from './dialogues/starterA2';
import { STARTER_B1_DIALOGUES } from './dialogues/starterB1';
import { STARTER_B2_DIALOGUES } from './dialogues/starterB2';
import { STARTER_FOUNDATION_PRE_DIALOGUES } from './dialogues/starterFoundationAndPre';
import { TR_PRE_DIALOGUE_OVERRIDES } from './dialogues/trPreOverrides';
import { TR_UPPER_DIALOGUE_OVERRIDES } from './dialogues/trUpperOverrides';
import type { DialogueLine, DialogueMap } from './dialogues/types';

export type { DialogueLine, DialogueMap };

export const CONVERSATION_ROOM_DIALOGUES: DialogueMap = {
  ...EN_RU_DIALOGUE_OVERRIDES,
  ...TR_PRE_DIALOGUE_OVERRIDES,
  ...TR_UPPER_DIALOGUE_OVERRIDES,
  ...STARTER_FOUNDATION_PRE_DIALOGUES,
  ...STARTER_A1_PART1_DIALOGUES,
  ...STARTER_A1_PART2_DIALOGUES,
  ...STARTER_A2_DIALOGUES,
  ...STARTER_B1_DIALOGUES,
  ...STARTER_B2_DIALOGUES,
};

export function resolveConversationDialogue(
  lessonId: string | undefined,
  fallback: readonly DialogueLine[] = [],
): DialogueLine[] {
  if (lessonId) {
    const curated = CONVERSATION_ROOM_DIALOGUES[lessonId];
    if (curated && curated.length > 0) {
      return curated.map((line) => ({ ...line }));
    }
  }
  return fallback.map((line) => ({ ...line }));
}
