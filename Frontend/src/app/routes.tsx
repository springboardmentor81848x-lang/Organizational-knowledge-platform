import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '@/features/auth/LoginPage'
import { RoleSelectPage } from '@/features/auth/RoleSelectPage'
import { RoleDashboard } from '@/features/dashboards/RoleDashboard'
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
 * thing that can be attempted, and refused.
 */

// /me, /team, /department and /workforce have their own screens over their own scoped
// endpoints; the rest share the role dashboard until their part is built.
const DASHBOARD_PATHS = ['catalog', 'admin']

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

      ...DASHBOARD_PATHS.map((path) => ({
        path,
        element: (
          <RequireRole>
            <RoleDashboard />
          </RequireRole>
        ),
      })),

      { path: '*', element: <RoleHomeRedirect /> },
    ],
  },
])
