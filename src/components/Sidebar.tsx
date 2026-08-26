import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Award,
  BrainCircuit,
  GraduationCap,
  FileSpreadsheet,
  Bell,
  ShieldCheck,
  Sparkles,
  Settings,
  Trophy,
  MessageSquare,
  CalendarDays,
  CheckSquare,
  FileCheck,
  Medal,
  ShieldAlert,
  Compass,
  ChevronRight,
  Network,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BotanicalNavAccents } from './ui/BotanicalNavAccents';

interface NavLinkItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const rawRole = user?.role || 'Employee';

  // Safe display-name resolution — mirrors Navbar.tsx. AuthContext already
  // normalizes user.full_name, but `user.employee` here has no first_name/
  // last_name of its own (those live on `users`, not `employees`), so this
  // component previously read undefined fields and rendered "undefined undefined".
  const rawUser = user as any;
  const sidebarDisplayName: string =
    rawUser?.full_name ||
    rawUser?.name ||
    [rawUser?.first_name || rawUser?.firstName, rawUser?.last_name || rawUser?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    rawUser?.email ||
    'Employee';
  const sidebarAvatarInitial = sidebarDisplayName.charAt(0).toUpperCase();

  const isSystemAdmin = ['Admin', 'System Administrator', 'ROLE_ADMIN'].includes(rawRole);
  const isManager = ['Manager', 'Team Lead', 'ROLE_MANAGER'].includes(rawRole);
  const isHr = ['HR Specialist', 'HR', 'ROLE_HR'].includes(rawRole);
  const isDeptHead = ['Department Head', 'Dept Head', 'ROLE_DEPARTMENT_HEAD'].includes(rawRole);
  // L&D Admin (governance: training programs, org-wide mentorship approval)
  // and Mentor (peer guidance: own mentees, own sessions) are deliberately
  // separate checks now — previously merged into one `isLndMentor`, which
  // gave every mentor the same admin-level nav/permissions as L&D Admin.
  const isLndAdmin = ['L&D Admin / Mentor', 'L&D Admin', 'ROLE_LND_ADMIN'].includes(rawRole);
  const isMentor = ['Mentor', 'ROLE_MENTOR'].includes(rawRole);
  // Only a plain Employee (the default/else branch below) gets Learning
  // Path — Manager/HR/Admin/Dept Head/L&D Admin/Mentor all explicitly do not.
  const isEmployee = !isSystemAdmin && !isManager && !isHr && !isDeptHead && !isLndAdmin && !isMentor;

  // Soft botanical badge color presets
  const coreBadgeColor = 'bg-[#E6F7F5] text-[#086661] border-teal-200/90 shadow-2xs';
  const aiBadgeColor = 'bg-[#D1FAE5] text-[#065F46] border-[#059669]/35 shadow-2xs';
  const pathBadgeColor = 'bg-[#E8F8F5] text-[#0A7A74] border-teal-300/80 shadow-2xs';

  // Define exact navigation menus strictly per user role specification
  let mainLinks: NavLinkItem[] = [];
  let systemLinks: NavLinkItem[] = [];

  if (isSystemAdmin) {
    // 5. Admin Navigation Menu
    mainLinks = [
      {
        title: t('dashboard') || 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'User Management',
        path: '/users',
        icon: ShieldCheck,
      },
      {
        title: 'Employee Directory',
        path: '/employees',
        icon: Users,
      },
      {
        title: 'Departments',
        path: '/departments',
        icon: Building2,
      },
      {
        title: 'Skills Matrix',
        path: '/skills',
        icon: Award,
      },
      {
        title: 'Gap Intelligence',
        path: '/gaps',
        icon: BrainCircuit,
        badge: 'Core',
        badgeColor: coreBadgeColor,
      },
      {
        title: 'AI Training Insights',
        path: '/ai-recommendations',
        icon: Sparkles,
        badge: 'AI',
        badgeColor: aiBadgeColor,
      },
      {
        title: 'Training & Development',
        path: '/training',
        icon: GraduationCap,
      },
      {
        title: 'Mentorship Hub',
        path: '/mentorship',
        icon: Users,
      },
      {
        title: 'Community Groups',
        path: '/community-groups',
        icon: Network,
      },
      {
        title: 'Skill Assessments',
        path: '/assessments',
        icon: FileCheck,
      },
      {
        title: 'Leaderboard & Badges',
        path: '/leaderboard',
        icon: Trophy,
      },
      {
        title: 'Certificates',
        path: '/certificates',
        icon: Medal,
      },
      {
        title: 'Task Assignment',
        path: '/tasks',
        icon: CheckSquare,
      },
      {
        title: 'Leave Management',
        path: '/leave',
        icon: CalendarDays,
      },
      {
        title: 'Reports & Analytics',
        path: '/reports',
        icon: FileSpreadsheet,
      },
    ];

    systemLinks = [
      {
        title: 'In-App Messaging',
        path: '/messages',
        icon: MessageSquare,
      },
      {
        title: t('notifications') || 'Notifications',
        path: '/notifications',
        icon: Bell,
      },
      {
        title: t('settings') || 'Settings',
        path: '/settings',
        icon: Settings,
      },
      {
        title: t('audit_logs') || 'Audit Logs',
        path: '/audit-logs',
        icon: ShieldAlert,
      },
    ];
  } else if (isManager) {
    // 2. Manager Navigation Menu
    mainLinks = [
      {
        title: t('dashboard') || 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Employee Directory',
        path: '/employees',
        icon: Users,
      },
      {
        title: 'Departments',
        path: '/departments',
        icon: Building2,
      },
      {
        title: 'Skills Matrix',
        path: '/skills',
        icon: Award,
      },
      {
        title: 'Gap Intelligence',
        path: '/gaps',
        icon: BrainCircuit,
        badge: 'Core',
        badgeColor: coreBadgeColor,
      },
      {
        title: 'AI Training Insights',
        path: '/ai-recommendations',
        icon: Sparkles,
        badge: 'AI',
        badgeColor: aiBadgeColor,
      },
      {
        title: 'Training & Development',
        path: '/training',
        icon: GraduationCap,
      },
      {
        title: 'Mentorship Hub',
        path: '/mentorship',
        icon: Users,
      },
      {
        title: 'Community Groups',
        path: '/community-groups',
        icon: Network,
      },
      {
        title: 'Skill Assessments',
        path: '/assessments',
        icon: FileCheck,
      },
      {
        title: 'Leaderboard & Badges',
        path: '/leaderboard',
        icon: Trophy,
      },
      {
        title: 'Certificates',
        path: '/certificates',
        icon: Medal,
      },
      {
        title: 'Task Assignment',
        path: '/tasks',
        icon: CheckSquare,
      },
      {
        title: 'Leave Management',
        path: '/leave',
        icon: CalendarDays,
      },
      {
        title: 'Reports & Analytics',
        path: '/reports',
        icon: FileSpreadsheet,
      },
    ];

    systemLinks = [
      {
        title: 'In-App Messaging',
        path: '/messages',
        icon: MessageSquare,
      },
      {
        title: t('notifications') || 'Notifications',
        path: '/notifications',
        icon: Bell,
      },
    ];
  } else if (isHr) {
    // 3. HR Navigation Menu
    mainLinks = [
      {
        title: t('dashboard') || 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Skills Matrix',
        path: '/skills',
        icon: Award,
      },
      {
        title: 'Gap Intelligence',
        path: '/gaps',
        icon: BrainCircuit,
        badge: 'Core',
        badgeColor: coreBadgeColor,
      },
      {
        title: 'AI Training Insights',
        path: '/ai-recommendations',
        icon: Sparkles,
        badge: 'AI',
        badgeColor: aiBadgeColor,
      },
      {
        title: 'Training & Development',
        path: '/training',
        icon: GraduationCap,
      },
      {
        title: 'Mentorship Hub',
        path: '/mentorship',
        icon: Users,
      },
      {
        title: 'Community Groups',
        path: '/community-groups',
        icon: Network,
      },
      {
        title: 'Skill Assessments',
        path: '/assessments',
        icon: FileCheck,
      },
      {
        title: 'Leaderboard & Badges',
        path: '/leaderboard',
        icon: Trophy,
      },
      {
        title: 'Certificates',
        path: '/certificates',
        icon: Medal,
      },
      {
        title: 'Task Assignment',
        path: '/tasks',
        icon: CheckSquare,
      },
      {
        title: 'Leave Management',
        path: '/leave',
        icon: CalendarDays,
      },
    ];

    systemLinks = [
      {
        title: 'In-App Messaging',
        path: '/messages',
        icon: MessageSquare,
      },
      {
        title: t('notifications') || 'Notifications',
        path: '/notifications',
        icon: Bell,
      },
    ];
  } else if (isDeptHead) {
    // 4. Dept Head Navigation Menu
    mainLinks = [
      {
        title: t('dashboard') || 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Skills Matrix',
        path: '/skills',
        icon: Award,
      },
      {
        title: 'Gap Intelligence',
        path: '/gaps',
        icon: BrainCircuit,
        badge: 'Core',
        badgeColor: coreBadgeColor,
      },
      {
        title: 'AI Training Insights',
        path: '/ai-recommendations',
        icon: Sparkles,
        badge: 'AI',
        badgeColor: aiBadgeColor,
      },
      {
        title: 'Training & Development',
        path: '/training',
        icon: GraduationCap,
      },
      {
        title: 'Mentorship Hub',
        path: '/mentorship',
        icon: Users,
      },
      {
        title: 'Community Groups',
        path: '/community-groups',
        icon: Network,
      },
      {
        title: 'Skill Assessments',
        path: '/assessments',
        icon: FileCheck,
      },
      {
        title: 'Leaderboard & Badges',
        path: '/leaderboard',
        icon: Trophy,
      },
      {
        title: 'Certificates',
        path: '/certificates',
        icon: Medal,
      },
      {
        title: 'Leave Management',
        path: '/leave',
        icon: CalendarDays,
      },
    ];

    systemLinks = [
      {
        title: 'In-App Messaging',
        path: '/messages',
        icon: MessageSquare,
      },
      {
        title: t('notifications') || 'Notifications',
        path: '/notifications',
        icon: Bell,
      },
    ];
  } else if (isLndAdmin) {
    // 6. L&D Admin Navigation Menu — governance: training catalog, org-wide
    // mentorship approval queue, assessments, reporting. No Learning Path
    // (that's a personal employee view), no session-hosting tools (that's
    // the Mentor role below).
    mainLinks = [
      {
        title: t('dashboard') || 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Skills Matrix',
        path: '/skills',
        icon: Award,
      },
      {
        title: 'Gap Intelligence',
        path: '/gaps',
        icon: BrainCircuit,
        badge: 'Core',
        badgeColor: coreBadgeColor,
      },
      {
        title: 'AI Training Insights',
        path: '/ai-recommendations',
        icon: Sparkles,
        badge: 'AI',
        badgeColor: aiBadgeColor,
      },
      {
        title: 'Training & Development',
        path: '/training',
        icon: GraduationCap,
      },
      {
        title: 'Mentorship Governance',
        path: '/mentorship',
        icon: Users,
      },
      {
        title: 'Community Groups',
        path: '/community-groups',
        icon: Network,
      },
      {
        title: 'Skill Assessments',
        path: '/assessments',
        icon: FileCheck,
      },
      {
        title: 'Leaderboard & Badges',
        path: '/leaderboard',
        icon: Trophy,
      },
      {
        title: 'Certificates',
        path: '/certificates',
        icon: Medal,
      },
      {
        title: 'Task Assignment',
        path: '/tasks',
        icon: CheckSquare,
      },
      {
        title: 'Leave Management',
        path: '/leave',
        icon: CalendarDays,
      },
    ];

    systemLinks = [
      {
        title: 'In-App Messaging',
        path: '/messages',
        icon: MessageSquare,
      },
      {
        title: t('notifications') || 'Notifications',
        path: '/notifications',
        icon: Bell,
      },
    ];
  } else if (isMentor) {
    // 7. Mentor Navigation Menu — peer guidance: their own mentees, their
    // own knowledge-sharing sessions/workshops. No org-wide governance
    // (approving/rejecting other people's mentorship requests is L&D
    // Admin's job), no Learning Path (that's an employee's own view).
    mainLinks = [
      {
        title: t('dashboard') || 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Mentorship Hub',
        path: '/mentorship',
        icon: Users,
        badge: 'Mentor',
        badgeColor: pathBadgeColor,
      },
      {
        title: 'Community Groups',
        path: '/community-groups',
        icon: Network,
      },
      {
        title: 'Skill Assessments',
        path: '/assessments',
        icon: FileCheck,
      },
      {
        title: 'Leaderboard & Badges',
        path: '/leaderboard',
        icon: Trophy,
      },
      {
        title: 'Certificates',
        path: '/certificates',
        icon: Medal,
      },
      {
        title: 'Task Assignment',
        path: '/tasks',
        icon: CheckSquare,
      },
      {
        title: 'Leave Management',
        path: '/leave',
        icon: CalendarDays,
      },
    ];

    systemLinks = [
      {
        title: 'In-App Messaging',
        path: '/messages',
        icon: MessageSquare,
      },
      {
        title: t('notifications') || 'Notifications',
        path: '/notifications',
        icon: Bell,
      },
    ];
  } else {
    // 1. Employee Navigation Menu (Default)
    mainLinks = [
      {
        title: t('dashboard') || 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Skills Matrix',
        path: '/skills',
        icon: Award,
      },
      {
        title: 'Gap Intelligence',
        path: '/gaps',
        icon: BrainCircuit,
        badge: 'Core',
        badgeColor: coreBadgeColor,
      },
      {
        title: 'AI Training Insights',
        path: '/ai-recommendations',
        icon: Sparkles,
        badge: 'AI',
        badgeColor: aiBadgeColor,
      },
      {
        title: 'Training & Development',
        path: '/training',
        icon: GraduationCap,
      },
      {
        title: 'Learning Path',
        path: '/learning-path',
        icon: Compass,
        badge: 'Path',
        badgeColor: pathBadgeColor,
      },
      {
        title: 'Mentorship Hub',
        path: '/mentorship',
        icon: Users,
      },
      {
        title: 'Community Groups',
        path: '/community-groups',
        icon: Network,
      },
      {
        title: 'Skill Assessments',
        path: '/assessments',
        icon: FileCheck,
      },
      {
        title: 'Leaderboard & Badges',
        path: '/leaderboard',
        icon: Trophy,
      },
      {
        title: 'Certificates',
        path: '/certificates',
        icon: Medal,
      },
      {
        title: 'Task Assignment',
        path: '/tasks',
        icon: CheckSquare,
      },
      {
        title: 'Leave Management',
        path: '/leave',
        icon: CalendarDays,
      },
    ];

    systemLinks = [
      {
        title: 'In-App Messaging',
        path: '/messages',
        icon: MessageSquare,
      },
      {
        title: t('notifications') || 'Notifications',
        path: '/notifications',
        icon: Bell,
      },
    ];
  }

  return (
    <aside className="w-64 bg-white/92 backdrop-blur-md border-r border-slate-200/90 flex flex-col h-screen sticky top-0 z-30 select-none text-slate-700 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08),0_4px_12px_rgba(13,148,136,0.06)] relative overflow-hidden">
      {/* Organic Botanical Background Accents for Navigation Depth */}
      <div className="absolute top-0 right-0 w-28 h-64 pointer-events-none opacity-20 z-0">
        <BotanicalNavAccents variant="sidebar-climb" className="w-full h-full" />
      </div>
      <div className="absolute bottom-16 -left-3 w-16 h-28 pointer-events-none opacity-25 z-0 rotate-12">
        <BotanicalNavAccents variant="corner-sprout" className="w-full h-full" />
      </div>

      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100/90 flex items-center gap-3 relative overflow-hidden z-10 bg-white/60 backdrop-blur-xs">
        {/* Decorative soft teal glow & top plant bud */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-teal-500/12 rounded-full blur-xl pointer-events-none" />
        <BotanicalNavAccents
          variant="border-sprout"
          className="absolute -top-1 -right-1 w-12 h-8 opacity-60 pointer-events-none"
        />

        {/* OKGIP Segmented Logo with Depth Glow */}
        <div className="w-10 h-10 relative flex items-center justify-center shrink-0 drop-shadow-[0_4px_8px_rgba(13,148,136,0.2)]">
          <svg viewBox="0 0 44 44" className="w-10 h-10">
            <circle cx="22" cy="22" r="16" stroke="#E2F5F2" strokeWidth="6" fill="none" />
            <circle cx="22" cy="22" r="16" stroke="#0D9488" strokeWidth="6" strokeDasharray="30 70" strokeDashoffset="10" strokeLinecap="round" fill="none" />
            <circle cx="22" cy="22" r="16" stroke="#14B8A6" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="55" strokeLinecap="round" fill="none" />
            <circle cx="22" cy="22" r="16" stroke="#044E49" strokeWidth="6" strokeDasharray="20 80" strokeDashoffset="90" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="font-black text-slate-950 text-base tracking-tight leading-tight">
              OKGIP
            </h1>
            <span className="text-[10px] font-extrabold bg-[#D1FAE5] text-[#065F46] px-1.5 py-0.2 rounded-full border border-[#059669]/30 shadow-2xs">
              v3.0
            </span>
          </div>
          <p className="text-[11px] text-[#0A7A74] font-semibold tracking-tight">
            Intelligence Platform
          </p>
        </div>
      </div>

      {/* Navigation menu */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1 custom-scrollbar relative z-10">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Navigation Menu</span>
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500/60" />
        </div>

        {mainLinks.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#E6F7F5] to-white text-[#0A7A74] border border-teal-300/80 shadow-[0_4px_12px_rgba(13,148,136,0.12)] font-bold translate-x-0.5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 hover:translate-x-0.5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`p-1 rounded-lg transition-all ${isActive ? 'bg-teal-100/80 shadow-xs' : 'group-hover:bg-slate-200/50'}`}>
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-[#0A7A74] stroke-[2.4]' : 'text-slate-400 group-hover:text-slate-700 stroke-[1.8]'
                        }`}
                      />
                    </div>
                    <span className="tracking-tight">{item.title}</span>
                  </div>

                  {isActive && (
                    <BotanicalNavAccents
                      variant="leaf-duo"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-4 opacity-75 pointer-events-none"
                    />
                  )}

                  {item.badge && !isActive && (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-2xs inline-flex items-center gap-1 backdrop-blur-xs ${item.badgeColor || 'bg-[#D1FAE5] text-[#065F46] border-[#059669]/30'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#059669] shrink-0" />
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Divider */}
        {systemLinks.length > 0 && (
          <div className="my-3 pt-3 border-t border-slate-100/90">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              System & Communication
            </div>

            {systemLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group relative flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#E6F7F5] to-white text-[#0A7A74] border border-teal-300/80 shadow-[0_4px_12px_rgba(13,148,136,0.12)] font-bold translate-x-0.5'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 hover:translate-x-0.5'
                    }`
                  }
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`p-1 rounded-lg transition-all ${isActive ? 'bg-teal-100/80 shadow-xs' : 'group-hover:bg-slate-200/50'}`}>
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-[#0A7A74] stroke-[2.4]' : 'text-slate-400 group-hover:text-slate-700 stroke-[1.8]'
                        }`}
                      />
                    </div>
                    <span className="tracking-tight">{item.title}</span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer User Card -> Links to My Profile */}
      <div className="p-3.5 border-t border-slate-100/90 bg-gradient-to-b from-slate-50/70 to-slate-100/60 relative z-10">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/90 hover:border-teal-400 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(13,148,136,0.12)] group"
          title="My Profile"
        >
          <div className="w-8 h-8 rounded-full bg-[#E6F7F5] text-[#0A7A74] flex items-center justify-center font-bold text-xs border border-teal-200/80 shrink-0 overflow-hidden shadow-2xs">
            {user?.employee?.photo_url ? (
              <img
                src={user.employee.photo_url}
                alt="Avatar"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.svg';
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              sidebarAvatarInitial
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-[#0A7A74] transition-colors">
              {sidebarDisplayName}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-[#0A7A74] font-semibold truncate">
              <span className="truncate">{rawRole} • My Profile</span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0A7A74] group-hover:translate-x-0.5 transition-all" />
        </NavLink>
      </div>
    </aside>
  );
};
