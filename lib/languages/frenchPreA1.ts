import type { StarterLesson } from './newCourses';

/**
 * French Pre-A1 — one authored ladder, written as a whole, the same way `germanPreA1.ts` is.
 *
 * Why this file exists: the French beginner band was built from twenty-one separate seed batches. Read
 * as a level it repeated itself (greetings, politeness and «Je m'appelle …» came back in the review
 * lesson), and twenty-nine of its sentences were the very sentences A1 taught again («Comment tu
 * t'appelles ?», «Tu habites où ?», «C'est ma mère.», «Je ne comprends pas.»). A beginner therefore met
 * the same sentence twice, once as Pre-A1 and again as A1.
 *
 * The twenty-one lessons below replace that band with one sequence: contact and goodbye → name and
 * spelling → short answers → politeness and requests → numbers → objects → states → having → needs →
 * family → possessives → description → colours → classroom → origin → home → asking where → café →
 * clock → week → review. Every lesson is a real sentence lesson: eight complete sentences, four
 * alternating dialogue turns, and three checks drawn only from that same lesson. No sentence of this
 * band appears in any A1-or-higher lesson and no sentence appears twice inside the band.
 *
 * The lesson ids (`fr-pre-1` … `fr-pre-21`) and the sentence ids (`fr-preN-sM`) are the ones the level
 * already published, so saved completion, the current lesson and existing review cards keep pointing
 * at the same lesson. Only the content of those slots changed.
 */
type Row = readonly [
  text: string,
  fa: string,
  pronunciation: string,
  word: string,
  meaning: string,
  pattern?: string,
];
type Meta = { title: string; subtitle: string; situation: string; teachingFa: string };

const r = (...row: Row): Row => row;

/** Three checks per lesson, every option taken from the lesson itself (1-based sentence numbers). */
function checks(rows: readonly Row[]) {
  const sentenceAt = (index: number) => rows[index][0];
  const meaningAt = (index: number) => rows[index][1];
  const build = (target: number, meaningFirst: boolean) => {
    const picks = [target, (target + 2) % rows.length, (target + 4) % rows.length, (target + 6) % rows.length];
    const rotated = [...picks.slice(1), picks[0]];
    return {
      promptFa: meaningFirst
        ? `کدام جمله یعنی «${meaningAt(target)}»؟`
        : `«${sentenceAt(target)}» یعنی چه؟`,
      choices: rotated.map(index => (meaningFirst ? sentenceAt(index) : meaningAt(index))),
      correctIndex: rotated.indexOf(target),
      explanationFa: `${sentenceAt(target)} یعنی ${meaningAt(target)}.`,
    };
  };
  return [build(0, true), build(3, false), build(6, true)] as const;
}

function lesson(
  number: number,
  meta: Meta,
  rows: readonly Row[],
  dialogue: readonly [ number, number, number, number ],
): StarterLesson {
  const sentences = rows.map(([text, fa, pronunciation, word, meaning, pattern], index) => ({
    id: `fr-pre${number}-s${index + 1}`,
    text,
    fa,
    pronunciation,
    vocabulary: [{ word, meaning }],
    ...(pattern ? { pattern } : {}),
  }));
  return {
    id: `fr-pre-${number}`,
    levelId: 0,
    order: 0,
    title: meta.title,
    subtitle: meta.subtitle,
    situation: meta.situation,
    teachingFa: meta.teachingFa,
    durationMinutes: 8,
    sentences,
    dialogue: dialogue.map((index, turn) => ({
      speaker: turn % 2 === 1 ? 'همراه' : 'زبان‌آموز',
      text: sentences[index].text,
      fa: sentences[index].fa,
    })),
    checks: checks(rows).map(check => ({ ...check })),
  };
}

