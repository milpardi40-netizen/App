import type { DirectMessage } from './conversations';

/**
 * Turn-based conversation practice for the conversation messenger.
 *
 * The old free-chat plan is gone. A conversation is now a fixed number of
 * turns; each turn has exactly one mission for each participant. The plan is
 * generated from the conversation id so both participants always see the same
 * missions in the same order. Progress is shown on a 0–100 scale.
 */

export type TurnConversationLanguage = 'en' | 'ru';
export type TurnSlot = 0 | 1;

export type TurnPrompt = {
  /** The single sentence or question for this turn, in the target language. */
  text: string;
  /** A short Persian explanation of what the learner should do. */
  hint: string;
  /** Topic words that keep the answer on the mission. */
  cues: readonly string[];
  /** Any-of groups that describe the expected communicative move. */
  concepts: readonly (readonly string[])[];
  /** Minimum number of words for a complete answer. */
  minWords: number;
  /** Optional difficulty profile for level-scoped lesson plans. */
  strictness?: 'gentle' | 'standard' | 'challenging';
};

export type ConversationTurn = {
  id: string;
  focusFa: string;
  first: TurnPrompt;
  second: TurnPrompt;
};

export type TurnScenario = {
  id: string;
  titleFa: string;
  missionFa: string;
  topicFa: string;
  cues: readonly string[];
  opening: string;
  personal: string;
  reason: string;
  problem: string;
  close: string;
};

export type TurnConversationPlan = {
  language: TurnConversationLanguage;
  scenarioId: string;
  titleFa: string;
  missionFa: string;
  topicFa: string;
  levelLabel: string;
  difficultyLabel?: string;
  turns: readonly ConversationTurn[];
};

export type TurnAnswerFeedback = {
  score: number;
  positive: string;
  correction: string;
  cueScore: number;
  conceptScore: number;
  lengthScore: number;
  varietyScore: number;
};

export type TurnReport = {
  overall: number;
  fluency: number;
  vocabulary: number;
  interaction: number;
  errors: { title: string; detail: string; correction?: string }[];
  nextPractice: string;
  turnsCompleted: number;
  answersAnalyzed: number;
  averageScore: number;
  progress: number;
  wordsSpoken: number;
};

