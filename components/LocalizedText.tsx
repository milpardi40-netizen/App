import React, { forwardRef, useContext, useState } from 'react';
import { Platform, StyleSheet, Text as NativeText, TextInput as NativeTextInput, type TextProps, type TextInputProps, type TextStyle } from 'react-native';
import { Typography } from '@/lib/theme';
import { DisplayTypographyContext, TextScaleContext, type DisplayFontPreset, type DisplayTypographyState } from '@/components/FitScrollView';

// Persian and Arabic letters share the app's existing Persian presentation.
// Unicode letters also cover accented Latin, Cyrillic and IPA, not just ASCII.
const letter = /\p{L}/u;
const arabicScript = /\p{Script=Arabic}/u;
const mark = /\p{M}/u;
const asciiDigit = /^[0-9]$/;
const latinPunctuation = /^[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E\u2010-\u2015\u2018-\u201F\u2026]$/;

type Script = 'persian' | 'left-to-right';
export function textScript(value: string): Script | undefined {
  let other = false;
  for (const cluster of clusters(value)) {
    if (isEmojiPresentation(cluster)) continue;
    const character = Array.from(cluster)[0];
    if (!letter.test(character)) continue;
    if (arabicScript.test(character)) return 'persian';
    other = true;
  }
  return other ? 'left-to-right' : undefined;
}

function childrenText(children: React.ReactNode): string {
  let text = '';
  React.Children.forEach(children, child => {
    if (typeof child === 'string' || typeof child === 'number') text += String(child);
    else if (React.isValidElement<{ children?: React.ReactNode }>(child)) text += childrenText(child.props.children);
  });
  return text;
}

const isWeb = Platform?.OS === 'web';
const DEFAULT_DISPLAY: DisplayTypographyState = { fontPreset: 'app', scale: 1 };

// Persian copy renders in Beiruti Bold everywhere by default: the regular cut
// is too thin on Android and reads as faint/blurry.
const persianApp: TextStyle = { fontFamily: 'Beiruti-Bold', fontWeight: '400', textAlign: 'right', writingDirection: 'rtl' };
const persianModern: TextStyle = { fontFamily: 'Vazirmatn-Bold', fontWeight: '400', textAlign: 'right', writingDirection: 'rtl' };
const persianSystem: TextStyle = { ...(isWeb ? { fontFamily: 'system-ui, -apple-system, sans-serif' } : {}), fontWeight: '400', textAlign: 'right', writingDirection: 'rtl' };

const persianDigitsApp: TextStyle = { fontFamily: 'Beiruti-Bold', fontWeight: '400' };
const persianDigitsModern: TextStyle = { fontFamily: 'Vazirmatn-Bold', fontWeight: '400' };
const persianDigitsSystem: TextStyle = isWeb ? { fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '400' } : { fontWeight: '400' };

const latinApp: TextStyle = { fontFamily: Typography.latinFontFamily, fontWeight: '700' };
const latinModern: TextStyle = isWeb
  ? { fontFamily: "'Inter', system-ui, sans-serif", fontWeight: '600' }
  : { fontFamily: 'Inter-SemiBold', fontWeight: '400' };
const latinSystem: TextStyle = isWeb
  ? { fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '700' }
  : { fontWeight: '700' };

const leftToRightApp: TextStyle = { ...latinApp, textAlign: 'left', writingDirection: 'ltr' };
const leftToRightModern: TextStyle = { ...latinModern, textAlign: 'left', writingDirection: 'ltr' };
const leftToRightSystem: TextStyle = { ...latinSystem, textAlign: 'left', writingDirection: 'ltr' };

const TIMES_FAMILY = /times/i;

function fontsForPreset(preset: DisplayFontPreset) {
  if (preset === 'modern') {
    return { persian: persianModern, persianDigits: persianDigitsModern, latin: latinModern, leftToRight: leftToRightModern };
  }
  if (preset === 'system') {
    return { persian: persianSystem, persianDigits: persianDigitsSystem, latin: latinSystem, leftToRight: leftToRightSystem };
  }
  return { persian: persianApp, persianDigits: persianDigitsApp, latin: latinApp, leftToRight: leftToRightApp };
}

