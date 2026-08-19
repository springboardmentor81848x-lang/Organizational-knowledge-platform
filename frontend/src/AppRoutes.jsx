import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Signup from "../pages/Signup";

import EmployeeDashboard from "../pages/EmployeeDashboard";
import HRDashboard from "../pages/HRDashboard";
import ManagerDashboard from "../pages/ManagerDashboard";
import AdminDashboard from "../pages/AdminDashboard";

import EmployeeAssessment from "../pages/EmployeeAssessment";
import MentorDashboard from "../pages/MentorDashboard";

const AppRoutes = () => {
  return (
    <Routes>

      {/* =====================================================
          AUTHENTICATION
      ===================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />


      {/* =====================================================
          EMPLOYEE
      ===================================================== */}

      <Route
        path="/employee"
        element={<EmployeeDashboard />}
      />

      <Route
        path="/employee-assessment"
        element={<EmployeeAssessment />}
      />


      {/* =====================================================
          HR
      ===================================================== */}

      <Route
        path="/hr"
        element={<HRDashboard />}
      />


      {/* =====================================================
          MANAGER
      ===================================================== */}

      <Route
        path="/manager"
        element={<ManagerDashboard />}
      />


      {/* =====================================================
          MENTORSHIP
      ===================================================== */}

      <Route
        path="/mentorship"
        element={<MentorDashboard />}
      />


      {/* =====================================================
          DEFAULT
      ===================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


      {/* =====================================================
          INVALID ROUTE
      ===================================================== */}

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
};

export default AppRoutes;