export type TurnState = {
  allAnswers: DirectMessage[];
  sessionAnswers: DirectMessage[];
  sessionStart: number;
  missionIndex: number;
  slot: TurnSlot;
  firstResponderId: string;
  secondResponderId: string | null;
  myTurn: boolean;
  completedTurns: number;
  progress: number;
  finished: boolean;
  currentPrompt: TurnPrompt | null;
  currentTurn: ConversationTurn | null;
};

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const ENGLISH_SCENARIOS: readonly TurnScenario[] = [
  {
    id: 'daily-routine',
    titleFa: 'روزمرهٔ من',
    missionFa: 'دربارهٔ روزهای معمولی و عادت‌های خود صحبت کنید.',
    topicFa: 'روزمره',
    cues: ['morning', 'work', 'usually', 'weekend', 'breakfast', 'tired', 'early', 'home', 'day'],
    opening: 'What does your usual day look like?',
    personal: 'Describe one part of your day that you really enjoy.',
    reason: 'Explain why that part of your day matters to you.',
    problem: 'Describe one thing that makes your daily routine difficult.',
    close: 'Suggest one small change for a better day.',
  },
  {
    id: 'travel',
    titleFa: 'سفر',
    missionFa: 'دربارهٔ یک سفر واقعی یا رویایی صحبت کنید.',
    topicFa: 'سفر',
    cues: ['trip', 'travel', 'city', 'beach', 'mountain', 'flight', 'hotel', 'visit', 'summer', 'abroad', 'place'],
    opening: 'What is the best trip you have ever taken?',
    personal: 'Describe one place from that trip in detail.',
    reason: 'Explain why that trip was important to you.',
    problem: 'Describe one travel problem you have experienced.',
    close: 'Suggest a destination for your partner’s next trip.',
  },
  {
    id: 'food',
    titleFa: 'غذا و آشپزی',
    missionFa: 'دربارهٔ غذا، سلیقه و تجربهٔ آشپزی صحبت کنید.',
    topicFa: 'غذا',
    cues: ['food', 'cook', 'dish', 'taste', 'restaurant', 'dinner', 'spicy', 'sweet', 'recipe', 'eat', 'meal'],
    opening: 'What dish can you cook well?',
    personal: 'Describe a meal that you will never forget.',
    reason: 'Explain why food brings people together.',
    problem: 'Describe a cooking mistake you have made.',
    close: 'Invite your partner to try one of your favourite dishes.',
  },
  {
    id: 'work-study',
    titleFa: 'کار و درس',
    missionFa: 'دربارهٔ کار، درس و اهداف حرفه‌ای صحبت کنید.',
    topicFa: 'کار و درس',
    cues: ['job', 'work', 'study', 'school', 'teacher', 'boss', 'project', 'deadline', 'learn', 'goal', 'task'],
    opening: 'What do you do for work or study?',
    personal: 'Describe a project or task you are proud of.',
    reason: 'Explain what you enjoy most about your work or studies.',
    problem: 'Describe one challenge in your work or studies.',
    close: 'Suggest one skill your partner could learn next.',
  },
  {
    id: 'hobbies',
    titleFa: 'سرگرمی و وقت آزاد',
    missionFa: 'دربارهٔ کارهایی که برای خوشحالی انجام می‌دهید صحبت کنید.',
    topicFa: 'وقت آزاد',
    cues: ['hobby', 'music', 'sport', 'book', 'film', 'game', 'weekend', 'play', 'watch', 'relax', 'free time'],
    opening: 'What do you do in your free time?',
    personal: 'Describe a hobby that makes you lose track of time.',
    reason: 'Explain why this hobby is good for you.',
    problem: 'Describe a time you wanted to try something new but couldn’t.',
    close: 'Invite your partner to try your hobby with you.',
  },
  {
    id: 'health',
    titleFa: 'سلامت و سبک زندگی',
    missionFa: 'دربارهٔ سلامت، عادت‌ها و انرژی روزانه صحبت کنید.',
    topicFa: 'سلامت',
    cues: ['health', 'sleep', 'exercise', 'water', 'doctor', 'tired', 'energy', 'walk', 'stress', 'food', 'habit'],
    opening: 'What do you do to stay healthy?',
    personal: 'Describe one healthy habit you are proud of.',
    reason: 'Explain why sleep or exercise matters to you.',
    problem: 'Describe one unhealthy habit you want to change.',
    close: 'Suggest one small healthy change for your partner.',
  },
  {
    id: 'city',
    titleFa: 'شهر و محله',
    missionFa: 'دربارهٔ جایی که زندگی می‌کنید و کارهای آنجا صحبت کنید.',
    topicFa: 'شهر',
    cues: ['city', 'neighbourhood', 'street', 'park', 'shop', 'transport', 'quiet', 'busy', 'live', 'place', 'area'],
    opening: 'What is your city or neighbourhood like?',
    personal: 'Describe your favourite place in your city.',
    reason: 'Explain why you like living there.',
    problem: 'Describe one thing you would change about your city.',
    close: 'Recommend one place your partner should visit.',
  },
  {
    id: 'plans',
    titleFa: 'برنامه‌ها و آینده',
    missionFa: 'دربارهٔ برنامه‌های واقعی و اهداف آینده صحبت کنید.',
    topicFa: 'برنامه‌ها',
    cues: ['plan', 'future', 'goal', 'next year', 'hope', 'want', 'learn', 'travel', 'job', 'dream', 'month'],
    opening: 'What is your main goal for this year?',
    personal: 'Describe one plan you are excited about.',
    reason: 'Explain why this goal matters to you.',
    problem: 'Describe one thing that could stop your plan.',
    close: 'Suggest a first step for your partner’s goal.',
  },
];

