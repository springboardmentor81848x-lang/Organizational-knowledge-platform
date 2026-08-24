import React from "react";

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  isPositive: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  label,
  value,
  trend,
  isPositive,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between space-y-3 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
          {icon}
        </div>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            isPositive
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          }`}
        >
          {trend}
        </span>
      </div>

      <div>
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
          {label}
        </span>
        <span className="text-2xl font-black text-white tracking-tight">
          {value}
        </span>
      </div>
    </div>
  );
};

export default StatsCard;