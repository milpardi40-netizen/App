import { LocalizedText as Text, LocalizedTextInput as TextInput } from '@/components/LocalizedText';
import { FitScrollView } from '@/components/FitScrollView';
import LessonConversationRoom from '@/components/LessonConversationRoom';
import LevelFreeConversationRoom from '@/components/LevelFreeConversationRoom';
import { PageNavigation } from '@/components/PageNavigation';
import { LearningHomeColors as HomeColors } from '@/components/LearningHomeStyles';
import type { BranchingLocale } from '@/lib/branchingConversation';
import { toPersianDigits } from '@/lib/format';
import type { LessonConversationSession } from '@/lib/lessonConversation';
import { Colors, Spacing, Typography } from '@/lib/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, ChevronLeft, MessageCircle, Search, Sparkles, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState, type ComponentProps } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export type ConversationRoomLevel = {
  id: number;
  cefr: string;
  title: string;
  description?: string;
  color: string;
};

export type ConversationRoomSummary = {
  id: string;
  order: number;
  levelId: number;
  title: string;
  subtitle?: string;
  situation: string;
  lineCount: number;
  usesSentenceFallback: boolean;
};

type RoomProps = ComponentProps<typeof LessonConversationRoom>;

export type ConversationRoomPayload = {
  dialogue: RoomProps['dialogue'];
  fallback: NonNullable<RoomProps['fallback']>;
  semanticPractice?: RoomProps['semanticPractice'];
};

