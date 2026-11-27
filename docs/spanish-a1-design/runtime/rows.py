"""Lesson-local Spanish continuation banks for the approved 56 lessons."""
BANK={}
def add(slug,text):BANK[slug]=[tuple(s.split(' | ',1)) for s in text.strip().splitlines()]
add('greetings','''Buenos días, señora. | صبح بخیر، خانم.
Buenas tardes, señor. | عصر بخیر، آقا.
Buenas noches, Ana. | شب بخیر، آنا.
Hola, Ben. | سلام، بن.
Adiós, señor Martín. | خداحافظ، آقای مارتین.
Hasta luego. | تا بعد.
Muy bien, gracias. | خیلی خوبم، ممنون.
Hasta el lunes. | تا دوشنبه.''')
add('profile','''Mi nombre es Ana. | نام من آنا است.
Soy Ben. | من بن هستم.
¿Cómo te llamas? | اسم تو چیست؟
Me llamo Amir. | اسم من امیر است.
¿Vives en Toledo? | در تولدو زندگی می‌کنی؟
No, vivo en Sevilla. | نه، در سویا زندگی می‌کنم.
También vivo en Madrid. | من هم در مادرید زندگی می‌کنم.
Hola, soy nuevo aquí. | سلام، من اینجا تازه‌وارد هستم. (مرد)
Hola, soy nueva aquí. | سلام، من اینجا تازه‌وارد هستم. (زن)
¿Te llamas Ana? | اسم تو آنا است؟
Sí, me llamo Ana. | بله، اسم من آنا است.
¿Y tú, dónde vives? | و تو کجا زندگی می‌کنی؟
Yo vivo en Toledo. | من در تولدو زندگی می‌کنم.
Hola, me llamo Ben. | سلام، اسم من بن است.
Encantado, Sara. | از آشنایی با تو خوشحالم، سارا. (گوینده مرد)
Encantada, Ben. | از آشنایی با تو خوشحالم، بن. (گوینده زن)''')
add('asking-help','''Otra vez, por favor. | یک بار دیگر، لطفاً.
Más despacio, por favor. | آهسته‌تر، لطفاً.
No entiendo esta palabra. | این واژه را نمی‌فهمم.
¿Puede repetir, por favor? | می‌توانید لطفاً تکرار کنید؟
¿Cómo se escribe su apellido? | نام خانوادگی شما چطور نوشته می‌شود؟
Mi apellido es Lee: L–E–E. | نام خانوادگی من لی است: اِلِه، اِ، اِ.
¿Puede deletrearlo? | می‌توانید آن را هجی کنید؟
Gracias, ahora lo entiendo. | ممنون، الان می‌فهمم.''')
add('nationalities','''Soy de España. | اهل اسپانیا هستم.
Vivo en Madrid. | در مادرید زندگی می‌کنم.
Hablo español. | اسپانیایی صحبت می‌کنم.
Hablo persa. | فارسی صحبت می‌کنم.
¿También hablas persa? | تو هم فارسی صحبت می‌کنی؟
Ana es española. Vive en Madrid. | آنا اسپانیایی است. در مادرید زندگی می‌کند.
Ben es español. | بن اسپانیایی است.
Soy de Irán y vivo en Toledo. | اهل ایران هستم و در تولدو زندگی می‌کنم.''')
add('numbers-age','''Cero, uno, dos. | صفر، یک، دو.
Tres, cuatro, cinco, seis. | سه، چهار، پنج، شش.
Siete, ocho, nueve, diez. | هفت، هشت، نه، ده.
Once, doce, trece, catorce. | یازده، دوازده، سیزده، چهارده.
Quince, dieciséis, diecisiete, dieciocho, diecinueve. | پانزده، شانزده، هفده، هجده، نوزده.
Veinte, veintiuno, veintidós, veinticuatro. | بیست، بیست‌ویک، بیست‌ودو، بیست‌وچهار.
Treinta, cuarenta, cincuenta, sesenta. | سی، چهل، پنجاه، شصت.
Setenta, ochenta, noventa, cien. | هفتاد، هشتاد، نود، صد.''')
add('nouns-gender-plural','''Un libro y dos libros. | یک کتاب و دو کتاب.
Una mesa y dos mesas. | یک میز و دو میز.
Es una silla. | یک صندلی است.
Son tres sillas. | سه صندلی هستند.
Un papel y dos papeles. | یک کاغذ و دو کاغذ.
Hay unos libros aquí. | اینجا چند کتاب هست.
Hay unas mesas allí. | آنجا چند میز هست.
Dos cuadernos y tres bolígrafos. | دو دفتر و سه خودکار.''')
add('articles','''Es un libro. | یک کتاب است.
El libro está aquí. | آن کتاب اینجا است.
Es una silla. | یک صندلی است.
La silla es pequeña. | آن صندلی کوچک است.
Son unos cuadernos. | چند دفتر هستند.
Los cuadernos están aquí. | آن دفترها اینجا هستند.
Hay unas sillas. | چند صندلی هست.
Los libros son nuevos. | آن کتاب‌ها نو هستند.''')
add('subject-pronouns','''Yo soy Sara. | من سارا هستم.
Tú eres Ben. | تو بن هستی.
Él es Amir. | او امیر است.
Ella es Ana. | او آنا است.
Nosotros vivimos en Madrid. | ما در مادرید زندگی می‌کنیم.
Vosotros vivís en Toledo. | شما در تولدو زندگی می‌کنید. (دوستانه، اسپانیا)
Ana y Lucía están aquí. Ellas hablan español. | آنا و لوسیا اینجا هستند. آن‌ها اسپانیایی صحبت می‌کنند.
Ben y Amir están aquí. Ellos hablan persa. | بن و امیر اینجا هستند. آن‌ها فارسی صحبت می‌کنند.''')
add('verb-to-be','''Yo soy profesor. | من معلم هستم. (مرد)
Tú eres estudiante. | تو دانشجو هستی.
Él es profesor. | او معلم است. (مرد)
Ella es española. | او اسپانیایی است. (زن)
Nosotros somos estudiantes. | ما دانشجو هستیم.
Vosotros sois profesores. | شما معلم هستید. (دوستانه، مردان یا گروه مختلط، اسپانیا)
Ellos son estudiantes. | آن‌ها دانشجو هستند. (مردان یا گروه مختلط)
Ellas son profesoras. | آن‌ها معلم هستند. (زنان)''')
add('family','''Esta es mi madre. | این مادر من است.
Este es mi padre. | این پدر من است.
Mi madre se llama Mina. | نام مادرم مینا است.
Mi padre se llama Ali. | نام پدرم علی است.
Tengo un hermano. | یک برادر دارم.
Mi hermano tiene doce años. | برادرم دوازده سال دارد.
Mi hermana es estudiante. | خواهرم دانشجو است.
Esta es mi familia. | این خانوادهٔ من است.''')
add('possessives','''Es mi cuaderno. | این دفتر من است.
Es tu silla. | این صندلی تو است.
Son mis libros. | این‌ها کتاب‌های من هستند.
¿Son tus bolígrafos? | این‌ها خودکارهای تو هستند؟
Ben tiene una bolsa. Su bolsa es azul. | بن یک کیف دارد. کیف او آبی است.
Ana tiene dos libros. Sus libros son nuevos. | آنا دو کتاب دارد. کتاب‌های او نو هستند.
Esta es nuestra mesa. | این میز ما است.
Este es nuestro libro. | این کتاب ما است.''')
add('demonstratives','''Este bolígrafo es nuevo. | این خودکار نو است.
Esta silla es pequeña. | این صندلی کوچک است.
Estos libros son nuevos. | این کتاب‌ها نو هستند.
Estas mesas son grandes. | این میزها بزرگ هستند.
Ese libro es de Ben. | آن کتاب مال بن است.
Esa silla es de Ana. | آن صندلی مال آنا است.
Esos cuadernos son míos. | آن دفترها مال من هستند.
¿Qué es esto? Es una bolsa. | این چیست؟ یک کیف است.''')
add('descriptions','''El libro es nuevo. | کتاب نو است.
La mesa es nueva. | میز نو است.
Mi bolsa es pequeña. | کیف من کوچک است.
Mi habitación es tranquila. | اتاق من آرام است.
El cuaderno es pequeño. | دفتر کوچک است.
Las mesas son grandes. | میزها بزرگ هستند.
Los libros son nuevos. | کتاب‌ها نو هستند.
Las sillas son pequeñas. | صندلی‌ها کوچک هستند.''')
add('colors','''El bolígrafo es negro. | خودکار سیاه است.
El cuaderno es verde. | دفتر سبز است.
La mesa es negra. | میز سیاه است.
El libro es rojo. | کتاب قرمز است.
La habitación es blanca. | اتاق سفید است.
La bolsa es azul. | کیف آبی است.
Los libros son azules. | کتاب‌ها آبی هستند.
Las sillas son verdes. | صندلی‌ها سبز هستند.''')
add('feelings','''Estoy contento. | خوشحالم. (مرد)
Estoy contenta. | خوشحالم. (زن)
Estoy cansado. | خسته‌ام. (مرد)
Tengo hambre. | گرسنه‌ام.
¿Tienes sed? | تشنه‌ای؟
No, no tengo sed. | نه، تشنه نیستم.
Estamos cansados. | خسته‌ایم. (مردان یا گروه مختلط)
Ana está contenta. Ben tiene hambre. | آنا خوشحال است. بن گرسنه است.''')
add('simple-verbs','''Tengo un libro. | یک کتاب دارم.
Tienes un cuaderno. | تو یک دفتر داری.
Ben tiene una bolsa. | بن یک کیف دارد.
Tenemos dos libros. | ما دو کتاب داریم.
Tenéis tres bolígrafos. | شما سه خودکار دارید. (دوستانه، اسپانیا)
Tienen dos cuadernos. | آن‌ها دو دفتر دارند.
Ben lleva una bolsa. | بن یک کیف حمل می‌کند.
Busco una silla. | دنبال یک صندلی می‌گردم.''')
add('verb-conjugation','''Hablo persa. | فارسی صحبت می‌کنم.
Hablas español. | تو اسپانیایی صحبت می‌کنی.
Ana habla español. | آنا اسپانیایی صحبت می‌کند.
Hablamos español. | ما اسپانیایی صحبت می‌کنیم.
Comemos pan. | نان می‌خوریم.
Vosotros coméis arroz. | شما برنج می‌خورید. (دوستانه، اسپانیا)
Vivimos en Madrid. | در مادرید زندگی می‌کنیم.
Vivís en Toledo. | شما در تولدو زندگی می‌کنید. (دوستانه، اسپانیا)''')
add('present-tense','''Trabajo aquí. | اینجا کار می‌کنم.
Hoy trabajas en casa. | امروز در خانه کار می‌کنی.
Ben estudia español. | بن اسپانیایی درس می‌خواند.
Estudiamos juntos. | با هم درس می‌خوانیم.
Voy al curso en autobús. | با اتوبوس به کلاس می‌روم.
Vas al curso por la mañana. | صبح به کلاس می‌روی.
Hago la compra. | خرید روزمره می‌کنم.
Vamos al curso juntos. | با هم به کلاس می‌رویم.''')
add('positive-negative-questions','''Tengo un cuaderno. | دفتر دارم.
No tengo cuaderno. | دفتر ندارم.
¿Tienes un libro? | کتاب داری؟
No, no tengo libro. | نه، کتاب ندارم.
Hoy trabajo en casa. | امروز در خانه کار می‌کنم.
Hoy no estudio. | امروز درس نمی‌خوانم.
¿Vas al curso hoy? | امروز به کلاس می‌روی؟
No, hoy estudio en casa. | نه، امروز در خانه درس می‌خوانم.''')
add('question-words','''¿Cómo te llamas? | اسم تو چیست؟
¿De dónde eres? | اهل کجا هستی؟
¿Qué necesitas? | چه لازم داری؟
¿Cuántos años tienes? | چند سال داری؟
¿Cuándo trabajas? | چه زمانی کار می‌کنی؟
¿A qué hora empieza el curso? | کلاس چه ساعتی شروع می‌شود؟
¿Cuánto cuesta este libro? | این کتاب چقدر قیمت دارد؟
¿Quién viene? Viene Lucía. | چه کسی می‌آید؟ لوسیا می‌آید.''')
add('wants-needs','''Necesito un libro. | یک کتاب لازم دارم.
Quiero agua, por favor. | آب می‌خواهم، لطفاً.
Me gusta el té. | چای دوست دارم.
¿Quieres un café? | قهوه می‌خواهی؟
No, gracias. No quiero café. | نه، ممنون. قهوه نمی‌خواهم.
¿Necesitas un bolígrafo? | خودکار لازم داری؟
Ya tengo un cuaderno. | از قبل یک دفتر دارم.
Me gusta el café, pero ahora quiero té. | قهوه دوست دارم، ولی الان چای می‌خواهم.''')
add('ability','''Puedo leer en español. | می‌توانم به اسپانیایی بخوانم.
Puedes venir a las diez. | می‌توانی ساعت ده بیایی.
Ben puede venir hoy. | بن امروز می‌تواند بیاید.
Ana no puede venir hoy. | آنا امروز نمی‌تواند بیاید.
Podemos estudiar juntos. | می‌توانیم با هم درس بخوانیم.
¿Podéis venir mañana? | می‌توانید فردا بیایید؟ (دوستانه، اسپانیا)
Pueden leer este libro. | آن‌ها می‌توانند این کتاب را بخوانند.
No puedo venir esta tarde. | امروز عصر نمی‌توانم بیایم.''')
add('dates-and-time','''Es la una. | ساعت یک است.
Son las dos. | ساعت دو است.
El curso empieza a las ocho. | کلاس ساعت هشت شروع می‌شود.
Hoy es lunes. | امروز دوشنبه است.
Hoy es dos de mayo. | امروز دوم مه است.
La cita es el uno de mayo. | قرار اول مه است.
Nos vemos el lunes a las doce. | دوشنبه ساعت دوازده همدیگر را می‌بینیم.
Es mediodía. | ظهر است.''')
add('forms-information','''¿Cuál es su apellido? | نام خانوادگی شما چیست؟
Mi apellido es García. | نام خانوادگی من گارسیا است.
¿Cuál es su dirección? | نشانی شما چیست؟
Vivo en la calle Mayor, número doce. | در خیابان مایور، پلاک دوازده زندگی می‌کنم.
¿Cuál es su fecha de nacimiento? | تاریخ تولد شما چیست؟
El dos de mayo. | دوم مه.
Nombre: Sara. Apellido: Martín. | نام: سارا. نام خانوادگی: مارتین.
Ciudad: Toledo. | شهر: تولدو.''')
add('daily-routine','''Por la mañana trabajo. | صبح کار می‌کنم.
Por la noche estudio. | شب درس می‌خوانم.
Me levanto a las seis. | ساعت شش بلند می‌شوم.
Desayuno a las seis y media. | ساعت شش‌ونیم صبحانه می‌خورم.
Después voy al curso. | بعد به کلاس می‌روم.
Como a la una. | ساعت یک غذا می‌خورم.
Por la tarde leo un libro. | عصر کتاب می‌خوانم.
Me acuesto a las diez. | ساعت ده می‌خوابم.''')
add('weekly-schedule','''Los lunes estudio español. | دوشنبه‌ها اسپانیایی درس می‌خوانم.
El lunes el curso empieza a las nueve. | دوشنبه کلاس ساعت نه شروع می‌شود.
Trabajo de ocho a doce. | از هشت تا دوازده کار می‌کنم.
El sábado estoy libre. | شنبه آزاد هستم.
Los miércoles hago la compra. | چهارشنبه‌ها خرید می‌کنم.
El jueves estudio en casa. | پنجشنبه در خانه درس می‌خوانم.
Este viernes estoy libre. | این جمعه آزاد هستم.
El curso termina a las once. | کلاس ساعت یازده تمام می‌شود.''')
add('work-study','''Trabajo en una oficina. | در یک دفتر کار می‌کنم.
Estudio español en este curso. | در این کلاس اسپانیایی درس می‌خوانم.
Tengo una pregunta. | یک سؤال دارم.
Hoy tengo que estudiar. | امروز باید درس بخوانم.
El curso termina a las doce. | کلاس ساعت دوازده تمام می‌شود.
¿A qué hora empieza la reunión? | جلسه چه ساعتی شروع می‌شود؟
La reunión empieza a las diez. | جلسه ساعت ده شروع می‌شود.
Tenemos una pausa a las once. | ساعت یازده استراحت داریم.''')
add('past-events','''Hoy trabajo en casa. | امروز در خانه کار می‌کنم.
Hoy no estudio. | امروز درس نمی‌خوانم.
Ahora estudio español. | الان اسپانیایی درس می‌خوانم.
Hoy estoy libre a las cinco. | امروز ساعت پنج آزاد هستم.
El curso empieza hoy a las diez. | کلاس امروز ساعت ده شروع می‌شود.
Hoy no voy al curso. | امروز به کلاس نمی‌روم.
Hoy tengo que hacer la compra. | امروز باید خرید کنم.
Por la noche estoy libre. | شب آزاد هستم.''')
add('instructions','''Escriba su nombre. | نامتان را بنویسید.
Lea el ejercicio dos. | تمرین دو را بخوانید.
Escuche y repita. | گوش کنید و تکرار کنید.
Cierre el libro, por favor. | لطفاً کتاب را ببندید.
Hable más despacio. | آهسته‌تر صحبت کنید.
Repita esta palabra, por favor. | لطفاً این واژه را تکرار کنید.
¿Qué ejercicio, por favor? | کدام تمرین، لطفاً؟
El ejercicio dos. | تمرین دو.''')
add('location','''El baño está aquí. | حمام اینجا است.
¿Dónde está la bolsa? | کیف کجاست؟
La bolsa está en la cocina. | کیف در آشپزخانه است.
Mi cuaderno está en la habitación. | دفتر من در اتاق است.
¿Ben está en la habitación? | بن در اتاق است؟
No, está en la cocina. | نه، در آشپزخانه است.
Las sillas están aquí. | صندلی‌ها اینجا هستند.
La cocina está allí. | آشپزخانه آنجا است.''')
add('prepositions','''El bolígrafo está al lado del libro. | خودکار کنار کتاب است.
La lámpara está encima de la mesa. | چراغ روی میز است.
El cuaderno está debajo del libro. | دفتر زیر کتاب است.
La bolsa está detrás de la silla. | کیف پشت صندلی است.
La silla está delante de la mesa. | صندلی جلوی میز است.
El cuaderno está dentro de la bolsa. | دفتر داخل کیف است.
La mesa está al lado de la puerta. | میز کنار در است.
El bolígrafo está debajo del cuaderno. | خودکار زیر دفتر است.''')
add('home-furniture','''Hay dos sillas. | دو صندلی هست.
No hay mesa en el salón. | در نشیمن میز نیست.
¿Hay una lámpara? | چراغ هست؟
Sí, hay una lámpara. | بله، چراغ هست.
La lámpara está encima de la mesa. | چراغ روی میز است.
La cama está al lado de la puerta. | تخت کنار در است.
La ventana está abierta. | پنجره باز است.
El salón es pequeño y tranquilo. | نشیمن کوچک و آرام است.''')
add('ordering-food','''Quisiera pan, por favor. | مقداری نان می‌خواهم، لطفاً.
Un té sin azúcar, por favor. | یک چای بدون شکر، لطفاً.
¿Con leche o sin leche? | با شیر یا بدون شیر؟
Sin leche, gracias. | بدون شیر، ممنون.
Quisiera un vaso de agua. | یک لیوان آب می‌خواهم.
¿La sopa es vegetariana? | سوپ گیاهی است؟
Sí, es vegetariana. | بله، گیاهی است.
El agua está fría. | آب سرد است.''')
add('cafe','''Un té, por favor. | یک چای، لطفاً.
Con leche, por favor. | با شیر، لطفاً.
Sin azúcar, gracias. | بدون شکر، ممنون.
¿Desea también agua? | آب هم میل دارید؟
Sí, una botella de agua, por favor. | بله، یک بطری آب، لطفاً.
No, gracias. | نه، ممنون.
La cuenta, por favor. | صورت‌حساب، لطفاً.
¿Pagan juntos o por separado? | با هم پرداخت می‌کنید یا جدا؟
Por separado, por favor. | جدا، لطفاً.
Juntos, por favor. | با هم، لطفاً.
Son cinco euros. | جمعاً پنج یورو می‌شود.
Aquí tiene cinco euros. | بفرمایید پنج یورو.
¿Puedo pagar aquí? | می‌توانم اینجا پرداخت کنم؟
Sí, en la caja. | بله، پای صندوق.
Gracias, adiós. | ممنون، خداحافظ.
Quiero un café sin leche. | یک قهوه بدون شیر می‌خواهم.''')
add('shopping-payment','''¿Cuánto cuesta este bolígrafo? | این خودکار چقدر قیمت دارد؟
Cuesta dos euros. | دو یورو قیمت دارد.
Me llevo este cuaderno. | این دفتر را می‌خرم.
¿Paga en efectivo o con tarjeta? | نقد پرداخت می‌کنید یا با کارت؟
Pago en efectivo. | نقد پرداخت می‌کنم.
Con tarjeta, por favor. | با کارت، لطفاً.
Aquí tiene su cuaderno. | بفرمایید دفتر شما.
Gracias. Hasta luego. | ممنون. تا بعد.''')
add('supermarket','''¿Dónde está el pan? | نان کجاست؟
El pan está allí. | نان آنجا است.
Tres manzanas, por favor. | سه سیب، لطفاً.
Una botella de agua, por favor. | یک بطری آب، لطفاً.
Quiero un kilo de manzanas. | یک کیلو سیب می‌خواهم.
¿Tienen huevos hoy? | امروز تخم‌مرغ دارید؟ (خطاب جمع)
No tenemos huevos hoy. | امروز تخم‌مرغ نداریم.
Una bolsa, por favor. | یک کیسه، لطفاً.''')
add('clothes-shopping','''Busco una chaqueta. | دنبال یک کاپشن می‌گردم.
¿Tiene esta camisa en azul? | این پیراهن را به رنگ آبی دارید؟
¿Cuál es su talla? | سایز شما چیست؟
La talla S, por favor. | سایز اسمال، لطفاً.
Esta camisa me queda pequeña. | این پیراهن برایم کوچک است.
Esta chaqueta me queda bien. | این کاپشن اندازهٔ من است.
¿Cuánto cuesta esta chaqueta? | این کاپشن چقدر قیمت دارد؟
Me llevo esta chaqueta. | این کاپشن را می‌خرم.''')
add('preferences','''Prefiero arroz. | برنج را ترجیح می‌دهم.
¿Prefieres pan o arroz? | نان را ترجیح می‌دهی یا برنج؟
No me gusta mucho el té. | چای را خیلی دوست ندارم.
¿Te gusta leer? | مطالعه را دوست داری؟
Me gustan los libros. | کتاب‌ها را دوست دارم.
Prefiero agua. | آب را ترجیح می‌دهم.
Me gusta el café, pero hoy prefiero té. | قهوه را دوست دارم، ولی امروز چای را ترجیح می‌دهم.
Hoy prefiero estudiar en casa. | امروز ترجیح می‌دهم در خانه درس بخوانم.''')
add('comparisons','''Esta habitación es más grande que mi habitación. | این اتاق از اتاق من بزرگ‌تر است.
Esta bolsa es más pequeña que esa bolsa. | این کیف از آن کیف کوچک‌تر است.
Este libro es más barato que este cuaderno. | این کتاب از این دفتر ارزان‌تر است.
¿Esta chaqueta es menos cara? | این کاپشن ارزان‌تر است؟
Sí, es menos cara que la camisa. | بله، از پیراهن ارزان‌تر است.
Mi habitación es más pequeña. | اتاق من کوچک‌تر است.
Esta mesa es más grande. | این میز بزرگ‌تر است.
Este cuaderno es más barato que el libro. | این دفتر از کتاب ارزان‌تر است.''')
add('leisure','''Me gusta escuchar música. | گوش‌دادن به موسیقی را دوست دارم.
A Ben le gusta leer. | بن مطالعه را دوست دارد.
Los fines de semana leo. | آخر هفته‌ها مطالعه می‌کنم.
¿Te gusta nadar? | شنا را دوست داری؟
Sí, me gusta nadar. | بله، شنا را دوست دارم.
Ana pasea los domingos. | آنا یکشنبه‌ها قدم می‌زند.
Sara dibuja los domingos. | سارا یکشنبه‌ها نقاشی می‌کند.
Escuchamos música juntos. | با هم موسیقی گوش می‌کنیم.''')
add('weather','''Hoy hace calor. | امروز هوا گرم است.
Hoy hace buen tiempo. | امروز هوا خوب است.
No llueve. | باران نمی‌بارد.
¿Hace calor hoy? | امروز هوا گرم است؟
No, hoy hace frío. | نه، امروز هوا سرد است.
En verano hace calor. | در تابستان هوا گرم است.
En invierno hace frío. | در زمستان هوا سرد است.
Hoy está nublado. | امروز هوا ابری است.''')
add('connectors','''Hablo español y Ben habla persa. | من اسپانیایی صحبت می‌کنم و بن فارسی صحبت می‌کند.
¿Quieres té o agua? | چای می‌خواهی یا آب؟
Me gusta leer, pero hoy no tengo tiempo. | مطالعه را دوست دارم، ولی امروز وقت ندارم.
Hace frío, pero no llueve. | هوا سرد است، ولی باران نمی‌بارد.
Tomamos té y estudiamos. | چای می‌نوشیم و درس می‌خوانیم.
Tengo hambre y sed. | گرسنه و تشنه‌ام.
Quiero venir, pero tengo que trabajar. | می‌خواهم بیایم، ولی باید کار کنم.
¿Estudias aquí o en casa? | اینجا درس می‌خوانی یا در خانه؟''')
add('future-plans','''Mañana voy a estudiar español. | فردا قرار است اسپانیایی درس بخوانم.
Esta noche voy a leer. | امشب قرار است مطالعه کنم.
El sábado voy a ver a Ben. | شنبه قرار است بن را ببینم.
¿Qué vas a hacer el domingo? | یکشنبه چه کار خواهی کرد؟
El domingo voy a estudiar en casa. | یکشنبه قرار است در خانه درس بخوانم.
Vamos a tomar un café el sábado. | شنبه قرار است قهوه بنوشیم.
Mañana voy a hacer la compra. | فردا قرار است خرید کنم.
Hoy no estoy libre, pero mañana sí. | امروز آزاد نیستم، ولی فردا بله.''')
add('invitations','''¿Estás libre esta tarde? | امروز عصر آزاد هستی؟
Sí, con mucho gusto. | بله، با کمال میل.
Lo siento, hoy no puedo. | متأسفم، امروز نمی‌توانم.
¿Te apetece un café? | قهوه میل داری؟
¿Te viene bien el domingo? | یکشنبه برایت مناسب است؟
Sí, el domingo está bien. | بله، یکشنبه خوب است.
¿Nos vemos a las quince? | ساعت پانزده همدیگر را ببینیم؟
De acuerdo, hasta el domingo. | موافقم، تا یکشنبه.''')
add('suggestions','''Podemos estudiar juntos. | می‌توانیم با هم درس بخوانیم.
Podemos ir al café hoy. | می‌توانیم امروز به کافه برویم.
¡Buena idea! | فکر خوبی است!
Hoy no estoy libre. | امروز آزاد نیستم.
Entonces estudiamos mañana. | پس، فردا درس می‌خوانیم.
Podemos quedarnos en casa. | می‌توانیم در خانه بمانیم.
¿Escuchamos música? | موسیقی گوش کنیم؟
Sí, ¿por qué no? | بله، چرا که نه؟''')
add('social-chat','''¿Dónde vives, Amir? | امیر، کجا زندگی می‌کنی؟
Vivo en Toledo. | در تولدو زندگی می‌کنم.
¿Qué te gusta hacer? | دوست داری چه کار کنی؟
Me gusta escuchar música. | گوش‌دادن به موسیقی را دوست دارم.
Amir y Ben estudian juntos. | امیر و بن با هم درس می‌خوانند.
¿Estás libre mañana a las diez? | فردا ساعت ده آزاد هستی؟
Sí, a las diez está bien. | بله، ساعت ده خوب است.
Muy bien, hasta mañana. | بسیار خوب، تا فردا.''')
add('directions','''Gire a la derecha. | به راست بپیچید.
Correos está a la izquierda. | ادارهٔ پست سمت چپ است.
¿La estación está lejos? | ایستگاه دور است؟
No, está cerca. | نه، نزدیک است.
El banco está al lado de Correos. | بانک کنار ادارهٔ پست است.
¿Cómo llego a la estación? | چطور به ایستگاه برسم؟
Primero siga recto, después gire a la derecha. | اول مستقیم بروید، بعد به راست بپیچید.
Gracias por su ayuda. | بابت کمکتان ممنون.''')
add('metro-directions','''¿Dónde está la entrada del metro? | ورودی مترو کجاست؟
La entrada está junto a la biblioteca. | ورودی کنار کتابخانه است.
¿Está junto al banco? | کنار بانک است؟
No, no está junto al banco. | نه، کنار بانک نیست.
Siga recto hasta la plaza. | تا میدان مستقیم بروید.
Gire a la izquierda en el semáforo. | در چراغ راهنمایی به چپ بپیچید.
La estación de metro está cerca. | ایستگاه مترو نزدیک است.
¿La entrada está a la derecha? | ورودی سمت راست است؟
Sí, está a la derecha de la plaza. | بله، سمت راست میدان است.
¿Está lejos el metro? | مترو دور است؟
No, está a cinco minutos. | نه، پنج دقیقه فاصله دارد.
Estoy delante de la biblioteca. | جلوی کتابخانه هستم.
El semáforo está al lado del banco. | چراغ راهنمایی کنار بانک است.
Voy al metro a las diez. | ساعت ده به مترو می‌روم.
Gracias, ahora lo entiendo. | ممنون، الان می‌فهمم.
De nada. Hasta luego. | خواهش می‌کنم. تا بعد.''')
add('public-transport','''¿Dónde está la parada de autobús? | ایستگاه اتوبوس کجاست؟
La parada está allí. | ایستگاه آنجا است.
Voy al curso en autobús. | با اتوبوس به کلاس می‌روم.
¿A qué hora sale el autobús? | اتوبوس چه ساعتی حرکت می‌کند؟
Sale a las ocho. | ساعت هشت حرکت می‌کند.
Bajo aquí. | اینجا پیاده می‌شوم.
¿Vas en autobús? | با اتوبوس می‌روی؟
No, voy en taxi. | نه، با تاکسی می‌روم.''')
add('travel-tickets','''Un billete de ida y vuelta, por favor. | یک بلیت رفت‌وبرگشت، لطفاً.
¿Cuánto cuesta el billete? | بلیت چقدر قیمت دارد؟
El billete cuesta diez euros. | بلیت ده یورو قیمت دارد.
¿De qué andén sale el tren? | قطار از کدام سکو حرکت می‌کند؟
Del andén cuatro. | از سکوی چهار.
¿Este tren va a Sevilla? | این قطار به سویا می‌رود؟
Sí, sale a las once. | بله، ساعت یازده حرکت می‌کند.
Un billete de ida a Madrid, por favor. | یک بلیت یک‌طرفه به مادرید، لطفاً.''')
add('hotel-stay','''¿A qué hora es el desayuno? | صبحانه چه ساعتی است؟
De siete a diez. | از هفت تا ده.
¿Dónde está mi habitación? | اتاق من کجاست؟
Su habitación está aquí. | اتاق شما اینجا است.
¿Cuál es el número de la habitación? | شمارهٔ اتاق چیست؟
La habitación doce. | اتاق دوازده.
¿Está incluido el desayuno? | صبحانه در قیمت حساب شده است؟
Sí, está incluido. | بله، در قیمت حساب شده است.''')
add('polite-requests','''¿Podría hablar más despacio? | می‌شود آهسته‌تر صحبت کنید؟
¿Puedo hacer una pregunta? | می‌توانم یک سؤال بپرسم؟
Sí, claro. Pregunte. | بله، حتماً. بپرسید.
¿Puede repetir esta palabra? | می‌توانید این واژه را تکرار کنید؟
¿Puede escribir su nombre? | می‌توانید نامتان را بنویسید؟
¿Puedo abrir la ventana? | می‌توانم پنجره را باز کنم؟
Sí, puede abrirla. | بله، می‌توانید آن را باز کنید.
Muchas gracias por su ayuda. | بابت کمکتان بسیار ممنون.''')
add('phone-messages','''Hola, soy Ben Martín. | سلام، من بن مارتین هستم.
¿Puedo dejar un mensaje? | می‌توانم پیامی بگذارم؟
Sí, ¿cómo se llama? | بله، نام شما چیست؟
Me llamo Sara. | اسم من سارا است.
Llámeme mañana, por favor. | لطفاً فردا با من تماس بگیرید.
¿Puedes llamarme a las diecisiete? | می‌توانی ساعت هفده با من تماس بگیری؟
Voy a llamar a las diez. | قرار است ساعت ده تماس بگیرم.
Gracias, adiós. | ممنون، خداحافظ.''')
add('doctor-symptoms','''Tengo fiebre. | تب دارم.
Me duele la garganta. | گلودرد دارم.
Necesito una cita. | نوبت لازم دارم.
Desde esta mañana. | از امروز صبح.
¿Tiene una cita libre hoy? | امروز نوبت خالی دارید؟
Sí, a las diez. | بله، ساعت ده.
No me encuentro bien. | حالم خوب نیست.
Ayúdeme, por favor. | لطفاً به من کمک کنید.''')
add('reasons','''¿Por qué te quedas aquí? | چرا اینجا می‌مانی؟
Tengo fiebre. | تب دارم.
Me quedo en casa porque llueve. | در خانه می‌مانم، چون باران می‌بارد.
No puedo venir. Tengo que trabajar. | نمی‌توانم بیایم. باید کار کنم.
Bebo agua porque tengo sed. | آب می‌نوشم، چون تشنه‌ام.
Llueve, por eso nos quedamos aquí. | باران می‌بارد، به همین دلیل اینجا می‌مانیم.
Mañana estoy libre. ¿Nos vemos mañana? | فردا آزاد هستم. فردا همدیگر را ببینیم؟
Sí, mañana está bien. | بله، فردا خوب است.''')
add('connected-conversation','''Me llamo Sara y vivo en Madrid. | اسم من سارا است و در مادرید زندگی می‌کنم.
Hoy no puedo porque tengo que trabajar. | امروز نمی‌توانم، چون باید کار کنم.
El domingo estoy libre. ¿Te viene bien? | یکشنبه آزاد هستم. برایت مناسب است؟
Sí, el domingo a las quince. ¡Hasta el domingo! | بله، یکشنبه ساعت پانزده. تا یکشنبه!''')
