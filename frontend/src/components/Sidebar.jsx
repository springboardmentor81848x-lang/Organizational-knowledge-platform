import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  UserCheck,
  ClipboardList,
  BarChart3,
  GraduationCap,
  BookOpen,
  Bell,
  LogOut,
  User,
  Brain,
  AlertTriangle,
  TrendingUp,
  Library,
  Lightbulb,
  UserCog,
  PieChart,
  Activity,
  CalendarDays,
  Star,
} from "lucide-react";

function Sidebar({ role }) {
  const normalizedRole = (role || "")
    .toUpperCase()
    .replace("ROLE_", "")
    .replace(/_/g, " ")
    .trim();

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-6 py-3 transition ${
      isActive
        ? "bg-slate-800 text-white"
        : "text-slate-200 hover:bg-slate-800"
    }`;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userRole");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("userId");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("designation");

    window.location.href = "/login";
  };

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">

      {/* LOGO */}

      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold leading-tight">
          ORGANIZATIONAL
          <br />
          KNOWLEDGE GAP
          <br />
          INTELLIGENCE
          <br />
          PLATFORM
        </h1>
      </div>

      {/* NAVIGATION */}

      <nav className="flex-1 mt-6 overflow-y-auto">

        {/* ================= EMPLOYEE ================= */}

        {normalizedRole === "EMPLOYEE" && (
          <>
            <NavLink to="/employee" className={navLinkClass}>
              <LayoutDashboard size={20} />
              Dashboard
            </NavLink>

            <NavLink to="/profile" className={navLinkClass}>
              <User size={20} />
              My Profile
            </NavLink>

            <NavLink to="/skills" className={navLinkClass}>
              <BookOpen size={20} />
              Skill Inventory
            </NavLink>

            <NavLink
              to="/employee-assessment"
              className={navLinkClass}
            >
              <ClipboardList size={20} />
              Skill Assessment
            </NavLink>

            <NavLink
              to="/knowledge-gap"
              className={navLinkClass}
            >
              <BarChart3 size={20} />
              Knowledge Gap Analysis
            </NavLink>

            <NavLink
              to="/learning-path"
              className={navLinkClass}
            >
              <GraduationCap size={20} />
              AI Learning Path
            </NavLink>

            <NavLink
              to="/training-learning"
              className={navLinkClass}
            >
              <GraduationCap size={20} />
              Training & Learning
            </NavLink>

            <NavLink
              to="/mentorship"
              className={navLinkClass}
            >
              <Users size={20} />
              Mentorship
            </NavLink>

            <NavLink
              to="/knowledge-sessions"
              className={navLinkClass}
            >
              <CalendarDays size={20} />
              Knowledge Sessions
            </NavLink>

            <NavLink
              to="/learning-progress"
              className={navLinkClass}
            >
              <TrendingUp size={20} />
              Learning Progress
            </NavLink>

            <NavLink
              to="/reviews"
              className={navLinkClass}
            >
              <Star size={20} />
              Reviews
            </NavLink>

            <NavLink
              to="/expert-directory"
              className={navLinkClass}
            >
              <Users size={20} />
              Expert Directory
            </NavLink>

            <NavLink
              to="/notifications"
              className={navLinkClass}
            >
              <Bell size={20} />
              Notifications
            </NavLink>
          </>
        )}

        {/* ================= HR ================= */}

        {normalizedRole === "HR" && (
          <>
            <NavLink to="/hr" className={navLinkClass}>
              <LayoutDashboard size={20} />
              HR Dashboard
            </NavLink>

            <NavLink
              to="/hr/gap-intelligence"
              className={navLinkClass}
            >
              <Brain size={20} />
              Gap Intelligence
            </NavLink>

            <NavLink
              to="/hr/workforce-skills"
              className={navLinkClass}
            >
              <BookOpen size={20} />
              Workforce Skills
            </NavLink>

            <NavLink
              to="/competency-framework"
              className={navLinkClass}
            >
              <ClipboardList size={20} />
              Competency Framework
            </NavLink>

            <NavLink
              to="/hr/mentor-allocation"
              className={navLinkClass}
            >
              <UserCheck size={20} />
              Mentor Allocation
            </NavLink>

            <NavLink to="/reports" className={navLinkClass}>
              <BarChart3 size={20} />
              Reports
            </NavLink>

            <NavLink
              to="/notifications"
              className={navLinkClass}
            >
              <Bell size={20} />
              Notifications
            </NavLink>
          </>
        )}

        {/* ================= MANAGER ================= */}

        {normalizedRole === "MANAGER" && (
          <>
            <NavLink to="/manager" className={navLinkClass}>
              <LayoutDashboard size={20} />
              Manager Dashboard
            </NavLink>

            <NavLink
              to="/team-skills"
              className={navLinkClass}
            >
              <Users size={20} />
              Team Skill Coverage
            </NavLink>

            <NavLink
              to="/team-gaps"
              className={navLinkClass}
            >
              <BarChart3 size={20} />
              Team Skill Gaps
            </NavLink>

            <NavLink
              to="/high-risk-gaps"
              className={navLinkClass}
            >
              <AlertTriangle size={20} />
              High-Risk Gaps
            </NavLink>

            <NavLink
              to="/employee-progress"
              className={navLinkClass}
            >
              <Activity size={20} />
              Employee Progress
            </NavLink>

            <NavLink
              to="/training"
              className={navLinkClass}
            >
              <GraduationCap size={20} />
              Training & Learning
            </NavLink>

            <NavLink
              to="/learning-interventions"
              className={navLinkClass}
            >
              <Lightbulb size={20} />
              Learning Interventions
            </NavLink>

            <NavLink
              to="/notifications"
              className={navLinkClass}
            >
              <Bell size={20} />
              Notifications
            </NavLink>
          </>
        )}

        {/* ================= DEPARTMENT HEAD ================= */}

        {normalizedRole === "DEPARTMENT HEAD" && (
          <>
            <NavLink
              to="/department-head"
              className={navLinkClass}
            >
              <LayoutDashboard size={20} />
              Department Dashboard
            </NavLink>

            <NavLink
              to="/team-gap-heatmap"
              className={navLinkClass}
            >
              <BarChart3 size={20} />
              Team Gap Heatmap
            </NavLink>

            <NavLink
              to="/department-skills"
              className={navLinkClass}
            >
              <Users size={20} />
              Skill Coverage
            </NavLink>

            <NavLink
              to="/training-adoption"
              className={navLinkClass}
            >
              <GraduationCap size={20} />
              Training Adoption
            </NavLink>

            <NavLink
              to="/department-risk-gaps"
              className={navLinkClass}
            >
              <AlertTriangle size={20} />
              High-Risk Gaps
            </NavLink>

            <NavLink
              to="/individual-progress"
              className={navLinkClass}
            >
              <Activity size={20} />
              Individual Progress
            </NavLink>

            <NavLink to="/reports" className={navLinkClass}>
              <BarChart3 size={20} />
              Reports
            </NavLink>

            <NavLink
              to="/notifications"
              className={navLinkClass}
            >
              <Bell size={20} />
              Notifications
            </NavLink>
          </>
        )}

        {/* ================= MENTOR ================= */}

        {normalizedRole === "MENTOR" && (
          <>
            <NavLink to="/mentor" className={navLinkClass}>
              <LayoutDashboard size={20} />
              Mentor Dashboard
            </NavLink>

            <NavLink
              to="/training-management"
              className={navLinkClass}
            >
              <GraduationCap size={20} />
              Training Management
            </NavLink>

            <NavLink
              to="/training-catalog"
              className={navLinkClass}
            >
              <Library size={20} />
              Course Catalog
            </NavLink>

            <NavLink
              to="/learning-path"
              className={navLinkClass}
            >
              <BookOpen size={20} />
              Learning Paths
            </NavLink>

            <NavLink
              to="/mentor-management"
              className={navLinkClass}
            >
              <Users size={20} />
              Mentor Management
            </NavLink>

            <NavLink
              to="/knowledge-sessions"
              className={navLinkClass}
            >
              <CalendarDays size={20} />
              Knowledge Sessions
            </NavLink>

            <NavLink
              to="/learning-analytics"
              className={navLinkClass}
            >
              <PieChart size={20} />
              Learning Analytics
            </NavLink>

            <NavLink
              to="/notifications"
              className={navLinkClass}
            >
              <Bell size={20} />
              Notifications
            </NavLink>
          </>
        )}

        {/* ================= ADMIN ================= */}

        {(normalizedRole === "SYSTEM ADMINISTRATOR" ||
          normalizedRole === "ADMIN") && (
          <>
            <NavLink
              to="/system-administrator"
              className={navLinkClass}
            >
              <LayoutDashboard size={20} />
              System Administrator
            </NavLink>

            <NavLink
              to="/users"
              className={navLinkClass}
            >
              <UserCog size={20} />
              User Management
            </NavLink>

            <NavLink to="/reports" className={navLinkClass}>
              <BarChart3 size={20} />
              Reports
            </NavLink>

            <NavLink
              to="/notifications"
              className={navLinkClass}
            >
              <Bell size={20} />
              Notifications
            </NavLink>
          </>
        )}
      </nav>

      {/* LOGOUT */}

      <div className="p-6 border-t border-slate-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;