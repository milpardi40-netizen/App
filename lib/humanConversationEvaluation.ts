import type { DirectMessage } from './conversations';

type Locale = 'en' | 'ru';

export type ConversationError = {
  title: string;
  detail: string;
  correction?: string;
};

export type HumanConversationEvaluation = {
  overall: number;
  fluency: number;
  vocabulary: number;
  interaction: number;
  clarity: number;
  messagesAnalyzed: number;
  wordsSpoken: number;
  strengths: string[];
  errors: ConversationError[];
  nextPractice: string;
};

const wordsOf = (text: string) => text.trim().split(/\s+/).filter(Boolean);
const normalize = (text: string) => text.toLowerCase().replace(/[.,!?;:()[\]{}"'،؟]/g, '').trim();

function scorePart(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/** Local, explainable end-of-session feedback. It never changes or rewrites lesson content. */
export function evaluateHumanConversation(messages: DirectMessage[], myId: string | null, locale: Locale): HumanConversationEvaluation {
  const mine = messages.filter(message => message.senderId === myId);
  const textMine = mine.filter(message => message.type === 'text' && !!message.body?.trim());
  const partnerText = messages.filter(message => message.senderId !== myId && message.type === 'text' && !!message.body?.trim());
  const allWords = textMine.flatMap(message => wordsOf(message.body || ''));
  const normalizedWords = allWords.map(normalize).filter(Boolean);
  const uniqueWords = new Set(normalizedWords);
  const averageWords = textMine.length ? allWords.length / textMine.length : 0;
  const repeatedWords = [...uniqueWords].filter(word => normalizedWords.filter(item => item === word).length >= 3);
  const shortMessages = textMine.filter(message => wordsOf(message.body || '').length < 3);
  const responseRate = partnerText.length ? Math.min(1, textMine.length / partnerText.length) : textMine.length ? 0.8 : 0;
  const localeMismatch = textMine.filter(message => locale === 'en' ? /[А-Яа-яЁё]/.test(message.body || '') : /[A-Za-z]/.test(message.body || '')).length;

  const fluency = scorePart(textMine.length ? 45 + Math.min(35, textMine.length * 7) + Math.min(20, averageWords * 2) : 0);
  const vocabulary = scorePart(uniqueWords.size ? 45 + Math.min(45, uniqueWords.size * 3) - Math.min(20, repeatedWords.length * 4) : 0);
  const interaction = scorePart(responseRate * 70 + Math.min(30, textMine.length * 5));
  const clarity = scorePart(averageWords ? 55 + Math.min(35, averageWords * 3) - Math.min(20, shortMessages.length * 5) : 0);
  const overall = scorePart(fluency * 0.28 + vocabulary * 0.24 + interaction * 0.24 + clarity * 0.24);

  const errors: ConversationError[] = [];
  if (shortMessages.length >= 2) errors.push({ title: 'پاسخ‌ها کوتاه بودند', detail: `${shortMessages.length} پاسخ با کمتر از سه واژه ثبت شد.`, correction: 'برای کامل‌تر شدن مکالمه، یک دلیل یا جزئیات کوتاه اضافه کن.' });
  if (repeatedWords.length) errors.push({ title: 'تکرار واژگان', detail: `واژه‌های پرتکرار: ${repeatedWords.slice(0, 4).join('، ')}`, correction: 'برای طبیعی‌تر شدن مکالمه از هم‌معنی‌ها و عبارت‌های متنوع‌تر استفاده کن.' });
  if (localeMismatch) errors.push({ title: 'ترکیب زبان‌ها', detail: `${localeMismatch} پیام شامل واژه‌هایی از زبان دیگر بود.`, correction: locale === 'en' ? 'در پاسخ بعدی جمله را کامل به انگلیسی نگه دار.' : 'В следующем ответе постарайся говорить полностью по-русски.' });
  if (!textMine.length) errors.push({ title: 'پاسخ متنی قابل تحلیل نبود', detail: 'برای تحلیل دقیق‌تر حداقل یک پیام متنی لازم است.', correction: 'در مکالمهٔ بعدی چند پاسخ کوتاه و کامل ارسال کن.' });

  const strengths: string[] = [];
  if (textMine.length >= 4) strengths.push('مکالمه را فعالانه ادامه دادی.');
  if (averageWords >= 6) strengths.push('پاسخ‌ها جزئیات کافی داشتند.');
  if (uniqueWords.size >= 12) strengths.push('از دامنهٔ واژگان متنوعی استفاده کردی.');
  if (!strengths.length) strengths.push('تلاش کردی مکالمه را شروع و حفظ کنی.');

  return {
    overall,
    fluency,
    vocabulary,
    interaction,
    clarity,
    messagesAnalyzed: textMine.length,
    wordsSpoken: allWords.length,
    strengths,
    errors,
    nextPractice: overall < 60 ? 'در تمرین بعدی روی پاسخ‌های کامل‌تر و حداقل یک دلیل تمرکز کن.' : overall < 80 ? 'در تمرین بعدی از واژه‌های متنوع‌تر و پاسخ‌های طولانی‌تر استفاده کن.' : 'در تمرین بعدی از عبارت‌های پیشرفته‌تر برای توضیح نظر خود استفاده کن.',
  };
}
