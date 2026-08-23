import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  CheckCircle2, 
  Clock, 
  ChevronDown,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { RoleType } from '../types';
import { RoleBadge } from './Badge';

export function Header() {
  const { currentUser, switchRole, isDemoMode } = useAuthStore();
  const [time, setTime] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const roles: { role: RoleType; label: string; desc: string }[] = [
    { role: 'ROLE_ADMIN', label: 'Administrador (Root)', desc: 'Acceso total, creación de cuentas y transferencias' },
    { role: 'ROLE_OPERATOR', label: 'Operador de Tesorería', desc: 'Emisión de asientos contables y transferencias' },
    { role: 'ROLE_AUDITOR', label: 'Auditor Forense', desc: 'Verificación criptográfica SHA-256 y lectura' },
    { role: 'ROLE_COMPLIANCE_OFFICER', label: 'Oficial de Cumplimiento', desc: 'Ejecución de estornos contables y auditoría' },
  ];

  return (
    <header className="border-b border-slate-800/80 bg-[#080C14]/95 backdrop-blur-md px-6 py-3 sticky top-0 z-50 flex items-center justify-between">
      {/* Brand & Platform Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-transform hover:scale-105">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight text-lg bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              VaultLedger
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 font-semibold flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Core Engine v1.0
            </span>
            {isDemoMode && (
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-700/60 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Live Demo Engine
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Plataforma Bancaria de Doble Partida con Criptografía Asimétrica RSA-256
          </p>
        </div>
      </div>

      {/* System Status Indicators & Live Clock */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-200">{time || 'UTC Loading...'}</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>RSA-256 JWT</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>PostgreSQL 17</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">ΣD = ΣC Invariante</span>
          </div>
        </div>

        {/* Interactive RBAC Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-emerald-500/50 transition-all text-left group"
          >
            <div className="w-7 h-7 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-xs">
              <div className="text-white font-medium flex items-center gap-1.5">
                <span>{currentUser.firstName} {currentUser.lastName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-transform" />
              </div>
              <RoleBadge role={currentUser.role} />
            </div>
          </button>

          {/* Role Dropdown */}
          {isDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-80 rounded-xl bg-[#0F172A] border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-slate-800 text-xs">
                <span className="font-semibold text-white uppercase tracking-wider">Conmutador de Roles RBAC</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Cambia de identidad en tiempo real para verificar los permisos del sistema
                </p>
              </div>

              <div className="py-1 space-y-1">
                {roles.map(r => {
                  const isSelected = currentUser.role === r.role;
                  return (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchRole(r.role);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start gap-2.5 ${
                        isSelected 
                          ? 'bg-slate-800/90 border border-emerald-500/40 text-white' 
                          : 'hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <div className="mt-0.5">
                        <RoleBadge role={r.role} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{r.label}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{r.desc}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
