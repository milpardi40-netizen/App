export type FreeConversationLanguage = 'en' | 'ru';

export type FreeConversationPlan = {
  title: string;
  mission: string;
  starter: string;
  prompts: string[];
  boundary: string;
};

type PlanInput = {
  language: FreeConversationLanguage;
  levelId: number;
  lessonId?: string;
  lessonTitle?: string;
  situation?: string;
};

const ENGLISH_PLANS: Array<Omit<FreeConversationPlan, 'boundary'>> = [
  {
    title: 'Make it personal',
    mission: 'Share a real experience connected to the lesson topic and ask your partner about theirs.',
    starter: 'I have a similar experience. Can I tell you what happened?',
    prompts: ['What happened in your experience?', 'How did you feel about it?', 'What would you do differently next time?'],
  },
  {
    title: 'Change the situation',
    mission: 'Imagine that the situation from the lesson changes. Negotiate a practical response together.',
    starter: 'There is a new problem. What should we do first?',
    prompts: ['What is the main problem now?', 'Which option seems safest?', 'Can you suggest another solution?'],
  },
  {
    title: 'Ask and discover',
    mission: 'Use the topic as a reason to learn something new about your partner, not to repeat the lesson dialogue.',
    starter: 'I want to hear your view. How would you handle this?',
    prompts: ['Why do you think that?', 'Can you give me an example?', 'Has your opinion changed before?'],
  },
  {
    title: 'Reach an agreement',
    mission: 'Take different positions and finish with one decision you can both accept.',
    starter: 'We may not agree yet, but let us find a workable plan.',
    prompts: ['What matters most to you?', 'What could we compromise on?', 'What is our next step?'],
  },
];

const RUSSIAN_PLANS: Array<Omit<FreeConversationPlan, 'boundary'>> = [
  {
    title: 'Расскажи о своём опыте',
    mission: 'Расскажите о личном опыте по теме урока и спросите собеседника о его опыте.',
    starter: 'У меня был похожий опыт. Можно расскажу, что произошло?',
    prompts: ['Что произошло в твоём случае?', 'Что ты почувствовал?', 'Что бы ты сделал иначе?'],
  },
  {
    title: 'Измени ситуацию',
    mission: 'Представьте, что ситуация изменилась, и вместе найдите практичное решение.',
    starter: 'Возникла новая проблема. Что нам сделать сначала?',
    prompts: ['В чём теперь главная проблема?', 'Какой вариант кажется безопаснее?', 'Какое ещё решение ты предлагаешь?'],
  },
  {
    title: 'Спроси и узнай',
    mission: 'Используйте тему урока, чтобы узнать новое мнение собеседника, а не повторять готовый диалог.',
    starter: 'Мне интересно твоё мнение. Как бы ты поступил?',
    prompts: ['Почему ты так думаешь?', 'Можешь привести пример?', 'Твоё мнение когда-нибудь менялось?'],
  },
  {
    title: 'Приди к соглашению',
    mission: 'Займите разные позиции и закончите разговор решением, которое подходит вам обоим.',
    starter: 'Мы пока не согласны, но давай найдём рабочий план.',
    prompts: ['Что для тебя важнее всего?', 'В чём мы можем пойти на компромисс?', 'Какой будет следующий шаг?'],
  },
];

const levelName = (levelId: number) => ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'][Math.max(0, Math.min(5, levelId))] ?? 'A1';
const pickIndex = (value: string) => [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);

/**
 * The free-chat contract is intentionally generated from templates, not from the lesson script.
 * Lesson text is never copied into this plan; the lesson only supplies a broad topic label.
 */
export function freeConversationPlan(input: PlanInput): FreeConversationPlan {
  const catalog = input.language === 'ru' ? RUSSIAN_PLANS : ENGLISH_PLANS;
  const selected = catalog[pickIndex(`${input.lessonId ?? ''}:${input.lessonTitle ?? ''}`) % catalog.length];
  const level = levelName(input.levelId);
  const boundary = input.language === 'ru'
    ? `Свободный разговор · ${level} · не повторяйте готовые реплики урока`
    : `Free conversation · ${level} · do not repeat the lesson script`;
  return { ...selected, boundary };
}
