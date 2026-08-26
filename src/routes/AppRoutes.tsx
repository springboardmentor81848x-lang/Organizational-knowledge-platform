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
import { UserManagement } from '../pages/UserManagement';
import { Settings } from '../pages/Settings';
import { Profile } from '../pages/Profile';
import { AiRecommendations } from '../pages/AiRecommendations';
import { Leaderboard } from '../pages/Leaderboard';
import { Messaging } from '../pages/Messaging';
import { LeaveManagement } from '../pages/LeaveManagement';
import { TaskAssignment } from '../pages/TaskAssignment';
import { Assessments } from '../pages/Assessments';
import { Certificates } from '../pages/Certificates';
import { AuditLogs } from '../pages/AuditLogs';
import { LearningPathModule } from '../pages/LearningPathModule';
import { MentorshipHub } from '../pages/MentorshipHub';
import { TargetRolesModule } from '../pages/TargetRolesModule';
import { CommunityGroups } from '../pages/CommunityGroups';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4FBFB] flex items-center justify-center text-slate-500 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-[#0A7A74]/30 border-t-[#0A7A74] rounded-full animate-spin" />
          <span>Validating OKGIP Credentials...</span>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Learning Path is a personal employee view (self-diagnosed skill gaps and
// a personalized course plan) — Managers, HR/Admin, Department Heads,
// L&D Admin, and Mentors all get redirected to /dashboard even if they
// hit the URL directly. The Sidebar already hides the nav link for them;
// this is the actual access-control enforcement, since hiding a link
// never stops someone from typing the URL.
const EmployeeOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const role = (user as any)?.role || 'Employee';
  const nonEmployeeRoles = [
    'Admin', 'System Administrator', 'ROLE_ADMIN',
    'Manager', 'Team Lead', 'ROLE_MANAGER',
    'HR Specialist', 'HR', 'ROLE_HR',
    'Department Head', 'Dept Head', 'ROLE_DEPARTMENT_HEAD',
    'L&D Admin / Mentor', 'L&D Admin', 'ROLE_LND_ADMIN',
    'Mentor', 'ROLE_MENTOR',
  ];

  if (nonEmployeeRoles.includes(role)) {
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

      {/* Protected Dashboard Layout Routes - Directly accessible across all roles */}
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
        <Route path="users" element={<UserManagement />} />
        <Route path="employees" element={<EmployeeManagement />} />
        <Route path="employees/:id" element={<EmployeeProfile />} />
        <Route path="departments" element={<DepartmentManagement />} />
        <Route path="skills" element={<SkillsManagement />} />
        <Route path="target-roles" element={<TargetRolesModule />} />
        <Route path="gaps" element={<KnowledgeGapModule />} />
        <Route path="ai-recommendations" element={<AiRecommendations />} />
        <Route path="training" element={<TrainingModule />} />
        <Route
          path="learning-path"
          element={
            <EmployeeOnlyRoute>
              <LearningPathModule />
            </EmployeeOnlyRoute>
          }
        />
        <Route path="mentorship" element={<MentorshipHub />} />
        <Route path="community-groups" element={<CommunityGroups />} />
        <Route path="assessments" element={<Assessments />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="certificates" element={<Certificates />} />
        <Route path="tasks" element={<TaskAssignment />} />
        <Route path="leave" element={<LeaveManagement />} />
        <Route path="messages" element={<Messaging />} />
        <Route path="reports" element={<ReportsModule />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="access-denied" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
