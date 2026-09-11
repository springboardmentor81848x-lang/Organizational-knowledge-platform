import React from 'react';

export const Card = ({ children, className = '', hoverEffect = true, ...props }) => {
  return (
    <div
      className={`enterprise-card p-6 ${hoverEffect ? 'hover:-translate-y-1' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
    {children}
  </p>
);
