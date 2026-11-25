import { buildTriMap } from './starterA1Part1';
import type { DialogueMap } from './types';

export const STARTER_B1_DIALOGUES: DialogueMap = buildTriMap({
  'b1-past-story': {
    de: [
      { t: 'Wie war dein allererster Tag, als du in dieser Stadt angekommen bist?', fa: 'نخستین روزی که به این شهر رسیدی چطور گذشت؟' },
      { t: 'Am Anfang war ich etwas nervös, weil ich mich am Hauptbahnhof nicht sofort zurechtfand.', fa: 'اول کمی مضطرب بودم، چون در ایستگاه مرکزی فوراً راهم را پیدا نکردم.' },
      { t: 'Hat dir jemand geholfen, die richtige Adresse zu finden?', fa: 'کسی کمکت کرد نشانی درست را پیدا کنی؟' },
      { t: 'Ja, eine freundliche Nachbarin hat mich bis zur Haustür begleitet — das werde ich nie vergessen.', fa: 'بله، یک همسایهٔ خوش‌برخورد تا دم در همراهم آمد — هرگز فراموشش نمی‌کنم.' },
    ],
    fr: [
      { t: 'Comment s’est passé ton tout premier jour en arrivant dans cette ville ?', fa: 'نخستین روزی که به این شهر رسیدی چطور گذشت؟' },
      { t: 'Au début j’étais un peu perdu à la gare parce que tout était nouveau pour moi.', fa: 'اول در ایستگاه کمی گم شده بودم چون همه‌چیز برایم تازه بود.' },
      { t: 'Comment as-tu finalement trouvé ton immeuble ?', fa: 'سرانجام چطور ساختمتنت را پیدا کردی؟' },
      { t: 'Un passant très gentil m’a accompagné jusqu’à la bonne rue ; j’ai tout de suite été rassuré.', fa: 'یک رهگذر خیلی مهربان تا خیابان درست همراهم آمد؛ فوراً خیالم راحت شد.' },
    ],
    es: [
      { t: '¿Cómo recuerdas tu primer día al llegar a esta ciudad?', fa: 'نخستین روزی که به این شهر رسیدی چطور به یاد می‌آوری؟' },
      { t: 'Al principio estaba algo nervioso porque no entendía bien las líneas del metro.', fa: 'اول کمی مضطرب بودم چون خطوط مترو را خوب نمی‌فهمیدم.' },
      { t: '¿Alguien te echó una mano para llegar a tu piso?', fa: 'کسی برای رسیدن به آپارتمانت کمکت کرد؟' },
      { t: 'Sí, una señora amable me indicó la salida exacta y me acompañó hasta la esquina.', fa: 'بله، یک خانم مهربان خروجی دقیق را نشانم داد و تا سر کوچه همراهم آمد.' },
    ],
  },
  'b1-past-contrast': {
    de: [
      { t: 'Wie hast du früher deine Wochenenden verbracht, bevor du hier gearbeitet hast?', fa: 'قبلاً پیش از اینکه اینجا کار کنی آخر هفته‌هایت را چطور می‌گذراندی؟' },
      { t: 'Früher bin ich oft bis Mittag im Bett geblieben, aber neulich habe ich das geändert.', fa: 'قبلاً اغلب تا ظهر در تخت می‌ماندم، اما اخیراً این را تغییر داده‌ام.' },
      { t: 'Was ist passiert, dass du deine Gewohnheit geändert hast?', fa: 'چه اتفاقی افتاد که عادتت را عوض کردی؟' },
      { t: 'Als ich einem Wanderverein beigetreten bin, habe ich gemerkt, wie gut frühe Spaziergänge tun.', fa: 'وقتی عضو یک گروه کوهپیمایی شدم، فهمیدم پیاده‌روی صبحگاهی چقدر حال آدم را خوب می‌کند.' },
    ],
    fr: [
      { t: 'Que faisais-tu le week-end avant de commencer ce nouveau poste ?', fa: 'پیش از شروع این شغل تازه آخر هفته‌ها چه کار می‌کردی؟' },
      { t: 'Autrefois je restais souvent à la maison, mais j’ai changé d’habitude l’année dernière.', fa: 'قدیم‌ها اغلب خانه می‌ماندم، اما پارسال عادتم را عوض کردم.' },
      { t: 'Qu’est-ce qui a déclenché ce changement ?', fa: 'چه چیزی باعث این تغییر شد؟' },
      { t: 'Un jour, un ami m’a emmené faire une randonnée, et depuis je sors chaque samedi matin.', fa: 'یک روز دوستی مرا به کوهپیمایی برد و از آن زمان هر شنبه صبح بیرون می‌زنم.' },
    ],
    es: [
      { t: '¿Cómo pasabas los fines de semana antes de empezar este trabajo?', fa: 'پیش از شروع این کار آخر هفته‌ها را چطور می‌گذراندی؟' },
      { t: 'Antes me quedaba casi siempre en casa, pero hace unos meses cambié de rutina.', fa: 'قبلاً تقریباً همیشه خانه می‌ماندم، ولی چند ماه پیش برنامه‌ام را عوض کردم.' },
      { t: '¿Qué pasó para que decidieras cambiar?', fa: 'چه اتفاقی افتاد که تصمیم گرفتی تغییر بدهی؟' },
      { t: 'Un día me apunté a una ruta por el campo y descubrí lo bien que sienta salir temprano.', fa: 'یک روز در یک برنامهٔ طبیعت‌گردی ثبت‌نام کردم و فهمیدم زود بیرون رفتن چقدر خوب است.' },
    ],
  },
  'b1-future-plans': {
    de: [
      { t: 'Wie siehst du deine berufliche Entwicklung in den nächsten zwei Jahren?', fa: 'پیشرفت شغلی خودت را در دو سال آینده چطور می‌بینی؟' },
      { t: 'Ich plane, mich im Herbst auf eine Stelle im Projektmanagement zu bewerben.', fa: 'برنامه دارم پاییز برای یک موقعیت مدیریت پروژه درخواست بدهم.' },
      { t: 'Könnte sich dieser Plan noch ändern, falls du ein Angebot im Ausland bekommst?', fa: 'اگر پیشنهادی از خارج کشور بگیری ممکن است این برنامه تغییر کند؟' },
      { t: 'Vielleicht ja — wenn das Projekt spannend ist, würde ich das Angebot ernsthaft prüfen.', fa: 'شاید بله — اگر پروژه جذاب باشد، پیشنهاد را جدی بررسی می‌کنم.' },
    ],
    fr: [
      { t: 'Comment envisages-tu ton parcours professionnel dans les deux prochaines années ?', fa: 'مسیر شغلی‌ات را در دو سال آینده چطور می‌بینی؟' },
      { t: 'Je compte postuler à un poste en gestion de projet dès la rentrée prochaine.', fa: 'قصد دارم از ابتدای فصل پاییز برای یک شغل مدیریت پروژه درخواست بدهم.' },
      { t: 'Et si une opportunité se présente dans une autre région ?', fa: 'و اگر فرصتی در منطقهٔ دیگری پیش بیاید چه؟' },
      { t: 'Il se peut que j’accepte, si le poste correspond vraiment à mes objectifs.', fa: 'ممکن است بپذیرم، اگر شغل واقعاً با هدف‌هایم هم‌خوانی داشته باشد.' },
    ],
    es: [
      { t: '¿Cómo ves tus planes laborales para los próximos dos años?', fa: 'برنامه‌های شغلی‌ات را برای دو سال آینده چطور می‌بینی؟' },
      { t: 'Pienso presentarme a un puesto de coordinación cuando termine este curso.', fa: 'قصد دارم وقتی این دوره تمام شد برای یک جایگاه هماهنگی اقدام کنم.' },
      { t: '¿Crees que podría cambiar el plan si surge algo en otra ciudad?', fa: 'فکر می‌کنی اگر موقعیتی در شهر دیگری پیش بیاید برنامه‌ات عوض شود؟' },
      { t: 'Es probable que lo considere si el proyecto ofrece buen aprendizaje.', fa: 'احتمالش هست بررسی‌اش کنم اگر پروژه یادگیری خوبی داشته باشد.' },
    ],
  },
  'b1-real-conditions': {
    de: [
      { t: 'Bleibt unsere Wanderung am Sonntag bestehen, wenn es leicht regnet?', fa: 'اگر یکشنبه باران ملایم ببارد برنامهٔ پیاده‌روی ما پابرجاست؟' },
      { t: 'Wenn es nur leicht nieselt, nehmen wir Regenjacken mit und gehen trotzdem los.', fa: 'اگر فقط نم‌نم باران باشد، بارانی می‌بریم و باز هم راه می‌افتیم.' },
      { t: 'Und falls ein richtiges Gewitter aufzieht?', fa: 'و اگر یک‌وقت رعدوبرق شدید شد چه؟' },
      { t: 'Dann verschieben wir die Tour auf nächste Woche und treffen uns im Museum.', fa: 'آن‌وقت گردش را به هفتهٔ بعد می‌اندازیم و در موزه همدیگر را می‌بینیم.' },
    ],
    fr: [
      { t: 'On maintient notre sortie de dimanche s’il pleut un peu ?', fa: 'اگر یکشنبه کمی باران ببارد برنامهٔ گردش را نگه می‌داریم؟' },
      { t: 'S’il ne tombe que quelques gouttes, nous prendrons des imperméables et nous marcherons quand même.', fa: 'اگر فقط چند قطره ببارد، بارانی برمی‌داریم و باز هم پیاده‌روی می‌کنیم.' },
      { t: 'Et si jamais il y a de l’orage toute la matinée ?', fa: 'و اگر یک‌وقت کل صبح رعدوبرق باشد چه؟' },
      { t: 'Dans ce cas, nous irons plutôt voir l’exposition au centre culturel.', fa: 'در آن صورت بهتر است برویم نمایشگاه مرکز فرهنگی را ببینیم.' },
    ],
    es: [
      { t: '¿Mantenemos la excursión del domingo si llueve un poco?', fa: 'اگر یکشنبه کمی باران ببارد برنامهٔ گردش را نگه می‌داریم؟' },
      { t: 'Si solo llovizna un poco, llevamos chubasquero y salimos igual.', fa: 'اگر فقط نم‌نم باران باشد، بارانی می‌بریم و باز هم می‌رویم.' },
      { t: '¿Y qué hacemos si hace demasiado viento o tormenta?', fa: 'و اگر باد شدید یا طوفان باشد چه کار می‌کنیم؟' },
      { t: 'Si empeora el tiempo, la dejamos para el próximo sábado y vamos al teatro.', fa: 'اگر هوا بدتر شد، می‌گذاریمش برای شنبهٔ بعد و می‌رویم تئاتر.' },
    ],
  },
  'b1-hypothetical': {
    de: [
      { t: 'Wenn du frei wählen könntest: Würdest du lieber im Zentrum oder am Stadtrand wohnen?', fa: 'اگر آزادانه می‌توانستی انتخاب کنی: ترجیح می‌دادی در مرکز شهر زندگی کنی یا حاشیه؟' },
      { t: 'Ich würde wahrscheinlich am Stadtrand wohnen, wenn die Bahnverbindung gut wäre.', fa: 'احتمالاً در حاشیه زندگی می‌کردم، اگر خط قطارش خوب بود.' },
      { t: 'Wäre dir der längere Arbeitsweg nicht zu anstrengend?', fa: 'مسیر طولانی‌تر سر کار برایت زیادی خسته‌کننده نبود؟' },
      { t: 'Nicht unbedingt — im Grünen hätte ich dafür abends viel mehr Ruhe.', fa: 'لزوماً نه — در عوض عصرها در فضای سبز آرامش خیلی بیشتری داشتم.' },
    ],
    fr: [
      { t: 'Si tu pouvais choisir librement, préférerais-tu vivre en centre-ville ou en périphérie ?', fa: 'اگر آزادانه می‌توانستی انتخاب کنی، زندگی در مرکز شهر را ترجیح می‌دادی یا حومه؟' },
      { t: 'Je choisirais sûrement la périphérie si les transports restaient rapides.', fa: 'حتماً حومه را انتخاب می‌کردم اگر حمل‌ونقل سریع بود.' },
      { t: 'Le trajet quotidien ne te fatiguerait pas trop ?', fa: 'مسیر روزانه زیادی خسته‌ات نمی‌کرد؟' },
      { t: 'Pas si je pouvais lire dans le train et profiter d’un jardin le soir.', fa: 'نه اگر می‌توانستم در قطار کتاب بخوانم و عصر از باغچه لذت ببرم.' },
    ],
    es: [
      { t: 'Si pudieras elegir libremente, ¿vivirías en el centro o en un barrio tranquilo?', fa: 'اگر می‌توانستی آزادانه انتخاب کنی، در مرکز زندگی می‌کردی یا در یک محلهٔ آرام؟' },
      { t: 'Elegiría un barrio tranquilo si tuviera una estación de metro cerca.', fa: 'یک محلهٔ آرام انتخاب می‌کردم اگر یک ایستگاه مترو نزدیکش بود.' },
      { t: '¿No te molestaría tardar un poco más en llegar al trabajo?', fa: 'اذیتت نمی‌کرد کمی دیرتر سر کار برسی؟' },
      { t: 'Creo que compensaría, porque descansaría mucho mejor por la noche.', fa: 'فکر می‌کنم می‌ارزید، چون شب‌ها خیلی بهتر استراحت می‌کردم.' },
    ],
  },
  'b1-opinions': {
    de: [
      { t: 'Sollte die Innenstadt am Wochenende komplett autofrei werden?', fa: 'آیا مرکز شهر آخر هفته‌ها باید کاملاً بدون خودرو شود؟' },
      { t: 'Meiner Meinung nach ja, weil dann mehr Platz für Fußgänger und Cafés entsteht.', fa: 'به نظر من بله، چون آن‌وقت جای بیشتری برای عابران پیاده و کافه‌ها ایجاد می‌شود.' },
      { t: 'Einerseits stimmt das, aber andererseits brauchen manche Anwohner ihr Auto für Einkäufe.', fa: 'از یک سو درست است، اما از سوی دیگر بعضی ساکنان برای خرید به ماشینشان نیاز دارند.' },
      { t: 'Da hast du recht — mit häufigeren Bussen wäre das Problem aber leicht lösbar.', fa: 'حق با توست — اما با اتوبوس‌های پرتعدادتر این مشکل به‌راحتی حل‌شدنی است.' },
    ],
    fr: [
      { t: 'Penses-tu que le centre-ville devrait être réservé aux piétons le week-end ?', fa: 'فکر می‌کنی مرکز شهر آخر هفته‌ها باید مخصوص عابران پیاده شود؟' },
      { t: 'À mon avis oui, car cela rendrait les rues plus calmes et plus agréables.', fa: 'به نظر من بله، چون خیابان‌ها را آرام‌تر و دلپذیرتر می‌کند.' },
      { t: 'C’est vrai, mais les habitants qui ont des courses lourdes risquent d’être gênés.', fa: 'درست است، ولی ساکنانی که خرید سنگین دارند ممکن است به زحمت بیفتند.' },
      { t: 'C’est juste ; il faudrait alors renforcer les navettes gratuites pour eux.', fa: 'منطقی است؛ آن‌وقت باید سرویس‌های رایگان برایشان تقویت شود.' },
    ],
    es: [
      { t: '¿Crees que el centro debería ser peatonal los fines de semana?', fa: 'فکر می‌کنی مرکز شهر آخر هفته‌ها باید پیاده‌رو شود؟' },
      { t: 'En mi opinión sí, porque habría menos ruido y aire más limpio.', fa: 'به نظر من بله، چون سروصدای کمتر و هوای پاک‌تری خواهد بود.' },
      { t: 'Por un lado es buena idea, pero por otro podría complicar el acceso a los vecinos.', fa: 'از یک طرف ایدهٔ خوبیه، اما از طرف دیگر ممکن است دسترسی ساکنان را سخت کند.' },
      { t: 'Es verdad, aunque con más autobuses frecuentes funcionaría muy bien.', fa: 'درست است، هرچند با اتوبوس‌های منظم‌تر خیلی خوب جواب می‌دهد.' },
    ],
  },
  'b1-compare-options': {
    de: [
      { s: 'همکار', t: 'Welcher Ort eignet sich besser für unseren Workshop — das Hotel oder das Kulturzentrum?', fa: 'کدام مکان برای کارگاه ما مناسب‌تر است — هتل یا مرکز فرهنگی؟' },
      { t: 'Das Kulturzentrum ist deutlich günstiger und liegt direkt an der U-Bahn.', fa: 'مرکز فرهنگی به‌وضوح ارزان‌تر است و درست کنار مترو قرار دارد.' },
      { s: 'همکار', t: 'Hat das Hotel dafür nicht die bessere Technik im Seminarraum?', fa: 'در عوض هتل در سالن سمینار تجهیزات فنی بهتری ندارد؟' },
      { t: 'Stimmt, aber einen Beamer können wir mitbringen — einigen wir uns also auf das Kulturzentrum.', fa: 'درست است، اما ویدئوپروژکتور را خودمان می‌توانیم بیاوریم — پس روی مرکز فرهنگی توافق کنیم.' },
    ],
    fr: [
      { s: 'همکار', t: 'Quel lieu préfères-tu pour notre atelier : l’hôtel ou le centre culturel ?', fa: 'برای کارگاهمان کدام جا را ترجیح می‌دهی: هتل یا مرکز فرهنگی؟' },
      { t: 'Le centre culturel est moins cher et beaucoup plus facile d’accès en métro.', fa: 'مرکز فرهنگی ارزان‌تر است و دسترسی‌اش با مترو خیلی راحت‌تر است.' },
      { s: 'همکار', t: 'Mais l’hôtel propose une grande salle déjà équipée pour les projections.', fa: 'اما هتل یک سالن بزرگ مجهز به تجهیزات نمایش دارد.' },
      { t: 'C’est vrai, mais nous avons déjà notre projecteur ; choisissons le centre culturel.', fa: 'درست است، ولی ما خودمان پروژکتور داریم؛ پس مرکز فرهنگی را انتخاب کنیم.' },
    ],
    es: [
      { s: 'همکار', t: '¿Qué lugar te parece mejor para el taller: el hotel o el centro cívico?', fa: 'برای کارگاه کدام مکان به نظرت بهتر است: هتل یا مرکز فرهنگی؟' },
      { t: 'El centro cívico es más económico y está justo al lado de la estación.', fa: 'مرکز فرهنگی به‌صرفه‌تر است و درست کنار ایستگاه قرار دارد.' },
      { s: 'همکار', t: 'Pero el hotel tiene salas más modernas y servicio de café.', fa: 'اما هتل سالن‌های مدرن‌تر و سرویس قهوه دارد.' },
      { t: 'Es cierto, aunque el centro cívico nos da más flexibilidad; quedémonos con él.', fa: 'درست است، هرچند مرکز فرهنگی انعطاف بیشتری به ما می‌دهد؛ همان را انتخاب کنیم.' },
    ],
  },
  'b1-work-interview': {
    de: [
      { s: 'مصاحبه‌گر', t: 'Welche Aufgaben hatten Sie hauptsächlich in Ihrer letzten Position?', fa: 'در شغل قبلی‌تان عمدتاً چه وظایفی بر عهده داشتید؟' },
      { t: 'Ich war für die Kundenbetreuung zuständig und habe wöchentliche Berichte erstellt.', fa: 'مسئول پشتیبانی مشتریان بودم و گزارش‌های هفتگی را تهیه می‌کردم.' },
      { s: 'مصاحبه‌گر', t: 'Warum möchten Sie jetzt zu unserem Unternehmen wechseln?', fa: 'چرا الان می‌خواهید به شرکت ما بیایید؟' },
      { t: 'Mich reizt die Arbeit in internationalen Projekten und Ihre offene Teamkultur.', fa: 'کار در پروژه‌های بین‌المللی و فرهنگ تیمی باز شما برایم بسیار جذاب است.' },
    ],
    fr: [
      { s: 'مصاحبه‌گر', t: 'Quelles étaient vos principales responsabilités dans votre poste précédent ?', fa: 'در شغل قبلی‌تان مسئولیت‌های اصلی شما چه بود؟' },
      { t: 'Je gérais le suivi des clients et je coordonnais les comptes rendus hebdomadaires.', fa: 'پیگیری مشتریان را مدیریت می‌کردم و گزارش‌های هفتگی را هماهنگ می‌کردم.' },
      { s: 'مصاحبه‌گر', t: 'Pourquoi souhaitez-vous rejoindre notre équipe aujourd’hui ?', fa: 'چرا امروز مایلید به تیم ما بپیوندید؟' },
      { t: 'Votre approche collaborative et vos projets européens correspondent exactement à ce que je recherche.', fa: 'رویکرد مشارکتی و پروژه‌های اروپایی شما دقیقاً همان چیزی است که دنبالش هستم.' },
    ],
    es: [
      { s: 'مصاحبه‌گر', t: '¿Cuáles eran sus principales responsabilidades en su empleo anterior?', fa: 'در شغل قبلی‌تان مسئولیت‌های اصلی شما چه بود؟' },
      { t: 'Me encargaba de atender a los clientes y coordinar los informes semanales.', fa: 'مسئول رسیدگی به مشتریان و هماهنگی گزارش‌های هفتگی بودم.' },
      { s: 'مصاحبه‌گر', t: '¿Por qué le interesa trabajar ahora con nuestro equipo?', fa: 'چرا الان به کار با تیم ما علاقه‌مندید؟' },
      { t: 'Valoro mucho su enfoque práctico y la oportunidad de asumir nuevos retos.', fa: 'رویکرد عملی شما و فرصت پذیرفتن چالش‌های تازه برایم بسیار ارزشمند است.' },
    ],
  },
  'b1-study-goals': {
    de: [
      { s: 'مشاور', t: 'Was ist Ihr wichtigstes Lernziel für die nächsten sechs Monate?', fa: 'مهم‌ترین هدف یادگیری شما برای شش ماه آینده چیست؟' },
      { t: 'Ich möchte im Herbst die B1-Prüfung bestehen, um danach eine Ausbildung zu beginnen.', fa: 'می‌خواهم پاییز آزمون B1 را قبول شوم تا بعد از آن دورهٔ حرفه‌ای را شروع کنم.' },
      { s: 'مشاور', t: 'Wie teilen Sie sich Ihre Lernzeit im Alltag ein?', fa: 'زمان مطالعه‌تان را در روزمره چطور تقسیم می‌کنید؟' },
      { t: 'Ich höre morgens auf dem Weg zur Arbeit Podcasts und schreibe abends kurze Texte.', fa: 'صبح‌ها در مسیر کار پادکست گوش می‌دهم و عصرها متن‌های کوتاه می‌نویسم.' },
    ],
    fr: [
      { s: 'مشاور', t: 'Quel est votre objectif principal d’apprentissage pour les six prochains mois ?', fa: 'هدف اصلی یادگیری شما برای شش ماه آینده چیست؟' },
      { t: 'Je veux réussir le niveau B1 pour pouvoir suivre une formation professionnelle l’an prochain.', fa: 'می‌خواهم سطح B1 را قبول شوم تا سال آینده در یک دورهٔ تخصصی شرکت کنم.' },
      { s: 'مشاور', t: 'Quelle méthode utilisez-vous pour progresser régulièrement ?', fa: 'برای پیشرفت منظم از چه روشی استفاده می‌کنید؟' },
      { t: 'J’écoute des dialogues chaque matin et je fais des fiches de vocabulaire le soir.', fa: 'هر صبح به گفت‌وگوها گوش می‌دهم و شب‌ها برگهٔ واژگان می‌نویسم.' },
    ],
    es: [
      { s: 'مشاور', t: '¿Cuál es su objetivo de estudio para los próximos meses?', fa: 'هدف تحصیلی شما برای ماه‌های آینده چیست؟' },
      { t: 'Quiero alcanzar el nivel B1 para poder cursar un máster el año próximo.', fa: 'می‌خواهم به سطح B1 برسم تا سال آینده کارشناسی ارشد بخوانم.' },
      { s: 'مشاور', t: '¿Cómo organiza su práctica diaria fuera de clase?', fa: 'تمرین روزانه‌تان را بیرون از کلاس چطور تنظیم می‌کنید؟' },
      { t: 'Leo artículos breves por la mañana y practico conversación dos veces por semana.', fa: 'صبح‌ها مقاله‌های کوتاه می‌خوانم و هفته‌ای دو بار مکالمه تمرین می‌کنم.' },
    ],
  },
  'b1-travel-problem': {
    de: [
      { t: 'Entschuldigung, mein Zug nach München hat vierzig Minuten Verspätung. Erreiche ich meinen Anschluss noch?', fa: 'ببخشید، قطار من به مونیخ چهل دقیقه تأخیر دارد. هنوز به قطار بعدی‌ام می‌رسم؟' },
      { s: 'کارمند ایستگاه', t: 'Leider nicht — der Anschlusszug wartet nur zehn Minuten. Sie können aber den nächsten um sechzehn Uhr nehmen.', fa: 'متأسفانه نه — قطار بعدی فقط ده دقیقه صبر می‌کند. اما می‌توانید قطار ساعت چهار را سوار شوید.' },
      { t: 'Muss ich dafür eine neue Fahrkarte kaufen oder gilt meine alte weiter?', fa: 'باید برایش بلیت جدید بخرم یا همان بلیت قبلی‌ام هنوز معتبر است؟' },
      { s: 'کارمند ایستگاه', t: 'Ihre Karte bleibt gültig; ich gebe Ihnen gern sofort eine Bestätigung mit.', fa: 'بلیتتان معتبر می‌ماند؛ با کمال میل الان یک تأییدیه به شما می‌دهم.' },
    ],
    fr: [
      { t: 'Excusez-moi, mon train a quarante minutes de retard. Vais-je rater ma correspondance ?', fa: 'ببخشید، قطارم چهل دقیقه تأخیر دارد. قطار اتصالی‌ام را از دست می‌دهم؟' },
      { s: 'کارمند ایستگاه', t: 'Oui, malheureusement, mais vous pouvez prendre le train suivant à seize heures sans frais.', fa: 'بله متأسفانه، اما می‌توانید بدون هزینه قطار بعدی ساعت چهار را سوار شوید.' },
      { t: 'Est-ce que mon billet reste valable ou faut-il l’échanger au guichet ?', fa: 'بلیتم معتبر می‌ماند یا باید در باجه تعویضش کنم؟' },
      { s: 'کارمند ایستگاه', t: 'Il reste valable ; je vous tamponne tout de suite l’attestation de retard.', fa: 'معتبر می‌ماند؛ همین الان گواهی تأخیر را برایتان مهر می‌زنم.' },
    ],
    es: [
      { t: 'Disculpe, mi tren lleva cuarenta minutos de retraso y voy a perder el enlace.', fa: 'ببخشید، قطارم چهل دقیقه تأخیر دارد و قطار بعدی را از دست می‌دهم.' },
      { s: 'کارمند ایستگاه', t: 'No se preocupe, puede viajar en el siguiente tren de las cuatro sin coste adicional.', fa: 'نگران نباشید، می‌توانید بدون هزینهٔ اضافی با قطار بعدی ساعت چهار سفر کنید.' },
      { t: '¿Necesito cambiar mi billete o sirve el mismo asiento?', fa: 'لازم است بلیتم را عوض کنم یا همین قابل استفاده است؟' },
      { s: 'کارمند ایستگاه', t: 'Le emitimos un billete nuevo gratuito aquí mismo en dos minutos.', fa: 'همین‌جا در دو دقیقه بلیت جدید رایگان برایتان صادر می‌کنیم.' },
    ],
  },
  'b1-health-advice': {
    de: [
      { s: 'پزشک', t: 'Seit wann genau haben Sie diese Rückenschmerzen, und wann werden sie stärker?', fa: 'دقیقاً از چه زمانی این کمردرد را دارید و چه موقع شدیدتر می‌شود؟' },
      { t: 'Seit Anfang der Woche, vor allem wenn ich abends lange am Schreibtisch sitze.', fa: 'از ابتدای هفته، به‌خصوص عصرها وقتی زیاد پشت میز می‌نشینم.' },
      { s: 'پزشک', t: 'Verstehe. Machen Sie zwischendurch Dehnübungen oder kurze Pausen?', fa: 'متوجهم. در این میان حرکات کششی یا استراحت‌های کوتاه انجام می‌دهید؟' },
      { t: 'Bisher kaum. Welche Übungen würden Sie mir für zu Hause empfehlen?', fa: 'تا الان خیلی کم. چه تمرین‌هایی را برای خانه به من توصیه می‌کنید؟' },
    ],
    fr: [
      { s: 'پزشک', t: 'Depuis quand avez-vous ces douleurs au dos, et à quel moment augmentent-elles ?', fa: 'از کی این کمردرد را دارید و چه زمانی بیشتر می‌شود؟' },
      { t: 'Depuis lundi, surtout lorsque je reste assis longtemps devant mon écran.', fa: 'از دوشنبه، به‌خصوص وقتی مدت زیادی پشت مانیتور می‌نشینم.' },
      { s: 'پزشک', t: 'Prenez-vous le temps de vous lever et de marcher toutes les heures ?', fa: 'آیا هر یک ساعت بلند می‌شوید و کمی راه می‌روید؟' },
      { t: 'Pas assez souvent. Que me conseillez-vous de faire pour soulager la tension ?', fa: 'نه به اندازهٔ کافی. برای کم‌کردن گرفتگی چه کاری پیشنهاد می‌کنید؟' },
    ],
    es: [
      { s: 'پزشک', t: '¿Desde cuándo nota este dolor de espalda y cuándo empeora?', fa: 'از چه زمانی این کمردرد را حس می‌کنید و چه وقت بدتر می‌شود؟' },
      { t: 'Desde el lunes, sobre todo después de pasar muchas horas sentado en la oficina.', fa: 'از دوشنبه، به‌خصوص بعد از ساعت‌های طولانی نشستن در دفتر.' },
      { s: 'پزشک', t: '¿Suele levantarse cada hora para estirar un poco?', fa: 'معمولاً هر ساعت بلند می‌شوید کمی کشش بدهید؟' },
      { t: 'Casi nunca. ¿Qué ejercicios suaves me recomienda hacer cada día?', fa: 'تقریباً هیچ‌وقت. چه تمرین‌های سبکی را برای هر روز توصیه می‌کنید؟' },
    ],
  },
  'b1-digital-life': {
    de: [
      { t: 'Wie viele Stunden verbringst du eigentlich am Tag vor Bildschirmen?', fa: 'راستی در روز چند ساعت جلوی صفحه‌نمایش‌ها می‌گذرانی؟' },
      { t: 'Beruflich ziemlich lange, deshalb schalte ich abends meine Benachrichtigungen oft aus.', fa: 'برای کار نسبتاً زیاد، به همین خاطر شب‌ها اغلب اعلان‌هایم را خاموش می‌کنم.' },
      { t: 'Hast du gestern den kurzen Dokumentarfilm über soziale Medien gesehen?', fa: 'دیروز مستند کوتاه دربارهٔ شبکه‌های اجتماعی را دیدی؟' },
      { t: 'Ja, er war sehr nachdenklich — er zeigt gut, wie wichtig bewusste Pausen sind.', fa: 'بله، خیلی تأمل‌برانگیز بود — خوب نشان می‌دهد وقفه‌های آگاهانه چقدر مهم‌اند.' },
    ],
    fr: [
      { t: 'Combien de temps passes-tu devant les écrans dans une journée normale ?', fa: 'در یک روز عادی چقدر وقت جلوی صفحه‌نمایش می‌گذرانی؟' },
      { t: 'Beaucoup pour le travail, alors le soir j’essaie de couper toutes les notifications.', fa: 'زیاد برای کار، بنابراین شب‌ها سعی می‌کنم همهٔ اعلان‌ها را ببندم.' },
      { t: 'As-tu regardé le reportage d’hier soir sur les réseaux sociaux ?', fa: 'گزارش دیشب دربارهٔ شبکه‌های اجتماعی را دیدی؟' },
      { t: 'Oui, il était très intéressant et montre bien pourquoi il faut garder du recul.', fa: 'بله، خیلی جالب بود و خوب نشان می‌دهد چرا باید فاصلهٔ منطقی نگه داشت.' },
    ],
    es: [
      { t: '¿Cuántas horas al día pasas frente a las pantallas?', fa: 'در روز چند ساعت جلوی صفحه‌ها می‌گذرانی؟' },
      { t: 'Bastantes por trabajo, por eso por la noche silencio casi todas las aplicaciones.', fa: 'به‌خاطر کار زیاد، برای همین شب‌ها تقریباً همهٔ برنامه‌ها را بی‌صدا می‌کنم.' },
      { t: '¿Viste el documental de anoche sobre el uso del móvil?', fa: 'مستند دیشب دربارهٔ استفاده از موبایل را دیدی؟' },
      { t: 'Sí, me gustó mucho porque explica bien cómo desconectar a tiempo.', fa: 'بله، خیلی خوشم آمد چون خوب توضیح می‌دهد چطور به‌موقع فاصله بگیریم.' },
    ],
  },
  'b1-report-summary': {
    de: [
      { s: 'همکار', t: 'Ich konnte an der Sitzung heute Morgen nicht teilnehmen. Was wurde denn beschlossen?', fa: 'نتوانستم در جلسهٔ امروز صبح شرکت کنم. چه تصمیمی گرفته شد؟' },
      { t: 'Die Gruppe hat entschieden, den Start der neuen Webseite um eine Woche zu verschieben.', fa: 'گروه تصمیم گرفت راه‌اندازی وب‌سایت جدید را یک هفته به تعویق بیندازد.' },
      { s: 'همکار', t: 'Und gab es schon eine Aufteilung, wer die letzten Texte prüft?', fa: 'و آیا تقسیمی هم انجام شد که چه کسی متن‌های آخر را بررسی کند؟' },
      { t: 'Ja, Laura prüft die Startseite, und ich fasse bis morgen alle Änderungen zusammen.', fa: 'بله، لائورا صفحهٔ اول را بررسی می‌کند و من تا فردا همهٔ تغییرات را جمع‌بندی می‌کنم.' },
    ],
    fr: [
      { s: 'همکار', t: 'Je n’ai pas pu assister à la réunion de ce matin. Qu’est-ce qui a été décidé ?', fa: 'نتوانستم در جلسهٔ امروز صبح حاضر شوم. چه تصمیمی گرفته شد؟' },
      { t: 'L’équipe a choisi de décaler le lancement d’une semaine pour finir les tests.', fa: 'تیم تصمیم گرفت شروع را یک هفته عقب بیندازد تا آزمون‌ها تمام شود.' },
      { s: 'همکار', t: 'Et qui s’occupe de relire les derniers textes ?', fa: 'و چه کسی مسئول بازخوانی متن‌های آخر است؟' },
      { t: 'Claire relit la page d’accueil et je résume les retours d’ici demain midi.', fa: 'کلر صفحهٔ اصلی را بازخوانی می‌کند و من تا فردا ظهر بازخوردها را خلاصه می‌کنم.' },
    ],
    es: [
      { s: 'همکار', t: 'No pude entrar en la reunión de esta mañana. ¿Qué se decidió al final?', fa: 'نتوانستم وارد جلسهٔ امروز صبح بشوم. آخرش چه تصمیمی گرفته شد؟' },
      { t: 'El equipo acordó aplazar el lanzamiento una semana para revisar los últimos detalles.', fa: 'تیم توافق کرد رونمایی را یک هفته عقب بیندازد تا جزئیات آخر بررسی شود.' },
      { s: 'همکار', t: '¿Se repartió ya quién revisa los textos finales?', fa: 'تقسیم شد که چه کسی متن‌های نهایی را بررسی کند؟' },
      { t: 'Sí, Ana revisa la portada y yo resumo los cambios para mañana.', fa: 'بله، آنا صفحهٔ اول را بررسی می‌کند و من تغییرات را برای فردا خلاصه می‌کنم.' },
    ],
  },
  'b1-relative-clauses': {
    de: [
      { t: 'Weißt du, wo das Kulturzentrum liegt, in dem morgen der Vortrag stattfindet?', fa: 'می‌دانی مرکز فرهنگی‌ای که فردا سخنرانی در آن برگزار می‌شود کجاست؟' },
      { t: 'Ja, das ist das helle Gebäude, das direkt gegenüber dem Stadtpark steht.', fa: 'بله، همان ساختمان روشنی است که درست روبه‌روی پارک شهر قرار دارد.' },
      { t: 'Und kennst du die Kollegin, die den Abend organisiert?', fa: 'و همکار خانمی که برنامهٔ عصر را هماهنگ می‌کند می‌شناسی؟' },
      { t: 'Klar, das ist Frau Berg, die auch unseren B1-Kurs betreut.', fa: 'حتماً، خانم برگ است که دورهٔ B1 ما را هم سرپرستی می‌کند.' },
    ],
    fr: [
      { t: 'Sais-tu où se trouve le centre culturel où a lieu la conférence demain ?', fa: 'می‌دانی مرکز فرهنگی‌ای که فردا همایش در آن است کجاست؟' },
      { t: 'Oui, c’est le bâtiment moderne qui se situe juste en face du parc.', fa: 'بله، همان ساختمان مدرنی است که درست روبه‌روی پارک قرار دارد.' },
      { t: 'Et tu connais la personne qui organise la rencontre ?', fa: 'و کسی که این دیدار را هماهنگ می‌کند می‌شناسی؟' },
      { t: 'Oui, c’est la responsable dont je t’ai parlé la semaine dernière.', fa: 'بله، همان مسئولی است که هفتهٔ پیش برایت ازش گفتم.' },
    ],
    es: [
      { t: '¿Sabes dónde está el centro cultural donde es la charla mañana?', fa: 'می‌دانی مرکز فرهنگی‌ای که فردا سخنرانی آنجاست کجاست؟' },
      { t: 'Sí, es el edificio blanco que está justo enfrente del parque.', fa: 'بله، همان ساختمان سفیدی است که درست روبه‌روی پارک است.' },
      { t: '¿Conoces a la coordinadora que dirige el evento?', fa: 'هماهنگ‌کننده‌ای که برنامه را اداره می‌کند می‌شناسی؟' },
      { t: 'Sí, es la profesora que nos recomendó este libro.', fa: 'بله، همان معلمی است که این کتاب را به ما پیشنهاد داد.' },
    ],
  },
  'b1-process-passive': {
    de: [
      { t: 'Wie läuft die Anmeldung für den neuen Sprachkurs genau ab?', fa: 'ثبت‌نام برای دورهٔ زبان جدید دقیقاً چطور انجام می‌شود؟' },
      { t: 'Zuerst wird ein kurzes Online-Formular ausgefüllt, und danach wird ein Einstufungstest gemacht.', fa: 'ابتدا یک فرم آنلاین کوتاه پر می‌شود و پس از آن آزمون تعیین سطح انجام می‌شود.' },
      { t: 'Wann werden die endgültigen Kurslisten verschickt?', fa: 'فهرست‌های نهایی کلاس چه زمانی ارسال می‌شوند؟' },
      { t: 'Alle Teilnehmer werden spätestens zwei Tage vor Kursbeginn per E-Mail informiert.', fa: 'به همهٔ شرکت‌کنندگان حداکثر دو روز پیش از شروع دوره با ایمیل اطلاع داده می‌شود.' },
    ],
    fr: [
      { t: 'Comment se déroule l’inscription pour la nouvelle session de cours ?', fa: 'ثبت‌نام برای دورهٔ جدید کلاس چطور انجام می‌شود؟' },
      { t: 'D’abord, le dossier est rempli en ligne, puis un court test de niveau est proposé.', fa: 'ابتدا پرونده آنلاین پر می‌شود، سپس یک آزمون کوتاه تعیین سطح ارائه می‌شود.' },
      { t: 'Quand est-ce que la confirmation est envoyée aux participants ?', fa: 'تأییدیه کی برای شرکت‌کنندگان فرستاده می‌شود؟' },
      { t: 'Les listes sont publiées deux jours avant la rentrée et confirmées par message.', fa: 'فهرست‌ها دو روز قبل از شروع منتشر و با پیام تأیید می‌شوند.' },
    ],
    es: [
      { t: '¿Cómo funciona exactamente la matrícula para el curso nuevo?', fa: 'ثبت‌نام دورهٔ جدید دقیقاً چطور پیش می‌رود؟' },
      { t: 'Primero se rellena el formulario en línea y luego se asigna el nivel adecuado.', fa: 'ابتدا فرم آنلاین پر می‌شود و بعد سطح مناسب تعیین می‌شود.' },
      { t: '¿Cuándo se confirman los horarios definitivos?', fa: 'ساعت‌های نهایی چه زمانی تأیید می‌شوند؟' },
      { t: 'Las listas se envían por correo dos días antes de empezar las clases.', fa: 'فهرست‌ها دو روز پیش از شروع کلاس‌ها با ایمیل فرستاده می‌شوند.' },
    ],
  },
  'b1-inference-past-modals': {
    de: [
      { t: 'Warum war Daniel gestern nicht bei unserer Teambesprechung?', fa: 'چرا دانیل دیروز در جلسهٔ تیم ما نبود؟' },
      { t: 'Er muss wohl noch im Zug festgesessen haben, denn die Strecke war gesperrt.', fa: 'حتماً هنوز در قطار گیر افتاده بوده، چون مسیر بسته بود.' },
      { t: 'Konntet ihr die Aufgaben trotzdem ohne ihn verteilen?', fa: 'با این حال توانستید کارها را بدون او تقسیم کنید؟' },
      { t: 'Ja, zum Glück konnten wir alles klären und ihm die Notizen schicken.', fa: 'بله، خوشبختانه توانستیم همه‌چیز را روشن کنیم و یادداشت‌ها را برایش بفرستیم.' },
    ],
    fr: [
      { t: 'Pourquoi Daniel n’était-il pas à la réunion d’hier matin ?', fa: 'چرا دانیل دیروز صبح در جلسه نبود؟' },
      { t: 'Il a dû être retardé par les travaux sur sa ligne de train.', fa: 'حتماً به‌خاطر تعمیرات خط قطارش معطل شده است.' },
      { t: 'Avez-vous quand même pu répartir les tâches sans lui ?', fa: 'با این حال توانستید وظایف را بدون او تقسیم کنید؟' },
      { t: 'Oui, nous avons pu tout organiser et lui envoyer le résumé ensuite.', fa: 'بله، توانستیم همه‌چیز را هماهنگ کنیم و بعد خلاصه را برایش بفرستیم.' },
    ],
    es: [
      { t: '¿Por qué no vino Daniel a la reunión de ayer?', fa: 'چرا دانیل دیروز به جلسه نیامد؟' },
      { t: 'Debió de quedarse atrapado en el tráfico porque hubo un corte en la avenida.', fa: 'حتماً در ترافیک گیر افتاده بود چون خیابان اصلی بسته شده بود.' },
      { t: '¿Pudisteis avanzar igualmente con el reparto de tareas?', fa: 'با این حال توانستید با تقسیم کارها جلو بروید؟' },
      { t: 'Sí, por suerte pudimos cerrarlo todo y luego le enviamos el resumen.', fa: 'بله، خوشبختانه توانستیم همه‌چیز را ببندیم و بعد خلاصه را برایش بفرستیم.' },
    ],
  },
  'b1-news-events': {
    de: [
      { t: 'Hast du heute Morgen die Nachricht über die neuen Radwege im Viertel gelesen?', fa: 'امروز صبح خبر مسیرهای دوچرخه‌سواری جدید در محله را خواندی؟' },
      { t: 'Ja, ab nächstem Monat soll die Hauptstraße deutlich sicherer gemacht werden.', fa: 'بله، قرار است از ماه آینده خیابان اصلی به‌وضوح امن‌تر شود.' },
      { t: 'Stammt die Meldung direkt von der Stadtverwaltung?', fa: 'این خبر مستقیماً از سوی شهرداری است؟' },
      { t: 'Ja, der Plan wurde gestern offiziell auf der Webseite der Stadt veröffentlicht.', fa: 'بله، طرح دیروز رسماً در وب‌سایت شهر منتشر شد.' },
    ],
    fr: [
      { t: 'Tu as lu l’article ce matin sur les nouvelles pistes cyclables du quartier ?', fa: 'مقالهٔ امروز صبح دربارهٔ مسیرهای تازهٔ دوچرخه در محله را خواندی؟' },
      { t: 'Oui, la mairie veut sécuriser l’avenue principale dès le mois prochain.', fa: 'بله، شهرداری می‌خواهد از ماه آینده خیابان اصلی را ایمن‌تر کند.' },
      { t: 'L’information vient bien d’une source officielle ?', fa: 'خبر واقعاً از منبع رسمی است؟' },
      { t: 'Oui, le communiqué complet a été publié hier sur le site de la ville.', fa: 'بله، اطلاعیهٔ کامل دیروز در سایت شهر منتشر شده است.' },
    ],
    es: [
      { t: '¿Leíste hoy la noticia sobre los nuevos carriles bici del barrio?', fa: 'امروز خبر مسیرهای دوچرخهٔ تازهٔ محله را خواندی؟' },
      { t: 'Sí, parece que empezarán las obras en la avenida principal el próximo mes.', fa: 'بله، به نظر می‌رسد ماه آینده کارها در خیابان اصلی شروع می‌شود.' },
      { t: '¿Está ya confirmado por el ayuntamiento?', fa: 'از سوی شهرداری تأیید شده است؟' },
      { t: 'Sí, lo publicaron ayer en el boletín oficial municipal.', fa: 'بله، دیروز در اطلاعیهٔ رسمی شهرداری منتشرش کردند.' },
    ],
  },
  'b1-culture-exchange': {
    de: [
      { t: 'Ich bin am Samstag zum ersten Mal bei deutschen Kollegen zum Abendessen eingeladen. Worauf sollte ich achten?', fa: 'شنبه برای اولین بار به شام در خانهٔ همکاران آلمانی دعوت شده‌ام. به چه نکته‌ای باید توجه کنم؟' },
      { t: 'Es ist üblich, pünktlich zu sein und ein kleines Gastgeschenk wie Blumen oder Gebäck mitzubringen.', fa: 'معمول است سر وقت بروی و یک هدیهٔ کوچک مهمانی مثل گل یا شیرینی ببری.' },
      { t: 'Und zieht man an der Tür meistens die Schuhe aus?', fa: 'و دم در معمولاً کفش‌ها را درمی‌آورند؟' },
      { t: 'Oft ja — frag am besten einfach kurz beim Reinkommen nach.', fa: 'اغلب بله — بهترین کار این است هنگام ورود کوتاه بپرسی.' },
    ],
    fr: [
      { t: 'Je suis invité à dîner chez des amis français samedi. Y a-t-il une habitude particulière ?', fa: 'شنبه به شام در خانهٔ دوستان فرانسوی دعوت شده‌ام. رسم خاصی هست؟' },
      { t: 'On apporte souvent un petit dessert ou des fleurs pour remercier l’hôte.', fa: 'اغلب یک دسر کوچک یا گل برای تشکر از میزبان می‌برند.' },
      { t: 'Est-ce qu’il faut arriver à l’heure exacte ?', fa: 'باید رأس ساعت دقیق رسید؟' },
      { t: 'Arriver avec cinq à dix minutes de battement est tout à fait normal.', fa: 'رسیدن با پنج تا ده دقیقه فاصله کاملاً عادی است.' },
    ],
    es: [
      { t: 'Este sábado me invitaron a cenar a casa de unos compañeros. ¿Qué se suele llevar?', fa: 'این شنبه به شام خانهٔ همکاران دعوت شده‌ام. معمولاً چه چیزی می‌برند؟' },
      { t: 'Lo normal es llevar algo sencillo para compartir, como un postre o fruta.', fa: 'معمول است چیز ساده‌ای برای اشتراک ببری، مثل یک دسر یا میوه.' },
      { t: '¿La gente cena más tarde de lo que pensaba?', fa: 'مردم دیرتر از آنچه فکر می‌کردم شام می‌خورند؟' },
      { t: 'Sí, aquí la cena suele empezar sobre las nueve de la noche.', fa: 'بله، اینجا شام معمولاً حدود ساعت نه شب شروع می‌شود.' },
    ],
  },
  'b1-complaint-followup': {
    de: [
      { t: 'Guten Tag! Ich habe gestern eine Bestellung erhalten, aber leider war ein Buch beschädigt.', fa: 'روز بخیر! دیروز سفارشی تحویل گرفتم، اما متأسفانه یک کتاب آسیب دیده بود.' },
      { s: 'پشتیبانی', t: 'Das tut uns sehr leid! Haben Sie die Bestellnummer gerade zur Hand?', fa: 'خیلی متأسفیم! شماره سفارش را الان دم دست دارید؟' },
      { t: 'Ja, es ist die Nummer vier-sieben-zwei. Können Sie mir ein neues Exemplar schicken?', fa: 'بله، شماره چهار-هفت-دو است. می‌توانید یک نسخهٔ تازه برایم بفرستید؟' },
      { s: 'پشتیبانی', t: 'Selbstverständlich, der kostenlose Ersatz geht noch heute an Sie raus.', fa: 'حتماً، نسخهٔ جایگزین رایگان همین امروز برایتان ارسال می‌شود.' },
    ],
    fr: [
      { t: 'Bonjour ! J’ai reçu ma commande hier, mais l’un des livres est arrivé abîmé.', fa: 'روز بخیر! دیروز سفارشم را گرفتم، اما یکی از کتاب‌ها آسیب‌دیده رسیده است.' },
      { s: 'پشتیبانی', t: 'Nous sommes désolés pour ce désagrément. Quel est votre numéro de commande ?', fa: 'بابت این مشکل پوزش می‌خواهیم. شماره سفارشتان چیست؟' },
      { t: 'C’est le numéro quatre cent soixante-douze. Pouvez-vous m’en renvoyer un neuf ?', fa: 'شماره چهارصدوهفتادودو است. می‌توانید یک نسخهٔ نو بفرستید؟' },
      { s: 'پشتیبانی', t: 'Bien sûr, nous expédions un exemplaire neuf sans frais dès aujourd’hui.', fa: 'حتماً، همین امروز یک نسخهٔ نو بدون هزینه ارسال می‌کنیم.' },
    ],
    es: [
      { t: 'Buenos días. Recibí ayer mi pedido, pero uno de los libros llegó dañado.', fa: 'صبح بخیر. دیروز سفارشم را دریافت کردم، ولی یکی از کتاب‌ها آسیب‌دیده رسید.' },
      { s: 'پشتیبانی', t: 'Sentimos mucho el inconveniente. ¿Me indica su número de pedido?', fa: 'بابت این مشکل خیلی متأسفیم. شماره سفارشتان را می‌گویید؟' },
      { t: 'Es el cuatrocientos setenta y dos. ¿Pueden enviarme otro ejemplar?', fa: 'چهارصدوهفتادودو است. می‌توانید یک نسخهٔ دیگر بفرستید؟' },
      { s: 'پشتیبانی', t: 'Por supuesto, hoy mismo le enviamos uno nuevo sin coste alguno.', fa: 'حتماً، همین امروز یک نسخهٔ جدید بدون هیچ هزینه‌ای برایتان می‌فرستیم.' },
    ],
  },
  'b1-work-coordination': {
    de: [
      { s: 'همکار', t: 'Die Abgabefrist für unseren Bericht ist schon am Donnerstag. Wie teilen wir die Arbeit auf?', fa: 'مهلت تحویل گزارش ما همین پنجشنبه است. کار را چطور تقسیم کنیم؟' },
      { t: 'Ich übernehme die Auswertung der Umfrage und sende dir die Grafik bis Dienstagmittag.', fa: 'من تحلیل نظرسنجی را برعهده می‌گیرم و نمودار را تا ظهر سه‌شنبه برایت می‌فرستم.' },
      { s: 'همکار', t: 'Perfekt, dann schreibe ich in der Zwischenzeit die Einleitung und prüfe die Zahlen.', fa: 'عالی، پس در این فاصله من مقدمه را می‌نویسم و عددها را بررسی می‌کنم.' },
      { t: 'Super! Lass uns am Mittwoch kurz alles gemeinsam gegenlesen.', fa: 'عالی! چهارشنبه با هم یک بار کل متن را بازبینی کنیم.' },
    ],
    fr: [
      { s: 'همکار', t: 'La date limite pour le dossier est déjà jeudi. Comment nous répartissons-nous les tâches ?', fa: 'مهلت پرونده همین پنجشنبه است. وظایف را چطور بین خودمان تقسیم کنیم؟' },
      { t: 'Je m’occupe d’analyser les résultats et je t’envoie les graphiques mardi midi.', fa: 'من تحلیل نتایج را برعهده می‌گیرم و نمودارها را ظهر سه‌شنبه می‌فرستم.' },
      { s: 'همکار', t: 'Très bien, pendant ce temps je rédige l’introduction et je vérifie les tableaux.', fa: 'خیلی خوب، در این میان من مقدمه را می‌نویسم و جدول‌ها را چک می‌کنم.' },
      { t: 'Parfait, faisons une relecture commune mercredi après-midi.', fa: 'عالی، چهارشنبه بعدازظهر یک بازخوانی مشترک انجام دهیم.' },
    ],
    es: [
      { s: 'همکار', t: 'La fecha límite del informe es este jueves. ¿Cómo repartimos el trabajo?', fa: 'مهلت گزارش همین پنجشنبه است. کار را چطور تقسیم کنیم؟' },
      { t: 'Yo analizo la encuesta y te paso los gráficos el martes al mediodía.', fa: 'من نظرسنجی را تحلیل می‌کنم و سه‌شنبه ظهر نمودارها را برایت می‌فرستم.' },
      { s: 'همکار', t: 'Estupendo, mientras tanto yo redacto la introducción y reviso los datos.', fa: 'عالی، در این بین من مقدمه را می‌نویسم و داده‌ها را بررسی می‌کنم.' },
      { t: 'Genial, el miércoles por la tarde lo repasamos todo juntos.', fa: 'عالی، چهارشنبه عصر همه‌چیز را با هم مرور می‌کنیم.' },
    ],
  },
  'b1-negotiating': {
    de: [
      { s: 'همکار', t: 'Können wir die Präsentation auf Montagmorgen um acht Uhr legen?', fa: 'می‌توانیم ارائه را دوشنبه صبح ساعت هشت بگذاریم؟' },
      { t: 'Acht Uhr ist für einige Kollegen zu früh, weil sie von außerhalb anreisen.', fa: 'ساعت هشت برای بعضی همکاران خیلی زود است، چون از بیرون شهر می‌آیند.' },
      { s: 'همکار', t: 'Verstehe. Wie wäre es stattdessen mit halb zehn und einer kürzeren Pause?', fa: 'متوجهم. به‌جایش نه و نیم با یک استراحت کوتاه‌تر چطور است؟' },
      { t: 'Halb zehn passt allen gut — damit sind wir uns einig!', fa: 'نه و نیم برای همه خوب است — پس به توافق رسیدیم!' },
    ],
    fr: [
      { s: 'همکار', t: 'Pourrait-on fixer la présentation lundi matin à huit heures ?', fa: 'می‌توانیم ارائه را دوشنبه صبح ساعت هشت بگذاریم؟' },
      { t: 'Huit heures est un peu tôt pour ceux qui viennent en train de loin.', fa: 'ساعت هشت برای کسانی که با قطار از راه دور می‌آیند کمی زود است.' },
      { s: 'همکار', t: 'Dans ce cas, que penses-tu de neuf heures trente en format plus court ?', fa: 'در این صورت نظرت دربارهٔ نه و نیم در قالب کوتاه‌تر چیست؟' },
      { t: 'Neuf heures trente convient à toute l’équipe, c’est adopté !', fa: 'نه و نیم برای کل تیم مناسب است، قبول شد!' },
    ],
    es: [
      { s: 'همکار', t: '¿Podemos poner la presentación el lunes a las ocho de la mañana?', fa: 'می‌توانیم ارائه را دوشنبه ساعت هشت صبح بگذاریم؟' },
      { t: 'Las ocho es demasiado temprano para quienes viajan desde fuera.', fa: 'ساعت هشت برای کسانی که از بیرون شهر می‌آیند خیلی زود است.' },
      { s: 'همکار', t: 'Entiendo. ¿Qué tal a las nueve y media con una agenda más breve?', fa: 'می‌فهمم. ساعت نه و نیم با دستور کار کوتاه‌تر چطور است؟' },
      { t: 'A las nueve y media nos viene bien a todos, ¡trato hecho!', fa: 'ساعت نه و نیم برای همه خوب است، توافق شد!' },
    ],
  },
  'b1-purpose-consequences': {
    de: [
      { t: 'Warum stellt unsere Schule jetzt überall getrennte Behälter für Papier und Glas auf?', fa: 'چرا مدرسهٔ ما الان همه‌جا سطل‌های جداگانه برای کاغذ و شیشه می‌گذارد؟' },
      { t: 'Damit wir weniger Abfall produzieren und mehr Wertstoffe recyceln können.', fa: 'تا زبالهٔ کمتری تولید کنیم و مواد قابل بازیافت بیشتری برگردانیم.' },
      { t: 'Helfen denn auch digitale Unterlagen dabei, Papier zu sparen?', fa: 'آیا جزوه‌های دیجیتال هم به صرفه‌جویی در کاغذ کمک می‌کنند؟' },
      { t: 'Ja, dadurch verbrauchen wir schon fast halb so viele Kopien wie letztes Jahr.', fa: 'بله، به این ترتیب تقریباً نصف پارسال کپی مصرف می‌کنیم.' },
    ],
    fr: [
      { t: 'Pourquoi l’école installe-t-elle des bacs de tri dans chaque couloir ?', fa: 'چرا مدرسه در هر راهرو سطل‌های تفکیک می‌گذارد؟' },
      { t: 'Pour réduire les déchets et permettre de recycler le papier et le verre.', fa: 'برای کاهش زباله و امکان بازیافت کاغذ و شیشه.' },
      { t: 'Les supports numériques aident-ils aussi à gaspiller moins ?', fa: 'جزوه‌های دیجیتال هم به هدررفت کمتر کمک می‌کنند؟' },
      { t: 'Oui, par conséquent nous imprimons déjà beaucoup moins de feuilles.', fa: 'بله، در نتیجه از الان خیلی کمتر برگه چاپ می‌کنیم.' },
    ],
    es: [
      { t: '¿Por qué están poniendo contenedores de reciclaje en cada pasillo?', fa: 'چرا در هر راهرو سطل‌های بازیافت می‌گذارند؟' },
      { t: 'Para reducir la basura diaria y aprovechar mejor el papel y el vidrio.', fa: 'برای کاهش زبالهٔ روزانه و استفادهٔ بهتر از کاغذ و شیشه.' },
      { t: '¿Ayuda también enviar los apuntes en formato digital?', fa: 'ارسال جزوه‌ها به شکل دیجیتال هم کمک می‌کند؟' },
      { t: 'Sí, gracias a eso gastamos la mitad de papel que el año pasado.', fa: 'بله، به لطف آن نصف پارسال کاغذ مصرف می‌کنیم.' },
    ],
  },
  'b1-relatives-prepositions': {
    de: [
      { t: 'Kennst du den Kollegen, mit dem wir gestern über die Software gesprochen haben?', fa: 'همکاری را که دیروز با او دربارهٔ نرم‌افزار صحبت کردیم می‌شناسی؟' },
      { t: 'Ja, das ist Herr Weber, auf dessen Hilfe wir uns immer verlassen können.', fa: 'بله، آقای وبر است که همیشه می‌توانیم روی کمکش حساب کنیم.' },
      { t: 'Und welches Handbuch meintest du vorhin für die neue Aufgabe?', fa: 'و کدام کتابچه را کمی پیش برای کار جدید منظور داشتی؟' },
      { t: 'Das rote Buch, aus dem ich dir zwei praktische Beispiele kopiert habe.', fa: 'همان کتاب قرمزی که دو مثال کاربردی از آن برایت کپی گرفتم.' },
    ],
    fr: [
      { t: 'Tu te souviens du collègue avec qui nous avons discuté du projet hier ?', fa: 'همکاری را که دیروز با هم دربارهٔ پروژه با او صحبت کردیم یادت هست؟' },
      { t: 'Oui, c’est Paul, sur qui toute l’équipe compte pour la partie technique.', fa: 'بله، پل است که کل تیم برای بخش فنی رویش حساب می‌کند.' },
      { t: 'Et quel est le manuel dont tu m’as parlé tout à l’heure ?', fa: 'و آن کتابچه‌ای که کمی پیش برایم گفتی کدام است؟' },
      { t: 'C’est le guide pratique grâce auquel j’ai résolu ce problème.', fa: 'همان راهنمای عملی است که به کمک آن این مشکل را حل کردم.' },
    ],
    es: [
      { t: '¿Recuerdas al compañero con el que hablamos ayer del nuevo proyecto?', fa: 'همکاری را که دیروز با او دربارهٔ پروژهٔ جدید صحبت کردیم یادت هست؟' },
      { t: 'Sí, es Pablo, en quien confiamos todos para revisar los informes.', fa: 'بله، پابلو است که همه برای بررسی گزارش‌ها به او اعتماد داریم.' },
      { t: '¿Y cuál es el libro del que sacaste esos ejemplos tan claros?', fa: 'و کتابی که آن مثال‌های روشن را از آن درآوردی کدام است؟' },
      { t: 'Es el manual en el que nos apoyamos durante todo el curso.', fa: 'همان کتاب راهنمایی است که در طول کل دوره به آن تکیه می‌کنیم.' },
    ],
  },
  'b1-sequence-incident': {
    de: [
      { t: 'Wie bist du gestern Abend eigentlich noch rechtzeitig angekommen, als der Strom ausfiel?', fa: 'دیشب وقتی برق قطع شد بالاخره چطور به‌موقع رسیدی؟' },
      { t: 'Zuerst blieben wir im Aufzug stecken, während alle ruhig auf die Durchsage warteten.', fa: 'اول در آسانسور گیر افتادیم، در حالی که همه آرام منتظر اعلامیه ماندند.' },
      { t: 'Das klingt aufregend! Wie ging es dann weiter?', fa: 'هیجان‌انگیز به نظر می‌رسد! بعدش چطور پیش رفت؟' },
      { t: 'Nach zehn Minuten sprang der Notstrom an, und am Ende erreichten wir den Saal pünktlich.', fa: 'بعد از ده دقیقه برق اضطراری روشن شد و در نهایت به‌موقع به سالن رسیدیم.' },
    ],
    fr: [
      { t: 'Comment as-tu réussi à arriver à l’heure hier soir malgré la panne de courant ?', fa: 'دیشب با وجود قطع برق چطور توانستی سر وقت برسی؟' },
      { t: 'Au moment où je suis entré dans la station, toutes les lumières se sont éteintes.', fa: 'درست لحظه‌ای که وارد ایستگاه شدم همهٔ چراغ‌ها خاموش شدند.' },
      { t: 'Oh là là ! Comment êtes-vous sortis de là ?', fa: 'وای! چطور از آنجا بیرون آمدید؟' },
      { t: 'Pendant que le personnel guidait les voyageurs, le courant est revenu dix minutes plus tard.', fa: 'در حالی که کارکنان مسافران را راهنمایی می‌کردند، ده دقیقه بعد برق برگشت.' },
    ],
    es: [
      { t: '¿Cómo conseguiste llegar a tiempo anoche cuando se fue la luz en el metro?', fa: 'دیشب وقتی برق مترو رفت چطور توانستی سر وقت برسی؟' },
      { t: 'Justo cuando bajaba al andén, el tren se detuvo y todo quedó a oscuras.', fa: 'درست وقتی داشتم به سکو می‌رفتم، قطار ایستاد و همه‌جا تاریک شد.' },
      { t: '¡Qué susto! ¿Y qué pasó después?', fa: 'چه ترسی! و بعدش چه شد؟' },
      { t: 'Mientras esperábamos con calma, volvió la electricidad y pudimos continuar enseguida.', fa: 'در حالی که با آرامش منتظر بودیم، برق برگشت و توانستیم فوراً ادامه بدهیم.' },
    ],
  },
  'b1-short-presentation': {
    de: [
      { s: 'هم‌کلاسی', t: 'Worüber sprichst du heute in deiner kurzen Präsentation?', fa: 'امروز در ارائهٔ کوتاهت دربارهٔ چه صحبت می‌کنی؟' },
      { t: 'Ich stelle vor, wie kurze tägliche Routinen beim Sprachenlernen wirklich helfen.', fa: 'توضیح می‌دهم که عادت‌های کوتاه روزانه چطور واقعاً در یادگیری زبان کمک می‌کنند.' },
      { s: 'هم‌کلاسی', t: 'Welche Kernaussage möchtest du der Gruppe am Ende mitgeben?', fa: 'در پایان می‌خواهی چه پیام اصلی‌ای به گروه بدهی؟' },
      { t: 'Zusammenfassend gilt: Zehn konzentrierte Minuten pro Tag bringen mehr als seltene Marathon-Sitzungen.', fa: 'در جمع‌بندی: ده دقیقهٔ متمرکز در روز نتیجهٔ بیشتری از جلسه‌های طولانیِ کم‌فاصله دارد.' },
    ],
    fr: [
      { s: 'هم‌کلاسی', t: 'Quel thème présentes-tu dans ton exposé de cinq minutes aujourd’hui ?', fa: 'امروز در ارائهٔ پنج‌دقیقه‌ای‌ات چه موضوعی را مطرح می‌کنی؟' },
      { t: 'Je vais expliquer pourquoi de courtes séances quotidiennes sont plus efficaces que de longues révisions.', fa: 'توضیح می‌دهم چرا جلسه‌های کوتاه روزانه از مرورهای طولانی مؤثرترند.' },
      { s: 'هم‌کلاسی', t: 'Et comment comptes-tu conclure ta présentation ?', fa: 'و چطور قصد داری ارائه‌ات را جمع‌بندی کنی؟' },
      { t: 'En conclusion, la régularité reste la clé pour parler avec assurance.', fa: 'در نتیجه، تداوم کلید اصلی برای صحبت‌کردن با اعتمادبه‌نفس است.' },
    ],
    es: [
      { s: 'هم‌کلاسی', t: '¿De qué trata tu breve presentación de hoy en clase?', fa: 'ارائهٔ کوتاه امروزت در کلاس دربارهٔ چیست؟' },
      { t: 'Voy a explicar cómo los hábitos diarios breves ayudan a recordar mejor el vocabulario.', fa: 'توضیح می‌دهم عادت‌های کوتاه روزانه چطور به یادآوری بهتر واژگان کمک می‌کنند.' },
      { s: 'هم‌کلاسی', t: '¿Cuál es la idea final que quieres destacar?', fa: 'ایدهٔ نهایی‌ای که می‌خواهی برجسته کنی چیست؟' },
      { t: 'En resumen, practicar quince minutos cada día funciona mucho mejor que estudiar solo el domingo.', fa: 'خلاصه، روزی پانزده دقیقه تمرین خیلی بهتر از درس خواندن فقط در روز یکشنبه جواب می‌دهد.' },
    ],
  },
  'b1-conversation-repair': {
    de: [
      { t: 'Entschuldigung, ich habe die letzte Zahl am Telefon leider nicht ganz verstanden. Könnten Sie das wiederholen?', fa: 'ببخشید، آخرین عدد را پشت تلفن متأسفانه خوب متوجه نشدم. می‌توانید تکرار کنید؟' },
      { s: 'کارمند', t: 'Gern! Ich meinte das Büro im vierten Stock, Raum vierzehn.', fa: 'حتماً! منظورم دفتر در طبقهٔ چهارم، اتاق چهارده بود.' },
      { t: 'Ach so, vierzehn und nicht vierzig! Meinten Sie damit heute Nachmittag um drei?', fa: 'آها، چهارده و نه چهل! منظورتان امروز بعدازظهر ساعت سه بود؟' },
      { s: 'کارمند', t: 'Genau, heute um fünfzehn Uhr. Schön, dass das jetzt geklärt ist.', fa: 'دقیقاً، امروز ساعت سه بعدازظهر. خوشحالم که الان روشن شد.' },
    ],
    fr: [
      { t: 'Excusez-moi, je n’ai pas bien saisi le numéro de la salle. Pourriez-vous répéter ?', fa: 'ببخشید، شمارهٔ سالن را خوب نگرفتم. می‌توانید تکرار کنید؟' },
      { s: 'کارمند', t: 'Bien sûr ! C’est au quatrième étage, salle quatorze.', fa: 'حتماً! طبقهٔ چهارم، سالن چهارده است.' },
      { t: 'D’accord, quatorze et pas quarante ! Et c’est bien à quinze heures ?', fa: 'باشه، چهارده و نه چهل! و دقیقاً ساعت سه بعدازظهر است؟' },
      { s: 'کارمند', t: 'Exactement, à quinze heures précises. Tout est clair maintenant.', fa: 'دقیقاً، رأس ساعت سه بعدازظهر. الان همه‌چیز روشن است.' },
    ],
    es: [
      { t: 'Disculpe, no entendí bien el último número. ¿Podría repetirlo más despacio?', fa: 'ببخشید، عدد آخر را خوب متوجه نشدم. می‌توانید آهسته‌تر تکرار کنید؟' },
      { s: 'کارمند', t: '¡Claro! Le decía que es en la cuarta planta, despacho catorce.', fa: 'حتماً! عرض می‌کردم در طبقهٔ چهارم، دفتر چهارده است.' },
      { t: 'Ah, catorce, no cuarenta. ¿Entonces nos vemos a las tres de la tarde?', fa: 'آها، چهارده، نه چهل. پس ساعت سه بعدازظهر همدیگر را می‌بینیم؟' },
      { s: 'کارمند', t: 'Exacto, a las tres en punto. Gracias por confirmarlo.', fa: 'دقیقاً، رأس ساعت سه. ممنون که مطمئن شدید.' },
    ],
  },
  'b1-emotions-reactions': {
    de: [
      { t: 'Wie hast du dich gefühlt, als du letzte Woche die neue Stelle bekommen hast?', fa: 'وقتی هفتهٔ پیش شغل تازه را گرفتی چه حسی داشتی؟' },
      { t: 'Zuerst war ich völlig überrascht und natürlich sehr erleichtert.', fa: 'اول کاملاً شگفت‌زده شدم و البته خیلی نفسم راحت شد.' },
      { t: 'Und bist du vor dem ersten Arbeitstag noch ein wenig aufgeregt?', fa: 'و پیش از روز اول کار هنوز کمی هیجان‌زده‌ای؟' },
      { t: 'Ein bisschen schon, aber vor allem freue ich mich auf die neuen Aufgaben.', fa: 'کمی بله، ولی بیش از همه برای کارهای تازه خوشحالم.' },
    ],
    fr: [
      { t: 'Quelle a été ta réaction quand tu as reçu la réponse positive pour ce poste ?', fa: 'وقتی پاسخ مثبت این شغل را گرفتی واکنشت چه بود؟' },
      { t: 'J’ai d’abord été très surpris, puis vraiment soulagé après des semaines d’attente.', fa: 'اول خیلی غافلگیر شدم و بعد از هفته‌ها انتظار واقعاً خیالم راحت شد.' },
      { t: 'Et tu ressens un peu de trac avant de commencer lundi ?', fa: 'و پیش از شروع در روز دوشنبه کمی دلشوره داری؟' },
      { t: 'Un peu, c’est normal, mais je suis surtout enthousiaste de découvrir l’équipe.', fa: 'کمی، طبیعی است، ولی بیشتر مشتاق آشنایی با تیم هستم.' },
    ],
    es: [
      { t: '¿Cómo te sentiste cuando te confirmaron el nuevo puesto la semana pasada?', fa: 'وقتی هفتهٔ پیش شغل تازه را بهت تأیید کردند چه حسی داشتی؟' },
      { t: 'Al principio me sorprendí muchísimo y sentí un gran alivio.', fa: 'اول خیلی غافلگیر شدم و احساس آرامش بزرگی کردم.' },
      { t: '¿Y estás nervioso por empezar el lunes?', fa: 'و بابت شروع در روز دوشنبه مضطربی؟' },
      { t: 'Un poco, pero sobre todo tengo muchas ganas de aprender cosas nuevas.', fa: 'کمی، ولی بیش از همه شوق زیادی برای یادگیری چیزهای تازه دارم.' },
    ],
  },
  'b1-advice-rules': {
    de: [
      { s: 'هماهنگ‌کننده', t: 'Schön, dass du am Samstag beim Stadtfest hilfst! Hast du Fragen zu den Regeln?', fa: 'خوشحالم که شنبه در جشن شهر کمک می‌کنی! دربارهٔ قوانین سؤالی داری؟' },
      { t: 'Ja, was müssen wir Helfer am Informationsstand besonders beachten?', fa: 'بله، ما داوطلب‌ها در غرفهٔ اطلاع‌رسانی به چه نکته‌ای باید بیشتر دقت کنیم؟' },
      { s: 'هماهنگ‌کننده', t: 'Man sollte immer freundlich bleiben, und Getränke dürfen nur im Pausenbereich stehen.', fa: 'باید همیشه خوش‌برخورد ماند و نوشیدنی‌ها فقط باید در بخش استراحت باشند.' },
      { t: 'Alles klar! Und empfiehlst du, bequeme Schuhe anzuziehen?', fa: 'کاملاً روشن است! و توصیه می‌کنی کفش راحت بپوشیم؟' },
    ],
    fr: [
      { s: 'هماهنگ‌کننده', t: 'Merci de venir aider pour l’événement de samedi ! As-tu des questions sur l’organisation ?', fa: 'ممنون که برای رویداد شنبه کمک می‌کنی! دربارهٔ هماهنگی سؤالی داری؟' },
      { t: 'Oui, quelles sont les consignes principales à respecter à l’accueil ?', fa: 'بله، دستورالعمل‌های اصلی در بخش پذیرش چیست؟' },
      { s: 'هماهنگ‌کننده', t: 'Il faut garder les passages libres et vérifier le badge de chaque intervenant.', fa: 'باید راهروها را باز نگه داشت و کارت هر سخنران را بررسی کرد.' },
      { t: 'Compris ! Tu conseilles d’arriver trente minutes avant l’ouverture ?', fa: 'متوجه شدم! توصیه می‌کنی سی دقیقه قبل از بازگشایی برسیم؟' },
    ],
    es: [
      { s: 'هماهنگ‌کننده', t: '¡Qué bien que colabores el sábado en la feria! ¿Tienes dudas sobre las normas?', fa: 'چه خوب که شنبه در نمایشگاه همکاری می‌کنی! دربارهٔ قوانین سؤالی داری؟' },
      { t: 'Sí, ¿qué debemos tener en cuenta en la mesa de información?', fa: 'بله، در میز اطلاع‌رسانی چه نکاتی را باید در نظر بگیریم؟' },
      { s: 'هماهنگ‌کننده', t: 'Hay que mantener despejada la entrada y entregar un plano a cada visitante.', fa: 'باید ورودی را خلوت نگه داشت و به هر بازدیدکننده یک نقشه داد.' },
      { t: 'Entendido. ¿Recomiendas llevar calzado cómodo para todo el día?', fa: 'فهمیدم. توصیه می‌کنی برای کل روز کفش راحت بپوشیم؟' },
    ],
  },
});
