import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart3,
  GraduationCap,
  BookOpen,
  Bell,
  LogOut,
  User,
  Trophy,
  Award,
  Brain,
  AlertTriangle,
  TrendingUp,
  Library,
  ExternalLink,
  Lightbulb,
  UserCog,
  PieChart,
  Activity,
} from "lucide-react";

function Sidebar({ role }) {
  // Supports:
  // EMPLOYEE
  // ROLE_EMPLOYEE
  // employee
  // role_employee

  const normalizedRole = (role || "")
    .toUpperCase()
    .replace("ROLE_", "")
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

        <h1 className="text-2xl font-bold">
          OKIP
        </h1>

        <p className="text-sm text-slate-300">
          Knowledge Platform
        </p>

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
            <NavLink
              to="/hr"
              className={navLinkClass}
            >
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
              to="/skills"
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

            <NavLink
              to="/users"
              className={navLinkClass}
            >
              <UserCog size={20} />
              User Management
            </NavLink>

            <NavLink
              to="/reports"
              className={navLinkClass}
            >
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

        {/* ==================================================
            MANAGER SIDEBAR
        ================================================== */}

        {normalizedRole === "MANAGER" && (
          <>
            <NavLink
              to="/manager"
              className={navLinkClass}
            >
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

        {/* ==================================================
            DEPARTMENT HEAD SIDEBAR
        ================================================== */}

        {normalizedRole === "DEPARTMENT_HEAD" && (
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

            <NavLink
              to="/reports"
              className={navLinkClass}
            >
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

        {/* ==================================================
            MENTOR / ADMIN SIDEBAR
        ================================================== */}

        {(normalizedRole === "ADMIN" ||
          normalizedRole === "MENTOR") && (
          <>
            <NavLink
              to="/mentor"
              className={navLinkClass}
            >
              <LayoutDashboard size={20} />
              Mentor Dashboard
            </NavLink>

            <NavLink
              to="/learning-path"
              className={navLinkClass}
            >
              <GraduationCap size={20} />
              Learning Paths
            </NavLink>

            <NavLink
              to="/training-recommendations"
              className={navLinkClass}
            >
              <Lightbulb size={20} />
              Training Recommendations
            </NavLink>

            <NavLink
              to="/training-catalog"
              className={navLinkClass}
            >
              <Library size={20} />
              Training Catalog
            </NavLink>

            <NavLink
              to="/external-resources"
              className={navLinkClass}
            >
              <ExternalLink size={20} />
              External Resources
            </NavLink>

            <NavLink
              to="/recommendation-analytics"
              className={navLinkClass}
            >
              <PieChart size={20} />
              Recommendation Analytics
            </NavLink>

            <NavLink
              to="/reports"
              className={navLinkClass}
            >
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

            {/* ==================================================
                TRAINING & LEARNING
                IMPORTANT: MATCHES APP ROUTES
            ================================================== */}

            <NavLink
              to="/training-learning"
              className={navLinkClass}
            >
              <GraduationCap size={20} />
              Training & Learning
            </NavLink>

            {/* Achievements */}

            <NavLink
              to="/achievements"
              className={navLinkClass}
            >
              <Trophy size={20} />
              Achievements
            </NavLink>

            {/* Certifications */}

            <NavLink
              to="/certifications"
              className={navLinkClass}
            >
              <Award size={20} />
              Certifications
            </NavLink>

            {/* Knowledge Sharing */}

            <NavLink
              to="/knowledge-sharing"
              className={navLinkClass}
            >
              <BookOpen size={20} />
              Knowledge Sharing
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