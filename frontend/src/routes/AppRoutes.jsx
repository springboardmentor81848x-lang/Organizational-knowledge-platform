import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Signup from "../pages/Signup";

import EmployeeDashboard from "../pages/EmployeeDashboard";
import HRDashboard from "../pages/HRDashboard";
import ManagerDashboard from "../pages/ManagerDashboard";
import MentorDashboard from "../pages/MentorDashboard";
import DepartmentHeadDashboard from "../pages/DepartmentHeadDashboard";
import SystemAdministratorDashboard from "../pages/SystemAdministratorDashboard";
import Profile from "../pages/Profile";

import Skills from "../pages/Skills";
import KnowledgeGap from "../pages/KnowledgeGap";
import CompetencyFramework from "../pages/CompetencyFramework";
import LearningPath from "../pages/LearningPath";
import EmployeeSkillAssessment from "../pages/EmployeeSkillAssessment";

import Notifications from "../pages/Notifications";
import KnowledgeSharing from "../pages/KnowledgeSharing";
import ReportsAndAnalytics from "../pages/ReportsAndAnalytics";

function AppRoutes() {
  return (
    <Routes>

      {/* ============================== */}
      {/* DEFAULT ROUTE */}
      {/* ============================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      {/* ============================== */}
      {/* AUTHENTICATION */}
      {/* ============================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />


      {/* ============================== */}
      {/* EMPLOYEE */}
      {/* ============================== */}

      <Route
        path="/employee"
        element={<EmployeeDashboard />}
      />

      <Route
        path="/profile"
        element={<Profile />}
      />

      <Route
        path="/skills"
        element={<Skills />}
      />

      <Route
        path="/employee-assessment"
        element={<EmployeeSkillAssessment />}
      />

      <Route
        path="/knowledge-gap"
        element={<KnowledgeGap />}
      />

      <Route
        path="/learning-path"
        element={<LearningPath />}
      />

      <Route
        path="/training"
        element={
          <div className="p-8 text-2xl font-bold">
            Training & Learning
          </div>
        }
      />

      <Route
        path="/achievements"
        element={
          <div className="p-8 text-2xl font-bold">
            Achievements
          </div>
        }
      />

      <Route
        path="/certifications"
        element={
          <div className="p-8 text-2xl font-bold">
            Certifications
          </div>
        }
      />

      <Route
        path="/knowledge-sharing"
        element={<KnowledgeSharing />}
      />

      <Route
        path="/notifications"
        element={<Notifications />}
      />


      {/* ============================== */}
      {/* HR */}
      {/* ============================== */}

      <Route
        path="/hr"
        element={<HRDashboard />}
      />

      <Route
        path="/competency-framework"
        element={<CompetencyFramework />}
      />

      <Route
        path="/employees"
        element={
          <div className="p-8 text-2xl font-bold">
            Employee Management
          </div>
        }
      />

      <Route
        path="/training-effectiveness"
        element={
          <div className="p-8 text-2xl font-bold">
            Training Effectiveness
          </div>
        }
      />

      <Route
        path="/skill-forecast"
        element={
          <div className="p-8 text-2xl font-bold">
            Strategic Skill Forecast
          </div>
        }
      />

      <Route
        path="/users"
        element={
          <div className="p-8 text-2xl font-bold">
            User Management
          </div>
        }
      />


      {/* ============================== */}
      {/* MANAGER */}
      {/* ============================== */}

      <Route
        path="/manager"
        element={<ManagerDashboard />}
      />

      <Route
        path="/team-skills"
        element={
          <div className="p-8 text-2xl font-bold">
            Team Skill Coverage
          </div>
        }
      />

      <Route
        path="/team-gaps"
        element={
          <div className="p-8 text-2xl font-bold">
            Team Skill Gaps
          </div>
        }
      />

      <Route
        path="/high-risk-gaps"
        element={
          <div className="p-8 text-2xl font-bold">
            High-Risk Gaps
          </div>
        }
      />

      <Route
        path="/employee-progress"
        element={
          <div className="p-8 text-2xl font-bold">
            Employee Progress
          </div>
        }
      />

      <Route
        path="/learning-interventions"
        element={
          <div className="p-8 text-2xl font-bold">
            Learning Interventions
          </div>
        }
      />


      {/* ============================== */}
      {/* DEPARTMENT HEAD */}
      {/* ============================== */}

      <Route
        path="/department-head"
        element={<DepartmentHeadDashboard />}
      />

      <Route
        path="/team-gap-heatmap"
        element={
          <div className="p-8 text-2xl font-bold">
            Team Gap Heatmap
          </div>
        }
      />

      <Route
        path="/department-skills"
        element={
          <div className="p-8 text-2xl font-bold">
            Department Skill Coverage
          </div>
        }
      />

      <Route
        path="/training-adoption"
        element={
          <div className="p-8 text-2xl font-bold">
            Training Adoption
          </div>
        }
      />

      <Route
        path="/department-risk-gaps"
        element={
          <div className="p-8 text-2xl font-bold">
            High-Risk Skill Gaps
          </div>
        }
      />

      <Route
        path="/individual-progress"
        element={
          <div className="p-8 text-2xl font-bold">
            Individual Progress
          </div>
        }
      />


      {/* ============================== */}
      {/* MENTOR */}
      {/* ============================== */}

      <Route
        path="/mentor"
        element={<MentorDashboard />}
      />

      <Route
        path="/training-recommendations"
        element={
          <div className="p-8 text-2xl font-bold">
            Training Recommendations
          </div>
        }
      />

      <Route
        path="/training-catalog"
        element={
          <div className="p-8 text-2xl font-bold">
            Training Catalog
          </div>
        }
      />

      <Route
        path="/external-resources"
        element={
          <div className="p-8 text-2xl font-bold">
            External Resources
          </div>
        }
      />

      <Route
        path="/recommendation-analytics"
        element={
          <div className="p-8 text-2xl font-bold">
            Recommendation Analytics
          </div>
        }
      />


      {/* ============================== */}
      {/* SYSTEM ADMINISTRATOR */}
      {/* ============================== */}

      <Route
        path="/system-administrator"
        element={
          <SystemAdministratorDashboard />
        }
      />

      <Route
        path="/system-users"
        element={
          <div className="p-8 text-2xl font-bold">
            System User Management
          </div>
        }
      />

      <Route
        path="/system-reports"
        element={
          <div className="p-8 text-2xl font-bold">
            System Reports
          </div>
        }
      />

      <Route
        path="/system-settings"
        element={
          <div className="p-8 text-2xl font-bold">
            System Settings
          </div>
        }
      />


      {/* ============================== */}
      {/* COMMON REPORTS */}
      {/* ============================== */}

      <Route
        path="/reports"
        element={<ReportsAndAnalytics />}
      />

    </Routes>
  );
}

export default AppRoutes;