import type { DialogueLine, DialogueMap } from './types';

type TurnSpec = { s?: string; t: string; fa: string };
type TriEntry = { de: TurnSpec[]; fr: TurnSpec[]; es: TurnSpec[] };

export function buildTriMap(entries: Record<string, TriEntry>): DialogueMap {
  const out: DialogueMap = {};
  for (const [slug, langs] of Object.entries(entries)) {
    for (const lang of ['de', 'fr', 'es'] as const) {
      out[`${lang}-${slug}`] = langs[lang].map((turn, idx): DialogueLine => ({
        speaker: turn.s ?? (idx % 2 === 0 ? 'هم‌صحبت' : 'شما'),
        role: idx % 2 === 0 ? 'partner' : 'learner',
        text: turn.t,
        fa: turn.fa,
      }));
    }
  }
  return out;
}

export const STARTER_A1_PART1_DIALOGUES: DialogueMap = buildTriMap({
  'a1-greetings': {
    de: [
      { s: 'هم‌کلاسی', t: 'Guten Morgen! Ich bin Lena. Wie heißt du?', fa: 'صبح بخیر! من لنا هستم. اسم تو چیست؟' },
      { t: 'Guten Morgen! Ich heiße Sara. Schön, dich kennenzulernen.', fa: 'صبح بخیر! اسم من سارا است. از آشنایی با تو خوشحالم.' },
      { s: 'هم‌کلاسی', t: 'Wie geht es dir an deinem ersten Tag?', fa: 'در روز اولت حالت چطور است؟' },
      { t: 'Sehr gut, danke! Bis morgen im Kurs!', fa: 'خیلی خوبم، ممنون! تا فردا در کلاس!' },
    ],
    fr: [
      { s: 'هم‌کلاسی', t: 'Bonjour ! Je m’appelle Léa. Et toi ?', fa: 'روز بخیر! اسم من لئا است. و تو؟' },
      { t: 'Bonjour ! Moi, c’est Sara. Enchantée !', fa: 'روز بخیر! من سارا هستم. خوشبختم!' },
      { s: 'هم‌کلاسی', t: 'Tu vas bien pour ton premier jour ?', fa: 'برای روز اولت خوبی؟' },
      { t: 'Oui, très bien, merci ! À demain en classe !', fa: 'بله، خیلی خوبم، ممنون! تا فردا در کلاس!' },
    ],
    es: [
      { s: 'هم‌کلاسی', t: '¡Buenos días! Soy Lucía. ¿Cómo te llamas?', fa: 'صبح بخیر! من لوسیا هستم. اسمت چیست؟' },
      { t: '¡Hola! Me llamo Sara. Mucho gusto.', fa: 'سلام! اسم من سارا است. خوشبختم.' },
      { s: 'هم‌کلاسی', t: '¿Qué tal tu primer día en el curso?', fa: 'روز اولت در کلاس چطور است؟' },
      { t: 'Muy bien, ¡gracias! ¡Hasta mañana!', fa: 'خیلی خوب، ممنون! تا فردا!' },
    ],
  },
  'a1-profile': {
    de: [
      { t: 'Hallo! Bist du neu hier im Kurs?', fa: 'سلام! اینجا در کلاس تازه‌واردی؟' },
      { t: 'Ja, ich heiße Nima und komme aus dem Iran.', fa: 'بله، اسم من نیما است و اهل ایران هستم.' },
      { t: 'Was machst du beruflich, Nima?', fa: 'شغلت چیست نیما؟' },
      { t: 'Ich bin Ingenieur und lerne hier Deutsch.', fa: 'من مهندس هستم و اینجا آلمانی می‌خوانم.' },
    ],
    fr: [
      { t: 'Bonjour ! Tu es nouveau dans ce groupe ?', fa: 'روز بخیر! در این گروه تازه‌واردی؟' },
      { t: 'Oui, je m’appelle Nima et je viens d’Iran.', fa: 'بله، اسم من نیما است و از ایران می‌آیم.' },
      { t: 'Tu travailles ou tu es étudiant ?', fa: 'کار می‌کنی یا دانشجویی؟' },
      { t: 'Je suis ingénieur et j’habite maintenant à Lyon.', fa: 'مهندسم و الان در لیون زندگی می‌کنم.' },
    ],
    es: [
      { t: '¡Hola! ¿Eres nuevo en esta clase?', fa: 'سلام! در این کلاس تازه‌واردی؟' },
      { t: 'Sí, me llamo Nima y soy de Irán.', fa: 'بله، اسم من نیما است و اهل ایران هستم.' },
      { t: '¿En qué trabajas aquí?', fa: 'اینجا چه کار می‌کنی؟' },
      { t: 'Soy ingeniero y vivo cerca del centro.', fa: 'مهندسم و نزدیک مرکز شهر زندگی می‌کنم.' },
    ],
  },
  'a1-subject-pronouns': {
    de: [
      { t: 'Sind wir heute alle zusammen im Raum drei?', fa: 'امروز همگی با هم در اتاق سه هستیم؟' },
      { t: 'Ja, ich sitze vorn, und du sitzt neben mir.', fa: 'بله، من جلو می‌نشینم و تو کنار من می‌نشینی.' },
      { t: 'Wo ist unsere Lehrerin? Kommt sie gleich?', fa: 'معلم ما کجاست؟ الان می‌آید؟' },
      { t: 'Ja, sie kommt schon, und die anderen warten draußen.', fa: 'بله، الان می‌آید و بقیه بیرون منتظرند.' },
    ],
    fr: [
      { t: 'Nous sommes tous dans la salle trois aujourd’hui ?', fa: 'امروز همه در سالن سه هستیم؟' },
      { t: 'Oui, je m’assieds devant et tu restes à côté de moi.', fa: 'بله، من جلو می‌نشینم و تو کنارم می‌مانی.' },
      { t: 'Où est la professeure ? Elle arrive bientôt ?', fa: 'معلم کجاست؟ زود می‌آید؟' },
      { t: 'Oui, elle arrive, et ils sont déjà prêts.', fa: 'بله، می‌آید، و آن‌ها همین الان آماده‌اند.' },
    ],
    es: [
      { t: '¿Hoy estamos todos en el aula tres?', fa: 'امروز همه در کلاس سه هستیم؟' },
      { t: 'Sí, yo me siento aquí y tú te sientas allí.', fa: 'بله، من اینجا می‌نشینم و تو آنجا می‌نشینی.' },
      { t: '¿Dónde está el profesor? ¿Viene ya?', fa: 'معلم کجاست؟ الان می‌آید؟' },
      { t: 'Sí, él llega ahora y ellos ya tienen el libro.', fa: 'بله، الان می‌رسد و آن‌ها کتاب را دارند.' },
    ],
  },
  'a1-verb-to-be': {
    de: [
      { t: 'Bist du heute schon müde oder noch fit?', fa: 'امروز الان خسته‌ای یا هنوز سرحالی؟' },
      { t: 'Ich bin gar nicht müde; der Kurs ist super.', fa: 'اصلاً خسته نیستم؛ کلاس عالی است.' },
      { t: 'Sind die Aufgaben für heute schwer?', fa: 'تکلیف‌های امروز سخت هستند؟' },
      { t: 'Nein, sie sind leicht und wir sind gut vorbereitet.', fa: 'نه، آسان هستند و ما خوب آماده‌ایم.' },
    ],
    fr: [
      { t: 'Tu es déjà fatigué ou tu es en forme ?', fa: 'الان خسته‌ای یا سرحالی؟' },
      { t: 'Je suis en pleine forme ; la leçon est très claire.', fa: 'کاملاً سرحالم؛ درس خیلی روشن است.' },
      { t: 'Les nouveaux étudiants sont sympathiques ?', fa: 'دانشجویان جدید خوش‌برخوردند؟' },
      { t: 'Oui, ils sont très gentils et notre professeure est patiente.', fa: 'بله، خیلی مهربانند و معلممان صبور است.' },
    ],
    es: [
      { t: '¿Estás cansado hoy o estás animado?', fa: 'امروز خسته‌ای یا سرحالی؟' },
      { t: 'Estoy muy bien; la clase es interesante.', fa: 'خیلی خوبم؛ کلاس جالب است.' },
      { t: '¿Los ejercicios son difíciles?', fa: 'تمرین‌ها سخت هستند؟' },
      { t: 'No, son fáciles y todos estamos contentos.', fa: 'نه، آسانند و همه خوشحالیم.' },
    ],
  },
  'a1-nationalities': {
    de: [
      { t: 'Woher kommst du und welche Sprache sprichst du zu Hause?', fa: 'اهل کجا هستی و در خانه به چه زبانی صحبت می‌کنی؟' },
      { t: 'Ich komme aus dem Iran und spreche Persisch.', fa: 'اهل ایران هستم و فارسی صحبت می‌کنم.' },
      { t: 'Und unsere neue Kollegin — kommt sie aus Spanien?', fa: 'و همکار جدیدمان — اهل اسپانیا است؟' },
      { t: 'Nein, sie ist Französin und wohnt seit Mai in Berlin.', fa: 'نه، فرانسوی است و از ماه مه در برلین زندگی می‌کند.' },
    ],
    fr: [
      { t: 'Tu viens de quel pays et tu parles quelles langues ?', fa: 'اهل کدام کشوری و چه زبان‌هایی صحبت می‌کنی؟' },
      { t: 'Je suis iranien et je parle persan et un peu anglais.', fa: 'من ایرانی هستم و فارسی و کمی انگلیسی صحبت می‌کنم.' },
      { t: 'Et ton ami Marc, il habite à Paris ?', fa: 'و دوستت مارک در پاریس زندگی می‌کند؟' },
      { t: 'Non, il est suisse et il vit à Genève.', fa: 'نه، سوئیسی است و در ژنو زندگی می‌کند.' },
    ],
    es: [
      { t: '¿De dónde eres y qué idioma hablas en casa?', fa: 'اهل کجا هستی و در خانه چه زبانی حرف می‌زنی؟' },
      { t: 'Soy iraní y hablo persa.', fa: 'من ایرانی هستم و فارسی صحبت می‌کنم.' },
      { t: '¿Tu compañera es de México?', fa: 'هم‌کلاسی‌ات اهل مکزیک است؟' },
      { t: 'No, es argentina y ahora vive en Madrid.', fa: 'نه، آرژانتینی است و الان در مادرید زندگی می‌کند.' },
    ],
  },
  'a1-numbers-age': {
    de: [
      { t: 'Wie alt bist du eigentlich, wenn ich fragen darf?', fa: 'راستی چند سالت است، اگر اجازه هست بپرسم؟' },
      { t: 'Ich bin achtundzwanzig Jahre alt. Und wie alt bist du?', fa: 'بیست‌وهشت سال دارم. و تو چند سالت است؟' },
      { t: 'Ich bin dreißig. Wie viele Personen sind in eurer Gruppe?', fa: 'من سی ساله‌ام. در گروه شما چند نفر هستید؟' },
      { t: 'Wir sind zwölf Teilnehmer aus sechs Ländern.', fa: 'ما دوازده شرکت‌کننده از شش کشور هستیم.' },
    ],
    fr: [
      { t: 'Tu as quel âge, si ce n’est pas indiscret ?', fa: 'چند سالت است، اگر فضولی نباشد؟' },
      { t: 'J’ai vingt-huit ans. Et toi, quel âge as-tu ?', fa: 'بیست‌وهشت سال دارم. و تو چند سالت است؟' },
      { t: 'J’ai trente ans. Il y a combien d’élèves dans ta classe ?', fa: 'سی سال دارم. در کلاستان چند شاگرد است؟' },
      { t: 'Nous sommes douze au total.', fa: 'جمعاً دوازده نفر هستیم.' },
    ],
    es: [
      { t: '¿Cuántos años tienes, si puedo preguntar?', fa: 'چند سالت است، اگر می‌شود بپرسم؟' },
      { t: 'Tengo veintiocho años. ¿Y tú cuántos tienes?', fa: 'بیست‌وهشت سال دارم. و تو چند سال داری؟' },
      { t: 'Yo tengo treinta. ¿Cuántas personas hay en tu clase?', fa: 'من سی سال دارم. در کلاستان چند نفر هستید؟' },
      { t: 'Somos doce estudiantes en total.', fa: 'در کل دوازده دانشجو هستیم.' },
    ],
  },
  'a1-family': {
    de: [
      { t: 'Hast du hier in Deutschland auch Familie?', fa: 'اینجا در آلمان هم خانواده داری؟' },
      { t: 'Meine Eltern leben im Iran, aber meine Schwester wohnt hier.', fa: 'والدینم در ایران زندگی می‌کنند، اما خواهرم اینجاست.' },
      { t: 'Bist du verheiratet oder hast du Kinder?', fa: 'متأهلی یا فرزند داری؟' },
      { t: 'Ich bin verheiratet und wir haben einen kleinen Sohn.', fa: 'متأهلم و یک پسر کوچک داریم.' },
    ],
    fr: [
      { t: 'Ta famille habite près d’ici ?', fa: 'خانواده‌ات نزدیک اینجا زندگی می‌کنند؟' },
      { t: 'Mes parents vivent en Iran, mais ma sœur travaille ici.', fa: 'پدر و مادرم در ایران زندگی می‌کنند، ولی خواهرم اینجا کار می‌کند.' },
      { t: 'Tu as des enfants ?', fa: 'فرزند داری؟' },
      { t: 'Oui, j’ai une fille de cinq ans et un petit frère.', fa: 'بله، یک دختر پنج‌ساله و یک برادر کوچک دارم.' },
    ],
    es: [
      { t: '¿Tu familia vive también en esta ciudad?', fa: 'خانواده‌ات هم در این شهر زندگی می‌کنند؟' },
      { t: 'Mis padres viven en Irán, pero mi hermana vive aquí.', fa: 'والدینم در ایران زندگی می‌کنند، ولی خواهرم اینجاست.' },
      { t: '¿Tienes hijos o sobrinos?', fa: 'فرزند یا خواهرزاده/برادرزاده داری؟' },
      { t: 'Sí, tengo una hija pequeña y dos primos.', fa: 'بله، یک دختر کوچک و دو پسرخاله دارم.' },
    ],
  },
  'a1-possessives': {
    de: [
      { t: 'Ist das mein Stift oder gehört er unserem Lehrer?', fa: 'این خودکار من است یا مال معلممان است؟' },
      { t: 'Das ist sein Stift; dein Stift liegt neben deinem Heft.', fa: 'آن خودکار اوست؛ خودکار تو کنار دفترت افتاده است.' },
      { t: 'Und wem gehört diese braune Tasche?', fa: 'و این کیف قهوه‌ای مال کیست؟' },
      { t: 'Das ist meine Tasche! Danke für deine Hilfe.', fa: 'این کیف من است! ممنون بابت کمکت.' },
    ],
    fr: [
      { t: 'C’est mon cahier ou celui de notre professeur ?', fa: 'این دفتر من است یا دفتر معلممان؟' },
      { t: 'C’est son cahier ; le tien est sous ta veste.', fa: 'دفتر اوست؛ مال تو زیر کتت است.' },
      { t: 'Et ces clés, ce sont vos clés ?', fa: 'و این کلیدها، کلیدهای شماست؟' },
      { t: 'Oui, ce sont mes clés ! Merci beaucoup.', fa: 'بله، کلیدهای من است! خیلی ممنون.' },
    ],
    es: [
      { t: '¿Este cuaderno es mío o de nuestra profesora?', fa: 'این دفتر مال من است یا معلممان؟' },
      { t: 'Es su cuaderno; el tuyo está encima de tu mochila.', fa: 'دفتر اوست؛ مال تو روی کوله‌پشتی‌ات است.' },
      { t: '¿Y de quién es esta botella azul?', fa: 'و این بطری آبی مال کیست؟' },
      { t: 'Es mi botella, gracias por avisarme.', fa: 'بطری من است، ممنون که گفتی.' },
    ],
  },
  'a1-nouns-gender-plural': {
    de: [
      { t: 'Wie viele Bücher brauchst du für den neuen Kurs?', fa: 'برای کلاس جدید چند تا کتاب لازم داری؟' },
      { t: 'Ich brauche ein Lehrbuch und zwei neue Hefte.', fa: 'یک کتاب درسی و دو دفتر جدید لازم دارم.' },
      { t: 'Sind schon Tische und Stühle im anderen Raum?', fa: 'در اتاق دیگر میز و صندلی هست؟' },
      { t: 'Ja, dort stehen zehn Stühle und fünf große Tische.', fa: 'بله، آنجا ده صندلی و پنج میز بزرگ هست.' },
    ],
    fr: [
      { t: 'Combien de livres as-tu dans ton sac ?', fa: 'چند تا کتاب در کیفت داری؟' },
      { t: 'J’ai un livre de grammaire et deux cahiers.', fa: 'یک کتاب دستور و دو دفتر دارم.' },
      { t: 'Il y a assez de chaises dans la salle ?', fa: 'در سالن صندلی کافی هست؟' },
      { t: 'Oui, il y a dix chaises et quatre grandes tables.', fa: 'بله، ده صندلی و چهار میز بزرگ هست.' },
    ],
    es: [
      { t: '¿Cuántos libros necesitas para la clase?', fa: 'برای کلاس چند تا کتاب نیاز داری؟' },
      { t: 'Necesito un libro y dos cuadernos nuevos.', fa: 'یک کتاب و دو دفتر جدید لازم دارم.' },
      { t: '¿Hay bastantes mesas en el aula?', fa: 'در کلاس میز کافی هست؟' },
      { t: 'Sí, hay cinco mesas y doce sillas.', fa: 'بله، پنج میز و دوازده صندلی هست.' },
    ],
  },
  'a1-demonstratives': {
    de: [
      { t: 'Welches Wörterbuch soll ich kaufen — dieses hier oder jenes dort?', fa: 'کدام فرهنگ لغت را بخرم — این یکی اینجا یا آن یکی آنجا؟' },
      { t: 'Dieses Buch hier ist für Anfänger viel besser.', fa: 'این کتاب اینجا برای مبتدی‌ها خیلی بهتر است.' },
      { t: 'Und sind diese Übungen darin alle mit Lösungen?', fa: 'و این تمرین‌های داخلش همه جواب دارند؟' },
      { t: 'Ja, schau mal auf diese letzte Seite hier.', fa: 'بله، به این صفحهٔ آخر اینجا نگاه کن.' },
    ],
    fr: [
      { t: 'Quel dictionnaire préfères-tu : celui-ci ou celui-là ?', fa: 'کدام فرهنگ لغت را ترجیح می‌دهی: این یکی یا آن یکی؟' },
      { t: 'Ce livre-ci est très clair pour les débutants.', fa: 'این کتاب اینجا برای مبتدی‌ها خیلی روشن است.' },
      { t: 'Et ces exercices sont faciles à comprendre ?', fa: 'و این تمرین‌ها فهمشان آسان است؟' },
      { t: 'Oui, regarde cette page-là avec les exemples.', fa: 'بله، آن صفحه با مثال‌ها را ببین.' },
    ],
    es: [
      { t: '¿Qué diccionario es mejor, este o aquel de allí?', fa: 'کدام فرهنگ لغت بهتر است، این یا آن یکی؟' },
      { t: 'Este libro de aquí es más claro para empezar.', fa: 'این کتاب اینجا برای شروع روشن‌تر است.' },
      { t: '¿Y estos ejercicios tienen respuestas?', fa: 'و این تمرین‌ها پاسخ دارند؟' },
      { t: 'Sí, mira esa página al final.', fa: 'بله، آن صفحهٔ آخر را ببین.' },
    ],
  },
  'a1-descriptions': {
    de: [
      { t: 'Wie sieht deine neue Schule in der Stadt aus?', fa: 'مدرسهٔ جدیدت در شهر چه شکلی است؟' },
      { t: 'Das Gebäude ist modern, sehr hell und hat einen ruhigen Garten.', fa: 'ساختمان مدرن و خیلی روشن است و یک باغ آرام دارد.' },
      { t: 'Und wie ist dein Kursraum im zweiten Stock?', fa: 'و کلاس درست در طبقهٔ دوم چطور است؟' },
      { t: 'Er ist groß, sauber und die Tafel ist ganz neu.', fa: 'بزرگ و تمیز است و تخته کاملاً نو است.' },
    ],
    fr: [
      { t: 'Comment est ton nouveau quartier ?', fa: 'محلهٔ جدیدت چطور است؟' },
      { t: 'Il est calme, propre et très agréable le matin.', fa: 'آرام، تمیز و صبح‌ها خیلی دلپذیر است.' },
      { t: 'Et ta salle de classe est grande ?', fa: 'و کلاس درست بزرگ است؟' },
      { t: 'Oui, elle est lumineuse avec de grandes fenêtres.', fa: 'بله، پرنور است و پنجره‌های بزرگی دارد.' },
    ],
    es: [
      { t: '¿Cómo es tu nueva escuela en el centro?', fa: 'مدرسهٔ جدیدت در مرکز شهر چطور است؟' },
      { t: 'Es moderna, muy luminosa y bastante tranquila.', fa: 'مدرن، خیلی پرنور و کاملاً آرام است.' },
      { t: '¿Y tu profesor cómo es?', fa: 'و معلمت چطور است؟' },
      { t: 'Es simpático, paciente y explica muy claro.', fa: 'خوش‌برخورد و صبور است و خیلی روشن توضیح می‌دهد.' },
    ],
  },
  'a1-colors': {
    de: [
      { t: 'Welche Farbe hat dein neuer Rucksack?', fa: 'کوله‌پشتی جدیدت چه رنگی است؟' },
      { t: 'Er ist dunkelgrün mit einer grauen Tasche vorn.', fa: 'سبز تیره با یک جیب خاکستری در جلو است.' },
      { t: 'Und möchtest du den roten oder den weißen Ordner?', fa: 'و زونکن قرمز را می‌خواهی یا سفید را؟' },
      { t: 'Ich nehme den weißen Ordner, bitte.', fa: 'زونکن سفید را برمی‌دارم، لطفاً.' },
    ],
    fr: [
      { t: 'De quelle couleur est ton nouveau sac à dos ?', fa: 'کوله‌پشتی جدیدت چه رنگی است؟' },
      { t: 'Il est vert foncé avec une poche grise.', fa: 'سبز تیره با یک جیب خاکستری است.' },
      { t: 'Tu préfères le classeur rouge ou le blanc ?', fa: 'پوشهٔ قرمز را ترجیح می‌دهی یا سفید؟' },
      { t: 'Je prends le classeur blanc, merci.', fa: 'پوشهٔ سفید را می‌گیرم، ممنون.' },
    ],
    es: [
      { t: '¿De qué color es tu mochila nueva?', fa: 'کوله‌پشتی جدیدت چه رنگی است؟' },
      { t: 'Es verde oscuro y tiene un bolsillo gris.', fa: 'سبز تیره است و یک جیب خاکستری دارد.' },
      { t: '¿Prefieres el cuaderno rojo o el amarillo?', fa: 'دفتر قرمز را ترجیح می‌دهی یا زرد را؟' },
      { t: 'Prefiero el rojo, por favor.', fa: 'قرمز را ترجیح می‌دهم، لطفاً.' },
    ],
  },
  'a1-articles': {
    de: [
      { t: 'Suchst du ein bestimmtes Buch in der Bibliothek?', fa: 'در کتابخانه دنبال کتاب خاصی می‌گردی؟' },
      { t: 'Ja, ich suche ein Wörterbuch und die Zeitung von heute.', fa: 'بله، دنبال یک فرهنگ لغت و روزنامهٔ امروز می‌گردم.' },
      { t: 'Dort drüben steht ein großer Tisch. Liegt die Zeitung vielleicht dort?', fa: 'آنجا یک میز بزرگ هست. شاید روزنامه آنجاست؟' },
      { t: 'Ja, genau! Und ein Stift liegt auch daneben.', fa: 'بله، دقیقاً! و یک خودکار هم کنارش افتاده.' },
    ],
    fr: [
      { t: 'Tu cherches un livre précis à la bibliothèque ?', fa: 'در کتابخانه دنبال کتاب خاصی می‌گردی؟' },
      { t: 'Oui, je cherche un dictionnaire et le journal d’aujourd’hui.', fa: 'بله، دنبال یک فرهنگ لغت و روزنامهٔ امروز هستم.' },
      { t: 'Regarde sur la table près de la fenêtre.', fa: 'روی میز کنار پنجره را نگاه کن.' },
      { t: 'Ah oui, voilà le journal et un cahier libre.', fa: 'آه بله، این روزنامه و یک دفتر خالی.' },
    ],
    es: [
      { t: '¿Buscas un libro en especial en la biblioteca?', fa: 'در کتابخانه دنبال کتاب خاصی می‌گردی؟' },
      { t: 'Sí, busco un diccionario y el periódico de hoy.', fa: 'بله، دنبال یک فرهنگ لغت و روزنامهٔ امروز هستم.' },
      { t: 'Mira en la mesa grande junto a la puerta.', fa: 'روی میز بزرگ کنار در را ببین.' },
      { t: '¡Ahí está el periódico y una silla libre!', fa: 'روزنامه آنجاست و یک صندلی خالی هم هست!' },
    ],
  },
  'a1-simple-verbs': {
    de: [
      { t: 'Was machst du heute Abend nach dem Unterricht?', fa: 'امشب بعد از کلاس چه کار می‌کنی؟' },
      { t: 'Ich koche zuerst etwas Warmes und lese dann ein Kapitel.', fa: 'اول یک غذای گرم می‌پزم و بعد یک فصل می‌خوانم.' },
      { t: 'Hörst du beim Lernen auch Musik?', fa: 'موقع درس خواندن موسیقی هم گوش می‌دهی؟' },
      { t: 'Nein, ich schreibe lieber ganz ruhig meine Notizen.', fa: 'نه، ترجیح می‌دهم در سکوت یادداشت‌هایم را بنویسم.' },
    ],
    fr: [
      { t: 'Que fais-tu ce soir après les cours ?', fa: 'امشب بعد از کلاس چه کار می‌کنی؟' },
      { t: 'Je prépare le dîner, puis je lis un chapitre.', fa: 'شام را آماده می‌کنم و بعد یک فصل می‌خوانم.' },
      { t: 'Tu écoutes de la musique en étudiant ?', fa: 'موقع مطالعه موسیقی گوش می‌دهی؟' },
      { t: 'Non, je préfère travailler dans le calme.', fa: 'نه، ترجیح می‌دهم در آرامش کار کنم.' },
    ],
    es: [
      { t: '¿Qué haces esta noche después de clase?', fa: 'امشب بعد از کلاس چه کار می‌کنی؟' },
      { t: 'Primero cocino algo ligero y luego leo un poco.', fa: 'اول یک چیز سبک می‌پزم و بعد کمی می‌خوانم.' },
      { t: '¿Escuchas música mientras estudias?', fa: 'وقتی درس می‌خوانی موسیقی گوش می‌دهی؟' },
      { t: 'No, prefiero escribir mis notas en silencio.', fa: 'نه، ترجیح می‌دهم یادداشت‌هایم را در سکوت بنویسم.' },
    ],
  },
  'a1-present-tense': {
    de: [
      { t: 'Arbeitest du jeden Tag im Büro oder auch von zu Hause?', fa: 'هر روز در دفتر کار می‌کنی یا از خانه هم؟' },
      { t: 'Montags und mittwochs arbeite ich im Büro; sonst bleibe ich zu Hause.', fa: 'دوشنبه و چهارشنبه در دفتر کار می‌کنم؛ بقیهٔ روزها خانه می‌مانم.' },
      { t: 'Sprichst du bei der Arbeit schon oft Deutsch?', fa: 'سر کار از الان زیاد آلمانی صحبت می‌کنی؟' },
      { t: 'Ja, ich übe jeden Tag ein bisschen mit meinen Kollegen.', fa: 'بله، هر روز کمی با همکارانم تمرین می‌کنم.' },
    ],
    fr: [
      { t: 'Tu travailles au bureau tous les jours ?', fa: 'هر روز در دفتر کار می‌کنی؟' },
      { t: 'J’y vais trois jours par semaine ; le reste du temps, je reste chez moi.', fa: 'سه روز در هفته می‌روم؛ بقیهٔ وقت خانه می‌مانم.' },
      { t: 'Tu parles français avec tes collègues ?', fa: 'با همکارانت فرانسوی صحبت می‌کنی؟' },
      { t: 'Oui, nous discutons ensemble pendant la pause café.', fa: 'بله، وقت استراحت قهوه با هم گپ می‌زنیم.' },
    ],
    es: [
      { t: '¿Trabajas en la oficina todos los días?', fa: 'هر روز در دفتر کار می‌کنی؟' },
      { t: 'Voy tres días por semana y dos días trabajo desde casa.', fa: 'سه روز در هفته می‌روم و دو روز از خانه کار می‌کنم.' },
      { t: '¿Hablas español con tus compañeros?', fa: 'با همکارانت اسپانیایی صحبت می‌کنی؟' },
      { t: 'Sí, practicamos un poco cada mañana.', fa: 'بله، هر صبح کمی تمرین می‌کنیم.' },
    ],
  },
  'a1-verb-conjugation': {
    de: [
      { t: 'Wann fängt heute euer Kurs an?', fa: 'امروز کلاستان چه ساعتی شروع می‌شود؟' },
      { t: 'Er fängt um neun an, und wir lernen bis zwölf.', fa: 'ساعت نه شروع می‌شود و تا دوازده درس می‌خوانیم.' },
      { t: 'Was liest du gerade in der Pause?', fa: 'در زمان استراحت الان چه می‌خوانی؟' },
      { t: 'Ich lese eine kurze Geschichte, und meine Freunde trinken Tee.', fa: 'یک داستان کوتاه می‌خوانم و دوستانم چای می‌نوشند.' },
    ],
    fr: [
      { t: 'À quelle heure commence ton cours aujourd’hui ?', fa: 'امروز کلاست ساعت چند شروع می‌شود؟' },
      { t: 'Il commence à neuf heures et nous finissons à midi.', fa: 'ساعت نه شروع می‌شود و ظهر تمام می‌کنیم.' },
      { t: 'Qu’est-ce que tu fais pendant la pause ?', fa: 'وقت استراحت چه کار می‌کنی؟' },
      { t: 'Je lis un texte court et mes amis prennent un café.', fa: 'یک متن کوتاه می‌خوانم و دوستانم قهوه می‌خورند.' },
    ],
    es: [
      { t: '¿A qué hora empieza tu clase hoy?', fa: 'امروز کلاست ساعت چند شروع می‌شود؟' },
      { t: 'Empieza a las nueve y terminamos al mediodía.', fa: 'ساعت نه شروع می‌شود و ظهر تمام می‌کنیم.' },
      { t: '¿Qué hacéis en el descanso?', fa: 'در استراحت چه کار می‌کنید؟' },
      { t: 'Yo leo un texto y mis amigos toman café.', fa: 'من یک متن می‌خوانم و دوستانم قهوه می‌خورند.' },
    ],
  },
  'a1-positive-negative-questions': {
    de: [
      { t: 'Hast du das neue Arbeitsbuch schon dabei?', fa: 'کتاب کار جدید را همراهت آورده‌ای؟' },
      { t: 'Nein, ich habe es heute nicht dabei; ich bringe es morgen mit.', fa: 'نه، امروز همراهم نیست؛ فردا می‌آورمش.' },
      { t: 'Kommst du heute Nachmittag zur Lerngruppe?', fa: 'امروز بعدازظهر به گروه مطالعه می‌آیی؟' },
      { t: 'Ja, klar! Ich habe um vier Uhr keinen anderen Termin.', fa: 'بله، حتماً! ساعت چهار هیچ قرار دیگری ندارم.' },
    ],
    fr: [
      { t: 'Tu as apporté le nouveau cahier d’exercices ?', fa: 'دفتر تمرین جدید را آورده‌ای؟' },
      { t: 'Non, je ne l’ai pas aujourd’hui ; je l’apporte demain.', fa: 'نه، امروز ندارمش؛ فردا می‌آورم.' },
      { t: 'Tu viens à la séance de révision cet après-midi ?', fa: 'امروز بعدازظهر به جلسهٔ مرور می‌آیی؟' },
      { t: 'Oui, volontiers ! Je n’ai pas d’autre rendez-vous.', fa: 'بله، با کمال میل! قرار دیگری ندارم.' },
    ],
    es: [
      { t: '¿Traes hoy el cuaderno nuevo?', fa: 'امروز دفتر جدید را آورده‌ای؟' },
      { t: 'No, hoy no lo traigo; lo traigo mañana sin falta.', fa: 'نه، امروز نیاوردم؛ فردا حتماً می‌آورم.' },
      { t: '¿Vienes esta tarde al grupo de estudio?', fa: 'امروز عصر به گروه مطالعه می‌آیی؟' },
      { t: 'Sí, claro. No tengo otro compromiso hoy.', fa: 'بله، حتماً. امروز برنامهٔ دیگری ندارم.' },
    ],
  },
  'a1-question-words': {
    de: [
      { t: 'Wann und wo findet das Treffen morgen statt?', fa: 'جلسهٔ فردا چه ساعتی و کجا برگزار می‌شود؟' },
      { t: 'Es findet um zehn Uhr im dritten Stock statt.', fa: 'ساعت ده در طبقهٔ سوم برگزار می‌شود.' },
      { t: 'Wer leitet die Gruppe und was sollen wir mitbringen?', fa: 'چه کسی گروه را اداره می‌کند و چه چیزی باید بیاوریم؟' },
      { t: 'Herr Weber leitet sie; bitte bringen Sie nur ein Heft mit.', fa: 'آقای وبر اداره می‌کند؛ لطفاً فقط یک دفتر بیاورید.' },
    ],
    fr: [
      { t: 'Quand et où a lieu la réunion de demain ?', fa: 'جلسهٔ فردا چه زمانی و کجا برگزار می‌شود؟' },
      { t: 'Elle a lieu à dix heures, au troisième étage.', fa: 'ساعت ده در طبقهٔ سوم برگزار می‌شود.' },
      { t: 'Qui anime la séance et que faut-il apporter ?', fa: 'چه کسی جلسه را اداره می‌کند و چه باید بیاوریم؟' },
      { t: 'Monsieur Martin l’anime ; apportez juste un stylo et un cahier.', fa: 'آقای مارتن اداره می‌کند؛ فقط یک خودکار و دفتر بیاورید.' },
    ],
    es: [
      { t: '¿Cuándo y dónde es la reunión de mañana?', fa: 'جلسهٔ فردا کی و کجاست؟' },
      { t: 'Es a las diez en el tercer piso.', fa: 'ساعت ده در طبقهٔ سوم است.' },
      { t: '¿Quién dirige el taller y qué debemos llevar?', fa: 'چه کسی کارگاه را اداره می‌کند و چه باید ببریم؟' },
      { t: 'Lo dirige Marta; solo hay que llevar un cuaderno.', fa: 'مارتا اداره می‌کند؛ فقط باید یک دفتر ببریم.' },
    ],
  },
  'a1-dates-and-time': {
    de: [
      { t: 'Wann hast du diese Woche Zeit für unser Gespräch?', fa: 'این هفته کی برای گفت‌وگوی ما وقت داری؟' },
      { t: 'Am Donnerstag, dem zwölften Mai, um halb vier.', fa: 'پنجشنبه دوازدهم مه، ساعت سه و نیم.' },
      { t: 'Passt dir auch der Freitagvormittag um zehn?', fa: 'صبح جمعه ساعت ده هم برایت مناسب است؟' },
      { t: 'Ja, Freitag um zehn Uhr ist perfekt!', fa: 'بله، جمعه ساعت ده عالی است!' },
    ],
    fr: [
      { t: 'Quand es-tu libre cette semaine pour notre rendez-vous ?', fa: 'این هفته کی برای قرارمان آزادی؟' },
      { t: 'Jeudi douze mai à quinze heures trente.', fa: 'پنجشنبه دوازدهم مه ساعت سه و نیم بعدازظهر.' },
      { t: 'Et vendredi matin à dix heures, ça te va ?', fa: 'و جمعه صبح ساعت ده چطور، مناسبت است؟' },
      { t: 'Oui, vendredi dix heures, c’est parfait !', fa: 'بله، جمعه ساعت ده عالی است!' },
    ],
    es: [
      { t: '¿Cuándo tienes tiempo esta semana para vernos?', fa: 'این هفته کی وقت داری همدیگر را ببینیم؟' },
      { t: 'El jueves doce de mayo a las tres y media.', fa: 'پنجشنبه دوازدهم مه ساعت سه و نیم.' },
      { t: '¿Te viene bien también el viernes por la mañana?', fa: 'جمعه صبح هم برایت خوب است؟' },
      { t: 'Sí, el viernes a las diez me viene perfecto.', fa: 'بله، جمعه ساعت ده کاملاً برایم مناسب است.' },
    ],
  },
  'a1-location': {
    de: [
      { t: 'Entschuldigung, weißt du, wo mein Lehrbuch liegt?', fa: 'ببخشید، می‌دانی کتاب درسی‌ام کجا افتاده؟' },
      { t: 'Es liegt dort auf dem Stuhl, rechts neben der Tür.', fa: 'آنجا روی صندلی، سمت راست کنار در است.' },
      { t: 'Und ist meine Tasche auch hier im Raum?', fa: 'و کیفم هم اینجا در اتاق است؟' },
      { t: 'Ja, sie steht unter dem Fenster.', fa: 'بله، زیر پنجره قرار دارد.' },
    ],
    fr: [
      { t: 'Excuse-moi, tu sais où est mon cahier ?', fa: 'ببخشید، می‌دانی دفترم کجاست؟' },
      { t: 'Il est là-bas sur la chaise, à droite de la porte.', fa: 'آنجا روی صندلی، سمت راست در است.' },
      { t: 'Et mon manteau est aussi dans la salle ?', fa: 'و پالتویم هم در سالن است؟' },
      { t: 'Oui, il est accroché près de la fenêtre.', fa: 'بله، کنار پنجره آویزان است.' },
    ],
    es: [
      { t: 'Perdona, ¿sabes dónde está mi libro?', fa: 'ببخشید، می‌دانی کتابم کجاست؟' },
      { t: 'Está allí, encima de la silla junto a la puerta.', fa: 'آنجا، روی صندلی کنار در است.' },
      { t: '¿Y mi mochila también está dentro?', fa: 'و کوله‌پشتی‌ام هم داخل است؟' },
      { t: 'Sí, está debajo de la ventana.', fa: 'بله، زیر پنجره است.' },
    ],
  },
  'a1-wants-needs': {
    de: [
      { t: 'Was möchtest du heute Nachmittag machen?', fa: 'امروز بعدازظهر چه می‌خواهی انجام بدهی؟' },
      { t: 'Ich möchte zuerst etwas trinken und dann für die Prüfung üben.', fa: 'اول می‌خواهم چیزی بنوشم و بعد برای آزمون تمرین کنم.' },
      { t: 'Brauchst du dafür noch ein ruhiges Zimmer?', fa: 'برایش هنوز یک اتاق آرام لازم داری؟' },
      { t: 'Ja, ich brauche nur einen Tisch und gutes Licht.', fa: 'بله، فقط یک میز و نور خوب لازم دارم.' },
    ],
    fr: [
      { t: 'Qu’est-ce que tu veux faire cet après-midi ?', fa: 'امروز بعدازظهر چه می‌خواهی بکنی؟' },
      { t: 'Je voudrais boire un thé et réviser pour l’examen.', fa: 'می‌خواهم یک چای بنوشم و برای آزمون مرور کنم.' },
      { t: 'De quoi as-tu besoin pour travailler ?', fa: 'برای کار کردن به چه نیاز داری؟' },
      { t: 'J’ai juste besoin d’une table calme.', fa: 'فقط به یک میز آرام نیاز دارم.' },
    ],
    es: [
      { t: '¿Qué quieres hacer esta tarde?', fa: 'امروز عصر چه می‌خواهی بکنی؟' },
      { t: 'Quiero tomar un té y repasar para el examen.', fa: 'می‌خواهم یک چای بخورم و برای امتحان مرور کنم.' },
      { t: '¿Necesitas algo para estudiar?', fa: 'برای درس خواندن چیزی لازم داری؟' },
      { t: 'Solo necesito una mesa tranquila y un lápiz.', fa: 'فقط یک میز آرام و یک مداد لازم دارم.' },
    ],
  },
  'a1-ability': {
    de: [
      { t: 'Kannst du mir kurz bei dieser Übung helfen?', fa: 'می‌توانی در این تمرین کوتاه به من کمک کنی؟' },
      { t: 'Ja, gern! Ich kann dir die Regel einfach erklären.', fa: 'بله، با کمال میل! می‌توانم قاعده را ساده برایت توضیح بدهم.' },
      { t: 'Kannst du auch schon ein bisschen schneller sprechen?', fa: 'می‌توانی از الان کمی سریع‌تر هم صحبت کنی؟' },
      { t: 'Noch nicht so schnell, aber ich kann schon kurze Fragen stellen.', fa: 'هنوز نه خیلی سریع، ولی می‌توانم پرسش‌های کوتاه بپرسم.' },
    ],
    fr: [
      { t: 'Tu peux m’aider avec cet exercice ?', fa: 'می‌توانی در این تمرین به من کمک کنی؟' },
      { t: 'Oui, bien sûr ! Je peux t’expliquer la règle.', fa: 'بله، حتماً! می‌توانم قاعده را توضیح بدهم.' },
      { t: 'Tu sais déjà lire les journaux en français ?', fa: 'از الان می‌توانی روزنامهٔ فرانسوی بخوانی؟' },
      { t: 'Pas encore tout, mais je peux comprendre les titres.', fa: 'هنوز نه همه‌اش، اما تیترها را می‌توانم بفهمم.' },
    ],
    es: [
      { t: '¿Puedes ayudarme con este ejercicio?', fa: 'می‌توانی در این تمرین کمکم کنی؟' },
      { t: 'Sí, claro. Puedo explicarte este ejemplo.', fa: 'بله، حتماً. می‌توانم این مثال را توضیح بدهم.' },
      { t: '¿Sabes hablar otro idioma además del persa?', fa: 'غیر از فارسی زبان دیگری هم بلدی؟' },
      { t: 'Sí, puedo hablar inglés y ahora aprendo español.', fa: 'بله، انگلیسی بلدم و الان اسپانیایی یاد می‌گیرم.' },
    ],
  },
  'a1-prepositions': {
    de: [
      { t: 'Wo liegt denn mein Handy? Ich finde es nicht.', fa: 'راستی گوشی‌ام کجاست؟ پیدایش نمی‌کنم.' },
      { t: 'Schau unter dem Buch oder zwischen den beiden Heften!', fa: 'زیر کتاب یا بین آن دو دفتر را نگاه کن!' },
      { t: 'Ach, da liegt es, direkt vor meiner Tasse!', fa: 'آها، آنجاست، درست جلوی فنجانم!' },
      { t: 'Leg es lieber in deine Tasche, bevor wir gehen.', fa: 'بهتر است قبل از رفتن بگذاری‌اش داخل کیفت.' },
    ],
    fr: [
      { t: 'Où est passé mon téléphone ? Je ne le trouve pas.', fa: 'گوشی‌ام کجا رفته؟ پیدایش نمی‌کنم.' },
      { t: 'Regarde sous le livre ou entre les deux cahiers.', fa: 'زیر کتاب یا بین دو دفتر را نگاه کن.' },
      { t: 'Ah, le voilà, juste devant ma tasse !', fa: 'آها، اینجاست، درست جلوی فنجانم!' },
      { t: 'Mets-le dans ton sac avant de partir.', fa: 'قبل از رفتن بگذارش داخل کیفت.' },
    ],
    es: [
      { t: '¿Dónde está mi teléfono? No lo veo.', fa: 'گوشی‌ام کجاست؟ نمی‌بینمش.' },
      { t: 'Mira debajo del libro o entre los dos cuadernos.', fa: 'زیر کتاب یا بین دو دفتر را ببین.' },
      { t: '¡Aquí está, delante de mi taza!', fa: 'اینجاست، جلوی فنجانم!' },
      { t: 'Guárdalo dentro de tu mochila antes de salir.', fa: 'قبل از بیرون رفتن بگذارش داخل کوله‌ات.' },
    ],
  },
  'a1-daily-routine': {
    de: [
      { t: 'Wann stehst du morgens normalerweise auf?', fa: 'صبح‌ها معمولاً ساعت چند بیدار می‌شوی؟' },
      { t: 'Ich stehe um sieben auf und frühstücke um halb acht.', fa: 'ساعت هفت بیدار می‌شوم و هفت‌ونیم صبحانه می‌خورم.' },
      { t: 'Und was machst du nach der Arbeit am Abend?', fa: 'و عصرها بعد از کار چه کار می‌کنی؟' },
      { t: 'Ich gehe kurz spazieren und lese vor dem Schlafen.', fa: 'کوتاه قدم می‌زنم و پیش از خواب کتاب می‌خوانم.' },
    ],
    fr: [
      { t: 'À quelle heure te lèves-tu le matin d’habitude ?', fa: 'معمولاً صبح‌ها ساعت چند بیدار می‌شوی؟' },
      { t: 'Je me lève à sept heures et je prends mon petit déjeuner.', fa: 'ساعت هفت بیدار می‌شوم و صبحانه‌ام را می‌خورم.' },
      { t: 'Et que fais-tu le soir en rentrant ?', fa: 'و شب هنگام برگشتن به خانه چه کار می‌کنی؟' },
      { t: 'Je cuisine un repas simple et je me repose.', fa: 'یک غذای ساده می‌پزم و استراحت می‌کنم.' },
    ],
    es: [
      { t: '¿A qué hora te levantas normalmente?', fa: 'معمولاً ساعت چند بیدار می‌شوی؟' },
      { t: 'Me levanto a las siete y desayuno a las siete y media.', fa: 'ساعت هفت بیدار می‌شوم و هفت‌ونیم صبحانه می‌خورم.' },
      { t: '¿Y qué haces por la tarde después del trabajo?', fa: 'و عصرها بعد از کار چه کار می‌کنی؟' },
      { t: 'Salgo a caminar un rato y ceno temprano.', fa: 'کمی برای پیاده‌روی بیرون می‌روم و زود شام می‌خورم.' },
    ],
  },
  'a1-connectors': {
    de: [
      { t: 'Trinkst du morgens lieber Kaffee oder Tee?', fa: 'صبح‌ها قهوه بیشتر دوست داری یا چای؟' },
      { t: 'Ich trinke Kaffee, aber am Nachmittag nehme ich Tee.', fa: 'قهوه می‌نوشم، اما بعدازظهر چای می‌گیرم.' },
      { t: 'Kommst du heute mit ins Kino?', fa: 'امروز با ما سینما می‌آیی؟' },
      { t: 'Ich möchte gern mitkommen, denn ich habe heute Abend frei.', fa: 'با کمال میل می‌آیم، چون امشب وقتم آزاد است.' },
    ],
    fr: [
      { t: 'Le matin, tu prends du café ou du thé ?', fa: 'صبح قهوه می‌خوری یا چای؟' },
      { t: 'Je prends du café le matin, mais du thé l’après-midi.', fa: 'صبح قهوه می‌خورم، اما بعدازظهر چای.' },
      { t: 'Tu viens au cinéma avec nous ce soir ?', fa: 'امشب با ما سینما می‌آیی؟' },
      { t: 'Oui, je viens parce que je n’ai pas de travail ce soir.', fa: 'بله، می‌آیم چون امشب کاری ندارم.' },
    ],
    es: [
      { t: '¿Por la mañana prefieres café o té?', fa: 'صبح قهوه ترجیح می‌دهی یا چای؟' },
      { t: 'Tomo café por la mañana, pero por la tarde prefiero té.', fa: 'صبح قهوه می‌نوشم، ولی عصر چای ترجیح می‌دهم.' },
      { t: '¿Vienes hoy al parque con nosotros?', fa: 'امروز با ما به پارک می‌آیی؟' },
      { t: 'Sí, voy porque hoy tengo la tarde libre.', fa: 'بله، می‌آیم چون امروز عصر وقتم آزاد است.' },
    ],
  },
  'a1-social-chat': {
    de: [
      { t: 'Hallo! Gefällt es dir hier auf der Feier?', fa: 'سلام! از این مهمانی خوشت آمده؟' },
      { t: 'Ja, sehr! Die Musik ist angenehm und alle sind freundlich.', fa: 'بله، خیلی! موسیقی دلنشین است و همه خوش‌برخوردند.' },
      { t: 'Wohnst du schon lange in dieser Stadt?', fa: 'مدت زیادی است در این شهر زندگی می‌کنی؟' },
      { t: 'Seit drei Monaten — ich entdecke jeden Tag etwas Neues.', fa: 'سه ماه است — هر روز چیز تازه‌ای کشف می‌کنم.' },
    ],
    fr: [
      { t: 'Salut ! La soirée te plaît ?', fa: 'سلام! مهمانی بهت خوش می‌گذرد؟' },
      { t: 'Oui, beaucoup ! Tout le monde est très accueillant.', fa: 'بله، خیلی! همه خیلی خوش‌برخوردند.' },
      { t: 'Tu habites ici depuis longtemps ?', fa: 'مدت زیادی است اینجا زندگی می‌کنی؟' },
      { t: 'Depuis trois mois seulement, mais j’adore déjà la ville.', fa: 'فقط سه ماه است، ولی از الان عاشق شهر شده‌ام.' },
    ],
    es: [
      { t: '¡Hola! ¿Te está gustando la reunión?', fa: 'سلام! دورهمی خوشت آمده؟' },
      { t: '¡Sí, mucho! La gente es muy amable aquí.', fa: 'بله، خیلی! مردم اینجا خیلی مهربانند.' },
      { t: '¿Llevas mucho tiempo en esta ciudad?', fa: 'مدت زیادی است در این شهر هستی؟' },
      { t: 'Solo tres meses, pero me gusta muchísimo.', fa: 'فقط سه ماه است، ولی خیلی دوستش دارم.' },
    ],
  },
  'a1-shopping-payment': {
    de: [
      { s: 'فروشنده', t: 'Guten Tag! Kann ich Ihnen helfen?', fa: 'روز بخیر! می‌توانم کمکتان کنم؟' },
      { t: 'Ja, bitte. Wie viel kostet dieses blaue Notizbuch?', fa: 'بله، لطفاً. این دفتر آبی چند است؟' },
      { s: 'فروشنده', t: 'Es kostet vier Euro fünfzig. Zahlen Sie bar oder mit Karte?', fa: 'چهار یورو و پنجاه سنت است. نقدی می‌پردازید یا با کارت؟' },
      { t: 'Mit Karte, bitte. Kann ich auch eine Quittung haben?', fa: 'با کارت، لطفاً. می‌توانم رسید هم بگیرم؟' },
    ],
    fr: [
      { s: 'فروشنده', t: 'Bonjour ! Je peux vous renseigner ?', fa: 'روز بخیر! می‌توانم راهنمایی‌تان کنم؟' },
      { t: 'Oui, combien coûte ce cahier bleu, s’il vous plaît ?', fa: 'بله، این دفتر آبی چند است لطفاً؟' },
      { s: 'فروشنده', t: 'Il coûte quatre euros cinquante. Vous payez par carte ?', fa: 'چهار یورو و پنجاه سنت است. با کارت پرداخت می‌کنید؟' },
      { t: 'Oui, par carte. Vous avez un reçu, s’il vous plaît ?', fa: 'بله، با کارت. رسید هم دارید لطفاً؟' },
    ],
    es: [
      { s: 'فروشنده', t: '¡Buenos días! ¿En qué puedo ayudarle?', fa: 'صبح بخیر! چطور می‌توانم کمکتان کنم؟' },
      { t: '¿Cuánto cuesta este cuaderno azul, por favor?', fa: 'این دفتر آبی چند است، لطفاً؟' },
      { s: 'فروشنده', t: 'Cuesta cuatro euros con cincuenta. ¿Paga con tarjeta?', fa: 'چهار یورو و پنجاه سنت است. با کارت می‌پردازید؟' },
      { t: 'Sí, con tarjeta. ¿Me da el recibo, por favor?', fa: 'بله، با کارت. لطفاً رسید هم می‌دهید؟' },
    ],
  },
  'a1-ordering-food': {
    de: [
      { s: 'گارسون', t: 'Hallo! Was möchten Sie heute essen?', fa: 'سلام! امروز چه می‌خواهید میل کنید؟' },
      { t: 'Ich hätte gern ein Käsesandwich und eine Tomatensuppe.', fa: 'یک ساندویچ پنیر و یک سوپ گوجه‌فرنگی می‌خواهم.' },
      { s: 'گارسون', t: 'Möchten Sie auch etwas zu trinken dazu?', fa: 'نوشیدنی هم همراهش میل دارید؟' },
      { t: 'Ja, ein Glas stilles Wasser, bitte.', fa: 'بله، یک لیوان آب بدون گاز، لطفاً.' },
    ],
    fr: [
      { s: 'گارسون', t: 'Bonjour ! Qu’est-ce que vous prenez aujourd’hui ?', fa: 'روز بخیر! امروز چه میل دارید؟' },
      { t: 'Je vais prendre un sandwich au fromage et une soupe.', fa: 'یک ساندویچ پنیر و یک سوپ برمی‌دارم.' },
      { s: 'گارسون', t: 'Et comme boisson, vous désirez quelque chose ?', fa: 'و به‌عنوان نوشیدنی چیزی میل دارید؟' },
      { t: 'Juste un verre d’eau plate, s’il vous plaît.', fa: 'فقط یک لیوان آب ساده، لطفاً.' },
    ],
    es: [
      { s: 'گارسون', t: '¡Hola! ¿Qué va a pedir hoy?', fa: 'سلام! امروز چه سفارش می‌دهید؟' },
      { t: 'Quisiera un bocadillo de queso y una sopa de tomate.', fa: 'یک ساندویچ پنیر و یک سوپ گوجه می‌خواهم.' },
      { s: 'گارسون', t: '¿Quiere algo para beber?', fa: 'نوشیدنی هم می‌خواهید؟' },
      { t: 'Sí, un vaso de agua sin gas, por favor.', fa: 'بله، یک لیوان آب بدون گاز، لطفاً.' },
    ],
  },
});
