import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Filter, 
  MoreHorizontal, 
  Landmark, 
  Scale, 
  DollarSign, 
  TrendingUp, 
  FileText,
  AlertCircle,
  Check
} from 'lucide-react';
import { Account, AccountHierarchy, AccountType, CreateAccountPayload } from '../types';
import { apiClient } from '../api/apiClient';
import { useAuthStore } from '../stores/authStore';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

interface ChartOfAccountsProps {
  onAccountSelect?: (acc: Account) => void;
}

export function ChartOfAccounts({ onAccountSelect }: ChartOfAccountsProps) {
  const { canCreateAccount, token } = useAuthStore();
  const [hierarchy, setHierarchy] = useState<AccountHierarchy[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Account creation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<AccountType>('ASSET');
  const [formParentId, setFormParentId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accs, hier] = await Promise.all([
        apiClient.getAccounts(),
        apiClient.getAccountHierarchy(),
      ]);
      setAccounts(accs);
      setHierarchy(hier);

      const initialExp: Record<string, boolean> = {};
      accs.forEach(a => { initialExp[a.id] = true; });
      setExpandedNodes(initialExp);
    } catch (e) {
      console.error('Failed to load chart of accounts', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formCode || !formName) {
      setFormError('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      const payload: CreateAccountPayload = {
        code: formCode.trim(),
        name: formName.trim(),
        type: formType,
        currency: 'EUR',
        parentAccountId: formParentId || undefined,
      };

      await apiClient.createAccount(payload, token);
      setFormSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(false);
        setFormCode('');
        setFormName('');
        setFormParentId('');
      }, 1000);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Error al crear la cuenta contable.');
    }
  };

  const getClassIcon = (type: AccountType) => {
    switch (type) {
      case 'ASSET': return <Landmark className="w-3.5 h-3.5 text-emerald-600" />;
      case 'LIABILITY': return <Scale className="w-3.5 h-3.5 text-blue-600" />;
      case 'EQUITY': return <DollarSign className="w-3.5 h-3.5 text-purple-600" />;
      case 'REVENUE': return <TrendingUp className="w-3.5 h-3.5 text-cyan-600" />;
      case 'EXPENSE': return <TrendingUp className="w-3.5 h-3.5 text-rose-600" />;
    }
  };

  const getBalanceColor = (type: AccountType) => {
    switch (type) {
      case 'ASSET': return 'text-emerald-600';
      case 'LIABILITY': return 'text-blue-600';
      case 'EQUITY': return 'text-emerald-600';
      case 'REVENUE': return 'text-cyan-600';
      case 'EXPENSE': return 'text-rose-600';
    }
  };

  const filterAccount = (acc: Account): boolean => {
    return (
      acc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderTreeNode = (node: AccountHierarchy, depth: number = 0) => {
    const hasChildren = node.subAccounts && node.subAccounts.length > 0;
    const isExpanded = expandedNodes[node.id];
    const isVisible = filterAccount(node) || (hasChildren && node.subAccounts.some(filterAccount));

    if (!isVisible) return null;

    return (
      <div key={node.id} className="select-none">
        <div 
          onClick={() => onAccountSelect && onAccountSelect(node)}
          className={`flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200/60 ${
            depth > 0 ? 'ml-4' : ''
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren ? (
              <button 
                onClick={(e) => toggleExpand(node.id, e)}
                className="p-0.5 rounded hover:bg-slate-200/80 text-slate-400 hover:text-slate-700"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="w-3.5 text-slate-300 text-xs">↳</span>
            )}

            <div className="p-1 rounded bg-slate-100/80 border border-slate-200/60">
              {depth === 0 ? getClassIcon(node.type) : <FileText className="w-3 h-3 text-slate-400" />}
            </div>

            <div className="flex items-center gap-1.5 truncate">
              <span className="font-mono font-bold text-slate-900 text-xs">
                {node.code}
              </span>
              <span className="text-xs font-medium text-slate-700 truncate">
                {node.name}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0 pl-2">
            <span className={`font-mono-numbers text-xs font-bold ${depth === 0 ? getBalanceColor(node.type) : 'text-slate-900'}`}>
              {formatCurrency(node.balance)}
            </span>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-slate-200 ml-4 pl-1 my-0.5 space-y-0.5">
            {node.subAccounts.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="clean-card rounded-2xl bg-white border border-slate-200/90 shadow-sm p-4 space-y-3 flex flex-col h-full">
      {/* Header matching 1.png */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <span>Chart of Accounts</span>
        </h3>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            title="Search accounts"
          >
            <Search className="w-4 h-4" />
          </button>
          <button 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            title="Filter accounts"
          >
            <Filter className="w-4 h-4" />
          </button>
          {canCreateAccount() && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors"
              title="Add account"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Search Input */}
      {showSearch && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by code or title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            autoFocus
          />
        </div>
      )}

      {/* Table Column Subheaders matching 1.png */}
      <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 py-1 bg-slate-50/80 rounded-md">
        <span>ACCOUNT</span>
        <span>BALANCE (EUR)</span>
      </div>

      {/* Accounts List & Tree Structure */}
      <div className="space-y-0.5 overflow-y-auto max-h-[520px] pr-1">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono">
            Loading Chart of Accounts...
          </div>
        ) : hierarchy.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No registered accounts found.
          </div>
        ) : (
          hierarchy.map(root => renderTreeNode(root))
        )}
      </div>

      {/* New Account Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Registrar Cuenta Contable
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Cuenta creada exitosamente en el catálogo contable.</span>
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Código Contable (3-6 dígitos)</label>
                <input
                  type="text"
                  placeholder="ej. 1040, 2030"
                  value={formCode}
                  onChange={e => setFormCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Denominación de la Cuenta</label>
                <input
                  type="text"
                  placeholder="ej. Bóveda Secundaria de Liquidación"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Naturaleza Contable</label>
                <select
                  value={formType}
                  onChange={e => setFormType(e.target.value as AccountType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 cursor-pointer focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ASSET">ACTIVO (1xxx) — Saldo normal Deudor</option>
                  <option value="LIABILITY">PASIVO (2xxx) — Saldo normal Acreedor</option>
                  <option value="EQUITY">PATRIMONIO NETO (3xxx) — Saldo normal Acreedor</option>
                  <option value="REVENUE">INGRESOS (4xxx) — Saldo normal Acreedor</option>
                  <option value="EXPENSE">GASTOS (5xxx) — Saldo normal Deudor</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cuenta Padre (Opcional)</label>
                <select
                  value={formParentId}
                  onChange={e => setFormParentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 cursor-pointer focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Ninguna (Cuenta Raíz) --</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.code} - {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Guardar Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
