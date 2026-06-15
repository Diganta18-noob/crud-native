// ============================================================
// app/(user)/home.tsx — User Home Screen
// Shows user's own records with inline cards, edit modal,
// and delete confirmation via Alert.alert
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { useRecords } from '../../store/RecordsContext';
import { COLORS, Record as AppRecord, RecordFormData, RecordCategory, RecordStatus } from '../../data/mockData';

// ─── Category & Status options for the form ──────────────────
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

export default function UserHomeScreen() {
  const { user } = useAuth();
  const { records, isLoading, updateRecord, deleteRecord, getRecordsByUser } = useRecords();

  // Modal state for editing
  const [editModal, setEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AppRecord | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState<RecordCategory>('work');
  const [editStatus, setEditStatus] = useState<RecordStatus>('active');

  // Get only this user's records
  const myRecords = useMemo(() => {
    if (!user) return [];
    return getRecordsByUser(user.id);
  }, [records, user]);

  // Quick stats
  const stats = useMemo(() => ({
    total: myRecords.length,
    active: myRecords.filter((r) => r.status === 'active').length,
    completed: myRecords.filter((r) => r.status === 'completed').length,
  }), [myRecords]);

  // ─── Edit Handlers ────────────────────────────────────────
  const openEdit = (record: AppRecord) => {
    setEditingRecord(record);
    setEditTitle(record.title);
    setEditDesc(record.description);
    setEditCategory(record.category);
    setEditStatus(record.status);
    setEditModal(true);
  };

  const saveEdit = async () => {
    if (!editingRecord || !editTitle.trim() || !editDesc.trim()) return;
    await updateRecord(editingRecord.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      category: editCategory,
      status: editStatus,
    });
    setEditModal(false);
    Alert.alert('✅ Updated', 'Record updated successfully');
  };

  // ─── Delete Handler (uses native Alert) ───────────────────
  const confirmDelete = (id: string) => {
    Alert.alert('Delete Record', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteRecord(id);
          Alert.alert('✅ Deleted', 'Record deleted successfully');
        },
      },
    ]);
  };

  // ─── Render a single record card (inline) ─────────────────
  const renderCard = ({ item }: { item: AppRecord }) => (
    <View style={styles.card}>
      <View style={[styles.statusBar, { backgroundColor: STATUS_COLORS[item.status] }]} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        {/* Category & Status badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: COLORS.primary + '20' }]}>
            <Text style={[styles.badgeText, { color: COLORS.primaryLight }]}>{item.category}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
            <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>{item.status}</Text>
          </View>
          <Text style={styles.cardDate}>
            {new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
        {/* Action buttons */}
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => openEdit(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="pencil-outline" size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmDelete(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: COLORS.textMuted }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ─── Greeting ──────────────────────────────────── */}
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Hey, {user?.name?.split(' ')[0]} 👋</Text>
        <Text style={styles.greetingSub}>Here's your activity overview</Text>
      </View>

      {/* ─── Stats Row ─────────────────────────────────── */}
      <View style={styles.statsRow}>
        {[
          { label: 'My Records', value: stats.total, color: COLORS.primary },
          { label: 'Active', value: stats.active, color: COLORS.success },
          { label: 'Done', value: stats.completed, color: COLORS.info },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { borderLeftColor: s.color }]}>
            <Text style={styles.statNum}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* ─── Records List ──────────────────────────────── */}
      <Text style={styles.sectionTitle}>My Records</Text>
      <FlatList
        data={myRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No records yet</Text>
            <Text style={styles.emptyMsg}>Go to the Create tab to add your first record!</Text>
          </View>
        }
      />

      {/* ─── Edit Modal ────────────────────────────────── */}
      <Modal visible={editModal} transparent animationType="slide" onRequestClose={() => setEditModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setEditModal(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Record</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Title */}
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.modalInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Record title"
                placeholderTextColor={COLORS.textMuted}
              />
              {/* Description */}
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.modalInput, { minHeight: 80, textAlignVertical: 'top' }]}
                value={editDesc}
                onChangeText={setEditDesc}
                placeholder="Describe this record..."
                placeholderTextColor={COLORS.textMuted}
                multiline
              />
              {/* Category pills */}
              <Text style={styles.label}>Category</Text>
              <View style={styles.pillRow}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c.value}
                    onPress={() => setEditCategory(c.value)}
                    style={[styles.pill, editCategory === c.value && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, editCategory === c.value && { color: COLORS.primary }]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Status pills */}
              <Text style={styles.label}>Status</Text>
              <View style={styles.pillRow}>
                {STATUSES.map((s) => (
                  <TouchableOpacity
                    key={s.value}
                    onPress={() => setEditStatus(s.value)}
                    style={[styles.pill, editStatus === s.value && { backgroundColor: STATUS_COLORS[s.value] + '25', borderColor: STATUS_COLORS[s.value] }]}
                  >
                    <Text style={[styles.pillText, editStatus === s.value && { color: STATUS_COLORS[s.value] }]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Save / Cancel */}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  // Greeting
  greeting: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  greetingText: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  greetingSub: { fontSize: 15, color: COLORS.textSecondary, marginTop: 2 },
  // Stats
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginVertical: 12 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
  },
  statNum: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  statLabel: { fontSize: 11, fontWeight: '500', color: COLORS.textMuted, letterSpacing: 0.5, marginTop: 2 },
  // Section
  sectionTitle: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary, paddingHorizontal: 16, marginBottom: 12 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusBar: { width: 3 },
  cardContent: { flex: 1, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  cardDate: { fontSize: 11, color: COLORS.textMuted, marginLeft: 'auto', letterSpacing: 0.5 },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  // Empty state
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary, marginTop: 16, marginBottom: 8 },
  emptyMsg: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },
  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 32,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginTop: 8, marginBottom: 8 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary },
  modalBody: { paddingHorizontal: 24, paddingTop: 16 },
  label: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4, marginTop: 12 },
  modalInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 15,
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
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 24, marginBottom: 16 },
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
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.white },
});
