import React from "react";

import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ==================================================
// COMMON
// ==================================================

import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Profile from "../pages/Profile";
import Notifications from "../pages/Notifications";
import DepartmentNotifications from "../pages/DepartmentNotifications";

// ==================================================
// EMPLOYEE
// ==================================================

import EmployeeDashboard from "../pages/EmployeeDashboard";
import Skills from "../pages/Skills";
import EmployeeSkillAssessment from "../pages/EmployeeSkillAssessment";
import Assessment from "../pages/Assessment";
import AssessmentResult from "../pages/AssessmentResult";
import Reassessment from "../pages/Reassessment";
import PeerAssessment from "../pages/PeerAssessment";
import KnowledgeGap from "../pages/KnowledgeGap";
import LearningPath from "../pages/LearningPath";
import TrainingLearning from "../pages/TrainingLearning";
import LearningProgress from "../pages/LearningProgress";
import KnowledgeSession from "../pages/KnowledgeSession";
import Mentorship from "../pages/Mentorship";
import Messages from "../pages/Messages";
import ExpertDirectory from "../pages/ExpertDirectory";

// ==================================================
// HR
// ==================================================

import HRDashboard from "../pages/HRDashboard";
import GapIntelligence from "../pages/GapIntelligence";
import CompetencyFramework from "../pages/CompetencyFramework";
import WorkforceSkillInventory from "../pages/WorkforceSkillInventory";
import MentorAllocation from "../pages/MentorAllocation";
import TrainingEffectiveness from "../pages/TrainingEffectiveness";
import SkillForecast from "../pages/SkillForecast";
import UserManagement from "../pages/UserManagement";
import HRReports from "../pages/HRReports";

// ==================================================
// MANAGER
// ==================================================

import ManagerDashboard from "../pages/ManagerDashboard";
import TeamCoverage from "../pages/TeamCoverage";
import ManagerTeamSkillGaps from "../pages/ManagerTeamSkillGaps";
import ManagerEmployeeProgress from "../pages/ManagerEmployeeProgress";
import ManagerTrainingAdoption from "../pages/ManagerTrainingAdoption";
import ManagerReports from "../pages/ManagerReports";
import ManagerNotifications from "../pages/ManagerNotifications";
import ManagerAssessment from "../pages/ManagerAssessment";

// ==================================================
// DEPARTMENT HEAD
// ==================================================

import DepartmentDashboard from "../pages/DepartmentDashboard";
import SkillCoverage from "../pages/SkillCoverage";
import TrainingAdoption from "../pages/TrainingAdoption";
import Reports from "../pages/Reports";

// ==================================================
// MENTOR
// ==================================================

import MentorDashboard from "../pages/MentorDashboard";
import LearningAnalytics from "../pages/LearningAnalytics";
import MentorManagement from "../pages/MentorManagement";
import CourseCatalog from "../pages/CourseCatalog";

// ==================================================
// SYSTEM ADMINISTRATOR
// ==================================================

import SystemAdministratorDashboard from "../pages/SystemAdministratorDashboard";

// ==================================================
// GET ROLE FROM JWT
// ==================================================

const getRoleFromToken = () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return "";
    }

    const parts = token.split(".");

    if (parts.length !== 3) {
      return "";
    }

    const base64Payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const payload = JSON.parse(
      atob(base64Payload)
    );

    let role =
      payload.role ||
      payload.roles ||
      payload.authorities ||
      "";

    if (Array.isArray(role)) {
      role = role.length > 0 ? role[0] : "";
    }

    if (
      Array.isArray(payload.authorities) &&
      payload.authorities.length > 0
    ) {
      const authority = payload.authorities[0];

      if (typeof authority === "object") {
        role =
          authority.authority ||
          role;
      }
    }

    return role;

  } catch (error) {
    console.error(
      "Unable to read role from JWT:",
      error
    );

    return "";
  }
};

// ==================================================
// NORMALIZE ROLE
// ==================================================

const normalizeRole = (role) => {
  if (!role) {
    return "";
  }

  if (Array.isArray(role)) {
    role = role[0] || "";
  }

  if (
    typeof role === "object" &&
    role !== null
  ) {
    role =
      role.authority ||
      role.role ||
      "";
  }

  return String(role)
    .toUpperCase()
    .replace(/^ROLE_/, "")
    .replace(/_/g, " ")
    .trim();
};

// ==================================================
// GET CURRENT ROLE
// ==================================================

