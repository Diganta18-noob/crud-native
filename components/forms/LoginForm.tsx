import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { Role } from '../../types';
import { validateEmail, validatePassword } from '../../utils/validators';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
  error?: string;
  selectedRole: Role;
  onRoleChange: (role: Role) => void;
}

const DEMO_CREDENTIALS: Record<Role, { email: string; password: string }> = {
  admin: { email: 'admin@app.com', password: 'admin123' },
  user: { email: 'user@app.com', password: 'user123' },
};

export default function LoginForm({
  onSubmit,
  loading = false,
  error,
  selectedRole,
  onRoleChange,
}: LoginFormProps) {
  const [email, setEmail] = useState(DEMO_CREDENTIALS[selectedRole].email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS[selectedRole].password);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Auto-fill demo credentials when switching roles
  useEffect(() => {
    const creds = DEMO_CREDENTIALS[selectedRole];
    setEmail(creds.email);
    setPassword(creds.password);
    setFieldErrors({});
  }, [selectedRole]);

  const accentColor = selectedRole === 'admin' ? Colors.admin : Colors.primary;

  const handleSubmit = () => {
    const trimmedEmail = email.trim();
    const emailErr = validateEmail(trimmedEmail);
    const passErr = validatePassword(password);
    if (emailErr || passErr) {
      setFieldErrors({ email: emailErr, password: passErr });
      return;
    }
    setFieldErrors({});
    onSubmit(trimmedEmail, password);
  };

  return (
    <View style={styles.container}>
      {/* Role Switcher */}
      <View style={styles.roleSwitcher}>
        <TouchableOpacity
          onPress={() => onRoleChange('user')}
          style={[
            styles.roleTab,
            selectedRole === 'user' && { backgroundColor: Colors.primary + '25', borderColor: Colors.primary },
          ]}
        >
          <Text style={[styles.roleText, selectedRole === 'user' && { color: Colors.primary }]}>
            User
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onRoleChange('admin')}
          style={[
            styles.roleTab,
            selectedRole === 'admin' && { backgroundColor: Colors.admin + '25', borderColor: Colors.admin },
          ]}
        >
          <Text style={[styles.roleText, selectedRole === 'admin' && { color: Colors.admin }]}>
            Admin
          </Text>
        </TouchableOpacity>
      </View>

      <Input
        label="Email"
        value={email}
        onChangeText={(t) => { setEmail(t); setFieldErrors((e) => ({ ...e, email: undefined })); }}
        placeholder="Enter your email"
        error={fieldErrors.email}
        icon="mail-outline"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        label="Password"
        value={password}
        onChangeText={(t) => { setPassword(t); setFieldErrors((e) => ({ ...e, password: undefined })); }}
        placeholder="Enter your password"
        error={fieldErrors.password}
        icon="lock-closed-outline"
        secureTextEntry={!showPassword}
        rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
        onRightIconPress={() => setShowPassword(!showPassword)}
      />

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Button
        title="Sign In"
        onPress={handleSubmit}
        variant={selectedRole === 'admin' ? 'admin' : 'primary'}
        size="lg"
        loading={loading}
        fullWidth
        icon="log-in-outline"
      />

      {/* Demo credentials */}
      <View style={styles.demoBox}>
        <Text style={styles.demoTitle}>Demo Credentials</Text>
        <Text style={styles.demoText}>
          Admin: admin@app.com / admin123
        </Text>
        <Text style={styles.demoText}>
          User: user@app.com / user123
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  roleSwitcher: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  roleTab: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  roleText: {
    ...Typography.subheading,
    color: Colors.textMuted,
  },
  errorBox: {
    backgroundColor: Colors.error + '15',
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    textAlign: 'center',
  },
  demoBox: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoTitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  demoText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 2,
  },
});
