import { scoreSpeech, tokens, type SpeakCheckResult } from './speechScore';
export type SpeechWordResult = SpeakCheckResult['words'][number];

export type BranchingLocale = 'en-US' | 'ru-RU' | 'tr-TR' | 'de-DE' | 'fr-FR' | 'es-ES';
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
  expectedPolarity?: 'positive' | 'negative' | 'neutral';
  expectedQuestion?: boolean;
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
  conceptScore?: number;
  lexicalScore?: number;
  missingConcepts?: string[];
  polarityMismatch?: boolean;
  questionMissing?: boolean;
  partnerPushback?: { text: string; fa: string };
  wordResults?: SpeechWordResult[];
};

const normalize = (value: string) =>
  tokens(value.replace(/[\u0300\u0301]/g, '').replace(/ё/g, 'е')).join(' ');
const wordSet = (value: string) => new Set(normalize(value).split(' ').filter(Boolean));

const STOP = new Set([
  // English
  'the', 'a', 'an', 'is', 'am', 'are', 'was', 'were', 'to', 'of', 'and', 'or', 'i', 'you', 'we', 'they', 'it',
  'this', 'that', 'in', 'on', 'at', 'for', 'with', 'my', 'your', 'me', 'do', 'does', 'did', 'be', 'will', 'would',
  'have', 'has', 'had', 'he', 'she', 'his', 'her', 'our', 'their', 'so', 'very', 'just',
  // Russian
  'и', 'а', 'но', 'это', 'этот', 'эта', 'я', 'мы', 'вы', 'ты', 'он', 'она', 'они', 'в', 'на', 'к', 'с', 'у',
  'из', 'за', 'что', 'как', 'по', 'о', 'об', 'от', 'до', 'для', 'же', 'бы', 'ли', 'мне', 'тебе', 'вам', 'мой', 'моя',
  // Turkish
  'bir', 've', 'bu', 'şu', 'o', 'ben', 'sen', 'biz', 'siz', 'onlar', 'için', 'ile', 'da', 'de', 'ki', 'ama', 'çok',
  // German
  'der', 'die', 'das', 'ein', 'eine', 'einen', 'einem', 'einer', 'ich', 'du', 'sie', 'er', 'es', 'wir', 'ihr',
  'und', 'oder', 'in', 'im', 'an', 'am', 'auf', 'mit', 'zu', 'zum', 'zur', 'von', 'für', 'ist', 'sind', 'bin', 'sehr',
  // French
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles',
  'et', 'ou', 'en', 'à', 'au', 'aux', 'dans', 'pour', 'avec', 'sur', 'est', 'suis', 'sont', 'très', 'ce', 'cette',
  // Spanish
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos',
  'y', 'o', 'en', 'a', 'al', 'de', 'del', 'para', 'por', 'con', 'es', 'soy', 'son', 'está', 'estoy', 'muy',
]);

const NEGATION_TOKENS = new Set([
  'no', 'not', "don't", "doesn't", "didn't", "won't", "can't", 'cannot', 'never', 'nothing', 'neither', "isn't", "aren't", "wasn't", "weren't",
  'не', 'нет', 'ни', 'никогда', 'ничего', 'нельзя',
  'hayır', 'yok', 'değil', 'asla', 'hiç',
  'nein', 'nicht', 'kein', 'keine', 'keinen', 'keinem', 'nie', 'niemals', 'nichts',
  'non', 'ne', 'pas', 'jamais', 'rien', 'aucun', 'aucune',
  'nunca', 'jamás', 'nada', 'ningún', 'ninguna', 'tampoco',
]);

