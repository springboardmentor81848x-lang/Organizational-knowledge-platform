
import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  UserCheck,
  ClipboardList,
  ClipboardCheck,
  BarChart3,
  GraduationCap,
  BookOpen,
  Bell,
  LogOut,
  User,
  UserCog,
  Brain,
  TrendingUp,
  Library,
  CalendarDays,
  RotateCcw,
  Activity,
  FileText,
  PieChart,
  MessageSquare,
  Star,
  UserRoundCheck,
} from "lucide-react";

function Sidebar({ role }) {
  // ==================================================
  // NORMALIZE ROLE
  // ==================================================
  const normalizedRole = String(role || "")
    .toUpperCase()
    .replace(/^ROLE_/, "")
    .replace(/_/g, " ")
    .trim();

  // ==================================================
  // NAVLINK STYLE
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
            HR
        ================================================== */}
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

            <NavLink to="/team-skills" className={navLinkClass}>
              <ClipboardList size={20} />
              Competency Framework
            </NavLink>

            <NavLink
              to="/training-effectiveness"
              className={navLinkClass}
            >
              <GraduationCap size={20} />
              Training Effectiveness
            </NavLink>

            <NavLink
              to="/skill-forecast"
              className={navLinkClass}
            >
              <TrendingUp size={20} />
              Skill Forecast
            </NavLink>

            <NavLink to="/team-gaps" className={navLinkClass}>
              <UserCheck size={20} />
              Mentor Allocation
            </NavLink>

            <NavLink to="/users" className={navLinkClass}>
              <UserCog size={20} />
              User Management
            </NavLink>

            <NavLink
              to="/hr/reports"
              className={navLinkClass}
            >
              <BarChart3 size={20} />
              HR Reports
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

        {/* ==================================================
            MANAGER
        ================================================== */}
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
              to="/employee-progress"
              className={navLinkClass}
            >
              <Activity size={20} />
              Employee Progress
            </NavLink>

            <NavLink
              to="/training-adoption"
              className={navLinkClass}
            >
              <GraduationCap size={20} />
              Training Adoption
            </NavLink>

            <NavLink
              to="/manager-reports"
              className={navLinkClass}
            >
              <FileText size={20} />
              Reports
            </NavLink>

            <NavLink
              to="/manager-assessment"
              className={navLinkClass}
            >
              <ClipboardCheck size={20} />
              Manager Assessment
            </NavLink>

            <NavLink
              to="/manager/notifications"
              className={navLinkClass}
            >
              <Bell size={20} />
              Notifications
            </NavLink>
          </>
        )}

        {/* ==================================================
            DEPARTMENT HEAD
        ================================================== */}
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
              to="/department-head/skill-coverage"
              className={navLinkClass}
            >
              <Users size={20} />
              Skill Coverage
            </NavLink>

            <NavLink
              to="/department-head/training-adoption"
              className={navLinkClass}
            >
              <GraduationCap size={20} />
              Training Adoption
            </NavLink>

            <NavLink to="/reports" className={navLinkClass}>
              <BarChart3 size={20} />
              Reports
            </NavLink>

            <NavLink
              to="/department-head/notifications"
              className={navLinkClass}
            >
              <Bell size={20} />
              Notifications
            </NavLink>
          </>
        )}

        {/* ==================================================
            MENTOR
        ================================================== */}
        {normalizedRole === "MENTOR" && (
          <>
            <NavLink to="/mentor" className={navLinkClass}>
              <LayoutDashboard size={20} />
              Mentor Dashboard
            </NavLink>

            <NavLink
              to="/training-catalog"
              className={navLinkClass}
            >
              <Library size={20} />
              Course Catalog
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

        {/* ==================================================
            EMPLOYEE
        ================================================== */}
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

            {/* ==================================================
                EXISTING SKILL ASSESSMENT
            ================================================== */}
            <NavLink
              to="/employee-assessment"
              className={navLinkClass}
            >
              <ClipboardList size={20} />
              Skill Assessment
            </NavLink>

            {/* ==================================================
                SELF ASSESSMENT
            ================================================== */}
            <NavLink
              to="/employee/self-assessment"
              className={navLinkClass}
            >
              <UserRoundCheck size={20} />
              Self Assessment
            </NavLink>

            {/* ==================================================
                REASSESSMENT
            ================================================== */}
            <NavLink
              to="/reassessment"
              className={navLinkClass}
            >
              <RotateCcw size={20} />
              Reassessment
            </NavLink>

            {/* ==================================================
                PEER ASSESSMENT
            ================================================== */}
            <NavLink
              to="/peer-assessment"
              className={navLinkClass}
            >
              <Users size={20} />
              Peer Assessment
            </NavLink>

            {/* ==================================================
                PEER REVIEWS
            ================================================== */}
            <NavLink
              to="/employee/peer-reviews"
              className={navLinkClass}
            >
              <Star size={20} />
              Peer Reviews
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
              to="/peer-mentoring"
              className={navLinkClass}
            >
              <Users size={20} />
              Peer Mentoring
            </NavLink>

            <NavLink
              to="/messages"
              className={navLinkClass}
            >
              <MessageSquare size={20} />
              Messages / Chat
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

        {/* ==================================================
            SYSTEM ADMINISTRATOR
        ================================================== */}
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
              to="/system-administrator/users"
              className={navLinkClass}
            >
              <UserCog size={20} />
              User Management
            </NavLink>

            <NavLink
              to="/system-administrator/reports"
              className={navLinkClass}
            >
              <BarChart3 size={20} />
              Reports
            </NavLink>

            <NavLink
              to="/system-administrator/notifications"
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