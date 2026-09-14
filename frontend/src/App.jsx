import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import LDDashboard from './pages/LDDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import AIPlan from './pages/AIPlan';
import Skills from './pages/Skills';
import Analytics from './pages/Analytics';
import Trainings from './pages/Trainings';
import Mentorship from './pages/Mentorship';
import Exam from './pages/Exam';
import GapAnalysis from './pages/GapAnalysis';
import Articles from './pages/Articles';
import QnAModule from './pages/QnAModule';
import HREmployeeTracker from './pages/HREmployeeTracker';
import TeamLeaderDashboard from './pages/TeamLeaderDashboard';
import DepartmentHeadDashboardEnhanced from './pages/DepartmentHeadDashboardEnhanced';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Admin from './components/Admin.jsx';
import { getStoredUser, roleFamily } from './services/platformApi';

// Simple auth check
const isAuthenticated = () => localStorage.getItem('user') !== null || localStorage.getItem('token') !== null;

const getCurrentRoleFamily = () => roleFamily(getStoredUser().role || getStoredUser().accountType || 'Employee');

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const getRolePath = () => {
  const family = getCurrentRoleFamily();
  if (family === 'manager') return 'manager';
  if (family === 'hr') return 'hr';
  if (family === 'depthead') return 'department-head';
  if (family === 'learning') return 'ld';
  if (family === 'system') return 'admin';
  return 'employee';
};

const RoleRedirect = () => {
  return <Navigate to={`/${getRolePath()}/dashboard`} replace />;
};

const RoleProtectedRoute = ({ allowedFamilies, children }) => {
  const family = getCurrentRoleFamily();
  return isAuthenticated() && allowedFamilies.includes(family) ? children : (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444', height: '100vh', background: '#0f172a' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>ACCESS DENIED</h1>
      <p>You do not have permission to access this page.</p>
      <button onClick={() => window.location.href = `/${getRolePath()}/dashboard`} style={{ marginTop: '2rem', padding: '0.8rem 1.5rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Return to Dashboard</button>
    </div>
  );
};

const RoleDashboard = () => {
  const { rolePath } = useParams();
  const family = roleFamily(rolePath);

  if (family === 'employee') return <EmployeeDashboard />;
  if (family === 'learning') return <LDDashboard />;
  if (family === 'system') return <AdminDashboard />;
  if (family === 'depthead') return <DepartmentHeadDashboardEnhanced />;
  if (family === 'manager') return <TeamLeaderDashboard />;
  if (family === 'hr') return <Dashboard />;
  return <Dashboard />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />

        <Route path="/app" element={<RoleRedirect />} />

        {/* Protected App Routes mapped to role paths */}
        <Route path="/:rolePath" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<RoleDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="skills" element={<Skills />} />
          <Route path="skill-gaps" element={<GapAnalysis />} />
          <Route path="trainings" element={<Trainings />} />
          <Route path="assessments" element={<RoleProtectedRoute allowedFamilies={['employee']}><Exam /></RoleProtectedRoute>} />
          <Route path="mentors" element={<Mentorship />} />
          <Route path="sessions" element={<Mentorship />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="notifications" element={<Analytics />} />
          <Route path="ai-plan" element={<RoleProtectedRoute allowedFamilies={['employee']}><AIPlan /></RoleProtectedRoute>} />
          <Route path="users" element={<RoleProtectedRoute allowedFamilies={['system']}><AdminDashboard /></RoleProtectedRoute>} />
          <Route path="roles" element={<RoleProtectedRoute allowedFamilies={['system']}><AdminDashboard /></RoleProtectedRoute>} />
          <Route path="departments" element={<RoleProtectedRoute allowedFamilies={['system']}><AdminDashboard /></RoleProtectedRoute>} />
          <Route path="settings" element={<RoleProtectedRoute allowedFamilies={['system']}><AdminDashboard /></RoleProtectedRoute>} />
          <Route path="experts" element={<Mentorship />} />
          <Route path="reports" element={<Analytics />} />
          <Route path="articles" element={<Articles />} />
          <Route path="documents" element={<Articles />} />
          <Route path="qna" element={<QnAModule />} />
          <Route path="hr-employees" element={<HREmployeeTracker />} />
          {/* Default catch-all for inside app */}
          <Route path="*" element={<RoleRedirect />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