const QUESTION_WORDS = new Set([
  'what', 'where', 'when', 'who', 'whom', 'whose', 'why', 'how', 'which', 'can', 'could', 'would', 'will', 'do', 'does', 'did', 'is', 'are', 'am',
  'что', 'где', 'когда', 'кто', 'куда', 'откуда', 'почему', 'зачем', 'как', 'какой', 'какая', 'какие', 'сколько', 'можно', 'ли',
  'ne', 'nerede', 'nereye', 'nereden', 'ne zaman', 'kim', 'kime', 'neden', 'niçin', 'nasıl', 'hangi', 'kaç', 'mi', 'mı', 'mu', 'mü',
  'was', 'wo', 'wohin', 'woher', 'wann', 'wer', 'wen', 'wem', 'warum', 'wie', 'welche', 'welcher', 'welches', 'kann', 'können', 'darf',
  'quoi', 'où', 'quand', 'qui', 'pourquoi', 'comment', 'quel', 'quelle', 'quels', 'quelles', 'combien', 'pouvez', 'puis',
  'qué', 'dónde', 'adónde', 'cuándo', 'quién', 'quiénes', 'cómo', 'cuál', 'cuáles', 'cuánto', 'cuánta', 'puedo', 'puede', 'puedes',
]);

const SYNONYM_GROUPS: ReadonlyArray<readonly string[]> = [
  ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
  ['bye', 'goodbye', 'see you'],
  ['thanks', 'thank you', 'appreciate'],
  ['yes', 'yeah', 'sure', 'of course', 'okay', 'ok', 'certainly'],
  ['sorry', 'excuse me', 'apologize'],
  ['want', 'would like', 'need'],
  ['привет', 'здравствуй', 'здравствуйте', 'доброе утро', 'добрый день', 'добрый вечер'],
  ['пока', 'до свидания', 'увидимся'],
  ['спасибо', 'благодарю'],
  ['да', 'конечно', 'хорошо', 'ладно'],
  ['извините', 'простите', 'извини'],
  ['хочу', 'хотел', 'хотела', 'нужно', 'надо'],
  ['merhaba', 'selam', 'günaydın', 'iyi günler', 'iyi akşamlar'],
  ['hoşça kal', 'güle güle', 'görüşürüz'],
  ['teşekkürler', 'teşekkür ederim', 'sağ ol', 'sağ olun'],
  ['evet', 'tabii', 'tamam', 'olur'],
  ['pardon', 'özür dilerim', 'affedersiniz'],
  ['hallo', 'guten tag', 'guten morgen', 'guten abend'],
  ['tschüss', 'auf wiedersehen', 'bis bald'],
  ['danke', 'vielen dank'],
  ['ja', 'klar', 'natürlich', 'gerne', 'gut'],
  ['entschuldigung', 'tut mir leid'],
  ['bonjour', 'salut', 'bonsoir'],
  ['au revoir', 'à bientôt'],
  ['merci', 'merci beaucoup'],
  ['oui', 'bien sûr', 'accord'],
  ['pardon', 'excusez-moi', 'désolé', 'désolée'],
  ['hola', 'buenos días', 'buenas tardes', 'buenas noches'],
  ['adiós', 'hasta luego', 'nos vemos'],
  ['gracias', 'muchas gracias'],
  ['sí', 'claro', 'vale', 'bueno', 'por supuesto'],
  ['perdón', 'disculpe', 'lo siento'],
];

const SYNONYM_LOOKUP = new Map<string, readonly string[]>();
for (const group of SYNONYM_GROUPS) {
  for (const item of group) {
    SYNONYM_LOOKUP.set(normalize(item), group);
  }
}

