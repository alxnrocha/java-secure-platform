import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Sparkles, 
  Download, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw,
  ShieldCheck,
  Building2,
  Check
} from 'lucide-react';
import { BankStatementFeed, ReconciliationSummary } from '../types';
import { mockDatabase } from '../data/mockDatabase';
import { useAuthStore } from '../stores/authStore';
import { Badge } from './Badge';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

export function ReconciliationView() {
  const { currentUser } = useAuthStore();
  const [feeds, setFeeds] = useState<BankStatementFeed[]>([]);
  const [summary, setSummary] = useState<ReconciliationSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'MATCHED' | 'PENDING'>('ALL');
  const [networkFilter, setNetworkFilter] = useState<string>('ALL');
  const [isAutoMatching, setIsAutoMatching] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadData = () => {
    const data = mockDatabase.getReconciliationFeeds();
    const sum = mockDatabase.getReconciliationSummary();
    setFeeds(data);
    setSummary(sum);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAutoReconcile = async () => {
    setIsAutoMatching(true);
    setSuccessToast(null);

    // Realistic processing pause
    setTimeout(async () => {
      const result = await mockDatabase.autoReconcileAll(currentUser || undefined);
      loadData();
      setIsAutoMatching(false);
      setSuccessToast(`Successfully reconciled ${result.reconciledCount} pending feeds. Ledger audit hash committed!`);
      setTimeout(() => setSuccessToast(null), 4500);
    }, 1200);
  };

  const handleSingleReconcile = async (feedId: string, matchedTxId?: string | null) => {
    if (!matchedTxId) return;
    await mockDatabase.manualMatchFeed(feedId, matchedTxId);
    loadData();
    setSuccessToast(`Feed ${feedId.slice(0, 8)} manually reconciled with transaction.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const exportCSV = () => {
    const headers = ['ID,BankReference,Network,Counterparty,IBAN,Direction,Amount,Currency,ValueDate,Status,Confidence,MatchedTx'];
    const rows = feeds.map(f => [
      f.id,
      f.bankReference,
      f.externalNetwork,
      `"${f.counterpartyName.replace(/"/g, '""')}"`,
      f.counterpartyIban,
      f.direction,
      f.amount,
      f.currency,
      f.valueDate,
      f.matchStatus,
      f.confidenceScore,
      f.matchedTransactionRef || 'N/A'
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reconciliation_statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredFeeds = feeds.filter(f => {
    const matchesSearch = 
      f.bankReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.counterpartyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.counterpartyIban.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.matchedTransactionRef && f.matchedTransactionRef.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'ALL' || f.matchStatus === statusFilter;

    const matchesNetwork = 
      networkFilter === 'ALL' || f.externalNetwork === networkFilter;

    return matchesSearch && matchesStatus && matchesNetwork;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Autonomous Bank Reconciliation Engine
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              AI Matching Engine
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time interbank matching of SWIFT MT940 & SEPA CAMT.053 statement feeds against General Ledger entries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Statement (CSV)
          </button>

          <button
            onClick={handleAutoReconcile}
            disabled={isAutoMatching || (summary?.pendingCount === 0)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer ${
              summary?.pendingCount === 0
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isAutoMatching ? 'animate-spin' : ''}`} />
            {isAutoMatching ? 'Matching Feeds...' : summary?.pendingCount === 0 ? 'All Feeds Reconciled ✓' : 'Auto-Match All (AI Engine)'}
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold">{successToast}</span>
          </div>
          <button 
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Feed Volume</span>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-2">
              {formatCurrency(summary.totalVolume)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {summary.totalFeedsCount} External Bank Statements
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Reconciled Balance</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-2">
              {formatCurrency(summary.matchedVolume)}
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-1">
              {summary.matchedCount} Feeds Matched (100%)
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Settlement</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-2">
              {formatCurrency(summary.pendingVolume)}
            </div>
            <div className="text-xs text-amber-600 font-medium mt-1">
              {summary.pendingCount} Awaiting Confirmation
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Matching Confidence</span>
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-2">
              {summary.matchRatePercentage}%
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${summary.matchRatePercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search bank reference, counterparty, IBAN, or TXN ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter Buttons */}
          <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({feeds.length})
            </button>
            <button
              onClick={() => setStatusFilter('MATCHED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'MATCHED' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Matched ({feeds.filter(f => f.matchStatus === 'MATCHED').length})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'PENDING' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({feeds.filter(f => f.matchStatus === 'PENDING').length})
            </button>
          </div>

          {/* Network Selector */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Clearing Networks</option>
              <option value="TARGET2">TARGET2 (ECB)</option>
              <option value="SWIFT_GPI">SWIFT GPI</option>
              <option value="SEPA_INSTANT">SEPA Instant (TIPS)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Comparative Matching Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Statement Date & Ref</th>
                <th className="py-3.5 px-4">Clearing Network & Counterparty</th>
                <th className="py-3.5 px-4 text-right">Amount & Flow</th>
                <th className="py-3.5 px-4">Matching Status</th>
                <th className="py-3.5 px-4">Matched Ledger Tx</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredFeeds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs font-medium">
                    No bank statement feeds found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredFeeds.map((feed) => {
                  const isMatched = feed.matchStatus === 'MATCHED';
                  const isInbound = feed.direction === 'INBOUND';

                  return (
                    <tr key={feed.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Date and Ref */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">
                          {feed.bankReference}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {new Date(feed.valueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>

                      {/* Network & Counterparty */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                            feed.externalNetwork === 'TARGET2' 
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : feed.externalNetwork === 'SWIFT_GPI'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {feed.externalNetwork.replace('_', ' ')}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {feed.counterpartyName}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          IBAN: {feed.counterpartyIban}
                        </div>
                      </td>

                      {/* Direction & Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <div className={`font-mono font-bold inline-flex items-center gap-1 ${
                          isInbound ? 'text-emerald-700' : 'text-slate-700'
                        }`}>
                          {isInbound ? (
                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          {isInbound ? '+' : '-'}{formatCurrency(feed.amount)}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">
                          {feed.direction}
                        </div>
                      </td>

                      {/* Matching Status */}
                      <td className="py-3.5 px-4">
                        {isMatched ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>100% Match</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Badge variant="amber" size="sm">
                              Pending Review ({feed.confidenceScore}%)
                            </Badge>
                          </div>
                        )}
                      </td>

                      {/* Matched Transaction */}
                      <td className="py-3.5 px-4">
                        {feed.matchedTransactionRef ? (
                          <div className="font-mono text-xs font-semibold text-blue-600 bg-blue-50/60 px-2.5 py-1 rounded-md border border-blue-200/60 inline-block">
                            {feed.matchedTransactionRef}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Unmatched</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        {isMatched ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <Check className="w-3.5 h-3.5" /> Settled
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSingleReconcile(feed.id, feed.matchedTransactionId)}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                          >
                            Reconcile 1-Click
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