const RUSSIAN_SCENARIOS: readonly TurnScenario[] = [
  {
    id: 'daily-routine',
    titleFa: 'روزمرهٔ من',
    missionFa: 'دربارهٔ روزهای معمولی و عادت‌های خود صحبت کنید.',
    topicFa: 'روزمره',
    cues: ['утро', 'работа', 'обычно', 'выходные', 'завтрак', 'устал', 'рано', 'дом', 'день'],
    opening: 'Как проходит твой обычный день?',
    personal: 'Расскажи, какая часть дня тебе особенно нравится.',
    reason: 'Объясни, почему эта часть дня важна для тебя.',
    problem: 'Опиши, что делает твой день трудным.',
    close: 'Предложи одну маленькую привычку для более хорошего дня.',
  },
  {
    id: 'travel',
    titleFa: 'سفر',
    missionFa: 'دربارهٔ یک سفر واقعی یا رویایی صحبت کنید.',
    topicFa: 'سفر',
    cues: ['поездка', 'путешествие', 'город', 'море', 'горы', 'самолёт', 'отель', 'лето', 'за границей', 'место'],
    opening: 'Какая поездка была лучшей в твоей жизни?',
    personal: 'Опиши одно место из той поездки подробно.',
    reason: 'Объясни, почему та поездка была важна для тебя.',
    problem: 'Опиши одну проблему, которая случалась в путешествии.',
    close: 'Предложи место для следующей поездки партнёра.',
  },
  {
    id: 'food',
    titleFa: 'غذا و آشپزی',
    missionFa: 'دربارهٔ غذا، سلیقه و تجربهٔ آشپزی صحبت کنید.',
    topicFa: 'غذا',
    cues: ['еда', 'готовить', 'блюдо', 'вкус', 'ресторан', 'ужин', 'острый', 'сладкий', 'рецепт', 'есть'],
    opening: 'Какое блюдо ты умеешь готовить?',
    personal: 'Опиши еду, которую ты никогда не забудешь.',
    reason: 'Объясни, почему еда объединяет людей.',
    problem: 'Опиши ошибку, которую ты допустил(а) при готовке.',
    close: 'Предложи партнёру попробовать твоё любимое блюдо.',
  },
  {
    id: 'work-study',
    titleFa: 'کار و درس',
    missionFa: 'دربارهٔ کار، درس و اهداف حرفه‌ای صحبت کنید.',
    topicFa: 'کار و درس',
    cues: ['работа', 'учёба', 'школа', 'учитель', 'начальник', 'проект', 'срок', 'учиться', 'цель', 'задача'],
    opening: 'Чем ты занимаешься — работаешь или учишься?',
    personal: 'Расскажи о проекте или задаче, которой ты гордишься.',
    reason: 'Объясни, что тебе больше всего нравится в работе или учёбе.',
    problem: 'Опиши одну трудность в работе или учёбе.',
    close: 'Предложи один навык, который партнёру стоит освоить.',
  },
  {
    id: 'hobbies',
    titleFa: 'سرگرمی و وقت آزاد',
    missionFa: 'دربارهٔ کارهایی که برای خوشحالی انجام می‌دهید صحبت کنید.',
    topicFa: 'وقت آزاد',
    cues: ['хобби', 'музыка', 'спорт', 'книга', 'фильм', 'игра', 'выходные', 'играть', 'смотреть', 'отдыхать'],
    opening: 'Что ты делаешь в свободное время?',
    personal: 'Опиши хобби, за которым забываешь о времени.',
    reason: 'Объясни, почему это хобби полезно для тебя.',
    problem: 'Опиши случай, когда хотел(а) попробовать что-то новое, но не получилось.',
    close: 'Предложи партнёру попробовать твоё хобби вместе.',
  },
  {
    id: 'health',
    titleFa: 'سلامت و سبک زندگی',
    missionFa: 'دربارهٔ سلامت، عادت‌ها و انرژی روزانه صحبت کنید.',
    topicFa: 'سلامت',
    cues: ['здоровье', 'сон', 'спорт', 'вода', 'врач', 'усталость', 'энергия', 'гулять', 'стресс', 'еда', 'привычка'],
    opening: 'Что ты делаешь, чтобы быть здоровым?',
    personal: 'Расскажи об одной полезной привычке, которой ты гордишься.',
    reason: 'Объясни, почему сон или спорт важны для тебя.',
    problem: 'Опиши одну привычку, которую хочешь изменить.',
    close: 'Предложи одну маленькую полезную привычку для партнёра.',
  },
  {
    id: 'city',
    titleFa: 'شهر و محله',
    missionFa: 'دربارهٔ جایی که زندگی می‌کنید و کارهای آنجا صحبت کنید.',
    topicFa: 'شهر',
    cues: ['город', 'район', 'улица', 'парк', 'магазин', 'транспорт', 'тихо', 'шумно', 'жить', 'место'],
    opening: 'Какой у тебя город или район?',
    personal: 'Опиши своё любимое место в городе.',
    reason: 'Объясни, почему тебе нравится там жить.',
    problem: 'Опиши, что ты хотел(а) бы изменить в своём городе.',
    close: 'Посоветуй одно место, которое партнёру стоит посетить.',
  },
  {
    id: 'plans',
    titleFa: 'برنامه‌ها و آینده',
    missionFa: 'دربارهٔ برنامه‌های واقعی و اهداف آینده صحبت کنید.',
    topicFa: 'برنامه‌ها',
    cues: ['план', 'будущее', 'цель', 'следующий год', 'надеяться', 'хотеть', 'учиться', 'путешествовать', 'работа', 'мечта', 'месяц'],
    opening: 'Какая у тебя главная цель в этом году?',
    personal: 'Расскажи об одном плане, который тебя радует.',
    reason: 'Объясни, почему эта цель важна для тебя.',
    problem: 'Опиши, что может помешать твоему плану.',
    close: 'Предложи первый шаг для цели партнёра.',
  },
];

