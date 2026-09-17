import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  Settings,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import "@/styles/manager-dashboard.css";
import "@/styles/manager-pages.css";

export type ManagerNavKey =
  | "Dashboard"
  | "Employees"
  | "Departments"
  | "Job Roles"
  | "Skills"
  | "Competency Framework"
  | "Knowledge Gap Analysis"
  | "AI Recommendations"
  | "Training Management"
  | "Assessments"
  | "Reports & Analytics"
  | "Settings";

const menuItems: Array<[ManagerNavKey, string, React.ElementType]> = [
  ["Dashboard", "/manager", LayoutDashboard],
  ["Employees", "/manager/employees", Users],
  ["Departments", "/manager/departments", Building2],
  ["Job Roles", "/manager/job-roles", BriefcaseBusiness],
  ["Skills", "/manager/skills", Target],
  ["Competency Framework", "/manager/competency-framework", BookOpen],
  ["Knowledge Gap Analysis", "/manager/knowledge-gap-analysis", Activity],
  ["AI Recommendations", "/manager/ai-recommendations", Sparkles],
  ["Training Management", "/manager/training-management", GraduationCap],
  ["Assessments", "/manager/assessments", CheckCircle2],
  ["Reports & Analytics", "/manager/reports", BarChart3],
];

interface ManagerLayoutProps {
  active?: ManagerNavKey;
  breadcrumb?: string;
  children: React.ReactNode;
}

const getDisplayName = (email: string | null) => {
  if (!email) return "Manager";

  const local = email
    .split("@")[0]
    ?.replace(/[._-]/g, " ")
    .trim();

  if (!local) return "Manager";

  return local.replace(/\b\w/g, (char) => char.toUpperCase());
};

const ManagerLayout: React.FC<ManagerLayoutProps> = ({
  active = "Dashboard",
  breadcrumb,
  children,
}) => {
  const { email, role, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);

  const displayName = getDisplayName(email);

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`manager-dashboard ${collapsed ? "sidebar-collapsed" : ""} ${dark ? "manager-dark" : ""}`}>

      {/* ================= SIDEBAR ================= */}
      <aside className="manager-sidebar">

        {/* BRAND */}
        <div className="manager-brand">
          <div className="manager-brand-icon">
            <Zap size={17} strokeWidth={2.5} />
          </div>

          <span className="manager-brand-name">
            OKIP
          </span>
        </div>

        {/* MAIN NAVIGATION */}
        <nav
          className="manager-nav"
          aria-label="Manager navigation"
        >
          {menuItems.map(([label, path, Icon]) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/manager"}
              className={() =>
                `manager-nav-item ${
                  active === label ? "active" : ""
                }`
              }
            >
              <Icon
                size={15}
                strokeWidth={1.8}
              />

              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* BOTTOM SECTION */}
        <div className="manager-sidebar-bottom">

          {/* SETTINGS */}
          <NavLink
            to="/manager/settings"
            className={() =>
              `manager-nav-item ${
                active === "Settings" ? "active" : ""
              }`
            }
          >
            <Settings size={15} strokeWidth={1.8} />
            <span>Settings</span>
          </NavLink>

          {/* LOGOUT */}
          <button
            type="button"
            className="manager-nav-item manager-logout"
            onClick={logout}
          >
            <LogOut size={15} strokeWidth={1.8} />
            <span>Logout</span>
          </button>

          {/* COLLAPSE */}
          <button
            type="button"
            className="manager-collapse"
            onClick={() => setCollapsed((v) => !v)}
          >
            <ChevronLeft size={13} />
            <span>Collapse Sidebar</span>
          </button>

        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="manager-main">

        {/* TOP BAR */}
        <header className="manager-topbar">

          <div className="manager-breadcrumb">
            <span>Dashboard</span>
            <span>/</span>
            <strong>
              {breadcrumb || active}
            </strong>
          </div>

          <div className="manager-top-actions">

            <div className="manager-search">
              <Search size={13} />

              <input
                aria-label="Search"
                placeholder="Search insights, employees..."
              />
            </div>

            <button
              className="manager-top-icon"
              type="button"
              aria-label="Notifications"
            >
              <Bell size={15} />

            </button>

            <button
              className="manager-top-icon"
              type="button"
              aria-label="Toggle theme"
              onClick={() => setDark((v) => !v)}
            >
              <Moon size={15} />
            </button>

            <div className="manager-profile">

              <div className="manager-profile-avatar">
                {initials || "AR"}
              </div>

              <div>
                <strong>{displayName}</strong>
                <small>{role ? role.toUpperCase() : ""}</small>
              </div>

              <ChevronRight size={12} />

            </div>

          </div>
        </header>

        {children}

      </main>
    </div>
  );
};

export default ManagerLayout;