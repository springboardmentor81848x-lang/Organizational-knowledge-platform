import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { BotanicalShapes } from './BotanicalShapes';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  badge?: string;
  color?: 'teal' | 'emerald' | 'amber' | 'blue' | 'rose';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  trend = 'up',
  subtitle,
  badge,
  color = 'teal',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-teal-400' : ''
      }`}
    >
      {/* Subtle Botanical Corner Decoration */}
      <BotanicalShapes variant="card-corner" opacity={0.35} />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100/80 text-teal-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Icon className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {title}
            </p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {value}
            </h3>
          </div>
        </div>

        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
            {badge}
          </span>
        )}
      </div>

      {(change || subtitle) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs relative z-10">
          {change && (
            <span
              className={`inline-flex items-center gap-1 font-bold ${
                trend === 'up'
                  ? 'text-teal-700'
                  : trend === 'down'
                  ? 'text-rose-600'
                  : 'text-slate-600'
              }`}
            >
              {trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
              {trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
              {change}
            </span>
          )}
          {subtitle && (
            <span className="text-slate-400 font-medium text-[11px] ml-auto">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