// ---- reading colour: dark/medium text becomes pure black; light text on
// coloured or dark surfaces is left alone so it stays legible.
const BLACK = '#000000';
// Five-language app: Persian copy in grey instead of pure black.
const PERSIAN_BLACK = '#4B5563';
/** Persian translations that mirror a course-language sentence: lighter grey. */
export const PERSIAN_TRANSLATION_COLOR = '#8A929E';
// Mid greys (e.g. #94a3b8) read as faded on white, so only genuinely light
// colours on coloured/dark surfaces are preserved.
const LIGHT_THRESHOLD = 0.72;
const colorCache = new Map<string, string>();
function parseColor(value: string): { r: number; g: number; b: number; a: number } | null {
  const hex = value.trim().match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    const n = parseInt(h, 16);
    const a = h.length === 8 ? (n & 255) / 255 : 1;
    const rgb = h.length === 8 ? n >>> 8 : n;
    return { r: (rgb >> 16) & 255, g: (rgb >> 8) & 255, b: rgb & 255, a };
  }
  const fn = value.trim().match(/^rgba?\(([^)]+)\)$/i);
  if (fn) {
    const parts = fn[1].split(',').map(part => parseFloat(part));
    if (parts.length < 3 || parts.some(Number.isNaN)) return null;
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  }
  return null;
}
export function readingColor(color: unknown): string | undefined {
  if (color === undefined || color === null) return BLACK;
  if (typeof color !== 'string') return undefined; // platform colours / animated values stay as they are
  const cached = colorCache.get(color);
  if (cached) return cached;
  const lower = color.trim().toLowerCase();
  let result: string;
  if (lower === 'transparent') result = color;
  else if (lower === 'white' || lower === '#fff' || lower === '#ffffff') result = color;
  else {
    const parsed = parseColor(color);
    if (!parsed) result = BLACK;
    else if (parsed.a === 0) result = color;
    else {
      const luminance = (0.2126 * parsed.r + 0.7152 * parsed.g + 0.0722 * parsed.b) / 255;
      result = luminance >= LIGHT_THRESHOLD ? color : BLACK;
    }
  }
  colorCache.set(color, result);
  return result;
}
const GLOBAL_FONT_BUMP = 1;
const SENTENCE_FONT_BUMP = 2;
const SENTENCE_FONT_THRESHOLD = 17;

function presentationStyle(
  style: TextProps['style'],
  extra?: TextStyle,
  keepColor = false,
  textScale = 1,
  noFontBump = false,
  fontPreset: DisplayFontPreset = 'app',
  persianRef?: TextStyle,
): TextStyle | undefined {
  const flat = StyleSheet.flatten([style, extra]) as TextStyle | undefined;
  const out: TextStyle = {};
  let color = keepColor ? flat?.color : readingColor(flat?.color);
  if (color === BLACK && extra && extra === persianRef) color = PERSIAN_BLACK;
  if (color !== undefined && color !== flat?.color) out.color = color;
  const baseSize = flat?.fontSize;
  if (typeof baseSize === 'number' && baseSize > 0) {
    const bump = noFontBump ? 0 : (baseSize >= SENTENCE_FONT_THRESHOLD ? SENTENCE_FONT_BUMP : GLOBAL_FONT_BUMP);
    const bumpedSize = baseSize + bump;
    out.fontSize = textScale !== 1
      ? Math.round(bumpedSize * textScale * 10) / 10
      : bumpedSize;
    if (typeof flat?.lineHeight === 'number' && flat.lineHeight > 0) {
      const bumpedLineHeight = bump === 0
        ? flat.lineHeight
        : Math.round(flat.lineHeight * (bumpedSize / baseSize) * 10) / 10;
      out.lineHeight = textScale !== 1
        ? Math.round(bumpedLineHeight * textScale * 10) / 10
        : bumpedLineHeight;
    }
  } else if (textScale !== 1) {
    const size = 14 + (noFontBump ? 0 : GLOBAL_FONT_BUMP);
    out.fontSize = Math.round(size * textScale * 10) / 10;
    if (flat?.lineHeight) out.lineHeight = Math.round(flat.lineHeight * textScale * 10) / 10;
  }
  if (fontPreset === 'system' && flat?.fontFamily) {
    out.fontFamily = isWeb ? 'system-ui, -apple-system, sans-serif' : undefined;
  } else if (fontPreset === 'modern' && !extra && flat?.fontFamily) {
    out.fontFamily = 'Vazirmatn-Bold';
  }
  if (fontPreset === 'app' && flat?.fontFamily && TIMES_FAMILY.test(String(flat.fontFamily)) && flat.fontWeight !== '700' && flat.fontWeight !== 'bold') {
    out.fontWeight = '700';
  }
  return Object.keys(out).length ? out : undefined;
}

