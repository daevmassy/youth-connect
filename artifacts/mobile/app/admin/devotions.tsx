import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useListDevotionals, useCreateDevotional, useDeleteDevotional } from '@workspace/api-client-react';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EMPTY_FORM = { title: '', scriptureRef: '', scriptureText: '', body: '' };

export default function AdminDevotionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, refetch } = useListDevotionals();
  const createDevotional = useCreateDevotional();
  const deleteDevotional = useDeleteDevotional();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);
  const devotionals = data?.devotionals ?? [];
  const todayStr = new Date().toISOString().split('T')[0];

  async function handleAdd() {
    if (!form.title || !form.scriptureRef || !form.scriptureText || !form.body) return;
    await createDevotional.mutateAsync({ data: form });
    setForm(EMPTY_FORM);
    setShowForm(false);
    await refetch();
  }

  function handleDelete(id: number) {
    Alert.alert('Delete devotion', 'Are you sure you want to delete this devotion?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteDevotional.mutateAsync({ id }); await refetch(); } },
    ]);
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]}
      showsVerticalScrollIndicator={false}
      data={devotionals}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={
        <View>
          {!showForm ? (
            <Pressable onPress={() => setShowForm(true)} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
              <Feather name="plus" size={18} color="#fff" />
              <Text style={styles.addBtnText}>Add New Devotion</Text>
            </Pressable>
          ) : (
            <View style={[styles.formCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.formTitle, { color: colors.primary }]}>New Devotion</Text>
              <Field label="Title" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} colors={colors} placeholder="e.g. Purpose in the Storm" />
              <Field label="Scripture Reference" value={form.scriptureRef} onChange={v => setForm(p => ({ ...p, scriptureRef: v }))} colors={colors} placeholder="e.g. Jeremiah 29:11" />
              <Field label="Scripture Text" value={form.scriptureText} onChange={v => setForm(p => ({ ...p, scriptureText: v }))} colors={colors} multiline />
              <Field label="Reflection" value={form.body} onChange={v => setForm(p => ({ ...p, body: v }))} colors={colors} multiline />
              <View style={styles.formBtns}>
                <Pressable onPress={() => { setShowForm(false); setForm(EMPTY_FORM); }} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                  <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleAdd} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
                  <Text style={styles.saveBtnText}>Save Devotion</Text>
                </Pressable>
              </View>
            </View>
          )}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Devotions ({devotionals.length})</Text>
        </View>
      }
      renderItem={({ item }) => {
        const isToday = item.publishDate === todayStr;
        return (
          <View style={[styles.devCard, { backgroundColor: colors.card, borderLeftWidth: isToday ? 4 : 0, borderLeftColor: colors.gold as string }]}>
            <View style={styles.devCardHeader}>
              <Text style={[styles.devDate, { color: colors.mutedForeground }]}>{item.publishDate}</Text>
              {isToday && (
                <View style={[styles.todayBadge, { backgroundColor: colors.goldLight as string }]}>
                  <Text style={[styles.todayBadgeText, { color: colors.goldDark as string }]}>Today</Text>
                </View>
              )}
              <Pressable onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                <Feather name="trash-2" size={15} color={colors.destructive} />
              </Pressable>
            </View>
            <Text style={[styles.devTitle, { color: colors.foreground }]}>{item.title}</Text>
            <Text style={[styles.devVerse, { color: colors.gold as string }]}>{item.scriptureRef}</Text>
          </View>
        );
      }}
    />
  );
}

function Field({ label, value, onChange, colors, placeholder, multiline }: {
  label: string; value: string; onChange: (v: string) => void; colors: ReturnType<typeof useColors>; placeholder?: string; multiline?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border, minHeight: multiline ? 80 : 44 }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? ''}
        placeholderTextColor={colors.mutedForeground}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 15, marginBottom: 4 },
  addBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Inter_700Bold' },
  formCard: { borderRadius: 14, padding: 16, marginBottom: 4 },
  formTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', marginBottom: 12 },
  fieldWrap: { marginBottom: 10 },
  fieldLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', marginBottom: 5 },
  fieldInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: 'Inter_400Regular' },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 6 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  cancelText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  saveBtn: { flex: 2, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 13, fontFamily: 'Inter_700Bold' },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', marginBottom: 4, marginTop: 8 },
  devCard: { borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  devCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  devDate: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  todayBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  todayBadgeText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  deleteBtn: { marginLeft: 'auto', padding: 4 },
  devTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 3 },
  devVerse: { fontSize: 12, fontFamily: 'Inter_500Medium' },
});
