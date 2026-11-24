import type { DirectMessage } from './conversations';

/**
 * Turn-based conversation practice for the conversation messenger.
 *
 * The old free-chat plan is gone. A conversation is now a fixed number of
 * turns; each turn has exactly one mission for each participant. The plan is
 * generated from the conversation id so both participants always see the same
 * missions in the same order. Progress is shown on a 0–100 scale.
 */

export type TurnConversationLanguage = 'en' | 'ru' | 'tr' | 'de' | 'fr' | 'es';
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

const TURKISH_SCENARIOS: readonly TurnScenario[] = [
  {
    id: 'daily-routine',
    titleFa: 'روزمرهٔ من',
    missionFa: 'دربارهٔ روزهای معمولی و عادت‌های خود صحبت کنید.',
    topicFa: 'روزمره',
    cues: ['sabah', 'iş', 'genellikle', 'hafta sonu', 'kahvaltı', 'yorgun', 'erken', 'ev', 'gün'],
    opening: 'Sıradan bir günün nasıl geçiyor?',
    personal: 'Günün en çok sevdiğin bir bölümünü anlat.',
    reason: 'Günün bu bölümünün senin için neden önemli olduğunu açıkla.',
    problem: 'Günlük düzenini zorlaştıran bir şeyi anlat.',
    close: 'Daha iyi bir gün için küçük bir değişiklik öner.',
  },
  {
    id: 'travel',
    titleFa: 'سفر',
    missionFa: 'دربارهٔ یک سفر واقعی یا رویایی صحبت کنید.',
    topicFa: 'سفر',
    cues: ['yolculuk', 'seyahat', 'şehir', 'deniz', 'dağ', 'uçak', 'otel', 'yaz', 'yurt dışı', 'yer'],
    opening: 'Hayatındaki en güzel seyahat hangisiydi?',
    personal: 'O seyahatten bir yeri ayrıntılı olarak anlat.',
    reason: 'O yolculuğun senin için neden önemli olduğunu açıkla.',
    problem: 'Seyahatte yaşadığın bir sorunu anlat.',
    close: 'Arkadaşının bir sonraki seyahati için bir yer öner.',
  },
  {
    id: 'food',
    titleFa: 'غذا و آشپزی',
    missionFa: 'دربارهٔ غذا، سلیقه و تجربهٔ آشپزی صحبت کنید.',
    topicFa: 'غذا',
    cues: ['yemek', 'pişirmek', 'tat', 'restoran', 'akşam yemeği', 'acılı', 'tatlı', 'tarif', 'yemek', 'mutfak'],
    opening: 'Hangi yemeği iyi pişirebiliyorsun?',
    personal: 'Asla unutamayacağın bir yemeği anlat.',
    reason: 'Yemeğin insanları neden bir araya getirdiğini açıkla.',
    problem: 'Yemek yaparken yaptığın bir hatayı anlat.',
    close: 'Arkadaşını en sevdiğin yemeklerden birini denemeye davet et.',
  },
  {
    id: 'work-study',
    titleFa: 'کار و درس',
    missionFa: 'دربارهٔ کار، درس و اهداف حرفه‌ای صحبت کنید.',
    topicFa: 'کار و درس',
    cues: ['iş', 'çalışmak', 'okul', 'öğretmen', 'proje', 'hedef', 'öğrenmek', 'görev', 'ders'],
    opening: 'İş veya eğitim için neler yapıyorsun?',
    personal: 'Gurur duyduğun bir proje ya da görevi anlat.',
    reason: 'İşinde veya derslerinde en çok neyi sevdiğini açıkla.',
    problem: 'İş veya eğitim hayatındaki bir zorluğu anlat.',
    close: 'Arkadaşının öğrenebileceği yeni bir beceri öner.',
  },
  {
    id: 'hobbies',
    titleFa: 'سرگرمی و وقت آزاد',
    missionFa: 'دربارهٔ کارهایی که برای خوشحالی انجام می‌دهید صحبت کنید.',
    topicFa: 'وقت آزاد',
    cues: ['hobi', 'müzik', 'spor', 'kitap', 'film', 'oyun', 'hafta sonu', 'dinlenmek', 'boş zaman'],
    opening: 'Boş zamanlarında neler yapıyorsun?',
    personal: 'Zamanın nasıl geçtiğini unutturan bir hobini anlat.',
    reason: 'Bu hobinin sana neden iyi geldiğini açıkla.',
    problem: 'Yeni bir şey denemek isteyip yapamadığın bir zamanı anlat.',
    close: 'Arkadaşını hobini birlikte denemeye davet et.',
  },
  {
    id: 'health',
    titleFa: 'سلامت و سبک زندگی',
    missionFa: 'دربارهٔ سلامت، عادت‌ها و انرژی روزانه صحبت کنید.',
    topicFa: 'سلامت',
    cues: ['sağlık', 'uyku', 'spor', 'su', 'doktor', 'yorgun', 'enerji', 'yürüyüş', 'stres', 'alışkanlık'],
    opening: 'Sağlıklı kalmak için neler yapıyorsun?',
    personal: 'Gurur duyduğun sağlıklı bir alışkanlığını anlat.',
    reason: 'Uykunun veya sporun senin için neden önemli olduğunu açıkla.',
    problem: 'Değiştirmek istediğin sağlıksız bir alışkanlığı anlat.',
    close: 'Arkadaşın için küçük ve sağlıklı bir değişiklik öner.',
  },
  {
    id: 'city',
    titleFa: 'شهر و محله',
    missionFa: 'دربارهٔ جایی که زندگی می‌کنید و کارهای آنجا صحبت کنید.',
    topicFa: 'شهر',
    cues: ['şehir', 'mahalle', 'sokak', 'park', 'mağaza', 'ulaşım', 'sakin', 'kalabalık', 'yaşamak', 'yer'],
    opening: 'Yaşadığın şehir veya mahalle nasıl bir yer?',
    personal: 'Şehrindeki en sevdiğin yeri anlat.',
    reason: 'Orada yaşamayı neden sevdiğini açıkla.',
    problem: 'Şehrinde değiştirmek istediğin bir şeyi anlat.',
    close: 'Arkadaşının mutlaka görmesi gereken bir yer öner.',
  },
  {
    id: 'plans',
    titleFa: 'برنامه‌ها و آینده',
    missionFa: 'دربارهٔ برنامه‌های واقعی و اهداف آینده صحبت کنید.',
    topicFa: 'برنامه‌ها',
    cues: ['plan', 'gelecek', 'hedef', 'gelecek yıl', 'ummak', 'istemek', 'öğrenmek', 'seyahat', 'hayal', 'ay'],
    opening: 'Bu yılki en önemli hedefin nedir?',
    personal: 'Seni heyecanlandıran bir planını anlat.',
    reason: 'Bu hedefin senin için neden önemli olduğunu açıkla.',
    problem: 'Planını engelleyebilecek bir durumu anlat.',
    close: 'Arkadaşının hedefi için ilk bir adım öner.',
  },
];

