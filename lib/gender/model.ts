/** Each comparison has an explicit referent: a speaker, an addressee, another
 * person, or a noun. Never derive a Russian ending from the final letter. */
export type Example = readonly [text: string, fa: string];
export type Contrast = { focus: string; note: string } & (
  { kind: 'pair'; masculine: Example; feminine: Example; neuter?: Example } |
  { kind: 'common'; shared: Example }
);
export const speaker = 'دربارهٔ خودم';
export const listener = 'خطاب به یک نفر';
export const person = 'دربارهٔ یک نفر';
export const noun = 'دربارهٔ اسم';
export const owner = 'دربارهٔ صاحبِ چیزی';
export const common = (text: string, fa: string, note = 'این عبارت را همه یکسان می‌گویند.'): Contrast =>
  ({kind:'common', focus:'برای همه', note, shared:[text, fa]});
export const pair = (focus: string, note: string, m: string, f: string, mFa: string, fFa = mFa, neuter?: Example): Contrast =>
  ({kind:'pair', focus, note, masculine:[m, mFa], feminine:[f, fFa], neuter});
