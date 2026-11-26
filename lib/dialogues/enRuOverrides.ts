import { RUSSIAN_PRE_A1_LESSONS } from '../languages/russianPreA1';
import type { DialogueMap } from './types';

export const EN_RU_DIALOGUE_OVERRIDES: DialogueMap = {
  'prea1-05-numbers': [
    { speaker: 'partner', role: 'partner', text: 'How many notebooks do you need today?', fa: 'امروز چند تا دفتر نیاز دارید؟' },
    { speaker: 'learner', role: 'learner', text: 'Three notebooks and two pens, please.', fa: 'سه تا دفتر و دو تا خودکار، لطفاً.' },
    { speaker: 'partner', role: 'partner', text: 'Sure. That is eight dollars in total.', fa: 'حتماً. جمعاً هشت دلار می‌شود.' },
    { speaker: 'learner', role: 'learner', text: 'Here are ten dollars. Thank you!', fa: 'بفرمایید ده دلار. ممنون!' },
  ],
  'ru-pre-01-hello': RUSSIAN_PRE_A1_LESSONS[0].dialogue,
  'ru-pre-09-numbers': [
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Ско́лько стака́нов со́ка вам принести́?', fa: 'چند لیوان آب‌میوه برایتان بیاورم؟' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Два стака́на со́ка и три карандаша́, пожа́луйста.', fa: 'دو لیوان آب‌میوه و سه مداد، لطفاً.' },
    { speaker: 'هم‌صحبت', role: 'partner', text: 'Хорошо́! Э́то бу́дет де́вять рубле́й.', fa: 'باشه! نه روبل می‌شود.' },
    { speaker: 'زبان‌آموز', role: 'learner', text: 'Во́зьмите де́сять. Спаси́бо!', fa: 'ده روبل بگیرید. ممنون!' },
  ],
  // All Russian Pre-A1 rooms use exactly their taught, authored conversations.
  ...Object.fromEntries(RUSSIAN_PRE_A1_LESSONS.map(lesson => [lesson.id, lesson.dialogue])),
};
