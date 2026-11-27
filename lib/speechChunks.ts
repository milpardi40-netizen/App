/** Respect the device's per-utterance character limit without dropping any of the requested text.
 * This is not a lesson/word/time limit: every chunk is spoken, in order, to completion.
 */
export function splitSpeechText(text: string, maxLength: number): string[] {
  const limit = Math.max(2, Math.floor(maxLength));
  if (!Number.isFinite(limit)) return [text];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(text.length, start + limit);
    if (end < text.length) {
      // Prefer a sentence/word boundary; retain the whitespace in the preceding chunk.
      const candidate = text.slice(start, end);
      const boundaries = [...candidate.matchAll(/[.!?؟؛،,;:\s]+/gu)];
      const last = boundaries.at(-1);
      if (last && last.index! + last[0].length >= limit / 2) end = start + last.index! + last[0].length;
      // Never split a UTF-16 surrogate pair (for example an emoji).
      if (/[\uD800-\uDBFF]/.test(text[end - 1]) && /[\uDC00-\uDFFF]/.test(text[end])) end--;
    }
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks.length ? chunks : [''];
}
