import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
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
import { type Question, formatTime } from '@/data/mockData';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Tab = 'chat' | 'ask';
type Category = 'spiritual' | 'social' | 'economical';

export default function CommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.navy as string, colors.navyLight as string]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={[styles.headerTitle, { color: '#fff' }]}>
          {t('Community', 'Nharaunda')}
        </Text>
        <View style={[styles.tabSwitcher, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <Pressable
            onPress={() => setActiveTab('chat')}
            style={[styles.tabBtn, activeTab === 'chat' && { backgroundColor: colors.gold as string }]}
          >
            <Feather name="message-circle" size={14} color={activeTab === 'chat' ? colors.navy as string : 'rgba(255,255,255,0.8)'} />
            <Text style={[styles.tabBtnText, { color: activeTab === 'chat' ? colors.navy as string : 'rgba(255,255,255,0.8)' }]}>
              {t('Imba', 'Imba Yokutaura')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('ask')}
            style={[styles.tabBtn, activeTab === 'ask' && { backgroundColor: colors.gold as string }]}
          >
            <Feather name="help-circle" size={14} color={activeTab === 'ask' ? colors.navy as string : 'rgba(255,255,255,0.8)'} />
            <Text style={[styles.tabBtnText, { color: activeTab === 'ask' ? colors.navy as string : 'rgba(255,255,255,0.8)' }]}>
              {t('Bvunza Pastor', 'Bvunza Mufundisi')}
            </Text>
          </Pressable>
        </View>
        <Text style={[styles.headerSub, { color: 'rgba(255,255,255,0.6)' }]}>
          {activeTab === 'chat'
            ? t('Anonymous — your identity is protected', 'Pasina zita — zvakachengeteka')
            : t('Private — only the Pastor sees your question', 'Chakavanzika — Mufundisi oga')}
        </Text>
      </LinearGradient>

      {activeTab === 'chat' ? <ChatSection /> : <AskSection />}
    </View>
  );
}

