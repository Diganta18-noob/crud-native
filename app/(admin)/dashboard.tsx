// ============================================================
// app/(admin)/dashboard.tsx — Admin Dashboard
// Shows ALL records with search, category filter, edit & delete
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
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
import { COLORS, Record as AppRecord, RecordCategory, RecordFormData, RecordStatus } from '../../data/mockData';

const CATEGORY_FILTERS: { value: RecordCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'other', label: 'Other' },
];

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

export default function AdminDashboard() {
  const { user } = useAuth();
  const { records, isLoading, createRecord, updateRecord, deleteRecord } = useRecords();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<RecordCategory | 'all'>('all');

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AppRecord | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState<RecordCategory>('work');
  const [editStatus, setEditStatus] = useState<RecordStatus>('active');

  // Filter records by search and category
  const filteredRecords = useMemo(() => {
    let result = records;
    if (search.trim()) {
      result = result.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (categoryFilter !== 'all') {
      result = result.filter((r) => r.category === categoryFilter);
    }
    return result;
  }, [records, search, categoryFilter]);

  // Stats for all records (admin sees everything)
  const stats = useMemo(() => ({
    total: records.length,
    active: records.filter((r) => r.status === 'active').length,
    completed: records.filter((r) => r.status === 'completed').length,
  }), [records]);

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
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: COLORS.info + '20' }]}>
            <Text style={[styles.badgeText, { color: COLORS.info }]}>{item.category}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
            <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>{item.status}</Text>
          </View>
          <Text style={styles.cardDate}>
            {new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
        {/* Owner info (admin sees who owns each record) */}
        <View style={styles.ownerRow}>
          <View style={styles.ownerAvatar}>
            <Text style={styles.ownerInitial}>{item.ownerName.charAt(0)}</Text>
          </View>
          <Text style={styles.ownerName}>{item.ownerName}</Text>
        </View>
        {/* Actions */}
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
        <View>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerSub}>Manage all records</Text>
        </View>
      </View>

      {/* ─── Stats ─────────────────────────────────────── */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total', value: stats.total, color: COLORS.admin },
          { label: 'Active', value: stats.active, color: COLORS.success },
          { label: 'Done', value: stats.completed, color: COLORS.info },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { borderLeftColor: s.color }]}>
            <Text style={styles.statNum}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* ─── Search Bar ────────────────────────────────── */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search records..."
          placeholderTextColor={COLORS.textMuted}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ─── Category Filter Chips ─────────────────────── */}
      <View style={styles.chipRow}>
        {CATEGORY_FILTERS.map((cat) => {
          const isActive = categoryFilter === cat.value;
          return (
            <TouchableOpacity
              key={cat.value}
              onPress={() => setCategoryFilter(cat.value)}
              style={[styles.chip, isActive && { backgroundColor: COLORS.admin + '25', borderColor: COLORS.admin }]}
            >
              <Text style={[styles.chipText, isActive && { color: COLORS.admin }]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ─── Records List ──────────────────────────────── */}
      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No records found</Text>
            <Text style={styles.emptyMsg}>
              {search ? 'Try a different search term' : 'No records yet'}
            </Text>
          </View>
        }
      />

      {/* ─── FAB: Create New ───────────────────────────── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (!user) return;
          // Quick create via Alert prompt would be complex,
          // so we use the same edit modal pattern for create
          setEditingRecord(null);
          setEditTitle('');
          setEditDesc('');
          setEditCategory('work');
          setEditStatus('active');
          setEditModal(true);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>

      {/* ─── Edit / Create Modal ───────────────────────── */}
      <Modal visible={editModal} transparent animationType="slide" onRequestClose={() => setEditModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setEditModal(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingRecord ? 'Edit Record' : 'New Record'}</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Title</Text>
              <TextInput
                style={styles.modalInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Record title"
                placeholderTextColor={COLORS.textMuted}
              />
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.modalInput, { minHeight: 80, textAlignVertical: 'top' }]}
                value={editDesc}
                onChangeText={setEditDesc}
                placeholder="Description..."
                placeholderTextColor={COLORS.textMuted}
                multiline
              />
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.pillRow}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c.value}
                    onPress={() => setEditCategory(c.value)}
                    style={[styles.pill, editCategory === c.value && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, editCategory === c.value && { color: COLORS.admin }]}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.fieldLabel}>Status</Text>
              <View style={styles.pillRow}>
                {STATUSES.map((s) => (
                  <TouchableOpacity
                    key={s.value}
                    onPress={() => setEditStatus(s.value)}
                    style={[styles.pill, editStatus === s.value && { backgroundColor: STATUS_COLORS[s.value] + '25', borderColor: STATUS_COLORS[s.value] }]}
                  >
                    <Text style={[styles.pillText, editStatus === s.value && { color: STATUS_COLORS[s.value] }]}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: COLORS.admin }]}
                  onPress={async () => {
                    if (!editTitle.trim() || !editDesc.trim()) return;
                    if (editingRecord) {
                      await saveEdit();
                    } else if (user) {
                      // Create new
                      await createRecord(
                        { title: editTitle.trim(), description: editDesc.trim(), category: editCategory, status: editStatus },
                        user
                      );
                      setEditModal(false);
                      Alert.alert('✅ Created', 'Record created successfully');
                    }
                  }}
                >
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
  // Header
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  headerSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  // Stats
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginVertical: 12 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 4 },
  statNum: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  statLabel: { fontSize: 11, fontWeight: '500', color: COLORS.textMuted, letterSpacing: 0.5, marginTop: 2 },
  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 15, paddingVertical: 10 },
  // Chips
  chipRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chipText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  // List
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  // Card
  card: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, marginBottom: 8, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  statusBar: { width: 3 },
  cardContent: { flex: 1, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  cardDate: { fontSize: 11, color: COLORS.textMuted, marginLeft: 'auto', letterSpacing: 0.5 },
  ownerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  ownerAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.admin + '15', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  ownerInitial: { fontSize: 11, fontWeight: '700', color: COLORS.admin, letterSpacing: 0.5 },
  ownerName: { fontSize: 13, color: COLORS.textSecondary },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  // Empty
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary, marginTop: 16, marginBottom: 8 },
  emptyMsg: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.admin,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.admin,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
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
