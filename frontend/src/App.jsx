import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";
import EmployeeDashboard from "./pages/Employee/EmployeeDashboard";
import MyProfile from "./pages/Employee/MyProfile";
import MySkills from "./pages/Employee/MySkills";
import GapAnalysis from "./pages/Employee/GapAnalysis";
import Training from "./pages/Employee/Training";
import Assessments from "./pages/Employee/Assessments";
import MyLearning from "./pages/Employee/MyLearning";
import KnowledgeSharing from "./pages/Employee/KnowledgeSharing";
import Notifications from "./pages/Employee/Notifications";
import Reports from "./pages/Employee/Reports";

import ManagerDashboard from "./pages/ManagerDashboard";
import HRDashboard from "./pages/HRDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Employee Core Portal */}
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/my-profile" element={<MyProfile />} />
        
        {/* Skill Management Routes */}
        <Route path="/my-skills" element={<MySkills />} />
        <Route path="/skill-management" element={<MySkills />} />

        {/* Gap Analysis Routes */}
        <Route path="/gap-analysis" element={<GapAnalysis />} />
        <Route path="/knowledge-gap-analysis" element={<GapAnalysis />} />

        {/* Training Routes */}
        <Route path="/training" element={<Training />} />
        <Route path="/training-recommendation" element={<Training />} />
        <Route path="/training-recommendations" element={<Training />} />

        {/* Assessments & Surveys */}
        <Route path="/assessments" element={<Assessments />} />

        {/* Learning Progress */}
        <Route path="/my-learning" element={<MyLearning />} />

        {/* Mentorship & Knowledge Sharing */}
        <Route path="/mentorship" element={<KnowledgeSharing />} />
        <Route path="/knowledge-sharing" element={<KnowledgeSharing />} />

        {/* Notifications & Reports */}
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reports" element={<Reports />} />

        {/* Role Dashboards & Portals */}
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/hr-dashboard" element={<HRDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Fallback to Employee Dashboard */}
        <Route path="*" element={<Navigate to="/employee-dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;