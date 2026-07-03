import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userAlias, streak, language, toggleLanguage, isAdmin, adminLogin, adminLogout, t, questions, myTicketIds, prayerRequests, prayedIds } = useApp();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [loginError, setLoginError] = useState('');

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  const myQCount = myTicketIds.length;
  const answeredQCount = questions.filter(q => myTicketIds.includes(q.ticketId) && q.isAnswered).length;

  function handleAdminLogin() {
    if (adminLogin(adminPass)) {
      setShowAdminLogin(false);
      setAdminPass('');
      setLoginError('');
      router.push('/admin');
    } else {
      setLoginError(t('Incorrect password. Try again.', 'Password isiriyo. Edza zvakare.'));
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.navy as string, colors.navyLight as string]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="x" size={22} color="rgba(255,255,255,0.8)" />
          </Pressable>
          <Text style={styles.headerTitle}>{t('Profile', 'Zvandiri')}</Text>
          <View style={{ width: 38 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar & alias */}
        <View style={[styles.avatarSection, { backgroundColor: colors.card }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{userAlias.charAt(0)}</Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={[styles.aliasTitle, { color: colors.foreground }]}>{userAlias}</Text>
            <Text style={[styles.aliasSub, { color: colors.mutedForeground }]}>
              {t('Your anonymous alias', 'Zita rako')}
            </Text>
            <Text style={[styles.aliasNote, { color: colors.mutedForeground }]}>
              {t('Aliases change every 7 days for your privacy', 'Mazita anoshandurwa mazuva 7')}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard icon="zap" label={t('Streak', 'Mazuva')} value={streak.toString()} unit={t('days', 'mazuva')} color={colors.gold as string} bgColor={colors.goldLight as string} colors={colors} />
          <StatCard icon="help-circle" label={t('Questions', 'Mibvunzo')} value={myQCount.toString()} unit={t('asked', 'akabvunzwa')} color={colors.primary} bgColor={colors.secondary} colors={colors} />
          <StatCard icon="heart" label={t('Prayed', 'Namatira')} value={prayedIds.length.toString()} unit={t('times', 'nguva')} color="#C0392B" bgColor="#FEE2E2" colors={colors} />
        </View>

        {/* Settings */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {t('Settings', 'Zvirongwa')}
        </Text>

        <View style={[styles.settingsCard, { backgroundColor: colors.card }]}>
          <SettingsRow
            icon="globe"
            label={t('Language', 'Mutauro')}
            value={language === 'en' ? 'English' : 'Shona'}
            onPress={toggleLanguage}
            colors={colors}
            chevron={false}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {!isAdmin ? (
            <SettingsRow
              icon="shield"
              label={t('Admin Login', 'Nzvimbo yeVakuru')}
              value={t('Pastors only', 'Vafundisi chete')}
              onPress={() => setShowAdminLogin(true)}
              colors={colors}
            />
          ) : (
            <>
              <SettingsRow
                icon="settings"
                label={t('Admin Panel', 'Nzvimbo yeVakuru')}
                value={t('Logged in', 'Wapinda')}
                onPress={() => router.push('/admin')}
                colors={colors}
                valueColor={colors.success as string}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingsRow
                icon="log-out"
                label={t('Admin Logout', 'Buda')}
                value=""
                onPress={adminLogout}
                colors={colors}
                labelColor={colors.destructive}
              />
            </>
          )}
        </View>

        {/* Admin Login Form */}
        {showAdminLogin && (
          <View style={[styles.adminLoginCard, { backgroundColor: colors.card, borderColor: colors.gold as string }]}>
            <Text style={[styles.adminLoginTitle, { color: colors.primary }]}>
              {t('Admin Access', 'Nzvimbo yeVakuru')}
            </Text>
            <Text style={[styles.adminLoginSub, { color: colors.mutedForeground }]}>
              {t('Pastors and elders only. Enter the admin password.', 'Vafundisi nevakuru chete.')}
            </Text>
            <TextInput
              style={[styles.passInput, { backgroundColor: colors.background, color: colors.foreground, borderColor: loginError ? colors.destructive : colors.border }]}
              placeholder={t('Admin password', 'Password yeVakuru')}
              placeholderTextColor={colors.mutedForeground}
              value={adminPass}
              onChangeText={text => { setAdminPass(text); setLoginError(''); }}
              secureTextEntry
              autoCapitalize="none"
            />
            {loginError ? <Text style={[styles.errorText, { color: colors.destructive }]}>{loginError}</Text> : null}
            <View style={styles.loginBtnRow}>
              <Pressable onPress={() => { setShowAdminLogin(false); setAdminPass(''); setLoginError(''); }} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>{t('Cancel', 'Dzoka')}</Text>
              </Pressable>
              <Pressable onPress={handleAdminLogin} style={[styles.loginBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.loginBtnText}>{t('Login', 'Pinda')}</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* App info */}
        <View style={[styles.appInfo, { borderTopColor: colors.border }]}>
          <Text style={[styles.appInfoText, { color: colors.mutedForeground }]}>
            Pekuti v1.0 — Ruwa City Youth
          </Text>
          <Text style={[styles.appInfoText, { color: colors.mutedForeground }]}>
            {t('Built with faith and purpose', 'Yakavakwa nekutenda nechinangwa')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, label, value, unit, color, bgColor, colors }: {
  icon: string; label: string; value: string; unit: string; color: string; bgColor: string; colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
      <View style={[styles.statIcon, { backgroundColor: bgColor }]}>
        <Feather name={icon as any} size={16} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>{unit}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function SettingsRow({ icon, label, value, onPress, colors, chevron = true, valueColor, labelColor }: {
  icon: string; label: string; value: string; onPress: () => void; colors: ReturnType<typeof useColors>; chevron?: boolean; valueColor?: string; labelColor?: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.settingsRow}>
      <Feather name={icon as any} size={18} color={labelColor ?? colors.primary} />
      <Text style={[styles.settingsLabel, { color: labelColor ?? colors.foreground }]}>{label}</Text>
      <Text style={[styles.settingsValue, { color: valueColor ?? colors.mutedForeground }]}>{value}</Text>
      {chevron && <Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)' },
  headerTitle: { color: '#fff', fontSize: 18, fontFamily: 'Inter_700Bold' },
  content: { paddingHorizontal: 16, paddingTop: 20, gap: 16 },
  avatarSection: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, borderRadius: 16, padding: 18 },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { color: '#fff', fontSize: 24, fontFamily: 'Inter_700Bold' },
  avatarInfo: { flex: 1 },
  aliasTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  aliasSub: { fontSize: 12, fontFamily: 'Inter_500Medium', marginBottom: 4 },
  aliasNote: { fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 16 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  statIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statValue: { fontSize: 22, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  statUnit: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  settingsCard: { borderRadius: 16, overflow: 'hidden' },
  settingsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 16 },
  settingsLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium' },
  settingsValue: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  divider: { height: 1, marginHorizontal: 18 },
  adminLoginCard: { borderRadius: 16, padding: 18, borderWidth: 1.5 },
  adminLoginTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 6 },
  adminLoginSub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 16, lineHeight: 20 },
  passInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 8 },
  errorText: { fontSize: 12, fontFamily: 'Inter_500Medium', marginBottom: 8 },
  loginBtnRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  loginBtn: { flex: 2, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  loginBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_700Bold' },
  appInfo: { borderTopWidth: 1, paddingTop: 16, alignItems: 'center', gap: 4 },
  appInfoText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});
