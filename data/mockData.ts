// ============================================================
// data/mockData.ts
// Single source of truth: colors, types, mock users & records
// ============================================================

// ─── Theme Colors ────────────────────────────────────────────
export const COLORS = {
  primary: '#4F46E5',     // Indigo 600
  primaryLight: '#4F46E5',// Indigo 600 (for readable text contrast in badges)
  admin: '#F97316',       // Orange 500
  background: '#F8FAFC',  // Slate 50
  surface: '#FFFFFF',     // White
  surfaceHigh: '#F1F5F9', // Slate 100
  border: '#E2E8F0',      // Slate 200
  success: '#10B981',     // Emerald 500
  warning: '#F59E0B',     // Amber 500
  error: '#EF4444',       // Red 500
  info: '#06B6D4',        // Cyan 500
  textPrimary: '#0F172A', // Slate 900
  textSecondary: '#475569',// Slate 600
  textMuted: '#94A3B8',   // Slate 400
  white: '#FFFFFF',
};

// ─── TypeScript Types ────────────────────────────────────────
export type Role = 'admin' | 'user';
export type RecordCategory = 'work' | 'personal' | 'urgent' | 'other';
export type RecordStatus = 'active' | 'completed' | 'archived';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

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

export interface RecordFormData {
  title: string;
  description: string;
  category: RecordCategory;
  status: RecordStatus;
}

// ─── Mock Users ──────────────────────────────────────────────
// Used for demo login (no real backend needed)
export const MOCK_USERS: (AuthUser & { password: string })[] = [
  {
    id: 'admin-001',
    name: 'Diganta Admin',
    email: 'admin@app.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: 'user-001',
    name: 'Diganta User',
    email: 'user@app.com',
    password: 'user123',
    role: 'user',
  },
  {
    id: 'user-002',
    name: 'Priya Sharma',
    email: 'priya@app.com',
    password: 'user123',
    role: 'user',
  },
];

// ─── Mock Records (seed data) ────────────────────────────────
// Pre-populated so the app isn't empty on first launch
export const MOCK_RECORDS: Record[] = [
  {
    id: 'rec-001',
    title: 'Complete API Integration',
    description: 'Integrate the REST API endpoints for user management module.',
    category: 'work',
    status: 'active',
    ownerId: 'user-001',
    ownerName: 'Diganta User',
    createdAt: '2025-04-01T10:00:00.000Z',
    updatedAt: '2025-04-10T14:30:00.000Z',
  },
  {
    id: 'rec-002',
    title: 'Design System Update',
    description: 'Update the design system with new color tokens and typography.',
    category: 'work',
    status: 'completed',
    ownerId: 'user-001',
    ownerName: 'Diganta User',
    createdAt: '2025-03-15T09:00:00.000Z',
    updatedAt: '2025-04-05T16:00:00.000Z',
  },
  {
    id: 'rec-003',
    title: 'Grocery Shopping List',
    description: 'Weekly grocery run — vegetables, fruits, dairy products.',
    category: 'personal',
    status: 'active',
    ownerId: 'user-001',
    ownerName: 'Diganta User',
    createdAt: '2025-04-12T07:00:00.000Z',
    updatedAt: '2025-04-12T07:00:00.000Z',
  },
  {
    id: 'rec-004',
    title: 'Fix Production Bug #1234',
    description: 'Critical bug in payment processing module causing failures.',
    category: 'urgent',
    status: 'active',
    ownerId: 'user-002',
    ownerName: 'Priya Sharma',
    createdAt: '2025-04-13T08:00:00.000Z',
    updatedAt: '2025-04-13T08:00:00.000Z',
  },
  {
    id: 'rec-005',
    title: 'Team Meeting Notes',
    description: 'Prepare and distribute notes from the quarterly planning.',
    category: 'work',
    status: 'completed',
    ownerId: 'user-002',
    ownerName: 'Priya Sharma',
    createdAt: '2025-03-20T11:00:00.000Z',
    updatedAt: '2025-04-01T09:00:00.000Z',
  },
  {
    id: 'rec-006',
    title: 'Security Audit Report',
    description: 'Compile security audit findings and prepare remediation plan.',
    category: 'urgent',
    status: 'active',
    ownerId: 'admin-001',
    ownerName: 'Diganta Admin',
    createdAt: '2025-04-11T09:00:00.000Z',
    updatedAt: '2025-04-14T12:00:00.000Z',
  },
  {
    id: 'rec-007',
    title: 'Update Documentation',
    description: 'Refresh API documentation with new endpoints from v2.3.',
    category: 'other',
    status: 'active',
    ownerId: 'admin-001',
    ownerName: 'Diganta Admin',
    createdAt: '2025-04-08T10:00:00.000Z',
    updatedAt: '2025-04-12T15:00:00.000Z',
  },
];
