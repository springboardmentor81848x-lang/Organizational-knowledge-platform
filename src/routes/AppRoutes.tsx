import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { EmployeeManagement } from '../pages/EmployeeManagement';
import { EmployeeProfile } from '../pages/EmployeeProfile';
import { DepartmentManagement } from '../pages/DepartmentManagement';
import { SkillsManagement } from '../pages/SkillsManagement';
import { KnowledgeGapModule } from '../pages/KnowledgeGapModule';
import { TrainingModule } from '../pages/TrainingModule';
import { ReportsModule } from '../pages/ReportsModule';
import { NotificationsPage } from '../pages/NotificationsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-medium">
        Validating OKGIP JWT Credentials...
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Dashboard Layout Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route
          path="employees"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
              <EmployeeManagement />
            </ProtectedRoute>
          }
        />
        <Route path="employees/:id" element={<EmployeeProfile />} />
        <Route
          path="departments"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
              <DepartmentManagement />
            </ProtectedRoute>
          }
        />
        <Route path="skills" element={<SkillsManagement />} />
        <Route path="gaps" element={<KnowledgeGapModule />} />
        <Route path="training" element={<TrainingModule />} />
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
              <ReportsModule />
            </ProtectedRoute>
          }
        />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
