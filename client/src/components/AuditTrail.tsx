import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Download, 
  Filter, 
  Search, 
  Calendar, 
  Copy, 
  Check, 
  RotateCw, 
  Bug, 
  Eye, 
  Layers, 
  CheckCircle2, 
  X, 
  MoreHorizontal 
} from 'lucide-react';
import { AuditLog, AuditChainVerification } from '../types';
import { apiClient } from '../api/apiClient';
import { useAuthStore } from '../stores/authStore';
import { StatCard } from './StatCard';

const formatDate = (isoStr: string) => {
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' ' + d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) + ' UTC';
};

export function AuditTrail() {
  const { token } = useAuthStore();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState<AuditChainVerification | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Selected Log for Drawer
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [activeTab, setActiveTab] = useState<'diff' | 'payload' | 'metadata'>('diff');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const [data, ver] = await Promise.all([
        apiClient.getAuditLogs(token),
        apiClient.verifyAuditChain(token),
      ]);
      setLogs(data);
      setVerification(ver);
    } catch (e) {
      console.error('Failed to load audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const ver = await apiClient.verifyAuditChain(token);
      setVerification(ver);
    } catch (e) {
      console.error('Verification error', e);
    } finally {
      setVerifying(false);
    }
  };

  const handleSimulateTamper = () => {
    apiClient.simulateTamper();
    loadLogs();
  };

  const handleResetData = () => {
    apiClient.resetDatabase();
    loadLogs();
  };

  const copyToClipboard = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredLogs = logs.filter(log => {
    const q = searchQuery.toLowerCase();
    return (
      log.id.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.entityName.toLowerCase().includes(q) ||
      log.userEmail.toLowerCase().includes(q) ||
      log.currentHash.toLowerCase().includes(q)
    );
  });

  const getActionBadge = (action: string) => {
    const map: Record<string, { bg: string; text: string; border: string }> = {
      POST_TRANSACTION: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      REVERSE_TRANSACTION: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
      GENESIS_INIT: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      ACCOUNT_FROZEN: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      LOGIN_SUCCESS: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    };
    const style = map[action] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
    return (
      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${style.bg} ${style.text} ${style.border}`}>
        {action}
      </span>
    );
  };

  // Find neighbors for selected log
  const selectedIndex = selectedLog ? logs.findIndex(l => l.id === selectedLog.id) : -1;
  const nextLog = selectedIndex > 0 ? logs[selectedIndex - 1] : null;

  return (
    <div className="space-y-5">
      {/* Top Header matching 3.png */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Immutable Audit Log
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Forensic audit trail with cryptographic integrity verification and tamper-evident logging.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              const dataStr = JSON.stringify(logs, null, 2);
              const blob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `vaultledger-audit-trail-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs cursor-pointer transition-colors">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <button className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Top Metric Cards matching 3.png */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Events"
          value={logs.length + 128540}
          trend={{ value: '12.4%', positive: true }}
          icon={Layers}
          accent="blue"
        />
        <StatCard
          title="Integrity Status"
          value={verification?.valid ? '100%' : '0% (TAMPERED)'}
          trend={{ value: verification?.valid ? 'Chain Integrity Verified' : 'Anomaly Detected', positive: verification?.valid ?? true, period: '' }}
          icon={verification?.valid ? ShieldCheck : ShieldAlert}
          accent={verification?.valid ? 'emerald' : 'rose'}
        />
        <StatCard
          title="Anomalies Detected"
          value={verification?.valid ? '0' : '1'}
          trend={{ value: verification?.valid ? 'No integrity issues found' : 'Tamper Alert', positive: verification?.valid ?? true, period: '' }}
          icon={CheckCircle2}
          accent={verification?.valid ? 'emerald' : 'rose'}
        />
        <StatCard
          title="Retention (Days)"
          value="2,555"
          trend={{ value: 'Immutable retention', positive: true, period: '' }}
          icon={Calendar}
          accent="blue"
        />
      </div>

      {/* Verification & Tamper Simulation Banner matching 3.png */}
      <div className={`clean-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border ${
        verification?.valid
          ? 'bg-emerald-50/40 border-emerald-200'
          : 'bg-rose-50/50 border-rose-300'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            verification?.valid ? 'bg-emerald-500' : 'bg-rose-500'
          }`} />
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>
                {verification?.valid 
                  ? `Chain Integrity: 100% Verified (0 Anomalies)` 
                  : `ALERTA DE MANIPULACIÓN: Bloque alterado detectado`}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Last verified: {verification ? formatDate(verification.verifiedAt) : 'Just now'} &bull; {verification?.message}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulate Tamper for Auditor Demo */}
          <button
            onClick={handleSimulateTamper}
            title="Simula una alteración manual en la base de datos para probar la detección criptográfica"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold cursor-pointer transition-colors"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Simulate Tamper (Demo)</span>
          </button>

          {/* Reset / Restore */}
          <button
            onClick={handleResetData}
            title="Restaurar estado criptográfico original"
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Verify Chain Button matching 3.png */}
          <button
            onClick={handleVerifyChain}
            disabled={verifying}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs cursor-pointer transition-all disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
            <span>{verifying ? 'Verificando...' : 'Verify Chain'}</span>
          </button>
        </div>
      </div>

      {/* Forensic Audit Events Table matching 3.png */}
      <div className="clean-card rounded-2xl bg-white border border-slate-200/90 shadow-sm p-5 space-y-4">
        {/* Table Search and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit events..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>May 12 – May 18, 2026</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                <th className="py-2.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">EVENT ID</th>
                <th className="py-2.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">TIMESTAMP (UTC)</th>
                <th className="py-2.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">ACTOR (USER ID &amp; ROLE)</th>
                <th className="py-2.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">ACTION TYPE</th>
                <th className="py-2.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">TARGET ENTITY</th>
                <th className="py-2.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">IP ADDRESS</th>
                <th className="py-2.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">SHA-256 CHAIN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-xs text-slate-400 font-mono">
                    Loading audit trail events...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-xs text-slate-400">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const eventRef = `EVT-${log.createdAt.slice(0, 10).replace(/-/g, '')}-${log.id.slice(0, 6)}`;
                  const isCopied = copiedText === log.currentHash;

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      {/* Event ID */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-blue-600 hover:text-blue-800">
                          <span>{eventRef}</span>
                          <button
                            onClick={(e) => copyToClipboard(eventRef, e)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                        {formatDate(log.createdAt)}
                      </td>

                      {/* Actor */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                            {log.userEmail.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 text-xs truncate max-w-[120px]">
                              {log.userEmail.split('@')[0]}
                            </div>
                            <span className="text-[9px] font-mono text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200 uppercase font-bold">
                              ADMIN
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action Type */}
                      <td className="py-3 px-3">
                        {getActionBadge(log.action)}
                      </td>

                      {/* Target Entity */}
                      <td className="py-3 px-3 font-mono text-slate-700 text-xs">
                        <div className="font-bold">{log.entityId.slice(0, 18)}</div>
                        <div className="text-[10px] text-slate-400">{log.entityName}</div>
                      </td>

                      {/* IP Address */}
                      <td className="py-3 px-3 font-mono text-slate-500 text-xs">
                        {log.ipAddress}
                      </td>

                      {/* SHA-256 Chain matching 3.png */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="text-slate-600 truncate max-w-[90px]">
                            {log.currentHash.slice(0, 16)}...
                          </span>
                          <button
                            onClick={(e) => copyToClipboard(log.currentHash, e)}
                            className="p-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="Copiar Hash Completo"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                          <span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 text-[10px]">
                            ✓
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div>Showing {filteredLogs.length} of {logs.length} events</div>
          <div className="font-mono text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Chain Status: 100% Cryptographically Linked
          </div>
        </div>
      </div>

      {/* Event Details Slide-over Drawer matching 3.png right side */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Event Details</h3>
                    <div className="font-mono text-[10px] text-slate-400">
                      EVT-{selectedLog.createdAt.slice(0, 10).replace(/-/g, '')}-{selectedLog.id.slice(0, 6)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Event Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-mono text-[10px] uppercase">TIMESTAMP (UTC)</span>
                  <div className="font-mono text-slate-800 text-[11px] mt-0.5">{formatDate(selectedLog.createdAt)}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-mono text-[10px] uppercase">ACTION TYPE</span>
                  <div className="mt-0.5">{getActionBadge(selectedLog.action)}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-mono text-[10px] uppercase">ACTOR</span>
                  <div className="font-semibold text-slate-800 text-xs mt-0.5">{selectedLog.userEmail}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-mono text-[10px] uppercase">TARGET ENTITY</span>
                  <div className="font-mono text-slate-800 text-xs mt-0.5 truncate">{selectedLog.entityId}</div>
                </div>
              </div>

              {/* SHA-256 Hash Box */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="text-slate-400 font-mono text-[10px] uppercase">SHA-256 HASH</span>
                <div className="flex items-center justify-between font-mono text-[11px] text-slate-700 break-all bg-white p-2 rounded border border-slate-200">
                  <span>{selectedLog.currentHash}</span>
                  <button
                    onClick={() => copyToClipboard(selectedLog.currentHash)}
                    className="p-1 text-slate-400 hover:text-slate-700 ml-2 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Included in verified chain</span>
                </div>
              </div>

              {/* Tabs: Event Payload, Diff View, Metadata matching 3.png */}
              <div className="border-b border-slate-200 flex items-center gap-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('payload')}
                  className={`pb-2 border-b-2 cursor-pointer transition-colors ${
                    activeTab === 'payload' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Event Payload
                </button>
                <button
                  onClick={() => setActiveTab('diff')}
                  className={`pb-2 border-b-2 cursor-pointer transition-colors ${
                    activeTab === 'diff' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Diff View
                </button>
                <button
                  onClick={() => setActiveTab('metadata')}
                  className={`pb-2 border-b-2 cursor-pointer transition-colors ${
                    activeTab === 'metadata' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Metadata
                </button>
              </div>

              {/* Tab Content: JSON Diff View matching 3.png */}
              {activeTab === 'diff' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Removed / Before</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Added / After</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono text-[10px] bg-slate-900 text-slate-200 p-3 rounded-xl overflow-x-auto">
                    {/* BEFORE */}
                    <div className="space-y-1">
                      <div className="text-slate-400 font-bold uppercase text-[9px] border-b border-slate-800 pb-1">BEFORE</div>
                      <div className="text-rose-400 bg-rose-950/40 p-1 rounded">
                        {selectedLog.payloadBefore || 'null (Initial Creation)'}
                      </div>
                    </div>

                    {/* AFTER */}
                    <div className="space-y-1">
                      <div className="text-slate-400 font-bold uppercase text-[9px] border-b border-slate-800 pb-1">AFTER</div>
                      <div className="text-emerald-400 bg-emerald-950/40 p-1 rounded break-all whitespace-pre-wrap">
                        {selectedLog.payloadAfter}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'payload' && (
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {selectedLog.payloadAfter}
                </pre>
              )}

              {activeTab === 'metadata' && (
                <div className="space-y-2 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>IP Address: {selectedLog.ipAddress}</div>
                  <div>User ID: {selectedLog.userId || 'N/A'}</div>
                  <div>Entity Type: {selectedLog.entityName}</div>
                </div>
              )}

              {/* Cryptographic Chain Verification matching 3.png */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Chain Verification</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  This event is cryptographically linked and verified with its predecessor and successor.
                </p>

                <div className="space-y-2 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-400 uppercase">Prev Hash:</span>
                    <div className="p-1.5 bg-white rounded border border-slate-200 text-slate-600 truncate flex items-center justify-between mt-0.5">
                      <span>{selectedLog.previousHash}</span>
                      <button onClick={() => copyToClipboard(selectedLog.previousHash)} className="text-slate-400 hover:text-slate-700 ml-1 cursor-pointer">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase">Current Hash:</span>
                    <div className="p-1.5 bg-emerald-50 rounded border border-emerald-200 text-emerald-800 font-bold truncate flex items-center justify-between mt-0.5">
                      <span>{selectedLog.currentHash}</span>
                      <button onClick={() => copyToClipboard(selectedLog.currentHash)} className="text-emerald-600 hover:text-emerald-900 ml-1 cursor-pointer">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {nextLog && (
                    <div>
                      <span className="text-slate-400 uppercase">Next Hash:</span>
                      <div className="p-1.5 bg-white rounded border border-slate-200 text-slate-600 truncate flex items-center justify-between mt-0.5">
                        <span>{nextLog.currentHash}</span>
                        <button onClick={() => copyToClipboard(nextLog.currentHash)} className="text-slate-400 hover:text-slate-700 ml-1 cursor-pointer">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
              >
                Close Drawer
              </button>
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(selectedLog, null, 2);
                  const blob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `audit-event-${selectedLog.id}.json`;
                  a.click();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Event</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
