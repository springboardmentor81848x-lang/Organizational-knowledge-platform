import type { ReactNode } from 'react'
import { ApiError } from '@/lib/apiError'
import styles from './AsyncState.module.css'

/**
 * What a 403 looks like.
 *
 * The backend scopes reads by the relationship between caller and subject — a manager sees
 * their own reports, a department head their own department — so being refused is a normal
 * outcome, not a fault. It gets its own calm state rather than the red error panel, and it
 * never blanks the page or throws.
 */
export function PermissionDenied({
  message,
  action,
}: {
  message?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className={styles.state}>
      <div className={[styles.icon, styles.iconEmpty].join(' ')} aria-hidden="true">
        ⃠
      </div>
      <p className={styles.title}>You do not have access to this</p>
      <p className={styles.message}>
        {message ??
          'This information is scoped to the people you are responsible for. If you think you should be able to see it, your administrator can check your role.'}
      </p>
      {action}
    </div>
  )
}

/** True when a query failed specifically because the caller is not allowed. */
export function isPermissionDenied(error: unknown): boolean {
  return ApiError.from(error).status === 403
}
