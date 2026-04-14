import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';
import { Record as AppRecord } from '../../types';
import Badge from './Badge';

interface CardProps {
  record: AppRecord;
  onEdit?: (record: AppRecord) => void;
  onDelete?: (id: string) => void;
  onPress?: (record: AppRecord) => void;
  showOwner?: boolean;
  compact?: boolean;
  index?: number;
}

const statusColors: Record<string, string> = {
  active: Colors.success,
  completed: Colors.info,
  archived: Colors.textMuted,
};

export default function Card({
  record,
  onEdit,
  onDelete,
  onPress,
  showOwner = false,
  compact = false,
  index = 0,
}: CardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const formattedDate = new Date(record.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onPress?.(record)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, compact && styles.compact]}
      >
        {/* Status color bar */}
        <View style={[styles.statusBar, { backgroundColor: statusColors[record.status] }]} />

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {record.title}
            </Text>
          </View>

          {/* Description */}
          {!compact && (
            <Text style={styles.description} numberOfLines={2}>
              {record.description}
            </Text>
          )}

          {/* Meta row */}
          <View style={styles.metaRow}>
            <Badge label={record.category} type="category" category={record.category} />
            <Badge label={record.status} type="status" status={record.status} />
            <Text style={styles.date}>{formattedDate}</Text>
          </View>

          {/* Owner badge (admin mode) */}
          {showOwner && (
            <View style={styles.ownerRow}>
              <View style={styles.ownerAvatar}>
                <Text style={styles.ownerInitial}>
                  {record.ownerName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.ownerName}>{record.ownerName}</Text>
            </View>
          )}

          {/* Action buttons */}
          {(onEdit || onDelete) && (
            <View style={styles.actions}>
              {onEdit && (
                <TouchableOpacity
                  onPress={() => onEdit(record)}
                  style={styles.actionBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity
                  onPress={() => onDelete(record.id)}
                  style={styles.actionBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.error} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  compact: {
    marginBottom: Spacing.xs,
  },
  statusBar: {
    width: 3,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    flex: 1,
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  date: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginLeft: 'auto',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ownerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  ownerInitial: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '700',
  },
  ownerName: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    padding: Spacing.xs,
  },
});
