import type { DialogueMap } from './types';

export const TR_PRE_DIALOGUE_OVERRIDES: DialogueMap = {
  'tr-prea1-01-greetings': [
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Merhaba! Hoş geldiniz.', fa: 'سلام! خوش آمدید.' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Merhaba! Teşekkür ederim.', fa: 'سلام! متشکرم.' },
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Nasılsınız?', fa: 'حالتان چطور است؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'İyiyim, sağ olun. Görüşürüz!', fa: 'خوبم، ممنون. به امید دیدار!' },
  ],
  'tr-prea1-02-how-are-you': [
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Sen öğrenci misin?', fa: 'آیا تو دانشجو هستی؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Evet, ben öğrenciyim. O arkadaşım.', fa: 'بله، من دانشجو هستم. او دوست من است.' },
    { speaker: 'هم‌صحبت', role: 'partner', text: 'O da burada mı?', fa: 'او هم اینجا است؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Evet, biz sınıftayız.', fa: 'بله، ما در کلاس هستیم.' },
  ],
  'tr-prea1-03-basic-verbs': [
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Şimdi ne yapmak istiyorsun?', fa: 'الان چه کاری می‌خواهی انجام بدهی؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Biraz dinlenmek ve kitap okumak istiyorum.', fa: 'می‌خواهم کمی استراحت کنم و کتاب بخوانم.' },
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Sonra dışarı çıkmak ister misin?', fa: 'بعدش می‌خواهی بیرون بروی؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Evet, yürümek ve kahve içmek güzel olur.', fa: 'بله، قدم زدن و قهوه نوشیدن خوب می‌شود.' },
  ],
  'tr-prea1-04-adjectives-and-adverbs': [
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Yeni çantan hangi renk?', fa: 'کیف جدیدت چه رنگی است؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Mavi ve küçük, ama çok güzel.', fa: 'آبی و کوچک است، اما خیلی قشنگ است.' },
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Yeni evin büyük mü?', fa: 'خانهٔ جدیدت بزرگ است؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Evet, büyük, beyaz ve çok temiz.', fa: 'بله، بزرگ، سفید و خیلی تمیز است.' },
  ],
  'tr-prea1-05-numbers-zero-to-seven': [
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Masada kaç elma var?', fa: 'روی میز چند تا سیب هست؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Üç kırmızı elma ve iki su var.', fa: 'سه تا سیب قرمز و دو تا آب هست.' },
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Sana beş defter yeter mi?', fa: 'پنج تا دفتر برایت کافی است؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Altı defter ve yedi kalem alayım, lütfen.', fa: 'شش تا دفتر و هفت تا مداد بردارم، لطفاً.' },
  ],
  'tr-prea1-06-numbers-eight-to-ten-weekdays': [
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Türkçe dersi hangi günler?', fa: 'کلاس ترکی چه روزهایی است؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Pazartesi, çarşamba ve cuma günleri.', fa: 'روزهای دوشنبه، چهارشنبه و جمعه.' },
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Ders saat kaçta başlıyor?', fa: 'کلاس ساعت چند شروع می‌شود؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Saat dokuzda başlıyor, sekiz kişi var.', fa: 'ساعت نه شروع می‌شود، هشت نفر هستند.' },
  ],
  'tr-prea1-07-food-and-drink': [
    { speaker: 'فروشنده', role: 'partner', text: 'Hoş geldiniz! Ne içmek istersiniz?', fa: 'خوش آمدید! چه می‌خواهید بنوشید؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Bir çay ve bir simit, lütfen.', fa: 'یک چای و یک سیمیت، لطفاً.' },
    { speaker: 'فروشنده', role: 'partner', text: 'Başka bir şey ister misiniz? Ekmek ve peynir taze.', fa: 'چیز دیگری هم می‌خواهید؟ نان و پنیر تازه است.' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Biraz peynir ve su da alayım, teşekkürler.', fa: 'کمی پنیر و آب هم می‌گیرم، ممنون.' },
  ],
  'tr-prea1-08-family-and-relations': [
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Fotoğraftaki kim? Kardeşin mi?', fa: 'این شخص در عکس کیست؟ برادرت یا خواهرت است؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Evet, bu benim kız kardeşim. Yanında annem ve babam var.', fa: 'بله، این خواهرم است. کنارش مادرم و پدرم هستند.' },
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Erkek kardeşin de İstanbul’da mı?', fa: 'برادرت هم در استانبول است؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Evet, abim ve ailem burada yaşıyor.', fa: 'بله، برادر بزرگم و خانواده‌ام اینجا زندگی می‌کنند.' },
  ],
  'tr-prea1-09-places': [
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Şimdi nereye gidiyorsun?', fa: 'الان کجا می‌روی؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Önce bankaya, sonra eczaneye gidiyorum.', fa: 'اول به بانک، بعد به داروخانه می‌روم.' },
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Markete de gidecek misin?', fa: 'به سوپرمارکت هم می‌روی؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Evet, market ve metro eve çok yakın.', fa: 'بله، سوپرمارکت و مترو به خانه خیلی نزدیک‌اند.' },
  ],
  'tr-prea1-10-home-and-everyday-objects': [
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Anahtar nerede, gördün mü?', fa: 'کلید کجاست، دیدی‌اش؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Evet, masanın üstünde, telefonun yanında.', fa: 'بله، روی میز، کنار گوشی است.' },
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Çantan da odada mı?', fa: 'کیفت هم در اتاق است؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Evet, çantam ve kitabım sandalyede.', fa: 'بله، کیف و کتابم روی صندلی هستند.' },
  ],
  'tr-prea1-11-personal-details-and-languages': [
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Adınız ne ve nerelisiniz?', fa: 'اسمتان چیست و اهل کجا هستید؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Adım Sara, İranlıyım. Siz nerelisiniz?', fa: 'اسمم سارا است، ایرانی هستم. شما اهل کجا هستید؟' },
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Ben Türkiyeliyim. Hangi dilleri konuşuyorsunuz?', fa: 'من اهل ترکیه هستم. به چه زبان‌هایی صحبت می‌کنید؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Farsça ve biraz Türkçe konuşuyorum.', fa: 'فارسی و کمی ترکی صحبت می‌کنم.' },
  ],
  'tr-prea1-12-location-and-direction-words': [
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Affedersiniz, eczane nerede?', fa: 'ببخشید، داروخانه کجاست؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Sağda, büyük bankanın yanında.', fa: 'سمت راست، کنار بانک بزرگ است.' },
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Metro istasyonu uzak mı?', fa: 'ایستگاه مترو دور است؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Hayır, düz gidin, solda çok yakın.', fa: 'نه، مستقیم بروید، سمت چپ خیلی نزدیک است.' },
  ],
  'tr-prea1-13-calendar-and-time-words': [
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Yarın boş musun? Ne zaman buluşalım?', fa: 'فردا وقت داری؟ کی همدیگر را ببینیم؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Yarın sabah doluyum, ama akşam saat altıda boşum.', fa: 'فردا صبح پرم، ولی عصر ساعت شش آزادم.' },
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Cumartesi günü de uygun mu?', fa: 'روز شنبه هم مناسب است؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Evet, hafta sonu cumartesi öğleden sonra buluşalım.', fa: 'بله، آخر هفته شنبه بعدازظهر همدیگر را ببینیم.' },
  ],
  'tr-prea1-14-question-and-connecting-words': [
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Bu nedir ve kimin için?', fa: 'این چیست و برای کیست؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Bu bir kitap, arkadaşım için aldım.', fa: 'این یک کتاب است، برای دوستم خریدم.' },
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Neden çay içmiyorsun? Sıcak mı?', fa: 'چرا چای نمی‌نوشی؟ داغ است؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Evet, çok sıcak ama teşekkür ederim!', fa: 'بله، خیلی داغ است ولی متشکرم!' },
  ],
  'tr-prea1-number-and-time-chunks': [
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Yarın sabah saat kaçta buluşuyoruz?', fa: 'فردا صبح ساعت چند قرار داریم؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Saat dokuzda okulun önünde buluşuyoruz.', fa: 'ساعت نه جلوی مدرسه همدیگر را می‌بینیم.' },
    { speaker: 'هم‌صحبت', role: 'partner', text: 'İki çay da alalım mı?', fa: 'دو تا چای هم بگیریم؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Olur, cuma günü de saat onda ders var.', fa: 'باشد، روز جمعه هم ساعت ده کلاس داریم.' },
  ],
  'tr-b1-s-19-advice-based-on-experience': [
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Yeni eve taşınırken nelere dikkat etmem gerektiğini söylersen sevinirim.', fa: 'اگر بگویی هنگام اسباب‌کشی به چه نکاتی توجه کنم خوشحال می‌شوم.' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Benim başımdan geçenlerden yola çıkarak nakliye şirketini önceden arayıp yazılı fiyat almanı öneririm.', fa: 'با تکیه بر تجربهٔ خودم توصیه می‌کنم پیش‌تر با شرکت باربری تماس بگیری و قیمت مکتوب بگیری.' },
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Çok iyi bir nokta! Başka bir önerin var mı?', fa: 'نکتهٔ خیلی خوبی است! پیشنهاد دیگری هم داری؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Evet, kutuları oda oda etiketle; böylece yeni evde aradığını kolayca bulursun.', fa: 'بله، جعبه‌ها را اتاق‌به‌اتاق برچسب بزن تا در خانهٔ جدید هرچه می‌خواهی راحت پیدا کنی.' },
  ],
};
