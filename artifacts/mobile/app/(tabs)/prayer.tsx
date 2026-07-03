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
import { type PrayerRequest, formatTime } from '@/data/mockData';
import * as Haptics from 'expo-haptics';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrayerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { prayerRequests, prayedIds, submitPrayerRequest, togglePray, t } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [requestText, setRequestText] = useState('');

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 84 : 0);

  const dailyFocus = prayerRequests.filter(p => p.isDailyFocus && !p.isAnswered);
  const answered = prayerRequests.filter(p => p.isAnswered);
  const general = prayerRequests.filter(p => !p.isDailyFocus && !p.isAnswered);

  function handleSubmit() {
    if (!requestText.trim()) return;
    submitPrayerRequest(requestText.trim());
    setRequestText('');
    setShowForm(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handlePray(id: string) {
    togglePray(id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior="padding">
      <LinearGradient
        colors={['#8B1A1A', '#C0392B']}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={styles.headerTitle}>
          {t('Prayer Room', 'Imba Yokunamatira')}
        </Text>
        <Text style={[styles.headerSub, { color: 'rgba(255,255,255,0.7)' }]}>
          {t('Anonymous — pray together in faith', 'Namatai pamwe mukutenda')}
        </Text>
      </LinearGradient>

      <FlatList
        data={[
          { type: 'focus_header' as const },
          ...dailyFocus.map(p => ({ type: 'focus' as const, item: p })),
          { type: 'general_header' as const },
          ...general.map(p => ({ type: 'general' as const, item: p })),
          ...(answered.length > 0 ? [{ type: 'answered_header' as const }] : []),
          ...answered.map(p => ({ type: 'answered' as const, item: p })),
        ]}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (item.type === 'focus_header') {
            return (
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#FECACA' }]}>
                  <Feather name="target" size={14} color="#991B1B" />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  {t('Today\'s Prayer Focus', 'Zvatinonamata Nhasi')}
                </Text>
              </View>
            );
          }
          if (item.type === 'general_header') {
            return (
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="heart" size={14} color="#DC2626" />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  {t('Prayer Requests', 'Zvikumbiro Zvekunamata')}
                </Text>
              </View>
            );
          }
          if (item.type === 'answered_header') {
            return (
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconBadge, { backgroundColor: colors.successLight as string }]}>
                  <Feather name="check-circle" size={14} color={colors.success as string} />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  {t('Answered Prayers', 'Minamato Yakabatirwa')}
                </Text>
              </View>
            );
          }
          if ((item.type === 'focus' || item.type === 'general' || item.type === 'answered') && item.item) {
            return (
              <PrayerCard
                prayer={item.item}
                isFocus={item.type === 'focus'}
                isAnswered={item.type === 'answered'}
                hasPrayed={prayedIds.includes(item.item.id)}
                onPray={() => handlePray(item.item.id)}
                colors={colors}
                t={t}
              />
            );
          }
          return null;
        }}
      />

      {/* Submit form */}
      <View style={[styles.bottomArea, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: bottomPad + 10 }]}>
        {showForm ? (
          <View>
            <TextInput
              style={[styles.requestInput, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
              placeholder={t('Share your prayer request (anonymous)...', 'Tumira chikumbiro chako (pasina zita)...')}
              placeholderTextColor={colors.mutedForeground}
              value={requestText}
              onChangeText={setRequestText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={500}
            />
            <View style={styles.formBtnRow}>
              <Pressable onPress={() => setShowForm(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>
                  {t('Cancel', 'Dzoka')}
                </Text>
              </Pressable>
              <Pressable onPress={handleSubmit} style={[styles.submitBtn, { backgroundColor: '#C0392B' }]}>
                <Feather name="send" size={15} color="#fff" />
                <Text style={styles.submitText}>{t('Send', 'Tumira')}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => setShowForm(true)}
            style={[styles.openFormBtn, { backgroundColor: '#C0392B' }]}
          >
            <Feather name="plus" size={18} color="#fff" />
            <Text style={styles.openFormText}>
              {t('Share a Prayer Request', 'Tumira Chikumbiro Chako')}
            </Text>
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function PrayerCard({ prayer, isFocus, isAnswered, hasPrayed, onPray, colors, t }: {
  prayer: PrayerRequest;
  isFocus: boolean;
  isAnswered: boolean;
  hasPrayed: boolean;
  onPray: () => void;
  colors: ReturnType<typeof useColors>;
  t: (e: string, s: string) => string;
}) {
  return (
    <View style={[
      styles.prayCard,
      {
        backgroundColor: colors.card,
        borderLeftWidth: isFocus ? 4 : 0,
        borderLeftColor: '#C0392B',
      },
    ]}>
      {isFocus && (
        <View style={[styles.focusBadge, { backgroundColor: '#FEE2E2' }]}>
          <Text style={[styles.focusBadgeText, { color: '#991B1B' }]}>
            {t('Daily Focus', 'Chinhu Chinonamatwa')}
          </Text>
        </View>
      )}
      {isAnswered && (
        <View style={[styles.focusBadge, { backgroundColor: colors.successLight as string }]}>
          <Feather name="check-circle" size={11} color={colors.success as string} />
          <Text style={[styles.focusBadgeText, { color: colors.success as string }]}>
            {t('Answered!', 'Yakapindurwa!')}
          </Text>
        </View>
      )}
      <Text style={[styles.prayText, { color: colors.foreground }]}>{prayer.requestText}</Text>
      <View style={styles.prayCardFooter}>
        <Text style={[styles.prayTime, { color: colors.mutedForeground }]}>{formatTime(prayer.createdAt)}</Text>
        {!isAnswered && (
          <Pressable
            onPress={onPray}
            style={({ pressed }) => [
              styles.prayBtn,
              {
                backgroundColor: hasPrayed ? '#FEE2E2' : colors.secondary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Ionicons
              name={hasPrayed ? 'heart' : 'heart-outline'}
              size={16}
              color={hasPrayed ? '#C0392B' : colors.mutedForeground}
            />
            <Text style={[styles.prayCount, { color: hasPrayed ? '#C0392B' : colors.mutedForeground }]}>
              {prayer.prayCount} {t('praying', 'vanonamatira')}
            </Text>
          </Pressable>
        )}
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
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 4 },
  sectionIconBadge: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  prayCard: { borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5, elevation: 2 },
  focusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  focusBadgeText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  prayText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22, marginBottom: 12 },
  prayCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prayTime: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  prayBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  prayCount: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  bottomArea: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  openFormBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 16 },
  openFormText: { color: '#fff', fontSize: 15, fontFamily: 'Inter_700Bold' },
  requestInput: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 14, fontFamily: 'Inter_400Regular', minHeight: 80, marginBottom: 10 },
  formBtnRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  cancelText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  submitBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, paddingVertical: 12 },
  submitText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_700Bold' },
});
