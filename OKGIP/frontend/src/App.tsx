import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// =====================================================
// AUTH
// =====================================================
import { Login } from "@/pages/auth/Login";
import { Register } from "@/pages/auth/Register";

// =====================================================
// EMPLOYEE
// =====================================================
import EmployeeDashboard from "@/pages/employee/Dashboard";
import EmployeeProfile from "@/pages/employee/Profile";
import EmployeeSkills from "@/pages/employee/Skills";
import SelfAssessment from "@/pages/employee/SelfAssessment";
import PeerAssessment from "@/pages/employee/PeerAssessment";
import EmployeeProficiency from "@/pages/employee/Proficiency";
import SkillGapsPage from "@/pages/employee/SkillGapsPage";
import LearningPaths from "@/pages/employee/LearningPaths";
import EmployeeTraining from "@/pages/employee/Training";
import TrainingLearn from "@/pages/employee/TrainingLearn";
import EmployeeProgress from "@/pages/employee/Progress";
import Achievements from "@/pages/employee/Achievements";
import Certifications from "@/pages/employee/Certifications";
import Mentorship from "@/pages/employee/Mentorship";
import EmployeeNotifications from "@/pages/employee/Notifications";
import EmployeeSettings from "@/pages/employee/Settings";
import Experience from "@/pages/employee/Experience";

// =====================================================
// HR
// =====================================================
import HRDashboard from "@/pages/hr/Dashboard";
import HREmployees from "@/pages/hr/Employees";
import HRDepartments from "@/pages/hr/Departments";
import HRJobRoles from "@/pages/hr/JobRoles";
import HRSkills from "@/pages/hr/Skills";
import HRCompetencyFramework from "@/pages/hr/CompetencyFramework";
import HRKnowledgeGaps from "@/pages/hr/KnowledgeGaps";
import HRAIRecommendations from "@/pages/hr/AIRecommendations";
import HRTrainingManagement from "@/pages/hr/TrainingManagement";
import HRAssessments from "@/pages/hr/Assessments";
import HRReports from "@/pages/hr/Reports";
import HRSettings from "@/pages/hr/Settings";
import HRApprovals from "@/pages/hr/Approvals";

// =====================================================
// MANAGER
// =====================================================
import ManagerDashboard from "@/pages/manager/Dashboard";
import ManagerEmployees from "@/pages/manager/Employees";
import ManagerDepartments from "@/pages/manager/Departments";
import ManagerJobRoles from "@/pages/manager/JobRoles";
import ManagerSkills from "@/pages/manager/Skills";
import ManagerCompetencyFramework from "@/pages/manager/CompetencyFramework";
import ManagerKnowledgeGapAnalysis from "@/pages/manager/KnowledgeGapAnalysis";
import ManagerAIRecommendations from "@/pages/manager/AIRecommendations";
import ManagerTrainingManagement from "@/pages/manager/TrainingManagement";
import ManagerAssessments from "@/pages/manager/Assessments";
import ManagerReports from "@/pages/manager/Reports";
import ManagerSettings from "@/pages/manager/Settings";

// =====================================================
// ADMIN
// =====================================================
import AdminDashboard from "@/pages/admin/Dashboard";

// =====================================================
// MENTOR
// =====================================================
import MentorDashboard from "@/pages/mentor/Dashboard";
import MentorRequests from "@/pages/mentor/Requests";
import MentorSessions from "@/pages/mentor/Sessions";
import MentorMentees from "@/pages/mentor/Mentees";
import MentorKnowledgeSharing from "@/pages/mentor/KnowledgeSharing";
import MentorExpertise from "@/pages/mentor/Expertise";
import MentorAnalytics from "@/pages/mentor/Analytics";
import MentorNotifications from "@/pages/mentor/Notifications";
import MentorSettings from "@/pages/mentor/Settings";

// =====================================================
// ROLE GATE
// =====================================================
const RoleGate: React.FC<{
  role: "employee" | "hr" | "manager" | "admin" | "mentor";
  children: React.ReactNode;
}> = ({ role: requiredRole, children }) => {
  const { role, profileLoading } = useAuth();

  if (profileLoading && role === null) {
    return null;
  }

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (role !== requiredRole) {
    return (
      <Navigate
        to={
          role === "mentor"
            ? "/mentor/dashboard"
            : `/${role}`
        }
        replace
      />
    );
  }

  return <>{children}</>;
};

