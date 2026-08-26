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
import ReportsAndAnalytics from "../pages/ReportsAndAnalytics";
import Reviews from "../pages/Reviews";

import Sidebar from "../components/Sidebar";

// ==================================================
// EMPLOYEE
// ==================================================

import EmployeeDashboard from "../pages/EmployeeDashboard";
import Skills from "../pages/Skills";
import EmployeeSkillAssessment from "../pages/EmployeeSkillAssessment";
import Assessment from "../pages/Assessment";
import AssessmentResult from "../pages/AssessmentResult";
import KnowledgeGap from "../pages/KnowledgeGap";
import LearningPath from "../pages/LearningPath";
import TrainingLearning from "../pages/TrainingLearning";
import LearningProgress from "../pages/LearningProgress";
import KnowledgeSession from "../pages/KnowledgeSession";
import Mentorship from "../pages/Mentorship";
import ExpertDirectory from "../pages/ExpertDirectory";

// ==================================================
// HR
// ==================================================

import HRDashboard from "../pages/HRDashboard";
import GapIntelligence from "../pages/GapIntelligence";
import CompetencyFramework from "../pages/CompetencyFramework";
import WorkforceSkillInventory from "../pages/WorkforceSkillInventory";
import MentorAllocation from "../pages/MentorAllocation";

// ==================================================
// MANAGER
// ==================================================

import ManagerDashboard from "../pages/ManagerDashboard";

// ==================================================
// DEPARTMENT HEAD
// ==================================================

import DepartmentHeadDashboard from "../pages/DepartmentHeadDashboard";

// ==================================================
// MENTOR
// ==================================================

import MentorDashboard from "../pages/MentorDashboard";
import LearningAnalytics from "../pages/LearningAnalytics";
import TrainingManagement from "../pages/TrainingManagement";
import MentorManagement from "../pages/MentorManagement";

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

    console.log("JWT payload:", payload);

    return (
      payload.role ||
      payload.roles ||
      payload.authorities ||
      ""
    );
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
    role = role[0];
  }

  return String(role)
    .toUpperCase()
    .replace("ROLE_", "")
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
  const token = localStorage.getItem("token");
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
    !normalizedAllowedRoles.includes(role)
  ) {
    console.error(
      "ACCESS DENIED",
      {
        currentRole: role,
        allowedRoles:
          normalizedAllowedRoles,
      }
    );

    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return children;
}

// ==================================================
// DASHBOARD LAYOUT
// IMPORTANT:
// SIDEBAR IS RENDERED ONLY HERE
// ==================================================

