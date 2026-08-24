import { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  ChevronDown, 
  Bell, 
  Shield, 
  KeyRound, 
  UserCheck, 
  FileSearch, 
  RotateCcw
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { RoleType } from '../types';
import { apiClient } from '../api/apiClient';

interface HeaderProps {
  onSearchChange?: (query: string) => void;
  onRefreshData?: () => void;
}

export function Header({ onSearchChange, onRefreshData }: HeaderProps) {
  const { currentUser, switchRole } = useAuthStore();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const roles: { role: RoleType; label: string; icon: typeof UserCheck; desc: string }[] = [
    { role: 'ROLE_ADMIN', label: 'Admin (Full Access)', icon: KeyRound, desc: 'Cuentas, transferencias, estornos y auditoría' },
    { role: 'ROLE_OPERATOR', label: 'Operator (Ledger Entry)', icon: UserCheck, desc: 'Emisión de transferencias operacionales' },
    { role: 'ROLE_AUDITOR', label: 'Auditor (Read-Only & Hash)', icon: FileSearch, desc: 'Inspección de asientos y verificación SHA-256' },
    { role: 'ROLE_COMPLIANCE_OFFICER', label: 'Compliance (Approvals)', icon: Shield, desc: 'Estornos y supervisión regulatoria' },
  ];

  const handleSelectRole = (r: RoleType) => {
    switchRole(r);
    setRoleDropdownOpen(false);
  };

  const handleResetData = () => {
    apiClient.resetDatabase();
    if (onRefreshData) onRefreshData();
  };

  const displayName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Michael Anderson';
  const roleLabel = currentUser?.role === 'ROLE_ADMIN' 
    ? 'ROLE: ADMIN / AUDITOR' 
    : `ROLE: ${currentUser?.role.replace('ROLE_', '')}`;

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-6 flex items-center justify-between shadow-xs">
      {/* Left: Branding & Security Badge */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm font-bold text-sm">
            <Shield className="w-5 h-5 fill-white/20" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">
            VaultLedger
          </span>
        </div>

        {/* Security Indicator Pill matching 1.png */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>System Encrypted &bull; RSA-256</span>
        </div>
      </div>

      {/* Center: Global Search matching 1.png */}
      <div className="hidden md:flex items-center max-w-md w-full mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search accounts, transactions, entities..."
            value={searchVal}
            onChange={e => {
              setSearchVal(e.target.value);
              if (onSearchChange) onSearchChange(e.target.value);
            }}
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-lg pl-10 pr-10 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-200/80 px-1.5 py-0.5 rounded border border-slate-300">
            ⌘ K
          </kbd>
        </div>
      </div>

      {/* Right: Reset Data, Role Switcher & User Profile */}
      <div className="flex items-center gap-3">
        {/* Reset Mock DB Button */}
        <button
          onClick={handleResetData}
          title="Restablecer Datos Iniciales"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Notification Bell with Badge 3 */}
        <div className="relative">
          <button className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
            3
          </span>
        </div>

        {/* Interactive RBAC Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            <span>
              Role: {currentUser.role === 'ROLE_ADMIN' ? 'Admin / Auditor' : currentUser.role.replace('ROLE_', '')}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 animate-in fade-in">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-1.5 border-b border-slate-100">
                Seleccionar Rol Operacional (RBAC)
              </div>
              <div className="space-y-1 mt-1">
                {roles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => handleSelectRole(r.role)}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left text-xs transition-colors ${
                      currentUser.role === r.role
                        ? 'bg-blue-50 text-blue-900 border border-blue-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <r.icon className={`w-4 h-4 mt-0.5 shrink-0 ${currentUser.role === r.role ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-semibold">{r.label}</div>
                      <div className="text-[10px] text-slate-500 leading-tight">{r.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill matching 1.png */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center justify-center overflow-hidden border border-slate-200">
            {currentUser?.firstName?.charAt(0) || 'A'}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {displayName}
            </div>
            <div className="text-[10px] font-mono font-semibold text-blue-600 uppercase">
              {roleLabel}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
