import {english,enCues} from './english';
import {russian,ruCues} from './russian';
import type {Contrast} from './model';

type Source = {id:string; sentences:readonly {en?:string; text?:string}[]};
export function genderLesson(lang:'en'|'ru', lesson:Source): Contrast | undefined {
  const authored = (lang === 'en' ? english : russian)[lesson.id];
  if (authored) return authored;
  const lines = lesson.sentences.map(s=>(s.en ?? s.text ?? '').toLowerCase().replace(/\u0301/g,''));
  return (lang === 'en' ? enCues : ruCues).find(([cue])=>lines.some(line=>cue.test(line)))?.[1];
}
