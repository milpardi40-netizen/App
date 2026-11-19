import {
  exchangeView,
  matchExchangeReply,
  replyPhrases,
  takeTurn,
  type Exchange,
  type ExchangePath,
} from './russianExchange';

export type VoicePhase = 'paused' | 'preparing' | 'listening' | 'speaking' | 'done';
export interface VoiceState {
  phase: VoicePhase;
  heard?: string;
  note?: string;
}
export interface TurnAudio {
  listen(signal: AbortSignal, hints: string[], onLive: (partial: string) => void): Promise<string>;
  say(text: string, signal: AbortSignal): Promise<void>;
}
export function requireActive(signal: AbortSignal) {
  if (signal.aborted) throw new Error('cancelled');
}
/** Strict half-duplex. `listen` resolves AFTER mic end, `say` AFTER audible completion.
 * No UI render, guessed duration, interim result or button press clocks the conversation. */
export async function runVoiceExchange(
  scene: Exchange,
  start: ExchangePath,
  replayPartner: boolean,
  audio: TurnAudio,
  signal: AbortSignal,
  publish: (path: ExchangePath) => void,
  state: (v: VoiceState) => void,
  onRepair?: (heard: string, example: string) => void,
) {
  let path = start;
  let view = exchangeView(scene, path);
  if (!view || view.complete) return;
  requireActive(signal);
  async function say(text: string, note?: string, heard?: string) {
    requireActive(signal);
    state({ phase: 'speaking', note, heard });
    await audio.say(text, signal);
    requireActive(signal);
  }
  const last = view.history[view.history.length - 1];
  if (replayPartner && last?.who === 'partner') await say(last.line.text);
  let misses = 0;
  while (view && !view.complete) {
    const note = misses ? 'این بار یک نمونهٔ همین نوبت را بگو.' : undefined;
    state({ phase: 'preparing', note });
    const hints = view.options.flatMap((m) => replyPhrases(m.say)).map((s) => s.replace(/\u0301/g, ''));
    const heard = (
      await audio.listen(signal, hints, (partial) => {
        if (!signal.aborted) state({ phase: 'listening', heard: partial, note });
      })
    ).trim();
    requireActive(signal);
    const i = heard.length <= 350 ? matchExchangeReply(heard, view.options) : -1;
    if (i < 0) {
      if (view.options[0]) onRepair?.(heard, view.options[0].say.text);
      if (++misses > 1) {
        state({
          phase: 'paused',
          heard,
          note: 'منظورت روشن نشد. گفت‌وگو جلو نرفت؛ نمونه را بشنو و دوباره همین نوبت را بگو.',
        });
        return;
      }
      await say(view.options[0].say.text, 'نمونهٔ همین نوبت را دوباره بشنو و پاسخ بده.', heard);
      continue;
    }
    misses = 0;
    const choice = view.options[i];
    path = takeTurn(path, i, heard);
    publish(path); // Save accepted words even if playback is interrupted or the app is closed.
    if (choice.reply) await say(choice.reply.text);
    view = exchangeView(scene, path);
  }
  requireActive(signal);
  state({ phase: 'done' });
}