// Keep combining marks with their base character. In particular a keycap such
// as 1️⃣ is an emoji, not a digit to be restyled. PUA icon glyphs are not letters.
function clusters(value: string): string[] {
  const result: string[] = [];
  for (const character of value) {
    if (mark.test(character) && result.length) result[result.length - 1] += character;
    else result.push(character);
  }
  return result;
}
function isEmojiPresentation(cluster: string): boolean {
  return cluster.includes('\u20e3') || cluster.includes('\ufe0f');
}
function isForeignCluster(cluster: string): boolean {
  if (isEmojiPresentation(cluster)) return false;
  const base = Array.from(cluster)[0];
  return asciiDigit.test(base) || (letter.test(base) && !arabicScript.test(base));
}
function hasForeignDigit(value: string): boolean {
  return clusters(value).some(cluster => asciiDigit.test(Array.from(cluster)[0]) && !isEmojiPresentation(cluster));
}
function scriptStyle(text: string, fontPreset: DisplayFontPreset): TextStyle | undefined {
  const faces = fontsForPreset(fontPreset);
  const script = textScript(text);
  if (script === 'persian') return faces.persian;
  if (script === 'left-to-right') return faces.leftToRight;
  // Standalone Western digits use the foreign face without changing alignment or direction.
  if (hasForeignDigit(text)) return faces.latin;
  // Letterless text (Persian digits, percentages, counters): Beiruti's regular
  // digits are hairline-thin on Android, so use the bold cut.
  return /[\u06F0-\u06F9\u0660-\u0669]/.test(text) ? faces.persianDigits : undefined;
}

/** Style only non-Persian runs. Do not assign a direction to inline spans: the
 * native/browser bidi algorithm remains responsible for mixed-script ordering. */
function foreignRuns(value: string, latinFace: TextStyle): React.ReactNode {
  const parts = clusters(value);
  const foreign = parts.map(isForeignCluster);
  // Adjacent punctuation, e.g. /həˈloʊ/ or C1, follows its foreign run. Spaces,
  // emoji, Persian punctuation, and private-use icon glyphs remain untouched.
  for (let i = 0; i < parts.length; i++) {
    if (latinPunctuation.test(parts[i]) && (foreign[i - 1] || foreign[i + 1])) foreign[i] = true;
  }
  for (let i = parts.length - 1; i >= 0; i--) {
    if (latinPunctuation.test(parts[i]) && (foreign[i - 1] || foreign[i + 1])) foreign[i] = true;
  }
  if (!foreign.some(Boolean)) return value;
  const runs: { text: string; foreign: boolean }[] = [];
  parts.forEach((part, index) => {
    const kind = foreign[index];
    const last = runs[runs.length - 1];
    if (last && last.foreign === kind) last.text += part;
    else runs.push({ text: part, foreign: kind });
  });
  return runs.map((run, index) => run.foreign
    ? <NativeText key={index} style={latinFace}>{run.text}</NativeText>
    : run.text);
}

