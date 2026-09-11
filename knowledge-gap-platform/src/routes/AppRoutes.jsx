import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Auth Pages
import { Login } from '../pages/auth/Login';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';

// Employee Portal Pages
import { EmployeeDashboard } from '../pages/employee/Dashboard';
import { Profile } from '../pages/employee/Profile';
import { MySkills } from '../pages/employee/MySkills';
import { SkillDetails } from '../pages/employee/SkillDetails';
import { SkillAssessment } from '../pages/employee/SkillAssessment';
import { AssessmentResults } from '../pages/employee/AssessmentResults';
import { GapAnalysis } from '../pages/employee/GapAnalysis';
import { AIRecommendations } from '../pages/employee/AIRecommendations';
import { CourseDetails } from '../pages/employee/CourseDetails';
import { LearningProgress } from '../pages/employee/LearningProgress';
import { Mentorship } from '../pages/employee/Mentorship';
import { NotificationsPage } from '../pages/employee/Notifications';

// Manager Portal Pages
import { ManagerDashboard } from '../pages/manager/Dashboard';
import { TeamMembers } from '../pages/manager/TeamMembers';
import { TeamSkillGaps } from '../pages/manager/TeamSkillGaps';
import { EmployeeDetails } from '../pages/manager/EmployeeDetails';
import { ManagerNotifications } from '../pages/manager/Notifications';

// Admin Portal Pages
import { AdminDashboard } from '../pages/admin/Dashboard';
import { UsersManagement } from '../pages/admin/Users';
import { Departments } from '../pages/admin/Departments';
import { JobRoles } from '../pages/admin/JobRoles';
import { SkillsLibrary } from '../pages/admin/Skills';
import { TrainingManagement } from '../pages/admin/TrainingManagement';
import { Reports } from '../pages/admin/Reports';
import { Analytics } from '../pages/admin/Analytics';

// Search & Fallback Pages
import { SearchResultsPage } from '../pages/search/SearchResultsPage';
import { NotFound } from '../pages/NotFound';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Main Dashboard Layout Routes */}
      <Route element={<DashboardLayout />}>
        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/employee/dashboard" replace />} />

        {/* Employee Portal */}
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/profile" element={<Profile />} />
        <Route path="/employee/skills" element={<MySkills />} />
        <Route path="/employee/skills/:id" element={<SkillDetails />} />
        <Route path="/employee/assessment" element={<SkillAssessment />} />
        <Route path="/employee/assessment-results" element={<AssessmentResults />} />
        <Route path="/employee/gap-analysis" element={<GapAnalysis />} />
        <Route path="/employee/recommendations" element={<AIRecommendations />} />
        <Route path="/employee/course/:id" element={<CourseDetails />} />
        <Route path="/employee/progress" element={<LearningProgress />} />
        <Route path="/employee/mentorship" element={<Mentorship />} />
        <Route path="/employee/notifications" element={<NotificationsPage />} />

        {/* Manager Portal */}
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/manager/team" element={<TeamMembers />} />
        <Route path="/manager/team-gaps" element={<TeamSkillGaps />} />
        <Route path="/manager/employee/:id" element={<EmployeeDetails />} />
        <Route path="/manager/notifications" element={<ManagerNotifications />} />

        {/* HR / Admin Portal */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UsersManagement />} />
        <Route path="/admin/departments" element={<Departments />} />
        <Route path="/admin/roles" element={<JobRoles />} />
        <Route path="/admin/skills" element={<SkillsLibrary />} />
        <Route path="/admin/training" element={<TrainingManagement />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/analytics" element={<Analytics />} />

        {/* Global Search Results */}
        <Route path="/search" element={<SearchResultsPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
