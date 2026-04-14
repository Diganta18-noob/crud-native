import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useRecords } from '../../hooks/useRecords';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function UserProfileScreen() {
  const { user, logout } = useAuth();
  const { records, getRecordsByUser } = useRecords();

  if (!user) return null;

  const myRecords = getRecordsByUser(user.id);
  const stats = {
    total: myRecords.length,
    active: myRecords.filter((r) => r.status === 'active').length,
    completed: myRecords.filter((r) => r.status === 'completed').length,
    archived: myRecords.filter((r) => r.status === 'archived').length,
  };

  return (
    <ScreenWrapper>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatarRing, { borderColor: Colors.primary }]}>
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
          <Text style={styles.statLabel}>My Records</Text>
          <Text style={[styles.statValue, { color: Colors.primary }]}>{stats.total}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Active</Text>
          <Text style={[styles.statValue, { color: Colors.success }]}>{stats.active}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={[styles.statValue, { color: Colors.info }]}>{stats.completed}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Archived</Text>
          <Text style={[styles.statValue, { color: Colors.textMuted }]}>{stats.archived}</Text>
        </View>
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
    backgroundColor: Colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
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
    marginBottom: Spacing.xl,
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
  version: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
