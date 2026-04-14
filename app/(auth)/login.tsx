import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { Role } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import LoginForm from '../../components/forms/LoginForm';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('user');

  // Animations
  const logoSlide = useRef(new Animated.Value(-50)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(40)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoSlide, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(formSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        // Use the returned role to determine the redirect
        if (result.role === 'admin') {
          router.replace('/(admin)/dashboard');
        } else {
          router.replace('/(user)/home');
        }
      } else {
        setError(result.error || 'Login failed');
        showToast('error', 'Login Failed', result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const accentColor = selectedRole === 'admin' ? Colors.admin : Colors.primary;

  return (
    <View style={styles.container}>
      {/* Decorative gradient circles */}
      <View style={[styles.circle, styles.circle1, { backgroundColor: accentColor + '15' }]} />
      <View style={[styles.circle, styles.circle2, { backgroundColor: accentColor + '10' }]} />

      {/* Logo area */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ translateY: logoSlide }],
          },
        ]}
      >
        <View style={[styles.logoIcon, { backgroundColor: accentColor + '20' }]}>
          <Text style={[styles.logoEmoji]}>🔐</Text>
        </View>
        <Text style={styles.appName}>ExpoCRUD</Text>
        <Text style={styles.tagline}>Manage your records with ease</Text>
      </Animated.View>

      {/* Login form */}
      <Animated.View
        style={[
          styles.formContainer,
          {
            opacity: formOpacity,
            transform: [{ translateY: formSlide }],
          },
        ]}
      >
        <LoginForm
          onSubmit={handleLogin}
          loading={loading}
          error={error}
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
  },
  circle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -80,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: -60,
    left: -60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoEmoji: {
    fontSize: 36,
  },
  appName: {
    ...Typography.displayLG,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  tagline: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  formContainer: {
    width: '100%',
  },
});
