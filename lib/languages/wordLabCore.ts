/**
 * «واژه‌های مهم» — the curated core of the German and Russian word lab.
 *
 * The lab used to be a plain frequency list. Frequency is a good tie-breaker, not a syllabus: it put
 * function words such as «und», «nicht» or «не» first, and a card could show a one-word example that
 * taught nothing. This module names, per language and in teaching order, the words a beginner must own
 * first — greetings, politeness, numbers, family, food, time, places, travel, money, health — and gives
 * each one a real sentence of the shipped course to say back.
 *
 * Nothing here is typed twice by hand:
 *   • the word must be a vocabulary row of the course, so its Persian gloss comes from the course;
 *   • the example must be a sentence of the course that contains the word, so its Persian translation
 *     and its Persian respelling come from the course as well;
 *   • only Pre-A1 and A1 sentences are used, and a sentence that is merely the word itself is rejected —
 *     the learner always has a sentence to repeat.
 * A target that cannot satisfy these rules is dropped rather than shown half-correct, and
 * `scripts/verify-word-lab-core.mjs` prints both the accepted words and the dropped targets.
 */
import { NEW_COURSES } from './newCourses';
import { RUSSIAN_LESSONS } from './russian';

export type WordLabLanguageId = 'de' | 'ru';

export interface CoreWord {
  id: string;
  /** The word as the course writes it (German keeps its capital letter, Russian its stress mark). */
  target: string;
  /** Persian meaning, copied from the course vocabulary row that taught the word. */
  fa: string;
  /** A real sentence of the course that uses the word. */
  sentence: string;
  /** Persian translation of `sentence`, copied from the course. */
  sentenceFa: string;
  /** Persian respelling of `sentence`, copied from the course. */
  sentencePronunciation: string;
  /** The lesson the sentence comes from, shown as «از درس …». */
  lessonTitle: string;
  levelId: number;
  /** Short Persian cue (article, register, irregular form), only where the word needs one. */
  note: string;
  /** 1-based position in the curated order. */
  order: number;
}

/** The teaching order of the German core. Nouns are listed without their article. */
const DE_TARGETS: readonly string[] = [
  // سلام، ادب و پاسخ کوتاه
  'Hallo', 'Guten Tag', 'Guten Morgen', 'Tschüss', 'Auf Wiedersehen', 'Danke', 'bitte', 'Entschuldigung', 'Ja', 'nein',
  // خودم و مخاطبم
  'Ich', 'Du', 'Sie', 'bin', 'ist', 'mein', 'dein', 'Name', 'heiße', 'komme', 'wohne', 'wohnt',
  // عدد
  'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'zehn', 'zwölf',
  // کافه و غذا
  'Wasser', 'Tee', 'Kaffee', 'Milch', 'Brot', 'Kuchen', 'Frühstück', 'essen', 'trinken', 'möchte', 'möchten', 'Rechnung', 'Euro',
  // خانواده و افراد
  'Familie', 'Mutter', 'Vater', 'Schwester', 'Kind', 'Kinder', 'Sohn', 'Eltern', 'Freundin',
  // خانه و وسایل
  'Haus', 'Hause', 'Wohnung', 'Zimmer', 'Küche', 'Bad', 'Tisch', 'Bett', 'Fenster', 'Tür', 'Buch', 'Telefon', 'Handy', 'Tasche', 'Schlüssel',
  // زمان
  'Zeit', 'Tag', 'heute', 'morgen', 'Abend', 'Woche', 'Wochenende', 'Montag', 'Samstag', 'Sonntag', 'Uhr', 'Monat', 'wann', 'früh', 'spät', 'jetzt', 'gestern',
  // مکان و پرسش
  'wo', 'Wo', 'Woher', 'hier', 'dort', 'weit', 'nah', 'Zentrum', 'Straße', 'Toilette', 'Platz',
  // رفت‌وآمد
  'Bahnhof', 'Zug', 'Bus', 'Flughafen', 'Auto', 'Fahrkarte', 'gehe', 'gehen',
  // کار، درس و پول
  'arbeiten', 'arbeite', 'Arbeit', 'Büro', 'Schule', 'Unterricht', 'Lehrer', 'Lehrerin', 'Frage', 'Satz', 'Deutsch', 'sprechen', 'verstehe', 'schreiben', 'lernt', 'Geld', 'kostet', 'teuer', 'bezahlen',
  // توصیف
  'gut', 'schön', 'neu', 'alt', 'groß', 'klein', 'lang', 'kalt', 'warm', 'müde', 'froh', 'krank', 'frei', 'Farbe', 'rot', 'blau', 'grün', 'gelb', 'schwarz', 'braun', 'hell',
  // پرسش‌های پرکاربرد
  'was', 'Was', 'Wie', 'Warum', 'Welcher', 'Wer', 'viel', 'viele',
  // نیاز و توانایی
  'brauche', 'Hilfe', 'helfen', 'kann', 'können', 'muss', 'mag', 'gern', 'natürlich', 'leider',
  // سلامت
  'Krankenhaus', 'Apotheke',
];