/** Any-of groups for the expected communicative move of each turn half. */
const ENGLISH_CONCEPTS: readonly (readonly (readonly string[])[])[] = [
  [['what', 'how', 'when', 'where', 'why', 'do', 'does', 'is', 'are']],
  [['i', 'my', 'me', 'we', 'you', 'your', 'usually', 'when', 'because', 'what', 'how']],
  [['i', 'my', 'me', 'we', 'last', 'yesterday', 'usually', 'once', 'when', 'remember']],
  [['you', 'your', 'example', 'why', 'how', 'what', 'tell', 'mean', 'really', 'interesting']],
  [['because', 'important', 'helps', 'makes', 'feel', 'think', 'for me', 'matter']],
  [['agree', 'disagree', 'think', 'because', 'but', 'same', 'different', 'true', 'point']],
  [['problem', 'difficult', 'hard', 'sometimes', 'challenge', 'when', 'always', 'try']],
  [['solution', 'try', 'help', 'could', 'should', 'maybe', 'if', 'suggest']],
  [['we', 'both', 'talked', 'said', 'learned', 'today', 'about']],
  [['next', 'step', 'thank', 'thanks', 'again', 'hope', 'wish', 'see']],
];

const RUSSIAN_CONCEPTS: readonly (readonly (readonly string[])[])[] = [
  [['как', 'что', 'почему', 'когда', 'где', 'ты', 'вы', 'расскажи']],
  [['я', 'мы', 'мой', 'ты', 'вы', 'обычно', 'когда', 'потому', 'что', 'как']],
  [['я', 'мы', 'мой', 'однажды', 'когда', 'обычно', 'вчера', 'помню']],
  [['ты', 'вы', 'твой', 'пример', 'почему', 'как', 'что', 'расскажи', 'интересно']],
  [['потому', 'важно', 'помогает', 'думаю', 'чувствую', 'для меня', 'значит']],
  [['согласен', 'согласна', 'не согласен', 'не согласна', 'думаю', 'потому', 'но', 'одно', 'другое']],
  [['проблема', 'трудно', 'сложно', 'иногда', 'когда', 'всегда', 'пытаюсь', 'мешает']],
  [['решение', 'попробовать', 'помочь', 'мог', 'могла', 'должен', 'должна', 'если', 'предложить']],
  [['мы', 'оба', 'говорили', 'сказали', 'узнали', 'сегодня', 'о']],
  [['следующий', 'шаг', 'спасибо', 'благодарю', 'ещё', 'надеюсь', 'желаю', 'увидимся']],
];

const FOCUS_LABELS = ['شروع گفت‌وگو', 'تجربهٔ شخصی', 'دلیل و نظر', 'مشکل و راه‌حل', 'جمع‌بندی و پایان'] as const;

const ENGLISH_TEMPLATES = {
  secondOpen: 'Answer the question, then ask your partner the same thing.',
  secondShare: 'React to their example and ask one follow-up question about it.',
  secondReason: 'Agree or disagree politely, and give one reason.',
  secondProblem: 'Offer one practical solution and ask if it would help.',
  firstClose: 'Summarize the conversation in one or two sentences.',
  closeSuffix: ' Then thank your partner.',
};

const RUSSIAN_TEMPLATES = {
  secondOpen: 'Ответь на вопрос и задай партнёру тот же вопрос.',
  secondShare: 'Отреагируй на пример и задай один уточняющий вопрос.',
  secondReason: 'Вежливо согласись или не согласись и назови одну причину.',
  secondProblem: 'Предложи одно практичное решение и спроси, поможет ли оно.',
  firstClose: 'Подведи итог разговора в одном-двух предложениях.',
  closeSuffix: ' Затем поблагодари партнёра.',
};

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));
const hashOf = (value: string) => [...value].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
const LEVEL_LABELS = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'] as const;

const levelLabelOf = (levelId?: number) => {
  if (!levelId || !Number.isFinite(levelId)) return 'سطح آزاد';
  return LEVEL_LABELS[Math.max(0, Math.min(LEVEL_LABELS.length - 1, levelId))] ?? 'سطح آزاد';
};

function promptOf(
  text: string,
  hint: string,
  cues: readonly string[],
  concepts: readonly (readonly string[])[],
  minWords: number,
): TurnPrompt {
  return { text, hint, cues, concepts, minWords };
}

