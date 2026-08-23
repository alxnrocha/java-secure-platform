import { 
  LayoutDashboard, 
  Layers, 
  ArrowLeftRight, 
  FileCheck, 
  PieChart,
  Lock
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export type NavSection = 'overview' | 'accounts' | 'ledger' | 'audit' | 'solvency';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
}

export function Sidebar({ activeSection, onSelectSection }: SidebarProps) {
  const { canCreateAccount, canPostTransaction, canViewAuditLogs } = useAuthStore();

  const navItems: {
    id: NavSection;
    label: string;
    description: string;
    icon: typeof LayoutDashboard;
    badge?: string;
    locked?: boolean;
    lockMsg?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Visión General',
      description: 'Métricas, KPIs y estado del sistema',
      icon: LayoutDashboard,
    },
    {
      id: 'accounts',
      label: 'Plan de Cuentas',
      description: 'Jerarquía contable y balances de naturaleza',
      icon: Layers,
      badge: canCreateAccount() ? 'Admin' : undefined,
    },
    {
      id: 'ledger',
      label: 'Libro Mayor & Transferencias',
      description: 'Motor de doble partida y estornos',
      icon: ArrowLeftRight,
      badge: canPostTransaction() ? 'Operador' : undefined,
    },
    {
      id: 'audit',
      label: 'Auditoría Forense SHA-256',
      description: 'Pista criptográfica y detector de manipulaciones',
      icon: FileCheck,
      badge: canViewAuditLogs() ? 'Auditor' : undefined,
      locked: !canViewAuditLogs(),
      lockMsg: 'Requiere rol Auditor, Cumplimiento o Admin',
    },
    {
      id: 'solvency',
      label: 'Solvencia & Ratios',
      description: 'Ratios de apalancamiento y balance general',
      icon: PieChart,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#0B0F19]/60 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          Módulos de Plataforma
        </div>

        <nav className="space-y-1">
          {navItems.map(item => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (!item.locked) {
                    onSelectSection(item.id);
                  }
                }}
                disabled={item.locked}
                title={item.locked ? item.lockMsg : undefined}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group ${
                  isActive
                    ? 'bg-slate-800/90 text-white border border-slate-700/80 shadow-[0_2px_12px_rgba(0,0,0,0.3)]'
                    : item.locked
                    ? 'opacity-40 cursor-not-allowed text-slate-500 hover:bg-transparent'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className={`text-xs font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{item.description}</p>
                  </div>
                </div>

                {item.locked ? (
                  <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                ) : item.badge ? (
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 shrink-0">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Invariant Card in Sidebar Footer */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800/80 space-y-2 mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-slate-400">Ledger Engine</span>
          <span className="font-mono text-emerald-400 text-[10px] font-semibold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
            ONLINE
          </span>
        </div>
        <div className="text-[11px] text-slate-400 leading-relaxed font-mono">
          Aislamiento Serializable con Bloqueo Pesimista Anticolisión.
        </div>
      </div>
    </aside>
  );
}
