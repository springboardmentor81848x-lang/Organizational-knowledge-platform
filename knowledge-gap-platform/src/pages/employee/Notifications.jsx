import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useNotification } from '../../context/NotificationContext';
import { Bell, CheckCheck, Clock, AlertCircle, BookOpen, UserCheck, Award, MessageSquare } from 'lucide-react';

export const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotification();
  const [activeTab, setActiveTab] = useState('All');

  const categories = ['All', 'Assessment reminders', 'New course recommendations', 'Mentor session updates', 'Learning progress', 'System announcements'];

  const filtered = activeTab === 'All'
    ? notifications
    : notifications.filter(n => n.category === activeTab);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Bell className="w-6 h-6 text-blue-600" />
            <span>Notification Center</span>
          </h1>
          <p className="text-xs text-slate-500">
            Reminders, AI course suggestions, mentorship updates, and enterprise system announcements.
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-bold text-xs hover:bg-blue-100 transition self-start sm:self-auto"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      <Card className="divide-y divide-slate-100 dark:divide-slate-800 p-0">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => markAsRead(item.id)}
            className={`p-4 flex items-start space-x-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition ${
              !item.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
            }`}
          >
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h4>
                <span className="text-xs text-slate-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {item.timestamp}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {item.message}
              </p>
              <Badge variant="neutral" className="mt-2 text-[10px]">
                {item.category}
              </Badge>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};
