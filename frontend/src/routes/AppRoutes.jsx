import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// ==================================================
// COMMON PAGES
// ==================================================

import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Profile from "../pages/Profile";
import Notifications from "../pages/Notifications";
import ReportsAndAnalytics from "../pages/ReportsAndAnalytics";

// ==================================================
// EMPLOYEE PAGES
// ==================================================

import EmployeeDashboard from "../pages/EmployeeDashboard";
import Skills from "../pages/Skills";
import EmployeeSkillAssessment from "../pages/EmployeeSkillAssessment";
import Assessment from "../pages/Assessment";
import AssessmentResult from "../pages/AssessmentResult";
import KnowledgeGap from "../pages/KnowledgeGap";
import LearningPath from "../pages/LearningPath";
import TrainingLearning from "../pages/TrainingLearning";
import KnowledgeSession from "../pages/KnowledgeSession";
import Mentorship from "../pages/Mentorship";
import ExpertDirectory from "../pages/ExpertDirectory";

// ==================================================
// HR PAGES
// ==================================================

import HRDashboard from "../pages/HRDashboard";
import GapIntelligence from "../pages/GapIntelligence";
import CompetencyFramework from "../pages/CompetencyFramework";
import WorkforceSkillInventory from "../pages/WorkforceSkillInventory";

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

    const payload = JSON.parse(
      atob(
        parts[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    console.log("JWT payload:", payload);

    return payload.role || "";
  } catch (error) {
    console.error("Unable to read role from JWT:", error);
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

  return String(role)
    .toUpperCase()
    .replace("ROLE_", "")
    .replace(/_/g, " ")
    .trim();
};

// ==================================================
// GET CURRENT USER ROLE
// ==================================================

const getRole = () => {
  // First try localStorage
  let role =
    localStorage.getItem("role") ||
    localStorage.getItem("userRole") ||
    "";

  console.log("Role from localStorage:", role);

  // If localStorage role is empty/null,
  // read it directly from JWT
  if (!role || role === "null" || role === "undefined") {
    role = getRoleFromToken();

    console.log(
      "Role extracted from JWT:",
      role
    );
  }

  const normalizedRole = normalizeRole(role);

  console.log(
    "Final normalized role:",
    normalizedRole
  );

  return normalizedRole;
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

  console.log("--------------------------------");
  console.log("PROTECTED ROUTE");
  console.log("Token exists:", !!token);
  console.log("Current role:", role);
  console.log("Allowed roles:", allowedRoles);
  console.log("--------------------------------");

  // ==================================================
  // NOT LOGGED IN
  // ==================================================

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // ==================================================
  // ROLE CHECK
  // ==================================================

  if (
    allowedRoles &&
    allowedRoles.length > 0
  ) {
    const normalizedAllowedRoles =
      allowedRoles.map(normalizeRole);

    console.log(
      "Normalized allowed roles:",
      normalizedAllowedRoles
    );

    if (
      !normalizedAllowedRoles.includes(role)
    ) {
      console.error("ACCESS DENIED");

      console.error(
        "Current role:",
        role
      );

      console.error(
        "Allowed roles:",
        normalizedAllowedRoles
      );

      return (
        <Navigate
          to="/unauthorized"
          replace
        />
      );
    }
  }

  return children;
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

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsAndAnalytics />
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
          KNOWLEDGE SESSION
      ================================================== */}

      <Route
        path="/knowledge-sessions"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE", "MENTOR"]}
          >
            <KnowledgeSession />
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

      {/* ==================================================
          EXPERT DIRECTORY (MODULE 3)
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
            <DepartmentHeadDashboard />
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
            <DepartmentHeadDashboard />
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

      <Route
        path="/training-management"
        element={
          <ProtectedRoute
            allowedRoles={["MENTOR"]}
          >
            <TrainingManagement />
          </ProtectedRoute>
        }
      />

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
          <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center max-w-md w-full">

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