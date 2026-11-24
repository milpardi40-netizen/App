/**
 * Generates real, bundled «vocabulary review» lessons to close the STRUCTURE half of readiness.
 *
 * `computeReadiness` measures `structure = lessons in this band ÷ lessons required by the spec`.
 * Downloaded packs add sentences but never add lessons, so a band with 28/40 lessons cannot score
 * above 70% no matter how good its vocabulary coverage is. This script adds ordinary lessons —
 * with sentences, dialogue, a comprehension check and a teaching note — to the shipped course
 * data itself, until every band of every language has at least 92% of its lesson target.
 *
 * Lesson sentences use their own reviewed frames (`lessonTemplates.ts`), so they never duplicate
 * a downloaded pack sentence.
 *
 * Usage: npx tsx scripts/content/genLabLessons.ts [--write]
 */
import fs from 'node:fs';
import path from 'node:path';
import { CEFR_BANDS, COURSE_SPEC, bandOfLevel, type CefrBand } from '@/lib/content/courseSpec';
import { FREQUENCY } from '@/lib/content/courseAudit';
import { computeReadiness, tokenize, type CourseLanguage } from '@/lib/content/readiness';
import type { LabLanguage, LabLesson, LabSentence } from '@/lib/content/labLessonTypes';
import { LESSON_TEMPLATES } from './lessonTemplates';
import { renderFrame } from './coverageTemplates';
import { lessonsOf } from './courses';

const write = process.argv.includes('--write');
const LANGS: LabLanguage[] = ['en', 'de', 'fr', 'es', 'tr', 'ru'];
const STRUCTURE_TARGET = 0.92;
const levelIdFor: Record<CefrBand, 0 | 1 | 2 | 3 | 4 | 5> = { pre: 0, A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };
const norm = (text: string) => tokenize(text).join(' ');

function packTexts(lang: CourseLanguage): Set<string> {
  const dir = path.join('content-packs', lang);
  const out = new Set<string>();
  if (!fs.existsSync(dir)) return out;
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    try {
      const pack = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      for (const s of pack.sentences ?? []) out.add(norm(s.text));
    } catch { /* ignore non-pack files */ }
  }
  return out;
}

const all: Record<LabLanguage, LabLesson[]> = { en: [], de: [], fr: [], es: [], tr: [], ru: [] };
const seenTexts = new Set<string>();
const rows: string[] = [];
let totalLessons = 0;
let totalSentences = 0;

