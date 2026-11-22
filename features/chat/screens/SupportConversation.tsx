import { MANAGEMENT_BUILD } from '@/lib/features';
import { LocalizedText as Text, LocalizedTextInput as TextInput } from '@/components/LocalizedText';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Mic2, Send, ShieldCheck } from 'lucide-react-native';
import {
  currentChatUserId,
  isConversationClosedError,
  listMessages,
  recoverSupportConversation,
  sendTextMessage,
  subscribeToMessages,
  unsubscribeFromMessages,
  type DirectMessage,
} from '@/lib/conversations';
import { ChatBackButton } from '@/components/ChatBackButton';
import { KeyboardAttachedView } from '@/components/KeyboardAttachedView';
import { Colors, Spacing, Typography } from '@/lib/theme';
import { formatTime } from '@/lib/format';

const containsRtlScript = (value: string) => /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(value);

/**
 * Support / manager threads keep free text. The turn-based mission room is for
 * learner practice; a support conversation must not force the manager or the
 * learner through lesson missions.
 */
export default function SupportConversation({ conversationId, name, support }: { conversationId: string; name?: string; support?: string }) {
  const router = useRouter();
  const isSupport = support === '1' || /پشتیبانی|support/i.test(name || '');
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = (message: DirectMessage) => {
    setMessages(current => (current.some(item => item.id === message.id) ? current : [...current, message]));
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
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : 'گفتگو باز نشد.'); })
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
    setSending(true);
    setInput('');
    try {
      addMessage(await sendTextMessage(conversationId, clean));
      setError(null);
    } catch (cause) {
      if (isConversationClosedError(cause) && isSupport) {
        const replacement = await recoverSupportConversation(conversationId);
        if (replacement) {
          try {
            await sendTextMessage(replacement, clean);
            setError(null);
            router.replace({ pathname: '/conversations/human/[conversationId]', params: { conversationId: replacement, support: '1' } } as never);
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

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <ChatBackButton fallback={MANAGEMENT_BUILD ? '/admin/chats' : '/conversations'} />
        <View style={styles.avatar}><ShieldCheck size={20} color={Colors.primary[300]} /></View>
        <View style={styles.headerText}>
          <Text style={[styles.name, containsRtlScript(name || 'پشتیبانی') ? styles.rtlText : styles.ltrText]}>{name || 'پشتیبانی'}</Text>
          <Text style={styles.status}>{isSupport ? 'گفت‌وگوی پشتیبانی' : 'گفت‌وگوی آزاد'}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary[400]} /><Text style={styles.centerText}>در حال بازکردن گفتگو…</Text></View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messageContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {!messages.length ? (
            <View style={styles.empty}><Text style={styles.emptyTitle}>گفت‌وگو را شروع کنید</Text><Text style={styles.emptyDesc}>پیام خود را بنویسید و ارسال کنید.</Text></View>
          ) : messages.map(message => {
            const mine = message.senderId === myId;
            return (
              <View key={message.id} style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                {message.type === 'voice'
                  ? <View style={styles.voiceRow}><Mic2 size={15} color="#475569" /><Text style={styles.voiceText}>پیام صوتی</Text></View>
                  : <Text style={[styles.messageText, containsRtlScript(message.body || '') ? styles.rtlText : styles.ltrText]}>{message.body}</Text>}
                <Text style={styles.time}>{formatTime(message.createdAt)}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      <KeyboardAttachedView>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <View style={styles.composer}>
          <TextInput
            accessibilityLabel="پیام پشتیبانی"
            style={[styles.input, containsRtlScript(input || 'پیام') ? styles.rtlText : styles.ltrText]}
            value={input}
            onChangeText={setInput}
            placeholder="پیام خود را بنویسید…"
            placeholderTextColor={Colors.neutral[600]}
            multiline
            editable={!sending}
          />
          <Pressable accessibilityRole="button" accessibilityLabel="ارسال پیام" accessibilityState={{ disabled: sending || !input.trim() }} style={[styles.send, (sending || !input.trim()) && styles.disabled]} disabled={sending || !input.trim()} onPress={() => void send()}>
            {sending ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Send size={18} color="#FFFFFF" />}
          </Pressable>
        </View>
      </KeyboardAttachedView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F8FC' },
  header: { paddingTop: 13, paddingHorizontal: Spacing.md, paddingBottom: 12, minHeight: 70, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8EAF2', flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary[500] + '15', borderWidth: 1, borderColor: Colors.primary[500] + '30', alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  name: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.neutral[0] },
  status: { fontFamily: Typography.fontFamily, fontSize: 10, color: Colors.primary[600], textAlign: 'right', marginTop: 3 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  centerText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[600] },
  messages: { flex: 1 },
  messageContent: { padding: Spacing.md, paddingBottom: Spacing.lg, gap: Spacing.sm },
  empty: { flex: 1, minHeight: 260, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.neutral[200] },
  emptyDesc: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.neutral[600], marginTop: 4 },
  bubble: { maxWidth: '84%', borderRadius: 18, padding: Spacing.md, borderWidth: 1 },
  mine: { alignSelf: 'flex-end', backgroundColor: '#EEF0FF', borderColor: '#DCDFFF', borderBottomRightRadius: 6 },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderColor: '#E5E7EF', borderBottomLeftRadius: 6 },
  messageText: { fontSize: 15, lineHeight: 23, color: '#1F2937' },
  rtlText: { fontFamily: Typography.fontFamily, textAlign: 'right', writingDirection: 'rtl' },
  ltrText: { fontFamily: Typography.latinFontFamily, fontWeight: '700', textAlign: 'left', writingDirection: 'ltr' },
  time: { fontFamily: Typography.fontFamily, fontSize: 9, color: '#6B7280', marginTop: 4, textAlign: 'left' },
  voiceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  voiceText: { fontFamily: Typography.fontFamily, fontSize: 12, color: '#475569' },
  error: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Colors.error[300], textAlign: 'center', paddingHorizontal: Spacing.md, paddingTop: 6, backgroundColor: '#FFFFFF' },
  composer: { flexDirection: 'row-reverse', alignItems: 'flex-end', gap: Spacing.sm, padding: Spacing.sm, paddingBottom: 12, paddingTop: 9, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E8EAF2' },
  input: { flex: 1, minHeight: 44, maxHeight: 100, borderRadius: 22, backgroundColor: '#F7F8FC', borderWidth: 1, borderColor: '#E3E7F3', paddingHorizontal: Spacing.md, paddingTop: 10, paddingBottom: 8, fontSize: Typography.sizes.sm, lineHeight: 22, color: Colors.neutral[0], textAlignVertical: 'center', includeFontPadding: false },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary[500], alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.4 },
});
