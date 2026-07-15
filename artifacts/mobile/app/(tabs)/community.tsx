import React, { useCallback, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import {
  useListChatMessages,
  useSendChatMessage,
  useListMyQuestions,
  useSubmitQuestion,
  type ChatMessageItem,
  type QuestionItem,
} from '@workspace/api-client-react';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Tab = 'friends' | 'anonymous' | 'ask';

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function CommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  const subtitles: Record<Tab, string> = {
    friends: 'Chat with the youth group using your real name',
    anonymous: 'Anonymous — your identity is protected',
    ask: 'Private — only the Pastor sees your question',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.navy as string, colors.navyLight as string]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={[styles.headerTitle, { color: '#fff' }]}>Community</Text>
        <View style={[styles.tabSwitcher, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <TabButton label="Friends" active={activeTab === 'friends'} onPress={() => setActiveTab('friends')} colors={colors} icon="users" />
          <TabButton label="Anonymous" active={activeTab === 'anonymous'} onPress={() => setActiveTab('anonymous')} colors={colors} icon="message-circle" />
          <TabButton label="Ask Pastor" active={activeTab === 'ask'} onPress={() => setActiveTab('ask')} colors={colors} icon="help-circle" />
        </View>
        <Text style={[styles.headerSub, { color: 'rgba(255,255,255,0.6)' }]}>{subtitles[activeTab]}</Text>
      </LinearGradient>

      {activeTab === 'ask' ? <AskSection /> : <ChatSection room={activeTab} />}
    </View>
  );
}

function TabButton({ label, active, onPress, colors, icon }: {
  label: string; active: boolean; onPress: () => void; colors: ReturnType<typeof useColors>; icon: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabBtn, active && { backgroundColor: colors.gold as string }]}
    >
      <Feather name={icon as any} size={13} color={active ? colors.navy as string : 'rgba(255,255,255,0.8)'} />
      <Text style={[styles.tabBtnText, { color: active ? colors.navy as string : 'rgba(255,255,255,0.8)' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ChatSection({ room }: { room: 'friends' | 'anonymous' }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { anonAlias } = useApp();
  const { user } = useAuth();
  const { data, refetch } = useListChatMessages(room, { query: { refetchInterval: 4000 } as any });
  const sendMessage = useSendChatMessage();
  const [text, setText] = useState('');
  const flatRef = useRef<ScrollView>(null);

  const displayName = room === 'friends' ? (user ? `${user.firstName} ${user.lastName}` : 'You') : anonAlias;
  const messages = data?.messages ?? [];

  const send = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    await sendMessage.mutateAsync({ room, data: { content: trimmed, displayName } });
    await refetch();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [text, sendMessage, room, displayName, refetch]);

  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 84 : 0);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={0}>
      <ScrollView
        ref={flatRef}
        contentContainerStyle={[styles.chatList, { paddingBottom: 12 }]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
      >
        {messages.map(item => (
          <ChatBubble key={item.id} message={item} isMe={room === 'friends' ? item.userId === user?.id : item.displayName === anonAlias} colors={colors} />
        ))}
      </ScrollView>
      <View style={[styles.inputRow, { backgroundColor: colors.card, paddingBottom: bottomPad + 10, borderTopColor: colors.border }]}>
        <View style={[styles.aliasChip, { backgroundColor: colors.secondary }]}>
          <Feather name={room === 'friends' ? 'user' : 'user-x'} size={12} color={colors.mutedForeground} />
          <Text style={[styles.aliasText, { color: colors.mutedForeground }]} numberOfLines={1}>{displayName}</Text>
        </View>
        <TextInput
          style={[styles.chatInput, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
          placeholder="Type a message..."
          placeholderTextColor={colors.mutedForeground}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
        <Pressable onPress={send} style={[styles.sendBtn, { backgroundColor: text.trim() ? colors.primary : colors.muted }]}>
          <Feather name="send" size={18} color={text.trim() ? '#fff' : colors.mutedForeground} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function ChatBubble({ message, isMe, colors }: { message: ChatMessageItem; isMe: boolean; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.bubbleWrapper, isMe && styles.bubbleWrapperMe]}>
      {!isMe && (
        <View style={[styles.avatarDot, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.avatarDotText, { color: colors.primary }]}>{message.displayName.charAt(0)}</Text>
        </View>
      )}
      <View style={{ flex: 1, alignItems: isMe ? 'flex-end' : 'flex-start' }}>
        {!isMe && <Text style={[styles.aliasName, { color: colors.gold as string }]}>{message.displayName}</Text>}
        <View style={[styles.bubble, { backgroundColor: isMe ? colors.primary : colors.card }]}>
          <Text style={[styles.bubbleText, { color: isMe ? '#fff' : colors.foreground }]}>{message.content}</Text>
        </View>
        <Text style={[styles.bubbleTime, { color: colors.mutedForeground }]}>{formatTime(message.createdAt)}</Text>
      </View>
    </View>
  );
}

function AskSection() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, refetch } = useListMyQuestions();
  const submitQuestion = useSubmitQuestion();
  const [mode, setMode] = useState<'list' | 'new'>('list');
  const [questionText, setQuestionText] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState('');

  const questions = data?.questions ?? [];
  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 84 : 0);

  async function handleSubmit() {
    if (!questionText.trim()) return;
    const res = await submitQuestion.mutateAsync({ data: { content: questionText.trim() } });
    setSubmittedTicket(res.question.ticketCode);
    setQuestionText('');
    setMode('list');
    await refetch();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <ScrollView contentContainerStyle={[styles.askContent, { paddingBottom: bottomPad + 80 }]} showsVerticalScrollIndicator={false}>
        {submittedTicket ? (
          <View style={[styles.ticketSuccess, { backgroundColor: colors.successLight as string, borderColor: colors.success as string }]}>
            <Feather name="check-circle" size={20} color={colors.success as string} />
            <View style={styles.ticketSuccessText}>
              <Text style={[styles.ticketSuccessTitle, { color: colors.success as string }]}>Question submitted!</Text>
              <Text style={[styles.ticketId, { color: colors.foreground }]}>Your ticket: {submittedTicket}</Text>
            </View>
          </View>
        ) : null}

        {mode === 'new' ? (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.primary }]}>Ask Your Question</Text>
            <Text style={[styles.privacyNote, { color: colors.mutedForeground }]}>
              Only the Pastor sees your question and can answer it here.
            </Text>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Your question</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Type your question here..."
              placeholderTextColor={colors.mutedForeground}
              value={questionText}
              onChangeText={setQuestionText}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={1000}
            />
            <View style={styles.btnRow}>
              <Pressable onPress={() => setMode('list')} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                style={[styles.submitBtn, { backgroundColor: questionText.trim() ? colors.primary : colors.muted }]}
              >
                <Feather name="send" size={15} color={questionText.trim() ? '#fff' : colors.mutedForeground} />
                <Text style={[styles.submitBtnText, { color: questionText.trim() ? '#fff' : colors.mutedForeground }]}>Submit</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <Pressable onPress={() => setMode('new')} style={[styles.askNewBtn, { backgroundColor: colors.primary }]}>
              <Feather name="plus" size={18} color="#fff" />
              <Text style={styles.askNewBtnText}>Ask a Question</Text>
            </Pressable>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Questions</Text>
            {questions.length === 0 ? (
              <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>You haven't asked anything yet.</Text>
            ) : (
              questions.map(q => <QuestionCard key={q.id} question={q} colors={colors} />)
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function QuestionCard({ question, colors }: { question: QuestionItem; colors: ReturnType<typeof useColors> }) {
  const isAnswered = !!question.answer;
  return (
    <View style={[styles.qCard, { backgroundColor: colors.card }]}>
      <View style={styles.qCardHeader}>
        <View style={[styles.ticketBadge, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.ticketBadgeText, { color: colors.primary }]}>{question.ticketCode}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: isAnswered ? colors.success as string : colors.warning as string }]} />
      </View>
      <Text style={[styles.qText, { color: colors.foreground }]}>{question.content}</Text>
      {isAnswered && (
        <View style={[styles.answerBox, { backgroundColor: colors.goldLight as string, borderLeftColor: colors.gold as string }]}>
          <Text style={[styles.answerLabel, { color: colors.goldDark as string }]}>Pastor answered:</Text>
          <Text style={[styles.answerText, { color: colors.foreground }]}>{question.answer}</Text>
        </View>
      )}
      <View style={styles.qCardFooter}>
        <Text style={[styles.qTime, { color: colors.mutedForeground }]}>{formatTime(question.createdAt)}</Text>
        <Text style={[styles.qStatus, { color: isAnswered ? colors.success as string : colors.warning as string }]}>
          {isAnswered ? 'Answered' : 'Awaiting reply'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 14 },
  headerSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 8 },
  tabSwitcher: { flexDirection: 'row', borderRadius: 12, padding: 3 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 10 },
  tabBtnText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  chatList: { paddingHorizontal: 14, paddingTop: 12, gap: 12 },
  bubbleWrapper: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  bubbleWrapperMe: { flexDirection: 'row-reverse' },
  avatarDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarDotText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  aliasName: { fontSize: 11, fontFamily: 'Inter_600SemiBold', marginBottom: 3, marginLeft: 4 },
  bubble: { maxWidth: '80%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  bubbleText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  bubbleTime: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 3, marginHorizontal: 4 },
  inputRow: { flexDirection: 'column', gap: 8, paddingHorizontal: 14, paddingTop: 10, borderTopWidth: 1 },
  aliasChip: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, maxWidth: 200 },
  aliasText: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  chatInput: { flex: 1, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, fontFamily: 'Inter_400Regular', maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  askContent: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  askNewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 16 },
  askNewBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', marginTop: 8 },
  card: { borderRadius: 16, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 6 },
  privacyNote: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 16, lineHeight: 20 },
  fieldLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 8 },
  textArea: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 14, fontFamily: 'Inter_400Regular', minHeight: 130, marginBottom: 16 },
  btnRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  submitBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, paddingVertical: 13 },
  submitBtnText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  ticketSuccess: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, borderWidth: 1.5 },
  ticketSuccessText: { flex: 1 },
  ticketSuccessTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  ticketId: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  qCard: { borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  qCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  ticketBadgeText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  qText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22, marginBottom: 10 },
  answerBox: { borderLeftWidth: 3, borderRadius: 4, paddingLeft: 12, paddingRight: 8, paddingVertical: 10, marginBottom: 10 },
  answerLabel: { fontSize: 12, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  answerText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  qCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qTime: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  qStatus: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
});
