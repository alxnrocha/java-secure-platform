import type { ReactNode } from 'react';
import { AccountType, TransactionStatus, RoleType } from '../types';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'emerald' | 'cyan' | 'rose' | 'amber' | 'violet' | 'slate';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-800/80 text-slate-300 border-slate-700/80',
    emerald: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    cyan: 'bg-cyan-950/60 text-cyan-400 border-cyan-800/60 shadow-[0_0_10px_rgba(6,182,212,0.1)]',
    rose: 'bg-rose-950/60 text-rose-400 border-rose-800/60 shadow-[0_0_10px_rgba(244,63,94,0.1)]',
    amber: 'bg-amber-950/60 text-amber-400 border-amber-800/60 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
    violet: 'bg-violet-950/60 text-violet-400 border-violet-800/60 shadow-[0_0_10px_rgba(139,92,246,0.1)]',
    slate: 'bg-slate-900/90 text-slate-400 border-slate-800',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border font-mono ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
}

export function AccountTypeBadge({ type }: { type: AccountType }) {
  const map: Record<AccountType, { variant: 'emerald' | 'rose' | 'cyan' | 'violet' | 'amber'; label: string }> = {
    ASSET: { variant: 'emerald', label: 'ACTIVO' },
    LIABILITY: { variant: 'rose', label: 'PASIVO' },
    EQUITY: { variant: 'cyan', label: 'PATRIMONIO' },
    REVENUE: { variant: 'violet', label: 'INGRESOS' },
    EXPENSE: { variant: 'amber', label: 'GASTOS' },
  };

  const item = map[type] || { variant: 'slate', label: type };

  return <Badge variant={item.variant} size="sm">{item.label}</Badge>;
}

export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const map: Record<TransactionStatus, { variant: 'emerald' | 'rose' | 'amber' | 'slate'; label: string }> = {
    POSTED: { variant: 'emerald', label: 'CONTABILIZADO' },
    REVERSED: { variant: 'rose', label: 'ESTORNADO' },
    PENDING: { variant: 'amber', label: 'PENDIENTE' },
    REJECTED: { variant: 'slate', label: 'RECHAZADO' },
  };

  const item = map[status] || { variant: 'slate', label: status };

  return <Badge variant={item.variant} size="sm">{item.label}</Badge>;
}

export function RoleBadge({ role }: { role: RoleType }) {
  const map: Record<RoleType, { variant: 'emerald' | 'cyan' | 'amber' | 'violet'; label: string }> = {
    ROLE_ADMIN: { variant: 'emerald', label: 'ADMINISTRADOR' },
    ROLE_OPERATOR: { variant: 'cyan', label: 'OPERADOR' },
    ROLE_AUDITOR: { variant: 'amber', label: 'AUDITOR FORENSE' },
    ROLE_COMPLIANCE_OFFICER: { variant: 'violet', label: 'OFICIAL CUMPLIMIENTO' },
  };

  const item = map[role] || { variant: 'slate', label: role };

  return <Badge variant={item.variant} size="sm">{item.label}</Badge>;
}