function DashboardLayout({
  children,
}) {
  const role = getRole();

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ==================================================
          SINGLE SIDEBAR
      ================================================== */}

      <Sidebar role={role} />

      {/* ==================================================
          PAGE CONTENT
      ================================================== */}

      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>

    </div>
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
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Notifications />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ReportsAndAnalytics />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reviews"
        element={
          <ProtectedRoute
            allowedRoles={[
              "EMPLOYEE",
              "MANAGER",
              "HR",
            ]}
          >
            <DashboardLayout>
              <Reviews />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          EMPLOYEE DASHBOARD
      ================================================== */}

      <Route
        path="/employee"
        element={
          <ProtectedRoute
            allowedRoles={[
              "EMPLOYEE",
            ]}
          >
            <DashboardLayout>
              <EmployeeDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee-dashboard"
        element={
          <ProtectedRoute
            allowedRoles={[
              "EMPLOYEE",
            ]}
          >
            <DashboardLayout>
              <EmployeeDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          EMPLOYEE SKILLS
      ================================================== */}

      <Route
        path="/skills"
        element={
          <ProtectedRoute
            allowedRoles={[
              "EMPLOYEE",
            ]}
          >
            <DashboardLayout>
              <Skills />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          EMPLOYEE SKILL ASSESSMENT
      ================================================== */}

      <Route
        path="/employee-assessment"
        element={
          <ProtectedRoute
            allowedRoles={[
              "EMPLOYEE",
            ]}
          >
            <DashboardLayout>
              <EmployeeSkillAssessment />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/skill-assessment"
        element={
          <ProtectedRoute
            allowedRoles={[
              "EMPLOYEE",
            ]}
          >
            <DashboardLayout>
              <EmployeeSkillAssessment />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/skill-assessment"
        element={
          <ProtectedRoute
            allowedRoles={[
              "EMPLOYEE",
            ]}
          >
            <DashboardLayout>
              <EmployeeSkillAssessment />
            </DashboardLayout>
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
            allowedRoles={[
              "EMPLOYEE",
            ]}
          >
            <DashboardLayout>
              <Assessment />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/assessment/result"
        element={
          <ProtectedRoute
            allowedRoles={[
              "EMPLOYEE",
            ]}
          >
            <DashboardLayout>
              <AssessmentResult />
            </DashboardLayout>
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
            allowedRoles={[
              "EMPLOYEE",
            ]}
          >
            <DashboardLayout>
              <KnowledgeGap />
            </DashboardLayout>
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
            allowedRoles={[
              "EMPLOYEE",
            ]}
          >
            <DashboardLayout>
              <LearningPath />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          TRAINING
      ================================================== */}

      <Route
        path="/training-learning"
        element={
          <ProtectedRoute
            allowedRoles={[
              "EMPLOYEE",
            ]}
          >
            <DashboardLayout>
              <TrainingLearning />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/training-learning"
        element={
          <ProtectedRoute
            allowedRoles={[
              "EMPLOYEE",
            ]}
          >
            <DashboardLayout>
              <TrainingLearning />
            </DashboardLayout>
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
            allowedRoles={[
              "EMPLOYEE",
            ]}
          >
            <DashboardLayout>
              <LearningProgress />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/learning-progress"
        element={
          <ProtectedRoute
            allowedRoles={[
              "EMPLOYEE",
            ]}
          >
            <DashboardLayout>
              <LearningProgress />
            </DashboardLayout>
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
            <DashboardLayout>
              <KnowledgeSession />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          MENTORSHIP
      ================================================== */}

      <Route
        path="/mentorship"
        element={
          <ProtectedRoute
            allowedRoles={[
              "EMPLOYEE",
            ]}
          >
            <DashboardLayout>
              <Mentorship />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/mentorship"
        element={
          <ProtectedRoute
            allowedRoles={[
              "EMPLOYEE",
            ]}
          >
            <DashboardLayout>
              <Mentorship />
            </DashboardLayout>
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
            <DashboardLayout>
              <ExpertDirectory />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/expert-directory"
        element={
          <ProtectedRoute
            allowedRoles={[
              "EMPLOYEE",
            ]}
          >
            <DashboardLayout>
              <ExpertDirectory />
            </DashboardLayout>
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
            allowedRoles={[
              "HR",
            ]}
          >
            <DashboardLayout>
              <HRDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hr/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={[
              "HR",
            ]}
          >
            <DashboardLayout>
              <HRDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hr/gap-intelligence"
        element={
          <ProtectedRoute
            allowedRoles={[
              "HR",
            ]}
          >
            <DashboardLayout>
              <GapIntelligence />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hr/workforce-skills"
        element={
          <ProtectedRoute
            allowedRoles={[
              "HR",
            ]}
          >
            <DashboardLayout>
              <WorkforceSkillInventory />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/competency-framework"
        element={
          <ProtectedRoute
            allowedRoles={[
              "HR",
            ]}
          >
            <DashboardLayout>
              <CompetencyFramework />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hr/mentor-allocation"
        element={
          <ProtectedRoute
            allowedRoles={[
              "HR",
            ]}
          >
            <DashboardLayout>
              <MentorAllocation />
            </DashboardLayout>
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
            allowedRoles={[
              "MANAGER",
            ]}
          >
            <DashboardLayout>
              <ManagerDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={[
              "MANAGER",
            ]}
          >
            <DashboardLayout>
              <ManagerDashboard />
            </DashboardLayout>
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
            <DashboardLayout>
              <DepartmentHeadDashboard />
            </DashboardLayout>
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
            <DashboardLayout>
              <DepartmentHeadDashboard />
            </DashboardLayout>
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
            allowedRoles={[
              "MENTOR",
            ]}
          >
            <DashboardLayout>
              <MentorDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/mentor/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={[
              "MENTOR",
            ]}
          >
            <DashboardLayout>
              <MentorDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/learning-analytics"
        element={
          <ProtectedRoute
            allowedRoles={[
              "MENTOR",
            ]}
          >
            <DashboardLayout>
              <LearningAnalytics />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/training-management"
        element={
          <ProtectedRoute
            allowedRoles={[
              "MENTOR",
            ]}
          >
            <DashboardLayout>
              <TrainingManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/mentor-management"
        element={
          <ProtectedRoute
            allowedRoles={[
              "MENTOR",
            ]}
          >
            <DashboardLayout>
              <MentorManagement />
            </DashboardLayout>
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
            <DashboardLayout>
              <SystemAdministratorDashboard />
            </DashboardLayout>
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
            <DashboardLayout>
              <SystemAdministratorDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* ==================================================
          UNAUTHORIZED
      ================================================== */}

      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center max-w-md w-full">

              <h1 className="text-3xl font-bold text-red-600">
                Unauthorized
              </h1>

              <p className="text-slate-500 mt-3">
                You do not have permission
                to access this page.
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