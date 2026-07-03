import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { type Question, formatTime } from '@/data/mockData';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminQuestionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { questions, answerQuestion } = useApp();
  const [filter, setFilter] = useState<'pending' | 'answered'>('pending');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);
  const filtered = questions.filter(q => filter === 'pending' ? !q.isAnswered : q.isAnswered);

  function handleSendReply(questionId: string) {
    if (!replyText.trim()) return;
    answerQuestion(questionId, replyText.trim());
    setReplyingTo(null);
    setReplyText('');
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior="padding">
      <View style={[styles.filterRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(['pending', 'answered'] as const).map(f => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterBtn, { backgroundColor: filter === f ? colors.primary : 'transparent' }]}
          >
            <Text style={[styles.filterText, { color: filter === f ? '#fff' : colors.mutedForeground }]}>
              {f === 'pending' ? `Pending (${questions.filter(q => !q.isAnswered).length})` : `Answered (${questions.filter(q => q.isAnswered).length})`}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <AdminQuestionCard
            question={item}
            isReplying={replyingTo === item.id}
            replyText={replyText}
            onStartReply={() => { setReplyingTo(item.id); setReplyText(''); }}
            onCancelReply={() => setReplyingTo(null)}
            onReplyChange={setReplyText}
            onSendReply={() => handleSendReply(item.id)}
            colors={colors}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="inbox" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {filter === 'pending' ? 'No pending questions' : 'No answered questions yet'}
            </Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

function AdminQuestionCard({ question, isReplying, replyText, onStartReply, onCancelReply, onReplyChange, onSendReply, colors }: {
  question: Question;
  isReplying: boolean;
  replyText: string;
  onStartReply: () => void;
  onCancelReply: () => void;
  onReplyChange: (t: string) => void;
  onSendReply: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.ticketBadge, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.ticketText, { color: colors.primary }]}>{question.ticketId}</Text>
        </View>
        <View style={[styles.catBadge, { backgroundColor: question.category === 'spiritual' ? colors.goldLight as string : question.category === 'social' ? '#EDE9FE' : '#DCFCE7' }]}>
          <Text style={[styles.catText, { color: question.category === 'spiritual' ? colors.goldDark as string : question.category === 'social' ? '#5B21B6' : '#15803D' }]}>
            {question.category}
          </Text>
        </View>
        <Text style={[styles.timeText, { color: colors.mutedForeground }]}>{formatTime(question.createdAt)}</Text>
      </View>
      <Text style={[styles.questionText, { color: colors.foreground }]}>{question.questionText}</Text>

      {question.isAnswered && question.answerText && (
        <View style={[styles.answerBox, { backgroundColor: colors.goldLight as string, borderLeftColor: colors.gold as string }]}>
          <Text style={[styles.answerLabel, { color: colors.goldDark as string }]}>Your answer:</Text>
          <Text style={[styles.answerText, { color: colors.foreground }]}>{question.answerText}</Text>
        </View>
      )}

      {!question.isAnswered && (
        isReplying ? (
          <View>
            <TextInput
              style={[styles.replyInput, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Type your answer..."
              placeholderTextColor={colors.mutedForeground}
              value={replyText}
              onChangeText={onReplyChange}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoFocus
            />
            <View style={styles.replyBtnRow}>
              <Pressable onPress={onCancelReply} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
              </Pressable>
              <Pressable onPress={onSendReply} style={[styles.sendBtn, { backgroundColor: colors.primary }]}>
                <Feather name="send" size={14} color="#fff" />
                <Text style={styles.sendText}>Send Reply</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable onPress={onStartReply} style={[styles.replyBtn, { backgroundColor: colors.primary }]}>
            <Feather name="corner-up-left" size={15} color="#fff" />
            <Text style={styles.replyBtnText}>Reply to this question</Text>
          </Pressable>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: { flexDirection: 'row', padding: 12, gap: 8, borderBottomWidth: 1 },
  filterBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  filterText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  list: { paddingHorizontal: 16, paddingTop: 14, gap: 12 },
  card: { borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  ticketBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  ticketText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  catBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  catText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  timeText: { fontSize: 11, fontFamily: 'Inter_400Regular', marginLeft: 'auto' },
  questionText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22, marginBottom: 14 },
  answerBox: { borderLeftWidth: 3, borderRadius: 4, paddingLeft: 12, paddingRight: 8, paddingVertical: 10 },
  answerLabel: { fontSize: 11, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  answerText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  replyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, paddingVertical: 12 },
  replyBtnText: { color: '#fff', fontSize: 13, fontFamily: 'Inter_700Bold' },
  replyInput: { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 14, fontFamily: 'Inter_400Regular', minHeight: 100, marginBottom: 10 },
  replyBtnRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  cancelText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  sendBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, paddingVertical: 11 },
  sendText: { color: '#fff', fontSize: 13, fontFamily: 'Inter_700Bold' },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
});