/** The teaching order of the Russian core, written with the stress marks the course uses. */
const RU_TARGETS: readonly string[] = [
  // سلام، ادب و پاسخ کوتاه
  'приве́т', 'здра́вствуйте', 'пока́', 'до свида́ния', 'спаси́бо', 'пожа́луйста', 'извини́те', 'да', 'нет', 'хорошо́',
  // خودم و مخاطبم
  'я', 'ты', 'вы', 'мы', 'мой', 'и́мя', 'живу́',
  // عدد
  'оди́н', 'два', 'три', 'пять', 'шесть', 'семь', 'де́вять', 'де́сять', 'два́дцать',
  // کافه و غذا
  'вода́', 'чай', 'ко́фе', 'хлеб', 'молоко́', 'мя́со', 'о́вощи', 'фру́кты', 'горя́чий', 'есть', 'пить', 'хочу́', 'вку́сно',
  // خانواده
  'семья́', 'мать', 'оте́ц', 'брат', 'сестра́', 'сын', 'дочь',
  // خانه و وسایل
  'дом', 'кварти́ра', 'стол', 'окно́', 'кни́га', 'телефо́н', 'су́мка', 'ключ',
  // زمان
  'вре́мя', 'день', 'сего́дня', 'за́втра', 'вчера́', 'у́тро', 'ве́чер', 'ночь', 'неде́ля', 'понеде́льник', 'вто́рник', 'воскресе́нье', 'ме́сяц', 'час', 'сейча́с', 'когда́',
  // مکان و پرسش
  'где', 'что', 'кто', 'как', 'ско́лько', 'здесь', 'там', 'далеко́', 'ря́дом', 'го́род', 'туале́т', 'ме́сто', 'по́чта', 'магази́н',
  // رفت‌وآمد
  'метро́', 'авто́бус', 'по́езд', 'такси́', 'биле́т', 'маши́на',
  // کار، درس و پول
  'рабо́та', 'шко́ла', 'уро́к', 'учи́тель', 'вопро́с', 'язы́к', 'письмо́', 'но́мер', 'компью́тер', 'повтори́те', 'сто́ит', 'до́рого',
  // توصیف
  'хоро́ший', 'плохо́й', 'но́вый', 'большо́й', 'ма́ленький', 'краси́вый', 'холо́дно', 'тепло́', 'кра́сный', 'о́чень',
  // نیاز و توانایی
  'ну́жно', 'мо́жно', 'могу́', 'помо́щь', 'помоги́те', 'спать', 'до́ма',
  // سلامت
  'врач', 'апте́ка', 'бо́льно',
];

/** Short Persian cues; only for words whose form or register needs one. */
const DE_NOTES: Record<string, string> = {
  'guten tag': 'سلام خنثی و رسمی؛ «Hallo» دوستانه‌تر است.',
  'guten morgen': 'فقط صبح‌ها؛ بعدازظهر «Guten Tag» می‌گویید.',
  'auf wiedersehen': 'خداحافظی رسمی؛ «Tschüss» دوستانه است.',
  bitte: 'هم «لطفاً» است هم «خواهش می‌کنم».',
  entschuldigung: 'برای عذرخواهی کوتاه یا جلب توجه.',
  sie: 'با حرف بزرگ یعنی «شما»ی رسمی؛ sie کوچک «او/آن‌ها» است.',
  heiße: 'فعل «heißen» با من: ich heiße.',
  wohne: 'فعل «wohnen» با من: ich wohne.',
  möchte: 'صورت مؤدبانهٔ «خواستن»؛ با من و با Sie به کار می‌رود.',
  rechnung: 'در کافه و رستوران: Die Rechnung bitte.',
  euro: 'جمعش هم Euro است؛ «fünf Euro».',
  hause: 'فقط در عبارت «zu Hause» یعنی در خانه.',
  zimmer: 'اسم خنثی است: das Zimmer.',
  küche: 'اسم مؤنث است: die Küche.',
  tür: 'اسم مؤنث است: die Tür.',
  schlüssel: 'اسم مذکر است: der Schlüssel.',
  wochenende: 'اسم خنثی است: das Wochenende.',
  straße: 'اسم مؤنث است: die Straße.',
  fahrkarte: 'اسم مؤنث است: die Fahrkarte.',
  unterricht: 'اسم مذکر است: der Unterricht.',
  lehrer: 'مؤنثش «die Lehrerin» است.',
  frage: 'اسم مؤنث است: die Frage.',
  arzt: 'مؤنثش «die Ärztin» است.',
  apotheke: 'اسم مؤنث است: die Apotheke.',
  farbe: 'اسم مؤنث است: die Farbe.',
  geld: 'اسم خنثی است: das Geld.',
};

