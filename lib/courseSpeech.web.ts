import type { SpeechOptions, Voice } from 'expo-speech';
export type { Voice };

const locales = ['en-US', 'de-DE', 'fr-FR', 'es-ES', 'ru-RU', 'tr-TR', 'fa-IR'];
const lang = (tag: string) => tag.toLowerCase().split(/[-_]/)[0];
const nativeVoices = () => window.speechSynthesis?.getVoices() ?? [];
export async function getAvailableVoicesAsync(): Promise<Voice[]> {
  const voices = nativeVoices().map(v => ({ identifier: v.voiceURI, name: v.name, language: v.lang, quality: 'Default' as Voice['quality'] }));
  // Do not wait indefinitely for voiceschanged in browsers without system voices.
  for (const locale of locales) if (!voices.some(v => lang(v.language) === lang(locale))) {
    voices.push({ identifier: `local:${locale}`, name: `eSpeak NG (${locale})`, language: locale, quality: 'Default' as Voice['quality'] });
  }
  return voices;
}

let context: AudioContext | undefined;
function unlock() {
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume().catch(() => {});
  } catch { /* playback reports unsupported browsers via onError */ }
}
// Mobile browsers require activation inside the gesture, before asynchronous synthesis.
if (typeof document !== 'undefined') {
  document.addEventListener('click', unlock, true);
  document.addEventListener('keydown', unlock, true);
}

let cancelActive: (() => void) | undefined;
export async function stop() { cancelActive?.(); }
export async function isSpeakingAsync() { return !!cancelActive; }

export function speak(text: string, options: SpeechOptions = {}) {
  cancelActive?.();
  let done = false, local = false;
  let worker: Worker | undefined, source: AudioBufferSourceNode | undefined;
  let utterance: SpeechSynthesisUtterance | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  function finish(result: 'done' | 'error' | 'stopped') {
    if (done) return;
    done = true;
    cancelActive = undefined;
    clearTimeout(timer);
    worker?.terminate();
    if (utterance && result !== 'done') window.speechSynthesis?.cancel();
    if (source) { source.onended = null; if (result !== 'done') source.stop(); source.disconnect(); }
    if (result === 'done') options.onDone?.();
    else if (result === 'stopped') options.onStopped?.();
    else options.onError?.(new Error('Speech playback unavailable'));
  }
  cancelActive = () => finish('stopped');
  const language = options.language || 'en-US';
  const useLocal = () => {
    if (done || local) return;
    local = true;
    clearTimeout(timer);
    if (utterance) window.speechSynthesis?.cancel();
    try {
      if (!context || context.state !== 'running') throw new Error('Tap to play');
      const output = context;
      const base = (process.env.EXPO_BASE_URL || '').replace(/\/$/, '');
      worker = new Worker(`${base}/narration/render.js`, { type: 'module' });
      timer = setTimeout(() => finish('error'), 30000);
      worker.onerror = () => finish('error');
      worker.onmessage = async ({ data }) => {
        worker?.terminate(); worker = undefined;
        try {
          if (!(data instanceof ArrayBuffer)) throw new Error('Synthesis failed');
          const audio = await output.decodeAudioData(data);
          if (done) return;
          clearTimeout(timer);
          source = output.createBufferSource(); source.buffer = audio;
          source.connect(output.destination); source.onended = () => finish('done');
          source.start(); options.onStart?.();
        } catch { finish('error'); }
      };
      const code = lang(language);
      worker.postMessage({ text, voice: code === 'en' ? 'en-us' : code, speed: Math.round(175 * (options.rate || 1)) });
    } catch { finish('error'); }
  };
  try {
    const voices = nativeVoices();
    const voice = voices.find(v => v.voiceURI === options.voice) || voices.find(v => v.lang === language) || voices.find(v => lang(v.lang) === lang(language));
    if (!voice) { useLocal(); return; }
    utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice; utterance.lang = language; utterance.rate = options.rate ?? 1;
    utterance.pitch = options.pitch ?? 1; utterance.volume = options.volume ?? 1;
    utterance.onstart = () => { if (!done && !local) { clearTimeout(timer); options.onStart?.(); } };
    utterance.onend = () => { if (!local) finish('done'); };
    utterance.onerror = useLocal;
    timer = setTimeout(useLocal, 3500); // A listed but unusable voice may emit no event.
    window.speechSynthesis.speak(utterance);
  } catch { useLocal(); }
}