const PUSHBACK_BY_LOCALE: Record<BranchingLocale, { unclear: { text: string; fa: string }; polarity: { text: string; fa: string }; question: { text: string; fa: string }; short: { text: string; fa: string } }> = {
  'en-US': {
    unclear: { text: 'Sorry, I did not quite catch that. Could you say it clearly?', fa: 'متوجه نشدم؛ می‌توانی دقیق‌تر و متناسب با موضوع بگویی؟' },
    polarity: { text: 'Wait — yes or no? That sounded like the opposite of what we were agreeing on.', fa: 'صبر کن — منظورت مثبت بود یا منفی؟ با پاسخ مورد انتظار این نوبت نمی‌خواند.' },
    question: { text: 'Are you asking me a question? Try phrasing it clearly as a question.', fa: 'آیا سؤال می‌پرسی؟ لطفاً با لحن یا واژهٔ پرسشی بپرس.' },
    short: { text: 'Could you explain that a bit more completely?', fa: 'می‌توانی کمی کامل‌تر و با جزئیات بیشتری توضیح بدهی؟' },
  },
  'ru-RU': {
    unclear: { text: 'Извини́те, я не совсе́м по́нял. Скажи́те, пожа́луйста, точне́е.', fa: 'ببخشید، دقیق متوجه نشدم. لطفاً واضح‌تر و متناسب با نوبت بگو.' },
    polarity: { text: 'Подожди́те, вы име́ете в виду́ «да» и́ли «нет»?', fa: 'صبر کن، منظورت مثبت است یا منفی؟ قطبیت جمله با هدف نوبت نمی‌خواند.' },
    question: { text: 'Э́то вопро́с? Попро́буйте спроси́ть ещё раз как вопро́с.', fa: 'آیا این پرسش است؟ لطفاً با واژه یا لحن پرسشی بپرس.' },
    short: { text: 'Не могли́ бы вы отве́тить бо́лее подро́бно?', fa: 'می‌توانی کمی کامل‌تر و با جزئیات بیشتری پاسخ بدهی؟' },
  },
  'tr-TR': {
    unclear: { text: 'Pardon, tam anlayamadım. Daha açık söyler misiniz?', fa: 'ببخشید، کامل متوجه نشدم. واضح‌تر و متناسب با موضوع بگو.' },
    polarity: { text: 'Bir dakika, evet mi hayır mı demek istediniz?', fa: 'یک لحظه، منظورت مثبت بود یا منفی؟ با نوبت هم‌خوانی ندارد.' },
    question: { text: 'Bunu soru olarak mı soruyorsunuz?', fa: 'آیا می‌پرسی؟ با لحن یا نشانهٔ پرسش بیان کن.' },
    short: { text: 'Biraz daha ayrıntılı açıklayabilir misiniz?', fa: 'می‌توانی کمی کامل‌تر توضیح بدهی؟' },
  },
  'de-DE': {
    unclear: { text: 'Entschuldigung, das habe ich nicht verstanden. Könnten Sie es klarer sagen?', fa: 'ببخشید، متوجه نشدم. واضح‌تر و متناسب با نوبت بگو.' },
    polarity: { text: 'Moment, meinen Sie ja oder nein?', fa: 'یک لحظه، منظورت مثبت است یا منفی؟' },
    question: { text: 'Stellen Sie gerade eine Frage?', fa: 'آیا سؤال می‌پرسی؟ جمله را به‌صورت پرسشی بگو.' },
    short: { text: 'Könnten Sie das etwas ausführlicher sagen?', fa: 'می‌توانی کمی کامل‌تر توضیح بدهی؟' },
  },
  'fr-FR': {
    unclear: { text: 'Pardon, je n’ai pas bien compris. Pouvez-vous le dire plus clairement ?', fa: 'ببخشید، درست متوجه نشدم. واضح‌تر و متناسب با نوبت بگو.' },
    polarity: { text: 'Attendez, vous voulez dire oui ou non ?', fa: 'صبر کن، منظورت بله است یا خیر؟' },
    question: { text: 'Vous posez une question ?', fa: 'آیا سؤال می‌پرسی؟ با لحن یا ساختار پرسشی بگو.' },
    short: { text: 'Pourriez-vous développer un peu plus ?', fa: 'می‌توانی کمی کامل‌تر توضیح بدهی؟' },
  },
  'es-ES': {
    unclear: { text: 'Perdón, no lo entendí bien. ¿Puede decirlo con más claridad?', fa: 'ببخشید، درست متوجه نشدم. واضح‌تر و متناسب با نوبت بگو.' },
    polarity: { text: 'Un momento, ¿quiere decir que sí o que no?', fa: 'یک لحظه، منظورت بله است یا خیر؟' },
    question: { text: '¿Está haciendo una pregunta?', fa: 'آیا سؤال می‌پرسی؟ با لحن یا ساختار پرسشی بگو.' },
    short: { text: '¿Podría explicarlo de forma más completa?', fa: 'می‌توانی کمی کامل‌تر توضیح بدهی؟' },
  },
};

