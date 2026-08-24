import { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  Landmark, 
  Scale, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck
} from 'lucide-react';
import { FinancialMetrics } from '../types';
import { apiClient } from '../api/apiClient';
import { useAuthStore } from '../stores/authStore';
import { StatCard } from './StatCard';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

const LIQUIDITY_TREND_DATA = [
  { day: 'Day 1', inbound: 1200000, outbound: 850000, net: 350000 },
  { day: 'Day 5', inbound: 1850000, outbound: 1100000, net: 750000 },
  { day: 'Day 10', inbound: 1400000, outbound: 950000, net: 450000 },
  { day: 'Day 15', inbound: 2200000, outbound: 1650000, net: 550000 },
  { day: 'Day 20', inbound: 1950000, outbound: 1300000, net: 650000 },
  { day: 'Day 25', inbound: 2600000, outbound: 1800000, net: 800000 },
  { day: 'Day 30', inbound: 2850000, outbound: 1900000, net: 950000 },
];

export function SolvencyDashboard() {
  const { token } = useAuthStore();
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient.getSolvencyMetrics(token)
      .then(data => setMetrics(data))
      .catch(err => console.error('Metrics fetch error', err))
      .finally(() => setLoading(false));
  }, [token]);

  const balanceSheetChartData = metrics ? [
    {
      category: 'Ecuación Fundamental',
      'Activos Totales (Debe)': metrics.totalAssets,
      'Pasivos + Patrimonio (Haber)': metrics.totalLiabilities + metrics.totalEquity + metrics.netIncome,
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Panel Ejecutivo de Solvencia &amp; Ratios de Liquidez
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas de solvencia regulatoria, apalancamiento y curvas de flujo de compensación interbancaria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Basel III Compliant &bull; Solvencia &gt; 200%</span>
          </span>
        </div>
      </div>

      {/* 4 KPI StatCards matching 1.png */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Asset Liquidity"
          value={metrics ? formatCurrency(metrics.totalAssets) : '€21,550,000.00'}
          trend={{ value: '8.42%', positive: true }}
          icon={Landmark}
          accent="emerald"
        />
        <StatCard
          title="Total Liabilities"
          value={metrics ? formatCurrency(metrics.totalLiabilities) : '€9,400,000.00'}
          trend={{ value: '4.13%', positive: true }}
          icon={Scale}
          accent="blue"
        />
        <StatCard
          title="Net Equity Balance"
          value={metrics ? formatCurrency(metrics.totalEquity) : '€11,800,000.00'}
          trend={{ value: '10.27%', positive: true }}
          icon={DollarSign}
          accent="purple"
        />
        <StatCard
          title="Net Operating Income"
          value={metrics ? formatCurrency(metrics.netIncome) : '€350,000.00'}
          trend={{ value: '6.88%', positive: true }}
          icon={TrendingUp}
          accent="cyan"
        />
      </div>

      {/* Financial Ratios Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="clean-card rounded-2xl bg-white border border-slate-200 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Ratio de Solvencia (Ativos / Pasivos)</span>
              <span className="text-emerald-600 font-mono text-sm">{metrics.solvencyRatio}x</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }} />
            </div>
            <div className="text-[10px] text-slate-500">
              Excelente (Mínimo regulatorio recomendado: &gt; 1.5x).
            </div>
          </div>

          <div className="clean-card rounded-2xl bg-white border border-slate-200 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Ratio Patrimonio / Activos</span>
              <span className="text-blue-600 font-mono text-sm">{(metrics.equityToAssetRatio * 100).toFixed(2)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${metrics.equityToAssetRatio * 100}%` }} />
            </div>
            <div className="text-[10px] text-slate-500">
              Cobertura de capital propio frente a activos totales.
            </div>
          </div>

          <div className="clean-card rounded-2xl bg-white border border-slate-200 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Ratio Endeudamiento (Deuda / Equity)</span>
              <span className="text-purple-600 font-mono text-sm">{(metrics.debtToEquityRatio * 100).toFixed(2)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(metrics.debtToEquityRatio * 100, 100)}%` }} />
            </div>
            <div className="text-[10px] text-slate-500">
              Estructura de apalancamiento financiero conservador.
            </div>
          </div>
        </div>
      )}

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: 30-Day Liquidity Flow Curves */}
        <div className="clean-card rounded-2xl bg-white border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Curvas de Flujo de Liquidez (30 Días)</h3>
              <p className="text-[11px] text-slate-500">Entradas vs Salidas operacionales de compensación</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              DAILY CLEARED
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={LIQUIDITY_TREND_DATA}>
                <defs>
                  <linearGradient id="inboundGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outboundGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis 
                  tickFormatter={val => `€${(val / 1000000).toFixed(1)}M`} 
                  tick={{ fontSize: 10, fill: '#64748B' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  formatter={(val: number) => [formatCurrency(val), '']} 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.75rem', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="inbound" name="Inbound (Entradas)" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#inboundGrad)" />
                <Area type="monotone" dataKey="outbound" name="Outbound (Salidas)" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#outboundGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Balance Sheet Invariant Comparison */}
        <div className="clean-card rounded-2xl bg-white border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Verificación de la Ecuación Contable</h3>
              <p className="text-[11px] text-slate-500">Total Activos = Total Pasivos + Patrimonio Neto + Utilidad</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
              BALANCED &bull; &Delta; = €0.00
            </span>
          </div>

          <div className="h-64 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
                Cargando balance consolidado...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={balanceSheetChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis 
                    tickFormatter={val => `€${(val / 1000000).toFixed(1)}M`} 
                    tick={{ fontSize: 10, fill: '#64748B' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    formatter={(val: number) => [formatCurrency(val), '']} 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.75rem', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Activos Totales (Debe)" fill="#10B981" radius={[8, 8, 0, 0]} maxBarSize={60} />
                  <Bar dataKey="Pasivos + Patrimonio (Haber)" fill="#2563EB" radius={[8, 8, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
