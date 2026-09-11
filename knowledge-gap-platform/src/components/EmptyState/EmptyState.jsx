import React from 'react';
import { SearchX } from 'lucide-react';

export const EmptyState = ({
  title = 'No records found',
  description = 'Try adjusting your search query or filter options.',
  icon: Icon = SearchX,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-3 text-slate-400">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">{description}</p>
      {action}
    </div>
  );
};
