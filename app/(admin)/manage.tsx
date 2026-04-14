import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { Record as AppRecord } from '../../types';
import { useRecords } from '../../hooks/useRecords';
import { useToast } from '../../hooks/useToast';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Loader from '../../components/ui/Loader';
import ConfirmModal from '../../components/modals/ConfirmModal';
import RecordModal from '../../components/modals/RecordModal';
import { RecordFormData } from '../../types';

type SortKey = 'date' | 'title' | 'status';

export default function ManageScreen() {
  const { records, isLoading, updateRecord, deleteRecord } = useRecords();
  const { showToast } = useToast();

  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);

  // Edit modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editRecord, setEditRecord] = useState<AppRecord | undefined>();

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

  // Group by user
  const sections = useMemo(() => {
    const grouped: Record<string, AppRecord[]> = {};
    sortedRecords.forEach((r) => {
      if (!grouped[r.ownerName]) grouped[r.ownerName] = [];
      grouped[r.ownerName].push(r);
    });
    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  }, [sortedRecords]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await deleteRecord(id);
    }
    setSelectedIds(new Set());
    setConfirmVisible(false);
    setBulkMode(false);
    showToast('success', 'Deleted', `${selectedIds.size} records deleted`);
  };

  const handleEdit = (record: AppRecord) => {
    setEditRecord(record);
    setEditModalVisible(true);
  };

  const handleEditSave = async (data: RecordFormData) => {
    if (editRecord) {
      await updateRecord(editRecord.id, data);
      showToast('success', 'Updated', 'Record updated successfully');
    }
    setEditModalVisible(false);
  };

  const handleSingleDelete = async (id: string) => {
    await deleteRecord(id);
    showToast('success', 'Deleted', 'Record deleted');
  };

  if (isLoading) return <Loader color={Colors.admin} />;

  return (
    <ScreenWrapper scroll={false} padded={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Records</Text>
        <TouchableOpacity
          onPress={() => { setBulkMode(!bulkMode); setSelectedIds(new Set()); }}
          style={[styles.bulkBtn, bulkMode && styles.bulkBtnActive]}
        >
          <Ionicons name={bulkMode ? 'close' : 'checkmark-done-outline'} size={18} color={bulkMode ? Colors.white : Colors.admin} />
          <Text style={[styles.bulkBtnText, bulkMode && { color: Colors.white }]}>
            {bulkMode ? 'Cancel' : 'Select'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort Toggle */}
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

      {/* Bulk delete bar */}
      {bulkMode && selectedIds.size > 0 && (
        <View style={styles.bulkBar}>
          <Text style={styles.bulkBarText}>{selectedIds.size} selected</Text>
          <TouchableOpacity
            onPress={() => setConfirmVisible(true)}
            style={styles.bulkDeleteBtn}
          >
            <Ionicons name="trash-outline" size={16} color={Colors.white} />
            <Text style={styles.bulkDeleteText}>Delete All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Section List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionInitial}>{section.title.charAt(0)}</Text>
            </View>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.data.length} records</Text>
          </View>
        )}
        renderItem={({ item, index }) => (
          <View style={styles.itemRow}>
            {bulkMode && (
              <TouchableOpacity
                onPress={() => toggleSelect(item.id)}
                style={styles.checkbox}
              >
                <Ionicons
                  name={selectedIds.has(item.id) ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={selectedIds.has(item.id) ? Colors.admin : Colors.textMuted}
                />
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }}>
              <Card
                record={item}
                onEdit={!bulkMode ? handleEdit : undefined}
                onDelete={!bulkMode ? handleSingleDelete : undefined}
                compact
                index={index}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="clipboard-outline"
            title="No Records"
            message="There are no records to manage yet."
          />
        }
      />

      {/* Modals */}
      <ConfirmModal
        visible={confirmVisible}
        title="Bulk Delete"
        message={`Are you sure you want to delete ${selectedIds.size} records? This cannot be undone.`}
        confirmLabel={`Delete ${selectedIds.size}`}
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmVisible(false)}
      />

      <RecordModal
        visible={editModalVisible}
        mode="edit"
        record={editRecord}
        onClose={() => setEditModalVisible(false)}
        onSave={handleEditSave}
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
  bulkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.admin,
  },
  bulkBtnActive: {
    backgroundColor: Colors.admin,
  },
  bulkBtnText: {
    ...Typography.bodySmall,
    color: Colors.admin,
    fontWeight: '600',
  },
  sortRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  sortBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortBtnActive: {
    backgroundColor: Colors.admin + '20',
    borderColor: Colors.admin,
  },
  sortBtnText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  sortBtnTextActive: {
    color: Colors.admin,
    fontWeight: '600',
  },
  bulkBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.error + '15',
    marginHorizontal: Spacing.md,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  bulkBarText: {
    ...Typography.bodySmall,
    color: Colors.error,
    fontWeight: '600',
  },
  bulkDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
  },
  bulkDeleteText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.admin + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  sectionInitial: {
    ...Typography.bodySmall,
    color: Colors.admin,
    fontWeight: '700',
  },
  sectionTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    flex: 1,
  },
  sectionCount: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: Spacing.sm,
    padding: 2,
  },
});
