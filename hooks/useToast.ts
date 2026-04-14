import { useCallback } from 'react';
import { Alert } from 'react-native';
import { ToastType } from '../types';

export function useToast() {
  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const icons: Record<ToastType, string> = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };

    Alert.alert(`${icons[type]} ${title}`, message || undefined);
  }, []);

  return { showToast };
}
