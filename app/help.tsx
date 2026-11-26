import { LocalizedText as Text } from '@/components/LocalizedText';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, CircleHelp, Search, X } from 'lucide-react-native';
import { FEATURES, LANGUAGE_SCOPE } from '@/lib/features';
import { LANGUAGE_REGISTRY, type LanguageId } from '@/lib/languages/registry';
import { guideSections, searchGuide, type GuideSection } from '@/lib/appGuide';
import { isPronunciationLanguage } from '@/lib/languages/pronunciationCourse';
import { Typography } from '@/lib/theme';
import { toPersianDigits as fa } from '@/lib/format';

const C = { canvas: '#F7F2E8', paper: '#FFFCF6', ink: '#26382D', muted: '#655F55', green: '#31533B', soft: '#E8EBDD', border: '#E6DDCE', terra: '#A45C40' };

export default function AppHelpScreen() {
  const router = useRouter();
  const languages = LANGUAGE_REGISTRY.filter(item => LANGUAGE_SCOPE.includes(item.id));
  const [language, setLanguage] = useState<LanguageId>(languages[0]?.id ?? 'en');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set(['start']));
  const sections = useMemo(() => {
    const result = guideSections(language, FEATURES.learnerLogin ? 'login' : FEATURES.openLearnerAccount ? 'device' : 'local');
    const tools = result.find(item => item.id === 'tools')!;
    if (isPronunciationLanguage(language)) tools.actions = [...tools.actions, { label: 'کارگاه تلفظ', href: `/learn/${language}/pronunciation` }];
    return result;
  }, [language]);
  const filtered = useMemo(() => searchGuide(sections, query), [sections, query]);
  const searching = query.trim().length > 0;
  const allOpen = filtered.length > 0 && filtered.every(item => expanded.has(item.id));
  const go = (href: string) => router.push(href as never);
  const toggle = (id: string) => setExpanded(previous => {
    const next = new Set(previous);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const toggleAll = () => setExpanded(previous => {
    const next = new Set(previous);
    filtered.forEach(item => { if (allOpen) next.delete(item.id); else next.add(item.id); });
    return next;
  });

  const renderSection = (section: GuideSection) => {
    const open = searching || expanded.has(section.id);
    return (
      <View key={section.id} style={styles.section}>
        <Pressable
          accessibilityRole="button" accessibilityLabel={section.title}
          accessibilityState={{ expanded: open }} aria-expanded={open}
          accessibilityHint={searching ? 'برای بستن بخش‌ها ابتدا جست‌وجو را پاک کن' : 'برای باز یا بسته‌کردن توضیح‌ها لمس کن'}
          disabled={searching}
          onPress={() => toggle(section.id)}
          style={({ pressed }) => [styles.sectionHead, pressed && styles.pressed]}
        >
          <View style={styles.number}><Text style={styles.numberText}>{fa(sections.indexOf(section) + 1)}</Text></View>
          <View style={styles.sectionCopy}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.small}>{section.summary}</Text>
          </View>
          <ChevronDown size={18} color={C.green} style={open ? styles.chevronOpen : undefined} />
        </Pressable>
        {open ? (
          <View style={styles.sectionBody}>
            {section.steps.map((step, stepIndex) => (
              <View key={stepIndex} style={styles.step}>
                <View style={styles.dot} />
                <Text style={styles.body}>{step}</Text>
              </View>
            ))}
            {section.tip ? <View style={styles.tip}><Text style={styles.tipText}>{section.tip}</Text></View> : null}
            <View style={styles.actions}>
              {section.actions.map(action => (
                <Pressable key={action.href} accessibilityRole="button" onPress={() => go(action.href)} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
                  <Text style={styles.actionText}>{action.label}</Text><ArrowLeft size={14} color={C.green} />
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <View style={styles.topInner}>
          <Pressable accessibilityRole="button" accessibilityLabel="بازگشت از راهنما" onPress={() => router.canGoBack() ? router.back() : router.replace('/languages' as never)} style={styles.iconButton}>
            <ArrowRight size={21} color={C.green} />
          </Pressable>
          <Text accessibilityRole="header" style={styles.topTitle}>راهنمای استفاده از اپ</Text>
          <CircleHelp size={23} color={C.green} />
        </View>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <View style={styles.eyebrow}><BookOpen size={15} color={C.green} /><Text style={styles.eyebrowText}>همراه تو، از اولین درس</Text></View>
          <Text accessibilityRole="header" style={styles.heroTitle}>راحت شروع کن، با خیال راحت ادامه بده.</Text>
          <Text style={styles.intro}>این راهنما بدون اینترنت و بدون ورود به حساب خواندنی است. برای هر کار، بخش مربوط را باز کن؛ میان‌برها تو را به صفحهٔ همان ابزار می‌برند.</Text>
          <View style={styles.offline}><Check size={14} color={C.green} /><Text style={styles.small}>خواندن راهنما چیزی از پیشرفتت تغییر نمی‌دهد.</Text></View>
        </View>

        <View style={styles.quick}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>شروع سریع در ۳ قدم</Text>
          {['زبان دلخواهت را از خانه انتخاب کن.', 'سطح مناسب را پیدا کن؛ برای شروع از صفر، «پیش از A1».', 'اولین درس را باز کن، گوش بده و تمرین‌ها را تا پایان ادامه بده.'].map((step, index) => (
            <View key={step} style={styles.step}><Text style={styles.quickNumber}>{fa(index + 1)}</Text><Text style={styles.body}>{step}</Text></View>
          ))}
          <Pressable accessibilityRole="button" onPress={() => go('/languages')} style={styles.primary}><Text keepColor style={styles.primaryText}>انتخاب زبان و شروع یادگیری</Text><ArrowLeft size={16} color="#FFFFFF" /></Pressable>
        </View>

        <View style={styles.languageArea}>
          <Text style={styles.sectionTitle}>میان‌برها برای کدام زبان باشند؟</Text>
          <Text style={styles.small}>این انتخاب فقط لینک‌های راهنما را عوض می‌کند؛ زبان یا پیشرفت دوره‌ات تغییر نمی‌کند.</Text>
          <View style={styles.actions}>
            {languages.map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`راهنمای ${item.name}`} accessibilityState={{ selected: language === item.id }} aria-pressed={language === item.id} onPress={() => setLanguage(item.id)} style={[styles.language, language === item.id && styles.languageSelected]}><Text keepColor={language === item.id} style={[styles.languageText, language === item.id && styles.languageTextSelected]}>{item.name}</Text></Pressable>)}
          </View>
        </View>

        <View style={styles.searchBox}>
          <Search size={19} color={C.muted} />
          <TextInput
            value={query} onChangeText={setQuery} accessibilityLabel="جست‌وجو در راهنمای اپ"
            placeholder="دنبال چه می‌گردی؟ مثلاً صدا، مرور، یادآور…" placeholderTextColor={C.muted}
            style={styles.searchInput} autoCorrect={false} returnKeyType="search" maxLength={120}
          />
          {query ? <Pressable accessibilityRole="button" accessibilityLabel="پاک‌کردن جست‌وجو" onPress={() => setQuery('')} style={styles.clear}><X size={18} color={C.muted} /></Pressable> : null}
        </View>
        <View style={styles.resultRow}>
          <Text accessibilityLiveRegion="polite" style={styles.small}>{fa(filtered.length)} بخش{searching ? ' مرتبط' : ' راهنما'}</Text>
          {!searching && filtered.length ? <Pressable accessibilityRole="button" onPress={toggleAll} style={styles.toggleAll}><Text style={styles.actionText}>{allOpen ? 'بستن همه' : 'بازکردن همه'}</Text></Pressable> : null}
        </View>
        {filtered.length ? filtered.map(renderSection) : (
          <View style={styles.quick}>
            <Text style={styles.sectionTitle}>چیزی پیدا نشد</Text>
            <Text style={styles.body}>یک واژهٔ ساده‌تر مثل «صدا»، «میکروفون» یا «پیشرفت» بنویس، یا جست‌وجو را پاک کن تا همهٔ بخش‌ها را ببینی.</Text>
            <Pressable accessibilityRole="button" onPress={() => setQuery('')} style={styles.action}><Text style={styles.actionText}>نمایش همهٔ راهنماها</Text></Pressable>
          </View>
        )}
        <Text style={styles.footer}>امکانات هر زبان و نسخه ممکن است متفاوت باشد. این راهنما مجوزی را خودکار فعال نمی‌کند و هیچ درس یا تنظیمی را بازنشانی نمی‌کند.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.canvas },
  topBar: { borderBottomWidth: 1, borderColor: C.border, backgroundColor: C.paper },
  topInner: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: C.soft },
  topTitle: { flex: 1, fontFamily: Typography.fontFamily, fontSize: 19, color: C.ink, textAlign: 'right' },
  scroll: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 16, paddingBottom: 40, gap: 14 },
  hero: { gap: 12, paddingVertical: 12 },
  eyebrow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  eyebrowText: { fontFamily: Typography.fontFamily, fontSize: 13, color: C.green },
  heroTitle: { fontFamily: Typography.fontFamily, fontSize: 27, lineHeight: 43, color: C.ink, textAlign: 'right', writingDirection: 'rtl' },
  intro: { fontFamily: Typography.fontFamily, fontSize: 15, lineHeight: 27, color: C.muted, textAlign: 'right', writingDirection: 'rtl' },
  offline: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  quick: { backgroundColor: C.paper, padding: 16, gap: 14, borderRadius: 20, borderWidth: 1, borderColor: C.border },
  quickNumber: { width: 25, fontFamily: Typography.fontFamily, color: C.terra, fontSize: 20, textAlign: 'center' },
  primary: { minHeight: 48, padding: 12, borderRadius: 14, backgroundColor: C.green, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryText: { flexShrink: 1, fontFamily: Typography.fontFamily, fontSize: 15, color: '#FFFFFF', textAlign: 'center' },
  languageArea: { gap: 10, paddingVertical: 6 },
  actions: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  language: { minHeight: 44, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: C.border, backgroundColor: C.paper, borderRadius: 14, justifyContent: 'center' },
  languageSelected: { backgroundColor: C.green, borderColor: C.green },
  languageText: { fontFamily: Typography.fontFamily, fontSize: 14, color: C.green },
  languageTextSelected: { color: '#FFFFFF' },
  searchBox: { minHeight: 52, paddingHorizontal: 12, flexDirection: 'row-reverse', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: C.border, backgroundColor: C.paper, borderRadius: 16 },
  searchInput: { flex: 1, minWidth: 0, paddingVertical: 12, fontFamily: Typography.fontFamily, fontSize: 14, color: C.ink, textAlign: 'right', writingDirection: 'rtl' },
  clear: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  resultRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  toggleAll: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 10 },
  section: { borderRadius: 18, borderWidth: 1, borderColor: C.border, backgroundColor: C.paper, overflow: 'hidden' },
  sectionHead: { flexDirection: 'row-reverse', alignItems: 'center', padding: 14, minHeight: 82, gap: 10 },
  number: { width: 32, height: 32, borderRadius: 11, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontFamily: Typography.fontFamily, fontSize: 16, color: C.green },
  sectionCopy: { flex: 1, minWidth: 0, gap: 4 },
  sectionTitle: { fontFamily: Typography.fontFamily, fontSize: 17, lineHeight: 27, color: C.ink, textAlign: 'right', writingDirection: 'rtl' },
  small: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 22, color: C.muted, textAlign: 'right', writingDirection: 'rtl' },
  chevronOpen: { transform: [{ rotate: '180deg' }] },
  sectionBody: { padding: 16, paddingTop: 0, gap: 14 },
  step: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 10 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.green, marginTop: 11 },
  body: { flex: 1, flexShrink: 1, fontFamily: Typography.fontFamily, fontSize: 14, lineHeight: 27, color: C.ink, textAlign: 'right', writingDirection: 'rtl' },
  tip: { backgroundColor: C.soft, padding: 12, borderRadius: 12 },
  tipText: { fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 25, color: C.green, textAlign: 'right', writingDirection: 'rtl' },
  action: { minHeight: 44, maxWidth: '100%', flexDirection: 'row-reverse', alignItems: 'center', gap: 7, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: C.soft },
  actionText: { flexShrink: 1, fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 22, color: C.green, textAlign: 'right' },
  footer: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 23, color: C.muted, textAlign: 'right', writingDirection: 'rtl', paddingVertical: 8 },
  pressed: { opacity: 0.65 },
});
