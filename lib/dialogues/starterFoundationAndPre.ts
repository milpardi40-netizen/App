import type { DialogueLine, DialogueMap } from './types';

type TurnSpec = { s?: string; t: string; fa: string };
type TriEntry = { de: TurnSpec[]; fr: TurnSpec[]; es: TurnSpec[] };

function buildTriMap(entries: Record<string, TriEntry>): DialogueMap {
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

export const STARTER_FOUNDATION_PRE_DIALOGUES: DialogueMap = buildTriMap({
  'foundation-sounds-1': {
    de: [
      { t: 'Hallo! Ist das Wasser kalt?', fa: 'سلام! آیا این آب سرد است؟' },
      { t: 'Ja, das Wasser ist sehr gut.', fa: 'بله، آب خیلی خوب است.' },
      { t: 'Möchtest du auch Tee oder Brot?', fa: 'چای یا نان هم می‌خواهی؟' },
      { t: 'Tee, bitte. Danke!', fa: 'چای، لطفاً. ممنون!' },
    ],
    fr: [
      { t: 'Bonjour ! Vous voulez de l’eau ?', fa: 'سلام! آب میل دارید؟' },
      { t: 'Oui, merci. Et un café, s’il vous plaît.', fa: 'بله، ممنون. و یک قهوه، لطفاً.' },
      { t: 'Avec du pain chaud ?', fa: 'با نان گرم؟' },
      { t: 'Oui, c’est parfait !', fa: 'بله، عالی است!' },
    ],
    es: [
      { t: '¡Hola! ¿Quieres agua fría?', fa: 'سلام! آب خنک می‌خواهی؟' },
      { t: 'Sí, por favor. Gracias.', fa: 'بله، لطفاً. ممنون.' },
      { t: '¿También quieres pan o té?', fa: 'نان یا چای هم می‌خواهی؟' },
      { t: 'Un té, por favor.', fa: 'یک چای، لطفاً.' },
    ],
  },
  'foundation-sounds-2': {
    de: [
      { t: 'Entschuldigung, sprechen wir Deutsch?', fa: 'ببخشید، آلمانی صحبت کنیم؟' },
      { t: 'Ja, gern! Bitte sprechen Sie langsam.', fa: 'بله، با کمال میل! لطفاً آهسته صحبت کنید.' },
      { t: 'Ist das ein Buch oder ein Tisch?', fa: 'این یک کتاب است یا یک میز؟' },
      { t: 'Das ist ein Buch. Schön!', fa: 'این یک کتاب است. قشنگ است!' },
    ],
    fr: [
      { t: 'Excusez-moi, c’est votre livre ?', fa: 'ببخشید، این کتاب شماست؟' },
      { t: 'Oui, c’est mon livre de français.', fa: 'بله، کتاب فرانسوی من است.' },
      { t: 'Parlez-vous un peu français ?', fa: 'کمی فرانسوی صحبت می‌کنید؟' },
      { t: 'Oui, un petit peu. Merci !', fa: 'بله، خیلی کم. ممنون!' },
    ],
    es: [
      { t: 'Perdón, ¿este libro es nuevo?', fa: 'ببخشید، این کتاب جدید است؟' },
      { t: 'Sí, es un libro muy bueno.', fa: 'بله، کتاب خیلی خوبی است.' },
      { t: '¿Estudias español aquí?', fa: 'اینجا اسپانیایی می‌خوانی؟' },
      { t: 'Sí, cada mañana en la clase.', fa: 'بله، هر صبح در کلاس.' },
    ],
  },
  'foundation-words-1': {
    de: [
      { t: 'Wer ist auf dem Foto? Deine Mutter?', fa: 'این شخص در عکس کیست؟ مادرت است؟' },
      { t: 'Ja, das ist meine Mutter und mein Vater.', fa: 'بله، این مادرم و پدرم هستند.' },
      { t: 'Ist das auch dein Bruder?', fa: 'آیا آن هم برادرت است؟' },
      { t: 'Nein, das ist meine Schwester!', fa: 'نه، آن خواهرم است!' },
    ],
    fr: [
      { t: 'Qui est sur la photo ? C’est ta mère ?', fa: 'این کیست در عکس؟ مادرت است؟' },
      { t: 'Oui, ma mère et mon père.', fa: 'بله، مادرم و پدرم.' },
      { t: 'Et lui, c’est ton frère ?', fa: 'و او برادرت است؟' },
      { t: 'Oui, et voici ma sœur.', fa: 'بله، و این هم خواهرم است.' },
    ],
    es: [
      { t: '¿Quién es en la foto? ¿Tu madre?', fa: 'این کیست در عکس؟ مادرت است؟' },
      { t: 'Sí, mi madre y mi padre.', fa: 'بله، مادرم و پدرم.' },
      { t: '¿Y él es tu hermano?', fa: 'و او برادرت است؟' },
      { t: 'Sí, mi hermano y mi hermana.', fa: 'بله، برادرم و خواهرم.' },
    ],
  },
  'foundation-words-2': {
    de: [
      { t: 'Wie viele Äpfel möchten Sie?', fa: 'چند تا سیب می‌خواهید؟' },
      { t: 'Drei Äpfel und zwei Bananen, bitte.', fa: 'سه تا سیب و دو تا موز، لطفاً.' },
      { t: 'Das macht zusammen fünf Euro.', fa: 'جمعاً پنج یورو می‌شود.' },
      { t: 'Hier sind zehn Euro. Danke!', fa: 'بفرمایید ده یورو. ممنون!' },
    ],
    fr: [
      { t: 'Vous voulez combien de pommes ?', fa: 'چند تا سیب می‌خواهید؟' },
      { t: 'Trois pommes et deux oranges, s’il vous plaît.', fa: 'سه تا سیب و دو تا پرتقال، لطفاً.' },
      { t: 'Ça fait cinq euros en tout.', fa: 'در کل پنج یورو می‌شود.' },
      { t: 'Voici dix euros. Merci beaucoup !', fa: 'بفرمایید ده یورو. خیلی ممنون!' },
    ],
    es: [
      { t: '¿Cuántas manzanas quiere hoy?', fa: 'امروز چند تا سیب می‌خواهید؟' },
      { t: 'Tres manzanas y dos peras, por favor.', fa: 'سه تا سیب و دو تا گلابی، لطفاً.' },
      { t: 'Son cinco euros en total.', fa: 'جمعاً پنج یورو می‌شود.' },
      { t: 'Aquí tiene diez euros. ¡Gracias!', fa: 'بفرمایید ده یورو. ممنون!' },
    ],
  },
  'foundation-chunks-1': {
    de: [
      { t: 'Guten Morgen! Wie geht es Ihnen?', fa: 'صبح بخیر! حالتان چطور است؟' },
      { t: 'Danke, gut! Einen Kaffee, bitte.', fa: 'ممنون، خوبم! یک قهوه، لطفاً.' },
      { t: 'Bitte schön! Sonst noch etwas?', fa: 'بفرمایید! چیز دیگری هم میل دارید؟' },
      { t: 'Nein, danke. Auf Wiedersehen!', fa: 'نه، ممنون. خداحافظ!' },
    ],
    fr: [
      { t: 'Bonjour ! Comment allez-vous ?', fa: 'روز بخیر! حالتان چطور است؟' },
      { t: 'Très bien, merci ! Un café, s’il vous plaît.', fa: 'خیلی خوبم، ممنون! یک قهوه، لطفاً.' },
      { t: 'Voilà. Autre chose ?', fa: 'بفرمایید. چیز دیگری؟' },
      { t: 'Non, merci. Au revoir !', fa: 'نه، ممنون. خداحافظ!' },
    ],
    es: [
      { t: '¡Buenos días! ¿Cómo está?', fa: 'صبح بخیر! حالتان چطور است؟' },
      { t: 'Muy bien, ¡gracias! Un café, por favor.', fa: 'خیلی خوب، ممنون! یک قهوه، لطفاً.' },
      { t: 'Aquí tiene. ¿Algo más?', fa: 'بفرمایید. چیز دیگری؟' },
      { t: 'No, gracias. ¡Hasta luego!', fa: 'نه، ممنون. فعلاً خداحافظ!' },
    ],
  },
  'foundation-chunks-2': {
    de: [
      { t: 'Wo ist mein Buch?', fa: 'کتاب من کجاست؟' },
      { t: 'Hier auf dem Tisch, neben deiner Tasche.', fa: 'اینجا روی میز، کنار کیفت است.' },
      { t: 'Ist das dein roter Stift?', fa: 'آیا آن خودکار قرمز توست؟' },
      { t: 'Ja, das ist mein Stift. Danke!', fa: 'بله، خودکار من است. ممنون!' },
    ],
    fr: [
      { t: 'Où est mon livre ?', fa: 'کتاب من کجاست؟' },
      { t: 'Là, sur la table, à côté de ton sac.', fa: 'آنجا، روی میز، کنار کیفت است.' },
      { t: 'C’est ton stylo bleu ?', fa: 'آن خودکار آبی توست؟' },
      { t: 'Oui, c’est mon stylo. Merci !', fa: 'بله، خودکار من است. ممنون!' },
    ],
    es: [
      { t: '¿Dónde está mi libro?', fa: 'کتاب من کجاست؟' },
      { t: 'Ahí, en la mesa, al lado de tu bolso.', fa: 'آنجا، روی میز، کنار کیفت است.' },
      { t: '¿Es tu bolígrafo azul?', fa: 'آن خودکار آبی توست؟' },
      { t: 'Sí, es mi bolígrafo. ¡Gracias!', fa: 'بله، خودکار من است. ممنون!' },
    ],
  },
  'pre-1': {
    de: [
      { s: 'همسایه', t: 'Guten Morgen! Wie geht es Ihnen heute?', fa: 'صبح بخیر! امروز حالتان چطور است؟' },
      { t: 'Guten Morgen! Danke, sehr gut. Und Ihnen?', fa: 'صبح بخیر! ممنون، خیلی خوبم. و شما؟' },
      { s: 'همسایه', t: 'Mir geht es auch gut. Bis heute Abend!', fa: 'من هم خوبم. تا امشب!' },
      { t: 'Tschüss, einen schönen Tag noch!', fa: 'خداحافظ، روز خوبی داشته باشید!' },
    ],
    fr: [
      { s: 'همسایه', t: 'Bonjour ! Comment allez-vous ce matin ?', fa: 'روز بخیر! امروز صبح حالتان چطور است؟' },
      { t: 'Très bien, merci ! Et vous ?', fa: 'خیلی خوبم، ممنون! و شما؟' },
      { s: 'همسایه', t: 'Ça va bien aussi. À ce soir !', fa: 'من هم خوبم. تا امشب!' },
      { t: 'Au revoir, bonne journée !', fa: 'خداحافظ، روز خوبی داشته باشید!' },
    ],
    es: [
      { s: 'همسایه', t: '¡Buenos días! ¿Cómo está usted hoy?', fa: 'صبح بخیر! امروز حالتان چطور است؟' },
      { t: 'Muy bien, gracias. ¿Y usted?', fa: 'خیلی خوبم، ممنون. و شما؟' },
      { s: 'همسایه', t: 'Bien también. ¡Nos vemos esta tarde!', fa: 'من هم خوبم. عصر می‌بینمتان!' },
      { t: '¡Adiós, que tenga buen día!', fa: 'خداحافظ، روز خوبی داشته باشید!' },
    ],
  },
  'pre-2': {
    de: [
      { s: 'منشی', t: 'Guten Tag! Wie ist Ihr Name, bitte?', fa: 'روز بخیر! اسمتان چیست، لطفاً؟' },
      { t: 'Ich heiße Mina Rahimi.', fa: 'اسم من مینا رحیمی است.' },
      { s: 'منشی', t: 'Wie schreibt man Ihren Vornamen?', fa: 'اسم کوچکتان چطور نوشته می‌شود؟' },
      { t: 'M-I-N-A. Vielen Dank!', fa: 'M-I-N-A. خیلی ممنون!' },
    ],
    fr: [
      { s: 'منشی', t: 'Bonjour ! Comment vous appelez-vous ?', fa: 'روز بخیر! اسم شما چیست؟' },
      { t: 'Je m’appelle Mina Rahimi.', fa: 'اسم من مینا رحیمی است.' },
      { s: 'منشی', t: 'Pouvez-vous épeler votre prénom ?', fa: 'می‌توانید اسمتان را حرف‌به‌حرف بگویید؟' },
      { t: 'Oui : M-I-N-A. Merci !', fa: 'بله: M-I-N-A. ممنون!' },
    ],
    es: [
      { s: 'منشی', t: '¡Buenos días! ¿Cómo se llama?', fa: 'صبح بخیر! اسم شما چیست؟' },
      { t: 'Me llamo Mina Rahimi.', fa: 'اسم من مینا رحیمی است.' },
      { s: 'منشی', t: '¿Cómo se escribe su nombre?', fa: 'اسمتان چطور نوشته می‌شود؟' },
      { t: 'Se escribe M-I-N-A. ¡Gracias!', fa: 'به شکل M-I-N-A نوشته می‌شود. ممنون!' },
    ],
  },
  'pre-3': {
    de: [
      { t: 'Sind Sie im ersten Deutschkurs?', fa: 'آیا در کلاس اول آلمانی هستید؟' },
      { t: 'Ja, ich bin neu hier.', fa: 'بله، من اینجا تازه هستم.' },
      { t: 'Ist dieser Platz neben Ihnen frei?', fa: 'این صندلی کنارتان خالی است؟' },
      { t: 'Ja, bitte! Nehmen Sie Platz.', fa: 'بله، بفرمایید! بنشینید.' },
    ],
    fr: [
      { t: 'Vous êtes dans le cours du matin ?', fa: 'شما در کلاس صبح هستید؟' },
      { t: 'Oui, je suis nouveau ici.', fa: 'بله، من اینجا تازه‌واردم.' },
      { t: 'Cette place est libre ?', fa: 'این جا خالی است؟' },
      { t: 'Non, désolé, elle est prise.', fa: 'نه، ببخشید، پر است.' },
    ],
    es: [
      { t: '¿Estás en la clase de español?', fa: 'تو در کلاس اسپانیایی هستی؟' },
      { t: 'Sí, es mi primer día.', fa: 'بله، امروز روز اول من است.' },
      { t: '¿Está libre esta silla?', fa: 'این صندلی خالی است؟' },
      { t: 'Sí, claro. Siéntate, por favor.', fa: 'بله، حتماً. لطفاً بنشین.' },
    ],
  },
  'pre-4': {
    de: [
      { t: 'Entschuldigung, ist hier noch frei?', fa: 'ببخشید، اینجا هنوز خالی است؟' },
      { t: 'Ja, bitte setzen Sie sich!', fa: 'بله، لطفاً بنشینید!' },
      { t: 'Vielen Dank! Oh, entschuldigen Sie meine Tasche.', fa: 'خیلی ممنون! اوه، بابت کیفم ببخشید.' },
      { t: 'Kein Problem, bitte schön!', fa: 'مشکلی نیست، خواهش می‌کنم!' },
    ],
    fr: [
      { t: 'Excusez-moi, puis-je m’asseoir ici ?', fa: 'ببخشید، می‌توانم اینجا بنشینم؟' },
      { t: 'Oui, je vous en prie !', fa: 'بله، خواهش می‌کنم!' },
      { t: 'Merci beaucoup. Oh, pardon pour mon sac.', fa: 'خیلی ممنون. اوه، ببخشید بابت کیفم.' },
      { t: 'Ce n’est rien, pas de souci.', fa: 'چیزی نیست، اشکالی ندارد.' },
    ],
    es: [
      { t: 'Disculpe, ¿puedo sentarme aquí?', fa: 'ببخشید، می‌توانم اینجا بنشینم؟' },
      { t: 'Sí, por favor, adelante.', fa: 'بله، لطفاً بفرمایید.' },
      { t: 'Muchas gracias. Perdón por la mochila.', fa: 'خیلی ممنون. ببخشید بابت کوله‌پشتی.' },
      { t: 'No pasa nada, de nada.', fa: 'مهم نیست، خواهش می‌کنم.' },
    ],
  },
  'pre-5': {
    de: [
      { s: 'فروشنده', t: 'Guten Tag! Wie viele Brötchen möchten Sie?', fa: 'روز بخیر! چند تا نان کوچک می‌خواهید؟' },
      { t: 'Sechs Brötchen und vier Äpfel, bitte.', fa: 'شش تا نان کوچک و چهار تا سیب، لطفاً.' },
      { s: 'فروشنده', t: 'Das kostet zusammen acht Euro.', fa: 'جمعاً هشت یورو می‌شود.' },
      { t: 'Hier sind zehn Euro. Danke schön!', fa: 'بفرمایید ده یورو. خیلی ممنون!' },
    ],
    fr: [
      { s: 'فروشنده', t: 'Bonjour ! Combien de croissants voulez-vous ?', fa: 'روز بخیر! چند تا کروسان می‌خواهید؟' },
      { t: 'Quatre croissants et deux jus d’orange, s’il vous plaît.', fa: 'چهار تا کروسان و دو تا آب‌پرتقال، لطفاً.' },
      { s: 'فروشنده', t: 'Ça fait neuf euros au total.', fa: 'جمعاً نه یورو می‌شود.' },
      { t: 'Voici dix euros. Merci !', fa: 'بفرمایید ده یورو. ممنون!' },
    ],
    es: [
      { s: 'فروشنده', t: '¡Hola! ¿Cuántos cuadernos necesita?', fa: 'سلام! چند تا دفتر نیاز دارید؟' },
      { t: 'Tres cuadernos y cinco lápices, por favor.', fa: 'سه تا دفتر و پنج تا مداد، لطفاً.' },
      { s: 'فروشنده', t: 'Son siete euros en total.', fa: 'در مجموع هفت یورو می‌شود.' },
      { t: 'Aquí tiene diez euros. ¡Gracias!', fa: 'بفرمایید ده یورو. ممنون!' },
    ],
  },
  'pre-6': {
    de: [
      { t: 'Entschuldigung, was ist das auf dem Tisch?', fa: 'ببخشید، آن چیزی که روی میز است چیست؟' },
      { t: 'Das ist ein Wörterbuch für unseren Kurs.', fa: 'آن یک فرهنگ لغت برای کلاس ماست.' },
      { t: 'Und ist das da dein Handy?', fa: 'و آن گوشی آنجا مال توست؟' },
      { t: 'Nein, das ist mein Schlüssel.', fa: 'نه، آن کلید من است.' },
    ],
    fr: [
      { t: 'Dis-moi, qu’est-ce que c’est sur la table ?', fa: 'بگو ببینم، آن روی میز چیست؟' },
      { t: 'C’est un dictionnaire pour le cours.', fa: 'آن یک فرهنگ لغت برای کلاس است.' },
      { t: 'Et ça, c’est ton téléphone ?', fa: 'و آن گوشی توست؟' },
      { t: 'Non, c’est mon cahier.', fa: 'نه، آن دفترم است.' },
    ],
    es: [
      { t: 'Oye, ¿qué es eso encima de la mesa?', fa: 'بگو، آن روی میز چیست؟' },
      { t: 'Es un diccionario para la clase.', fa: 'یک فرهنگ لغت برای کلاس است.' },
      { t: '¿Y esto es tu llave?', fa: 'و این کلید توست؟' },
      { t: 'Sí, gracias por encontrarla.', fa: 'بله، ممنون که پیدایش کردی.' },
    ],
  },
  'pre-7': {
    de: [
      { t: 'Hallo! Bist du heute sehr müde?', fa: 'سلام! امروز خیلی خسته‌ای؟' },
      { t: 'Ja, ein bisschen müde, aber ich bin nicht krank.', fa: 'بله، کمی خسته‌ام، اما بیمار نیستم.' },
      { t: 'Wie geht es dir denn jetzt?', fa: 'خب الان حالت چطور است؟' },
      { t: 'Nach dem Kaffee bin ich wieder fit!', fa: 'بعد از قهوه دوباره سرحالم!' },
    ],
    fr: [
      { t: 'Salut ! Tu es fatigué aujourd’hui ?', fa: 'سلام! امروز خسته‌ای؟' },
      { t: 'Un peu fatigué, oui, mais je ne suis pas malade.', fa: 'کمی خسته‌ام، بله، ولی بیمار نیستم.' },
      { t: 'Et comment te sens-tu maintenant ?', fa: 'و الان چه حسی داری؟' },
      { t: 'Je suis content, ça va beaucoup mieux !', fa: 'خوشحالم، حالم خیلی بهتر است!' },
    ],
    es: [
      { t: '¡Hola! ¿Estás cansado hoy?', fa: 'سلام! امروز خسته‌ای؟' },
      { t: 'Un poco cansado, pero no estoy enfermo.', fa: 'کمی خسته هستم، اما بیمار نیستم.' },
      { t: '¿Cómo estás ahora?', fa: 'الان حالت چطور است؟' },
      { t: 'Estoy muy bien y listo para empezar.', fa: 'خیلی خوبم و آمادهٔ شروع.' },
    ],
  },
  'pre-8': {
    de: [
      { t: 'Hast du heute Nachmittag ein bisschen Zeit?', fa: 'امروز بعدازظهر کمی وقت داری؟' },
      { t: 'Ja, ich habe um vier Uhr Zeit. Hast du eine Frage?', fa: 'بله، ساعت چهار وقت دارم. سؤالی داری؟' },
      { t: 'Ja, ich habe kein Zimmer für morgen gefunden.', fa: 'بله، برای فردا اتاقی پیدا نکرده‌ام.' },
      { t: 'Kein Problem, ich habe zwei gute Tipps für dich.', fa: 'مشکلی نیست، دو پیشنهاد خوب برایت دارم.' },
    ],
    fr: [
      { t: 'Tu as un peu de temps cet après-midi ?', fa: 'امروز بعدازظهر کمی وقت داری؟' },
      { t: 'Oui, j’ai du temps à seize heures. Tu as une question ?', fa: 'بله، ساعت چهار وقت دارم. سؤالی داری؟' },
      { t: 'Oui, je n’ai pas le numéro de la salle.', fa: 'بله، شمارهٔ سالن را ندارم.' },
      { t: 'Pas de souci, j’ai l’horaire dans mon sac.', fa: 'اشکالی ندارد، برنامه را در کیفم دارم.' },
    ],
    es: [
      { t: '¿Tienes tiempo esta tarde?', fa: 'امروز عصر وقت داری؟' },
      { t: 'Sí, tengo tiempo a las cuatro. ¿Tienes una pregunta?', fa: 'بله، ساعت چهار وقت دارم. سؤالی داری؟' },
      { t: 'Sí, no tengo el mapa del barrio.', fa: 'بله، نقشهٔ محله را ندارم.' },
      { t: 'Tranquilo, yo tengo uno en mi mochila.', fa: 'نگران نباش، من یکی در کوله‌ام دارم.' },
    ],
  },
  'pre-9': {
    de: [
      { s: 'کارمند ایستگاه', t: 'Guten Tag! Brauchen Sie Hilfe am Automat?', fa: 'روز بخیر! در کار با دستگاه بلیت کمک لازم دارید؟' },
      { t: 'Ja, bitte! Ich brauche eine Fahrkarte nach Berlin.', fa: 'بله، لطفاً! یک بلیت به برلین لازم دارم.' },
      { s: 'کارمند ایستگاه', t: 'Brauchen Sie auch einen Stadtplan?', fa: 'نقشهٔ شهر هم لازم دارید؟' },
      { t: 'Nein, den brauche ich nicht. Vielen Dank!', fa: 'نه، آن را لازم ندارم. خیلی ممنون!' },
    ],
    fr: [
      { s: 'کارمند ایستگاه', t: 'Bonjour ! Vous avez besoin d’aide ?', fa: 'روز بخیر! کمک نیاز دارید؟' },
      { t: 'Oui, j’ai besoin d’un billet pour Paris, s’il vous plaît.', fa: 'بله، یک بلیت به پاریس نیاز دارم، لطفاً.' },
      { s: 'کارمند ایستگاه', t: 'Avez-vous besoin d’un plan du métro ?', fa: 'نقشهٔ مترو هم نیاز دارید؟' },
      { t: 'Non, je n’en ai pas besoin. Merci beaucoup !', fa: 'نه، نیاز ندارم. خیلی ممنون!' },
    ],
    es: [
      { s: 'کارمند ایستگاه', t: '¡Buenos días! ¿Necesita ayuda con la máquina?', fa: 'صبح بخیر! با دستگاه کمک لازم دارید؟' },
      { t: 'Sí, necesito un billete al centro, por favor.', fa: 'بله، یک بلیت به مرکز شهر لازم دارم، لطفاً.' },
      { s: 'کارمند ایستگاه', t: '¿Necesita también un mapa de líneas?', fa: 'نقشهٔ خطوط هم لازم دارید؟' },
      { t: 'No, no lo necesito. ¡Muchas gracias!', fa: 'نه، لازم ندارم. خیلی ممنون!' },
    ],
  },
  'pre-10': {
    de: [
      { t: 'Ist das ein Foto von deiner Familie?', fa: 'این عکس خانوادهٔ توست؟' },
      { t: 'Ja, das ist mein Vater und das ist meine Mutter.', fa: 'بله، این پدرم و این مادرم است.' },
      { t: 'Hast du auch Geschwister?', fa: 'خواهر و برادر هم داری؟' },
      { t: 'Ja, einen Bruder. Er lebt noch bei unseren Eltern.', fa: 'بله، یک برادر دارم. او هنوز پیش والدینمان زندگی می‌کند.' },
    ],
    fr: [
      { t: 'C’est une photo de ta famille ?', fa: 'این عکس خانوادهٔ توست؟' },
      { t: 'Oui, voici mon père et ma mère.', fa: 'بله، این پدرم و مادرم هستند.' },
      { t: 'Tu as des frères et sœurs ?', fa: 'خواهر و برادر هم داری؟' },
      { t: 'Oui, j’ai une sœur et un jeune frère.', fa: 'بله، یک خواهر و یک برادر کوچک‌تر دارم.' },
    ],
    es: [
      { t: '¿Es una foto de tu familia?', fa: 'این عکس خانوادهٔ توست؟' },
      { t: 'Sí, este es mi padre y esta es mi madre.', fa: 'بله، این پدرم و این مادرم است.' },
      { t: '¿Tienes hermanos?', fa: 'خواهر و برادر داری؟' },
      { t: 'Sí, tengo una hermana mayor y un hermano.', fa: 'بله، یک خواهر بزرگ‌تر و یک برادر دارم.' },
    ],
  },
  'pre-11': {
    de: [
      { t: 'Ist das deine schwarze Tasche hier?', fa: 'این کیف مشکی اینجا مال توست؟' },
      { t: 'Nein, das ist nicht meine. Meine Tasche ist blau.', fa: 'نه، مال من نیست. کیف من آبی است.' },
      { t: 'Schau mal dort! Ist das dein Schlüssel?', fa: 'آنجا را ببین! آن کلید توست؟' },
      { t: 'Ja, das ist meiner! Danke fürs Suchen.', fa: 'بله، مال من است! ممنون بابت گشتن.' },
    ],
    fr: [
      { t: 'C’est ton sac noir ici ?', fa: 'این کیف مشکی اینجا مال توست؟' },
      { t: 'Non, ce n’est pas le mien. Mon sac est bleu.', fa: 'نه، مال من نیست. کیف من آبی است.' },
      { t: 'Regarde là-bas : c’est ta clé ?', fa: 'آنجا را نگاه کن: کلید توست؟' },
      { t: 'Oui, c’est ma clé ! Merci beaucoup.', fa: 'بله، کلید من است! خیلی ممنون.' },
    ],
    es: [
      { t: '¿Es tuya esta bolsa negra?', fa: 'این کیف مشکی مال توست؟' },
      { t: 'No, no es mía. Mi bolsa es azul.', fa: 'نه، مال من نیست. کیف من آبی است.' },
      { t: 'Mira allí, ¿esa es tu llave?', fa: 'آنجا را ببین، آن کلید توست؟' },
      { t: '¡Sí, es la mía! Muchas gracias.', fa: 'بله، مال من است! خیلی ممنون.' },
    ],
  },
  'pre-12': {
    de: [
      { t: 'Wie findest du dein neues Zimmer?', fa: 'اتاق جدیدت را چطور می‌بینی؟' },
      { t: 'Es ist klein, aber sehr hell und ruhig.', fa: 'کوچک است، اما خیلی روشن و آرام است.' },
      { t: 'Und wie schmeckt das Essen in der Kantine?', fa: 'و غذای سلف چطور است؟' },
      { t: 'Die Suppe ist heiß und richtig lecker!', fa: 'سوپ داغ و واقعاً خوشمزه است!' },
    ],
    fr: [
      { t: 'Comment trouves-tu ta nouvelle chambre ?', fa: 'اتاق جدیدت را چطور می‌بینی؟' },
      { t: 'Elle est petite, mais très calme et lumineuse.', fa: 'کوچک است، ولی خیلی آرام و پرنور است.' },
      { t: 'Et le plat du jour, il est bon ?', fa: 'و غذای روز چطور، خوشمزه است؟' },
      { t: 'Oui, il est chaud et délicieux !', fa: 'بله، داغ و خوشمزه است!' },
    ],
    es: [
      { t: '¿Cómo es tu habitación nueva?', fa: 'اتاق جدیدت چطور است؟' },
      { t: 'Es pequeña, pero muy luminosa y tranquila.', fa: 'کوچک است، ولی خیلی روشن و آرام است.' },
      { t: '¿Y qué tal está la comida aquí?', fa: 'و غذا اینجا چطور است؟' },
      { t: 'La sopa está caliente y muy rica.', fa: 'سوپ داغ و خیلی خوشمزه است.' },
    ],
  },
  'pre-13': {
    de: [
      { t: 'Welche Farbe hat deine neue Jacke?', fa: 'کاپشن جدیدت چه رنگی است؟' },
      { t: 'Sie ist dunkelblau, fast schwarz.', fa: 'آبی تیره است، تقریباً مشکی.' },
      { t: 'Und welches Buch liest du gerade — das rote oder das grüne?', fa: 'و الان کدام کتاب را می‌خوانی — قرمز یا سبز؟' },
      { t: 'Das grüne Buch. Es ist sehr spannend.', fa: 'کتاب سبز را. خیلی جذاب است.' },
    ],
    fr: [
      { t: 'De quelle couleur est ta nouvelle veste ?', fa: 'کت جدیدت چه رنگی است؟' },
      { t: 'Elle est bleu foncé, presque noire.', fa: 'آبی تیره است، تقریباً مشکی.' },
      { t: 'Et tu préfères le cahier rouge ou le vert ?', fa: 'و دفتر قرمز را ترجیح می‌دهی یا سبز را؟' },
      { t: 'Le cahier vert, s’il te plaît.', fa: 'دفتر سبز را، لطفاً.' },
    ],
    es: [
      { t: '¿De qué color es tu chaqueta nueva?', fa: 'ژاکت جدیدت چه رنگی است؟' },
      { t: 'Es azul oscuro, casi negra.', fa: 'آبی تیره است، تقریباً مشکی.' },
      { t: '¿Prefieres la carpeta roja o la verde?', fa: 'پوشهٔ قرمز را ترجیح می‌دهی یا سبز را؟' },
      { t: 'La verde, por favor.', fa: 'سبز را، لطفاً.' },
    ],
  },
  'pre-14': {
    de: [
      { s: 'معلم', t: 'Haben Sie die Aufgabe für morgen verstanden?', fa: 'تکلیف فردا را متوجه شدید؟' },
      { t: 'Entschuldigung, ich habe das nicht ganz verstanden.', fa: 'ببخشید، کامل متوجه نشدم.' },
      { s: 'معلم', t: 'Kein Problem! Soll ich das noch einmal erklären?', fa: 'مشکلی نیست! یک بار دیگر توضیح بدهم؟' },
      { t: 'Ja, bitte sprechen Sie etwas langsamer.', fa: 'بله، لطفاً کمی آهسته‌تر صحبت کنید.' },
    ],
    fr: [
      { s: 'معلم', t: 'Avez-vous compris la consigne pour demain ?', fa: 'دستورالعمل فردا را متوجه شدید؟' },
      { t: 'Pardon, je n’ai pas tout compris.', fa: 'ببخشید، همه‌اش را متوجه نشدم.' },
      { s: 'معلم', t: 'Pas de problème, je peux répéter.', fa: 'مشکلی نیست، می‌توانم تکرار کنم.' },
      { t: 'Oui, parlez un peu plus lentement, s’il vous plaît.', fa: 'بله، لطفاً کمی آهسته‌تر صحبت کنید.' },
    ],
    es: [
      { s: 'معلم', t: '¿Habéis entendido el ejercicio de hoy?', fa: 'تمرین امروز را متوجه شدید؟' },
      { t: 'Perdón, no entendí bien la última parte.', fa: 'ببخشید، بخش آخر را خوب متوجه نشدم.' },
      { s: 'معلم', t: 'Sin problema. ¿Lo repito una vez más?', fa: 'مشکلی نیست. یک بار دیگر تکرار کنم؟' },
      { t: 'Sí, más despacio, por favor.', fa: 'بله، آهسته‌تر، لطفاً.' },
    ],
  },
  'pre-15': {
    de: [
      { t: 'Hallo! Woher kommen Sie eigentlich?', fa: 'سلام! راستی اهل کجا هستید؟' },
      { t: 'Ich komme aus dem Iran, aus Teheran. Und Sie?', fa: 'من اهل ایران هستم، از تهران. و شما؟' },
      { t: 'Ich komme aus Österreich. Welche Sprachen sprechen Sie?', fa: 'من اهل اتریش هستم. به چه زبان‌هایی صحبت می‌کنید؟' },
      { t: 'Ich spreche Persisch und lerne jetzt Deutsch.', fa: 'من فارسی صحبت می‌کنم و الان آلمانی یاد می‌گیرم.' },
    ],
    fr: [
      { t: 'Bonjour ! Vous venez d’où ?', fa: 'روز بخیر! اهل کجا هستید؟' },
      { t: 'Je viens d’Iran, de Téhéran. Et vous ?', fa: 'من از ایران، از تهران می‌آیم. و شما؟' },
      { t: 'Je viens de Lyon. Vous parlez quelles langues ?', fa: 'من از لیون هستم. به چه زبان‌هایی صحبت می‌کنید؟' },
      { t: 'Je parle persan et j’apprends le français.', fa: 'فارسی صحبت می‌کنم و فرانسوی یاد می‌گیرم.' },
    ],
    es: [
      { t: '¡Hola! ¿De dónde eres?', fa: 'سلام! اهل کجا هستی؟' },
      { t: 'Soy de Irán, de Teherán. ¿Y tú?', fa: 'اهل ایران هستم، از تهران. و تو؟' },
      { t: 'Yo soy de Valencia. ¿Qué idiomas hablas?', fa: 'من اهل والنسیا هستم. چه زبان‌هایی صحبت می‌کنی؟' },
      { t: 'Hablo persa y ahora estudio español.', fa: 'فارسی صحبت می‌کنم و الان اسپانیایی می‌خوانم.' },
    ],
  },
  'pre-16': {
    de: [
      { t: 'Wo wohnen Sie jetzt in der Stadt?', fa: 'الان در شهر کجا زندگی می‌کنید؟' },
      { t: 'Ich wohne in einer kleinen Wohnung nahe am Bahnhof.', fa: 'در یک آپارتمان کوچک نزدیک ایستگاه قطار زندگی می‌کنم.' },
      { t: 'Gefällt Ihnen das Viertel?', fa: 'از این محله خوشتان می‌آید؟' },
      { t: 'Ja, es ist ruhig und es gibt viele Bäume.', fa: 'بله، آرام است و درخت‌های زیادی دارد.' },
    ],
    fr: [
      { t: 'Où habitez-vous en ce moment ?', fa: 'در حال حاضر کجا زندگی می‌کنید؟' },
      { t: 'J’habite dans un petit appartement près de la gare.', fa: 'در یک آپارتمان کوچک نزدیک ایستگاه قطار زندگی می‌کنم.' },
      { t: 'Le quartier est agréable ?', fa: 'محلهٔ خوشایندی است؟' },
      { t: 'Oui, il est calme et très pratique.', fa: 'بله، آرام و خیلی دم‌دست است.' },
    ],
    es: [
      { t: '¿Dónde vives ahora en la ciudad?', fa: 'الان در شهر کجا زندگی می‌کنی؟' },
      { t: 'Vivo en un piso pequeño cerca de la estación.', fa: 'در یک آپارتمان کوچک نزدیک ایستگاه زندگی می‌کنم.' },
      { t: '¿Te gusta el barrio?', fa: 'محله را دوست داری؟' },
      { t: 'Sí, es tranquilo y tiene muchas tiendas.', fa: 'بله، آرام است و مغازه‌های زیادی دارد.' },
    ],
  },
  'pre-17': {
    de: [
      { t: 'Entschuldigung, wo ist hier eine Apotheke?', fa: 'ببخشید، اینجا داروخانه کجاست؟' },
      { s: 'رهگذر', t: 'Gehen Sie geradeaus und dann die erste Straße links.', fa: 'مستقیم بروید و بعد اولین خیابان به چپ.' },
      { t: 'Ist sie weit von hier?', fa: 'از اینجا دور است؟' },
      { s: 'رهگذر', t: 'Nein, nur drei Minuten zu Fuß neben der Bank.', fa: 'نه، پیاده فقط سه دقیقه، کنار بانک است.' },
    ],
    fr: [
      { t: 'Excusez-moi, où est la pharmacie, s’il vous plaît ?', fa: 'ببخشید، داروخانه کجاست لطفاً؟' },
      { s: 'رهگذر', t: 'Allez tout droit, puis tournez à gauche.', fa: 'مستقیم بروید و بعد به چپ بپیچید.' },
      { t: 'C’est loin d’ici ?', fa: 'از اینجا دور است؟' },
      { s: 'رهگذر', t: 'Non, à trois minutes à pied à côté de la banque.', fa: 'نه، سه دقیقه پیاده کنار بانک است.' },
    ],
    es: [
      { t: 'Disculpe, ¿dónde hay una farmacia cerca?', fa: 'ببخشید، این نزدیکی داروخانه کجاست؟' },
      { s: 'رهگذر', t: 'Siga recto y gire a la izquierda en la esquina.', fa: 'مستقیم بروید و سر نبش به چپ بپیچید.' },
      { t: '¿Está muy lejos de aquí?', fa: 'از اینجا خیلی دور است؟' },
      { s: 'رهگذر', t: 'No, está a tres minutos junto al banco.', fa: 'نه، سه دقیقه فاصله دارد، کنار بانک.' },
    ],
  },
  'pre-18': {
    de: [
      { s: 'کارمند کافه', t: 'Guten Tag! Was darf ich Ihnen bringen?', fa: 'روز بخیر! چه برایتان بیاورم؟' },
      { t: 'Einen Kaffee mit Milch und ein Stück Kuchen, bitte.', fa: 'یک قهوه با شیر و یک برش کیک، لطفاً.' },
      { s: 'کارمند کافه', t: 'Gern! Möchten Sie sonst noch etwas?', fa: 'با کمال میل! چیز دیگری هم می‌خواهید؟' },
      { t: 'Nein, danke. Die Rechnung bitte!', fa: 'نه، ممنون. صورت‌حساب لطفاً!' },
    ],
    fr: [
      { s: 'کارمند کافه', t: 'Bonjour ! Qu’est-ce que je vous sers ?', fa: 'روز بخیر! چه برایتان سرو کنم؟' },
      { t: 'Un café au lait et une part de gâteau, s’il vous plaît.', fa: 'یک قهوه با شیر و یک برش کیک، لطفاً.' },
      { s: 'کارمند کافه', t: 'Très bien. Ce sera tout ?', fa: 'خیلی خوب. همین بود؟' },
      { t: 'Oui, l’addition s’il vous plaît !', fa: 'بله، صورت‌حساب لطفاً!' },
    ],
    es: [
      { s: 'کارمند کافه', t: '¡Buenos días! ¿Qué desea tomar?', fa: 'صبح بخیر! چه میل دارید؟' },
      { t: 'Un café con leche y un trozo de tarta, por favor.', fa: 'یک قهوه با شیر و یک تکه کیک، لطفاً.' },
      { s: 'کارمند کافه', t: 'Perfecto. ¿Desea algo más?', fa: 'عالی. چیز دیگری هم می‌خواهید؟' },
      { t: 'No, gracias. La cuenta, por favor.', fa: 'نه، ممنون. صورت‌حساب لطفاً.' },
    ],
  },
  'pre-19': {
    de: [
      { t: 'Entschuldigung, wie spät ist es jetzt?', fa: 'ببخشید، الان ساعت چند است؟' },
      { t: 'Es ist Viertel nach neun.', fa: 'ساعت نه و ربع است.' },
      { t: 'Wann fährt der nächste Zug nach Hamburg?', fa: 'قطار بعدی به هامبورگ کی حرکت می‌کند؟' },
      { t: 'Um neun Uhr dreißig auf Gleis vier.', fa: 'ساعت نه و سی دقیقه از سکوی چهار.' },
    ],
    fr: [
      { t: 'Excusez-moi, quelle heure est-il ?', fa: 'ببخشید، ساعت چند است؟' },
      { t: 'Il est neuf heures et quart.', fa: 'ساعت نه و ربع است.' },
      { t: 'À quelle heure part le prochain train ?', fa: 'قطار بعدی چه ساعتی حرکت می‌کند؟' },
      { t: 'À neuf heures trente, voie quatre.', fa: 'ساعت نه و نیم، سکوی چهار.' },
    ],
    es: [
      { t: 'Disculpe, ¿qué hora es ahora?', fa: 'ببخشید، الان ساعت چند است؟' },
      { t: 'Son las nueve y cuarto.', fa: 'ساعت نه و ربع است.' },
      { t: '¿A qué hora sale el próximo tren?', fa: 'قطار بعدی چه ساعتی حرکت می‌کند؟' },
      { t: 'A las nueve y media desde el andén cuatro.', fa: 'ساعت نه و نیم از سکوی چهار.' },
    ],
  },
  'pre-20': {
    de: [
      { t: 'Wann hast du diese Woche Deutschkurs?', fa: 'این هفته کی کلاس آلمانی داری؟' },
      { t: 'Am Montag und am Mittwoch um zehn Uhr.', fa: 'دوشنبه و چهارشنبه ساعت ده.' },
      { t: 'Was machst du dann am Samstag?', fa: 'پس شنبه چه کار می‌کنی؟' },
      { t: 'Am Samstag treffe ich meine Freunde im Park.', fa: 'شنبه دوستانم را در پارک می‌بینم.' },
    ],
    fr: [
      { t: 'Quels jours as-tu cours de français cette semaine ?', fa: 'این هفته چه روزهایی کلاس فرانسوی داری؟' },
      { t: 'Le lundi et le mercredi à dix heures.', fa: 'دوشنبه و چهارشنبه ساعت ده.' },
      { t: 'Et que fais-tu samedi ?', fa: 'و شنبه چه کار می‌کنی؟' },
      { t: 'Samedi, je retrouve mes amis au parc.', fa: 'شنبه دوستانم را در پارک می‌بینم.' },
    ],
    es: [
      { t: '¿Qué días tienes clase de español esta semana?', fa: 'این هفته چه روزهایی کلاس اسپانیایی داری؟' },
      { t: 'Los lunes y los miércoles a las diez.', fa: 'دوشنبه‌ها و چهارشنبه‌ها ساعت ده.' },
      { t: '¿Y qué haces el sábado?', fa: 'و شنبه چه کار می‌کنی؟' },
      { t: 'El sábado quedo con mis amigos en el parque.', fa: 'شنبه با دوستانم در پارک قرار می‌گذارم.' },
    ],
  },
  'pre-21': {
    de: [
      { t: 'Hallo! Ich heiße Ali. Wie heißt du?', fa: 'سلام! اسم من علی است. اسم تو چیست؟' },
      { t: 'Ich heiße Sara und komme aus dem Iran.', fa: 'اسم من سارا است و اهل ایران هستم.' },
      { t: 'Möchtest du nach dem Kurs einen Kaffee trinken?', fa: 'می‌خواهی بعد از کلاس یک قهوه بنوشیم؟' },
      { t: 'Ja, sehr gern! Bis gleich!', fa: 'بله، با کمال میل! تا الان!' },
    ],
    fr: [
      { t: 'Bonjour ! Je m’appelle Ali. Et toi ?', fa: 'روز بخیر! اسم من علی است. و تو؟' },
      { t: 'Moi, c’est Sara. Je viens d’Iran.', fa: 'من سارا هستم. از ایران می‌آیم.' },
      { t: 'Tu veux prendre un café après le cours ?', fa: 'می‌خواهی بعد از کلاس یک قهوه بخوریم؟' },
      { t: 'Oui, avec plaisir ! À tout à l’heure !', fa: 'بله، با کمال میل! تا بعد!' },
    ],
    es: [
      { t: '¡Hola! Me llamo Ali. ¿Y tú?', fa: 'سلام! اسم من علی است. و تو؟' },
      { t: 'Me llamo Sara y soy de Irán.', fa: 'اسم من سارا است و اهل ایران هستم.' },
      { t: '¿Quieres tomar un café después de clase?', fa: 'می‌خواهی بعد از کلاس یک قهوه بخوریم؟' },
      { t: '¡Sí, claro! Hasta luego.', fa: 'بله، حتماً! فعلاً خداحافظ.' },
    ],
  },
});
