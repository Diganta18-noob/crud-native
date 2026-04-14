import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { RecordsProvider } from '../context/RecordsContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <RecordsProvider>
        <StatusBar style="light" />
        <Slot />
      </RecordsProvider>
    </AuthProvider>
  );
}
