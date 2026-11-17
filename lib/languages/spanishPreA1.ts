import type { StarterLesson } from './newCourses';

/**
 * Spanish Pre-A1 — one authored ladder, written as a whole, the same way `germanPreA1.ts` is.
 *
 * Why this file exists: the Spanish beginner band was built from twenty-one seed batches, so the
 * level repeated itself in the review lesson and thirty-nine of its sentences were the same sentences
 * A1 taught again («¿Cómo te llamas?», «Soy de Irán.», «Vivo en Madrid.», «Es mi madre.», «¿Tienes un
 * libro?», «La cuenta, por favor.», «De nada.»). A beginner met them twice: once as Pre-A1, then again
 * as A1.
 *
 * The twenty-one lessons below replace that band with one sequence: contact and goodbye → name and
 * spelling → short answers → politeness and requests → numbers → objects → states → having → needs →
 * family → possessives → description → colours → classroom → origin → home → asking where → café →
 * clock → week → review. Every lesson is a real sentence lesson: eight complete sentences, four
 * alternating dialogue turns, and three checks drawn only from that same lesson. No sentence of this
 * band appears in any A1-or-higher lesson and no sentence appears twice inside the band.
 *
 * The lesson ids (`es-pre-1` … `es-pre-21`) and the sentence ids (`es-preN-sM`) are the ones the level
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
    id: `es-pre${number}-s${index + 1}`,
    text,
    fa,
    pronunciation,
    vocabulary: [{ word, meaning }],
    ...(pattern ? { pattern } : {}),
  }));
  return {
    id: `es-pre-${number}`,
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

export const SPANISH_PRE_A1: readonly StarterLesson[] = [
  lesson(
    1,
    {
      title: 'سلام، احوال و خداحافظی',
      subtitle: 'نخستین برخورد',
      situation: 'با همسایه یا همکاری تازه سلام می‌کنید، احوال می‌پرسید و هنگام رفتن خداحافظی می‌کنید.',
      teachingFa:
        'Buenos días برای صبح، Buenas tardes برای بعدازظهر و Buenas noches برای شب است. «¿Cómo está usted?» رسمی و «¿Qué tal estás?» دوستانه است. در اسپانیا حرف تعریف و صفت با اسم هماهنگ می‌شود.',
    },
    [
      r('Buenos días, señora, me llamo Sara.', 'صبح بخیر خانم، اسم من سارا است.', 'بوئِنوس دیاس، سِنیورا، مِه یامو سارا', 'llamo', 'نام دارم', 'Me llamo …'),
      r('Hola, ¿qué tal estás hoy?', 'سلام، امروز حالت چطور است؟', 'اُلا، کِه تال اِستاس اوی', 'estás', 'هستی'),
      r('Estoy muy bien, muchas gracias.', 'خیلی خوبم، خیلی ممنون.', 'اِستوی موی بیِن، موچاس گراتسیاس', 'estoy', 'هستم'),
      r('¿Y usted, cómo se encuentra?', 'و شما، حالتان چطور است؟', 'ای اوستِد، کومو سِه اِنکوِندرا', 'encuentra', 'احساس می‌کند'),
      r('Buenas tardes, don Carlos.', 'بعدازظهر بخیر، آقای کارلوس.', 'بوئِناس تاردِس، دون کارلوس', 'tardes', 'بعدازظهرها'),
      r('Hasta luego, nos vemos el lunes.', 'تا بعد، دوشنبه می‌بینمت.', 'آستا لوئِگو، نوس بِموس اِل لونِس', 'vemos', 'می‌بینیم'),
      r('Perdón, tengo que marcharme ya.', 'ببخشید، باید الان بروم.', 'پِردون، تِنگو کِه مارچارمِه یا', 'marcharme', 'رفتن'),
      r('Muchas gracias, ¡hasta la vista!', 'خیلی ممنون، تا دیدار!', 'موچاس گراتسیاس، آستا لا بیستا', 'vista', 'دیدار'),
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
        'برای پرسش مؤدبانهٔ نام «¿Cómo se llama usted?» به کار می‌رود. «nombre» نام و «apellido» نام خانوادگی است. حرف‌ها را یکی‌یکی و با فاصله بگویید.',
    },
    [
      r('¿Cómo se llama usted, por favor?', 'لطفاً اسم شما چیست؟', 'کومو سِه یاما اوستِد، پور فابور', 'llama', 'نامیده می‌شود'),
      r('Me llamo Ali y soy de Irán.', 'اسم من علی است و اهل ایران هستم.', 'مِه یامو علی ای سوی دِه ایران', 'soy', 'هستم'),
      r('¿Puede deletrear su nombre?', 'می‌توانید نامتان را هجی کنید؟', 'پوئِدِه دِلِترِار سو نومبرِه', 'deletrear', 'هجی کردن'),
      r('Se escribe A-L-I, con tres letras.', 'نوشته می‌شود آ-اِل-ای، با سه حرف.', 'سِه اِسکریبِه آ-اِل-ای، کون ترِس لِتراس', 'letras', 'حروف'),
      r('Mi nombre es Sara y mi apellido García.', 'نام من سارا و نام خانوادگی‌ام گارسیا است.', 'می نومبرِه اِس سارا ای می آپِییدو گارسیا', 'apellido', 'نام خانوادگی'),
      r('¿Cómo se escribe exactamente?', 'دقیقاً چطور نوشته می‌شود؟', 'کومو سِه اِسکریبِه اِکساکتامِنتِه', 'exactamente', 'دقیقاً'),
      r('Perdón, no he entendido su nombre.', 'ببخشید، نام شما را نفهمیدم.', 'پِردون، نو اِه اِنتِندیدو سو نومبرِه', 'entendido', 'فهمیده'),
      r('Aquí está mi nombre en el papel.', 'این نام من روی کاغذ است.', 'آکی اِستا می نومبرِه اِن اِل پاپِل', 'papel', 'کاغذ'),
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
        'برای منفی‌کردن جمله «no» پیش از فعل می‌آید: «no soy». «Entiendo» یعنی «می‌فهمم» و «No comprendo» یعنی «نمی‌فهمم». «un poquito» یعنی «خیلی کم».',
    },
    [
      r('¿Eres estudiante en esta escuela?', 'آیا در این مدرسه دانشجویی؟', 'اِرِس اِستودیانتِه اِن اِستا اِسکوئِلا', 'estudiante', 'دانشجو'),
      r('Sí, estudio idiomas en la universidad.', 'بله، در دانشگاه زبان می‌خوانم.', 'سی، اِستودیو ایذیوماس اِن لا اونیوِرسی داد', 'idiomas', 'زبان‌ها'),
      r('No, no soy profesor de español.', 'نه، من معلم اسپانیایی نیستم.', 'نو، نو سوی پروفِسور دِه اِسپانیول', 'profesor', 'معلم'),
      r('¿Entiendes esta pregunta?', 'این سؤال را می‌فهمی؟', 'اِنتِیندِس اِستا پرِگونتا', 'pregunta', 'سؤال'),
      r('Sí, pero solo un poquito.', 'بله، اما فقط خیلی کم.', 'سی، پِرُه سولو اون پُکیتو', 'poquito', 'خیلی کم'),
      r('No comprendo esta palabra.', 'این واژه را نمی‌فهمم.', 'نو کومپرِندو اِستا پالابرا', 'palabra', 'واژه'),
      r('No es nada difícil, de verdad.', 'واقعاً سخت نیست.', 'نو اِس نادا دیفیسیل، دِه بِرداد', 'difícil', 'سخت'),
      r('Vale, gracias por la explicación.', 'باشه، ممنون از توضیح.', 'بالِه، گراتسیاس پور لا اِکسپلیکاسیون', 'explicación', 'توضیح'),
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
        '«Por favor» یعنی «لطفاً» و «Gracias» یعنی «ممنون». پاسخ مؤدبانه به تشکر «No hay de qué» یا «De nada» است. برای عذرخواهی «Disculpe» و «Perdón» به کار می‌رود.',
    },
    [
      r('Por favor, ayúdeme un momento.', 'لطفاً یک لحظه کمکم کنید.', 'پور فابور، آیودِمِه اون مومِنتو', 'ayúdeme', 'کمکم کنید'),
      r('Gracias por su ayuda, es muy amable.', 'ممنون از کمکتان، خیلی لطف دارید.', 'گراتسیاس پور سو آیودا، اِس موی آمابلِه', 'amable', 'مهربان'),
      r('No hay de qué, con mucho gusto.', 'خواهش می‌کنم، با کمال میل.', 'نو آی دِه کِه، کون موچو گوستو', 'gusto', 'میل'),
      r('Disculpe la molestia, señor.', 'ببخشید مزاحمت، آقا.', 'دیسکولپِه لا مولِستیا، سِنیور', 'molestia', 'مزاحمت'),
      r('Siento llegar un poco tarde.', 'متأسفم که کمی دیر رسیدم.', 'سیِنتو یِگار اون پُکو تاردِه', 'tarde', 'دیر'),
      r('No pasa nada, no se preocupe.', 'چیزی نشده، نگران نباشید.', 'نو پاسا نادا، نو سِه پرِئوکوپِه', 'preocupe', 'نگران شوید'),
      r('Un vaso de agua, por favor.', 'یک لیوان آب، لطفاً.', 'اون باسو دِه آگوا، پور فابور', 'vaso', 'لیوان'),
      r('Es usted muy gentil, gracias de nuevo.', 'شما خیلی مهربانید، باز هم ممنون.', 'اِس اوستِد موی خِنتیل، گراتسیاس دِه نوِوو', 'gentil', 'مهربان'),
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
        'عددهای یک تا ده را با صدای بلند تکرار کنید. «Hay» یعنی «وجود دارد» و «Cuesta» یعنی «قیمتش … است». عدد یک پیش از اسم مذکر «un» و پیش از اسم مؤنث «una» می‌شود.',
    },
    [
      r('Uno, dos, tres y cuatro.', 'یک، دو، سه و چهار.', 'اونو، دوس، ترِس ای کواترو', 'cuatro', 'چهار'),
      r('Tengo cinco libros en la mochila.', 'پنج کتاب در کوله‌پشتی‌ام دارم.', 'تِنگو ثینکو لیبروس اِن لا موچیلا', 'mochila', 'کوله‌پشتی'),
      r('Hay siete días en una semana.', 'هفت روز در یک هفته هست.', 'آی سیِتِه دیاس اِن اونا سِمانا', 'semana', 'هفته'),
      r('Mi hermana cumple ocho años este mes.', 'خواهرم این ماه هشت ساله می‌شود.', 'می اِرمـانا کومپلِه اوچو آنیوس اِستِه مِس', 'cumple', 'تمام می‌شود'),
      r('El autobús número diez llega a las nueve.', 'اتوبوس شماره ده ساعت نه می‌رسد.', 'اِل آوتوبوس نومِرو دیِث یِگا آ لاس نوِوِه', 'llega', 'می‌رسد'),
      r('Vivo en el número doce de esta calle.', 'در شماره دوازده این خیابان زندگی می‌کنم.', 'بیوو اِن اِل نومِرو دُثِه دِه اِستا کالِه', 'calle', 'خیابان'),
      r('Cuesta seis euros y veinte céntimos.', 'شش یورو و بیست سانتیـم هزینه دارد.', 'کوِستا سِیس یوروس ای بِینتِه ثِنتی موس', 'cuesta', 'هزینه دارد'),
      r('Once y nueve son veinte, es fácil.', 'یازده و نه می‌شود بیست، آسان است.', 'اونثِه ای نوِوِه سون بِینتِه، اِس فاسیل', 'fácil', 'آسان'),
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
        '«¿Qué es esto?» یعنی «این چیست؟» و پاسخ کوتاه آن «Es …» است. برای چند چیز «Son …» می‌گوییم. حرف تعریف معین (el, la, los, las) چیز شناخته‌شده را نشان می‌دهد.',
    },
    [
      r('¿Qué es este objeto, por favor?', 'لطفاً این شیء چیست؟', 'کِه اِس اِستِه اوبخِتو، پور فابور', 'objeto', 'شیء'),
      r('Es una mesa con dos sillas.', 'این میزی با دو صندلی است.', 'اِس اونا مِسا کون دوس سییاس', 'mesa', 'میز'),
      r('Aquí están mi móvil y mis llaves.', 'این گوشی من و کلیدهای من است.', 'آکی اِستان می موبیل ای میس یابِس', 'llaves', 'کلیدها'),
      r('El libro está sobre la mesa de la cocina.', 'کتاب روی میز آشپزخانه است.', 'اِل لیبرو اِستا سوبرِه لا مِسا دِه لا کوثینا', 'cocina', 'آشپزخانه'),
      r('Llevo un bolígrafo azul en el bolsillo.', 'یک خودکار آبی در جیبم دارم.', 'یِوو اون بولیگرافو آثول اِن اِل بولسییو', 'bolsillo', 'جیب'),
      r('Estas gafas de sol son mías.', 'این عینک آفتابی مال من است.', 'اِستاس گافاس دِه سول سون میاس', 'gafas', 'عینک'),
      r('¿Dónde está mi mochila?', 'کوله‌پشتی‌ام کجاست؟', 'دوندِه اِستا می موچیلا', 'dónde', 'کجا'),
      r('Su billete está en su bolsillo.', 'بلیت شما در جیب شماست.', 'سو بییِتِه اِستا اِن سو بولسییو', 'billete', 'بلیت'),
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
        'برای حال موقت از «estar» استفاده می‌شود: «estoy cansado». صفت با جنسیت گوینده هماهنگ می‌شود: cansado / cansada. «feliz» برای هر دو جنس یک‌سان است.',
    },
    [
      r('Estoy cansado después de este viaje.', 'بعد از این سفر خسته‌ام.', 'اِستوی کانسادو دِسپوئِس دِه اِستِه بیاخِه', 'cansado', 'خسته'),
      r('Ella está contenta con su nuevo trabajo.', 'او از کار جدیدش راضی است.', 'اِیا اِستا کونتِنتا کون سو نوِوو تراباخو', 'contenta', 'راضی، خوشحال'),
      r('Estamos listos para la clase.', 'ما برای کلاس آماده‌ایم.', 'اِستاموس لیستوس پارا لا کلاسِه', 'listos', 'آماده'),
      r('Él está un poco enfermo esta mañana.', 'او امروز صبح کمی بیمار است.', 'اِل اِستا اون پُکو اِنفِرمو اِستا مانیانا', 'enfermo', 'بیمار'),
      r('Estoy triste por tener que irme.', 'از اینکه باید بروم غمگینم.', 'اِستوی تریستِه پور تِنِهر کِه یرمِه', 'triste', 'غمگین'),
      r('¿Estás seguro de tu respuesta?', 'از جوابت مطمئنی؟', 'اِستاس سِگورو دِه تو رِسپوئِستا', 'seguro', 'مطمئن'),
      r('Ellos están muy felices en esta ciudad.', 'آن‌ها در این شهر خیلی خوشحال‌اند.', 'ایوس اِستان موی فِلیثِس اِن اِستا ثیوداد', 'felices', 'خوشحال'),
      r('No estoy enfadado en absoluto.', 'اصلاً عصبانی نیستم.', 'نو اِستوی اِنفادادو اِن آپسولوتو', 'enfadado', 'عصبانی'),
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
        '«Tengo» یعنی «دارم» و «Tienes» یعنی «داری». «tener … años» برای گفتن سن است. برای پول همراه «llevar dinero» طبیعی‌تر از «tener» است.',
    },
    [
      r('Tengo un hermano y una hermana mayor.', 'یک برادر و یک خواهر بزرگ‌تر دارم.', 'تِنگو اون اِرمـانو ای اونا اِرمـانا مایور', 'hermano', 'برادر'),
      r('¿Tienes tiempo para ayudarme mañana?', 'فردا وقت داری کمکم کنی؟', 'تیِنِس تیِمپو پارا آیودارمِه مانیانا', 'tiempo', 'وقت'),
      r('Ella no tiene coche en la ciudad.', 'او در شهر ماشین ندارد.', 'اِیا نو تیِنِه کوچِه اِن لا ثیوداد', 'coche', 'ماشین'),
      r('Tenemos dos hijos en la escuela.', 'ما دو فرزند مدرسه‌ای داریم.', 'تِنِموس دوس ایخوس اِن لا اِسکوئِلا', 'hijos', 'فرزندان'),
      r('Él tiene veinticinco años hoy.', 'او امروز بیست‌وپنج ساله است.', 'اِل تیِنِه بِینتیسینکو آنیوس اوی', 'años', 'سال'),
      r('No llevo dinero conmigo.', 'پول همراهم ندارم.', 'نو یِوو دینِرو کونمیگو', 'dinero', 'پول'),
      r('¿Tiene usted alguna pregunta?', 'آیا سؤالی دارید؟', 'تیِنِه اوستِد آلگونا پرِگونتا', 'alguna', 'برخی، هیچ'),
      r('Ellos tienen una casa bonita cerca del parque.', 'آن‌ها خانهٔ قشنگی نزدیک پارک دارند.', 'ایوس تیِنِن اونا کاسا بونیتا ثِرکا دِل پارکِه', 'bonita', 'قشنگ'),
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
        '«Necesito …» یعنی «نیاز دارم»؛ «Necesito un médico» بدون حرف اضافه می‌آید. «Quisiera» شکل مؤدبانهٔ «می‌خواهم» است و از «Quiero» نرم‌تر است.',
    },
    [
      r('Necesito un médico esta noche.', 'امشب به پزشک نیاز دارم.', 'نِثِسیتو اون مِدیکو اِستا نوچِه', 'médico', 'پزشک'),
      r('Necesitamos su ayuda, por favor.', 'ما به کمک شما نیاز داریم، لطفاً.', 'نِثِسیتاموس سو آیودا، پور فابور', 'necesitamos', 'نیاز داریم'),
      r('Él necesita un billete de tren.', 'او به بلیت قطار نیاز دارد.', 'اِل نِثِسیتا اون بییِتِه دِه ترِن', 'tren', 'قطار'),
      r('Tienes que dormir un poco más.', 'باید کمی بیشتر بخوابی.', 'تیِنِس کِه دورمیر اون پُکو ماس', 'dormir', 'خوابیدن'),
      r('Quisiera un vaso de leche, gracias.', 'یک لیوان شیر می‌خواهم، ممنون.', 'کیسیِرا اون باسو دِه لِچِه، گراتسیاس', 'quisiera', 'می‌خواستم'),
      r('Ella quiere comprar pan esta mañana.', 'او امروز صبح می‌خواهد نان بخرد.', 'اِیا کیِرِه کومپرار پان اِستا مانیانا', 'comprar', 'خریدن'),
      r('¿Puedo pagar con tarjeta de crédito?', 'می‌توانم با کارت اعتباری پرداخت کنم؟', 'پوئِدو پاگار کون تارخِتا دِه کرِدیتو', 'pagar', 'پرداختن'),
      r('Necesito un plano de la ciudad.', 'به نقشهٔ شهر نیاز دارم.', 'نِثِسیتو اون پلانو دِه لا ثیوداد', 'plano', 'نقشه'),
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
        '«mi padre» پدرم و «mi madre» مادرم است؛ «mis» برای جمع به کار می‌رود. «hermano/hermana» برادر و خواهر و «abuelos» پدربزرگ و مادربزرگ است.',
    },
    [
      r('Aquí hay una foto de mi familia.', 'این عکس خانوادهٔ من است.', 'آکی آی اونا فوتو دِه می فامیلیا', 'foto', 'عکس'),
      r('Mi padre trabaja en una oficina.', 'پدرم در یک دفتر کار می‌کند.', 'می پادرِه تراباخا اِن اونا اوفیسینا', 'padre', 'پدر'),
      r('Mi madre habla alemán y francés.', 'مادرم آلمانی و فرانسوی صحبت می‌کند.', 'می مادرِه ابلا آلمان ای فرانثِس', 'habla', 'صحبت می‌کند'),
      r('Mi hermano vive en Sevilla con su mujer.', 'برادرم با همسرش در سویا زندگی می‌کند.', 'می اِرمـانو بیوِه اِن سِبییا کون سو موخِر', 'vive', 'زندگی می‌کند'),
      r('Mi hermana es más joven que yo.', 'خواهرم از من جوان‌تر است.', 'می اِرمـانا اِس ماس خووِن کِه یو', 'joven', 'جوان'),
      r('Mis abuelos están en casa ahora.', 'پدربزرگ و مادربزرگم الان خانه هستند.', 'میس آبوئِلوس اِستان اِن کاسا آهورا', 'abuelos', 'پدربزرگ و مادربزرگ'),
      r('Mi tío tiene tres hijos ya mayores.', 'عمویم سه فرزند بزرگ دارد.', 'می تیو تیِنِه ترِس ایخوس یا مایورِس', 'tío', 'عمو'),
      r('Mi tía llega mañana por la tarde.', 'خاله‌ام فردا بعدازظهر می‌رسد.', 'می تیا یِگا مانیانا پور لا تاردِه', 'tía', 'خاله'),
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
        'mi / tu / su با اسم همراه می‌شوند و با شمار اسم هماهنگ‌اند: mi libro / mis libros. nuestro / vuestro با جنسیت و شمار اسم تغییر می‌کنند. «su» هم «مال او» است هم «مال شما».',
    },
    [
      r('Mi móvil está dentro de mi bolso.', 'گوشی من داخل کیفم است.', 'می موبیل اِستا دِنتـرو دِه می بولسو', 'bolso', 'کیف'),
      r('Tu chaqueta está encima de la silla.', 'کاپشن تو روی صندلی است.', 'تو چاکِتا اِستا اِنثیما دِه لا سییا', 'chaqueta', 'کاپشن'),
      r('Su marido trabaja en este hospital.', 'همسرش در این بیمارستان کار می‌کند.', 'سو ماریدو تراباخا اِن اِستِه اوستپیتال', 'marido', 'همسر'),
      r('Nuestro piso es pequeño pero tranquilo.', 'آپارتمان ما کوچک اما آرام است.', 'نوئِسترو پیسو اِس پِکِنیو پِرُه ترانکیلو', 'piso', 'آپارتمان'),
      r('Vuestro perro es muy bueno con los niños.', 'سگ شما با بچه‌ها خیلی خوب است.', 'بوئِسترو پِرّو اِس موی بوئِنو کون لوس نینیوس', 'perro', 'سگ'),
      r('Sus hijos van al colegio andando.', 'بچه‌های آن‌ها پیاده به مدرسه می‌روند.', 'سوس ایخوس بان آل کولِخیو آنداندو', 'colegio', 'مدرسه'),
      r('Mis padres viven en Irán desde hace años.', 'پدر و مادرم سال‌هاست در ایران زندگی می‌کنند.', 'میس پادرِس بیوِن اِن ایران دِسدِه آسِه آنیوس', 'viven', 'زندگی می‌کنند'),
      r('Su hermana habla español con fluidez.', 'خواهرش روان اسپانیایی صحبت می‌کند.', 'سو اِرمـانا ابلا اِسپانیول کون فلویدِث', 'fluidez', 'روانی'),
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
        'صفت در اسپانیایی معمولاً پس از اسم می‌آید: «una casa bonita». صفت با اسم در جنسیت و شمار هماهنگ می‌شود: alto / alta / altos. «bastante» یعنی «نسبتاً/کافی».',
    },
    [
      r('Esta ciudad es muy grande y ruidosa.', 'این شهر خیلی بزرگ و شلوغ است.', 'اِستا ثیوداد اِس موی گراندِه ای رویـدوسا', 'ruidosa', 'شلوغ'),
      r('Mi piso es pequeño pero luminoso.', 'آپارتمانم کوچک اما روشن است.', 'می پیسو اِس پِکِنیو پِرُه لومینوسو', 'luminoso', 'روشن'),
      r('Él es alto y bastante delgado.', 'او قدبلند و نسبتاً لاغر است.', 'اِل اِس آلتو ای باستانتِه دِلگادو', 'delgado', 'لاغر'),
      r('Ella tiene el pelo negro y corto.', 'او موهای سیاه و کوتاه دارد.', 'اِیا تیِنِه اِل پِلُه نِگرو ای کورتو', 'pelo', 'مو'),
      r('Este café es bueno y no es caro.', 'این کافه خوب است و گران نیست.', 'اِستِه کافِه اِس بوئِنو ای نو اِس کارو', 'caro', 'گران'),
      r('La calle es estrecha pero muy tranquila.', 'خیابان باریک اما خیلی آرام است.', 'لا کالِه اِس اِسترِچا پِرُه موی ترانکیلا', 'estrecha', 'باریک'),
      r('Somos jóvenes y tenemos energía.', 'ما جوانیم و انرژی داریم.', 'سوموس خووِنِس ای تِنِموس اِنِرخیا', 'energía', 'انرژی'),
      r('Esta película es un poco larga para mí.', 'این فیلم برای من کمی طولانی است.', 'اِستا پِلیکولا اِس اون پُکو لارگا پارا می', 'película', 'فیلم'),
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
        'رنگ‌ها صفت‌اند و با اسم هماهنگ می‌شوند: «el cielo azul»، «las flores rosas». برخی رنگ‌ها تغییر نمی‌کنند، مانند «verde». برای پرسش «¿De qué color es?» می‌گوییم.',
    },
    [
      r('Mi coche es rojo y bastante viejo.', 'ماشین من قرمز و نسبتاً قدیمی است.', 'می کوچِه اِس روخو ای باستانتِه بیِخو', 'viejo', 'قدیمی'),
      r('El cielo está azul esta mañana.', 'آسمان امروز صبح آبی است.', 'اِل ثیِلُو اِستا آثول اِستا مانیانا', 'cielo', 'آسمان'),
      r('Ella lleva un vestido verde hoy.', 'او امروز لباس سبز پوشیده است.', 'اِیا یِوا اون بِستیدو بِردِه اوی', 'vestido', 'لباس'),
      r('Me gusta mucho este color amarillo.', 'این رنگ زرد را خیلی دوست دارم.', 'مِه گوستا موچو اِستِه کولور آمارییو', 'color', 'رنگ'),
      r('Sus calcetines son blancos.', 'جوراب‌هایش سفید هستند.', 'سوس کالـثِتینِس سون بلانکوس', 'calcetines', 'جوراب‌ها'),
      r('El gato negro duerme en la cama.', 'گربهٔ سیاه روی تخت خوابیده است.', 'اِل گاتو نِگرو دوِرمِه اِن لا کاما', 'gato', 'گربه'),
      r('Las flores del jardín son rosas.', 'گل‌های باغ صورتی هستند.', 'لاس فلورِس دِل خاردین سون روساس', 'flores', 'گل‌ها'),
      r('La pared gris está fría en invierno.', 'دیوار خاکستری در زمستان سرد است.', 'لا پاردِ گریس اِستا فریا اِن اینبیِرنو', 'pared', 'دیوار'),
    ],
    [1, 3, 4, 6],
  ),

  lesson(
    14,
    {
      title: 'در کلاس درس',
      subtitle: 'گوش کن و تکرار کن',
      situation: 'در کلاس از معلم می‌خواهید آهسته‌تر بگوید و دربارهٔ واژه‌ها می‌پرسید.',
      teachingFa:
        'فعل‌های دستوری کلاس در حالت امری می‌آیند: «Abran», «Escriban», «Escuchen». برای درخواست مؤدبانه «¿Puede repetir?» به کار می‌رود. «¿Cómo se dice … ?» یعنی «… چه می‌شود؟».',
    },
    [
      r('Abran su libro por la página diez.', 'کتابتان را صفحهٔ ده باز کنید.', 'آبران سو لیبرو پور لا پاخینا دیِث', 'página', 'صفحه'),
      r('Escriban su nombre arriba de la hoja.', 'نامتان را بالای برگه بنویسید.', 'اِسکریبان سو نومبرِه آریبـا دِه لا اوخا', 'hoja', 'برگه'),
      r('Escuchen bien y repitan la frase.', 'خوب گوش کنید و جمله را تکرار کنید.', 'اِسکوچِن بیِن ای رِپیتان لا فراسِه', 'repitan', 'تکرار کنید'),
      r('No entiendo la palabra «pizarra».', 'واژهٔ «تخته» را نمی‌فهمم.', 'نو اِنتِیندو لا پالابرا پیثارّا', 'pizarra', 'تخته'),
      r('¿Cómo se dice esta palabra en español?', 'این واژه به اسپانیایی چه می‌شود؟', 'کومو سِه دیثِه اِستا پالابرا اِن اِسپانیول', 'dice', 'گفته می‌شود'),
      r('El profesor habla despacio y claro.', 'معلم آهسته و واضح صحبت می‌کند.', 'اِل پروفِسور ابلا دِسپاثیو ای کلارو', 'despacio', 'آهسته'),
      r('Trabajen en grupos de dos personas.', 'در گروه‌های دونفره کار کنید.', 'تراباخِن اِن گروپوس دِه دوس پِرسوناس', 'grupos', 'گروه‌ها'),
      r('La clase termina a mediodía en punto.', 'کلاس سرِ ظهر تمام می‌شود.', 'لا کلاسِه تِرمینا آ مِدیودیا اِن پونتو', 'termina', 'تمام می‌شود'),
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
        '«Soy de …» برای اصل و زادگاه است و «Vivo en …» برای محل زندگی. «desde hace dos años» یعنی «دو سال است که». ملیت با جنسیت هماهنگ می‌شود: iraní برای هر دو، italiano / italiana.',
    },
    [
      r('¿De qué país es usted, por favor?', 'لطفاً اهل کدام کشور هستید؟', 'دِه کِه پائیس اِس اوستِد، پور فابور', 'país', 'کشور'),
      r('Soy de Irán, de la ciudad de Teherán.', 'من اهل ایران، شهر تهران هستم.', 'سوی دِه ایران، دِه لا ثیوداد دِه تِهران', 'ciudad', 'شهر'),
      r('Ella nació en Francia hace muchos años.', 'او سال‌ها پیش در فرانسه به دنیا آمد.', 'اِیا ناسیو اِن فرانثیا آسِه موچوس آنیوس', 'nació', 'به دنیا آمد'),
      r('Vivimos aquí desde hace dos años.', 'ما دو سال است اینجا زندگی می‌کنیم.', 'بیبیموس آکی دِسدِه آسِه دوس آنیوس', 'desde', 'از'),
      r('Él habla tres idiomas diferentes.', 'او سه زبان مختلف صحبت می‌کند.', 'اِل ابلا ترِس ایذیوماس دیفِرِنتِس', 'diferentes', 'مختلف'),
      r('¿Es usted italiano o portugués?', 'شما ایتالیایی هستید یا پرتغالی؟', 'اِس اوستِد ایتالیانو او پورتـوگِس', 'italiano', 'ایتالیایی'),
      r('Soy iraní y vivo en Alemania.', 'من ایرانی هستم و در آلمان زندگی می‌کنم.', 'سوی ایرانی ای بیوو اِن آلمانـیا', 'vivo', 'زندگی می‌کنم'),
      r('Mi familia viene del sur del país.', 'خانوادهٔ من از جنوب کشور می‌آید.', 'می فامیلیا بینِه دِل سور دِل پائیس', 'sur', 'جنوب'),
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
        '«Hay» برای گفتن «وجود دارد» است. اتاق‌ها: «la habitación» اتاق، «la cocina» آشپزخانه، «el baño» حمام. «el alquiler» اجارهٔ ماهانه است.',
    },
    [
      r('Buscamos un piso para alquilar.', 'ما دنبال آپارتمانی برای اجاره هستیم.', 'بوسکاموس اون پیسو پارا آلکیلار', 'alquilar', 'اجاره کردن'),
      r('Hay dos habitaciones y una cocina.', 'دو اتاق و یک آشپزخانه دارد.', 'آی دوس آبیـتاسیونِس ای اونا کوثینا', 'habitaciones', 'اتاق‌ها'),
      r('El baño está a la izquierda.', 'حمام سمت چپ است.', 'اِل بانیو اِستا آ لا ایسکیِردا', 'baño', 'حمام'),
      r('Mi cama está cerca de la ventana.', 'تختم نزدیک پنجره است.', 'می کاما اِستا ثِرکا دِه لا بِنتانا', 'cama', 'تخت'),
      r('El salón es grande y muy claro.', 'پذیرایی بزرگ و خیلی روشن است.', 'اِل سالون اِس گراندِه ای موی کلارو', 'salón', 'پذیرایی'),
      r('La llave todavía está en la puerta.', 'کلید هنوز روی در است.', 'لا یابِه تودابیا اِستا اِن لا پوئِرتـا', 'puerta', 'در'),
      r('Este edificio no tiene balcón.', 'این ساختمان بالکن ندارد.', 'اِستِه اِدیفیسیو نو تیِنِه بالکون', 'edificio', 'ساختمان'),
      r('El alquiler cuesta seiscientos euros al mes.', 'اجاره ماهی ششصد یورو است.', 'اِل آلکیلِر کوِستا سِیسثیِنتوس یوروس آل مِس', 'alquiler', 'اجاره'),
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
        '«¿Dónde está … ?» یعنی «… کجاست؟». «a la derecha» راست، «a la izquierda» چپ و «al fondo» انتها است. برای فاصله «lejos» (دور) و «cerca» (نزدیک) به کار می‌رود.',
    },
    [
      r('¿Dónde está la estación, por favor?', 'لطفاً ایستگاه کجاست؟', 'دوندِه اِستا لا اِستاسیون، پور فابور', 'estación', 'ایستگاه'),
      r('El banco está a la derecha de la iglesia.', 'بانک سمت راست کلیسا است.', 'اِل بانکو اِستا آ لا دِرِچا دِه لا ایگلِسیا', 'derecha', 'راست'),
      r('Los aseos están al fondo del pasillo.', 'سرویس‌ها انتهای راهرو هستند.', 'لوس آسِئوس اِستان آل فوندو دِل پاسییو', 'pasillo', 'راهرو'),
      r('¿Está lejos de aquí andando?', 'از اینجا پیاده دور است؟', 'اِستا لِخوس دِه آکی آنداندو', 'lejos', 'دور'),
      r('No, solo hay cinco minutos.', 'نه، فقط پنج دقیقه است.', 'نو، سولو آی ثینکو مینوتوس', 'minutos', 'دقیقه‌ها'),
      r('¿Dónde puedo comprar un billete de autobús?', 'کجا می‌توانم بلیت اتوبوس بخرم؟', 'دوندِه پوئِدو کومپرار اون بییِتِه دِه آوتوبوس', 'comprar', 'خریدن'),
      r('La parada está delante del hotel.', 'ایستگاه مقابل هتل است.', 'لا پارادا اِستا دِلانتِه دِل اوتِل', 'parada', 'ایستگاه'),
      r('Perdone, busco el mercado cubierto.', 'ببخشید، دنبال بازار سرپوشیده می‌گردم.', 'پِردونِه، بوسکو اِل مِرکادو کوبیِرتو', 'mercado', 'بازار'),
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
        '«Quisiera …» درخواست مؤدبانه است. «La cuenta» صورتحساب است و «el servicio incluido» یعنی حق سرویس در صورت‌حساب آمده. برای پرسیدن قیمت «¿Cuánto cuesta?» می‌گوییم.',
    },
    [
      r('Una mesa para dos personas, por favor.', 'یک میز برای دو نفر، لطفاً.', 'اونا مِسا پارا دوس پِرسوناس، پور فابور', 'personas', 'افراد'),
      r('Quisiera un café con leche y un croasán.', 'یک قهوه با شیر و یک کرواسان می‌خواهم.', 'کیسیِرا اون کافِه کون لِچِه ای اون کرواسان', 'con', 'با'),
      r('¿Qué clases de té tienen ustedes?', 'چه نوع چایی دارید؟', 'کِه کلاسِس دِه تِه تیِنِن اوستِدِس', 'clases', 'انواع'),
      r('La cuenta, por favor, señor.', 'لطفاً صورتحساب، آقا.', 'لا کوانتا، پور فابور، سِنیور', 'cuenta', 'صورتحساب'),
      r('¿Cuánto cuesta este pastel de chocolate?', 'این کیک شکلاتی چقدر است؟', 'کوانتو کوِستا اِستِه پاستِل دِه چوکولاتِه', 'pastel', 'کیک'),
      r('Tomamos dos zumos de naranja frescos.', 'ما دو آب‌پرتقال تازه می‌گیریم.', 'توماموس دوس ثوموس دِه نارانخا فرِسکوس', 'zumos', 'آبمیوه‌ها'),
      r('¿Está incluido el servicio en la cuenta?', 'آیا حق سرویس در صورت‌حساب هست؟', 'اِستا اینکلویـدو اِل سِربیسیو اِن لا کوانتا', 'servicio', 'سرویس'),
      r('Gracias, estaba todo muy rico.', 'ممنون، همه‌چیز خیلی خوشمزه بود.', 'گراتسیاس، اِستابا تودو موی ریکو', 'rico', 'خوشمزه'),
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
        '«¿Qué hora es?» یعنی «ساعت چند است؟». «y media» نیم، «y cuarto» ربع و «en punto» سرِ ساعت است. برای ساعت‌های بعدازظهر «de la tarde» می‌گوییم.',
    },
    [
      r('¿Qué hora es ahora, por favor?', 'لطفاً الان ساعت چند است؟', 'کِه اورا اِس آهورا، پور فابور', 'hora', 'ساعت'),
      r('Son las ocho y media de la mañana.', 'ساعت هشت‌و‌نیم صبح است.', 'سون لاس اوچو ای مِدیا دِه لا مانیانا', 'media', 'نیم'),
      r('El tren sale a las diez en punto.', 'قطار ساعت ده دقیق حرکت می‌کند.', 'اِل ترِن سالِه آ لاس دیِث اِن پونتو', 'sale', 'حرکت می‌کند'),
      r('Tengo una cita a las doce y cuarto.', 'ساعت دوازده‌و‌ربع قرار دارم.', 'تِنگو اونا ثیتا آ لاس دُثِه ای کوارتو', 'cita', 'قرار'),
      r('La tienda abre a las nueve en punto.', 'مغازه سرِ ساعت نه باز می‌شود.', 'لا تیِندا ابرِه آ لاس نوِوِه اِن پونتو', 'tienda', 'مغازه'),
      r('Llegamos sobre las seis de la tarde.', 'حدود ساعت شش عصر می‌رسیم.', 'یِگاموس سوبرِه لاس سِیس دِه لا تاردِه', 'llegamos', 'می‌رسیم'),
      r('Ya son las tres y cuarto.', 'الان ساعت سه‌و‌ربع است.', 'یا سون لاس ترِس ای کوارتو', 'ya', 'الان'),
      r('La clase empieza dentro de cinco minutos.', 'کلاس پنج دقیقهٔ دیگر شروع می‌شود.', 'لا کلاسِه اِمپیِثا دِنتـرو دِه ثینکو مینوتوس', 'empieza', 'شروع می‌شود'),
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
        'نام روزها در اسپانیایی با حرف کوچک نوشته می‌شود: lunes, martes, miércoles… «Hoy» امروز، «mañana» فردا و «la semana que viene» هفتهٔ آینده است. «desde … hasta …» یعنی «از … تا …».',
    },
    [
      r('Hoy es martes por la mañana.', 'امروز سه‌شنبه صبح است.', 'اوی اِس مارتِس پور لا مانیانا', 'martes', 'سه‌شنبه'),
      r('Mañana por la tarde será miércoles.', 'فردا بعدازظهر چهارشنبه خواهد بود.', 'مانیانا پور لا تاردِه سِرا میِرمکولِس', 'miércoles', 'چهارشنبه'),
      r('Trabajo desde el lunes hasta el viernes.', 'من از دوشنبه تا جمعه کار می‌کنم.', 'تراباخو دِسدِه اِل لونِس آستا اِل بیِرنِس', 'viernes', 'جمعه'),
      r('Los sábados me quedo en casa.', 'شنبه‌ها خانه می‌مانم.', 'لوس سابادوس مِه کِدو اِن کاسا', 'sábados', 'شنبه‌ها'),
      r('Los domingos visitamos a mis padres.', 'یکشنبه‌ها به دیدن پدر و مادرم می‌رویم.', 'لوس دومینگوس بیسیتاموس آ میس پادرِس', 'domingos', 'یکشنبه‌ها'),
      r('La semana que viene viajo al norte.', 'هفتهٔ آینده به شمال سفر می‌کنم.', 'لا سِمانا کِه بینِه بیاخو آل نورتِه', 'viajo', 'سفر می‌کنم'),
      r('¿Qué día es hoy exactamente?', 'امروز دقیقاً چه روزی است؟', 'کِه دیا اِس اوی اِکساکتامِنتِه', 'día', 'روز'),
      r('Quedamos el próximo lunes a las diez.', 'قرار دوشنبهٔ آینده ساعت ده می‌گذاریم.', 'کِداموس اِل پروکسیمو لونِس آ لاس دیِث', 'próximo', 'آینده'),
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
      r('Hola, me llamo Nadia y soy nueva aquí.', 'سلام، اسم من نادیا است و اینجا تازه‌وارد هستم.', 'اُلا، مِه یامو نادیا ای سوی نوِوا آکی', 'nueva', 'تازه، جدید'),
      r('Encantada de conocerle, señor.', 'از آشنایی با شما خوشوقتم، آقا.', 'اِنکانتادا دِه کونوثِرلِه، سِنیور', 'conocerle', 'آشنا شدن با شما'),
      r('¿Dónde vive usted exactamente, por favor?', 'لطفاً دقیقاً کجا زندگی می‌کنید؟', 'دوندِه بیوِه اوستِد اِکساکتامِنتِه، پور فابور', 'vive', 'زندگی می‌کند'),
      r('Vivo cerca del centro con mi familia.', 'نزدیک مرکز شهر با خانواده‌ام زندگی می‌کنم.', 'بیوو ثِرکا دِل ثِنترو کون می فامیلیا', 'centro', 'مرکز'),
      r('Hablo persa y un poquito de español.', 'من فارسی و کمی اسپانیایی صحبت می‌کنم.', 'ابلا پِرسا ای اون پُکیتو دِه اِسپانیول', 'persa', 'فارسی'),
      r('¿Puede repetir más despacio, por favor?', 'لطفاً آهسته‌تر تکرار می‌کنید؟', 'پوئِدِه رِپِتیر ماس دِسپاثیو، پور فابور', 'repetir', 'تکرار کردن'),
      r('Muchas gracias por su paciencia.', 'خیلی ممنون از صبر شما.', 'موچاس گراتسیاس پور سو پاسیِنتسیا', 'paciencia', 'صبر'),
      r('¡Buenas noches y hasta la próxima semana!', 'شب بخیر و تا هفتهٔ آینده!', 'بوئِناس نوچِس ای آستا لا پروکسیمو سِمانا', 'próxima', 'بعدی'),
    ],
    [0, 1, 2, 7],
  ),
];