function ChatSection() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { chatMessages, sendChatMessage, flagMessage, userAlias, t } = useApp();
  const [text, setText] = useState('');
  const flatRef = useRef<FlatList>(null);

  const send = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendChatMessage(trimmed);
    setText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [text, sendChatMessage]);

  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 84 : 0);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <FlatList
        ref={flatRef}
        data={[...chatMessages].reverse()}
        inverted
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.chatList, { paddingBottom: 12 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ChatBubble message={item} onFlag={() => flagMessage(item.id)} colors={colors} t={t} />}
      />
      <View style={[styles.inputRow, { backgroundColor: colors.card, paddingBottom: bottomPad + 10, borderTopColor: colors.border }]}>
        <View style={[styles.aliasChip, { backgroundColor: colors.secondary }]}>
          <Feather name="user-x" size={12} color={colors.mutedForeground} />
          <Text style={[styles.aliasText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {userAlias}
          </Text>
        </View>
        <TextInput
          style={[styles.chatInput, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
          placeholder={t('Type a message...', 'Nyora meseji...')}
          placeholderTextColor={colors.mutedForeground}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
        <Pressable
          onPress={send}
          style={[styles.sendBtn, { backgroundColor: text.trim() ? colors.primary : colors.muted }]}
        >
          <Feather name="send" size={18} color={text.trim() ? '#fff' : colors.mutedForeground} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function ChatBubble({ message, onFlag, colors, t }: { message: any; onFlag: () => void; colors: ReturnType<typeof useColors>; t: (e: string, s: string) => string }) {
  const isMe = message.isCurrentUser;
  return (
    <View style={[styles.bubbleWrapper, isMe && styles.bubbleWrapperMe]}>
      {!isMe && (
        <View style={[styles.avatarDot, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.avatarDotText, { color: colors.primary }]}>
            {message.aliasName.charAt(0)}
          </Text>
        </View>
      )}
      <View style={{ flex: 1, alignItems: isMe ? 'flex-end' : 'flex-start' }}>
        {!isMe && (
          <Text style={[styles.aliasName, { color: colors.gold as string }]}>{message.aliasName}</Text>
        )}
        <View style={[styles.bubble, { backgroundColor: isMe ? colors.primary : colors.card }]}>
          <Text style={[styles.bubbleText, { color: isMe ? '#fff' : colors.foreground }]}>
            {message.messageText}
          </Text>
        </View>
        <View style={styles.bubbleMeta}>
          <Text style={[styles.bubbleTime, { color: colors.mutedForeground }]}>
            {formatTime(message.createdAt)}
          </Text>
          {!isMe && !message.isFlagged && (
            <Pressable onPress={onFlag} style={styles.flagBtn}>
              <Feather name="flag" size={12} color={colors.mutedForeground} />
            </Pressable>
          )}
          {message.isFlagged && (
            <Text style={[styles.flaggedText, { color: colors.destructive }]}>
              {t('Reported', 'Rikiswa')}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

function AskSection() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { questions, myTicketIds, submitQuestion, t } = useApp();
  const [mode, setMode] = useState<'list' | 'new'>('list');
  const [questionText, setQuestionText] = useState('');
  const [category, setCategory] = useState<Category>('spiritual');
  const [submittedTicket, setSubmittedTicket] = useState('');

  const myQuestions = questions.filter(q => myTicketIds.includes(q.ticketId));
  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 84 : 0);

  function handleSubmit() {
    if (!questionText.trim()) return;
    const ticket = submitQuestion(questionText.trim(), category);
    setSubmittedTicket(ticket);
    setQuestionText('');
    setMode('list');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <ScrollView contentContainerStyle={[styles.askContent, { paddingBottom: bottomPad + 80 }]} showsVerticalScrollIndicator={false}>
        {submittedTicket ? (
          <View style={[styles.ticketSuccess, { backgroundColor: colors.successLight as string, borderColor: colors.success as string }]}>
            <Feather name="check-circle" size={20} color={colors.success as string} />
            <View style={styles.ticketSuccessText}>
              <Text style={[styles.ticketSuccessTitle, { color: colors.success as string }]}>
                {t('Question submitted!', 'Mubvunzo watumiwa!')}
              </Text>
              <Text style={[styles.ticketId, { color: colors.foreground }]}>
                {t('Your ticket:', 'Tikiti yako:')} {submittedTicket}
              </Text>
            </View>
          </View>
        ) : null}

        {mode === 'new' ? (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.primary }]}>
              {t('Ask Your Question', 'Bvunza Mubvunzo Wako')}
            </Text>
            <Text style={[styles.privacyNote, { color: colors.mutedForeground }]}>
              {t('Your identity is fully protected. The Pastor only sees your question.', 'Zvako zvakachengetwa. Mufundisi anoona mibvunzo chete.')}
            </Text>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              {t('Category', 'Chikamu')}
            </Text>
            <View style={styles.catRow}>
              {(['spiritual', 'social', 'economical'] as Category[]).map(cat => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: category === cat ? colors.primary : colors.secondary,
                      borderColor: category === cat ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.catText, { color: category === cat ? '#fff' : colors.foreground }]}>
                    {t(cat.charAt(0).toUpperCase() + cat.slice(1), cat === 'spiritual' ? 'Kwomweya' : cat === 'social' ? 'Nharaunda' : 'Zvemari')}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              {t('Your question', 'Mubvunzo wako')}
            </Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
              placeholder={t('Type your question here...', 'Nyora mubvunzo wako pano...')}
              placeholderTextColor={colors.mutedForeground}
              value={questionText}
              onChangeText={setQuestionText}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={1000}
            />
            <View style={styles.btnRow}>
              <Pressable
                onPress={() => setMode('list')}
                style={[styles.cancelBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>
                  {t('Cancel', 'Dzoka')}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                style={[styles.submitBtn, { backgroundColor: questionText.trim() ? colors.primary : colors.muted }]}
              >
                <Feather name="send" size={15} color={questionText.trim() ? '#fff' : colors.mutedForeground} />
                <Text style={[styles.submitBtnText, { color: questionText.trim() ? '#fff' : colors.mutedForeground }]}>
                  {t('Submit Anonymously', 'Tumira')}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <Pressable
              onPress={() => setMode('new')}
              style={[styles.askNewBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="plus" size={18} color="#fff" />
              <Text style={styles.askNewBtnText}>
                {t('Ask a Question', 'Bvunza Chinhu Chako')}
              </Text>
            </Pressable>

            {myQuestions.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  {t('Your Questions', 'Mibvunzo Yako')}
                </Text>
                {myQuestions.map(q => <QuestionCard key={q.id} question={q} colors={colors} t={t} />)}
              </>
            )}

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {t('Answered Questions', 'Mibvunzo Yakabatirirwa')}
            </Text>
            {questions.filter(q => q.isAnswered).map(q => <QuestionCard key={q.id} question={q} colors={colors} t={t} />)}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function QuestionCard({ question, colors, t }: { question: Question; colors: ReturnType<typeof useColors>; t: (e: string, s: string) => string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Pressable
      onPress={() => setExpanded(prev => !prev)}
      style={[styles.qCard, { backgroundColor: colors.card }]}
    >
      <View style={styles.qCardHeader}>
        <View style={styles.qCardMeta}>
          <View style={[styles.ticketBadge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.ticketBadgeText, { color: colors.primary }]}>{question.ticketId}</Text>
          </View>
          <View style={[styles.catBadge, {
            backgroundColor: question.category === 'spiritual' ? colors.goldLight as string
              : question.category === 'social' ? '#EDE9FE' : '#DCFCE7'
          }]}>
            <Text style={[styles.catBadgeText, {
              color: question.category === 'spiritual' ? colors.goldDark as string
                : question.category === 'social' ? '#5B21B6' : '#15803D'
            }]}>
              {t(question.category, question.category === 'spiritual' ? 'Kwomweya' : question.category === 'social' ? 'Nharaunda' : 'Zvemari')}
            </Text>
          </View>
        </View>
        <View style={[styles.statusDot, { backgroundColor: question.isAnswered ? colors.success as string : colors.warning as string }]} />
      </View>
      <Text style={[styles.qText, { color: colors.foreground }]} numberOfLines={expanded ? undefined : 2}>
        {question.questionText}
      </Text>
      {question.isAnswered && expanded && question.answerText && (
        <View style={[styles.answerBox, { backgroundColor: colors.goldLight as string, borderLeftColor: colors.gold as string }]}>
          <Text style={[styles.answerLabel, { color: colors.goldDark as string }]}>
            {question.answeredByName || 'Pastor'} {t('answered:', 'vapindura:')}
          </Text>
          <Text style={[styles.answerText, { color: colors.foreground }]}>{question.answerText}</Text>
        </View>
      )}
      <View style={styles.qCardFooter}>
        <Text style={[styles.qTime, { color: colors.mutedForeground }]}>{formatTime(question.createdAt)}</Text>
        <Text style={[styles.qStatus, { color: question.isAnswered ? colors.success as string : colors.warning as string }]}>
          {question.isAnswered ? t('Answered', 'Yakabatirirwa') : t('Awaiting reply', 'Inomirira')}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 14 },
  headerSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 8 },
  tabSwitcher: { flexDirection: 'row', borderRadius: 12, padding: 3 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 10 },
  tabBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  chatList: { paddingHorizontal: 14, paddingTop: 12, gap: 12 },
  bubbleWrapper: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  bubbleWrapperMe: { flexDirection: 'row-reverse' },
  avatarDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarDotText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  aliasName: { fontSize: 11, fontFamily: 'Inter_600SemiBold', marginBottom: 3, marginLeft: 4 },
  bubble: { maxWidth: '80%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  bubbleText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  bubbleMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3, marginHorizontal: 4 },
  bubbleTime: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  flagBtn: { padding: 2 },
  flaggedText: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  inputRow: { flexDirection: 'column', gap: 8, paddingHorizontal: 14, paddingTop: 10, borderTopWidth: 1 },
  aliasChip: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, maxWidth: 160 },
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
  catRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  catChip: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
  catText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
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
  qCardMeta: { flexDirection: 'row', gap: 6 },
  ticketBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  ticketBadgeText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  catBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  catBadgeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  qText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22, marginBottom: 10 },
  answerBox: { borderLeftWidth: 3, borderRadius: 4, paddingLeft: 12, paddingRight: 8, paddingVertical: 10, marginBottom: 10 },
  answerLabel: { fontSize: 12, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  answerText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  qCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qTime: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  qStatus: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
});
