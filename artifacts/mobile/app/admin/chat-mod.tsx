import React from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { formatTime } from '@/data/mockData';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminChatModScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { chatMessages, deleteMessage, flagMessage } = useApp();
  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  const sorted = [...chatMessages].reverse();
  const flagged = sorted.filter(m => m.isFlagged);
  const all = sorted;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]}
      showsVerticalScrollIndicator={false}
      data={all}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        <View>
          {flagged.length > 0 && (
            <View style={[styles.warningBanner, { backgroundColor: '#FEF3C7', borderColor: colors.warning as string }]}>
              <Feather name="alert-triangle" size={16} color={colors.warning as string} />
              <Text style={[styles.warningText, { color: '#92400E' }]}>
                {flagged.length} flagged message{flagged.length > 1 ? 's' : ''} need review
              </Text>
            </View>
          )}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Messages ({all.length})</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={[styles.msgCard, { backgroundColor: colors.card, borderLeftWidth: item.isFlagged ? 4 : 0, borderLeftColor: colors.destructive }]}>
          <View style={styles.msgHeader}>
            <View style={[styles.aliasBadge, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.aliasText, { color: colors.primary }]}>{item.aliasName}</Text>
            </View>
            {item.isFlagged && (
              <View style={[styles.flagBadge, { backgroundColor: '#FEE2E2' }]}>
                <Feather name="flag" size={10} color={colors.destructive} />
                <Text style={[styles.flagText, { color: colors.destructive }]}>Reported</Text>
              </View>
            )}
            <Text style={[styles.msgTime, { color: colors.mutedForeground }]}>{formatTime(item.createdAt)}</Text>
          </View>
          <Text style={[styles.msgText, { color: colors.foreground }]}>{item.messageText}</Text>
          <View style={styles.msgActions}>
            {!item.isFlagged && (
              <Pressable onPress={() => flagMessage(item.id)} style={[styles.actionBtn, { backgroundColor: '#FEF3C7' }]}>
                <Feather name="flag" size={13} color="#92400E" />
                <Text style={[styles.actionText, { color: '#92400E' }]}>Flag</Text>
              </Pressable>
            )}
            <Pressable onPress={() => deleteMessage(item.id)} style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}>
              <Feather name="trash-2" size={13} color={colors.destructive} />
              <Text style={[styles.actionText, { color: colors.destructive }]}>Delete</Text>
            </Pressable>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Feather name="message-circle" size={36} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No messages yet</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 14, gap: 10 },
  warningBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 8 },
  warningText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', flex: 1 },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  msgCard: { borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  msgHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  aliasBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  aliasText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  flagBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  flagText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  msgTime: { fontSize: 11, fontFamily: 'Inter_400Regular', marginLeft: 'auto' },
  msgText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20, marginBottom: 10 },
  msgActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  actionText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
});
