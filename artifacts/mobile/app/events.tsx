import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useListEvents, useToggleRsvp } from '@workspace/api-client-react';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EventsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch } = useListEvents();
  const toggleRsvp = useToggleRsvp();
  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  const events = data?.events ?? [];

  async function handleRsvp(id: number) {
    await toggleRsvp.mutateAsync({ id });
    await refetch();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      {isLoading && <Text style={{ color: colors.mutedForeground, textAlign: 'center', marginTop: 40 }}>Loading…</Text>}
      {!isLoading && events.length === 0 && (
        <Text style={{ color: colors.mutedForeground, textAlign: 'center', marginTop: 40 }}>No upcoming events.</Text>
      )}
      {events.map(event => (
        <View key={event.id} style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardTop}>
            <View style={[styles.dateBadge, { backgroundColor: colors.goldLight as string }]}>
              <Text style={[styles.dateBadgeMonth, { color: colors.goldDark as string }]}>
                {new Date(event.startsAt).toLocaleDateString('en', { month: 'short' })}
              </Text>
              <Text style={[styles.dateBadgeDay, { color: colors.goldDark as string }]}>
                {new Date(event.startsAt).getDate()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.eventTitle, { color: colors.foreground }]}>{event.title}</Text>
              <View style={styles.metaRow}>
                <Feather name="clock" size={12} color={colors.mutedForeground} />
                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                  {new Date(event.startsAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              {event.location ? (
                <View style={styles.metaRow}>
                  <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{event.location}</Text>
                </View>
              ) : null}
            </View>
          </View>
          {event.description ? (
            <Text style={[styles.description, { color: colors.foreground }]}>{event.description}</Text>
          ) : null}
          <Pressable
            onPress={() => handleRsvp(event.id)}
            style={[
              styles.rsvpBtn,
              { backgroundColor: event.isRsvped ? colors.successLight as string : colors.primary, borderWidth: event.isRsvped ? 1.5 : 0, borderColor: colors.success as string },
            ]}
          >
            <Feather name={event.isRsvped ? 'check-circle' : 'calendar'} size={16} color={event.isRsvped ? colors.success as string : '#fff'} />
            <Text style={[styles.rsvpBtnText, { color: event.isRsvped ? colors.success as string : '#fff' }]}>
              {event.isRsvped ? "You're going" : 'RSVP'}
            </Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },
  card: { borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardTop: { flexDirection: 'row', gap: 14, marginBottom: 12 },
  dateBadge: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  dateBadgeMonth: { fontSize: 11, fontFamily: 'Inter_700Bold', textTransform: 'uppercase' },
  dateBadgeDay: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  eventTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  metaText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  description: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20, marginBottom: 14 },
  rsvpBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, paddingVertical: 12 },
  rsvpBtnText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
});
