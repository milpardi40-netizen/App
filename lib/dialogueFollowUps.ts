/**
 * Universal conversational moves for branching dialogues.
 *
 * Every lesson dialogue can branch even when its sentence pool has no spare question: the partner
 * interrupts with one of these natural "repair" moves (asking to repeat, checking they heard right,
 * asking for a slower pace, asking why, asking what the learner means) and the learner must react. Each move offers the learner TWO reactions;
 * the partner acknowledges each one differently before the scripted dialogue resumes.
 *
 * Nothing here is lesson-specific — the learner's own previous line is re-used (`{line}`), so the
 * existing lesson content is never modified. Texts are plain, high-frequency, level-neutral phrases.
 */

export type FollowUpLanguage = 'en' | 'ru' | 'tr' | 'de' | 'fr' | 'es' | 'ar';

export interface FollowUpOption {
  /** Learner reaction; `{line}` is replaced by the learner's previous line (without final punctuation). */
  text: string;
  fa: string;
  /** Partner's short acknowledgement before the scripted dialogue continues. */
  after: { text: string; fa: string };
}
export interface FollowUpMove {
  id: 'repeat' | 'confirm' | 'slow' | 'why' | 'mean';
  /** Partner's interruption; `{line}` as above. */
  ask: string;
  askFa: string;
  options: readonly [FollowUpOption, FollowUpOption];
}