export const FRENCH_PRE_A1: readonly StarterLesson[] = [
  lesson(
    1,
    {
      title: 'سلام، احوال و خداحافظی',
      subtitle: 'نخستین برخورد',
      situation: 'با همسایه یا همکاری تازه سلام می‌کنید، احوال می‌پرسید و هنگام رفتن خداحافظی می‌کنید.',
      teachingFa:
        'Bonjour برای روز و Bonsoir برای عصر است؛ Salut دوستانه است و هم برای سلام هم برای خداحافظی به کار می‌رود. «Comment allez-vous ?» رسمی و «Comment vas-tu ?» دوستانه است. آوانویسی فارسی تقریبی است.',
    },
    [
      r('Bonjour Madame, je m’appelle Sara.', 'روز بخیر خانم، اسم من سارا است.', 'بونژور مادام، ژُ مَپِل سارا', 'm’appelle', 'نام دارم', 'Je m’appelle …'),
      r('Salut, comment vas-tu aujourd’hui ?', 'سلام، امروز حالت چطور است؟', 'سَلو، کُمان وا تو اُژوردویی', 'aujourd’hui', 'امروز'),
      r('Je vais très bien, merci.', 'حالم خیلی خوب است، ممنون.', 'ژُ وِه تْرِه بیَن، مِرسی', 'vais', 'می‌روم، حالم'),
      r('Et vous, comment allez-vous ?', 'و شما، حالتان چطور است؟', 'اِ وو، کُمان تاله وو', 'allez', 'می‌روید'),
      r('Bonsoir Monsieur, bonne soirée !', 'عصر بخیر آقا، عصر خوبی داشته باشید!', 'بونسوار مسیو، بُن سواره', 'soirée', 'عصر'),
      r('Au revoir et à demain matin.', 'خداحافظ و تا فردا صبح.', 'اُ رُووار اِ آ دُمَن ماتَن', 'demain', 'فردا'),
      r('Excusez-moi, je dois partir maintenant.', 'ببخشید، الان باید بروم.', 'اِکسکوزه‌موا، ژُ دوا پارتیـر مَنتُنان', 'partir', 'رفتن'),
      r('Merci beaucoup, à bientôt !', 'خیلی ممنون، به‌زودی می‌بینمت!', 'مِرسی بوکو، آ بیَنتو', 'bientôt', 'به‌زودی'),
    ],
    [0, 3, 6, 7],
  ),

  lesson(
    2,
    {
      title: 'نام و املای آن',
      subtitle: 'هجی‌کردن نام',
      situation: 'در دفتر یا کلاس نامتان را می‌پرسند و شما آن را حرف‌به‌حرف می‌گویید.',
      teachingFa:
        'برای پرسش مؤدبانهٔ نام از «Comment vous appelez-vous ?» استفاده می‌شود. «prénom» نام کوچک و «nom» نام خانوادگی است. حرف‌ها را یکی‌یکی و با فاصله بگویید.',
    },
    [
      r('Comment vous appelez-vous, s’il vous plaît ?', 'لطفاً اسم شما چیست؟', 'کُمان وو زاپله وو، سیل وو پِلِه', 'appelez', 'صدا می‌زنید، نامیدن'),
      r('Je m’appelle Ali et je suis iranien.', 'اسم من علی است و ایرانی هستم.', 'ژُ مَپِل علی اِ ژُ سوی ایرانیَن', 'iranien', 'ایرانی'),
      r('Pouvez-vous épeler votre nom ?', 'می‌توانید نامتان را هجی کنید؟', 'پووه-وو اِپله وُتر نون', 'épeler', 'هجی کردن'),
      r('Ça s’écrit A-L-I, trois lettres.', 'این‌طور نوشته می‌شود: آ-ل-ی، سه حرف.', 'سا سِکری آ-ل-ی، تْروا لِتر', 'lettres', 'حروف'),
      r('Mon prénom est Sara, mon nom est Martin.', 'نام کوچک من سارا و نام خانوادگی‌ام مارتین است.', 'مون پرِنوم اِ سارا، مون نون اِ مارتَن', 'prénom', 'نام کوچک'),
      r('Comment ça s’écrit exactement ?', 'دقیقاً چطور نوشته می‌شود؟', 'کُمان سا سِکری اِگزاکتُمَن', 'exactement', 'دقیقاً'),
      r('Excusez-moi, je n’ai pas compris.', 'ببخشید، متوجه نشدم.', 'اِکسکوزه‌موا، ژُ نِ پا کونپری', 'compris', 'فهمیدم'),
      r('Voici mon nom sur cette feuille.', 'این نام من روی این برگه است.', 'وواسی مون نون سور سِت فُی', 'feuille', 'برگه'),
    ],
    [0, 1, 2, 3],
  ),

  lesson(
    3,
    {
      title: 'پاسخ کوتاه',
      subtitle: 'بله، نه و نمی‌فهمم',
      situation: 'به پرسش‌های ساده پاسخ مثبت یا منفی می‌دهید و اگر لازم بود درخواست توضیح می‌کنید.',
      teachingFa:
        'برای منفی‌کردن جمله «ne … pas» دو طرف فعل می‌آید: «je ne suis pas». در گفتار «ne» اغلب کوتاه می‌شود، اما در نوشتار کامل می‌ماند. «un petit peu» یعنی «کمی».',
    },
    [
      r('Est-ce que tu es étudiant ici ?', 'آیا تو اینجا دانشجو هستی؟', 'اِس کِ تو اِ اِتودیان ایسی', 'étudiant', 'دانشجو'),
      r('Oui, je suis étudiant en langues.', 'بله، من دانشجوی زبان هستم.', 'وی، ژُ سوی اِتودیان اَن لانگ', 'langues', 'زبان‌ها'),
      r('Non, je ne suis pas professeur.', 'نه، من معلم نیستم.', 'نون، ژُ نُ سوی پا پروفِسُر', 'professeur', 'معلم'),
      r('Tu comprends la question ?', 'سؤال را می‌فهمی؟', 'تو کونپرُن لا کِستیون', 'question', 'سؤال'),
      r('Oui, un petit peu seulement.', 'بله، فقط کمی.', 'وی، اَن پُتی پُ سولمَن', 'peu', 'کم'),
      r('Je ne comprends pas ce mot.', 'این واژه را نمی‌فهمم.', 'ژُ نُ کونپرُن پا سُ مو', 'mot', 'واژه'),
      r('Ce n’est pas difficile du tout.', 'اصلاً سخت نیست.', 'سُ نِ پا دیفیسیل دو تو', 'difficile', 'سخت'),
      r('D’accord, merci pour l’explication.', 'باشه، ممنون از توضیح.', 'داکور، مِرسی پور لِکسپلیکاسیون', 'explication', 'توضیح'),
    ],
    [2, 0, 4, 6],
  ),

  lesson(
    4,
    {
      title: 'ادب و درخواست',
      subtitle: 'لطفاً، ممنون، ببخشید',
      situation: 'چیزی را مؤدبانه می‌خواهید، تشکر می‌کنید و برای مزاحمت عذرخواهی می‌کنید.',
      teachingFa:
        '«S’il vous plaît» شکل رسمی «لطفاً» است و «s’il te plaît» دوستانه. «Je vous en prie» پاسخ مؤدبانه به تشکر است. برای جلب توجه یا عذرخواهی کوتاه «Excusez-moi» و «Pardon» به کار می‌رود.',
    },
    [
      r('S’il vous plaît, aidez-moi un instant.', 'لطفاً یک لحظه کمکم کنید.', 'سیل وو پِلِه، اِده-موا اَن نِستان', 'aidez', 'کمک کنید'),
      r('Merci pour votre aide précieuse.', 'ممنون از کمک ارزشمندتان.', 'مِرسی پور وُتر اِد پرِسیوز', 'aide', 'کمک'),
      r('Je vous en prie, avec plaisir.', 'خواهش می‌کنم، با میل.', 'ژُ وو زان پری، آوِک پلِزیر', 'plaisir', 'میل، لذت'),
      r('Excusez-moi de vous déranger.', 'ببخشید که مزاحم می‌شوم.', 'اِکسکوزه‌موا دُ وو دِرانژه', 'déranger', 'مزاحم شدن'),
      r('Pardon, je suis un peu en retard.', 'ببخشید، کمی دیر کرده‌ام.', 'پاردون، ژُ سوی اَن پُ اَن رُتار', 'retard', 'تأخیر'),
      r('Ce n’est pas grave, ne vous inquiétez pas.', 'مهم نیست، نگران نباشید.', 'سُ نِ پا گراو، نُ وو زَنکیتِه پا', 'grave', 'مهم'),
      r('Un verre d’eau, s’il vous plaît.', 'یک لیوان آب، لطفاً.', 'اَن وِر دو، سیل وو پِلِه', 'verre', 'لیوان'),
      r('Vous êtes très gentil, merci infiniment.', 'شما خیلی مهربانید، بی‌نهایت ممنون.', 'وو زِت تْرِه ژانتی، مِرسی اَنفینمَن', 'gentil', 'مهربان'),
    ],
    [0, 2, 5, 6],
  ),

  lesson(
    5,
    {
      title: 'عددها',
      subtitle: 'شمارش و عدد در جمله',
      situation: 'عددها را در جمله به کار می‌برید: تعداد، سن، شمارهٔ خانه و قیمت.',
      teachingFa:
        'عددهای یک تا ده را با صدای بلند تکرار کنید. «Il y a» یعنی «وجود دارد» و «Ça coûte» یعنی «قیمتش … است». عددها پیش از اسم معمولاً تغییر نمی‌کنند.',
    },
    [
      r('Un, deux, trois et quatre.', 'یک، دو، سه و چهار.', 'اَن، دو، تْروا اِ کاتر', 'quatre', 'چهار'),
      r('J’ai cinq livres dans mon sac.', 'پنج کتاب در کیفم دارم.', 'ژِ سَنک لیور دان مون ساک', 'cinq', 'پنج'),
      r('Il y a sept jours dans une semaine.', 'هفت روز در یک هفته هست.', 'ایل یا سِت ژور دان یون سُمِن', 'sept', 'هفت'),
      r('Ma sœur a huit ans cette année.', 'خواهرم امسال هشت ساله می‌شود.', 'ما سُر آ ویت اَن سِت آنه', 'huit', 'هشت'),
      r('Le bus numéro dix arrive à neuf heures.', 'اتوبوس شماره ده ساعت نه می‌رسد.', 'لُ بوس نومِرو دیس آریو آ نُف اُر', 'arrive', 'می‌رسد'),
      r('J’habite au numéro douze de cette rue.', 'در شماره دوازده این خیابان زندگی می‌کنم.', 'ژابیت اُ نومِرو دوز دُ سِت رو', 'douze', 'دوازده'),
      r('Ça coûte six euros et vingt centimes.', 'شش یورو و بیست سانتیم هزینه دارد.', 'سا کوت سیس اُرو اِ وَن سانتیـم', 'coûte', 'هزینه دارد'),
      r('Onze et neuf font vingt, c’est facile.', 'یازده و نه می‌شود بیست، آسان است.', 'اُنز اِ نُف فون وَن، سِ فاسیل', 'facile', 'آسان'),
    ],
    [0, 4, 5, 7],
  ),

  lesson(
    6,
    {
      title: 'اشیا و اشاره',
      subtitle: 'این چیست؟',
      situation: 'به اشیای اطراف اشاره می‌کنید، نامشان را می‌پرسید و می‌گویید کجا هستند.',
      teachingFa:
        '«Qu’est-ce que c’est ?» یعنی «این چیست؟» و پاسخ کوتاه آن «C’est …» است. برای چند چیز «Ce sont …» می‌گوییم. حرف تعریف معین (le, la, les) چیز شناخته‌شده را نشان می‌دهد.',
    },
    [
      r('Qu’est-ce que c’est que cet objet ?', 'این شیء چیست؟', 'کِس کُ سِ کُ سِت اُبژه', 'objet', 'شیء'),
      r('C’est une table avec deux chaises.', 'این میزی با دو صندلی است.', 'سِت یون تابْل آوِک دو شِز', 'table', 'میز'),
      r('Voici mon téléphone et mes clés.', 'این تلفن من و کلیدهای من است.', 'وواسی مون تِلِفون اِ مِ کله', 'clés', 'کلیدها'),
      r('Le livre est sur la table de la cuisine.', 'کتاب روی میز آشپزخانه است.', 'لُ لیور اِ سور لا تابْل دُ لا کویزین', 'cuisine', 'آشپزخانه'),
      r('J’ai un stylo bleu dans ma poche.', 'یک خودکار آبی در جیبم دارم.', 'ژِ اَن ستیلو بلُ دان ما پوش', 'poche', 'جیب'),
      r('Ce sont mes lunettes de soleil.', 'این‌ها عینک آفتابی من هستند.', 'سُ سون مِ لونِت دُ سولِی', 'lunettes', 'عینک'),
      r('Où est mon sac à dos ?', 'کیف کوله‌ام کجاست؟', 'او اِ مون ساک آ دو', 'sac', 'کیف'),
      r('Votre billet est dans votre poche.', 'بلیت شما در جیب شماست.', 'وُتر بییه اِ دان وُتر پوش', 'billet', 'بلیت'),
    ],
    [0, 1, 3, 6],
  ),

  lesson(
    7,
    {
      title: 'حال و احساس',
      subtitle: 'خسته، خوشحال، بیمار',
      situation: 'حال خودتان و نزدیکانتان را با صفت‌های ساده بیان می‌کنید.',
      teachingFa:
        '«Je suis» یعنی «من هستم». صفت با جنسیت گوینده هماهنگ می‌شود: مرد «fatigué» و زن «fatiguée» می‌گوید؛ در گفتار هر دو یک‌سان شنیده می‌شوند. «heureux» مذکر و «heureuse» مؤنث است.',
    },
    [
      r('Je suis fatigué après ce voyage.', 'بعد از این سفر خسته‌ام.', 'ژُ سوی فاتیگه آپرِه سُ ووایاژ', 'fatigué', 'خسته'),
      r('Elle est contente de son nouveau travail.', 'او از کار جدیدش راضی است.', 'اِل اِ کونتانْت دُ سون نووُو تْراوای', 'contente', 'راضی، خوشحال'),
      r('Nous sommes prêts pour le cours.', 'ما برای کلاس آماده‌ایم.', 'نو سوم پره پور لُ کور', 'prêts', 'آماده'),
      r('Il est un peu malade ce matin.', 'او امروز صبح کمی بیمار است.', 'ایل اِ اَن پُ مالاد سُ ماتَن', 'malade', 'بیمار'),
      r('Je suis triste de partir si tôt.', 'از رفتن این‌قدر زود غمگینم.', 'ژُ سوی تْریست دُ پارتیـر سی تو', 'triste', 'غمگین'),
      r('Tu es sûr de ta réponse ?', 'از جوابت مطمئنی؟', 'تو اِ سور دُ تا رِپونس', 'sûr', 'مطمئن'),
      r('Ils sont très heureux dans cette ville.', 'آن‌ها در این شهر خیلی خوشحال‌اند.', 'ایل سون تْرِه اُرُو دان سِت ویل', 'heureux', 'خوشحال'),
      r('Je ne suis pas en colère du tout.', 'اصلاً عصبانی نیستم.', 'ژُ نُ سوی پا اَن کولِر دو تو', 'colère', 'عصبانیت'),
    ],
    [0, 3, 6, 2],
  ),

  lesson(
    8,
    {
      title: 'داشتن و نداشتن',
      subtitle: 'چی دارم و چی ندارم',
      situation: 'می‌گویید چه دارید، چه ندارید و از طرف مقابل می‌پرسید.',
      teachingFa:
        '«J’ai» یعنی «دارم» و «Tu as» یعنی «داری». در منفی، حرف تعریف نامعین به «de» تبدیل می‌شود: «Je n’ai pas d’argent». «avoir … ans» برای گفتن سن است.',
    },
    [
      r('J’ai un frère et une sœur aînée.', 'یک برادر و یک خواهر بزرگ‌تر دارم.', 'ژِ اَن فْرِر اِ یون سُر اِنه', 'frère', 'برادر'),
      r('Tu as le temps de m’aider demain ?', 'فردا وقت داری کمکم کنی؟', 'تو آ لُ تان دُ مِده دُمَن', 'temps', 'وقت'),
      r('Elle n’a pas de voiture en ville.', 'او در شهر ماشین ندارد.', 'اِل نا پا دُ وواتور اَن ویل', 'voiture', 'ماشین'),
      r('Nous avons deux enfants à l’école.', 'ما دو فرزند مدرسه‌ای داریم.', 'نو زاوُن دو زانفان آ لِکول', 'enfants', 'فرزندان'),
      r('Il a vingt-cinq ans aujourd’hui.', 'او امروز بیست‌وپنج ساله است.', 'ایل آ وَن-سَنک اَن اُژوردویی', 'ans', 'سال'),
      r('Je n’ai pas d’argent sur moi.', 'پول همراهم ندارم.', 'ژُ نِ پا دارژان سور موا', 'argent', 'پول'),
      r('Vous avez une question à poser ?', 'سؤالی برای پرسیدن دارید؟', 'وو زاوه یون کِستیون آ پوزه', 'poser', 'پرسیدن'),
      r('Ils ont une jolie maison près du parc.', 'آن‌ها خانهٔ قشنگی نزدیک پارک دارند.', 'ایل زون یون ژولی مِزون پرِه دو پارک', 'maison', 'خانه'),
    ],
    [0, 1, 4, 6],
  ),

  lesson(
    9,
    {
      title: 'نیاز و خواستن',
      subtitle: 'به چه چیزی نیاز دارم',
      situation: 'نیازها و خواسته‌های ساده را می‌گویید و مؤدبانه درخواست می‌کنید.',
      teachingFa:
        '«J’ai besoin de …» یعنی «به … نیاز دارم»؛ پس از de حرف تعریف اغلب حذف یا کوتاه می‌شود. «Je voudrais» شکل مؤدبانهٔ «می‌خواهم» است و از «Je veux» نرم‌تر است.',
    },
    [
      r('J’ai besoin d’un médecin ce soir.', 'امشب به پزشک نیاز دارم.', 'ژِ بُزوان دَن مِدسَن سُ سوار', 'médecin', 'پزشک'),
      r('Nous avons besoin de votre aide.', 'ما به کمک شما نیاز داریم.', 'نو زاوُن بُزوان دُ وُتر اِد', 'besoin', 'نیاز'),
      r('Il a besoin d’un billet de train.', 'او به بلیت قطار نیاز دارد.', 'ایل آ بُزوان دَن بییه دُ تْرَن', 'train', 'قطار'),
      r('Tu as besoin de dormir un peu.', 'باید کمی بخوابی.', 'تو آ بُزوان دُ دورمیر اَن پُ', 'dormir', 'خوابیدن'),
      r('Je voudrais un verre de lait, merci.', 'یک لیوان شیر می‌خواهم، ممنون.', 'ژُ وودرِه اَن وِر دُ لِه، مِرسی', 'lait', 'شیر'),
      r('Elle veut acheter du pain ce matin.', 'او امروز صبح می‌خواهد نان بخرد.', 'اِل وُ آشته دُ پَن سُ ماتَن', 'pain', 'نان'),
      r('Je peux payer par carte bancaire ?', 'می‌توانم با کارت بانکی پرداخت کنم؟', 'ژُ پُ پِیه پار کارت بانکِر', 'payer', 'پرداختن'),
      r('Il me faut un plan de la ville.', 'به نقشهٔ شهر نیاز دارم.', 'ایل مُ فوت اَن پلان دُ لا ویل', 'plan', 'نقشه'),
    ],
    [0, 1, 4, 6],
  ),

  lesson(
    10,
    {
      title: 'خانواده و افراد نزدیک',
      subtitle: 'آدم‌های اطراف من',
      situation: 'اعضای خانواده را معرفی می‌کنید و می‌گویید چه می‌کنند و کجا هستند.',
      teachingFa:
        'برای خانواده از «mon père» (پدرم) و «ma mère» (مادرم) استفاده می‌شود؛ حرف تعریف با جنسیت اسم هماهنگ است. «mes» برای جمع است. «grands-parents» یعنی پدربزرگ و مادربزرگ.',
    },
    [
      r('Voici une photo de ma famille.', 'این عکس خانوادهٔ من است.', 'وواسی یون فوتو دُ ما فامیل', 'photo', 'عکس'),
      r('Mon père travaille dans un bureau.', 'پدرم در یک دفتر کار می‌کند.', 'مون پِر تْراوای دان زَن بورو', 'père', 'پدر'),
      r('Ma mère parle allemand et français.', 'مادرم آلمانی و فرانسوی صحبت می‌کند.', 'ما مِر پارل آلمون اِ فرونسِه', 'parle', 'صحبت می‌کند'),
      r('Mon frère habite à Lyon avec sa femme.', 'برادرم با همسرش در لیون زندگی می‌کند.', 'مون فْرِر اَبیت آ لیون آوِک سا فام', 'habite', 'زندگی می‌کند'),
      r('Ma sœur est plus jeune que moi.', 'خواهرم از من جوان‌تر است.', 'ما سُر اِ پلو ژُن کُ موا', 'jeune', 'جوان'),
      r('Mes grands-parents sont à la maison.', 'پدربزرگ و مادربزرگم خانه هستند.', 'مِ گران-پاران سون آ لا مِزون', 'grands-parents', 'پدربزرگ و مادربزرگ'),
      r('Mon oncle a trois enfants déjà grands.', 'عمویم سه فرزند بزرگ دارد.', 'مون اُنکل آ تْروا زانفان دژا گران', 'oncle', 'عمو'),
      r('Ma tante arrive demain après-midi.', 'خاله‌ام فردا بعدازظهر می‌رسد.', 'ما تانت آریو دُمَن آپرِه-میدی', 'tante', 'خاله'),
    ],
    [0, 1, 2, 7],
  ),

  lesson(
    11,
    {
      title: 'ضمیرهای ملکی',
      subtitle: 'مال من، مال تو',
      situation: 'می‌گویید چیزی مال شما، مال مخاطب یا مال دیگری است.',
      teachingFa:
        'mon / ma / mes با اسم همراه می‌شوند و با جنسیت و شمار اسم هماهنگ‌اند، نه با گوینده. ton / ta / tes برای «مال تو» و son / sa / ses برای «مال او» است. notre و votre برای «مال ما/شما» و leur برای «مال آن‌ها» است.',
    },
    [
      r('Mon portable est dans mon sac.', 'گوشی من در کیفم است.', 'مون پُرتابل اِ دان مون ساک', 'portable', 'گوشی'),
      r('Ta veste est sur la chaise.', 'کاپشن تو روی صندلی است.', 'تا وِست اِ سور لا شِز', 'veste', 'کاپشن'),
      r('Son mari travaille dans cet hôpital.', 'همسرش در این بیمارستان کار می‌کند.', 'سون ماری تْراوای دان سِت اُپیتال', 'mari', 'همسر'),
      r('Notre appartement est petit mais calme.', 'آپارتمان ما کوچک اما آرام است.', 'نُتر آپارتمون اِ پُتی مِ کالم', 'appartement', 'آپارتمان'),
      r('Votre chien est très gentil avec les enfants.', 'سگ شما با بچه‌ها خیلی مهربان است.', 'وُتر شیَن اِ تْرِه ژانتی آوِک لِ زانفان', 'chien', 'سگ'),
      r('Leurs enfants vont à l’école à pied.', 'بچه‌های آن‌ها پیاده به مدرسه می‌روند.', 'لُر زانفان وون آ لِکول آ پیه', 'vont', 'می‌روند'),
      r('Mes parents habitent en Iran depuis longtemps.', 'پدر و مادرم مدت زیادی است در ایران زندگی می‌کنند.', 'مِ پاران اَبیت اَن ایران دُپوی لونتان', 'parents', 'پدر و مادر'),
      r('Sa sœur parle espagnol couramment.', 'خواهرش روان اسپانیایی صحبت می‌کند.', 'سا سُر پارل اِسپانیول کورامان', 'couramment', 'روان'),
    ],
    [0, 1, 3, 6],
  ),

  lesson(
    12,
    {
      title: 'توصیف آدم و چیز',
      subtitle: 'بزرگ، کوچک، آرام',
      situation: 'شهر، خانه و آدم‌ها را با صفت‌های ساده توصیف می‌کنید.',
      teachingFa:
        'صفت در فرانسوی معمولاً پس از اسم می‌آید: «une ville grande». برخی صفت‌های کوتاه پیش از اسم می‌آیند، مانند grand و petit. صفت با اسم هماهنگ می‌شود: grand / grande.',
    },
    [
      r('Cette ville est très grande et bruyante.', 'این شهر خیلی بزرگ و شلوغ است.', 'سِت ویل اِ تْرِه گراند اِ برویانت', 'bruyante', 'شلوغ'),
      r('Mon appartement est petit mais lumineux.', 'آپارتمانم کوچک اما روشن است.', 'مون آپارتمون اِ پُتی مِ لومینو', 'lumineux', 'روشن'),
      r('Il est grand et assez mince.', 'او قدبلند و نسبتاً لاغر است.', 'ایل اِ گران اِ اسه مَنس', 'mince', 'لاغر'),
      r('Elle a les cheveux noirs et courts.', 'او موهای سیاه و کوتاه دارد.', 'اِل آ لِ شُوُ نوار اِ کور', 'cheveux', 'مو'),
      r('Ce café est bon et pas cher.', 'این کافه خوب و ارزان است.', 'سُ کافه اِ بون اِ پا شِر', 'cher', 'گران'),
      r('La rue est étroite mais très calme.', 'خیابان باریک اما خیلی آرام است.', 'لا رو اِ اِتروات مِ تْرِه کالم', 'étroite', 'باریک'),
      r('Nous sommes jeunes et dynamiques.', 'ما جوان و پرانرژی هستیم.', 'نو سوم ژُن اِ دینامیک', 'jeunes', 'جوان'),
      r('Ce film est un peu long à mon goût.', 'این فیلم به سلیقهٔ من کمی طولانی است.', 'سُ فیلم اِ اَن پُ لون آ مون گو', 'long', 'طولانی'),
    ],
    [0, 1, 3, 4],
  ),

  lesson(
    13,
    {
      title: 'رنگ‌ها',
      subtitle: 'چه رنگی است؟',
      situation: 'رنگ چیزها و لباس‌ها را می‌گویید.',
      teachingFa:
        'رنگ‌ها صفت‌اند و با اسم هماهنگ می‌شوند: «un ciel bleu»، «une robe verte». برخی رنگ‌ها از اسم گرفته شده‌اند و تغییر نمی‌کنند، مانند orange. برای پرسش «Quelle est la couleur ?» می‌گوییم.',
    },
    [
      r('Ma voiture est rouge et assez vieille.', 'ماشین من قرمز و نسبتاً قدیمی است.', 'ما وواتور اِ روژ اِ اسه ویِی', 'rouge', 'قرمز'),
      r('Le ciel est bleu ce matin.', 'آسمان امروز صبح آبی است.', 'لُ سیِل اِ بلُ سُ ماتَن', 'ciel', 'آسمان'),
      r('Elle porte une robe verte aujourd’hui.', 'او امروز لباس سبز پوشیده است.', 'اِل پورت یون روب وِرت اُژوردویی', 'robe', 'لباس'),
      r('J’aime beaucoup cette couleur jaune.', 'این رنگ زرد را خیلی دوست دارم.', 'ژِم بوکو سِت کولُر ژون', 'couleur', 'رنگ'),
      r('Ses chaussettes sont blanches.', 'جوراب‌هایش سفید هستند.', 'سِ شوست سون بلانش', 'chaussettes', 'جوراب‌ها'),
      r('Le chat noir dort sur le lit.', 'گربهٔ سیاه روی تخت خوابیده است.', 'لُ شا نوار دور سور لُ لی', 'chat', 'گربه'),
      r('Les fleurs du jardin sont roses.', 'گل‌های باغ صورتی هستند.', 'لِ فلُر دو ژاردَن سون روز', 'fleurs', 'گل‌ها'),
      r('Le mur gris est froid en hiver.', 'دیوار خاکستری در زمستان سرد است.', 'لُ مور گری اِ فروا اَن ایوِر', 'mur', 'دیوار'),
    ],
    [1, 3, 4, 6],
  ),

  lesson(
    14,
    {
      title: 'در کلاس درس',
      subtitle: 'گوش کن و تکرار کن',
      situation: 'در کلاس از معلم می‌خواهید آهسته‌تر بگوید و دربارهٔ تکلیف می‌پرسید.',
      teachingFa:
        'فعل‌های دستوری کلاس در حالت امری می‌آیند: «Ouvrez», «Écrivez», «Écoutez». برای درخواست مؤدبانه «Pouvez-vous répéter ?» به کار می‌رود. «Comment dit-on … ?» یعنی «… چه می‌شود؟».',
    },
    [
      r('Ouvrez votre livre à la page dix.', 'کتابتان را صفحهٔ ده باز کنید.', 'اوورِه وُتر لیور آ لا پاژ دیس', 'ouvrez', 'باز کنید'),
      r('Écrivez votre nom en haut de la feuille.', 'نامتان را بالای برگه بنویسید.', 'اِکریوه وُتر نون اَن او دُ لا فُی', 'écrivez', 'بنویسید'),
      r('Écoutez bien et répétez la phrase.', 'خوب گوش کنید و جمله را تکرار کنید.', 'اِکوتِه بیَن اِ رِپِتِه لا فراز', 'répétez', 'تکرار کنید'),
      r('Je ne comprends pas le mot « tableau ».', 'واژهٔ «تابلو» را نمی‌فهمم.', 'ژُ نُ کونپرُن پا لُ مو تابلو', 'tableau', 'تخته'),
      r('Comment dit-on ce mot en français ?', 'این واژه به فرانسوی چه می‌شود؟', 'کُمان دی-تون سُ مو اَن فرونسِه', 'dit-on', 'می‌گویند'),
      r('Le professeur parle lentement et clairement.', 'معلم آهسته و واضح صحبت می‌کند.', 'لُ پروفِسُر پارل لونتُمون اِ کلِرُمون', 'lentement', 'آهسته'),
      r('Travaillez en groupe de deux.', 'در گروه‌های دوتایی کار کنید.', 'تْراوایه اَن گروپ دُ دو', 'groupe', 'گروه'),
      r('Le cours finit à midi pile.', 'کلاس سرِ ظهر تمام می‌شود.', 'لُ کور فینی آ میدی پیل', 'midi', 'ظهر'),
    ],
    [0, 1, 2, 7],
  ),

  lesson(
    15,
    {
      title: 'اصل و ملیت',
      subtitle: 'اهل کجا هستی؟',
      situation: 'دربارهٔ کشور، شهر و زبانی که صحبت می‌کنید گفت‌وگو می‌کنید.',
      teachingFa:
        '«Je viens de …» برای اصل و زادگاه است و «J’habite à …» برای محل زندگی. «Je suis iranien» (مرد) و «Je suis iranienne» (زن) با جنسیت هماهنگ می‌شود. «depuis» یعنی «از … تا حالا».',
    },
    [
      r('Vous venez de quel pays, s’il vous plaît ?', 'لطفاً اهل کدام کشور هستید؟', 'وو وُنه دُ کِل پِی، سیل وو پِلِه', 'pays', 'کشور'),
      r('Je viens d’Iran, de la ville de Téhéran.', 'من اهل ایران، شهر تهران هستم.', 'ژُ ویَن دیران، دُ لا ویل دُ تِهران', 'viens', 'می‌آیم'),
      r('Elle est née en France il y a longtemps.', 'او مدت‌ها پیش در فرانسه به دنیا آمد.', 'اِل اِ نه اَن فرونس ایل یا لونتون', 'née', 'به دنیا آمده'),
      r('Nous habitons ici depuis deux ans.', 'ما دو سال است اینجا زندگی می‌کنیم.', 'نو زابیتون ایسی دُپوی دو زان', 'depuis', 'از'),
      r('Il parle trois langues différentes.', 'او سه زبان مختلف صحبت می‌کند.', 'ایل پارل تْروا لانگ دیفرانت', 'langues', 'زبان‌ها'),
      r('Vous êtes espagnol ou italien ?', 'شما اسپانیایی هستید یا ایتالیایی؟', 'وو زِت اِسپانیول او ایتالیَن', 'ou', 'یا'),
      r('Je suis iranien et je vis en Allemagne.', 'من ایرانی هستم و در آلمان زندگی می‌کنم.', 'ژُ سوی ایرانیَن اِ ژُ وی اَن آلمانی', 'vis', 'زندگی می‌کنم'),
      r('Ma famille vient du sud du pays.', 'خانوادهٔ من از جنوب کشور می‌آید.', 'ما فامیل ویَن دو سود دو پِی', 'sud', 'جنوب'),
    ],
    [0, 3, 4, 6],
  ),

  lesson(
    16,
    {
      title: 'خانه و اتاق‌ها',
      subtitle: 'اجاره و وسایل خانه',
      situation: 'خانه یا آپارتمانی را توصیف می‌کنید و دربارهٔ اجاره و اتاق‌ها می‌پرسید.',
      teachingFa:
        '«Il y a» برای گفتن «وجود دارد» است. اتاق‌ها: «la chambre» اتاق خواب، «la cuisine» آشپزخانه، «la salle de bain» حمام. «le loyer» اجارهٔ ماهانه است.',
    },
    [
      r('Nous cherchons un appartement à louer.', 'ما دنبال آپارتمانی برای اجاره هستیم.', 'نو شِرژون اَن آپارتمون آ لوه', 'cherchons', 'جستجو می‌کنیم'),
      r('Il y a deux chambres et une cuisine.', 'دو اتاق و یک آشپزخانه دارد.', 'ایل یا دو شونبر اِ یون کویزین', 'chambres', 'اتاق‌ها'),
      r('La salle de bain est à gauche.', 'حمام سمت چپ است.', 'لا سال دُ بَن اِ آ گوش', 'salle', 'سالن، اتاق'),
      r('Mon lit est près de la fenêtre.', 'تختم نزدیک پنجره است.', 'مون لی اِ پرِه دُ لا فُنِتر', 'lit', 'تخت'),
      r('Le salon est grand et très clair.', 'پذیرایی بزرگ و خیلی روشن است.', 'لُ سالون اِ گران اِ تْرِه کلِر', 'salon', 'پذیرایی'),
      r('La clé est encore sur la porte.', 'کلید هنوز روی در است.', 'لا کله اِ آنکور سور لا پورت', 'porte', 'در'),
      r('Il n’y a pas de balcon dans cet immeuble.', 'این ساختمان بالکن ندارد.', 'ایل نیا پا دُ بالکون دان سِت ایمُبل', 'immeuble', 'ساختمان'),
      r('Le loyer est de six cents euros par mois.', 'اجاره ماهی ششصد یورو است.', 'لُ لویه اِ دُ سی سان اُرو پار موا', 'loyer', 'اجاره'),
    ],
    [0, 1, 3, 6],
  ),

  lesson(
    17,
    {
      title: 'پرسیدن مکان',
      subtitle: 'کجاست؟',
      situation: 'در شهر جایی را می‌پرسید و پاسخ کوتاه می‌شنوید.',
      teachingFa:
        '«Où est … ?» یعنی «… کجاست؟». «à droite» راست، «à gauche» چپ، «tout droit» مستقیم و «au fond» انتها است. برای فاصله «loin» (دور) و «près» (نزدیک) به کار می‌رود.',
    },
    [
      r('Où est la gare, s’il vous plaît ?', 'لطفاً ایستگاه کجاست؟', 'او اِ لا گار، سیل وو پِلِه', 'gare', 'ایستگاه'),
      r('La banque est à droite de l’église.', 'بانک سمت راست کلیسا است.', 'لا بانک اِ آ دروات دُ لِگلیز', 'banque', 'بانک'),
      r('Les toilettes sont au fond du couloir.', 'سرویس‌ها انتهای راهرو هستند.', 'لِ توالت سون اُ فون دو کولوار', 'toilettes', 'سرویس'),
      r('C’est loin d’ici à pied ?', 'از اینجا پیاده دور است؟', 'سِ لوان دیسی آ پیه', 'loin', 'دور'),
      r('Non, c’est à cinq minutes seulement.', 'نه، فقط پنج دقیقه است.', 'نون، سِ آ سَنک مینوت سولمَن', 'minutes', 'دقیقه‌ها'),
      r('Où puis-je acheter un billet de bus ?', 'کجا می‌توانم بلیت اتوبوس بخرم؟', 'او پویژ آشته اَن بییه دُ بوس', 'acheter', 'خریدن'),
      r('L’arrêt de bus est devant l’hôtel.', 'ایستگاه اتوبوس مقابل هتل است.', 'لاره دُ بوس اِ دُوان لُتِل', 'arrêt', 'ایستگاه'),
      r('Excusez-moi, je cherche le marché couvert.', 'ببخشید، دنبال بازار سرپوشیده می‌گردم.', 'اِکسکوزه‌موا، ژُ شِرژ لُ مارشه کووِر', 'marché', 'بازار'),
    ],
    [0, 1, 4, 6],
  ),

  lesson(
    18,
    {
      title: 'در کافه',
      subtitle: 'سفارش و پرداخت',
      situation: 'در کافه چیزی سفارش می‌دهید، قیمت می‌پرسید و صورتحساب می‌خواهید.',
      teachingFa:
        '«Je voudrais …» درخواست مؤدبانه است. «L’addition» صورتحساب است و «le service compris» یعنی حق سرویس در صورت‌حساب آمده. برای پرسیدن قیمت «C’est combien ?» می‌گوییم.',
    },
    [
      r('Une table pour deux personnes, s’il vous plaît.', 'یک میز برای دو نفر، لطفاً.', 'یون تابْل پور دو پِرسُن، سیل وو پِلِه', 'personnes', 'افراد'),
      r('Je voudrais un café et un croissant.', 'یک قهوه و یک کرواسان می‌خواهم.', 'ژُ وودرِه اَن کافه اِ اَن کرواسون', 'café', 'قهوه'),
      r('Qu’est-ce que vous avez comme thé ?', 'چه چای‌هایی دارید؟', 'کِس کُ وو زاوه کُم ته', 'thé', 'چای'),
      r('L’addition, s’il vous plaît, monsieur.', 'لطفاً صورتحساب، آقا.', 'لادیسیون، سیل وو پِلِه، مسیو', 'addition', 'صورتحساب'),
      r('C’est combien, ce gâteau au chocolat ?', 'این کیک شکلاتی چقدر است؟', 'سِ کومبیَن، سُ گاتو اُ شوکولا', 'gâteau', 'کیک'),
      r('Nous prenons deux jus d’orange frais.', 'ما دو آب‌پرتقال تازه می‌گیریم.', 'نو پرُنون دو ژو دورانژ فرِه', 'jus', 'آبمیوه'),
      r('Est-ce que le service est compris ?', 'آیا حق سرویس حساب شده است؟', 'اِس کُ لُ سِرویس اِ کونپری', 'service', 'سرویس'),
      r('Merci, c’était très bon et pas trop sucré.', 'ممنون، خیلی خوب بود و زیاد شیرین نبود.', 'مِرسی، سِتِه تْرِه بون اِ پا ترو سوکره', 'sucré', 'شیرین'),
    ],
    [0, 1, 3, 6],
  ),

  lesson(
    19,
    {
      title: 'ساعت و زمان',
      subtitle: 'ساعت چند است؟',
      situation: 'ساعت را می‌پرسید و زمان قرار یا حرکت را می‌گویید.',
      teachingFa:
        '«Quelle heure est-il ?» یعنی «ساعت چند است؟». «et demie» نیم، «et quart» ربع و «pile» سرِ ساعت است. برای ساعت‌های بعدازظهر «du soir» می‌گوییم.',
    },
    [
      r('Quelle heure est-il maintenant, s’il vous plaît ?', 'لطفاً الان ساعت چند است؟', 'کِل اُر اِتیل مَنتُنان، سیل وو پِلِه', 'heure', 'ساعت'),
      r('Il est huit heures et demie du matin.', 'ساعت هشت‌و‌نیم صبح است.', 'ایل اِ ویت اُر اِ دُمی دو ماتَن', 'demie', 'نیم'),
      r('Le train part à dix heures précises.', 'قطار ساعت ده دقیق حرکت می‌کند.', 'لُ تْرَن پار آ دیس اُر پرِسیز', 'part', 'حرکت می‌کند'),
      r('J’ai un rendez-vous à midi et quart.', 'ساعت دوازده‌و‌ربع قرار دارم.', 'ژِ اَن رونده-وو آ میدی اِ کار', 'rendez-vous', 'قرار'),
      r('Le magasin ouvre à neuf heures pile.', 'مغازه سرِ ساعت نه باز می‌شود.', 'لُ مگازَن اوور آ نُف اُر پیل', 'magasin', 'مغازه'),
      r('Nous arrivons vers six heures du soir.', 'حدود ساعت شش عصر می‌رسیم.', 'نو زاریوون وِر سیس اُر دو سوار', 'arrivons', 'می‌رسیم'),
      r('Il est déjà trois heures et quart.', 'الان ساعت سه‌و‌ربع است.', 'ایل اِ دژا تْروا زُر اِ کار', 'déjà', 'الان، از قبل'),
      r('Le cours commence dans cinq minutes.', 'کلاس پنج دقیقهٔ دیگر شروع می‌شود.', 'لُ کور کومانس دان سَنک مینوت', 'commence', 'شروع می‌شود'),
    ],
    [0, 1, 3, 6],
  ),

  lesson(
    20,
    {
      title: 'روزهای هفته',
      subtitle: 'امروز و فردا',
      situation: 'روز هفته را می‌گویید و برای روزهای آینده قرار می‌گذارید.',
      teachingFa:
        'نام روزها در فرانسوی با حرف کوچک نوشته می‌شود: lundi, mardi, mercredi… «Aujourd’hui» امروز، «demain» فردا و «la semaine prochaine» هفتهٔ آینده است. «du lundi au vendredi» یعنی از دوشنبه تا جمعه.',
    },
    [
      r('Aujourd’hui, nous sommes mardi matin.', 'امروز سه‌شنبه صبح است.', 'اُژوردویی، نو سوم ماردی ماتَن', 'mardi', 'سه‌شنبه'),
      r('Demain, ce sera mercredi après-midi.', 'فردا بعدازظهر چهارشنبه خواهد بود.', 'دُمَن، سُ سُرا مِرکْرُدی آپرِه-میدی', 'mercredi', 'چهارشنبه'),
      r('Je travaille du lundi au vendredi.', 'من از دوشنبه تا جمعه کار می‌کنم.', 'ژُ تْراوای دو لَندی اُ واندرُدی', 'vendredi', 'جمعه'),
      r('Le samedi, je reste à la maison.', 'شنبه‌ها خانه می‌مانم.', 'لُ سامدی، ژُ رِست آ لا مِزون', 'samedi', 'شنبه'),
      r('Le dimanche, nous visitons mes parents.', 'یکشنبه‌ها به دیدن پدر و مادرم می‌رویم.', 'لُ دیمانش، نو ویزیتون مِ پاران', 'dimanche', 'یکشنبه'),
      r('La semaine prochaine, je pars en voyage.', 'هفتهٔ آینده به سفر می‌روم.', 'لا سُمِن پرُشِن، ژُ پار اَن ووایاژ', 'semaine', 'هفته'),
      r('Quel jour sommes-nous aujourd’hui ?', 'امروز چه روزی است؟', 'کِل ژور سوم-نو اُژوردویی', 'jour', 'روز'),
      r('Rendez-vous lundi prochain à dix heures.', 'قرار دوشنبهٔ آینده ساعت ده.', 'رونده-وو لَندی پرُشَن آ دیس اُر', 'prochain', 'آینده'),
    ],
    [0, 1, 2, 6],
  ),

  lesson(
    21,
    {
      title: 'مرور پایانی',
      subtitle: 'یک برخورد کامل',
      situation: 'در یک برخورد کوتاه خودتان را معرفی می‌کنید، جای زندگی را می‌گویید و درخواست تکرار می‌کنید.',
      teachingFa:
        'این درس همان موقعیت‌های پیشین را در یک گفت‌وگو کنار هم می‌آورد: سلام، نام، محل زندگی، زبان و درخواست تکرار. هیچ جمله‌ای تکراری نیست؛ اگر لازم بود به درس‌های پیش برگردید.',
    },
    [
      r('Bonjour, je m’appelle Nadia et je suis nouvelle.', 'سلام، اسم من نادیا است و تازه‌وارد هستم.', 'بونژور، ژُ مَپِل نادیا اِ ژُ سوی نووِل', 'nouvelle', 'تازه، جدید'),
      r('Enchantée de faire votre connaissance.', 'از آشنایی با شما خوشوقتم.', 'اَنشونته دُ فِر وُتر کونِسُنس', 'connaissance', 'آشنایی'),
      r('Vous habitez où exactement, s’il vous plaît ?', 'لطفاً دقیقاً کجا زندگی می‌کنید؟', 'وو زابیتِه او اِگزاکتُمَن، سیل وو پِلِه', 'habitez', 'زندگی می‌کنید'),
      r('J’habite près du centre-ville avec ma famille.', 'نزدیک مرکز شهر با خانواده‌ام زندگی می‌کنم.', 'ژابیت پرِه دو سونتر-ویل آوِک ما فامیل', 'centre-ville', 'مرکز شهر'),
      r('Je parle persan et un tout petit peu français.', 'من فارسی و کمی، فقط خیلی کم، فرانسوی صحبت می‌کنم.', 'ژُ پارل پِرسان اِ اَن تو پُتی پُ فرونسِه', 'persan', 'فارسی'),
      r('Pouvez-vous répéter plus lentement, s’il vous plaît ?', 'لطفاً آهسته‌تر تکرار می‌کنید؟', 'پووه-وو رِپِته پلو لونتُمون، سیل وو پِلِه', 'répéter', 'تکرار کردن'),
      r('Merci beaucoup pour votre patience.', 'خیلی ممنون از صبر شما.', 'مِرسی بوکو پور وُتر پاسیانس', 'patience', 'صبر'),
      r('Bonne soirée et à la prochaine fois !', 'عصر بخیر و تا دفعهٔ بعد!', 'بُن سواره اِ آ لا پرُشِن فوا', 'prochaine', 'بعدی'),
    ],
    [0, 1, 2, 7],
  ),
];
