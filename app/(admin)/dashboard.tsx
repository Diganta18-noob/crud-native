import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';
import { Record as AppRecord, RecordFormData, RecordCategory } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useRecords } from '../../hooks/useRecords';
import { useToast } from '../../hooks/useToast';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Loader from '../../components/ui/Loader';
import RecordModal from '../../components/modals/RecordModal';
import ConfirmModal from '../../components/modals/ConfirmModal';

const categoryFilters: { value: RecordCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'other', label: 'Other' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { records, isLoading, createRecord, updateRecord, deleteRecord } = useRecords();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<RecordCategory | 'all'>('all');

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedRecord, setSelectedRecord] = useState<AppRecord | undefined>();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<string>('');

  const filteredRecords = useMemo(() => {
    let result = records;
    if (search.trim()) {
      result = result.filter((r) =>
        r.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (categoryFilter !== 'all') {
      result = result.filter((r) => r.category === categoryFilter);
    }
    return result;
  }, [records, search, categoryFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: records.length,
    active: records.filter((r) => r.status === 'active').length,
    completed: records.filter((r) => r.status === 'completed').length,
  }), [records]);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedRecord(undefined);
    setModalVisible(true);
  };

  const handleEdit = (record: AppRecord) => {
    setModalMode('edit');
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const handleView = (record: AppRecord) => {
    setModalMode('view');
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const handleDeletePress = (id: string) => {
    setDeleteId(id);
    setConfirmVisible(true);
  };

  const handleConfirmDelete = async () => {
    await deleteRecord(deleteId);
    setConfirmVisible(false);
    showToast('success', 'Deleted', 'Record deleted successfully');
  };

  const handleSave = async (data: RecordFormData) => {
    if (modalMode === 'create' && user) {
      await createRecord(data, user);
      showToast('success', 'Created', 'Record created successfully');
    } else if (modalMode === 'edit' && selectedRecord) {
      await updateRecord(selectedRecord.id, data);
      showToast('success', 'Updated', 'Record updated successfully');
    }
    setModalVisible(false);
  };

  if (isLoading) return <Loader color={Colors.admin} />;

  return (
    <ScreenWrapper scroll={false} padded={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerSub}>Manage all records</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color={Colors.admin} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: Colors.admin }]}>
          <Text style={styles.statNum}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: Colors.success }]}>
          <Text style={styles.statNum}>{stats.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: Colors.info }]}>
          <Text style={styles.statNum}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search records..."
          placeholderTextColor={Colors.textMuted}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Chips */}
      <View style={styles.chipRow}>
        {categoryFilters.map((cat) => {
          const isActive = categoryFilter === cat.value;
          return (
            <TouchableOpacity
              key={cat.value}
              onPress={() => setCategoryFilter(cat.value)}
              style={[
                styles.chip,
                isActive && { backgroundColor: Colors.admin + '25', borderColor: Colors.admin },
              ]}
            >
              <Text style={[styles.chipText, isActive && { color: Colors.admin }]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Records List */}
      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <Card
            record={item}
            onEdit={handleEdit}
            onDelete={handleDeletePress}
            onPress={handleView}
            showOwner
            index={index}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No records found"
            message={search ? 'Try a different search term' : 'No records yet. Create one!'}
            actionLabel="Create Record"
            onAction={handleCreate}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleCreate} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>

      {/* Modals */}
      <RecordModal
        visible={modalVisible}
        mode={modalMode}
        record={selectedRecord}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
      <ConfirmModal
        visible={confirmVisible}
        title="Delete Record"
        message="Are you sure you want to delete this record? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmVisible(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    ...Typography.displayMD,
    color: Colors.textPrimary,
  },
  headerSub: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    padding: Spacing.sm,
    backgroundColor: Colors.admin + '15',
    borderRadius: Radius.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    ...Shadow.sm,
  },
  statNum: {
    ...Typography.displayMD,
    color: Colors.textPrimary,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    ...Typography.body,
    paddingVertical: Spacing.sm + 2,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.admin,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
});