function matchesTokenOrStem(heardTokens: readonly string[], option: string): boolean {
  const optNorm = normalize(option);
  if (!optNorm) return false;
  const optParts = optNorm.split(' ').filter(Boolean);
  if (optParts.length > 1) {
    const joined = heardTokens.join(' ');
    return joined.includes(optNorm);
  }
  const target = optParts[0];
  return heardTokens.some(tok => {
    if (tok === target) return true;
    // Allow close inflectional/conjugation stems on longer words (Russian/Turkish/German/French/Spanish)
    if (target.length >= 5 && tok.length >= 5) {
      const prefix = Math.min(target.length - 1, tok.length - 1, 5);
      return prefix >= 4 && tok.slice(0, prefix) === target.slice(0, prefix);
    }
    return false;
  });
}

const containsAny = (text: string, options: string[]) => {
  const heardTokens = normalize(text).split(' ').filter(Boolean);
  if (!heardTokens.length) return false;
  return options.some(option => matchesTokenOrStem(heardTokens, option));
};

function overlapScore(expected: string, heard: string) {
  const expectedWords = [...wordSet(expected)].filter(word => !STOP.has(word) && word.length > 1);
  if (!expectedWords.length) return normalize(expected) === normalize(heard) ? 1 : 0;
  const heardTokens = normalize(heard).split(' ').filter(Boolean);
  return expectedWords.filter(word => matchesTokenOrStem(heardTokens, word)).length / expectedWords.length;
}

function detectPolarity(text: string): 'positive' | 'negative' | 'neutral' {
  const words = normalize(text).split(' ').filter(Boolean);
  if (words.some(w => NEGATION_TOKENS.has(w))) return 'negative';
  if (words.some(w => ['yes', 'yeah', 'sure', 'да', 'конечно', 'evet', 'ja', 'oui', 'sí'].includes(w))) return 'positive';
  return 'neutral';
}

function looksLikeQuestion(text: string): boolean {
  if (/[?¿]/.test(text)) return true;
  const words = normalize(text).split(' ').filter(Boolean);
  return words.some(w => QUESTION_WORDS.has(w));
}

function scriptIssue(text: string, locale: BranchingLocale, targetText?: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return 'هنوز پاسخی ثبت نشده است.';
  if (/[\u0600-\u06FF]/.test(trimmed)) return 'لطفاً به زبان همین درس پاسخ بده، نه فارسی.';
  if (/^(.)\1{3,}$/.test(trimmed.replace(/\s+/g, ''))) return 'پاسخ نامفهوم یا تکراری است؛ یک جملهٔ واقعی بگو یا بنویس.';
  const lettersOnly = trimmed.replace(/[^a-zA-Z\u0400-\u04FFçğıöşüÇĞİÖŞÜäöüßÄÖÜàâæçéèêëîïôœùûüÿÀÂÆÇÉÈÊËÎÏÔŒÙÛÜŸáéíóúñüÁÉÍÓÚÑÜ]/g, '');
  if (!lettersOnly) return 'حرف یا واژهٔ معتبری در پاسخ دیده نشد.';
  if (locale === 'ru-RU' && targetText && /[\u0400-\u04FF]/.test(targetText) && !/[\u0400-\u04FF]/.test(trimmed)) {
    return 'این بخش مکالمهٔ روسی است؛ لطفاً با خط و واژه‌های روسی پاسخ بده.';
  }
  return null;
}

