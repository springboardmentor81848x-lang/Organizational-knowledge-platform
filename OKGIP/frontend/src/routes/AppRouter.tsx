import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

import AdminDashboard from "@/pages/admin/Dashboard";
import HRDashboard from "@/pages/hr/Dashboard";
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

import EmployeeDashboard from "@/pages/employee/Dashboard";
import Profile from "@/pages/employee/Profile";
import Skills from "@/pages/employee/Skills";
import SelfAssessment from "@/pages/employee/SelfAssessment";
import PeerAssessment from "@/pages/employee/PeerAssessment";
import Proficiency from "@/pages/employee/Proficiency";
import SkillGapsPage from "@/pages/employee/SkillGapsPage";
import LearningPaths from "@/pages/employee/LearningPaths";
import Training from "@/pages/employee/Training";
import Progress from "@/pages/employee/Progress";
import Achievements from "@/pages/employee/Achievements";
import Certifications from "@/pages/employee/Certifications";
import Mentorship from "@/pages/employee/Mentorship";
import Notifications from "@/pages/employee/Notifications";
import Settings from "@/pages/employee/Settings";

const RootRedirect: React.FC = () => {
  const { isAuthenticated, role, getRoleDashboardPath } = useAuth();

  if (!isAuthenticated || !role) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getRoleDashboardPath(role)} replace />;
};

const EmployeeRoutes: React.FC = () => {
  return (
    <>
      {/* Both paths point to the same existing Dashboard UI. */}
      <Route path="/employee" element={<EmployeeDashboard />} />
      <Route path="/employee/dashboard" element={<EmployeeDashboard />} />

      <Route path="/employee/profile" element={<Profile />} />
      <Route path="/employee/skills" element={<Skills />} />
      <Route
        path="/employee/self-assessment"
        element={<SelfAssessment />}
      />
      <Route
        path="/employee/peer-assessment"
        element={<PeerAssessment />}
      />
      <Route path="/employee/proficiency" element={<Proficiency />} />
      <Route
        path="/employee/skill-gaps"
        element={<SkillGapsPage />}
      />
      <Route
        path="/employee/learning-paths"
        element={<LearningPaths />}
      />
      <Route path="/employee/training" element={<Training />} />
      <Route path="/employee/progress" element={<Progress />} />
      <Route
        path="/employee/achievements"
        element={<Achievements />}
      />
      <Route
        path="/employee/certifications"
        element={<Certifications />}
      />
      <Route
        path="/employee/mentorship"
        element={<Mentorship />}
      />
      <Route
        path="/employee/notifications"
        element={<Notifications />}
      />
      <Route path="/employee/settings" element={<Settings />} />
    </>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RootRedirect />} />

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["HR"]} />}>
            <Route path="/hr/dashboard" element={<HRDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["MANAGER"]} />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />\
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/employees" element={<ManagerEmployees />} />
            <Route path="/manager/departments" element={<ManagerDepartments />} />
            <Route path="/manager/job-roles" element={<ManagerJobRoles />} />
            <Route path="/manager/skills" element={<ManagerSkills />} />
            <Route path="/manager/competency-framework" element={<ManagerCompetencyFramework />} />
            <Route path="/manager/knowledge-gap-analysis" element={<ManagerKnowledgeGapAnalysis />} />
            <Route path="/manager/ai-recommendations" element={<ManagerAIRecommendations />} />
            <Route path="/manager/training-management" element={<ManagerTrainingManagement />} />
            <Route path="/manager/assessments" element={<ManagerAssessments />} />
            <Route path="/manager/reports" element={<ManagerReports />} />
            <Route path="/manager/settings" element={<ManagerSettings />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["EMPLOYEE"]} />}>
            <EmployeeRoutes />
          </Route>

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRouter;