function buildTurns(scenario: TurnScenario, language: TurnConversationLanguage): ConversationTurn[] {
  const templates = language === 'ru' ? RUSSIAN_TEMPLATES : ENGLISH_TEMPLATES;
  const concepts = language === 'ru' ? RUSSIAN_CONCEPTS : ENGLISH_CONCEPTS;
  const cues = scenario.cues;
  const minWords = [3, 3, 4, 4, 4, 4, 4, 4, 3, 3];

  return [
    {
      id: 'open',
      focusFa: FOCUS_LABELS[0],
      first: promptOf(
        scenario.opening,
        `با یک جملهٔ کوتاه شروع کن و از مخاطب دربارهٔ ${scenario.topicFa} بپرس.`,
        cues,
        concepts[0],
        minWords[0],
      ),
      second: promptOf(
        templates.secondOpen,
        'به سؤال جواب بده و همان سؤال را از او بپرس.',
        cues,
        concepts[1],
        minWords[1],
      ),
    },
    {
      id: 'share',
      focusFa: FOCUS_LABELS[1],
      first: promptOf(
        scenario.personal,
        `یک نمونهٔ واقعی و شخصی از ${scenario.topicFa} تعریف کن.`,
        cues,
        concepts[2],
        minWords[2],
      ),
      second: promptOf(
        templates.secondShare,
        'به نمونهٔ او واکنش نشان بده و یک سؤال تکمیلی بپرس.',
        cues,
        concepts[3],
        minWords[3],
      ),
    },
    {
      id: 'reason',
      focusFa: FOCUS_LABELS[2],
      first: promptOf(
        scenario.reason,
        'دلیل یا اهمیت این موضوع را برای خودت توضیح بده.',
        cues,
        concepts[4],
        minWords[4],
      ),
      second: promptOf(
        templates.secondReason,
        'مؤدبانه موافقت یا مخالفت کن و یک دلیل بگو.',
        cues,
        concepts[5],
        minWords[5],
      ),
    },
    {
      id: 'problem',
      focusFa: FOCUS_LABELS[3],
      first: promptOf(
        scenario.problem,
        `یک مشکل واقعی مرتبط با ${scenario.topicFa} را توصیف کن.`,
        cues,
        concepts[6],
        minWords[6],
      ),
      second: promptOf(
        templates.secondProblem,
        'یک راه‌حل عملی پیشنهاد بده و بپرس کمک می‌کند یا نه.',
        cues,
        concepts[7],
        minWords[7],
      ),
    },
    {
      id: 'close',
      focusFa: FOCUS_LABELS[4],
      first: promptOf(
        templates.firstClose,
        'گفت‌وگو را در یک یا دو جمله خلاصه کن.',
        cues,
        concepts[8],
        minWords[8],
      ),
      second: promptOf(
        `${scenario.close}${templates.closeSuffix}`,
        'یک قدم بعدی پیشنهاد بده و از مخاطب تشکر کن.',
        cues,
        concepts[9],
        minWords[9],
      ),
    },
  ];
}

export type TurnPlanInput = {
  conversationId?: string;
  language?: string;
  lessonTitle?: string;
  situation?: string;
  levelId?: number;
};

/**
 * Deterministic plan for one conversation. The conversation id is the seed so
 * both participants always get the same scenario, missions and turn order.
 */
export function buildTurnConversationPlan(input: TurnPlanInput): TurnConversationPlan {
  const language: TurnConversationLanguage = input.language === 'ru' ? 'ru' : 'en';
  const catalog = language === 'ru' ? RUSSIAN_SCENARIOS : ENGLISH_SCENARIOS;
  const seed = input.conversationId || `${input.lessonTitle ?? ''}:${input.situation ?? ''}`;
  const scenario = catalog[hashOf(seed) % catalog.length];
  return {
    language,
    scenarioId: scenario.id,
    titleFa: scenario.titleFa,
    missionFa: scenario.missionFa,
    topicFa: input.lessonTitle?.trim() || scenario.topicFa,
    levelLabel: levelLabelOf(input.levelId),
    turns: buildTurns(scenario, language),
  };
}

export function promptFor(plan: TurnConversationPlan, missionIndex: number, slot: TurnSlot): TurnPrompt | null {
  const turn = plan.turns[missionIndex];
  if (!turn) return null;
  return slot === 0 ? turn.first : turn.second;
}

// ---------------------------------------------------------------------------
// Text analysis
// ---------------------------------------------------------------------------

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'am', 'are', 'was', 'were', 'to', 'of', 'and', 'or', 'i', 'you', 'we', 'they', 'it',
  'this', 'that', 'in', 'on', 'at', 'for', 'with', 'my', 'your', 'me', 'do', 'does', 'did', 'be', 'will',
  'и', 'а', 'но', 'это', 'этот', 'эта', 'я', 'мы', 'вы', 'ты', 'он', 'она', 'они', 'в', 'на', 'к', 'с', 'у',
  'из', 'за', 'что', 'как', 'не', 'да', 'нет',
]);

const GENERIC_ANSWERS = /^(?:hi|hello|hey|ok|okay|thanks|thank you|bye|good|cool|سلام|مرسی|خداحافظ|خوب| باشه)$/i;

