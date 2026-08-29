import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '@/features/auth/LoginPage'
import { AppShell } from './AppShell'
import { RedirectIfAuthenticated, RequireAuth } from './RequireAuth'
import { PlaceholderPage } from './PlaceholderPage'
import { navigation } from './navigation'

/**
 * Routes for every destination in the rail.
 *
 * Screens are built one part at a time; until a route has its screen it renders a page that
 * says so plainly. It shows no figures and calls no endpoints, because an invented number is
 * worse than an admission that the screen is not finished.
 */
const featureRoutes = navigation
  .flatMap((section) => section.items)
  .map((item) => ({
    path: item.to === '/' ? undefined : item.to.slice(1),
    index: item.to === '/' ? true : undefined,
    element: <PlaceholderPage title={item.label} />,
  }))

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <RedirectIfAuthenticated>
        <LoginPage />
      </RedirectIfAuthenticated>
    ),
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [...featureRoutes, { path: '*', element: <Navigate to="/" replace /> }],
  },
])