const RU_NOTES: Record<string, string> = {
  'до свидания': 'خداحافظی رسمی؛ «пока» دوستانه است.',
  здравствуйте: 'سلام رسمی؛ «в» میان واژه شنیده نمی‌شود.',
  пожалуйста: 'هم «لطفاً» است هم «خواهش می‌کنم».',
  есть: 'هم «هست» است هم «خوردن»؛ در این جمله اولی.',
  пить: 'مصدر «نوشیدن»؛ با من: я пью.',
  хочу: 'بی‌قاعده است؛ با من: я хочу.',
  живу: 'فعل «жить» با من: я живу.',
  деньги: 'همیشه جمع است.',
  стоит: 'فعل «стоить»: قیمت دارد.',
  нужно: 'با «мне» می‌آید: мне нужно.',
  можно: 'یعنی «می‌شود / اجازه هست».',
  нельзя: 'یعنی «نمی‌شود / اجازه نیست».',
  больно: 'یعنی «درد می‌کند».',
  имя: 'خنثی است؛ در جمله «меня зовут» هم برای نام به کار می‌رود.',
};

/**
 * Persian glosses for core words the course *uses* in a sentence but lists under another headword
 * (for example «Straße» is taught inside «Die Straße ist ruhig.» while the vocabulary row of that
 * sentence is «ruhig», and «четы́ре» is taught inside the number chain). The sentence, its Persian
 * translation and its respelling still come from the course — only the word-level gloss is authored
 * here, because the course has no row for that headword. A target still needs a real course sentence
 * to be shown; a gloss alone never creates a card.
 */
const DE_CORE_GLOSS: Record<string, string> = {
  tag: 'روز',
  nacht: 'شب',
  stunde: 'ساعت (یک ساعت زمان)',
  stadt: 'شهر',
  straße: 'خیابان',
  schule: 'مدرسه',
  kaufen: 'خریدن',
  muss: 'باید',
  arzt: 'پزشک',
  uhr: 'ساعت (وسیله و ساعتِ روز)',
  monat: 'ماه',
  arbeit: 'کار',
  lehrerin: 'معلم (زن)',
  satz: 'جمله',
};

const RU_CORE_GLOSS: Record<string, string> = {
  четыре: 'چهار',
  восемь: 'هشت',
  сыр: 'پنیر',
  яблоко: 'سیب',
  друг: 'دوست (مرد)',
  дети: 'کودکان',
  комната: 'اتاق',
  стул: 'صندلی',
  дверь: 'در',
  окно: 'پنجره',
  неделя: 'هفته',
  почему: 'چرا',
  улица: 'خیابان',
  место: 'جا، مکان',
  вокзал: 'ایستگاه قطار',
  урок: 'درس',
  язык: 'زبان',
  говорить: 'صحبت کردن',
  понимать: 'فهمیدن',
  читать: 'خواندن',
  писать: 'نوشتن',
  деньги: 'پول',
  платить: 'پرداختن',
  новый: 'نو',
  старый: 'قدیمی',
  вкусный: 'خوشمزه',
  синий: 'آبی',
  зелёный: 'سبز',
  жёлтый: 'زرد',
  чёрный: 'سیاه',
  белый: 'سفید',
  нельзя: 'نمی‌شود، اجازه نیست',
  больница: 'بیمارستان',
  // واژه‌هایی که دوره در جمله‌های Pre-A1 می‌آورد ولی هیچ‌وقت سرِ یک ردیف واژگان تنها نبوده‌اند.
  вы: 'شما (مودبانه برای یک نفر هم همین).',
  как: 'چگونه، چطور.',
  два: 'دو.',
  горячий: 'داغ (شکل مذکر).',
  магазин: 'فروشگاه.',
  'до свидания': 'خداحافظی (رسمی).',
  кофе: 'قهوه.',
  вторник: 'سه‌شنبه.',
  месяц: 'ماه (۳۰ روز).',
};

/**
 * One string is folded many times while the lab is built — once per target for every course sentence —
 * so the result is cached. `fold` is pure, and a course only holds a few thousand distinct strings.
 */