export const tokensOf = (text: string) => text
  .toLowerCase()
  .normalize('NFC')
  .replace(/[^\p{L}\p{N}\s]/gu, ' ')
  .split(/\s+/)
  .filter(Boolean);

const contentWordsOf = (text: string) => tokensOf(text).filter(word => word.length > 2 && !STOP_WORDS.has(word));

const matchesCueToken = (wordTokens: readonly string[], normalizedText: string, cue: string) => {
  const cleanCue = cue.toLowerCase();
  if (normalizedText.includes(` ${cleanCue} `)) return true;
  if (cleanCue.length >= 4 && !cleanCue.includes(' ')) {
    const stem = cleanCue.slice(0, 4);
    return wordTokens.some(token => token.length >= 4 && token.startsWith(stem));
  }
  return false;
};

const cueHitsOf = (answer: string, cues: readonly string[]) => {
  const tokens = tokensOf(answer);
  const normalized = ` ${tokens.join(' ')} `;
  return cues.reduce((count, cue) => count + (matchesCueToken(tokens, normalized, cue) ? 1 : 0), 0);
};

const promptHitsOf = (answer: string, prompt: string) => {
  const tokens = tokensOf(answer);
  const words = new Set(tokens);
  return [...new Set(contentWordsOf(prompt))].filter((word) => {
    if (words.has(word)) return true;
    if (word.length >= 4) {
      const stem = word.slice(0, 4);
      return tokens.some(token => token.length >= 4 && token.startsWith(stem));
    }
    return false;
  }).length;
};

const conceptHitsOf = (answer: string, concepts: readonly (readonly string[])[]) => {
  const tokens = tokensOf(answer);
  const normalized = ` ${tokens.join(' ')} `;
  return concepts.filter(group => group.some(word => matchesCueToken(tokens, normalized, word))).length;
};

/**
 * True when a learner message contains text in the conversation's target
 * language (or digits), so pure off-language Persian chat is caught cleanly
 * while genuine short greetings and natural learner replies can be sent.
 */
export function hasTargetLanguageText(answer: string, language: TurnConversationLanguage): boolean {
  const clean = answer.trim();
  if (!clean) return false;
  if (language === 'ru') return /[\u0400-\u04FF0-9]/.test(clean);
  return /[A-Za-z0-9]/.test(clean);
}

/** Blocks free chat and off-mission messages before they are sent. */
export function isAnswerOnMission(answer: string, prompt: TurnPrompt): boolean {
  const clean = answer.trim();
  if (!clean) return false;
  if (GENERIC_ANSWERS.test(clean)) return false;
  const words = tokensOf(clean);
  if (words.length < prompt.minWords) return false;
  const cueHits = cueHitsOf(clean, prompt.cues);
  const promptHits = promptHitsOf(clean, prompt.text);
  const conceptHits = conceptHitsOf(clean, prompt.concepts);
  const strictness = prompt.strictness ?? 'standard';
  if (strictness === 'gentle') {
    if (/[?؟]/.test(clean) && words.length >= 2) return true;
    return cueHits > 0 || promptHits > 0 || conceptHits > 0;
  }
  if (strictness === 'challenging') {
    if (/[?؟]/.test(clean) && words.length >= Math.max(3, prompt.minWords - 1) && (cueHits > 0 || promptHits > 0 || conceptHits > 0)) {
      return true;
    }
    if (cueHits === 0 && promptHits === 0 && conceptHits === 0) return false;
    if (cueHits === 0 && promptHits === 0 && words.length < prompt.minWords + 2) return false;
    return true;
  }
  // A short question is usually a genuine ask-back in a conversation.
  if (/[?؟]/.test(clean) && words.length >= Math.max(2, prompt.minWords - 1)) return true;
  // The answer must touch the mission topic or make the expected
  // communicative move. Free chat and very short generic sentences are blocked.
  if (cueHits === 0 && promptHits === 0 && conceptHits === 0) return false;
  if (conceptHits === 0 && words.length < prompt.minWords + 3) return false;
  if (cueHits === 0 && promptHits === 0 && words.length < prompt.minWords + 2) return false;
  return true;
}

