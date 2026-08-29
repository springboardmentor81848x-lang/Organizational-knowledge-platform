import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { PermissionDenied } from '@/components/ui/PermissionDenied'
import { useSession } from '@/features/auth/useSession'
import { canAccess, homeFor, roleLabel } from './roleRoutes'

/**
 * Blocks a route the signed-in role may not open.
 *
 * Typing another role's URL directly is caught here rather than left to fail request by
 * request. The backend refuses those calls anyway; this exists so the result is a sentence
 * explaining the refusal instead of a screen of broken panels.
 *
 * It is a courtesy, not a control. The role it reads comes from the token, and every endpoint
 * behind these routes checks the caller again server-side.
 */
export function RequireRole({ children }: { children: ReactNode }) {
  const { role } = useSession()
  const location = useLocation()

  if (canAccess(role, location.pathname)) {
    return <>{children}</>
  }

  return (
    <Card>
      <PermissionDenied
        message={
          <>
            This area is not open to the <strong>{roleLabel(role)}</strong> role. Your access is set
            by your account, so if you need it, an administrator can change your role.
          </>
        }
        action={<Link to={homeFor(role)}>Back to your dashboard</Link>}
      />
    </Card>
  )
}
