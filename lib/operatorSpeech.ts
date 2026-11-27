import { speak as speakCourse, stop as stopCourse } from './courseSpeech';
import { stopRecorded } from './content/packAudio';
import { playOperatorFallback } from './content/speechFallback';
import type { CourseLanguage } from './content/readiness';

let generation = 0;
export async function stopOperatorSpeech(): Promise<void> {
  generation++;
  stopRecorded();
  await stopCourse();
}

/** Device-selected voice, normal pitch/rate; recordings only after an actual TTS failure. */
export function speakOperator(text: string, language: string, course: CourseLanguage | 'ar', onDone?: () => void): void {
  const run = ++generation;
  const current = () => run === generation;
  stopRecorded();
  let ended = false;
  let fallingBack = false;
  const done = () => { if (current() && !ended) { ended = true; onDone?.(); } };
  const failed = () => {
    if (!current() || ended || fallingBack) return;
    fallingBack = true;
    // Keep the transition guard live while an asynchronously loaded recording starts.
    void stopCourse().then(async () => {
      if (!current()) return;
      const played = await playOperatorFallback(text, 1, course === 'ar' ? undefined : course, done, current);
      if (!played) done();
    }).catch(done);
  };
  void stopCourse().then(() => {
    if (!current()) return;
    speakCourse(text, { language, rate: 1, pitch: 1, onDone: done, onStopped: failed, onError: failed });
  }).catch(failed);
}
