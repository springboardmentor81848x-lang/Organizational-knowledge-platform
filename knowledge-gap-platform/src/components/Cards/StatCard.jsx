import React from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({ title, value, change, trend = 'up', icon: Icon, color = 'blue' }) => {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="enterprise-card p-5 flex items-center justify-between"
    >
      <div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
          {title}
        </span>
        <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>
        {change && (
          <div className="flex items-center space-x-1 mt-2">
            <span
              className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                trend === 'up'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
              }`}
            >
              {change}
            </span>
            <span className="text-[10px] text-slate-400">vs last cycle</span>
          </div>
        )}
      </div>
      {Icon && (
        <div className={`p-3.5 rounded-2xl ${colorStyles[color]} shrink-0 shadow-xs`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </motion.div>
  );
};
