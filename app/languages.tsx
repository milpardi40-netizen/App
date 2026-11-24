import { LocalizedText as Text } from '@/components/LocalizedText';
import { useCallback, useEffect, useState } from 'react';
import { ImageBackground, Linking, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { createAudioPlayer } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, Globe, Headphones, LifeBuoy, LockKeyhole, MessageCircle, Play } from 'lucide-react-native';
import { MiloLanguageBrand } from '@/components/MiloLanguageBrand';
import { ProfileIcon } from '@/components/ProfileIcon';
import { ensureOpenLearnerRegistered } from '@/lib/openLearnerAccount';
import { isLearnerRegistered } from '@/lib/registrationStatus';
import { LANGUAGES, findLanguage } from '@/lib/languages/catalog';
import { FEATURES, LANGUAGE_SCOPE, RUSSIAN_ONLY_BUILD } from '@/lib/features';
import { prefetchLater } from '@/lib/afterPaint';
import { readResumeSnapshot, resumeDestination } from '@/lib/appResume';
import { getDueReviewCards } from '@/lib/courseProgress';
import { toPersianDigits } from '@/lib/format';
import OpeningOverlay from '@/components/OpeningOverlay';
import { useOpeningNavigation } from '@/lib/useOpeningNavigation';

const palette = {
  canvas: '#F7F2E8',
  paper: '#FFFCF6',
  ink: '#26382D',
  forest: '#31533B',
  sage: '#E8EBDD',
  sageLine: '#D7DECE',
  muted: '#746E63',
  terracotta: '#B86F51',
  terracottaSoft: '#F4E2D6',
  border: '#E6DDCE',
};

let welcomeVoicePlayed = false;

const languageArtwork: Record<string, number> = {
  en: require('../assets/images/language-en-watercolor.jpg'),
  ru: require('../assets/images/language-ru-watercolor.jpg'),
  tr: require('../assets/images/language-tr-watercolor.jpg'),
  de: require('../assets/images/language-de-watercolor.jpg'),
  fr: require('../assets/images/language-fr-watercolor.jpg'),
  es: require('../assets/images/language-es-watercolor.jpg'),
  ar: require('../assets/images/language-ar-watercolor.jpg'),
};

type ResumeBannerState = {
  languageName: string;
  href: string;
};

const learningSteps = [
  { icon: Headphones, title: 'گوش بده', detail: 'موقعیت واقعی' },
  { icon: MessageCircle, title: 'پاسخ بده', detail: 'جمله‌های کوتاه' },
  { icon: BookOpen, title: 'مرور کن', detail: 'هر روز کمی بیشتر' },
] as const;

