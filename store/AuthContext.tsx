// ============================================================
// store/AuthContext.tsx
// Handles: login, logout, session persistence (AsyncStorage)
// Exports: AuthProvider (wrap your app) + useAuth() hook
// ============================================================

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser, Role, MOCK_USERS } from '../data/mockData';

// ─── Context Type ────────────────────────────────────────────
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: Role }>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  isAdmin: false,
});

// ─── Provider ────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On app start: check if user was previously logged in
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('@auth_user');
        if (stored) setUser(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load auth:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Login: find matching user in mock data, save to storage
  const login = useCallback(
    async (email: string, password: string) => {
      // Simulate a small network delay
      await new Promise((r) => setTimeout(r, 800));

      const found = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!found) return { success: false, error: 'Invalid email or password' };

      // Store user without password
      const authUser: AuthUser = {
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.role,
      };
      await AsyncStorage.setItem('@auth_user', JSON.stringify(authUser));
      setUser(authUser);
      return { success: true, role: authUser.role };
    },
    []
  );

  // Logout: clear storage and redirect to login
  const logout = useCallback(() => {
    AsyncStorage.removeItem('@auth_user');
    setUser(null);
    router.replace('/(auth)/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook (use this in screens) ──────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
