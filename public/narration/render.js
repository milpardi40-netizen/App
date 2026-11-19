// Runs locally in a worker. No lesson text is uploaded to a speech service.
import createEngine from './engine/espeak-ng.js';
self.onmessage = async ({ data: { text, voice, speed } }) => {
  try {
    const engine = await createEngine({ arguments: ['-w', 'speech.wav', '-v', voice, '-s', String(speed), '--', text] });
    const bytes = engine.FS.readFile('speech.wav');
    self.postMessage(bytes.buffer, [bytes.buffer]);
  } catch (error) { self.postMessage({ error: String(error) }); }
};
