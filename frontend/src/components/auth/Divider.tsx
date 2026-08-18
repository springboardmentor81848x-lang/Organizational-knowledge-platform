import React from "react";

interface DividerProps {
  text?: string;
}

export const Divider: React.FC<DividerProps> = ({ text = "OR" }) => {
  return (
    <div className="relative my-6 flex items-center justify-center w-full">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-200 dark:border-slate-800" />
      </div>
      <div className="relative bg-white/80 dark:bg-slate-900/80 px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        {text}
      </div>
    </div>
  );
};

export default Divider;