import React from 'react';

export const ProgressBar = ({ progress = 0, color = 'bg-blue-600', showPercentage = false, height = 'h-2', className = '' }) => {
  const percentage = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      {showPercentage && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} ${color} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
