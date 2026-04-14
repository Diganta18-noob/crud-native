import { Role } from '../types';

export const PERMISSIONS: Record<Role, {
  canViewAllRecords: boolean;
  canEditAnyRecord: boolean;
  canDeleteAnyRecord: boolean;
  canCreateRecord: boolean;
  canViewUserList: boolean;
}> = {
  admin: {
    canViewAllRecords: true,
    canEditAnyRecord: true,
    canDeleteAnyRecord: true,
    canCreateRecord: true,
    canViewUserList: true,
  },
  user: {
    canViewAllRecords: false,
    canEditAnyRecord: false,
    canDeleteAnyRecord: false,
    canCreateRecord: true,
    canViewUserList: false,
  },
} as const;
