import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { Login } from "@/pages/auth/Login";
import { Register } from "@/pages/auth/Register";
import { Dashboard } from "@/pages/shared/Dashboard";
import HRDashboard  from "@/pages/hr/Dashboard";
import AdminDashboard from "@/pages/admin/Dashboard";
import EmployeeDashboard from "@/pages/employee/Dashboard";
import ManagerDashboard from "@/pages/manager/Dashboard"; 
import SkillGapsPage from "@/pages/employee/SkillGapsPage";
export function App() {
  return (
    <Routes>
      {/* Default route */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Role Dashboards */}
      <Route path="/employee" element={<EmployeeDashboard />} />
      <Route path="/hr" element={<HRDashboard />} />
      <Route path="/manager" element={<ManagerDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
     <Route path="/employee/skill-gaps" element={<SkillGapsPage />} />
      {/* Unknown route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;