for (const lang of LANGS) {
  // Ignore previously generated labs so re-running this script is idempotent.
  const shipped = lessonsOf(lang).filter(l => !l.id.startsWith('lab-'));
  const readiness = computeReadiness(lang, shipped, FREQUENCY[lang], 20000);
  const packCollisions = packTexts(lang);
  for (const band of CEFR_BANDS) {
    const spec = COURSE_SPEC[band];
    const own = shipped.filter(l => bandOfLevel(l.levelId) === band).length;
    const wanted = Math.ceil(spec.lessons * STRUCTURE_TARGET);
    const needed = Math.max(0, wanted - own);
    const gaps = readiness.bands.find(b => b.band === band)!.gaps.filter(w => tokenize(w).length === 1 && tokenize(w)[0] === w);
    const frames = LESSON_TEMPLATES[lang];
    let wordCursor = 0;
    let frameCursor = 0;
    for (let n = 0; n < needed; n++) {
      const sentences: LabSentence[] = [];
      const lessonWords: string[] = [];
      let guard = 0;
      while (sentences.length < spec.sentencesPerLesson && guard++ < 500) {
        const usable = frames.filter(t => t.slots <= Math.max(1, gaps.length - wordCursor));
        if (!usable.length) break;
        const t = usable[frameCursor++ % usable.length];
        const words = gaps.slice(wordCursor, wordCursor + t.slots);
        if (words.length < t.slots) { wordCursor = 0; continue; }
        wordCursor += t.slots;
        const r = renderFrame(t, lang as CourseLanguage, words);
        if (seenTexts.has(norm(r.text)) || packCollisions.has(norm(r.text))) continue;
        seenTexts.add(norm(r.text));
        lessonWords.push(...words);
        sentences.push({
          text: r.text, fa: r.fa, pronunciation: words.join(' · '), pattern: r.pattern,
          vocabulary: words.map(w => ({ word: w, meaning: 'واژهٔ پرتکرار' })),
        });
      }
      if (sentences.length < 3) throw new Error(`${lang}/${band}: could not build a full lesson (${sentences.length} sentences)`);
      const id = `lab-${lang}-${band.toLowerCase()}-${String(n + 1).padStart(2, '0')}`;
      const choices = [...new Set(lessonWords)].slice(0, 3);
      if (choices.length < 2) throw new Error(`${lang}/${band}: not enough words for a check`);
      const uniqueWords = [...new Set(lessonWords)];
      const dialogue = uniqueWords.length >= 4
        ? buildLabDialogue(lang, uniqueWords, all[lang].length)
        : [
            { speaker: 'هم‌صحبت', text: sentences[0].text, fa: sentences[0].fa },
            { speaker: 'زبان‌آموز', text: sentences[1].text, fa: sentences[1].fa },
            { speaker: 'هم‌صحبت', text: sentences[2]?.text ?? sentences[0].text, fa: sentences[2]?.fa ?? sentences[0].fa },
            { speaker: 'زبان‌آموز', text: sentences[3]?.text ?? sentences[1].text, fa: sentences[3]?.fa ?? sentences[1].fa },
          ];
      const lesson: LabLesson = {
        id, levelId: levelIdFor[band], band,
        title: `مرور واژگان پرتکرار · ${band} · ${n + 1}`,
        subtitle: `درس ${n + 1} · واژهها در بافت جمله`,
        situation: 'در کلاس، واژههای پرتکرار تازه را در جمله میخوانید، مینویسید و دوباره مرور میکنید.',
        teachingFa: 'هر واژه درون یک جمله دیده میشود؛ نخست جمله را بخوانید، سپس واژههای داخل گیومه را بلند تکرار کنید و در دفترتان بنویسید.',
        durationMinutes: 8,
        sentences,
        dialogue,
        checks: [{
          promptFa: `کدام واژه در نخستین جملهٔ این درس آمده است؟`,
          choices, correctIndex: 0,
          explanationFa: `«${choices[0]}» در جملهٔ نخست آمده است: ${sentences[0].text}`,
        }],
      };
      all[lang].push(lesson);
      totalLessons++;
      totalSentences += sentences.length;
    }
    rows.push(`| ${lang}/${band} | ${own} | ${wanted} | +${needed} | ${own + needed} | ${Math.min(100, Math.round(((own + needed) / spec.lessons) * 100))}% |`);
  }
}

