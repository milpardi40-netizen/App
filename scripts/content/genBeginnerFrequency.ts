/**
 * Teachable beginner frequency list for Russian — the Pre-A1/A1 measurement fix.
 *
 * `lib/content/frequency/ru.json` is a *corpus* list: its first 150 ranks are almost entirely function
 * words and news-register nouns (`млн`, `области`, `апреля`), so measuring a beginner course against them
 * produces a number nobody can explain to a learner — «27% ready» for a course that teaches everything an
 * A1 syllabus needs, or «92%» because downloaded frames filled the gap. This script builds the yardstick
 * the spec-alignment report asks for: the beginner-eligible words — the function words a beginner really
 * needs plus the content words of the standard A1 semantic fields — written in teaching order. The order
 * is the syllabus, not the corpus: web frequency ranks `скидка`, `зуб` and `вставать` below news prose,
 * and a measurement that drops them for that reason is measuring the corpus again.
 *
 * Usage (repo root, with the lesson-data shim):
 *   export NODE_OPTIONS="--require ./scripts/content/shim.cjs"
 *   npx tsx scripts/content/genBeginnerFrequency.ts --write
 *
 * Rules, in order:
 *   1. every candidate is a bare lowercase Cyrillic word (nominative singular / masculine adjective /
 *      infinitive); multi-word items are not allowed, because the matcher compares words;
 *   2. inside each Pre-A1 topic the first `PRE_QUOTA[topic]` words are the Pre-A1 target and the rest of
 *      the topic falls through to the A1 half; the script asserts the Pre-A1 half comes to exactly
 *      `COURSE_SPEC.pre.vocabularyCeiling` families, so the ceiling and the syllabus cannot drift apart;
 *   2b. `ru.json` is read for the report only (median corpus rank per topic), never for slicing;
 *   3. an inflected twin is dropped: one form of a family gets one slot. That is what stops `которые /
 *      которых / которого` from eating three places of a 150-word target, and the twin test is the prefix
 *      half of the rule `readiness.ts` applies, so the list never asks the course for a word it would
 *      credit for free. The generous skeleton half is used only for crediting, never for deleting;
 *      two entries that share a skeleton (`вода` / `видеть`) therefore both stay in the target;
 *   4. the A1 target is the whole core, capped by `COURSE_SPEC.A1.vocabularyCeiling` — the core may be
 *      smaller than the ceiling but never bigger, because curated words nobody measures are how a list
 *      starts to lie. Bands above A1 keep the corpus list: a beginner core says nothing about B1.
 *
 * The script never edits a hand-written course file: it writes `lib/content/frequency/ru-beginner.json`
 * and `docs/beginner-frequency.md`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { CEFR_BANDS, COURSE_SPEC, type CefrBand } from '@/lib/content/courseSpec';
import { tokenize } from '@/lib/content/readiness';

/**
 * Topic → words, in teaching order. Written the way the syllabus is written: the words a learner meets
 * first are the words written first.
 */
const PRE_TOPICS: Record<string, string> = {
  // ── вежливость, приветствие, прощание ──────────────────────────────────────────────────
  'этикет': 'здравствуйте привет свидание спасибо пожалуйста извините да нет хорошо приятно плохо',
  'местоимения': 'я ты вы мы он она оно они это тот этот мой твой наш ваш свой кто что где куда когда почему как какой чей',
  'вопрос и указание': 'сколько там здесь вот сейчас потом тоже также уже ещё только очень даже ли бы не ни каждый весь',
  'модальность': 'надо нужно можно нельзя должен хотеть мочь удаваться случаться',
  'глаголы: бытие и речь': 'быть жить любить знать понимать думать говорить сказать читать слышать смотреть видеть пить спать есть ходить работать учиться отдыхать давать брать стоять сидеть ждать звать нравиться отвечать спрашивать звонить помогать писать слушать',
  'предлоги и союзы': 'в на под над перед около из от до после у о про для с без и а но или если чтобы при между',
  'числа': 'ноль один два три четыре пять шесть семь восемь девять десять сто тысяча миллион первый второй третий номер',
  'время': 'час день ночь утро вечер месяц год вчера сегодня завтра всегда никогда часто',
  'люди и семья': 'человек имя семья родитель мама папа муж жена сын дочь ребёнок брат сестра бабушка дедушка друг подруга женщина мужчина девочка мальчик',
  'дом': 'дом квартира комната кухня стол стул кровать шкаф окно дверь стена пол потолок свет вода',
  'еда': 'хлеб сыр суп мясо рыба курица яйцо молоко масло соль сахар перец фрукт яблоко банан лимон апельсин помидор огурец картофель капуста морковь овощи еда завтрак обед ужин чай кофе сок вино пиво меню заказ счёт ложка вилка нож тарелка стакан чашка кружка бутылка пакет салат соус',
  'качества': 'большой маленький новый старый хороший плохой тёплый холодный горячий красный синий зелёный жёлтый белый чёрный серый коричневый розовый красивый интересный удобный простой нужный важный',
  'учёба и язык': 'урок книга ручка тетрадь слово текст вопрос ответ язык русский письмо студент учитель школа',
};

