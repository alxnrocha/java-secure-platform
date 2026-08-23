import { create } from 'zustand';
import { User, RoleType } from '../types';

export const MOCK_USERS: Record<RoleType, User> = {
  ROLE_ADMIN: {
    id: 'a0000000-0000-0000-0000-000000000001',
    username: 'admin',
    email: 'admin@vaultledger.internal',
    firstName: 'Alexandre',
    lastName: 'Rocha',
    role: 'ROLE_ADMIN',
    active: true,
    mfaEnabled: true,
    createdAt: '2026-08-01T00:00:00Z',
  },
  ROLE_OPERATOR: {
    id: 'a0000000-0000-0000-0000-000000000002',
    username: 'operator',
    email: 'carlos.mendoza@vaultledger.internal',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    role: 'ROLE_OPERATOR',
    active: true,
    mfaEnabled: true,
    createdAt: '2026-08-05T00:00:00Z',
  },
  ROLE_AUDITOR: {
    id: 'a0000000-0000-0000-0000-000000000003',
    username: 'auditor',
    email: 'elena.vargas@vaultledger.internal',
    firstName: 'Elena',
    lastName: 'Vargas',
    role: 'ROLE_AUDITOR',
    active: true,
    mfaEnabled: true,
    createdAt: '2026-08-10T00:00:00Z',
  },
  ROLE_COMPLIANCE_OFFICER: {
    id: 'a0000000-0000-0000-0000-000000000004',
    username: 'compliance',
    email: 'sarah.lindqvist@vaultledger.internal',
    firstName: 'Sarah',
    lastName: 'Lindqvist',
    role: 'ROLE_COMPLIANCE_OFFICER',
    active: true,
    mfaEnabled: true,
    createdAt: '2026-08-12T00:00:00Z',
  },
};

interface AuthState {
  currentUser: User;
  token: string;
  isDemoMode: boolean;
  switchRole: (role: RoleType) => void;
  toggleDemoMode: () => void;
  canCreateAccount: () => boolean;
  canPostTransaction: () => boolean;
  canReverseTransaction: () => boolean;
  canViewAuditLogs: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: MOCK_USERS.ROLE_ADMIN,
  token: 'mock-jwt-token-vaultledger',
  isDemoMode: true,

  switchRole: (role: RoleType) => {
    set({ currentUser: MOCK_USERS[role] });
  },

  toggleDemoMode: () => {
    set(state => ({ isDemoMode: !state.isDemoMode }));
  },

  canCreateAccount: () => {
    return get().currentUser.role === 'ROLE_ADMIN';
  },

  canPostTransaction: () => {
    const r = get().currentUser.role;
    return r === 'ROLE_ADMIN' || r === 'ROLE_OPERATOR';
  },

  canReverseTransaction: () => {
    const r = get().currentUser.role;
    return r === 'ROLE_ADMIN' || r === 'ROLE_COMPLIANCE_OFFICER';
  },

  canViewAuditLogs: () => {
    const r = get().currentUser.role;
    return r === 'ROLE_ADMIN' || r === 'ROLE_AUDITOR' || r === 'ROLE_COMPLIANCE_OFFICER';
  },
}));
