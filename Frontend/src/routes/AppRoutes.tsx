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
                <Route path="/skills" element={<RoleRoute roles={['EMPLOYEE']}><Skills /></RoleRoute>} />
                <Route path="/knowledge-gaps" element={<RoleRoute roles={['EMPLOYEE', 'MANAGER', 'HR']}><Gaps /></RoleRoute>} />
                <Route path="/gaps" element={<RoleRoute roles={['EMPLOYEE', 'MANAGER', 'HR']}><Gaps /></RoleRoute>} />
                <Route path="/learning" element={<RoleRoute roles={['EMPLOYEE', 'MANAGER']}><Learning /></RoleRoute>} />
                <Route path="/ai" element={<RoleRoute roles={['EMPLOYEE']}><AI /></RoleRoute>} />
                <Route path="/assessments" element={<RoleRoute roles={['EMPLOYEE', 'MANAGER']}><Assessments /></RoleRoute>} />
                <Route path="/certifications" element={<RoleRoute roles={['EMPLOYEE']}><Certifications /></RoleRoute>} />
                <Route path="/mentorship" element={<RoleRoute roles={['EMPLOYEE', 'MANAGER']}><Mentorship /></RoleRoute>} />
                <Route path="/knowledge-sessions" element={<RoleRoute roles={['EMPLOYEE', 'MANAGER', 'HR']}><Sessions /></RoleRoute>} />
                <Route path="/sessions" element={<RoleRoute roles={['EMPLOYEE', 'MANAGER', 'HR']}><Sessions /></RoleRoute>} />
                <Route path="/knowledge-resources" element={<RoleRoute roles={['EMPLOYEE', 'HR']}><KnowledgeResources /></RoleRoute>} />
                <Route path="/resources" element={<RoleRoute roles={['EMPLOYEE', 'HR']}><KnowledgeResources /></RoleRoute>} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/reports" element={<RoleRoute roles={['ADMIN', 'HR', 'MANAGER']}><Reports /></RoleRoute>} />
                <Route path="/employees" element={<RoleRoute roles={['ADMIN', 'HR', 'MANAGER']}><Employees /></RoleRoute>} />
                <Route path="/competencies" element={<RoleRoute roles={['ADMIN', 'HR']}><Competencies /></RoleRoute>} />
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
