import { useState } from 'react';
import { 
  Landmark, 
  Scale, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Users, 
  Link2, 
  Settings as SettingsIcon
} from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar, NavSection } from './components/Sidebar';
import { StatCard } from './components/StatCard';
import { ChartOfAccounts } from './components/ChartOfAccounts';
import { TransactionLedger } from './components/TransactionLedger';
import { AuditTrail } from './components/AuditTrail';
import { SolvencyDashboard } from './components/SolvencyDashboard';
import { ReconciliationView } from './components/ReconciliationView';
import { DocumentsView } from './components/DocumentsView';
import { TransferModal } from './components/TransferModal';
import { useAuthStore } from './stores/authStore';

export function App() {
  const { canPostTransaction } = useAuthStore();
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Navigation Bar matching 1.png */}
      <Header 
        onSearchChange={setSearchQuery} 
        onRefreshData={triggerRefresh}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeSection={activeSection}
          onSelectSection={setActiveSection}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* DASHBOARD VIEW matching 1.png */}
          {activeSection === 'dashboard' && (
            <div key={refreshKey} className="space-y-6">
              {/* 4 KPI Metric Cards matching 1.png */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Asset Liquidity"
                  value="€21,550,000.00"
                  trend={{ value: '8.42%', positive: true }}
                  icon={Landmark}
                  accent="emerald"
                />
                <StatCard
                  title="Total Liabilities"
                  value="€9,400,000.00"
                  trend={{ value: '4.13%', positive: true }}
                  icon={Scale}
                  accent="blue"
                />
                <StatCard
                  title="Net Equity Balance"
                  value="€11,800,000.00"
                  trend={{ value: '10.27%', positive: true }}
                  icon={DollarSign}
                  accent="purple"
                />
                <StatCard
                  title="Net Operating Income"
                  value="€350,000.00"
                  trend={{ value: '6.88%', positive: true }}
                  icon={TrendingUp}
                  accent="cyan"
                />
              </div>

              {/* Split Area matching 1.png: Left Chart of Accounts (30%), Right Double-Entry Ledger (70%) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left Column: Chart of Accounts */}
                <div className="lg:col-span-4 h-full">
                  <ChartOfAccounts />
                </div>

                {/* Right Column: Double-Entry Transaction Ledger */}
                <div className="lg:col-span-8 h-full">
                  <TransactionLedger 
                    onNewTransferClick={() => setIsTransferModalOpen(true)}
                    externalSearch={searchQuery}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TRANSACTIONS VIEW */}
          {activeSection === 'transactions' && (
            <div key={refreshKey} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Libro Diario de Partidas Dobles (General Ledger)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Historial completo de transferencias y transacciones contables atómicas.
                  </p>
                </div>
                {canPostTransaction() && (
                  <button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Transfer</span>
                  </button>
                )}
              </div>
              <TransactionLedger 
                onNewTransferClick={() => setIsTransferModalOpen(true)}
                externalSearch={searchQuery}
              />
            </div>
          )}

          {/* ACCOUNTS VIEW */}
          {activeSection === 'accounts' && (
            <div key={refreshKey} className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Plan General Contable y Catálogo de Cuentas
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Jerarquía de cuentas contables, naturaleza y balance acumulado.
                </p>
              </div>
              <ChartOfAccounts />
            </div>
          )}

          {/* AUDIT TRAIL VIEW matching 3.png */}
          {activeSection === 'audit' && (
            <div key={refreshKey}>
              <AuditTrail />
            </div>
          )}

          {/* SOLVENCY & REPORTS VIEW */}
          {activeSection === 'solvency' && (
            <div key={refreshKey}>
              <SolvencyDashboard />
            </div>
          )}

          {/* Supplementary Enterprise Banking Views */}
          {activeSection === 'entities' && (
            <div className="clean-card rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Institutional Entity Directory</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Gestión de contrapartes interbancarias, clientes corporativos y custodios institucionales regulados bajo MiFID II.
              </p>
            </div>
          )}

          {/* AUTOMATED BANK RECONCILIATION VIEW */}
          {activeSection === 'reconciliation' && (
            <div key={refreshKey}>
              <ReconciliationView />
            </div>
          )}

          {/* FINANCIAL DOCUMENTS & AUDIT CERTIFICATES VIEW */}
          {activeSection === 'documents' && (
            <div key={refreshKey}>
              <DocumentsView />
            </div>
          )}

          {activeSection === 'integrations' && (
            <div className="clean-card rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto">
                <Link2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Core Banking &amp; API Webhooks</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Conexión en tiempo real con pasarelas SEPA Instant, FedNow, TARGET2 y webhooks transaccionales con firma HMAC SHA-256.
              </p>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="clean-card rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
                <SettingsIcon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Security &amp; System Configuration</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Configuración de claves asimétricas RSA-2048, rotación de tokens de refresco Redis 7 y políticas de retención inmutable.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Atomic Transfer Terminal Modal matching 2.png */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={triggerRefresh}
      />
    </div>
  );
}

export default App;
