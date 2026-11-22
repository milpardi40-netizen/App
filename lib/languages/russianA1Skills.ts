import type { A1SkillTask } from './a1Skills';

/**
 * Independent comprehension for the Russian A1 band. The rehearsed dialogue is a drill;
 * these are short messages a learner reads or hears cold, on the same topic and inside the
 * vocabulary the two beginner bands already show. Optional and self-checked — never part of
 * the saved lesson outcome (see StarterA1Skill). verify-russian-course.cjs keeps the wording
 * honest: no rehearsed line, no word outside the bands, three distinct Persian choices.
 */
export const RUSSIAN_A1_SKILLS: Readonly<Record<string, readonly A1SkillTask[]>> = {
  'ru-a1-introducing-yourself': [
    { kind: 'listening', passage: 'Моего́ дру́га зову́т Ами́р, он живёт в Тегера́не.', promptFa: 'دوستِ گوینده کجا زندگی می‌کند؟',
      choices: ['در تهران', 'در مسکو', 'در قازان'], correctIndex: 0, explanationFa: '«он живёт в Тегера́не» یعنی در تهران زندگی می‌کند.' },
    { kind: 'reading', passage: 'Са́ра у́чится в шко́ле и уже́ говори́т по-ру́сски.', promptFa: 'سارا چه کار می‌کند؟',
      choices: ['تازه سر کار رفته است', 'در مدرسه درس می‌خواند و روسی حرف می‌زند', 'هنوز روسی نمی‌داند'], correctIndex: 1, explanationFa: '«у́чится в шко́ле» و «уже́ говори́т по-ру́сски».' },
  ],
  'ru-a1-buying-something': [
    { kind: 'listening', passage: 'Э́та но́вая руба́шка сто́ит недоро́го, и сего́дня есть ски́дка.', promptFa: 'دربارهٔ پیراهن چه می‌گوید؟',
      choices: ['گران است و تخفیف ندارد', 'ارزان است و امروز تخفیف دارد', 'اندازهٔ کوچک ندارد'], correctIndex: 1, explanationFa: '«недоро́го» یعنی ارزان و «есть ски́дка» یعنی تخفیف دارد.' },
    { kind: 'reading', passage: 'Да́йте, пожа́луйста, све́жий хлеб и буты́лку воды́ без паке́та.', promptFa: 'مشتری چه می‌خواهد؟',
      choices: ['نان تازه و یک بطری آب بدون کیسه', 'فقط یک کیسه', 'سیب و قهوه'], correctIndex: 0, explanationFa: '«све́жий хлеб и буты́лку воды́ без паке́та».' },
  ],
  'ru-a1-family-and-possessions': [
    { kind: 'listening', passage: 'Мой брат работа́ет в ба́нке, а сестра́ у́чится в шко́ле.', promptFa: 'چه کسی در مدرسه درس می‌خواند؟',
      choices: ['برادر', 'مادر', 'خواهر'], correctIndex: 2, explanationFa: '«а сестра́ у́чится в шко́ле» یعنی خواهر در مدرسه درس می‌خواند.' },
    { kind: 'reading', passage: 'Ключи́ от до́ма лежа́т на столе́, а су́мка — на сту́ле.', promptFa: 'کلیدهای خانه کجاست؟',
      choices: ['روی میز', 'زیر صندلی', 'در ماشین'], correctIndex: 0, explanationFa: '«Ключи́ от до́ма лежа́т на столе́» یعنی کلیدها روی میز هستند.' },
  ],
  'ru-a1-cafe-and-food': [
    { kind: 'listening', passage: 'Принеси́те, пожа́луйста, ко́фе без са́хара и ча́шку ча́я.', promptFa: 'سفارش مشتری چیست؟',
      choices: ['یک قهوه با شیر', 'قهوه بدون شکر و یک فنجان چای', 'دو لیوان آب'], correctIndex: 1, explanationFa: '«ко́фе без са́хара и ча́шку ча́я».' },
    { kind: 'reading', passage: 'Я не ем мя́со и ры́бу, мне ну́жен овощно́й суп.', promptFa: 'چرا سوپ سبزیجات سفارش می‌دهد؟',
      choices: ['چون گوشت و ماهی نمی‌خورد', 'چون خیلی عجله دارد', 'چون سوپ مرغ تمام شده'], correctIndex: 0, explanationFa: '«Я не ем мя́со и ры́бу» یعنی گوشت و ماهی نمی‌خورم.' },
  ],
  'ru-a1-shopping-and-clothing': [
    { kind: 'listening', passage: 'Чёрная ку́ртка сли́шком мала́, да́йте на разме́р бо́льше.', promptFa: 'چرا سایز بزرگ‌تر می‌خواهد؟',
      choices: ['چون رنگ مشکی را دوست ندارد', 'چون کاپشن مشکی خیلی تنگ است', 'چون گران است'], correctIndex: 1, explanationFa: '«сли́шком мала́» یعنی خیلی کوچک/تنگ است.' },
    { kind: 'reading', passage: 'Э́тот зелёный шарф сиди́т отли́чно, я заплачу́ ка́ртой.', promptFa: 'مشتری چطور پرداخت می‌کند؟',
      choices: ['نقدی', 'با کارت', 'تعویض می‌کند'], correctIndex: 1, explanationFa: '«заплачу́ ка́ртой» یعنی با کارت پرداخت می‌کنم.' },
  ],
  'ru-a1-weather-and-seasons': [
    { kind: 'listening', passage: 'Сего́дня хо́лодно и идёт дождь, возьми́ зонт и пальто́.', promptFa: 'چرا باید چتر و پالتو بردارد؟',
      choices: ['چون هوا آفتابی است', 'چون سرد است و باران می‌بارد', 'چون باد نمی‌وزد'], correctIndex: 1, explanationFa: '«хо́лодно и идёт дождь» یعنی سرد است و باران می‌بارد.' },
    { kind: 'reading', passage: 'За́втра бу́дет тепло́ и со́лнечно, мы пойдём в парк.', promptFa: 'برنامهٔ فردا چیست و هوا چطور است؟',
      choices: ['فردا گرم و آفتابی است و به پارک می‌روند', 'فردا برف می‌آید', 'در خانه می‌مانند'], correctIndex: 0, explanationFa: '«За́втра бу́дет тепло́ и со́лнечно».' },
  ],
  'ru-a1-past-and-future-plans': [
    { kind: 'listening', passage: 'Вчера́ я был до́ма, а за́втра пойду́ на рабо́ту у́тром.', promptFa: 'گوینده فردا صبح چه کار می‌کند؟',
      choices: ['در خانه می‌ماند', 'سر کار می‌رود', 'به موزه می‌رود'], correctIndex: 1, explanationFa: '«за́втра пойду́ на рабо́ту у́тром».' },
    { kind: 'reading', passage: 'В выходны́е мы с семьёй бу́дем отдыха́ть в па́рке.', promptFa: 'آخر هفته کجا و با چه کسی استراحت می‌کنند؟',
      choices: ['تنها در خانه', 'با خانواده در پارک', 'در دفتر کار'], correctIndex: 1, explanationFa: '«с семьёй ... в па́рке» یعنی با خانواده در پارک.' },
  ],
};
