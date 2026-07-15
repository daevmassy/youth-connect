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
import { useListDevotionals } from '@workspace/api-client-react';
import * as Haptics from 'expo-haptics';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';

const STREAK_KEY_PREFIX = 'yc_streak_';

export default function DevotionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data, isLoading } = useListDevotionals();
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const [markedRead, setMarkedRead] = useState(false);
  const [streak, setStreak] = useState(0);

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const devotionals = data?.devotionals ?? [];
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysDevotion = devotionals.find(d => d.publishDate === todayStr) ?? devotionals[0];
  const selected = devotionals.find(d => d.id === selectedId) ?? todaysDevotion;

  React.useEffect(() => {
    if (!user) return;
    const key = STREAK_KEY_PREFIX + user.id;
    AsyncStorage.getItem(key).then(v => {
      const parsed = v ? JSON.parse(v) : { count: 0, lastDate: '' };
      setStreak(parsed.count ?? 0);
      setMarkedRead(parsed.lastDate === todayStr);
    });
  }, [user, todayStr]);

  async function handleMarkRead() {
    if (markedRead || !user) return;
    const key = STREAK_KEY_PREFIX + user.id;
    const raw = await AsyncStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : { count: 0, lastDate: '' };
    const newCount = parsed.count + 1;
    await AsyncStorage.setItem(key, JSON.stringify({ count: newCount, lastDate: todayStr }));
    setStreak(newCount);
    setMarkedRead(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.navy as string, colors.navyLight as string]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={[styles.headerTitle, { color: colors.gold as string }]}>
          Daily Devotion
        </Text>
        <View style={[styles.streakRow, { backgroundColor: 'rgba(201,168,76,0.15)' }]}>
          <MaterialCommunityIcons name="fire" size={18} color={colors.gold as string} />
          <Text style={styles.streakText}>{streak} day streak</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Platform.OS === 'web' ? 134 : 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && (
          <Text style={{ color: colors.mutedForeground, textAlign: 'center', marginTop: 40 }}>Loading…</Text>
        )}

        {devotionals.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daySelector}
          >
            {devotionals.slice(0, 7).map(dev => {
              const date = new Date(dev.publishDate);
              const isToday = dev.publishDate === todayStr;
              const isSelected = dev.id === selected?.id;
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
                    {isToday ? 'Today' : date.toLocaleDateString('en', { weekday: 'short' })}
                  </Text>
                  <Text style={[styles.dayChipNum, { color: isSelected ? '#fff' : colors.foreground }]}>
                    {date.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {selected && (
          <>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={[styles.verseTag, { backgroundColor: colors.goldLight as string }]}>
                <Feather name="book-open" size={13} color={colors.goldDark as string} />
                <Text style={[styles.verseTagText, { color: colors.goldDark as string }]}>
                  {selected.scriptureRef}
                </Text>
              </View>
              <Text style={[styles.devotionTitle, { color: colors.primary }]}>{selected.title}</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.verseText, { color: colors.foreground }]}>{selected.scriptureText}</Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <SectionLabel icon="feather" label="Reflection" colors={colors} />
              <Text style={[styles.bodyText, { color: colors.foreground }]}>{selected.body}</Text>
            </View>

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
                  {markedRead ? 'Devotion completed! +1 streak' : 'Mark as read (+1 streak)'}
                </Text>
              </Pressable>
            )}
          </>
        )}

        {!isLoading && devotionals.length === 0 && (
          <Text style={{ color: colors.mutedForeground, textAlign: 'center', marginTop: 40 }}>
            No devotions yet. Check back soon.
          </Text>
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
  markReadBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 24, justifyContent: 'center', marginTop: 4, marginBottom: 8 },
  markReadText: { fontSize: 15, fontFamily: 'Inter_700Bold' },
});
