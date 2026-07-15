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
import { useColors } from '@/hooks/useColors';
import { useListEvents, useCreateEvent } from '@workspace/api-client-react';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EMPTY_FORM = { title: '', description: '', location: '', startsAt: '' };

export default function AdminEventsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, refetch } = useListEvents();
  const createEvent = useCreateEvent();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);
  const events = data?.events ?? [];

  async function handleAdd() {
    if (!form.title || !form.startsAt) return;
    const isoDate = new Date(form.startsAt).toISOString();
    await createEvent.mutateAsync({ data: { ...form, startsAt: isoDate } });
    setForm(EMPTY_FORM);
    setShowForm(false);
    await refetch();
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]}
      showsVerticalScrollIndicator={false}
      data={events}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={
        <View>
          {!showForm ? (
            <Pressable onPress={() => setShowForm(true)} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
              <Feather name="plus" size={18} color="#fff" />
              <Text style={styles.addBtnText}>Add New Event</Text>
            </Pressable>
          ) : (
            <View style={[styles.formCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.formTitle, { color: colors.primary }]}>New Event</Text>
              <Field label="Title" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} colors={colors} placeholder="e.g. Youth Night" />
              <Field label="Date & Time" value={form.startsAt} onChange={v => setForm(p => ({ ...p, startsAt: v }))} colors={colors} placeholder="YYYY-MM-DD HH:MM" />
              <Field label="Location" value={form.location} onChange={v => setForm(p => ({ ...p, location: v }))} colors={colors} placeholder="e.g. Main Hall" />
              <Field label="Description" value={form.description} onChange={v => setForm(p => ({ ...p, description: v }))} colors={colors} multiline />
              <View style={styles.formBtns}>
                <Pressable onPress={() => { setShowForm(false); setForm(EMPTY_FORM); }} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                  <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleAdd} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
                  <Text style={styles.saveBtnText}>Save Event</Text>
                </Pressable>
              </View>
            </View>
          )}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Events ({events.length})</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={[styles.evCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.evTitle, { color: colors.foreground }]}>{item.title}</Text>
          <Text style={[styles.evMeta, { color: colors.mutedForeground }]}>
            {new Date(item.startsAt).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </Text>
          {item.location ? <Text style={[styles.evMeta, { color: colors.mutedForeground }]}>{item.location}</Text> : null}
        </View>
      )}
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
  evCard: { borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  evTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  evMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 2 },
});
