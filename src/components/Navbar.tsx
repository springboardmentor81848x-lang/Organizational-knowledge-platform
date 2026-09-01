import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Info,
  ChevronDown,
  Sun,
  Moon,
  Globe,
  Sparkles,
  Target,
  X,
  Settings,
  ArrowRight,
  TrendingUp,
  Award,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, AVAILABLE_LANGUAGES } from '../context/LanguageContext';
import api from '../services/api';
import { NotificationItem } from '../types';
import { BotanicalNavAccents } from './ui/BotanicalNavAccents';

const INITIAL_MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 101,
    user_id: 1,
    title: 'New Skill Gap Identified',
    message: 'Kubernetes Orchestration gap detected against Cloud Lead Architect profile.',
    type: 'Gap Alert',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 102,
    user_id: 1,
    title: 'Training Module Assigned',
    message: 'You have been enrolled into "Advanced Microservices Architecture & Istio".',
    type: 'Training Assigned',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 103,
    user_id: 1,
    title: 'Mentorship Session Confirmed',
    message: '1-on-1 Mentorship session with Marcus Vance confirmed for tomorrow at 10:00 AM.',
    type: 'Mentorship Reminder',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 104,
    user_id: 1,
    title: 'Skill Assessment Available',
    message: 'Quarterly Cloud Architecture & Security assessment is now ready to take.',
    type: 'Assessment Reminder',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: 105,
    user_id: 1,
    title: 'Learning Milestone Reached',
    message: 'Congratulations! You completed Module 3 of Cloud DevOps Mastery.',
    type: 'Learning Achievement',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
  },
];

