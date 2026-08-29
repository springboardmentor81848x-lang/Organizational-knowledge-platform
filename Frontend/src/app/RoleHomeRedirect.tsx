import { Navigate } from 'react-router-dom'
import { useSession } from '@/features/auth/useSession'
import { homeFor } from './roleRoutes'

/**
 * Sends a signed-in user to the dashboard their role owns.
 *
 * Used for "/" and for anything unrecognised, so a stale bookmark or a typo lands somewhere
 * that belongs to them instead of on a dead page.
 */
export function RoleHomeRedirect() {
  const { role } = useSession()
  return <Navigate to={homeFor(role)} replace />
}