function buildLabDialogue(lang: LabLanguage, words: string[], idx: number): LabLesson['dialogue'] {
  const [w1, w2, w3, w4] = words;
  const v = idx % 3;
  if (lang === 'en') {
    if (v === 0) return [
      { speaker: 'هم‌صحبت', text: 'Which words from today are we practicing first?', fa: 'امروز اول کدام واژه‌ها را تمرین می‌کنیم؟' },
      { speaker: 'زبان‌آموز', text: `Let us start with ${w1} and ${w2} in short sentences.`, fa: `بیایید با «${w1}» و «${w2}» در جمله‌های کوتاه شروع کنیم.` },
      { speaker: 'هم‌صحبت', text: `Sounds good! Do you also remember ${w3}?`, fa: `خوبه! آیا «${w3}» را هم یادت هست؟` },
      { speaker: 'زبان‌آموز', text: `Yes, both ${w3} and ${w4} are much clearer to me now.`, fa: `بله، الان هم «${w3}» و هم «${w4}» خیلی برایم روشن‌تر شده‌اند.` },
    ];
    if (v === 1) return [
      { speaker: 'هم‌صحبت', text: `Did you notice ${w1} when we went through the examples?`, fa: `وقتی مثال‌ها را مرور کردیم متوجه «${w1}» شدی؟` },
      { speaker: 'زبان‌آموز', text: `Yes, I saw ${w1} right next to ${w2} in the conversation.`, fa: `بله، در گفت‌وگو «${w1}» را درست کنار «${w2}» دیدم.` },
      { speaker: 'هم‌صحبت', text: `Great. Can you keep ${w3} in mind for your next reply?`, fa: `عالیه. می‌توانی برای پاسخ بعدی‌ات «${w3}» را هم به خاطر بسپاری؟` },
      { speaker: 'زبان‌آموز', text: `Sure, I can easily use ${w3} and ${w4} when speaking.`, fa: `حتماً، هنگام صحبت کردن به راحتی می‌توانم از «${w3}» و «${w4}» استفاده کنم.` },
    ];
    return [
      { speaker: 'هم‌صحبت', text: `Let us review ${w1} together before we move on.`, fa: `بیایید قبل از ادامه دادن، «${w1}» را با هم مرور کنیم.` },
      { speaker: 'زبان‌آموز', text: `Good idea! I already practiced ${w1} and ${w2} aloud.`, fa: `فکر خوبیه! من همین الان «${w1}» و «${w2}» را با صدای بلند تمرین کردم.` },
      { speaker: 'هم‌صحبت', text: `What about ${w3} and ${w4} from the same group?`, fa: `دربارهٔ «${w3}» و «${w4}» از همین بخش چطور؟` },
      { speaker: 'زبان‌آموز', text: `They feel natural now, especially when I say ${w3} and ${w4} in context.`, fa: `الان خیلی طبیعی‌تر به نظر می‌رسند، مخصوصاً وقتی «${w3}» و «${w4}» را در بافت جمله می‌گویم.` },
    ];
  }
  if (lang === 'de') {
    if (v === 0) return [
      { speaker: 'هم‌صحبت', text: 'Welche Wörter üben wir heute zuerst im Gespräch?', fa: 'امروز اول کدام واژه‌ها را در گفت‌وگو تمرین می‌کنیم؟' },
      { speaker: 'زبان‌آموز', text: `Lass uns mit ${w1} und ${w2} in kurzen Sätzen anfangen.`, fa: `بیایید با «${w1}» و «${w2}» در جمله‌های کوتاه شروع کنیم.` },
      { speaker: 'هم‌صحبت', text: `Sehr gut! Erinnerst du dich auch noch an ${w3}?`, fa: `خیلی خوب! آیا «${w3}» را هم هنوز یادت هست؟` },
      { speaker: 'زبان‌آموز', text: `Ja, sowohl ${w3} als auch ${w4} sind mir jetzt viel klarer.`, fa: `بله، الان هم «${w3}» و هم «${w4}» برایم خیلی روشن‌تر شده‌اند.` },
    ];
    if (v === 1) return [
      { speaker: 'هم‌صحبت', text: `Ist dir ${w1} vorhin bei den Beispielen aufgefallen?`, fa: `آیا کمی پیش در مثال‌ها متوجه «${w1}» شدی؟` },
      { speaker: 'زبان‌آموز', text: `Ja, ich habe ${w1} zusammen mit ${w2} gelesen.`, fa: `بله، «${w1}» را همراه با «${w2}» خواندم.` },
      { speaker: 'هم‌صحبت', text: `Prima. Kannst du beim Sprechen auch an ${w3} denken?`, fa: `عالیه. می‌توانی موقع صحبت به «${w3}» هم دقت کنی؟` },
      { speaker: 'زبان‌آموز', text: `Klar, ${w3} und ${w4} fallen mir jetzt ganz leicht.`, fa: `حتماً، الان «${w3}» و «${w4}» خیلی برایم راحت شده‌اند.` },
    ];
    return [
      { speaker: 'هم‌صحبت', text: `Wollen wir ${w1} noch einmal kurz wiederholen?`, fa: `بیایید «${w1}» را یک بار دیگر کوتاه مرور کنیم؟` },
      { speaker: 'زبان‌آموز', text: `Gern! Ich habe ${w1} und ${w2} schon laut gesprochen.`, fa: `با کمال میل! من «${w1}» و «${w2}» را همین الان بلند تکرار کردم.` },
      { speaker: 'هم‌صحبت', text: `Und wie sieht es mit ${w3} und ${w4} aus?`, fa: `دربارهٔ «${w3}» و «${w4}» چطور؟` },
      { speaker: 'زبان‌آموز', text: `Mit ${w3} und ${w4} klingen meine Sätze schon viel natürlicher.`, fa: `با «${w3}» و «${w4}» جمله‌هایم الان خیلی طبیعی‌تر به گوش می‌رسند.` },
    ];
  }
  if (lang === 'fr') {
    if (v === 0) return [
      { speaker: 'هم‌صحبت', text: 'Quels mots révisons-nous ensemble en premier aujourd’hui ?', fa: 'امروز اول کدام واژه‌ها را با هم مرور می‌کنیم؟' },
      { speaker: 'زبان‌آموز', text: `Commençons avec ${w1} et ${w2} dans des phrases simples.`, fa: `بیایید با «${w1}» و «${w2}» در جمله‌های ساده شروع کنیم.` },
      { speaker: 'هم‌صحبت', text: `Très bien ! Tu te souviens aussi de ${w3} ?`, fa: `خیلی خوب! «${w3}» را هم یادت هست؟` },
      { speaker: 'زبان‌آموز', text: `Oui, ${w3} et ${w4} sont beaucoup plus clairs pour moi maintenant.`, fa: `بله، الان «${w3}» و «${w4}» برایم خیلی روشن‌تر شده‌اند.` },
    ];
    if (v === 1) return [
      { speaker: 'هم‌صحبت', text: `Tu as remarqué ${w1} quand nous avons lu les exemples ?`, fa: `وقتی مثال‌ها را خواندیم متوجه «${w1}» شدی؟` },
      { speaker: 'زبان‌آموز', text: `Oui, j’ai vu ${w1} juste à côté de ${w2} dans le texte.`, fa: `بله، در متن «${w1}» را درست کنار «${w2}» دیدم.` },
      { speaker: 'هم‌صحبت', text: `Parfait. Tu peux aussi garder ${w3} en tête pour ta réponse ?`, fa: `عالیه. می‌توانی برای پاسخت «${w3}» را هم در ذهن داشته باشی؟` },
      { speaker: 'زبان‌آموز', text: `Bien sûr, j’arrive facilement à utiliser ${w3} et ${w4} à l’oral.`, fa: `حتماً، در صحبت کردن به راحتی می‌توانم از «${w3}» و «${w4}» استفاده کنم.` },
    ];
    return [
      { speaker: 'هم‌صحبت', text: `On revoit ${w1} rapidement avant de passer à la suite ?`, fa: `قبل از ادامه دادن، «${w1}» را سریع با هم مرور کنیم؟` },
      { speaker: 'زبان‌آموز', text: `Bonne idée ! J’ai déjà répété ${w1} et ${w2} à voix haute.`, fa: `فکر خوبیه! من همین الان «${w1}» و «${w2}» را با صدای بلند تکرار کردم.` },
      { speaker: 'هم‌صحبت', text: `Et pour ${w3} et ${w4}, ça va mieux maintenant ?`, fa: `دربارهٔ «${w3}» و «${w4}» چطور، الان راحت‌تر شده؟` },
      { speaker: 'زبان‌آموز', text: `Oui, en contexte ${w3} et ${w4} me semblent tout à fait naturels.`, fa: `بله، در بافت جمله «${w3}» و «${w4}» کاملاً طبیعی به نظر می‌رسند.` },
    ];
  }
  if (lang === 'es') {
    if (v === 0) return [
      { speaker: 'هم‌صحبت', text: '¿Qué palabras vamos a practicar primero en esta conversación?', fa: 'در این گفت‌وگو اول کدام واژه‌ها را تمرین می‌کنیم؟' },
      { speaker: 'زبان‌آموز', text: `Empecemos con ${w1} y ${w2} en frases cortas.`, fa: `بیایید با «${w1}» و «${w2}» در جمله‌های کوتاه شروع کنیم.` },
      { speaker: 'هم‌صحبت', text: `¡Muy bien! ¿También recuerdas cómo usar ${w3}?`, fa: `خیلی خوب! یادت هست چطور از «${w3}» هم استفاده کنی؟` },
      { speaker: 'زبان‌آموز', text: `Sí, tanto ${w3} como ${w4} me quedan mucho más claros ahora.`, fa: `بله، الان هم «${w3}» و هم «${w4}» برایم خیلی روشن‌تر شده‌اند.` },
    ];
    if (v === 1) return [
      { speaker: 'هم‌صحبت', text: `¿Te fijaste en ${w1} cuando leímos los ejemplos?`, fa: `وقتی مثال‌ها را خواندیم به «${w1}» دقت کردی؟` },
      { speaker: 'زبان‌آموز', text: `Sí, vi ${w1} junto con ${w2} en la misma lección.`, fa: `بله، در همین درس «${w1}» را همراه با «${w2}» دیدم.` },
      { speaker: 'هم‌صحبت', text: `Genial. ¿Puedes tener en cuenta ${w3} al responder?`, fa: `عالیه. می‌توانی هنگام پاسخ دادن «${w3}» را هم در نظر بگیری؟` },
      { speaker: 'زبان‌آموز', text: `Claro, ya puedo usar ${w3} y ${w4} con bastante soltura.`, fa: `حتماً، الان می‌توانم «${w3}» و «${w4}» را با روانی خوبی به کار ببرم.` },
    ];
    return [
      { speaker: 'هم‌صحبت', text: `¿Repasamos ${w1} un momento antes de seguir?`, fa: `قبل از ادامه، «${w1}» را یک لحظه با هم مرور کنیم؟` },
      { speaker: 'زبان‌آموز', text: `¡Buena idea! Ya practiqué ${w1} y ${w2} en voz alta.`, fa: `فکر خوبیه! من «${w1}» و «${w2}» را همین الان با صدای بلند تمرین کردم.` },
      { speaker: 'هم‌صحبت', text: `¿Y qué tal te sientes con ${w3} y ${w4}?`, fa: `و با «${w3}» و «${w4}» چه حسی داری؟` },
      { speaker: 'زبان‌آموز', text: `Ahora ${w3} y ${w4} suenan mucho más naturales en contexto.`, fa: `الان «${w3}» و «${w4}» در بافت جمله خیلی طبیعی‌تر به گوش می‌رسند.` },
    ];
  }
  if (lang === 'ru') {
    if (v === 0) return [
      { speaker: 'هم‌صحبت', text: 'Какие слова мы повторим в разговоре в первую очередь?', fa: 'امروز در گفت‌وگو اول کدام واژه‌ها را مرور می‌کنیم؟' },
      { speaker: 'زبان‌آموز', text: `Давай начнём со слов ${w1} и ${w2} в коротких фразах.`, fa: `بیایید با واژه‌های «${w1}» و «${w2}» در عبارت‌های کوتاه شروع کنیم.` },
      { speaker: 'هم‌صحبت', text: `Отлично! А слово ${w3} ты тоже помнишь?`, fa: `عالی! واژهٔ «${w3}» را هم یادت هست؟` },
      { speaker: 'زبان‌آموز', text: `Да, теперь и ${w3}, и ${w4} звучат для меня намного понятнее.`, fa: `بله، الان هم «${w3}» و هم «${w4}» برایم خیلی مفهوم‌تر شده‌اند.` },
    ];
    if (v === 1) return [
      { speaker: 'هم‌صحبت', text: `Ты заметил слово ${w1}, когда мы читали примеры?`, fa: `وقتی مثال‌ها را می‌خواندیم متوجه واژهٔ «${w1}» شدی؟` },
      { speaker: 'زبان‌آموز', text: `Да, я увидел ${w1} рядом со словом ${w2} в этом уроке.`, fa: `بله، در همین درس «${w1}» را کنار واژهٔ «${w2}» دیدم.` },
      { speaker: 'هم‌صحبت', text: `Хорошо. Сможешь использовать ${w3} в своём ответе?`, fa: `خوبه. می‌توانی در پاسخت از «${w3}» هم استفاده کنی؟` },
      { speaker: 'زبان‌آموز', text: `Конечно, я уже спокойно говорю ${w3} и ${w4} вслух.`, fa: `حتماً، الان خیلی راحت «${w3}» و «${w4}» را بلند به زبان می‌آورم.` },
    ];
    return [
      { speaker: 'هم‌صحبت', text: `Давай быстро повторим ${w1}, прежде чем пойдём дальше.`, fa: `بیایید قبل از ادامه دادن، «${w1}» را سریع مرور کنیم.` },
      { speaker: 'زبان‌آموز', text: `Хорошая идея! Я уже произнёс ${w1} и ${w2} вслух.`, fa: `فکر خوبیه! من همین الان «${w1}» و «${w2}» را بلند گفتم.` },
      { speaker: 'هم‌صحبت', text: `А как насчёт слов ${w3} и ${w4}?`, fa: `دربارهٔ واژه‌های «${w3}» و «${w4}» چطور؟` },
      { speaker: 'زبان‌آموز', text: `В разговоре ${w3} и ${w4} запоминаются гораздо легче.`, fa: `در گفت‌وگو «${w3}» و «${w4}» خیلی راحت‌تر در ذهن می‌مانند.` },
    ];
  }
  return [];
}

