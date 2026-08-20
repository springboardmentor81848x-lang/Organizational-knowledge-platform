import React from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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

// ==================================================
// HR PAGES
// ==================================================

import HRDashboard from "../pages/HRDashboard";
import GapIntelligence from "../pages/GapIntelligence";
import CompetencyFramework from "../pages/CompetencyFramework";

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
// ROLE HELPER
// ==================================================

const getRole = () => {

  const role =
    localStorage.getItem("role") ||
    localStorage.getItem("userRole") ||
    "";

  return role
    .toUpperCase()
    .replace("ROLE_", "")
    .trim();
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

  // --------------------------------------------------
  // NOT LOGGED IN
  // --------------------------------------------------

  if (!token) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }

  // --------------------------------------------------
  // WRONG ROLE
  // --------------------------------------------------

  if (
    allowedRoles &&
    !allowedRoles.some(
      (allowedRole) =>
        allowedRole
          .toUpperCase()
          .trim() === role
    )
  ) {

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
// APP ROUTES
// ==================================================

function AppRoutes() {

  return (

    <Routes>

      {/* ==================================================
          PUBLIC ROUTES
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
          COMMON ROUTES
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
          EMPLOYEE SKILL ASSESSMENT
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
          ACTUAL ASSESSMENT QUESTIONS
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

      {/* ==================================================
          ASSESSMENT RESULT
      ================================================== */}

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
          EMPLOYEE MENTORSHIP
          
          Employee uses this page to:
          - View skill-gap based recommendations
          - Select a mentor
          - Send mentorship request
          - View own mentorship requests
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
          
          IMPORTANT:
          This is a SEPARATE system role.

          Mentor should NOT see the Employee Mentorship
          recommendation page.

          MentorDashboard should show:
          - Incoming mentorship requests
          - Requesting employee
          - Skill they need help with
          - Their current proficiency
          - Goal
          - Accept
          - Reject
          - Active mentorships
          - Completed mentorships
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
        element={<LearningAnalytics />}
      />
      <Route
        path="/training-management"
        element={
          <ProtectedRoute allowedRoles={["MENTOR"]}>
            <TrainingManagement />
          </ProtectedRoute>
        }
/>
<Route
  path="/mentor-management"
  element={<MentorManagement />}
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

      {/* ==================================================
          UNKNOWN URL
      ================================================== */}

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