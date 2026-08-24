import { useState } from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Landmark, 
  ShieldCheck, 
  BarChart3, 
  Users, 
  CheckCircle2, 
  Folder, 
  Link2, 
  Settings, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export type NavSection = 'dashboard' | 'transactions' | 'accounts' | 'audit' | 'solvency' | 'entities' | 'reconciliation' | 'documents' | 'integrations' | 'settings';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
}

export function Sidebar({ activeSection, onSelectSection }: SidebarProps) {
  const { canCreateAccount, canPostTransaction, canViewAuditLogs } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const navItems: {
    id: NavSection;
    label: string;
    icon: typeof LayoutDashboard;
    permission?: boolean;
    badge?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, permission: canPostTransaction(), badge: 'Live' },
    { id: 'accounts', label: 'Accounts', icon: Landmark, permission: canCreateAccount() },
    { id: 'audit', label: 'Audit Trail', icon: ShieldCheck, permission: canViewAuditLogs(), badge: '100%' },
    { id: 'solvency', label: 'Reports & Solvency', icon: BarChart3 },
    { id: 'entities', label: 'Entities', icon: Users },
    { id: 'reconciliation', label: 'Reconciliation', icon: CheckCircle2 },
    { id: 'documents', label: 'Documents', icon: Folder },
    { id: 'integrations', label: 'Integrations', icon: Link2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col justify-between select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation Links */}
      <div className="p-3 space-y-1">
        {navItems.map(item => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!collapsed && item.badge && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Compliance & System Status Box matching 1.png / 3.png */}
      <div className="p-3 space-y-3 border-t border-slate-200 bg-slate-50/50">
        {!collapsed && (
          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700">Compliance</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                COMPLIANT
              </span>
            </div>

            <div className="space-y-1 text-[10px] text-slate-500 font-mono">
              <div className="flex items-center justify-between">
                <span>SOC 2 Type II</span>
                <span className="text-emerald-600 font-bold">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span>PCI DSS v4.0</span>
                <span className="text-emerald-600 font-bold">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ISO 27001</span>
                <span className="text-emerald-600 font-bold">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span>GDPR</span>
                <span className="text-emerald-600 font-bold">✓</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-sans font-medium text-slate-600">Operational</span>
              </div>
              <span className="font-mono text-[9px] text-slate-400">v2.4.1</span>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors text-xs font-semibold"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