export function evaluateSemanticResponse(rule: SemanticTurn, heard: string, locale: BranchingLocale, level: ConversationLevel): SemanticResult {
  const answer = heard.trim();
  const pushback = PUSHBACK_BY_LOCALE[locale] ?? PUSHBACK_BY_LOCALE['en-US'];

  // Exact choice match on Pre-A1 / A1 guided selection
  if (rule.choices?.length) {
    const matchedChoice = rule.choices.find(choice => normalize(choice.text) === normalize(answer));
    if (matchedChoice) {
      if (matchedChoice.correct) {
        return {
          accepted: true,
          score: 100,
          conceptScore: 1,
          lexicalScore: 1,
          missingConcepts: [],
          feedback: 'درست است؛ انتخاب و پاسخ دقیقاً متناسب با موقعیت بود.',
          branchReply: rule.fallbackReply,
          wordResults: rule.targetText ? scoreSpeech(rule.targetText, answer).words : undefined,
        };
      }
      return {
        accepted: false,
        score: 20,
        conceptScore: 0,
        lexicalScore: 0,
        missingConcepts: [],
        feedback: 'این گزینه پاسخِ نوبت دیگری است و با سؤال یا موقعیت فعلی نمی‌خواند؛ دوباره انتخاب کن.',
        partnerPushback: pushback.unclear,
      };
    }
  }

  const invalid = scriptIssue(answer, locale, rule.targetText);
  if (invalid) {
    return {
      accepted: false,
      score: 0,
      conceptScore: 0,
      lexicalScore: 0,
      missingConcepts: [],
      feedback: invalid,
      partnerPushback: pushback.unclear,
    };
  }

  const speechEval = rule.targetText ? scoreSpeech(rule.targetText, answer) : undefined;
  const wordResults = speechEval?.words;
  const concepts = rule.concepts.length ? rule.concepts : [[]];
  const missingConcepts: string[] = [];
  let covered = 0;
  for (const group of concepts) {
    if (!group.length || containsAny(answer, group)) {
      covered += 1;
    } else {
      missingConcepts.push(group[0]);
    }
  }

  const rawConceptScore = covered / concepts.length;
  const phoneticMatch = speechEval ? speechEval.score / 100 : 0;
  // In Pre-A1 and A1, close phonetic/STT recognition of short beginner words counts toward concept coverage.
  const conceptScore = (level === 'Pre-A1' || level === 'A1') && phoneticMatch >= 0.65
    ? Math.max(rawConceptScore, phoneticMatch)
    : rawConceptScore;
  const lexicalScore = rule.targetText
    ? Math.max(overlapScore(rule.targetText, answer), level === 'Pre-A1' ? phoneticMatch : level === 'A1' ? phoneticMatch * 0.9 : 0)
    : conceptScore;
  const branch = rule.branches?.find(item => item.match.every(group => containsAny(answer, group)));

  // Polarity guard (e.g., saying "no" when the turn asks for "yes" or vice-versa)
  const expectedPol = rule.expectedPolarity ?? 'neutral';
  const heardPol = detectPolarity(answer);
  if (expectedPol !== 'neutral' && heardPol !== 'neutral' && expectedPol !== heardPol) {
    return {
      accepted: false,
      score: Math.min(28, Math.round(lexicalScore * 35)),
      conceptScore,
      lexicalScore,
      missingConcepts,
      polarityMismatch: true,
      feedback: 'قطبیت پاسخ (مثبت/منفی) برعکسِ هدف این نوبت است؛ جمله را اصلاح کن.',
      partnerPushback: pushback.polarity,
      wordResults,
    };
  }

  // Question guard for A2–C1
  const questionMissing = Boolean(rule.expectedQuestion && level !== 'Pre-A1' && level !== 'A1' && !looksLikeQuestion(answer));

  // Advanced-level depth guard: B2/C1 responses to full turns cannot pass with 1–2 words unless an authored branch matched
  const heardWordCount = normalize(answer).split(' ').filter(Boolean).length;
  const targetWordCount = rule.targetText ? normalize(rule.targetText).split(' ').filter(Boolean).length : 0;
  if ((level === 'B2' || level === 'C1') && !branch && targetWordCount >= 7 && heardWordCount <= 2) {
    return {
      accepted: false,
      score: Math.min(35, Math.round(conceptScore * 40)),
      conceptScore,
      lexicalScore,
      missingConcepts,
      feedback: 'در سطح پیشرفته پاسخ خیلی کوتاه است؛ منظورت را با جملهٔ کامل و دلیل بیان کن.',
      partnerPushback: pushback.short,
      wordResults,
    };
  }

  // Balanced composite: concepts (60%) + lexical overlap (30%) + form/question/length adequacy (10%)
  const minLength = level === 'Pre-A1' ? 1 : level === 'A1' ? 2 : level === 'A2' ? 6 : level === 'B1' ? 10 : 12;
  const formCredit = (answer.length >= minLength ? 5 : 0) + (!questionMissing ? 5 : 0);
  const rawScore = Math.round(conceptScore * 60 + lexicalScore * 30 + formCredit - (questionMissing ? 15 : 0));
  const score = Math.max(0, Math.min(100, rawScore));

  const threshold = level === 'Pre-A1' ? 55 : level === 'A1' ? 62 : level === 'A2' ? 68 : level === 'B1' ? 72 : level === 'B2' ? 75 : 78;
  const minConceptRatio = level === 'Pre-A1'
    ? 0.5
    : level === 'A1'
      ? (concepts.length >= 2 ? 0.5 : 0.99)
      : (concepts.length >= 2 ? 0.6 : 0.99);
  const accepted = !questionMissing && score >= threshold && (conceptScore >= minConceptRatio || lexicalScore >= (level === 'Pre-A1' ? 0.6 : 0.72));

  if (accepted) {
    const feedback = score >= 88
      ? (level === 'B2' || level === 'C1' ? 'دقیق، طبیعی و متناسب با لحن و بافت موقعیت.' : 'عالی؛ واضح و متناسب با موقعیت پاسخ دادی.')
      : 'منظور پیام منتقل شد؛ می‌توانی در دور بعد با واژه‌های کامل‌تر دقیق‌ترش کنی.';
    return {
      accepted: true,
      score,
      conceptScore,
      lexicalScore,
      missingConcepts,
      feedback,
      branchReply: branch?.reply ?? rule.fallbackReply,
      wordResults,
    };
  }

  if (questionMissing) {
    return {
      accepted: false,
      score,
      conceptScore,
      lexicalScore,
      missingConcepts,
      questionMissing: true,
      feedback: 'این نوبت نیازمند پرسش است؛ با واژهٔ پرسشی یا لحن سؤال بیانش کن.',
      partnerPushback: pushback.question,
      wordResults,
    };
  }

  const missingNote = missingConcepts.length
    ? `بخش‌های جاافتاده: ${missingConcepts.slice(0, 3).map(w => `«${w}»`).join('، ')}`
    : 'بخش‌های اصلی جمله هنوز کامل منتقل نشده‌اند.';
  return {
    accepted: false,
    score,
    conceptScore,
    lexicalScore,
    missingConcepts,
    feedback: `پاسخ هنوز برای این نوبت کامل نیست (${score}٪). ${missingNote}`,
    partnerPushback: pushback.unclear,
    wordResults,
  };
}

