// ============================================================
// app/(user)/create.tsx — Create Record Screen
// Inline form with category/status pickers
// ============================================================

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { useRecords } from '../../store/RecordsContext';
import { COLORS, RecordCategory, RecordStatus } from '../../data/mockData';

const CATEGORIES: { value: RecordCategory; label: string }[] = [
  { value: 'work', label: '💼 Work' },
  { value: 'personal', label: '👤 Personal' },
  { value: 'urgent', label: '🔴 Urgent' },
  { value: 'other', label: '📋 Other' },
];

const STATUSES: { value: RecordStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_COLORS: Record<string, string> = {
  active: COLORS.success,
  completed: COLORS.info,
  archived: COLORS.textMuted,
};

export default function CreateScreen() {
  const { user } = useAuth();
  const { createRecord } = useRecords();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RecordCategory>('work');
  const [status, setStatus] = useState<RecordStatus>('active');

  const handleSave = async () => {
    // Simple inline validation
    if (!title.trim()) return Alert.alert('Error', 'Title is required');
    if (title.trim().length < 3) return Alert.alert('Error', 'Title must be at least 3 characters');
    if (!description.trim()) return Alert.alert('Error', 'Description is required');
    if (description.trim().length < 10) return Alert.alert('Error', 'Description must be at least 10 characters');
    if (!user) return;

    await createRecord(
      { title: title.trim(), description: description.trim(), category, status },
      user
    );
    Alert.alert('✅ Created', 'Record created successfully');
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Create Record</Text>
        <Text style={styles.pageSubtitle}>Add a new record to your collection</Text>

        {/* ─── Title Input ──────────────────────────────── */}
        <Text style={styles.label}>Title</Text>
        <View style={styles.inputRow}>
          <Ionicons name="document-text-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter record title"
            placeholderTextColor={COLORS.textMuted}
            maxLength={80}
          />
        </View>

        {/* ─── Description Input ────────────────────────── */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe this record..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={4}
          maxLength={500}
          textAlignVertical="top"
        />

        {/* ─── Category Picker ──────────────────────────── */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.pillRow}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.value}
              onPress={() => setCategory(c.value)}
              style={[styles.pill, category === c.value && styles.pillActive]}
            >
              <Text style={[styles.pillText, category === c.value && { color: COLORS.primary }]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Status Picker ────────────────────────────── */}
        <Text style={styles.label}>Status</Text>
        <View style={styles.pillRow}>
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s.value}
              onPress={() => setStatus(s.value)}
              style={[
                styles.pill,
                status === s.value && { backgroundColor: STATUS_COLORS[s.value] + '25', borderColor: STATUS_COLORS[s.value] },
              ]}
            >
              <Text style={[styles.pillText, status === s.value && { color: STATUS_COLORS[s.value] }]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Action Buttons ───────────────────────────── */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Ionicons name="checkmark-outline" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
  pageTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  pageSubtitle: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 24 },
  label: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4, marginTop: 16 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: 15, paddingVertical: 14 },
  textArea: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    color: COLORS.textPrimary,
    fontSize: 15,
    minHeight: 100,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  pillActive: { backgroundColor: COLORS.primary + '25', borderColor: COLORS.primary },
  pillText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 32 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceHigh,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.white },
});
