import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Clock, Award, BookOpen, UserCheck, MessageSquare, AlertCircle } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../common/Badge';

export const NotificationsDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const dropdownRef = useRef(null);

  const tabs = ['All', 'Assessment reminders', 'New course recommendations', 'Mentor session updates', 'Learning progress', 'System announcements'];

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filtered = activeTab === 'All'
    ? notifications
    : notifications.filter(n => n.category === activeTab);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Assessment reminders':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'New course recommendations':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'Mentor session updates':
        return <UserCheck className="w-4 h-4 text-purple-500" />;
      case 'Learning progress':
        return <Award className="w-4 h-4 text-emerald-500" />;
      case 'System announcements':
        return <MessageSquare className="w-4 h-4 text-rose-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition"
        title="Notification Center"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-4 px-1 text-[10px] font-extrabold text-white bg-rose-600 rounded-full border-2 border-white dark:border-slate-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Notification Center
              </h4>
              {unreadCount > 0 && (
                <Badge variant="danger">{unreadCount} New</Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex space-x-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap transition ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab === 'All' ? 'All' : tab.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.length > 0 ? (
              filtered.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3.5 flex items-start space-x-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition ${
                    !n.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                    {getCategoryIcon(n.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center space-x-0.5 shrink-0 ml-1">
                        <Clock className="w-2.5 h-2.5 mr-0.5" />
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No notifications in this category.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
