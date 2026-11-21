import { tokens } from './speechScore';

export type BranchingLocale = 'en-US' | 'ru-RU';
export type ConversationLevel = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type ConversationMode = 'guided' | 'controlled' | 'semi-free' | 'semantic' | 'branching' | 'open-roleplay';

export type Choice = { text: string; correct: boolean };
export type SemanticBranch = {
  match: string[][];
  reply: { text: string; fa: string };
};
export type SemanticTurn = {
  promptFa: string;
  concepts: string[][];
  targetText?: string;
  choices?: Choice[];
  chunks?: string[];
  branches?: SemanticBranch[];
  fallbackReply?: { text: string; fa: string };
};
export type BranchingConversation = {
  level: ConversationLevel;
  mode: ConversationMode;
  turns: Record<number, SemanticTurn>;
};
export type SemanticResult = {
  accepted: boolean;
  score: number;
  feedback: string;
  branchReply?: { text: string; fa: string };
};

const normalize = (value: string) => tokens(value).join(' ');
const wordSet = (value: string) => new Set(normalize(value).split(' ').filter(Boolean));
const STOP = new Set([
  'the', 'a', 'an', 'is', 'am', 'are', 'was', 'were', 'to', 'of', 'and', 'or', 'i', 'you', 'we', 'they', 'it',
  'this', 'that', 'in', 'on', 'at', 'for', 'with', 'my', 'your', 'me', 'do', 'does', 'did', 'be', 'will',
  'и', 'а', 'но', 'это', 'этот', 'эта', 'я', 'мы', 'вы', 'ты', 'он', 'она', 'они', 'в', 'на', 'к', 'с', 'у',
  'из', 'за', 'что', 'как', 'не', 'да', 'нет',
]);
const containsAny = (text: string, options: string[]) => {
  const normalized = normalize(text);
  return options.some(option => normalize(option).split(' ').every(token => normalized.includes(token)));
};

function overlapScore(expected: string, heard: string) {
  const expectedWords = [...wordSet(expected)].filter(word => !STOP.has(word) && word.length > 1);
  if (!expectedWords.length) return normalize(expected) === normalize(heard) ? 1 : 0;
  const heardWords = wordSet(heard);
  return expectedWords.filter(word => heardWords.has(word)).length / expectedWords.length;
}

export function evaluateSemanticResponse(rule: SemanticTurn, heard: string, locale: BranchingLocale, level: ConversationLevel): SemanticResult {
  const answer = heard.trim();
  const concepts = rule.concepts.length ? rule.concepts : [[]];
  const covered = concepts.filter(group => containsAny(answer, group)).length;
  const conceptScore = covered / concepts.length;
  const lexicalScore = rule.targetText ? overlapScore(rule.targetText, answer) : conceptScore;
  const branch = rule.branches?.find(item => item.match.every(group => containsAny(answer, group)));
  const lengthCredit = answer.length >= (locale === 'ru-RU' ? 8 : 12) ? 10 : 0;
  const score = Math.round((Math.max(conceptScore, lexicalScore) * 70) + (lexicalScore * 20) + lengthCredit);
  const threshold = level === 'Pre-A1' ? 95 : level === 'A1' ? 65 : level === 'A2' ? 65 : level === 'B1' ? 70 : 75;
  const accepted = rule.choices?.length
    ? rule.choices.some(choice => choice.correct && normalize(choice.text) === normalize(answer))
    : score >= threshold && (conceptScore >= 0.55 || lexicalScore >= 0.6);
  if (accepted) {
    return {
      accepted: true,
      score,
      feedback: level === 'B2' || level === 'C1' ? 'منظور، لحن و مسیر پاسخ مناسب بود.' : level === 'Pre-A1' || level === 'A1' ? 'آفرین؛ پاسخ مناسب موقعیت بود.' : 'منظور پاسخ درست منتقل شد.',
      branchReply: branch?.reply ?? rule.fallbackReply,
    };
  }
  const missing = Math.max(1, concepts.length - covered);
  return {
    accepted: false,
    score,
    feedback: missing > 0
      ? `پاسخ قابل فهم است، اما ${missing === 1 ? 'یک بخش مهم' : 'چند بخش مهم'} از منظور موقعیت کامل نشد.`
      : 'پاسخ به موقعیت نزدیک بود؛ آن را روشن‌تر و کامل‌تر بیان کن.',
  };
}