export default function LanguagesHome() {
  const router = useRouter();
  const { opening, open } = useOpeningNavigation();
  const [openingSupport, setOpeningSupport] = useState(false);
  const { width } = useWindowDimensions();
  const compact = width < 680;
  const desktop = width >= 760;
  const tiny = width < 370;

  useEffect(() => { void ensureOpenLearnerRegistered(); }, []);
  useEffect(() => {
    const stops = [
      prefetchLater([() => import('@/components/routes/NewCourseHomeScreen')], 900),
      prefetchLater([() => import('@/components/RussianHome')], 2600),
      prefetchLater([() => import('@/components/TurkishHome')], 4200),
      prefetchLater([() => import('@/components/arabic/ArabicHomeScreen')], 5600),
    ];
    return () => stops.forEach(stop => stop());
  }, []);

  const [registered, setRegistered] = useState(false);
  const [resumeBanner, setResumeBanner] = useState<ResumeBannerState | null>(null);
  const [dueReviewCount, setDueReviewCount] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    void isLearnerRegistered().then(value => { if (active) setRegistered(value); });
    void readResumeSnapshot().then((snapshot) => {
      if (!active || !snapshot || !snapshot.language) {
        if (active) setResumeBanner(null);
        return;
      }
      const matched = findLanguage(snapshot.language);
      if (!matched || !LANGUAGE_SCOPE.includes(matched.id)) {
        if (active) setResumeBanner(null);
        return;
      }
      const target = resumeDestination(snapshot, Date.now(), false);
      if (!target || target === '/languages' || target.startsWith('/admin')) {
        if (active) setResumeBanner(null);
        return;
      }
      setResumeBanner({ languageName: matched.name, href: target });
    }).catch(() => {
      if (active) setResumeBanner(null);
    });
    void getDueReviewCards().then((cards) => {
      if (active) setDueReviewCount(cards.length);
    }).catch(() => {
      if (active) setDueReviewCount(0);
    });
    return () => { active = false; };
  }, []));

  useEffect(() => {
    if (Platform.OS === 'web' || welcomeVoicePlayed) return;
    welcomeVoicePlayed = true;
    let player: ReturnType<typeof createAudioPlayer> | null = null;
    let cleanup: ReturnType<typeof setTimeout> | null = null;
    const safeRemove = () => {
      const current = player;
      player = null;
      if (!current) return;
      try {
        current.pause();
      } catch {
        // ignore
      }
      try {
        current.remove();
      } catch {
        // ignore
      }
    };
    const start = setTimeout(() => {
      try {
        player = createAudioPlayer(require('../assets/audio/welcome-voice.wav'));
        player.volume = 0.9;
        const playback = player.play() as unknown;
        if (playback && typeof (playback as Promise<unknown>).catch === 'function') {
          (playback as Promise<unknown>).catch(() => undefined);
        }
        cleanup = setTimeout(safeRemove, 4000);
      } catch {
        player = null;
      }
    }, 400);
    return () => {
      clearTimeout(start);
      if (cleanup) clearTimeout(cleanup);
      safeRemove();
    };
  }, []);

  const openSupport = () => {
    if (openingSupport) return;
    setOpeningSupport(true);
    router.push('/feedback' as never);
    setOpeningSupport(false);
  };

  const openSite = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const base = (process.env.EXPO_BASE_URL || '').replace(/\/$/, '');
      const target = base.endsWith('/app') ? `${base.slice(0, -4) || ''}/` : '/';
      window.location.assign(target);
      return;
    }
    void Linking.openURL('https://milpardi40-netizen.github.io/App/');
  };

  const languages = LANGUAGES.filter(language => LANGUAGE_SCOPE.includes(language.id)
    && (language.id !== 'ru' || FEATURES.russianCourse)
    && (!RUSSIAN_ONLY_BUILD || language.id === 'ru'));

  const pinned = ['fr', 'en'];
  const ordered = [
    ...pinned.map(id => languages.find(language => language.id === id)).filter((language): language is (typeof languages)[number] => !!language),
    ...languages.filter(language => !pinned.includes(language.id)),
  ];
  const wrap = ordered.length > 2;

  const renderCard = (language: (typeof languages)[number], solo: boolean) => {
    const displayName = language.nativeName || language.name;
    const artwork = languageArtwork[language.id] ?? languageArtwork.en;
    const countLabel = language.lessonsCount > 0 ? `${toPersianDigits(language.lessonsCount)} درس` : 'به‌زودی';
    return (
      <Pressable
        key={language.id}
        accessibilityRole="button"
        accessibilityLabel={`ورود به زبان ${language.name}`}
        accessibilityHint="برای بازکردن دورهٔ این زبان انتخاب کنید"
        onPress={() => open(language.home)}
        style={({ pressed }) => [
          styles.languageCard,
          solo
            ? styles.languageCardSolo
            : wrap && (desktop ? styles.languageCardDesktop : styles.languageCardWrap),
          styles.languageCardRtl,
          language.id === 'en' ? styles.languageCardBase : styles.languageCardOther,
          pressed && styles.pressed,
        ]}
      >
        <ImageBackground
          source={artwork}
          imageStyle={styles.languageArtImage}
          style={styles.languageArt}
          resizeMode="cover"
        >
          <View style={styles.languagePhotoTint} />
        </ImageBackground>
        <View style={[styles.languageCopy, styles.languageCopyRtl]}>
          <Text numberOfLines={1} style={[styles.languageNativeName, styles.languageNativeNameRtl]}>{displayName}</Text>
          <Text numberOfLines={1} style={[styles.languageMeta, styles.languageMetaRtl]}>
            {`${language.name} · ${countLabel}`}
          </Text>
        </View>
        <View style={[styles.languageArrow, styles.languageArrowRtl]}>
          <ArrowLeft size={16} color={palette.forest} strokeWidth={2.1} />
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={['#F7F2E8', '#F4EFE3', '#FBF8F1']}
          start={{ x: 0.95, y: 0 }}
          end={{ x: 0.05, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.backgroundCloudTop} />
        <View style={styles.backgroundCloudLeft} />
        <View style={styles.backgroundCloudBottom} />
        <View style={styles.backgroundArc} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.page, compact && styles.pageCompact]}>
          <View style={[styles.header, Platform.OS === 'web' && styles.headerRtl]}>
            <View style={styles.headerActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={registered ? 'پروفایل من (ثبت‌نام شده)' : 'پروفایل من'}
                style={({ pressed }) => [styles.headerButton, styles.profileButton, registered && styles.profileButtonRegistered, pressed && styles.pressed]}
                onPress={() => router.push('/profile' as never)}
              >
                <ProfileIcon size={26} registered={registered} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="انتقادات و پیشنهادات"
                accessibilityState={{ disabled: openingSupport }}
                disabled={openingSupport}
                style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
                onPress={openSupport}
              >
                <LifeBuoy size={16} color={palette.forest} strokeWidth={1.9} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="تنظیم قفل برنامه"
                style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
                onPress={() => router.push('/app-lock' as never)}
              >
                <LockKeyhole size={16} color={palette.forest} strokeWidth={1.9} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="سایت و دانلود نسخهٔ اندروید"
                style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
                onPress={openSite}
              >
                <Globe size={16} color={palette.forest} strokeWidth={1.9} />
              </Pressable>
            </View>
            <MiloLanguageBrand />
          </View>

          <ImageBackground
            source={require('../assets/images/language-hero-journal.jpg')}
            imageStyle={styles.heroImage}
            style={[styles.hero, compact && styles.heroCompact]}
            resizeMode="cover"
          >
            <LinearGradient
              pointerEvents="none"
              colors={['rgba(247,242,232,0.98)', 'rgba(247,242,232,0.90)', 'rgba(247,242,232,0.12)']}
              start={{ x: 1, y: 0.5 }}
              end={{ x: 0, y: 0.5 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.heroCopy}>
              <Text accessibilityRole="header" style={[styles.title, tiny && styles.titleTiny]}>
                زبان را از زندگی یاد بگیر
              </Text>
              <Text style={styles.subtitle}>
                کوتاه، شنیدنی، ماندگار
              </Text>
            </View>
          </ImageBackground>

          {(resumeBanner || dueReviewCount > 0) && (
            <View style={[styles.quickActions, compact && styles.quickActionsCompact]}>
              {resumeBanner && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`ادامهٔ یادگیری ${resumeBanner.languageName}`}
                  onPress={() => open(resumeBanner.href)}
                  style={({ pressed }) => [styles.quickCard, styles.resumeCard, pressed && styles.pressed]}
                >
                  <View style={styles.quickIconPrimary}>
                    <Play size={16} color={palette.paper} fill={palette.paper} strokeWidth={2} />
                  </View>
                  <View style={styles.quickCopy}>
                    <Text numberOfLines={1} style={styles.quickTitle}>
                      {`ادامهٔ یادگیری ${resumeBanner.languageName}`}
                    </Text>
                    <Text numberOfLines={1} style={styles.quickDetail}>
                      بازگشت مستقیم به آخرین مسیر
                    </Text>
                  </View>
                  <ArrowLeft size={16} color={palette.forest} strokeWidth={2.1} />
                </Pressable>
              )}

              {dueReviewCount > 0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`مرور امروز (${toPersianDigits(dueReviewCount)} جمله آماده)`}
                  onPress={() => open('/review')}
                  style={({ pressed }) => [styles.quickCard, styles.reviewCard, pressed && styles.pressed]}
                >
                  <View style={styles.quickIconReview}>
                    <BookOpen size={16} color={palette.terracotta} strokeWidth={2} />
                  </View>
                  <View style={styles.quickCopy}>
                    <Text numberOfLines={1} style={styles.quickTitle}>
                      مرور امروز
                    </Text>
                    <Text numberOfLines={1} style={styles.quickDetail}>
                      {`${toPersianDigits(dueReviewCount)} جمله آمادهٔ مرور`}
                    </Text>
                  </View>
                  <ArrowLeft size={16} color={palette.terracotta} strokeWidth={2.1} />
                </Pressable>
              )}
            </View>
          )}

          <View style={styles.languageBlock}>
            {ordered.length === 1 && <View style={styles.languageSoloRow}>{renderCard(ordered[0], true)}</View>}
            {ordered.length > 1 && (
              <View style={[styles.languageList, wrap && styles.languageListWrap]}>
                {ordered.map(language => renderCard(language, false))}
              </View>
            )}
          </View>

          <View style={[styles.learningStrip, compact && styles.learningStripCompact]}>
            {learningSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <View key={step.title} style={styles.stepRow}>
                  <View style={[styles.stepBadge, index === 1 && styles.stepBadgeAccent]}>
                    <Icon size={14} color={index === 1 ? palette.terracotta : palette.forest} strokeWidth={2} />
                  </View>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
      <OpeningOverlay visible={opening} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.canvas, overflow: 'hidden' },
  scrollContent: { flexGrow: 1, paddingBottom: 32 },
  backgroundCloudTop: { position: 'absolute', width: 250, height: 250, borderRadius: 125, top: -132, left: -125, backgroundColor: 'rgba(185,111,81,0.045)' },
  backgroundCloudLeft: { position: 'absolute', width: 370, height: 370, borderRadius: 185, top: 260, left: -290, backgroundColor: 'rgba(90,117,82,0.045)' },
  backgroundCloudBottom: { position: 'absolute', width: 420, height: 420, borderRadius: 210, bottom: -275, right: -175, backgroundColor: 'rgba(185,111,81,0.035)' },
  backgroundArc: { position: 'absolute', width: 520, height: 520, borderRadius: 260, borderWidth: 22, borderColor: 'rgba(68,91,59,0.025)', top: 230, right: -445 },
  page: { width: '100%', maxWidth: 880, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 20, gap: 18 },
  pageCompact: { paddingHorizontal: 16, paddingTop: 12, gap: 14 },
  header: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  headerRtl: { flexDirection: 'row-reverse' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileButton: { borderColor: '#D7DECE', backgroundColor: '#F3F6EE' },
  profileButtonRegistered: { borderColor: '#EAD0C1', backgroundColor: '#FBEFE6' },
  headerButton: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.paper, borderWidth: 1, borderColor: palette.border, shadowColor: '#554C3E', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  hero: { minHeight: 184, justifyContent: 'center', padding: 20, borderRadius: 20, overflow: 'hidden', backgroundColor: '#ECE4D4', shadowColor: '#514433', shadowOpacity: 0.10, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  heroImage: { borderRadius: 20 },
  heroCompact: { minHeight: 152, padding: 16 },
  heroCopy: { width: '78%', alignSelf: Platform.OS === 'web' ? 'flex-start' : 'flex-end', alignItems: Platform.OS === 'web' ? 'flex-start' : 'flex-end', gap: 6 },
  title: { width: '100%', fontFamily: 'Beiruti', color: palette.ink, fontSize: 26, lineHeight: 40, textAlign: 'right', writingDirection: 'rtl' },
  titleTiny: { fontSize: 22, lineHeight: 34 },
  subtitle: { width: '100%', fontFamily: 'Beiruti', color: '#5B6257', fontSize: 13, lineHeight: 22, textAlign: 'right', writingDirection: 'rtl' },
  quickActions: { flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse', gap: 10 },
  quickActionsCompact: { flexDirection: 'column' },
  quickCard: { flex: 1, minHeight: 62, flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, borderWidth: 1, backgroundColor: palette.paper, shadowColor: '#514433', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  resumeCard: { borderColor: '#C8D6C3', backgroundColor: '#F3F6EE' },
  reviewCard: { borderColor: '#EAD0C1', backgroundColor: '#FDF6F1' },
  quickIconPrimary: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.forest },
  quickIconReview: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.terracottaSoft },
  quickCopy: { flex: 1, minWidth: 0, alignItems: Platform.OS === 'web' ? 'flex-start' : 'flex-end', gap: 1 },
  quickTitle: { fontFamily: 'Beiruti', fontSize: 14.5, lineHeight: 22, color: palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  quickDetail: { fontFamily: 'Beiruti', fontSize: 11.5, lineHeight: 18, color: palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  languageList: { flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse', alignItems: 'stretch', gap: 12 },
  languageListWrap: { flexWrap: 'wrap' },
  languageBlock: { gap: 10 },
  languageSoloRow: { flexDirection: 'row', justifyContent: 'center' },
  languageCardSolo: { flex: 0, flexBasis: '48%', maxWidth: '48%' },
  languageCardWrap: { flexBasis: '46%', flexGrow: 1, flexShrink: 0, maxWidth: '49%' },
  languageCardDesktop: { flexBasis: '31%', flexGrow: 1, flexShrink: 0, maxWidth: '33%' },
  languageCard: { flex: 1, minWidth: 0, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: palette.border, paddingBottom: 12, alignItems: 'center', backgroundColor: palette.paper, shadowColor: '#514433', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  languageCardRtl: { alignItems: Platform.OS === 'web' ? 'flex-start' : 'flex-end' },
  languageCardBase: { borderColor: palette.forest, backgroundColor: '#F3F6EE', shadowColor: palette.forest, shadowOpacity: 0.22, shadowRadius: 16, shadowOffset: { width: 0, height: 7 }, elevation: 5 },
  languageCardOther: { borderColor: '#D9CFBD' },
  languageCopyRtl: { alignItems: Platform.OS === 'web' ? 'flex-start' : 'flex-end', paddingHorizontal: 11 },
  languageNativeNameRtl: { alignSelf: Platform.OS === 'web' ? 'flex-start' : 'flex-end', textAlign: 'right' },
  languageMetaRtl: { alignSelf: Platform.OS === 'web' ? 'flex-start' : 'flex-end', textAlign: 'right' },
  languageArt: { width: '100%', height: 132, justifyContent: 'flex-end', backgroundColor: '#EAE2D4' },
  languageArtImage: { borderTopLeftRadius: 15, borderTopRightRadius: 15 },
  languagePhotoTint: { height: 24, width: '100%', backgroundColor: 'rgba(247,242,232,0.18)' },
  languageCopy: { width: '100%', alignItems: 'center', justifyContent: 'center', gap: 2, paddingHorizontal: 5, paddingTop: 9 },
  languageNativeName: { maxWidth: '100%', fontFamily: 'Times New Roman', color: palette.ink, fontSize: 13.5, lineHeight: 19, fontWeight: '600', textAlign: 'center', writingDirection: 'ltr' },
  languageMeta: { maxWidth: '100%', fontFamily: 'Beiruti', color: palette.muted, fontSize: 12, lineHeight: 19, textAlign: 'right', writingDirection: 'rtl' },
  languageArrow: { width: 28, height: 28, marginTop: 8, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.sage },
  languageArrowRtl: { marginHorizontal: 11 },
  learningStrip: { flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, backgroundColor: palette.paper, borderWidth: 1, borderColor: palette.border },
  learningStripCompact: { gap: 8, paddingVertical: 8, paddingHorizontal: 10 },
  stepRow: { flex: 1, flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6 },
  stepBadge: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.sage },
  stepBadgeAccent: { backgroundColor: palette.terracottaSoft },
  stepTitle: { fontFamily: 'Beiruti', color: palette.ink, fontSize: 12.5, lineHeight: 19, textAlign: 'right', writingDirection: 'rtl' },
  pressed: { opacity: 0.84, transform: [{ scale: 0.985 }] },
});
