// ============================================================
// app/(auth)/login.tsx — Login Screen
// Self-contained: form, validation, role switcher all inline
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { COLORS, Role } from '../../data/mockData';

// Demo credentials for quick login
const DEMO_CREDS: Record<Role, { email: string; password: string }> = {
  user: { email: 'user@app.com', password: 'user123' },
  admin: { email: 'admin@app.com', password: 'admin123' },
};

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<Role>('user');
  const [email, setEmail] = useState(DEMO_CREDS.user.email);
  const [password, setPassword] = useState(DEMO_CREDS.user.password);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill demo credentials when switching roles
  useEffect(() => {
    setEmail(DEMO_CREDS[selectedRole].email);
    setPassword(DEMO_CREDS[selectedRole].password);
    setError('');
  }, [selectedRole]);

  const accentColor = selectedRole === 'admin' ? COLORS.admin : COLORS.primary;

  const handleLogin = async () => {
    // Basic validation
    if (!email.trim()) return setError('Email is required');
    if (!password) return setError('Password is required');

    setLoading(true);
    setError('');

    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        router.replace(result.role === 'admin' ? '/(admin)/dashboard' : '/(user)/home');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ─── Logo ─────────────────────────────────────── */}
        <View style={styles.logoSection}>
          <View style={[styles.logoBox, { backgroundColor: accentColor + '20' }]}>
            <Text style={styles.logoEmoji}>🔐</Text>
          </View>
          <Text style={styles.appName}>ExpoCRUD</Text>
          <Text style={styles.tagline}>Manage your records with ease</Text>
        </View>

        {/* ─── Role Switcher ────────────────────────────── */}
        <View style={styles.roleSwitcher}>
          {(['user', 'admin'] as Role[]).map((role) => {
            const isActive = selectedRole === role;
            const color = role === 'admin' ? COLORS.admin : COLORS.primary;
            return (
              <TouchableOpacity
                key={role}
                onPress={() => setSelectedRole(role)}
                style={[
                  styles.roleTab,
                  isActive && { backgroundColor: color + '25', borderColor: color },
                ]}
              >
                <Text style={[styles.roleTabText, isActive && { color }]}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ─── Email Input ──────────────────────────────── */}
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(t) => { setEmail(t); setError(''); }}
            placeholder="Enter your email"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* ─── Password Input ───────────────────────────── */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={(t) => { setPassword(t); setError(''); }}
            placeholder="Enter your password"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ─── Error Message ────────────────────────────── */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ─── Sign In Button ───────────────────────────── */}
        <TouchableOpacity
          style={[styles.signInBtn, { backgroundColor: accentColor }]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="log-in-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
              <Text style={styles.signInText}>Sign In</Text>
            </>
          )}
        </TouchableOpacity>

        {/* ─── Demo Credentials Info ────────────────────── */}
        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>DEMO CREDENTIALS</Text>
          <Text style={styles.demoText}>Admin: admin@app.com / admin123</Text>
          <Text style={styles.demoText}>User: user@app.com / user123</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  // Logo
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 32, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.5 },
  tagline: { fontSize: 15, color: COLORS.textSecondary, marginTop: 4 },
  // Role Switcher
  roleSwitcher: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  roleTabText: { fontSize: 16, fontWeight: '600', color: COLORS.textMuted },
  // Inputs
  label: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: 15, paddingVertical: 14 },
  // Error
  errorBox: {
    backgroundColor: COLORS.error + '15',
    borderRadius: 6,
    padding: 8,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, color: COLORS.error, textAlign: 'center' },
  // Button
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  signInText: { fontSize: 17, fontWeight: '600', color: COLORS.white },
  // Demo box
  demoBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  demoText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 2 },
});
