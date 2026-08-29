import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { notificationsApi } from '@/api/notifications'
import { queryKeys } from '@/api/queryKeys'
import { ApiError } from '@/lib/apiError'
import styles from './NotificationBell.module.css'

/**
 * The unread count in the top bar.
 *
 * Small, but it is a real server-backed query and behaves like one: a skeleton while it loads,
 * and silence if it fails. It deliberately never renders "0" on error — a zero the reader
 * trusts is worse than showing nothing, because they would stop checking.
 */
export function NotificationBell() {
  const query = useQuery({
    queryKey: queryKeys.notifications.forUser(),
    queryFn: ({ signal }) => notificationsApi.list(undefined, signal),
    // Notifications arrive from server-side events the client did not trigger, so this is one
    // of the few things worth polling for.
    refetchInterval: 60_000,
  })

  if (query.isLoading) {
    return (
      <span className={styles.wrapper} aria-hidden="true">
        <span className={styles.skeleton} />
      </span>
    )
  }

  if (query.isError) {
    const message = ApiError.from(query.error).userMessage()
    return (
      <span className={styles.wrapper} title={message}>
        <span className={styles.glyph} aria-hidden="true">
          !
        </span>
        <span className="visually-hidden">Notifications could not be loaded. {message}</span>
      </span>
    )
  }

  const unread = query.data?.filter((notification) => !notification.isRead).length ?? 0

  return (
    <Link className={styles.wrapper} to="/notifications" aria-label="Notifications">
      <span className={styles.glyph} aria-hidden="true">
        ◔
      </span>
      {unread > 0 && (
        <span className={styles.count} aria-hidden="true">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
      <span className="visually-hidden">
        {unread === 0 ? 'No unread notifications' : `${unread} unread notifications`}
      </span>
    </Link>
  )
}
