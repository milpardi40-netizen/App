import { buildTriMap } from './starterA1Part1';
import type { DialogueMap } from './types';

const SHARED_PART2: DialogueMap = buildTriMap({
  'a1-cafe': {
    de: [
      { s: 'کارمند کافه', t: 'Guten Morgen! Was darf es heute sein?', fa: 'صبح بخیر! امروز چه میل دارید؟' },
      { t: 'Einen Cappuccino und ein Croissant, bitte.', fa: 'یک کاپوچینو و یک کروسان، لطفاً.' },
      { s: 'کارمند کافه', t: 'Das macht fünf Euro zwanzig. Zum Mitnehmen oder hier?', fa: 'پنج یورو و بیست سنت می‌شود. بیرون‌بر یا اینجا؟' },
      { t: 'Hier trinken, bitte. Hier sind sechs Euro — stimmt so!', fa: 'اینجا می‌نوشم، لطفاً. بفرمایید شش یورو — بقیه‌اش باشد!' },
    ],
    fr: [
      { s: 'کارمند کافه', t: 'Bonjour ! Vous prenez quoi aujourd’hui ?', fa: 'روز بخیر! امروز چه می‌خورید؟' },
      { t: 'Un café crème et un croissant, s’il vous plaît.', fa: 'یک قهوه با شیر و یک کروسان، لطفاً.' },
      { s: 'کارمند کافه', t: 'Ça fait quatre euros quatre-vingts. Sur place ou à emporter ?', fa: 'چهار یورو و هشتاد سنت می‌شود. اینجا یا بیرون‌بر؟' },
      { t: 'Sur place, merci. Tenez, voici cinq euros !', fa: 'اینجا، ممنون. بفرمایید پنج یورو!' },
    ],
    es: [
      { s: 'کارمند کافه', t: '¡Buenos días! ¿Qué le pongo?', fa: 'صبح بخیر! چه برایتان بیاورم؟' },
      { t: 'Un café con leche y una tostada, por favor.', fa: 'یک قهوه با شیر و یک نان تست، لطفاً.' },
      { s: 'کارمند کافه', t: 'Son tres euros ochenta. ¿Para tomar aquí?', fa: 'سه یورو و هشتاد سنت می‌شود. اینجا میل می‌کنید؟' },
      { t: 'Sí, para aquí. Aquí tiene cuatro euros, gracias.', fa: 'بله، برای اینجا. بفرمایید چهار یورو، ممنون.' },
    ],
  },
  'a1-directions': {
    de: [
      { t: 'Entschuldigung, wie komme ich zur Stadtbibliothek?', fa: 'ببخشید، چطور به کتابخانهٔ شهر بروم؟' },
      { s: 'رهگذر', t: 'Gehen Sie hier geradeaus bis zur Ampel, dann rechts.', fa: 'از اینجا مستقیم تا چراغ راهنمایی بروید، بعد به راست.' },
      { t: 'Ist es von der Ampel noch weit?', fa: 'از چراغ راهنمایی هنوز دور است؟' },
      { s: 'رهگذر', t: 'Nein, gleich gegenüber der Post auf der linken Seite.', fa: 'نه، درست روبه‌روی اداره پست در سمت چپ است.' },
    ],
    fr: [
      { t: 'Excusez-moi, pour aller à la bibliothèque, s’il vous plaît ?', fa: 'ببخشید، برای رفتن به کتابخانه از کدام طرف بروم لطفاً؟' },
      { s: 'رهگذر', t: 'Continuez tout droit jusqu’au feu, puis tournez à droite.', fa: 'مستقیم تا چراغ راهنمایی ادامه بدهید، بعد به راست بپیچید.' },
      { t: 'C’est loin après le carrefour ?', fa: 'بعد از چهارراه دور است؟' },
      { s: 'رهگذر', t: 'Non, c’est juste en face de la poste, à gauche.', fa: 'نه، درست روبه‌روی اداره پست، سمت چپ است.' },
    ],
    es: [
      { t: 'Disculpe, ¿cómo llego a la biblioteca municipal?', fa: 'ببخشید، چطور به کتابخانهٔ شهری برسم؟' },
      { s: 'رهگذر', t: 'Siga todo recto hasta el semáforo y gire a la derecha.', fa: 'مستقیم تا چراغ راهنمایی بروید و به راست بپیچید.' },
      { t: '¿Queda lejos desde el semáforo?', fa: 'از چراغ راهنمایی دور است؟' },
      { t: 'No, está justo enfrente de correos, a la izquierda.', fa: 'نه، درست روبه‌روی اداره پست، سمت چپ است.' },
    ],
  },
  'a1-public-transport': {
    de: [
      { t: 'Entschuldigung, fährt dieser Bus ins Stadtzentrum?', fa: 'ببخشید، این اتوبوس به مرکز شهر می‌رود؟' },
      { s: 'مسافر', t: 'Ja, in etwa zehn Minuten sind Sie am Marktplatz.', fa: 'بله، حدود ده دقیقه دیگر به میدان اصلی می‌رسید.' },
      { t: 'Muss ich eine Fahrkarte schon vor der Fahrt entwerten?', fa: 'باید بلیت را پیش از حرکت مهر بزنم؟' },
      { s: 'مسافر', t: 'Ja, gleich am kleinen Automaten beim Einsteigen.', fa: 'بله، همان‌جا در دستگاه کوچک هنگام سوار شدن.' },
    ],
    fr: [
      { t: 'Pardon, est-ce que ce bus va vers le centre-ville ?', fa: 'ببخشید، این اتوبوس به سمت مرکز شهر می‌رود؟' },
      { s: 'مسافر', t: 'Oui, il s’arrête juste devant la place principale.', fa: 'بله، درست جلوی میدان اصلی توقف می‌کند.' },
      { t: 'Combien de stations reste-t-il jusqu’au musée ?', fa: 'تا موزه چند ایستگاه مانده است؟' },
      { s: 'مسافر', t: 'Seulement quatre arrêts, environ huit minutes.', fa: 'فقط چهار ایستگاه، حدود هشت دقیقه.' },
    ],
    es: [
      { t: 'Disculpe, ¿este autobús va al centro?', fa: 'ببخشید، این اتوبوس به مرکز شهر می‌رود؟' },
      { s: 'مسافر', t: 'Sí, pasa por la plaza mayor en diez minutos.', fa: 'بله، ده دقیقهٔ دیگر از میدان اصلی رد می‌شود.' },
      { t: '¿Dónde compro el billete para subir?', fa: 'بلیت را برای سوار شدن از کجا بخرم؟' },
      { s: 'مسافر', t: 'Puede comprarlo en el quiosco o al conductor.', fa: 'می‌توانید از کیوسک یا از راننده بخرید.' },
    ],
  },
  'a1-travel-tickets': {
    de: [
      { s: 'کارمند ایستگاه', t: 'Guten Tag! Wohin möchten Sie heute reisen?', fa: 'روز بخیر! امروز به کجا می‌خواهید سفر کنید؟' },
      { t: 'Ich möchte eine Fahrkarte nach Köln, bitte.', fa: 'یک بلیت به کلن می‌خواهم، لطفاً.' },
      { s: 'کارمند ایستگاه', t: 'Einfach oder hin und zurück? Der Zug fährt um elf.', fa: 'یک‌طرفه یا رفت‌وبرگشت؟ قطار ساعت یازده حرکت می‌کند.' },
      { t: 'Hin und zurück, bitte. Auf welchem Gleis fährt er?', fa: 'رفت‌وبرگشت، لطفاً. از کدام سکو حرکت می‌کند؟' },
    ],
    fr: [
      { s: 'کارمند ایستگاه', t: 'Bonjour ! Quelle destination choisissez-vous aujourd’hui ?', fa: 'روز بخیر! امروز مقصدتان کجاست؟' },
      { t: 'Je voudrais un billet pour Lyon, s’il vous plaît.', fa: 'یک بلیت به لیون می‌خواهم، لطفاً.' },
      { s: 'کارمند ایستگاه', t: 'Aller simple ou aller-retour ? Le prochain train part à onze heures.', fa: 'یک‌طرفه یا رفت‌وبرگشت؟ قطار بعدی ساعت یازده حرکت می‌کند.' },
      { t: 'Aller-retour, s’il vous plaît. C’est sur quelle voie ?', fa: 'رفت‌وبرگشت، لطفاً. روی کدام سکو است؟' },
    ],
    es: [
      { s: 'کارمند ایستگاه', t: '¡Buenos días! ¿Adónde desea viajar hoy?', fa: 'صبح بخیر! امروز به کجا می‌خواهید سفر کنید؟' },
      { t: 'Quisiera un billete a Sevilla, por favor.', fa: 'یک بلیت به سویا می‌خواهم، لطفاً.' },
      { s: 'کارمند ایستگاه', t: '¿Solo ida o ida y vuelta? El tren sale a las once.', fa: 'فقط رفت یا رفت‌وبرگشت؟ قطار ساعت یازده حرکت می‌کند.' },
      { t: 'Ida y vuelta, por favor. ¿Desde qué andén sale?', fa: 'رفت‌وبرگشت، لطفاً. از کدام سکو حرکت می‌کند؟' },
    ],
  },
  'a1-hotel-stay': {
    de: [
      { s: 'پذیرش', t: 'Willkommen im Hotel! Haben Sie eine Reservierung?', fa: 'به هتل خوش آمدید! رزرو دارید؟' },
      { t: 'Ja, ein Einzelzimmer für drei Nächte auf den Namen Rahimi.', fa: 'بله، یک اتاق یک‌نفره برای سه شب به نام رحیمی.' },
      { s: 'پذیرش', t: 'Hier ist Ihr Schlüssel für Zimmer zweihundertvier. Möchten Sie Frühstück?', fa: 'این کلید اتاق دویست‌وچهار است. صبحانه هم می‌خواهید؟' },
      { t: 'Ja, gern. Wann gibt es morgens Frühstück?', fa: 'بله، با کمال میل. صبح‌ها صبحانه چه ساعتی است؟' },
    ],
    fr: [
      { s: 'پذیرش', t: 'Bienvenue à l’hôtel ! Vous avez réservé une chambre ?', fa: 'به هتل خوش آمدید! اتاق رزرو کرده‌اید؟' },
      { t: 'Oui, une chambre simple pour trois nuits au nom de Rahimi.', fa: 'بله، یک اتاق یک‌نفره برای سه شب به نام رحیمی.' },
      { s: 'پذیرش', t: 'Voici votre clé, chambre deux cent quatre. Le petit déjeuner est de sept à dix heures.', fa: 'این کلیدتان است، اتاق دویست‌وچهار. صبحانه از هفت تا ده است.' },
      { t: 'Parfait, merci beaucoup ! Y a-t-il le wifi dans la chambre ?', fa: 'عالی، خیلی ممنون! در اتاق وای‌فای هست؟' },
    ],
    es: [
      { s: 'پذیرش', t: '¡Bienvenido al hotel! ¿Tiene una reserva?', fa: 'به هتل خوش آمدید! رزرو دارید؟' },
      { t: 'Sí, una habitación individual para tres noches a nombre de Rahimi.', fa: 'بله، یک اتاق تک‌نفره برای سه شب به نام رحیمی.' },
      { s: 'پذیرش', t: 'Aquí tiene su llave, habitación doscientos cuatro. El desayuno empieza a las siete.', fa: 'بفرمایید کلیدتان، اتاق دویست‌وچهار. صبحانه ساعت هفت شروع می‌شود.' },
      { t: 'Estupendo, gracias. ¿La clave del wifi está en la tarjeta?', fa: 'عالی، ممنون. رمز وای‌فای روی کارت نوشته شده؟' },
    ],
  },
  'a1-asking-help': {
    de: [
      { t: 'Entschuldigung, können Sie mir kurz helfen? Mein Ticket funktioniert nicht.', fa: 'ببخشید، می‌توانید کوتاه کمکم کنید؟ بلیتم کار نمی‌کند.' },
      { s: 'کارمند', t: 'Natürlich! Zeigen Sie mir bitte kurz den Code.', fa: 'حتماً! لطفاً کد را کوتاه به من نشان دهید.' },
      { t: 'Hier ist mein Handy. Ist das der richtige Ausgang?', fa: 'بفرمایید گوشی‌ام. آیا این خروجی درست است؟' },
      { s: 'کارمند', t: 'Ja, halten Sie das Handy nur etwas näher an das Lesegerät.', fa: 'بله، فقط گوشی را کمی نزدیک‌تر به دستگاه خوانش بگیرید.' },
    ],
    fr: [
      { t: 'Excusez-moi, pouvez-vous m’aider ? Mon billet ne passe pas.', fa: 'ببخشید، می‌توانید کمکم کنید؟ بلیتم رد نمی‌شود.' },
      { s: 'کارمند', t: 'Bien sûr ! Montrez-moi votre téléphone, s’il vous plaît.', fa: 'حتماً! لطفاً گوشی‌تان را نشان دهید.' },
      { t: 'Voici l’écran. Est-ce que je suis au bon quai ?', fa: 'بفرمایید صفحه. آیا در سکوی درستی هستم؟' },
      { s: 'کارمند', t: 'Oui, c’est ici ; je vous ouvre le passage tout de suite.', fa: 'بله، همین‌جاست؛ الان راه را برایتان باز می‌کنم.' },
    ],
    es: [
      { t: 'Disculpe, ¿puede ayudarme un momento? Mi billete no funciona.', fa: 'ببخشید، می‌توانید یک لحظه کمکم کنید؟ بلیتم کار نمی‌کند.' },
      { s: 'کارمند', t: '¡Claro! Déjeme ver su billete, por favor.', fa: 'حتماً! بگذارید بلیتتان را ببینم، لطفاً.' },
      { t: 'Aquí lo tiene. ¿Este es el andén correcto?', fa: 'بفرمایید. آیا این سکوی درست است؟' },
      { s: 'کارمند', t: 'Sí, pase por esta puerta; ahora mismo le ayudo.', fa: 'بله، از این در عبور کنید؛ همین الان کمکتان می‌کنم.' },
    ],
  },
  'a1-doctor-symptoms': {
    de: [
      { s: 'پزشک', t: 'Guten Tag! Was fehlt Ihnen denn heute?', fa: 'روز بخیر! امروز چه مشکلی دارید؟' },
      { t: 'Ich habe seit gestern Kopfschmerzen und ein bisschen Fieber.', fa: 'از دیروز سردرد و کمی تب دارم.' },
      { s: 'پزشک', t: 'Haben Sie auch Halsschmerzen oder Husten?', fa: 'گلودرد یا سرفه هم دارید؟' },
      { t: 'Ja, mein Hals tut beim Schlucken weh.', fa: 'بله، گلویم هنگام قورت دادن درد می‌کند.' },
    ],
    fr: [
      { s: 'پزشک', t: 'Bonjour ! Qu’est-ce qui ne va pas aujourd’hui ?', fa: 'روز بخیر! امروز چه مشکلی هست؟' },
      { t: 'J’ai mal à la tête depuis hier et un peu de fièvre.', fa: 'از دیروز سردرد و کمی تب دارم.' },
      { s: 'پزشک', t: 'Est-ce que vous avez mal à la gorge aussi ?', fa: 'گلودرد هم دارید؟' },
      { t: 'Oui, un peu, surtout le matin.', fa: 'بله، کمی، به‌خصوص صبح‌ها.' },
    ],
    es: [
      { s: 'پزشک', t: '¡Buenos días! ¿Qué le ocurre hoy?', fa: 'صبح بخیر! امروز چه مشکلی دارید؟' },
      { t: 'Me duele la cabeza desde ayer y tengo un poco de fiebre.', fa: 'از دیروز سرم درد می‌کند و کمی تب دارم.' },
      { s: 'پزشک', t: '¿También le duele la garganta o tiene tos?', fa: 'گلودرد یا سرفه هم دارید؟' },
      { t: 'Sí, me duele un poco la garganta al hablar.', fa: 'بله، هنگام صحبت کردن کمی گلویم درد می‌کند.' },
    ],
  },
  'a1-work-study': {
    de: [
      { t: 'Wo arbeitest du im Moment, und gefällt es dir dort?', fa: 'در حال حاضر کجا کار می‌کنی، و از آنجا خوشت می‌آید؟' },
      { t: 'Ich arbeite in einer kleinen Firma; das Team ist sehr nett.', fa: 'در یک شرکت کوچک کار می‌کنم؛ تیم خیلی خوب است.' },
      { t: 'Hast du nach der Arbeit noch Zeit zum Lernen?', fa: 'بعد از کار هنوز برای درس خواندن وقت داری؟' },
      { t: 'Ja, abends lerne ich immer eine Stunde Deutsch.', fa: 'بله، عصرها همیشه یک ساعت آلمانی می‌خوانم.' },
    ],
    fr: [
      { t: 'Tu travailles où en ce moment, et ça te plaît ?', fa: 'الان کجا کار می‌کنی، و دوستش داری؟' },
      { t: 'Je travaille dans un bureau au centre ; mes collègues sont sympas.', fa: 'در یک دفتر در مرکز کار می‌کنم؛ همکارانم خوش‌برخوردند.' },
      { t: 'Tu as le temps d’étudier après ta journée ?', fa: 'بعد از روز کاری وقت برای درس خواندن داری؟' },
      { t: 'Oui, je révise une heure chaque soir.', fa: 'بله، هر شب یک ساعت مرور می‌کنم.' },
    ],
    es: [
      { t: '¿Dónde trabajas ahora y qué tal te va?', fa: 'الان کجا کار می‌کنی و چطور پیش می‌رود؟' },
      { t: 'Trabajo en una empresa pequeña y el ambiente es bueno.', fa: 'در یک شرکت کوچک کار می‌کنم و فضا خوب است.' },
      { t: '¿Estudias también por las tardes?', fa: 'عصرها هم درس می‌خوانی؟' },
      { t: 'Sí, repaso español una hora cada noche.', fa: 'بله، هر شب یک ساعت اسپانیایی مرور می‌کنم.' },
    ],
  },
  'a1-weather': {
    de: [
      { t: 'Wie ist das Wetter heute draußen? Brauche ich einen Schirm?', fa: 'امروز هوا بیرون چطور است؟ چتر لازم دارم؟' },
      { t: 'Es ist ziemlich kühl und bewölkt, vielleicht regnet es bald.', fa: 'کاملاً خنک و ابری است، شاید زود باران ببارد.' },
      { t: 'Soll es am Wochenende wieder wärmer werden?', fa: 'قرار است آخر هفته دوباره گرم‌تر شود؟' },
      { t: 'Ja, am Sonntag scheint wieder die Sonne.', fa: 'بله، یکشنبه دوباره آفتاب می‌تابد.' },
    ],
    fr: [
      { t: 'Quel temps fait-il dehors ce matin ?', fa: 'امروز صبح بیرون هوا چطور است؟' },
      { t: 'Il fait frais et le ciel est gris ; prends un parapluie.', fa: 'خنک است و آسمان ابری است؛ یک چتر بردار.' },
      { t: 'Est-ce qu’il va faire beau ce week-end ?', fa: 'آخر هفته هوا خوب می‌شود؟' },
      { t: 'Oui, il y aura du soleil dimanche après-midi.', fa: 'بله، یکشنبه بعدازظهر آفتاب خواهد بود.' },
    ],
    es: [
      { t: '¿Qué tiempo hace hoy fuera?', fa: 'امروز بیرون هوا چطور است؟' },
      { t: 'Hace frío y está nublado; parece que va a llover.', fa: 'سرد و ابری است؛ به نظر می‌رسد باران ببارد.' },
      { t: '¿Mejorará el tiempo el fin de semana?', fa: 'آخر هفته هوا بهتر می‌شود؟' },
      { t: 'Sí, el sábado hará sol y calor suave.', fa: 'بله، شنبه آفتابی و گرمِ ملایم خواهد بود.' },
    ],
  },
  'a1-phone-messages': {
    de: [
      { s: 'منشی', t: 'Praxis Dr. Klein, guten Tag. Was kann ich für Sie tun?', fa: 'مطب دکتر کلاین، روز بخیر. چه کمکی از دستم برمی‌آید؟' },
      { t: 'Guten Tag, hier spricht Amir. Ist Frau Becker im Büro?', fa: 'روز بخیر، امیر هستم. خانم بکر در دفتر هستند؟' },
      { s: 'منشی', t: 'Sie ist gerade in einer Besprechung. Möchten Sie eine Nachricht hinterlassen?', fa: 'ایشان الان در جلسه هستند. می‌خواهید پیامی بگذارید؟' },
      { t: 'Ja, bitte sagen Sie ihr, dass ich um drei Uhr anrufe.', fa: 'بله، لطفاً به ایشان بگویید ساعت سه تماس می‌گیرم.' },
    ],
    fr: [
      { s: 'منشی', t: 'Cabinet Martin, bonjour. Je vous écoute.', fa: 'دفتر مارتن، روز بخیر. گوش می‌کنم.' },
      { t: 'Bonjour, c’est Amir à l’appareil. Madame Bernard est là ?', fa: 'روز بخیر، امیر پشت خط است. خانم برنار هستند؟' },
      { s: 'منشی', t: 'Elle est en réunion. Voulez-vous laisser un message ?', fa: 'در جلسه هستند. می‌خواهید پیامی بگذارید؟' },
      { t: 'Oui, dites-lui s’il vous plaît que je rappellerai à quinze heures.', fa: 'بله، لطفاً بگویید ساعت سه بعدازظهر دوباره زنگ می‌زنم.' },
    ],
    es: [
      { s: 'منشی', t: 'Oficina central, buenos días. ¿En qué puedo ayudarle?', fa: 'دفتر مرکزی، صبح بخیر. چطور کمک کنم؟' },
      { t: 'Buenos días, soy Amir. ¿Está la señora López?', fa: 'صبح بخیر، امیر هستم. خانم لوپز هستند؟' },
      { s: 'منشی', t: 'Ahora está reunida. ¿Quiere dejar un recado?', fa: 'الان در جلسه هستند. می‌خواهید پیامی بگذارید؟' },
      { t: 'Sí, dígale por favor que volveré a llamar a las tres.', fa: 'بله، لطفاً بگویید ساعت سه دوباره تماس می‌گیرم.' },
    ],
  },
  'a1-invitations': {
    de: [
      { t: 'Hallo! Hast du am Samstag Lust, zusammen einen Kaffee zu trinken?', fa: 'سلام! شنبه حوصله داری با هم یک قهوه بخوریم؟' },
      { t: 'Oh ja, sehr gern! Wo sollen wir uns treffen?', fa: 'اوه بله، با کمال میل! کجا قرار بگذاریم؟' },
      { t: 'Wie wäre es um vier Uhr im Café am Park?', fa: 'ساعت چهار در کافهٔ کنار پارک چطور است؟' },
      { t: 'Das passt mir gut. Ich freue mich schon!', fa: 'خیلی خوب است. از الان خوشحالم!' },
    ],
    fr: [
      { t: 'Salut ! Tu veux prendre un café samedi après-midi ?', fa: 'سلام! شنبه بعدازظهر می‌خواهی یک قهوه بخوریم؟' },
      { t: 'Avec plaisir ! On se retrouve où ?', fa: 'با کمال میل! کجا همدیگر را ببینیم؟' },
      { t: 'À seize heures au café près du parc, ça te va ?', fa: 'ساعت چهار در کافهٔ نزدیک پارک برایت خوب است؟' },
      { t: 'Oui, c’est parfait ! À samedi alors !', fa: 'بله، عالی است! پس تا شنبه!' },
    ],
    es: [
      { t: '¡Hola! ¿Te apetece tomar un café este sábado?', fa: 'سلام! این شنبه حوصله داری یک قهوه بخوریم؟' },
      { t: '¡Sí, me encantaría! ¿Dónde quedamos?', fa: 'بله، خیلی خوشحال می‌شوم! کجا قرار بگذاریم؟' },
      { t: '¿Qué tal a las cuatro en la cafetería del parque?', fa: 'ساعت چهار در کافهٔ پارک چطور است؟' },
      { t: 'Perfecto, allí nos vemos el sábado.', fa: 'عالی، شنبه آنجا می‌بینمت.' },
    ],
  },
  'a1-polite-requests': {
    de: [
      { t: 'Entschuldigung, darf ich hier kurz das Fenster öffnen?', fa: 'ببخشید، اجازه هست اینجا کوتاه پنجره را باز کنم؟' },
      { t: 'Ja, natürlich! Hier drin ist es wirklich warm.', fa: 'بله، حتماً! اینجا واقعاً گرم است.' },
      { t: 'Könnten Sie mir bitte auch das Wörterbuch reichen?', fa: 'می‌توانید لطفاً فرهنگ لغت را هم به من بدهید؟' },
      { t: 'Gern, bitte schön! Brauchen Sie sonst noch etwas?', fa: 'با کمال میل، بفرمایید! چیز دیگری هم لازم دارید؟' },
    ],
    fr: [
      { t: 'Excusez-moi, est-ce que je peux ouvrir un peu la fenêtre ?', fa: 'ببخشید، می‌توانم کمی پنجره را باز کنم؟' },
      { t: 'Oui, bien sûr ! Il fait chaud dans la salle.', fa: 'بله، حتماً! در سالن گرم است.' },
      { t: 'Pourriez-vous aussi me passer le dictionnaire, s’il vous plaît ?', fa: 'می‌توانید فرهنگ لغت را هم به من بدهید، لطفاً؟' },
      { t: 'Voilà ! N’hésitez pas si vous avez besoin d’autre chose.', fa: 'بفرمایید! اگر چیز دیگری لازم داشتید راحت بگویید.' },
    ],
    es: [
      { t: 'Disculpe, ¿puedo abrir un poco la ventana?', fa: 'ببخشید، می‌توانم کمی پنجره را باز کنم؟' },
      { t: 'Sí, claro. Hace bastante calor aquí dentro.', fa: 'بله، حتماً. اینجا داخل کاملاً گرم است.' },
      { t: '¿Podría pasarme también ese diccionario, por favor?', fa: 'می‌توانید آن فرهنگ لغت را هم به من بدهید، لطفاً؟' },
      { t: 'Por supuesto, aquí tiene.', fa: 'حتماً، بفرمایید.' },
    ],
  },
  'a1-instructions': {
    de: [
      { s: 'معلم', t: 'Bitte öffnen Sie jetzt Ihr Buch auf Seite zwölf.', fa: 'لطفاً الان کتابتان را صفحهٔ دوازده باز کنید.' },
      { t: 'Sollen wir die erste Übung allein oder zu zweit machen?', fa: 'تمرین اول را تنها انجام بدهیم یا دونفره؟' },
      { s: 'معلم', t: 'Lesen Sie zuerst den Text leise und vergleichen Sie dann zu zweit.', fa: 'ابتدا متن را آرام بخوانید و بعد دونفره مقایسه کنید.' },
      { t: 'Verstanden! Schreiben wir die Antworten ins Heft?', fa: 'متوجه شدم! جواب‌ها را در دفتر بنویسیم؟' },
    ],
    fr: [
      { s: 'معلم', t: 'Ouvrez votre livre à la page douze, s’il vous plaît.', fa: 'لطفاً کتابتان را صفحهٔ دوازده باز کنید.' },
      { t: 'On fait le premier exercice seul ou à deux ?', fa: 'تمرین اول را تنهایی انجام بدهیم یا دونفره؟' },
      { s: 'معلم', t: 'Lisez d’abord le dialogue, puis répétez les phrases ensemble.', fa: 'ابتدا گفت‌وگو را بخوانید، بعد جمله‌ها را با هم تکرار کنید.' },
      { t: 'D’accord ! On note aussi les nouveaux mots dans le cahier ?', fa: 'باشه! واژه‌های جدید را هم در دفتر یادداشت کنیم؟' },
    ],
    es: [
      { s: 'معلم', t: 'Por favor, abrid el libro por la página doce.', fa: 'لطفاً کتاب را صفحهٔ دوازده باز کنید.' },
      { t: '¿Hacemos el primer ejercicio solos o en parejas?', fa: 'تمرین اول را تنها انجام بدهیم یا دونفره؟' },
      { s: 'معلم', t: 'Leed primero las frases y luego escuchad el audio.', fa: 'ابتدا جمله‌ها را بخوانید و بعد به صوت گوش بدهید.' },
      { t: 'Vale, ¿escribimos las respuestas en el cuaderno?', fa: 'باشه، جواب‌ها را در دفتر بنویسیم؟' },
    ],
  },
  'a1-suggestions': {
    de: [
      { t: 'Was wollen wir heute Abend nach dem Sprachkurs machen?', fa: 'امشب بعد از کلاس زبان می‌خواهیم چه کار کنیم؟' },
      { t: 'Wir können zusammen im Park spazieren gehen oder ins Kino gehen.', fa: 'می‌توانیم با هم در پارک قدم بزنیم یا سینما برویم.' },
      { t: 'Ein Spaziergang klingt super! Sollen wir noch etwas zu essen mitnehmen?', fa: 'پیاده‌روی عالی به نظر می‌رسد! خوراکی هم با خودمان ببریم؟' },
      { t: 'Gute Idee, holen wir vorher zwei Sandwiches.', fa: 'ایدهٔ خوبیه، قبلش دو تا ساندویچ بگیریم.' },
    ],
    fr: [
      { t: 'Qu’est-ce qu’on fait ce soir après le cours ?', fa: 'امشب بعد از کلاس چه کار کنیم؟' },
      { t: 'On peut marcher au bord du fleuve ou voir un film.', fa: 'می‌توانیم کنار رودخانه قدم بزنیم یا فیلم ببینیم.' },
      { t: 'Allons plutôt marcher, il fait bon dehors !', fa: 'بهتر است برویم قدم بزنیم، بیرون هوا خوب است!' },
      { t: 'Bonne idée ! Prenons aussi une bouteille d’eau.', fa: 'ایدهٔ خوبیه! یک بطری آب هم برداریم.' },
    ],
    es: [
      { t: '¿Qué hacemos esta tarde después de clase?', fa: 'امروز عصر بعد از کلاس چه کار کنیم؟' },
      { t: 'Podemos dar un paseo por el parque o ir al cine.', fa: 'می‌توانیم در پارک قدم بزنیم یا برویم سینما.' },
      { t: 'Un paseo suena genial. ¿Tomamos luego un helado?', fa: 'پیاده‌روی عالی است. بعدش بستنی بخوریم؟' },
      { t: '¡Buena idea! A las seis salimos juntos.', fa: 'ایدهٔ خوبیه! ساعت شش با هم بیرون می‌رویم.' },
    ],
  },
  'a1-past-events': {
    de: [
      { t: 'Was hast du gestern nach der Arbeit gemacht?', fa: 'دیروز بعد از کار چه کار کردی؟' },
      { t: 'Ich habe zuerst eingekauft und dann ein leckeres Abendessen gekocht.', fa: 'اول خرید کردم و بعد یک شام خوشمزه پختم.' },
      { t: 'Bist du am Abend noch ausgegangen?', fa: 'عصر دیگر بیرون رفتی؟' },
      { t: 'Nein, ich bin zu Hause geblieben und habe früh geschlafen.', fa: 'نه، خانه ماندم و زود خوابیدم.' },
    ],
    fr: [
      { t: 'Qu’est-ce que tu as fait hier après le travail ?', fa: 'دیروز بعد از کار چه کار کردی؟' },
      { t: 'J’ai fait les courses et j’ai préparé un bon dîner.', fa: 'خرید کردم و یک شام خوب آماده کردم.' },
      { t: 'Tu es sorti le soir ?', fa: 'شب بیرون رفتی؟' },
      { t: 'Non, je suis resté chez moi pour lire tranquillement.', fa: 'نه، خانه ماندم تا با آرامش کتاب بخوانم.' },
    ],
    es: [
      { t: '¿Qué hiciste ayer después del trabajo?', fa: 'دیروز بعد از کار چه کار کردی؟' },
      { t: 'Primero compré fruta y luego cociné una cena ligera.', fa: 'اول میوه خریدم و بعد یک شام سبک پختم.' },
      { t: '¿Saliste por la noche?', fa: 'شب بیرون رفتی؟' },
      { t: 'No, me quedé en casa y descansé temprano.', fa: 'نه، خانه ماندم و زود استراحت کردم.' },
    ],
  },
  'a1-future-plans': {
    de: [
      { t: 'Was planst du für morgen und das Wochenende?', fa: 'برای فردا و آخر هفته چه برنامه‌ای داری؟' },
      { t: 'Morgen besuche ich meinen Freund, und am Sonntag fahre ich ans Meer.', fa: 'فردا به دیدار دوستم می‌روم و یکشنبه کنار دریا می‌روم.' },
      { t: 'Bleibst du dort den ganzen Tag?', fa: 'کل روز را آنجا می‌مانی؟' },
      { t: 'Ja, wir wollen am Abend mit dem letzten Zug zurückfahren.', fa: 'بله، می‌خواهیم عصر با آخرین قطار برگردیم.' },
    ],
    fr: [
      { t: 'Quels sont tes projets pour demain et ce week-end ?', fa: 'برنامه‌هایت برای فردا و آخر هفته چیست؟' },
      { t: 'Demain je vais rendre visite à un ami et dimanche je pars à la mer.', fa: 'فردا به دیدار دوستی می‌روم و یکشنبه کنار دریا می‌روم.' },
      { t: 'Tu vas rester toute la journée là-bas ?', fa: 'کل روز را آنجا می‌مانی؟' },
      { t: 'Oui, je vais rentrer seulement vers vingt heures.', fa: 'بله، فقط حدود ساعت هشت شب برمی‌گردم.' },
    ],
    es: [
      { t: '¿Qué planes tienes para mañana y el fin de semana?', fa: 'برای فردا و آخر هفته چه برنامه‌ای داری؟' },
      { t: 'Mañana voy a visitar a un amigo y el domingo iré a la playa.', fa: 'فردا به دیدن یک دوست می‌روم و یکشنبه به ساحل می‌روم.' },
      { t: '¿Vas a quedarte todo el día?', fa: 'کل روز می‌مانی؟' },
      { t: 'Sí, volveré por la tarde en el último autobús.', fa: 'بله، عصر با آخرین اتوبوس برمی‌گردم.' },
    ],
  },
  'a1-feelings': {
    de: [
      { t: 'Wie fühlst du dich heute vor dem Test?', fa: 'امروز پیش از آزمون چه حسی داری؟' },
      { t: 'Ich bin ein bisschen nervös, aber auch gut gelaunt.', fa: 'کمی مضطربم، اما حالم خوب است.' },
      { t: 'Warum bist du nervös? Du hast doch viel geübt!', fa: 'چرا مضطربی؟ تو که خیلی تمرین کرده‌ای!' },
      { t: 'Das stimmt, nach der Pause bin ich bestimmt ruhiger.', fa: 'درست است، بعد از استراحت حتماً آرام‌تر می‌شوم.' },
    ],
    fr: [
      { t: 'Comment te sens-tu aujourd’hui avant le test ?', fa: 'امروز پیش از امتحان چه حسی داری؟' },
      { t: 'Je suis un peu stressé, mais plutôt content.', fa: 'کمی استرس دارم، ولی در کل خوشحالم.' },
      { t: 'Pourquoi es-tu inquiet ? Tu as bien révisé !', fa: 'چرا نگرانی؟ خوب که مرور کرده‌ای!' },
      { t: 'Tu as raison, ça va mieux maintenant.', fa: 'حق با توست، الان بهترم.' },
    ],
    es: [
      { t: '¿Cómo te sientes hoy antes de la prueba?', fa: 'امروز پیش از امتحان چه احساسی داری؟' },
      { t: 'Estoy un poco nervioso, pero también animado.', fa: 'کمی مضطربم، ولی باانگیزه هم هستم.' },
      { t: '¿Por qué estás nervioso si estudiaste tanto?', fa: 'وقتی این‌قدر خواندی چرا مضطربی؟' },
      { t: 'Tienes razón, ahora ya estoy más tranquilo.', fa: 'حق با توست، الان آرام‌تر هستم.' },
    ],
  },
  'a1-forms-information': {
    de: [
      { s: 'کارمند', t: 'Guten Tag! Bitte füllen Sie dieses kurze Formular aus.', fa: 'روز بخیر! لطفاً این فرم کوتاه را پر کنید.' },
      { t: 'Gern. Muss ich hier meine aktuelle Adresse und Telefonnummer eintragen?', fa: 'با کمال میل. اینجا باید نشانی فعلی و شماره تلفنم را وارد کنم؟' },
      { s: 'کارمند', t: 'Ja, und ganz unten noch das heutige Datum und Ihre Unterschrift.', fa: 'بله، و پایین‌ترین قسمت هم تاریخ امروز و امضایتان را.' },
      { t: 'Alles klar, hier ist das ausgefüllte Formular.', fa: 'کاملاً روشن است، بفرمایید فرم پرشده.' },
    ],
    fr: [
      { s: 'کارمند', t: 'Bonjour ! Pouvez-vous remplir ce petit formulaire ?', fa: 'روز بخیر! می‌توانید این فرم کوتاه را پر کنید؟' },
      { t: 'Oui, je dois écrire mon adresse actuelle et mon numéro de téléphone ?', fa: 'بله، باید نشانی فعلی و شماره تلفنم را بنویسم؟' },
      { s: 'کارمند', t: 'Oui, puis la date d’aujourd’hui et votre signature en bas.', fa: 'بله، و بعد تاریخ امروز و امضایتان در پایین.' },
      { t: 'Voilà, tout est complété. Merci beaucoup !', fa: 'بفرمایید، همه‌چیز تکمیل شد. خیلی ممنون!' },
    ],
    es: [
      { s: 'کارمند', t: '¡Buenos días! Rellene este formulario, por favor.', fa: 'صبح بخیر! لطفاً این فرم را پر کنید.' },
      { t: 'Claro. ¿Escribo aquí mi dirección y mi número de teléfono?', fa: 'حتماً. اینجا نشانی و شماره تلفنم را بنویسم؟' },
      { s: 'کارمند', t: 'Sí, y al final ponga la fecha de hoy y su firma.', fa: 'بله، و در انتها تاریخ امروز و امضایتان را بگذارید.' },
      { t: 'Perfecto, aquí tiene la hoja completa.', fa: 'عالی، بفرمایید برگهٔ کامل‌شده.' },
    ],
  },
  'a1-supermarket': {
    de: [
      { t: 'Entschuldigung, wo finde ich hier frisches Brot und Eier?', fa: 'ببخشید، اینجا نان تازه و تخم‌مرغ کجا پیدا می‌کنم؟' },
      { s: 'فروشنده', t: 'Das Brot liegt ganz hinten rechts, die Eier sind im zweiten Gang.', fa: 'نان ته سالن سمت راست است، تخم‌مرغ‌ها در راهروی دوم هستند.' },
      { t: 'Danke! Haben Sie heute auch frische Tomaten im Angebot?', fa: 'ممنون! امروز گوجه‌فرنگی تازه هم در تخفیف دارید؟' },
      { s: 'فروشنده', t: 'Ja, gleich vorn am Eingang bei dem Gemüse.', fa: 'بله، همان جلو کنار درِ ورودی پیش سبزیجات.' },
    ],
    fr: [
      { t: 'Excusez-moi, où se trouvent le pain frais et les œufs ?', fa: 'ببخشید، نان تازه و تخم‌مرغ کجا هستند؟' },
      { s: 'فروشنده', t: 'Le pain est au fond à droite, et les œufs au rayon deux.', fa: 'نان ته فروشگاه سمت راست است، و تخم‌مرغ‌ها در ردیف دو.' },
      { t: 'Merci ! Avez-vous aussi du lait sans lactose ?', fa: 'ممنون! شیر بدون لاکتوز هم دارید؟' },
      { s: 'فروشنده', t: 'Oui, juste en face dans le rayon frais.', fa: 'بله، درست روبه‌رو در بخش محصولات سرد.' },
    ],
    es: [
      { t: 'Disculpe, ¿dónde están el pan fresco y los huevos?', fa: 'ببخشید، نان تازه و تخم‌مرغ کجا هستند؟' },
      { s: 'فروشنده', t: 'El pan está al fondo a la derecha y los huevos en el pasillo dos.', fa: 'نان در انتها سمت راست است و تخم‌مرغ‌ها در راهروی دو.' },
      { t: 'Gracias. ¿Tienen también leche fresca hoy?', fa: 'ممنون. امروز شیر تازه هم دارید؟' },
      { s: 'فروشنده', t: 'Sí, en la nevera de la izquierda.', fa: 'بله، در یخچال سمت چپ.' },
    ],
  },
  'a1-clothes-shopping': {
    de: [
      { s: 'فروشنده', t: 'Guten Tag! Suchen Sie heute etwas Bestimmtes?', fa: 'روز بخیر! امروز دنبال چیز خاصی می‌گردید؟' },
      { t: 'Ja, ich suche ein weißes Hemd in Größe M.', fa: 'بله، دنبال یک پیراهن سفید سایز M می‌گردم.' },
      { s: 'فروشنده', t: 'Hier ist eins. Möchten Sie es kurz anprobieren?', fa: 'یکی اینجا هست. می‌خواهید کوتاه پرو کنید؟' },
      { t: 'Ja, gern! Wo sind die Umkleidekabinen, bitte?', fa: 'بله، حتماً! اتاق‌های پرو کجا هستند، لطفاً؟' },
    ],
    fr: [
      { s: 'فروشنده', t: 'Bonjour ! Vous cherchez quelque chose en particulier ?', fa: 'روز بخیر! دنبال چیز خاصی می‌گردید؟' },
      { t: 'Oui, je cherche une chemise blanche en taille M.', fa: 'بله، دنبال یک پیراهن سفید سایز M هستم.' },
      { s: 'فروشنده', t: 'Voici ce modèle. Voulez-vous l’essayer ?', fa: 'این مدل هست. می‌خواهید امتحانش کنید؟' },
      { t: 'Oui, volontiers ! Où sont les cabines d’essayage ?', fa: 'بله، با کمال میل! اتاق پرو کجاست؟' },
    ],
    es: [
      { s: 'فروشنده', t: '¡Buenos días! ¿Busca algo en concreto?', fa: 'صبح بخیر! دنبال چیز خاصی می‌گردید؟' },
      { t: 'Sí, busco una camisa blanca de la talla M.', fa: 'بله، دنبال یک پیراهن سفید سایز M می‌گردم.' },
      { s: 'فروشنده', t: 'Aquí tiene una. ¿Quiere probársela?', fa: 'بفرمایید یکی. می‌خواهید پرو کنید؟' },
      { t: 'Sí, por favor. ¿Dónde están los probadores?', fa: 'بله، لطفاً. اتاق‌های پرو کجا هستند؟' },
    ],
  },
  'a1-home-furniture': {
    de: [
      { t: 'Wie ist deine neue Wohnung eingerichtet?', fa: 'آپارتمان جدیدت چطور چیده شده است؟' },
      { t: 'Im Wohnzimmer stehen ein Sofa, ein kleiner Tisch und ein Bücherregal.', fa: 'در اتاق نشیمن یک مبل، یک میز کوچک و یک قفسهٔ کتاب هست.' },
      { t: 'Hast du auch einen Schreibtisch im Schlafzimmer?', fa: 'در اتاق خواب یک میز تحریر هم داری؟' },
      { t: 'Ja, er steht direkt am Fenster, dort ist viel Licht.', fa: 'بله، درست کنار پنجره است، آنجا نور زیاد است.' },
    ],
    fr: [
      { t: 'Comment est meublé ton nouvel appartement ?', fa: 'آپارتمان جدیدت چطور مبله شده است؟' },
      { t: 'Dans le salon, il y a un canapé, une table basse et une bibliothèque.', fa: 'در سالن یک مبل، یک میز کوتاه و یک کتابخانه هست.' },
      { t: 'Et tu as un bureau pour étudier ?', fa: 'و یک میز کار برای مطالعه داری؟' },
      { t: 'Oui, près de la fenêtre dans ma chambre.', fa: 'بله، کنار پنجره در اتاقم.' },
    ],
    es: [
      { t: '¿Cómo es tu piso por dentro?', fa: 'آپارتمانت از داخل چطور است؟' },
      { t: 'En el salón hay un sofá cómodo, una mesa y una estantería.', fa: 'در نشیمن یک مبل راحت، یک میز و یک قفسه هست.' },
      { t: '¿Tienes también una cocina grande?', fa: 'آشپزخانهٔ بزرگی هم داری؟' },
      { t: 'Es pequeña, pero tiene mucha luz natural.', fa: 'کوچک است، ولی نور طبیعی زیادی دارد.' },
    ],
  },
  'a1-leisure': {
    de: [
      { t: 'Was machst du am liebsten in deiner Freizeit?', fa: 'در اوقات فراغتت بیشتر از همه چه کاری دوست داری بکنی؟' },
      { t: 'Ich fahre gern Fahrrad und koche am Wochenende für Freunde.', fa: 'دوچرخه‌سواری دوست دارم و آخر هفته‌ها برای دوستانم آشپزی می‌کنم.' },
      { t: 'Spielst du manchmal auch Schach oder Fußball?', fa: 'گاهی شطرنج یا فوتبال هم بازی می‌کنی؟' },
      { t: 'Ja, sonntags spiele ich oft Fußball im Park.', fa: 'بله، یکشنبه‌ها اغلب در پارک فوتبال بازی می‌کنم.' },
    ],
    fr: [
      { t: 'Qu’est-ce que tu aimes faire pendant ton temps libre ?', fa: 'در وقت آزادت چه کاری دوست داری انجام بدهی؟' },
      { t: 'J’aime faire du vélo et cuisiner le week-end.', fa: 'دوچرخه‌سواری و آشپزی در آخر هفته را دوست دارم.' },
      { t: 'Tu écoutes souvent de la musique ou tu lis ?', fa: 'زیاد موسیقی گوش می‌دهی یا کتاب می‌خوانی؟' },
      { t: 'Je lis tous les soirs avant de dormir.', fa: 'هر شب پیش از خواب کتاب می‌خوانم.' },
    ],
    es: [
      { t: '¿Qué te gusta hacer en tu tiempo libre?', fa: 'در وقت آزادت چه کاری دوست داری؟' },
      { t: 'Me gusta montar en bicicleta y cocinar los domingos.', fa: 'دوچرخه‌سواری و آشپزی در روزهای یکشنبه را دوست دارم.' },
      { t: '¿Practicas algún deporte entre semana?', fa: 'در طول هفته ورزشی هم انجام می‌دهی؟' },
      { t: 'Sí, salgo a correr por el parque dos veces por semana.', fa: 'بله، هفته‌ای دو بار در پارک می‌دوم.' },
    ],
  },
  'a1-weekly-schedule': {
    de: [
      { t: 'Wie sieht eine typische Woche bei dir aus?', fa: 'یک هفتهٔ معمولی برای تو چطور است؟' },
      { t: 'Montags bis freitags arbeite ich, und dienstags gehe ich zum Deutschkurs.', fa: 'از دوشنبه تا جمعه کار می‌کنم و سه‌شنبه‌ها به کلاس آلمانی می‌روم.' },
      { t: 'Wann erledigst du dann den großen Einkauf?', fa: 'پس خرید بزرگ را چه زمانی انجام می‌دهی؟' },
      { t: 'Immer am Samstagvormittag, danach habe ich frei.', fa: 'همیشه شنبه صبح، بعد از آن وقتم آزاد است.' },
    ],
    fr: [
      { t: 'À quoi ressemble ta semaine habituelle ?', fa: 'هفتهٔ معمولی‌ات چطور می‌گذرد؟' },
      { t: 'Je travaille du lundi au vendredi et j’ai cours le mardi soir.', fa: 'از دوشنبه تا جمعه کار می‌کنم و سه‌شنبه‌شب‌ها کلاس دارم.' },
      { t: 'Quand fais-tu du sport alors ?', fa: 'پس کی ورزش می‌کنی؟' },
      { t: 'Le jeudi matin et le samedi après-midi.', fa: 'پنجشنبه صبح و شنبه بعدازظهر.' },
    ],
    es: [
      { t: '¿Cómo es tu horario semanal normalmente?', fa: 'برنامهٔ هفتگی معمولی‌ات چطور است؟' },
      { t: 'Trabajo de lunes a viernes y tengo clase los miércoles.', fa: 'از دوشنبه تا جمعه کار می‌کنم و چهارشنبه‌ها کلاس دارم.' },
      { t: '¿Qué haces los fines de semana?', fa: 'آخر هفته‌ها چه کار می‌کنی؟' },
      { t: 'El sábado hago la compra y el domingo descanso.', fa: 'شنبه خرید می‌کنم و یکشنبه استراحت می‌کنم.' },
    ],
  },
  'a1-preferences': {
    de: [
      { t: 'Möchtest du nach dem Unterricht lieber Tee oder Kaffee trinken?', fa: 'بعد از کلاس ترجیح می‌دهی چای بنوشی یا قهوه؟' },
      { t: 'Ich trinke lieber grünen Tee mit ein bisschen Zitrone.', fa: 'چای سبز با کمی لیمو را ترجیح می‌دهم.' },
      { t: 'Und sitzt du im Café lieber drinnen oder draußen?', fa: 'و در کافه ترجیح می‌دهی داخل بنشینی یا بیرون؟' },
      { t: 'Bei diesem schönen Wetter sitze ich am liebsten draußen.', fa: 'در این هوای خوب بیش از همه بیرون نشستن را دوست دارم.' },
    ],
    fr: [
      { t: 'Après le cours, tu préfères prendre un thé ou un café ?', fa: 'بعد از کلاس چای ترجیح می‌دهی یا قهوه؟' },
      { t: 'Je préfère un thé vert avec un peu de citron.', fa: 'چای سبز با کمی لیمو ترجیح می‌دهم.' },
      { t: 'On s’assoit à l’intérieur ou en terrasse ?', fa: 'داخل بنشینیم یا در تراس بیرون؟' },
      { t: 'En terrasse, s’il te plaît ; il fait doux aujourd’hui.', fa: 'در تراس لطفاً؛ امروز هوا ملایم است.' },
    ],
    es: [
      { t: 'Después de clase, ¿prefieres tomar té o café?', fa: 'بعد از کلاس چای ترجیح می‌دهی یا قهوه؟' },
      { t: 'Prefiero un té verde caliente, gracias.', fa: 'یک چای سبز داغ ترجیح می‌دهم، ممنون.' },
      { t: '¿Nos sentamos dentro o en la terraza?', fa: 'داخل بنشینیم یا در فضای باز؟' },
      { t: 'En la terraza mejor, hace muy buen día.', fa: 'در فضای باز بهتر است، امروز هوا خیلی خوب است.' },
    ],
  },
  'a1-comparisons': {
    de: [
      { t: 'Welches Wörterbuch findest du besser — das große oder das kleine?', fa: 'به نظرت کدام فرهنگ لغت بهتر است — بزرگ یا کوچک؟' },
      { t: 'Das kleine ist leichter, aber das große hat viel mehr Beispiele.', fa: 'کوچک سبک‌تر است، اما بزرگ مثال‌های خیلی بیشتری دارد.' },
      { t: 'Und ist der Bus schneller als die U-Bahn?', fa: 'و اتوبوس سریع‌تر از مترو است؟' },
      { t: 'Nein, die U-Bahn ist viel schneller und pünktlicher.', fa: 'نه، مترو خیلی سریع‌تر و به‌موقع‌تر است.' },
    ],
    fr: [
      { t: 'Quel dictionnaire est meilleur : le grand ou le petit ?', fa: 'کدام فرهنگ لغت بهتر است: بزرگ یا کوچک؟' },
      { t: 'Le petit est plus léger, mais le grand est plus complet.', fa: 'کوچک سبک‌تر است، ولی بزرگ کامل‌تر است.' },
      { t: 'Le bus est-il plus rapide que le métro ici ?', fa: 'اینجا اتوبوس از مترو سریع‌تر است؟' },
      { t: 'Non, le métro est beaucoup plus rapide aux heures de pointe.', fa: 'نه، مترو در ساعات شلوغی خیلی سریع‌تر است.' },
    ],
    es: [
      { t: '¿Qué diccionario te parece mejor, el grande o el pequeño?', fa: 'به نظرت کدام فرهنگ لغت بهتر است، بزرگ یا کوچک؟' },
      { t: 'El pequeño es más ligero, pero el grande tiene más ejemplos.', fa: 'کوچک سبک‌تر است، ولی بزرگ مثال‌های بیشتری دارد.' },
      { t: '¿Y el autobús es más rápido que el metro?', fa: 'و اتوبوس سریع‌تر از مترو است؟' },
      { t: 'No, el metro es mucho más rápido.', fa: 'نه، مترو خیلی سریع‌تر است.' },
    ],
  },
  'a1-reasons': {
    de: [
      { t: 'Warum bleibst du heute Abend zu Hause?', fa: 'چرا امشب خانه می‌مانی؟' },
      { t: 'Ich bleibe zu Hause, weil ich morgen eine wichtige Prüfung habe.', fa: 'خانه می‌مانم چون فردا یک امتحان مهم دارم.' },
      { t: 'Gehst du deshalb auch nicht zum Abendessen mit?', fa: 'به همین خاطر به شام هم نمی‌آیی؟' },
      { t: 'Genau, aber nach der Prüfung feiern wir zusammen!', fa: 'دقیقاً، اما بعد از امتحان با هم جشن می‌گیریم!' },
    ],
    fr: [
      { t: 'Pourquoi restes-tu chez toi ce soir ?', fa: 'چرا امشب خانه می‌مانی؟' },
      { t: 'Je reste à la maison parce que j’ai un examen demain matin.', fa: 'خانه می‌مانم چون فردا صبح امتحان دارم.' },
      { t: 'C’est pour ça que tu ne viens pas dîner avec nous ?', fa: 'برای همین با ما برای شام نمی‌آیی؟' },
      { t: 'Oui, mais on se rattrape dès vendredi soir !', fa: 'بله، ولی همان جمعه‌شب جبرانش می‌کنیم!' },
    ],
    es: [
      { t: '¿Por qué te quedas en casa esta noche?', fa: 'چرا امشب خانه می‌مانی؟' },
      { t: 'Me quedo en casa porque mañana tengo un examen temprano.', fa: 'خانه می‌مانم چون فردا صبح زود امتحان دارم.' },
      { t: '¿Por eso no vienes a cenar con nosotros?', fa: 'به همین دلیل با ما برای شام نمی‌آیی؟' },
      { t: 'Sí, pero el viernes salimos juntos sin falta.', fa: 'بله، ولی جمعه حتماً با هم بیرون می‌رویم.' },
    ],
  },
  'a1-connected-conversation': {
    de: [
      { t: 'Hallo! Ich bin Jonas. Kommst du öfter in diese Bibliothek?', fa: 'سلام! من یوناس هستم. زیاد به این کتابخانه می‌آیی؟' },
      { t: 'Hallo Jonas, ich bin Mina. Ja, ich lerne hier jeden Dienstag und Donnerstag.', fa: 'سلام یوناس، من مینا هستم. بله، هر سه‌شنبه و پنجشنبه اینجا درس می‌خوانم.' },
      { t: 'Super! Wollen wir am Donnerstag nach dem Lernen einen Tee trinken?', fa: 'عالی! پنجشنبه بعد از درس با هم یک چای بنوشیم؟' },
      { t: 'Gern! Treffen wir uns um fünf Uhr am Eingang.', fa: 'حتماً! ساعت پنج دم ورودی همدیگر را ببینیم.' },
    ],
    fr: [
      { t: 'Bonjour ! Moi c’est Thomas. Tu viens souvent étudier ici ?', fa: 'روز بخیر! من توما هستم. زیاد برای درس خواندن اینجا می‌آیی؟' },
      { t: 'Bonjour Thomas, je suis Mina. Oui, je viens tous les mardis et jeudis.', fa: 'روز بخیر توما، من مینا هستم. بله، هر سه‌شنبه و پنجشنبه می‌آیم.' },
      { t: 'Chouette ! On prend un café jeudi après nos révisions ?', fa: 'عالی! پنجشنبه بعد از مرورمان یک قهوه بخوریم؟' },
      { t: 'Avec plaisir ! Rendez-vous à dix-sept heures devant l’entrée.', fa: 'با کمال میل! ساعت پنج عصر جلوی ورودی قرارمان.' },
    ],
    es: [
      { t: '¡Hola! Soy Carlos. ¿Vienes mucho a estudiar a esta biblioteca?', fa: 'سلام! من کارلوس هستم. زیاد برای درس خواندن به این کتابخانه می‌آیی؟' },
      { t: 'Hola Carlos, soy Mina. Sí, estudio aquí todos los martes y jueves.', fa: 'سلام کارلوس، من مینا هستم. بله، هر سه‌شنبه و پنجشنبه اینجا می‌خوانم.' },
      { t: '¡Genial! ¿Tomamos un café el jueves al salir?', fa: 'عالی! پنجشنبه موقع بیرون آمدن یک قهوه بخوریم؟' },
      { t: '¡Claro! Quedamos a las cinco en la puerta.', fa: 'حتماً! ساعت پنج دم در قرار می‌گذاریم.' },
    ],
  },
});

