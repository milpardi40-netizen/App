import { MANAGEMENT_BUILD } from '@/lib/features';
import { LocalizedText as Text, LocalizedTextInput as TextInput } from '@/components/LocalizedText';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Keyboard, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  RecordingPresets,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { BarChart3, Headphones, Mic, Pause, Play, Send, ShieldCheck, Sparkles, Square, Timer, Trash2, UserRound, Volume2, X } from 'lucide-react-native';
import {
  currentChatUserId,
  deleteConversationForMe,
  getVoiceMessageUrl,
  listMessages,
  sendTextMessage,
  isConversationClosedError,
  recoverSupportConversation,
  sendVoiceMessage,
  subscribeToMessages,
  unsubscribeFromMessages,
  type DirectMessage,
} from '@/lib/conversations';
import { Colors, Radius, Spacing, Typography } from '@/lib/theme';
import { ChatBackButton } from '@/components/ChatBackButton';
import { KeyboardAttachedView } from '@/components/KeyboardAttachedView';
import { ONLINE_AUDIO_DISABLED_MESSAGE, ONLINE_AUDIO_ENABLED } from '@/lib/onlineAudioPolicy';
import { freeConversationPlan } from '@/lib/freeConversation';
import { evaluateHumanConversation, type HumanConversationEvaluation } from '@/lib/humanConversationEvaluation';

const containsRtlScript = (value: string) => /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(value);

function VoiceMessage({ message }: { message: DirectMessage }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const player = useAudioPlayer(url ? { uri: url } : null);
  const status = useAudioPlayerStatus(player);
  const [autoplay, setAutoplay] = useState(false);

  // Changing the source makes useAudioPlayer release the previous native player, so the
  // first play must target the player created for the new URL (not a stale closure).
  useEffect(() => {
    if (!autoplay || !url || !status.isLoaded) return;
    setAutoplay(false);
    try {
      player.play();
    } catch {
      setError(true);
    }
  }, [autoplay, url, status.isLoaded, player]);

  const toggle = async () => {
    try {
      if (!url && message.mediaPath) {
        const signedUrl = await getVoiceMessageUrl(message.mediaPath);
        setAutoplay(true);
        setUrl(signedUrl);
      } else if (status.playing) {
        player.pause();
      } else {
        if (status.didJustFinish) await player.seekTo(0);
        player.play();
      }
    } catch {
      setError(true);
    }
  };

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`پخش پیام صوتی، ${message.body || '۱'} ثانیه`} style={styles.voiceMessage} onPress={() => void toggle()}>
      <View style={styles.voicePlay}>
        {!url && !error ? <Play size={16} color={Colors.neutral[50]} fill={Colors.neutral[50]} /> : status.playing ? <Pause size={16} color={Colors.neutral[50]} fill={Colors.neutral[50]} /> : <Play size={16} color={Colors.neutral[50]} fill={Colors.neutral[50]} />}
      </View>
      <View style={styles.wave}><View style={styles.waveLine} /><View style={[styles.waveLine, { height: 20 }]} /><View style={[styles.waveLine, { height: 12 }]} /><View style={[styles.waveLine, { height: 24 }]} /><View style={[styles.waveLine, { height: 16 }]} /></View>
      <Text style={styles.voiceDuration}>{error ? 'خطا' : `${message.body || '1'} ثانیه`}</Text>
    </Pressable>
  );
}

