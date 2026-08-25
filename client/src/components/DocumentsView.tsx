import { useState } from 'react';
import { 
  Download, 
  Printer, 
  ShieldCheck, 
  Scale, 
  TrendingUp, 
  Award, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  Check 
} from 'lucide-react';
import { FinancialReportType, FinancialReportMetadata } from '../types';
import { mockDatabase } from '../data/mockDatabase';
import { Badge } from './Badge';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

export function DocumentsView() {
  const [selectedReport, setSelectedReport] = useState<FinancialReportMetadata | null>(null);
  const [activeTab, setActiveTab] = useState<'FORMATTED' | 'JSON'>('FORMATTED');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const reportCards = [
    {
      type: 'TRIAL_BALANCE' as FinancialReportType,
      title: 'Official Trial Balance (Balancete de Verificação)',
      description: 'Comprehensive schedule of all General Ledger accounts verifying mathematical double-entry debit and credit equilibrium.',
      icon: Scale,
      color: 'blue',
      badge: 'GAAP & IFRS Compliant',
      standard: 'ISO 20022 / Double-Entry Invariant',
    },
    {
      type: 'INCOME_STATEMENT' as FinancialReportType,
      title: 'Income Statement / Profit & Loss (P&L)',
      description: 'Executive financial statement showing interchange clearing revenues, messaging costs, and net institutional income.',
      icon: TrendingUp,
      color: 'emerald',
      badge: 'Quarterly Executive Dossier',
      standard: 'IAS 1 / Performance Statement',
    },
    {
      type: 'AUDIT_CERTIFICATE' as FinancialReportType,
      title: 'Cryptographic Proof of Immutability & Audit Certificate',
      description: 'Official cryptographic proof certificate validating unbroken SHA-256 hash chains from Genesis to Tip with RSA-2048 signatures.',
      icon: ShieldCheck,
      color: 'purple',
      badge: 'SOC 2 Type II Certified',
      standard: 'NIST FIPS 180-4 / RSASSA-PSS',
    },
    {
      type: 'BASEL3_DOSSIER' as FinancialReportType,
      title: 'Basel III Capital Adequacy & Solvency Dossier',
      description: 'Institutional regulatory compliance dossier detailing Tier-1 Capital, Liquidity Coverage Ratios (LCR), and Capital-to-Asset buffers.',
      icon: Award,
      color: 'amber',
      badge: 'Basel Committee Tier-1',
      standard: 'Basel III Capital Accord',
    },
  ];

  const handlePreviewReport = async (type: FinancialReportType) => {
    setIsGenerating(true);
    const report = await mockDatabase.generateFinancialReport(type);
    setSelectedReport(report);
    setActiveTab('FORMATTED');
    setIsGenerating(false);
  };

  const handleExportCSV = async (type: FinancialReportType) => {
    const report = await mockDatabase.generateFinancialReport(type);
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (type === 'TRIAL_BALANCE') {
      const headers = ['AccountCode,AccountName,Type,NormalBalance,DebitBalance,CreditBalance'];
      const rows = report.data.accounts.map((a: any) => [
        a.code,
        `"${a.name}"`,
        a.type,
        a.normalBalance,
        a.debitBalance,
        a.creditBalance
      ].join(','));
      rows.push(`TOTALS,,,DEBIT_CREDIT_EQUAL,${report.data.totalDebits},${report.data.totalCredits}`);
      csvContent += [headers, ...rows].join('\n');
    } else if (type === 'INCOME_STATEMENT') {
      const headers = ['Category,AccountCode,AccountName,AmountEUR'];
      const revRows = report.data.revenues.map((r: any) => `REVENUE,${r.code},"${r.name}",${r.balance}`);
      const expRows = report.data.expenses.map((e: any) => `EXPENSE,${e.code},"${e.name}",${e.balance}`);
      const totals = [
        `TOTAL_REVENUE,,,${report.data.totalRevenue}`,
        `TOTAL_EXPENSES,,,${report.data.totalExpenses}`,
        `NET_OPERATING_INCOME,,,${report.data.netIncome}`
      ];
      csvContent += [headers, ...revRows, ...expRows, ...totals].join('\n');
    } else {
      // General Key-Value CSV
      const headers = ['Metric,Value'];
      const rows = Object.entries(report.data).map(([k, v]) => `${k},"${String(v)}"`);
      csvContent += [headers, ...rows].join('\n');
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${type.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Institutional Documents & Regulatory Reports Center
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Cryptographically Signed
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time generation, digital certification, and one-click export of General Ledger financial statements and SOC 2 / Basel III compliance dossiers.
          </p>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.type}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    card.color === 'blue' ? 'bg-blue-50 text-blue-600 border border-blue-200/60' :
                    card.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60' :
                    card.color === 'purple' ? 'bg-purple-50 text-purple-600 border border-purple-200/60' :
                    'bg-amber-50 text-amber-600 border border-amber-200/60'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-4 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {card.description}
                </p>

                <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-400 font-mono">
                  <span>Standard:</span>
                  <span className="text-slate-600 font-semibold">{card.standard}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handlePreviewReport(card.type)}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Preview & Inspect
                </button>

                <button
                  onClick={() => handleExportCSV(card.type)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  title="Export CSV"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  CSV
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Report Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-slate-900">
                    {selectedReport.title}
                  </h2>
                  <Badge variant="blue" size="sm">
                    {selectedReport.period}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Generated at {new Date(selectedReport.generatedAt).toUTCString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  Print / Save PDF
                </button>

                <button
                  onClick={() => handleExportCSV(selectedReport.type)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download CSV
                </button>

                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer ml-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Tabs & Cryptographic Hash Seal */}
            <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-200 bg-white text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('FORMATTED')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeTab === 'FORMATTED'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Formatted Statement View
                </button>
                <button
                  onClick={() => setActiveTab('JSON')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeTab === 'JSON'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Raw Cryptographic Payload (JSON)
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>SHA-256 Seal:</span>
                <span className="text-slate-800 font-bold">
                  {selectedReport.sha256VerificationHash.slice(0, 16)}...
                </span>
                <button
                  onClick={() => copyHash(selectedReport.sha256VerificationHash)}
                  className="hover:text-blue-600 cursor-pointer"
                  title="Copy full verification hash"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
              {activeTab === 'JSON' ? (
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
                  {JSON.stringify(selectedReport, null, 2)}
                </pre>
              ) : (
                <>
                  {/* Trial Balance Formatted View */}
                  {selectedReport.type === 'TRIAL_BALANCE' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Double-Entry Invariant Verified: Debit Sum == Credit Sum (Δ = €0.00)</span>
                        </div>
                        <span className="font-mono font-bold">Total: {formatCurrency(selectedReport.data.totalDebits)}</span>
                      </div>

                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="py-2.5 px-3">Code</th>
                            <th className="py-2.5 px-3">Account Title</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3 text-right">Debit Balance (€)</th>
                            <th className="py-2.5 px-3 text-right">Credit Balance (€)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedReport.data.accounts.map((acc: any) => (
                            <tr key={acc.code} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{acc.code}</td>
                              <td className="py-2.5 px-3 font-semibold text-slate-800">{acc.name}</td>
                              <td className="py-2.5 px-3 text-[11px] text-slate-500 font-medium">{acc.type}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                                {acc.debitBalance > 0 ? formatCurrency(acc.debitBalance) : '—'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                                {acc.creditBalance > 0 ? formatCurrency(acc.creditBalance) : '—'}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-slate-100/70 font-bold border-t-2 border-slate-300">
                            <td colSpan={3} className="py-3 px-3 uppercase text-slate-700">Equilibrium Balance Summary</td>
                            <td className="py-3 px-3 text-right font-mono text-emerald-700">
                              {formatCurrency(selectedReport.data.totalDebits)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-emerald-700">
                              {formatCurrency(selectedReport.data.totalCredits)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Income Statement (P&L) Formatted View */}
                  {selectedReport.type === 'INCOME_STATEMENT' && (
                    <div className="space-y-5">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Operating Revenue</h4>
                        <div className="space-y-2">
                          {selectedReport.data.revenues.map((r: any) => (
                            <div key={r.code} className="flex justify-between text-xs">
                              <span className="text-slate-700 font-medium">{r.code} - {r.name}</span>
                              <span className="font-mono font-bold text-slate-900">{formatCurrency(r.balance)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-xs font-bold pt-2 border-t border-slate-200 text-emerald-700">
                            <span>Total Operating Revenue</span>
                            <span className="font-mono">{formatCurrency(selectedReport.data.totalRevenue)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Interbank Clearing & Network Expenses</h4>
                        <div className="space-y-2">
                          {selectedReport.data.expenses.map((e: any) => (
                            <div key={e.code} className="flex justify-between text-xs">
                              <span className="text-slate-700 font-medium">{e.code} - {e.name}</span>
                              <span className="font-mono font-bold text-slate-900">{formatCurrency(e.balance)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-xs font-bold pt-2 border-t border-slate-200 text-rose-700">
                            <span>Total Operating Expenses</span>
                            <span className="font-mono">{formatCurrency(selectedReport.data.totalExpenses)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-blue-900 uppercase tracking-wider">Net Institutional Income (EBIT)</div>
                          <div className="text-[11px] text-blue-700 mt-0.5">Operating Margin: {selectedReport.data.operatingMargin}%</div>
                        </div>
                        <div className="text-xl font-bold font-mono text-blue-900">
                          {formatCurrency(selectedReport.data.netIncome)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Audit Certificate Formatted View */}
                  {selectedReport.type === 'AUDIT_CERTIFICATE' && (
                    <div className="space-y-5 border-2 border-slate-300 p-6 rounded-2xl bg-gradient-to-b from-white to-slate-50/50">
                      <div className="text-center pb-4 border-b border-slate-200">
                        <ShieldCheck className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                        <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                          Official Certificate of Cryptographic Immutability
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Issued under ISO 27001, SOC 2 Type II & Basel III Regulatory Standards
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-white rounded-xl border border-slate-200">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Genesis Block Hash</div>
                          <div className="font-mono text-[11px] text-slate-700 truncate mt-1">
                            {selectedReport.data.genesisHash}
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Current Tip Hash</div>
                          <div className="font-mono text-[11px] text-slate-700 truncate mt-1">
                            {selectedReport.data.tipHash}
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Verified Chain Depth</div>
                          <div className="font-bold text-slate-900 mt-1">
                            {selectedReport.data.totalBlocksVerified} Consecutive Blocks Verified
                          </div>
                        </div>

                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                          <div className="text-[10px] uppercase font-bold text-emerald-600">Integrity Status</div>
                          <div className="font-bold text-emerald-800 mt-1 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            UNBROKEN & CRYPTOGRAPHICALLY VALID
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Basel III Solvency Formatted View */}
                  {selectedReport.type === 'BASEL3_DOSSIER' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
                          <div className="text-[11px] font-bold text-slate-500 uppercase">Solvency Ratio</div>
                          <div className="text-xl font-bold text-blue-600 mt-1">{selectedReport.data.solvencyRatio}x</div>
                          <div className="text-[10px] text-emerald-600 mt-0.5">Min required: 1.50x</div>
                        </div>

                        <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
                          <div className="text-[11px] font-bold text-slate-500 uppercase">Capital to Assets</div>
                          <div className="text-xl font-bold text-emerald-600 mt-1">{Number((selectedReport.data.equityToAssetRatio * 100).toFixed(2))}%</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Tier-1 Equity Buffer</div>
                        </div>

                        <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
                          <div className="text-[11px] font-bold text-slate-500 uppercase">Debt to Equity</div>
                          <div className="text-xl font-bold text-slate-900 mt-1">{selectedReport.data.debtToEquityRatio}x</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Conservative Leverage</div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600 font-medium">Total Institutional Assets</span>
                          <span className="font-mono font-bold text-slate-900">{formatCurrency(selectedReport.data.totalAssets)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 font-medium">Total Deposit Liabilities</span>
                          <span className="font-mono font-bold text-slate-900">{formatCurrency(selectedReport.data.totalLiabilities)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 font-medium">Paid-in Equity & Reserves</span>
                          <span className="font-mono font-bold text-slate-900">{formatCurrency(selectedReport.data.totalEquity)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
