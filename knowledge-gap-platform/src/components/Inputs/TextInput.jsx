import React from 'react';

export const TextInput = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  required = false,
  className = '',
  name,
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <Icon className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        )}
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full ${
            Icon ? 'pl-10' : 'pl-3.5'
          } pr-3.5 py-2 text-xs md:text-sm bg-slate-50 dark:bg-slate-800/80 border ${
            error
              ? 'border-rose-500'
              : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500'
          } rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition shadow-inner`}
        />
      </div>
      {error && <p className="text-[11px] font-semibold text-rose-500">{error}</p>}
    </div>
  );
};
