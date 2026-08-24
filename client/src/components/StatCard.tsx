import { LucideIcon, Info } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  infoTooltip?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
    period?: string;
  };
  accent?: 'emerald' | 'blue' | 'purple' | 'cyan' | 'rose' | 'amber';
  sparklineData?: number[];
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  accent = 'emerald',
}: StatCardProps) {
  const accentStyles = {
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600',
      sparklineColor: '#10B981',
      trendColor: 'text-emerald-600',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600',
      sparklineColor: '#2563EB',
      trendColor: 'text-blue-600',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600',
      sparklineColor: '#8B5CF6',
      trendColor: 'text-purple-600',
    },
    cyan: {
      iconBg: 'bg-cyan-50 text-cyan-600',
      sparklineColor: '#06B6D4',
      trendColor: 'text-cyan-600',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600',
      sparklineColor: '#E11D48',
      trendColor: 'text-rose-600',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600',
      sparklineColor: '#D97706',
      trendColor: 'text-amber-600',
    },
  };

  const currentAccent = accentStyles[accent];

  // SVG mock smooth sparkline path
  const sparklineSvgPath = accent === 'emerald' || accent === 'purple'
    ? 'M0,18 Q15,12 30,16 T60,8 T90,12 T120,4'
    : 'M0,16 Q15,20 30,14 T60,16 T90,8 T120,2';

  return (
    <div className="clean-card p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <span>{title}</span>
            <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" />
          </div>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${currentAccent.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 font-mono-numbers">
            {value}
          </h3>
        </div>
      </div>

      <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100">
        {trend ? (
          <div className="flex items-center gap-1 text-xs">
            <span className={`font-semibold ${currentAccent.trendColor}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </span>
            <span className="text-slate-500 text-[11px]">{trend.period || 'vs last 30 days'}</span>
          </div>
        ) : (
          <span className="text-slate-400 text-xs">Snapshot time</span>
        )}

        {/* Mini sparkline visualization */}
        <div className="w-24 h-6">
          <svg viewBox="0 0 120 24" className="w-full h-full overflow-visible">
            <path
              d={sparklineSvgPath}
              fill="none"
              stroke={currentAccent.sparklineColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