/**
 * How many leading words of each Pre-A1 topic belong to the Pre-A1 target itself. The numbers are the
 * syllabus: together (after the family rule collapses an inflected twin) they must come to
 * `COURSE_SPEC.pre.vocabularyCeiling` = 150 families, and nothing else decides that boundary.
 */
const PRE_QUOTA: Record<string, number> = {
  'этикет': 12, 'местоимения': 20, 'вопрос и указание': 15, 'модальность': 6,
  'глаголы: бытие и речь': 17, 'предлоги и союзы': 19, 'числа': 11, 'время': 10,
  'люди и семья': 13, 'дом': 7, 'еда': 11, 'качества': 8, 'учёба и язык': 4,
};

/** A1 additions: the semantic fields a beginner course has to cover on top of survival Russian. */
const A1_TOPICS: Record<string, string> = {  'город': 'город улица площадь парк магазин рынок аптека банк почта больница поликлинка кафе ресторан метро аэропорт гостиница стадион музей театр центр район адрес страна Россия',  'транспорт': 'автобус такси поезд самолёт машина велосипед дорога путь билет маршрут остановка вокзал багаж паспорт виза расписание поездка',  'покупки': 'деньги рубль цена скидка продавец покупатель чек сдача кошелёк сумка карта товар размер дорогой дешёвый покупать продавать',  'одежда': 'одежда рубашка футболка брюки юбка платье пальто куртка обувь',  'здоровье': 'здоровье врач болеть лечить температура горло голова глаз ухо нос рот зуб спина рука нога палец лекарство',  'внешность': 'внешность рост волосы очки',  'характер и чувства': 'характер добрый злой умный весёлый серьёзный спокойный стыдно страшно жалко весело',  'досуг': 'отдых отпуск концерт фильм музыка песня танец спорт футбол плавание фотография телефон камера интернет сайт праздник подарок',  'животные и природа': 'животное собака кот птица лошадь медведь погода зима весна лето осень дождь снег ветер небо солнце тепло река море гора',  'жилище и быт': 'туалет ванная ключ этаж холодильник суббота воскресенье неделя редко иногда обычно немного достаточно слишком быстро медленно рано поздно далеко близко рядом',  'учёба и язык': 'переводить экзамен',  'быт': 'вставать ложиться одеваться обуваться готовить убирать',  'работа': 'начальник компьютер зарплата профессия',  'движение и результат': 'начинать получать искать приезжать гулять играть петь дарить платить считать менять выбирать',  'количество и степень': 'много мало больше меньше лучше хуже почти совсем',  'порядок и связки': 'потому например',
};

const write = process.argv.includes('--write');
const root = path.resolve('lib/content/frequency');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'ru.json'), 'utf8')) as string[];
const rank = new Map<string, number>();
corpus.forEach((word, index) => { if (!rank.has(word)) rank.set(word, index + 1); });

/** Same rule as `readiness.ts` — kept in sync on purpose, and asserted by `verify-russian-course.cjs`. */
const STEM = 5;
const stemMatch = (a: string, b: string) =>
  a === b || (a.length >= STEM && b.length >= STEM && a.slice(0, STEM) === b.slice(0, STEM) && Math.abs(a.length - b.length) <= 3);
/**
 * Only the prefix-stem half of the matcher dedupes the list. The skeleton half is deliberately generous
 * (`вода` and `видеть` share the consonants в-д), which is fine when *crediting* a course and wrong when
 * *deleting* a word from the target: a generous rule used here would silently drop real vocabulary.
 */

type Entry = { word: string; topic: string; group: 'pre' | 'A1'; rank: number };
const problems: string[] = [];
const pool: Entry[] = [];
for (const [group, topics] of [['pre', PRE_TOPICS], ['A1', A1_TOPICS]] as const) {
  for (const topic of Object.keys(topics)) {
    topics[topic].trim().split(/\s+/).forEach((raw, index) => {
      const word = tokenize(raw)[0] ?? '';
      if (!word) { problems.push(`${topic}: empty candidate "${raw}"`); return; }
      if (!/^[а-яё]+$/.test(word)) { problems.push(`${topic}: "${raw}" is not a bare lowercase Cyrillic word`); return; }
      // Pre-A1 topics feed the target only up to their quota; the overflow joins the A1 half.
      const inTarget = group === 'pre' && index < (PRE_QUOTA[topic] ?? 0);
      pool.push({ word, topic: `${group}:${topic}`, group: inTarget ? 'pre' : 'A1', rank: rank.get(word) ?? 0 });
    });
  }
}
// Written order = teaching order; the only rearrangement is pulling the Pre-A1 picks to the front.
const orderedPool = [...pool.filter(entry => entry.group === 'pre'), ...pool.filter(entry => entry.group !== 'pre')];

const seenWord = new Map<string, Entry>();
const unique: Entry[] = [];
for (const entry of orderedPool) {
  const existing = seenWord.get(entry.word);
  if (existing) { problems.push(`"${entry.word}" is listed twice (${existing.topic}, ${entry.topic})`); continue; }
  seenWord.set(entry.word, entry);
  unique.push(entry);
}
if (problems.length) { for (const problem of problems) console.error(`✗ ${problem}`); process.exit(1); }

