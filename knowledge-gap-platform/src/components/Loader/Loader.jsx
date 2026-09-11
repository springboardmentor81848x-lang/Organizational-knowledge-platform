import React from 'react';
import { Brain } from 'lucide-react';

export const Loader = ({ label = 'Loading Intelligence Data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center animate-pulse">
          <Brain className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
        <div className="absolute inset-0 rounded-2xl border-2 border-blue-600/30 animate-ping" />
      </div>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
};

export const SkeletonLoader = ({ count = 3 }) => {
  return (
    <div className="space-y-4 animate-pulse w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="h-20 bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl w-full"
        />
      ))}
    </div>
  );
};