const EN_B1: BranchingConversation = {
  level: 'B1', mode: 'semantic', turns: {
    1: { promptFa: 'زمان فعلی مناسب نیست؛ یک زمان جایگزین پیشنهاد بده.', concepts: [['not', "can't", 'busy', 'unavailable'], ['wednesday', 'thursday', 'friday', 'afternoon', 'tomorrow', 'later']], fallbackReply: { text: 'That works for me. What time would be best for you?', fa: 'این زمان برای من مناسب است. چه ساعتی برایت بهتر است؟' } },
    3: { promptFa: 'زمان پیشنهادی را تأیید کن و بگو که منتظر جلسه هستی.', concepts: [['works', 'perfect', 'good', 'fine', 'okay'], ['see you', 'looking forward', 'meet', 'meeting']], fallbackReply: { text: 'Great. I will send a calendar invitation shortly.', fa: 'عالی است. به‌زودی دعوت‌نامهٔ تقویم را می‌فرستم.' } },
  },
};
const EN_B2: BranchingConversation = {
  level: 'B2', mode: 'branching', turns: {
    1: { promptFa: 'به پیشنهاد همکار پاسخ بده: موافقت، مخالفت مؤدبانه، یا درخواست اطلاعات بیشتر.', concepts: [['agree', 'support', 'reasonable', 'yes', 'disagree', 'concern', 'however', 'but', 'more', 'information', 'clarify', 'why']], branches: [{ match: [['agree', 'support', 'reasonable', 'yes']], reply: { text: 'Good. Then let us agree on the budget and timeline.', fa: 'خوب است. پس دربارهٔ بودجه و زمان‌بندی توافق کنیم.' } }, { match: [['disagree', 'concern', 'however', 'but']], reply: { text: 'I understand your concern. What alternative do you suggest?', fa: 'نگرانی‌ات را درک می‌کنم. چه گزینهٔ دیگری پیشنهاد می‌کنی؟' } }, { match: [['more', 'information', 'clarify', 'why']], reply: { text: 'Of course. I can explain the costs and expected results.', fa: 'حتماً. می‌توانم هزینه‌ها و نتایج مورد انتظار را توضیح دهم.' } }], fallbackReply: { text: 'Could you explain your position a little more?', fa: 'می‌توانی دیدگاهت را کمی بیشتر توضیح بدهی؟' } },
    3: { promptFa: 'یک راه‌حل عملی پیشنهاد بده و دلیل کوتاهی برای آن بیاور.', concepts: [['could', 'should', 'suggest', 'recommend', 'propose', 'try'], ['because', 'since', 'so', 'reduce', 'improve', 'cost', 'risk']], fallbackReply: { text: 'That sounds practical. Let us define the next step.', fa: 'عملی به نظر می‌رسد. بیایید گام بعدی را مشخص کنیم.' } },
  },
};
const RU_B1: BranchingConversation = {
  level: 'B1', mode: 'semantic', turns: {
    1: { promptFa: 'نظر خود را بگو و حداقل یک دلیل اضافه کن.', concepts: [['думаю', 'считаю', 'мнение', 'по-моему', 'я'], ['потому', 'так как', 'поскольку', 'потому что', 'из-за']], fallbackReply: { text: 'Понятно. А можете привести пример?', fa: 'متوجه شدم. می‌توانید یک مثال بزنید؟' } },
    3: { promptFa: 'یک پیشنهاد یا راه‌حل مشخص ارائه کن.', concepts: [['можно', 'стоит', 'предлагаю', 'лучше', 'нужно', 'давайте'], ['сделать', 'попробовать', 'изменить', 'начать', 'решить']], fallbackReply: { text: 'Хорошо, давайте обсудим этот вариант.', fa: 'خوب است، بیایید این گزینه را بررسی کنیم.' } },
  },
};
const RU_B2: BranchingConversation = {
  level: 'B2', mode: 'branching', turns: {
    1: { promptFa: 'با لحن رسمی موضع خود را بیان کن و یک دلیل یا پیامد اضافه کن.', concepts: [['согласен', 'согласна', 'поддерживаю', 'считаю', 'думаю', 'однако', 'но'], ['потому', 'поскольку', 'поэтому', 'риск', 'стоимость', 'результат', 'последствие']], branches: [{ match: [['согласен', 'согласна', 'поддерживаю']], reply: { text: 'Тогда давайте согласуем сроки и ответственность.', fa: 'پس بیایید زمان‌بندی و مسئولیت را مشخص کنیم.' } }, { match: [['однако', 'но']], reply: { text: 'Понимаю. Какой вариант вы предлагаете вместо этого?', fa: 'متوجه‌ام. در عوض چه گزینه‌ای پیشنهاد می‌کنید؟' } }], fallbackReply: { text: 'Не могли бы вы уточнить свою позицию?', fa: 'ممکن است موضع خود را دقیق‌تر توضیح دهید؟' } },
    3: { promptFa: 'یک راه‌حل مشروط ارائه کن و پیامد احتمالی آن را توضیح بده.', concepts: [['если', 'можно', 'стоит', 'предлагаю', 'лучше'], ['будет', 'сможем', 'позволит', 'снизит', 'увеличит', 'поможет']], fallbackReply: { text: 'Это разумный вариант. Давайте проверим его на практике.', fa: 'این گزینهٔ منطقی‌ای است. بیایید آن را در عمل بررسی کنیم.' } },
  },
};

