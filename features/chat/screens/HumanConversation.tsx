import { isLanguageEnabled, MANAGEMENT_BUILD, RUSSIAN_ONLY_BUILD } from '@/lib/features';
import { LocalizedText as Text, LocalizedTextInput as TextInput } from '@/components/LocalizedText';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, BackHandler, Keyboard, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BarChart3, ChevronLeft, Mic2, Send, Sparkles, UserRound, X } from 'lucide-react-native';
import {
  currentChatUserId,
  getPartnerEnglishLevel,
  isConversationClosedError,
  listMessages,
  sendSystemMessage,
  sendTextMessage,
  subscribeToMessages,
  syncMyEnglishLevel,
  unsubscribeFromMessages,
  type DirectMessage,
} from '@/lib/conversations';
import type { CourseLevelId } from '@/lib/courseContent';
import {
  buildLessonTurnPlan,
  cefrOfLevel,
  encodeCourseLevels,
  findSharedLesson,
  lessonsOfLevel,
  levelMeta,
  levelProfileFor,
  myAllCompletedLevels,
  parseStoredCourseLevels,
  sharedCompletedLevel,
  type SharedLanguage,
} from '@/lib/sharedLevel';
import { Colors, Radius, Spacing, Typography } from '@/lib/theme';
import { ChatBackButton } from '@/components/ChatBackButton';
import { KeyboardAttachedView } from '@/components/KeyboardAttachedView';
import { formatTime, timeAgo, toPersianDigits as fa } from '@/lib/format';
import {
  answerIndexInSession,
  buildTurnConversationPlan,
  evaluateTurnConversation,
  feedbackForTurnAnswer,
  hasTargetLanguageText,
  isAnswerOnMission,
  promptFor,
  turnStateFromMessages,
  type TurnAnswerFeedback,
  type TurnConversationPlan,
  type TurnReport,
  type TurnSlot,
} from '@/lib/turnConversation';
import VoiceAnswerInput from '@/components/VoiceAnswerInput';
import SupportConversation from './SupportConversation';

const containsRtlScript = (value: string) => /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(value);

type RouteParams = {
  conversationId: string;
  name?: string;
  lessonId?: string;
  lessonTitle?: string;
  levelId?: string;
  situation?: string;
  language?: string;
  support?: string;
  lastSeen?: string;
  partnerLevel?: string;
};

export default function HumanConversationScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const support = params.support === '1' || MANAGEMENT_BUILD || /پشتیبانی|support/i.test(params.name || '');
  if (support) {
    return <SupportConversation conversationId={String(params.conversationId || '')} name={params.name} support={params.support} />;
  }
  return <TurnConversationScreen {...params} conversationId={String(params.conversationId || '')} />;
}

