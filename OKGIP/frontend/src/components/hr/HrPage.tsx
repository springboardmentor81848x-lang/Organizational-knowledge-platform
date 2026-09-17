import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Building2, BriefcaseBusiness, Target, BookOpen,
  BarChart3, Brain, GraduationCap, ClipboardCheck, Settings, LogOut,
  Search, Bell, Sun, UserRound, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import "@/styles/hr-dashboard.css";
import "@/styles/hr-pages.css";

const nav = [
  ["Dashboard", "/hr", LayoutDashboard],
  ["Employees", "/hr/employees", Users],
  ["Departments", "/hr/departments", Building2],
  ["Job Roles", "/hr/job-roles", BriefcaseBusiness],
  ["Workforce Skills", "/hr/workforce-skills", Target],
  ["Competency Framework", "/hr/competency-framework", BookOpen],
  ["Organization Skill Gaps", "/hr/knowledge-gaps", BarChart3],
  ["AI Recommendations", "/hr/ai-recommendations", Brain],
  ["Training Analytics", "/hr/training-analytics", GraduationCap],
  ["Assessments", "/hr/assessments", ClipboardCheck],
  ["Reports & Analytics", "/hr/reports", BarChart3],
] as const;

export const HrPage: React.FC<{
  title: string;
  subtitle: string;
  active: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, subtitle, active, children, actions }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, logout } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const go = (path: string) => navigate(path);
  const isActive = (label: string, path: string) =>
    active === label || (label === "Dashboard" && location.pathname === "/hr" && path === "/hr");

  return (
    <div className={`hr-shell ${collapsed ? "hr-shell-collapsed" : ""}`}>
      <aside className="hr-sidebar">
        <div className="hr-logo">
          <div className="hr-logo-icon"><Brain size={23} /></div>
          {!collapsed && <span>OKIP</span>}
        </div>
        <nav className="hr-nav">
          {nav.map(([label, path, Icon]) => (
            <button key={path} type="button" className={`hr-nav-item ${isActive(label, path) ? "active" : ""}`} onClick={() => go(path)} title={collapsed ? label : undefined}>
              <Icon size={19} />{!collapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>
        <div className="hr-sidebar-bottom">
          <button type="button" className={`hr-nav-item ${active === "Settings" ? "active" : ""}`} onClick={() => go("/hr/settings")}>
            <Settings size={19} />{!collapsed && <span>Settings</span>}
          </button>
          <button type="button" className="hr-nav-item" onClick={() => { logout(); navigate("/login"); }}>
            <LogOut size={19} />{!collapsed && <span>Logout</span>}
          </button>
          <button type="button" className="collapse-sidebar" onClick={() => setCollapsed(v => !v)} title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
            {collapsed ? <ChevronRight size={15} /> : <><ChevronLeft size={15} /><span>Collapse Sidebar</span></>}
          </button>
        </div>
      </aside>

      <main className="hr-main">
        <header className="hr-topbar">
          <div className="breadcrumb"><span>HR</span><span>/</span><strong>{title}</strong></div>
          <div className="topbar-actions">
            <div className="search-box">
              <Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees, skills..." />
            </div>
            <button className="icon-button" type="button" onClick={() => navigate("/hr")} title="Notifications"><Bell size={19} /></button>
            <button className="icon-button" type="button" title="Theme"><Sun size={19} /></button>
            <button className="hr-profile" type="button" onClick={() => navigate("/hr/settings")}>
              <div className="profile-avatar"><UserRound size={20} /></div>
              <div><strong>HR Manager</strong><span>{email || "Authenticated HR user"}</span></div>
              <span className="profile-arrow">⌄</span>
            </button>
          </div>
        </header>
        <div className="hr-content">
          <div className="hr-page-header">
            <div>
              <div className="title-badges"><span className="executive-badge">HR ORGANIZATION</span><span className="ai-active-badge">Live Database Data</span></div>
              <h1>{title}</h1><p>{subtitle}</p>
            </div>
            {actions && <div className="page-actions">{actions}</div>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default HrPage;
