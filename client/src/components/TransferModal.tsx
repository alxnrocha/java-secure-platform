import { useState, useEffect, useId } from 'react';
import { 
  ShieldCheck, 
  X, 
  Landmark, 
  Scale, 
  Fingerprint, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Account, CreateTransactionPayload } from '../types';
import { apiClient } from '../api/apiClient';
import { useAuthStore } from '../stores/authStore';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TransferModal({ isOpen, onClose, onSuccess }: TransferModalProps) {
  const { currentUser, token } = useAuthStore();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const rawId = useId();
  const defaultRef = `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${rawId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || '0001'}`;

  // Form State
  const [debitAccountCode, setDebitAccountCode] = useState('1000');
  const [creditAccountCode, setCreditAccountCode] = useState('2000');
  const [amountStr, setAmountStr] = useState('250000.00');
  const [refNumber, setRefNumber] = useState(defaultRef);
  const [memo, setMemo] = useState('Transfer from central liquidity vault to client deposit liabilities for settlement processing.');

  useEffect(() => {
    if (isOpen) {
      apiClient.getAccounts().then(accs => {
        setAccounts(accs);
        if (accs.length >= 2) {
          if (!debitAccountCode) setDebitAccountCode(accs[0].code);
          if (!creditAccountCode) setCreditAccountCode(accs[1].code);
        }
      });
      setError(null);
      setSuccess(false);
      setStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const parsedAmount = parseFloat(amountStr) || 0;
  const debitAccount = accounts.find(a => a.code === debitAccountCode);
  const creditAccount = accounts.find(a => a.code === creditAccountCode);

  // Calculate accounting effects
  const getAccountingEffect = (acc?: Account, entryType: 'DEBIT' | 'CREDIT' = 'DEBIT') => {
    if (!acc) return 'Modificar saldo';
    const isDebitNormal = acc.type === 'ASSET' || acc.type === 'EXPENSE';
    if (entryType === 'DEBIT') {
      return isDebitNormal ? `Increase ${acc.type}` : `Decrease ${acc.type}`;
    } else {
      return isDebitNormal ? `Decrease ${acc.type}` : `Increase ${acc.type}`;
    }
  };

  const isInvariantBalanced = parsedAmount > 0 && debitAccountCode !== creditAccountCode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (parsedAmount <= 0) {
        setError('El importe de la transferencia debe ser mayor a €0.00.');
        return;
      }
      if (debitAccountCode === creditAccountCode) {
        setError('La cuenta de débito y crédito deben ser distintas.');
        return;
      }
      setError(null);
      setStep(2);
      return;
    }

    // Step 2 Commit
    setLoading(true);
    setError(null);
    try {
      const payload: CreateTransactionPayload = {
        description: memo.trim() || `Transferencia ${refNumber}`,
        currency: 'EUR',
        entries: [
          {
            accountCode: debitAccountCode,
            entryType: 'DEBIT',
            amount: parsedAmount,
            description: `Débito a ${debitAccount?.name}`,
          },
          {
            accountCode: creditAccountCode,
            entryType: 'CREDIT',
            amount: parsedAmount,
            description: `Crédito a ${creditAccount?.name}`,
          },
        ],
      };

      await apiClient.postTransaction(payload, currentUser, token);
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Error al autorizar la transacción contable.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header matching 2.png */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                New Atomic Ledger Transaction &bull; Double-Entry Transfer
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator matching 2.png */}
        <div className="px-8 pt-5 pb-2 flex items-center justify-center">
          <div className="flex items-center gap-8 max-w-md w-full">
            {/* Step 1 */}
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 1 ? 'bg-blue-600 text-white shadow-xs' : 'bg-emerald-600 text-white'
              }`}>
                {step === 2 ? '✓' : '1'}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Transaction Details</div>
                <div className="text-[10px] text-slate-400">Enter transfer information</div>
              </div>
            </div>

            <div className="flex-1 h-px bg-slate-200" />

            {/* Step 2 */}
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 2 ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
                2
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Review & Authorize</div>
                <div className="text-[10px] text-slate-400">Verify and commit transaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Transacción atómica confirmada y registrada en el libro mayor con aislamiento SERIALIZABLE.</span>
            </div>
          )}

          {/* Account Selectors Row matching 2.png */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source Account (DEBIT) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Source Account (DEBIT)
              </label>
              <div className="relative">
                <select
                  value={debitAccountCode}
                  onChange={e => setDebitAccountCode(e.target.value)}
                  disabled={step === 2 || loading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500 appearance-none pr-8 cursor-pointer"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.code}>
                      {acc.code} - {acc.name} ({acc.type} • Saldo: {formatCurrency(acc.balance)})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Landmark className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {debitAccount ? `${debitAccount.name} • ${debitAccount.type}` : 'Asset / Operational Treasury'}
              </div>
            </div>

            {/* Destination Account (CREDIT) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Destination Account (CREDIT)
              </label>
              <div className="relative">
                <select
                  value={creditAccountCode}
                  onChange={e => setCreditAccountCode(e.target.value)}
                  disabled={step === 2 || loading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500 appearance-none pr-8 cursor-pointer"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.code}>
                      {acc.code} - {acc.name} ({acc.type} • Saldo: {formatCurrency(acc.balance)})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Landmark className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {creditAccount ? `${creditAccount.name} • ${creditAccount.type}` : 'Liability / Client Deposits'}
              </div>
            </div>
          </div>

          {/* Currency Amount and Reference Row matching 2.png */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Currency & Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Currency & Amount
              </label>
              <div className="flex rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:border-blue-500 focus-within:bg-white">
                <span className="px-3.5 py-2.5 text-xs font-bold text-slate-500 bg-slate-100/80 border-r border-slate-200 flex items-center">
                  €
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="250,000.00"
                  value={amountStr}
                  onChange={e => setAmountStr(e.target.value)}
                  disabled={step === 2 || loading}
                  className="w-full bg-transparent px-3 py-2 text-xs font-bold text-slate-900 font-mono-numbers focus:outline-none"
                  required
                />
                <span className="px-3.5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100/50 border-l border-slate-200 flex items-center">
                  EUR
                </span>
              </div>
            </div>

            {/* Transaction Reference */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Transaction Reference</label>
                <span className="text-[10px] text-slate-400 font-mono">{refNumber.length} / 64</span>
              </div>
              <input
                type="text"
                value={refNumber}
                onChange={e => setRefNumber(e.target.value)}
                disabled={step === 2 || loading}
                maxLength={64}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                required
              />
              <div className="text-[10px] text-slate-400 mt-1">Unique reference for this atomic transfer</div>
            </div>
          </div>

          {/* Forensic Memo matching 2.png */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Forensic Memo</label>
              <span className="text-[10px] text-slate-400 font-mono">{memo.length} / 256</span>
            </div>
            <textarea
              rows={2}
              value={memo}
              onChange={e => setMemo(e.target.value)}
              disabled={step === 2 || loading}
              maxLength={256}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              placeholder="Motivo o justificación de auditoría de la transferencia..."
            />
          </div>

          {/* Live Double-Entry Accounting Preview matching 2.png */}
          <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Double-Entry Accounting Preview</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Preview is live
              </span>
            </div>

            {/* Debit Preview Line */}
            <div className="p-3 rounded-lg bg-white border-l-4 border-l-emerald-500 border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  DEBIT
                </span>
                <div>
                  <div className="font-bold text-slate-900">
                    Account {debitAccountCode} - {debitAccount?.name || 'Cuenta Débito'}
                  </div>
                  <div className="text-[11px] text-slate-500">{debitAccount?.type}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono-numbers font-bold text-emerald-600">
                  +{formatCurrency(parsedAmount)}
                </div>
                <div className="text-[10px] text-slate-500">{getAccountingEffect(debitAccount, 'DEBIT')}</div>
              </div>
            </div>

            {/* Credit Preview Line */}
            <div className="p-3 rounded-lg bg-white border-l-4 border-l-blue-500 border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  CREDIT
                </span>
                <div>
                  <div className="font-bold text-slate-900">
                    Account {creditAccountCode} - {creditAccount?.name || 'Cuenta Crédito'}
                  </div>
                  <div className="text-[11px] text-slate-500">{creditAccount?.type}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono-numbers font-bold text-blue-600">
                  +{formatCurrency(parsedAmount)}
                </div>
                <div className="text-[10px] text-slate-500">{getAccountingEffect(creditAccount, 'CREDIT')}</div>
              </div>
            </div>

            {/* Balanced Invariant Banner matching 2.png */}
            <div className={`p-3 rounded-lg border flex items-center justify-between ${
              isInvariantBalanced
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/60 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center gap-2.5">
                <Scale className={`w-4 h-4 ${isInvariantBalanced ? 'text-emerald-600' : 'text-rose-600'}`} />
                <div>
                  <div className="text-xs font-bold">
                    Ledger Balanced: &Delta; = €0.00
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Double-entry invariant maintained
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                isInvariantBalanced
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}>
                {isInvariantBalanced ? 'INVARIANT OK ✓' : 'UNBALANCED ✕'}
              </span>
            </div>
          </div>

          {/* Footer Actions matching 2.png */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>All transactions are cryptographically signed and immutable once committed.</span>
            </div>

            <div className="flex items-center gap-2.5">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Atrás
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              {step === 1 ? (
                <button
                  type="submit"
                  disabled={!isInvariantBalanced}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>Review Transfer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !isInvariantBalanced}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  <Fingerprint className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div>Authorize &amp; Commit Transaction (SERIALIZABLE)</div>
                    <div className="text-[9px] text-slate-300 font-normal">Requires biometric / session confirmation</div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
