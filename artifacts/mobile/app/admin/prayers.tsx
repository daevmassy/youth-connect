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
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { formatTime } from '@/data/mockData';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminPrayersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { prayerRequests, addDailyFocus, markAnswered } = useApp();
  const [focusText, setFocusText] = useState('');
  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  function handleAddFocus() {
    if (!focusText.trim()) return;
    addDailyFocus(focusText.trim());
    setFocusText('');
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]}
      showsVerticalScrollIndicator={false}
      data={prayerRequests}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        <View>
          <View style={[styles.addFocusCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.primary }]}>Post Daily Prayer Focus</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Enter today's prayer focus topic..."
              placeholderTextColor={colors.mutedForeground}
              value={focusText}
              onChangeText={setFocusText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Pressable onPress={handleAddFocus} style={[styles.addBtn, { backgroundColor: '#C0392B' }]}>
              <Feather name="plus" size={16} color="#fff" />
              <Text style={styles.addBtnText}>Post as Daily Focus</Text>
            </Pressable>
          </View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Prayer Requests</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={[styles.prayCard, { backgroundColor: colors.card, borderLeftWidth: item.isDailyFocus ? 4 : 0, borderLeftColor: '#C0392B' }]}>
          <View style={styles.prayCardHeader}>
            {item.isDailyFocus && (
              <View style={[styles.focusBadge, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.focusBadgeText, { color: '#991B1B' }]}>Focus</Text>
              </View>
            )}
            {item.isAnswered && (
              <View style={[styles.focusBadge, { backgroundColor: colors.successLight as string }]}>
                <Feather name="check-circle" size={11} color={colors.success as string} />
                <Text style={[styles.focusBadgeText, { color: colors.success as string }]}>Answered</Text>
              </View>
            )}
            <Text style={[styles.timeText, { color: colors.mutedForeground }]}>{formatTime(item.createdAt)}</Text>
          </View>
          <Text style={[styles.prayText, { color: colors.foreground }]}>{item.requestText}</Text>
          <View style={styles.prayCardFooter}>
            <View style={styles.prayCount}>
              <Ionicons name="heart" size={14} color="#C0392B" />
              <Text style={[styles.prayCountText, { color: colors.mutedForeground }]}>{item.prayCount} praying</Text>
            </View>
            {!item.isAnswered && !item.isDailyFocus && (
              <Pressable onPress={() => markAnswered(item.id)} style={[styles.markBtn, { backgroundColor: colors.successLight as string }]}>
                <Feather name="check" size={14} color={colors.success as string} />
                <Text style={[styles.markBtnText, { color: colors.success as string }]}>Mark Answered</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  addFocusCard: { borderRadius: 14, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', marginBottom: 12 },
  input: { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 14, fontFamily: 'Inter_400Regular', minHeight: 80, marginBottom: 10 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, paddingVertical: 12 },
  addBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_700Bold' },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', marginBottom: 8, marginTop: 4 },
  prayCard: { borderRadius: 13, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  prayCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  focusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  focusBadgeText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  timeText: { fontSize: 11, fontFamily: 'Inter_400Regular', marginLeft: 'auto' },
  prayText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20, marginBottom: 10 },
  prayCardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  prayCount: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  prayCountText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  markBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  markBtnText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
});
