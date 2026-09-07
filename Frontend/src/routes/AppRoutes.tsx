import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Skills from '../pages/Skills';
import Gaps from '../pages/Gaps';
import Learning from '../pages/Learning';
import AI from '../pages/AI';
import Certifications from '../pages/Certifications';
import Assessments from '../pages/Assessments';
import Mentorship from '../pages/Mentorship';
import Sessions from '../pages/Sessions';
import Notifications from '../pages/Notifications';
import Profile from '../pages/Profile';
import Reports from '../pages/Reports';
import Employees from '../pages/Employees';
import Competencies from '../pages/Competencies';
import Training from '../pages/Training';
import KnowledgeResources from '../pages/KnowledgeResources';
import { token, currentRole } from '../auth';

function ProtectedRoute({ children }: { children: ReactNode }) {
  return token() ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: ReactNode }) {
  return token() ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

function RoleRoute({ roles, children }: { roles: string[]; children: ReactNode }) {
  return roles.includes(currentRole()) ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route
        path="*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/skills" element={<Skills />} />
                <Route path="/knowledge-gaps" element={<Gaps />} />
                <Route path="/gaps" element={<Gaps />} />
                <Route path="/learning" element={<Learning />} />
                <Route path="/ai" element={<AI />} />
                <Route path="/assessments" element={<Assessments />} />
                <Route path="/certifications" element={<Certifications />} />
                <Route path="/mentorship" element={<Mentorship />} />
                <Route path="/knowledge-sessions" element={<Sessions />} />
                <Route path="/sessions" element={<Sessions />} />
                <Route path="/knowledge-resources" element={<KnowledgeResources />} />
                <Route path="/resources" element={<KnowledgeResources />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/reports" element={<RoleRoute roles={['ADMIN', 'HR', 'MANAGER']}><Reports /></RoleRoute>} />
                <Route path="/employees" element={<RoleRoute roles={['ADMIN', 'HR', 'MANAGER']}><Employees /></RoleRoute>} />
                <Route path="/competencies" element={<RoleRoute roles={['ADMIN', 'HR', 'MANAGER']}><Competencies /></RoleRoute>} />
                <Route path="/training" element={<Training />} />
                <Route path="/training-admin" element={<RoleRoute roles={['ADMIN', 'HR', 'MANAGER']}><Training admin /></RoleRoute>} />
                <Route path="/skills-admin" element={<RoleRoute roles={['ADMIN']}><Skills admin /></RoleRoute>} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
