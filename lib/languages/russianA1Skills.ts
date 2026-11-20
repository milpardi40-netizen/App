import type { A1SkillTask } from './a1Skills';

/**
 * Independent comprehension for the Russian A1 band. The rehearsed dialogue is a drill;
 * these are short messages a learner reads or hears cold, on the same topic and inside the
 * vocabulary the two beginner bands already show. Optional and self-checked — never part of
 * the saved lesson outcome (see StarterA1Skill). verify-russian-course.cjs keeps the wording
 * honest: no rehearsed line, no word outside the bands, three distinct Persian choices.
 */
export const RUSSIAN_A1_SKILLS: Readonly<Record<string, readonly A1SkillTask[]>> = {
  'ru-l2-yesterday': [
    { kind: 'listening', passage: 'Вчера́ я не гуля́ла. Я писа́ла письмо́ и чита́ла кни́гу.', promptFa: 'دیروز من چه کار کردم؟',
      choices: ['نامه نوشتم و کتاب خواندم', 'در پارک قدم زدم', 'به سینما رفتم'], correctIndex: 0, explanationFa: '«не гуля́ла» یعنی قدم نزد؛ کارم «писа́ла и чита́ла» بود.' },
    { kind: 'reading', passage: 'Сего́дня суббо́та. Вче́ра бы́ло хо́лодно, а сего́дня тепло́.', promptFa: 'روز و هوای امروز چطور است؟',
      choices: ['شنبه و هوا سرد است', 'یک‌شنبه و هوا سرد است', 'شنبه و هوا گرم است'], correctIndex: 2, explanationFa: 'سردی مال دیروز است؛ دربارهٔ امروز فقط «тепло́» آمده.' },
  ],
  'ru-l2-tomorrow': [
    { kind: 'listening', passage: 'За́втра мы не идём гуля́ть. Мы бу́дем гото́виться к уро́ку и писа́ть слова́.', promptFa: 'برنامهٔ فردای آن‌ها چیست؟',
      choices: ['خوابیدن تا عصر', 'آماده شدن برای درس و نوشتن واژه', 'قدم زدن در پارک'], correctIndex: 1, explanationFa: '«не идём гуля́ть» یعنی قدم زدن نیست؛ برنامه «готови́ться к уро́ку» است.' },
    { kind: 'reading', passage: 'Ве́чером я позвоню́ ма́ме. Мы бу́дем говори́ть по-ру́сски.', promptFa: 'عصر با چه کسی حرف می‌زند؟',
      choices: ['با مادر', 'با دوست', 'با معلم'], correctIndex: 0, explanationFa: '«позвоню́ ма́ме» یعنی به مادر زنگ می‌زنم.' },
  ],
  'ru-l2-family-describe': [
    { kind: 'listening', passage: 'Мой брат работа́ет, а сестра́ ещё у́чится.', promptFa: 'چه کسی هنوز درس می‌خواند؟',
      choices: ['برادر', 'مادر', 'خواهر'], correctIndex: 2, explanationFa: '«а сестра́ ещё у́чится» یعنی خواهر هنوز درس می‌خواند.' },
    { kind: 'reading', passage: 'Моя́ ко́мната ма́ленькая. Здесь стол, кни́га и телефо́н.', promptFa: 'در اتاق چه چیزی هست؟',
      choices: ['هیچ چیزی', 'میز، کتاب و تلفن', 'فقط تخت‌خواب'], correctIndex: 1, explanationFa: '«здесь стол, кни́га и телефо́н».' },
  ],
  'ru-l2-compare-shopping': [
    { kind: 'listening', passage: 'Кофе́ доро́же, но вкусне́е, чем чай. Чай недоро́го.', promptFa: 'کدام گران‌تر ولی خوشمزه‌تر است؟',
      choices: ['قهوه', 'چای', 'هر دو با هم'], correctIndex: 0, explanationFa: '«кофе́ доро́же, но вкусне́е» — هم گران‌تر است هم خوشمزه‌تر.' },
    { kind: 'reading', passage: 'Возьми́те два́ чая́ и кофе́, пожа́луйста. Э́то сто со́рок.', promptFa: 'مشتری چه می‌خواهد و چقدر می‌دهد؟',
      choices: ['یک چای، صد و چهل', 'دو قهوه، چهل', 'دو چای و یک قهوه، صد و چهل'], correctIndex: 2, explanationFa: '«два́ чая́ и кофе́» و «сто со́рок».' },
  ],
  'ru-l2-seasons-weather': [
    { kind: 'listening', passage: 'Зимо́й о́бычно снег, а весно́й тепло́ и всё зелёное.', promptFa: 'بهار چطور است؟',
      choices: ['بارانی و ابری', 'گرم و همه‌چیز سبز', 'سرد و برفی'], correctIndex: 1, explanationFa: '«а весно́й тепло́ и всё зелёное»؛ برف مال زمستان است.' },
    { kind: 'reading', passage: 'Зимо́й я люблю́ гуля́ть, но сего́дня си́льный ве́тер. Идём домо́й.', promptFa: 'چرا گوینده به خانه می‌رود؟',
      choices: ['باد شدید است', 'برف نیست', 'هوا خیلی گرم است'], correctIndex: 0, explanationFa: '«но сего́дня си́льный ве́тер» دلیل برگشتن است.' },
  ],
  'ru-l2-animals-zoo': [
    { kind: 'listening', passage: 'В зоопа́рке слон и обезья́на. Слон большо́й, обезья́на ма́ленькая.', promptFa: 'کدام حیوان بزرگ است؟',
      choices: ['میمون', 'پرنده', 'فیل'], correctIndex: 2, explanationFa: '«слон большо́й»؛ میمون «ма́ленькая» است.' },
    { kind: 'reading', passage: 'Пти́цы пою́т у́тром. Ры́ба не уме́ет лета́ть.', promptFa: 'کدام‌یک پرواز کردن بلد نیست؟',
      choices: ['هر دو', 'ماهی', 'پرنده'], correctIndex: 1, explanationFa: '«ры́ба не уме́ет лета́ть».' },
  ],
  'ru-l2-cities-countries': [
    { kind: 'listening', passage: 'Мой друг живёт в Ге́рмании. Он говори́т по-ру́сски и по-пе́рсидски.', promptFa: 'دوست گوینده کجا زندگی می‌کند؟',
      choices: ['در آلمان', 'در ایتالیا', 'در ایران'], correctIndex: 0, explanationFa: '«живёт в Ге́рмании».' },
    { kind: 'reading', passage: 'Мы идём в Теге́ран на по́езде. За́втра бу́дем в Ира́не.', promptFa: 'به کجا و با چه وسیله‌ای می‌روند؟',
      choices: ['تهران، با اتوبوس', 'مسکو، با قطار', 'تهران، با قطار'], correctIndex: 2, explanationFa: '«на по́езде» یعنی با قطار؛ مقصد «в Теге́ран» است.' },
  ],
};
