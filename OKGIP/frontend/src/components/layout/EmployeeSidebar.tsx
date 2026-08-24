import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, User, Activity, FileCheck2, Users, Target,
  TrendingUp, BookOpen, GraduationCap, Award, ShieldCheck, Bell,
  Settings, LogOut, ChevronRight, Zap, Briefcase,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  ["Dashboard", "/employee", LayoutDashboard],
  ["My Profile", "/employee/profile", User],
  ["Skill Profile", "/employee/skills", Activity],
  ["Self Assessment", "/employee/self-assessment", FileCheck2],
  ["Peer Assessment", "/employee/peer-assessment", Users],
  ["My Proficiency", "/employee/proficiency", Target],
  ["Skill Gaps", "/employee/skill-gaps", TrendingUp],
  ["Learning Paths", "/employee/learning-paths", BookOpen],
  ["Training", "/employee/training", GraduationCap],
  ["Experience", "/employee/experience", Briefcase],
  ["My Progress", "/employee/progress", Activity],
  ["Achievements", "/employee/achievements", Award],
  ["Certifications", "/employee/certifications", ShieldCheck],
  ["Mentorship", "/employee/mentorship", Users],
  ["Notifications", "/employee/notifications", Bell],
] as const;

const EmployeeSidebar: React.FC = () => {
  const { logout } = useAuth();

  return (
    <aside className="employee-sidebar">
      <div className="employee-brand">
        <div className="employee-brand-icon"><Zap size={19} /></div>
        <span>OKGIP</span>
      </div>

      <nav className="employee-nav">
        {menuItems.map(([label, path, Icon]) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/employee"}
            className={({ isActive }) =>
              `employee-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="employee-sidebar-bottom">
        <NavLink
          to="/employee/settings"
          className={({ isActive }) =>
            `employee-nav-item ${isActive ? "active" : ""}`
          }
        >
          <Settings size={16} />
          <span>Settings</span>
        </NavLink>

        <button
          type="button"
          className="employee-nav-item w-full border-0 bg-transparent text-left"
          onClick={logout}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>

        <div className="employee-collapse">
          <ChevronRight size={14} />
          <span>Collapse Sidebar</span>
        </div>
      </div>
    </aside>
  );
};

export default EmployeeSidebar;