const EN_B2: BranchingConversation = {
  level: 'B2', mode: 'branching', turns: {
    1: {
      promptFa: 'دیدگاهت را دربارهٔ سیاست تازه بگو: حمایت با دلیل، نگرانی، یا درخواست توضیح بیشتر.',
      concepts: [['agree', 'support', 'reasonable', 'yes', 'disagree', 'concern', 'however', 'but', 'more', 'information', 'clarify', 'why']],
      branches: [
        { match: [['agree', 'support', 'reasonable', 'yes']], reply: { text: 'The cost is my main concern.', fa: 'نگرانی اصلی من هزینهٔ آن است.' } },
        { match: [['disagree', 'concern', 'however', 'but']], reply: { text: 'I understand your concern. What alternative do you suggest?', fa: 'نگرانی‌ات را درک می‌کنم. چه گزینهٔ دیگری پیشنهاد می‌کنی؟' } },
        { match: [['more', 'information', 'clarify', 'why']], reply: { text: 'Of course. I can explain the costs and expected results.', fa: 'حتماً. می‌توانم هزینه‌ها و نتایج مورد انتظار را توضیح دهم.' } },
      ],
      fallbackReply: { text: 'Could you explain your position a little more?', fa: 'می‌توانی دیدگاهت را کمی بیشتر توضیح بدهی؟' },
    },
    3: {
      promptFa: 'در پاسخ به نگرانی هزینه، یک راه‌حل میانه یا آزمایشی پیشنهاد بده.',
      concepts: [['could', 'should', 'suggest', 'recommend', 'propose', 'try', 'start'], ['smaller', 'trial', 'reduce', 'improve', 'cost', 'risk', 'budget']],
      fallbackReply: { text: 'That might be a reasonable compromise.', fa: 'این می‌تواند یک مصالحهٔ منطقی باشد.' },
    },
  },
};