function EvaluationCard({ evaluation, onClose }: { evaluation: HumanConversationEvaluation; onClose: () => void }) {
  const metric = (label: string, value: number) => <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><View style={styles.metricTrack}><View style={[styles.metricFill, { width: `${value}%` }]} /></View><Text style={styles.metricValue}>{value}٪</Text></View>;
  return (
    <View style={styles.evaluationCard}>
      <View style={styles.evaluationHeader}><View><Text style={styles.evaluationKicker}>گزارش پایان مکالمه</Text><Text style={styles.evaluationTitle}>تحلیل تمرین شما</Text></View><Pressable accessibilityRole="button" accessibilityLabel="بستن گزارش" onPress={onClose} style={styles.closeReport}><X size={17} color={Colors.neutral[400]} /></Pressable></View>
      <View style={styles.overallRow}><View style={styles.overallCircle}><Text style={styles.overallValue}>{evaluation.overall}</Text><Text style={styles.overallUnit}>٪</Text></View><View style={styles.overallCopy}><Text style={styles.overallLabel}>امتیاز کلی</Text><Text style={styles.overallDetail}>{evaluation.messagesAnalyzed} پیام و {evaluation.wordsSpoken} واژه تحلیل شد.</Text></View></View>
      <View style={styles.metrics}>{metric('روانی', evaluation.fluency)}{metric('واژگان', evaluation.vocabulary)}{metric('تعامل', evaluation.interaction)}{metric('شفافیت', evaluation.clarity)}</View>
      <View style={styles.feedbackBlock}><Text style={styles.feedbackHeading}>نقاط قوت</Text>{evaluation.strengths.map(item => <Text key={item} style={styles.feedbackLine}>✓ {item}</Text>)}</View>
      <View style={styles.feedbackBlock}><Text style={styles.feedbackHeading}>خطاها و پیشنهاد اصلاح</Text>{evaluation.errors.length ? evaluation.errors.slice(0, 4).map(item => <View key={item.title} style={styles.errorItem}><Text style={styles.errorTitle}>{item.title}</Text><Text style={styles.errorDetail}>{item.detail}</Text>{item.correction ? <Text style={styles.errorCorrection}>{item.correction}</Text> : null}</View>) : <Text style={styles.feedbackLine}>خطای مهمی برای اصلاح پیدا نشد.</Text>}</View>
      <View style={styles.nextPractice}><Sparkles size={15} color={Colors.primary[400]} /><Text style={styles.nextPracticeText}>{evaluation.nextPractice}</Text></View>
    </View>
  );
}

