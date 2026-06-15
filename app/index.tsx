// ============================================================
// app/index.tsx — Entry Point
// Redirects user based on login state and role
// ============================================================

import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../store/AuthContext';
import { COLORS } from '../data/mockData';

export default function Index() {
  const { user, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/(auth)/login');
    } else if (isAdmin) {
      router.replace('/(admin)/dashboard');
    } else {
      router.replace('/(user)/home');
    }
  }, [user, isLoading, isAdmin]);

  // Show spinner while checking auth state
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
});
