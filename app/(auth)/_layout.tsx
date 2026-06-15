// ============================================================
// app/(auth)/_layout.tsx — Auth Stack Layout
// Simple stack with no header, used for login screen
// ============================================================

import { Stack } from 'expo-router';
import { COLORS } from '../../data/mockData';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'fade',
      }}
    />
  );
}