function TurnReportCard({
  report,
  plan,
  onClose,
  onBack,
}: {
  report: TurnReport;
  plan: TurnConversationPlan;
  onClose: () => void;
  onBack: () => void;
}) {
  const metric = (label: string, value: number) => (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricTrack}><View style={[styles.metricFill, { width: `${Math.max(4, value)}%` }]} /></View>
      <Text style={styles.metricValue}>{fa(value)}٪</Text>
    </View>
  );

  return (
    <View style={styles.reportOverlay}>
      <View style={styles.reportSheet}>
        <ScrollView contentContainerStyle={styles.reportContent} showsVerticalScrollIndicator={false}>
          <View style={styles.reportHeader}>
            <View style={styles.reportHeaderCopy}>
              <Text style={styles.reportKicker}>گزارش پایان مکالمه</Text>
              <Text style={styles.reportTitle}>{plan.titleFa}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="بستن گزارش" onPress={onClose} style={styles.reportClose}><X size={18} color={Colors.neutral[400]} /></Pressable>
          </View>

          <View style={styles.overallRow}>
            <View style={styles.overallCircle}>
              <Text style={styles.overallValue}>{fa(report.overall)}</Text>
              <Text style={styles.overallUnit}>٪</Text>
            </View>
            <View style={styles.overallCopy}>
              <Text style={styles.overallLabel}>امتیاز کلی</Text>
              <Text style={styles.overallDetail}>
                {report.answersAnalyzed
                  ? `${fa(report.answersAnalyzed)} پاسخ و ${fa(report.wordsSpoken)} واژه تحلیل شد · ${fa(report.turnsCompleted)} از ${fa(plan.turns.length)} نوبت`
                  : 'هنوز پاسخی برای تحلیل ثبت نشده است.'}
              </Text>
            </View>
          </View>

          <View style={styles.metrics}>
            {metric('روانی', report.fluency)}
            {metric('واژگان', report.vocabulary)}
            {metric('تعامل', report.interaction)}
          </View>

          <View style={styles.reportBlock}>
            <Text style={styles.reportHeading}>خطاهای مهم</Text>
            {report.errors.length
              ? report.errors.map(error => (
                <View key={error.title} style={styles.reportError}>
                  <Text style={styles.reportErrorTitle}>{error.title}</Text>
                  <Text style={styles.reportErrorDetail}>{error.detail}</Text>
                  {error.correction ? <Text style={styles.reportErrorCorrection}>{error.correction}</Text> : null}
                </View>
              ))
              : <Text style={styles.reportLine}>خطای مهمی برای اصلاح پیدا نشد.</Text>}
          </View>

          <View style={styles.nextPractice}>
            <Sparkles size={16} color={Colors.primary[400]} />
            <Text style={styles.nextPracticeText}>{report.nextPractice}</Text>
          </View>

          <View style={styles.reportActions}>
            <Pressable accessibilityRole="button" style={styles.reportPrimary} onPress={onClose}><Text style={styles.reportPrimaryText}>بازگشت به گفت‌وگو</Text></Pressable>
            <Pressable accessibilityRole="button" style={styles.reportSecondary} onPress={onBack}><Text style={styles.reportSecondaryText}>مکالمه‌ها</Text></Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function TurnConversationScreen({
  conversationId,
  name,
  lessonId,
  lessonTitle,
  levelId,
  situation,
  language,
  lastSeen,
  partnerLevel,
}: RouteParams) {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const composerHeight = useRef(0);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [ended, setEnded] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  // Real-contact conversations are scoped to ONE conversation language and the
  // highest CEFR level both learners have completed. The lesson-room entry
  // (lessonId param) preserves its dedicated scenario plan.
  const hasLessonContext = Boolean(lessonId);
  const singleLanguage: SharedLanguage = !isLanguageEnabled('ru')
    ? 'en'
    : (RUSSIAN_ONLY_BUILD || !isLanguageEnabled('en') || language === 'ru')
      ? 'ru'
      : 'en';
  const [myCompletedByLang, setMyCompletedByLang] = useState<{ en: CourseLevelId[]; ru: CourseLevelId[] } | null>(null);
  const [partnerRawLevel, setPartnerRawLevel] = useState<string | null | undefined>(partnerLevel);
  const [pickingLesson, setPickingLesson] = useState(false);
  const [choosingLesson, setChoosingLesson] = useState(false);

  useEffect(() => {
    if (hasLessonContext) return;
    let active = true;
    void myAllCompletedLevels()
      .then((levels) => {
        if (!active) return;
        setMyCompletedByLang(levels);
        void syncMyEnglishLevel(encodeCourseLevels(levels)).catch(() => undefined);
      })
      .catch(() => { if (active) setMyCompletedByLang({ en: [], ru: [] }); });
    if (partnerLevel !== undefined) {
      setPartnerRawLevel(partnerLevel);
    } else {
      void getPartnerEnglishLevel(conversationId)
        .then((value) => { if (active) setPartnerRawLevel(value ?? null); })
        .catch(() => { if (active) setPartnerRawLevel(null); });
    }
    return () => { active = false; };
  }, [conversationId, hasLessonContext, partnerLevel]);

  const levelsReady = myCompletedByLang !== null && partnerRawLevel !== undefined;
  const partnerParsed = useMemo(() => parseStoredCourseLevels(partnerRawLevel), [partnerRawLevel]);
  const levelMatch = useMemo(() => sharedCompletedLevel(
    myCompletedByLang?.[singleLanguage] ?? [],
    partnerParsed[singleLanguage].completed,
  ), [myCompletedByLang, partnerParsed, singleLanguage]);
  const sharedLevelId = levelMatch.sharedLevelId;
  const sharedProfile = useMemo(() => levelProfileFor(sharedLevelId), [sharedLevelId]);
  const sharedLessons = useMemo(() => lessonsOfLevel(sharedLevelId, singleLanguage), [sharedLevelId, singleLanguage]);

  // The latest lesson selection arrives as a system marker both clients read.
  // Lesson ids across English and Russian are disjoint, so either client
  // resolves the exact language and lesson from the marker alone.
  const lessonSelection = useMemo(() => {
    let selected: { lessonId: string; at: string } | null = null;
    for (const message of messages) {
      if (message.type !== 'system') continue;
      const body = (message.body || '').trim();
      if (!body.startsWith('lesson:')) continue;
      const id = body.slice('lesson:'.length).trim();
      if (id) selected = { lessonId: id, at: message.createdAt };
    }
    return selected;
  }, [messages]);
  const chosenLessonId = lessonSelection?.lessonId ?? null;
  const chosenLesson = useMemo(() => findSharedLesson(chosenLessonId), [chosenLessonId]);

  const fallbackPlan = useMemo<TurnConversationPlan>(() => buildTurnConversationPlan({
    conversationId,
    language: singleLanguage,
    lessonTitle,
    situation,
    levelId: Number(levelId || 1),
  }), [conversationId, singleLanguage, lessonTitle, situation, levelId]);

  const lessonPlan = useMemo<TurnConversationPlan | null>(() => (
    chosenLesson && !hasLessonContext && isLanguageEnabled(chosenLesson.language)
      ? buildLessonTurnPlan(chosenLesson, chosenLesson.language)
      : null
  ), [chosenLesson, hasLessonContext]);

  const plan = lessonPlan ?? fallbackPlan;
  const effectiveLanguage: SharedLanguage = chosenLesson && !hasLessonContext && isLanguageEnabled(chosenLesson.language)
    ? chosenLesson.language
    : singleLanguage;
  const showPicker = !hasLessonContext && (pickingLesson || !lessonPlan);
  const sessionBoundaryAt = lessonPlan ? lessonSelection?.at ?? null : null;
  const planLevelId = lessonPlan && chosenLesson ? chosenLesson.levelId : Number(levelId || 1);
  const planMeta = useMemo(() => levelMeta(planLevelId, effectiveLanguage), [planLevelId, effectiveLanguage]);

  // A new lesson starts a fresh practice: clear the ended/report state.
  useEffect(() => {
    setEnded(false);
    setShowReport(false);
    setInput('');
    setError(null);
  }, [chosenLessonId]);

  const state = useMemo(
    () => turnStateFromMessages(messages, plan, myId, sessionBoundaryAt),
    [messages, plan, myId, sessionBoundaryAt],
  );
  const report = useMemo(() => evaluateTurnConversation(plan, state, myId), [plan, state, myId]);
  const latestMyAnswer = useMemo(
    () => [...state.sessionAnswers].reverse().find(message => message.senderId === myId && message.type === 'text') ?? null,
    [state.sessionAnswers, myId],
  );
  const latestFeedback = useMemo<TurnAnswerFeedback | null>(() => {
    if (!latestMyAnswer) return null;
    const index = answerIndexInSession(latestMyAnswer, state);
    if (index < 0) return null;
    const missionIndex = Math.floor(index / 2);
    const slot: TurnSlot = index % 2 === 0 ? 0 : 1;
    const prompt = promptFor(plan, missionIndex, slot);
    if (!prompt) return null;
    const base = feedbackForTurnAnswer(latestMyAnswer.body || '', prompt);
    if (!isAnswerOnMission(latestMyAnswer.body || '', prompt)) {
      return {
        ...base,
        positive: 'پیام شما برای مخاطب ارسال شد.',
        correction: base.correction,
      };
    }
    return base;
  }, [latestMyAnswer, state, plan]);

  const mergeMessages = useCallback((rows: DirectMessage[]) => {
    setMessages((current) => {
      if (!rows.length) return current;
      const byId = new Map(current.map(item => [item.id, item]));
      let changed = false;
      for (const row of rows) {
        if (!byId.has(row.id)) {
          byId.set(row.id, row);
          changed = true;
        }
      }
      if (!changed) return current;
      return [...byId.values()].sort(
        (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.id.localeCompare(b.id),
      );
    });
  }, []);

  const addMessage = useCallback((message: DirectMessage) => {
    mergeMessages([message]);
  }, [mergeMessages]);

  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof subscribeToMessages> | null = null;
    const syncMessages = async () => {
      try {
        const rows = await listMessages(conversationId);
        if (active) mergeMessages(rows);
      } catch {
        // Keep current transcript if a background refresh fails transiently.
      }
    };
    Promise.all([listMessages(conversationId), currentChatUserId()])
      .then(([rows, userId]) => {
        if (!active) return;
        setMessages(rows);
        setMyId(userId);
        channel = subscribeToMessages(conversationId, addMessage);
        setError(null);
      })
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : 'گفت‌وگو باز نشد.'); })
      .finally(() => { if (active) setLoading(false); });
    const pollTimer = setInterval(() => { void syncMessages(); }, 4000);
    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') void syncMessages();
    });
    return () => {
      active = false;
      clearInterval(pollTimer);
      appStateSub.remove();
      void unsubscribeFromMessages(channel);
    };
  }, [conversationId, addMessage, mergeMessages]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (router.canGoBack()) router.back();
      else router.replace('/conversations' as never);
      return true;
    });
    return () => subscription.remove();
  }, [router]);

  // The composer is translated over the transcript when the keyboard opens.
  // Reserve exactly the hidden height so the newest bubble stays visible.
  useEffect(() => {
    const measure = (keyboardTop: number) => {
      const node = scrollRef.current as unknown as { measureInWindow?: (callback: (x: number, y: number, width: number, height: number) => void) => void } | null;
      if (!node?.measureInWindow) return;
      node.measureInWindow((_x, y, _w, h) => {
        const composerTop = keyboardTop - composerHeight.current - (Platform.OS === 'android' ? 36 : 0);
        setKeyboardInset(Math.max(0, Math.round(y + h - composerTop)));
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
      });
    };
    const subscriptions = [
      Keyboard.addListener('keyboardDidShow', event => { setKeyboardOpen(true); measure(event.endCoordinates.screenY); }),
      Keyboard.addListener('keyboardDidHide', () => { setKeyboardOpen(false); setKeyboardInset(0); }),
    ];
    return () => subscriptions.forEach(subscription => subscription.remove());
  }, []);

  useEffect(() => { setError(null); }, [state.missionIndex, state.slot]);

  const online = Boolean(lastSeen && now - Date.parse(lastSeen) < 5 * 60 * 1000);
  const statusText = online ? 'آنلاین' : lastSeen ? `آخرین بازدید ${timeAgo(lastSeen)}` : 'آمادهٔ مکالمه';

  const sendAnswer = async (raw: string) => {
    const clean = raw.trim();
    if (!clean || sending || !state.myTurn || !state.currentPrompt || state.finished || ended) return;
    if (!hasTargetLanguageText(clean, effectiveLanguage)) {
      setError(`برای تمرین، پاسخ را به ${effectiveLanguage === 'ru' ? 'روسی' : 'انگلیسی'} بنویس.`);
      setInput(clean);
      setInputMode('text');
      return;
    }
    setSending(true);
    setError(null);
    try {
      addMessage(await sendTextMessage(conversationId, clean));
      setInput('');
    } catch (cause) {
      setInput(clean);
      setError(isConversationClosedError(cause) ? 'این گفت‌وگو دیگر فعال نیست.' : cause instanceof Error ? cause.message : 'پاسخ ثبت نشد.');
    } finally {
      setSending(false);
    }
  };

  const pickLesson = async (id: string) => {
    if (choosingLesson) return;
    setChoosingLesson(true);
    setError(null);
    try {
      addMessage(await sendSystemMessage(conversationId, `lesson:${id}`));
      setPickingLesson(false);
    } catch (cause) {
      setError(isConversationClosedError(cause) ? 'این گفت‌وگو دیگر فعال نیست.' : cause instanceof Error ? cause.message : 'انتخاب درس ثبت نشد.');
    } finally {
      setChoosingLesson(false);
    }
  };

  const confirmEnd = () => {
    if (ended) {
      setShowReport(true);
      return;
    }
    Alert.alert(
      'پایان مکالمه',
      'گزارش این تمرین ساخته شود؟ بعد از پایان، ارسال پاسخ جدید در این تمرین قفل می‌شود.',
      [
        { text: 'ادامهٔ تمرین', style: 'cancel' },
        { text: 'پایان و گزارش', style: 'default', onPress: () => { setEnded(true); setShowReport(true); } },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <ChatBackButton fallback="/conversations" />
        <View style={styles.avatar}><UserRound size={21} color={Colors.primary[300]} /></View>
        <View style={styles.headerText}>
          <Text style={[styles.name, containsRtlScript(name || 'مخاطب') ? styles.rtlText : styles.ltrText]}>{name || 'مخاطب'}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.onlineDot, !online && styles.onlineDotOff]} />
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary[400]} /><Text style={styles.centerText}>در حال بازکردن گفت‌وگو…</Text></View>
      ) : showPicker ? (
        levelsReady ? (
          <ScrollView style={styles.picker} contentContainerStyle={styles.pickerContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.sharedCard, { borderTopColor: levelMeta(sharedLevelId, singleLanguage).color, borderTopWidth: 3 }]}>
              <View style={styles.sharedTopRow}>
                <Text style={styles.sharedKicker}>سطح مشترک شما</Text>
                <View style={styles.pickerLangBadge}>
                  <Text style={styles.pickerLangBadgeText}>{singleLanguage === 'ru' ? 'روسی' : 'انگلیسی'}</Text>
                </View>
              </View>
              <View style={styles.sharedLevelRow}>
                <View style={[styles.levelBadge, { backgroundColor: levelMeta(sharedLevelId, singleLanguage).color }]}>
                  <Text style={styles.levelBadgeText}>{cefrOfLevel(sharedLevelId)}</Text>
                </View>
                <Text style={styles.sharedLevelTitle}>{levelMeta(sharedLevelId, singleLanguage).title}</Text>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyBadgeText}>{sharedProfile.turnLabelFa}</Text>
                </View>
              </View>
              <View style={styles.compareRow}>
                <View style={styles.comparePill}>
                  <Text style={styles.compareLabel}>تکمیل‌شدهٔ شما</Text>
                  <Text style={styles.compareValue}>{levelMatch.myHighest !== null ? cefrOfLevel(levelMatch.myHighest) : 'شروع'}</Text>
                </View>
                <View style={styles.comparePill}>
                  <Text style={styles.compareLabel}>تکمیل‌شدهٔ مخاطب</Text>
                  <Text style={styles.compareValue}>{levelMatch.partnerHighest !== null ? cefrOfLevel(levelMatch.partnerHighest) : 'شروع'}</Text>
                </View>
              </View>
              <Text style={styles.sharedExplain}>
                {!levelMatch.bothCompleted
                  ? `هنوز یک سطح کامل مشترک را هر دو تمام نکرده‌اید؛ برای شروع روان و بدون فشار، مکالمه روی Pre-A1 (${sharedProfile.turnLabelFa}) تنظیم شده است.`
                  : levelMatch.myHighest !== levelMatch.partnerHighest
                    ? `شما و مخاطب سطح‌های متفاوتی را کامل کرده‌اید؛ برای اینکه هر دو به همهٔ ساختارها مسلط باشید، بالاترین سطحی که هر دو کامل کرده‌اید یعنی ${cefrOfLevel(sharedLevelId)} (${sharedProfile.turnLabelFa}) انتخاب شده است.`
                    : `هر دو سطح ${cefrOfLevel(sharedLevelId)} را کامل کرده‌اید؛ مکالمه با ${sharedProfile.turnLabelFa} از درس‌های همین سطح برگزار می‌شود.`}
              </Text>
              {pickingLesson && lessonPlan ? (
                <Pressable accessibilityRole="button" onPress={() => setPickingLesson(false)} style={styles.backToChatBtn}>
                  <Text style={styles.backToChatText}>بازگشت به مکالمهٔ فعلی</Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.lessonListHeader}>
              <Text style={styles.lessonListTitle}>درس‌های {singleLanguage === 'ru' ? 'روسی' : 'انگلیسی'} سطح {cefrOfLevel(sharedLevelId)}</Text>
              <Text style={styles.lessonListCount}>{fa(sharedLessons.length)} درس</Text>
            </View>
            {sharedLessons.map((lesson, index) => {
              const isCurrent = chosenLessonId === lesson.id;
              return (
                <Pressable
                  key={lesson.id}
                  accessibilityRole="button"
                  accessibilityLabel={`شروع مکالمه با درس ${lesson.title}`}
                  style={[styles.lessonCard, isCurrent && styles.lessonCardActive, choosingLesson && styles.disabled]}
                  disabled={choosingLesson}
                  onPress={() => void pickLesson(lesson.id)}
                >
                  <View style={styles.lessonCardTop}>
                    <View style={styles.lessonTitleWrap}>
                      <View style={[styles.lessonOrderBadge, { backgroundColor: levelMeta(sharedLevelId, singleLanguage).color + '18' }]}>
                        <Text style={[styles.lessonOrderText, { color: levelMeta(sharedLevelId, singleLanguage).color }]}>{fa(index + 1)}</Text>
                      </View>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    </View>
                    <View style={styles.lessonMetaPills}>
                      {isCurrent ? <View style={styles.currentLessonBadge}><Text style={styles.currentLessonBadgeText}>درس فعلی</Text></View> : null}
                      <Text style={styles.lessonCount}>{fa(sharedProfile.turnCount)} نوبت · {fa(lesson.sentences.length)} جمله</Text>
                    </View>
                  </View>
                  <Text style={styles.lessonSituation} numberOfLines={2}>{lesson.situation}</Text>
                  <View style={styles.lessonFooter}>
                    <Text style={styles.lessonAction}>{isCurrent ? 'شروع مجدد این درس' : 'شروع مکالمه با این درس'}</Text>
                    <ChevronLeft size={14} color={Colors.primary[600]} />
                  </View>
                </Pressable>
              );
            })}
            <Text style={styles.pickerNote}>هر یک از شما می‌تواند درس را انتخاب کند؛ انتخاب برای هر دو یکسان می‌شود و مکالمه بر اساس محتوای همان درس پیش می‌رود.</Text>
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          </ScrollView>
        ) : (
          <View style={styles.center}><ActivityIndicator color={Colors.primary[400]} /><Text style={styles.centerText}>در حال آماده‌سازی درس‌های سطح مشترک…</Text></View>
        )
      ) : (
        <>
          <View style={[styles.statusCard, keyboardOpen && styles.statusCardCompact, { borderTopColor: planMeta.color, borderTopWidth: 3 }]}>
            <View style={styles.statusTop}>
              <View style={[styles.turnPill, state.myTurn && !ended && styles.turnPillMine]}>
                <View style={[styles.turnDot, state.myTurn && !ended && styles.turnDotMine]} />
                <Text style={[styles.turnPillText, state.myTurn && !ended && styles.turnPillTextMine]}>{state.finished ? 'مکالمه کامل شد' : ended ? 'مکالمه پایان یافت' : state.myTurn ? 'نوبت شماست' : 'نوبت مخاطب است'}</Text>
              </View>
              <View style={styles.statusRightMeta}>
                {!keyboardOpen && plan.difficultyLabel ? (
                  <View style={styles.difficultyBadge}>
                    <Text style={styles.difficultyBadgeText}>{plan.difficultyLabel}</Text>
                  </View>
                ) : null}
                <Text style={styles.turnCount}>{fa(state.completedTurns)} از {fa(plan.turns.length)} نوبت</Text>
                {keyboardOpen && lessonPlan ? (
                  <Pressable accessibilityRole="button" accessibilityLabel="تغییر درس" onPress={() => { Keyboard.dismiss(); setPickingLesson(true); }} style={styles.changeLesson}>
                    <Text style={styles.changeLessonText}>تغییر درس</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
            {!keyboardOpen ? (
              <>
                <View style={styles.lessonRow}>
                  <View style={[styles.levelBadge, { backgroundColor: planMeta.color }]}>
                    <Text style={styles.levelBadgeText}>{plan.levelLabel}</Text>
                  </View>
                  <Text style={styles.topicLine}>{effectiveLanguage === 'ru' ? 'روسی' : 'انگلیسی'} · درس: {plan.topicFa}</Text>
                  {lessonPlan ? (
                    <Pressable accessibilityRole="button" accessibilityLabel="تغییر درس" onPress={() => setPickingLesson(true)} style={styles.changeLesson}>
                      <Text style={styles.changeLessonText}>تغییر درس</Text>
                    </Pressable>
                  ) : null}
                </View>
                {lessonPlan ? <Text style={styles.situationLine}>{plan.missionFa}</Text> : null}
                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.max(3, state.progress)}%` }]} /></View>
                  <Text style={styles.progressText}>{fa(state.progress)}٪</Text>
                </View>
              </>
            ) : null}
          </View>

          <View style={[styles.missionCard, keyboardOpen && styles.missionCardCompact]}>
            <View style={styles.missionHeader}>
              <Text style={styles.missionKicker}>مأموریت این نوبت</Text>
              {state.currentTurn ? <View style={styles.missionFocusPill}><Text style={styles.missionFocus}>{state.currentTurn.focusFa}</Text></View> : null}
            </View>
            {state.currentPrompt ? (
              <>
                <Text style={styles.missionText} numberOfLines={keyboardOpen ? 2 : undefined}>{state.currentPrompt.text}</Text>
                <Text style={styles.missionHint} numberOfLines={keyboardOpen ? 1 : undefined}>{state.currentPrompt.hint}</Text>
                {!keyboardOpen && lessonPlan && state.currentPrompt.cues.length > 0 ? (
                  <View style={styles.cueRow}>
                    {state.currentPrompt.cues.slice(0, 4).map(cue => (
                      <View key={cue} style={styles.cuePill}><Text style={styles.cueText}>{cue}</Text></View>
                    ))}
                  </View>
                ) : null}
              </>
            ) : (
              <Text style={styles.missionText}>همهٔ نوبت‌های این تمرین انجام شد. با «گزارش مکالمه» نتیجه را ببین.</Text>
            )}
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={[styles.messageContent, keyboardInset > 0 && { paddingBottom: keyboardInset + Spacing.md }]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {state.sessionStart > 0 ? (
              <View style={styles.historyNote}>
                <Text style={styles.historyNoteText}>این تمرین از پیام‌های تازه شروع می‌شود؛ {fa(state.sessionStart)} پیام قبلی این گفت‌وگو در این تمرین نمایش داده نمی‌شود.</Text>
              </View>
            ) : null}
            {!state.sessionAnswers.length ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>گفت‌وگو هنوز شروع نشده</Text>
                <Text style={styles.emptyDesc}>نوبت شماست؛ به مأموریت بالا پاسخ بده تا گفت‌وگو شروع شود.</Text>
              </View>
            ) : state.sessionAnswers.map((message, index) => {
              const missionIndex = Math.floor(index / 2);
              const turn = plan.turns[missionIndex];
              const mine = message.senderId === myId;
              const showDivider = index % 2 === 0 && turn;
              return (
                <View key={message.id}>
                  {showDivider ? (
                    <View style={styles.turnDivider}>
                      <Text style={styles.turnDividerText}>نوبت {fa(missionIndex + 1)} · {turn.focusFa}</Text>
                    </View>
                  ) : null}
                  <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                    <Text style={styles.bubbleName}>{mine ? 'شما' : (name || 'مخاطب')}</Text>
                    {message.type === 'voice'
                      ? <View style={styles.voiceRow}><Mic2 size={14} color="#475569" /><Text style={styles.voiceText}>پیام صوتی</Text></View>
                      : <Text style={[styles.messageText, containsRtlScript(message.body || '') ? styles.rtlText : styles.ltrText]}>{message.body}</Text>}
                    <Text style={styles.time}>{formatTime(message.createdAt)}</Text>
                  </View>
                </View>
              );
            })}
            {latestFeedback && !state.finished && !ended ? (
              <View style={styles.feedbackCard}>
                <View style={styles.scoreBadge}><Text style={styles.scoreText}>{fa(latestFeedback.score)}٪</Text></View>
                <View style={styles.feedbackCopy}>
                  <Text style={styles.feedbackKicker}>بازخورد آخرین پاسخ شما</Text>
                  <Text style={styles.feedbackPositive}>✓ {latestFeedback.positive}</Text>
                  <Text style={styles.feedbackCorrection}>✎ {latestFeedback.correction}</Text>
                </View>
              </View>
            ) : null}
            {state.finished && !ended ? (
              <View style={styles.finishedCard}>
                <Text style={styles.finishedTitle}>همهٔ نوبت‌ها انجام شد</Text>
                <Text style={styles.finishedText}>گزارش کامل مکالمه آماده است.</Text>
              </View>
            ) : null}
          </ScrollView>

          <KeyboardAttachedView onLayout={event => { composerHeight.current = event.nativeEvent.layout.height; }}>
            <View style={[styles.answerCard, keyboardOpen && styles.answerCardCompact]}>
              {state.finished || ended ? (
                <View style={styles.endedRow}>
                  <View style={styles.endedCopy}>
                    <Text style={styles.endedTitle}>{ended ? 'مکالمه پایان یافت' : 'تمرین کامل شد'}</Text>
                    <Text style={styles.endedText}>{ended ? 'گزارش این تمرین آماده است.' : 'برای دیدن گزارش، دکمهٔ زیر را بزن.'}</Text>
                  </View>
                  <Pressable accessibilityRole="button" style={styles.reportButton} onPress={() => setShowReport(true)}>
                    <BarChart3 size={16} color="#FFFFFF" />
                    <Text style={styles.reportButtonText}>گزارش مکالمه</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <View style={styles.modeRow}>
                    <View style={styles.modeGroup}>
                      <Text style={styles.modeLabel}>پاسخ:</Text>
                      <Pressable accessibilityRole="button" accessibilityState={{ selected: inputMode === 'text' }} style={[styles.modeButton, inputMode === 'text' && styles.modeButtonActive]} onPress={() => setInputMode('text')}>
                        <Text style={[styles.modeButtonText, inputMode === 'text' && styles.modeButtonTextActive]}>نوشتاری</Text>
                      </Pressable>
                      <Pressable accessibilityRole="button" accessibilityState={{ selected: inputMode === 'voice' }} style={[styles.modeButton, inputMode === 'voice' && styles.modeButtonActive]} onPress={() => setInputMode('voice')}>
                        <Text style={[styles.modeButtonText, inputMode === 'voice' && styles.modeButtonTextActive]}>گفتاری</Text>
                      </Pressable>
                    </View>
                    <Pressable accessibilityRole="button" accessibilityLabel="پایان مکالمه" style={styles.endButtonInline} onPress={confirmEnd}>
                      <Text style={styles.endButtonText}>پایان مکالمه</Text>
                    </Pressable>
                  </View>

                  {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

                  {state.myTurn ? (
                    inputMode === 'text' ? (
                      <View style={styles.composeRow}>
                        <TextInput
                          accessibilityLabel="پاسخ این نوبت"
                          style={[styles.input, styles.composeInput, containsRtlScript(input || 'پاسخ') ? styles.rtlText : styles.ltrText]}
                          value={input}
                          onChangeText={setInput}
                          placeholder="پاسخ این نوبت را بنویس…"
                          placeholderTextColor={Colors.neutral[600]}
                          multiline
                          maxLength={320}
                          editable={!sending}
                        />
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="ثبت پاسخ"
                          accessibilityState={{ disabled: sending || !input.trim() }}
                          style={[styles.submitButtonCompact, (sending || !input.trim()) && styles.disabled]}
                          disabled={sending || !input.trim()}
                          onPress={() => void sendAnswer(input)}
                        >
                          {sending ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Send size={16} color="#FFFFFF" />}
                          <Text style={styles.submitButtonText}>ارسال</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <VoiceAnswerInput
                        locale={effectiveLanguage === 'ru' ? 'ru-RU' : 'en-US'}
                        contextualStrings={[...(state.currentPrompt?.cues ?? [])]}
                        disabled={sending}
                        onTranscript={text => void sendAnswer(text)}
                      />
                    )
                  ) : (
                    <View style={styles.waitingRow}>
                      <ActivityIndicator size="small" color={Colors.primary[400]} />
                      <Text style={styles.waitingText}>نوبت مخاطب است؛ منتظر پاسخ او بمان.</Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </KeyboardAttachedView>
        </>
      )}

      {showReport ? (
        <TurnReportCard report={report} plan={plan} onClose={() => setShowReport(false)} onBack={() => router.replace('/conversations' as never)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F8FC' },
  header: { paddingTop: 13, paddingHorizontal: Spacing.md, paddingBottom: 12, minHeight: 70, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8EAF2', flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary[500] + '15', borderWidth: 1, borderColor: Colors.primary[500] + '30', alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  name: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  statusRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, marginTop: 3 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.success[500] },
  onlineDotOff: { backgroundColor: Colors.neutral[500] },
  statusText: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[600], textAlign: 'right' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  centerText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[600] },
  statusCard: { marginHorizontal: Spacing.md, marginTop: Spacing.sm, padding: Spacing.md, borderRadius: Radius.lg, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8EAF2', gap: 8, shadowColor: '#1E1B4B', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  statusCardCompact: { marginTop: 4, paddingVertical: 6, paddingHorizontal: Spacing.sm, gap: 0 },
  statusTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  statusRightMeta: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  turnPill: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, backgroundColor: Colors.success[500] + '12' },
  turnPillMine: { backgroundColor: Colors.primary[500] + '14' },
  turnDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success[500] },
  turnDotMine: { backgroundColor: Colors.primary[500] },
  turnPillText: { fontFamily: Typography.fontFamily, fontSize: 11, fontWeight: Typography.weights.bold, color: Colors.success[700] },
  turnPillTextMine: { color: Colors.primary[600] },
  turnCount: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[300] },
  lessonRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 7 },
  levelBadge: { minWidth: 38, height: 24, borderRadius: 12, paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center' },
  levelBadgeText: { fontFamily: Typography.latinFontFamily, fontSize: 10, fontWeight: '800', color: '#FFFFFF', textAlign: 'left', writingDirection: 'ltr' },
  difficultyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  difficultyBadgeText: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[200] },
  topicLine: { flex: 1, fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: Colors.neutral[100], textAlign: 'right' },
  changeLesson: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, backgroundColor: Colors.primary[500] + '12', borderWidth: 1, borderColor: Colors.primary[500] + '25' },
  changeLessonText: { fontFamily: Typography.fontFamily, fontSize: 10, fontWeight: Typography.weights.bold, color: Colors.primary[600] },
  situationLine: { fontFamily: Typography.fontFamily, fontSize: 10, lineHeight: 18, color: Colors.neutral[300], textAlign: 'right' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#EEF0F6', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: Colors.primary[400] },
  progressText: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.primary[600], width: 34, textAlign: 'left' },
  missionCard: { marginHorizontal: Spacing.md, marginTop: Spacing.sm, padding: Spacing.md, borderRadius: Radius.lg, backgroundColor: '#FFFCF5', borderWidth: 1, borderColor: Colors.warning[500] + '40', gap: 6 },
  missionCardCompact: { marginTop: 4, paddingVertical: 7, paddingHorizontal: Spacing.sm, gap: 3 },
  missionHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  missionKicker: { fontFamily: Typography.boldFontFamily, fontSize: 10, color: Colors.warning[700], textAlign: 'right' },
  missionFocusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, backgroundColor: Colors.warning[500] + '18' },
  missionFocus: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.warning[700] },
  missionText: { fontFamily: Typography.latinFontFamily, fontSize: 16, lineHeight: 24, fontWeight: '700', color: '#1F2937', textAlign: 'left', writingDirection: 'ltr' },
  missionHint: { fontFamily: Typography.fontFamily, fontSize: 11, lineHeight: 19, color: Colors.neutral[200], textAlign: 'right' },
  cueRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  cuePill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: Radius.full, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6DEC8' },
  cueText: { fontFamily: Typography.latinFontFamily, fontSize: 11, fontWeight: '600', color: '#334155', writingDirection: 'ltr' },
  messages: { flex: 1 },
  messageContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.md, gap: Spacing.sm },
  empty: { minHeight: 120, alignItems: 'center', justifyContent: 'center', gap: 4 },
  emptyTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.neutral[200] },
  emptyDesc: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[600], textAlign: 'center' },
  historyNote: { padding: 9, borderRadius: Radius.md, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  historyNoteText: { fontFamily: Typography.fontFamily, fontSize: 10, lineHeight: 18, color: Colors.neutral[500], textAlign: 'right' },
  turnDivider: { alignSelf: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: '#EEF0F6' },
  turnDividerText: { fontFamily: Typography.fontFamily, fontSize: 9, color: Colors.neutral[500] },
  bubble: { maxWidth: '84%', borderRadius: 18, padding: 11, borderWidth: 1, gap: 2 },
  mine: { alignSelf: 'flex-end', backgroundColor: '#EEF0FF', borderColor: '#DCDFFF', borderBottomRightRadius: 6 },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderColor: '#E5E7EF', borderBottomLeftRadius: 6 },
  bubbleName: { fontFamily: Typography.fontFamily, fontSize: 9, color: Colors.neutral[500] },
  messageText: { fontSize: 15, lineHeight: 23, color: '#1F2937' },
  rtlText: { fontFamily: Typography.fontFamily, textAlign: 'right', writingDirection: 'rtl' },
  ltrText: { fontFamily: Typography.latinFontFamily, fontWeight: '700', textAlign: 'left', writingDirection: 'ltr' },
  time: { fontFamily: Typography.fontFamily, fontSize: 9, color: '#6B7280', marginTop: 3, textAlign: 'left' },
  voiceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  voiceText: { fontFamily: Typography.fontFamily, fontSize: 12, color: '#475569' },
  feedbackCard: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: Spacing.sm, marginTop: Spacing.xs, padding: Spacing.md, borderRadius: Radius.lg, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: Colors.primary[500] + '25' },
  scoreBadge: { minWidth: 50, height: 34, borderRadius: 17, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary[500] + '12' },
  scoreText: { fontFamily: Typography.fontFamily, fontSize: 13, fontWeight: Typography.weights.bold, color: Colors.primary[600] },
  feedbackCopy: { flex: 1, gap: 3 },
  feedbackKicker: { fontFamily: Typography.fontFamily, fontSize: 9, color: Colors.neutral[500], textAlign: 'right' },
  feedbackPositive: { fontFamily: Typography.fontFamily, fontSize: 11, lineHeight: 19, color: Colors.success[700], textAlign: 'right' },
  feedbackCorrection: { fontFamily: Typography.fontFamily, fontSize: 11, lineHeight: 19, color: Colors.warning[700], textAlign: 'right' },
  finishedCard: { marginTop: Spacing.xs, padding: Spacing.md, borderRadius: Radius.lg, backgroundColor: Colors.success[500] + '0D', borderWidth: 1, borderColor: Colors.success[500] + '25', gap: 3 },
  finishedTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: Colors.success[700], textAlign: 'right' },
  finishedText: { fontFamily: Typography.fontFamily, fontSize: 11, color: Colors.neutral[500], textAlign: 'right' },
  answerCard: { padding: Spacing.md, paddingBottom: 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E8EAF2', gap: 8 },
  answerCardCompact: { paddingVertical: 8, paddingHorizontal: Spacing.sm, gap: 6 },
  modeRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  modeGroup: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  modeLabel: { fontFamily: Typography.fontFamily, fontSize: 11, color: Colors.neutral[500], marginLeft: 3 },
  modeButton: { minHeight: 30, borderRadius: Radius.full, paddingHorizontal: 12, justifyContent: 'center', backgroundColor: '#F5F6FB' },
  modeButtonActive: { backgroundColor: Colors.primary[500] + '18', borderWidth: 1, borderColor: Colors.primary[500] + '35' },
  modeButtonText: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[500] },
  modeButtonTextActive: { color: Colors.primary[600], fontFamily: Typography.boldFontFamily },
  composeRow: { flexDirection: 'row-reverse', alignItems: 'flex-end', gap: 8 },
  input: { minHeight: 44, maxHeight: 84, borderRadius: Radius.md, backgroundColor: '#F7F8FC', borderWidth: 1, borderColor: '#E3E7F3', paddingHorizontal: Spacing.md, paddingTop: 9, paddingBottom: 8, fontSize: Typography.sizes.sm, lineHeight: 22, color: Colors.neutral[0], textAlignVertical: 'center', includeFontPadding: false },
  composeInput: { flex: 1 },
  submitButtonCompact: { minHeight: 44, paddingHorizontal: 14, borderRadius: Radius.md, backgroundColor: Colors.primary[500], flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6 },
  submitButtonText: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: '#FFFFFF' },
  endButtonInline: { minHeight: 28, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  endButtonText: { fontFamily: Typography.fontFamily, fontSize: 11, color: Colors.error[300] },
  waitingRow: { minHeight: 52, borderRadius: Radius.md, backgroundColor: '#F7F8FC', borderWidth: 1, borderColor: '#E3E7F3', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 7 },
  waitingText: { fontFamily: Typography.fontFamily, fontSize: 11, color: Colors.neutral[500], textAlign: 'right' },
  endedRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm },
  endedCopy: { flex: 1, gap: 2 },
  endedTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: Colors.neutral[200], textAlign: 'right' },
  endedText: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[500], textAlign: 'right' },
  reportButton: { minHeight: 40, paddingHorizontal: 12, borderRadius: Radius.md, backgroundColor: Colors.primary[500], flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6 },
  reportButtonText: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: '#FFFFFF' },
  disabled: { opacity: 0.45 },
  picker: { flex: 1 },
  pickerContent: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xl },
  sharedCard: { padding: Spacing.md, borderRadius: Radius.lg, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E7F2', gap: 9, shadowColor: '#1E1B4B', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  sharedTopRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  sharedKicker: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: Colors.primary[600], textAlign: 'right' },
  pickerLangBadge: { paddingHorizontal: 11, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: Colors.primary[100], borderWidth: 1, borderColor: Colors.primary[400] },
  pickerLangBadgeText: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.primary[700], fontWeight: Typography.weights.bold },
  sharedLevelRow: { flexDirection: 'row-reverse', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  sharedLevelTitle: { flex: 1, fontFamily: Typography.latinFontFamily, fontSize: Typography.sizes.md, fontWeight: '800', color: Colors.neutral[0], textAlign: 'left', writingDirection: 'ltr' },
  compareRow: { flexDirection: 'row-reverse', gap: 8 },
  comparePill: { flex: 1, paddingHorizontal: 10, paddingVertical: 7, borderRadius: Radius.md, backgroundColor: '#F7F8FC', borderWidth: 1, borderColor: '#EAEDF5', alignItems: 'flex-end', gap: 2 },
  compareLabel: { fontFamily: Typography.fontFamily, fontSize: 9, color: Colors.neutral[300] },
  compareValue: { fontFamily: Typography.fontFamily, fontSize: 12, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  sharedExplain: { fontFamily: Typography.fontFamily, fontSize: 11, lineHeight: 20, color: Colors.neutral[200], textAlign: 'right' },
  backToChatBtn: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: '#F1F5F9' },
  backToChatText: { fontFamily: Typography.fontFamily, fontSize: 10, fontWeight: Typography.weights.bold, color: Colors.primary[600] },
  lessonListHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xs },
  lessonListTitle: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: Colors.neutral[0], textAlign: 'right' },
  lessonListCount: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[300] },
  lessonCard: { padding: Spacing.md, borderRadius: Radius.lg, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8EAF2', gap: 6, shadowColor: '#1E1B4B', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  lessonCardActive: { borderColor: Colors.primary[400], borderWidth: 1.5, backgroundColor: '#FAF9FF' },
  lessonCardTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  lessonTitleWrap: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  lessonOrderBadge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  lessonOrderText: { fontFamily: Typography.fontFamily, fontSize: 11, fontWeight: Typography.weights.bold },
  lessonTitle: { flex: 1, fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: Colors.neutral[0], textAlign: 'right' },
  lessonMetaPills: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  currentLessonBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full, backgroundColor: Colors.primary[500] + '18' },
  currentLessonBadgeText: { fontFamily: Typography.fontFamily, fontSize: 9, fontWeight: Typography.weights.bold, color: Colors.primary[600] },
  lessonCount: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[300] },
  lessonSituation: { fontFamily: Typography.fontFamily, fontSize: 11, lineHeight: 19, color: Colors.neutral[200], textAlign: 'right' },
  lessonFooter: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, marginTop: 2 },
  lessonAction: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: Colors.primary[600], textAlign: 'right' },
  pickerNote: { fontFamily: Typography.fontFamily, fontSize: 10, lineHeight: 18, color: Colors.neutral[300], textAlign: 'right' },
  error: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.error[300], textAlign: 'center' },
  reportOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.55)', justifyContent: 'center', padding: Spacing.md, zIndex: 50 },
  reportSheet: { maxHeight: '88%', borderRadius: Radius.xl, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  reportContent: { padding: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.md },
  reportHeader: { flexDirection: 'row-reverse', alignItems: 'flex-start', justifyContent: 'space-between' },
  reportHeaderCopy: { flex: 1, gap: 2 },
  reportKicker: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.primary[600], textAlign: 'right' },
  reportTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.neutral[0], textAlign: 'right' },
  reportClose: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  overallRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: Radius.lg, backgroundColor: Colors.primary[500] + '0A' },
  overallCircle: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: Colors.primary[500] + '35' },
  overallValue: { fontFamily: Typography.fontFamily, fontSize: 26, fontWeight: Typography.weights.bold, color: Colors.primary[600] },
  overallUnit: { fontFamily: Typography.fontFamily, fontSize: 12, color: Colors.primary[600], marginTop: 8 },
  overallCopy: { flex: 1, gap: 3 },
  overallLabel: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: Colors.neutral[200], textAlign: 'right' },
  overallDetail: { fontFamily: Typography.fontFamily, fontSize: 10, lineHeight: 18, color: Colors.neutral[500], textAlign: 'right' },
  metrics: { gap: 9 },
  metricRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 7 },
  metricLabel: { width: 48, fontFamily: Typography.fontFamily, fontSize: 11, color: Colors.neutral[300], textAlign: 'right' },
  metricTrack: { flex: 1, height: 7, borderRadius: 4, backgroundColor: '#EEF0F6', overflow: 'hidden' },
  metricFill: { height: '100%', borderRadius: 4, backgroundColor: Colors.primary[400] },
  metricValue: { width: 34, fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.primary[600], textAlign: 'left' },
  reportBlock: { gap: 6 },
  reportHeading: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: Colors.neutral[0], textAlign: 'right' },
  reportLine: { fontFamily: Typography.fontFamily, fontSize: 11, lineHeight: 19, color: Colors.neutral[400], textAlign: 'right' },
  reportError: { padding: 9, borderRadius: Radius.md, backgroundColor: '#FFF7F7', borderWidth: 1, borderColor: '#FDE0E0', gap: 2 },
  reportErrorTitle: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: Colors.error[400], textAlign: 'right' },
  reportErrorDetail: { fontFamily: Typography.fontFamily, fontSize: 10, lineHeight: 17, color: Colors.neutral[400], textAlign: 'right' },
  reportErrorCorrection: { fontFamily: Typography.fontFamily, fontSize: 10, lineHeight: 17, color: Colors.primary[600], textAlign: 'right' },
  nextPractice: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, padding: 9, borderRadius: Radius.md, backgroundColor: Colors.primary[500] + '0A' },
  nextPracticeText: { flex: 1, fontFamily: Typography.fontFamily, fontSize: 10, lineHeight: 18, color: Colors.primary[700], textAlign: 'right' },
  reportActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  reportPrimary: { flex: 1, minHeight: 44, borderRadius: Radius.md, backgroundColor: Colors.primary[500], alignItems: 'center', justifyContent: 'center' },
  reportPrimaryText: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: '#FFFFFF' },
  reportSecondary: { minHeight: 44, paddingHorizontal: Spacing.md, borderRadius: Radius.md, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  reportSecondaryText: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: Colors.neutral[300] },
});
