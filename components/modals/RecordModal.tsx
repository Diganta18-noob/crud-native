import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { Record as AppRecord, RecordFormData } from '../../types';
import RecordForm from '../forms/RecordForm';
import Badge from '../ui/Badge';

type ModalMode = 'create' | 'edit' | 'view';

interface RecordModalProps {
  visible: boolean;
  mode: ModalMode;
  record?: AppRecord;
  onClose: () => void;
  onSave: (data: RecordFormData) => void;
  loading?: boolean;
}

const modeTitles: Record<ModalMode, string> = {
  create: 'New Record',
  edit: 'Edit Record',
  view: 'Record Detail',
};

export default function RecordModal({
  visible,
  mode,
  record,
  onClose,
  onSave,
  loading = false,
}: RecordModalProps) {
  const title = modeTitles[mode];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
            {mode === 'view' && record ? (
              <View style={styles.viewContainer}>
                <Text style={styles.viewTitle}>{record.title}</Text>
                <View style={styles.viewMeta}>
                  <Badge label={record.category} type="category" category={record.category} />
                  <Badge label={record.status} type="status" status={record.status} />
                </View>
                <Text style={styles.viewDescription}>{record.description}</Text>
                <View style={styles.viewInfo}>
                  <View style={styles.viewInfoRow}>
                    <Text style={styles.viewInfoLabel}>Owner</Text>
                    <Text style={styles.viewInfoValue}>{record.ownerName}</Text>
                  </View>
                  <View style={styles.viewInfoRow}>
                    <Text style={styles.viewInfoLabel}>Created</Text>
                    <Text style={styles.viewInfoValue}>
                      {new Date(record.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.viewInfoRow}>
                    <Text style={styles.viewInfoLabel}>Updated</Text>
                    <Text style={styles.viewInfoValue}>
                      {new Date(record.updatedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <RecordForm
                initialValues={
                  mode === 'edit' && record
                    ? {
                        title: record.title,
                        description: record.description,
                        category: record.category,
                        status: record.status,
                      }
                    : undefined
                }
                onSubmit={onSave}
                onCancel={onClose}
                loading={loading}
              />
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '85%',
    paddingBottom: Spacing.xl,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.heading,
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  body: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  // View mode styles
  viewContainer: {
    paddingBottom: Spacing.lg,
  },
  viewTitle: {
    ...Typography.displayMD,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  viewMeta: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  viewDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  viewInfo: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  viewInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  viewInfoLabel: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  viewInfoValue: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
});
