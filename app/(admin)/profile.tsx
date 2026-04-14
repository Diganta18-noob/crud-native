import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useRecords } from '../../hooks/useRecords';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function AdminProfileScreen() {
  const { user, logout, isAdmin } = useAuth();
  const { records } = useRecords();

  if (!user) return null;

  const totalRecords = records.length;
  const activeRecords = records.filter((r) => r.status === 'active').length;
  const completedRecords = records.filter((r) => r.status === 'completed').length;

  return (
    <ScreenWrapper>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatarRing, { borderColor: Colors.admin }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Badge label={user.role} type="role" role={user.role} />
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Records</Text>
          <Text style={[styles.statValue, { color: Colors.admin }]}>{totalRecords}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Active</Text>
          <Text style={[styles.statValue, { color: Colors.success }]}>{activeRecords}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={[styles.statValue, { color: Colors.info }]}>{completedRecords}</Text>
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Admin Privileges</Text>
        <Text style={styles.infoItem}>✓ View all user records</Text>
        <Text style={styles.infoItem}>✓ Edit any record</Text>
        <Text style={styles.infoItem}>✓ Delete any record</Text>
        <Text style={styles.infoItem}>✓ Bulk manage records</Text>
      </View>

      {/* Sign Out */}
      <Button
        title="Sign Out"
        onPress={logout}
        variant="danger"
        size="lg"
        fullWidth
        icon="log-out-outline"
      />

      {/* App Version */}
      <Text style={styles.version}>ExpoCRUD v1.0.0</Text>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.admin + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.admin,
  },
  name: {
    ...Typography.displayMD,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  email: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  statLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  statValue: {
    ...Typography.heading,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: Colors.admin,
  },
  infoTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  infoItem: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  version: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
