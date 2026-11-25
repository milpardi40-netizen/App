import type { CefrBand } from '@/lib/content/courseSpec';
import type { LabLanguage } from '@/lib/content/labLessonTypes';

export type RealTurn = { speaker: string; text: string; fa: string };
export type MultilingualScenario = Record<Exclude<LabLanguage, 'tr'>, RealTurn[]>;

export const LOWER_SCENARIOS: Record<'pre' | 'A1' | 'A2' | 'B1', MultilingualScenario[]> = {
  pre: [
    // pre-1: Greeting & water
    {
      en: [
        { speaker: 'هم‌صحبت', text: 'Good morning! Would you like some water?', fa: 'صبح بخیر! آب میل دارید؟' },
        { speaker: 'زبان‌آموز', text: 'Yes, please. Thank you very much.', fa: 'بله، لطفاً. خیلی ممنون.' },
        { speaker: 'هم‌صحبت', text: 'Here you are. Are you ready for class?', fa: 'بفرمایید. برای کلاس آماده‌اید؟' },
        { speaker: 'زبان‌آموز', text: 'Yes, I am ready. Let us begin.', fa: 'بله، آماده‌ام. بیایید شروع کنیم.' },
      ],
      de: [
        { speaker: 'هم‌صحبت', text: 'Guten Morgen! Möchten Sie etwas Wasser?', fa: 'صبح بخیر! کمی آب میل دارید؟' },
        { speaker: 'زبان‌آموز', text: 'Ja, bitte. Vielen Dank!', fa: 'بله، لطفاً. خیلی ممنون!' },
        { speaker: 'هم‌صحبت', text: 'Bitte schön. Sind Sie bereit für den Kurs?', fa: 'بفرمایید. برای کلاس آماده‌اید؟' },
        { speaker: 'زبان‌آموز', text: 'Ja, ich bin bereit. Gehen wir!', fa: 'بله، آماده‌ام. برویم!' },
      ],
      fr: [
        { speaker: 'هم‌صحبت', text: 'Bonjour ! Voulez-vous un peu d’eau ?', fa: 'روز بخیر! کمی آب میل دارید؟' },
        { speaker: 'زبان‌آموز', text: 'Oui, s’il vous plaît. Merci beaucoup.', fa: 'بله، لطفاً. خیلی ممنون.' },
        { speaker: 'هم‌صحبت', text: 'Voilà. Vous êtes prêt pour le cours ?', fa: 'بفرمایید. برای کلاس آماده‌اید؟' },
        { speaker: 'زبان‌آموز', text: 'Oui, je suis prêt. Allons-y.', fa: 'بله، آماده‌ام. بیایید شروع کنیم.' },
      ],
      es: [
        { speaker: 'هم‌صحبت', text: '¡Buenos días! ¿Quiere un poco de agua?', fa: 'صبح بخیر! کمی آب میل دارید؟' },
        { speaker: 'زبان‌آموز', text: 'Sí, por favor. Muchas gracias.', fa: 'بله، لطفاً. خیلی ممنون.' },
        { speaker: 'هم‌صحبت', text: 'Aquí tiene. ¿Está listo para la clase?', fa: 'بفرمایید. برای کلاس آماده‌اید؟' },
        { speaker: 'زبان‌آموز', text: 'Sí, estoy listo. Empecemos.', fa: 'بله، آماده‌ام. شروع کنیم.' },
      ],
      ru: [
        { speaker: 'هم‌صحبت', text: 'До́брое у́тро! Хоти́те воды́?', fa: 'صبح بخیر! آب می‌خواهید؟' },
        { speaker: 'زبان‌آموز', text: 'Да, пожа́луйста. Большо́е спаси́бо!', fa: 'بله، لطفاً. خیلی ممنون!' },
        { speaker: 'هم‌صحبت', text: 'Вот, пожа́луйста. Вы гото́вы к уро́ку?', fa: 'بفرمایید. برای درس آماده‌اید؟' },
        { speaker: 'زبان‌آموز', text: 'Да, я гото́в. Начнём!', fa: 'بله، آماده‌ام. شروع کنیم!' },
      ],
    },
    // pre-2: Name & origin
    {
      en: [
        { speaker: 'هم‌صحبت', text: 'Hello! What is your name?', fa: 'سلام! اسمتان چیست؟' },
        { speaker: 'زبان‌آموز', text: 'My name is Sara. And what is your name?', fa: 'اسم من سارا است. اسم شما چیست؟' },
        { speaker: 'هم‌صحبت', text: 'I am Amir. Where are you from?', fa: 'من امیر هستم. اهل کجا هستید؟' },
        { speaker: 'زبان‌آموز', text: 'I am from Tehran. Nice to meet you!', fa: 'اهل تهران هستم. از آشنایی خوشحالم!' },
      ],
      de: [
        { speaker: 'هم‌صحبت', text: 'Hallo! Wie heißen Sie?', fa: 'سلام! اسم شما چیست؟' },
        { speaker: 'زبان‌آموز', text: 'Ich heiße Sara. Und wie heißen Sie?', fa: 'اسم من سارا است. اسم شما چیست؟' },
        { speaker: 'هم‌صحبت', text: 'Ich bin Amir. Woher kommen Sie?', fa: 'من امیر هستم. اهل کجا هستید؟' },
        { speaker: 'زبان‌آموز', text: 'Ich komme aus Teheran. Freut mich!', fa: 'اهل تهران هستم. خوشوقتم!' },
      ],
      fr: [
        { speaker: 'هم‌صحبت', text: 'Bonjour ! Comment vous appelez-vous ?', fa: 'سلام! اسم شما چیست؟' },
        { speaker: 'زبان‌آموز', text: 'Je m’appelle Sara. Et vous ?', fa: 'اسم من سارا است. و شما؟' },
        { speaker: 'هم‌صحبت', text: 'Je suis Amir. D’où venez-vous ?', fa: 'من امیر هستم. اهل کجا هستید؟' },
        { speaker: 'زبان‌آموز', text: 'Je viens de Téhéran. Enchantée !', fa: 'اهل تهران هستم. خوشوقتم!' },
      ],
      es: [
        { speaker: 'هم‌صحبت', text: '¡Hola! ¿Cómo se llama?', fa: 'سلام! اسم شما چیست؟' },
        { speaker: 'زبان‌آموز', text: 'Me llamo Sara. ¿Y usted?', fa: 'اسم من سارا است. و شما؟' },
        { speaker: 'هم‌صحبت', text: 'Soy Amir. ¿De dónde es usted?', fa: 'من امیر هستم. اهل کجا هستید؟' },
        { speaker: 'زبان‌آموز', text: 'Soy de Teherán. ¡Mucho gusto!', fa: 'اهل تهران هستم. خوشبختم!' },
      ],
      ru: [
        { speaker: 'هم‌صحبت', text: 'Приве́т! Как вас зову́т?', fa: 'سلام! اسم شما چیست؟' },
        { speaker: 'زبان‌آموز', text: 'Меня́ зову́т Са́ра. А вас?', fa: 'اسم من سارا است. شما چطور؟' },
        { speaker: 'هم‌صحبت', text: 'Я Ами́р. Отку́да вы?', fa: 'من امیر هستم. اهل کجا هستید؟' },
        { speaker: 'زبان‌آموز', text: 'Я из Тегера́на. О́чень прия́тно!', fa: 'اهل تهران هستم. خیلی خوشبختم!' },
      ],
    },
    // pre-3: Bag & book on table
    {
      en: [
        { speaker: 'هم‌صحبت', text: 'Excuse me, is this your book?', fa: 'ببخشید، این کتاب شماست؟' },
        { speaker: 'زبان‌آموز', text: 'No, my book is in my bag.', fa: 'نه، کتاب من داخل کیفم است.' },
        { speaker: 'هم‌صحبت', text: 'Where is your bag?', fa: 'کیفتان کجاست؟' },
        { speaker: 'زبان‌آموز', text: 'It is on the chair near the door.', fa: 'روی صندلی نزدیک در است.' },
      ],
      de: [
        { speaker: 'هم‌صحبت', text: 'Entschuldigung, ist das Ihr Buch?', fa: 'ببخشید، این کتاب شماست؟' },
        { speaker: 'زبان‌آموز', text: 'Nein, mein Buch ist in meiner Tasche.', fa: 'نه، کتاب من در کیفم است.' },
        { speaker: 'هم‌صحبت', text: 'Wo ist Ihre Tasche?', fa: 'کیف شما کجاست؟' },
        { speaker: 'زبان‌آموز', text: 'Sie liegt auf dem Stuhl neben der Tür.', fa: 'روی صندلی کنار در است.' },
      ],
      fr: [
        { speaker: 'هم‌صحبت', text: 'Excusez-moi, est-ce votre livre ?', fa: 'ببخشید، این کتاب شماست؟' },
        { speaker: 'زبان‌آموز', text: 'Non, mon livre est dans mon sac.', fa: 'نه، کتاب من داخل کیفم است.' },
        { speaker: 'هم‌صحبت', text: 'Où est votre sac ?', fa: 'کیف شما کجاست؟' },
        { speaker: 'زبان‌آموز', text: 'Il est sur la chaise près de la porte.', fa: 'روی صندلی نزدیک در است.' },
      ],
      es: [
        { speaker: 'هم‌صحبت', text: 'Disculpe, ¿es este su libro?', fa: 'ببخشید، این کتاب شماست؟' },
        { speaker: 'زبان‌آموز', text: 'No, mi libro está en mi bolso.', fa: 'نه، کتاب من داخل کیفم است.' },
        { speaker: 'هم‌صحبت', text: '¿Dónde está su bolso?', fa: 'کیف شما کجاست؟' },
        { speaker: 'زبان‌آموز', text: 'Está en la silla cerca de la puerta.', fa: 'روی صندلی نزدیک در است.' },
      ],
      ru: [
        { speaker: 'هم‌صحبت', text: 'Извини́те, э́то ва́ша кни́га?', fa: 'ببخشید، این کتاب شماست؟' },
        { speaker: 'زبان‌آموز', text: 'Нет, моя́ кни́га в су́мке.', fa: 'نه، کتاب من داخل کیفم است.' },
        { speaker: 'هم‌صحبت', text: 'Где ва́ша су́мка?', fa: 'کیف شما کجاست؟' },
        { speaker: 'زبان‌آموز', text: 'Она́ на сту́ле ря́дом с две́рью.', fa: 'روی صندلی کنار در است.' },
      ],
    },
    // pre-4: Tea or coffee
    {
      en: [
        { speaker: 'هم‌صحبت', text: 'Hello! Tea or coffee?', fa: 'سلام! چای یا قهوه؟' },
        { speaker: 'زبان‌آموز', text: 'Tea, please. Without sugar.', fa: 'چای، لطفاً. بدون شکر.' },
        { speaker: 'هم‌صحبت', text: 'Sure. Would you like bread too?', fa: 'حتماً. نان هم میل دارید؟' },
        { speaker: 'زبان‌آموز', text: 'No, thank you. Just tea is fine.', fa: 'نه، ممنون. فقط چای کافی است.' },
      ],
      de: [
        { speaker: 'هم‌صحبت', text: 'Hallo! Tee oder Kaffee?', fa: 'سلام! چای یا قهوه؟' },
        { speaker: 'زبان‌آموز', text: 'Tee, bitte. Ohne Zucker.', fa: 'چای، لطفاً. بدون شکر.' },
        { speaker: 'هم‌صحبت', text: 'Gern. Möchten Sie auch Brot?', fa: 'حتماً. نان هم میل دارید؟' },
        { speaker: 'زبان‌آموز', text: 'Nein, danke. Nur Tee reicht.', fa: 'نه، ممنون. فقط چای کافی است.' },
      ],
      fr: [
        { speaker: 'هم‌صحبت', text: 'Bonjour ! Thé ou café ?', fa: 'سلام! چای یا قهوه؟' },
        { speaker: 'زبان‌آموز', text: 'Un thé, s’il vous plaît. Sans sucre.', fa: 'یک چای، لطفاً. بدون شکر.' },
        { speaker: 'هم‌صحبت', text: 'D’accord. Voulez-vous du pain aussi ?', fa: 'بسیار خوب. نان هم می‌خواهید؟' },
        { speaker: 'زبان‌آموز', text: 'Non, merci. Juste le thé, c’est parfait.', fa: 'نه، ممنون. فقط چای کافی است.' },
      ],
      es: [
        { speaker: 'هم‌صحبت', text: '¡Hola! ¿Té o café?', fa: 'سلام! چای یا قهوه؟' },
        { speaker: 'زبان‌آموز', text: 'Té, por favor. Sin azúcar.', fa: 'چای، لطفاً. بدون شکر.' },
        { speaker: 'هم‌صحبت', text: 'Claro. ¿Quiere pan también?', fa: 'حتماً. نان هم میل دارید؟' },
        { speaker: 'زبان‌آموز', text: 'No, gracias. Solo té está bien.', fa: 'نه، ممنون. فقط چای کافی است.' },
      ],
      ru: [
        { speaker: 'هم‌صحبت', text: 'Здра́вствуйте! Чай и́ли ко́фе?', fa: 'سلام! چای یا قهوه؟' },
        { speaker: 'زبان‌آموز', text: 'Чай, пожа́луйста. Без са́хара.', fa: 'چای، لطفاً. بدون شکر.' },
        { speaker: 'هم‌صحبت', text: 'Хорошо́. Хлеб то́же бу́дете?', fa: 'خوب. نان هم میل دارید؟' },
        { speaker: 'زبان‌آموز', text: 'Нет, спаси́бо. То́лько чай.', fa: 'نه، ممنون. فقط چای.' },
      ],
    },
  ],
  A1: [
    // A1-1: Café order
    {
      en: [
        { speaker: 'کارمند کافه', text: 'Good morning! What can I get for you today?', fa: 'صبح بخیر! امروز چی براتون بیارم؟' },
        { speaker: 'شما', text: 'A small coffee and a cheese sandwich, please.', fa: 'یک قهوهٔ کوچک و یک ساندویچ پنیر، لطفاً.' },
        { speaker: 'کارمند کافه', text: 'For here or to go?', fa: 'همین‌جا میل می‌کنید یا بیرون‌بر؟' },
        { speaker: 'شما', text: 'For here, please. Thank you!', fa: 'همین‌جا، لطفاً. ممنون!' },
      ],
      de: [
        { speaker: 'کارمند کافه', text: 'Guten Morgen! Was darf es heute sein?', fa: 'صبح بخیر! امروز چه میل دارید؟' },
        { speaker: 'شما', text: 'Einen kleinen Kaffee und ein Käsebrötchen, bitte.', fa: 'یک قهوهٔ کوچک و یک نان پنیر، لطفاً.' },
        { speaker: 'کارمند کافه', text: 'Zum Hiertrinken oder zum Mitnehmen?', fa: 'اینجا میل می‌کنید یا بیرون‌بر؟' },
        { speaker: 'شما', text: 'Hier, bitte. Vielen Dank!', fa: 'اینجا، لطفاً. خیلی ممنون!' },
      ],
      fr: [
        { speaker: 'کارمند کافه', text: 'Bonjour ! Qu’est-ce que je vous sers aujourd’hui ?', fa: 'روز بخیر! امروز چه براتون بیارم؟' },
        { speaker: 'شما', text: 'Un petit café et un sandwich au fromage, s’il vous plaît.', fa: 'یک قهوهٔ کوچک و یک ساندویچ پنیر، لطفاً.' },
        { speaker: 'کارمند کافه', text: 'C’est sur place ou à emporter ?', fa: 'اینجا میل می‌کنید یا بیرون‌بر؟' },
        { speaker: 'شما', text: 'Sur place, s’il vous plaît. Merci !', fa: 'اینجا، لطفاً. ممنون!' },
      ],
      es: [
        { speaker: 'کارمند کافه', text: '¡Buenos días! ¿Qué le pongo hoy?', fa: 'صبح بخیر! امروز چه میل دارید؟' },
        { speaker: 'شما', text: 'Un café pequeño y un bocadillo de queso, por favor.', fa: 'یک قهوهٔ کوچک و یک ساندویچ پنیر، لطفاً.' },
        { speaker: 'کارمند کافه', text: '¿Para tomar aquí o para llevar?', fa: 'اینجا میل می‌کنید یا بیرون‌بر؟' },
        { speaker: 'شما', text: 'Para tomar aquí, por favor. ¡Gracias!', fa: 'اینجا، لطفاً. ممنون!' },
      ],
      ru: [
        { speaker: 'کارمند کافه', text: 'До́брое у́тро! Что вам принести́?', fa: 'صبح بخیر! چه برایتان بیاورم؟' },
        { speaker: 'شما', text: 'Ма́ленький ко́фе и бутербро́д с сы́ром, пожа́луйста.', fa: 'یک قهوهٔ کوچک و یک ساندویچ پنیر، لطفاً.' },
        { speaker: 'کارمند کافه', text: 'Вы бу́дете здесь и́ли с собо́й?', fa: 'اینجا میل می‌کنید یا بیرون‌بر؟' },
        { speaker: 'شما', text: 'Здесь, пожа́луйста. Спаси́бо!', fa: 'اینجا، لطفاً. ممنون!' },
      ],
    },
    // A1-2: New neighbor
    {
      en: [
        { speaker: 'همسایه', text: 'Hi! Are you new in this building?', fa: 'سلام! در این ساختمان تازه‌وارد هستید؟' },
        { speaker: 'شما', text: 'Yes, I moved in yesterday. My name is Reza.', fa: 'بله، دیروز اسباب‌کشی کردم. اسم من رضا است.' },
        { speaker: 'همسایه', text: 'Welcome! I live next door in apartment four.', fa: 'خوش آمدید! من همسایهٔ دیواربه‌دیوار در واحد چهار هستم.' },
        { speaker: 'شما', text: 'Great to meet you! Let me know if you ever need anything.', fa: 'از آشنایی خوشحالم! اگر کاری داشتید حتماً بگویید.' },
      ],
      de: [
        { speaker: 'همسایه', text: 'Hallo! Sind Sie neu hier im Haus?', fa: 'سلام! در این ساختمان تازه آمده‌اید؟' },
        { speaker: 'شما', text: 'Ja, ich bin gestern eingezogen. Ich heiße Reza.', fa: 'بله، دیروز اسباب‌کشی کردم. اسم من رضا است.' },
        { speaker: 'همسایه', text: 'Willkommen! Ich wohne nebenan in Wohnung vier.', fa: 'خوش آمدید! من واحد کناری در شمارهٔ چهار زندگی می‌کنم.' },
        { speaker: 'شما', text: 'Schön, Sie kennenzulernen!', fa: 'از آشنایی با شما خوشوقتم!' },
      ],
      fr: [
        { speaker: 'همسایه', text: 'Bonjour ! Vous êtes nouveau dans l’immeuble ?', fa: 'سلام! در این ساختمان تازه‌وارد هستید؟' },
        { speaker: 'شما', text: 'Oui, j’ai emménagé hier. Je m’appelle Reza.', fa: 'بله، دیروز اسباب‌کشی کردم. اسم من رضا است.' },
        { speaker: 'همسایه', text: 'Bienvenue ! J’habite juste à côté, au quatre.', fa: 'خوش آمدید! من همین کنار در واحد چهار زندگی می‌کنم.' },
        { speaker: 'شما', text: 'Ravi de vous rencontrer !', fa: 'از آشنایی با شما خوشبختم!' },
      ],
      es: [
        { speaker: 'همسایه', text: '¡Hola! ¿Es nuevo en el edificio?', fa: 'سلام! در این ساختمان تازه آمده‌اید؟' },
        { speaker: 'شما', text: 'Sí, me mudé ayer. Me llamo Reza.', fa: 'بله، دیروز اسباب‌کشی کردم. اسم من رضا است.' },
        { speaker: 'همسایه', text: '¡Bienvenido! Vivo al lado, en el piso cuatro.', fa: 'خوش آمدید! من واحد کناری در شمارهٔ چهار زندگی می‌کنم.' },
        { speaker: 'شما', text: '¡Mucho gusto en conocerle!', fa: 'از آشنایی با شما بسیار خوشبختم!' },
      ],
      ru: [
        { speaker: 'همسایه', text: 'Здра́вствуйте! Вы но́вый сосе́д в э́том до́ме?', fa: 'سلام! شما همسایهٔ جدید این ساختمان هستید؟' },
        { speaker: 'شما', text: 'Да, я перее́хал вчера́. Меня́ зову́т Реза́.', fa: 'بله، دیروز اسباب‌کشی کردم. اسم من رضا است.' },
        { speaker: 'همسایه', text: 'Добро́ пожа́ловать! Я живу́ ря́дом, в четвёртой кварти́ре.', fa: 'خوش آمدید! من همین بغل در واحد چهار زندگی می‌کنم.' },
        { speaker: 'شما', text: 'О́чень рад познако́миться!', fa: 'از آشنایی بسیار خوشحالم!' },
      ],
    },
    // A1-3: Buying a train ticket
    {
      en: [
        { speaker: 'کارمند ایستگاه', text: 'Next, please! How can I help you?', fa: 'نفر بعدی لطفاً! چطور می‌توانم کمکتان کنم؟' },
        { speaker: 'شما', text: 'One ticket to the city center, please.', fa: 'یک بلیت به مرکز شهر، لطفاً.' },
        { speaker: 'کارمند ایستگاه', text: 'Single or return?', fa: 'یک‌طرفه یا رفت‌وبرگشت؟' },
        { speaker: 'شما', text: 'Return, please. How much is it?', fa: 'رفت‌وبرگشت، لطفاً. قیمتش چقدر است؟' },
      ],
      de: [
        { speaker: 'کارمند ایستگاه', text: 'Der Nächste, bitte! Wie kann ich helfen?', fa: 'نفر بعدی لطفاً! چطور کمک کنم؟' },
        { speaker: 'شما', text: 'Eine Fahrkarte ins Stadtzentrum, bitte.', fa: 'یک بلیت به مرکز شهر، لطفاً.' },
        { speaker: 'کارمند ایستگاه', text: 'Einfach oder hin und zurück?', fa: 'یک‌طرفه یا رفت‌وبرگشت؟' },
        { speaker: 'شما', text: 'Hin und zurück, bitte. Was kostet das?', fa: 'رفت‌وبرگشت، لطفاً. قیمتش چقدر است؟' },
      ],
      fr: [
        { speaker: 'کارمند ایستگاه', text: 'Suivant, s’il vous plaît ! Je peux vous aider ?', fa: 'نفر بعدی لطفاً! می‌توانم کمکتان کنم؟' },
        { speaker: 'شما', text: 'Un billet pour le centre-ville, s’il vous plaît.', fa: 'یک بلیت به مرکز شهر، لطفاً.' },
        { speaker: 'کارمند ایستگاه', text: 'Aller simple ou aller-retour ?', fa: 'یک‌طرفه یا رفت‌وبرگشت؟' },
        { speaker: 'شما', text: 'Aller-retour, s’il vous plaît. C’est combien ?', fa: 'رفت‌وبرگشت، لطفاً. چند می‌شود؟' },
      ],
      es: [
        { speaker: 'کارمند ایستگاه', text: '¡Siguiente! ¿En qué puedo ayudarle?', fa: 'نفر بعدی! چطور کمکتان کنم؟' },
        { speaker: 'شما', text: 'Un billete al centro de la ciudad, por favor.', fa: 'یک بلیت به مرکز شهر، لطفاً.' },
        { speaker: 'کارمند ایستگاه', text: '¿Solo ida o ida y vuelta?', fa: 'یک‌طرفه یا رفت‌وبرگشت؟' },
        { speaker: 'شما', text: 'Ida y vuelta, por favor. ¿Cuánto cuesta?', fa: 'رفت‌وبرگشت، لطفاً. چقدر است؟' },
      ],
      ru: [
        { speaker: 'کارمند ایستگاه', text: 'Сле́дующий, пожа́луйста! Чем могу́ помо́чь?', fa: 'نفر بعدی لطفاً! چطور کمک کنم؟' },
        { speaker: 'شما', text: 'Оди́н биле́т до це́нтра го́рода, пожа́луйста.', fa: 'یک بلیت تا مرکز شهر، لطفاً.' },
        { speaker: 'کارمند ایستگاه', text: 'В одну́ сто́рону и́ли туда́ и обра́тно?', fa: 'یک‌طرفه یا رفت‌وبرگشت؟' },
        { speaker: 'شما', text: 'Туда́ и обра́тно, пожа́луйста. Ско́лько э́то сто́ит?', fa: 'رفت‌وبرگشت، لطفاً. چقدر می‌شود؟' },
      ],
    },
    // A1-4: Asking directions to library
    {
      en: [
        { speaker: 'شما', text: 'Excuse me, is there a library near here?', fa: 'ببخشید، این نزدیک‌ها کتابخانه هست؟' },
        { speaker: 'رهگذر', text: 'Yes, walk straight ahead for two minutes.', fa: 'بله، دو دقیقه مستقیم جلو بروید.' },
        { speaker: 'شما', text: 'Is it on the left or on the right?', fa: 'سمت چپ است یا سمت راست؟' },
        { speaker: 'رهگذر', text: 'On the right, right next to the post office.', fa: 'سمت راست، درست کنار ادارهٔ پست.' },
      ],
      de: [
        { speaker: 'شما', text: 'Entschuldigung, gibt es hier eine Bibliothek?', fa: 'ببخشید، این نزدیک‌ها کتابخانه هست؟' },
        { speaker: 'رهگذر', text: 'Ja, gehen Sie zwei Minuten geradeaus.', fa: 'بله، دو دقیقه مستقیم بروید.' },
        { speaker: 'شما', text: 'Ist sie links oder rechts?', fa: 'سمت چپ است یا راست؟' },
        { speaker: 'رهگذر', text: 'Rechts, direkt neben der Post.', fa: 'سمت راست، درست کنار ادارهٔ پست.' },
      ],
      fr: [
        { speaker: 'شما', text: 'Excusez-moi, y a-t-il une bibliothèque près d’ici ?', fa: 'ببخشید، این نزدیک‌ها کتابخانه هست؟' },
        { speaker: 'رهگذر', text: 'Oui, marchez tout droit pendant deux minutes.', fa: 'بله، دو دقیقه مستقیم راه بروید.' },
        { speaker: 'شما', text: 'C’est à gauche ou à droite ?', fa: 'سمت چپ است یا راست؟' },
        { speaker: 'رهگذر', text: 'À droite, juste à côté de la poste.', fa: 'سمت راست، درست کنار ادارهٔ پست.' },
      ],
      es: [
        { speaker: 'شما', text: 'Perdone, ¿hay una biblioteca cerca de aquí?', fa: 'ببخشید، این نزدیک‌ها کتابخانه هست؟' },
        { speaker: 'رهگذر', text: 'Sí, camine todo recto dos minutos.', fa: 'بله، دو دقیقه مستقیم بروید.' },
        { speaker: 'شما', text: '¿Está a la izquierda o a la derecha?', fa: 'سمت چپ است یا راست؟' },
        { speaker: 'رهگذر', text: 'A la derecha, justo al lado de correos.', fa: 'سمت راست، درست کنار ادارهٔ پست.' },
      ],
      ru: [
        { speaker: 'شما', text: 'Извини́те, здесь ря́дом есть библиоте́ка?', fa: 'ببخشید، این نزدیک‌ها کتابخانه هست؟' },
        { speaker: 'رهگذر', text: 'Да, иди́те пря́мо две мину́ты.', fa: 'بله، دو دقیقه مستقیم بروید.' },
        { speaker: 'شما', text: 'Она́ сле́ва и́ли спра́ва?', fa: 'سمت چپ است یا راست؟' },
        { speaker: 'رهگذر', text: 'Спра́ва, ря́дом с по́чтой.', fa: 'سمت راست، کنار ادارهٔ پست.' },
      ],
    },
    // A1-5: Grocery shopping
    {
      en: [
        { speaker: 'فروشنده', text: 'Good afternoon! Are you looking for anything special?', fa: 'عصر بخیر! دنبال چیز خاصی می‌گردید؟' },
        { speaker: 'شما', text: 'Yes, where can I find fresh apples and milk?', fa: 'بله، سیب تازه و شیر کجا پیدا می‌کنم؟' },
        { speaker: 'فروشنده', text: 'The apples are near the entrance, and milk is in aisle three.', fa: 'سیب‌ها نزدیک ورودی و شیر در راهروی سه است.' },
        { speaker: 'شما', text: 'Thank you! I also need a loaf of bread.', fa: 'ممنون! یک قرص نان هم لازم دارم.' },
      ],
      de: [
        { speaker: 'فروشنده', text: 'Guten Tag! Suchen Sie etwas Bestimmtes?', fa: 'روز بخیر! دنبال چیز خاصی می‌گردید؟' },
        { speaker: 'شما', text: 'Ja, wo finde ich frische Äpfel und Milch?', fa: 'بله، سیب تازه و شیر را کجا پیدا کنم؟' },
        { speaker: 'فروشنده', text: 'Die Äpfel sind am Eingang, und Milch in Gang drei.', fa: 'سیب‌ها دم ورودی و شیر در راهروی سه است.' },
        { speaker: 'شما', text: 'Danke! Ich brauche auch noch ein Brot.', fa: 'ممنون! یک نان هم لازم دارم.' },
      ],
      fr: [
        { speaker: 'فروشنده', text: 'Bonjour ! Vous cherchez quelque chose en particulier ?', fa: 'روز بخیر! دنبال چیز خاصی هستید؟' },
        { speaker: 'شما', text: 'Oui, où sont les pommes fraîches et le lait ?', fa: 'بله، سیب تازه و شیر کجا هستند؟' },
        { speaker: 'فروشنده', text: 'Les pommes sont à l’entrée, et le lait au rayon trois.', fa: 'سیب‌ها دم ورودی و شیر در ردیف سه است.' },
        { speaker: 'شما', text: 'Merci ! Il me faut aussi du pain.', fa: 'ممنون! نان هم لازم دارم.' },
      ],
      es: [
        { speaker: 'فروشنده', text: '¡Buenas tardes! ¿Busca algo en especial?', fa: 'عصر بخیر! دنبال چیز خاصی می‌گردید؟' },
        { speaker: 'شما', text: 'Sí, ¿dónde están las manzanas frescas y la leche?', fa: 'بله، سیب تازه و شیر کجاست؟' },
        { speaker: 'فروشنده', text: 'Las manzanas están en la entrada y la leche en el pasillo tres.', fa: 'سیب‌ها دم ورودی و شیر در راهروی سه است.' },
        { speaker: 'شما', text: '¡Gracias! También necesito una barra de pan.', fa: 'ممنون! یک عدد نان هم لازم دارم.' },
      ],
      ru: [
        { speaker: 'فروشنده', text: 'До́брый день! Вы и́щете что́-то конкре́тное?', fa: 'روز بخیر! دنبال چیز خاصی هستید؟' },
        { speaker: 'شما', text: 'Да, где све́жие я́блоки и молоко́?', fa: 'بله، سیب تازه و شیر کجاست؟' },
        { speaker: 'فروشنده', text: 'Я́блоки у вхо́да, а молоко́ в тре́тьем ряду́.', fa: 'سیب‌ها دم ورودی و شیر در ردیف سوم است.' },
        { speaker: 'شما', text: 'Спаси́бо! Мне ещё ну́жен хлеб.', fa: 'ممنون! نان هم لازم دارم.' },
      ],
    },
    // A1-6: Weekend plans
    {
      en: [
        { speaker: 'دوست', text: 'What are you doing this Saturday?', fa: 'این شنبه چه کار می‌کنی؟' },
        { speaker: 'شما', text: 'I am going to the park with my sister in the morning.', fa: 'صبح با خواهرم به پارک می‌روم.' },
        { speaker: 'دوست', text: 'That sounds nice! Are you free in the afternoon?', fa: 'عالی است! بعدازظهر وقت داری؟' },
        { speaker: 'شما', text: 'Yes! Let us meet for tea at four o’clock.', fa: 'بله! ساعت چهار برای چای همدیگر را ببینیم.' },
      ],
      de: [
        { speaker: 'دوست', text: 'Was machst du diesen Samstag?', fa: 'این شنبه چه کار می‌کنی؟' },
        { speaker: 'شما', text: 'Am Morgen gehe ich mit meiner Schwester in den Park.', fa: 'صبح با خواهرم به پارک می‌روم.' },
        { speaker: 'دوست', text: 'Das klingt schön! Hast du am Nachmittag Zeit?', fa: 'خوب است! بعدازظهر وقت داری؟' },
        { speaker: 'شما', text: 'Ja! Treffen wir uns um vier Uhr auf einen Tee.', fa: 'بله! ساعت چهار برای چای قرار بگذاریم.' },
      ],
      fr: [
        { speaker: 'دوست', text: 'Tu fais quoi ce samedi ?', fa: 'این شنبه چه کار می‌کنی؟' },
        { speaker: 'شما', text: 'Le matin, je vais au parc avec ma sœur.', fa: 'صبح با خواهرم به پارک می‌روم.' },
        { speaker: 'دوست', text: 'C’est sympa ! Tu es libre l’après-midi ?', fa: 'جالب است! بعدازظهر آزادی؟' },
        { speaker: 'شما', text: 'Oui ! On se retrouve pour un thé à seize heures.', fa: 'بله! ساعت چهار برای چای همدیگر را ببینیم.' },
      ],
      es: [
        { speaker: 'دوست', text: '¿Qué haces este sábado?', fa: 'این شنبه چه کار می‌کنی؟' },
        { speaker: 'شما', text: 'Por la mañana voy al parque con mi hermana.', fa: 'صبح با خواهرم به پارک می‌روم.' },
        { speaker: 'دوست', text: '¡Qué bien! ¿Estás libre por la tarde?', fa: 'چه خوب! بعدازظهر وقت داری؟' },
        { speaker: 'شما', text: '¡Sí! Quedamos para tomar un té a las cuatro.', fa: 'بله! ساعت چهار برای چای قرار بگذاریم.' },
      ],
      ru: [
        { speaker: 'دوست', text: 'Что ты де́лаешь в э́ту суббо́ту?', fa: 'این شنبه چه کار می‌کنی؟' },
        { speaker: 'شما', text: 'У́тром я иду́ в парк с сестро́й.', fa: 'صبح با خواهرم به پارک می‌روم.' },
        { speaker: 'دوست', text: 'Здо́рово! А днём ты свобо́ден?', fa: 'عالی است! بعدازظهر آزادی؟' },
        { speaker: 'شما', text: 'Да! Дава́й встре́тимся на чай в четы́ре часа́.', fa: 'بله! ساعت چهار برای چای همدیگر را ببینیم.' },
      ],
    },
    // A1-7: At the pharmacy
    {
      en: [
        { speaker: 'داروساز', text: 'Hello, how can I help you today?', fa: 'سلام، امروز چطور می‌توانم کمکتان کنم؟' },
        { speaker: 'شما', text: 'I have a sore throat and a mild headache.', fa: 'گلودرد و سردرد خفیفی دارم.' },
        { speaker: 'داروساز', text: 'Since when have you had these symptoms?', fa: 'از چه زمانی این علائم را دارید؟' },
        { speaker: 'شما', text: 'Since yesterday evening. Do you have lozenges?', fa: 'از دیروز عصر. قرص مکیدنی گلو دارید؟' },
      ],
      de: [
        { speaker: 'داروساز', text: 'Guten Tag, wie kann ich Ihnen helfen?', fa: 'روز بخیر، چطور می‌توانم کمکتان کنم؟' },
        { speaker: 'شما', text: 'Ich habe Halsschmerzen und leichte Kopfschmerzen.', fa: 'گلودرد و سردرد خفیف دارم.' },
        { speaker: 'داروساز', text: 'Seit wann haben Sie diese Beschwerden?', fa: 'از چه زمانی این علائم را دارید؟' },
        { speaker: 'شما', text: 'Seit gestern Abend. Haben Sie Halstabletten?', fa: 'از دیروز عصر. قرص گلو دارید؟' },
      ],
      fr: [
        { speaker: 'داروساز', text: 'Bonjour, comment puis-je vous aider ?', fa: 'روز بخیر، چطور می‌توانم کمکتان کنم؟' },
        { speaker: 'شما', text: 'J’ai mal à la gorge et un léger mal de tête.', fa: 'گلودرد و سردرد خفیف دارم.' },
        { speaker: 'داروساز', text: 'Depuis quand avez-vous ces symptômes ?', fa: 'از چه زمانی این علائم را دارید؟' },
        { speaker: 'شما', text: 'Depuis hier soir. Avez-vous des pastilles ?', fa: 'از دیشب. قرص مکیدنی گلو دارید؟' },
      ],
      es: [
        { speaker: 'داروساز', text: 'Hola, ¿cómo puedo ayudarle hoy?', fa: 'سلام، امروز چطور می‌توانم کمکتان کنم؟' },
        { speaker: 'شما', text: 'Tengo dolor de garganta y un poco de dolor de cabeza.', fa: 'گلودرد و کمی سردرد دارم.' },
        { speaker: 'داروساز', text: '¿Desde cuándo tiene estos síntomas?', fa: 'از چه زمانی این علائم را دارید؟' },
        { speaker: 'شما', text: 'Desde ayer por la tarde. ¿Tiene pastillas para la garganta?', fa: 'از دیروز عصر. قرص گلو دارید؟' },
      ],
      ru: [
        { speaker: 'داروساز', text: 'Здра́вствуйте, чем могу́ вам помо́чь?', fa: 'سلام، چطور می‌توانم کمکتان کنم؟' },
        { speaker: 'شما', text: 'У меня́ боли́т го́рло и немного боли́т голова́.', fa: 'گلودرد و کمی سردرد دارم.' },
        { speaker: 'داروساز', text: 'Как давно́ у вас эти симпто́мы?', fa: 'از چه زمانی این علائم را دارید؟' },
        { speaker: 'شما', text: 'Со вчера́шнего ве́чера. Есть леденцы́ для го́рла?', fa: 'از دیروز عصر. قرص مکیدنی گلو دارید؟' },
      ],
    },
    // A1-8: Ordering lunch
    {
      en: [
        { speaker: 'گارسون', text: 'Are you ready to order lunch?', fa: 'برای سفارش ناهار آماده‌اید؟' },
        { speaker: 'شما', text: 'Yes, I would like the vegetable soup and rice.', fa: 'بله، سوپ سبزیجات و برنج می‌خواهم.' },
        { speaker: 'گارسون', text: 'Would you like anything to drink with that?', fa: 'همراهش نوشیدنی هم میل دارید؟' },
        { speaker: 'شما', text: 'Just a glass of still water, please.', fa: 'فقط یک لیوان آب معمولی، لطفاً.' },
      ],
      de: [
        { speaker: 'گارسون', text: 'Sind Sie bereit für Ihre Bestellung?', fa: 'برای سفارش ناهار آماده‌اید؟' },
        { speaker: 'شما', text: 'Ja, ich hätte gern die Gemüsesuppe mit Reis.', fa: 'بله، سوپ سبزیجات با برنج می‌خواهم.' },
        { speaker: 'گارسون', text: 'Möchten Sie noch etwas trinken?', fa: 'نوشیدنی هم میل دارید؟' },
        { speaker: 'شما', text: 'Nur ein Glas stilles Wasser, bitte.', fa: 'فقط یک لیوان آب بی‌گاز، لطفاً.' },
      ],
      fr: [
        { speaker: 'گارسون', text: 'Vous êtes prêt à commander pour le déjeuner ?', fa: 'برای سفارش ناهار آماده‌اید؟' },
        { speaker: 'شما', text: 'Oui, je voudrais la soupe de légumes avec du riz.', fa: 'بله، سوپ سبزیجات با برنج می‌خواهم.' },
        { speaker: 'گارسون', text: 'Et comme boisson, vous désirez quelque chose ?', fa: 'و برای نوشیدنی چیزی میل دارید؟' },
        { speaker: 'شما', text: 'Juste un verre d’eau plate, s’il vous plaît.', fa: 'فقط یک لیوان آب معمولی، لطفاً.' },
      ],
      es: [
        { speaker: 'گارسون', text: '¿Está listo para pedir el almuerzo?', fa: 'برای سفارش ناهار آماده‌اید؟' },
        { speaker: 'شما', text: 'Sí, quiero la sopa de verduras con arroz.', fa: 'بله، سوپ سبزیجات با برنج می‌خواهم.' },
        { speaker: 'گارسون', text: '¿Desea algo para beber?', fa: 'نوشیدنی هم میل دارید؟' },
        { speaker: 'شما', text: 'Solo un vaso de agua sin gas, por favor.', fa: 'فقط یک لیوان آب بی‌گاز، لطفاً.' },
      ],
      ru: [
        { speaker: 'گارسون', text: 'Вы гото́вы сде́лать зака́з на обе́д?', fa: 'برای سفارش ناهار آماده‌اید؟' },
        { speaker: 'شما', text: 'Да, я бу́ду овощно́й суп и рис.', fa: 'بله، سوپ سبزیجات و برنج می‌خواهم.' },
        { speaker: 'گارسون', text: 'Что́-нибудь из напи́тков принести́?', fa: 'نوشیدنی هم بیاورم؟' },
        { speaker: 'شما', text: 'То́лько стака́н обы́чной воды́, пожа́луйста.', fa: 'فقط یک لیوان آب معمولی، لطفاً.' },
      ],
    },
  ],
  A2: [
    // A2-1: Returning a shirt
    {
      en: [
        { speaker: 'فروشنده', text: 'Hello! How can I help you today?', fa: 'سلام! امروز چطور می‌توانم کمکتان کنم؟' },
        { speaker: 'شما', text: 'I bought this shirt yesterday, but it is a bit too small.', fa: 'دیروز این پیراهن را خریدم، ولی کمی کوچک است.' },
        { speaker: 'فروشنده', text: 'No problem. Do you have the receipt with you?', fa: 'مشکلی نیست. رسیدش همراهتان هست؟' },
        { speaker: 'شما', text: 'Yes, here it is. Can I exchange it for a medium?', fa: 'بله، بفرمایید. می‌توانم با سایز مدیوم عوضش کنم؟' },
      ],
      de: [
        { speaker: 'فروشنده', text: 'Guten Tag! Wie kann ich Ihnen helfen?', fa: 'روز بخیر! چطور می‌توانم کمکتان کنم؟' },
        { speaker: 'شما', text: 'Ich habe dieses Hemd gestern gekauft, aber es ist etwas zu klein.', fa: 'دیروز این پیراهن را خریدم، اما کمی کوچک است.' },
        { speaker: 'فروشنده', text: 'Kein Problem. Haben Sie den Kassenbon dabei?', fa: 'مشکلی نیست. رسید خرید همراهتان هست؟' },
        { speaker: 'شما', text: 'Ja, hier ist er. Kann ich es gegen Größe M umtauschen?', fa: 'بله، بفرمایید. می‌توانم با سایز ام تعویض کنم؟' },
      ],
      fr: [
        { speaker: 'فروشنده', text: 'Bonjour ! Comment puis-je vous aider ?', fa: 'روز بخیر! چطور می‌توانم کمکتان کنم؟' },
        { speaker: 'شما', text: 'J’ai acheté cette chemise hier, mais elle est un peu petite.', fa: 'دیروز این پیراهن را خریدم، ولی کمی تنگ است.' },
        { speaker: 'فروشنده', text: 'Pas de problème. Vous avez le ticket de caisse ?', fa: 'مشکلی نیست. رسید خرید را دارید؟' },
        { speaker: 'شما', text: 'Oui, le voici. Puis-je l’échanger contre une taille M ?', fa: 'بله، بفرمایید. می‌توانم با سایز مدیوم عوض کنم؟' },
      ],
      es: [
        { speaker: 'فروشنده', text: '¡Hola! ¿En qué puedo ayudarle hoy?', fa: 'سلام! امروز چطور می‌توانم کمکتان کنم؟' },
        { speaker: 'شما', text: 'Compré esta camisa ayer, pero me queda un poco pequeña.', fa: 'دیروز این پیراهن را خریدم، اما برایم کمی کوچک است.' },
        { speaker: 'فروشنده', text: 'No hay problema. ¿Trae el recibo de compra?', fa: 'مشکلی نیست. رسید خرید را همراه دارید؟' },
        { speaker: 'شما', text: 'Sí, aquí está. ¿Puedo cambiarla por una talla M?', fa: 'بله، بفرمایید. می‌توانم با سایز مدیوم عوض کنم؟' },
      ],
      ru: [
        { speaker: 'فروشنده', text: 'Здра́вствуйте! Чем могу́ вам помо́чь?', fa: 'سلام! چطور می‌توانم کمکتان کنم؟' },
        { speaker: 'شما', text: 'Я купи́л эту руба́шку вчера́, но она́ мне немного мала́.', fa: 'دیروز این پیراهن را خریدم، ولی برایم کمی تنگ است.' },
        { speaker: 'فروشنده', text: 'Без пробле́м. У вас сохрани́лся чек?', fa: 'مشکلی نیست. رسیدش را دارید؟' },
        { speaker: 'شما', text: 'Да, вот он. Мо́жно обменя́ть на сре́дний разме́р?', fa: 'بله، بفرمایید. می‌توانم با سایز متوسط عوض کنم؟' },
      ],
    },
    // A2-2: Hotel check-in
    {
      en: [
        { speaker: 'پذیرش هتل', text: 'Good evening, welcome! Do you have a reservation?', fa: 'عصر بخیر، خوش آمدید! رزرو دارید؟' },
        { speaker: 'شما', text: 'Yes, a single room for three nights under Mina Karimi.', fa: 'بله، یک اتاق یک‌نفره برای سه شب به نام مینا کریمی.' },
        { speaker: 'پذیرش هتل', text: 'Found it! Breakfast is served from seven to ten.', fa: 'پیدایش کردم! صبحانه از هفت تا ده سرو می‌شود.' },
        { speaker: 'شما', text: 'Thank you. Does the room have a quiet window?', fa: 'ممنون. آیا اتاق پنجرهٔ رو به حیاط آرام دارد؟' },
      ],
      de: [
        { speaker: 'پذیرش هتل', text: 'Guten Abend, willkommen! Haben Sie reserviert?', fa: 'عصر بخیر، خوش آمدید! رزرو دارید؟' },
        { speaker: 'شما', text: 'Ja, ein Einzelzimmer für drei Nächte auf den Namen Mina Karimi.', fa: 'بله، یک اتاق تک‌نفره برای سه شب به نام مینا کریمی.' },
        { speaker: 'پذیرش هتل', text: 'Gefunden! Frühstück gibt es von sieben bis zehn Uhr.', fa: 'پیدایش کردم! صبحانه از هفت تا ده است.' },
        { speaker: 'شما', text: 'Danke. Liegt das Zimmer zu einem ruhigen Hof?', fa: 'ممنون. آیا اتاق رو به حیاط آرام است؟' },
      ],
      fr: [
        { speaker: 'پذیرش هتل', text: 'Bonsoir et bienvenue ! Vous avez une réservation ?', fa: 'عصر بخیر، خوش آمدید! رزرو دارید؟' },
        { speaker: 'شما', text: 'Oui, une chambre simple pour trois nuits au nom de Mina Karimi.', fa: 'بله، یک اتاق یک‌نفره برای سه شب به نام مینا کریمی.' },
        { speaker: 'پذیرش هتل', text: 'Parfait ! Le petit-déjeuner est servi de sept heures à dix heures.', fa: 'عالی! صبحانه از ساعت هفت تا ده سرو می‌شود.' },
        { speaker: 'شما', text: 'Merci. Est-ce que la chambre donne sur une cour calme ?', fa: 'ممنون. آیا اتاق رو به حیاطی آرام است؟' },
      ],
      es: [
        { speaker: 'پذیرش هتل', text: 'Buenas tardes, ¡bienvenido! ¿Tiene reserva?', fa: 'عصر بخیر، خوش آمدید! رزرو دارید؟' },
        { speaker: 'شما', text: 'Sí, una habitación individual por tres noches a nombre de Mina Karimi.', fa: 'بله، یک اتاق تک‌نفره برای سه شب به نام مینا کریمی.' },
        { speaker: 'پذیرش هتل', text: '¡Aquí está! El desayuno se sirve de siete a diez.', fa: 'پیدا شد! صبحانه از هفت تا ده سرو می‌شود.' },
        { speaker: 'شما', text: 'Gracias. ¿La habitación da a un patio tranquilo?', fa: 'ممنون. آیا اتاق رو به حیاط آرام است؟' },
      ],
      ru: [
        { speaker: 'پذیرش هتل', text: 'До́брый ве́чер! У вас есть бро́нь?', fa: 'عصر بخیر! رزرو دارید؟' },
        { speaker: 'شما', text: 'Да, одноме́стный но́мер на три но́чи на и́мя Ми́на Карими́.', fa: 'بله، یک اتاق یک‌نفره برای سه شب به نام مینا کریمی.' },
        { speaker: 'پذیرش هتل', text: 'Нашла́! За́втрак подаю́т с семи́ до десяти́.', fa: 'پیدا کردم! صبحانه از هفت تا ده سرو می‌شود.' },
        { speaker: 'شما', text: 'Спаси́бо. О́кна выхо́дят в ти́хий двор?', fa: 'ممنون. پنجره رو به حیاط آرام است؟' },
      ],
    },
    // A2-3: Weather & hike
    {
      en: [
        { speaker: 'دوست', text: 'Did you check the weather forecast for tomorrow?', fa: 'پیش‌بینی هوای فردا را نگاه کردی؟' },
        { speaker: 'شما', text: 'Yes, it says sunny in the morning, with light rain later.', fa: 'بله، نوشته صبح آفتابی است و بعد کمی باران می‌بارد.' },
        { speaker: 'دوست', text: 'Should we still go for our morning walk?', fa: 'پس باز هم پیاده‌روی صبح را برویم؟' },
        { speaker: 'شما', text: 'Sure, if we start at eight, we will be back before it rains.', fa: 'حتماً، اگر ساعت هشت شروع کنیم، قبل از باران برمی‌گردیم.' },
      ],
      de: [
        { speaker: 'دوست', text: 'Hast du den Wetterbericht für morgen gesehen?', fa: 'پیش‌بینی هوای فردا را دیده‌ای؟' },
        { speaker: 'شما', text: 'Ja, morgens sonnig, aber am Nachmittag regnet es leicht.', fa: 'بله، صبح آفتابی است اما بعدازظهر کمی باران می‌بارد.' },
        { speaker: 'دوست', text: 'Wollen wir trotzdem unseren Spaziergang machen?', fa: 'باز هم پیاده‌روی را برویم؟' },
        { speaker: 'شما', text: 'Klar, wenn wir um acht starten, sind wir vor dem Regen zurück.', fa: 'حتماً، اگر ساعت هشت راه بیفتیم قبل از باران برمی‌گردیم.' },
      ],
      fr: [
        { speaker: 'دوست', text: 'Tu as regardé la météo pour demain ?', fa: 'پیش‌بینی هوای فردا را دیدی؟' },
        { speaker: 'شما', text: 'Oui, soleil le matin, mais un peu de pluie l’après-midi.', fa: 'بله، صبح آفتابی و بعدازظهر کمی باران است.' },
        { speaker: 'دوست', text: 'On fait quand même notre balade ?', fa: 'باز هم پیاده‌روی را برویم؟' },
        { speaker: 'شما', text: 'Oui, si on part à huit heures, on rentre avant la pluie.', fa: 'بله، اگر ساعت هشت حرکت کنیم قبل از باران برمی‌گردیم.' },
      ],
      es: [
        { speaker: 'دوست', text: '¿Viste el pronóstico del tiempo para mañana?', fa: 'پیش‌بینی هوای فردا را دیدی؟' },
        { speaker: 'شما', text: 'Sí, por la mañana hace sol, pero por la tarde llueve un poco.', fa: 'بله، صبح آفتابی است ولی عصر کمی باران می‌بارد.' },
        { speaker: 'دوست', text: '¿Salimos a caminar de todas formas?', fa: 'با این حال برای پیاده‌روی برویم؟' },
        { speaker: 'شما', text: 'Claro, si salimos a las ocho, volvemos antes de la lluvia.', fa: 'حتماً، اگر ساعت هشت راه بیفتیم قبل از باران برمی‌گردیم.' },
      ],
      ru: [
        { speaker: 'دوست', text: 'Ты смотре́л прогно́з пого́ды на за́втра?', fa: 'پیش‌بینی هوای فردا را دیدی؟' },
        { speaker: 'شما', text: 'Да, у́тром со́лнечно, а днём обеща́ют небольшо́й дождь.', fa: 'بله، صبح آفتابی است ولی ظهر باران خفیف پیش‌بینی شده.' },
        { speaker: 'دوست', text: 'Всё равно́ пойдём гуля́ть у́тром?', fa: 'باز هم صبح برویم پیاده‌روی؟' },
        { speaker: 'شما', text: 'Коне́чно, е́сли вы́йдем в во́семь, вернёмся до дождя́.', fa: 'البته، اگر ساعت هشت راه بیفتیم قبل از باران برمی‌گردیم.' },
      ],
    },
    // A2-4: Exercise routine
    {
      en: [
        { speaker: 'دوست', text: 'You look energetic! How often do you exercise?', fa: 'سرحال به نظر می‌رسی! چند بار در هفته ورزش می‌کنی؟' },
        { speaker: 'شما', text: 'I usually swim twice a week and walk to work.', fa: 'معمولاً هفته‌ای دو بار شنا می‌کنم و پیاده سر کار می‌روم.' },
        { speaker: 'دوست', text: 'That is great. I am trying to start running again.', fa: 'عالیه. من هم می‌خواهم دوباره دویدن را شروع کنم.' },
        { speaker: 'شما', text: 'We can jog together in the park on Tuesdays if you like.', fa: 'اگر دوست داری سه‌شنبه‌ها می‌توانیم با هم در پارک بدویم.' },
      ],
      de: [
        { speaker: 'دوست', text: 'Du wirkst so fit! Wie oft machst du Sport?', fa: 'خیلی سرحال به نظر می‌رسی! چند وقت یک بار ورزش می‌کنی؟' },
        { speaker: 'شما', text: 'Ich schwimme zweimal pro Woche und gehe zu Fuß zur Arbeit.', fa: 'هفته‌ای دو بار شنا می‌کنم و پیاده سر کار می‌روم.' },
        { speaker: 'دوست', text: 'Toll! Ich möchte auch wieder mit dem Laufen anfangen.', fa: 'عالی است! من هم می‌خواهم دوباره دویدن را شروع کنم.' },
        { speaker: 'شما', text: 'Wir können dienstags zusammen im Park joggen.', fa: 'سه‌شنبه‌ها می‌توانیم با هم در پارک بدویم.' },
      ],
      fr: [
        { speaker: 'دوست', text: 'Tu as l’air en forme ! Tu fais du sport souvent ?', fa: 'خیلی سرحال به نظر می‌رسی! زیاد ورزش می‌کنی؟' },
        { speaker: 'شما', text: 'Je nage deux fois par semaine et je vais au travail à pied.', fa: 'هفته‌ای دو بار شنا می‌کنم و پیاده سر کار می‌روم.' },
        { speaker: 'دوست', text: 'C’est génial. J’essaie de me remettre à courir aussi.', fa: 'عالی است. من هم سعی می‌کنم دوباره دویدن را شروع کنم.' },
        { speaker: 'شما', text: 'Si tu veux, on peut courir ensemble le mardi au parc.', fa: 'اگر بخواهی می‌توانیم سه‌شنبه‌ها با هم در پارک بدویم.' },
      ],
      es: [
        { speaker: 'دوست', text: '¡Se te ve con mucha energía! ¿Haces deporte a menudo?', fa: 'خیلی پرانرژی به نظر می‌رسی! زیاد ورزش می‌کنی؟' },
        { speaker: 'شما', text: 'Nado dos veces por semana y voy caminando al trabajo.', fa: 'هفته‌ای دو بار شنا می‌کنم و پیاده سر کار می‌روم.' },
        { speaker: 'دوست', text: 'Qué bien. Yo quiero volver a salir a correr.', fa: 'چه خوب. من هم می‌خواهم دوباره دویدن را شروع کنم.' },
        { speaker: 'شما', text: 'Podemos correr juntos los martes en el parque.', fa: 'سه‌شنبه‌ها می‌توانیم با هم در پارک بدویم.' },
      ],
      ru: [
        { speaker: 'دوست', text: 'Ты так бо́дро вы́глядишь! Ча́сто занима́ешься спо́ртом?', fa: 'خیلی سرحال به نظر می‌رسی! زیاد ورزش می‌کنی؟' },
        { speaker: 'شما', text: 'Обы́чно я пла́ваю два ра́за в неде́лю и хожу́ на рабо́ту пешко́м.', fa: 'معمولاً هفته‌ای دو بار شنا می‌کنم و پیاده سر کار می‌روم.' },
        { speaker: 'دوست', text: 'Отли́чно! Я то́же хочу́ сно́ва нача́ть бе́гать.', fa: 'عالی است! من هم می‌خواهم دوباره دویدن را شروع کنم.' },
        { speaker: 'شما', text: 'Дава́й бе́гать вме́сте по вто́рникам в па́рке.', fa: 'بیا سه‌شنبه‌ها با هم در پارک بدویم.' },
      ],
    },
    // A2-5: Dentist appointment
    {
      en: [
        { speaker: 'منشی', text: 'Dental clinic, good morning. How can I help you?', fa: 'کلینیک دندان‌پزشکی، صبح بخیر. چطور می‌توانم کمکتان کنم؟' },
        { speaker: 'شما', text: 'I would like to book a checkup for next week.', fa: 'می‌خواهم برای هفتهٔ آینده یک نوبت معاینه بگیرم.' },
        { speaker: 'منشی', text: 'We have an opening on Wednesday at ten in the morning.', fa: 'چهارشنبه ساعت ده صبح وقت خالی داریم.' },
        { speaker: 'شما', text: 'Wednesday at ten works well for me. Thank you.', fa: 'چهارشنبه ساعت ده برایم عالی است. ممنون.' },
      ],
      de: [
        { speaker: 'منشی', text: 'Zahnarztpraxis, guten Morgen. Wie kann ich helfen?', fa: 'مطب دندان‌پزشکی، صبح بخیر. چطور کمکتان کنم؟' },
        { speaker: 'شما', text: 'Ich möchte gern nächste Woche einen Kontrolltermin vereinbaren.', fa: 'می‌خواهم برای هفتهٔ آینده وقت معاینه بگیرم.' },
        { speaker: 'منشی', text: 'Am Mittwoch um zehn Uhr wäre noch etwas frei.', fa: 'چهارشنبه ساعت ده صبح وقت خالی داریم.' },
        { speaker: 'شما', text: 'Mittwoch um zehn passt mir sehr gut. Danke.', fa: 'چهارشنبه ساعت ده برایم خیلی مناسب است. ممنون.' },
      ],
      fr: [
        { speaker: 'منشی', text: 'Cabinet dentaire, bonjour. Comment puis-je vous aider ?', fa: 'کلینیک دندان‌پزشکی، روز بخیر. چطور کمکتان کنم؟' },
        { speaker: 'شما', text: 'Je voudrais prendre rendez-vous pour un contrôle la semaine prochaine.', fa: 'می‌خواهم برای هفتهٔ آینده وقت معاینه بگیرم.' },
        { speaker: 'منشی', text: 'Nous avons une place mercredi à dix heures du matin.', fa: 'چهارشنبه ساعت ده صبح وقت خالی داریم.' },
        { speaker: 'شما', text: 'Mercredi à dix heures, c’est parfait pour moi. Merci.', fa: 'چهارشنبه ساعت ده برایم عالی است. ممنون.' },
      ],
      es: [
        { speaker: 'منشی', text: 'Clínica dental, buenos días. ¿En qué puedo ayudarle?', fa: 'کلینیک دندان‌پزشکی، صبح بخیر. چطور کمکتان کنم؟' },
        { speaker: 'شما', text: 'Quisiera pedir cita para una revisión la próxima semana.', fa: 'می‌خواهم برای هفتهٔ آینده وقت معاینه بگیرم.' },
        { speaker: 'منشی', text: 'Tenemos un hueco el miércoles a las diez de la mañana.', fa: 'چهارشنبه ساعت ده صبح وقت خالی داریم.' },
        { speaker: 'شما', text: 'El miércoles a las diez me viene muy bien. Gracias.', fa: 'چهارشنبه ساعت ده برایم خیلی خوب است. ممنون.' },
      ],
      ru: [
        { speaker: 'منشی', text: 'Стоматоло́гия, до́брое у́тро. Чем могу́ помо́чь?', fa: 'کلینیک دندان‌پزشکی، صبح بخیر. چطور کمکتان کنم؟' },
        { speaker: 'شما', text: 'Я хоте́л бы записа́ться на осмо́тр на сле́дующей неде́ле.', fa: 'می‌خواهم برای هفتهٔ آینده نوبت معاینه بگیرم.' },
        { speaker: 'منشی', text: 'Есть свобо́дное вре́мя в сре́ду в де́сять утра́.', fa: 'چهارشنبه ساعت ده صبح وقت خالی هست.' },
        { speaker: 'شما', text: 'Среда́ в де́сять мне о́чень подхо́дит. Спаси́бо.', fa: 'چهارشنبه ساعت ده برایم خیلی مناسب است. ممنون.' },
      ],
    },
    // A2-6: Office printer
    {
      en: [
        { speaker: 'شما', text: 'Excuse me, do you know why the printer is not working?', fa: 'ببخشید، می‌دانی چرا چاپگر کار نمی‌کند؟' },
        { speaker: 'همکار', text: 'Let me check. Oh, it looks like the paper tray is empty.', fa: 'بگذار ببینم. آها، مثل اینکه سینی کاغذ خالی شده.' },
        { speaker: 'شما', text: 'Where do we keep the extra paper?', fa: 'کاغذ اضافه را کجا نگه می‌داریم؟' },
        { speaker: 'همکار', text: 'In the white cabinet behind the reception desk.', fa: 'داخل کمد سفید پشت میز پذیرش.' },
      ],
      de: [
        { speaker: 'شما', text: 'Entschuldigung, weißt du, warum der Drucker nicht funktioniert?', fa: 'ببخشید، می‌دانی چرا چاپگر کار نمی‌کند؟' },
        { speaker: 'همکار', text: 'Moment, ich schaue nach. Das Papierfach ist leer.', fa: 'یک لحظه نگاه کنم. سینی کاغذ خالی است.' },
        { speaker: 'شما', text: 'Wo liegt das neue Papier?', fa: 'کاغذ تازه کجاست؟' },
        { speaker: 'همکار', text: 'Im weißen Schrank hinter dem Empfang.', fa: 'در کمد سفید پشت میز پذیرش.' },
      ],
      fr: [
        { speaker: 'شما', text: 'Excuse-moi, tu sais pourquoi l’imprimante ne marche pas ?', fa: 'ببخشید، می‌دانی چرا چاپگر کار نمی‌کند؟' },
        { speaker: 'همکار', text: 'Attends, je regarde. Le bac à papier est vide.', fa: 'صبر کن نگاه کنم. سینی کاغذ خالی است.' },
        { speaker: 'شما', text: 'Où est-ce qu’on range le papier ?', fa: 'کاغذها را کجا می‌گذاریم؟' },
        { speaker: 'همکار', text: 'Dans l’armoire blanche derrière l’accueil.', fa: 'در کمد سفید پشت پذیرش.' },
      ],
      es: [
        { speaker: 'شما', text: 'Perdona, ¿sabes por qué no funciona la impresora?', fa: 'ببخشید، می‌دانی چرا چاپگر کار نمی‌کند؟' },
        { speaker: 'همکار', text: 'Déjame mirar. Parece que no tiene papel.', fa: 'بگذار ببینم. انگار کاغذ ندارد.' },
        { speaker: 'شما', text: '¿Dónde guardamos el papel nuevo?', fa: 'کاغذ تازه را کجا می‌گذاریم؟' },
        { speaker: 'همکار', text: 'En el armario blanco detrás de recepción.', fa: 'در کمد سفید پشت میز پذیرش.' },
      ],
      ru: [
        { speaker: 'شما', text: 'Извини́, не зна́ешь, почему́ при́нтер не рабо́тает?', fa: 'ببخشید، نمی‌دانی چرا چاپگر کار نمی‌کند؟' },
        { speaker: 'همکار', text: 'Сейча́с посмотрю́. Ой, про́сто зако́нчилась бума́га.', fa: 'الان نگاه می‌کنم. آها، فقط کاغذش تمام شده.' },
        { speaker: 'شما', text: 'Где у нас лежи́т запасна́я бума́га?', fa: 'کاغذ یدکی کجاست؟' },
        { speaker: 'همکار', text: 'В бе́лом шкафу́ за сто́йкой администра́тора.', fa: 'داخل کمد سفید پشت میز پذیرش.' },
      ],
    },
    // A2-7: Cooking dinner
    {
      en: [
        { speaker: 'دوست', text: 'What are we cooking for dinner tonight?', fa: 'امشب برای شام چی درست می‌کنیم؟' },
        { speaker: 'شما', text: 'I thought we could make pasta with tomato sauce and salad.', fa: 'فکر کردم پاستا با سس گوجه‌فرنگی و سالاد درست کنیم.' },
        { speaker: 'دوست', text: 'Sounds delicious! Do we have enough tomatoes and garlic?', fa: 'خوشمزه به نظر می‌رسد! به اندازه کافی گوجه و سیر داریم؟' },
        { speaker: 'شما', text: 'We have tomatoes, so I will just pick up garlic on my way home.', fa: 'گوجه داریم، فقط سر راه خانه سیر می‌خرم.' },
      ],
      de: [
        { speaker: 'دوست', text: 'Was kochen wir heute Abend zum Essen?', fa: 'امشب برای شام چه بپزیم؟' },
        { speaker: 'شما', text: 'Wir könnten Nudeln mit Tomatensoße und Salat machen.', fa: 'می‌توانیم پاستا با سس گوجه و سالاد درست کنیم.' },
        { speaker: 'دوست', text: 'Lecker! Haben wir genug Tomaten und Knoblauch?', fa: 'خوشمزه است! گوجه و سیر به اندازهٔ کافی داریم؟' },
        { speaker: 'شما', text: 'Tomaten sind da, Knoblauch kaufe ich auf dem Heimweg.', fa: 'گوجه داریم، سیر را در راه برگشت می‌خرم.' },
      ],
      fr: [
        { speaker: 'دوست', text: 'Qu’est-ce qu’on prépare pour le dîner ce soir ?', fa: 'امشب برای شام چی درست کنیم؟' },
        { speaker: 'شما', text: 'On pourrait faire des pâtes à la tomate avec une salade.', fa: 'می‌توانیم پاستا با سس گوجه و سالاد درست کنیم.' },
        { speaker: 'دوست', text: 'Bonne idée ! On a assez de tomates et d’ail ?', fa: 'فکر خوبیه! گوجه و سیر به اندازه کافی داریم؟' },
        { speaker: 'شما', text: 'On a des tomates, j’achèterai de l’ail en rentrant.', fa: 'گوجه داریم، سر راه برگشت سیر می‌خرم.' },
      ],
      es: [
        { speaker: 'دوست', text: '¿Qué preparamos hoy para la cena?', fa: 'امشب برای شام چه درست کنیم؟' },
        { speaker: 'شما', text: 'Podríamos hacer pasta con salsa de tomate y ensalada.', fa: 'می‌توانیم پاستا با سس گوجه و سالاد درست کنیم.' },
        { speaker: 'دوست', text: '¡Qué rico! ¿Tenemos bastantes tomates y ajo?', fa: 'عالی است! گوجه و سیر به اندازه کافی داریم؟' },
        { speaker: 'شما', text: 'Hay tomates, así que compro ajo camino a casa.', fa: 'گوجه هست، پس سر راه خانه سیر می‌خرم.' },
      ],
      ru: [
        { speaker: 'دوست', text: 'Что мы пригото́вим сего́дня на у́жин?', fa: 'امشب برای شام چی درست کنیم؟' },
        { speaker: 'شما', text: 'Мо́жно сде́лать па́сту с тома́тным со́усом и сала́т.', fa: 'می‌توانیم پاستا با سس گوجه و سالاد درست کنیم.' },
        { speaker: 'دوست', text: 'Вку́сно! У нас хвати́т помидо́ров и чеснока́?', fa: 'خوشمزه است! گوجه و سیر به اندازهٔ کافی داریم؟' },
        { speaker: 'شما', text: 'Помидо́ры есть, а чесно́к я куплю́ по доро́ге домо́й.', fa: 'گوجه داریم، سیر را سر راه خانه می‌خرم.' },
      ],
    },
    // A2-8: Bus delay
    {
      en: [
        { speaker: 'مسافر', text: 'Excuse me, has the number twelve bus passed yet?', fa: 'ببخشید، اتوبوس شمارهٔ دوازده رد شده؟' },
        { speaker: 'شما', text: 'Not yet. The screen says it is six minutes late today.', fa: 'هنوز نه. تابلو نشان می‌دهد امروز شش دقیقه تأخیر دارد.' },
        { speaker: 'مسافر', text: 'Oh, I hope it comes soon. Does it stop at the museum?', fa: 'امیدوارم زود برسد. جلوی موزه توقف دارد؟' },
        { speaker: 'شما', text: 'Yes, it is the fourth stop after the central square.', fa: 'بله، چهارمین ایستگاه بعد از میدان مرکزی است.' },
      ],
      de: [
        { speaker: 'مسافر', text: 'Entschuldigung, ist der Bus Nummer zwölf schon vorbeigefahren?', fa: 'ببخشید، اتوبوس شمارهٔ دوازده رد شده؟' },
        { speaker: 'شما', text: 'Noch nicht. Laut Anzeige hat er heute sechs Minuten Verspätung.', fa: 'هنوز نه. طبق تابلو امروز شش دقیقه تأخیر دارد.' },
        { speaker: 'مسافر', text: 'Hoffentlich kommt er bald. Hält er am Museum?', fa: 'امیدوارم زود بیاید. جلوی موزه می‌ایستد؟' },
        { speaker: 'شما', text: 'Ja, das ist die vierte Haltestelle nach dem Zentrum.', fa: 'بله، چهارمین ایستگاه بعد از مرکز است.' },
      ],
      fr: [
        { speaker: 'مسافر', text: 'Pardon, le bus numéro douze est déjà passé ?', fa: 'ببخشید، اتوبوس شمارهٔ دوازده رد شده؟' },
        { speaker: 'شما', text: 'Pas encore. L’écran indique six minutes de retard.', fa: 'هنوز نه. نمایشگر شش دقیقه تأخیر نشان می‌دهد.' },
        { speaker: 'مسافر', text: 'J’espère qu’il arrive vite. Il s’arrête au musée ?', fa: 'امیدوارم زود برسد. جلوی موزه توقف می‌کند؟' },
        { speaker: 'شما', text: 'Oui, c’est le quatrième arrêt après la place centrale.', fa: 'بله، چهارمین ایستگاه بعد از میدان مرکزی است.' },
      ],
      es: [
        { speaker: 'مسافر', text: 'Disculpe, ¿ya pasó el autobús número doce?', fa: 'ببخشید، اتوبوس شمارهٔ دوازده رد شده؟' },
        { speaker: 'شما', text: 'Todavía no. La pantalla dice que lleva seis minutos de retraso.', fa: 'هنوز نه. صفحه نمایش شش دقیقه تأخیر نشان می‌دهد.' },
        { speaker: 'مسافر', text: 'Ojalá llegue pronto. ¿Para frente al museo?', fa: 'امیدوارم زود برسد. جلوی موزه توقف دارد؟' },
        { speaker: 'شما', text: 'Sí, es la cuarta parada después de la plaza central.', fa: 'بله، چهارمین ایستگاه بعد از میدان مرکزی است.' },
      ],
      ru: [
        { speaker: 'مسافر', text: 'Извини́те, двена́дцатый авто́бус уже́ прошёл?', fa: 'ببخشید، اتوبوس دوازده رد شده؟' },
        { speaker: 'شما', text: 'Ещё нет. На табло́ на́писано, что он опа́здывает на шесть мину́т.', fa: 'هنوز نه. روی تابلو نوشته شش دقیقه تأخیر دارد.' },
        { speaker: 'مسافر', text: 'Наде́юсь, ско́ро прие́дет. Он остана́вливается у музе́я?', fa: 'امیدوارم زود برسد. جلوی موزه می‌ایستد؟' },
        { speaker: 'شما', text: 'Да, э́то четвёртая остано́вка по́сле це́нтра.', fa: 'بله، چهارمین ایستگاه بعد از مرکز است.' },
      ],
    },
    // A2-9: Birthday gift
    {
      en: [
        { speaker: 'دوست', text: 'Have you decided what to buy for Nima’s birthday?', fa: 'تصمیم گرفتی برای تولد نیما چی بخری؟' },
        { speaker: 'شما', text: 'I want to get him a warm scarf or a travel mug.', fa: 'می‌خواهم یک شال‌گردن گرم یا ماگ سفری بگیرم.' },
        { speaker: 'دوست', text: 'A travel mug is very useful! He takes the train every morning.', fa: 'ماگ سفری خیلی کاربردی است! هر صبح با قطار می‌رود.' },
        { speaker: 'شما', text: 'True! Let us check the shop near the station after work.', fa: 'راست می‌گویی! بعد از کار مغازهٔ نزدیک ایستگاه را می‌بینیم.' },
      ],
      de: [
        { speaker: 'دوست', text: 'Weißt du schon, was du Nima zum Geburtstag schenkst?', fa: 'می‌دانی برای تولد نیما چه هدیه‌ای بخری؟' },
        { speaker: 'شما', text: 'Ich möchte ihm einen warmen Schal oder einen Thermobecher kaufen.', fa: 'می‌خواهم یک شال گرم یا لیوان سفری برایش بخرم.' },
        { speaker: 'دوست', text: 'Ein Thermobecher ist praktisch, er fährt jeden Morgen Zug.', fa: 'لیوان سفری خیلی کاربردی است، هر صبح سوار قطار می‌شود.' },
        { speaker: 'شما', text: 'Stimmt! Schauen wir nach der Arbeit im Laden am Bahnhof.', fa: 'درست است! بعد از کار مغازهٔ ایستگاه را می‌بینیم.' },
      ],
      fr: [
        { speaker: 'دوست', text: 'Tu sais ce que tu vas offrir à Nima pour son anniversaire ?', fa: 'می‌دانی برای تولد نیما چی کادو بخری؟' },
        { speaker: 'شما', text: 'Je pense prendre une écharpe chaude ou un mug de voyage.', fa: 'فکر می‌کنم یک شال گرم یا ماگ سفری بگیرم.' },
        { speaker: 'دوست', text: 'Le mug est très pratique, il prend le train tous les matins.', fa: 'ماگ خیلی کاربردی است، هر صبح سوار قطار می‌شود.' },
        { speaker: 'شما', text: 'C’est vrai ! Passons voir la boutique près de la gare.', fa: 'راست می‌گویی! سری به مغازهٔ نزدیک ایستگاه بزنیم.' },
      ],
      es: [
        { speaker: 'دوست', text: '¿Ya sabes qué regalarle a Nima por su cumpleaños?', fa: 'می‌دانی برای تولد نیما چی هدیه بدهی؟' },
        { speaker: 'شما', text: 'Quiero comprarle una bufanda abrigada o una taza térmica.', fa: 'می‌خواهم یک شال گرم یا لیوان سفری برایش بخرم.' },
        { speaker: 'دوست', text: 'La taza térmica es muy útil; toma el tren cada mañana.', fa: 'لیوان سفری خیلی مفید است؛ هر صبح سوار قطار می‌شود.' },
        { speaker: 'شما', text: '¡Es verdad! Pasemos por la tienda de la estación luego.', fa: 'راست می‌گویی! بعداً سری به مغازهٔ ایستگاه بزنیم.' },
      ],
      ru: [
        { speaker: 'دوست', text: 'Ты уже́ реши́л, что подари́ть Ни́ме на день рожде́ния?', fa: 'تصمیم گرفتی برای تولد نیما چی هدیه بدهی؟' },
        { speaker: 'شما', text: 'Думаю купи́ть тёплый шарф и́ли термокру́жку.', fa: 'فکر می‌کنم یک شال گرم یا ماگ حرارتی بخرم.' },
        { speaker: 'دوست', text: 'Термокру́жка о́чень поле́зная, он ка́ждое у́тро е́здит на по́езде.', fa: 'ماگ حرارتی خیلی به درد می‌خورد، هر صبح با قطار می‌رود.' },
        { speaker: 'شما', text: 'То́чно! Зайдём по́сле рабо́ты в магази́н у вокза́ла.', fa: 'دقیقاً! بعد از کار به مغازهٔ کنار ایستگاه سر بزنیم.' },
      ],
    },
    // A2-10: Library card
    {
      en: [
        { speaker: 'کتابدار', text: 'Welcome to the city library! Do you have a membership card?', fa: 'به کتابخانهٔ شهر خوش آمدید! کارت عضویت دارید؟' },
        { speaker: 'شما', text: 'Not yet. How can I sign up for one?', fa: 'هنوز نه. چطور می‌توانم ثبت‌نام کنم؟' },
        { speaker: 'کتابدار', text: 'Just show me your ID and fill out this short form.', fa: 'فقط کارت شناسایی‌تان را نشان بدهید و این فرم کوتاه را پر کنید.' },
        { speaker: 'شما', text: 'How many books can I borrow at a time?', fa: 'هر بار چند کتاب می‌توانم امانت بگیرم؟' },
      ],
      de: [
        { speaker: 'کتابدار', text: 'Willkommen in der Stadtbibliothek! Haben Sie einen Ausweis?', fa: 'به کتابخانهٔ شهر خوش آمدید! کارت عضویت دارید؟' },
        { speaker: 'شما', text: 'Noch nicht. Wie kann ich mich anmelden?', fa: 'هنوز نه. چطور می‌توانم ثبت‌نام کنم؟' },
        { speaker: 'کتابدار', text: 'Zeigen Sie bitte Ihren Ausweis und füllen Sie dieses Formular aus.', fa: 'لطفاً مدرک شناسایی را نشان دهید و این فرم را پر کنید.' },
        { speaker: 'شما', text: 'Wie viele Bücher darf man auf einmal ausleihen?', fa: 'هر بار چند کتاب می‌توان امانت گرفت؟' },
      ],
      fr: [
        { speaker: 'کتابدار', text: 'Bienvenue à la bibliothèque ! Vous avez une carte de lecteur ?', fa: 'به کتابخانه خوش آمدید! کارت عضویت دارید؟' },
        { speaker: 'شما', text: 'Pas encore. Comment puis-je m’inscrire ?', fa: 'هنوز نه. چطور می‌توانم ثبت‌نام کنم؟' },
        { speaker: 'کتابدار', text: 'Montrez-moi une pièce d’identité et remplissez ce court formulaire.', fa: 'کارت شناسایی را نشان بدهید و این فرم کوتاه را پر کنید.' },
        { speaker: 'شما', text: 'Combien de livres peut-on emprunter en même temps ?', fa: 'هم‌زمان چند کتاب می‌توان امانت گرفت؟' },
      ],
      es: [
        { speaker: 'کتابدار', text: '¡Bienvenido a la biblioteca! ¿Tiene carné de socio?', fa: 'به کتابخانه خوش آمدید! کارت عضویت دارید؟' },
        { speaker: 'شما', text: 'Todavía no. ¿Cómo puedo darme de alta?', fa: 'هنوز نه. چطور می‌توانم ثبت‌نام کنم؟' },
        { speaker: 'کتابدار', text: 'Solo necesito su documento y este breve formulario.', fa: 'فقط مدرک شناسایی و این فرم کوتاه لازم است.' },
        { speaker: 'شما', text: '¿Cuántos libros puedo sacar a la vez?', fa: 'هم‌زمان چند کتاب می‌توانم امانت بگیرم؟' },
      ],
      ru: [
        { speaker: 'کتابدار', text: 'Добро́ пожа́ловать в библиоте́ку! У вас есть чита́тельский биле́т?', fa: 'به کتابخانه خوش آمدید! کارت عضویت دارید؟' },
        { speaker: 'شما', text: 'Ещё нет. Как мо́жно оформи́ть его́?', fa: 'هنوز نه. چطور می‌توانم صادرش کنم؟' },
        { speaker: 'کتابدار', text: 'Покажи́те докуме́нт и запо́лните эту коро́ткую анке́ту.', fa: 'مدرکتان را نشان بدهید و این فرم کوتاه را پر کنید.' },
        { speaker: 'شما', text: 'Ско́лько книг мо́жно взять за оди́н раз?', fa: 'در هر نوبت چند کتاب می‌توان گرفت؟' },
      ],
    },
    // A2-11: Weekend trip packing
    {
      en: [
        { speaker: 'همراه', text: 'Have you packed your bag for the trip tomorrow?', fa: 'ساک سفر فردا را بسته‌ای؟' },
        { speaker: 'شما', text: 'Almost! I just need to add my charger and a warm jacket.', fa: 'تقریباً! فقط مانده شارژر و یک کاپشن گرم بگذارم.' },
        { speaker: 'همراه', text: 'Don’t forget comfortable shoes; we will walk a lot.', fa: 'کفش راحت یادت نرود؛ خیلی پیاده‌روی داریم.' },
        { speaker: 'شما', text: 'Good reminder! I am wearing my sneakers on the train.', fa: 'یادآوری خوبی بود! کفش کتانی‌ام را توی قطار می‌پوشم.' },
      ],
      de: [
        { speaker: 'همراه', text: 'Hast du deine Tasche für die Reise morgen schon gepackt?', fa: 'کیفت را برای سفر فردا بسته‌ای؟' },
        { speaker: 'شما', text: 'Fast! Nur noch das Ladegerät und eine warme Jacke.', fa: 'تقریباً! فقط شارژر و یک ژاکت گرم مانده.' },
        { speaker: 'همراه', text: 'Vergiss bequeme Schuhe nicht, wir laufen viel.', fa: 'کفش راحت یادت نرود، زیاد راه می‌رویم.' },
        { speaker: 'شما', text: 'Guter Hinweis! Ich ziehe gleich meine Turnschuhe an.', fa: 'تذکر خوبی بود! همان کفش ورزشی‌ام را می‌پوشم.' },
      ],
      fr: [
        { speaker: 'همراه', text: 'Tu as fait ton sac pour le voyage de demain ?', fa: 'ساکت را برای سفر فردا بسته‌ای؟' },
        { speaker: 'شما', text: 'Presque ! Il me reste le chargeur et une veste chaude.', fa: 'تقریباً! فقط شارژر و یک ژاکت گرم مانده.' },
        { speaker: 'همراه', text: 'N’oublie pas de bonnes chaussures, on va beaucoup marcher.', fa: 'کفش راحت یادت نرود، خیلی پیاده‌روی می‌کنیم.' },
        { speaker: 'شما', text: 'Bien vu ! Je vais mettre mes baskets dans le train.', fa: 'نکتهٔ خوبی بود! توی قطار کتانی‌هایم را می‌پوشم.' },
      ],
      es: [
        { speaker: 'همراه', text: '¿Ya hiciste la maleta para el viaje de mañana?', fa: 'چمدانت را برای سفر فردا بسته‌ای؟' },
        { speaker: 'شما', text: 'Casi lista. Solo me falta el cargador y una chaqueta.', fa: 'تقریباً آماده است. فقط شارژر و یک ژاکت مانده.' },
        { speaker: 'همراه', text: 'No olvides zapatos cómodos, vamos a caminar mucho.', fa: 'کفش راحت یادت نرود، زیاد پیاده‌روی می‌کنیم.' },
        { speaker: 'شما', text: '¡Buen consejo! Me pongo las zapatillas en el tren.', fa: 'توصیهٔ خوبی بود! در قطار کتانی می‌پوشم.' },
      ],
      ru: [
        { speaker: 'همراه', text: 'Ты уже́ собра́л су́мку на за́втрашнюю пое́здку?', fa: 'ساکت را برای سفر فردا جمع کرده‌ای؟' },
        { speaker: 'شما', text: 'Почти́! Оста́лось положи́ть заря́дку и тёплую ку́ртку.', fa: 'تقریباً! فقط مانده شارژر و یک کاپشن گرم بگذارم.' },
        { speaker: 'همراه', text: 'Не забу́дь удо́бную о́бувь, мы бу́дем мно́го ходи́ть.', fa: 'کفش راحت یادت نرود، زیاد پیاده‌روی می‌کنیم.' },
        { speaker: 'شما', text: 'То́чно! Я сразу наде́ну кроссо́вки в по́езд.', fa: 'درست است! همان کتانی‌هایم را برای قطار می‌پوشم.' },
      ],
    },
    // A2-12: Movie night
    {
      en: [
        { speaker: 'دوست', text: 'Do you feel like watching a movie tonight?', fa: 'حوصله داری امشب فیلم ببینیم؟' },
        { speaker: 'شما', text: 'Sure! What kind of film are you in the mood for?', fa: 'حتماً! چه نوع فیلمی دلت می‌خواهد؟' },
        { speaker: 'دوست', text: 'Something light and funny, not too long.', fa: 'یک چیز سبک و خنده‌دار، نه خیلی طولانی.' },
        { speaker: 'شما', text: 'Perfect, I know a great comedy we have not seen yet.', fa: 'عالیه، یک کمدی خوب سراغ دارم که هنوز ندیده‌ایم.' },
      ],
      de: [
        { speaker: 'دوست', text: 'Hast du Lust, heute Abend einen Film zu schauen?', fa: 'حوصله داری امشب یک فیلم ببینیم؟' },
        { speaker: 'شما', text: 'Gern! Auf was für einen Film hast du Lust?', fa: 'با میل! چه جور فیلمی دوست داری؟' },
        { speaker: 'دوست', text: 'Etwas Leichtes und Lustiges, nicht zu lang.', fa: 'یک چیز سبک و خنده‌دار، نه خیلی طولانی.' },
        { speaker: 'شما', text: 'Super, ich kenne eine gute Komödie, die wir noch nicht kennen.', fa: 'عالیه، یک کمدی خوب می‌شناسم که هنوز ندیده‌ایم.' },
      ],
      fr: [
        { speaker: 'دوست', text: 'Ça te dit de regarder un film ce soir ?', fa: 'پایه‌ای امشب فیلم ببینیم؟' },
        { speaker: 'شما', text: 'Volontiers ! Quel genre de film tu préfères ?', fa: 'با کمال میل! چه ژانری ترجیح می‌دهی؟' },
        { speaker: 'دوست', text: 'Quelque chose de léger et drôle, pas trop long.', fa: 'یک چیز سبک و بامزه، نه خیلی طولانی.' },
        { speaker: 'شما', text: 'Parfait, je connais une bonne comédie qu’on n’a pas encore vue.', fa: 'عالیه، یک کمدی خوب می‌شناسم که هنوز ندیده‌ایم.' },
      ],
      es: [
        { speaker: 'دوست', text: '¿Te apetece ver una película esta noche?', fa: 'حوصله داری امشب فیلم ببینیم؟' },
        { speaker: 'شما', text: '¡Claro! ¿Qué tipo de película te apetece?', fa: 'حتماً! چه سبک فیلمی دلت می‌خواهد؟' },
        { speaker: 'دوست', text: 'Algo ligero y divertido, no muy largo.', fa: 'یک چیز سبک و سرگرم‌کننده، نه خیلی طولانی.' },
        { speaker: 'شما', text: 'Genial, conozco una comedia muy buena que aún no hemos visto.', fa: 'عالیه، یک کمدی خیلی خوب می‌شناسم که هنوز ندیده‌ایم.' },
      ],
      ru: [
        { speaker: 'دوست', text: 'Хо́чешь посмотре́ть фильм сего́дня ве́чером?', fa: 'می‌خواهی امشب فیلم ببینیم؟' },
        { speaker: 'شما', text: 'Дава́й! Како́й жанр тебе́ сейча́с бли́же?', fa: 'بیا ببینیم! الان چه ژانری دوست داری؟' },
        { speaker: 'دوست', text: 'Что́-нибудь лёгкое и весёлое, не сли́шком дли́нное.', fa: 'یک چیز سبک و شاد، نه خیلی طولانی.' },
        { speaker: 'شما', text: 'Отли́чно, я зна́ю хоро́шую коме́дию, кото́рую мы не ви́дели.', fa: 'عالیه، یک کمدی خوب می‌شناسم که هنوز ندیده‌ایم.' },
      ],
    },
  ],
  B1: [
    // B1-1: Job interview
    {
      en: [
        { speaker: 'مصاحبه‌گر', text: 'Thanks for coming in today. Why does this role interest you?', fa: 'ممنون که امروز تشریف آوردید. چرا این موقعیت شغلی برایتان جذاب است؟' },
        { speaker: 'شما', text: 'I enjoy working directly with customers and solving practical issues.', fa: 'از کار مستقیم با مشتریان و حل مسائل عملی لذت می‌برم.' },
        { speaker: 'مصاحبه‌گر', text: 'Could you share one situation where you worked under a tight deadline?', fa: 'می‌توانید موقعیتی را بگویید که زیر فشار زمانی کار کرده‌اید؟' },
        { speaker: 'شما', text: 'Last year I reorganized our weekly schedule so every order went out on time.', fa: 'پارسال برنامهٔ هفتگی را طوری بازچینی کردم که همهٔ سفارش‌ها به‌موقع ارسال شدند.' },
      ],
      de: [
        { speaker: 'مصاحبه‌گر', text: 'Danke für Ihr Kommen. Warum interessiert Sie diese Stelle?', fa: 'ممنون که آمدید. چرا این شغل برایتان جذاب است؟' },
        { speaker: 'شما', text: 'Ich arbeite gern direkt mit Kunden und löse praktische Aufgaben.', fa: 'دوست دارم مستقیم با مشتریان کار کنم و مسائل عملی را حل کنم.' },
        { speaker: 'مصاحبه‌گر', text: 'Wie gehen Sie vor, wenn mehrere Aufgaben gleichzeitig dringend sind?', fa: 'وقتی چند کار هم‌زمان فوری هستند چطور عمل می‌کنید؟' },
        { speaker: 'شما', text: 'Ich setze klare Prioritäten und stimme mich früh mit dem Team ab.', fa: 'اولویت‌های روشن می‌گذارم و زود با تیم هماهنگ می‌کنم.' },
      ],
      fr: [
        { speaker: 'مصاحبه‌گر', text: 'Merci d’être venu. Pourquoi ce poste vous intéresse-t-il ?', fa: 'ممنون که آمدید. چرا به این جایگاه شغلی علاقه‌مندید؟' },
        { speaker: 'شما', text: 'J’aime travailler avec les clients et résoudre des problèmes concrets.', fa: 'دوست دارم با مشتریان کار کنم و مسائل واقعی را حل کنم.' },
        { speaker: 'مصاحبه‌گر', text: 'Comment réagissez-vous lorsque les délais sont courts ?', fa: 'وقتی مهلت‌ها کوتاه است چطور واکنش نشان می‌دهید؟' },
        { speaker: 'شما', text: 'Je classe les tâches par priorité et je préviens l’équipe rapidement.', fa: 'کارها را اولویت‌بندی می‌کنم و سریع به تیم اطلاع می‌دهم.' },
      ],
      es: [
        { speaker: 'مصاحبه‌گر', text: 'Gracias por venir hoy. ¿Por qué le interesa este puesto?', fa: 'ممنون که امروز آمدید. چرا این شغل برایتان جالب است؟' },
        { speaker: 'شما', text: 'Me gusta tratar con clientes y resolver problemas prácticos.', fa: 'ارتباط با مشتریان و حل مسائل عملی را دوست دارم.' },
        { speaker: 'مصاحبه‌گر', text: '¿Cómo se organiza cuando tiene varias tareas urgentes?', fa: 'وقتی چند کار فوری هم‌زمان دارید چطور برنامه‌ریزی می‌کنید؟' },
        { speaker: 'شما', text: 'Ordeno lo más importante primero y coordino con el equipo.', fa: 'مهم‌ترین‌ها را اول می‌گذارم و با تیم هماهنگ می‌کنم.' },
      ],
      ru: [
        { speaker: 'مصاحبه‌گر', text: 'Спаси́бо, что пришли́. Почему́ вас заинтересова́ла э́та должно́сть?', fa: 'ممنون که آمدید. چرا به این سمت علاقه‌مند شدید؟' },
        { speaker: 'شما', text: 'Мне нра́вится обща́ться с клие́нтами и реша́ть практи́ческие зада́чи.', fa: 'ارتباط با مشتریان و حل مسائل عملی را دوست دارم.' },
        { speaker: 'مصاحبه‌گر', text: 'Как вы справля́етесь, когда́ сро́ки о́чень сжа́тые?', fa: 'وقتی مهلت‌ها خیلی فشرده است چطور عمل می‌کنید؟' },
        { speaker: 'شما', text: 'Я расставля́ю приорите́ты и зара́нее догова́риваюсь с кома́ндой.', fa: 'اولویت‌ها را مشخص می‌کنم و زودتر با تیم هماهنگ می‌کنم.' },
      ],
    },
    // B1-2: Train delay & alternative
    {
      en: [
        { speaker: 'شما', text: 'Excuse me, our train has been delayed by forty minutes. Is there another connection?', fa: 'ببخشید، قطار ما چهل دقیقه تأخیر دارد. مسیر جایگزین دیگری هست؟' },
        { speaker: 'کارمند ایستگاه', text: 'Yes, you can take the regional train on platform three and transfer.', fa: 'بله، می‌توانید با قطار محلی از سکوی سه بروید و خط عوض کنید.' },
        { speaker: 'شما', text: 'Will my current ticket still be valid on that train?', fa: 'آیا بلیت فعلی من در آن قطار هم معتبر است؟' },
        { speaker: 'کارمند ایستگاه', text: 'Yes, because of the delay, no extra fee is needed.', fa: 'بله، به دلیل تأخیر نیازی به هزینهٔ اضافه نیست.' },
      ],
      de: [
        { speaker: 'شما', text: 'Entschuldigung, mein Zug hat vierzig Minuten Verspätung. Gibt es eine Alternative?', fa: 'ببخشید، قطارم چهل دقیقه تأخیر دارد. راه جایگزینی هست؟' },
        { speaker: 'کارمند ایستگاه', text: 'Ja, nehmen Sie den Regionalzug auf Gleis drei und steigen Sie um.', fa: 'بله، با قطار منطقه‌ای در سکوی سه بروید و خط عوض کنید.' },
        { speaker: 'شما', text: 'Gilt mein aktuelles Ticket auch für diesen Zug?', fa: 'آیا بلیت فعلی‌ام برای آن قطار هم معتبر است؟' },
        { speaker: 'کارمند ایستگاه', text: 'Ja, wegen der Verspätung zahlen Sie nichts extra.', fa: 'بله، به خاطر تأخیر هزینهٔ اضافی نمی‌پردازید.' },
      ],
      fr: [
        { speaker: 'شما', text: 'Excusez-moi, mon train a quarante minutes de retard. Y a-t-il une autre option ?', fa: 'ببخشید، قطارم چهل دقیقه تأخیر دارد. گزینهٔ دیگری هست؟' },
        { speaker: 'کارمند ایستگاه', text: 'Oui, prenez le train régional voie trois puis faites une correspondance.', fa: 'بله، قطار منطقه‌ای سکوی سه را سوار شوید و سپس خط عوض کنید.' },
        { speaker: 'شما', text: 'Est-ce que mon billet reste valable sur ce train ?', fa: 'آیا بلیتم در آن قطار هم معتبر می‌ماند؟' },
        { speaker: 'کارمند ایستگاه', text: 'Oui, à cause du retard, vous n’avez rien à payer en plus.', fa: 'بله، به دلیل تأخیر نیازی به پرداخت اضافه نیست.' },
      ],
      es: [
        { speaker: 'شما', text: 'Disculpe, mi tren lleva cuarenta minutos de retraso. ¿Hay otra conexión?', fa: 'ببخشید، قطارم چهل دقیقه تأخیر دارد. خط دیگری هست؟' },
        { speaker: 'کارمند ایستگاه', text: 'Sí, puede tomar el tren regional del andén tres y hacer transbordo.', fa: 'بله، می‌توانید قطار محلی سکوی سه را سوار شوید و تعویض خط کنید.' },
        { speaker: 'شما', text: '¿Mi billete actual sirve también para ese tren?', fa: 'آیا بلیت فعلی من برای آن قطار هم معتبر است؟' },
        { speaker: 'کارمند ایستگاه', text: 'Sí, por el retraso no tiene que pagar nada adicional.', fa: 'بله، به خاطر تأخیر مبلغ اضافی لازم نیست.' },
      ],
      ru: [
        { speaker: 'شما', text: 'Извини́те, мой по́езд заде́рживается на со́рок мину́т. Есть друго́й вариа́нт?', fa: 'ببخشید، قطار من چهل دقیقه تأخیر دارد. گزینهٔ دیگری هست؟' },
        { speaker: 'کارمند ایستگاه', text: 'Да, сади́тесь на электри́чку с тре́тьей платфо́рмы и сде́лайте переса́дку.', fa: 'بله، سوار قطار محلی از سکوی سه شوید و خط عوض کنید.' },
        { speaker: 'شما', text: 'Мой биле́т бу́дет действи́телен на э́том по́езде?', fa: 'آیا بلیتم در آن قطار هم معتبر است؟' },
        { speaker: 'کارمند ایستگاه', text: 'Да, из-за заде́ржки допла́чивать не ну́жно.', fa: 'بله، به خاطر تأخیر نیازی به پرداخت اضافه نیست.' },
      ],
    },
    // B1-3: Landlord repair request
    {
      en: [
        { speaker: 'شما', text: 'Hello Mr. Alavi, the kitchen sink has been leaking since last night.', fa: 'سلام آقای علوی، سینک آشپزخانه از دیشب چکه می‌کند.' },
        { speaker: 'صاحب‌خانه', text: 'Thanks for letting me know quickly. Is water getting on the floor?', fa: 'ممنون که سریع خبر دادید. آب روی کف هم می‌ریزد؟' },
        { speaker: 'شما', text: 'Just a little, so I placed a bucket underneath for now.', fa: 'کمی، برای همین فعلاً یک سطل زیرش گذاشته‌ام.' },
        { speaker: 'صاحب‌خانه', text: 'Good idea. I will send a plumber tomorrow morning between nine and eleven.', fa: 'فکر خوبی است. فردا صبح بین نه تا یازده لوله‌کش می‌فرستم.' },
      ],
      de: [
        { speaker: 'شما', text: 'Guten Tag Herr Alavi, das Spülbecken in der Küche tropft seit gestern Abend.', fa: 'سلام آقای علوی، سینک آشپزخانه از دیشب چکه می‌کند.' },
        { speaker: 'صاحب‌خانه', text: 'Danke für die schnelle Nachricht. Läuft Wasser auf den Boden?', fa: 'ممنون که سریع اطلاع دادید. آب روی زمین می‌ریزد؟' },
        { speaker: 'شما', text: 'Nur wenig, ich habe erst einmal einen Eimer daruntergestellt.', fa: 'فقط کم، فعلاً یک سطل زیرش گذاشته‌ام.' },
        { speaker: 'صاحب‌خانه', text: 'Gut gemacht. Morgen früh zwischen neun und elf kommt ein Handwerker.', fa: 'کار خوبی کردید. فردا صبح بین نه تا یازده تعمیرکار می‌آید.' },
      ],
      fr: [
        { speaker: 'شما', text: 'Bonjour monsieur Alavi, l’évier de la cuisine fuit depuis hier soir.', fa: 'سلام آقای علوی، سینک آشپزخانه از دیشب نشتی دارد.' },
        { speaker: 'صاحب‌خانه', text: 'Merci de me prévenir vite. Est-ce que l’eau coule par terre ?', fa: 'ممنون که سریع خبر دادید. آب روی زمین می‌ریزد؟' },
        { speaker: 'شما', text: 'Un peu seulement, j’ai mis un seau dessous pour l’instant.', fa: 'فقط کمی، فعلاً یک سطل زیرش گذاشته‌ام.' },
        { speaker: 'صاحب‌خانه', text: 'Bonne idée. J’envoie un plombier demain matin entre neuf et onze heures.', fa: 'فکر خوبی است. فردا صبح بین نه تا یازده لوله‌کش می‌فرستم.' },
      ],
      es: [
        { speaker: 'شما', text: 'Hola señor Alavi, el fregadero de la cocina gotea desde anoche.', fa: 'سلام آقای علوی، سینک آشپزخانه از دیشب چکه می‌کند.' },
        { speaker: 'صاحب‌خانه', text: 'Gracias por avisarme pronto. ¿Cae agua al suelo?', fa: 'ممنون که زود خبر دادید. آب روی زمین می‌ریزد؟' },
        { speaker: 'شما', text: 'Solo un poco; puse un cubo debajo por ahora.', fa: 'فقط کمی؛ فعلاً یک سطل زیرش گذاشته‌ام.' },
        { speaker: 'صاحب‌خانه', text: 'Bien hecho. Mañana por la mañana envío al fontanero entre las nueve y las once.', fa: 'خوب است. فردا صبح بین نه تا یازده لوله‌کش می‌فرستم.' },
      ],
      ru: [
        { speaker: 'شما', text: 'Здра́вствуйте, ра́ковина на ку́хне протека́ет со вчера́шнего ве́чера.', fa: 'سلام، سینک آشپزخانه از دیشب چکه می‌کند.' },
        { speaker: 'صاحب‌خانه', text: 'Спаси́бо, что сра́зу сказа́ли. Вода́ попада́ет на пол?', fa: 'ممنون که فوری خبر دادید. آب روی زمین می‌ریزد؟' },
        { speaker: 'شما', text: 'Немно́го, я пока́ поста́вил сни́зу ведро́.', fa: 'کمی، فعلاً زیرش یک سطل گذاشته‌ام.' },
        { speaker: 'صاحب‌خانه', text: 'Хорошо́. За́втра у́тром с девяти́ до оди́ннадцати придёт санте́хник.', fa: 'خوب است. فردا صبح بین نه تا یازده لوله‌کش می‌آید.' },
      ],
    },
    // B1-4: Remote work focus
    {
      en: [
        { speaker: 'همکار', text: 'How are you finding working from home twice a week?', fa: 'دورکاری دو روز در هفته برایت چطور است؟' },
        { speaker: 'شما', text: 'It saves me two hours of commuting, so I get much more focused work done.', fa: 'دو ساعت در رفت‌وآمد صرفه‌جویی می‌کند، پس تمرکز بیشتری روی کار دارم.' },
        { speaker: 'همکار', text: 'Do you miss quick chats with the team?', fa: 'دلت برای گپ‌های کوتاه با تیم تنگ نمی‌شود؟' },
        { speaker: 'شما', text: 'Sometimes, which is why I like coming into the office on Mondays and Thursdays.', fa: 'گاهی بله، برای همین دوست دارم دوشنبه و پنجشنبه حضوری بیایم.' },
      ],
      de: [
        { speaker: 'همکار', text: 'Wie kommst du damit zurecht, zweimal pro Woche von zu Hause zu arbeiten?', fa: 'با هفته‌ای دو روز دورکاری چطور کنار می‌آیی؟' },
        { speaker: 'شما', text: 'Ich spare zwei Stunden Fahrtzeit und arbeite viel konzentrierter.', fa: 'دو ساعت در مسیر صرفه‌جویی می‌کنم و با تمرکز بیشتری کار می‌کنم.' },
        { speaker: 'همکار', text: 'Fehlen dir die kurzen Gespräche im Büro nicht?', fa: 'دلت برای گفت‌وگوهای کوتاه در دفتر تنگ نمی‌شود؟' },
        { speaker: 'شما', text: 'Manchmal schon, deshalb bin ich montags und donnerstags gern vor Ort.', fa: 'گاهی بله، برای همین دوشنبه‌ها و پنجشنبه‌ها حضوری می‌آیم.' },
      ],
      fr: [
        { speaker: 'همکار', text: 'Comment trouves-tu le télétravail deux jours par semaine ?', fa: 'دورکاری دو روز در هفته برایت چطور است؟' },
        { speaker: 'شما', text: 'J’économise deux heures de trajet et je suis beaucoup plus concentré.', fa: 'دو ساعت در رفت‌وآمد صرفه‌جویی می‌کنم و خیلی متمرکزترم.' },
        { speaker: 'همکار', text: 'Les échanges rapides avec l’équipe ne te manquent pas ?', fa: 'دلت برای گپ‌های سریع با تیم تنگ نمی‌شود؟' },
        { speaker: 'شما', text: 'Un peu, c’est pour ça que je viens au bureau le lundi et le jeudi.', fa: 'کمی، برای همین دوشنبه و پنجشنبه به دفتر می‌آیم.' },
      ],
      es: [
        { speaker: 'همکار', text: '¿Qué tal te va trabajando desde casa dos días a la semana?', fa: 'با دو روز دورکاری در هفته چطور پیش می‌روی؟' },
        { speaker: 'شما', text: 'Ahorro dos horas de viaje y me concentro mucho mejor.', fa: 'دو ساعت در مسیر صرفه‌جویی می‌کنم و خیلی بهتر تمرکز می‌کنم.' },
        { speaker: 'همکار', text: '¿No echas de menos hablar en persona con el equipo?', fa: 'دلت برای صحبت حضوری با تیم تنگ نمی‌شود؟' },
        { speaker: 'شما', text: 'A veces sí, por eso prefiero ir a la oficina los lunes y jueves.', fa: 'گاهی بله، برای همین دوشنبه‌ها و پنجشنبه‌ها به دفتر می‌روم.' },
      ],
      ru: [
        { speaker: 'همکار', text: 'Как тебе́ рабо́та из до́ма два ра́за в неде́лю?', fa: 'دورکاری دو بار در هفته برایت چطور است؟' },
        { speaker: 'شما', text: 'Я эконо́млю два часа́ на доро́ге и рабо́таю гора́здо сосредото́ченнее.', fa: 'دو ساعت در رفت‌وآمد صرفه‌جویی می‌کنم و خیلی متمرکزتر کار می‌کنم.' },
        { speaker: 'همکار', text: 'Не скуча́ешь по живы́м разгово́рам с колле́гами?', fa: 'دلت برای صحبت حضوری با همکاران تنگ نمی‌شود؟' },
        { speaker: 'شما', text: 'Иногда́ да, поэ́тому я с удово́льствием приезжа́ю в о́фис по понеде́льникам и четверга́м.', fa: 'گاهی بله، برای همین دوشنبه‌ها و پنجشنبه‌ها با میل به دفتر می‌آیم.' },
      ],
    },
    // B1-5: Choosing a course
    {
      en: [
        { speaker: 'مشاور', text: 'Are you looking for an evening class or a weekend workshop?', fa: 'دنبال کلاس عصر هستید یا کارگاه آخر هفته؟' },
        { speaker: 'شما', text: 'An evening class suits me better because I work until five.', fa: 'کلاس عصر برایم مناسب‌تر است چون تا ساعت پنج کار می‌کنم.' },
        { speaker: 'مشاور', text: 'We have a small group starting next Tuesday at six thirty.', fa: 'یک گروه کوچک داریم که سه‌شنبهٔ آینده ساعت شش‌ونیم شروع می‌شود.' },
        { speaker: 'شما', text: 'That fits my schedule. Can I attend the first session as a trial?', fa: 'با برنامه‌ام می‌خواند. می‌توانم جلسهٔ اول را آزمایشی شرکت کنم؟' },
      ],
      de: [
        { speaker: 'مشاور', text: 'Suchen Sie einen Abendkurs oder einen Wochenendworkshop?', fa: 'دنبال کلاس عصر هستید یا کارگاه آخر هفته؟' },
        { speaker: 'شما', text: 'Ein Abendkurs passt mir besser, weil ich bis fünf Uhr arbeite.', fa: 'کلاس عصر برایم بهتر است چون تا ساعت پنج کار می‌کنم.' },
        { speaker: 'مشاور', text: 'Nächsten Dienstag um halb sieben startet eine kleine Gruppe.', fa: 'سه‌شنبهٔ آینده ساعت شش‌ونیم یک گروه کوچک شروع می‌شود.' },
        { speaker: 'شما', text: 'Das passt zeitlich gut. Kann ich zuerst eine Probestunde besuchen?', fa: 'از نظر زمان خوب است. می‌توانم اول یک جلسهٔ آزمایشی بیایم؟' },
      ],
      fr: [
        { speaker: 'مشاور', text: 'Vous préférez un cours du soir ou un atelier le week-end ?', fa: 'کلاس عصر را ترجیح می‌دهید یا کارگاه آخر هفته؟' },
        { speaker: 'شما', text: 'Un cours du soir me convient mieux, car je finis le travail à dix-sept heures.', fa: 'کلاس عصر برایم مناسب‌تر است چون ساعت پنج کارم تمام می‌شود.' },
        { speaker: 'مشاور', text: 'Un petit groupe commence mardi prochain à dix-huit heures trente.', fa: 'سه‌شنبهٔ آینده ساعت شش‌ونیم یک گروه کوچک شروع می‌شود.' },
        { speaker: 'شما', text: 'L’horaire est parfait. Puis-je faire un premier cours d’essai ?', fa: 'ساعتش عالی است. می‌توانم جلسهٔ اول را آزمایشی شرکت کنم؟' },
      ],
      es: [
        { speaker: 'مشاور', text: '¿Busca un curso por la tarde o un taller de fin de semana?', fa: 'دنبال کلاس عصر هستید یا کارگاه آخر هفته؟' },
        { speaker: 'شما', text: 'Me conviene más por la tarde porque trabajo hasta las cinco.', fa: 'عصر برایم بهتر است چون تا ساعت پنج کار می‌کنم.' },
        { speaker: 'مشاور', text: 'El próximo martes empieza un grupo reducido a las seis y media.', fa: 'سه‌شنبهٔ آینده ساعت شش‌ونیم یک گروه کوچک شروع می‌شود.' },
        { speaker: 'شما', text: 'Ese horario me va bien. ¿Puedo probar la primera clase?', fa: 'این ساعت برایم خوب است. می‌توانم جلسهٔ اول را آزمایشی شرکت کنم؟' },
      ],
      ru: [
        { speaker: 'مشاور', text: 'Вам удо́бнее вече́рние заня́тия и́ли гру́ппа выходно́го дня?', fa: 'کلاس‌های عصر برایتان راحت‌تر است یا گروه آخر هفته؟' },
        { speaker: 'شما', text: 'Вече́рний курс подхо́дит лу́чше, я рабо́таю до пяти́.', fa: 'دورهٔ عصر بهتر است، چون تا ساعت پنج کار می‌کنم.' },
        { speaker: 'مشاور', text: 'В сле́дующий вто́рник в полседьмо́го начина́ет небольша́я гру́ппа.', fa: 'سه‌شنبهٔ آینده ساعت شش‌ونیم یک گروه کوچک شروع می‌شود.' },
        { speaker: 'شما', text: 'Расписа́ние подхо́дит. Мо́жно прийти́ на пе́рвое про́бное заня́тие?', fa: 'برنامه‌اش مناسب است. می‌توانم برای جلسهٔ اول آزمایشی بیایم؟' },
      ],
    },
    // B1-6: Sleep & screens
    {
      en: [
        { speaker: 'دوست', text: 'You look tired today. Did you stay up late again?', fa: 'امروز خسته به نظر می‌رسی. دوباره تا دیر وقت بیدار ماندی؟' },
        { speaker: 'شما', text: 'Yes, I kept checking messages on my phone past midnight.', fa: 'بله، تا بعد از نیمه‌شب پیام‌های گوشی‌ام را چک می‌کردم.' },
        { speaker: 'دوست', text: 'Leaving the phone outside the bedroom really helped me sleep better.', fa: 'گذاشتن گوشی بیرون از اتاق خواب خیلی به خواب بهتر من کمک کرد.' },
        { speaker: 'شما', text: 'That is smart. I will try reading a paper book before bed tonight.', fa: 'فکر هوشمندانه‌ای است. امشب قبل از خواب کتاب کاغذی می‌خوانم.' },
      ],
      de: [
        { speaker: 'دوست', text: 'Du siehst heute müde aus. Warst du wieder spät wach?', fa: 'امروز خسته به نظر می‌رسی. دوباره تا دیروقت بیدار بودی؟' },
        { speaker: 'شما', text: 'Ja, ich habe nach Mitternacht noch Nachrichten am Handy gelesen.', fa: 'بله، بعد از نیمه‌شب هنوز پیام‌های گوشی را می‌خواندم.' },
        { speaker: 'دوست', text: 'Seit ich das Handy im Wohnzimmer lasse, schlafe ich viel ruhiger.', fa: 'از وقتی گوشی را در اتاق نشیمن می‌گذارم خیلی آرام‌تر می‌خوابم.' },
        { speaker: 'شما', text: 'Gute Idee, heute Abend lese ich lieber ein gedrucktes Buch.', fa: 'فکر خوبی است، امشب ترجیح می‌دهم کتاب کاغذی بخوانم.' },
      ],
      fr: [
        { speaker: 'دوست', text: 'Tu as l’air fatigué aujourd’hui. Tu t’es encore couché tard ?', fa: 'امروز خسته به نظر می‌رسی. باز هم دیر خوابیدی؟' },
        { speaker: 'شما', text: 'Oui, j’ai regardé mes messages sur le téléphone après minuit.', fa: 'بله، بعد از نیمه‌شب پیام‌های گوشی را نگاه می‌کردم.' },
        { speaker: 'دوست', text: 'Laisser le téléphone hors de la chambre m’a vraiment aidé à mieux dormir.', fa: 'گذاشتن گوشی بیرون از اتاق خواب واقعاً به خواب بهترم کمک کرد.' },
        { speaker: 'شما', text: 'C’est malin. Ce soir, je vais plutôt lire un livre papier.', fa: 'کار عاقلانه‌ای است. امشب کتاب کاغذی می‌خوانم.' },
      ],
      es: [
        { speaker: 'دوست', text: 'Pareces cansado hoy. ¿Te acostaste tarde otra vez?', fa: 'امروز خسته به نظر می‌رسی. دوباره دیر خوابیدی؟' },
        { speaker: 'شما', text: 'Sí, estuve mirando mensajes en el móvil pasada la medianoche.', fa: 'بله، تا بعد از نیمه‌شب پیام‌های گوشی را می‌دیدم.' },
        { speaker: 'دوست', text: 'Dejar el teléfono fuera del dormitorio me ayudó mucho a descansar.', fa: 'گذاشتن گوشی بیرون از اتاق خواب خیلی به استراحتم کمک کرد.' },
        { speaker: 'شما', text: 'Tienes razón. Esta noche leeré un libro en papel antes de dormir.', fa: 'حق با توست. امشب قبل از خواب کتاب کاغذی می‌خوانم.' },
      ],
      ru: [
        { speaker: 'دوست', text: 'Ты сего́дня вы́глядишь уста́вшим. Опять по́здно лёг?', fa: 'امروز خسته به نظر می‌رسی. دوباره دیر خوابیدی؟' },
        { speaker: 'شما', text: 'Да, по́сле полу́ночи всё ещё проверя́л сообще́ния в телефо́не.', fa: 'بله، بعد از نیمه‌شب هنوز پیام‌های گوشی را چک می‌کردم.' },
        { speaker: 'دوست', text: 'Я стал оставля́ть телефо́н на ку́хне, и спать ста́ло гора́здо лу́чше.', fa: 'من گوشی را در آشپزخانه می‌گذارم و خوابم خیلی بهتر شده.' },
        { speaker: 'شما', text: 'Хоро́ший сове́т, сего́дня пе́ред сном почита́ю бума́жную кни́гу.', fa: 'پیشنهاد خوبی است، امشب قبل از خواب کتاب کاغذی می‌خوانم.' },
      ],
    },
    // B1-7: Neighborhood recycling
    {
      en: [
        { speaker: 'همسایه', text: 'Did you notice the new recycling bins near the courtyard gate?', fa: 'سطل‌های بازیافت جدید کنار در حیاط را دیدی؟' },
        { speaker: 'شما', text: 'Yes! Separating paper and glass is much easier now.', fa: 'بله! الان جداکردن کاغذ و شیشه خیلی راحت‌تر شده است.' },
        { speaker: 'همسایه', text: 'Do you know which day they collect the plastic bin?', fa: 'می‌دانی کدام روز سطل پلاستیک را خالی می‌کنند؟' },
        { speaker: 'شما', text: 'Every Thursday morning, according to the notice on the wall.', fa: 'طبق اطلاعیهٔ روی دیوار، هر پنجشنبه صبح.' },
      ],
      de: [
        { speaker: 'همسایه', text: 'Hast du die neuen Mülltonnen am Hoftor gesehen?', fa: 'سطل‌های جدید دم در حیاط را دیده‌ای؟' },
        { speaker: 'شما', text: 'Ja! Jetzt kann man Papier und Glas viel leichter trennen.', fa: 'بله! الان جداکردن کاغذ و شیشه خیلی آسان‌تر شده.' },
        { speaker: 'همسایه', text: 'Weißt du, an welchem Tag die gelbe Tonne abgeholt wird?', fa: 'می‌دانی سطل پلاستیک را کدام روز می‌برند؟' },
        { speaker: 'شما', text: 'Jeden Donnerstagmorgen, laut dem Aushang an der Wand.', fa: 'طبق برگهٔ روی دیوار، هر پنجشنبه صبح.' },
      ],
      fr: [
        { speaker: 'همسایه', text: 'Tu as vu les nouvelles poubelles de tri près du portail ?', fa: 'سطل‌های تفکیک زبالهٔ جدید کنار در حیاط را دیدی؟' },
        { speaker: 'شما', text: 'Oui ! C’est beaucoup plus simple maintenant pour le papier et le verre.', fa: 'بله! الان برای کاغذ و شیشه خیلی راحت‌تر شده.' },
        { speaker: 'همسایه', text: 'Tu sais quel jour ils passent pour le plastique ?', fa: 'می‌دانی کدام روز برای پلاستیک می‌آیند؟' },
        { speaker: 'شما', text: 'Tous les jeudis matin, d’après l’affiche dans l’entrée.', fa: 'طبق اطلاعیهٔ ورودی، هر پنجشنبه صبح.' },
      ],
      es: [
        { speaker: 'همسایه', text: '¿Viste los nuevos contenedores de reciclaje junto al portal?', fa: 'سطل‌های بازیافت جدید کنار در ورودی را دیدی؟' },
        { speaker: 'شما', text: '¡Sí! Ahora es mucho más fácil separar el papel y el vidrio.', fa: 'بله! الان جداکردن کاغذ و شیشه خیلی راحت‌تر است.' },
        { speaker: 'همسایه', text: '¿Sabes qué día recogen el contenedor de plástico?', fa: 'می‌دانی کدام روز سطل پلاستیک را جمع می‌کنند؟' },
        { speaker: 'شما', text: 'Todos los jueves por la mañana, según el cartel del edificio.', fa: 'طبق اطلاعیهٔ ساختمان، هر پنجشنبه صبح.' },
      ],
      ru: [
        { speaker: 'همسایه', text: 'Ты ви́дел но́вые контейнеры для сортиро́вки у воро́т?', fa: 'سطل‌های تفکیک جدید کنار در حیاط را دیدی؟' },
        { speaker: 'شما', text: 'Да! Тепе́рь отделя́ть бума́гу и стекло́ гора́здо про́ще.', fa: 'بله! الان جداکردن کاغذ و شیشه خیلی ساده‌تر شده.' },
        { speaker: 'همسایه', text: 'Не зна́ешь, в како́й день забира́ют пла́стик?', fa: 'نمی‌دانی چه روزی پلاستیک‌ها را می‌برند؟' },
        { speaker: 'شما', text: 'Ка́ждый четве́рг у́тром, так на́писано в объявле́нии.', fa: 'هر پنجشنبه صبح، در اطلاعیه این‌طور نوشته است.' },
      ],
    },
    // B1-8: Team deadline
    {
      en: [
        { speaker: 'همکار', text: 'Are we still on track to send the client report on Friday?', fa: 'هنوز طبق برنامه قرار است گزارش مشتری را جمعه بفرستیم؟' },
        { speaker: 'شما', text: 'Almost, though I am still waiting for the final sales numbers.', fa: 'تقریباً، هرچند هنوز منتظر آمار نهایی فروش هستم.' },
        { speaker: 'همکار', text: 'If you send me the draft today, I can check the layout tonight.', fa: 'اگر پیش‌نویس را امروز برایم بفرستی، امشب صفحه‌آرایی را چک می‌کنم.' },
        { speaker: 'شما', text: 'Deal! That will save us a lot of stress on Friday morning.', fa: 'قبول! این‌طوری صبح جمعه کلی از استرسمان کم می‌شود.' },
      ],
      de: [
        { speaker: 'همکار', text: 'Schaffen wir den Bericht für den Kunden bis Freitag?', fa: 'گزارش مشتری را تا جمعه می‌رسانیم؟' },
        { speaker: 'شما', text: 'Fast, aber ich warte noch auf die letzten Verkaufszahlen.', fa: 'تقریباً، ولی هنوز منتظر آمار نهایی فروش هستم.' },
        { speaker: 'همکار', text: 'Wenn du mir heute den Entwurf schickst, prüfe ich das Layout.', fa: 'اگر پیش‌نویس را امروز بفرستی، صفحه‌آرایی را بررسی می‌کنم.' },
        { speaker: 'شما', text: 'Super, das spart uns am Freitagmorgen viel Zeit.', fa: 'عالی است، این‌طوری صبح جمعه خیلی در وقتمان صرفه‌جویی می‌شود.' },
      ],
      fr: [
        { speaker: 'همکار', text: 'On tient toujours le délai de vendredi pour le rapport client ?', fa: 'هنوز به مهلت جمعه برای گزارش مشتری می‌رسیم؟' },
        { speaker: 'شما', text: 'Presque, j’attends juste les derniers chiffres de vente.', fa: 'تقریباً، فقط منتظر آمار نهایی فروش هستم.' },
        { speaker: 'همکار', text: 'Envoie-moi le brouillon aujourd’hui et je relis la mise en page ce soir.', fa: 'پیش‌نویس را امروز بفرست تا امشب صفحه‌بندی را چک کنم.' },
        { speaker: 'شما', text: 'Parfait, ça nous évitera de courir vendredi matin.', fa: 'عالیه، این‌طوری صبح جمعه عجله نخواهیم داشت.' },
      ],
      es: [
        { speaker: 'همکار', text: '¿Seguimos a tiempo para enviar el informe el viernes?', fa: 'هنوز برای ارسال گزارش در روز جمعه به‌موقع هستیم؟' },
        { speaker: 'شما', text: 'Casi listo, pero aún espero las cifras finales de ventas.', fa: 'تقریباً آماده است، ولی هنوز منتظر آمار نهایی فروش هستم.' },
        { speaker: 'همکار', text: 'Si me mandas el borrador hoy, reviso el formato esta noche.', fa: 'اگر پیش‌نویس را امروز بفرستی، امشب قالبش را چک می‌کنم.' },
        { speaker: 'شما', text: '¡Trato hecho! Así iremos mucho más tranquilos el viernes.', fa: 'قبول! این‌طوری جمعه خیلی با آرامش بیشتری پیش می‌رویم.' },
      ],
      ru: [
        { speaker: 'همکار', text: 'Мы успева́ем отпра́вить отчёт клие́нту в пя́тницу?', fa: 'می‌رسیم گزارش را جمعه برای مشتری بفرستیم؟' },
        { speaker: 'شما', text: 'Почти́, я ещё жду фина́льные ци́фры по прода́жам.', fa: 'تقریباً، هنوز منتظر آمار نهایی فروش هستم.' },
        { speaker: 'همکار', text: 'Пришли́ мне чернови́к сего́дня, а ве́чером я прове́рю оформле́ние.', fa: 'پیش‌نویس را امروز برایم بفرست تا شب صفحه‌بندی‌اش را چک کنم.' },
        { speaker: 'شما', text: 'Договори́лись! В пя́тницу у́тром бу́дет гора́здо споко́йнее.', fa: 'قرار شد! صبح جمعه خیلی آرام‌تر خواهد بود.' },
      ],
    },
    // B1-9: Language exchange
    {
      en: [
        { speaker: 'دوست', text: 'How do you remember new expressions without forgetting them quickly?', fa: 'اصطلاح‌های تازه را چطور یاد می‌گیری که زود یادت نرود؟' },
        { speaker: 'شما', text: 'I use each new phrase in two real sentences right after hearing it.', fa: 'هر عبارت تازه را بلافاصله بعد از شنیدن در دو جملهٔ واقعی به کار می‌برم.' },
        { speaker: 'دوست', text: 'Do you also listen to short podcasts while commuting?', fa: 'توی مسیر پادکست کوتاه هم گوش می‌دهی؟' },
        { speaker: 'شما', text: 'Yes, ten minutes a day on the bus makes a big difference.', fa: 'بله، روزی ده دقیقه در اتوبوس خیلی تفاوت ایجاد می‌کند.' },
      ],
      de: [
        { speaker: 'دوست', text: 'Wie merkst du dir neue Ausdrücke, ohne sie schnell zu vergessen?', fa: 'عبارت‌های تازه را چطور به خاطر می‌سپاری که زود یادت نرود؟' },
        { speaker: 'شما', text: 'Ich bilde sofort nach dem Hören zwei eigene Sätze damit.', fa: 'بلافاصله بعد از شنیدن، دو جملهٔ واقعی با آن می‌سازم.' },
        { speaker: 'دوست', text: 'Hörst du unterwegs auch kurze Podcasts?', fa: 'در مسیر پادکست‌های کوتاه هم گوش می‌دهی؟' },
        { speaker: 'شما', text: 'Ja, zehn Minuten im Bus jeden Tag helfen enorm.', fa: 'بله، هر روز ده دقیقه در اتوبوس خیلی کمک می‌کند.' },
      ],
      fr: [
        { speaker: 'دوست', text: 'Comment retiens-tu les nouvelles expressions sans les oublier vite ?', fa: 'چطور عبارت‌های تازه را نگه می‌داری که زود یادت نرود؟' },
        { speaker: 'شما', text: 'Je réutilise chaque expression dans deux phrases réelles juste après.', fa: 'بلافاصله هر عبارت را در دو جملهٔ واقعی به کار می‌برم.' },
        { speaker: 'دوست', text: 'Tu écoutes aussi de courts podcasts dans les transports ?', fa: 'در مسیر پادکست کوتاه هم گوش می‌دهی؟' },
        { speaker: 'شما', text: 'Oui, dix minutes par jour dans le bus font une vraie différence.', fa: 'بله، روزی ده دقیقه در اتوبوس واقعاً اثر دارد.' },
      ],
      es: [
        { speaker: 'دوست', text: '¿Cómo recuerdas las expresiones nuevas sin olvidarlas rápido?', fa: 'عبارت‌های جدید را چطور یادت نگه می‌داری؟' },
        { speaker: 'شما', text: 'Uso cada frase nueva en dos ejemplos reales nada más escucharla.', fa: 'هر جملهٔ تازه را بلافاصله بعد از شنیدن در دو مثال واقعی به کار می‌برم.' },
        { speaker: 'دوست', text: '¿También escuchas pódcast cortos durante el trayecto?', fa: 'در مسیر هم پادکست کوتاه گوش می‌دهی؟' },
        { speaker: 'شما', text: 'Sí, diez minutos diarios en el autobús se notan muchísimo.', fa: 'بله، روزی ده دقیقه در اتوبوس خیلی محسوس است.' },
      ],
      ru: [
        { speaker: 'دوست', text: 'Как ты запомина́ешь но́вые выраже́ния, что́бы не забыва́ть их?', fa: 'عبارت‌های تازه را چطور به یاد می‌سپاری که فراموش نشوند؟' },
        { speaker: 'شما', text: 'Я сра́зу соста́влю с ка́ждой фра́зой два реа́льных предложе́ния.', fa: 'بلافاصله با هر عبارت دو جملهٔ واقعی می‌سازم.' },
        { speaker: 'دوست', text: 'А в доро́ге ты слу́шаешь коро́ткие подка́сты?', fa: 'در مسیر پادکست‌های کوتاه هم گوش می‌دهی؟' },
        { speaker: 'شما', text: 'Да, да́же де́сять мину́т в авто́бусе даю́т хоро́ший результа́т.', fa: 'بله، حتی ده دقیقه در اتوبوس نتیجهٔ خیلی خوبی می‌دهد.' },
      ],
    },
    // B1-10: Community workshop
    {
      en: [
        { speaker: 'همسایه', text: 'Are you coming to the neighborhood book swap this Sunday?', fa: 'یکشنبه به برنامهٔ مبادلهٔ کتاب محله می‌آیی؟' },
        { speaker: 'شما', text: 'I would love to! Should I bring books in any particular language?', fa: 'با کمال میل! کتاب‌ها را به زبان خاصی بیاورم؟' },
        { speaker: 'همسایه', text: 'Any novels, travel guides, or children’s books are welcome.', fa: 'هر رمان، راهنمای سفر یا کتاب کودک پذیرفته می‌شود.' },
        { speaker: 'شما', text: 'Great, I have three novels I finished recently and want to pass on.', fa: 'عالی است، سه رمان دارم که تازگی خوانده‌ام و می‌خواهم به بقیه بدهم.' },
      ],
      de: [
        { speaker: 'همسایه', text: 'Kommst du am Sonntag zum Büchertausch im Viertel?', fa: 'یکشنبه به مبادلهٔ کتاب محله می‌آیی؟' },
        { speaker: 'شما', text: 'Sehr gern! Welche Bücher kann ich mitbringen?', fa: 'با کمال میل! چه کتاب‌هایی می‌توانم بیاورم؟' },
        { speaker: 'همسایه', text: 'Romane, Reiseführer oder Kinderbücher sind alle willkommen.', fa: 'رمان، راهنمای سفر یا کتاب کودک همه پذیرفته می‌شوند.' },
        { speaker: 'شما', text: 'Prima, ich habe drei Romane, die ich gern weitergebe.', fa: 'عالی است، سه رمان دارم که با میل در اختیار دیگران می‌گذارم.' },
      ],
      fr: [
        { speaker: 'همسایه', text: 'Tu viens à l’échange de livres du quartier dimanche ?', fa: 'یکشنبه به مبادلهٔ کتاب محله می‌آیی؟' },
        { speaker: 'شما', text: 'Avec plaisir ! Quels genres de livres faut-il apporter ?', fa: 'با کمال میل! چه نوع کتاب‌هایی بیاورم؟' },
        { speaker: 'همسایه', text: 'Des romans, des guides de voyage ou des livres pour enfants.', fa: 'رمان، راهنمای سفر یا کتاب کودک.' },
        { speaker: 'شما', text: 'Super, j’ai trois romans déjà lus à partager.', fa: 'عالیه، سه رمان خوانده‌شده برای اشتراک‌گذاری دارم.' },
      ],
      es: [
        { speaker: 'همسایه', text: '¿Vas a venir al intercambio de libros del barrio el domingo?', fa: 'یکشنبه به مبادلهٔ کتاب محله می‌آیی؟' },
        { speaker: 'شما', text: '¡Me encantaría! ¿Qué tipo de libros puedo llevar?', fa: 'خیلی دوست دارم! چه کتاب‌هایی می‌توانم ببرم؟' },
        { speaker: 'همسایه', text: 'Cualquier novela, guía de viaje o libro infantil viene bien.', fa: 'هر رمان، راهنمای سفر یا کتاب کودک خوب است.' },
        { speaker: 'شما', text: 'Genial, tengo tres novelas que ya terminé y quiero compartir.', fa: 'عالی است، سه رمان دارم که تمام کرده‌ام و می‌خواهم به اشتراک بگذارم.' },
      ],
      ru: [
        { speaker: 'همسایه', text: 'Ты придёшь в воскресе́нье на кни́жный обме́н в на́шем райо́не?', fa: 'یکشنبه به مبادلهٔ کتاب محله می‌آیی؟' },
        { speaker: 'شما', text: 'С удово́льствием! Каки́е кни́ги лу́чше принести́?', fa: 'با کمال میل! چه کتاب‌هایی بهتر است بیاورم؟' },
        { speaker: 'همسایه', text: 'Подойду́т любые рома́ны, путеводи́тели и́ли де́тские кни́ги.', fa: 'هر رمان، راهنمای سفر یا کتاب کودک مناسب است.' },
        { speaker: 'شما', text: 'Отли́чно, у меня́ как раз есть три прочи́танных рома́на.', fa: 'عالیه، دقیقاً سه رمان خوانده‌شده دارم.' },
      ],
    },
    // B1-11: Returning wrong delivery
    {
      en: [
        { speaker: 'شما', text: 'Hello, I received my online order today, but one item is missing.', fa: 'سلام، سفارش اینترنتی‌ام امروز رسید، ولی یک قلم از آن کم است.' },
        { speaker: 'پشتیبانی', text: 'I am sorry about that. Could you share your order number?', fa: 'بابت این موضوع متأسفم. می‌توانید شمارهٔ سفارشتان را بفرمایید؟' },
        { speaker: 'شما', text: 'Sure, it is four-eight-two. The box only had the charger, not the case.', fa: 'حتماً، چهارصد و هشتاد و دو است. داخل جعبه فقط شارژر بود، قاب نبود.' },
        { speaker: 'پشتیبانی', text: 'Thank you. We will ship the missing case today at no extra charge.', fa: 'ممنون. قاب جاافتاده را امروز بدون هزینهٔ اضافه ارسال می‌کنیم.' },
      ],
      de: [
        { speaker: 'شما', text: 'Guten Tag, meine Bestellung kam heute an, aber ein Artikel fehlt.', fa: 'سلام، سفارشم امروز رسید، اما یک کالا جا افتاده است.' },
        { speaker: 'پشتیبانی', text: 'Das tut mir leid. Wie lautet Ihre Bestellnummer?', fa: 'متأسفم. شمارهٔ سفارش شما چیست؟' },
        { speaker: 'شما', text: 'Vier-acht-zwei. Im Paket war nur das Kabel, keine Hülle.', fa: 'چهار-هشت-دو. در بسته فقط کابل بود، قاب نبود.' },
        { speaker: 'پشتیبانی', text: 'Danke. Wir schicken die Hülle heute noch kostenlos nach.', fa: 'ممنون. قاب را همین امروز رایگان برایتان می‌فرستیم.' },
      ],
      fr: [
        { speaker: 'شما', text: 'Bonjour, j’ai reçu ma commande aujourd’hui, mais il manque un article.', fa: 'سلام، سفارشم امروز رسید، ولی یک کالا کم است.' },
        { speaker: 'پشتیبانی', text: 'Désolé pour cette erreur. Quel est votre numéro de commande ?', fa: 'بابت این اشتباه متأسفم. شمارهٔ سفارشتان چیست؟' },
        { speaker: 'شما', text: 'C’est le quatre-huit-deux. Il n’y avait que le chargeur, pas la coque.', fa: 'چهار-هشت-دو. فقط شارژر داخل جعبه بود، قاب نبود.' },
        { speaker: 'پشتیبانی', text: 'Merci. Nous envoyons la coque dès aujourd’hui sans frais.', fa: 'ممنون. قاب را همین امروز بدون هزینه ارسال می‌کنیم.' },
      ],
      es: [
        { speaker: 'شما', text: 'Hola, hoy recibí mi pedido, pero falta un artículo en la caja.', fa: 'سلام، امروز سفارشم رسید، ولی یک کالا در جعبه کم است.' },
        { speaker: 'پشتیبانی', text: 'Lo siento mucho. ¿Me dice su número de pedido?', fa: 'خیلی متأسفم. شمارهٔ سفارشتان را می‌فرمایید؟' },
        { speaker: 'شما', text: 'Es el cuatro-ocho-dos. Solo vino el cargador, sin la funda.', fa: 'چهار-هشت-دو است. فقط شارژر آمده، بدون قاب.' },
        { speaker: 'پشتیبانی', text: 'Gracias. Le enviamos la funda hoy mismo sin coste adicional.', fa: 'ممنون. قاب را همین امروز بدون هزینهٔ اضافه می‌فرستیم.' },
      ],
      ru: [
        { speaker: 'شما', text: 'Здра́вствуйте, сего́дня привезли́ зака́з, но одного́ това́ра не хвата́ет.', fa: 'سلام، امروز سفارش را آوردند، ولی یک کالا کم است.' },
        { speaker: 'پشتیبانی', text: 'Извини́те за оши́бку. Назови́те, пожа́луйста, но́мер зака́за.', fa: 'بابت اشتباه متأسفیم. لطفاً شمارهٔ سفارش را بگویید.' },
        { speaker: 'شما', text: 'Четы́ре-во́семь-два. В коро́бке была́ то́лько заря́дка, без чехла́.', fa: 'چهار-هشت-دو. در جعبه فقط شارژر بود، بدون قاب.' },
        { speaker: 'پشتیبانی', text: 'Спаси́бо. Мы отпра́вим чехо́л сего́дня беспла́тно.', fa: 'ممنون. قاب را امروز رایگان برایتان می‌فرستیم.' },
      ],
    },
  ],
};
