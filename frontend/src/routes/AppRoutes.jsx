import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Signup from "../pages/Signup";

import EmployeeDashboard from "../pages/EmployeeDashboard";
import HRDashboard from "../pages/HRDashboard";
import ManagerDashboard from "../pages/ManagerDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import Skills from "../pages/Skills";
import KnowledgeGap from "../pages/KnowledgeGap";
import CompetencyFramework from "../pages/CompetencyFramework";
import EmployeeSkillAssessment from "../pages/EmployeeSkillAssessment";
import Notifications from "../pages/Notifications";
import KnowledgeSharing from "../pages/KnowledgeSharing";
import ReportsAndAnalytics from "../pages/ReportsAndAnalytics";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/employee" element={<EmployeeDashboard />} />
      <Route path="/hr" element={<HRDashboard />} />
      <Route path="/manager" element={<ManagerDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/skills" element={<Skills />} />
      <Route path="/competency-framework" element={<CompetencyFramework />} />
      <Route path="/employee-assessment" element={<EmployeeSkillAssessment />} />
      <Route path="/knowledge-gap" element={<KnowledgeGap />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/knowledge-sharing" element={<KnowledgeSharing />} />
      <Route path="/reports" element={<ReportsAndAnalytics />} />
    </Routes>
  );
}

export default AppRoutes;
