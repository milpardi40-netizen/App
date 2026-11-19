import { ExpoSpeechRecognitionModule as mic } from 'expo-speech-recognition';
import { playRussianSpeech, stopRussianSpeech } from './russianSpeech';
import { narrationRate } from './narration';
import { requireActive, type TurnAudio } from './languages/russianVoiceExchange';

// One recognizer per device. A cancelled turn also drains its native `end` before
// another turn may attach listeners: no delayed result can answer the next question.
let micReleased: Promise<void> = Promise.resolve();
function message(code: string) {
  switch (code) {
    case 'not-allowed':
      return 'دسترسی میکروفون یا تشخیص گفتار داده نشد. از تنظیمات دستگاه اجازه بده، یا بدون میکروفون ادامه بده.';
    case 'no-speech':
    case 'speech-timeout':
    case 'nomatch':
      return 'صدای روشنی نشنیدم. نزدیک میکروفون صحبت کن و همین نوبت را دوباره امتحان کن.';
    case 'network':
      return 'سرویس گفتار دستگاه به شبکه دسترسی ندارد. دوباره تلاش کن یا پاسخ را بنویس.';
    case 'language-not-supported':
    case 'service-not-allowed':
      return 'تشخیص گفتار روسی در این دستگاه یا مرورگر در دسترس نیست. می‌توانی بدون میکروفون ادامه بدهی.';
    case 'audio-capture':
    case 'busy':
      return 'میکروفون در دسترس نیست؛ برنامه‌ای را که از آن استفاده می‌کند ببند و دوباره تلاش کن.';
    default:
      return 'تشخیص گفتار متوقف شد. می‌توانی از همین نوبت ادامه بدهی.';
  }
}
const audioError = () => new Error('صدای روسی پخش نشد. میکروفون باز نشد؛ دوباره پخش کن یا با متن ادامه بده.');
export const russianTurnAudio: TurnAudio = {
  async say(text, signal) {
    await micReleased;
    requireActive(signal);
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (error?: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        signal.removeEventListener('abort', cancel);
        error ? reject(error) : resolve();
      };
      const cancel = () => {
        void stopRussianSpeech().catch(() => {});
        finish(new Error('cancelled'));
      };
      // A broken engine may never call back. A timeout is a playback FAILURE, not permission to open the mic.
      const timer = setTimeout(
        () => {
          void stopRussianSpeech().catch(() => {});
          finish(audioError());
        },
        Math.max(18000, text.length * 190 + 7000),
      );
      signal.addEventListener('abort', cancel);
      void playRussianSpeech(
        text,
        narrationRate('ru-RU', 'listen'),
        () => finish(audioError()),
        () => finish(),
      ).catch(() => finish(audioError()));
    });
  },
  async listen(signal, hints, onLive) {
    await micReleased;
    requireActive(signal);
    if (!mic.isRecognitionAvailable()) throw new Error(message('service-not-allowed'));
    let permissions = await mic.getPermissionsAsync();
    requireActive(signal);
    if (!permissions.granted && permissions.canAskAgain) {
      permissions = await mic.requestPermissionsAsync();
      requireActive(signal);
    }
    if (!permissions.granted) throw new Error(message('not-allowed'));
    await stopRussianSpeech();
    requireActive(signal);
    let release!: () => void;
    micReleased = new Promise<void>((resolve) => {
      release = resolve;
    });
    return new Promise<string>((resolve, reject) => {
      let settled = false,
        ending = false,
        ended = false,
        final: string | undefined,
        fault: Error | undefined;
      let watchdog: ReturnType<typeof setTimeout>;
      const subscriptions: { remove(): void }[] = [];
      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(watchdog);
        signal.removeEventListener('abort', cancel);
        subscriptions.forEach((s) => s.remove());
        release();
        if (!signal.aborted && !fault && final) resolve(final);
        else reject(fault ?? new Error(message('no-speech')));
      };
      const abort = (error: Error) => {
        if (settled || ending) return;
        ending = true;
        fault = error;
        clearTimeout(watchdog);
        watchdog = setTimeout(finish, 1800); // release a dead service, but never accept its partial result
        try {
          mic.abort();
        } catch {
          finish();
        }
      };
      const cancel = () => abort(new Error('cancelled'));
      try {
        subscriptions.push(
          mic.addListener('end', () => {
            ended = true;
            clearTimeout(watchdog);
            // Some engines queue `end` just before their final result. Never promote a partial to a send.
            if (final !== undefined || fault || ending) finish();
            else watchdog = setTimeout(finish, 320);
          }),
        );
        subscriptions.push(
          mic.addListener('error', (e) => {
            if (settled || ending) return;
            fault = new Error(message(e.error));
            clearTimeout(watchdog);
            watchdog = setTimeout(() => abort(fault!), 1200);
          }),
        );
        subscriptions.push(
          mic.addListener('start', () => {
            if (!settled && !ending && !fault) onLive('');
          }),
        );
        subscriptions.push(
          mic.addListener('result', (e) => {
            if (settled || ending || fault || signal.aborted || final !== undefined) return;
            const words = e.results[0]?.transcript?.trim();
            if (!words) return;
            onLive(words);
            // One utterance per recognition session; repeated finals and interim-only end are not sends.
            if (e.isFinal) {
              final = words;
              if (ended) {
                finish();
                return;
              }
              clearTimeout(watchdog);
              watchdog = setTimeout(() => abort(new Error(message('busy'))), 4500);
            }
          }),
        );
        signal.addEventListener('abort', cancel);
        watchdog = setTimeout(() => abort(new Error(message('speech-timeout'))), 40000);
        mic.start({
          lang: 'ru-RU',
          continuous: false,
          interimResults: true,
          maxAlternatives: 1,
          contextualStrings: [...new Set(hints)],
          recordingOptions: { persist: false },
        });
      } catch {
        abort(new Error(message('service-not-allowed')));
      }
    });
  },
};
