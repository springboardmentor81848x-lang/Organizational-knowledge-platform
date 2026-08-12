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

  // Supports both EMPLOYEE and ROLE_EMPLOYEE
  const normalizedRole = (role || "")
    .toUpperCase()
    .replace("ROLE_", "");

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">
          OKIP
        </h1>

        <p className="text-sm text-slate-300">
          Knowledge Platform
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 overflow-y-auto">

        {/* ================================================= */}
        {/* HR SIDEBAR */}
        {/* ================================================= */}

        {normalizedRole === "HR" && (
          <>
            <NavLink
              to="/hr"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <LayoutDashboard size={20} />
              HR Dashboard
            </NavLink>

            <NavLink
              to="/knowledge-gap"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <Brain size={20} />
              Gap Intelligence
            </NavLink>

            <NavLink
              to="/skills"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <BookOpen size={20} />
              Workforce Skills
            </NavLink>

            <NavLink
              to="/competency-framework"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <ClipboardList size={20} />
              Competency Framework
            </NavLink>

            <NavLink
              to="/training-effectiveness"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <GraduationCap size={20} />
              Training Effectiveness
            </NavLink>

            <NavLink
              to="/skill-forecast"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <TrendingUp size={20} />
              Skill Forecast
            </NavLink>

            <NavLink
              to="/users"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <UserCog size={20} />
              User Management
            </NavLink>

            <NavLink
              to="/reports"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <BarChart3 size={20} />
              Reports
            </NavLink>

            <NavLink
              to="/notifications"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <Bell size={20} />
              Notifications
            </NavLink>
          </>
        )}

        {/* ================================================= */}
        {/* MANAGER SIDEBAR */}
        {/* ================================================= */}

        {normalizedRole === "MANAGER" && (
          <>
            <NavLink
              to="/manager"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <LayoutDashboard size={20} />
              Manager Dashboard
            </NavLink>

            <NavLink
              to="/team-skills"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <Users size={20} />
              Team Skill Coverage
            </NavLink>

            <NavLink
              to="/team-gaps"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <BarChart3 size={20} />
              Team Skill Gaps
            </NavLink>

            <NavLink
              to="/high-risk-gaps"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <AlertTriangle size={20} />
              High-Risk Gaps
            </NavLink>

            <NavLink
              to="/employee-progress"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <Activity size={20} />
              Employee Progress
            </NavLink>

            <NavLink
              to="/training"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <GraduationCap size={20} />
              Training & Learning
            </NavLink>

            <NavLink
              to="/learning-interventions"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <Lightbulb size={20} />
              Learning Interventions
            </NavLink>

            <NavLink
              to="/notifications"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <Bell size={20} />
              Notifications
            </NavLink>
          </>
        )}

        {/* ================================================= */}
        {/* DEPARTMENT HEAD SIDEBAR */}
        {/* ================================================= */}

        {normalizedRole === "DEPARTMENT_HEAD" && (
          <>
            <NavLink
              to="/department-head"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <LayoutDashboard size={20} />
              Department Dashboard
            </NavLink>

            <NavLink
              to="/team-gap-heatmap"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <BarChart3 size={20} />
              Team Gap Heatmap
            </NavLink>

            <NavLink
              to="/department-skills"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <Users size={20} />
              Skill Coverage
            </NavLink>

            <NavLink
              to="/training-adoption"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <GraduationCap size={20} />
              Training Adoption
            </NavLink>

            <NavLink
              to="/department-risk-gaps"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <AlertTriangle size={20} />
              High-Risk Gaps
            </NavLink>

            <NavLink
              to="/individual-progress"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <Activity size={20} />
              Individual Progress
            </NavLink>

            <NavLink
              to="/reports"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <BarChart3 size={20} />
              Reports
            </NavLink>

            <NavLink
              to="/notifications"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <Bell size={20} />
              Notifications
            </NavLink>
          </>
        )}

        {/* ================================================= */}
        {/* ADMIN / MENTOR SIDEBAR */}
        {/* ================================================= */}

        {normalizedRole === "ADMIN" && (
          <>
            <NavLink
              to="/admin"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <LayoutDashboard size={20} />
              Mentor Dashboard
            </NavLink>

            <NavLink
              to="/learning-path"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <GraduationCap size={20} />
              Learning Paths
            </NavLink>

            <NavLink
              to="/training-recommendations"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <Lightbulb size={20} />
              Training Recommendations
            </NavLink>

            <NavLink
              to="/training-catalog"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <Library size={20} />
              Training Catalog
            </NavLink>

            <NavLink
              to="/external-resources"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <ExternalLink size={20} />
              External Resources
            </NavLink>

            <NavLink
              to="/recommendation-analytics"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <PieChart size={20} />
              Recommendation Analytics
            </NavLink>

            <NavLink
              to="/reports"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <BarChart3 size={20} />
              Reports
            </NavLink>

            <NavLink
              to="/notifications"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <Bell size={20} />
              Notifications
            </NavLink>
          </>
        )}

        {/* ================================================= */}
        {/* EMPLOYEE SIDEBAR */}
        {/* ================================================= */}

        {normalizedRole === "EMPLOYEE" && (
          <>
            <NavLink
              to="/employee"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <LayoutDashboard size={20} />
              Dashboard
            </NavLink>

            <NavLink
              to="/profile"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <User size={20} />
              My Profile
            </NavLink>

            <NavLink
              to="/skills"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <BookOpen size={20} />
              Skill Inventory
            </NavLink>

            <NavLink
              to="/employee-assessment"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <ClipboardList size={20} />
              Skill Assessment
            </NavLink>

            <NavLink
              to="/knowledge-gap"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <BarChart3 size={20} />
              Knowledge Gap Analysis
            </NavLink>

            <NavLink
              to="/learning-path"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <GraduationCap size={20} />
              AI Learning Path
            </NavLink>

            <NavLink
              to="/training"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <GraduationCap size={20} />
              Training & Learning
            </NavLink>

            <NavLink
              to="/achievements"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <Trophy size={20} />
              Achievements
            </NavLink>

            <NavLink
              to="/certifications"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <Award size={20} />
              Certifications
            </NavLink>

            <NavLink
              to="/knowledge-sharing"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <BookOpen size={20} />
              Knowledge Sharing
            </NavLink>

            <NavLink
              to="/notifications"
              className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800"
            >
              <Bell size={20} />
              Notifications
            </NavLink>
          </>
        )}

      </nav>

      {/* Logout */}
      <div className="p-6 border-t border-slate-700">

        <button
          className="flex items-center gap-3 w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
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