import React, { useState } from 'react';
import {
  FlatList,
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
import { type Devotion } from '@/data/mockData';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminDevotionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { devotions, addDevotion } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    publishDate: new Date().toISOString().split('T')[0],
    titleEn: '', titleSn: '',
    verseReference: '',
    verseTextEn: '', verseTextSn: '',
    reflectionEn: '', reflectionSn: '',
    actionPointEn: '', actionPointSn: '',
  });

  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  function handleAdd() {
    if (!form.titleEn || !form.verseReference) return;
    addDevotion({
      ...form,
      titleSn: form.titleSn || form.titleEn,
      verseTextSn: form.verseTextSn || form.verseTextEn,
      reflectionSn: form.reflectionSn || form.reflectionEn,
      actionPointSn: form.actionPointSn || form.actionPointEn,
    });
    setForm({ publishDate: new Date().toISOString().split('T')[0], titleEn: '', titleSn: '', verseReference: '', verseTextEn: '', verseTextSn: '', reflectionEn: '', reflectionSn: '', actionPointEn: '', actionPointSn: '' });
    setShowForm(false);
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]}
      showsVerticalScrollIndicator={false}
      data={devotions}
      keyExtractor={item => item.id}
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
              <Field label="Publish Date" value={form.publishDate} onChange={v => setForm(p => ({ ...p, publishDate: v }))} colors={colors} placeholder="YYYY-MM-DD" />
              <Field label="Title (English)" value={form.titleEn} onChange={v => setForm(p => ({ ...p, titleEn: v }))} colors={colors} placeholder="e.g. Purpose in the Storm" />
              <Field label="Title (Shona)" value={form.titleSn} onChange={v => setForm(p => ({ ...p, titleSn: v }))} colors={colors} placeholder="e.g. Chinangwa Muchirima" />
              <Field label="Verse Reference" value={form.verseReference} onChange={v => setForm(p => ({ ...p, verseReference: v }))} colors={colors} placeholder="e.g. Jeremiah 29:11" />
              <Field label="Verse Text (English)" value={form.verseTextEn} onChange={v => setForm(p => ({ ...p, verseTextEn: v }))} colors={colors} multiline />
              <Field label="Verse Text (Shona)" value={form.verseTextSn} onChange={v => setForm(p => ({ ...p, verseTextSn: v }))} colors={colors} multiline />
              <Field label="Reflection (English)" value={form.reflectionEn} onChange={v => setForm(p => ({ ...p, reflectionEn: v }))} colors={colors} multiline />
              <Field label="Reflection (Shona)" value={form.reflectionSn} onChange={v => setForm(p => ({ ...p, reflectionSn: v }))} colors={colors} multiline />
              <Field label="Action Point (English)" value={form.actionPointEn} onChange={v => setForm(p => ({ ...p, actionPointEn: v }))} colors={colors} />
              <Field label="Action Point (Shona)" value={form.actionPointSn} onChange={v => setForm(p => ({ ...p, actionPointSn: v }))} colors={colors} />
              <View style={styles.formBtns}>
                <Pressable onPress={() => setShowForm(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                  <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleAdd} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
                  <Text style={styles.saveBtnText}>Save Devotion</Text>
                </Pressable>
              </View>
            </View>
          )}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Devotions ({devotions.length})</Text>
        </View>
      }
      renderItem={({ item }) => {
        const isToday = item.publishDate === new Date().toISOString().split('T')[0];
        return (
          <View style={[styles.devCard, { backgroundColor: colors.card, borderLeftWidth: isToday ? 4 : 0, borderLeftColor: colors.gold as string }]}>
            <View style={styles.devCardHeader}>
              <Text style={[styles.devDate, { color: colors.mutedForeground }]}>{item.publishDate}</Text>
              {isToday && (
                <View style={[styles.todayBadge, { backgroundColor: colors.goldLight as string }]}>
                  <Text style={[styles.todayBadgeText, { color: colors.goldDark as string }]}>Today</Text>
                </View>
              )}
            </View>
            <Text style={[styles.devTitle, { color: colors.foreground }]}>{item.titleEn}</Text>
            <Text style={[styles.devVerse, { color: colors.gold as string }]}>{item.verseReference}</Text>
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
  devTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 3 },
  devVerse: { fontSize: 12, fontFamily: 'Inter_500Medium' },
});