const DEFINITIONS: Record<string, BranchingConversation> = {
  'b2-survival-society-negotiation': EN_B2,
};

const LEVEL_BY_ID: Record<number, ConversationLevel> = { 0: 'Pre-A1', 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1' };
const modeFor = (level: ConversationLevel): ConversationMode => level === 'Pre-A1' ? 'guided' : level === 'A1' ? 'controlled' : level === 'A2' ? 'semi-free' : level === 'B1' ? 'semantic' : level === 'B2' ? 'branching' : 'open-roleplay';

function expandConcept(word: string): string[] {
  const syn = SYNONYM_LOOKUP.get(word);
  return syn ? [...new Set([word, ...syn])] : [word];
}

function buildRequiredConcepts(target: string, level: ConversationLevel): string[][] {
  const words = normalize(target)
    .split(' ')
    .filter(w => w.length > 1 && !STOP.has(w) && !NEGATION_TOKENS.has(w));
  const unique = [...new Set(words)];
  if (!unique.length) {
    const raw = normalize(target).split(' ').filter(Boolean);
    return raw.length ? [expandConcept(raw[0])] : [[target]];
  }
  const rawWords = normalize(target).split(' ').filter(Boolean);
  const desiredCount = level === 'Pre-A1'
    ? (rawWords.length <= 4 ? 1 : Math.min(2, unique.length))
    : level === 'A1' || level === 'A2'
      ? Math.min(2, unique.length)
      : Math.min(3, unique.length);
  // Pick the most informative (longest) distinct words in natural sentence order
  const ranked = [...unique]
    .map((word, idx) => ({ word, idx, weight: word.length }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, desiredCount)
    .sort((a, b) => a.idx - b.idx);
  return ranked.map(item => expandConcept(item.word));
}

function deterministicShuffleChoices(choices: Choice[], seedKey: string): Choice[] {
  const list = [...choices];
  let seed = [...seedKey].reduce((sum, ch) => sum + ch.charCodeAt(0), 19);
  for (let i = list.length - 1; i > 0; i -= 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = seed % (i + 1);
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

/** Generates a level-appropriate, non-trivial conversation contract for every catalog lesson across all 6 languages. */
export function conversationPracticeForLesson(
  lesson: { id: string; levelId: number; sentences: ReadonlyArray<{ text?: string; en?: string; fa: string }>; dialogue?: ReadonlyArray<{ text: string; fa: string; role?: string; speaker?: string }> },
  locale: BranchingLocale,
): BranchingConversation {
  const level = LEVEL_BY_ID[Math.max(0, Math.min(5, lesson.levelId))] ?? 'A1';
  const mode = modeFor(level);
  const rawLines: Array<{ text: string; fa: string; role?: string; speaker?: string }> = (lesson.dialogue?.length
    ? lesson.dialogue.map(line => ({ ...line, text: line.text.trim() }))
    : lesson.sentences.map((sentence, index) => ({ text: sentence.text || sentence.en || '', fa: sentence.fa, role: index % 2 ? 'learner' : 'partner' })))
    .filter(line => line.text.trim());
  const explicitLearnerSpeaker = rawLines.find(l => l.role === 'learner')?.speaker
    ?? rawLines.find(l => l.speaker && /^(learner|you|شما|زبان‌آموز|زبانآموز)$/i.test(l.speaker.trim()))?.speaker;
  const distinctSpeakers = [...new Set(rawLines.map(l => l.speaker).filter(Boolean) as string[])];
  const inferredLearnerSpeaker = explicitLearnerSpeaker ?? distinctSpeakers[1] ?? null;
  const lines = rawLines.map((line, index) => ({
    ...line,
    role: line.role ?? (inferredLearnerSpeaker ? (line.speaker === inferredLearnerSpeaker ? 'learner' : 'partner') : (index % 2 === 1 ? 'learner' : 'partner')),
  }));
  const turns: Record<number, SemanticTurn> = {};
  lines.forEach((line, index) => {
    if (line.role !== 'learner' && line.speaker !== 'learner') return;
    const target = line.text.trim();
    const distractorPool = [
      ...lines.filter(candidate => candidate !== line && normalize(candidate.text) !== normalize(target) && candidate.text.trim()),
      ...lesson.sentences
        .map(s => ({ text: (s.text || s.en || '').trim(), fa: s.fa }))
        .filter(s => s.text && normalize(s.text) !== normalize(target)),
    ];
    const seen = new Set<string>([normalize(target)]);
    const distractors: Choice[] = [];
    for (const candidate of distractorPool) {
      const key = normalize(candidate.text);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      distractors.push({ text: candidate.text, correct: false });
      if (distractors.length >= 2) break;
    }
    const choices = (level === 'Pre-A1' || level === 'A1') && distractors.length > 0
      ? deterministicShuffleChoices([{ text: target, correct: true }, ...distractors], `${lesson.id}:${index}:${locale}`)
      : undefined;

    turns[index] = {
      promptFa: line.fa || target,
      targetText: target,
      concepts: buildRequiredConcepts(target, level),
      choices,
      chunks: (level === 'Pre-A1' || level === 'A1') ? target.split(/\s+/).filter(Boolean) : undefined,
      expectedPolarity: detectPolarity(target),
      expectedQuestion: /[?¿]/.test(target),
    };
  });
  const generated: BranchingConversation = { level, mode, turns };
  const explicit = DEFINITIONS[lesson.id];
  if (!explicit) return generated;
  const mergedTurns = { ...generated.turns };
  Object.entries(explicit.turns).forEach(([key, turn]) => {
    const index = Number(key);
    const base = generated.turns[index];
    mergedTurns[index] = {
      ...turn,
      targetText: base?.targetText,
      expectedPolarity: turn.expectedPolarity ?? base?.expectedPolarity,
      expectedQuestion: turn.expectedQuestion ?? base?.expectedQuestion,
    };
  });
  return { ...explicit, turns: mergedTurns };
}

/** Backwards-compatible lookup for the four authored pilots. */
export function branchingConversationFor(lessonId: string): BranchingConversation | null {
  return DEFINITIONS[lessonId] ?? null;
}
