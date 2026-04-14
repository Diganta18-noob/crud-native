import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';
import { Record as AppRecord, RecordFormData } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useRecords } from '../../hooks/useRecords';
import { useToast } from '../../hooks/useToast';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import SectionHeader from '../../components/layout/SectionHeader';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Loader from '../../components/ui/Loader';
import RecordModal from '../../components/modals/RecordModal';
import ConfirmModal from '../../components/modals/ConfirmModal';

export default function UserHomeScreen() {
  const { user } = useAuth();
  const { records, isLoading, createRecord, updateRecord, deleteRecord, getRecordsByUser } = useRecords();
  const { showToast } = useToast();

  const [showAll, setShowAll] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedRecord, setSelectedRecord] = useState<AppRecord | undefined>();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<string>('');

  const myRecords = useMemo(() => {
    if (!user) return [];
    return getRecordsByUser(user.id);
  }, [records, user]);

  const displayRecords = showAll ? myRecords : myRecords.slice(0, 5);

  const stats = useMemo(() => ({
    total: myRecords.length,
    active: myRecords.filter((r) => r.status === 'active').length,
    completed: myRecords.filter((r) => r.status === 'completed').length,
  }), [myRecords]);

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

  if (isLoading) return <Loader />;

  return (
    <ScreenWrapper scroll={false} padded={false}>
      {/* Greeting */}
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>Hey, {user?.name?.split(' ')[0]} 👋</Text>
        <Text style={styles.greetingSub}>Here&apos;s your activity overview</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: Colors.primary }]}>
          <Text style={styles.statNum}>{stats.total}</Text>
          <Text style={styles.statLabel}>My Records</Text>
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

      {/* Records section */}
      <View style={styles.sectionRow}>
        <SectionHeader
          title={showAll ? 'All Records' : 'Recent Records'}
          actionLabel={myRecords.length > 5 ? (showAll ? 'Show Less' : 'View All') : undefined}
          onAction={() => setShowAll(!showAll)}
        />
      </View>

      <FlatList
        data={displayRecords}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <Card
            record={item}
            onEdit={handleEdit}
            onDelete={handleDeletePress}
            onPress={handleView}
            index={index}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title="No records yet"
            message="Create your first record to get started!"
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
  greetingSection: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  greeting: {
    ...Typography.displayMD,
    color: Colors.textPrimary,
  },
  greetingSub: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 2,
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
  sectionRow: {
    paddingHorizontal: Spacing.md,
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
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
});