const getRole = () => {
  let role =
    localStorage.getItem("role") ||
    localStorage.getItem("userRole") ||
    "";

  if (
    !role ||
    role === "null" ||
    role === "undefined"
  ) {
    role = getRoleFromToken();
  }

  return normalizeRole(role);
};

// ==================================================
// PROTECTED ROUTE
// ==================================================

function ProtectedRoute({
  children,
  allowedRoles,
}) {
  const token =
    localStorage.getItem("token");

  const role = getRole();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    !allowedRoles ||
    allowedRoles.length === 0
  ) {
    return children;
  }

  const normalizedAllowedRoles =
    allowedRoles.map(normalizeRole);

  if (
    normalizedAllowedRoles.includes(role)
  ) {
    return children;
  }

  return (
    <Navigate
      to="/unauthorized"
      replace
    />
  );
}

// ==================================================
// APP ROUTES
// ==================================================

function AppRoutes() {
  return (
    <Routes>

      {/* ==================================================
          PUBLIC
      ================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      {/* ==================================================
          COMMON
      ================================================== */}

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          COMMON NOTIFICATIONS
      ================================================== */}

      <Route
        path="/notifications"
        element={
          <ProtectedRoute
            allowedRoles={[
              "EMPLOYEE",
              "HR",
              "MANAGER",
              "MENTOR",
              "SYSTEM ADMINISTRATOR",
              "SYSTEM_ADMINISTRATOR",
              "ADMIN",
            ]}
          >
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          EMPLOYEE
      ================================================== */}

      <Route
        path="/employee"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee-dashboard"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          SKILL INVENTORY
      ================================================== */}

      <Route
        path="/skills"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <Skills />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          ORIGINAL SKILL ASSESSMENT
      ================================================== */}

      <Route
        path="/employee-assessment"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <EmployeeSkillAssessment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/skill-assessment"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <EmployeeSkillAssessment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/skill-assessment"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <EmployeeSkillAssessment />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          ASSESSMENT
      ================================================== */}

      <Route
        path="/employee/assessment"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <Assessment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/assessment/result"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <AssessmentResult />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          REASSESSMENT
      ================================================== */}

      <Route
        path="/reassessment"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <Reassessment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/reassessment"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <Reassessment />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          PEER ASSESSMENT
      ================================================== */}

      <Route
        path="/peer-assessment"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <PeerAssessment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/peer-assessment"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <PeerAssessment />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          KNOWLEDGE GAP
      ================================================== */}

      <Route
        path="/knowledge-gap"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <KnowledgeGap />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          LEARNING PATH
      ================================================== */}

      <Route
        path="/learning-path"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <LearningPath />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          TRAINING & LEARNING
      ================================================== */}

      <Route
        path="/training-learning"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <TrainingLearning />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/training-learning"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <TrainingLearning />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          LEARNING PROGRESS
      ================================================== */}

      <Route
        path="/learning-progress"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <LearningProgress />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/learning-progress"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <LearningProgress />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          KNOWLEDGE SESSIONS
      ================================================== */}

      <Route
        path="/knowledge-sessions"
        element={
          <ProtectedRoute
            allowedRoles={[
              "EMPLOYEE",
              "MENTOR",
            ]}
          >
            <KnowledgeSession />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          MENTORSHIP & PEER MENTORING
      ================================================== */}

      <Route
        path="/mentorship"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <Mentorship />
          </ProtectedRoute>
        }
      />

      <Route
        path="/peer-mentoring"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <Mentorship />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/mentorship"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <Mentorship />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/peer-mentoring"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <Mentorship />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          PEER MENTORING MESSAGES / CHAT
      ================================================== */}

      <Route
        path="/messages"
        element={
          <ProtectedRoute
            allowedRoles={[
              "EMPLOYEE",
              "MENTOR",
            ]}
          >
            <Messages />
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages/:mentorshipId"
        element={
          <ProtectedRoute
            allowedRoles={[
              "EMPLOYEE",
              "MENTOR",
            ]}
          >
            <Messages />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/messages"
        element={
          <ProtectedRoute
            allowedRoles={[
              "EMPLOYEE",
              "MENTOR",
            ]}
          >
            <Messages />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          EXPERT DIRECTORY
      ================================================== */}

      <Route
        path="/expert-directory"
        element={
          <ProtectedRoute
            allowedRoles={[
              "EMPLOYEE",
              "MENTOR",
              "MANAGER",
              "HR",
              "DEPARTMENT HEAD",
              "DEPARTMENT_HEAD",
              "SYSTEM ADMINISTRATOR",
              "SYSTEM_ADMINISTRATOR",
              "ADMIN",
            ]}
          >
            <ExpertDirectory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/expert-directory"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          >
            <ExpertDirectory />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          HR
      ================================================== */}

      <Route
        path="/hr"
        element={
          <ProtectedRoute
            allowedRoles={["HR"]}
          >
            <HRDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hr/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={["HR"]}
          >
            <HRDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hr/gap-intelligence"
        element={
          <ProtectedRoute
            allowedRoles={["HR"]}
          >
            <GapIntelligence />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hr/workforce-skills"
        element={
          <ProtectedRoute
            allowedRoles={["HR"]}
          >
            <WorkforceSkillInventory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/competency-framework"
        element={
          <ProtectedRoute
            allowedRoles={["HR"]}
          >
            <CompetencyFramework />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hr/mentor-allocation"
        element={
          <ProtectedRoute
            allowedRoles={["HR"]}
          >
            <MentorAllocation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/training-effectiveness"
        element={
          <ProtectedRoute
            allowedRoles={["HR"]}
          >
            <TrainingEffectiveness />
          </ProtectedRoute>
        }
      />

      <Route
        path="/skill-forecast"
        element={
          <ProtectedRoute
            allowedRoles={["HR"]}
          >
            <SkillForecast />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute
            allowedRoles={[
              "HR",
              "SYSTEM ADMINISTRATOR",
              "SYSTEM_ADMINISTRATOR",
              "ADMIN",
            ]}
          >
            <UserManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hr/reports"
        element={
          <ProtectedRoute
            allowedRoles={["HR"]}
          >
            <HRReports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/system-administrator/users"
        element={
          <ProtectedRoute
            allowedRoles={[
              "SYSTEM ADMINISTRATOR",
              "SYSTEM_ADMINISTRATOR",
              "ADMIN",
            ]}
          >
            <UserManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/system-administrator/reports"
        element={
          <ProtectedRoute
            allowedRoles={[
              "SYSTEM ADMINISTRATOR",
              "SYSTEM_ADMINISTRATOR",
              "ADMIN",
            ]}
          >
            <HRReports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/system-administrator/notifications"
        element={
          <ProtectedRoute
            allowedRoles={[
              "SYSTEM ADMINISTRATOR",
              "SYSTEM_ADMINISTRATOR",
              "ADMIN",
            ]}
          >
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          MANAGER
      ================================================== */}

      <Route
        path="/manager"
        element={
          <ProtectedRoute
            allowedRoles={["MANAGER"]}
          >
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={["MANAGER"]}
          >
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          TEAM SKILL COVERAGE
      ================================================== */}

      <Route
        path="/team-skills"
        element={
          <ProtectedRoute
            allowedRoles={["MANAGER"]}
          >
            <TeamCoverage />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          TEAM SKILL GAPS
      ================================================== */}

      <Route
        path="/team-gaps"
        element={
          <ProtectedRoute
            allowedRoles={["MANAGER"]}
          >
            <ManagerTeamSkillGaps />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/team-skill-gaps"
        element={
          <ProtectedRoute
            allowedRoles={["MANAGER"]}
          >
            <ManagerTeamSkillGaps />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          HIGH RISK GAPS
      ================================================== */}

      <Route
        path="/high-risk-gaps"
        element={
          <ProtectedRoute
            allowedRoles={["MANAGER"]}
          >
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          EMPLOYEE PROGRESS
      ================================================== */}

      <Route
        path="/employee-progress"
        element={
          <ProtectedRoute
            allowedRoles={["MANAGER"]}
          >
            <ManagerEmployeeProgress />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/employee-progress"
        element={
          <ProtectedRoute
            allowedRoles={["MANAGER"]}
          >
            <ManagerEmployeeProgress />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          MANAGER ASSESSMENT
      ================================================== */}

      <Route
        path="/manager-assessment"
        element={
          <ProtectedRoute
            allowedRoles={["MANAGER"]}
          >
            <ManagerAssessment />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          MANAGER REPORTS
      ================================================== */}

      <Route
        path="/reports"
        element={
          <ProtectedRoute
            allowedRoles={[
              "MANAGER",
              "DEPARTMENT HEAD",
              "DEPARTMENT_HEAD",
              "SYSTEM ADMINISTRATOR",
              "SYSTEM_ADMINISTRATOR",
              "ADMIN",
            ]}
          >
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager-reports"
        element={
          <ProtectedRoute
            allowedRoles={["MANAGER"]}
          >
            <ManagerReports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/reports"
        element={
          <ProtectedRoute
            allowedRoles={["MANAGER"]}
          >
            <ManagerReports />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          MANAGER TRAINING
      ================================================== */}

      <Route
        path="/training"
        element={
          <ProtectedRoute
            allowedRoles={["MANAGER"]}
          >
            <TrainingLearning />
          </ProtectedRoute>
        }
      />

      <Route
        path="/training-adoption"
        element={
          <ProtectedRoute
            allowedRoles={["MANAGER"]}
          >
            <ManagerTrainingAdoption />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/training-adoption"
        element={
          <ProtectedRoute
            allowedRoles={["MANAGER"]}
          >
            <ManagerTrainingAdoption />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          MANAGER LEARNING INTERVENTIONS
      ================================================== */}

      <Route
        path="/learning-interventions"
        element={
          <ProtectedRoute
            allowedRoles={["MANAGER"]}
          >
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/notifications"
        element={
          <ProtectedRoute
            allowedRoles={["MANAGER"]}
          >
            <ManagerNotifications />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          DEPARTMENT HEAD
      ================================================== */}

      <Route
        path="/department-head"
        element={
          <ProtectedRoute
            allowedRoles={[
              "DEPARTMENT HEAD",
              "DEPARTMENT_HEAD",
            ]}
          >
            <DepartmentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/department-head/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={[
              "DEPARTMENT HEAD",
              "DEPARTMENT_HEAD",
            ]}
          >
            <DepartmentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/department-head/skill-coverage"
        element={
          <ProtectedRoute
            allowedRoles={[
              "DEPARTMENT HEAD",
              "DEPARTMENT_HEAD",
            ]}
          >
            <SkillCoverage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/skill-coverage"
        element={
          <ProtectedRoute
            allowedRoles={[
              "DEPARTMENT HEAD",
              "DEPARTMENT_HEAD",
            ]}
          >
            <SkillCoverage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/department-head/training-adoption"
        element={
          <ProtectedRoute
            allowedRoles={[
              "DEPARTMENT HEAD",
              "DEPARTMENT_HEAD",
            ]}
          >
            <TrainingAdoption />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          DEPARTMENT HEAD REPORTS
      ================================================== */}

      <Route
        path="/department-head/reports"
        element={
          <ProtectedRoute
            allowedRoles={[
              "DEPARTMENT HEAD",
              "DEPARTMENT_HEAD",
            ]}
          >
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          DEPARTMENT HEAD NOTIFICATIONS
      ================================================== */}

      <Route
        path="/department-head/notifications"
        element={
          <ProtectedRoute
            allowedRoles={[
              "DEPARTMENT HEAD",
              "DEPARTMENT_HEAD",
            ]}
          >
            <DepartmentNotifications />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          MENTOR
      ================================================== */}

      <Route
        path="/mentor"
        element={
          <ProtectedRoute
            allowedRoles={["MENTOR"]}
          >
            <MentorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mentor/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={["MENTOR"]}
          >
            <MentorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/learning-analytics"
        element={
          <ProtectedRoute
            allowedRoles={["MENTOR"]}
          >
            <LearningAnalytics />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          MENTOR MANAGEMENT
      ================================================== */}

      <Route
        path="/mentor-management"
        element={
          <ProtectedRoute
            allowedRoles={["MENTOR"]}
          >
            <MentorManagement />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          TRAINING CATALOG
      ================================================== */}

      <Route
        path="/training-catalog"
        element={
          <ProtectedRoute
            allowedRoles={["MENTOR"]}
          >
            <CourseCatalog />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          SYSTEM ADMINISTRATOR
      ================================================== */}

      <Route
        path="/system-administrator"
        element={
          <ProtectedRoute
            allowedRoles={[
              "SYSTEM ADMINISTRATOR",
              "SYSTEM_ADMINISTRATOR",
              "ADMIN",
            ]}
          >
            <SystemAdministratorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/system-administrator/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={[
              "SYSTEM ADMINISTRATOR",
              "SYSTEM_ADMINISTRATOR",
              "ADMIN",
            ]}
          >
            <SystemAdministratorDashboard />
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          UNAUTHORIZED
      ================================================== */}

      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center bg-slate-50">

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center max-w-md">

              <h1 className="text-3xl font-bold text-red-600">
                Unauthorized
              </h1>

              <p className="text-slate-500 mt-3">
                You do not have permission to access this page.
              </p>

              <button
                onClick={() =>
                  window.history.back()
                }
                className="mt-6 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Go Back
              </button>

            </div>

          </div>
        }
      />

      {/* ==================================================
          DEFAULT
      ================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>
  );
}

export default AppRoutes;