/** Local, explainable 0–100 feedback for one answer. */
export function feedbackForTurnAnswer(answer: string, prompt: TurnPrompt): TurnAnswerFeedback {
  const clean = answer.trim();
  const words = tokensOf(clean);
  const unique = new Set(words);
  const cueHits = cueHitsOf(clean, prompt.cues);
  const promptHits = promptHitsOf(clean, prompt.text);
  const conceptHits = conceptHitsOf(clean, prompt.concepts);

  const lengthScore = clamp(words.length * 3, 0, 20);
  const cueScore = clamp(cueHits * 7 + promptHits * 2, 0, 20);
  const conceptScore = clamp(conceptHits * 8, 0, 20);
  const varietyScore = clamp(Math.round((unique.size / Math.max(1, words.length)) * 10), 0, 10);
  const structureScore = /[.!?؟]/.test(clean) && words.length >= 4 ? 10 : words.length >= 3 ? 5 : 0;
  const score = clamp(25 + lengthScore + cueScore + conceptScore + varietyScore + structureScore);

  const positive = [
    cueScore >= 14 && 'پاسخ به موضوع مأموریت نزدیک بود.',
    lengthScore >= 12 && 'پاسخ کامل و کافی بود.',
    conceptScore >= 16 && 'مفهوم اصلی نوبت را پوشش دادی.',
    varietyScore >= 8 && 'از واژه‌های متنوعی استفاده کردی.',
    structureScore >= 10 && 'جمله‌بندی روشن و کامل بود.',
  ].find((item): item is string => Boolean(item)) ?? 'تلاش کردی پاسخ مرتبط بدهی.';

  const correction = [
    lengthScore < 9 && 'پاسخ را طولانی‌تر کن و یک جزئیات اضافه کن.',
    cueScore < 8 && 'واژهٔ کلیدی موضوع را در پاسخ بیاور.',
    conceptScore < 8 && 'به بخش اصلی مأموریت بپرداز؛ مثلاً دلیل بگو یا راه‌حل پیشنهاد کن.',
    varietyScore < 4 && 'از واژه‌های تکراری کمتر استفاده کن.',
    !/[.!?؟]/.test(clean) && 'جمله را با نقطه یا علامت سؤال کامل کن.',
  ].find((item): item is string => Boolean(item)) ?? 'برای بهتر شدن، یک مثال یا دلیل تازه اضافه کن.';

  return { score, positive, correction, cueScore, conceptScore, lengthScore, varietyScore };
}

// ---------------------------------------------------------------------------
// Turn state
// ---------------------------------------------------------------------------

const isAnswer = (message: DirectMessage) => message.type === 'text' || message.type === 'voice';

/**
 * Answers after the last full session boundary; every session is exactly plan.turns.length * 2 answers.
 * When a lesson is (re)chosen mid-conversation, `sessionBoundaryAt` is the timestamp of that
 * selection: answers before it belong to the previous lesson and never count again.
 */
export function answersForSession(
  messages: readonly DirectMessage[],
  plan: TurnConversationPlan,
  sessionBoundaryAt?: string | null,
): {
  allAnswers: DirectMessage[];
  sessionAnswers: DirectMessage[];
  sessionStart: number;
} {
  const allAnswers = messages
    .map((message, index) => ({ message, index }))
    .filter(item => isAnswer(item.message))
    .sort((a, b) => Date.parse(a.message.createdAt) - Date.parse(b.message.createdAt) || a.index - b.index)
    .map(item => item.message);
  const boundary = sessionBoundaryAt ? Date.parse(sessionBoundaryAt) : Number.NaN;
  const pool = Number.isFinite(boundary)
    ? allAnswers.filter(message => Date.parse(message.createdAt) > boundary)
    : allAnswers;
  const slots = Math.max(2, plan.turns.length * 2);
  const poolStart = pool.length > slots ? Math.floor(pool.length / slots) * slots : 0;
  const sessionStart = allAnswers.length - pool.length + poolStart;
  return { allAnswers, sessionAnswers: pool.slice(poolStart), sessionStart };
}

export function turnStateFromMessages(
  messages: readonly DirectMessage[],
  plan: TurnConversationPlan,
  myId: string | null,
  sessionBoundaryAt?: string | null,
): TurnState {
  const { allAnswers, sessionAnswers, sessionStart } = answersForSession(messages, plan, sessionBoundaryAt);
  const slots = Math.max(2, plan.turns.length * 2);
  const missionIndex = Math.floor(sessionAnswers.length / 2);
  const slot: TurnSlot = sessionAnswers.length % 2 === 0 ? 0 : 1;
  const firstResponderId = sessionAnswers[0]?.senderId || myId || '';
  const secondResponderId = sessionAnswers.find(message => message.senderId !== firstResponderId)?.senderId
    ?? (firstResponderId === myId ? null : myId);
  const otherOf = (id: string) => (id === firstResponderId ? secondResponderId : firstResponderId);
  const missionFirst = missionIndex % 2 === 0 ? firstResponderId : (secondResponderId || firstResponderId);
  const missionSecond = otherOf(missionFirst);
  const responder = slot === 0 ? missionFirst : missionSecond;
  const myTurn = Boolean(myId) && responder === myId;
  const finished = missionIndex >= plan.turns.length || sessionAnswers.length >= slots;
  const currentTurn = finished ? null : plan.turns[missionIndex] ?? null;
  const currentPrompt = finished ? null : promptFor(plan, missionIndex, slot);
  return {
    allAnswers,
    sessionAnswers,
    sessionStart,
    missionIndex,
    slot,
    firstResponderId,
    secondResponderId,
    myTurn,
    completedTurns: Math.min(missionIndex, plan.turns.length),
    progress: clamp(Math.round((sessionAnswers.length / slots) * 100)),
    finished,
    currentPrompt,
    currentTurn,
  };
}

