/**
 * Word families — the light morphology the beginner vocabulary target needs.
 *
 * A beginner core is written as lemmas (`хотеть`, `знать`, `книга`), because that is how a syllabus is
 * written, while a course teaches whatever form the sentence needs (`хочу`, `знаю`, `книгу`). The 5-letter
 * prefix rule in `readiness.ts` bridges case endings but not an infinitive stem that changes shape, so
 * `хотеть` / `хочу` and `дать` / `дал` would count as misses — a word the course teaches and the metric
 * refuses to see. Reducing both sides to a consonant skeleton and tolerating the consonant alternation
 * Russian school grammar teaches (к/ч, т/ч, д/ж, с/ш, г/ж, х/ш, б/л, в/л …) closes those without
 * pretending to be a lemmatiser.
 *
 * Deliberate limits: it strips one ending at a time, it drops vowels (so `год` and `гад` do look alike),
 * it knows nothing about stress, and it never claims a family for a word with a single consonant. For a
 * coverage percentage that is the right trade: a false miss is printed as «content still to write» and
 * sends someone to write a lesson that already exists, while a false hit costs one slot of a 449-word
 * target. `scripts/verify-russian-course.cjs` keeps the two matcher halves honest: every family rule has
 * to be reachable from a real taught form.
 */

/** Endings a Russian word can carry, longest first. Only the first one leaving a usable stem is taken. */
const RU_SUFFIXES = [
  // reflexive, long verbal and adjectival endings
  'ующий', 'ющий', 'ающий', 'ящий', 'енный', 'ённый', 'нный', 'емый', 'имый', 'анная',
  'ывая', 'ивая', 'уя', 'юя', 'ась', 'ясь', 'ешь', 'ишь', 'еем', 'уем', 'ием',
  'али', 'яли', 'ели', 'или', 'ала', 'яла', 'ела', 'ила', 'ало', 'яло', 'ело', 'ило',
  'овал', 'евал', 'ывал', 'ивал', 'ывать', 'ивать', 'овать', 'евать',
  'ать', 'ять', 'еть', 'ить', 'оть', 'уть', 'ут', 'ют', 'ат', 'ят', 'ет', 'ит', 'ем', 'им', 'ти', 'ть', 'ся', 'сь',
  // adjectives, participles, comparatives
  'ая', 'яя', 'ое', 'ее', 'ых', 'их', 'ым', 'им', 'ому', 'ему', 'ого', 'его', 'ыми', 'ими',
  'ые', 'ие', 'ей', 'ий', 'ый', 'ой', 'ее', 'ше', 'ее',
  // noun cases and numbers
  'ами', 'ями', 'ах', 'ях', 'ам', 'ям', 'ов', 'ев', 'ьев', 'ьям', 'ьми', 'ми',
  'а', 'я', 'о', 'е', 'ы', 'и', 'у', 'ю', 'ь', 'ъ',
];
const SORTED = [...new Set(RU_SUFFIXES.filter(suffix => /^[а-яё]+$/.test(suffix)))].sort((a, b) => b.length - a.length);

/**
 * Consonants that alternate when the ending changes. A letter may belong to more than one group (ч is both
 * the soft partner of к/г/х and of т/д/з/с/ц), so families are compared by group *intersection*.
 */
const ALTERNATION: Record<string, number[]> = {};
[['к', 'г', 'х', 'ч', 'ж', 'ш'], ['т', 'д', 'з', 'с', 'ц', 'щ', 'ч', 'ж', 'ш'], ['б', 'в', 'м', 'п', 'л'], ['л', 'р']]
  .forEach((group, index) => group.forEach(letter => { (ALTERNATION[letter] ??= []).push(index); }));
const alternates = (a: string, b: string) => a === b
  || !!(ALTERNATION[a] && ALTERNATION[b] && ALTERNATION[a].some(group => ALTERNATION[b].includes(group)));

/** Vowels and the two signs: dropped, because a paradigm alternates them freely. */
const VOWELS = /[аеёиоуыэюяьъ]/g;

/** Strip one ending so `хот-е-ть` and `хоч-у` end up comparable. */
function stemOf(word: string): string {
  let stem = word.replace(/ё/g, 'е');
  for (const suffix of SORTED) {
    if (suffix.length >= stem.length || !stem.endsWith(suffix)) continue;
    const candidate = stem.slice(0, stem.length - suffix.length);
    if (candidate.replace(VOWELS, '').length >= 2) { stem = candidate; break; }
  }
  return stem;
}

/**
 * Stem of a single word for family comparison, as a consonant skeleton (`хочу` → `хч`, `хотеть` → `хт`).
 * Returns null for languages this module has no endings for — so the caller keeps its old prefix rule
 * instead of trusting a wrong one — and for words too short to say anything about a family.
 */
export function familyKey(language: string, word: string): string | null {
  if (language !== 'ru') return null;
  const skeleton = stemOf(word).replace(VOWELS, '');
  return skeleton.length >= 2 ? skeleton : null;
}

/** True when two surface words stand for the same lexeme. */
export function sameFamily(keyA: string, keyB: string): boolean {
  if (keyA === keyB) return true;
  const shorter = keyA.length <= keyB.length ? keyA : keyB;
  const longer = keyA.length <= keyB.length ? keyB : keyA;
  // A shorter skeleton stands for the family when the longer one starts with it (`сп` / `спл`, `бр` / `брат`).
  if (longer.startsWith(shorter) && longer.length - shorter.length <= 1) return true;
  // Same skeleton except for the final consonant, which may have alternated (`хт` / `хч`, `вд` / `вж`).
  return shorter.slice(0, -1) === longer.slice(0, -1)
    && alternates(shorter[shorter.length - 1], longer[longer.length - 1]);
}