const TARGET_ROLE_OPTIONS = [
  { id: 1, title: 'Cloud & DevOps Lead Architect', dept: 'Cloud Infrastructure', readiness: 78 },
  { id: 2, title: 'Principal AI Scientist', dept: 'AI & Data Science', readiness: 84 },
  { id: 3, title: 'Senior Full-Stack Lead', dept: 'Software Engineering', readiness: 91 },
  { id: 4, title: 'Cybersecurity Operations Specialist', dept: 'Information Security', readiness: 72 },
  { id: 5, title: 'Lead Product Designer', dept: 'Product Design', readiness: 88 },
];

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_MOCK_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(5);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showTargetRoleMenu, setShowTargetRoleMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const targetRoleRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success && res.data.data?.length > 0) {
        setNotifications(res.data.data);
        setUnreadCount(typeof res.data.unread_count === 'number' ? res.data.unread_count : res.data.data.filter((n: NotificationItem) => !n.is_read).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Automatically close all dropdowns when navigating to another route
  useEffect(() => {
    setShowNotifications(false);
    setShowUserMenu(false);
    setShowLangMenu(false);
    setShowTargetRoleMenu(false);
  }, [location.pathname, location.search]);

  // Handle outside click detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(event.target as Node)
      ) {
        setShowLangMenu(false);
      }
      if (
        targetRoleRef.current &&
        !targetRoleRef.current.contains(event.target as Node)
      ) {
        setShowTargetRoleMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowUserMenu(false);
        setShowLangMenu(false);
        setShowTargetRoleMenu(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const markAllRead = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Instantly update local state to 0 for responsive UI
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await api.put('/notifications/all/read');
    } catch (err) {
      console.error('Error marking notifications as read on server:', err);
    }
  };

  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.is_read) {
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await api.put(`/notifications/${n.id}/read`);
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }

    if (n.type === 'Training Assigned' || n.type === 'Training Reminder' || n.type === 'Learning Achievement' || n.type === 'Recommendation Alert') {
      navigate('/trainings');
    } else if (n.type === 'Gap Alert' || n.title?.toLowerCase().includes('gap')) {
      navigate('/knowledge-gaps');
    } else if (n.type === 'Mentorship Reminder' || n.title?.toLowerCase().includes('mentor') || n.title?.toLowerCase().includes('session')) {
      navigate('/mentorship');
    } else if (n.type === 'Assessment Reminder' || n.title?.toLowerCase().includes('assessment')) {
      navigate('/assessments');
    } else if (
      n.title?.toLowerCase().includes('leave') ||
      n.message?.toLowerCase().includes('leave')
    ) {
      navigate('/leaves');
    } else {
      navigate('/notifications');
    }

    setShowNotifications(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/gaps?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const currentLangObj = AVAILABLE_LANGUAGES.find((l) => l.code === language) || AVAILABLE_LANGUAGES[0];
  const activeTargetRole = user?.employee?.target_role || 'Cloud & DevOps Lead Architect';
  const activeReadiness = user?.employee?.readiness_score ?? 78;

  // Safe display-name resolution: AuthContext already normalizes user.full_name
  // on login/refresh, but resolve defensively here too in case of a stale
  // cached user object or an unexpected payload shape.
  const FALLBACK_DISPLAY_NAME = 'Girish M';
  const rawUser = user as any;
  const displayName: string =
    rawUser?.full_name ||
    rawUser?.name ||
    [rawUser?.first_name || rawUser?.firstName, rawUser?.last_name || rawUser?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    [rawUser?.employee?.first_name, rawUser?.employee?.last_name].filter(Boolean).join(' ').trim() ||
    rawUser?.email ||
    FALLBACK_DISPLAY_NAME;
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-20 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04),0_4px_10px_rgba(13,148,136,0.03)] relative">
      {/* Subtle organic light-blur background gradients & leaf accents */}
      <div className="absolute -top-10 left-1/4 w-80 h-24 bg-gradient-to-r from-teal-400/10 via-emerald-400/10 to-transparent rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-0 right-1/3 w-28 h-12 pointer-events-none opacity-30">
        <BotanicalNavAccents variant="top-leaf" className="w-full h-full" />
      </div>

      {/* 1. SEARCH BAR (Input & Clear Action) */}
      <form onSubmit={handleSearchSubmit} className="relative w-80 group z-10">
        {/* Subtle plant foliage sprout accent resting atop search box border */}
        <BotanicalNavAccents
          variant="border-sprout"
          className="absolute -top-3.5 right-6 w-9 h-6 opacity-45 group-hover:opacity-85 transition-opacity duration-200 pointer-events-none"
        />

        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0F766E] group-focus-within:text-[#0A7A74] transition-colors" />
          <input
            id="navbar-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full h-9.5 bg-[#F1F5F9]/90 hover:bg-[#F1F5F9] border border-teal-100 hover:border-teal-200/90 rounded-2xl pl-10 pr-9 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#0A7A74] focus:bg-white focus:ring-2 focus:ring-[#0A7A74]/15 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-xs transition-all font-medium"
          />
          {searchQuery.length > 0 && (
            <button
              id="navbar-search-clear-btn"
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F172A] p-0.5 rounded-full hover:bg-slate-200/80 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Right Navbar Controls */}
      <div className="flex items-center gap-3 relative z-10">
        {/* 2. LANGUAGE DROPDOWN (`English ∨`) */}
        <div className="relative" ref={langMenuRef}>
          <button
            id="navbar-language-btn"
            type="button"
            onClick={() => {
              setShowLangMenu((prev) => !prev);
              setShowNotifications(false);
              setShowUserMenu(false);
              setShowTargetRoleMenu(false);
            }}
            className="h-9 px-3 text-xs font-bold text-indigo-900 bg-indigo-50/90 hover:bg-indigo-100 rounded-xl border border-indigo-200/90 transition-all flex items-center gap-2 cursor-pointer shadow-2xs shrink-0"
            title="Select Language"
          >
            <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{currentLangObj.nativeName}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-indigo-500 transition-transform duration-150 ${showLangMenu ? 'rotate-180' : ''}`} />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Select Language
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between font-medium transition-colors cursor-pointer ${
                      language === lang.code
                        ? 'bg-indigo-50 text-indigo-800 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">{lang.name}</span>
                      {language === lang.code && <Check className="w-3 h-3 text-indigo-600" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. THEME TOGGLE (`🌙` Moon Icon / `☀️` Sun Icon) */}
        <button
          id="navbar-theme-toggle-btn"
          type="button"
          onClick={toggleTheme}
          className="h-9 w-9 text-[#0F172A] hover:text-[#0F766E] hover:bg-emerald-50/80 bg-white/90 rounded-xl transition-all border border-slate-200/80 flex items-center justify-center cursor-pointer shadow-2xs shrink-0"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-700" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
        </button>

        {/* 4. NOTIFICATIONS (`🔔` Bell with '5' Badge & Mark as Read) */}
        <div className="relative" ref={notificationRef}>
          <button
            id="navbar-notifications-btn"
            type="button"
            onClick={() => {
              setShowNotifications((prev) => !prev);
              setShowUserMenu(false);
              setShowLangMenu(false);
              setShowTargetRoleMenu(false);
            }}
            className="h-9 w-9 text-[#0F172A] hover:text-[#0F766E] hover:bg-slate-100 bg-white/90 rounded-xl border border-slate-200/80 relative transition-colors focus:outline-none flex items-center justify-center shadow-2xs cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-600 text-white font-black text-[10px] rounded-full flex items-center justify-center animate-pulse shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-84 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
                <span className="text-xs font-bold text-[#0F172A] flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-[#0F766E]" />
                  Notifications ({unreadCount} unread)
                </span>
                {unreadCount > 0 && (
                  <button
                    id="navbar-notifications-mark-read-btn"
                    type="button"
                    onClick={markAllRead}
                    className="text-[11px] text-[#0F766E] hover:underline font-bold cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-100/80 ${
                        !n.is_read ? 'bg-emerald-50/50' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {n.type === 'Gap Alert' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        ) : n.type === 'Training Assigned' ? (
                          <BookOpen className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                        ) : n.type === 'Learning Achievement' ? (
                          <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-bold text-[#0F172A] truncate">{n.title}</p>
                            {!n.is_read && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">
                            {new Date(n.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50/90 text-center">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/notifications');
                    setShowNotifications(false);
                  }}
                  className="text-[11px] font-bold text-[#0F766E] hover:text-emerald-800 hover:underline cursor-pointer"
                >
                  View full notifications center →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5A. TARGET ROLE DROPDOWN ("Cloud & DevOps Lead...", Readiness %) */}
        <div className="relative hidden lg:block" ref={targetRoleRef}>
          <button
            id="navbar-target-role-btn"
            type="button"
            onClick={() => {
              setShowTargetRoleMenu((prev) => !prev);
              setShowNotifications(false);
              setShowUserMenu(false);
              setShowLangMenu(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-50/90 hover:bg-teal-100/90 border border-teal-200/90 text-[#0F766E] text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Active Target Career Role & Readiness"
          >
            <Target className="w-3.5 h-3.5 text-[#0F766E]" />
            <span className="text-[11px] text-[#0F766E] font-extrabold max-w-[140px] truncate">
              {activeTargetRole}
            </span>
            <span className="text-[10px] bg-teal-200/80 text-teal-950 font-black px-1.5 py-0.2 rounded-md">
              {activeReadiness}%
            </span>
            <ChevronDown className={`w-3 h-3 text-[#0F766E] transition-transform duration-150 ${showTargetRoleMenu ? 'rotate-180' : ''}`} />
          </button>

          {showTargetRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1.5 border-b border-slate-100">
                <p className="text-[11px] font-black text-[#0F172A] uppercase tracking-wider flex items-center justify-between">
                  <span>Target Career Path</span>
                  <span className="text-[#0F766E] font-bold">{activeReadiness}% Match</span>
                </p>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${activeReadiness}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1 pt-1 max-h-60 overflow-y-auto custom-scrollbar">
                {TARGET_ROLE_OPTIONS.map((r) => {
                  const isSelected = activeTargetRole === r.title;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setShowTargetRoleMenu(false);
                        navigate('/target-roles');
                      }}
                      className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-teal-50 border border-teal-300 text-[#0F766E] font-bold'
                          : 'hover:bg-slate-50 text-[#0F172A]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate">{r.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{r.dept}</p>
                      </div>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-teal-100 text-[#0F766E] shrink-0">
                        {r.readiness}%
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-1.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowTargetRoleMenu(false);
                    navigate('/target-roles');
                  }}
                  className="w-full text-center py-1.5 text-xs font-bold text-[#0F766E] hover:bg-teal-50 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Explore Career Progression Matrix</span>
                  <ArrowRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 6. PROFILE MENU (`Alex Morgan ∨` / User Avatar) */}
        <div className="relative" ref={userMenuRef}>
          <button
            id="navbar-profile-menu-btn"
            type="button"
            onClick={() => {
              setShowUserMenu((prev) => !prev);
              setShowNotifications(false);
              setShowLangMenu(false);
              setShowTargetRoleMenu(false);
            }}
            className="h-9 flex items-center gap-2 px-2.5 rounded-xl border border-slate-200/80 bg-white/90 hover:bg-slate-50 transition-colors focus:outline-none shadow-2xs cursor-pointer max-w-[220px]"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold flex items-center justify-center text-[10px] shrink-0 overflow-hidden">
              {user?.employee?.photo_url ? (
                <img
                  src={user.employee.photo_url}
                  alt="User Avatar"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-avatar.svg';
                  }}
                  className="w-full h-full object-cover"
                />
              ) : (
                avatarInitial
              )}
            </div>
            <div className="text-left hidden sm:block overflow-hidden min-w-0">
              <p className="text-xs font-bold text-[#0F172A] leading-tight truncate max-w-[110px]">
                {displayName}
              </p>
              <p className="text-[9px] text-[#0F766E] font-bold leading-none truncate max-w-[110px] capitalize">
                {user?.role ? user.role.replace('ROLE_', '').toLowerCase() : 'employee'}
              </p>
              {(user as any)?.employee_code && (
                <p className="text-[8px] text-slate-400 font-mono leading-none truncate max-w-[110px] mt-0.5">
                  ID: {(user as any).employee_code}
                </p>
              )}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 ml-0.5 transition-transform duration-150 ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-1.5 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-2.5">
                <p className="text-xs font-bold text-[#0F172A]">Signed in as</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'alex.morgan@okgip.org'}</p>
              </div>
              <div className="py-1 space-y-0.5">
                <button
                  id="profile-menu-view-profile"
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#0F172A] hover:bg-slate-100 rounded-xl flex items-center gap-2 font-medium cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#0F766E]" />
                  View Profile
                </button>
                <button
                  id="profile-menu-account-settings"
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#0F172A] hover:bg-slate-100 rounded-xl flex items-center gap-2 font-medium cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-teal-600" />
                  Account Settings
                </button>
                <button
                  id="profile-menu-platform-tour"
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    window.dispatchEvent(new CustomEvent('open-okgip-intro'));
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#0F766E] hover:bg-emerald-50 rounded-xl flex items-center gap-2 font-bold cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
                  Platform Tour
                </button>
                <button
                  id="profile-menu-logout"
                  type="button"
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 font-bold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


