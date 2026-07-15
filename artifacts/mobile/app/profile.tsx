import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isAdmin, adminLogin, adminLogout } = useApp();
  const { user, logout, updateProfile } = useAuth();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [saving, setSaving] = useState(false);

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  function handleAdminLogin() {
    if (adminLogin(adminPass)) {
      setShowAdminLogin(false);
      setAdminPass('');
      setLoginError('');
      router.push('/admin');
    } else {
      setLoginError('Incorrect password. Try again.');
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    try {
      await updateProfile({ firstName, lastName, bio });
      setEditing(false);
    } catch {
      Alert.alert('Error', 'Could not update profile. Try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout() },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.navy as string, colors.navyLight as string]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-down" size={24} color="#fff" />
        </Pressable>
        <View style={[styles.avatar, { backgroundColor: colors.gold as string }]}>
          <Text style={[styles.avatarText, { color: colors.navy as string }]}>
            {(user?.firstName?.charAt(0) ?? '') + (user?.lastName?.charAt(0) ?? '')}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
        <Text style={[styles.userHandle, { color: 'rgba(255,255,255,0.7)' }]}>@{user?.username}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: colors.primary }]}>Your Info</Text>
            {!editing && (
              <Pressable onPress={() => setEditing(true)}>
                <Feather name="edit-2" size={16} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>

          {editing ? (
            <>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>First name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                value={firstName}
                onChangeText={setFirstName}
              />
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Last name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                value={lastName}
                onChangeText={setLastName}
              />
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                value={bio}
                onChangeText={setBio}
                multiline
                placeholder="Tell the group about yourself"
                placeholderTextColor={colors.mutedForeground}
              />
              <View style={styles.btnRow}>
                <Pressable onPress={() => setEditing(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                  <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleSaveProfile} disabled={saving} style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}>
                  <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <InfoRow icon="mail" label="Email" value={user?.email ?? ''} colors={colors} />
              <InfoRow icon="at-sign" label="Username" value={user?.username ?? ''} colors={colors} />
              {user?.bio ? <InfoRow icon="file-text" label="Bio" value={user.bio} colors={colors} /> : null}
            </>
          )}
        </View>

        <Pressable onPress={handleLogout} style={[styles.logoutBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="log-out" size={16} color="#DC2626" />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>

        {/* Admin Access */}
        <View style={[styles.card, { backgroundColor: colors.card, marginTop: 8 }]}>
          <View style={styles.adminHeader}>
            <MaterialCommunityIcons name="shield-account" size={18} color={colors.gold as string} />
            <Text style={[styles.cardTitle, { color: colors.primary }]}>Admin Access</Text>
          </View>

          {isAdmin ? (
            <>
              <Text style={[styles.adminStatusText, { color: colors.success as string }]}>
                You are logged in as an admin.
              </Text>
              <Pressable
                onPress={() => { adminLogout(); }}
                style={[styles.adminActionBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
              >
                <Text style={[styles.adminActionText, { color: colors.foreground }]}>Log out of admin</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/admin')}
                style={[styles.adminActionBtn, { backgroundColor: colors.goldLight as string, borderColor: colors.gold as string }]}
              >
                <Text style={[styles.adminActionText, { color: colors.goldDark as string }]}>Open Admin Panel</Text>
              </Pressable>
            </>
          ) : showAdminLogin ? (
            <>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                placeholder="Admin password"
                placeholderTextColor={colors.mutedForeground}
                value={adminPass}
                onChangeText={setAdminPass}
                secureTextEntry
                autoCapitalize="none"
              />
              {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}
              <View style={styles.btnRow}>
                <Pressable onPress={() => { setShowAdminLogin(false); setAdminPass(''); setLoginError(''); }} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                  <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleAdminLogin} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
                  <Text style={styles.saveBtnText}>Log in</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <Pressable
              onPress={() => setShowAdminLogin(true)}
              style={[styles.adminActionBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            >
              <Text style={[styles.adminActionText, { color: colors.foreground }]}>Log in as pastor / moderator</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: ReturnType<typeof import('@/hooks/useColors').useColors> }) {
  return (
    <View style={styles.infoRow}>
      <Feather name={icon as any} size={14} color={colors.mutedForeground} />
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24, alignItems: 'center' },
  backBtn: { position: 'absolute', top: Platform.OS === 'web' ? 20 : 60, right: 20, zIndex: 10 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  userName: { color: '#fff', fontSize: 20, fontFamily: 'Inter_700Bold' },
  userHandle: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },
  card: { borderRadius: 16, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  infoLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', width: 70 },
  infoValue: { fontSize: 14, fontFamily: 'Inter_400Regular', flex: 1 },
  fieldLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', marginBottom: 6, marginTop: 8 },
  input: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: 'Inter_400Regular' },
  textArea: { minHeight: 70, textAlignVertical: 'top' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  cancelBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  saveBtn: { flex: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 13, fontFamily: 'Inter_700Bold' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1, paddingVertical: 14 },
  logoutText: { color: '#DC2626', fontSize: 14, fontFamily: 'Inter_700Bold' },
  adminHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  adminStatusText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 12 },
  adminActionBtn: { borderWidth: 1.5, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  adminActionText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  errorText: { color: '#DC2626', fontSize: 12, fontFamily: 'Inter_500Medium', marginTop: 6 },
});
