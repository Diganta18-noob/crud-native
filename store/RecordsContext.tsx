// ============================================================
// store/RecordsContext.tsx
// CRUD state management using useReducer + AsyncStorage
// Exports: RecordsProvider (wrap your app) + useRecords() hook
// ============================================================

import React, { createContext, useReducer, useEffect, useState, useCallback, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Record as AppRecord, RecordFormData, AuthUser, MOCK_RECORDS } from '../data/mockData';

// ─── Reducer Actions ─────────────────────────────────────────
type Action =
  | { type: 'SET_ALL'; payload: AppRecord[] }
  | { type: 'ADD'; payload: AppRecord }
  | { type: 'UPDATE'; payload: AppRecord }
  | { type: 'DELETE'; payload: string };

function recordsReducer(state: AppRecord[], action: Action): AppRecord[] {
  switch (action.type) {
    case 'SET_ALL':
      return action.payload;
    case 'ADD':
      return [action.payload, ...state]; // newest first
    case 'UPDATE':
      return state.map((r) => (r.id === action.payload.id ? action.payload : r));
    case 'DELETE':
      return state.filter((r) => r.id !== action.payload);
    default:
      return state;
  }
}

// ─── Context Type ────────────────────────────────────────────
interface RecordsContextType {
  records: AppRecord[];
  isLoading: boolean;
  createRecord: (data: RecordFormData, owner: AuthUser) => Promise<void>;
  updateRecord: (id: string, data: RecordFormData) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  getRecordsByUser: (userId: string) => AppRecord[];
}

const RecordsContext = createContext<RecordsContextType>({
  records: [],
  isLoading: true,
  createRecord: async () => {},
  updateRecord: async () => {},
  deleteRecord: async () => {},
  getRecordsByUser: () => [],
});

// ─── Provider ────────────────────────────────────────────────
export function RecordsProvider({ children }: { children: React.ReactNode }) {
  const [records, dispatch] = useReducer(recordsReducer, []);
  const [isLoading, setIsLoading] = useState(true);

  // Load records from storage on mount; seed with mock data if empty
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('@records_data');
        const parsed = stored ? JSON.parse(stored) : null;
        if (parsed && parsed.length > 0) {
          dispatch({ type: 'SET_ALL', payload: parsed });
        } else {
          dispatch({ type: 'SET_ALL', payload: MOCK_RECORDS });
          await AsyncStorage.setItem('@records_data', JSON.stringify(MOCK_RECORDS));
        }
      } catch (e) {
        console.error('Failed to load records:', e);
        dispatch({ type: 'SET_ALL', payload: MOCK_RECORDS });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Persist to storage whenever records change
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem('@records_data', JSON.stringify(records));
    }
  }, [records, isLoading]);

  // ─── CRUD Operations ────────────────────────────────────────
  const createRecord = useCallback(async (data: RecordFormData, owner: AuthUser) => {
    const now = new Date().toISOString();
    const newRecord: AppRecord = {
      id: `rec-${Date.now()}`,
      ...data,
      ownerId: owner.id,
      ownerName: owner.name,
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'ADD', payload: newRecord });
  }, []);

  const updateRecord = useCallback(
    async (id: string, data: RecordFormData) => {
      const existing = records.find((r) => r.id === id);
      if (!existing) return;
      dispatch({
        type: 'UPDATE',
        payload: { ...existing, ...data, updatedAt: new Date().toISOString() },
      });
    },
    [records]
  );

  const deleteRecord = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE', payload: id });
  }, []);

  const getRecordsByUser = useCallback(
    (userId: string) => records.filter((r) => r.ownerId === userId),
    [records]
  );

  return (
    <RecordsContext.Provider value={{ records, isLoading, createRecord, updateRecord, deleteRecord, getRecordsByUser }}>
      {children}
    </RecordsContext.Provider>
  );
}

// ─── Hook (use this in screens) ──────────────────────────────
export function useRecords() {
  const ctx = useContext(RecordsContext);
  if (!ctx) throw new Error('useRecords must be inside RecordsProvider');
  return ctx;
}
