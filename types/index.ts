// ─── Auth ───────────────────────────────────────────────────────
export type Role = 'admin' | 'user';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: Role }>;
  logout: () => void;
  isAdmin: boolean;
}

// ─── Records (CRUD entity) ───────────────────────────────────────
export interface Record {
  id: string;
  title: string;
  description: string;
  category: RecordCategory;
  status: RecordStatus;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

export type RecordCategory = 'work' | 'personal' | 'urgent' | 'other';
export type RecordStatus = 'active' | 'completed' | 'archived';

export interface RecordFormData {
  title: string;
  description: string;
  category: RecordCategory;
  status: RecordStatus;
}

// ─── Records Context ─────────────────────────────────────────────
export type RecordsAction =
  | { type: 'SET_ALL'; payload: Record[] }
  | { type: 'ADD'; payload: Record }
  | { type: 'UPDATE'; payload: Record }
  | { type: 'DELETE'; payload: string };

export interface RecordsContextType {
  records: Record[];
  isLoading: boolean;
  createRecord: (data: RecordFormData, owner: AuthUser) => Promise<void>;
  updateRecord: (id: string, data: RecordFormData) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  getRecordsByUser: (userId: string) => Record[];
}

// ─── Toast ────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}
