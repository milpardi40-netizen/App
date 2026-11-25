export type DialogueLine = {
  speaker: string;
  role?: 'learner' | 'partner';
  text: string;
  fa: string;
};

export type DialogueMap = Record<string, readonly DialogueLine[]>;
