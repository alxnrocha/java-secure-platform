import { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Activity, 
  Layers, 
  RefreshCw, 
  CheckCircle2,
  Terminal,
  Database
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'audit' | 'solvency'>('overview');

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col">
      {/* Top System Security Bar */}
      <header className="border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white tracking-tight text-base">VaultLedger</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                Core Engine v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Enterprise Double-Entry Financial Engine &amp; Security Platform</p>
          </div>
        </div>

        {/* Security Status Indicators */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>RSA-256 Auth</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>PostgreSQL 17</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-700/50 text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ledger Invariant ΣD = ΣC</span>
          </div>
        </div>
      </header>

      {/* Main Scaffold View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 pb-2 gap-2 text-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Visión General
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'ledger'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Libro Mayor (Double-Entry)
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'audit'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pista de Auditoría SHA-256
          </button>
          <button
            onClick={() => setActiveTab('solvency')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'solvency'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Análisis de Solvencia
          </button>
        </div>

        {/* Scaffold Core Banner */}
        <div className="glass-panel p-8 rounded-xl border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Arquitectura Multi-Módulo Inicializada con Éxito
              </h2>
              <p className="text-sm text-slate-400">
                Backend Spring Boot 3.3 (Java 21 LTS) y Frontend React 19 + Tailwind CSS v4 acoplados y listos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800/60 text-sm">
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                <Layers className="w-4 h-4" />
                <span>Double-Entry Core</span>
              </div>
              <p className="text-xs text-slate-400">
                Partidas contables balanceadas con garantía matemática de conservación de balance.
              </p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
                <Activity className="w-4 h-4" />
                <span>Seguridad RBAC</span>
              </div>
              <p className="text-xs text-slate-400">
                Aislamiento estricto de roles: Admin, Operador, Auditor y Oficial de Cumplimiento.
              </p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
                <RefreshCw className="w-4 h-4" />
                <span>Auditoría Forense</span>
              </div>
              <p className="text-xs text-slate-400">
                Cadena criptográfica SHA-256 a prueba de manipulaciones manuales.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 px-6 text-center text-xs text-slate-500">
        VaultLedger Core Platform • Java 21 LTS &bull; Spring Security 6 &bull; React 19 &bull; PostgreSQL 17
      </footer>
    </div>
  );
}