// One slot per family: the first (most essential) member of a family keeps it.
const kept: Entry[] = [];
const collapsed: string[] = [];
for (const entry of unique) {
  const twin = kept.find(prev => stemMatch(prev.word, entry.word));
  if (twin) { collapsed.push(`${entry.word}→${twin.word}`); continue; }
  kept.push(entry);
}

const preCeiling = COURSE_SPEC.pre.vocabularyCeiling;
const a1Ceiling = COURSE_SPEC.A1.vocabularyCeiling;
const preKept = kept.filter(entry => entry.group === 'pre').length;
if (preKept !== preCeiling) {
  problems.push(`the Pre-A1 target holds ${preKept} families after collapsing, but the Pre-A1 ceiling is ${preCeiling} — `
    + `${preKept < preCeiling ? `raise the PRE_QUOTA values (or add ${preCeiling - preKept} Pre-A1 words)` : `move the last ${preKept - preCeiling} Pre-A1 picks into the A1 group`}`);
}
// The core may be smaller than the ceiling (readiness takes `min(ceiling, core)`), but never larger: a
// tail beyond the ceiling would be curated yet unmeasured, which is how a list starts lying.
if (kept.length > a1Ceiling) {
  problems.push(`the core holds ${kept.length} families but the A1 ceiling is ${a1Ceiling} — `
    + `drop ${kept.length - a1Ceiling} marginal words or move them to the next band's list, do not let them sit unmeasured`);
}
if (kept.length < a1Ceiling * 0.8) {
  problems.push(`the core holds only ${kept.length} families against an A1 ceiling of ${a1Ceiling}: `
    + 'the target would be a matter of taste rather than of syllabus — add the missing A1 fields');
}
if (problems.length) { for (const problem of problems) console.error(`✗ ${problem}`); process.exit(1); }

const topicStats = (entries: Entry[]) => {
  const perTopic = new Map<string, Entry[]>();
  for (const entry of entries) {
    const list = perTopic.get(entry.topic) ?? [];
    list.push(entry);
    perTopic.set(entry.topic, list);
  }
  return [...perTopic.entries()].map(([topic, group]) => {
    const ranks = group.filter(entry => entry.rank > 0).map(entry => entry.rank).sort((a, b) => a - b);
    const median = ranks.length ? ranks[Math.floor(ranks.length / 2)] : 0;
    return `${topic.replace(/^\w+:/, '')} ${group.length}${median ? ` (медиана corpus rank ${median})` : ''}`;
  }).join('; ');
};

const list = kept.map(entry => entry.word);
// The core is the word target for exactly these bands — the two the list was written for. Deriving the
// range from the ceilings would be clever in the wrong direction: 449 families fit inside A1's budget of
// 500, which says nothing about whether anyone intended A2 to be measured on a beginner list.
const coreBands: CefrBand[] = ['pre', 'A1'];
if (CEFR_BANDS.some(band => !coreBands.includes(band) && COURSE_SPEC[band].vocabularyCeiling <= list.length)) {
  problems.push(`the core has ${list.length} families, so ${coreBands.join('/')} are not the only bands it could measure — check the ceilings before widening the range`);
}
const outPath = path.join(root, 'ru-beginner.json');
const docPath = path.resolve('docs/beginner-frequency.md');
const report = [
  '# Beginner frequency list (Russian)',
  '',
  `The Pre-A1/A1 vocabulary target: ${list.length} teachable word families in teaching order `
    + `(${unique.length} candidates, ${collapsed.length} collapsed into an existing family).`,
  `Positions 1–${preCeiling} are the Pre-A1 target; the whole ${list.length}-family core is the A1 target (the A1 ceiling allows ${a1Ceiling}).`
    + ` It is the target for ${coreBands.join(' and ')} only, and the file names those bands, so a higher band never silently inherits a beginner list.`, 
  'Bands above A1 are measured against the corpus list instead: a beginner core says nothing about B1.',
  '',
  `**Pre-A1 (${preCeiling}):** ${topicStats(kept.slice(0, preCeiling))}.`,
  '',
  `**A1 additions (${a1Ceiling - preCeiling}):** ${topicStats(kept.slice(preCeiling, a1Ceiling))}.`,
  '',
  'Collapsed families — the matcher reads both words as one, so they get one slot: '
    + (collapsed.length ? collapsed.join(', ') : 'none') + '.',
  '',
  '',
  'Run `npx tsx scripts/content/genBeginnerFrequency.ts --write` (with the content shim) to regenerate.',
  '',
].join('\n');

if (write) {
  fs.writeFileSync(outPath, JSON.stringify({ language: 'ru', bands: coreBands, words: list }) + '\n');
  fs.writeFileSync(docPath, report);
}
console.log(report);
console.log(`${write ? 'wrote' : 'would write'} ${path.relative(process.cwd(), outPath)}: ${list.length} families, target for ${coreBands.join('/')}`);
