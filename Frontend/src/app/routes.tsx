import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '@/features/auth/LoginPage'
import { RoleSelectPage } from '@/features/auth/RoleSelectPage'
import { EmployeeDashboard } from '@/features/dashboards/employee/EmployeeDashboard'
import { ProfilePage } from '@/features/profile/ProfilePage'
import { MySkillsPage } from '@/features/skills/MySkillsPage'
import { AssessmentsPage } from '@/features/assessments/AssessmentsPage'
import { GapsPage } from '@/features/gaps/GapsPage'
import { LearningPage } from '@/features/learning/LearningPage'
import { RecommendationsPage } from '@/features/learning/RecommendationsPage'
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
import { AppShell } from './AppShell'
import { RedirectIfAuthenticated, RequireAuth } from './RequireAuth'
import { RequireRole } from './RequireRole'
import { RoleDashboard } from '@/features/dashboards/RoleDashboard'
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
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      // Signed in, "/" belongs to whichever dashboard the role owns.
      { path: '/', element: <RoleHomeRedirect /> },

      { path: 'me', element: <RequireRole><EmployeeDashboard /></RequireRole> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'skills', element: <MySkillsPage /> },
      { path: 'gaps', element: <GapsPage /> },
      { path: 'recommendations', element: <RecommendationsPage /> },
      { path: 'learning', element: <LearningPage /> },
      { path: 'assessments', element: <AssessmentsPage /> },
      { path: 'mentorship', element: <MentorshipPage /> },
      { path: 'sessions', element: <SessionsPage /> },
      { path: 'experts', element: <ExpertDirectoryPage /> },
      { path: 'notifications', element: <NotificationCenterPage /> },
      { path: 'achievements', element: <AchievementsPage /> },
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

      // Administration keeps the generic role dashboard until its own screens are built.
      {
        path: 'admin',
        element: (
          <RequireRole>
            <RoleDashboard />
          </RequireRole>
        ),
      },

      { path: '*', element: <RoleHomeRedirect /> },
    ],
  },
])