/** Index of a message inside the current session, or -1 when it is not in it. */
export function answerIndexInSession(message: DirectMessage, state: TurnState): number {
  return state.sessionAnswers.findIndex(item => item.id === message.id);
}

// ---------------------------------------------------------------------------
// Final report
// ---------------------------------------------------------------------------

export function evaluateTurnConversation(
  plan: TurnConversationPlan,
  state: TurnState,
  myId: string | null,
): TurnReport {
  const myAnswers = state.sessionAnswers.filter(message => message.senderId === myId);
  const myTextAnswers = myAnswers.filter(message => message.type === 'text' && Boolean(message.body?.trim()));
  const partnerAnswers = state.sessionAnswers.filter(message => message.senderId !== myId);

  const scored = myTextAnswers.map((message) => {
    const index = answerIndexInSession(message, state);
    const missionIndex = Math.floor(index / 2);
    const slot: TurnSlot = index % 2 === 0 ? 0 : 1;
    const prompt = promptFor(plan, missionIndex, slot);
    return prompt ? feedbackForTurnAnswer(message.body || '', prompt) : null;
  }).filter((item): item is TurnAnswerFeedback => Boolean(item));

  const averageScore = scored.length
    ? Math.round(scored.reduce((sum, item) => sum + item.score, 0) / scored.length)
    : 0;
  const allWords = myTextAnswers.flatMap(message => tokensOf(message.body || ''));
  const averageWords = myTextAnswers.length ? Math.round(allWords.length / myTextAnswers.length) : 0;
  const uniqueWords = new Set(allWords);

  const fluency = clamp(35 + averageWords * 3.5 + (averageScore - 50) * 0.25);
  const vocabulary = clamp(30 + uniqueWords.size * 2 + (averageScore - 50) * 0.25);
  const interaction = clamp(25 + Math.min(35, myAnswers.length * 7) + Math.min(20, partnerAnswers.length * 5) + (state.progress >= 100 ? 20 : state.progress >= 60 ? 10 : 0));
  const overall = clamp(averageScore * 0.5 + fluency * 0.17 + vocabulary * 0.16 + interaction * 0.17);

  const errorCandidates = scored.filter(item => item.score < 75);
  const errors: TurnReport['errors'] = [];
  const seen = new Set<string>();
  for (const item of errorCandidates) {
    let title = 'پاسخ قابل بهبود';
    let detail = item.correction;
    if (item.cueScore < 8) {
      title = 'ارتباط با موضوع';
      detail = 'پاسخ به کلمات کلیدی مأموریت نزدیک نبود.';
    } else if (item.conceptScore < 8) {
      title = 'پوشش مفهوم نوبت';
      detail = 'بخش اصلی مأموریت کامل نشد؛ مثلاً دلیل یا راه‌حل گفته نشد.';
    } else if (item.lengthScore < 9) {
      title = 'کوتاهی پاسخ';
      detail = 'پاسخ برای یک مکالمهٔ کامل به جزئیات بیشتری نیاز دارد.';
    } else if (item.varietyScore < 4) {
      title = 'تکرار واژگان';
      detail = 'واژه‌های تکراری زیاد بودند.';
    }
    if (seen.has(title)) continue;
    seen.add(title);
    errors.push({ title, detail, correction: item.correction });
    if (errors.length >= 3) break;
  }

  const nextPractice = averageScore < 60
    ? 'در تمرین بعدی پاسخ‌ها را کامل‌تر کن و به بخش اصلی مأموریت بپرداز.'
    : vocabulary < 70
      ? 'واژه‌های جدید موضوع را در پاسخ‌ها استفاده کن.'
      : interaction < 70
        ? 'بیشتر سؤال بپرس و پاسخ مخاطب را دنبال کن.'
        : 'تمرین را با یک موضوع تازه تکرار کن و لحن خود را متنوع‌تر کن.';

  return {
    overall,
    fluency,
    vocabulary,
    interaction,
    errors,
    nextPractice,
    turnsCompleted: state.completedTurns,
    answersAnalyzed: scored.length,
    averageScore,
    progress: state.progress,
    wordsSpoken: allWords.length,
  };
}
