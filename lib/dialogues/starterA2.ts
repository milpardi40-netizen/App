import { buildTriMap } from './starterA1Part1';
import type { DialogueMap } from './types';

export const STARTER_A2_DIALOGUES: DialogueMap = buildTriMap({
  'a2-present': {
    de: [
      { s: 'همکار', t: 'Guten Morgen! Woran arbeitest du heute Vormittag?', fa: 'صبح بخیر! امروز صبح روی چه کاری کار می‌کنی؟' },
      { t: 'Ich bereite gerade die Präsentation für die Kundenbesprechung vor.', fa: 'الان دارم ارائه را برای جلسهٔ مشتری آماده می‌کنم.' },
      { s: 'همکار', t: 'Hast du danach Zeit für ein kurzes Mittagessen?', fa: 'بعدش برای یک ناهار کوتاه وقت داری؟' },
      { t: 'Ja, um halb eins passt es mir perfekt.', fa: 'بله، ساعت دوازده و نیم کاملاً برایم مناسب است.' },
    ],
    fr: [
      { s: 'همکار', t: 'Bonjour ! Sur quel dossier travailles-tu ce matin ?', fa: 'روز بخیر! امروز صبح روی کدام پرونده کار می‌کنی؟' },
      { t: 'Je prépare la présentation pour la réunion de onze heures.', fa: 'دارم ارائه را برای جلسهٔ ساعت یازده آماده می‌کنم.' },
      { s: 'همکار', t: 'Tu es libre pour déjeuner ensemble vers midi et demi ?', fa: 'حدود دوازده و نیم برای ناهار با هم آزادی؟' },
      { t: 'Oui, avec plaisir ! Retrouvons-nous devant l’accueil.', fa: 'بله، با کمال میل! جلوی پذیرش همدیگر را ببینیم.' },
    ],
    es: [
      { s: 'همکار', t: '¡Buenos días! ¿En qué trabajas esta mañana?', fa: 'صبح بخیر! امروز صبح روی چه کاری کار می‌کنی؟' },
      { t: 'Estoy preparando la presentación para la reunión de las once.', fa: 'دارم ارائهٔ جلسهٔ ساعت یازده را آماده می‌کنم.' },
      { s: 'همکار', t: '¿Luego tienes tiempo para comer juntos?', fa: 'بعدش وقت داری با هم ناهار بخوریم؟' },
      { t: 'Sí, a la una me viene muy bien.', fa: 'بله، ساعت یک خیلی برایم خوب است.' },
    ],
  },
  'a2-routine-now': {
    de: [
      { t: 'Gehst du normalerweise jeden Morgen vor der Arbeit joggen?', fa: 'معمولاً هر صبح پیش از کار به دویدن می‌روی؟' },
      { t: 'Ja, meistens schon, aber heute mache ich ausnahmsweise eine Pause.', fa: 'بله، بیشتر روزها می‌روم، اما امروز به صورت استثنا استراحت می‌کنم.' },
      { t: 'Was machst du stattdessen gerade jetzt?', fa: 'به‌جایش الان چه کار می‌کنی؟' },
      { t: 'Ich trinke in Ruhe Kaffee und lese die Nachrichten.', fa: 'با آرامش قهوه می‌نوشم و خبرها را می‌خوانم.' },
    ],
    fr: [
      { t: 'Tu vas courir tous les matins avant le bureau d’habitude ?', fa: 'معمولاً هر صبح قبل از دفتر می‌روی بدوی؟' },
      { t: 'Oui, en général, mais aujourd’hui je prends une matinée calme.', fa: 'بله، معمولاً همین‌طور است، ولی امروز یک صبح آرام می‌گیرم.' },
      { t: 'Tu fais quoi en ce moment à la place ?', fa: 'الان به‌جایش چه کار می‌کنی؟' },
      { t: 'Je bois mon café tranquillement en écoutant la radio.', fa: 'قهوه‌ام را با آرامش می‌نوشم و رادیو گوش می‌دهم.' },
    ],
    es: [
      { t: '¿Sueles salir a correr todas las mañanas antes de trabajar?', fa: 'معمولاً هر صبح قبل از کار می‌روی بدوی؟' },
      { t: 'Sí, casi siempre, pero hoy estoy descansando un poco más.', fa: 'بله، تقریباً همیشه، ولی امروز کمی بیشتر استراحت می‌کنم.' },
      { t: '¿Y qué estás haciendo ahora en lugar de correr?', fa: 'و الان به‌جای دویدن چه کار می‌کنی؟' },
      { t: 'Estoy desayunando despacio y leyendo el periódico.', fa: 'دارم آرام صبحانه می‌خورم و روزنامه می‌خوانم.' },
    ],
  },
  'a2-past-activities': {
    de: [
      { t: 'Wie war dein gestriger Ausflug mit deinen Freunden?', fa: 'گردش دیروزت با دوستانت چطور بود؟' },
      { t: 'Wunderbar! Wir sind früh abgefahren und haben ein altes Schloss besucht.', fa: 'عالی! زود حرکت کردیم و از یک قلعهٔ قدیمی دیدن کردیم.' },
      { t: 'Seid ihr abends noch essen gegangen?', fa: 'عصر هم برای شام بیرون رفتید؟' },
      { t: 'Ja, wir haben am See zu Abend gegessen und sind spät zurückgekommen.', fa: 'بله، کنار دریاچه شام خوردیم و دیر برگشتیم.' },
    ],
    fr: [
      { t: 'Comment s’est passée ta journée d’hier avec tes amis ?', fa: 'دیروزت با دوستانت چطور گذشت؟' },
      { t: 'Très bien ! Nous sommes partis tôt pour visiter un vieux château.', fa: 'خیلی خوب! زود راه افتادیم تا یک قلعهٔ قدیمی را ببینیم.' },
      { t: 'Vous avez dîné là-bas le soir ?', fa: 'شب هم آنجا شام خوردید؟' },
      { t: 'Oui, nous avons mangé près du lac avant de rentrer en train.', fa: 'بله، پیش از برگشتن با قطار کنار دریاچه شام خوردیم.' },
    ],
    es: [
      { t: '¿Qué tal fue tu excursión de ayer con tus amigos?', fa: 'گردش دیروزت با دوستانت چطور بود؟' },
      { t: '¡Genial! Salimos temprano y visitamos un castillo antiguo.', fa: 'عالی! زود راه افتادیم و از یک قلعهٔ قدیمی دیدن کردیم.' },
      { t: '¿Cenasteis por allí antes de volver?', fa: 'قبل از برگشتن همان اطراف شام خوردید؟' },
      { t: 'Sí, cenamos junto al lago y volvimos a las diez.', fa: 'بله، کنار دریاچه شام خوردیم و ساعت ده برگشتیم.' },
    ],
  },
  'a2-experiences': {
    de: [
      { t: 'Warst du schon einmal in den Bergen im Süden?', fa: 'تا حالا به کوه‌های جنوب رفته‌ای؟' },
      { t: 'Ja, vor zwei Jahren bin ich dort drei Tage gewandert.', fa: 'بله، دو سال پیش آنجا سه روز کوهپیمایی کردم.' },
      { t: 'Und hast du diese Woche schon unsere neue Ausstellung gesehen?', fa: 'و این هفته نمایشگاه جدیدمان را دیده‌ای؟' },
      { t: 'Noch nicht, aber ich habe mir schon eine Eintrittskarte gekauft.', fa: 'هنوز نه، ولی بلیت ورودش را همین الان خریده‌ام.' },
    ],
    fr: [
      { t: 'Tu es déjà allé dans les Alpes en été ?', fa: 'تا حالا تابستان به کوه‌های آلپ رفته‌ای؟' },
      { t: 'Oui, il y a deux ans j’y ai fait plusieurs belles randonnées.', fa: 'بله، دو سال پیش آنجا چند کوهپیمایی زیبا انجام دادم.' },
      { t: 'Et tu as déjà visité le nouveau musée du quartier ?', fa: 'و از موزهٔ جدید محله هم دیدن کرده‌ای؟' },
      { t: 'Pas encore, mais j’ai déjà réservé mon billet pour samedi.', fa: 'هنوز نه، اما بلیتم را برای شنبه رزرو کرده‌ام.' },
    ],
    es: [
      { t: '¿Has estado alguna vez en la sierra del norte?', fa: 'تا حالا به کوهستان شمال رفته‌ای؟' },
      { t: 'Sí, hace dos años pasé allí tres días haciendo senderismo.', fa: 'بله، دو سال پیش سه روز آنجا پیاده‌روی کوهستانی کردم.' },
      { t: '¿Y ya has visto la exposición nueva del museo?', fa: 'و نمایشگاه جدید موزه را دیده‌ای؟' },
      { t: 'Todavía no, pero ya he comprado la entrada para el sábado.', fa: 'هنوز نه، ولی بلیت شنبه را همین الان خریده‌ام.' },
    ],
  },
  'a2-future-arrangements': {
    de: [
      { t: 'Treffen wir uns morgen Nachmittag, um die Reise zu planen?', fa: 'فردا بعدازظهر همدیگر را ببینیم تا سفر را برنامه‌ریزی کنیم؟' },
      { t: 'Gern! Ich habe ab fünf Uhr frei. Wo sollen wir hin?', fa: 'حتماً! از ساعت پنج وقتم آزاد است. کجا برویم؟' },
      { t: 'In der Bäckerei am Eck gibt es gute Tische. Passt fünf Uhr dreißig?', fa: 'در نانوایی/کافهٔ سر نبش میزهای خوبی هست. ساعت پنج و نیم مناسب است؟' },
      { t: 'Ja, fünf Uhr dreißig ist abgemacht! Ich bringe die Karte mit.', fa: 'بله، پنج و نیم قطعی است! من نقشه را می‌آورم.' },
    ],
    fr: [
      { t: 'On se retrouve demain après-midi pour organiser le voyage ?', fa: 'فردا بعدازظهر همدیگر را ببینیم تا سفر را هماهنگ کنیم؟' },
      { t: 'Volontiers ! Je suis libre dès dix-sept heures. Où préfères-tu ?', fa: 'با کمال میل! از ساعت پنج آزادم. کجا را ترجیح می‌دهی؟' },
      { t: 'À la boulangerie du coin, à dix-sept heures trente, ça marche ?', fa: 'در نانوایی سر کوچه ساعت پنج و نیم خوب است؟' },
      { t: 'Parfait, c’est noté ! J’apporterai les horaires des trains.', fa: 'عالی، ثبت شد! من جدول قطارها را می‌آورم.' },
    ],
    es: [
      { t: '¿Quedamos mañana por la tarde para organizar el viaje?', fa: 'فردا عصر قرار بگذاریم تا سفر را هماهنگ کنیم؟' },
      { t: '¡Claro! Salgo a las cinco. ¿Dónde nos vemos?', fa: 'حتماً! ساعت پنج کارم تمام می‌شود. کجا همدیگر را ببینیم؟' },
      { t: '¿Te parece bien a las cinco y media en la cafetería de la plaza?', fa: 'ساعت پنج و نیم در کافهٔ میدان برایت خوب است؟' },
      { t: 'Sí, perfecto. Yo llevo la lista de hoteles.', fa: 'بله، عالی است. من فهرست هتل‌ها را می‌آورم.' },
    ],
  },
  'a2-shopping-return': {
    de: [
      { s: 'فروشنده', t: 'Guten Tag! Wie kann ich Ihnen heute helfen?', fa: 'روز بخیر! امروز چطور می‌توانم کمکتان کنم؟' },
      { t: 'Ich möchte diesen Pullover umtauschen; er ist mir leider zu klein.', fa: 'می‌خواهم این پلیور را تعویض کنم؛ متأسفانه برایم کوچک است.' },
      { s: 'فروشنده', t: 'Haben Sie den Kassenbon dabei? Wir haben noch Größe L da.', fa: 'رسید خرید را همراه دارید؟ سایز L هنوز داریم.' },
      { t: 'Ja, hier ist der Bon. Vielen Dank für den schnellen Umtausch!', fa: 'بله، این رسید است. خیلی ممنون بابت تعویض سریع!' },
    ],
    fr: [
      { s: 'فروشنده', t: 'Bonjour ! Je peux vous aider ?', fa: 'روز بخیر! می‌توانم کمکتان کنم؟' },
      { t: 'Je voudrais échanger ce pull, il est un peu trop petit.', fa: 'می‌خواهم این پلیور را عوض کنم، کمی زیادی کوچک است.' },
      { s: 'فروشنده', t: 'Avez-vous le ticket de caisse ? Je peux vous donner la taille au-dessus.', fa: 'رسید صندوق را دارید؟ می‌توانم سایز بزرگ‌ترش را بدهم.' },
      { t: 'Oui, le voici ! Merci beaucoup pour l’échange.', fa: 'بله، بفرمایید! خیلی ممنون بابت تعویض.' },
    ],
    es: [
      { s: 'فروشنده', t: '¡Buenos días! ¿En qué puedo ayudarle?', fa: 'صبح بخیر! چطور می‌توانم کمکتان کنم؟' },
      { t: 'Quisiera cambiar este jersey porque me queda pequeño.', fa: 'می‌خواهم این پلیور را عوض کنم چون برایم کوچک است.' },
      { s: 'فروشنده', t: '¿Trae el recibo de compra? Tengo una talla más grande.', fa: 'رسید خرید را آورده‌اید؟ یک سایز بزرگ‌تر دارم.' },
      { t: 'Sí, aquí está el recibo. ¡Muchas gracias!', fa: 'بله، این رسید است. خیلی ممنون!' },
    ],
  },
  'a2-comparison-quantity': {
    de: [
      { t: 'Wie viel kosten die großen Äpfel im Vergleich zu den kleinen?', fa: 'سیب‌های درشت در مقایسه با کوچک‌ها چقدر قیمت دارند؟' },
      { t: 'Die kleinen sind günstiger, aber die großen sind viel saftiger.', fa: 'کوچک‌ها ارزان‌ترند، اما درشت‌ها خیلی آبدارترند.' },
      { t: 'Wie viel sollen wir für den Kuchen kaufen?', fa: 'برای کیک چقدر باید بخریم؟' },
      { t: 'Ein Kilo Äpfel und ein halbes Pfund Zucker reichen völlig.', fa: 'یک کیلو سیب و نیم پوند شکر کاملاً کافی است.' },
    ],
    fr: [
      { t: 'Quelle différence de prix y a-t-il entre ces deux fromages ?', fa: 'تفاوت قیمت بین این دو پنیر چقدر است؟' },
      { t: 'Celui de droite est moins cher, mais celui de gauche est plus doux.', fa: 'سمت راستی ارزان‌تر است، ولی سمت چپی ملایم‌تر است.' },
      { t: 'Quelle quantité prenons-nous pour ce soir ?', fa: 'برای امشب چه مقدار بگیریم؟' },
      { t: 'Deux cents grammes suffisent largement pour quatre personnes.', fa: 'دویست گرم برای چهار نفر کاملاً کافی است.' },
    ],
    es: [
      { t: '¿Cuál es la diferencia entre estas dos cajas de naranjas?', fa: 'تفاوت بین این دو جعبه پرتقال چیست؟' },
      { t: 'La pequeña es más barata, pero la grande sale mejor por kilo.', fa: 'کوچک‌تر ارزان‌تر است، ولی بزرگ‌تر کیلویی به‌صرفه‌تر است.' },
      { t: '¿Cuántas necesitamos para el desayuno de la semana?', fa: 'برای صبحانهٔ این هفته چند تا نیاز داریم؟' },
      { t: 'Con dos kilos tendremos suficiente para toda la semana.', fa: 'با دو کیلو برای کل هفته کافی خواهیم داشت.' },
    ],
  },
  'a2-necessity-advice': {
    de: [
      { t: 'Darf man in der Leseecke der Bibliothek leise telefonieren?', fa: 'در گوشهٔ مطالعهٔ کتابخانه اجازه هست آرام تلفنی صحبت کرد؟' },
      { t: 'Nein, dort muss man das Handy stumm schalten und draußen telefonieren.', fa: 'نه، آنجا باید گوشی را بی‌صدا کرد و بیرون صحبت کرد.' },
      { t: 'Und muss ich meinen Ausweis jedes Mal mitbringen?', fa: 'و باید کارت عضویتم را هر بار بیاورم؟' },
      { t: 'Ja, zum Ausleihen solltest du ihn immer dabei haben.', fa: 'بله، برای امانت گرفتن کتاب بهتر است همیشه همراهت باشد.' },
    ],
    fr: [
      { t: 'Est-ce qu’on peut téléphoner doucement dans la salle de lecture ?', fa: 'در سالن مطالعه می‌شود آرام تلفنی صحبت کرد؟' },
      { t: 'Non, il faut éteindre la sonnerie et sortir dans le couloir.', fa: 'نه، باید زنگ را قطع کرد و به راهرو رفت.' },
      { t: 'Et dois-je apporter ma carte à chaque visite ?', fa: 'و آیا در هر بار مراجعه باید کارتم را بیاورم؟' },
      { t: 'Oui, tu devrais toujours la garder sur toi pour emprunter un livre.', fa: 'بله، برای امانت گرفتن کتاب باید همیشه همراهت نگه داری.' },
    ],
    es: [
      { t: '¿Se puede hablar por teléfono en voz baja dentro de la biblioteca?', fa: 'داخل کتابخانه می‌شود آرام با تلفن صحبت کرد؟' },
      { t: 'No, hay que poner el móvil en silencio y salir al pasillo.', fa: 'نه، باید گوشی را بی‌صدا کرد و به راهرو رفت.' },
      { t: '¿Y tengo que traer el carné cada vez que vengo?', fa: 'و هر بار که می‌آیم باید کارت را بیاورم؟' },
      { t: 'Sí, deberías llevarlo siempre si quieres sacar libros.', fa: 'بله، اگر می‌خواهی کتاب امانت بگیری باید همیشه همراهت باشد.' },
    ],
  },
  'a2-hotel-change': {
    de: [
      { s: 'پذیرش', t: 'Guten Tag! Wie kann ich Ihnen bei Ihrer Buchung helfen?', fa: 'روز بخیر! چطور می‌توانم در رزروتان کمکتان کنم؟' },
      { t: 'Ich habe ein Zimmer ab Freitag gebucht, möchte aber schon am Donnerstag anreisen.', fa: 'اتاق را از جمعه رزرو کرده‌ام، اما می‌خواهم از پنجشنبه برسم.' },
      { s: 'پذیرش', t: 'Einen Moment, ich prüfe das. Ja, am Donnerstag ist noch ein ruhiges Zimmer frei.', fa: 'یک لحظه بررسی کنم. بله، پنجشنبه هنوز یک اتاق آرام خالی است.' },
      { t: 'Wunderbar! Bleibt der Preis pro Nacht derselbe?', fa: 'عالی! آیا قیمت هر شب همان می‌ماند؟' },
    ],
    fr: [
      { s: 'پذیرش', t: 'Bonjour ! Que puis-je faire pour votre réservation ?', fa: 'روز بخیر! برای رزروتان چه کاری می‌توانم انجام بدهم؟' },
      { t: 'J’ai réservé à partir de vendredi, mais je voudrais arriver jeudi soir.', fa: 'از جمعه رزرو کرده‌ام، اما می‌خواهم پنجشنبه‌شب برسم.' },
      { s: 'پذیرش', t: 'Je vérifie tout de suite. Oui, nous avons encore une chambre libre jeudi.', fa: 'همین الان بررسی می‌کنم. بله، پنجشنبه هنوز یک اتاق خالی داریم.' },
      { t: 'Parfait ! Pouvez-vous me confirmer le nouveau total par e-mail ?', fa: 'عالی! می‌توانید جمع جدید را با ایمیل تأیید کنید؟' },
    ],
    es: [
      { s: 'پذیرش', t: '¡Buenos días! ¿En qué puedo ayudarle con su reserva?', fa: 'صبح بخیر! دربارهٔ رزروتان چطور کمک کنم؟' },
      { t: 'Reservé desde el viernes, pero necesito llegar un día antes, el jueves.', fa: 'از جمعه رزرو کرده‌ام، اما باید یک روز زودتر، پنجشنبه برسم.' },
      { s: 'پذیرش', t: 'Un segundo, lo compruebo. Sí, queda una habitación tranquila para el jueves.', fa: 'یک ثانیه، بررسی می‌کنم. بله، برای پنجشنبه یک اتاق آرام مانده است.' },
      { t: 'Genial, ¿se mantiene la misma tarifa por noche?', fa: 'عالی، نرخ هر شب همان می‌ماند؟' },
    ],
  },
  'a2-health-symptoms': {
    de: [
      { s: 'داروساز', t: 'Guten Tag! Was kann ich für Sie tun?', fa: 'روز بخیر! چه کمکی از دستم برمی‌آید؟' },
      { t: 'Ich habe seit zwei Tagen Husten und fühle mich sehr schwach.', fa: 'دو روز است سرفه دارم و خیلی احساس ضعف می‌کنم.' },
      { s: 'داروساز', t: 'Haben Sie auch Fieber oder nehmen Sie schon andere Medikamente?', fa: 'تب هم دارید یا الان داروی دیگری مصرف می‌کنید؟' },
      { t: 'Kein hohes Fieber und keine anderen Medikamente. Was empfehlen Sie?', fa: 'تب بالا ندارم و داروی دیگری هم نمی‌خورم. چه توصیه می‌کنید؟' },
    ],
    fr: [
      { s: 'داروساز', t: 'Bonjour ! Qu’est-ce qui vous amène ?', fa: 'روز بخیر! چه مشکلی پیش آمده؟' },
      { t: 'Je tousse depuis deux jours et j’ai très mal à la gorge.', fa: 'دو روز است سرفه می‌کنم و گلویم خیلی درد می‌کند.' },
      { s: 'داروساز', t: 'Avez-vous de la fièvre ou des allergies connues ?', fa: 'تب یا حساسیت شناخته‌شده‌ای دارید؟' },
      { t: 'Pas de fièvre, et aucune allergie. Que me conseillez-vous ?', fa: 'تب ندارم، و هیچ حساسیتی هم نه. چه توصیه می‌کنید؟' },
    ],
    es: [
      { s: 'داروساز', t: '¡Buenos días! ¿Qué síntomas tiene?', fa: 'صبح بخیر! چه علائمی دارید؟' },
      { t: 'Tengo tos desde hace dos días y me siento muy cansado.', fa: 'دو روز است سرفه دارم و خیلی احساس خستگی می‌کنم.' },
      { s: 'داروساز', t: '¿Tiene fiebre o toma algún otro medicamento?', fa: 'تب دارید یا داروی دیگری مصرف می‌کنید؟' },
      { t: 'No tengo fiebre ni tomo nada más. ¿Qué me recomienda?', fa: 'نه تب دارم و نه چیز دیگری می‌خورم. چه توصیه می‌کنید؟' },
    ],
  },
  'a2-reasons-conditions': {
    de: [
      { t: 'Fahren wir morgen an den See, wie wir es geplant haben?', fa: 'فردا همان‌طور که برنامه چیدیم به کنار دریاچه می‌رویم؟' },
      { t: 'Wenn das Wetter sonnig bleibt, fahren wir um neun Uhr los.', fa: 'اگر هوا آفتابی بماند، ساعت نه حرکت می‌کنیم.' },
      { t: 'Und was machen wir, falls es doch regnet?', fa: 'و اگر یک‌وقت باران بارید چه کار می‌کنیم؟' },
      { t: 'Dann besuchen wir stattdessen das Technikmuseum, weil es dort viel zu sehen gibt.', fa: 'آن‌وقت به‌جایش به موزهٔ فناوری می‌رویم، چون آنجا دیدنی‌های زیادی هست.' },
    ],
    fr: [
      { t: 'On maintient la sortie au lac demain matin ?', fa: 'برنامهٔ فردا صبح کنار دریاچه پابرجاست؟' },
      { t: 'S’il fait beau, nous partons à neuf heures comme prévu.', fa: 'اگر هوا خوب باشد، طبق برنامه ساعت نه راه می‌افتیم.' },
      { t: 'Et s’il pleut demain, qu’est-ce qu’on fait ?', fa: 'و اگر فردا باران ببارد چه کار می‌کنیم؟' },
      { t: 'Dans ce cas, nous irons au musée parce qu’il y a une nouvelle exposition.', fa: 'در آن صورت به موزه می‌رویم چون نمایشگاه تازه‌ای دارد.' },
    ],
    es: [
      { t: '¿Vamos mañana al lago como habíamos quedado?', fa: 'فردا طبق قرار به دریاچه می‌رویم؟' },
      { t: 'Si hace buen tiempo, salimos a las nueve de la mañana.', fa: 'اگر هوا خوب باشد، ساعت نه صبح راه می‌افتیم.' },
      { t: '¿Y qué hacemos si empieza a llover?', fa: 'و اگر باران شروع شد چه می‌کنیم؟' },
      { t: 'Entonces vamos al museo de ciencias porque está cerca y es muy interesante.', fa: 'آن‌وقت به موزهٔ علوم می‌رویم چون نزدیک و خیلی جالب است.' },
    ],
  },
  'a2-food-preferences': {
    de: [
      { s: 'گارسون', t: 'Haben Sie sich schon etwas aus der Speisekarte ausgesucht?', fa: 'آیا از منو چیزی انتخاب کرده‌اید؟' },
      { t: 'Ich esse kein Fleisch. Welches vegetarische Gericht empfehlen Sie?', fa: 'من گوشت نمی‌خورم. کدام غذای گیاهی را پیشنهاد می‌کنید؟' },
      { s: 'گارسون', t: 'Die gebackene Gemüselasagne ist heute sehr beliebt und ganz frisch.', fa: 'لازانیای سبزیجات تنوری امروز خیلی پرطرفدار و کاملاً تازه است.' },
      { t: 'Das klingt köstlich! Die nehme ich, bitte mit einem kleinen Salat.', fa: 'خوشمزه به نظر می‌رسد! همان را می‌گیرم، لطفاً با یک سالاد کوچک.' },
    ],
    fr: [
      { s: 'گارسون', t: 'Avez-vous fait votre choix sur la carte ?', fa: 'از منو انتخابتان را کرده‌اید؟' },
      { t: 'Je ne mange pas de viande. Quel plat végétarien me conseillez-vous ?', fa: 'گوشت نمی‌خورم. کدام غذای گیاهی را پیشنهاد می‌کنید؟' },
      { s: 'گارسون', t: 'La tarte aux légumes rôtis est excellente aujourd’hui.', fa: 'تارت سبزیجات کبابی امروز عالی است.' },
      { t: 'Parfait, je vais prendre cela avec une salade verte, s’il vous plaît.', fa: 'عالی، همان را با یک سالاد سبز برمی‌دارم، لطفاً.' },
    ],
    es: [
      { s: 'گارسون', t: '¿Saben ya qué van a pedir de la carta?', fa: 'الان می‌دانید از منو چه سفارش می‌دهید؟' },
      { t: 'No como carne. ¿Qué plato vegetariano me recomienda hoy?', fa: 'گوشت نمی‌خورم. امروز کدام غذای گیاهی را پیشنهاد می‌کنید؟' },
      { s: 'گارسون', t: 'La lasaña de verduras al horno está recién hecha y muy buena.', fa: 'لازانیای سبزیجات تنوری تازه آماده شده و خیلی خوب است.' },
      { t: 'Suena muy bien. Póngame esa con una ensalada pequeña, por favor.', fa: 'عالی به نظر می‌رسد. همان را با یک سالاد کوچک بیاورید، لطفاً.' },
    ],
  },
  'a2-housing-problems': {
    de: [
      { t: 'Guten Tag, Herr Klein. Leider gibt es in meiner Küche ein Problem: Der Wasserhahn tropft.', fa: 'روز بخیر، آقای کلاین. متأسفانه در آشپزخانه‌ام مشکلی هست: شیر آب چکه می‌کند.' },
      { s: 'صاحب‌خانه', t: 'Danke für die Nachricht! Tropft es stark oder nur leicht?', fa: 'ممنون که خبر دادید! زیاد چکه می‌کند یا کم؟' },
      { t: 'Es tropft ständig, auch wenn er ganz zugedreht ist. Auch die Heizung bleibt kalt.', fa: 'مدام چکه می‌کند، حتی وقتی کاملاً بسته است. شوفاژ هم سرد مانده.' },
      { s: 'صاحب‌خانه', t: 'Verstanden, ich schicke morgen früh um neun einen Handwerker vorbei.', fa: 'متوجه شدم، فردا صبح ساعت نه یک تعمیرکار می‌فرستم.' },
    ],
    fr: [
      { t: 'Bonjour monsieur. Il y a un petit souci dans l’appartement : le robinet fuit.', fa: 'روز بخیر آقا. یک مشکل کوچک در آپارتمان هست: شیر آب چکه می‌کند.' },
      { s: 'صاحب‌خانه', t: 'Merci de me prévenir. La fuite est importante ?', fa: 'ممنون که خبر دادید. نشتی زیاد است؟' },
      { t: 'Ça goutte sans arrêt, et le radiateur du salon ne chauffe plus.', fa: 'بی‌وقفه چکه می‌کند، و رادیاتور سالن هم دیگر گرم نمی‌شود.' },
      { s: 'صاحب‌خانه', t: 'Très bien, j’appelle le plombier pour qu’il passe demain matin.', fa: 'خیلی خوب، به لوله‌کش زنگ می‌زنم فردا صبح سر بزند.' },
    ],
    es: [
      { t: 'Buenos días. Hay un problema en el piso: el grifo de la cocina gotea.', fa: 'صبح بخیر. مشکلی در آپارتمان هست: شیر آشپزخانه چکه می‌کند.' },
      { s: 'صاحب‌خانه', t: 'Gracias por avisar. ¿Pierde mucha agua?', fa: 'ممنون که اطلاع دادید. آب زیادی هدر می‌رود؟' },
      { t: 'Gotea todo el tiempo, y además la calefacción del salón no enciende.', fa: 'مدام چکه می‌کند، و علاوه بر آن شوفاژ نشیمن هم روشن نمی‌شود.' },
      { s: 'صاحب‌خانه', t: 'De acuerdo, mañana por la mañana envío al técnico para arreglarlo.', fa: 'باشه، فردا صبح تکنسین را می‌فرستم تا درستش کند.' },
    ],
  },
  'a2-objects-and-place': {
    de: [
      { t: 'Kannst du mir nach dem Unterricht deine Mitschriften schicken?', fa: 'می‌توانی بعد از کلاس جزوه‌هایت را برایم بفرستی؟' },
      { t: 'Ja, klar! Ich schicke sie dir heute Abend direkt per E-Mail.', fa: 'بله، حتماً! امشب مستقیم با ایمیل برایت می‌فرستم.' },
      { t: 'Super, soll ich dir morgen das geliehene Buch wieder mitbringen?', fa: 'عالی، فردا کتابی که امانت گرفتم را برایت بیاورم؟' },
      { t: 'Ja, leg es mir einfach auf meinen Platz im Kursraum.', fa: 'بله، خیلی راحت بگذارش روی جای من در کلاس.' },
    ],
    fr: [
      { t: 'Tu peux m’envoyer tes notes après le cours de cet après-midi ?', fa: 'می‌توانی یادداشت‌هایت را بعد از کلاس امروز بعدازظهر برایم بفرستی؟' },
      { t: 'Oui, bien sûr ! Je te les envoie par message dès ce soir.', fa: 'بله، حتماً! همین امشب با پیام برایت می‌فرستم.' },
      { t: 'Merci ! Je te rends ton livre demain à la bibliothèque ?', fa: 'ممنون! کتابت را فردا در کتابخانه پس بدهم؟' },
      { t: 'Oui, laisse-le-moi à l’accueil si je ne suis pas encore arrivé.', fa: 'بله، اگر هنوز نرسیده بودم بگذارش در پذیرش.' },
    ],
    es: [
      { t: '¿Me puedes mandar tus apuntes después de la clase?', fa: 'می‌توانی جزوه‌هایت را بعد از کلاس برایم بفرستی؟' },
      { t: '¡Claro! Te los envío esta tarde por correo.', fa: 'حتماً! امروز عصر با ایمیل برایت می‌فرستم.' },
      { t: 'Gracias. ¿Te devuelvo mañana el diccionario en la entrada?', fa: 'ممنون. فرهنگ لغت را فردا دم ورودی برگردانم؟' },
      { t: 'Sí, déjamelo allí si llego cinco minutos tarde.', fa: 'بله، اگر پنج دقیقه دیر رسیدم همان‌جا بگذارش.' },
    ],
  },
  'a2-belonging-relations': {
    de: [
      { t: 'Ist das auf dem Foto deine ältere Schwester aus Wien?', fa: 'این در عکس خواهر بزرگ‌ترت است که در وین است؟' },
      { t: 'Ja, das ist die Familie meiner Schwester und ihr kleiner Sohn.', fa: 'بله، این خانوادهٔ خواهرم و پسر کوچکش است.' },
      { t: 'Und wessen Fahrrad steht dort vor dem Eingang?', fa: 'و آن دوچرخهٔ کیست که جلوی ورودی است؟' },
      { t: 'Das gehört dem Bruder meines Mitbewohners; er besucht uns heute.', fa: 'مال برادر هم‌خانه‌ام است؛ امروز به دیدنمان آمده.' },
    ],
    fr: [
      { t: 'C’est ta grande sœur sur la photo devant la maison ?', fa: 'آن در عکس جلوی خانه خواهر بزرگ‌ترت است؟' },
      { t: 'Oui, c’est la famille de ma sœur avec son mari et leur fils.', fa: 'بله، خانوادهٔ خواهرم با همسرش و پسرشان است.' },
      { t: 'Et à qui est le vélo garé près de la porte ?', fa: 'و دوچرخه‌ای که کنار در پارک شده مال کیست؟' },
      { t: 'C’est celui du frère de mon colocataire ; il dîne avec nous.', fa: 'مال برادر هم‌خانه‌ام است؛ امشب با ما شام می‌خورد.' },
    ],
    es: [
      { t: '¿La de la foto es tu hermana mayor?', fa: 'کسی که در عکس است خواهر بزرگ‌ترت است؟' },
      { t: 'Sí, es la familia de mi hermana con su hijo pequeño.', fa: 'بله، خانوادهٔ خواهرم با پسر کوچکش است.' },
      { t: '¿Y de quién es esa bicicleta que está en la puerta?', fa: 'و آن دوچرخه که دم در است مال کیست؟' },
      { t: 'Es del hermano de mi compañero de piso; hoy viene a cenar.', fa: 'مال برادر هم‌خانه‌ام است؛ امروز برای شام می‌آید.' },
    ],
  },
  'a2-story-sequence': {
    de: [
      { t: 'Du warst gestern gar nicht im Kurs. Was ist denn passiert?', fa: 'دیروز اصلاً در کلاس نبودی. مگر چه اتفاقی افتاد؟' },
      { t: 'Zuerst habe ich meinen Bus verpasst, und dann hat es stark geregnet.', fa: 'اول اتوبوسم را از دست دادم و بعد باران شدیدی بارید.' },
      { t: 'Oh je! Wie bist du dann nach Hause gekommen?', fa: 'وای! پس چطور به خانه برگشتی؟' },
      { t: 'Schließlich hat mich ein Freund mit dem Auto abgeholt.', fa: 'سرانجام یک دوست با ماشین آمد دنبالم.' },
    ],
    fr: [
      { t: 'Tu n’étais pas en cours hier matin. Que s’est-il passé ?', fa: 'دیروز صبح در کلاس نبودی. چه اتفاقی افتاد؟' },
      { t: 'D’abord j’ai raté mon bus, puis la ligne de métro était en panne.', fa: 'اول اتوبوسم را از دست دادم و بعد خط مترو خراب شد.' },
      { t: 'Quelle galère ! Et comment es-tu rentré finalement ?', fa: 'چه دردسری! و در نهایت چطور برگشتی؟' },
      { t: 'Finalement, un collègue m’a ramené en voiture chez moi.', fa: 'سرانجام یک همکار با ماشین مرا به خانه رساند.' },
    ],
    es: [
      { t: 'Ayer no viniste a clase. ¿Pasó algo?', fa: 'دیروز به کلاس نیامدی. اتفاقی افتاد؟' },
      { t: 'Primero perdí el autobús y luego empezó a llover muy fuerte.', fa: 'اول اتوبوس را از دست دادم و بعد باران خیلی شدیدی شروع شد.' },
      { t: '¡Qué mala suerte! ¿Cómo volviste entonces?', fa: 'چه بدشانسی‌ای! پس چطور برگشتی؟' },
      { t: 'Al final, un amigo me llevó en coche hasta mi casa.', fa: 'در آخر یک دوست با ماشین مرا تا خانه رساند.' },
    ],
  },
  'a2-inviting-arranging': {
    de: [
      { t: 'Hast du Lust, am Freitagabend gemeinsam ins Kino zu gehen?', fa: 'حوصله داری جمعه‌شب با هم برویم سینما؟' },
      { t: 'Sehr gern! Welcher Film läuft denn und um wie viel Uhr?', fa: 'با کمال میل! کدام فیلم اکران می‌شود و ساعت چند؟' },
      { t: 'Um acht Uhr läuft eine neue Komödie. Sollen wir uns um halb acht treffen?', fa: 'ساعت هشت یک کمدی تازه پخش می‌شود. هفت‌ونیم همدیگر را ببینیم؟' },
      { t: 'Abgemacht! Ich besorge die Tickets schon heute online.', fa: 'قبول! همین امروز بلیت‌ها را آنلاین می‌گیرم.' },
    ],
    fr: [
      { t: 'Ça te dit d’aller au cinéma vendredi soir ?', fa: 'پایه‌ای جمعه‌شب برویم سینما؟' },
      { t: 'Oui, avec plaisir ! Il y a une séance à quelle heure ?', fa: 'بله، با کمال میل! سانس ساعت چند است؟' },
      { t: 'À vingt heures au cinéma du centre. On se retrouve à dix-neuf heures trente ?', fa: 'ساعت هشت شب در سینمای مرکز. هفت‌ونیم همدیگر را ببینیم؟' },
      { t: 'D’accord ! Je réserve les deux places dès ce soir.', fa: 'باشه! همین امشب دو تا صندلی را رزرو می‌کنم.' },
    ],
    es: [
      { t: '¿Te gustaría ir al cine este viernes por la noche?', fa: 'دوست داری این جمعه‌شب با هم برویم سینما؟' },
      { t: '¡Sí, claro! ¿Qué película vemos y a qué hora empieza?', fa: 'بله، حتماً! چه فیلمی ببینیم و ساعت چند شروع می‌شود؟' },
      { t: 'Hay una sesión a las ocho. ¿Quedamos a las siete y media en la entrada?', fa: 'یک سانس ساعت هشت هست. هفت‌ونیم دم ورودی قرار بگذاریم؟' },
      { t: 'Perfecto, yo compro las entradas por internet.', fa: 'عالی، من بلیت‌ها را اینترنتی می‌خرم.' },
    ],
  },
  'a2-tourism-directions': {
    de: [
      { t: 'Entschuldigung, wie komme ich von hier am schnellsten zum Kunstmuseum?', fa: 'ببخشید، از اینجا سریع‌ترین راه به موزهٔ هنر چیست؟' },
      { s: 'راهنما', t: 'Nehmen Sie hier die Straßenbahn Linie drei bis zur Haltestelle Rathaus.', fa: 'همین‌جا تراموای خط سه را تا ایستگاه تالار شهر سوار شوید.' },
      { t: 'Und wissen Sie, wie lange das Museum heute geöffnet hat?', fa: 'و می‌دانید موزه امروز تا کی باز است؟' },
      { s: 'راهنما', t: 'Heute ist es bis achtzehn Uhr geöffnet; den Stadtplan können Sie mitnehmen.', fa: 'امروز تا ساعت شش عصر باز است؛ نقشهٔ شهر را می‌توانید بردارید.' },
    ],
    fr: [
      { t: 'Bonjour, quel est le chemin le plus rapide pour aller au musée d’art ?', fa: 'روز بخیر، سریع‌ترین مسیر برای رفتن به موزهٔ هنر چیست؟' },
      { s: 'راهنما', t: 'Prenez le tramway ligne trois et descendez à l’arrêt Hôtel de Ville.', fa: 'تراموای خط سه را سوار شوید و در ایستگاه شهرداری پیاده شوید.' },
      { t: 'Savez-vous jusqu’à quelle heure le musée est ouvert aujourd’hui ?', fa: 'می‌دانید موزه امروز تا چه ساعتی باز است؟' },
      { s: 'راهنما', t: 'Il ferme à dix-huit heures. Voici un plan du centre-ville.', fa: 'ساعت شش عصر بسته می‌شود. این هم نقشهٔ مرکز شهر.' },
    ],
    es: [
      { t: 'Disculpe, ¿cómo puedo llegar más rápido al museo de arte?', fa: 'ببخشید، چطور سریع‌تر به موزهٔ هنر برسم؟' },
      { s: 'راهنما', t: 'Tome el autobús número tres y bájese en la plaza del Ayuntamiento.', fa: 'اتوبوس شمارهٔ سه را سوار شوید و در میدان شهرداری پیاده شوید.' },
      { t: '¿Sabe hasta qué hora abre el museo hoy?', fa: 'می‌دانید موزه امروز تا ساعت چند باز است؟' },
      { s: 'راهنما', t: 'Hoy abre hasta las seis de la tarde. Lleve este plano si quiere.', fa: 'امروز تا شش بعدازظهر باز است. اگر می‌خواهید این نقشه را ببرید.' },
    ],
  },
  'a2-work-duties': {
    de: [
      { s: 'همکار', t: 'Welche Aufgaben müssen wir heute noch vor dem Treffen erledigen?', fa: 'امروز پیش از جلسه هنوز چه کارهایی را باید انجام بدهیم؟' },
      { t: 'Ich beantworte die Kundenmails und bereite die neuen Zahlen vor.', fa: 'من به ایمیل‌های مشتریان پاسخ می‌دهم و آمارهای تازه را آماده می‌کنم.' },
      { s: 'همکار', t: 'Soll ich mich dann um den Raum und die Unterlagen kümmern?', fa: 'پس من به سالن و مدارک رسیدگی کنم؟' },
      { t: 'Ja, danke! Unser Meeting beginnt pünktlich um vierzehn Uhr.', fa: 'بله، ممنون! جلسهٔ ما رأس ساعت دو بعدازظهر شروع می‌شود.' },
    ],
    fr: [
      { s: 'همکار', t: 'Quelles tâches devons-nous terminer avant la réunion de cet après-midi ?', fa: 'پیش از جلسهٔ امروز بعدازظهر چه کارهایی را باید تمام کنیم؟' },
      { t: 'Je réponds aux messages des clients et je vérifie le tableau des ventes.', fa: 'من به پیام‌های مشتریان جواب می‌دهم و جدول فروش را بررسی می‌کنم.' },
      { s: 'همکار', t: 'Je m’occupe d’imprimer les documents et de réserver la salle.', fa: 'من چاپ مدارک و رزرو سالن را انجام می‌دهم.' },
      { t: 'Merci beaucoup ! Le rendez-vous commence à quatorze heures précises.', fa: 'خیلی ممنون! جلسه دقیقاً ساعت دو بعدازظهر شروع می‌شود.' },
    ],
    es: [
      { s: 'همکار', t: '¿Qué tareas tenemos que terminar antes de la reunión de hoy?', fa: 'پیش از جلسهٔ امروز چه کارهایی را باید تمام کنیم؟' },
      { t: 'Yo contesto los correos de clientes y reviso el informe mensual.', fa: 'من به ایمیل‌های مشتریان پاسخ می‌دهم و گزارش ماهانه را بررسی می‌کنم.' },
      { s: 'همکار', t: 'Entonces yo preparo las copias y reservo la sala grande.', fa: 'پس من نسخه‌ها را آماده می‌کنم و سالن بزرگ را رزرو می‌کنم.' },
      { t: 'Genial, gracias. Empezamos a las dos en punto.', fa: 'عالی، ممنون. رأس ساعت دو شروع می‌کنیم.' },
    ],
  },
  'a2-study-plans': {
    de: [
      { t: 'Wie bereitest du dich auf den nächsten Sprachtest vor?', fa: 'چطور خودت را برای آزمون بعدی زبان آماده می‌کنی؟' },
      { t: 'Ich wiederhole jeden Abend zwanzig Minuten Wortschatz und höre kurze Dialoge.', fa: 'هر شب بیست دقیقه واژگان مرور می‌کنم و به گفت‌وگوهای کوتاه گوش می‌دهم.' },
      { t: 'Machst du auch alle Übungen aus dem Kursbuch?', fa: 'همهٔ تمرین‌های کتاب درسی را هم انجام می‌دهی؟' },
      { t: 'Ja, besonders am Wochenende arbeite ich die Grammatik noch einmal durch.', fa: 'بله، به‌خصوص آخر هفته دستور زبان را یک بار دیگر کار می‌کنم.' },
    ],
    fr: [
      { t: 'Comment organises-tu tes révisions pour l’examen de fin de niveau ?', fa: 'مرورهایت را برای آزمون پایان سطح چطور تنظیم می‌کنی؟' },
      { t: 'Je révise le vocabulaire vingt minutes par soir et j’écoute des dialogues.', fa: 'شبی بیست دقیقه واژگان مرور می‌کنم و به گفت‌وگوها گوش می‌دهم.' },
      { t: 'Tu fais aussi des exercices écrits pendant le week-end ?', fa: 'آخر هفته تمرین‌های نوشتاری هم انجام می‌دهی؟' },
      { t: 'Oui, je relis mes notes le samedi matin pour garder un bon rythme.', fa: 'بله، شنبه صبح یادداشت‌هایم را می‌خوانم تا ریتم خوبی نگه دارم.' },
    ],
    es: [
      { t: '¿Cómo te organizas para estudiar esta semana?', fa: 'این هفته برای درس خواندن چطور برنامه‌ریزی می‌کنی؟' },
      { t: 'Repaso vocabulario veinte minutos cada tarde y escucho audios cortos.', fa: 'هر عصر بیست دقیقه واژگان مرور می‌کنم و به فایل‌های صوتی کوتاه گوش می‌دهم.' },
      { t: '¿También practicas la escritura antes de clase?', fa: 'قبل از کلاس نوشتن هم تمرین می‌کنی؟' },
      { t: 'Sí, los domingos escribo un resumen corto de lo que aprendí.', fa: 'بله، یکشنبه‌ها خلاصهٔ کوتاهی از چیزهایی که یاد گرفتم می‌نویسم.' },
    ],
  },
  'a2-opinions-agreement': {
    de: [
      { t: 'Wo sollen wir morgen für das Projekt arbeiten — in der Bibliothek oder im Café?', fa: 'فردا برای پروژه کجا کار کنیم — در کتابخانه یا در کافه؟' },
      { t: 'Ich finde die Bibliothek besser, weil es dort ruhig und hell ist.', fa: 'به نظرم کتابخانه بهتر است، چون آنجا آرام و روشن است.' },
      { t: 'Da hast du recht! Im Café ist es nachmittags oft zu laut.', fa: 'در این مورد حق با توست! در کافه بعدازظهرها اغلب خیلی شلوغ است.' },
      { t: 'Gut, dann treffen wir uns um drei Uhr am Eingang der Bibliothek.', fa: 'خوب، پس ساعت سه دم ورودی کتابخانه همدیگر را می‌بینیم.' },
    ],
    fr: [
      { t: 'À ton avis, on travaille plutôt au café ou à la bibliothèque demain ?', fa: 'به نظرت فردا در کافه کار کنیم یا در کتابخانه؟' },
      { t: 'Je trouve la bibliothèque plus pratique parce qu’on s’y concentre mieux.', fa: 'به نظرم کتابخانه مناسب‌تر است چون آنجا بهتر تمرکز می‌کنیم.' },
      { t: 'Je suis tout à fait d’accord ; le café devient bruyant l’après-midi.', fa: 'کاملاً موافقم؛ کافه بعدازظهرها پر سر و صدا می‌شود.' },
      { t: 'Parfait, allons à la bibliothèque dès quatorze heures.', fa: 'عالی، از ساعت دو برویم کتابخانه.' },
    ],
    es: [
      { t: '¿Qué prefieres para trabajar mañana en el proyecto: la cafetería o la biblioteca?', fa: 'برای کار فردا روی پروژه کدام را ترجیح می‌دهی: کافه یا کتابخانه؟' },
      { t: 'Creo que la biblioteca es mejor porque hay silencio y buena conexión.', fa: 'فکر می‌کنم کتابخانه بهتر است چون سکوت و اینترنت خوب دارد.' },
      { t: 'Tienes razón, en la cafetería hay demasiado ruido por la tarde.', fa: 'حق با توست، در کافه عصرها سروصدای زیادی است.' },
      { t: 'Genial, quedamos allí a las tres.', fa: 'عالی، ساعت سه آنجا قرار می‌گذاریم.' },
    ],
  },
  'a2-leisure-new-experiences': {
    de: [
      { t: 'Hast du am Wochenende schon einmal einen Kochkurs ausprobiert?', fa: 'تا حالا آخر هفته کلاس آشپزی را امتحان کرده‌ای؟' },
      { t: 'Ja, letzten Samstag! Wir haben frische Pasta selbst gemacht.', fa: 'بله، شنبهٔ گذشته! خودمان پاستای تازه درست کردیم.' },
      { t: 'Wie war es? Hat es dir Spaß gemacht?', fa: 'چطور بود؟ بهت خوش گذشت؟' },
      { t: 'Es war großartig! Nächsten Monat möchte ich auch einen Töpferkurs testen.', fa: 'عالی بود! ماه بعد می‌خواهم یک کلاس سفالگری هم امتحان کنم.' },
    ],
    fr: [
      { t: 'Tu as déjà essayé une nouvelle activité le week-end dernier ?', fa: 'آخر هفتهٔ گذشته فعالیت تازه‌ای را امتحان کردی؟' },
      { t: 'Oui, j’ai participé à un atelier de cuisine pour la première fois.', fa: 'بله، برای اولین بار در یک کارگاه آشپزی شرکت کردم.' },
      { t: 'Tu as aimé cette expérience ?', fa: 'از این تجربه خوشت آمد؟' },
      { t: 'Beaucoup ! Le mois prochain, j’aimerais aussi essayer la poterie.', fa: 'خیلی! ماه آینده دوست دارم سفالگری را هم امتحان کنم.' },
    ],
    es: [
      { t: '¿Probaste alguna actividad nueva el fin de semana pasado?', fa: 'آخر هفتهٔ گذشته فعالیت تازه‌ای را امتحان کردی؟' },
      { t: 'Sí, fui por primera vez a un taller de cocina italiana.', fa: 'بله، برای اولین بار به یک کارگاه آشپزی ایتالیایی رفتم.' },
      { t: '¿Qué tal fue la experiencia?', fa: 'تجربه چطور بود؟' },
      { t: 'Me encantó; el próximo mes quiero probar también un curso de fotografía.', fa: 'خیلی خوشم آمد؛ ماه بعد می‌خواهم یک دورهٔ عکاسی هم امتحان کنم.' },
    ],
  },
  'a2-life-changes': {
    de: [
      { t: 'Wie hat sich dein Alltag seit dem Umzug hierher verändert?', fa: 'از وقتی به اینجا نقل مکان کرده‌ای زندگی روزمره‌ات چطور تغییر کرده؟' },
      { t: 'Früher bin ich eine Stunde gependelt; jetzt gehe ich zu Fuß zur Arbeit.', fa: 'قبلاً یک ساعت رفت‌وآمد می‌کردم؛ الان پیاده سر کار می‌روم.' },
      { t: 'Vermisst du etwas aus deiner alten Stadt?', fa: 'دلت برای چیزی از شهر قدیمی‌ات تنگ می‌شود؟' },
      { t: 'Nur meine alte Nachbarschaft, aber hier habe ich viel mehr Ruhe.', fa: 'فقط محلهٔ قدیمی‌ام، ولی اینجا آرامش خیلی بیشتری دارم.' },
    ],
    fr: [
      { t: 'Qu’est-ce qui a changé dans ta vie depuis ton déménagement ?', fa: 'از وقتی اسباب‌کشی کرده‌ای چه چیزی در زندگی‌ات تغییر کرده؟' },
      { t: 'Avant, je prenais la voiture tous les jours ; maintenant je vais au bureau à vélo.', fa: 'قبلاً هر روز ماشین سوار می‌شدم؛ الان با دوچرخه سر کار می‌روم.' },
      { t: 'Tu préfères ton nouveau rythme de vie ?', fa: 'ریتم جدید زندگی‌ات را بیشتر دوست داری؟' },
      { t: 'Oui, j’ai gagné une heure par jour pour lire et voir mes amis.', fa: 'بله، روزی یک ساعت وقت اضافه برای مطالعه و دیدن دوستانم پیدا کرده‌ام.' },
    ],
    es: [
      { t: '¿Cómo ha cambiado tu rutina desde que te mudaste de barrio?', fa: 'از وقتی محله‌ات را عوض کرده‌ای برنامه‌ات چطور تغییر کرده؟' },
      { t: 'Antes tardaba una hora en metro; ahora voy caminando al trabajo.', fa: 'قبلاً یک ساعت در مترو بودم؛ الان پیاده سر کار می‌روم.' },
      { t: '¿Echas de menos tu antigua casa?', fa: 'دلت برای خانهٔ قدیمی‌ات تنگ می‌شود؟' },
      { t: 'Un poco la terraza, pero ahora tengo mucho más tiempo libre.', fa: 'کمی برای تراسش، اما الان وقت آزاد خیلی بیشتری دارم.' },
    ],
  },
  'a2-feelings-worries': {
    de: [
      { t: 'Du siehst heute etwas nachdenklich aus. Ist alles in Ordnung?', fa: 'امروز کمی تو فکر به نظر می‌رسی. همه‌چیز روبه‌راه است؟' },
      { t: 'Ich mache mir ein wenig Sorgen wegen der mündlichen Prüfung am Freitag.', fa: 'کمی نگران آزمون شفاهی روز جمعه هستم.' },
      { t: 'Das verstehe ich gut, aber du sprichst schon so sicher!', fa: 'کاملاً می‌فهمم، ولی تو الان خیلی مطمئن صحبت می‌کنی!' },
      { t: 'Danke für deine lieben Worte, das gibt mir wirklich Hoffnung.', fa: 'ممنون بابت حرف‌های خوبت، واقعاً بهم امید می‌دهد.' },
    ],
    fr: [
      { t: 'Tu as l’air un peu soucieux aujourd’hui. Tout va bien ?', fa: 'امروز کمی نگران به نظر می‌رسی. همه‌چیز خوب است؟' },
      { t: 'Je suis un peu inquiet pour l’entretien oral de vendredi.', fa: 'کمی بابت مصاحبهٔ شفاهی جمعه نگرانم.' },
      { t: 'Ne t’en fais pas trop, tu as beaucoup progressé ces derniers mois.', fa: 'زیاد نگران نباش، این چند ماه اخیر خیلی پیشرفت کرده‌ای.' },
      { t: 'Merci, ton encouragement me rassure vraiment.', fa: 'ممنون، دلگرمی‌ات واقعاً آرامم می‌کند.' },
    ],
    es: [
      { t: 'Te veo un poco preocupado hoy. ¿Va todo bien?', fa: 'امروز کمی نگران به نظرم می‌آیی. همه‌چیز خوب است؟' },
      { t: 'Estoy algo nervioso por la entrevista de trabajo del viernes.', fa: 'کمی بابت مصاحبهٔ کاری جمعه مضطربم.' },
      { t: 'Es normal sentir nervios, pero te has preparado muy bien.', fa: 'اضطراب داشتن طبیعی است، اما خیلی خوب آماده شده‌ای.' },
      { t: 'Gracias por animarme; espero que todo salga bien.', fa: 'ممنون بابت دلگرمی؛ امیدوارم همه‌چیز خوب پیش برود.' },
    ],
  },
  'a2-reporting-messages': {
    de: [
      { t: 'Hat Markus heute angerufen, während ich kurz weg war?', fa: 'وقتی کوتاه بیرون بودم مارکوس امروز زنگ زد؟' },
      { t: 'Ja, er hat gesagt, dass sich die Besprechung um dreißig Minuten verschiebt.', fa: 'بله، گفت جلسه سی دقیقه به عقب می‌افتد.' },
      { t: 'Hat er auch gefragt, ob wir die neuen Listen mitbringen?', fa: 'این را هم پرسید که فهرست‌های جدید را با خودمان ببریم؟' },
      { t: 'Genau, er bat darum, dass wir ihm die Datei vorher mailen.', fa: 'دقیقاً، خواهش کرد پیش از جلسه فایل را برایش ایمیل کنیم.' },
    ],
    fr: [
      { t: 'Est-ce que Marc a appelé pendant que j’étais sorti ?', fa: 'وقتی بیرون بودم مارک تماس گرفت؟' },
      { t: 'Oui, il a dit que la réunion de cet après-midi est décalée d’une demi-heure.', fa: 'بله، گفت جلسهٔ امروز بعدازظهر نیم ساعت جابه‌جا شده است.' },
      { t: 'Il a laissé une autre consigne pour l’équipe ?', fa: 'دستورالعمل دیگری هم برای تیم گذاشت؟' },
      { t: 'Oui, il a demandé qu’on lui envoie le rapport avant quinze heures.', fa: 'بله، خواست گزارش را پیش از ساعت سه برایش بفرستیم.' },
    ],
    es: [
      { t: '¿Llamó Marcos mientras salí un momento?', fa: 'وقتی یک لحظه بیرون رفتم مارکوس زنگ زد؟' },
      { t: 'Sí, dijo que la reunión de hoy se retrasa media hora.', fa: 'بله، گفت جلسهٔ امروز نیم ساعت به تأخیر می‌افتد.' },
      { t: '¿Preguntó algo sobre los documentos del proyecto?', fa: 'دربارهٔ مدارک پروژه چیزی پرسید؟' },
      { t: 'Sí, pidió que le enviemos el archivo antes de las tres.', fa: 'بله، خواست فایل را قبل از ساعت سه برایش بفرستیم.' },
    ],
  },
  'a2-ability-permission': {
    de: [
      { t: 'Entschuldigung, darf man in diesem Raum den Drucker benutzen?', fa: 'ببخشید، در این اتاق اجازه هست از چاپگر استفاده کرد؟' },
      { t: 'Ja, natürlich! Sie können ihn einfach über das Gastnetz verbinden.', fa: 'بله، حتماً! می‌توانید راحت از طریق شبکهٔ مهمان وصلش کنید.' },
      { t: 'Kann ich hier auch meinen Laptop aufladen?', fa: 'می‌توانم اینجا لپ‌تاپم را هم شارژ کنم؟' },
      { t: 'Selbstverständlich, unter jedem Tisch gibt es zwei Steckdosen.', fa: 'البته، زیر هر میز دو پریز برق هست.' },
    ],
    fr: [
      { t: 'Excusez-moi, est-ce qu’on peut utiliser l’imprimante de cette salle ?', fa: 'ببخشید، می‌شود از چاپگر این سالن استفاده کرد؟' },
      { t: 'Oui, bien sûr ! Vous pouvez vous y connecter avec votre carte d’étudiant.', fa: 'بله، حتماً! می‌توانید با کارت دانشجویی‌تان به آن وصل شوید.' },
      { t: 'Est-il permis aussi de brancher un ordinateur ici ?', fa: 'اجازه هست اینجا لپ‌تاپ هم به برق زد؟' },
      { t: 'Oui, il y a des prises sous toutes les tables près du mur.', fa: 'بله، زیر همهٔ میزهای کنار دیوار پریز هست.' },
    ],
    es: [
      { t: 'Perdone, ¿se puede usar la impresora de esta sala?', fa: 'ببخشید، می‌شود از چاپگر این سالن استفاده کرد؟' },
      { t: 'Sí, claro. Puede enviar los archivos desde su ordenador.', fa: 'بله، حتماً. می‌توانید فایل‌ها را از کامپیوترتان بفرستید.' },
      { t: '¿También puedo cargar mi teléfono en este enchufe?', fa: 'می‌توانم گوشیم را هم به این پریز بزنم؟' },
      { t: 'Por supuesto, están libres para todos los estudiantes.', fa: 'البته، برای همهٔ دانشجویان آزاد است.' },
    ],
  },
  'a2-future-simple-extension': {
    de: [
      { t: 'Was möchtest du im nächsten Jahr beruflich oder beim Lernen erreichen?', fa: 'سال آینده در کار یا یادگیری می‌خواهی به چه برسی؟' },
      { t: 'Ich werde im Frühling die B1-Prüfung ablegen und mir eine neue Stelle suchen.', fa: 'بهار آزمون B1 را می‌دهم و دنبال یک شغل تازه می‌گردم.' },
      { t: 'Wirst du dafür in derselben Stadt bleiben?', fa: 'برای این کار در همین شهر می‌مانی؟' },
      { t: 'Wahrscheinlich ja, aber vielleicht ziehe ich im Herbst in eine größere Wohnung.', fa: 'احتمالاً بله، اما شاید پاییز به یک آپارتمان بزرگ‌تر بروم.' },
    ],
    fr: [
      { t: 'Quels sont tes grands projets pour l’année prochaine ?', fa: 'برنامه‌های بزرگت برای سال آینده چیست؟' },
      { t: 'Je passerai l’examen B1 au printemps et je chercherai un nouvel emploi.', fa: 'بهار آزمون B1 را می‌دهم و دنبال شغل تازه‌ای می‌گردم.' },
      { t: 'Est-ce que tu resteras dans la même ville ?', fa: 'در همین شهر می‌مانی؟' },
      { t: 'Oui, sans doute, mais je déménagerai peut-être dans un quartier plus calme.', fa: 'احتمالاً بله، ولی شاید به محلهٔ آرام‌تری اسباب‌کشی کنم.' },
    ],
    es: [
      { t: '¿Qué planes tienes para el próximo año?', fa: 'برای سال آینده چه برنامه‌هایی داری؟' },
      { t: 'Haré el examen B1 en primavera y buscaré un trabajo nuevo.', fa: 'بهار آزمون B1 را می‌دهم و دنبال کار جدیدی می‌گردم.' },
      { t: '¿Seguirás viviendo en esta ciudad?', fa: 'همچنان در همین شهر زندگی خواهی کرد؟' },
      { t: 'Sí, probablemente me quedaré aquí y viajaré más en verano.', fa: 'بله، احتمالاً اینجا می‌مانم و تابستان بیشتر سفر می‌کنم.' },
    ],
  },
});
