import React from 'react';
import { Menu, Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { GlobalElasticSearch } from '../search/GlobalElasticSearch';
import { NotificationsDropdown } from './NotificationsDropdown';
import { UserAvatar } from './UserAvatar';

export const TopNavbar = ({ onToggleSidebar }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { activeRole } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Left: Mobile Sidebar Trigger & Elastic Search */}
      <div className="flex items-center space-x-3 flex-1 min-w-0 pr-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <GlobalElasticSearch />
      </div>

      {/* Right Actions: Theme Toggle, Notifications, Role Badge, User Avatar */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Active Portal Badge */}
        <div className="hidden xl:flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-blue-500 animate-spin" />
          <span>{activeRole} Mode</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notification Center */}
        <NotificationsDropdown />

        {/* User Avatar & Profile Dropdown */}
        <UserAvatar />
      </div>
    </header>
  );
};