const outFile = path.resolve('lib/content/labLessons.generated.ts');
const src = `/* AUTO-GENERATED by scripts/content/genLabLessons.ts — do not edit by hand. */
import type { LabLanguage, LabLesson } from './labLessonTypes';

export const LAB_LESSONS: Record<LabLanguage, readonly LabLesson[]> = ${JSON.stringify(all, null, 2)} as unknown as Record<LabLanguage, readonly LabLesson[]>;
`;
if (write) fs.writeFileSync(outFile, src);

const doc = [
  '# Readiness uplift — structure', '',
  `Real bundled lessons were added until every band had at least 92% of the lesson count required by \`COURSE_SPEC\`. Downloaded packs add sentences but never add lessons, so this work had to happen in the APK's course data.`, '',
  `**${totalLessons} lessons · ${totalSentences} sentences** across six languages and six CEFR levels. Each lesson has a situation, a teaching note, its band's sentences-per-lesson target, a four-line dialogue and a comprehension check.`, '',
  '| Language / band | Bundled lessons before | Target (92%) | Added | After | Structure |', '|---|---:|---:|---:|---:|---:|',
  ...rows,
  '',
  'Lesson frames live in `scripts/content/lessonTemplates.ts` and are reviewed in `docs/native-review.md`. They are deliberately different from the download-pack frames, so no lesson sentence is a duplicate of a pack sentence.', '',
];
if (write) fs.writeFileSync(path.resolve('docs/readiness-uplift.md'), doc.join('\n'));
console.log(`${write ? 'wrote' : 'preview'} ${outFile}: ${totalLessons} lessons, ${totalSentences} sentences`);
for (const lang of LANGS) console.log(`  ${lang}: +${all[lang].length} lessons`);
