import {common, pair, person, owner, type Contrast} from './model';
const heShe = pair(person,'برای «او» به کسی که درباره‌اش حرف می‌زنی نگاه کن.','He is my teacher.','She is my teacher.','او معلم من است.');
const name = pair(owner,'his و her به صاحبِ اسم اشاره می‌کنند. خودِ name تغییر نمی‌کند.','What is his name?','What is her name?','اسم او چیست؟');
const call = pair(person,'بعد از call، برای «او را» از him یا her استفاده کن.','Call him.','Call her.','به او زنگ بزن.');
const brother = pair(person,'در فارسی هم برای این دو نفر دو واژه داریم.','This is my brother.','This is my sister.','این برادر من است.','این خواهر من است.');
export const english: Record<string,Contrast> = {
 'prea1-01-hello':common('Hello.','سلام.'),'prea1-02-bye':common('Bye.','خداحافظ.'),'prea1-03-yes-no':common('Yes, please.','بله، لطفاً.'),
 'prea1-04-i-am':common('I am tired.','خسته‌ام.','دختر و پسر هر دو برای «خسته‌ام» همین را می‌گویند.'),'prea1-05-numbers':common('One.','یک.'),
 'prea1-06-how-are-you':common('How are you?','حالت چطور است؟'),'prea1-07-i-have':common('I have a pen.','یک خودکار دارم.'),'prea1-08-please-thankyou':common('Thank you.','ممنون.'),
 'prea1-09-this-is':common('This is my friend.','این دوست من است.','برای معرفی دوستت لازم نیست واژهٔ friend را عوض کنی.'),
 'prea1-10-review':common('How are you today?','امروز حالت چطور است؟'),'prea1-11-at-home':common('This is my house.','این خانهٔ من است.'),
 'prea1-12-people':heShe, 'prea1-13-every-day':common('I go home.','به خانه می‌روم.'),'prea1-14-i-like':common('I like tea.','چای دوست دارم.'),
 'foundation-introducing-yourself':name,'foundation-pronouns-and-be':heShe,'foundation-family-and-possessions':brother,
 'foundation-everyday-routine':pair(person,'با he و she فعل یکسان است؛ در این نمونه هر دو walks می‌گیرند.','He walks to work.','She walks to work.','او پیاده به محل کار می‌رود.'),
 'survival-job-interview':common('I am a teacher.','معلم هستم.','teacher عنوان شغل است؛ لازم نیست برای زن و مرد آن را تغییر بدهی.'),
 'survival-renting-a-home':pair(person,'فقط نسبت خانوادگی عوض می‌شود.','I can visit with my brother.','I can visit with my sister.','می‌توانم با برادرم برای بازدید بیایم.','می‌توانم با خواهرم برای بازدید بیایم.'),
 'survival-personal-information':pair(owner,'برای شمارهٔ تماس، اول روشن کن شماره مال چه کسی است.','Please write his phone number.','Please write her phone number.','لطفاً شمارهٔ تلفن او را بنویسید.'),
 'survival-appointments-and-time':pair(person,'پیش از نام خانوادگی از عنوان مناسب استفاده کن. Ms. وضعیت تأهل را مشخص نمی‌کند.','I have a meeting with Mr. Lee.','I have a meeting with Ms. Lee.','با آقای لی جلسه دارم.','با خانم لی جلسه دارم.'),
 'survival-hobbies-and-free-time':pair(person,'فعالیت همان است؛ فقط شخصی که درباره‌اش حرف می‌زنیم فرق می‌کند.','He plays tennis.','She plays tennis.','او تنیس بازی می‌کند.'),
 'survival-phone-and-messages':pair(person,'در این درخواست، him یا her شخصی است که باید با او صحبت کنند.','Please ask him to call me back.','Please ask her to call me back.','لطفاً از او بخواهید به من زنگ بزند.'),
 'survival-current-activities':pair(person,'برای هر دو نفر is و فعل با ing ثابت می‌ماند.','He is talking to the receptionist.','She is talking to the receptionist.','او دارد با مسئول پذیرش صحبت می‌کند.'),
 'survival-past-and-future-plans':pair(owner,'اگر چتر مال خود شخص باشد، هم ضمیر فاعلی و هم ملکی را درست انتخاب کن.','He left his umbrella on the bus.','She left her umbrella on the bus.','او چترش را در اتوبوس جا گذاشت.'),
};
export const enCues: [RegExp,Contrast][] = [
 [/\b(?:his|her) (?:name|number)\b/i,name], [/\b(?:call|called|calling) (?:him|her)\b/i,call], [/\b(?:brother|sister)\b/i,brother],
 [/\b(?:his|her) (?:book|pen|bag|phone|key|letter|notes|work|idea|opinion|answer|decision|report)\b/i,pair(owner,'در انگلیسی مالک تعیین می‌کند his یا her بیاید، نه جنس چیزی که به او تعلق دارد.','This is his book.','This is her book.','این کتاب اوست.')],
 [/\b(?:himself|herself)\b/i,pair(person,'اینجا فاعل و مفعول یک نفرند.','He introduced himself.','She introduced herself.','او خودش را معرفی کرد.')],
 [/\b(?:he|she) (?:said|asked|explained|suggested|argued|claimed)\b/i,pair(person,'در نقل گفته، فعل گذشته برای هر دو نفر یک شکل دارد.','He said so.','She said so.','او این‌طور گفت.')],
 [/\b(?:mother|father)\b/i,pair(person,'گوینده عوض نمی‌شود؛ نسبتِ شخص معرفی‌شده فرق می‌کند.','This is my father.','This is my mother.','این پدر من است.','این مادر من است.')],
 [/\b(?:he|she) (?:is|was|can|has|will|does)\b/i,pair(person,'در انگلیسی ضمیر تغییر می‌کند، نه شکل فعل بین این دو نفر.','He is here.','She is here.','او اینجاست.')],
];