const GERMAN_SCENARIOS: readonly TurnScenario[] = [
  {
    id: 'daily-routine',
    titleFa: 'روزمرهٔ من',
    missionFa: 'دربارهٔ روزهای معمولی و عادت‌های خود صحبت کنید.',
    topicFa: 'روزمره',
    cues: ['morgen', 'arbeit', 'normalerweise', 'wochenende', 'frühstück', 'müde', 'früh', 'haus', 'tag'],
    opening: 'Wie sieht dein normaler Tag aus?',
    personal: 'Beschreibe einen Teil deines Tages, den du wirklich magst.',
    reason: 'Erkläre, warum dieser Teil des Tages dir wichtig ist.',
    problem: 'Beschreibe eine Sache, die deinen Alltag schwierig macht.',
    close: 'Schlage eine kleine Veränderung für einen besseren Tag vor.',
  },
  {
    id: 'travel',
    titleFa: 'سفر',
    missionFa: 'دربارهٔ یک سفر واقعی یا رویایی صحبت کنید.',
    topicFa: 'سفر',
    cues: ['reise', 'reisen', 'stadt', 'meer', 'berg', 'flug', 'hotel', 'sommer', 'ausland', 'ort'],
    opening: 'Was war die beste Reise deines Lebens?',
    personal: 'Beschreibe einen Ort von dieser Reise genau.',
    reason: 'Erkläre, warum diese Reise für dich wichtig war.',
    problem: 'Beschreibe ein Problem, das du auf einer Reise hattest.',
    close: 'Schlage deinem Partner ein Ziel für die nächste Reise vor.',
  },
  {
    id: 'food',
    titleFa: 'غذا و آشپزی',
    missionFa: 'دربارهٔ غذا، سلیقه و تجربهٔ آشپزی صحبت کنید.',
    topicFa: 'غذا',
    cues: ['essen', 'kochen', 'gericht', 'geschmack', 'restaurant', 'abendessen', 'scharf', 'süß', 'rezept'],
    opening: 'Welches Gericht kannst du gut kochen?',
    personal: 'Beschreibe ein Essen, das du nie vergessen wirst.',
    reason: 'Erkläre, warum Essen Menschen zusammenbringt.',
    problem: 'Beschreibe einen Fehler, den du beim Kochen gemacht hast.',
    close: 'Lade deinen Partner ein, eines deiner Lieblingsgerichte zu probieren.',
  },
  {
    id: 'work-study',
    titleFa: 'کار و درس',
    missionFa: 'دربارهٔ کار، درس و اهداف حرفه‌ای صحبت کنید.',
    topicFa: 'کار و درس',
    cues: ['arbeit', 'studium', 'schule', 'lehrer', 'projekt', 'ziel', 'lernen', 'aufgabe', 'beruf'],
    opening: 'Was machst du beruflich oder im Studium?',
    personal: 'Beschreibe ein Projekt oder eine Aufgabe, auf die du stolz bist.',
    reason: 'Erkläre, was dir an deiner Arbeit oder deinem Studium am meisten gefällt.',
    problem: 'Beschreibe eine Herausforderung bei der Arbeit oder im Studium.',
    close: 'Schlage eine Fähigkeit vor, die dein Partner als Nächstes lernen könnte.',
  },
  {
    id: 'hobbies',
    titleFa: 'سرگرمی و وقت آزاد',
    missionFa: 'دربارهٔ کارهایی که برای خوشحالی انجام می‌دهید صحبت کنید.',
    topicFa: 'وقت آزاد',
    cues: ['hobby', 'musik', 'sport', 'buch', 'film', 'spiel', 'wochenende', 'entspannen', 'freizeit'],
    opening: 'Was machst du in deiner Freizeit?',
    personal: 'Beschreibe ein Hobby, bei dem du die Zeit vergisst.',
    reason: 'Erkläre, warum dieses Hobby gut für dich ist.',
    problem: 'Erzähle von etwas Neuem, das du ausprobieren wolltest, aber nicht konntest.',
    close: 'Lade deinen Partner ein, dein Hobby mit dir auszuprobieren.',
  },
  {
    id: 'health',
    titleFa: 'سلامت و سبک زندگی',
    missionFa: 'دربارهٔ سلامت، عادت‌ها و انرژی روزانه صحبت کنید.',
    topicFa: 'سلامت',
    cues: ['gesundheit', 'schlaf', 'sport', 'wasser', 'arzt', 'müde', 'energie', 'spazieren', 'stress', 'gewohnheit'],
    opening: 'Was machst du, um gesund zu bleiben?',
    personal: 'Beschreibe eine gesunde Gewohnheit, auf die du stolz bist.',
    reason: 'Erkläre, warum Schlaf oder Bewegung für dich wichtig sind.',
    problem: 'Beschreibe eine ungesunde Gewohnheit, die du ändern möchtest.',
    close: 'Schlage deinem Partner eine kleine gesunde Veränderung vor.',
  },
  {
    id: 'city',
    titleFa: 'شهر و محله',
    missionFa: 'دربارهٔ جایی که زندگی می‌کنید و کارهای آنجا صحبت کنید.',
    topicFa: 'شهر',
    cues: ['stadt', 'viertel', 'straße', 'park', 'laden', 'verkehr', 'ruhig', 'leben', 'ort'],
    opening: 'Wie ist deine Stadt oder dein Viertel?',
    personal: 'Beschreibe deinen Lieblingsort in deiner Stadt.',
    reason: 'Erkläre, warum du gerne dort lebst.',
    problem: 'Beschreibe eine Sache, die du an deiner Stadt ändern würdest.',
    close: 'Empfiehl deinem Partner einen Ort zum Besuchen.',
  },
  {
    id: 'plans',
    titleFa: 'برنامه‌ها و آینده',
    missionFa: 'دربارهٔ برنامه‌های واقعی و اهداف آینده صحبت کنید.',
    topicFa: 'برنامه‌ها',
    cues: ['plan', 'zukunft', 'ziel', 'nächstes jahr', 'hoffen', 'wollen', 'lernen', 'reisen', 'traum', 'monat'],
    opening: 'Was ist dein wichtigstes Ziel für dieses Jahr?',
    personal: 'Beschreibe einen Plan, auf den du dich freust.',
    reason: 'Erkläre, warum dieses Ziel dir wichtig ist.',
    problem: 'Beschreibe etwas, das deinen Plan aufhalten könnte.',
    close: 'Schlage einen ersten Schritt für das Ziel deines Partners vor.',
  },
];

