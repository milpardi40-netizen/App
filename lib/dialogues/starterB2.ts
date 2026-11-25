import { buildTriMap } from './starterA1Part1';
import type { DialogueMap } from './types';

export const STARTER_B2_DIALOGUES: DialogueMap = buildTriMap({
  'b2-complex-narrative': {
    de: [
      { s: 'مدیر', t: 'Warum genau hat sich die Übergabe unseres Stadtportal-Projekts um zwei Wochen verzögert?', fa: 'تحویل پروژهٔ پورتال شهری دقیقاً چرا دو هفته به تأخیر افتاد؟' },
      { t: 'Nachdem die Designagentur bereits alle Entwürfe geliefert hatte, fielen bei der Sicherheitsprüfung unerwartete Schnittstellenfehler auf.', fa: 'پس از اینکه آژانس طراحی همهٔ طرح‌ها را تحویل داد، در بررسی امنیتی خطاهای غیرمنتظره‌ای در رابط‌ها دیده شد.' },
      { s: 'مدیر', t: 'Und wie habt ihr im Team darauf reagiert, um den Schaden gering zu halten?', fa: 'و تیم شما برای کم‌کردن آسیب چه واکنشی نشان داد؟' },
      { t: 'Wir haben zunächst die kritischen Module vorgezogen und mit dem Kunden einen klaren neuen Zeitplan abgestimmt.', fa: 'ابتدا بخش‌های حیاتی را جلو انداختیم و با مشتری یک زمان‌بندی جدید و روشن هماهنگ کردیم.' },
    ],
    fr: [
      { s: 'مدیر', t: 'Pourriez-vous expliquer comment le projet a pris deux semaines de retard ?', fa: 'می‌توانید توضیح بدهید پروژه چطور دو هفته عقب افتاد؟' },
      { t: 'Alors que la maquette était déjà validée, les tests de sécurité ont révélé une incompatibilité sur l’interface de paiement.', fa: 'در حالی که پیش‌طرح قبلاً تأیید شده بود، آزمون‌های امنیتی ناسازگاری در درگاه پرداخت را آشکار کرد.' },
      { s: 'مدیر', t: 'Quelle décision a été prise pour débloquer la situation ?', fa: 'برای رفع این گره چه تصمیمی گرفته شد؟' },
      { t: 'Nous avons isolé le module concerné afin de livrer le reste à temps tout en corrigeant la faille en parallèle.', fa: 'بخش مربوط را جدا کردیم تا بقیه را سر وقت تحویل دهیم و هم‌زمان ایراد را برطرف کنیم.' },
    ],
    es: [
      { s: 'مدیر', t: '¿Podrías explicar cómo se produjo exactamente el retraso en la entrega?', fa: 'می‌توانی توضیح بدهی تأخیر در تحویل دقیقاً چطور پیش آمد؟' },
      { t: 'Cuando ya habíamos cerrado el diseño, la auditoría técnica detectó fallos imprevistos en el servidor de pruebas.', fa: 'وقتی طراحی را بسته بودیم، ممیزی فنی خطاهای پیش‌بینی‌نشده‌ای در سرور آزمایش پیدا کرد.' },
      { s: 'مدیر', t: '¿Y qué medida tomasteis para recuperar el ritmo?', fa: 'و برای بازگرداندن ریتم کار چه اقدامی کردید؟' },
      { t: 'Priorizamos las funciones esenciales y acordamos con el cliente una entrega en dos fases.', fa: 'قابلیت‌های اصلی را در اولویت گذاشتیم و با مشتری روی تحویل دومرحله‌ای توافق کردیم.' },
    ],
  },
  'b2-counterfactual-regret': {
    de: [
      { t: 'Rückblickend hätten wir den Mietvertrag für das alte Büro nicht so früh kündigen sollen.', fa: 'در نگاه به گذشته، نباید قرارداد اجارهٔ دفتر قدیمی را این‌قدر زود فسخ می‌کردیم.' },
      { t: 'Da hast du recht — wenn wir noch einen Monat gewartet hätten, wäre der Umzug deutlich entspannter verlaufen.', fa: 'حق با توست — اگر یک ماه دیگر صبر کرده بودیم، اسباب‌کشی خیلی آرام‌تر پیش می‌رفت.' },
      { t: 'Was würdest du bei einem nächsten Standortwechsel anders organisieren?', fa: 'در جابه‌جایی بعدی چه چیزی را متفاوت برنامه‌ریزی می‌کردی؟' },
      { t: 'Ich hätte mir mindestens drei Wochen Überschneidung reserviert, damit die Technik in Ruhe umziehen kann.', fa: 'دست‌کم سه هفته هم‌پوشانی نگه می‌داشتم تا تجهیزات فنی با آرامش منتقل شوند.' },
    ],
    fr: [
      { t: 'Avec le recul, nous n’aurions pas dû résilier l’ancien bail aussi vite.', fa: 'با نگاه به گذشته، نباید اجاره‌نامهٔ قبلی را این‌قدر سریع فسخ می‌کردیم.' },
      { t: 'C’est vrai ; si nous avions gardé un mois de marge, le déménagement aurait été bien plus serein.', fa: 'درست است؛ اگر یک ماه حاشیهٔ امن نگه داشته بودیم، اسباب‌کشی خیلی آرام‌تر انجام می‌شد.' },
      { t: 'Qu’est-ce que nous aurions pu anticiper davantage ?', fa: 'چه چیزی را می‌توانستیم بهتر پیش‌بینی کنیم؟' },
      { t: 'Nous aurions gagné à tester la connexion fibre avant le transfert des équipes.', fa: 'بهتر بود پیش از انتقال تیم‌ها اینترنت فیبر را آزمایش می‌کردیم.' },
    ],
    es: [
      { t: 'Mirando atrás, no deberíamos haber cancelado tan pronto el contrato del local anterior.', fa: 'وقتی به عقب نگاه می‌کنیم، نباید قرارداد محل قبلی را این‌قدر زود لغو می‌کردیم.' },
      { t: 'Tienes razón; si hubiéramos esperado un mes más, la mudanza habría sido mucho menos estresante.', fa: 'حق با توست؛ اگر یک ماه بیشتر صبر کرده بودیم، اسباب‌کشی خیلی کم‌تنش‌تر می‌شد.' },
      { t: '¿Qué habría cambiado si hubiéramos tenido más tiempo?', fa: 'اگر وقت بیشتری داشتیم چه چیزی فرق می‌کرد؟' },
      { t: 'Habríamos podido instalar los equipos con calma antes del lunes de apertura.', fa: 'می‌توانستیم پیش از دوشنبهٔ بازگشایی تجهیزات را با آرامش نصب کنیم.' },
    ],
  },
  'b2-evidence-inference': {
    de: [
      { s: 'همکار', t: 'Die Zugriffe auf unsere Seite sind heute Morgen plötzlich gesunken. Liegt ein technischer Defekt vor?', fa: 'بازدید صفحهٔ ما امروز صبح ناگهان افت کرده. آیا نقص فنی رخ داده؟' },
      { t: 'Unbedingt gesichert ist das noch nicht; angesichts der Feiertagsdaten dürfte es eher eine normale Schwankung sein.', fa: 'هنوز کاملاً قطعی نیست؛ با توجه به داده‌های روزهای تعطیل، احتمالاً یک نوسان عادی است.' },
      { s: 'همکار', t: 'Welche Anhaltspunkte sprechen gegen einen Serverfehler?', fa: 'چه شواهدی علیه خطای سرور وجود دارد؟' },
      { t: 'Die Antwortzeiten sind stabil und die Fehlerrate liegt bei null — ein Ausfall lässt sich also ausschließen.', fa: 'زمان پاسخ‌گویی پایدار است و نرخ خطا صفر است — پس قطع‌شدن سیستم را می‌توان کنار گذاشت.' },
    ],
    fr: [
      { s: 'همکار', t: 'La fréquentation du site a chuté ce matin. S’agit-il forcément d’une panne ?', fa: 'بازدید سایت امروز صبح افت کرده. آیا حتماً قطعی رخ داده؟' },
      { t: 'Rien ne le prouve encore ; compte tenu du jour férié, il est probable que la baisse soit simplement saisonnière.', fa: 'هنوز چیزی این را ثابت نمی‌کند؛ با توجه به تعطیل رسمی، احتمال دارد افت صرفاً فصلی باشد.' },
      { s: 'همکار', t: 'Quels indices confirment cette hypothèse ?', fa: 'چه نشانه‌هایی این فرضیه را تأیید می‌کند؟' },
      { t: 'Les temps de réponse restent normaux et aucune alerte n’a été déclenchée — une panne semble donc exclue.', fa: 'زمان پاسخ طبیعی مانده و هیچ هشداری فعال نشده — پس خرابی بعید است.' },
    ],
    es: [
      { s: 'همکار', t: 'Las visitas a la web bajaron de golpe esta mañana. ¿Será un fallo técnico?', fa: 'بازدید وب‌سایت امروز صبح ناگهان پایین آمد. آیا خطای فنی است؟' },
      { t: 'No podemos darlo por hecho; al ser puente festivo, es muy probable que sea una caída habitual.', fa: 'نمی‌توانیم قطعی بدانیم؛ چون تعطیلی میان‌هفته‌ای است، خیلی محتمل است افت عادی باشد.' },
      { s: 'همکار', t: '¿Qué datos nos permiten distinguir entre sospecha y hecho?', fa: 'چه داده‌هایی اجازه می‌دهد بین حدس و واقعیت فرق بگذاریم؟' },
      { t: 'El servidor responde sin errores y los pagos funcionan bien, así que descartamos un problema técnico.', fa: 'سرور بدون خطا پاسخ می‌دهد و پرداخت‌ها درست کار می‌کنند، پس مشکل فنی را رد می‌کنیم.' },
    ],
  },
  'b2-reported-questions': {
    de: [
      { s: 'همکار', t: 'Ich habe die Geschäftsführerin gerade verpasst. Was wollte sie von dir wissen?', fa: 'همین الان مدیرعامل را از دست دادم. از تو چه می‌خواست بداند؟' },
      { t: 'Sie hat gefragt, ob wir die überarbeiteten Zahlen bereits an das Finanzteam geschickt haben.', fa: 'پرسید که آیا آمار بازبینی‌شده را قبلاً به تیم مالی فرستاده‌ایم یا نه.' },
      { s: 'همکار', t: 'Hat sie auch erwähnt, bis wann sie die Zusammenfassung braucht?', fa: 'این را هم گفت که جمع‌بندی را تا کی لازم دارد؟' },
      { t: 'Ja, sie bat uns darum, ihr den Entwurf bis spätestens sechzehn Uhr vorzulegen.', fa: 'بله، از ما خواست پیش‌نویس را حداکثر تا ساعت چهار بعدازظهر به او ارائه کنیم.' },
    ],
    fr: [
      { s: 'همکار', t: 'Je n’ai pas pu joindre la directrice tout à l’heure. Qu’a-t-elle demandé ?', fa: 'کمی پیش نتوانستم به مدیر برسم. چه خواست؟' },
      { t: 'Elle a voulu savoir si les chiffres actualisés avaient déjà été transmis au service financier.', fa: 'می‌خواست بداند آیا آمارهای به‌روزشده قبلاً به بخش مالی ارسال شده‌اند یا نه.' },
      { s: 'همکار', t: 'Et elle a précisé un délai pour la synthèse ?', fa: 'و مهلتی هم برای جمع‌بندی مشخص کرد؟' },
      { t: 'Oui, elle nous a demandé de lui faire parvenir le dossier avant seize heures.', fa: 'بله، از ما خواست پرونده را پیش از ساعت چهار به دستش برسانیم.' },
    ],
    es: [
      { s: 'همکار', t: 'No llegué a hablar con la directora hace un rato. ¿Qué te preguntó?', fa: 'کمی پیش نرسیدم با مدیر صحبت کنم. ازت چه پرسید؟' },
      { t: 'Preguntó si ya habíamos enviado los datos corregidos al departamento financiero.', fa: 'پرسید آیا داده‌های اصلاح‌شده را قبلاً برای بخش مالی فرستاده‌ایم یا نه.' },
      { s: 'همکار', t: '¿Pidió algo más para hoy por la tarde?', fa: 'برای امروز عصر چیز دیگری هم خواست؟' },
      { t: 'Sí, nos pidió que le entregáramos el resumen antes de las cuatro de la tarde.', fa: 'بله، از ما خواست خلاصه را پیش از ساعت چهار بعدازظهر تحویلش بدهیم.' },
    ],
  },
  'b2-passive-causative': {
    de: [
      { s: 'مسئول دفتر', t: 'Wie ist der aktuelle Stand bei den defekten Konferenzmikrofonen?', fa: 'وضعیت فعلی میکروفون‌های خراب سالن جلسه چطور است؟' },
      { t: 'Sie wurden gestern überprüft und wir lassen zwei Kabel gerade von einem Techniker ersetzen.', fa: 'دیروز بررسی شدند و الان داریم دو کابل را می‌سپاریم یک تکنسین تعویض کند.' },
      { s: 'مسئول دفتر', t: 'Und wurde die Ersatzteil-Bestellung schon offiziell freigegeben?', fa: 'و آیا سفارش قطعات جایگزین رسماً تأیید شده؟' },
      { t: 'Ja, der Auftrag wurde heute Morgen bestätigt und wird bis Donnerstag geliefert.', fa: 'بله، سفارش امروز صبح تأیید شد و تا پنجشنبه تحویل داده می‌شود.' },
    ],
    fr: [
      { s: 'مسئول دفتر', t: 'Où en est la réparation du matériel audio dans la salle B ?', fa: 'تعمیر تجهیزات صوتی سالن B در چه مرحله‌ای است؟' },
      { t: 'Les micros ont été inspectés hier et nous faisons remplacer deux câbles par le technicien.', fa: 'میکروفون‌ها دیروز بازرسی شدند و الان داریم دو کابل را با تکنسین تعویض می‌کنیم.' },
      { s: 'مسئول دفتر', t: 'La commande des pièces a-t-elle déjà été validée ?', fa: 'سفارش قطعات قبلاً تأیید شده است؟' },
      { t: 'Oui, le bon a été signé ce matin et la livraison est prévue pour jeudi.', fa: 'بله، حواله امروز صبح امضا شد و تحویل برای پنجشنبه برنامه‌ریزی شده است.' },
    ],
    es: [
      { s: 'مسئول دفتر', t: '¿Cómo va el arreglo del equipo de sonido de la sala grande?', fa: 'تعمیر سیستم صوتی سالن بزرگ در چه وضعی است؟' },
      { t: 'Los micrófonos fueron revisados ayer y estamos haciendo cambiar dos cables al técnico.', fa: 'میکروفون‌ها دیروز بررسی شدند و الان داده‌ایم تکنسین دو کابل را عوض کند.' },
      { s: 'مسئول دفتر', t: '¿Se aprobó ya el pedido de repuestos?', fa: 'سفارش قطعات یدکی تأیید شده است؟' },
      { t: 'Sí, fue autorizado esta mañana y llegará antes del jueves.', fa: 'بله، امروز صبح تأیید شد و تا پیش از پنجشنبه می‌رسد.' },
    ],
  },
  'b2-relative-process': {
    de: [
      { s: 'همکار', t: 'Welches neue Weiterbildungsprogramm stellst du gleich in der Sitzung vor?', fa: 'کدام برنامهٔ آموزشی تازه را الان در جلسه معرفی می‌کنی؟' },
      { t: 'Ein Praxismodul, bei dem junge Fachkräfte von erfahrenen Mentorinnen begleitet werden.', fa: 'یک ماژول عملی که در آن نیروهای تازه‌کار توسط مربیان باتجربه همراهی می‌شوند.' },
      { s: 'همکار', t: 'Und auf welche Unterlagen greifen die Teilnehmer während des Kurses zu?', fa: 'و شرکت‌کنندگان در طول دوره به چه منابعی دسترسی دارند؟' },
      { t: 'Auf eine digitale Bibliothek, deren Leitfäden laufend aktualisiert werden.', fa: 'به یک کتابخانهٔ دیجیتال که راهنماهایش به‌طور پیوسته به‌روزرسانی می‌شوند.' },
    ],
    fr: [
      { s: 'همکار', t: 'Quel programme de formation présentes-tu tout à l’heure en réunion ?', fa: 'امروز در جلسه کدام برنامهٔ آموزشی را معرفی می‌کنی؟' },
      { t: 'Un parcours pratique au cours duquel chaque recrue est guidée par un tuteur expérimenté.', fa: 'یک مسیر عملی که در طول آن هر نیروی تازه توسط یک مربی باتجربه راهنمایی می‌شود.' },
      { s: 'همکار', t: 'Et sur quelles ressources les participants s’appuient-ils ?', fa: 'و شرکت‌کنندگان به چه منابعی تکیه می‌کنند؟' },
      { t: 'Sur une plateforme partagée dont les fiches sont mises à jour après chaque atelier.', fa: 'به یک سکوی مشترک که کاربرگ‌هایش پس از هر کارگاه به‌روزرسانی می‌شوند.' },
    ],
    es: [
      { s: 'همکار', t: '¿Qué programa formativo vas a presentar ahora en la reunión?', fa: 'الان در جلسه کدام برنامهٔ آموزشی را معرفی می‌کنی؟' },
      { t: 'Un plan práctico en el que cada nuevo integrante cuenta con el apoyo de un mentor.', fa: 'یک طرح عملی که در آن هر عضو تازه از پشتیبانی یک مربی برخوردار است.' },
      { s: 'همکار', t: '¿Y con qué materiales trabajan durante el proceso?', fa: 'و در طول فرایند با چه منابعی کار می‌کنند؟' },
      { t: 'Con una guía digital cuyos casos reales se renuevan cada trimestre.', fa: 'با یک راهنمای دیجیتال که نمونه‌های واقعی‌اش هر فصل به‌روز می‌شوند.' },
    ],
  },
  'b2-structured-argument': {
    de: [
      { s: 'همکار', t: 'Sollten wir verbindlich drei feste Bürotage pro Woche einführen?', fa: 'آیا باید سه‌روزِ ثابت حضور در دفتر در هفته را الزامی کنیم؟' },
      { t: 'Einerseits fördert gemeinsame Präsenz die Einarbeitung; andererseits arbeiten viele bei konzentrierten Aufgaben zu Hause ruhiger.', fa: 'از یک سو حضور مشترک به آماده‌سازی نیروهای تازه کمک می‌کند؛ از سوی دیگر بسیاری در کارهای متمرکز در خانه آرام‌ترند.' },
      { s: 'همکار', t: 'Wie lässt sich dieser Gegensatz sinnvoll auflösen?', fa: 'این تعارض را چطور می‌شود منطقی حل کرد؟' },
      { t: 'Am besten legen wir zwei feste Teamtage für Workshops fest und lassen die übrigen Tage flexibel.', fa: 'بهترین کار این است دو روز ثابت تیمی برای کارگاه‌ها بگذاریم و بقیهٔ روزها را منعطف نگه داریم.' },
    ],
    fr: [
      { s: 'همکار', t: 'Faut-il rendre obligatoire la présence au bureau trois jours par semaine ?', fa: 'باید حضور در دفتر را سه روز در هفته اجباری کنیم؟' },
      { t: 'D’une part, travailler ensemble facilite l’entraide ; d’autre part, les tâches de fond avancent mieux au calme chez soi.', fa: 'از یک سو کار کنار هم همکاری را آسان‌تر می‌کند؛ از سوی دیگر کارهای عمیق در آرامش خانه بهتر پیش می‌رود.' },
      { s: 'همکار', t: 'Quelle formule te paraît la plus équilibrée ?', fa: 'کدام فرمول به نظرت متعادل‌تر است؟' },
      { t: 'Fixons deux journées communes pour les réunions d’équipe et laissons chacun choisir le reste.', fa: 'دو روز مشترک برای جلسات تیمی تعیین کنیم و بقیه را به انتخاب هر نفر بگذاریم.' },
    ],
    es: [
      { s: 'همکار', t: '¿Deberíamos exigir tres días fijos de oficina a la semana?', fa: 'باید سه روز ثابت حضور در دفتر در هفته را الزامی کنیم؟' },
      { t: 'Por un lado, coincidir en persona agiliza la coordinación; por otro, el trabajo profundo rinde más desde casa.', fa: 'از یک سو دیدار حضوری هماهنگی را سریع می‌کند؛ از سوی دیگر کار عمیق از خانه بازده بیشتری دارد.' },
      { s: 'همکار', t: '¿Cómo propones equilibrar ambas necesidades?', fa: 'پیشنهادت برای متعادل‌کردن هر دو نیاز چیست؟' },
      { t: 'Conviene fijar dos días comunes para reuniones y mantener flexibles los otros tres.', fa: 'بهتر است دو روز مشترک برای جلسات بگذاریم و سه روز دیگر را منعطف نگه داریم.' },
    ],
  },
  'b2-negotiation-feedback': {
    de: [
      { s: 'همکار', t: 'Die Analyse im Entwurf gefällt mir, aber der Liefertermin am Dienstag ist kaum zu schaffen.', fa: 'تحلیل در پیش‌نویس خوب است، اما تحویل روز سه‌شنبه به سختی شدنی است.' },
      { t: 'Ich verstehe den Zeitdruck. Welche Teile brauchen aus deiner Sicht noch Überarbeitung?', fa: 'فشار زمانی را درک می‌کنم. به نظرت کدام بخش‌ها هنوز نیاز به بازنگری دارند؟' },
      { s: 'همکار', t: 'Vor allem das Fazit und die Grafik zu den Vergleichszahlen sollten sauberer sein.', fa: 'به‌خصوص جمع‌بندی و نمودار عددهای مقایسه‌ای باید تمیزتر شوند.' },
      { t: 'Dann liefere ich dir die bereinigte Grafik heute Abend, wenn wir das Gesamtpaket auf Mittwochmittag legen.', fa: 'پس نمودار اصلاح‌شده را امشب تحویلت می‌دهم، به شرط اینکه تحویل نهایی را ظهر چهارشنبه بگذاریم.' },
    ],
    fr: [
      { s: 'همکار', t: 'Ton analyse est pertinente, mais l’échéance de mardi me semble trop juste pour tout finaliser.', fa: 'تحلیلت دقیق است، اما مهلت سه‌شنبه برای نهایی‌کردن همه‌چیز زیادی فشرده به نظر می‌رسد.' },
      { t: 'Je comprends tout à fait. Quels points méritent encore d’être repris selon toi ?', fa: 'کاملاً درک می‌کنم. به نظرت کدام بخش‌ها هنوز جای اصلاح دارند؟' },
      { s: 'همکار', t: 'Surtout la conclusion et la mise en page du tableau comparatif.', fa: 'به‌ویژه نتیجه‌گیری و صفحه‌آرایی جدول مقایسه‌ای.' },
      { t: 'Je peux corriger le tableau dès ce soir si nous décalons l’envoi final à mercredi midi.', fa: 'می‌توانم جدول را همین امشب اصلاح کنم اگر ارسال نهایی را به ظهر چهارشنبه منتقل کنیم.' },
    ],
    es: [
      { s: 'همکار', t: 'El enfoque del informe es bueno, pero el plazo del martes queda demasiado ajustado.', fa: 'رویکرد گزارش خوب است، اما مهلت سه‌شنبه زیادی تنگ است.' },
      { t: 'Entiendo tu punto. ¿Qué apartados ves todavía algo flojos?', fa: 'منظورت را می‌فهمم. کدام بخش‌ها را هنوز کمی ضعیف می‌بینی؟' },
      { s: 'همکار', t: 'Sobre todo las conclusiones y los gráficos comparativos necesitan más claridad.', fa: 'به‌خصوص نتیجه‌گیری و نمودارهای مقایسه‌ای وضوح بیشتری می‌خواهند.' },
      { t: 'Si pasamos la entrega al miércoles al mediodía, hoy mismo dejo listos los gráficos.', fa: 'اگر تحویل را بگذاریم ظهر چهارشنبه، همین امروز نمودارها را آماده می‌کنم.' },
    ],
  },
  'b2-formal-complaint': {
    de: [
      { t: 'Guten Tag, ich beziehe mich auf meine schriftliche Reklamation vom zehnten Mai zu unserem Wartungsvertrag.', fa: 'روز بخیر، تماس می‌گیرم دربارهٔ شکایت مکتوب دهم مه در مورد قرارداد نگهداری‌مان.' },
      { s: 'خدمات مشتریان', t: 'Guten Tag! Ich sehe Ihren Vorgang hier. Welche Leistung wurde konkret nicht erbracht?', fa: 'روز بخیر! پرونده‌تان را اینجا می‌بینم. دقیقاً کدام خدمت ارائه نشده؟' },
      { t: 'Trotz zweifacher Zusage ist die vereinbarte Störungsbehebung bisher ausgeblieben.', fa: 'با وجود دو بار قول قبلی، رفع نقصِ توافق‌شده تا این لحظه انجام نشده است.' },
      { s: 'خدمات مشتریان', t: 'Bitte entschuldigen Sie dies — ich priorisiere den Einsatz für morgen früh und bestätige Ihnen eine Gutschrift schriftlich.', fa: 'لطفاً بابت این موضوع عذر ما را بپذیرید — اعزام برای فردا صبح را در اولویت می‌گذارم و تخفیف جبرانی را کتباً تأیید می‌کنم.' },
    ],
    fr: [
      { t: 'Bonjour, je fais suite à ma réclamation écrite concernant l’interruption répétée de notre service.', fa: 'روز بخیر، پیرو شکایت مکتوبم دربارهٔ قطعی‌های مکرر سرویس تماس می‌گیرم.' },
      { s: 'خدمات مشتریان', t: 'Bonjour monsieur. Je consulte votre dossier. Quel engagement n’a pas été respecté ?', fa: 'روز بخیر آقا. پرونده‌تان را می‌بینم. کدام تعهد رعایت نشده است؟' },
      { t: 'L’intervention promise sous quarante-huit heures n’a toujours pas eu lieu malgré mes relances.', fa: 'اقدام وعده‌داده‌شده ظرف چهل‌وهشت ساعت با وجود پیگیری‌هایم هنوز انجام نشده است.' },
      { s: 'خدمات مشتریان', t: 'Nous vous présentons nos excuses ; je programme le technicien demain matin et vous envoie un avoir par courriel.', fa: 'پوزش ما را بپذیرید؛ تکنسین را برای فردا صبح تنظیم می‌کنم و اعتبار جبرانی را با ایمیل می‌فرستم.' },
    ],
    es: [
      { t: 'Buenos días, llamo en seguimiento a la reclamación formal que envié por la avería del servicio.', fa: 'صبح بخیر، پیرو شکایت رسمی‌ای که بابت خرابی سرویس فرستادم تماس می‌گیرم.' },
      { s: 'خدمات مشتریان', t: 'Buenos días. Veo su expediente aquí. ¿Qué incidencia sigue pendiente?', fa: 'صبح بخیر. پرونده‌تان را اینجا می‌بینم. کدام مورد هنوز حل نشده؟' },
      { t: 'A pesar de dos avisos previos, la reparación acordada en el contrato aún no se ha realizado.', fa: 'با وجود دو اخطار قبلی، تعمیرِ توافق‌شده در قرارداد هنوز انجام نشده است.' },
      { s: 'خدمات مشتریان', t: 'Disculpe las molestias; asigno prioridad urgente para mañana y le confirmamos la compensación por escrito.', fa: 'بابت مزاحمت پوزش می‌خواهم؛ اولویت فوری برای فردا ثبت می‌کنم و جبران خسارت را کتباً تأیید می‌کنیم.' },
    ],
  },
  'b2-source-synthesis': {
    de: [
      { t: 'Du hast beide Studien zum neuen Nahverkehrskonzept gelesen. Widersprechen sie sich in den Ergebnissen?', fa: 'هر دو پژوهش دربارهٔ طرح جدید حمل‌ونقل شهری را خوانده‌ای. آیا در نتایج با هم تناقض دارند؟' },
      { t: 'Teilweise ja: Der städtische Bericht erwartet zwanzig Prozent weniger Staus, während das Institut nur eine leichte Entlastung prognostiziert.', fa: 'تا حدی بله: گزارش شهرداری بیست درصد کاهش ترافیک پیش‌بینی می‌کند، در حالی که مؤسسه فقط کاهش خفیفی پیش‌بینی کرده.' },
      { t: 'Welcher Quelle misst du mehr Gewicht bei und warum?', fa: 'به کدام منبع اعتبار بیشتری می‌دهی و چرا؟' },
      { t: 'Der Institutsstudie, weil sie Daten aus fünf vergleichbaren Städten über drei Jahre hinweg auswertet.', fa: 'به پژوهش مؤسسه، چون داده‌های پنج شهر مشابه را در طول سه سال تحلیل کرده است.' },
    ],
    fr: [
      { t: 'Tu as comparé les deux rapports sur le plan de mobilité urbaine. Arrivent-ils aux mêmes conclusions ?', fa: 'هر دو گزارش دربارهٔ طرح حمل‌ونقل شهری را مقایسه کرده‌ای. به یک نتیجه می‌رسند؟' },
      { t: 'Pas tout à fait : la mairie prévoit une forte baisse du trafic, tandis que l’étude universitaire reste beaucoup plus prudente.', fa: 'نه دقیقاً: شهرداری کاهش شدید ترافیک پیش‌بینی می‌کند، در حالی که پژوهش دانشگاهی خیلی محتاط‌تر است.' },
      { t: 'Laquelle des deux analyses te semble la plus fiable ?', fa: 'کدام یک از این دو تحلیل به نظرت قابل اعتمادتر است؟' },
      { t: 'L’étude universitaire, car sa méthodologie est transparente et repose sur trois années de mesures.', fa: 'پژوهش دانشگاهی، چون روش‌شناسی آن شفاف است و بر سه سال اندازه‌گیری تکیه دارد.' },
    ],
    es: [
      { t: 'Leíste los dos informes sobre el plan de transporte urbano. ¿Coinciden en sus conclusiones?', fa: 'هر دو گزارش دربارهٔ طرح حمل‌ونقل شهری را خواندی. در نتیجه‌گیری هم‌نظرند؟' },
      { t: 'Solo en parte: el informe municipal calcula un ahorro enorme, pero el estudio independiente apunta a una mejora moderada.', fa: 'فقط تا حدی: گزارش شهرداری صرفه‌جویی بزرگی برآورد می‌کند، اما پژوهش مستقل از بهبود متوسطی می‌گوید.' },
      { t: '¿Qué fuente te parece más sólida para tomar una decisión?', fa: 'کدام منبع برای تصمیم‌گیری به نظرت محکم‌تر است؟' },
      { t: 'El estudio independiente, porque detalla sus muestras y compara datos de varios años.', fa: 'پژوهش مستقل، چون نمونه‌هایش را دقیق شرح می‌دهد و داده‌های چند سال را مقایسه می‌کند.' },
    ],
  },
  'b2-project-risk': {
    de: [
      { s: 'سرمایه‌گذار', t: 'Welche konkreten Risiken sehen Sie bei Ihrem Pilotprojekt im ersten Halbjahr?', fa: 'در پروژهٔ آزمایشی‌تان در شش‌ماههٔ اول چه ریسک‌های مشخصی می‌بینید؟' },
      { t: 'Das Hauptrisiko besteht in möglichen Verzögerungen bei der Datenanbindung durch externe Partner.', fa: 'ریسک اصلی در احتمال تأخیر در اتصال داده‌ها از سوی شرکای بیرونی است.' },
      { s: 'سرمایه‌گذار', t: 'Und anhand welcher Kennzahl messen Sie, ob das Projekt erfolgreich läuft?', fa: 'و با چه شاخصی می‌سنجید که آیا پروژه با موفقیت پیش می‌رود؟' },
      { t: 'Wir prüfen monatlich die tatsächliche Bearbeitungszeit pro Vorgang sowie die Zufriedenheit der Pilotnutzer.', fa: 'ما ماهانه زمان واقعی رسیدگی به هر پرونده و نیز رضایت کاربران آزمایشی را بررسی می‌کنیم.' },
    ],
    fr: [
      { s: 'سرمایه‌گذار', t: 'Quels risques principaux identifiez-vous pour le lancement de ce projet pilote ?', fa: 'برای راه‌اندازی این پروژهٔ آزمایشی چه ریسک‌های اصلی‌ای می‌بینید؟' },
      { t: 'Le risque majeur concerne la dépendance envers deux fournisseurs pour l’intégration des données.', fa: 'ریسک اصلی مربوط به وابستگی به دو تأمین‌کننده برای یکپارچه‌سازی داده‌هاست.' },
      { s: 'سرمایه‌گذار', t: 'Comment mesurerez-vous concrètement l’efficacité du dispositif ?', fa: 'کارآمدی طرح را عملاً چطور اندازه می‌گیرید؟' },
      { t: 'Nous suivrons chaque mois le délai moyen de traitement et le taux d’adoption par les utilisateurs.', fa: 'هر ماه میانگین زمان پردازش و نرخ پذیرش کاربران را رصد می‌کنیم.' },
    ],
    es: [
      { s: 'سرمایه‌گذار', t: '¿Qué riesgos concretos detectáis en la propuesta para este semestre?', fa: 'در پیشنهاد برای این نیم‌سال چه ریسک‌های مشخصی می‌بینید؟' },
      { t: 'El mayor riesgo es depender de proveedores externos en la fase inicial de integración.', fa: 'بزرگ‌ترین ریسک وابستگی به تأمین‌کنندگان بیرونی در مرحلهٔ اول یکپارچه‌سازی است.' },
      { s: 'سرمایه‌گذار', t: '¿Con qué indicadores vais a evaluar si funciona bien?', fa: 'با چه شاخص‌هایی می‌خواهید ارزیابی کنید که خوب کار می‌کند؟' },
      { t: 'Mediremos cada mes el tiempo de respuesta y la satisfacción de los usuarios piloto.', fa: 'هر ماه زمان پاسخ‌گویی و رضایت کاربران آزمایشی را اندازه می‌گیریم.' },
    ],
  },
  'b2-interview-expertise': {
    de: [
      { s: 'مصاحبه‌گر', t: 'Können Sie ein komplexes Problem beschreiben, das Sie in Ihrer letzten Position gelöst haben?', fa: 'می‌توانید یک مسئلهٔ پیچیده را شرح بدهید که در شغل قبلی‌تان حل کردید؟' },
      { t: 'Bei uns häuften sich Kundenbeschwerden wegen fehlender Statusmeldungen nach Bestellungen.', fa: 'در تیم ما شکایت مشتریان بابت نبودِ پیام‌های وضعیت پس از سفارش زیاد شده بود.' },
      { s: 'مصاحبه‌گر', t: 'Wie sind Sie konkret vorgegangen, um die Ursache zu beheben?', fa: 'برای رفع ریشه‌ای مشکل دقیقاً چطور اقدام کردید؟' },
      { t: 'Ich habe den Ablauf zwischen Lager und Support neu verknüpft und automatische Benachrichtigungen eingeführt; die Rückfragen sanken um vierzig Prozent.', fa: 'فرایند بین انبار و پشتیبانی را دوباره متصل کردم و اعلان‌های خودکار گذاشتم؛ تماس‌های پیگیری چهل درصد کاهش یافت.' },
    ],
    fr: [
      { s: 'مصاحبه‌گر', t: 'Pouvez-vous décrire un problème professionnel complexe que vous avez réussi à résoudre ?', fa: 'می‌توانید یک مسئلهٔ کاری پیچیده را شرح بدهید که توانستید حلش کنید؟' },
      { t: 'Notre service recevait de nombreux appels parce que les clients ne suivaient pas l’avancement de leur dossier.', fa: 'بخش ما تماس‌های زیادی می‌گرفت چون مشتریان نمی‌توانستند پیشرفت پرونده‌شان را دنبال کنند.' },
      { s: 'مصاحبه‌گر', t: 'Quelle solution avez-vous mise en place ?', fa: 'چه راه‌حلی پیاده کردید؟' },
      { t: 'J’ai réorganisé les étapes avec l’équipe technique pour envoyer une mise à jour automatique à chaque palier, réduisant les relances de quarante pour cent.', fa: 'مراحل را با تیم فنی بازآرایی کردم تا در هر مرحله اطلاع‌رسانی خودکار ارسال شود و پیگیری‌ها چهل درصد کم شد.' },
    ],
    es: [
      { s: 'مصاحبه‌گر', t: '¿Puede contar cómo resolvió un problema complejo en su puesto anterior?', fa: 'می‌توانید بگویید در شغل قبلی چطور یک مسئلهٔ پیچیده را حل کردید؟' },
      { t: 'Recibíamos demasiadas incidencias porque los clientes desconocían en qué fase estaba su pedido.', fa: 'گزارش‌های زیادی می‌گرفتیم چون مشتریان نمی‌دانستند سفارششان در چه مرحله‌ای است.' },
      { s: 'مصاحبه‌گر', t: '¿Qué medidas concretas aplicó usted?', fa: 'شما دقیقاً چه اقداماتی انجام دادید؟' },
      { t: 'Coordiné al equipo técnico con atención al cliente para activar avisos automáticos, y las consultas bajaron un cuarenta por ciento.', fa: 'تیم فنی را با پشتیبانی هماهنگ کردم تا اعلان‌های خودکار فعال شود و پرس‌وجوها چهل درصد کاهش یافت.' },
    ],
  },
  'b2-media-analysis': {
    de: [
      { t: 'Wie fandest du den gestrigen Dokumentarfilm über nachhaltige Stadtviertel?', fa: 'مستند دیشب دربارهٔ محله‌های پایدار شهری چطور بود؟' },
      { t: 'Bildsprache und Erzähltempo waren stark, allerdings kamen kritische Stimmen von Anwohnern etwas zu kurz.', fa: 'تصویرسازی و ریتم روایت قوی بود، هرچند صدای منتقدان از میان ساکنان کمی کوتاه آمده بود.' },
      { t: 'Waren die verwendeten Statistiken deiner Meinung nach ausreichend belegt?', fa: 'به نظر تو آمارهای استفاده‌شده به اندازهٔ کافی مستند بودند؟' },
      { t: 'Teilweise schon, aber bei zwei Vergleichen fehlte die genaue Angabe des Erhebungszeitraums.', fa: 'تا حدی بله، اما در دو مقایسه ذکر دقیق بازهٔ زمانی گردآوری داده جا افتاده بود.' },
    ],
    fr: [
      { t: 'Qu’as-tu pensé du documentaire d’hier soir sur les quartiers écologiques ?', fa: 'دربارهٔ مستند دیشب راجع به محله‌های زیست‌محیطی چه فکری می‌کنی؟' },
      { t: 'La réalisation était très claire, même si le point de vue des commerçants locaux manquait un peu.', fa: 'کارگردانی بسیار روشن بود، هرچند دیدگاه کسبهٔ محلی کمی کم بود.' },
      { t: 'Les preuves présentées te semblaient-elles solides ?', fa: 'شواهد ارائه‌شده به نظرت محکم بودند؟' },
      { t: 'Dans l’ensemble oui, mais certains chiffres auraient gagné à préciser leur source exacte.', fa: 'در مجموع بله، ولی خوب بود برای بعضی رقم‌ها منبع دقیق‌تر ذکر می‌شد.' },
    ],
    es: [
      { t: '¿Qué te pareció el documental sobre urbanismo sostenible que vimos ayer?', fa: 'مستند دربارهٔ شهرسازی پایدار که دیروز دیدیم چطور بود؟' },
      { t: 'Me pareció bien narrado, aunque echaba en falta más testimonios de vecinos con opiniones distintas.', fa: 'روایتش خوب بود، هرچند جای گفته‌های بیشتری از ساکنان با دیدگاه‌های متفاوت خالی بود.' },
      { t: '¿Te convencieron los datos en los que se apoyaba?', fa: 'داده‌هایی که به آن تکیه کرده بود قانعت کرد؟' },
      { t: 'La mayoría sí, pero en dos gráficos no quedaba claro el año de referencia.', fa: 'اکثرشان بله، اما در دو نمودار سالِ مرجع روشن نبود.' },
    ],
  },
  'b2-mixed-conditions': {
    de: [
      { t: 'Wenn wir damals in eine gemeinsame Plattform investiert hätten, müssten wir heute nicht alles doppelt pflegen.', fa: 'اگر آن زمان در یک سکوی مشترک سرمایه‌گذاری کرده بودیم، امروز مجبور نبودیم همه‌چیز را دوباره ثبت کنیم.' },
      { t: 'Stimmt — und wenn ich heute weniger Routinearbeit hätte, könnte ich längst die neuen Kunden betreuen.', fa: 'درست است — و اگر امروز کار تکراری کمتری داشتم، خیلی وقت پیش می‌توانستم به مشتریان تازه برسم.' },
      { t: 'Lässt sich das Versäumnis aus dem letzten Jahr jetzt noch schrittweise korrigieren?', fa: 'آیا کوتاهی پارسال الان هنوز به صورت مرحله‌ای قابل اصلاح است؟' },
      { t: 'Ja, wenn wir nächste Woche mit der Zusammenführung beginnen, sparen wir ab Herbst wieder wertvolle Stunden.', fa: 'بله، اگر هفتهٔ آینده یکپارچه‌سازی را شروع کنیم، از پاییز دوباره ساعت‌های ارزشمندی صرفه‌جویی می‌کنیم.' },
    ],
    fr: [
      { t: 'Si nous avions unifié nos outils il y a deux ans, nous ne perdrions pas autant de temps aujourd’hui.', fa: 'اگر دو سال پیش ابزارهایمان را یکپارچه کرده بودیم، امروز این‌قدر وقت تلف نمی‌کردیم.' },
      { t: 'Exactement ; et si j’étais plus disponible cette semaine, j’aurais déjà préparé le nouveau guide.', fa: 'دقیقاً؛ و اگر این هفته وقتم آزادتر بود، تا الان راهنمای جدید را آماده کرده بودم.' },
      { t: 'Pouvons-nous encore rattraper ce retard dès ce mois-ci ?', fa: 'هنوز می‌توانیم همین ماه این عقب‌ماندگی را جبران کنیم؟' },
      { t: 'Oui, si nous lançons la migration lundi, le système sera fluide dès le mois prochain.', fa: 'بله، اگر دوشنبه انتقال را شروع کنیم، سیستم از ماه آینده روان خواهد شد.' },
    ],
    es: [
      { t: 'Si hubiéramos unificado las bases de datos el año pasado, hoy no tendríamos estos errores.', fa: 'اگر پارسال پایگاه‌های داده را یکپارچه کرده بودیم، امروز این خطاها را نداشتیم.' },
      { t: 'Cierto, y si yo tuviera menos tareas repetitivas ahora, ya habría cerrado el informe nuevo.', fa: 'درست است، و اگر الان کارهای تکراری کمتری داشتم، گزارش جدید را بسته بودم.' },
      { t: '¿Estamos a tiempo de corregirlo antes del próximo trimestre?', fa: 'وقت داریم پیش از فصل بعد اصلاحش کنیم؟' },
      { t: 'Sí, si empezamos el lunes con la limpieza de datos, en un mes trabajaremos mucho mejor.', fa: 'بله، اگر دوشنبه با پاک‌سازی داده‌ها شروع کنیم، ظرف یک ماه خیلی بهتر کار خواهیم کرد.' },
    ],
  },
  'b2-professional-phrases': {
    de: [
      { s: 'مدیر', t: 'Welche Maßnahmen stehen jetzt auf unserer Agenda, um das Pilotprojekt auf den Weg zu bringen?', fa: 'الان برای به جریان انداختن پروژهٔ آزمایشی چه اقدام‌هایی در دستور کارمان است؟' },
      { t: 'Zunächst müssen wir alle rechtlichen Vorgaben in Betracht ziehen und die Zuständigkeiten klar festlegen.', fa: 'ابتدا باید همهٔ الزامات حقوقی را در نظر بگیریم و مسئولیت‌ها را روشن تعیین کنیم.' },
      { s: 'مدیر', t: 'Wer trägt für die finale Qualitätskontrolle die Verantwortung?', fa: 'چه کسی مسئولیت کنترل کیفیت نهایی را بر عهده دارد؟' },
      { t: 'Unser Fachteam übernimmt die Prüfung, sodass wir kommende Woche eine fundierte Entscheidung treffen können.', fa: 'تیم تخصصی ما بررسی را بر عهده می‌گیرد تا هفتهٔ آینده بتوانیم تصمیم مستدلی بگیریم.' },
    ],
    fr: [
      { s: 'مدیر', t: 'Quelles priorités devons-nous retenir pour mettre en œuvre cette initiative ?', fa: 'برای اجرای این ابتکار چه اولویت‌هایی را باید مد نظر بگیریم؟' },
      { t: 'Nous devons d’abord prendre en compte les contraintes budgétaires et fixer un calendrier réaliste.', fa: 'ابتدا باید محدودیت‌های بودجه‌ای را در نظر بگیریم و یک تقویم واقع‌بینانه تعیین کنیم.' },
      { s: 'مدیر', t: 'Qui sera en mesure de valider la phase technique ?', fa: 'چه کسی امکان تأیید مرحلهٔ فنی را خواهد داشت؟' },
      { t: 'Le comité qualité rendra son avis vendredi afin que nous puissions prendre une décision éclairée.', fa: 'کمیتهٔ کیفیت جمعه نظرش را می‌دهد تا بتوانیم تصمیم آگاهانه‌ای بگیریم.' },
    ],
    es: [
      { s: 'مدیر', t: '¿Qué pasos debemos poner en marcha para aprobar la nueva iniciativa?', fa: 'برای تصویب این طرح تازه چه گام‌هایی را باید به اجرا بگذاریم؟' },
      { t: 'Primero tenemos que tener en cuenta las normas vigentes y asignar responsables claros.', fa: 'اول باید مقررات جاری را در نظر بگیریم و مسئولان مشخصی تعیین کنیم.' },
      { s: 'مدیر', t: '¿Cuándo podremos tomar una decisión definitiva sobre el presupuesto?', fa: 'چه زمانی می‌توانیم تصمیم قطعی دربارهٔ بودجه بگیریم؟' },
      { t: 'En cuanto revisemos el cálculo técnico el jueves, daremos el visto bueno final.', fa: 'به‌محض اینکه پنجشنبه محاسبهٔ فنی را بررسی کنیم، تأیید نهایی را می‌دهیم.' },
    ],
  },
  'b2-housing-economy': {
    de: [
      { t: 'In unserem Viertel sind die Mieten in drei Jahren enorm gestiegen. Welche Ursachen siehst du vor allem?', fa: 'در محلهٔ ما اجاره‌ها ظرف سه سال به‌شدت بالا رفته. مهم‌ترین دلایلش را چه می‌بینی؟' },
      { t: 'Das Angebot an bezahlbaren Wohnungen wächst deutlich langsamer als der Zuzug neuer Familien und Studierender.', fa: 'عرضهٔ خانه‌های مقرون‌به‌صرفه به‌وضوح کندتر از ورود خانواده‌ها و دانشجویان تازه رشد می‌کند.' },
      { t: 'Welche kommunale Maßnahme könnte kurzfristig wirklich Entlastung schaffen?', fa: 'کدام اقدام شهری در کوتاه‌مدت واقعاً می‌تواند فشار را کم کند؟' },
      { t: 'Schnellere Baugenehmigungen für Genossenschaften und gezielte Zuschüsse für Haushalte mit mittlerem Einkommen.', fa: 'صدور سریع‌تر مجوز ساخت برای تعاونی‌ها و کمک‌هزینهٔ هدفمند برای خانوارهای با درآمد متوسط.' },
    ],
    fr: [
      { t: 'Les loyers ont fortement augmenté dans notre quartier. Comment expliques-tu cette tension ?', fa: 'اجاره‌بها در محلهٔ ما به‌شدت بالا رفته. این فشار را چطور توضیح می‌دهی؟' },
      { t: 'La construction de logements abordables ne suit plus la demande croissante près des transports.', fa: 'ساخت مسکن مقرون‌به‌صرفه دیگر هم‌پای تقاضای روبه‌رشد کنار خطوط حمل‌ونقل پیش نمی‌رود.' },
      { t: 'Quelle solution locale te semble la plus efficace à moyen terme ?', fa: 'کدام راه‌حل محلی در میان‌مدت به نظرت کارآمدتر است؟' },
      { t: 'Soutenir les logements coopératifs et encourager la rénovation de bâtiments vides en centre-ville.', fa: 'حمایت از مسکن تعاونی و تشویق به بازسازی ساختمان‌های خالی در مرکز شهر.' },
    ],
    es: [
      { t: 'El precio del alquiler ha subido muchísimo en este distrito. ¿Qué factores pesan más?', fa: 'قیمت اجاره در این منطقه خیلی بالا رفته. کدام عامل‌ها وزن بیشتری دارند؟' },
      { t: 'Falta oferta asequible frente a la demanda creciente de jóvenes y familias trabajadoras.', fa: 'عرضهٔ مقرون‌به‌صرفه در برابر تقاضای روبه‌رشد جوانان و خانواده‌های شاغل کم است.' },
      { t: '¿Qué medida municipal tendría un impacto real?', fa: 'کدام اقدام شهرداری اثر واقعی خواهد داشت؟' },
      { t: 'Ampliar el parque público de alquiler y agilizar licencias en suelo urbano disponible.', fa: 'گسترش مسکن اجاره‌ای عمومی و تسریع مجوزها در زمین‌های شهریِ آماده.' },
    ],
  },
  'b2-multi-party-discussion': {
    de: [
      { s: 'رئیس جلسه', t: 'Wir haben zwei Vorschläge für das Sommerprogramm — wie bringen wir Budget und Qualität zusammen?', fa: 'دو پیشنهاد برای برنامهٔ تابستانی داریم — بودجه و کیفیت را چطور با هم جمع کنیم؟' },
      { t: 'Mein Vorschlag ist, mit einer kompakten dreitägigen Konferenz zu starten statt einer ganzen Woche.', fa: 'پیشنهاد من این است به‌جای یک هفته کامل با یک همایش جمع‌وجور سه‌روزه شروع کنیم.' },
      { s: 'همکار دوم', t: 'Guter Kompromiss! So bleibt genug Budget für zwei internationale Gastvorträge.', fa: 'مصالحهٔ خوبی است! این‌طوری بودجهٔ کافی برای دو سخنرانی مهمان بین‌المللی می‌ماند.' },
      { t: 'Einverstanden — dann halten wir drei Tage als gemeinsamen Beschluss fest und verschicken morgen das Programm.', fa: 'موافقم — پس سه روز را به عنوان تصمیم مشترک ثبت می‌کنیم و فردا برنامه را می‌فرستیم.' },
    ],
    fr: [
      { s: 'رئیس جلسه', t: 'Nous avons deux options pour le colloque d’été. Comment trouver un terrain d’entente ?', fa: 'برای همایش تابستانی دو گزینه داریم. چطور به جمع‌بندی مشترک برسیم؟' },
      { t: 'Je propose de réduire le format à trois journées denses plutôt que cinq.', fa: 'پیشنهاد می‌کنم قالب را به‌جای پنج روز به سه روز متمرکز کاهش بدهیم.' },
      { s: 'همکار دوم', t: 'C’est très pertinent : cela préserve le budget des ateliers pratiques sans surcharger le calendrier.', fa: 'بسیار به‌جاست: این‌طوری بودجهٔ کارگاه‌های عملی حفظ می‌شود بدون اینکه تقویم سنگین شود.' },
      { t: 'Parfait, nous validons donc le format de trois jours et envoyons les invitations dès demain.', fa: 'عالی، پس قالب سه‌روزه را تأیید می‌کنیم و دعوت‌نامه‌ها را از فردا می‌فرستیم.' },
    ],
    es: [
      { s: 'رئیس جلسه', t: 'Tenemos dos propuestas distintas sobre la mesa. ¿Cómo cerramos un acuerdo común?', fa: 'دو پیشنهاد متفاوت روی میز داریم. چطور به توافق مشترک برسیم؟' },
      { t: 'Propongo concentrar las jornadas en tres días bien aprovechados en lugar de toda la semana.', fa: 'پیشنهاد می‌کنم به‌جای کل هفته، نشست‌ها را در سه روزِ پربار متمرکز کنیم.' },
      { s: 'همکار دوم', t: 'Me parece una salida equilibrada que respeta el presupuesto y mantiene los talleres clave.', fa: 'راه‌حل متعادلی به نظر می‌رسد که بودجه را رعایت می‌کند و کارگاه‌های کلیدی را نگه می‌دارد.' },
      { t: 'De acuerdo todos entonces: dejamos cerrados los tres días y mañana enviamos la agenda final.', fa: 'پس همه موافقیم: سه روز را قطعی می‌کنیم و فردا دستور کار نهایی را می‌فرستیم.' },
    ],
  },
});