type Props = {
  courseId: string;
  languageName: string;
  nativeName: string;
  locale: BranchingLocale;
  backFallback: string;
  accentColor: string;
  levels: readonly ConversationRoomLevel[];
  summariesForLevel: (levelId: number) => readonly ConversationRoomSummary[];
  buildPayload: (lessonId: string) => ConversationRoomPayload | null;
  onSpeak: (text: string, onDone: () => void) => void;
  onStop: () => void;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function LessonConversationHub({
  courseId,
  languageName,
  nativeName,
  locale,
  backFallback,
  accentColor,
  levels,
  summariesForLevel,
  buildPayload,
  onSpeak,
  onStop,
}: Props) {
  const router = useRouter();
  const params = useLocalSearchParams<{ language?: string; level?: string | string[]; lesson?: string | string[]; mode?: string | string[] }>();
  const levelParam = firstParam(params.level);
  const lessonParam = firstParam(params.lesson);
  const modeParam = firstParam(params.mode);
  const isLevelFreeMode = modeParam === 'level-free';

  const selectedLevel = useMemo(
    () => levels.find(item => String(item.id) === levelParam),
    [levels, levelParam],
  );

  const levelSummaries = useMemo(
    () => (selectedLevel ? summariesForLevel(selectedLevel.id) : []),
    [selectedLevel, summariesForLevel],
  );

  const levelCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const level of levels) counts[level.id] = summariesForLevel(level.id).length;
    return counts;
  }, [levels, summariesForLevel]);

  const totalConversations = useMemo(
    () => levels.reduce((sum, level) => sum + (levelCounts[level.id] ?? 0), 0),
    [levels, levelCounts],
  );

  const activeSummaryIndex = useMemo(
    () => (lessonParam ? levelSummaries.findIndex(item => item.id === lessonParam) : -1),
    [lessonParam, levelSummaries],
  );
  const activeSummary = activeSummaryIndex >= 0 ? levelSummaries[activeSummaryIndex] : undefined;

  const activePayload = useMemo(
    () => (activeSummary ? buildPayload(activeSummary.id) : null),
    [activeSummary, buildPayload],
  );

  const [query, setQuery] = useState('');
  const [sessions, setSessions] = useState<Record<string, LessonConversationSession>>({});

  useEffect(() => {
    setQuery('');
  }, [selectedLevel?.id]);

  useEffect(() => {
    onStop();
  }, [selectedLevel?.id, activeSummary?.id, isLevelFreeMode, onStop]);

  useEffect(() => () => onStop(), [onStop]);

  const filteredSummaries = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return levelSummaries;
    return levelSummaries.filter((item, idx) => {
      const num = String(idx + 1);
      const faNum = toPersianDigits(idx + 1);
      return (
        item.title.toLowerCase().includes(needle)
        || (item.subtitle ?? '').toLowerCase().includes(needle)
        || item.situation.toLowerCase().includes(needle)
        || num.includes(needle)
        || faNum.includes(needle)
      );
    });
  }, [levelSummaries, query]);

  const routeFor = useCallback(
    (levelId?: number, lessonId?: string, mode?: 'level-free') => {
      const nextParams: Record<string, string> = { language: courseId };
      if (levelId !== undefined) nextParams.level = String(levelId);
      if (lessonId) nextParams.lesson = lessonId;
      if (mode) nextParams.mode = mode;
      return { pathname: '/conversation-rooms/[language]', params: nextParams } as never;
    },
    [courseId],
  );

  const openLevel = (levelId: number) => {
    onStop();
    router.push(routeFor(levelId));
  };

  const openLevelFree = (levelId: number) => {
    onStop();
    router.push(routeFor(levelId, undefined, 'level-free'));
  };

  const openLesson = (levelId: number, lessonId: string) => {
    onStop();
    router.push(routeFor(levelId, lessonId));
  };

  const backToLevelList = () => {
    onStop();
    if (selectedLevel) router.replace(routeFor(selectedLevel.id));
    else router.replace(routeFor());
  };

  if (selectedLevel && isLevelFreeMode) {
    return (
      <View style={styles.root}>
        <View style={styles.roomTopBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`بازگشت به مکالمه‌های سطح ${selectedLevel.cefr}`}
            onPress={backToLevelList}
            style={({ pressed }) => [styles.roomBackButton, pressed && styles.pressed]}
          >
            <ArrowRight size={16} color={HomeColors.ink} />
            <Text style={styles.roomBackText}>فهرست {selectedLevel.cefr}</Text>
          </Pressable>
          <View style={styles.roomHeaderCopy}>
            <Text numberOfLines={1} style={styles.roomHeaderTitle}>گفت‌وگوی آزاد پایان سطح</Text>
            <Text style={styles.roomHeaderMeta}>
              {selectedLevel.cefr} · {languageName}
            </Text>
          </View>
          <View style={[styles.cefrBadge, { backgroundColor: `${selectedLevel.color}18`, borderColor: `${selectedLevel.color}40` }]}>
            <Text style={[styles.cefrBadgeText, { color: selectedLevel.color }]}>{selectedLevel.cefr}</Text>
          </View>
        </View>

        <FitScrollView contentContainerStyle={styles.roomScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.roomInner}>
            <LevelFreeConversationRoom
              courseId={courseId}
              languageName={languageName}
              locale={locale}
              level={selectedLevel}
              summaries={levelSummaries}
              buildPayload={buildPayload}
              onSpeak={onSpeak}
              onStop={onStop}
              onBack={backToLevelList}
            />
          </View>
        </FitScrollView>
      </View>
    );
  }

  if (selectedLevel && activeSummary && activePayload) {
    const prevSummary = activeSummaryIndex > 0 ? levelSummaries[activeSummaryIndex - 1] : undefined;
    const nextSummary = activeSummaryIndex < levelSummaries.length - 1 ? levelSummaries[activeSummaryIndex + 1] : undefined;

    return (
      <View style={styles.root}>
        <View style={styles.roomTopBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`بازگشت به مکالمه‌های سطح ${selectedLevel.cefr}`}
            onPress={backToLevelList}
            style={({ pressed }) => [styles.roomBackButton, pressed && styles.pressed]}
          >
            <ArrowRight size={16} color={HomeColors.ink} />
            <Text style={styles.roomBackText}>فهرست {selectedLevel.cefr}</Text>
          </Pressable>
          <View style={styles.roomHeaderCopy}>
            <Text numberOfLines={1} style={styles.roomHeaderTitle}>{activeSummary.title}</Text>
            <Text style={styles.roomHeaderMeta}>
              {selectedLevel.cefr} · مکالمهٔ {toPersianDigits(activeSummaryIndex + 1)} از {toPersianDigits(levelSummaries.length)}
            </Text>
          </View>
          <View style={[styles.cefrBadge, { backgroundColor: `${selectedLevel.color}18`, borderColor: `${selectedLevel.color}40` }]}>
            <Text style={[styles.cefrBadgeText, { color: selectedLevel.color }]}>{selectedLevel.cefr}</Text>
          </View>
        </View>

        <FitScrollView contentContainerStyle={styles.roomScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.roomInner}>
            <LessonConversationRoom
              key={activeSummary.id}
              courseId={courseId}
              lessonId={activeSummary.id}
              levelId={activeSummary.levelId}
              situation={activeSummary.situation}
              partnerRole="طرف مقابل"
              dialogue={activePayload.dialogue}
              fallback={activePayload.fallback}
              locale={locale}
              onSpeak={onSpeak}
              onStop={onStop}
              initialSession={sessions[activeSummary.id] ?? null}
              onSessionChange={nextSession => setSessions(prev => ({ ...prev, [activeSummary.id]: nextSession }))}
              semanticPractice={activePayload.semanticPractice}
            />

            {(prevSummary || nextSummary) ? (
              <View style={styles.roomPager}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="مکالمهٔ قبلی همین سطح"
                  disabled={!prevSummary}
                  onPress={() => prevSummary && openLesson(selectedLevel.id, prevSummary.id)}
                  style={({ pressed }) => [styles.pagerButton, !prevSummary && styles.pagerDisabled, pressed && styles.pressed]}
                >
                  <ArrowRight size={15} color={HomeColors.ink} />
                  <Text numberOfLines={1} style={styles.pagerText}>مکالمهٔ قبلی</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="مکالمهٔ بعدی همین سطح"
                  disabled={!nextSummary}
                  onPress={() => nextSummary && openLesson(selectedLevel.id, nextSummary.id)}
                  style={({ pressed }) => [styles.pagerButton, styles.pagerNext, !nextSummary && styles.pagerDisabled, pressed && styles.pressed]}
                >
                  <Text numberOfLines={1} style={[styles.pagerText, styles.pagerNextText]}>مکالمهٔ بعدی</Text>
                  <ArrowLeft size={15} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : null}
          </View>
        </FitScrollView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <View style={styles.topBar}>
            <PageNavigation backFallback={selectedLevel ? `/conversation-rooms/${courseId}` : backFallback} />
            <View style={styles.topBarTitleWrap}>
              <Text style={styles.pageTitle}>اتاق مکالمهٔ درس‌ها · {languageName}</Text>
              <Text style={styles.pageSubMeta}>{nativeName}</Text>
            </View>
          </View>

          {!selectedLevel ? (
            <>
              <View style={styles.introCard}>
                <View style={[styles.introIcon, { backgroundColor: `${accentColor}16` }]}>
                  <MessageCircle size={20} color={accentColor} />
                </View>
                <View style={styles.introCopy}>
                  <Text style={styles.introTitle}>فقط مکالمه‌های هر سطح، یک‌جا و آمادهٔ تمرین</Text>
                  <Text style={styles.introBody}>
                    سطح دلخواه را انتخاب کنید تا همهٔ {toPersianDigits(totalConversations)} مکالمهٔ درس‌های این زبان دقیقاً مطابق اتاق مکالمهٔ هر درس در اختیارتان قرار بگیرد.
                  </Text>
                </View>
              </View>

              <View style={styles.levelList}>
                {levels.map(level => {
                  const count = levelCounts[level.id] ?? 0;
                  return (
                    <Pressable
                      key={level.id}
                      accessibilityRole="button"
                      accessibilityLabel={`مکالمه‌های سطح ${level.cefr} (${toPersianDigits(count)} مکالمه)`}
                      onPress={() => openLevel(level.id)}
                      style={({ pressed }) => [styles.levelCard, pressed && styles.pressed]}
                    >
                      <View style={[styles.levelStripe, { backgroundColor: level.color }]} />
                      <View style={styles.levelBody}>
                        <View style={styles.levelHeaderRow}>
                          <View style={[styles.cefrBadge, { backgroundColor: `${level.color}18`, borderColor: `${level.color}40` }]}>
                            <Text style={[styles.cefrBadgeText, { color: level.color }]}>{level.cefr}</Text>
                          </View>
                          <View style={styles.countPill}>
                            <Text style={styles.countPillText}>{toPersianDigits(count)} مکالمه</Text>
                          </View>
                        </View>
                        <Text style={styles.levelTitle}>{level.title}</Text>
                        {!!level.description && (
                          <Text numberOfLines={2} style={styles.levelDesc}>{level.description}</Text>
                        )}
                      </View>
                      <ChevronLeft size={18} color={HomeColors.muted} />
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.levelRail}
              >
                {levels.map(level => {
                  const active = level.id === selectedLevel.id;
                  const count = levelCounts[level.id] ?? 0;
                  return (
                    <Pressable
                      key={level.id}
                      accessibilityRole="button"
                      accessibilityLabel={`سطح ${level.cefr}`}
                      onPress={() => openLevel(level.id)}
                      style={({ pressed }) => [
                        styles.levelTab,
                        active && { backgroundColor: level.color, borderColor: level.color },
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.levelTabCefr, active && styles.levelTabTextActive]}>{level.cefr}</Text>
                      <Text style={[styles.levelTabCount, active && styles.levelTabTextActive]}>
                        {toPersianDigits(count)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.selectedLevelBanner}>
                <View style={styles.selectedLevelHeader}>
                  <View style={[styles.cefrBadge, { backgroundColor: `${selectedLevel.color}18`, borderColor: `${selectedLevel.color}40` }]}>
                    <Text style={[styles.cefrBadgeText, { color: selectedLevel.color }]}>{selectedLevel.cefr}</Text>
                  </View>
                  <Text style={styles.selectedLevelCount}>
                    همهٔ {toPersianDigits(levelSummaries.length)} مکالمهٔ این سطح
                  </Text>
                </View>
                <Text style={styles.selectedLevelTitle}>{selectedLevel.title}</Text>
                {!!selectedLevel.description && (
                  <Text style={styles.selectedLevelDesc}>{selectedLevel.description}</Text>
                )}
              </View>

              {levelSummaries.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`شروع گفت‌وگوی آزاد پایان سطح ${selectedLevel.cefr}`}
                  onPress={() => openLevelFree(selectedLevel.id)}
                  style={({ pressed }) => [styles.freeLevelCard, { borderColor: `${selectedLevel.color}40` }, pressed && styles.pressed]}
                >
                  <View style={[styles.freeLevelIcon, { backgroundColor: `${selectedLevel.color}16` }]}>
                    <Sparkles size={19} color={selectedLevel.color} />
                  </View>
                  <View style={styles.freeLevelCopy}>
                    <Text style={styles.freeLevelTitle}>گفت‌وگوی آزاد پایان سطح · {selectedLevel.cefr}</Text>
                    <Text style={styles.freeLevelDesc}>
                      ۱۰ تا ۱۲ موقعیت از این سطح: فارسی را ببین و خودت به {languageName} بگو (اختیاری، بدون نمره)
                    </Text>
                  </View>
                  <ChevronLeft size={18} color={selectedLevel.color} />
                </Pressable>
              )}

              {levelSummaries.length > 8 && (
                <View style={styles.searchBox}>
                  <Search size={16} color={HomeColors.muted} />
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="جستجو در عنوان، موقعیت یا شمارهٔ درس…"
                    placeholderTextColor={HomeColors.muted}
                    style={styles.searchInput}
                    accessibilityLabel="جستجو در مکالمه‌های این سطح"
                  />
                  {!!query && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="پاک‌کردن جستجو"
                      onPress={() => setQuery('')}
                      style={styles.searchClear}
                    >
                      <X size={15} color={HomeColors.muted} />
                    </Pressable>
                  )}
                </View>
              )}

              <View style={styles.lessonList}>
                {filteredSummaries.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>مکالمه‌ای با این عبارت پیدا نشد.</Text>
                  </View>
                ) : (
                  filteredSummaries.map(item => {
                    const originalIndex = levelSummaries.findIndex(entry => entry.id === item.id);
                    const displayNumber = originalIndex >= 0 ? originalIndex + 1 : item.order;
                    return (
                      <Pressable
                        key={item.id}
                        accessibilityRole="button"
                        accessibilityLabel={`ورود به اتاق مکالمهٔ ${item.title}`}
                        onPress={() => openLesson(selectedLevel.id, item.id)}
                        style={({ pressed }) => [styles.lessonRowCard, pressed && styles.pressed]}
                      >
                        <View style={[styles.lessonIndexBadge, { backgroundColor: `${selectedLevel.color}16` }]}>
                          <Text style={[styles.lessonIndexText, { color: selectedLevel.color }]}>
                            {toPersianDigits(displayNumber)}
                          </Text>
                        </View>
                        <View style={styles.lessonRowCopy}>
                          <View style={styles.lessonRowTop}>
                            <Text style={styles.lessonRowTitle}>{item.title}</Text>
                            <View style={styles.turnsPill}>
                              <Text style={styles.turnsPillText}>
                                {item.usesSentenceFallback
                                  ? `${toPersianDigits(item.lineCount)} جمله`
                                  : `${toPersianDigits(item.lineCount)} نوبت`}
                              </Text>
                            </View>
                          </View>
                          <Text numberOfLines={2} style={styles.lessonRowSituation}>
                            {item.situation || item.subtitle || ''}
                          </Text>
                        </View>
                        <ChevronLeft size={17} color={HomeColors.muted} />
                      </Pressable>
                    );
                  })
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: HomeColors.canvas },
  scrollContent: { paddingBottom: 40 },
  page: { width: '100%', maxWidth: 820, alignSelf: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: 14 },
  topBar: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  topBarTitleWrap: { flex: 1, minWidth: 0, alignItems: Platform.OS === 'web' ? 'flex-start' : 'flex-end' },
  pageTitle: { fontFamily: Typography.fontFamily, fontSize: 18, lineHeight: 28, color: HomeColors.ink, textAlign: 'right', writingDirection: 'rtl' },
  pageSubMeta: { fontFamily: Typography.latinFontFamily, fontSize: 12, lineHeight: 16, color: HomeColors.muted },
  introCard: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: HomeColors.surface,
    borderWidth: 1,
    borderColor: HomeColors.border,
  },
  introIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  introCopy: { flex: 1, minWidth: 0, gap: 4 },
  introTitle: { width: '100%', fontFamily: Typography.fontFamily, fontSize: 15, lineHeight: 23, color: HomeColors.ink, textAlign: 'right', writingDirection: 'rtl' },
  introBody: { width: '100%', fontFamily: Typography.fontFamily, fontSize: 12.5, lineHeight: 20, color: HomeColors.muted, textAlign: 'right', writingDirection: 'rtl' },
  levelList: { gap: 10 },
  levelCard: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: HomeColors.surface,
    borderWidth: 1,
    borderColor: HomeColors.border,
    overflow: 'hidden',
  },
  levelStripe: { width: 5, alignSelf: 'stretch', borderRadius: 4 },
  levelBody: { flex: 1, minWidth: 0, gap: 4 },
  levelHeaderRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cefrBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  cefrBadgeText: { fontFamily: Typography.latinFontFamily, fontSize: 12, lineHeight: 16, fontWeight: '700' },
  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#F3F1EA',
  },
  countPillText: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 18, color: HomeColors.ink },
  levelTitle: { width: '100%', fontFamily: Typography.fontFamily, fontSize: 15, lineHeight: 23, color: HomeColors.ink, textAlign: 'right', writingDirection: 'rtl' },
  levelDesc: { width: '100%', fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 19, color: HomeColors.muted, textAlign: 'right', writingDirection: 'rtl' },
  levelRail: { flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse', gap: 8, paddingVertical: 2 },
  levelTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: HomeColors.surface,
    borderWidth: 1,
    borderColor: HomeColors.border,
  },
  levelTabCefr: { fontFamily: Typography.latinFontFamily, fontSize: 12.5, lineHeight: 16, fontWeight: '700', color: HomeColors.ink },
  levelTabCount: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 16, color: HomeColors.muted },
  levelTabTextActive: { color: '#FFFFFF' },
  selectedLevelBanner: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: HomeColors.surface,
    borderWidth: 1,
    borderColor: HomeColors.border,
    gap: 5,
  },
  selectedLevelHeader: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  selectedLevelCount: { fontFamily: Typography.fontFamily, fontSize: 12.5, lineHeight: 20, color: HomeColors.muted },
  selectedLevelTitle: { width: '100%', fontFamily: Typography.fontFamily, fontSize: 15.5, lineHeight: 24, color: HomeColors.ink, textAlign: 'right', writingDirection: 'rtl' },
  selectedLevelDesc: { width: '100%', fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 19, color: HomeColors.muted, textAlign: 'right', writingDirection: 'rtl' },
  freeLevelCard: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    gap: 11,
    padding: 13,
    borderRadius: 16,
    backgroundColor: HomeColors.surface,
    borderWidth: 1,
  },
  freeLevelIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  freeLevelCopy: { flex: 1, minWidth: 0, gap: 3 },
  freeLevelTitle: { width: '100%', fontFamily: Typography.fontFamily, fontSize: 14, lineHeight: 21, color: HomeColors.ink, textAlign: 'right', writingDirection: 'rtl' },
  freeLevelDesc: { width: '100%', fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 19, color: HomeColors.muted, textAlign: 'right', writingDirection: 'rtl' },
  searchBox: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: HomeColors.surface,
    borderWidth: 1,
    borderColor: HomeColors.border,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontFamily: Typography.fontFamily,
    fontSize: 13.5,
    lineHeight: 20,
    color: HomeColors.ink,
    textAlign: 'right',
    writingDirection: 'rtl',
    paddingVertical: 2,
  },
  searchClear: { padding: 4 },
  lessonList: { gap: 9 },
  lessonRowCard: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    gap: 11,
    padding: 13,
    borderRadius: 16,
    backgroundColor: HomeColors.surface,
    borderWidth: 1,
    borderColor: HomeColors.border,
  },
  lessonIndexBadge: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  lessonIndexText: { fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 18 },
  lessonRowCopy: { flex: 1, minWidth: 0, gap: 4 },
  lessonRowTop: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  lessonRowTitle: { flex: 1, minWidth: 0, fontFamily: Typography.fontFamily, fontSize: 14, lineHeight: 21, color: HomeColors.ink, textAlign: 'right', writingDirection: 'rtl' },
  turnsPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: '#F3F1EA' },
  turnsPillText: { fontFamily: Typography.fontFamily, fontSize: 11, lineHeight: 16, color: HomeColors.muted },
  lessonRowSituation: { width: '100%', fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 18, color: HomeColors.muted, textAlign: 'right', writingDirection: 'rtl' },
  emptyCard: { padding: 20, borderRadius: 16, backgroundColor: HomeColors.surface, borderWidth: 1, borderColor: HomeColors.border, alignItems: 'center' },
  emptyText: { fontFamily: Typography.fontFamily, fontSize: 13.5, color: HomeColors.muted },
  roomTopBar: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: HomeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: HomeColors.border,
  },
  roomBackButton: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F3F1EA',
  },
  roomBackText: { fontFamily: Typography.fontFamily, fontSize: 12.5, lineHeight: 18, color: HomeColors.ink },
  roomHeaderCopy: { flex: 1, minWidth: 0, alignItems: Platform.OS === 'web' ? 'flex-start' : 'flex-end' },
  roomHeaderTitle: { width: '100%', fontFamily: Typography.fontFamily, fontSize: 14, lineHeight: 20, color: HomeColors.ink, textAlign: 'right', writingDirection: 'rtl' },
  roomHeaderMeta: { fontFamily: Typography.fontFamily, fontSize: 11.5, lineHeight: 17, color: HomeColors.muted },
  roomScrollContent: { paddingBottom: 40 },
  roomInner: { width: '100%', maxWidth: 820, alignSelf: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: 14 },
  roomPager: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 4,
  },
  pagerButton: {
    flex: 1,
    flexDirection: Platform.OS === 'web' ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 13,
    backgroundColor: HomeColors.surface,
    borderWidth: 1,
    borderColor: HomeColors.border,
  },
  pagerNext: { backgroundColor: Colors.primary[600], borderColor: Colors.primary[600] },
  pagerText: { fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 19, color: HomeColors.ink },
  pagerNextText: { color: '#FFFFFF' },
  pagerDisabled: { opacity: 0.4 },
  pressed: { opacity: 0.85 },
});
