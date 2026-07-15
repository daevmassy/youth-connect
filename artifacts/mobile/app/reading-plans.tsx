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
import {
  useListReadingPlans,
  useGetReadingProgress,
  useCompleteReadingDay,
} from '@workspace/api-client-react';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReadingPlansScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: plansData, isLoading } = useListReadingPlans();
  const { data: progressData, refetch: refetchProgress } = useGetReadingProgress();
  const completeDay = useCompleteReadingDay();
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);

  const plans = plansData?.plans ?? [];
  const completedDayIds = new Set((progressData?.progress ?? []).filter(p => p.completed).map(p => p.planDayId));
  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  async function handleCompleteDay(dayId: number) {
    if (completedDayIds.has(dayId)) return;
    await completeDay.mutateAsync({ dayId });
    await refetchProgress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      {isLoading && <Text style={{ color: colors.mutedForeground, textAlign: 'center', marginTop: 40 }}>Loading…</Text>}
      {!isLoading && plans.length === 0 && (
        <Text style={{ color: colors.mutedForeground, textAlign: 'center', marginTop: 40 }}>No reading plans yet.</Text>
      )}
      {plans.map(plan => {
        const doneCount = plan.days.filter(d => completedDayIds.has(d.id)).length;
        const expanded = expandedPlanId === plan.id;
        return (
          <View key={plan.id} style={[styles.planCard, { backgroundColor: colors.card }]}>
            <Pressable onPress={() => setExpandedPlanId(expanded ? null : plan.id)} style={styles.planHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.planTitle, { color: colors.primary }]}>{plan.title}</Text>
                {plan.description ? (
                  <Text style={[styles.planDesc, { color: colors.mutedForeground }]}>{plan.description}</Text>
                ) : null}
                <View style={[styles.progressBarBg, { backgroundColor: colors.secondary }]}>
                  <View style={[styles.progressBarFill, { backgroundColor: colors.gold as string, width: `${plan.days.length ? (doneCount / plan.days.length) * 100 : 0}%` }]} />
                </View>
                <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
                  {doneCount} of {plan.days.length} days complete
                </Text>
              </View>
              <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.mutedForeground} />
            </Pressable>

            {expanded && (
              <View style={styles.daysList}>
                {plan.days.map(day => {
                  const done = completedDayIds.has(day.id);
                  return (
                    <Pressable
                      key={day.id}
                      onPress={() => handleCompleteDay(day.id)}
                      style={[styles.dayRow, { borderTopColor: colors.border }]}
                    >
                      <View style={[styles.dayCheck, { backgroundColor: done ? colors.success as string : colors.secondary, borderColor: done ? colors.success as string : colors.border }]}>
                        {done && <Feather name="check" size={13} color="#fff" />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.dayLabel, { color: colors.foreground }]}>Day {day.dayNumber} — {day.passage}</Text>
                        {day.reflection ? (
                          <Text style={[styles.dayReflection, { color: colors.mutedForeground }]} numberOfLines={2}>{day.reflection}</Text>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },
  planCard: { borderRadius: 16, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  planHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  planTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  planDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 10, lineHeight: 19 },
  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressBarFill: { height: 6, borderRadius: 3 },
  progressText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  daysList: { marginTop: 14 },
  dayRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12, borderTopWidth: 1 },
  dayCheck: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, marginTop: 2 },
  dayLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  dayReflection: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18 },
});
