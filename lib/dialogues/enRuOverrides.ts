import type { DialogueMap } from './types';

export const EN_RU_DIALOGUE_OVERRIDES: DialogueMap = {
  'prea1-05-numbers': [
    { speaker: 'partner', role: 'partner', text: 'How many notebooks do you need today?', fa: 'امروز چند تا دفتر نیاز دارید؟' },
    { speaker: 'learner', role: 'learner', text: 'Three notebooks and two pens, please.', fa: 'سه تا دفتر و دو تا خودکار، لطفاً.' },
    { speaker: 'partner', role: 'partner', text: 'Sure. That is eight dollars in total.', fa: 'حتماً. جمعاً هشت دلار می‌شود.' },
    { speaker: 'learner', role: 'learner', text: 'Here are ten dollars. Thank you!', fa: 'بفرمایید ده دلار. ممنون!' },
  ],
  'ru-pre-01-hello': [
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Здра́вствуйте! Вы студе́нт?', fa: 'سلام! شما دانشجو هستید؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, здра́вствуйте! Меня́ зову́т Ами́р.', fa: 'بله، سلام! اسم من امیر است.' },
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Вы говори́те по-ру́сски?', fa: 'شما روسی صحبت می‌کنید؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Немно́го. Спаси́бо, до свида́ния!', fa: 'کمی. ممنون، خداحافظ!' },
  ],
  'ru-pre-09-numbers': [
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Ско́лько ча́шек ко́фе вам принести́?', fa: 'چند فنجان قهوه برایتان بیاورم؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Две ча́шки ко́фе и три стака́на воды́, пожа́луйста.', fa: 'دو فنجان قهوه و سه لیوان آب، لطفاً.' },
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Хорошо́! Э́то бу́дет де́вять евро.', fa: 'باشه! نه یورو می‌شود.' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Во́зьмите де́сять. Спаси́бо!', fa: 'ده یورو بگیرید. ممنون!' },
  ],
};