// =====================================================
// APP
// =====================================================
const App: React.FC = () => {
  return (
    <Routes>

      {/* =================================================
          AUTH
      ================================================= */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* =================================================
          EMPLOYEE
      ================================================= */}
      <Route
        path="/employee"
        element={
          <RoleGate role="employee">
            <EmployeeDashboard />
          </RoleGate>
        }
      />

      <Route
        path="/employee/profile"
        element={
          <RoleGate role="employee">
            <EmployeeProfile />
          </RoleGate>
        }
      />

      <Route
        path="/employee/skills"
        element={
          <RoleGate role="employee">
            <EmployeeSkills />
          </RoleGate>
        }
      />

      <Route
        path="/employee/self-assessment"
        element={
          <RoleGate role="employee">
            <SelfAssessment />
          </RoleGate>
        }
      />

      <Route
        path="/employee/peer-assessment"
        element={
          <RoleGate role="employee">
            <PeerAssessment />
          </RoleGate>
        }
      />

      <Route
        path="/employee/proficiency"
        element={
          <RoleGate role="employee">
            <EmployeeProficiency />
          </RoleGate>
        }
      />

      <Route
        path="/employee/skill-gaps"
        element={
          <RoleGate role="employee">
            <SkillGapsPage />
          </RoleGate>
        }
      />

      <Route
        path="/employee/learning-paths"
        element={
          <RoleGate role="employee">
            <LearningPaths />
          </RoleGate>
        }
      />

      <Route
        path="/employee/training"
        element={
          <RoleGate role="employee">
            <EmployeeTraining />
          </RoleGate>
        }
      />

      <Route
        path="/employee/training/:trainingId/learn"
        element={
          <RoleGate role="employee">
            <TrainingLearn />
          </RoleGate>
        }
      />

      <Route
        path="/employee/experience"
        element={
          <RoleGate role="employee">
            <Experience />
          </RoleGate>
        }
      />

      <Route
        path="/employee/progress"
        element={
          <RoleGate role="employee">
            <EmployeeProgress />
          </RoleGate>
        }
      />

      <Route
        path="/employee/achievements"
        element={
          <RoleGate role="employee">
            <Achievements />
          </RoleGate>
        }
      />

      <Route
        path="/employee/certifications"
        element={
          <RoleGate role="employee">
            <Certifications />
          </RoleGate>
        }
      />

      <Route
        path="/employee/mentorship"
        element={
          <RoleGate role="employee">
            <Mentorship />
          </RoleGate>
        }
      />

      <Route
        path="/employee/notifications"
        element={
          <RoleGate role="employee">
            <EmployeeNotifications />
          </RoleGate>
        }
      />

      <Route
        path="/employee/settings"
        element={
          <RoleGate role="employee">
            <EmployeeSettings />
          </RoleGate>
        }
      />

      {/* =================================================
          HR
      ================================================= */}

      <Route
        path="/hr"
        element={
          <RoleGate role="hr">
            <HRDashboard />
          </RoleGate>
        }
      />

      <Route
        path="/hr/employees"
        element={
          <RoleGate role="hr">
            <HREmployees />
          </RoleGate>
        }
      />

      <Route
        path="/hr/departments"
        element={
          <RoleGate role="hr">
            <HRDepartments />
          </RoleGate>
        }
      />

      <Route
        path="/hr/job-roles"
        element={
          <RoleGate role="hr">
            <HRJobRoles />
          </RoleGate>
        }
      />

      <Route
        path="/hr/workforce-skills"
        element={
          <RoleGate role="hr">
            <HRSkills />
          </RoleGate>
        }
      />

      <Route
        path="/hr/competency-framework"
        element={
          <RoleGate role="hr">
            <HRCompetencyFramework />
          </RoleGate>
        }
      />

      <Route
        path="/hr/knowledge-gaps"
        element={
          <RoleGate role="hr">
            <HRKnowledgeGaps />
          </RoleGate>
        }
      />

      <Route
        path="/hr/ai-recommendations"
        element={
          <RoleGate role="hr">
            <HRAIRecommendations />
          </RoleGate>
        }
      />

      <Route
        path="/hr/training-analytics"
        element={
          <RoleGate role="hr">
            <HRTrainingManagement />
          </RoleGate>
        }
      />

      <Route
        path="/hr/assessments"
        element={
          <RoleGate role="hr">
            <HRAssessments />
          </RoleGate>
        }
      />

      <Route
        path="/hr/reports"
        element={
          <RoleGate role="hr">
            <HRReports />
          </RoleGate>
        }
      />

      <Route
        path="/hr/settings"
        element={
          <RoleGate role="hr">
            <HRSettings />
          </RoleGate>
        }
      />

      {/* Extra HR pages */}
      <Route
        path="/hr/approvals"
        element={
          <RoleGate role="hr">
            <HRApprovals />
          </RoleGate>
        }
      />

      

      {/* =================================================
          MANAGER
      ================================================= */}

      <Route
        path="/manager"
        element={
          <RoleGate role="manager">
            <ManagerDashboard />
          </RoleGate>
        }
      />

      <Route
        path="/manager/dashboard"
        element={
          <RoleGate role="manager">
            <ManagerDashboard />
          </RoleGate>
        }
      />

      <Route
        path="/manager/employees"
        element={
          <RoleGate role="manager">
            <ManagerEmployees />
          </RoleGate>
        }
      />

      <Route
        path="/manager/departments"
        element={
          <RoleGate role="manager">
            <ManagerDepartments />
          </RoleGate>
        }
      />

      <Route
        path="/manager/job-roles"
        element={
          <RoleGate role="manager">
            <ManagerJobRoles />
          </RoleGate>
        }
      />

      <Route
        path="/manager/skills"
        element={
          <RoleGate role="manager">
            <ManagerSkills />
          </RoleGate>
        }
      />

      <Route
        path="/manager/competency-framework"
        element={
          <RoleGate role="manager">
            <ManagerCompetencyFramework />
          </RoleGate>
        }
      />

      <Route
        path="/manager/knowledge-gap-analysis"
        element={
          <RoleGate role="manager">
            <ManagerKnowledgeGapAnalysis />
          </RoleGate>
        }
      />

      <Route
        path="/manager/ai-recommendations"
        element={
          <RoleGate role="manager">
            <ManagerAIRecommendations />
          </RoleGate>
        }
      />

      <Route
        path="/manager/training-management"
        element={
          <RoleGate role="manager">
            <ManagerTrainingManagement />
          </RoleGate>
        }
      />

      <Route
        path="/manager/assessments"
        element={
          <RoleGate role="manager">
            <ManagerAssessments />
          </RoleGate>
        }
      />

      <Route
        path="/manager/reports"
        element={
          <RoleGate role="manager">
            <ManagerReports />
          </RoleGate>
        }
      />

      <Route
        path="/manager/settings"
        element={
          <RoleGate role="manager">
            <ManagerSettings />
          </RoleGate>
        }
      />

      {/* =================================================
          ADMIN
      ================================================= */}

      <Route
        path="/admin/*"
        element={
          <RoleGate role="admin">
            <AdminDashboard />
          </RoleGate>
        }
      />

      {/* =================================================
          MENTOR
      ================================================= */}

      <Route
        path="/mentor"
        element={
          <Navigate to="/mentor/dashboard" replace />
        }
      />

      <Route
        path="/mentor/dashboard"
        element={
          <RoleGate role="mentor">
            <MentorDashboard />
          </RoleGate>
        }
      />

      <Route
        path="/mentor/mentees"
        element={
          <RoleGate role="mentor">
            <MentorMentees />
          </RoleGate>
        }
      />

      <Route
        path="/mentor/requests"
        element={
          <RoleGate role="mentor">
            <MentorRequests />
          </RoleGate>
        }
      />

      <Route
        path="/mentor/sessions"
        element={
          <RoleGate role="mentor">
            <MentorSessions />
          </RoleGate>
        }
      />

      <Route
        path="/mentor/knowledge-sharing"
        element={
          <RoleGate role="mentor">
            <MentorKnowledgeSharing />
          </RoleGate>
        }
      />

      <Route
        path="/mentor/expertise"
        element={
          <RoleGate role="mentor">
            <MentorExpertise />
          </RoleGate>
        }
      />

      <Route
        path="/mentor/analytics"
        element={
          <RoleGate role="mentor">
            <MentorAnalytics />
          </RoleGate>
        }
      />

      <Route
        path="/mentor/notifications"
        element={
          <RoleGate role="mentor">
            <MentorNotifications />
          </RoleGate>
        }
      />

      <Route
        path="/mentor/settings"
        element={
          <RoleGate role="mentor">
            <MentorSettings />
          </RoleGate>
        }
      />

      {/* =================================================
          UNKNOWN ROUTE
      ================================================= */}

      <Route
        path="*"
        element={<RoleAwareFallback />}
      />

    </Routes>
  );
};

// =====================================================
// ROLE FALLBACK
// =====================================================
const RoleAwareFallback: React.FC = () => {
  const { role } = useAuth();

  if (role === "mentor") {
    return <Navigate to="/mentor/dashboard" replace />;
  }

  if (role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (role === "hr") {
    return <Navigate to="/hr" replace />;
  }

  if (role === "manager") {
    return <Navigate to="/manager" replace />;
  }

  if (role === "employee") {
    return <Navigate to="/employee" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default App;