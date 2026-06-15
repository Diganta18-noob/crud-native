// ============================================================
// app/_layout.tsx — Root Layout
// Wraps the entire app with Auth + Records providers
// ============================================================

import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../store/AuthContext';
import { RecordsProvider } from '../store/RecordsContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <RecordsProvider>
        <StatusBar style="dark" />
        <Slot />
      </RecordsProvider>
    </AuthProvider>
  );
}
