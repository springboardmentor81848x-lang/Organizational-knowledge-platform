import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '@/features/auth/LoginPage'
import { RoleSelectPage } from '@/features/auth/RoleSelectPage'
import { RoleDashboard } from '@/features/dashboards/RoleDashboard'
import { AppShell } from './AppShell'
import { RedirectIfAuthenticated, RequireAuth } from './RequireAuth'
import { RequireRole } from './RequireRole'
import { RoleHomeRedirect } from './RoleHomeRedirect'
import { PlaceholderPage } from './PlaceholderPage'

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

const DASHBOARD_PATHS = ['me', 'team', 'department', 'workforce', 'catalog', 'admin']

/** Screens that will be built in later parts. They show no figures and call nothing. */
const PLACEHOLDER_PATHS = [
  { path: 'skills', label: 'My skills' },
  { path: 'gaps', label: 'My gaps' },
  { path: 'learning', label: 'Learning' },
  { path: 'assessments', label: 'Assessments' },
  { path: 'mentorship', label: 'Mentorship' },
  { path: 'sessions', label: 'Sessions' },
  { path: 'experts', label: 'Expert directory' },
  { path: 'reports', label: 'Reports' },
]

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

      ...DASHBOARD_PATHS.map((path) => ({
        path,
        element: (
          <RequireRole>
            <RoleDashboard />
          </RequireRole>
        ),
      })),

      ...PLACEHOLDER_PATHS.map(({ path, label }) => ({
        path,
        element: (
          <RequireRole>
            <PlaceholderPage title={label} />
          </RequireRole>
        ),
      })),

      { path: '*', element: <RoleHomeRedirect /> },
    ],
  },
])
