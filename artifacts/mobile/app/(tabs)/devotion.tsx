import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { DEVOTIONS } from '@/data/mockData';
import * as Haptics from 'expo-haptics';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DevotionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, todaysDevotion, streak, incrementStreak, devotions } = useApp();
  const [markedRead, setMarkedRead] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(todaysDevotion?.id);

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const selected = devotions.find(d => d.id === selectedId) ?? todaysDevotion;

  async function handleMarkRead() {
    if (!markedRead) {
      setMarkedRead(true);
      await incrementStreak();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.navy as string, colors.navyLight as string]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={[styles.headerTitle, { color: colors.gold as string }]}>
          {t('Daily Devotion', 'Pekuti YaNhasi')}
        </Text>
        <View style={[styles.streakRow, { backgroundColor: 'rgba(201,168,76,0.15)' }]}>
          <MaterialCommunityIcons name="fire" size={18} color={colors.gold as string} />
          <Text style={styles.streakText}>
            {streak} {t('day streak', 'mazuva akatevedzana')}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Platform.OS === 'web' ? 134 : 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Past devotions selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelector}
        >
          {devotions.slice(0, 7).map(dev => {
            const date = new Date(dev.publishDate);
            const isToday = dev.publishDate === new Date().toISOString().split('T')[0];
            const isSelected = dev.id === selectedId;
            return (
              <Pressable
                key={dev.id}
                onPress={() => setSelectedId(dev.id)}
                style={[
                  styles.dayChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.dayChipDate, { color: isSelected ? 'rgba(255,255,255,0.7)' : colors.mutedForeground }]}>
                  {isToday ? t('Today', 'Nhasi') : date.toLocaleDateString('en', { weekday: 'short' })}
                </Text>
                <Text style={[styles.dayChipNum, { color: isSelected ? '#fff' : colors.foreground }]}>
                  {date.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {selected && (
          <>
            {/* Title */}
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={[styles.verseTag, { backgroundColor: colors.goldLight as string }]}>
                <Feather name="book-open" size={13} color={colors.goldDark as string} />
                <Text style={[styles.verseTagText, { color: colors.goldDark as string }]}>
                  {selected.verseReference}
                </Text>
              </View>
              <Text style={[styles.devotionTitle, { color: colors.primary }]}>
                {t(selected.titleEn, selected.titleSn)}
              </Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.verseText, { color: colors.foreground }]}>
                {t(selected.verseTextEn, selected.verseTextSn)}
              </Text>
            </View>

            {/* Reflection */}
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <SectionLabel icon="feather" label={t('Reflection', 'Kufunga')} colors={colors} />
              <Text style={[styles.bodyText, { color: colors.foreground }]}>
                {t(selected.reflectionEn, selected.reflectionSn)}
              </Text>
            </View>

            {/* Action Point */}
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <SectionLabel icon="zap" label={t('Action Point', 'Chiito')} colors={colors} />
              <View style={[styles.actionBox, { backgroundColor: colors.goldLight as string, borderLeftColor: colors.gold as string }]}>
                <Text style={[styles.actionText, { color: colors.primary }]}>
                  {t(selected.actionPointEn, selected.actionPointSn)}
                </Text>
              </View>
            </View>

            {/* Mark as Read */}
            {selected.id === todaysDevotion?.id && (
              <Pressable
                onPress={handleMarkRead}
                style={({ pressed }) => [
                  styles.markReadBtn,
                  {
                    backgroundColor: markedRead ? colors.successLight as string : colors.primary,
                    opacity: pressed ? 0.88 : 1,
                    borderWidth: markedRead ? 1.5 : 0,
                    borderColor: colors.success as string,
                  },
                ]}
              >
                <Feather
                  name={markedRead ? 'check-circle' : 'bookmark'}
                  size={18}
                  color={markedRead ? colors.success as string : '#fff'}
                />
                <Text style={[styles.markReadText, { color: markedRead ? colors.success as string : '#fff' }]}>
                  {markedRead
                    ? t('Devotion completed! +1 streak', 'Pekuti yapera! +1')
                    : t('Mark as read (+1 streak)', 'Ronga kuti waverenga (+1)')}
                </Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function SectionLabel({ icon, label, colors }: { icon: string; label: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.sectionLabel}>
      <Feather name={icon as any} size={14} color={colors.gold as string} />
      <Text style={[styles.sectionLabelText, { color: colors.gold as string }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 12 },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start' },
  streakText: { color: '#fff', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  daySelector: { paddingBottom: 16, gap: 10 },
  dayChip: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5, minWidth: 64 },
  dayChipDate: { fontSize: 11, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  dayChipNum: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  card: { borderRadius: 16, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  verseTag: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 12 },
  verseTagText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  devotionTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', marginBottom: 14, letterSpacing: -0.4 },
  divider: { height: 1, marginBottom: 14 },
  verseText: { fontSize: 16, fontFamily: 'Inter_400Regular', lineHeight: 26, fontStyle: 'italic' },
  sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionLabelText: { fontSize: 13, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.8 },
  bodyText: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 24 },
  actionBox: { borderLeftWidth: 3, borderRadius: 4, paddingLeft: 14, paddingRight: 10, paddingVertical: 10 },
  actionText: { fontSize: 15, fontFamily: 'Inter_500Medium', lineHeight: 22 },
  markReadBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 24, justifyContent: 'center', marginTop: 4, marginBottom: 8 },
  markReadText: { fontSize: 15, fontFamily: 'Inter_700Bold' },
});
