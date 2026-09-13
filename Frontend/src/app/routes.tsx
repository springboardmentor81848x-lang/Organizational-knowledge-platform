import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '@/features/auth/LoginPage'
import { SignupPage } from '@/features/auth/SignupPage'
import { RoleSelectPage } from '@/features/auth/RoleSelectPage'
import { EmployeeDashboard } from '@/features/dashboards/employee/EmployeeDashboard'
import { ProfilePage } from '@/features/profile/ProfilePage'
import { MySkillsPage } from '@/features/skills/MySkillsPage'
import { AssessmentsPage } from '@/features/assessments/AssessmentsPage'
import { GapsPage } from '@/features/gaps/GapsPage'
import { LearningPage } from '@/features/learning/LearningPage'
import { RecommendationsPage } from '@/features/learning/RecommendationsPage'
import { AssistantPage } from '@/features/assistant/AssistantPage'
import { MentorshipPage } from '@/features/mentorship/MentorshipPage'
import { SessionsPage } from '@/features/sessions/SessionsPage'
import { ExpertDirectoryPage } from '@/features/experts/ExpertDirectoryPage'
import { NotificationCenterPage } from '@/features/notifications/NotificationCenterPage'
import { AchievementsPage } from '@/features/achievements/AchievementsPage'
import { TeamDashboardPage } from '@/features/team/TeamDashboardPage'
import { WorkforceLayout } from '@/features/workforce/WorkforceLayout'
import { GapIntelligencePage } from '@/features/workforce/GapIntelligencePage'
import { SkillInventoryPage } from '@/features/workforce/SkillInventoryPage'
import { TrainingEffectivenessPage } from '@/features/workforce/TrainingEffectivenessPage'
import { GapTrendPage } from '@/features/workforce/GapTrendPage'
import { PeopleAdminPage } from '@/features/workforce/PeopleAdminPage'
import { ReportsPage } from '@/features/reports/ReportsPage'
import { CatalogLayout } from '@/features/catalog/CatalogLayout'
import { CoursesPage } from '@/features/catalog/CoursesPage'
import { ImportPage } from '@/features/catalog/ImportPage'
import { LearningPathsPage } from '@/features/catalog/LearningPathsPage'
import { CertificationRenewalsPage } from '@/features/catalog/CertificationRenewalsPage'
import { AdminLayout } from '@/features/admin/AdminLayout'
import { UsersPage } from '@/features/admin/UsersPage'
import { RolesPage } from '@/features/admin/RolesPage'
import { AuditLogPage } from '@/features/admin/AuditLogPage'
import { SystemHealthPage } from '@/features/admin/SystemHealthPage'
import { AccessRequestsPage } from '@/features/admin/AccessRequestsPage'
import { AppShell } from './AppShell'
import { RedirectIfAuthenticated, RequireAuth } from './RequireAuth'
import { RequireRole } from './RequireRole'
import { RoleHomeRedirect } from './RoleHomeRedirect'

/**
 * The route table.
 *
 * Signed out, the landing screen offers the six role tiles and hands off to sign-in. Signed in,
 * everything sits under the shell, wrapped so a route the role may not open renders an
 * explanation rather than failing panel by panel.
 *
 * The dashboards are reached by the role's own path — /me, /team, /department, /workforce,
 * /catalog, /admin — so each role has a URL of its own and landing on somebody else's is a
 * thing that can be attempted, and refused. Every one of them now has a real screen over its
 * own scoped endpoints.
 */


export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RedirectIfAuthenticated>
        <RoleSelectPage />
      </RedirectIfAuthenticated>
    ),
  },
  {
    path: '/login',
    element: (
      <RedirectIfAuthenticated>
        <LoginPage />
      </RedirectIfAuthenticated>
    ),
  },
  {
    // Reached by people who have no account yet, so it sits outside the shell alongside sign-in
    // and redirects away if a session already exists.
    path: '/signup',
    element: (
      <RedirectIfAuthenticated>
        <SignupPage />
      </RedirectIfAuthenticated>
    ),
  },
  {
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      // The personal-development screens, each behind the same role check. They were open to
      // anyone signed in, which meant an administrator could reach a gap list with nothing to
      // measure and an assessment that refuses to build - a page of failed panels rather than
      // an explanation. RequireRole reads the same table the navigation does, so a role that is
      // not offered the link cannot reach the page by typing its URL either.
      { path: 'me', element: <RequireRole><EmployeeDashboard /></RequireRole> },
      { path: 'skills', element: <RequireRole><MySkillsPage /></RequireRole> },
      { path: 'assessments', element: <RequireRole><AssessmentsPage /></RequireRole> },
      { path: 'gaps', element: <RequireRole><GapsPage /></RequireRole> },
      { path: 'recommendations', element: <RequireRole><RecommendationsPage /></RequireRole> },
      { path: 'assistant', element: <RequireRole><AssistantPage /></RequireRole> },
      { path: 'learning', element: <RequireRole><LearningPage /></RequireRole> },
      { path: 'mentorship', element: <RequireRole><MentorshipPage /></RequireRole> },
      { path: 'achievements', element: <RequireRole><AchievementsPage /></RequireRole> },

      // Open to every role. A profile and its notifications belong to the account rather than
      // to a development track, and sessions and the expert directory are about the
      // organisation rather than about the person reading them.
      { path: 'profile', element: <ProfilePage /> },
      { path: 'notifications', element: <NotificationCenterPage /> },
      { path: 'sessions', element: <SessionsPage /> },
      { path: 'experts', element: <ExpertDirectoryPage /> },
      { path: 'team', element: <RequireRole><TeamDashboardPage scope="manager" /></RequireRole> },
      { path: 'department', element: <RequireRole><TeamDashboardPage scope="department" /></RequireRole> },

      // The workforce section is nested so each view has a URL of its own and the whole
      // section inherits one role check rather than repeating it per view.
      {
        path: 'workforce',
        element: (
          <RequireRole>
            <WorkforceLayout />
          </RequireRole>
        ),
        children: [
          { index: true, element: <GapIntelligencePage /> },
          { path: 'inventory', element: <SkillInventoryPage /> },
          { path: 'effectiveness', element: <TrainingEffectivenessPage /> },
          { path: 'trends', element: <GapTrendPage /> },
          { path: 'people', element: <PeopleAdminPage /> },
        ],
      },

      { path: 'reports', element: <RequireRole><ReportsPage /></RequireRole> },

      // Learning operations and platform administration, each nested so every view has its own
      // URL and the whole section inherits one role check rather than repeating it per view.
      {
        path: 'catalog',
        element: (
          <RequireRole>
            <CatalogLayout />
          </RequireRole>
        ),
        children: [
          { index: true, element: <CoursesPage /> },
          { path: 'import', element: <ImportPage /> },
          { path: 'paths', element: <LearningPathsPage /> },
          { path: 'certifications', element: <CertificationRenewalsPage /> },
        ],
      },

      { path: 'access-requests', element: <RequireRole><AccessRequestsPage /></RequireRole> },

      {
        path: 'admin',
        element: (
          <RequireRole>
            <AdminLayout />
          </RequireRole>
        ),
        children: [
          { index: true, element: <UsersPage /> },
          { path: 'roles', element: <RolesPage /> },
          { path: 'audit', element: <AuditLogPage /> },
          { path: 'health', element: <SystemHealthPage /> },
        ],
      },

      { path: '*', element: <RoleHomeRedirect /> },
    ],
  },
])
