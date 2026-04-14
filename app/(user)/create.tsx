import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { RecordFormData } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useRecords } from '../../hooks/useRecords';
import { useToast } from '../../hooks/useToast';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import RecordForm from '../../components/forms/RecordForm';

export default function CreateScreen() {
  const { user } = useAuth();
  const { createRecord } = useRecords();
  const { showToast } = useToast();
  const router = useRouter();

  const handleSave = async (data: RecordFormData) => {
    if (!user) return;
    await createRecord(data, user);
    showToast('success', 'Created', 'Record created successfully');
    // Navigate back to home tab
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Create Record</Text>
      <Text style={styles.subtitle}>Add a new record to your collection</Text>
      <View style={styles.formContainer}>
        <RecordForm onSubmit={handleSave} onCancel={handleCancel} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.displayMD,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  formContainer: {
    marginTop: Spacing.sm,
  },
});
