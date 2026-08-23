import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  accent?: 'emerald' | 'cyan' | 'rose' | 'amber' | 'violet';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = 'emerald',
}: StatCardProps) {
  const accentStyles = {
    emerald: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      glow: 'shadow-[0_4px_24px_-4px_rgba(16,185,129,0.06)]',
    },
    cyan: {
      border: 'hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
      glow: 'shadow-[0_4px_24px_-4px_rgba(6,182,212,0.06)]',
    },
    rose: {
      border: 'hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]',
      glow: 'shadow-[0_4px_24px_-4px_rgba(244,63,94,0.06)]',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
      glow: 'shadow-[0_4px_24px_-4px_rgba(245,158,11,0.06)]',
    },
    violet: {
      border: 'hover:border-violet-500/40',
      iconBg: 'bg-violet-500/10 text-violet-400 border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]',
      glow: 'shadow-[0_4px_24px_-4px_rgba(139,92,246,0.06)]',
    },
  };

  const currentAccent = accentStyles[accent];

  return (
    <div className={`glass-panel p-5 rounded-xl border border-slate-800/80 transition-all duration-300 ${currentAccent.border} ${currentAccent.glow}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-white font-mono-numbers">{value}</h3>
          </div>
        </div>
        <div className={`p-2.5 rounded-lg border ${currentAccent.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-400 truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`flex items-center gap-1 font-mono font-medium ${
                trend.positive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend.positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
