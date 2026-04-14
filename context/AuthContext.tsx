import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { AuthUser, AuthContextType, Role } from '../types';
import { MOCK_USERS } from '../constants/mockData';
import { getItem, setItem, removeItem, StorageKeys } from '../utils/storage';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  isAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Rehydrate user from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const storedUser = await getItem<AuthUser>(StorageKeys.AUTH_USER);
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Failed to rehydrate auth:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string; role?: Role }> => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const found = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!found) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Strip password before storing
      const authUser: AuthUser = {
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.role,
        avatar: found.avatar,
      };

      await setItem(StorageKeys.AUTH_USER, authUser);
      setUser(authUser);
      return { success: true, role: authUser.role };
    },
    []
  );

  const logout = useCallback(() => {
    removeItem(StorageKeys.AUTH_USER);
    setUser(null);
    router.replace('/(auth)/login');
  }, [router]);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