export const STARTER_A1_PART2_DIALOGUES: DialogueMap = {
  ...SHARED_PART2,
  'de-a1-room-search': [
    { speaker: 'صاحب‌خانه', role: 'partner', text: 'Hallo! Sie interessieren sich für das helle Zimmer in meiner Wohnung?', fa: 'سلام! به اتاق روشن داخل آپارتمان من علاقه‌مند هستید؟' },
    { speaker: 'شما', role: 'learner', text: 'Ja, genau! Wie hoch ist die monatliche Miete inklusive Nebenkosten?', fa: 'بله، دقیقاً! اجارهٔ ماهانه با هزینه‌های جانبی چقدر است؟' },
    { speaker: 'صاحب‌خانه', role: 'partner', text: 'Sie beträgt vierhundertachtzig Euro. Die U-Bahn ist drei Minuten entfernt.', fa: 'چهارصدوهشتاد یورو است. مترو سه دقیقه فاصله دارد.' },
    { speaker: 'شما', role: 'learner', text: 'Das klingt super! Wann kann ich mir das Zimmer ansehen?', fa: 'عالی به نظر می‌رسد! چه زمانی می‌توانم اتاق را ببینم؟' },
  ],
  'fr-a1-appointment-time': [
    { speaker: 'منشی', role: 'partner', text: 'Bonjour ! Vous souhaitez prendre rendez-vous avec un conseiller ?', fa: 'روز بخیر! می‌خواهید با یک مشاور وقت بگیرید؟' },
    { speaker: 'شما', role: 'learner', text: 'Oui, s’il vous plaît. Auriez-vous une disponibilité mardi matin ?', fa: 'بله، لطفاً. سه‌شنبه صبح وقت خالی دارید؟' },
    { speaker: 'منشی', role: 'partner', text: 'Mardi est complet, mais mercredi à dix heures trente est libre.', fa: 'سه‌شنبه پر است، اما چهارشنبه ساعت ده و نیم خالی است.' },
    { speaker: 'شما', role: 'learner', text: 'Mercredi à dix heures trente me convient très bien. Merci !', fa: 'چهارشنبه ساعت ده و نیم کاملاً برایم مناسب است. ممنون!' },
  ],
  'es-a1-metro-directions': [
    { speaker: 'کارمند مترو', role: 'partner', text: '¡Buenos días! ¿Busca alguna línea de metro en particular?', fa: 'صبح بخیر! دنبال خط متروی خاصی می‌گردید؟' },
    { speaker: 'شما', role: 'learner', text: 'Sí, ¿qué línea debo tomar para ir al Museo del Prado?', fa: 'بله، برای رفتن به موزهٔ پرادو کدام خط را باید سوار شوم؟' },
    { speaker: 'کارمند مترو', role: 'partner', text: 'Tome la línea uno hasta la estación Atocha, son cuatro paradas.', fa: 'خط یک را تا ایستگاه آتوچا سوار شوید، چهار ایستگاه است.' },
    { speaker: 'شما', role: 'learner', text: 'Muchas gracias. ¿Un billete sencillo cuesta dos euros?', fa: 'خیلی ممنون. یک بلیت یک‌طرفه دو یورو است؟' },
  ],
};
