import { useContext } from 'react';
import { RecordsContext } from '../context/RecordsContext';
import { RecordsContextType } from '../types';

export function useRecords(): RecordsContextType {
  const context = useContext(RecordsContext);
  if (!context) {
    throw new Error('useRecords must be used within a RecordsProvider');
  }
  return context;
}