export default function HumanConversationScreen() {
  const router = useRouter();
  const { conversationId, name, lessonId, lessonTitle, levelId, situation, language } = useLocalSearchParams<{ conversationId: string; name?: string; lessonId?: string; lessonTitle?: string; levelId?: string; situation?: string; language?: string }>();
  const freePlan = lessonTitle ? freeConversationPlan({
    language: language === 'ru' ? 'ru' : 'en',
    levelId: Number(levelId || 1),
    lessonId: String(lessonId || ''),
    lessonTitle: String(lessonTitle),
    situation: String(situation || ''),
  }) : null;
  const scrollRef = useRef<ScrollView>(null);
  // The composer is translated up over the message list when the keyboard opens, so the
  // list itself is not resized; reserve exactly the hidden height at the bottom and keep
  // the newest message in view.
  const [keyboardInset, setKeyboardInset] = useState(0);
  const composerHeight = useRef(0);
  useEffect(() => {
    const measure = (keyboardTop: number) => {
      const node = scrollRef.current as unknown as { measureInWindow?: (callback: (x: number, y: number, width: number, height: number) => void) => void } | null;
      if (!node?.measureInWindow) return;
      node.measureInWindow((_x, y, _w, h) => {
        // Hidden = list bottom minus the composer's new top (keyboard edge − composer − Android lift).
        const composerTop = keyboardTop - composerHeight.current - (Platform.OS === 'android' ? 36 : 0);
        setKeyboardInset(Math.max(0, Math.round(y + h - composerTop)));
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
      });
    };
    const subscriptions = [
      Keyboard.addListener('keyboardDidShow', event => measure(event.endCoordinates.screenY)),
      Keyboard.addListener('keyboardDidHide', () => setKeyboardInset(0)),
    ];
    return () => subscriptions.forEach(subscription => subscription.remove());
  }, []);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [showEvaluation, setShowEvaluation] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const myTurnMessages = messages.filter(message => message.senderId === myId && (message.type === 'text' || message.type === 'voice'));
  const partnerTurnMessages = messages.filter(message => message.senderId !== myId && (message.type === 'text' || message.type === 'voice'));
  const freeStep = freePlan ? Math.min(myTurnMessages.length, freePlan.prompts.length) : 0;
  const activeFreePrompt = freePlan && freeStep < freePlan.prompts.length ? freePlan.prompts[freeStep] : null;
  const myTurn = myTurnMessages.length <= partnerTurnMessages.length;
  const activeTurnPrompt = freePlan ? (freeStep === 0 ? freePlan.starter : activeFreePrompt || 'حالا یک پرسش مرتبط از هم‌صحبت بپرس.') : 'به موضوع درس پاسخ بده و گفت‌وگو را ادامه بده.';
  const roomLevel = levelId ? `سطح ${String(levelId)}` : 'سطح آزاد';
  const roomTopic = String(situation || freePlan?.title || 'گفت‌وگوی روزمره');
  const evaluation = useMemo<HumanConversationEvaluation>(() => evaluateHumanConversation(messages, myId, language === 'ru' ? 'ru' : 'en'), [language, messages, myId]);

  const addMessage = (message: DirectMessage) => {
    setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
  };

  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof subscribeToMessages> | null = null;
    Promise.all([listMessages(conversationId), currentChatUserId()])
      .then(([rows, userId]) => {
        if (!active) return;
        setMessages(rows);
        setMyId(userId);
        channel = subscribeToMessages(conversationId, addMessage);
        setError(null);
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'گفتگو باز نشد.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => {
      active = false;
      void unsubscribeFromMessages(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (router.canGoBack()) router.back();
      else router.replace((MANAGEMENT_BUILD ? '/admin/chats' : '/conversations') as never);
      return true;
    });
    return () => subscription.remove();
  }, [router]);

  const send = async () => {
    const clean = input.trim();
    if (!clean || sending) return;
    if (!myTurn) { setError('اکنون نوبت هم‌صحبت است؛ بعد از پاسخ او ادامه بده.'); return; }
    const context = `${freePlan?.mission || ''} ${freePlan?.title || ''} ${freePlan?.prompts.join(' ') || ''} ${situation || ''}`.toLowerCase();
    const answerWords = clean.toLowerCase().split(/\s+/).filter(Boolean);
    const contextWords = context.split(/\s+/).filter(word => word.length > 3);
    const related = answerWords.length >= 2 && (answerWords.some(word => contextWords.some(contextWord => contextWord.includes(word) || word.includes(contextWord))) || clean.length >= 18);
    if (!related) { setError('این پاسخ هنوز به مأموریت مکالمه مرتبط نیست. به پرسش فعلی پاسخ بده یا یک جزئیات مرتبط اضافه کن.'); return; }
    setSending(true);
    setInput('');
    try {
      addMessage(await sendTextMessage(conversationId, clean));
      setError(null);
    } catch (cause) {
      if (isConversationClosedError(cause)) {
        // The manager closed this thread; move to the fresh support conversation and resend there.
        const replacement = await recoverSupportConversation(conversationId);
        if (replacement) {
          try {
            await sendTextMessage(replacement, clean);
            setError(null);
            router.replace(`/conversations/human/${replacement}` as never);
            return;
          } catch (retryCause) {
            setInput(clean);
            setError(retryCause instanceof Error ? retryCause.message : 'پیام ارسال نشد.');
            return;
          }
        }
      }
      setInput(clean);
      setError(cause instanceof Error ? cause.message : 'پیام ارسال نشد.');
    } finally {
      setSending(false);
    }
  };


  const startRecording = async () => {
    if (!ONLINE_AUDIO_ENABLED) { setError(ONLINE_AUDIO_DISABLED_MESSAGE); return; }
    if (!myTurn) { setError('اکنون نوبت هم‌صحبت است؛ بعد از پاسخ او ادامه بده.'); return; }
    if (sending || recorderState.isRecording) return;
    try {
      setError(null);
      let permission = await getRecordingPermissionsAsync();
      if (!permission.granted) permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) throw new Error('برای پیام صوتی، اجازه میکروفن را در تنظیمات گوشی فعال کنید.');
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      try {
        await recorder.prepareToRecordAsync();
      } catch {
        // First use right after granting permission can fail once on some devices; retry.
        await new Promise((resolve) => setTimeout(resolve, 250));
        await recorder.prepareToRecordAsync();
      }
      recorder.record();
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? `ضبط صدا شروع نشد: ${cause.message}` : 'ضبط صدا شروع نشد.');
    }
  };

  const stopAndSendRecording = async () => {
    if (!ONLINE_AUDIO_ENABLED) { setError(ONLINE_AUDIO_DISABLED_MESSAGE); return; }
    if (!myTurn) { setError('اکنون نوبت هم‌صحبت است؛ بعد از پاسخ او ادامه بده.'); return; }
    if (!recorderState.isRecording || sending) return;
    const duration = Math.max(1, Math.round(recorderState.durationMillis / 1000));
    setSending(true);
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      if (!recorder.uri) throw new Error('فایل صدای ضبط‌شده پیدا نشد.');
      addMessage(await sendVoiceMessage(conversationId, recorder.uri, duration));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'پیام صوتی ارسال نشد.');
    } finally {
      setSending(false);
    }
  };

  const confirmDeleteConversation = () => {
    Alert.alert(
      'حذف مخاطب و گفتگو',
      `گفتگو با «${name || 'این مخاطب'}» از این دستگاه حذف شود؟ پیام‌ها برای مخاطب مقابل باقی می‌مانند.`,
      [
        { text: 'انصراف', style: 'cancel' },
        {
          text: 'حذف برای من',
          style: 'destructive',
          onPress: () => {
            setSending(true);
            void deleteConversationForMe(conversationId)
              .then(() => router.replace((MANAGEMENT_BUILD ? '/admin/chats' : '/conversations') as never))
              .catch(cause => setError(cause instanceof Error ? cause.message : 'حذف گفتگو انجام نشد.'))
              .finally(() => setSending(false));
          },
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <ChatBackButton fallback={MANAGEMENT_BUILD ? '/admin/chats' : '/conversations'} />
        <View style={styles.avatar}><UserRound size={22} color={Colors.primary[300]} /></View>
        <View style={styles.headerText}><Text style={[styles.name, containsRtlScript(name || 'مخاطب واقعی') ? styles.rtlText : styles.ltrText]}>{name || 'مخاطب واقعی'}</Text><View style={styles.onlineRow}><View style={styles.onlineDot} /><Text style={styles.status}>آمادهٔ مکالمه</Text></View></View>
        <Pressable accessibilityRole="button" accessibilityLabel="حذف این مخاطب و گفتگو" accessibilityState={{ disabled: sending }} style={styles.deleteButton} onPress={confirmDeleteConversation} disabled={sending}><Trash2 size={18} color={Colors.error[300]} /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="نمایش گزارش مکالمه" style={styles.reportButton} onPress={() => setShowEvaluation(true)}><BarChart3 size={18} color={Colors.primary[400]} /></Pressable>
        <ShieldCheck size={20} color={Colors.success[400]} />
      </View>

      <View style={styles.roomBar}>
        <View style={styles.roomBarTop}>
          <View style={styles.roomIdentity}><Headphones size={17} color={Colors.primary[400]} /><Text style={styles.roomTitle}>اتاق تمرین مکالمه</Text></View>
          <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>زنده</Text></View>
        </View>
        <Text style={styles.roomTopic}>{roomTopic}</Text>
        <View style={styles.roomMetaRow}>
          <View style={styles.metaChip}><Text style={styles.metaChipText}>{roomLevel}</Text></View>
          <View style={styles.metaChip}><Timer size={13} color={Colors.neutral[400]} /><Text style={styles.metaChipText}>مکالمهٔ آزاد</Text></View>
          <View style={styles.metaChip}><Volume2 size={13} color={Colors.success[400]} /><Text style={styles.metaChipText}>نوبتی</Text></View>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary[400]} /><Text style={styles.centerText}>در حال بازکردن گفتگو…</Text></View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={[styles.messageContent, keyboardInset > 0 && { paddingBottom: keyboardInset + Spacing.md }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
            {freePlan ? (
              <View style={styles.missionCard}>
                <View style={styles.freePlanHeader}><Sparkles size={15} color={Colors.warning[400]} /><Text style={styles.freePlanKicker}>مأموریت مرتبط با درس · نوبت {freeStep + 1}</Text></View>
                <Text style={styles.freePlanTitle}>{freePlan.title}</Text>
                <Text style={styles.freePlanMission}>{freePlan.mission}</Text>
                <View style={styles.promptBox}><Text style={styles.promptLabel}>{myTurn ? 'نوبت شماست — پاسخ بده' : 'نوبت هم‌صحبت است — گوش بده'}</Text><Text style={styles.freePlanStarter}>{activeTurnPrompt}</Text></View>
                {activeFreePrompt ? <Text style={styles.freePlanPrompt}>پاسخ باید به این پرسش مرتبط باشد: {activeFreePrompt}</Text> : null}
              </View>
            ) : null}
            <View style={styles.privateNote}><ShieldCheck size={14} color={Colors.success[400]} /><Text style={styles.privateText}>فقط شما و این مخاطب پیام‌ها را می‌بینید.</Text></View>
            <View style={[styles.turnBanner, !myTurn && styles.turnBannerWaiting]}><View style={styles.turnIcon}><Mic size={15} color={myTurn ? Colors.primary[400] : Colors.success[400]} /></View><View style={styles.turnCopy}><Text style={styles.turnTitle}>{myTurn ? 'فقط پاسخ مرتبط با مأموریت' : 'در حال گوش دادن به هم‌صحبت'}</Text><Text style={styles.turnText}>{myTurn ? 'پاسخ را گفتاری یا نوشتاری بفرست؛ پیام آزاد و خارج از موضوع ارسال نمی‌شود.' : 'پس از پاسخ هم‌صحبت، نوبت شما به‌صورت خودکار باز می‌شود.'}</Text></View></View>
            {showEvaluation ? <EvaluationCard evaluation={evaluation} onClose={() => setShowEvaluation(false)} /> : null}
          {!messages.length ? (
            <View style={styles.empty}><Text style={styles.emptyEmoji}>👋</Text><Text style={styles.emptyTitle}>گفتگو را شروع کنید</Text><Text style={styles.emptyDesc}>یک سلام ساده انگلیسی بهترین شروع است.</Text></View>
          ) : messages.map((message) => {
            const mine = message.senderId === myId;
            return (
              <View key={message.id} style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                {message.type === 'voice' ? <VoiceMessage message={message} /> : <Text style={[styles.messageText, containsRtlScript(message.body || '') ? styles.rtlText : styles.ltrText]}>{message.body}</Text>}
                <Text style={styles.time}>{new Date(message.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      <KeyboardAttachedView onLayout={event => { composerHeight.current = event.nativeEvent.layout.height; }}>
      <View style={styles.modeSwitch}><Text style={styles.modeLabel}>نوع پاسخ:</Text><Pressable accessibilityRole="button" accessibilityState={{ selected: inputMode === 'text' }} style={[styles.modeButton, inputMode === 'text' && styles.modeButtonActive]} onPress={() => setInputMode('text')}><Text style={[styles.modeButtonText, inputMode === 'text' && styles.modeButtonTextActive]}>نوشتاری</Text></Pressable><Pressable accessibilityRole="button" accessibilityState={{ selected: inputMode === 'voice' }} style={[styles.modeButton, inputMode === 'voice' && styles.modeButtonActive]} onPress={() => setInputMode('voice')}><Text style={[styles.modeButtonText, inputMode === 'voice' && styles.modeButtonTextActive]}>گفتاری</Text></Pressable></View>
      {recorderState.isRecording ? <View style={styles.recording}><View style={styles.recordDot} /><Text style={styles.recordingText}>در حال ضبط · {Math.max(1, Math.round(recorderState.durationMillis / 1000))} ثانیه · برای ارسال دوباره بزنید</Text></View> : null}
      {!ONLINE_AUDIO_ENABLED ? <View style={styles.audioNotice}><ShieldCheck size={14} color={Colors.success[300]} /><Text style={styles.audioNoticeText}>{ONLINE_AUDIO_DISABLED_MESSAGE} پخش پیام‌های دریافتی همچنان در دسترس است.</Text></View> : null}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <View style={styles.composer}>
        {inputMode === 'text' ? <TextInput
          accessibilityLabel="متن پیام فارسی یا انگلیسی"
          style={[styles.input, containsRtlScript(input || 'پیام') ? styles.rtlText : styles.ltrText]}
          value={input}
          onChangeText={setInput}
          onFocus={() => undefined}
          placeholder={myTurn ? 'پاسخ مرتبط با مأموریت را بنویسید…' : 'منتظر پاسخ هم‌صحبت باشید…'}
          placeholderTextColor={Colors.neutral[600]}
          multiline
        /> : <View style={styles.voiceModeHint}><Mic size={20} color={Colors.primary[400]} /><Text style={styles.voiceModeText}>{ONLINE_AUDIO_ENABLED ? 'برای پاسخ مرتبط، صحبت کن و دکمه را بزن' : 'ضبط گفتاری فعلاً در دسترس نیست؛ نوشتاری را انتخاب کن'}</Text></View>}
        {inputMode === 'text' ? (
          <Pressable accessibilityRole="button" accessibilityLabel="ارسال پاسخ مرتبط" accessibilityState={{ disabled: sending || !myTurn }} style={[styles.send, (sending || !myTurn) && styles.disabled]} disabled={sending || !myTurn} onPress={() => void send()}>{sending ? <ActivityIndicator size="small" color={Colors.onColor} /> : <Send size={18} color={Colors.onColor} />}</Pressable>
        ) : (
          <Pressable accessibilityRole="button" accessibilityLabel={ONLINE_AUDIO_ENABLED ? 'شروع یا پایان ضبط پیام صوتی' : 'ضبط و ارسال پیام صوتی فعلاً غیرفعال است'} accessibilityHint={!ONLINE_AUDIO_ENABLED ? ONLINE_AUDIO_DISABLED_MESSAGE : undefined} accessibilityState={{ disabled: !ONLINE_AUDIO_ENABLED || sending }} style={[styles.send, recorderState.isRecording && styles.recordStop, (sending || !ONLINE_AUDIO_ENABLED) && styles.disabled]} disabled={sending || !ONLINE_AUDIO_ENABLED} onPress={() => recorderState.isRecording ? void stopAndSendRecording() : void startRecording()}>
            {sending ? <ActivityIndicator size="small" color={Colors.onColor} /> : recorderState.isRecording ? <Square size={16} color={Colors.onColor} fill={Colors.onColor} /> : <Mic size={19} color={Colors.onColor} />}
          </Pressable>
        )}
      </View>
      </KeyboardAttachedView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F8FC' },
  header: { paddingTop: 13, paddingHorizontal: Spacing.md, paddingBottom: 12, minHeight: 70, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8EAF2', flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.primary[500] + '15', borderWidth: 1, borderColor: Colors.primary[500] + '30', alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  name: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  onlineRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, marginTop: 3 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.success[500] },
  status: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.success[600], textAlign: 'right' },
  deleteButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.error[500] + '12', alignItems: 'center', justifyContent: 'center' },
  reportButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primary[500] + '12', alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  centerText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[500] },
  roomBar: { marginHorizontal: Spacing.md, marginTop: Spacing.md, padding: Spacing.md, borderRadius: Radius.xl, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E3E7F3', shadowColor: '#312E81', shadowOpacity: 0.07, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 2, gap: 7 },
  roomBarTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  roomIdentity: { flexDirection: 'row-reverse', alignItems: 'center', gap: 7 },
  roomTitle: { fontFamily: Typography.boldFontFamily, fontSize: 14, color: Colors.neutral[0], textAlign: 'right' },
  liveBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: Colors.success[500] + '12' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success[500] },
  liveText: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.success[600] },
  roomTopic: { fontFamily: Typography.boldFontFamily, fontSize: 16, color: Colors.primary[700], textAlign: 'right' },
  roomMetaRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 },
  metaChip: { minHeight: 27, borderRadius: Radius.full, paddingHorizontal: 9, backgroundColor: '#F5F6FB', flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  metaChipText: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[300] },
  messages: { flex: 1, minHeight: 0 },
  messageContent: { flexGrow: 1, padding: Spacing.md, gap: 10 },
  privateNote: { alignSelf: 'center', flexDirection: 'row-reverse', alignItems: 'center', gap: 5, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: Colors.success[500] + '0D', marginBottom: 2 },
  privateText: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.success[400] },
  turnBanner: { flexDirection: 'row-reverse', alignItems: 'center', gap: 9, padding: 11, borderRadius: Radius.lg, backgroundColor: Colors.primary[500] + '0B', borderWidth: 1, borderColor: Colors.primary[500] + '20' },
  turnBannerWaiting: { backgroundColor: Colors.success[500] + '0B', borderColor: Colors.success[500] + '25' },
  turnIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary[500] + '18', alignItems: 'center', justifyContent: 'center' },
  turnCopy: { flex: 1, gap: 2 },
  turnTitle: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: Colors.primary[700], textAlign: 'right' },
  turnText: { fontFamily: Typography.fontFamily, fontSize: 10, lineHeight: 17, color: Colors.neutral[300], textAlign: 'right' },
  evaluationCard: { borderRadius: Radius.xl, padding: Spacing.md, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: Colors.primary[500] + '28', gap: 12, shadowColor: '#312E81', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  evaluationHeader: { flexDirection: 'row-reverse', alignItems: 'flex-start', justifyContent: 'space-between' },
  evaluationKicker: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.primary[400], textAlign: 'right' },
  evaluationTitle: { fontFamily: Typography.boldFontFamily, fontSize: 17, color: Colors.neutral[0], textAlign: 'right', marginTop: 2 },
  closeReport: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F5F6FB', alignItems: 'center', justifyContent: 'center' },
  overallRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, padding: 10, borderRadius: Radius.lg, backgroundColor: Colors.primary[500] + '0A' },
  overallCircle: { width: 68, height: 68, borderRadius: 34, borderWidth: 5, borderColor: Colors.primary[400], alignItems: 'center', justifyContent: 'center' },
  overallValue: { fontFamily: Typography.boldFontFamily, fontSize: 21, color: Colors.primary[700], lineHeight: 24 },
  overallUnit: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.primary[400] },
  overallCopy: { flex: 1, gap: 3 },
  overallLabel: { fontFamily: Typography.boldFontFamily, fontSize: 14, color: Colors.neutral[0], textAlign: 'right' },
  overallDetail: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[300], textAlign: 'right' },
  metrics: { gap: 8 },
  metric: { flexDirection: 'row-reverse', alignItems: 'center', gap: 7 },
  metricLabel: { width: 48, fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[300], textAlign: 'right' },
  metricTrack: { flex: 1, height: 7, borderRadius: 4, backgroundColor: '#EEF0F6', overflow: 'hidden' },
  metricFill: { height: '100%', borderRadius: 4, backgroundColor: Colors.primary[400] },
  metricValue: { width: 31, fontFamily: Typography.boldFontFamily, fontSize: 10, color: Colors.primary[600], textAlign: 'left' },
  feedbackBlock: { gap: 5 },
  feedbackHeading: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: Colors.neutral[0], textAlign: 'right' },
  feedbackLine: { fontFamily: Typography.fontFamily, fontSize: 11, lineHeight: 19, color: Colors.neutral[300], textAlign: 'right' },
  errorItem: { padding: 8, borderRadius: Radius.md, backgroundColor: '#FFF7F7', borderWidth: 1, borderColor: '#FDE0E0', gap: 2 },
  errorTitle: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: Colors.error[400], textAlign: 'right' },
  errorDetail: { fontFamily: Typography.fontFamily, fontSize: 10, lineHeight: 17, color: Colors.neutral[300], textAlign: 'right' },
  errorCorrection: { fontFamily: Typography.fontFamily, fontSize: 10, lineHeight: 17, color: Colors.primary[600], textAlign: 'right' },
  nextPractice: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, padding: 9, borderRadius: Radius.md, backgroundColor: Colors.primary[500] + '0A' },
  nextPracticeText: { flex: 1, fontFamily: Typography.fontFamily, fontSize: 10, lineHeight: 18, color: Colors.primary[700], textAlign: 'right' },
  freePlanCard: { borderRadius: Radius.xl, padding: Spacing.md, backgroundColor: Colors.warning[500] + '0B', borderWidth: 1, borderColor: Colors.warning[500] + '25', gap: 6 },
  freePlanHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  freePlanKicker: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.warning[300], textAlign: 'right' },
  freePlanTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.neutral[100], textAlign: 'right' },
  freePlanMission: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, lineHeight: 20, color: Colors.neutral[300], textAlign: 'right' },
  freePlanStarter: { fontFamily: Typography.latinFontFamily, fontSize: 14, lineHeight: 20, color: Colors.neutral[100], textAlign: 'left', writingDirection: 'ltr', backgroundColor: Colors.neutral[900], borderRadius: Radius.md, padding: Spacing.sm },
  freePlanStep: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.success[400], textAlign: 'right' },
  freePlanPrompt: { fontFamily: Typography.fontFamily, fontSize: 10, lineHeight: 18, color: Colors.neutral[400], textAlign: 'right' },
  empty: { flex: 1, minHeight: 300, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 42 },
  emptyTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.neutral[200], marginTop: Spacing.md },
  emptyDesc: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Colors.neutral[600], marginTop: 4 },
  bubble: { maxWidth: '86%', borderRadius: 20, padding: Spacing.md, borderWidth: 1, shadowColor: '#334155', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  mine: { alignSelf: 'flex-end', backgroundColor: '#EEF0FF', borderColor: '#DCDFFF', borderBottomRightRadius: 6 },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderColor: '#E5E7EF', borderBottomLeftRadius: 6 },
  messageText: { fontSize: 16, lineHeight: 24, color: '#1F2937' },
  rtlText: { fontFamily: Typography.fontFamily, textAlign: 'right', writingDirection: 'rtl' },
  ltrText: { fontFamily: Typography.latinFontFamily, fontWeight: '800', textAlign: 'left', writingDirection: 'ltr' },
  time: { fontFamily: Typography.fontFamily, fontSize: 9, color: '#6B7280', marginTop: 5, textAlign: 'left' },
  voiceMessage: { minWidth: 190, flexDirection: 'row', alignItems: 'center', gap: 9 },
  voicePlay: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#1F293722', alignItems: 'center', justifyContent: 'center' },
  wave: { flex: 1, height: 28, flexDirection: 'row', gap: 4, alignItems: 'center' },
  waveLine: { width: 3, height: 9, borderRadius: 2, backgroundColor: '#475569' },
  voiceDuration: { fontFamily: Typography.fontFamily, fontSize: 9, color: '#475569' },
  coach: { padding: Spacing.md, backgroundColor: Colors.warning[500] + '0B', borderTopWidth: 1, borderTopColor: Colors.warning[500] + '20', gap: 8 },
  coachTitleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  coachTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold, color: Colors.warning[300] },
  coachActions: { flexDirection: 'row-reverse', gap: 7 },
  coachAction: { flex: 1, minHeight: 34, borderRadius: Radius.md, backgroundColor: Colors.neutral[850], flexDirection: 'row-reverse', gap: 5, alignItems: 'center', justifyContent: 'center' },
  coachActionText: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[300] },
  assistResult: { borderRadius: Radius.md, backgroundColor: Colors.neutral[900], padding: Spacing.sm, gap: 5 },
  assistPrimary: { fontFamily: Typography.latinFontFamily, fontSize: 14, lineHeight: 20, fontWeight: '800', color: Colors.neutral[50], textAlign: 'left', writingDirection: 'ltr' },
  assistExplanation: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[500], textAlign: 'right' },
  useSuggestion: { alignSelf: 'flex-end', borderRadius: Radius.full, backgroundColor: Colors.primary[500], paddingHorizontal: 10, paddingVertical: 6 },
  useSuggestionText: { fontFamily: Typography.fontFamily, fontSize: 9, color: Colors.onColor },
  alternative: { fontFamily: Typography.latinFontFamily, fontSize: 12, fontWeight: '800', color: Colors.primary[200], textAlign: 'left', writingDirection: 'ltr', paddingVertical: 3 },
  missionCard: { borderRadius: Radius.xl, padding: Spacing.md, backgroundColor: '#FFFCF5', borderWidth: 1, borderColor: Colors.warning[500] + '35', gap: 7 },
  promptBox: { borderRadius: Radius.lg, padding: 11, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: Colors.primary[500] + '25', gap: 5 },
  promptLabel: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: Colors.primary[600], textAlign: 'right' },
  modeSwitch: { minHeight: 42, paddingHorizontal: Spacing.md, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E8EAF2', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'flex-start', gap: 7 },
  modeLabel: { fontFamily: Typography.fontFamily, fontSize: 11, color: Colors.neutral[300], marginLeft: 3 },
  modeButton: { minHeight: 30, borderRadius: Radius.full, paddingHorizontal: 12, justifyContent: 'center', backgroundColor: '#F5F6FB' },
  modeButtonActive: { backgroundColor: Colors.primary[500] + '18', borderWidth: 1, borderColor: Colors.primary[500] + '35' },
  modeButtonText: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.neutral[300] },
  modeButtonTextActive: { color: Colors.primary[600], fontFamily: Typography.boldFontFamily },
  voiceModeHint: { flex: 1, minHeight: 44, borderRadius: 22, paddingHorizontal: 12, backgroundColor: Colors.primary[500] + '0A', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 7 },
  voiceModeText: { flexShrink: 1, fontFamily: Typography.fontFamily, fontSize: 10, lineHeight: 17, color: Colors.primary[600], textAlign: 'right' },
  recording: { minHeight: 34, backgroundColor: Colors.error[500] + '12', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 7 },
  recordDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.error[400] },
  recordingText: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.error[300] },
  audioNotice: { minHeight: 34, paddingHorizontal: Spacing.md, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: Colors.success[500] + '0D' },
  audioNoticeText: { flexShrink: 1, fontFamily: Typography.fontFamily, fontSize: 9, lineHeight: 16, color: Colors.success[300], textAlign: 'right' },
  error: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.error[300], textAlign: 'center', paddingHorizontal: Spacing.md, paddingTop: 6, backgroundColor: Colors.neutral[900] },
  composer: { flexShrink: 0, minHeight: 70, overflow: 'visible', padding: Spacing.sm, paddingBottom: 12, paddingTop: 9, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E8EAF2', flexDirection: 'row-reverse', alignItems: 'center', gap: 7 },
  helper: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4FA', alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, minHeight: 44, maxHeight: 100, borderRadius: 22, backgroundColor: '#F7F8FC', borderWidth: 1, borderColor: '#E3E7F3', paddingHorizontal: Spacing.md, paddingTop: 10, paddingBottom: 8, fontSize: Typography.sizes.sm, lineHeight: 22, color: Colors.neutral[0], textAlignVertical: 'center', includeFontPadding: false },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary[500], alignItems: 'center', justifyContent: 'center' },
  recordStop: { backgroundColor: Colors.error[500] },
  disabled: { opacity: .4 },
});
