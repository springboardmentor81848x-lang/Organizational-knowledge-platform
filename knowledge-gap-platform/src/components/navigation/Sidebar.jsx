import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Award,
  FileCheck,
  TrendingUp,
  BrainCircuit,
  Sparkles,
  BookOpen,
  LineChart,
  Users,
  Bell,
  UserCheck,
  Building2,
  Briefcase,
  Layers,
  GraduationCap,
  FileSpreadsheet,
  BarChart3,
  Brain,
  X,
  Shield,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { activeRole } = useAuth();

  const employeeLinks = [
    { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employee/profile', label: 'My Profile', icon: User },
    { to: '/employee/skills', label: 'My Skills', icon: Award },
    { to: '/employee/assessment', label: 'Skill Assessment', icon: FileCheck },
    { to: '/employee/assessment-results', label: 'Assessment Results', icon: TrendingUp },
    { to: '/employee/gap-analysis', label: 'Knowledge Gap Analysis', icon: BrainCircuit },
    { to: '/employee/recommendations', label: 'AI Recommendations', icon: Sparkles },
    { to: '/employee/course/rec-101', label: 'Course Details', icon: BookOpen },
    { to: '/employee/progress', label: 'Learning Progress', icon: LineChart },
    { to: '/employee/mentorship', label: 'Mentorship Program', icon: Users },
    { to: '/employee/notifications', label: 'Notifications', icon: Bell },
  ];

  const managerLinks = [
    { to: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/manager/team', label: 'Team Roster', icon: Users },
    { to: '/manager/team-gaps', label: 'Team Skill Gaps', icon: BrainCircuit },
    { to: '/manager/employee/t1', label: 'Employee Deep Dive', icon: UserCheck },
    { to: '/manager/notifications', label: 'Manager Notifications', icon: Bell },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Enterprise Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users Directory', icon: Users },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/roles', label: 'Competency Roles', icon: Briefcase },
    { to: '/admin/skills', label: 'Skills Library', icon: Layers },
    { to: '/admin/training', label: 'Training Management', icon: GraduationCap },
    { to: '/admin/reports', label: 'Executive Reports', icon: FileSpreadsheet },
    { to: '/admin/analytics', label: 'Predictive Analytics', icon: BarChart3 },
  ];

  const currentLinks =
    activeRole === 'manager'
      ? managerLinks
      : activeRole === 'admin'
      ? adminLinks
      : employeeLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container - Enterprise Dark Theme #0F172A */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0F172A] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 shadow-2xl lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-white text-sm tracking-tight block leading-none">
                SkillGaps AI
              </span>
              <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
                Enterprise Intelligence
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Perspective Header */}
        <div className="px-4 py-3 bg-slate-900/50 border-b border-slate-800/50 flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            {activeRole} Portal Navigation
          </span>
          <Shield className="w-3 h-3 text-blue-400" />
        </div>

        {/* Links Navigation List */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {currentLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / System Health */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/30">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] font-bold text-white mb-1">
              <span>Readiness Target</span>
              <span className="text-emerald-400 font-extrabold">84%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-1.5 rounded-full w-[84%]" />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Next Skill Refresh: Aug 15
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
