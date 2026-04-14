import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { RecordFormData, RecordCategory, RecordStatus } from '../../types';
import { validateRecordForm } from '../../utils/validators';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface RecordFormProps {
  initialValues?: Partial<RecordFormData>;
  onSubmit: (data: RecordFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const categories: { value: RecordCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'work', label: 'Work', icon: 'briefcase-outline' },
  { value: 'personal', label: 'Personal', icon: 'person-outline' },
  { value: 'urgent', label: 'Urgent', icon: 'alert-circle-outline' },
  { value: 'other', label: 'Other', icon: 'grid-outline' },
];

const statuses: { value: RecordStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const categoryColors: Record<RecordCategory, string> = {
  work: Colors.info,
  personal: Colors.primary,
  urgent: Colors.error,
  other: Colors.textSecondary,
};

const statusColorMap: Record<RecordStatus, string> = {
  active: Colors.success,
  completed: Colors.info,
  archived: Colors.textMuted,
};

export default function RecordForm({ initialValues, onSubmit, onCancel, loading = false }: RecordFormProps) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [category, setCategory] = useState<RecordCategory | ''>(initialValues?.category || '');
  const [status, setStatus] = useState<RecordStatus | ''>(initialValues?.status || 'active');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const data: Partial<RecordFormData> = { title, description, category: category as RecordCategory, status: status as RecordStatus };
    const validationErrors = validateRecordForm(data);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    onSubmit(data as RecordFormData);
  };

  return (
    <View style={styles.container}>
      <Input
        label="Title"
        value={title}
        onChangeText={(t) => { setTitle(t); setErrors((e) => ({ ...e, title: '' })); }}
        placeholder="Enter record title"
        error={errors.title}
        icon="document-text-outline"
        maxLength={80}
      />

      <Input
        label="Description"
        value={description}
        onChangeText={(t) => { setDescription(t); setErrors((e) => ({ ...e, description: '' })); }}
        placeholder="Describe this record..."
        error={errors.description}
        multiline
        numberOfLines={4}
        maxLength={500}
      />

      {/* Category Selector */}
      <View style={styles.selectorGroup}>
        <Text style={styles.selectorLabel}>Category</Text>
        <View style={styles.pillRow}>
          {categories.map((cat) => {
            const isSelected = category === cat.value;
            const color = categoryColors[cat.value];
            return (
              <TouchableOpacity
                key={cat.value}
                onPress={() => { setCategory(cat.value); setErrors((e) => ({ ...e, category: '' })); }}
                style={[
                  styles.pill,
                  isSelected && { backgroundColor: color + '25', borderColor: color },
                ]}
              >
                <Ionicons
                  name={cat.icon}
                  size={14}
                  color={isSelected ? color : Colors.textMuted}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.pillText, isSelected && { color }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}
      </View>

      {/* Status Selector */}
      <View style={styles.selectorGroup}>
        <Text style={styles.selectorLabel}>Status</Text>
        <View style={styles.pillRow}>
          {statuses.map((st) => {
            const isSelected = status === st.value;
            const color = statusColorMap[st.value];
            return (
              <TouchableOpacity
                key={st.value}
                onPress={() => { setStatus(st.value); setErrors((e) => ({ ...e, status: '' })); }}
                style={[
                  styles.pill,
                  isSelected && { backgroundColor: color + '25', borderColor: color },
                ]}
              >
                <Text style={[styles.pillText, isSelected && { color }]}>
                  {st.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.status ? <Text style={styles.errorText}>{errors.status}</Text> : null}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button title="Cancel" onPress={onCancel} variant="secondary" size="md" style={{ flex: 1, marginRight: Spacing.sm }} />
        <Button title="Save" onPress={handleSubmit} variant="primary" size="md" loading={loading} style={{ flex: 1 }} icon="checkmark-outline" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.md,
  },
  selectorGroup: {
    marginBottom: Spacing.md,
  },
  selectorLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  pillText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
  },
});
