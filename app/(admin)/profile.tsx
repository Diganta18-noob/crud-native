// ============================================================
// app/(admin)/profile.tsx — Admin Profile Screen
// Shows admin info, system-wide stats, and admin privileges
// ============================================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { useRecords } from '../../store/RecordsContext';
import { COLORS } from '../../data/mockData';

export default function AdminProfileScreen() {
  const { user, logout } = useAuth();
  const { records } = useRecords();

  if (!user) return null;

  const stats = {
    total: records.length,
    active: records.filter((r) => r.status === 'active').length,
    completed: records.filter((r) => r.status === 'completed').length,
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.content}>
        {/* ─── Avatar ──────────────────────────────────── */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarRing, { borderColor: COLORS.admin }]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Admin</Text>
          </View>
        </View>

        {/* ─── Stats Card ──────────────────────────────── */}
        <View style={styles.statsCard}>
          {[
            { label: 'Total Records', value: stats.total, color: COLORS.admin },
            { label: 'Active', value: stats.active, color: COLORS.success },
            { label: 'Completed', value: stats.completed, color: COLORS.info },
          ].map((s, i, arr) => (
            <React.Fragment key={s.label}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ─── Privileges Card ─────────────────────────── */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Admin Privileges</Text>
          <Text style={styles.infoItem}>✓ View all user records</Text>
          <Text style={styles.infoItem}>✓ Edit any record</Text>
          <Text style={styles.infoItem}>✓ Delete any record</Text>
          <Text style={styles.infoItem}>✓ Create records for system</Text>
        </View>

        {/* ─── Sign Out ────────────────────────────────── */}
        <TouchableOpacity style={styles.signOutBtn} onPress={logout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>ExpoCRUD v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: 16 },
  // Avatar
  avatarSection: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  avatarRing: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.admin + '15', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 36, fontWeight: '700', color: COLORS.admin },
  name: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  email: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 8 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: COLORS.admin + '15' },
  roleBadgeText: { fontSize: 11, fontWeight: '600', color: COLORS.admin, letterSpacing: 0.5 },
  // Stats
  statsCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  statLabel: { fontSize: 15, color: COLORS.textSecondary },
  statValue: { fontSize: 20, fontWeight: '700' },
  divider: { height: 1, backgroundColor: COLORS.border },
  // Info card
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.admin,
  },
  infoTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
  infoItem: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 4, lineHeight: 22 },
  // Sign out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.error,
  },
  signOutText: { fontSize: 17, fontWeight: '600', color: COLORS.white },
  version: { fontSize: 11, fontWeight: '500', color: COLORS.textMuted, textAlign: 'center', marginTop: 24, letterSpacing: 0.5 },
});