const FRENCH_SCENARIOS: readonly TurnScenario[] = [
  {
    id: 'daily-routine',
    titleFa: 'روزمرهٔ من',
    missionFa: 'دربارهٔ روزهای معمولی و عادت‌های خود صحبت کنید.',
    topicFa: 'روزمره',
    cues: ['matin', 'travail', 'habitude', 'week-end', 'petit déjeuner', 'fatigué', 'tôt', 'maison', 'journée'],
    opening: 'À quoi ressemble ta journée habituelle ?',
    personal: 'Décris un moment de ta journée que tu aimes vraiment.',
    reason: 'Explique pourquoi ce moment est important pour toi.',
    problem: 'Décris une chose qui rend ton quotidien difficile.',
    close: 'Suggère un petit changement pour passer une meilleure journée.',
  },
  {
    id: 'travel',
    titleFa: 'سفر',
    missionFa: 'دربارهٔ یک سفر واقعی یا رویایی صحبت کنید.',
    topicFa: 'سفر',
    cues: ['voyage', 'voyager', 'ville', 'mer', 'montagne', 'vol', 'hôtel', 'été', 'étranger', 'endroit'],
    opening: 'Quel est le plus beau voyage que tu aies fait ?',
    personal: 'Décris un endroit de ce voyage en détail.',
    reason: 'Explique pourquoi ce voyage était important pour toi.',
    problem: 'Décris un problème que tu as rencontré en voyage.',
    close: 'Suggère une destination pour le prochain voyage de ton partenaire.',
  },
  {
    id: 'food',
    titleFa: 'غذا و آشپزی',
    missionFa: 'دربارهٔ غذا، سلیقه و تجربهٔ آشپزی صحبت کنید.',
    topicFa: 'غذا',
    cues: ['nourriture', 'cuisiner', 'plat', 'goût', 'restaurant', 'dîner', 'épicé', 'sucré', 'recette', 'repas'],
    opening: 'Quel plat sais-tu bien cuisiner ?',
    personal: 'Décris un repas que tu n’oublieras jamais.',
    reason: 'Explique pourquoi la cuisine rassemble les gens.',
    problem: 'Décris une erreur que tu as faite en cuisinant.',
    close: 'Invite ton partenaire à goûter un de tes plats préférés.',
  },
  {
    id: 'work-study',
    titleFa: 'کار و درس',
    missionFa: 'دربارهٔ کار، درس و اهداف حرفه‌ای صحبت کنید.',
    topicFa: 'کار و درس',
    cues: ['travail', 'études', 'école', 'professeur', 'projet', 'objectif', 'apprendre', 'tâche', 'métier'],
    opening: 'Que fais-tu dans la vie, tu travailles ou tu étudies ?',
    personal: 'Décris un projet ou une tâche dont tu es fier.',
    reason: 'Explique ce que tu apprécies le plus dans ton travail ou tes études.',
    problem: 'Décris une difficulté dans ton travail ou tes études.',
    close: 'Suggère une compétence que ton partenaire pourrait apprendre.',
  },
  {
    id: 'hobbies',
    titleFa: 'سرگرمی و وقت آزاد',
    missionFa: 'دربارهٔ کارهایی که برای خوشحالی انجام می‌دهید صحبت کنید.',
    topicFa: 'وقت آزاد',
    cues: ['loisir', 'musique', 'sport', 'livre', 'film', 'jeu', 'week-end', 'détendre', 'temps libre'],
    opening: 'Que fais-tu pendant ton temps libre ?',
    personal: 'Décris un passe-temps qui te fait oublier l’heure.',
    reason: 'Explique pourquoi cette activité est bonne pour toi.',
    problem: 'Raconte une fois où tu as voulu essayer quelque chose de nouveau sans pouvoir.',
    close: 'Invite ton partenaire à essayer ton activité avec toi.',
  },
  {
    id: 'health',
    titleFa: 'سلامت و سبک زندگی',
    missionFa: 'دربارهٔ سلامت، عادت‌ها و انرژی روزانه صحبت کنید.',
    topicFa: 'سلامت',
    cues: ['santé', 'sommeil', 'sport', 'eau', 'médecin', 'fatigué', 'énergie', 'marcher', 'stress', 'habitude'],
    opening: 'Que fais-tu pour rester en bonne santé ?',
    personal: 'Décris une bonne habitude dont tu es fier.',
    reason: 'Explique pourquoi le sommeil ou le sport compte pour toi.',
    problem: 'Décris une mauvaise habitude que tu veux changer.',
    close: 'Suggère un petit changement sain à ton partenaire.',
  },
  {
    id: 'city',
    titleFa: 'شهر و محله',
    missionFa: 'دربارهٔ جایی که زندگی می‌کنید و کارهای آنجا صحبت کنید.',
    topicFa: 'شهر',
    cues: ['ville', 'quartier', 'rue', 'parc', 'magasin', 'transport', 'calme', 'animé', 'habiter', 'endroit'],
    opening: 'Comment est ta ville ou ton quartier ?',
    personal: 'Décris ton endroit préféré dans ta ville.',
    reason: 'Explique pourquoi tu aimes vivre là-bas.',
    problem: 'Décris une chose que tu voudrais changer dans ta ville.',
    close: 'Recommande un endroit que ton partenaire devrait visiter.',
  },
  {
    id: 'plans',
    titleFa: 'برنامه‌ها و آینده',
    missionFa: 'دربارهٔ برنامه‌های واقعی و اهداف آینده صحبت کنید.',
    topicFa: 'برنامه‌ها',
    cues: ['projet', 'avenir', 'objectif', 'année prochaine', 'espérer', 'vouloir', 'apprendre', 'voyager', 'rêve', 'mois'],
    opening: 'Quel est ton principal objectif pour cette année ?',
    personal: 'Décris un projet qui te motive vraiment.',
    reason: 'Explique pourquoi cet objectif est important pour toi.',
    problem: 'Décris un obstacle qui pourrait freiner ton projet.',
    close: 'Suggère une première étape pour l’objectif de ton partenaire.',
  },
];

