import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { RecordCategory, RecordStatus, Role } from '../../types';

type BadgeType = 'role' | 'status' | 'category';

interface BadgeProps {
  label: string;
  type: BadgeType;
  role?: Role;
  status?: RecordStatus;
  category?: RecordCategory;
}

const roleColors: Record<Role, { bg: string; text: string }> = {
  admin: { bg: Colors.admin + '25', text: Colors.admin },
  user: { bg: Colors.primary + '25', text: Colors.primaryLight },
};

const statusColors: Record<RecordStatus, { bg: string; text: string }> = {
  active: { bg: Colors.success + '20', text: Colors.success },
  completed: { bg: Colors.info + '20', text: Colors.info },
  archived: { bg: Colors.textMuted + '20', text: Colors.textMuted },
};

const categoryColors: Record<RecordCategory, { bg: string; text: string }> = {
  work: { bg: Colors.info + '20', text: Colors.info },
  personal: { bg: Colors.primary + '20', text: Colors.primaryLight },
  urgent: { bg: Colors.error + '20', text: Colors.error },
  other: { bg: Colors.textMuted + '20', text: Colors.textSecondary },
};

function getColors(type: BadgeType, props: BadgeProps): { bg: string; text: string } {
  if (type === 'role' && props.role) return roleColors[props.role];
  if (type === 'status' && props.status) return statusColors[props.status];
  if (type === 'category' && props.category) return categoryColors[props.category];
  return { bg: Colors.surfaceHigh, text: Colors.textSecondary };
}

export default function Badge(props: BadgeProps) {
  const colors = getColors(props.type, props);
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        {props.label.charAt(0).toUpperCase() + props.label.slice(1)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  text: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