const DEFINITIONS: Record<string, BranchingConversation> = {
  'communication-negotiating-project-priorities': EN_B1,
  'b2-survival-society-negotiation': EN_B2,
  'coherent-opinions': RU_B1,
  'modality-register': RU_B2,
};

const LEVEL_BY_ID: Record<number, ConversationLevel> = { 0: 'Pre-A1', 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1' };
const modeFor = (level: ConversationLevel): ConversationMode => level === 'Pre-A1' ? 'guided' : level === 'A1' ? 'controlled' : level === 'A2' ? 'semi-free' : level === 'B1' ? 'semantic' : level === 'B2' ? 'branching' : 'open-roleplay';
const contentWords = (text: string) => [...wordSet(text)].filter(word => !STOP.has(word) && word.length > 2);

/** Generates a level-appropriate conversation contract for every catalog lesson, without a manual ID registry. */
export function conversationPracticeForLesson(
  lesson: { id: string; levelId: number; sentences: ReadonlyArray<{ text?: string; en?: string; fa: string }>; dialogue?: ReadonlyArray<{ text: string; fa: string; role?: string; speaker?: string }> },
  locale: BranchingLocale,
): BranchingConversation {
  const level = LEVEL_BY_ID[Math.max(0, Math.min(5, lesson.levelId))] ?? 'A1';
  const mode = modeFor(level);
  const lines: Array<{ text: string; fa: string; role?: string; speaker?: string }> = (lesson.dialogue?.length
    ? lesson.dialogue.map(line => ({ ...line, text: line.text.trim() }))
    : lesson.sentences.map((sentence, index) => ({ text: sentence.text || sentence.en || '', fa: sentence.fa, role: index % 2 ? 'learner' : 'partner' })))
    .filter(line => line.text.trim());
  const turns: Record<number, SemanticTurn> = {};
  lines.forEach((line, index) => {
    if (line.role !== 'learner' && line.speaker !== 'learner') return;
    const target = line.text.trim();
    const words = contentWords(target);
    const distractors = lines.filter(candidate => candidate !== line && candidate.role !== 'learner' && candidate.text.trim()).slice(0, 2).map(candidate => ({ text: candidate.text, correct: false }));
    const choices = (level === 'Pre-A1' || level === 'A1')
      ? [{ text: target, correct: true }, ...distractors].slice(0, 3)
      : undefined;
    turns[index] = {
      promptFa: line.fa || target,
      targetText: target,
      concepts: words.length ? [words] : [[target]],
      choices,
      chunks: level === 'A1' ? target.split(/\s+/).filter(Boolean) : undefined,
    };
  });
  const generated: BranchingConversation = { level, mode, turns };
  const explicit = DEFINITIONS[lesson.id];
  if (!explicit) return generated;
  const mergedTurns = { ...generated.turns };
  Object.entries(explicit.turns).forEach(([key, turn]) => {
    const index = Number(key);
    mergedTurns[index] = { ...turn, targetText: generated.turns[index]?.targetText };
  });
  return { ...explicit, turns: mergedTurns };
}

/** Backwards-compatible lookup for the four authored pilots. */
export function branchingConversationFor(lessonId: string): BranchingConversation | null {
  return DEFINITIONS[lessonId] ?? null;
}
