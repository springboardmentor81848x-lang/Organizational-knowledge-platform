import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  UserCheck, // ✅ FIXED: required for Mentor Allocation
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
} from "lucide-react";

function Sidebar({ role }) {
  // ==================================================
  // NORMALIZE ROLE
  // ==================================================
  const normalizedRole = (role || "")
    .toUpperCase()
    .replace("ROLE_", "")
    .replace(/_/g, " ")
    .trim();

  // ==================================================
  // COMMON NAVLINK STYLE
  // ==================================================
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-6 py-3 transition ${
      isActive
        ? "bg-slate-800 text-white"
        : "text-slate-200 hover:bg-slate-800"
    }`;

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">

      {/* ==================================================
          LOGO
      ================================================== */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold leading-tight">
          ORGANIZATIONAL KNOWLEDGE GAP
          <br />
          INTELLIGENCE PLATFORM
        </h1>
      </div>

      {/* ==================================================
          NAVIGATION
      ================================================== */}
      <nav className="flex-1 mt-6 overflow-y-auto">

        {/* ==================================================
            HR SIDEBAR
        ================================================== */}
        {normalizedRole === "HR" && (
          <>
            {/* HR Dashboard */}
            <NavLink
              to="/hr"
              className={navLinkClass}
            >
              <LayoutDashboard size={20} />
              HR Dashboard
            </NavLink>

            {/* Gap Intelligence */}
            <NavLink
              to="/hr/gap-intelligence"
              className={navLinkClass}
            >
              <Brain size={20} />
              Gap Intelligence
            </NavLink>

            {/* Workforce Skills */}
            <NavLink
              to="/hr/workforce-skills"
              className={navLinkClass}
            >
              <BookOpen size={20} />
              Workforce Skills
            </NavLink>

            {/* Competency Framework */}
            <NavLink
              to="/competency-framework"
              className={navLinkClass}
            >
              <ClipboardList size={20} />
              Competency Framework
            </NavLink>

            {/* Training Effectiveness */}
            <NavLink
              to="/training-effectiveness"
              className={navLinkClass}
            >
              <GraduationCap size={20} />
              Training Effectiveness
            </NavLink>

            {/* Skill Forecast */}
            <NavLink
              to="/skill-forecast"
              className={navLinkClass}
            >
              <TrendingUp size={20} />
              Skill Forecast
            </NavLink>

            {/* Mentor Allocation */}
            <NavLink
              to="/hr/mentor-allocation"
              className={navLinkClass}
            >
              <UserCheck size={20} />
              Mentor Allocation
            </NavLink>

            {/* User Management */}
            <NavLink
              to="/users"
              className={navLinkClass}
            >
              <UserCog size={20} />
              User Management
            </NavLink>

            {/* Reports */}
            <NavLink
              to="/reports"
              className={navLinkClass}
            >
              <BarChart3 size={20} />
              Reports
            </NavLink>

            {/* Notifications */}
            <NavLink
              to="/notifications"
              className={navLinkClass}
            >
              <Bell size={20} />
              Notifications
            </NavLink>
          </>
        )}

        {/* ==================================================
            MANAGER SIDEBAR
        ================================================== */}
        {normalizedRole === "MANAGER" && (
          <>
            {/* Manager Dashboard */}
            <NavLink
              to="/manager"
              className={navLinkClass}
            >
              <LayoutDashboard size={20} />
              Manager Dashboard
            </NavLink>

            {/* Team Skill Coverage */}
            <NavLink
              to="/team-skills"
              className={navLinkClass}
            >
              <Users size={20} />
              Team Skill Coverage
            </NavLink>

            {/* Team Skill Gaps */}
            <NavLink
              to="/team-gaps"
              className={navLinkClass}
            >
              <BarChart3 size={20} />
              Team Skill Gaps
            </NavLink>

            {/* High Risk Gaps */}
            <NavLink
              to="/high-risk-gaps"
              className={navLinkClass}
            >
              <AlertTriangle size={20} />
              High-Risk Gaps
            </NavLink>

            {/* Employee Progress */}
            <NavLink
              to="/employee-progress"
              className={navLinkClass}
            >
              <Activity size={20} />
              Employee Progress
            </NavLink>

            {/* Training */}
            <NavLink
              to="/training"
              className={navLinkClass}
            >
              <GraduationCap size={20} />
              Training & Learning
            </NavLink>

            {/* Learning Interventions */}
            <NavLink
              to="/learning-interventions"
              className={navLinkClass}
            >
              <Lightbulb size={20} />
              Learning Interventions
            </NavLink>

            {/* Notifications */}
            <NavLink
              to="/notifications"
              className={navLinkClass}
            >
              <Bell size={20} />
              Notifications
            </NavLink>
          </>
        )}

        {/* ==================================================
            DEPARTMENT HEAD SIDEBAR
        ================================================== */}
        {normalizedRole === "DEPARTMENT HEAD" && (
          <>
            {/* Department Dashboard */}
            <NavLink
              to="/department-head"
              className={navLinkClass}
            >
              <LayoutDashboard size={20} />
              Department Dashboard
            </NavLink>

            {/* Team Gap Heatmap */}
            <NavLink
              to="/team-gap-heatmap"
              className={navLinkClass}
            >
              <BarChart3 size={20} />
              Team Gap Heatmap
            </NavLink>

            {/* Skill Coverage */}
            <NavLink
              to="/department-skills"
              className={navLinkClass}
            >
              <Users size={20} />
              Skill Coverage
            </NavLink>

            {/* Training Adoption */}
            <NavLink
              to="/training-adoption"
              className={navLinkClass}
            >
              <GraduationCap size={20} />
              Training Adoption
            </NavLink>

            {/* High Risk Gaps */}
            <NavLink
              to="/department-risk-gaps"
              className={navLinkClass}
            >
              <AlertTriangle size={20} />
              High-Risk Gaps
            </NavLink>

            {/* Individual Progress */}
            <NavLink
              to="/individual-progress"
              className={navLinkClass}
            >
              <Activity size={20} />
              Individual Progress
            </NavLink>

            {/* Reports */}
            <NavLink
              to="/reports"
              className={navLinkClass}
            >
              <BarChart3 size={20} />
              Reports
            </NavLink>

            {/* Notifications */}
            <NavLink
              to="/notifications"
              className={navLinkClass}
            >
              <Bell size={20} />
              Notifications
            </NavLink>
          </>
        )}

        {/* ==================================================
            MENTOR SIDEBAR
        ================================================== */}
        {normalizedRole === "MENTOR" && (
          <>
            {/* Mentor Dashboard */}
            <NavLink
              to="/mentor"
              className={navLinkClass}
            >
              <LayoutDashboard size={20} />
              Mentor Dashboard
            </NavLink>

            {/* Training Management */}
            <NavLink
              to="/training-management"
              className={navLinkClass}
            >
              <GraduationCap size={20} />
              Training Management
            </NavLink>

            {/* Course Catalog */}
            <NavLink
              to="/training-catalog"
              className={navLinkClass}
            >
              <Library size={20} />
              Course Catalog
            </NavLink>

            {/* Learning Paths */}
            <NavLink
              to="/learning-path"
              className={navLinkClass}
            >
              <BookOpen size={20} />
              Learning Paths
            </NavLink>

            {/* Mentor Management */}
            <NavLink
              to="/mentor-management"
              className={navLinkClass}
            >
              <Users size={20} />
              Mentor Management
            </NavLink>

            {/* Knowledge Sessions */}
            <NavLink
              to="/knowledge-sessions"
              className={navLinkClass}
            >
              <CalendarDays size={20} />
              Knowledge Sessions
            </NavLink>

            {/* Learning Analytics */}
            <NavLink
              to="/learning-analytics"
              className={navLinkClass}
            >
              <PieChart size={20} />
              Learning Analytics
            </NavLink>

            {/* Notifications */}
            <NavLink
              to="/notifications"
              className={navLinkClass}
            >
              <Bell size={20} />
              Notifications
            </NavLink>
          </>
        )}

        {/* ==================================================
            EMPLOYEE SIDEBAR
        ================================================== */}
        {normalizedRole === "EMPLOYEE" && (
          <>
            {/* Dashboard */}
            <NavLink
              to="/employee"
              className={navLinkClass}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </NavLink>

            {/* Profile */}
            <NavLink
              to="/profile"
              className={navLinkClass}
            >
              <User size={20} />
              My Profile
            </NavLink>

            {/* Skill Inventory */}
            <NavLink
              to="/skills"
              className={navLinkClass}
            >
              <BookOpen size={20} />
              Skill Inventory
            </NavLink>

            {/* Skill Assessment */}
            <NavLink
              to="/employee-assessment"
              className={navLinkClass}
            >
              <ClipboardList size={20} />
              Skill Assessment
            </NavLink>

            {/* Knowledge Gap */}
            <NavLink
              to="/knowledge-gap"
              className={navLinkClass}
            >
              <BarChart3 size={20} />
              Knowledge Gap Analysis
            </NavLink>

            {/* AI Learning Path */}
            <NavLink
              to="/learning-path"
              className={navLinkClass}
            >
              <GraduationCap size={20} />
              AI Learning Path
            </NavLink>

            {/* Training & Learning */}
            <NavLink
              to="/training-learning"
              className={navLinkClass}
            >
              <GraduationCap size={20} />
              Training & Learning
            </NavLink>

            {/* Mentorship */}
            <NavLink
              to="/mentorship"
              className={navLinkClass}
            >
              <Users size={20} />
              Mentorship
            </NavLink>

            {/* Knowledge Sessions */}
            <NavLink
              to="/knowledge-sessions"
              className={navLinkClass}
            >
              <CalendarDays size={20} />
              Knowledge Sessions
            </NavLink>

            {/* My Trainings */}
            <NavLink
              to="/my-trainings"
              className={navLinkClass}
            >
              <GraduationCap size={20} />
              My Trainings
            </NavLink>

            {/* Training Details */}
            <NavLink
              to="/training-details"
              className={navLinkClass}
            >
              <BookOpen size={20} />
              Training Details
            </NavLink>

            {/* Learning Progress */}
            <NavLink
              to="/learning-progress"
              className={navLinkClass}
            >
              <TrendingUp size={20} />
              Learning Progress
            </NavLink>

            {/* Expert Directory */}
            <NavLink
              to="/expert-directory"
              className={navLinkClass}
            >
              <Users size={20} />
              Expert Directory
            </NavLink>

            {/* Notifications */}
            <NavLink
              to="/notifications"
              className={navLinkClass}
            >
              <Bell size={20} />
              Notifications
            </NavLink>
          </>
        )}

        {/* ==================================================
            SYSTEM ADMINISTRATOR SIDEBAR
        ================================================== */}
        {(normalizedRole === "SYSTEM ADMINISTRATOR" ||
          normalizedRole === "ADMIN") && (
          <>
            {/* System Administrator Dashboard */}
            <NavLink
              to="/system-administrator"
              className={navLinkClass}
            >
              <LayoutDashboard size={20} />
              System Administrator
            </NavLink>

            {/* User Management */}
            <NavLink
              to="/users"
              className={navLinkClass}
            >
              <UserCog size={20} />
              User Management
            </NavLink>

            {/* Reports */}
            <NavLink
              to="/reports"
              className={navLinkClass}
            >
              <BarChart3 size={20} />
              Reports
            </NavLink>

            {/* Notifications */}
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

      {/* ==================================================
          LOGOUT
      ================================================== */}
      <div className="p-6 border-t border-slate-700">
        <button
          className="flex items-center gap-3 w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("userRole");
            localStorage.removeItem("employeeId");
            localStorage.removeItem("userId");
            localStorage.removeItem("firstName");
            localStorage.removeItem("lastName");
            localStorage.removeItem("designation");

            window.location.href = "/login";
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;