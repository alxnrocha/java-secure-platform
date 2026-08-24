import type { ReactNode } from 'react';
import { AccountType, TransactionStatus, RoleType } from '../types';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'emerald' | 'blue' | 'cyan' | 'rose' | 'amber' | 'purple' | 'slate';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    blue: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200 font-semibold',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 font-semibold',
    slate: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-medium rounded-full',
    md: 'text-xs px-2.5 py-1 font-medium rounded-full',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 border font-mono tracking-tight ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
}

export function AccountTypeBadge({ type }: { type: AccountType }) {
  const map: Record<AccountType, { variant: 'emerald' | 'blue' | 'purple' | 'cyan' | 'rose'; label: string }> = {
    ASSET: { variant: 'emerald', label: '1xxx Activos' },
    LIABILITY: { variant: 'blue', label: '2xxx Pasivos' },
    EQUITY: { variant: 'purple', label: '3xxx Patrimonio' },
    REVENUE: { variant: 'cyan', label: '4xxx Ingresos' },
    EXPENSE: { variant: 'rose', label: '5xxx Gastos' },
  };

  const item = map[type] || { variant: 'slate', label: type };

  return <Badge variant={item.variant} size="sm">{item.label}</Badge>;
}

export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  if (status === 'POSTED') {
    return (
      <div className="flex flex-col gap-1 items-start">
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
          POSTED
        </span>
        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
          AUDITED
        </span>
      </div>
    );
  }

  const map: Record<TransactionStatus, { variant: 'emerald' | 'rose' | 'amber' | 'slate' | 'blue'; label: string }> = {
    POSTED: { variant: 'emerald', label: 'POSTED' },
    AUDITED: { variant: 'blue', label: 'AUDITED' },
    REVERSED: { variant: 'rose', label: 'REVERSED' },
    PENDING: { variant: 'amber', label: 'PENDING' },
    REJECTED: { variant: 'slate', label: 'REJECTED' },
  };

  const item = map[status] || { variant: 'slate', label: status };

  return <Badge variant={item.variant} size="sm">{item.label}</Badge>;
}

export function RoleBadge({ role }: { role: RoleType }) {
  const map: Record<RoleType, { variant: 'blue' | 'cyan' | 'amber' | 'purple'; label: string }> = {
    ROLE_ADMIN: { variant: 'blue', label: 'ROLE: ADMIN' },
    ROLE_OPERATOR: { variant: 'cyan', label: 'ROLE: OPERATOR' },
    ROLE_AUDITOR: { variant: 'amber', label: 'ROLE: AUDITOR' },
    ROLE_COMPLIANCE_OFFICER: { variant: 'purple', label: 'ROLE: COMPLIANCE' },
  };

  const item = map[role] || { variant: 'slate', label: role };

  return <Badge variant={item.variant} size="sm">{item.label}</Badge>;
}
