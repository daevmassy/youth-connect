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
import { useApp } from '@/context/AppContext';
import {
  useListAllQuestions,
  useListPrayers,
  useListDevotionals,
  useListEvents,
} from '@workspace/api-client-react';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminIndexScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { adminLogout } = useApp();
  const { data: questionsData } = useListAllQuestions();
  const { data: prayersData } = useListPrayers();
  const { data: devotionalsData } = useListDevotionals();
  const { data: eventsData } = useListEvents();

  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  const pendingQuestions = (questionsData?.questions ?? []).filter(q => !q.answer).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysDevotion = (devotionalsData?.devotionals ?? []).find(d => d.publishDate === todayStr);

  const adminItems = [
    {
      icon: 'help-circle',
      label: 'Questions Queue',
      sub: `${pendingQuestions} pending answers`,
      badge: pendingQuestions,
      color: '#7C3AED',
      bg: '#EDE9FE',
      route: '/admin/questions',
    },
    {
      icon: 'book-open',
      label: 'Devotions',
      sub: todaysDevotion ? 'Today posted' : 'No devotion today',
      badge: 0,
      color: colors.goldDark as string,
      bg: colors.goldLight as string,
      route: '/admin/devotions',
    },
    {
      icon: 'calendar',
      label: 'Events',
      sub: `${eventsData?.events.length ?? 0} upcoming`,
      badge: 0,
      color: '#059669',
      bg: '#DCFCE7',
      route: '/admin/events',
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.welcomeCard, { backgroundColor: colors.primary }]}>
        <Feather name="shield" size={24} color={colors.gold as string} />
        <Text style={styles.welcomeTitle}>Pastor Admin Panel</Text>
        <Text style={styles.welcomeSub}>Manage Youth Connect for Ruwa City Youth</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Manage</Text>

      {adminItems.map(item => (
        <Pressable
          key={item.route}
          onPress={() => router.push(item.route as any)}
          style={({ pressed }) => [styles.adminCard, { backgroundColor: colors.card, opacity: pressed ? 0.9 : 1 }]}
        >
          <View style={[styles.adminCardIcon, { backgroundColor: item.bg }]}>
            <Feather name={item.icon as any} size={22} color={item.color} />
          </View>
          <View style={styles.adminCardInfo}>
            <Text style={[styles.adminCardLabel, { color: colors.foreground }]}>{item.label}</Text>
            <Text style={[styles.adminCardSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
          </View>
          {item.badge > 0 && (
            <View style={[styles.badge, { backgroundColor: item.color }]}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </Pressable>
      ))}

      <Pressable
        onPress={() => { adminLogout(); router.back(); }}
        style={[styles.logoutBtn, { borderColor: colors.destructive }]}
      >
        <Feather name="log-out" size={16} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>Logout from Admin</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 20, gap: 12 },
  welcomeCard: { borderRadius: 16, padding: 20, alignItems: 'center', gap: 6, marginBottom: 8 },
  welcomeTitle: { color: '#fff', fontSize: 20, fontFamily: 'Inter_700Bold' },
  welcomeSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  adminCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5, elevation: 2 },
  adminCardIcon: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  adminCardInfo: { flex: 1 },
  adminCardLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  adminCardSub: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  badge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 12, fontFamily: 'Inter_700Bold' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderRadius: 14, paddingVertical: 14, marginTop: 8 },
  logoutText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