const SPANISH_SCENARIOS: readonly TurnScenario[] = [
  {
    id: 'daily-routine',
    titleFa: 'روزمرهٔ من',
    missionFa: 'دربارهٔ روزهای معمولی و عادت‌های خود صحبت کنید.',
    topicFa: 'روزمره',
    cues: ['mañana', 'trabajo', 'normalmente', 'fin de semana', 'desayuno', 'cansado', 'temprano', 'casa', 'día'],
    opening: '¿Cómo es un día normal para ti?',
    personal: 'Describe una parte de tu día que disfrutas mucho.',
    reason: 'Explica por qué esa parte del día es importante para ti.',
    problem: 'Describe algo que hace difícil tu rutina diaria.',
    close: 'Sugiere un pequeño cambio para tener un mejor día.',
  },
  {
    id: 'travel',
    titleFa: 'سفر',
    missionFa: 'دربارهٔ یک سفر واقعی یا رویایی صحبت کنید.',
    topicFa: 'سفر',
    cues: ['viaje', 'viajar', 'ciudad', 'playa', 'montaña', 'vuelo', 'hotel', 'verano', 'extranjero', 'lugar'],
    opening: '¿Cuál ha sido el mejor viaje de tu vida?',
    personal: 'Describe en detalle un lugar de ese viaje.',
    reason: 'Explica por qué ese viaje fue importante para ti.',
    problem: 'Describe un problema que hayas tenido al viajar.',
    close: 'Sugiere un destino para el próximo viaje de tu compañero.',
  },
  {
    id: 'food',
    titleFa: 'غذا و آشپزی',
    missionFa: 'دربارهٔ غذا، سلیقه و تجربهٔ آشپزی صحبت کنید.',
    topicFa: 'غذا',
    cues: ['comida', 'cocinar', 'plato', 'sabor', 'restaurante', 'cena', 'picante', 'dulce', 'receta', 'comer'],
    opening: '¿Qué plato sabes cocinar bien?',
    personal: 'Describe una comida que nunca olvidarás.',
    reason: 'Explica por qué la comida une a las personas.',
    problem: 'Describe un error que hayas cometido al cocinar.',
    close: 'Invita a tu compañero a probar uno de tus platos favoritos.',
  },
  {
    id: 'work-study',
    titleFa: 'کار و درس',
    missionFa: 'دربارهٔ کار، درس و اهداف حرفه‌ای صحبت کنید.',
    topicFa: 'کار و درس',
    cues: ['trabajo', 'estudio', 'escuela', 'profesor', 'proyecto', 'meta', 'aprender', 'tarea', 'oficio'],
    opening: '¿A qué te dedicas, trabajas o estudias?',
    personal: 'Describe un proyecto o una tarea de la que estés orgulloso.',
    reason: 'Explica qué es lo que más te gusta de tu trabajo o estudio.',
    problem: 'Describe un desafío en tu trabajo o tus estudios.',
    close: 'Sugiere una habilidad que tu compañero podría aprender.',
  },
  {
    id: 'hobbies',
    titleFa: 'سرگرمی و وقت آزاد',
    missionFa: 'دربارهٔ کارهایی که برای خوشحالی انجام می‌دهید صحبت کنید.',
    topicFa: 'وقت آزاد',
    cues: ['pasatiempo', 'música', 'deporte', 'libro', 'película', 'juego', 'fin de semana', 'descansar', 'tiempo libre'],
    opening: '¿Qué haces en tu tiempo libre?',
    personal: 'Describe un pasatiempo que te hace perder la noción del tiempo.',
    reason: 'Explica por qué este pasatiempo es bueno para ti.',
    problem: 'Cuenta una vez que quisiste probar algo nuevo pero no pudiste.',
    close: 'Invita a tu compañero a probar tu pasatiempo contigo.',
  },
  {
    id: 'health',
    titleFa: 'سلامت و سبک زندگی',
    missionFa: 'دربارهٔ سلامت، عادت‌ها و انرژی روزانه صحبت کنید.',
    topicFa: 'سلامت',
    cues: ['salud', 'sueño', 'ejercicio', 'agua', 'médico', 'cansado', 'energía', 'caminar', 'estrés', 'hábito'],
    opening: '¿Qué haces para mantenerte saludable?',
    personal: 'Describe un hábito saludable del que estés orgulloso.',
    reason: 'Explica por qué dormir bien o hacer ejercicio es importante para ti.',
    problem: 'Describe un mal hábito que quieras cambiar.',
    close: 'Sugiere un pequeño cambio saludable para tu compañero.',
  },
  {
    id: 'city',
    titleFa: 'شهر و محله',
    missionFa: 'دربارهٔ جایی که زندگی می‌کنید و کارهای آنجا صحبت کنید.',
    topicFa: 'شهر',
    cues: ['ciudad', 'barrio', 'calle', 'parque', 'tienda', 'transporte', 'tranquilo', 'vivir', 'lugar'],
    opening: '¿Cómo es tu ciudad o tu barrio?',
    personal: 'Describe tu lugar favorito en tu ciudad.',
    reason: 'Explica por qué te gusta vivir allí.',
    problem: 'Describe algo que cambiarías de tu ciudad.',
    close: 'Recomienda un lugar que tu compañero debería visitar.',
  },
  {
    id: 'plans',
    titleFa: 'برنامه‌ها و آینده',
    missionFa: 'دربارهٔ برنامه‌های واقعی و اهداف آینده صحبت کنید.',
    topicFa: 'برنامه‌ها',
    cues: ['plan', 'futuro', 'meta', 'próximo año', 'esperar', 'querer', 'aprender', 'viajar', 'sueño', 'mes'],
    opening: '¿Cuál es tu meta principal para este año?',
    personal: 'Describe un plan que te entusiasme mucho.',
    reason: 'Explica por qué esta meta es importante para ti.',
    problem: 'Describe algo que podría frenar tu plan.',
    close: 'Sugiere un primer paso para la meta de tu compañero.',
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

const TURKISH_CONCEPTS: readonly (readonly (readonly string[])[])[] = [
  [['ne', 'nasıl', 'neden', 'ne zaman', 'nerede', 'kim', 'sen', 'siz', 'anlat']],
  [['ben', 'benim', 'biz', 'sen', 'senin', 'genellikle', 'çünkü', 'ne', 'nasıl']],
  [['ben', 'biz', 'benim', 'bir gün', 'genellikle', 'dün', 'hatırlıyorum', 'zaman']],
  [['sen', 'senin', 'örnek', 'neden', 'nasıl', 'ne', 'anlat', 'ilginç', 'gerçekten']],
  [['çünkü', 'önemli', 'yardım', 'bence', 'hissediyorum', 'benim için', 'anlamlı']],
  [['katılıyorum', 'katılmıyorum', 'bence', 'çünkü', 'ama', 'aynı', 'farklı', 'doğru']],
  [['sorun', 'zor', 'bazen', 'zorluk', 'her zaman', 'deniyorum', 'engel']],
  [['çözüm', 'denemek', 'yardım', 'olabilir', 'eğer', 'öneririm', 'belki']],
  [['biz', 'ikimiz', 'konuştuk', 'dedik', 'öğrendik', 'bugün', 'hakkında']],
  [['sonraki', 'adım', 'teşekkürler', 'teşekkür', 'yine', 'umarım', 'görüşürüz']],
];

const GERMAN_CONCEPTS: readonly (readonly (readonly string[])[])[] = [
  [['was', 'wie', 'wann', 'wo', 'warum', 'wer', 'du', 'sie', 'ist', 'sind']],
  [['ich', 'mein', 'mir', 'wir', 'du', 'dein', 'normalerweise', 'weil', 'was', 'wie']],
  [['ich', 'mein', 'wir', 'letzte', 'gestern', 'normalerweise', 'einmal', 'erinnere']],
  [['du', 'dein', 'beispiel', 'warum', 'wie', 'was', 'erzähl', 'wirklich', 'interessant']],
  [['weil', 'wichtig', 'hilft', 'macht', 'fühle', 'denke', 'für mich', 'bedeutet']],
  [['stimme zu', 'nicht einverstanden', 'denke', 'weil', 'aber', 'gleich', 'anders', 'stimmt']],
  [['problem', 'schwierig', 'schwer', 'manchmal', 'herausforderung', 'wenn', 'immer', 'versuche']],
  [['lösung', 'versuchen', 'helfen', 'könnte', 'sollte', 'vielleicht', 'wenn', 'vorschlagen']],
  [['wir', 'beide', 'gesprochen', 'gesagt', 'gelernt', 'heute', 'über']],
  [['nächste', 'schritt', 'danke', 'vielen dank', 'wieder', 'hoffe', 'wünsche', 'sehen']],
];

const FRENCH_CONCEPTS: readonly (readonly (readonly string[])[])[] = [
  [['quel', 'quelle', 'comment', 'quand', 'où', 'pourquoi', 'qui', 'tu', 'vous', 'est']],
  [['je', 'mon', 'ma', 'nous', 'tu', 'ton', 'd’habitude', 'parce que', 'quoi', 'comment']],
  [['je', 'mon', 'nous', 'hier', 'd’habitude', 'une fois', 'quand', 'souviens']],
  [['tu', 'ton', 'exemple', 'pourquoi', 'comment', 'quoi', 'raconte', 'vraiment', 'intéressant']],
  [['parce que', 'important', 'aide', 'fait', 'sens', 'pense', 'pour moi', 'compte']],
  [['d’accord', 'pas d’accord', 'pense', 'parce que', 'mais', 'pareil', 'différent', 'vrai']],
  [['problème', 'difficile', 'dur', 'parfois', 'défi', 'quand', 'toujours', 'essaie']],
  [['solution', 'essayer', 'aider', 'pourrait', 'devrait', 'peut-être', 'si', 'suggérer']],
  [['nous', 'tous les deux', 'parlé', 'dit', 'appris', 'aujourd’hui', 'sur']],
  [['prochaine', 'étape', 'merci', 'encore', 'espère', 'souhaite', 'bientôt']],
];

const SPANISH_CONCEPTS: readonly (readonly (readonly string[])[])[] = [
  [['qué', 'cómo', 'cuándo', 'dónde', 'por qué', 'quién', 'tú', 'usted', 'es', 'son']],
  [['yo', 'mi', 'nosotros', 'tú', 'tu', 'normalmente', 'porque', 'qué', 'cómo']],
  [['yo', 'mi', 'nosotros', 'ayer', 'normalmente', 'una vez', 'cuando', 'recuerdo']],
  [['tú', 'tu', 'ejemplo', 'por qué', 'cómo', 'qué', 'cuéntame', 'realmente', 'interesante']],
  [['porque', 'importante', 'ayuda', 'hace', 'siento', 'pienso', 'para mí', 'importa']],
  [['de acuerdo', 'no estoy de acuerdo', 'pienso', 'porque', 'pero', 'igual', 'diferente', 'cierto']],
  [['problema', 'difícil', 'duro', 'a veces', 'desafío', 'cuando', 'siempre', 'intento']],
  [['solución', 'intentar', 'ayudar', 'podría', 'debería', 'quizás', 'si', 'sugiero']],
  [['nosotros', 'ambos', 'hablamos', 'dijimos', 'aprendimos', 'hoy', 'sobre']],
  [['siguiente', 'paso', 'gracias', 'otra vez', 'espero', 'deseo', 'vemos']],
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

const TURKISH_TEMPLATES = {
  secondOpen: 'Soruyu cevapla, ardından arkadaşına aynı soruyu sor.',
  secondShare: 'Verdiği örneğe tepki ver ve konuyla ilgili bir soru sor.',
  secondReason: 'Nazikçe katıldığını ya da katılmadığını belirt ve bir neden söyle.',
  secondProblem: 'Pratik bir çözüm öner ve bunun işe yarayıp yaramayacağını sor.',
  firstClose: 'Konuşmayı bir veya iki cümleyle özetle.',
  closeSuffix: ' Ardından arkadaşına teşekkür et.',
};

const GERMAN_TEMPLATES = {
  secondOpen: 'Beantworte die Frage und stelle deinem Partner dieselbe Frage.',
  secondShare: 'Reagiere auf das Beispiel und stelle eine Nachfrage dazu.',
  secondReason: 'Stimme höflich zu oder widersprich und nenne einen Grund.',
  secondProblem: 'Schlage eine praktische Lösung vor und frage, ob sie hilft.',
  firstClose: 'Fasse das Gespräch in ein oder zwei Sätzen zusammen.',
  closeSuffix: ' Danke danach deinem Partner.',
};

const FRENCH_TEMPLATES = {
  secondOpen: 'Réponds à la question, puis pose la même question à ton partenaire.',
  secondShare: 'Réagis à son exemple et pose une question pour en savoir plus.',
  secondReason: 'Exprime poliment ton accord ou ton désaccord avec une raison.',
  secondProblem: 'Propose une solution pratique et demande si cela aiderait.',
  firstClose: 'Résume la conversation en une ou deux phrases.',
  closeSuffix: ' Puis remercie ton partenaire.',
};

const SPANISH_TEMPLATES = {
  secondOpen: 'Responde la pregunta y luego hazle la misma pregunta a tu compañero.',
  secondShare: 'Reacciona a su ejemplo y haz una pregunta adicional sobre él.',
  secondReason: 'Muestra acuerdo o desacuerdo con educación y da una razón.',
  secondProblem: 'Ofrece una solución práctica y pregunta si ayudaría.',
  firstClose: 'Resume la conversación en una o dos frases.',
  closeSuffix: ' Luego dale las gracias a tu compañero.',
};

const TEMPLATES_BY_LANGUAGE = {
  en: ENGLISH_TEMPLATES,
  ru: RUSSIAN_TEMPLATES,
  tr: TURKISH_TEMPLATES,
  de: GERMAN_TEMPLATES,
  fr: FRENCH_TEMPLATES,
  es: SPANISH_TEMPLATES,
} as const;

const CONCEPTS_BY_LANGUAGE = {
  en: ENGLISH_CONCEPTS,
  ru: RUSSIAN_CONCEPTS,
  tr: TURKISH_CONCEPTS,
  de: GERMAN_CONCEPTS,
  fr: FRENCH_CONCEPTS,
  es: SPANISH_CONCEPTS,
} as const;

const SCENARIOS_BY_LANGUAGE = {
  en: ENGLISH_SCENARIOS,
  ru: RUSSIAN_SCENARIOS,
  tr: TURKISH_SCENARIOS,
  de: GERMAN_SCENARIOS,
  fr: FRENCH_SCENARIOS,
  es: SPANISH_SCENARIOS,
} as const;

export function normalizeTurnLanguage(language?: string): TurnConversationLanguage {
  if (language === 'ru' || language === 'tr' || language === 'de' || language === 'fr' || language === 'es') {
    return language;
  }
  return 'en';
}

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
  const templates = TEMPLATES_BY_LANGUAGE[language];
  const concepts = CONCEPTS_BY_LANGUAGE[language];
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
  const language = normalizeTurnLanguage(input.language);
  const catalog = SCENARIOS_BY_LANGUAGE[language];
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
  've', 'bir', 'bu', 'şu', 'o', 'ben', 'sen', 'biz', 'siz', 'onlar', 'için', 'ile', 'de', 'da', 'mi', 'mı', 'mu', 'mü', 'ne', 'ama',
  'der', 'die', 'das', 'ein', 'eine', 'und', 'oder', 'ich', 'du', 'wir', 'ihr', 'sie', 'er', 'es', 'ist', 'sind', 'bin', 'in', 'auf', 'mit', 'für', 'zu', 'von', 'nicht', 'aber',
  'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'est', 'sont', 'suis', 'dans', 'sur', 'avec', 'pour', 'pas', 'mais', 'que', 'qui',
  'el', 'los', 'las', 'una', 'y', 'yo', 'tú', 'él', 'ella', 'nosotros', 'ustedes', 'ellos', 'son', 'estoy', 'en', 'con', 'para', 'por', 'del', 'no', 'pero', 'como',
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
  if (language === 'tr' || language === 'de' || language === 'fr' || language === 'es') {
    return /[A-Za-z\u00C0-\u024F0-9]/.test(clean);
  }
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
