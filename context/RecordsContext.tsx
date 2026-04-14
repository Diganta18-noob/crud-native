import React, { createContext, useReducer, useEffect, useState, useCallback } from 'react';
import { Record as AppRecord, RecordsAction, RecordsContextType, RecordFormData, AuthUser } from '../types';
import { MOCK_RECORDS } from '../constants/mockData';
import { getItem, setItem, StorageKeys } from '../utils/storage';

function recordsReducer(state: AppRecord[], action: RecordsAction): AppRecord[] {
  switch (action.type) {
    case 'SET_ALL':
      return action.payload;
    case 'ADD':
      return [action.payload, ...state];
    case 'UPDATE':
      return state.map((r) => (r.id === action.payload.id ? action.payload : r));
    case 'DELETE':
      return state.filter((r) => r.id !== action.payload);
    default:
      return state;
  }
}

export const RecordsContext = createContext<RecordsContextType>({
  records: [],
  isLoading: true,
  createRecord: async () => {},
  updateRecord: async () => {},
  deleteRecord: async () => {},
  getRecordsByUser: () => [],
});

export function RecordsProvider({ children }: { children: React.ReactNode }) {
  const [records, dispatch] = useReducer(recordsReducer, []);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate records from storage, seed if empty
  useEffect(() => {
    (async () => {
      try {
        const stored = await getItem<AppRecord[]>(StorageKeys.RECORDS_DATA);
        if (stored && stored.length > 0) {
          dispatch({ type: 'SET_ALL', payload: stored });
        } else {
          dispatch({ type: 'SET_ALL', payload: MOCK_RECORDS });
          await setItem(StorageKeys.RECORDS_DATA, MOCK_RECORDS);
        }
      } catch (error) {
        console.error('Failed to rehydrate records:', error);
        dispatch({ type: 'SET_ALL', payload: MOCK_RECORDS });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Persist on every change (skip initial empty state)
  useEffect(() => {
    if (!isLoading && records.length >= 0) {
      setItem(StorageKeys.RECORDS_DATA, records);
    }
  }, [records, isLoading]);

  const createRecord = useCallback(
    async (data: RecordFormData, owner: AuthUser) => {
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
    },
    []
  );

  const updateRecord = useCallback(
    async (id: string, data: RecordFormData) => {
      const existing = records.find((r) => r.id === id);
      if (!existing) return;
      const updated: AppRecord = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'UPDATE', payload: updated });
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
    <RecordsContext.Provider
      value={{ records, isLoading, createRecord, updateRecord, deleteRecord, getRecordsByUser }}
    >
      {children}
    </RecordsContext.Provider>
  );
}