const MOVES: Record<FollowUpLanguage, readonly FollowUpMove[]> = {
  en: [
    { id: 'repeat', ask: 'Sorry, could you say that again?', askFa: 'ببخشید، می‌شود دوباره بگویید؟', options: [
      { text: 'Of course. {line}', fa: 'حتماً. (جمله‌ات را تکرار کن)', after: { text: 'Thanks, got it.', fa: 'ممنون، متوجه شدم.' } },
      { text: 'Sure, slowly: {line}', fa: 'حتماً، آهسته: (جمله‌ات را تکرار کن)', after: { text: 'Perfect, thank you.', fa: 'عالی، ممنون.' } },
    ] },
    { id: 'confirm', ask: 'Did you say “{line}”?', askFa: 'گفتید «{line}»؟', options: [
      { text: 'Yes, exactly.', fa: 'بله، دقیقاً.', after: { text: 'Okay, great.', fa: 'باشد، عالی.' } },
      { text: 'Yes — {line}', fa: 'بله — (جمله‌ات را تکرار کن)', after: { text: 'All right, thanks.', fa: 'بسیار خب، ممنون.' } },
    ] },
    { id: 'slow', ask: 'A little slower, please.', askFa: 'لطفاً کمی آهسته‌تر.', options: [
      { text: 'Sorry. {line}', fa: 'ببخشید. (آهسته تکرار کن)', after: { text: 'Now I understand, thanks.', fa: 'حالا فهمیدم، ممنون.' } },
      { text: 'No problem: {line}', fa: 'مشکلی نیست: (آهسته تکرار کن)', after: { text: 'Great, thank you.', fa: 'عالی، ممنون.' } },
    ] },
    { id: 'why', ask: 'Really? Why?', askFa: 'جدی؟ چرا؟', options: [
      { text: 'Because it’s important to me.', fa: 'چون برایم مهم است.', after: { text: 'I see, that makes sense.', fa: 'که این‌طور، منطقی است.' } },
      { text: 'Just because!', fa: 'همین‌طوری!', after: { text: 'Ha, okay then!', fa: 'ها، باشد پس!' } },
    ] },
    { id: 'mean', ask: 'Sorry, what do you mean?', askFa: 'ببخشید، منظورتان چیست؟', options: [
      { text: 'I mean: {line}', fa: 'منظورم این است: (جمله‌ات را تکرار کن)', after: { text: 'Ah, now I understand.', fa: 'آها، حالا فهمیدم.' } },
      { text: 'Simply put: {line}', fa: 'به زبان ساده: (جمله‌ات را تکرار کن)', after: { text: 'Okay, that’s clear now.', fa: 'باشد، حالا روشن شد.' } },
    ] },
  ],
  ru: [
    { id: 'repeat', ask: 'Извини́те, повтори́те, пожа́луйста.', askFa: 'ببخشید، لطفاً تکرار کنید.', options: [
      { text: 'Коне́чно. {line}', fa: 'حتماً. (جمله‌ات را تکرار کن)', after: { text: 'Спаси́бо, по́нял.', fa: 'ممنون، فهمیدم.' } },
      { text: 'Да, ме́дленно: {line}', fa: 'بله، آهسته: (جمله‌ات را تکرار کن)', after: { text: 'Отли́чно, спаси́бо.', fa: 'عالی، ممنون.' } },
    ] },
    { id: 'confirm', ask: 'Вы сказа́ли «{line}»?', askFa: 'گفتید «{line}»؟', options: [
      { text: 'Да, то́чно.', fa: 'بله، دقیقاً.', after: { text: 'Хорошо́.', fa: 'خوب.' } },
      { text: 'Да — {line}', fa: 'بله — (جمله‌ات را تکرار کن)', after: { text: 'Поня́тно, спаси́бо.', fa: 'روشن شد، ممنون.' } },
    ] },
    { id: 'slow', ask: 'Немно́го ме́дленнее, пожа́луйста.', askFa: 'لطفاً کمی آهسته‌تر.', options: [
      { text: 'Извини́те. {line}', fa: 'ببخشید. (آهسته تکرار کن)', after: { text: 'Тепе́рь поня́тно, спаси́бо.', fa: 'حالا روشن شد، ممنون.' } },
      { text: 'Без пробле́м: {line}', fa: 'مشکلی نیست: (آهسته تکرار کن)', after: { text: 'Отли́чно, спаси́бо.', fa: 'عالی، ممنون.' } },
    ] },
    { id: 'why', ask: 'Пра́вда? Почему́?', askFa: 'جدی؟ چرا؟', options: [
      { text: 'Потому́ что э́то для меня́ ва́жно.', fa: 'چون برایم مهم است.', after: { text: 'Поня́тно, э́то логи́чно.', fa: 'روشن شد، منطقی است.' } },
      { text: 'Про́сто так!', fa: 'همین‌طوری!', after: { text: 'Ну ла́дно!', fa: 'خب باشد!' } },
    ] },
    { id: 'mean', ask: 'Извини́те, что вы име́ете в виду́?', askFa: 'ببخشید، منظورتان چیست؟', options: [
      { text: 'Я име́ю в виду́: {line}', fa: 'منظورم این است: (جمله‌ات را تکرار کن)', after: { text: 'А, тепе́рь поня́тно.', fa: 'آها، حالا فهمیدم.' } },
      { text: 'Про́ще говоря́: {line}', fa: 'به زبان ساده: (جمله‌ات را تکرار کن)', after: { text: 'Хорошо́, тепе́рь я́сно.', fa: 'باشد، حالا روشن شد.' } },
    ] },
  ],
  tr: [
    { id: 'repeat', ask: 'Pardon, tekrar eder misiniz?', askFa: 'ببخشید، تکرار می‌کنید؟', options: [
      { text: 'Tabii. {line}', fa: 'حتماً. (جمله‌ات را تکرار کن)', after: { text: 'Teşekkürler, anladım.', fa: 'ممنون، فهمیدم.' } },
      { text: 'Tabii, yavaşça: {line}', fa: 'حتماً، آهسته: (جمله‌ات را تکرار کن)', after: { text: 'Harika, teşekkür ederim.', fa: 'عالی، ممنون.' } },
    ] },
    { id: 'confirm', ask: '“{line}” mi dediniz?', askFa: 'گفتید «{line}»؟', options: [
      { text: 'Evet, aynen.', fa: 'بله، دقیقاً.', after: { text: 'Tamam, peki.', fa: 'باشد، خب.' } },
      { text: 'Evet — {line}', fa: 'بله — (جمله‌ات را تکرار کن)', after: { text: 'Anladım, teşekkürler.', fa: 'فهمیدم، ممنون.' } },
    ] },
    { id: 'slow', ask: 'Biraz daha yavaş, lütfen.', askFa: 'لطفاً کمی آهسته‌تر.', options: [
      { text: 'Pardon. {line}', fa: 'ببخشید. (آهسته تکرار کن)', after: { text: 'Şimdi anladım, teşekkürler.', fa: 'حالا فهمیدم، ممنون.' } },
      { text: 'Sorun değil: {line}', fa: 'مشکلی نیست: (آهسته تکرار کن)', after: { text: 'Harika, teşekkürler.', fa: 'عالی، ممنون.' } },
    ] },
    { id: 'why', ask: 'Gerçekten mi? Neden?', askFa: 'جدی؟ چرا؟', options: [
      { text: 'Çünkü benim için önemli.', fa: 'چون برایم مهم است.', after: { text: 'Anladım, mantıklı.', fa: 'فهمیدم، منطقی است.' } },
      { text: 'Öylesine!', fa: 'همین‌طوری!', after: { text: 'Peki, tamam!', fa: 'خب، باشد!' } },
    ] },
    { id: 'mean', ask: 'Pardon, ne demek istiyorsunuz?', askFa: 'ببخشید، منظورتان چیست؟', options: [
      { text: 'Demek istediğim: {line}', fa: 'منظورم این است: (جمله‌ات را تکرار کن)', after: { text: 'Ha, şimdi anladım.', fa: 'آها، حالا فهمیدم.' } },
      { text: 'Kısacası: {line}', fa: 'به زبان ساده: (جمله‌ات را تکرار کن)', after: { text: 'Tamam, şimdi açık.', fa: 'باشد، حالا روشن شد.' } },
    ] },
  ],
  de: [
    { id: 'repeat', ask: 'Entschuldigung, können Sie das wiederholen?', askFa: 'ببخشید، می‌توانید تکرار کنید؟', options: [
      { text: 'Natürlich. {line}', fa: 'البته. (جمله‌ات را تکرار کن)', after: { text: 'Danke, verstanden.', fa: 'ممنون، فهمیدم.' } },
      { text: 'Gern, langsam: {line}', fa: 'با کمال میل، آهسته: (جمله‌ات را تکرار کن)', after: { text: 'Perfekt, danke.', fa: 'عالی، ممنون.' } },
    ] },
    { id: 'confirm', ask: 'Haben Sie „{line}“ gesagt?', askFa: 'گفتید «{line}»؟', options: [
      { text: 'Ja, genau.', fa: 'بله، دقیقاً.', after: { text: 'Okay, gut.', fa: 'باشد، خوب.' } },
      { text: 'Ja — {line}', fa: 'بله — (جمله‌ات را تکرار کن)', after: { text: 'Alles klar, danke.', fa: 'روشن شد، ممنون.' } },
    ] },
    { id: 'slow', ask: 'Etwas langsamer, bitte.', askFa: 'لطفاً کمی آهسته‌تر.', options: [
      { text: 'Entschuldigung. {line}', fa: 'ببخشید. (آهسته تکرار کن)', after: { text: 'Jetzt verstehe ich, danke.', fa: 'حالا می‌فهمم، ممنون.' } },
      { text: 'Kein Problem: {line}', fa: 'مشکلی نیست: (آهسته تکرار کن)', after: { text: 'Super, danke.', fa: 'عالی، ممنون.' } },
    ] },
    { id: 'why', ask: 'Wirklich? Warum?', askFa: 'جدی؟ چرا؟', options: [
      { text: 'Weil es mir wichtig ist.', fa: 'چون برایم مهم است.', after: { text: 'Verstehe, das macht Sinn.', fa: 'می‌فهمم، منطقی است.' } },
      { text: 'Einfach so!', fa: 'همین‌طوری!', after: { text: 'Na gut!', fa: 'خب باشد!' } },
    ] },
    { id: 'mean', ask: 'Entschuldigung, was meinen Sie?', askFa: 'ببخشید، منظورتان چیست؟', options: [
      { text: 'Ich meine: {line}', fa: 'منظورم این است: (جمله‌ات را تکرار کن)', after: { text: 'Ah, jetzt verstehe ich.', fa: 'آها، حالا می‌فهمم.' } },
      { text: 'Einfach gesagt: {line}', fa: 'به زبان ساده: (جمله‌ات را تکرار کن)', after: { text: 'Okay, jetzt ist es klar.', fa: 'باشد، حالا روشن است.' } },
    ] },
  ],
  fr: [
    { id: 'repeat', ask: 'Pardon, vous pouvez répéter ?', askFa: 'ببخشید، می‌توانید تکرار کنید؟', options: [
      { text: 'Bien sûr. {line}', fa: 'البته. (جمله‌ات را تکرار کن)', after: { text: 'Merci, j’ai compris.', fa: 'ممنون، فهمیدم.' } },
      { text: 'Oui, lentement : {line}', fa: 'بله، آهسته: (جمله‌ات را تکرار کن)', after: { text: 'Parfait, merci.', fa: 'عالی، ممنون.' } },
    ] },
    { id: 'confirm', ask: 'Vous avez dit « {line} » ?', askFa: 'گفتید «{line}»؟', options: [
      { text: 'Oui, exactement.', fa: 'بله، دقیقاً.', after: { text: 'D’accord, très bien.', fa: 'باشد، خیلی خوب.' } },
      { text: 'Oui — {line}', fa: 'بله — (جمله‌ات را تکرار کن)', after: { text: 'Très bien, merci.', fa: 'خیلی خوب، ممنون.' } },
    ] },
    { id: 'slow', ask: 'Un peu plus lentement, s’il vous plaît.', askFa: 'لطفاً کمی آهسته‌تر.', options: [
      { text: 'Pardon. {line}', fa: 'ببخشید. (آهسته تکرار کن)', after: { text: 'Maintenant je comprends, merci.', fa: 'حالا می‌فهمم، ممنون.' } },
      { text: 'Pas de problème : {line}', fa: 'مشکلی نیست: (آهسته تکرار کن)', after: { text: 'Super, merci.', fa: 'عالی، ممنون.' } },
    ] },
    { id: 'why', ask: 'Vraiment ? Pourquoi ?', askFa: 'جدی؟ چرا؟', options: [
      { text: 'Parce que c’est important pour moi.', fa: 'چون برایم مهم است.', after: { text: 'Je vois, c’est logique.', fa: 'می‌فهمم، منطقی است.' } },
      { text: 'Comme ça !', fa: 'همین‌طوری!', after: { text: 'Bon, d’accord !', fa: 'خب، باشد!' } },
    ] },
    { id: 'mean', ask: 'Pardon, qu’est-ce que vous voulez dire ?', askFa: 'ببخشید، منظورتان چیست؟', options: [
      { text: 'Je veux dire : {line}', fa: 'منظورم این است: (جمله‌ات را تکرار کن)', after: { text: 'Ah, maintenant je comprends.', fa: 'آها، حالا می‌فهمم.' } },
      { text: 'Autrement dit : {line}', fa: 'به زبان ساده: (جمله‌ات را تکرار کن)', after: { text: 'D’accord, c’est clair maintenant.', fa: 'باشد، حالا روشن است.' } },
    ] },
  ],
  es: [
    { id: 'repeat', ask: 'Perdón, ¿puede repetir?', askFa: 'ببخشید، می‌توانید تکرار کنید؟', options: [
      { text: 'Claro. {line}', fa: 'البته. (جمله‌ات را تکرار کن)', after: { text: 'Gracias, entendido.', fa: 'ممنون، فهمیدم.' } },
      { text: 'Sí, despacio: {line}', fa: 'بله، آهسته: (جمله‌ات را تکرار کن)', after: { text: 'Perfecto, gracias.', fa: 'عالی، ممنون.' } },
    ] },
    { id: 'confirm', ask: '¿Ha dicho «{line}»?', askFa: 'گفتید «{line}»؟', options: [
      { text: 'Sí, exacto.', fa: 'بله، دقیقاً.', after: { text: 'Vale, muy bien.', fa: 'باشد، خیلی خوب.' } },
      { text: 'Sí — {line}', fa: 'بله — (جمله‌ات را تکرار کن)', after: { text: 'Entendido, gracias.', fa: 'فهمیدم، ممنون.' } },
    ] },
    { id: 'slow', ask: 'Un poco más despacio, por favor.', askFa: 'لطفاً کمی آهسته‌تر.', options: [
      { text: 'Perdón. {line}', fa: 'ببخشید. (آهسته تکرار کن)', after: { text: 'Ahora entiendo, gracias.', fa: 'حالا می‌فهمم، ممنون.' } },
      { text: 'Sin problema: {line}', fa: 'مشکلی نیست: (آهسته تکرار کن)', after: { text: 'Genial, gracias.', fa: 'عالی، ممنون.' } },
    ] },
    { id: 'why', ask: '¿De verdad? ¿Por qué?', askFa: 'جدی؟ چرا؟', options: [
      { text: 'Porque es importante para mí.', fa: 'چون برایم مهم است.', after: { text: 'Ya veo, tiene sentido.', fa: 'می‌فهمم، منطقی است.' } },
      { text: '¡Porque sí!', fa: 'همین‌طوری!', after: { text: '¡Bueno, vale!', fa: 'خب، باشد!' } },
    ] },
    { id: 'mean', ask: 'Perdón, ¿qué quiere decir?', askFa: 'ببخشید، منظورتان چیست؟', options: [
      { text: 'Quiero decir: {line}', fa: 'منظورم این است: (جمله‌ات را تکرار کن)', after: { text: 'Ah, ahora entiendo.', fa: 'آها، حالا می‌فهمم.' } },
      { text: 'En pocas palabras: {line}', fa: 'به زبان ساده: (جمله‌ات را تکرار کن)', after: { text: 'Vale, ahora está claro.', fa: 'باشد، حالا روشن است.' } },
    ] },
  ],
  ar: [
    { id: 'repeat', ask: 'عَفْوًا، هَلْ يُمْكِنُكَ إِعَادَةُ ذَلِكَ؟', askFa: 'ببخشید، می‌توانید دوباره بگویید؟', options: [
      { text: 'بِالتَّأْكِيدِ. {line}', fa: 'حتماً. (جمله‌ات را تکرار کن)', after: { text: 'شُكْرًا، فَهِمْتُ.', fa: 'ممنون، متوجه شدم.' } },
      { text: 'نَعَمْ، بِبُطْءٍ: {line}', fa: 'بله، آهسته: (جمله‌ات را تکرار کن)', after: { text: 'مُمْتَازٌ، شُكْرًا لَكَ.', fa: 'عالی، ممنون.' } },
    ] },
    { id: 'confirm', ask: 'هَلْ قُلْتَ «{line}»؟', askFa: 'گفتید «{line}»؟', options: [
      { text: 'نَعَمْ، بِالضَّبْطِ.', fa: 'بله، دقیقاً.', after: { text: 'حَسَنًا، جَيِّدٌ جِدًّا.', fa: 'باشد، خیلی خوب.' } },
      { text: 'نَعَمْ — {line}', fa: 'بله — (جمله‌ات را تکرار کن)', after: { text: 'تَمَامٌ، شُكْرًا.', fa: 'روشن شد، ممنون.' } },
    ] },
    { id: 'slow', ask: 'بِبُطْءٍ أَكْثَرَ مِنْ فَضْلِكَ.', askFa: 'لطفاً کمی آهسته‌تر.', options: [
      { text: 'عَفْوًا. {line}', fa: 'ببخشید. (آهسته تکرار کن)', after: { text: 'الْآنَ فَهِمْتُ، شُكْرًا.', fa: 'حالا فهمیدم، ممنون.' } },
      { text: 'لَا مُشْكِلَةَ: {line}', fa: 'مشکلی نیست: (آهسته تکرار کن)', after: { text: 'رَائِعٌ، شُكْرًا لَكَ.', fa: 'عالی، ممنون.' } },
    ] },
    { id: 'why', ask: 'حَقًّا؟ لِمَاذَا؟', askFa: 'جدی؟ چرا؟', options: [
      { text: 'لِأَنَّهُ مُهِمٌّ بِالنِّسْبَةِ لِي.', fa: 'چون برایم مهم است.', after: { text: 'فَهِمْتُ، هَذَا مَنْطِقِيٌّ.', fa: 'می‌فهمم، منطقی است.' } },
      { text: 'هَكَذَا فَقَطْ!', fa: 'همین‌طوری!', after: { text: 'حَسَنًا، اتَّفَقْنَا!', fa: 'خب، باشد!' } },
    ] },
    { id: 'mean', ask: 'عَفْوًا، مَاذَا تَعْنِي؟', askFa: 'ببخشید، منظورتان چیست؟', options: [
      { text: 'أَعْنِي: {line}', fa: 'منظورم این است: (جمله‌ات را تکرار کن)', after: { text: 'آهْ، الْآنَ فَهِمْتُ.', fa: 'آها، حالا فهمیدم.' } },
      { text: 'بِبَسَاطَةٍ: {line}', fa: 'به زبان ساده: (جمله‌ات را تکرار کن)', after: { text: 'حَسَنًا، الْأَمْرُ وَاضِحٌ الْآنَ.', fa: 'باشد، حالا روشن است.' } },
    ] },
  ],
};

export function followUpLanguageFromLocale(locale: string | undefined): FollowUpLanguage | null {
  const code = (locale ?? '').slice(0, 2).toLowerCase();
  return code in MOVES ? code as FollowUpLanguage : null;
}

export function followUpMoves(language: FollowUpLanguage): readonly FollowUpMove[] {
  return MOVES[language];
}

/** The learner's line without its final punctuation, ready to be quoted or repeated inside a move. */
export function quotable(line: string): string {
  return line.trim().replace(/[.!?。؟!…]+$/u, '').replace(/^[¿¡]+/u, '').trim();
}

/** Fill `{line}` in a move text. */
export const fillLine = (template: string, line: string) => template.replace(/\{line\}/g, quotable(line));
