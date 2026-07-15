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
import { useListPrayers, useCreatePrayer, useTogglePray, type PrayerRequestItem } from '@workspace/api-client-react';
import * as Haptics from 'expo-haptics';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export default function PrayerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, refetch } = useListPrayers();
  const createPrayer = useCreatePrayer();
  const togglePray = useTogglePray();
  const [showForm, setShowForm] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 84 : 0);

  const prayers = data?.prayers ?? [];

  async function handleSubmit() {
    if (!requestText.trim()) return;
    await createPrayer.mutateAsync({ data: { content: requestText.trim(), isAnonymous } });
    setRequestText('');
    setShowForm(false);
    await refetch();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function handlePray(id: number) {
    await togglePray.mutateAsync({ id });
    await refetch();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior="padding">
      <LinearGradient
        colors={['#8B1A1A', '#C0392B']}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={styles.headerTitle}>Prayer Room</Text>
        <Text style={[styles.headerSub, { color: 'rgba(255,255,255,0.7)' }]}>
          Pray together in faith — share anonymously if you'd like
        </Text>
      </LinearGradient>

      <FlatList
        data={prayers}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No prayer requests yet. Be the first to share.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <PrayerCard prayer={item} onPray={() => handlePray(item.id)} colors={colors} />
        )}
      />

      <View style={[styles.bottomArea, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: bottomPad + 10 }]}>
        {showForm ? (
          <View>
            <TextInput
              style={[styles.requestInput, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Share your prayer request..."
              placeholderTextColor={colors.mutedForeground}
              value={requestText}
              onChangeText={setRequestText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={500}
            />
            <Pressable
              onPress={() => setIsAnonymous(prev => !prev)}
              style={[styles.anonToggle, { backgroundColor: isAnonymous ? colors.secondary : 'transparent', borderColor: colors.border }]}
            >
              <Feather name={isAnonymous ? 'eye-off' : 'eye'} size={16} color={colors.mutedForeground} />
              <Text style={[styles.anonToggleText, { color: colors.foreground }]}>
                {isAnonymous ? 'Posting anonymously' : 'Posting with your name'}
              </Text>
            </Pressable>
            <View style={styles.formBtnRow}>
              <Pressable onPress={() => setShowForm(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSubmit} style={[styles.submitBtn, { backgroundColor: '#C0392B' }]}>
                <Feather name="send" size={15} color="#fff" />
                <Text style={styles.submitText}>Send</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => setShowForm(true)}
            style={[styles.openFormBtn, { backgroundColor: '#C0392B' }]}
          >
            <Feather name="plus" size={18} color="#fff" />
            <Text style={styles.openFormText}>Share a Prayer Request</Text>
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function PrayerCard({ prayer, onPray, colors }: {
  prayer: PrayerRequestItem;
  onPray: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.prayCard, { backgroundColor: colors.card }]}>
      <View style={styles.authorRow}>
        <Feather name={prayer.isAnonymous ? 'user-x' : 'user'} size={12} color={colors.mutedForeground} />
        <Text style={[styles.authorText, { color: colors.mutedForeground }]}>
          {prayer.isAnonymous ? 'Anonymous' : prayer.author ?? 'A friend'}
        </Text>
        {prayer.isOwn && (
          <View style={[styles.ownBadge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.ownBadgeText, { color: colors.primary }]}>You</Text>
          </View>
        )}
      </View>
      <Text style={[styles.prayText, { color: colors.foreground }]}>{prayer.content}</Text>
      <View style={styles.prayCardFooter}>
        <Text style={[styles.prayTime, { color: colors.mutedForeground }]}>{formatTime(prayer.createdAt)}</Text>
        <Pressable
          onPress={onPray}
          style={({ pressed }) => [
            styles.prayBtn,
            {
              backgroundColor: prayer.hasPrayed ? '#FEE2E2' : colors.secondary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Ionicons
            name={prayer.hasPrayed ? 'heart' : 'heart-outline'}
            size={16}
            color={prayer.hasPrayed ? '#C0392B' : colors.mutedForeground}
          />
          <Text style={[styles.prayCount, { color: prayer.hasPrayed ? '#C0392B' : colors.mutedForeground }]}>
            {prayer.prayCount} praying
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { color: '#fff', fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 6 },
  headerSub: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  list: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', maxWidth: 260 },
  prayCard: { borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5, elevation: 2 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  authorText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  ownBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 4 },
  ownBadgeText: { fontSize: 10, fontFamily: 'Inter_700Bold' },
  prayText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22, marginBottom: 12 },
  prayCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prayTime: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  prayBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  prayCount: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  bottomArea: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  openFormBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 16 },
  openFormText: { color: '#fff', fontSize: 15, fontFamily: 'Inter_700Bold' },
  requestInput: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 14, fontFamily: 'Inter_400Regular', minHeight: 80, marginBottom: 10 },
  anonToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 },
  anonToggleText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  formBtnRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  cancelText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  submitBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, paddingVertical: 12 },
  submitText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_700Bold' },
});
