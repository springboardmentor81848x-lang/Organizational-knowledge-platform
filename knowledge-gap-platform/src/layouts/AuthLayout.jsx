import React from 'react';
import { Outlet } from 'react-router-dom';
import { Brain, Sparkles, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const AuthLayout = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 transition-colors relative overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="flex items-center justify-between px-6 py-4 z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-blue-600 shadow-md shadow-blue-500/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight block">
              SkillGaps AI
            </span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest">
              Enterprise Portal
            </span>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Form Center Box */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 animate-fade-in">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 z-10 flex items-center justify-center space-x-2">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
        <span>Enterprise OAuth 2.0 Security & SOC2 Compliant</span>
      </footer>
    </div>
  );
};
