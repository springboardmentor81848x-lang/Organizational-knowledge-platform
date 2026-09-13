import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LoadingBlock } from '@/components/ui/AsyncState'
import { tokenStore } from '@/lib/tokenStore'
import { useSession } from '@/features/auth/useSession'
import { homeFor } from './roleRoutes'
import styles from './AppShell.module.css'

/**
 * Guards the authenticated area.
 *
 * A stored token is not treated as proof of a session — it is only a reason to ask. The profile
 * is confirmed against /api/auth/me first, so a token that the server has since rejected sends
 * the user to sign in rather than into a shell whose every query will fail.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isRestoring } = useSession()
  const location = useLocation()

  if (isRestoring) {
    return (
      <div className={styles.centered}>
        <LoadingBlock rows={3} label="Restoring your session" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Remember where they were headed so signing in returns them there.
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

/** Keeps a signed-in user off the landing and login screens. */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { isAuthenticated, isRestoring, role } = useSession()

  if (isRestoring) {
    return (
      <div className={styles.centered}>
        <LoadingBlock rows={3} label="Checking your session" />
      </div>
    )
  }

  if (isAuthenticated || tokenStore.hasSession()) {
    // The role's own dashboard, never "/". This component guards "/" itself, so sending a
    // signed-in user there would re-render the very route that issued the redirect and loop
    // forever on a blank screen. The role comes from the token, so it is known before the
    // profile has loaded.
    return <Navigate to={homeFor(role)} replace />
  }

  return <>{children}</>
}
