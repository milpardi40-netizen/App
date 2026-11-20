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
    { kind: 'listening', passage: 'Вче́ра Ли́ла была́ на встре́че то́лько полча́сика.', promptFa: 'لیلا دیروز چقدر در جلسه ماند؟',
      choices: ['فقط نیم‌ساعت', 'تمام روز', 'تا آخر شب'], correctIndex: 0, explanationFa: '«то́лько полча́сика» یعنی نیم‌ساعت.' },
    { kind: 'reading', passage: 'Ли́ла вче́ра сдава́ла конспе́кт, и фото́ не напечата́ли.', promptFa: 'چرا عکس‌ها چاپ نشدند؟',
      choices: ['گوشی‌اش خاموش شد', 'دنبالش گشتند', 'یادداشت را تحویل می‌داد'], correctIndex: 2, explanationFa: '«не напечата́ли»؛ دلیلش «сдава́ла конспе́кт» است.' },
  ],
  'ru-l2-tomorrow': [
    { kind: 'listening', passage: 'За́втра Ни́на сдаёт прое́кт у́тром и проси́т ещё час.', promptFa: 'نینا برای فردا چه می‌خواهد؟',
      choices: ['یک ساعت وقتِ اضافه', 'دو نسخۀ کپی', 'کمک در چاپ'], correctIndex: 0, explanationFa: '«проси́т ещё час» یعنی یک ساعت وقت بیشتر.' },
    { kind: 'reading', passage: 'Мы прине́сём файл с флешки и распеча́таем у́тром.', promptFa: 'فایل را چطور می‌آورند؟',
      choices: ['با فلش، صبح زود', 'با ایمیل', 'روی کاغذ'], correctIndex: 0, explanationFa: '«с флешки» یعنی روی فلش؛ چاپ صبح است.' },
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
    { kind: 'listening', passage: 'Осе́нью у́тром туманы́, а ве́чером бу́дет дождь.', promptFa: 'هوای پاییز چطور است؟',
      choices: ['کل روز آفتابی', 'مطلع صبح مه و عصر باران', 'شب‌ها برف'], correctIndex: 1, explanationFa: '«по у́трам туманы́» و «ве́чером дождь».' },
    { kind: 'reading', passage: 'За окно́м се́рое не́бо — плащ не ли́шний.', promptFa: 'چرا بارانی اضافی نیست؟',
      choices: ['آسمان ابری است', 'هوا گرم است', 'باران نیست'], correctIndex: 0, explanationFa: '«се́рое не́бо» یعنی آسمان ابری؛ پس «плащ не ли́шний».' },
  ],
  'ru-l2-animals-zoo': [
    { kind: 'listening', passage: 'Лев спит до обе́да: ему́ о́чень жа́рко.', promptFa: 'چرا شیر تا ناهار می‌خوابد؟',
      choices: ['هوای گرم است', 'گرسنه است', 'بیمار است'], correctIndex: 0, explanationFa: '«жа́рко, ему́ не хочется́»؛ گرمی دلیل خواب است.' },
    { kind: 'reading', passage: 'Ти́гры у воды́ активне́е ве́чером, а не у́тром.', promptFa: 'ببرها کِی پرانرژی‌ترند؟',
      choices: ['صبح', 'عصر', 'همیشه'], correctIndex: 1, explanationFa: '«активне́е ближе к ве́черу» یعنی عصر.' },
  ],
  'ru-l2-cities-countries': [
    { kind: 'listening', passage: 'Э́та о́ткрытка из Каза́ни, а э́та — из Со́чи.', promptFa: 'کارت پستال دوم از کدام شهر است؟',
      choices: ['قازان', 'سوچی', 'تفلیس'], correctIndex: 1, explanationFa: '«а э́та — из Со́чи»؛ دومی مال سوچی است.' },
    { kind: 'reading', passage: 'В Со́чи он бу́дет в а́вгусте и пришлёт фото́ мо́ря.', promptFa: 'کِی و از کجا عکس می‌فرستد؟',
      choices: ['مه، از کوه', 'ژوئن، از شهر', 'آگوست، از دریا'], correctIndex: 2, explanationFa: '«в а́вгусте» و «фото мо́ря».' },
  ],
};
