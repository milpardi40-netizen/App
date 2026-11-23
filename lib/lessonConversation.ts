export type LessonConversationRole = 'learner' | 'partner';

/** Durable, text-only state for the scripted conversation practice in one lesson. */
export interface LessonConversationSession {
  started: boolean;
  currentTurn: number;
  myRole?: string;
  attempts: number;
  revealed: boolean;
  completed: boolean;
}

export function freshLessonConversation(): LessonConversationSession {
  return {
    started: false,
    currentTurn: 0,
    attempts: 0,
    revealed: false,
    completed: false,
  };
}

export function isLessonConversationSession(value: unknown): value is LessonConversationSession {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const session = value as Partial<LessonConversationSession>;
  const currentTurn = session.currentTurn;
  const attempts = session.attempts;
  return typeof session.started === 'boolean'
    && typeof currentTurn === 'number' && Number.isInteger(currentTurn) && currentTurn >= 0
    && (session.myRole === undefined || (typeof session.myRole === 'string' && session.myRole.length <= 160))
    && typeof attempts === 'number' && Number.isInteger(attempts) && attempts >= 0 && attempts <= 100
    && typeof session.revealed === 'boolean'
    && typeof session.completed === 'boolean';
}

export function normalizeLessonConversation(
  value: unknown,
  turnCount: number,
  roles: readonly string[],
  defaultRole?: string | null,
): LessonConversationSession {
  const fallback = freshLessonConversation();
  if (!isLessonConversationSession(value)) return fallback;
  const maxTurn = Math.max(0, Math.floor(turnCount));
  const currentTurn = Math.min(value.currentTurn, maxTurn);
  const myRole = value.myRole && roles.includes(value.myRole)
    ? value.myRole
    : defaultRole && roles.includes(defaultRole)
      ? defaultRole
      : roles[0];
  const completed = value.completed || currentTurn >= maxTurn && maxTurn > 0;
  return {
    started: value.started || currentTurn > 0 || completed,
    currentTurn,
    ...(myRole ? { myRole } : {}),
    attempts: Math.min(value.attempts, 100),
    revealed: value.revealed,
    completed,
  };
}

const EXPLICIT_LEARNER_SPEAKERS = new Set(['learner', 'you', 'شما', 'زبان‌آموز', 'زبانآموز']);

/**
 * Ensures every dialogue turn has an explicit `role` ('partner' | 'learner') and distinct
 * partner/learner speaker names, matching `conversationPracticeForLesson` in `branchingConversation.ts`.
 */
export function withInferredDialogueRoles<T extends { speaker: string; role?: LessonConversationRole; text: string; fa: string }>(
  dialogue: ReadonlyArray<T>,
): Array<T & { role: LessonConversationRole }> {
  const valid = dialogue.filter(line => line.text.trim());
  const names = [...new Set(valid.map(line => line.speaker.trim()).filter(Boolean))];
  const explicit = valid.find(line => line.role === 'learner')?.speaker.trim()
    ?? names.find(name => EXPLICIT_LEARNER_SPEAKERS.has(name.toLocaleLowerCase('fa-IR')));
  const inferredLearner = explicit ?? (names.length >= 2 ? names[1] : null);

  return valid.map((line, index) => {
    const trimmedSpeaker = line.speaker.trim();
    const role: LessonConversationRole = line.role
      ? line.role
      : inferredLearner
        ? (trimmedSpeaker === inferredLearner ? 'learner' : 'partner')
        : (index % 2 === 1 ? 'learner' : 'partner');
    const speaker = names.length <= 1
      ? (role === 'learner' ? 'شما' : trimmedSpeaker || 'هم‌صحبت')
      : (trimmedSpeaker || (role === 'learner' ? 'شما' : 'هم‌صحبت'));
    return { ...line, speaker, role };
  });
}