const folded = new Map<string, string>();
const fold = (value: string): string => {
  const cached = folded.get(value);
  if (cached !== undefined) return cached;
  const next = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ё/g, 'е')
    .replace(/[´`’'!?.,;:«»„“”¿¡…—–]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  folded.set(value, next);
  return next;
};

/** The authored map is written with normal stress-free spelling, so compare it through `fold`. */
const foldedGlossIndex = new WeakMap<Record<string, string>, Map<string, string>>();
function authoredGloss(glosses: Record<string, string>, key: string): string | undefined {
  if (glosses[key]) return glosses[key];
  let index = foldedGlossIndex.get(glosses);
  if (!index) {
    index = new Map<string, string>();
    // The first entry with a given folded spelling wins, exactly like the linear scan this replaces.
    for (const [word, gloss] of Object.entries(glosses)) {
      const foldedWord = fold(word);
      if (!index.has(foldedWord)) index.set(foldedWord, gloss);
    }
    foldedGlossIndex.set(glosses, index);
  }
  return index.get(key);
}

type CourseSentence = { text: string; fa: string; pronunciation: string; vocabulary?: Array<{ word: string; meaning: string }> };
type CourseLesson = { id: string; title: string; levelId: number; sentences: CourseSentence[]; learningMode?: string };

function courseLessons(language: WordLabLanguageId): readonly CourseLesson[] {
  return language === 'de'
    ? (NEW_COURSES.de.lessons as unknown as readonly CourseLesson[])
    : (RUSSIAN_LESSONS as unknown as readonly CourseLesson[]);
}

/** Generated review lessons mix quoted frequency words into filler sentences; they teach nothing. */
const isLabLesson = (id: string) => id.startsWith('lab-');
/** Pre-A1 and A1 only: the lab teaches the beginner band. */
const MAX_LEVEL = 1;

/**
 * A course sentence with everything the matcher asks about worked out once: the lab used to fold every
 * sentence again for every one of the ~160 target words, which made opening the lab take seconds on a
 * phone. The strings are the same; they are just measured once instead of once per target.
 */
type PreparedSentence = {
  lesson: CourseLesson;
  sentence: CourseSentence;
  /** `fold(sentence.text)` — the frame of comparison for one target. */
  key: string;
  /** Folded words of the sentence, punctuation-stripped the same way the scan always was. */
  tokens: Set<string>;
  /** Folded vocabulary words, so «does this sentence teach the word?» is a set lookup. */
  vocabulary: Set<string>;
  wordCount: number;
  /** A quoted word list or a one-word card is never an example the learner can say back. */
  usable: boolean;
};

function prepareSentences(lessons: readonly CourseLesson[]): PreparedSentence[] {
  const prepared: PreparedSentence[] = [];
  for (const lesson of lessons) {
    for (const sentence of lesson.sentences) {
      const text = sentence.text.trim();
      const tokens = text.replace(/[!?.,;:]/g, ' ').split(/\s+/).filter(Boolean);
      prepared.push({
        lesson,
        sentence,
        key: fold(text),
        tokens: new Set(tokens.map(token => fold(token))),
        vocabulary: new Set((sentence.vocabulary ?? []).map(item => fold(item.word))),
        wordCount: text.split(/\s+/).length,
        usable: tokens.length >= 2 && !/[«»]/.test(text),
      });
    }
  }
  return prepared;
}

/** Word-boundary test for a multi-word target such as «Guten Tag»; built once per target. */
const phraseTests = new Map<string, RegExp>();
function phraseTest(needle: string): RegExp {
  let test = phraseTests.get(needle);
  if (!test) {
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    test = new RegExp(`(^|\\s)${escaped}(\\s|$)`, 'u');
    phraseTests.set(needle, test);
  }
  return test;
}

/**
 * How well the sentence says the word: 0 = the word stands there as its own token, `null` = the
 * sentence does not really say it. Matching a prefix without a word boundary is not allowed, so
 * «Küche» never matches «Kuchen» and «Tür» never matches «Türkei».
 */
function matchQuality(sentence: PreparedSentence, needle: string): 0 | null {
  if (!sentence.usable || !needle || sentence.key === needle) return null;
  // Exact token (or exact multi-word phrase) only: the target list names the form the course actually
  // writes, so a prefix can never turn «Küche» into «Kuchen» or «Tür» into «Türkei».
  if (needle.includes(' ')) return phraseTest(needle).test(sentence.key) ? 0 : null;
  return sentence.tokens.has(needle) ? 0 : null;
}

/** Shortest, earliest, clearest sentence wins: it is the one a beginner can repeat. */
function sentenceScore(sentence: PreparedSentence, teachesHere: boolean): number {
  // A word list card («Guten Tag») is not an example the learner can say back; a real sentence always wins.
  const wordList = sentence.lesson.learningMode ? 300 : 0;
  return sentence.lesson.levelId * 1000 + wordList + sentence.wordCount * 3 + (teachesHere ? 0 : 500);
}

/**
 * The Persian gloss is the meaning the course itself repeats most often for this word (earliest level
 * wins ties), so «Hallo» is 「سلام」 and not the one-off telephone 「الو」.
 */
function glossFor(rows: ReadonlyArray<{ meaning: string; levelId: number }>): string | null {
  if (!rows.length) return null;
  const tally = new Map<string, { count: number; levelId: number }>();
  for (const row of rows) {
    const entry = tally.get(row.meaning) ?? { count: 0, levelId: row.levelId };
    entry.count += 1;
    entry.levelId = Math.min(entry.levelId, row.levelId);
    tally.set(row.meaning, entry);
  }
  return [...tally.entries()]
    .sort((a, b) => b[1].count - a[1].count || a[1].levelId - b[1].levelId)[0][0];
}

function build(
  language: WordLabLanguageId,
  targets: readonly string[],
  notes: Record<string, string>,
  glosses: Record<string, string>,
): readonly CoreWord[] {
  const all = courseLessons(language).filter(lesson => !isLabLesson(lesson.id));
  const beginner = prepareSentences(all.filter(lesson => lesson.levelId <= MAX_LEVEL));
  // Every meaning the course ever gives each word, indexed in one pass instead of rescanning the whole
  // course for every target. Rows keep the course order, so the tally is unchanged.
  const meanings = new Map<string, Array<{ meaning: string; levelId: number }>>();
  for (const lesson of all) {
    for (const sentence of lesson.sentences) {
      for (const item of sentence.vocabulary ?? []) {
        const key = fold(item.word);
        const rows = meanings.get(key);
        if (rows) rows.push({ meaning: item.meaning, levelId: lesson.levelId });
        else meanings.set(key, [{ meaning: item.meaning, levelId: lesson.levelId }]);
      }
    }
  }
  const out: CoreWord[] = [];
  // Each example should teach one word: two cards sharing a sentence make the second one noise. A reused
  // sentence is allowed only when nothing else exists for that word, so it costs the price of a fallback.
  const usedSentences = new Set<string>();
  const emitted = new Set<string>();

  for (const target of targets) {
    const key = fold(target);
    if (!key) continue;
    // The course's own gloss wins; a target the course only uses inside a sentence keeps the
    // authored gloss above instead of disappearing from the lab.
    const fa = glossFor(meanings.get(key) ?? []) ?? authoredGloss(glosses, key);
    if (!fa) continue;
    // …and the simplest beginner sentence that actually says it.
    let best: { sentence: PreparedSentence; score: number } | null = null;
    for (const sentence of beginner) {
      if (matchQuality(sentence, key) === null) continue;
      const score = sentenceScore(sentence, sentence.vocabulary.has(key))
        + (usedSentences.has(sentence.key) ? 900 : 0);
      if (!best || score < best.score) best = { sentence, score };
    }
    if (!best) continue;
    if (emitted.has(key)) continue;
    emitted.add(key);
    usedSentences.add(best.sentence.key);
    out.push({
      id: `${language}-core-${key.replace(/\s+/g, '-')}`,
      target,
      fa,
      sentence: best.sentence.sentence.text,
      sentenceFa: best.sentence.sentence.fa,
      sentencePronunciation: best.sentence.sentence.pronunciation,
      lessonTitle: best.sentence.lesson.title,
      levelId: best.sentence.lesson.levelId,
      note: notes[key] ?? '',
      order: out.length + 1,
    });
  }
  // Unresolved targets are reported by the verify script; the order is only for reading.
  return out;
}

export const CORE_WORDS: Record<WordLabLanguageId, readonly CoreWord[]> = {
  de: build('de', DE_TARGETS, DE_NOTES, DE_CORE_GLOSS),
  ru: build('ru', RU_TARGETS, RU_NOTES, RU_CORE_GLOSS),
};

/** Targets the shipped course could not supply a full sentence for, listed for the verify script. */
export const UNRESOLVED_CORE_TARGETS: Record<WordLabLanguageId, readonly string[]> = {
  de: DE_TARGETS.filter(target => !CORE_WORDS.de.some(word => fold(word.target) === fold(target))),
  ru: RU_TARGETS.filter(target => !CORE_WORDS.ru.some(word => fold(word.target) === fold(target))),
};
