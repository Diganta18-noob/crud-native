import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'admin' | 'user';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: Colors.primary, text: Colors.white },
  secondary: { bg: Colors.surfaceHigh, text: Colors.textPrimary, border: Colors.border },
  danger: { bg: Colors.error, text: Colors.white },
  ghost: { bg: 'transparent', text: Colors.primary },
  admin: { bg: Colors.admin, text: Colors.white },
  user: { bg: Colors.user, text: '#0F0F14' },
};

const sizeStyles: Record<ButtonSize, { paddingV: number; paddingH: number; fontSize: number }> = {
  sm: { paddingV: 8, paddingH: 16, fontSize: 13 },
  md: { paddingV: 12, paddingH: 20, fontSize: 15 },
  lg: { paddingV: 16, paddingH: 24, fontSize: 17 },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const vs = variantStyles[variant];
  const ss = sizeStyles[size];

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
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

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && { width: '100%' }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.button,
          {
            backgroundColor: vs.bg,
            paddingVertical: ss.paddingV,
            paddingHorizontal: ss.paddingH,
            borderWidth: vs.border ? 1 : 0,
            borderColor: vs.border || 'transparent',
            opacity: disabled ? 0.5 : 1,
          },
          fullWidth && { width: '100%' },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={vs.text} />
        ) : (
          <>
            {icon && (
              <Ionicons
                name={icon}
                size={ss.fontSize + 2}
                color={vs.text}
                style={{ marginRight: Spacing.sm }}
              />
            )}
            <Text style={[styles.text, { color: vs.text, fontSize: ss.fontSize }]}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  text: {
    fontWeight: '600',
  },
});
