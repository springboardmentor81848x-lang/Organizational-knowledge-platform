import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import EmployeeDashboard from "./pages/EmployeeDashboard";
import HRDashboard from "./pages/HRDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import EmployeeAssessment from "./pages/EmployeeAssessment";

const AppRoutes = () => {
  return (
    <Routes>

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ================= EMPLOYEE ================= */}

      <Route
        path="/employee"
        element={<EmployeeDashboard />}
      />

      <Route
        path="/employee-assessment"
        element={<EmployeeAssessment />}
      />

      {/* ================= HR ================= */}

      <Route
        path="/hr"
        element={<HRDashboard />}
      />

      {/* ================= MANAGER ================= */}

      <Route
        path="/manager"
        element={<ManagerDashboard />}
      />

      {/* ================= ADMIN / MENTOR ================= */}

      <Route
        path="/admin"
        element={<AdminDashboard />}
      />

      {/* Default */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Invalid route */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
};

export default AppRoutes;