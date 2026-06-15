// ============================================================
// app/(admin)/manage.tsx — Manage Records (Admin)
// Sorted list of ALL records grouped by user, with edit/delete
// Simplified: no bulk select, uses simple FlatList
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
import { useRecords } from '../../store/RecordsContext';
import { COLORS, Record as AppRecord, RecordCategory, RecordStatus } from '../../data/mockData';

type SortKey = 'date' | 'title' | 'status';

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

export default function ManageScreen() {
  const { records, isLoading, updateRecord, deleteRecord } = useRecords();

  const [sortBy, setSortBy] = useState<SortKey>('date');

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AppRecord | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState<RecordCategory>('work');
  const [editStatus, setEditStatus] = useState<RecordStatus>('active');

  // Sort records
  const sortedRecords = useMemo(() => {
    const sorted = [...records];
    switch (sortBy) {
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'status':
        sorted.sort((a, b) => a.status.localeCompare(b.status));
        break;
      case 'date':
      default:
        sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    return sorted;
  }, [records, sortBy]);

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

  // ─── Delete (native Alert) ────────────────────────────────
  const confirmDelete = (id: string) => {
    Alert.alert('Delete Record', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteRecord(id);
          Alert.alert('✅ Deleted', 'Record deleted');
        },
      },
    ]);
  };

  // ─── Render Card ──────────────────────────────────────────
  const renderCard = ({ item }: { item: AppRecord }) => (
    <View style={styles.card}>
      <View style={[styles.statusBar, { backgroundColor: STATUS_COLORS[item.status] }]} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: COLORS.info + '20' }]}>
            <Text style={[styles.badgeText, { color: COLORS.info }]}>{item.category}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
            <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>{item.status}</Text>
          </View>
          <Text style={styles.ownerTag}>{item.ownerName}</Text>
        </View>
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
      {/* ─── Header ────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Records</Text>
        <Text style={styles.headerSub}>{records.length} total records</Text>
      </View>

      {/* ─── Sort Buttons ──────────────────────────────── */}
      <View style={styles.sortRow}>
        {(['date', 'title', 'status'] as SortKey[]).map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => setSortBy(key)}
            style={[styles.sortBtn, sortBy === key && styles.sortBtnActive]}
          >
            <Text style={[styles.sortBtnText, sortBy === key && styles.sortBtnTextActive]}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── Records List ──────────────────────────────── */}
      <FlatList
        data={sortedRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="clipboard-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Records</Text>
            <Text style={styles.emptyMsg}>There are no records to manage yet.</Text>
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
              <Text style={styles.fieldLabel}>Title</Text>
              <TextInput style={styles.modalInput} value={editTitle} onChangeText={setEditTitle} placeholder="Title" placeholderTextColor={COLORS.textMuted} />
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput style={[styles.modalInput, { minHeight: 80, textAlignVertical: 'top' }]} value={editDesc} onChangeText={setEditDesc} placeholder="Description..." placeholderTextColor={COLORS.textMuted} multiline />
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.pillRow}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity key={c.value} onPress={() => setEditCategory(c.value)} style={[styles.pill, editCategory === c.value && styles.pillActive]}>
                    <Text style={[styles.pillText, editCategory === c.value && { color: COLORS.admin }]}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.fieldLabel}>Status</Text>
              <View style={styles.pillRow}>
                {STATUSES.map((s) => (
                  <TouchableOpacity key={s.value} onPress={() => setEditStatus(s.value)} style={[styles.pill, editStatus === s.value && { backgroundColor: STATUS_COLORS[s.value] + '25', borderColor: STATUS_COLORS[s.value] }]}>
                    <Text style={[styles.pillText, editStatus === s.value && { color: STATUS_COLORS[s.value] }]}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: COLORS.admin }]} onPress={saveEdit}>
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
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  headerSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  // Sort
  sortRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  sortBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortBtnActive: { backgroundColor: COLORS.admin + '20', borderColor: COLORS.admin },
  sortBtnText: { fontSize: 13, color: COLORS.textMuted },
  sortBtnTextActive: { color: COLORS.admin, fontWeight: '600' },
  // List
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  // Card (compact)
  card: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, marginBottom: 6, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  statusBar: { width: 3 },
  cardContent: { flex: 1, padding: 12 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  ownerTag: { fontSize: 11, color: COLORS.textMuted, marginLeft: 'auto' },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: COLORS.border },
  // Empty
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary, marginTop: 16, marginBottom: 8 },
  emptyMsg: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },
  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', paddingBottom: 32 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginTop: 8, marginBottom: 8 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary },
  modalBody: { paddingHorizontal: 24, paddingTop: 16 },
  fieldLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4, marginTop: 12 },
  modalInput: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: COLORS.textPrimary, fontSize: 15 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  pillActive: { backgroundColor: COLORS.admin + '25', borderColor: COLORS.admin },
  pillText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 24, marginBottom: 16 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: COLORS.surfaceHigh, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.white },
});