// Descend only into native Text and fragments; custom children (including icon
// components) retain their identity, props, fonts, event handlers and semantics.
function styleMixedChildren(children: React.ReactNode, latinFace: TextStyle): React.ReactNode {
  return React.Children.map(children, child => {
    if (typeof child === 'string' || typeof child === 'number') return foreignRuns(String(child), latinFace);
    if (React.isValidElement<{ children?: React.ReactNode }>(child)
        && (child.type === NativeText || child.type === React.Fragment)) {
      return React.cloneElement(child, undefined, styleMixedChildren(child.props.children, latinFace));
    }
    return child;
  });
}

function readDisplayPrefs(raw: unknown): DisplayTypographyState {
  if (!raw || typeof raw !== 'object') return DEFAULT_DISPLAY;
  const obj = raw as Partial<DisplayTypographyState>;
  const fontPreset: DisplayFontPreset = obj.fontPreset === 'modern' || obj.fontPreset === 'system' ? obj.fontPreset : 'app';
  const scale = typeof obj.scale === 'number' && Number.isFinite(obj.scale) && obj.scale > 0 ? obj.scale : 1;
  return { fontPreset, scale };
}

/** Preserve the outer Text, all accessibility/interaction props and layout. */
export type LocalizedTextProps = TextProps & {
  /** Keep the style's own colour (accent text such as the lesson translation). */
  keepColor?: boolean;
  /** Opt out of the global font-size bump so tight UI rows keep their original size. */
  noFontBump?: boolean;
};
export const LocalizedText = forwardRef<NativeText, LocalizedTextProps>(function LocalizedText({ style, children, keepColor, noFontBump, ...props }, ref) {
  const content = childrenText(children);
  const rawScale = useContext(TextScaleContext);
  const textScale = typeof rawScale === 'number' && Number.isFinite(rawScale) && rawScale > 0 ? rawScale : 1;
  const displayPrefs = readDisplayPrefs(useContext(DisplayTypographyContext));
  const faces = fontsForPreset(displayPrefs.fontPreset);
  const script = scriptStyle(content, displayPrefs.fontPreset);
  const combinedScale = Math.round(textScale * displayPrefs.scale * 1000) / 1000;
  return <NativeText ref={ref} {...props} style={[style, script, presentationStyle(style, script, keepColor, combinedScale, noFontBump, displayPrefs.fontPreset, faces.persian)]}>
    {textScript(content) === 'persian' && clusters(content).some(isForeignCluster) ? styleMixedChildren(children, faces.latin) : children}
  </NativeText>;
});

/** Controlled and uncontrolled inputs update direction as the learner types.
 * Native editable controls support one font family only; mixed input therefore
 * keeps a single Persian face and RTL rather than breaking editing, selection or IME state. */
export const LocalizedTextInput = forwardRef<NativeTextInput, TextInputProps>(function LocalizedTextInput({ style, value, defaultValue, placeholder, onChangeText, ...props }, ref) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? '');
  const rawScale = useContext(TextScaleContext);
  const textScale = typeof rawScale === 'number' && Number.isFinite(rawScale) && rawScale > 0 ? rawScale : 1;
  const displayPrefs = readDisplayPrefs(useContext(DisplayTypographyContext));
  const faces = fontsForPreset(displayPrefs.fontPreset);
  const content = value ?? uncontrolled;
  const script = scriptStyle(content || placeholder || '', displayPrefs.fontPreset);
  const combinedScale = Math.round(textScale * displayPrefs.scale * 1000) / 1000;
  return <NativeTextInput ref={ref} {...props} value={value} defaultValue={defaultValue} placeholder={placeholder}
    onChangeText={text => { if (value === undefined) setUncontrolled(text); onChangeText?.(text); }}
    style={[style, script, presentationStyle(style, script, false, combinedScale, false, displayPrefs.fontPreset, faces.persian)]} />;
});
