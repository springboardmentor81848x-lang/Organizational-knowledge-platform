import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  icon: Icon,
  actions,
  children,
}) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs relative overflow-hidden">
      {/* Subtle Botanical Glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-3.5 relative z-10">
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Icon className="w-6 h-6 stroke-[2]" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {title}
            </h1>
            {badge && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/70">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>

      {(actions || children) && (
        <div className="flex items-center flex-wrap gap-2.5 relative z-10">
          {actions}
          {children}
        </div>
      )}
    </div>
  );
};
