/** Labels describe one *specific* feature of the original sentence, not the
 * learner's identity. Don't classify an entire Russian sentence by its suffix. */
export function sentenceGender(language: 'ru'|'en', text: string): string | undefined {
  const t = text.toLowerCase().replace(/\u0301/g,'');
  if (language === 'en') {
    if (/^he\b/.test(t)) return 'مذکر · دربارهٔ او (he)';
    if (/^she\b/.test(t)) return 'مؤنث · دربارهٔ او (she)';
    if (/^his (?:name|room|book|phone|bag|mother|father|work)\b/.test(t)) return 'مذکر · صاحبِ آن (his)';
    if (/^her (?:name|room|book|phone|bag|mother|father|work)\b/.test(t)) return 'مؤنث · صاحبِ آن (her)';
    if (/^i (?:am|have|like|want|need)\b/.test(t)) return 'مشترک · «I» برای هر گوینده';
  } else {
    if (/^он(?=[ ,.!?])/.test(t)) return 'مذکر · مرجعِ «он»';
    if (/^она(?=[ ,.!?])/.test(t)) return 'مؤنث · مرجعِ «она»';
    const match = t.match(/(?:^|[ ,.!?])я (?:не |почти |немного )?(устал[а]?|готов[а]?|согласен|согласна|рад[а]?|свободен|свободна|был[а]?|потерял[а]?|искал[а]?|расслышал[а]?|записал[а]?|читал[а]?|нашёл|нашла)(?=[ ,.!?]|$)/u);
    if (match) return match[1].endsWith('а') ? 'مؤنث · گوینده' : 'مذکر · گوینده';
    if (/ты готова|ты свободна/u.test(t)) return 'مؤنث · مخاطب';
    if (/ты (?:готов|свободен)(?=[ ,.!?]|$)/u.test(t)) return 'مذکر · مخاطب';
  }
}
