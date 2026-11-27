"""Lesson-local continuation rows. First rows are the approved bilingual scene nuclei.
Keep original per-lesson slot counts: 53 x 12, 3 x 20. No global generic filler.
"""
BANK={}
def add(slug,text):
    BANK[slug]=[tuple(line.split(' | ',1)) for line in text.strip().splitlines()]
add('greetings','''Guten Morgen, Anna! | صبح بخیر، آنا!
Guten Abend, Ben! | عصر بخیر، بن!
Guten Tag, Frau Weber. | روز بخیر، خانم وبر.
Auf Wiedersehen, Herr Lee. | خداحافظ، آقای لی.
Mir geht es heute gut. | امروز حالم خوب است.
Danke, mir geht es auch gut. | ممنون، حال من هم خوب است.
Bis heute Abend! | تا امشب!
Hallo, Ben! Und wie geht es dir? | سلام، بن! و حال تو چطور است؟''')
add('profile','''Mein Name ist Anna. | نام من آنا است.
Ich wohne in Köln. | در کلن زندگی می‌کنم.
Wie heißt du denn? | راستی اسم تو چیست؟
Ich bin Ben. | من بن هستم.
Wohnst du in Berlin? | در برلین زندگی می‌کنی؟
Nein, ich wohne in Bonn. | نه، در بن زندگی می‌کنم.
Hallo, Anna. Ich heiße Amir. | سلام، آنا. اسم من امیر است.
Freut mich, Amir. | از آشنایی با تو خوشحالم، امیر.
Und wo wohnst du? | و تو کجا زندگی می‌کنی؟
Ich wohne auch in Köln. | من هم در کلن زندگی می‌کنم.
Mein Name ist Lena. Und du? | نام من لنا است. تو چطور؟
Ich heiße Tim und wohne in Berlin. | اسم من تیم است و در برلین زندگی می‌کنم.
Ist dein Name Sara? | آیا نام تو سارا است؟
Ja, ich heiße Sara. | بله، اسم من سارا است.
Hallo, ich bin neu hier. | سلام، من اینجا تازه‌وارد هستم.
Schön, dich kennenzulernen. | از آشنایی با تو خوشحالم.''')
add('asking-help','''Noch einmal, bitte. | یک بار دیگر، لطفاً.
Bitte sprechen Sie langsam. | لطفاً آهسته صحبت کنید.
Ich verstehe das Wort nicht. | این واژه را نمی‌فهمم.
Wie schreibt man das? | این را چطور می‌نویسند؟
Bitte schreiben Sie Ihren Namen. | لطفاً نامتان را بنویسید.
Mein Name ist Lee: L–E–E. | نام من لی است: اِل، اِ، اِ.
Entschuldigung, können Sie das wiederholen? | ببخشید، می‌توانید آن را تکرار کنید؟
Danke, jetzt verstehe ich. | ممنون، الان می‌فهمم.''')
add('nationalities','''Woher kommen Sie? | شما اهل کجا هستید؟
Ich komme aus Deutschland. | من اهل آلمان هستم.
Wo wohnen Sie? | شما کجا زندگی می‌کنید؟
Ich wohne in Berlin. | من در برلین زندگی می‌کنم.
Ich spreche Deutsch. | آلمانی صحبت می‌کنم.
Sprichst du Persisch? | آیا فارسی صحبت می‌کنی؟
Ich komme aus der Türkei. | من اهل ترکیه هستم.
Ich komme aus dem Iran und wohne in Bonn. | من اهل ایران هستم و در بن زندگی می‌کنم.''')
add('numbers-age','''Meine Nummer ist null eins zwei. | شمارهٔ من صفر، یک، دو است.
Vier, fünf, sechs, sieben. | چهار، پنج، شش، هفت.
Acht, neun, zehn. | هشت، نه، ده.
Elf, zwölf, dreizehn. | یازده، دوازده، سیزده.
Vierzehn, fünfzehn, sechzehn. | چهارده، پانزده، شانزده.
Siebzehn, achtzehn, neunzehn. | هفده، هجده، نوزده.
Zwanzig, dreißig, vierzig, fünfzig. | بیست، سی، چهل، پنجاه.
Sechzig, siebzig, achtzig, neunzig, hundert. | شصت، هفتاد، هشتاد، نود، صد.''')
add('nouns-gender-plural','''Der Stift ist hier. | خودکار اینجا است.
Die Tasche ist hier. | کیف اینجا است.
Das Buch ist hier. | کتاب اینجا است.
Das sind drei Stifte. | این‌ها سه خودکار هستند.
Das sind zwei Taschen. | این‌ها دو کیف هستند.
Das ist ein Heft. | این یک دفتر است.
Das sind vier Hefte. | این‌ها چهار دفتر هستند.
Ein Buch und zwei Hefte. | یک کتاب و دو دفتر.''')
add('articles','''Das ist ein Tisch. | این یک میز است.
Der Tisch ist klein. | آن میز کوچک است.
Das ist eine Tasche. | این یک کیف است.
Die Tasche ist hier. | آن کیف اینجا است.
Das ist ein Buch. | این یک کتاب است.
Das Buch ist neu. | آن کتاب نو است.
Das sind Bücher. | این‌ها کتاب هستند.
Die Bücher sind hier. | آن کتاب‌ها اینجا هستند.''')
add('subject-pronouns','''Ich bin Sara. | من سارا هستم.
Du bist Ben. | تو بن هستی.
Wir sind hier. | ما اینجا هستیم.
Ihr seid auch hier. | شما هم اینجا هستید. (خطاب دوستانه به چند نفر)
Anna und Ben sind hier. Sie sind hier. | آنا و بن اینجا هستند. آن‌ها اینجا هستند.
Das Buch ist neu. Es ist neu. | کتاب نو است. آن نو است.
Sind Sie Frau Weber? | آیا شما خانم وبر هستید؟
Ja, ich bin Frau Weber. | بله، من خانم وبر هستم.''')
add('verb-to-be','''Ich bin Lehrer. | من معلم هستم. (مرد)
Du bist Student. | تو دانشجو هستی. (مرد)
Sie ist Lehrerin. | او معلم است. (زن)
Wir sind im Kurs. | ما در کلاس هستیم.
Seid ihr hier? | آیا شما اینجا هستید؟ (چند نفر، دوستانه)
Ja, wir sind hier. | بله، ما اینجا هستیم.
Sind Sie Lehrer? | آیا شما معلم هستید؟ (رسمی، مرد)
Nein, ich bin Student. | نه، من دانشجو هستم. (مرد)''')
add('family','''Das ist meine Mutter. | این مادر من است.
Mein Vater heißt Ali. | نام پدر من علی است.
Ich habe einen Bruder. | یک برادر دارم.
Meine Schwester heißt Anna. | نام خواهر من آنا است.
Mein Bruder ist zwölf Jahre alt. | برادرم دوازده سال دارد.
Ist das dein Vater? | آیا این پدر تو است؟
Ja, das ist mein Vater. | بله، این پدر من است.
Meine Mutter ist Lehrerin. | مادر من معلم است.''')
add('possessives','''Das ist dein Heft. | این دفتر تو است.
Das ist meine Tasche. | این کیف من است.
Ist das dein Stift? | آیا این خودکار تو است؟
Nein, das ist Bens Stift. | نه، این خودکار بن است.
Ben hat eine Tasche. Seine Tasche ist blau. | بن یک کیف دارد. کیف او آبی است.
Anna hat ein Buch. Ihr Buch ist neu. | آنا یک کتاب دارد. کتاب او نو است.
Das sind meine Bücher. | این‌ها کتاب‌های من هستند.
Sind das deine Hefte? | آیا این‌ها دفترهای تو هستند؟''')
add('demonstratives','''Dieser Stift ist neu. | این خودکار نو است.
Diese Lampe ist klein. | این چراغ کوچک است.
Dieses Heft ist hier. | این دفتر اینجا است.
Ist dieser Tisch groß? | آیا این میز بزرگ است؟
Ja, dieser Tisch ist groß. | بله، این میز بزرگ است.
Ist dieses Heft dein Heft? | آیا این دفتر، دفتر تو است؟
Ja, dieses Heft ist mein Heft. | بله، این دفتر، دفتر من است.
Diese Bücher sind neu. | این کتاب‌ها نو هستند.''')
add('descriptions','''Das Buch ist neu. | کتاب نو است.
Der Tisch ist groß. | میز بزرگ است.
Die Tasche ist klein. | کیف کوچک است.
Das Zimmer ist nicht groß. | اتاق بزرگ نیست.
Ist dein Buch alt? | آیا کتابت قدیمی است؟
Nein, es ist neu. | نه، نو است.
Meine Tasche ist nicht neu. | کیف من نو نیست.
Das Zimmer ist klein und ruhig. | اتاق کوچک و ساکت است.''')
add('colors','''Der Stift ist rot. | خودکار قرمز است.
Das Heft ist schwarz. | دفتر مشکی است.
Die Lampe ist weiß. | چراغ سفید است.
Ist deine Tasche grün? | آیا کیفت سبز است؟
Nein, sie ist blau. | نه، آبی است.
Welche Farbe hat dein Stift? | خودکارت چه رنگی است؟
Mein Stift ist schwarz. | خودکارم مشکی است.
Dieses Buch ist rot. | این کتاب قرمز است.''')
add('feelings','''Ich bin froh. | خوشحالم.
Bist du heute müde? | آیا امروز خسته‌ای؟
Nein, mir geht es gut. | نه، حالم خوب است.
Ich habe Hunger. | گرسنه‌ام.
Hast du Durst? | آیا تشنه‌ای؟
Ben ist müde. | بن خسته است.
Anna ist heute froh. | آنا امروز خوشحال است.
Ich bin müde und habe Hunger. | خسته‌ام و گرسنه‌ام.''')
add('simple-verbs','''Ich habe einen Stift. | یک خودکار دارم.
Du hast eine Tasche. | تو یک کیف داری.
Ich kaufe ein Buch. | یک کتاب می‌خرم.
Ich brauche den Stift. | آن خودکار را لازم دارم.
Hast du einen Stift? | آیا یک خودکار داری؟
Ja, ich habe einen Stift. | بله، یک خودکار دارم.
Ich brauche die Tasche. | آن کیف را لازم دارم.
Ich habe das Buch. | آن کتاب را دارم.''')
add('verb-conjugation','''Ich wohne in Bonn. | من در بن زندگی می‌کنم.
Du wohnst in Köln. | تو در کلن زندگی می‌کنی.
Er wohnt in Berlin. | او در برلین زندگی می‌کند. (مرد)
Wir wohnen hier. | ما اینجا زندگی می‌کنیم.
Ihr wohnt in Bonn. | شما در بن زندگی می‌کنید. (چند نفر، دوستانه)
Sie wohnen in Köln. | شما در کلن زندگی می‌کنید. (رسمی)
Wir lernen Deutsch. | ما آلمانی یاد می‌گیریم.
Ihr lernt zusammen. | شما با هم یاد می‌گیرید. (چند نفر، دوستانه)''')
add('present-tense','''Ich arbeite hier. | اینجا کار می‌کنم.
Du arbeitest heute. | تو امروز کار می‌کنی.
Anna arbeitet in Bonn. | آنا در بن کار می‌کند.
Wir arbeiten zusammen. | ما با هم کار می‌کنیم.
Ich spreche Deutsch. | آلمانی صحبت می‌کنم.
Du sprichst Persisch. | تو فارسی صحبت می‌کنی.
Ben liest ein Buch. | بن کتاب می‌خواند.
Wir lesen zusammen. | ما با هم مطالعه می‌کنیم.''')
add('positive-negative-questions','''Ich habe eine Tasche. | یک کیف دارم.
Ich habe keine Tasche. | کیف ندارم.
Lernst du heute? | آیا امروز درس می‌خوانی؟
Nein, ich lerne heute nicht. | نه، امروز درس نمی‌خوانم.
Ist das ein Buch? | آیا این یک کتاب است؟
Nein, das ist kein Buch. | نه، این کتاب نیست.
Ich habe kein Heft. | دفتر ندارم.
Das Zimmer ist nicht klein. | اتاق کوچک نیست.''')
add('question-words','''Wer ist das? | او کیست؟
Was brauchst du? | چه لازم داری؟
Wo wohnst du? | کجا زندگی می‌کنی؟
Woher kommst du? | اهل کجا هستی؟
Wie heißt du? | نامت چیست؟
Wie alt bist du? | چند سال داری؟
Wann arbeitest du? | چه زمانی کار می‌کنی؟
Wie viel kostet das Buch? | کتاب چقدر قیمت دارد؟''')
add('wants-needs','''Ich brauche ein Buch. | یک کتاب لازم دارم.
Ich möchte einen Tee, bitte. | یک چای می‌خواهم، لطفاً.
Ich mag Kaffee. | قهوه دوست دارم.
Magst du Wasser? | آب دوست داری؟
Nein, danke. Ich möchte keinen Kaffee. | نه، ممنون. قهوه نمی‌خواهم.
Was brauchst du heute? | امروز چه لازم داری؟
Heute brauche ich ein Heft. | امروز یک دفتر لازم دارم.
Ich mag Tee, aber ich möchte jetzt Wasser. | چای دوست دارم، ولی الان آب می‌خواهم.''')
add('ability','''Ich kann Deutsch lesen. | می‌توانم آلمانی بخوانم.
Du kannst gut schwimmen. | تو می‌توانی خوب شنا کنی.
Anna kann nicht schwimmen. | آنا نمی‌تواند شنا کند.
Wir können zusammen lernen. | می‌توانیم با هم درس بخوانیم.
Können Sie das bitte wiederholen? | می‌توانید لطفاً آن را تکرار کنید؟
Kannst du das Wort lesen? | می‌توانی آن واژه را بخوانی؟
Ja, ich kann das Wort lesen. | بله، می‌توانم آن واژه را بخوانم.
Ich kann heute nicht helfen. | امروز نمی‌توانم کمک کنم.''')
add('dates-and-time','''Wie spät ist es? | ساعت چند است؟
Es ist zehn Uhr. | ساعت ده است.
Es ist halb zehn. | ساعت نه و نیم است.
Der Termin ist am Dienstag. | قرار سه‌شنبه است.
Der Kurs beginnt um acht Uhr. | کلاس ساعت هشت شروع می‌شود.
Heute ist der erste Mai. | امروز اول ماه مه است.
Der Termin ist am ersten Mai. | قرار در روز اول ماه مه است.
Am Freitag um zwölf Uhr. | جمعه ساعت دوازده.''')
add('forms-information','''Bitte schreiben Sie Ihren Vornamen. | لطفاً نام کوچکتان را بنویسید.
Mein Wohnort ist Bonn. | شهر محل زندگی من بن است.
Wie ist Ihre Adresse? | نشانی شما چیست؟
Meine Adresse ist Parkstraße zwölf. | نشانی من خیابان پارک، پلاک دوازده است.
Wie ist Ihr Geburtsdatum? | تاریخ تولد شما چیست؟
Mein Geburtsdatum ist der erste Mai. | تاریخ تولد من اول ماه مه است.
Nachname: Weber. Vorname: Ben. | نام خانوادگی: وبر. نام کوچک: بن.
Bitte buchstabieren Sie Ihren Nachnamen. | لطفاً نام خانوادگی‌تان را هجی کنید.''')
add('daily-routine','''Morgens lerne ich Deutsch. | صبح‌ها آلمانی یاد می‌گیرم.
Um acht Uhr arbeite ich. | ساعت هشت کار می‌کنم.
Abends kaufe ich ein. | عصرها خرید می‌کنم.
Ich stehe um sechs Uhr auf. | ساعت شش از خواب بلند می‌شوم.
Ben frühstückt um sieben Uhr. | بن ساعت هفت صبحانه می‌خورد.
Wann kaufst du ein? | چه زمانی خرید می‌کنی؟
Ich kaufe am Abend ein. | عصر خرید می‌کنم.
Um zehn Uhr gehe ich ins Bett. | ساعت ده به تختخواب می‌روم.''')
add('weekly-schedule','''Am Montag beginnt der Kurs um neun Uhr. | دوشنبه کلاس ساعت نه شروع می‌شود.
Montags lerne ich Deutsch. | دوشنبه‌ها آلمانی یاد می‌گیرم.
Dienstags arbeite ich. | سه‌شنبه‌ها کار می‌کنم.
Ich arbeite von acht bis zwölf Uhr. | از ساعت هشت تا دوازده کار می‌کنم.
Am Mittwoch habe ich Zeit. | چهارشنبه وقت دارم.
Am Donnerstag kaufe ich ein. | پنج‌شنبه خرید می‌کنم.
Am Freitag lerne ich zu Hause. | جمعه در خانه درس می‌خوانم.
Sonntags habe ich frei. | یکشنبه‌ها آزاد هستم.''')
add('work-study','''Ich arbeite im Büro. | در دفتر کار می‌کنم.
Ich lerne im Kurs Deutsch. | در کلاس آلمانی یاد می‌گیرم.
Ich habe eine Frage. | یک سؤال دارم.
Was ist die Aufgabe? | تمرین چیست؟
Ich muss heute lernen. | امروز باید درس بخوانم.
Wann endet der Kurs? | کلاس چه زمانی تمام می‌شود؟
Der Kurs endet um zwölf Uhr. | کلاس ساعت دوازده تمام می‌شود.
Wir machen jetzt eine Pause. | الان استراحت می‌کنیم.''')
add('instructions','''Schreiben Sie bitte Ihren Namen. | لطفاً نامتان را بنویسید.
Lesen Sie bitte die Aufgabe. | لطفاً تمرین را بخوانید.
Hören Sie bitte zu. | لطفاً گوش کنید.
Schließen Sie bitte Ihr Buch. | لطفاً کتابتان را ببندید.
Sprechen Sie bitte langsam. | لطفاً آهسته صحبت کنید.
Wiederholen Sie bitte das Wort. | لطفاً واژه را تکرار کنید.
Welche Aufgabe, bitte? | کدام تمرین، لطفاً؟
Aufgabe zwei, bitte. | تمرین دو، لطفاً.''')
add('location','''Das Bad ist hier. | حمام اینجا است.
Wo ist die Tasche? | کیف کجاست؟
Sie ist in der Küche. | در آشپزخانه است.
Mein Heft ist im Zimmer. | دفترم در اتاق است.
Ist Ben im Zimmer? | آیا بن در اتاق است؟
Nein, Ben ist in der Küche. | نه، بن در آشپزخانه است.
Hier ist die Küche. | اینجا آشپزخانه است.
Dort ist das Bad. | آنجا حمام است.''')
add('prepositions','''Der Stift liegt neben dem Buch. | خودکار کنار کتاب است.
Die Lampe steht auf dem Tisch. | چراغ روی میز است.
Das Heft liegt unter dem Buch. | دفتر زیر کتاب است.
Wo steht die Lampe? | چراغ کجاست؟
Sie steht neben der Tasche. | کنار کیف است.
Das Buch liegt in der Tasche. | کتاب داخل کیف است.
Die Tasche steht neben dem Tisch. | کیف کنار میز است.
Der Stift liegt unter dem Heft. | خودکار زیر دفتر است.''')
add('home-furniture','''Es gibt zwei Stühle. | دو صندلی هست.
Es gibt kein Bett. | تختی نیست.
Gibt es einen Tisch? | آیا میز هست؟
Ja, es gibt einen Tisch. | بله، میز هست.
Die Lampe steht auf dem Tisch. | چراغ روی میز است.
Das Bett steht neben dem Fenster. | تخت کنار پنجره است.
Der Stuhl steht neben dem Bett. | صندلی کنار تخت است.
Im Zimmer gibt es eine Lampe. | در اتاق یک چراغ هست.''')
add('room-search','''Ist das Zimmer ruhig? | آیا اتاق ساکت است؟
Ja, das Zimmer ist ruhig. | بله، اتاق ساکت است.
Gibt es eine Küche? | آیا آشپزخانه هست؟
Ja, es gibt eine Küche. | بله، آشپزخانه هست.
Ist das Bad im Zimmer? | آیا حمام داخل اتاق است؟
Nein, das Bad ist neben der Küche. | نه، حمام کنار آشپزخانه است.
Ist das Zimmer für eine Person? | آیا اتاق برای یک نفر است؟
Ja, für eine Person. | بله، برای یک نفر.
Wie hoch ist die Miete? | اجاره چقدر است؟
Die Miete ist dreihundert Euro pro Monat. | اجاره ماهی سیصد یورو است.
Ist das Zimmer frei? | آیا اتاق خالی است؟
Ja, ab Montag. | بله، از دوشنبه.
Kann ich das Zimmer sehen? | می‌توانم اتاق را ببینم؟
Ja, am Dienstag um zehn Uhr. | بله، سه‌شنبه ساعت ده.
Gibt es ein Bett? | آیا تخت هست؟
Ja, ein Bett und ein Tisch. | بله، یک تخت و یک میز.''')
add('ordering-food','''Ich möchte ein Brot, bitte. | یک نان می‌خواهم، لطفاً.
Einen Tee ohne Milch, bitte. | یک چای بدون شیر، لطفاً.
Mit Milch oder ohne Milch? | با شیر یا بدون شیر؟
Ohne Milch, bitte. | بدون شیر، لطفاً.
Ich möchte Wasser trinken. | می‌خواهم آب بنوشم.
Ist die Suppe vegetarisch? | آیا سوپ گیاهی است؟
Ja, die Suppe ist vegetarisch. | بله، سوپ گیاهی است.
Danke, das ist alles. | ممنون، همین است.''')
add('cafe','''Einen Tee, bitte. | یک چای، لطفاً.
Mit Milch, bitte. | با شیر، لطفاً.
Ohne Zucker, bitte. | بدون شکر، لطفاً.
Möchten Sie auch Wasser? | آیا آب هم میل دارید؟
Ja, ein Wasser, bitte. | بله، یک آب، لطفاً.
Nein, danke. | نه، ممنون.
Die Rechnung, bitte. | صورت‌حساب، لطفاً.
Zusammen oder getrennt? | با هم یا جدا؟
Getrennt, bitte. | جدا، لطفاً.
Zusammen, bitte. | با هم، لطفاً.
Das macht fünf Euro. | جمعاً پنج یورو می‌شود.
Hier, bitte. Fünf Euro. | بفرمایید. پنج یورو.
Kann ich hier zahlen? | می‌توانم اینجا پرداخت کنم؟
Ja, hier an der Kasse. | بله، اینجا پای صندوق.
Danke, auf Wiedersehen! | ممنون، خداحافظ!
Ich möchte einen Kaffee ohne Milch. | یک قهوه بدون شیر می‌خواهم.''')
add('shopping-payment','''Wie viel kostet der Stift? | خودکار چقدر قیمت دارد؟
Der Stift kostet zwei Euro. | خودکار دو یورو قیمت دارد.
Ich nehme das Heft. | دفتر را می‌خرم.
Zahlen Sie bar oder mit Karte? | نقد پرداخت می‌کنید یا با کارت؟
Ich zahle bar. | نقد پرداخت می‌کنم.
Mit Karte, bitte. | با کارت، لطفاً.
Hier ist Ihr Heft. | این دفتر شما است.
Danke. Auf Wiedersehen! | ممنون. خداحافظ!''')
add('supermarket','''Wo finde ich das Brot? | نان را کجا پیدا می‌کنم؟
Das Brot ist dort. | نان آنجا است.
Drei Äpfel, bitte. | سه سیب، لطفاً.
Eine Flasche Wasser, bitte. | یک بطری آب، لطفاً.
Ich brauche ein Kilo Äpfel. | یک کیلو سیب لازم دارم.
Gibt es Eier? | تخم‌مرغ هست؟
Nein, heute gibt es keine Eier. | نه، امروز تخم‌مرغ نداریم.
Eine Tüte, bitte. | یک کیسه، لطفاً.''')
add('clothes-shopping','''Ich suche eine Jacke. | دنبال یک کاپشن هستم.
Haben Sie das Hemd in Blau? | این پیراهن را به رنگ آبی دارید؟
Welche Größe haben Sie? | سایز شما چیست؟
Größe S, bitte. | سایز اسمال، لطفاً.
Das Hemd ist zu klein. | پیراهن زیادی کوچک است.
Die Jacke passt. | کاپشن اندازه است.
Wie viel kostet die Jacke? | کاپشن چقدر قیمت دارد؟
Ich nehme die Jacke. | کاپشن را می‌خرم.''')
add('preferences','''Ich esse lieber Reis. | ترجیح می‌دهم برنج بخورم.
Isst du lieber Brot oder Reis? | ترجیح می‌دهی نان بخوری یا برنج؟
Ich trinke Kaffee nicht gern. | قهوه نوشیدن را دوست ندارم.
Liest du lieber oder schwimmst du lieber? | مطالعه را ترجیح می‌دهی یا شنا را؟
Ich lese lieber. | مطالعه را ترجیح می‌دهم.
Ben trinkt lieber Wasser. | بن آب نوشیدن را ترجیح می‌دهد.
Ich mag Tee lieber als Kaffee. | چای را بیشتر از قهوه دوست دارم.
Heute möchte ich lieber zu Hause lernen. | امروز ترجیح می‌دهم در خانه درس بخوانم.''')
add('comparisons','''Dieses Zimmer ist größer als mein Zimmer. | این اتاق از اتاق من بزرگ‌تر است.
Die Tasche ist kleiner als die andere Tasche. | این کیف از آن کیف دیگر کوچک‌تر است.
Das Buch ist billiger als das Heft. | کتاب از دفتر ارزان‌تر است.
Ist diese Jacke billiger? | آیا این کاپشن ارزان‌تر است؟
Nein, das Hemd ist billiger. | نه، پیراهن ارزان‌تر است.
Mein Zimmer ist kleiner. | اتاق من کوچک‌تر است.
Dieser Tisch ist größer. | این میز بزرگ‌تر است.
Dieses Heft ist billiger als das Buch. | این دفتر از کتاب ارزان‌تر است.''')
add('leisure','''Ich höre gern Musik. | دوست دارم موسیقی گوش کنم.
Ben geht gern spazieren. | بن قدم‌زدن را دوست دارد.
Am Wochenende lese ich. | آخر هفته مطالعه می‌کنم.
Kannst du gut schwimmen? | می‌توانی خوب شنا کنی؟
Nein, ich kann nicht gut schwimmen. | نه، نمی‌توانم خوب شنا کنم.
Anna liest gern Bücher. | آنا کتاب خواندن را دوست دارد.
Wir hören zusammen Musik. | با هم موسیقی گوش می‌کنیم.
Was machst du am Wochenende? | آخر هفته چه کار می‌کنی؟''')
add('weather','''Heute ist es warm. | امروز هوا گرم است.
Morgen ist es kalt. | فردا هوا سرد است.
Es regnet nicht. | باران نمی‌بارد.
Ist es heute warm? | آیا امروز هوا گرم است؟
Nein, heute ist es kalt. | نه، امروز هوا سرد است.
Im Sommer ist es oft warm. | در تابستان اغلب هوا گرم است.
Im Winter ist es oft kalt. | در زمستان اغلب هوا سرد است.
Heute bleibe ich zu Hause. | امروز در خانه می‌مانم.''')
add('connectors','''Ich lerne Deutsch und Ben lernt Persisch. | من آلمانی یاد می‌گیرم و بن فارسی یاد می‌گیرد.
Ich möchte Tee oder Kaffee. | چای یا قهوه می‌خواهم.
Ich lese gern, aber heute habe ich keine Zeit. | مطالعه را دوست دارم، ولی امروز وقت ندارم.
Es ist kalt, aber es regnet nicht. | هوا سرد است، ولی باران نمی‌بارد.
Wir trinken Tee und lernen zusammen. | چای می‌نوشیم و با هم درس می‌خوانیم.
Ich habe Hunger und Durst. | گرسنه و تشنه‌ام.
Ich möchte kommen, aber ich muss arbeiten. | می‌خواهم بیایم، ولی باید کار کنم.
Lernst du hier oder zu Hause? | اینجا درس می‌خوانی یا در خانه؟''')
add('future-plans','''Morgen lerne ich Deutsch. | فردا آلمانی یاد می‌گیرم.
Heute Abend lese ich ein Buch. | امشب کتاب می‌خوانم.
Am Samstag besuche ich Ben. | شنبه به دیدن بن می‌روم.
Was machst du am Sonntag? | یکشنبه چه کار می‌کنی؟
Am Sonntag habe ich frei. | یکشنبه آزاد هستم.
Wir lernen morgen zusammen. | فردا با هم درس می‌خوانیم.
Morgen kaufe ich ein. | فردا خرید می‌کنم.
Heute habe ich keine Zeit, aber morgen habe ich Zeit. | امروز وقت ندارم، ولی فردا وقت دارم.''')
add('invitations','''Hast du heute Abend Zeit? | امشب وقت داری؟
Ja, sehr gern. | بله، با کمال میل.
Tut mir leid, ich kann heute nicht. | متأسفم، امروز نمی‌توانم.
Passt dir Sonntag? | یکشنبه برایت مناسب است؟
Ja, Sonntag passt. | بله، یکشنبه مناسب است.
Treffen wir uns um drei Uhr? | ساعت سه همدیگر را ببینیم؟
Gut, bis Sonntag! | بسیار خوب، تا یکشنبه!
Am Freitag muss ich arbeiten. | جمعه باید کار کنم.''')
add('suggestions','''Wollen wir zusammen lernen? | با هم درس بخوانیم؟
Wir können heute ins Café gehen. | می‌توانیم امروز به کافه برویم.
Gute Idee! | فکر خوبی است!
Heute habe ich leider keine Zeit. | متأسفانه امروز وقت ندارم.
Dann lernen wir morgen. | پس فردا درس می‌خوانیم.
Wir können zu Hause bleiben. | می‌توانیم در خانه بمانیم.
Wollen wir Musik hören? | موسیقی گوش کنیم؟
Ja, das machen wir. | بله، همین کار را می‌کنیم.''')
add('social-chat','''Wo wohnst du, Amir? | امیر، کجا زندگی می‌کنی؟
Ich wohne in Köln. | در کلن زندگی می‌کنم.
Was machst du gern? | دوست داری چه کار کنی؟
Ich höre gern Musik. | دوست دارم موسیقی گوش کنم.
Ich lese auch gern. | من هم مطالعه را دوست دارم.
Hast du morgen um zehn Zeit? | فردا ساعت ده وقت داری؟
Ja, um zehn habe ich Zeit. | بله، ساعت ده وقت دارم.
Schön, dann bis morgen! | عالی است، پس تا فردا!''')
add('directions','''Gehen Sie nach rechts. | به راست بروید.
Die Post ist links. | ادارهٔ پست سمت چپ است.
Ist der Bahnhof weit? | آیا ایستگاه قطار دور است؟
Nein, er ist ganz nah. | نه، خیلی نزدیک است.
Die Bank ist neben der Post. | بانک کنار ادارهٔ پست است.
Wie komme ich zum Bahnhof? | چطور به ایستگاه قطار بروم؟
Zuerst geradeaus, dann rechts. | اول مستقیم، بعد به راست.
Danke für Ihre Hilfe. | بابت کمکتان ممنون.''')
add('public-transport','''Wo ist die Haltestelle? | ایستگاه کجاست؟
Die Haltestelle ist dort. | ایستگاه آنجا است.
Ich fahre mit dem Bus. | با اتوبوس می‌روم.
Wann fährt der Bus? | اتوبوس چه زمانی حرکت می‌کند؟
Der Bus fährt um acht Uhr. | اتوبوس ساعت هشت حرکت می‌کند.
Ich steige hier aus. | اینجا پیاده می‌شوم.
Fährst du mit dem Bus? | آیا با اتوبوس می‌روی؟
Nein, ich fahre mit dem Taxi. | نه، با تاکسی می‌روم.''')
add('travel-tickets','''Hin und zurück, bitte. | رفت‌وبرگشت، لطفاً.
Was kostet die Fahrkarte? | بلیت چقدر قیمت دارد؟
Die Fahrkarte kostet zehn Euro. | بلیت ده یورو قیمت دارد.
Von welchem Gleis fährt der Zug? | قطار از کدام سکو حرکت می‌کند؟
Von Gleis vier. | از سکوی چهار.
Fährt der Zug nach Bonn? | آیا قطار به بن می‌رود؟
Ja, um elf Uhr. | بله، ساعت یازده.
Eine einfache Fahrt nach Berlin, bitte. | یک بلیت یک‌طرفه به برلین، لطفاً.''')
add('hotel-stay','''Wann gibt es Frühstück? | چه زمانی صبحانه هست؟
Von sieben bis zehn Uhr. | از ساعت هفت تا ده.
Wo ist mein Zimmer? | اتاقم کجاست؟
Ihr Zimmer ist hier. | اتاق شما اینجا است.
Wie ist die Zimmernummer? | شمارهٔ اتاق چیست؟
Zimmer zwölf. | اتاق دوازده.
Ist das Frühstück im Preis? | آیا صبحانه در قیمت حساب شده است؟
Ja, das Frühstück ist im Preis. | بله، صبحانه در قیمت حساب شده است.''')
add('polite-requests','''Könnten Sie bitte langsam sprechen? | می‌شود لطفاً آهسته صحبت کنید؟
Darf ich hier sitzen? | اجازه دارم اینجا بنشینم؟
Ja, der Stuhl ist frei. | بله، صندلی خالی است.
Können Sie bitte das Wort wiederholen? | می‌توانید لطفاً واژه را تکرار کنید؟
Darf ich eine Frage stellen? | اجازه دارم یک سؤال بپرسم؟
Ja, bitte. | بله، بفرمایید.
Könnten Sie bitte Ihren Namen schreiben? | می‌شود لطفاً نامتان را بنویسید؟
Vielen Dank für Ihre Hilfe. | بابت کمکتان بسیار ممنون.''')
add('phone-messages','''Guten Tag. Wer spricht, bitte? | روز بخیر. چه کسی صحبت می‌کند، لطفاً؟
Hier ist Ben Weber. | بن وبر هستم.
Kann ich eine Nachricht hinterlassen? | می‌توانم یک پیام بگذارم؟
Ja, natürlich. Wie heißen Sie? | بله، حتماً. نام شما چیست؟
Bitte rufen Sie mich morgen an. | لطفاً فردا با من تماس بگیرید.
Ich rufe um zehn Uhr an. | ساعت ده تماس می‌گیرم.
Bitte sprechen Sie etwas langsamer. | لطفاً کمی آهسته‌تر صحبت کنید.
Danke, auf Wiederhören! | ممنون، خداحافظ! (تلفنی)''')
add('doctor-symptoms','''Ich habe Fieber. | تب دارم.
Ich habe Halsschmerzen. | گلودرد دارم.
Ich brauche einen Termin. | یک نوبت لازم دارم.
Seit heute Morgen. | از امروز صبح.
Haben Sie heute einen Termin frei? | آیا امروز وقت خالی دارید؟
Ja, um zehn Uhr. | بله، ساعت ده.
Ich fühle mich nicht gut. | حالم خوب نیست.
Bitte helfen Sie mir. | لطفاً به من کمک کنید.''')
add('past-events','''Gestern habe ich gearbeitet. | دیروز کار کردم.
Am Abend habe ich gelernt. | عصر درس خواندم.
Ich hatte gestern frei. | دیروز آزاد بودم.
Ben war gestern zu Hause. | بن دیروز در خانه بود.
Hattest du gestern Zeit? | دیروز وقت داشتی؟
Ja, ich hatte Zeit. | بله، وقت داشتم.
Was hast du gestern gemacht? | دیروز چه کار کردی؟
Ich habe zu Hause gelernt. | در خانه درس خواندم.''')
add('reasons','''Warum bleibst du zu Hause? | چرا در خانه می‌مانی؟
Ich habe Fieber. | تب دارم.
Ich bleibe hier, denn es regnet. | اینجا می‌مانم، چون باران می‌بارد.
Heute kann ich nicht kommen. Ich muss arbeiten. | امروز نمی‌توانم بیایم. باید کار کنم.
Ich trinke Wasser, denn ich habe Durst. | آب می‌نوشم، چون تشنه‌ام.
Ich lerne, denn morgen beginnt der Kurs. | درس می‌خوانم، چون کلاس فردا شروع می‌شود.
Morgen habe ich Zeit. Treffen wir uns morgen? | فردا وقت دارم. فردا همدیگر را ببینیم؟
Ja, morgen passt. | بله، فردا مناسب است.''')
add('connected-conversation','''Ich heiße Sara und wohne in Köln. | اسم من سارا است و در کلن زندگی می‌کنم.
Heute kann ich nicht, denn ich muss arbeiten. | امروز نمی‌توانم، چون باید کار کنم.
Am Sonntag habe ich Zeit. Passt dir Sonntag? | یکشنبه وقت دارم. یکشنبه برایت مناسب است؟
Ja, Sonntag passt. Bis Sonntag um drei! | بله، یکشنبه مناسب است. تا یکشنبه ساعت سه!''')
