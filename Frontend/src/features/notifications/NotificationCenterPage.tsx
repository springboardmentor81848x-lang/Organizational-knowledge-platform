import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/api/notifications'
import { queryKeys } from '@/api/queryKeys'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { isPermissionDenied, PermissionDenied } from '@/components/ui/PermissionDenied'
import { useToast } from '@/components/ui/Toast'
import type { Notification, NotificationType } from '@/types/api'
import styles from './NotificationCenterPage.module.css'

/**
 * Everything the platform has told this person.
 *
 * The feed is a query like any other, so it is refreshed by whatever caused the notification
 * rather than by polling alone: submitting an assessment, accepting a mentorship or completing
 * a course all invalidate it, which is what makes a new entry appear here without a reload.
 */

/**
 * Notification types grouped into what a reader actually sorts by. The backend has twelve, which
 * is too many to filter through one at a time, and several of them mean the same thing to the
 * person reading — a gap alert and an assessment reminder are both "something about my skills".
 */
const CATEGORIES: { id: string; label: string; types: NotificationType[] }[] = [
  {
    id: 'skills',
    label: 'Skills and gaps',
    types: [
      'GAP_ALERT',
      'ASSESSMENT_REMINDER',
      'ASSESSMENT_RESULT',
      'ASSESSMENT_REATTEMPT_REQUEST',
      'ASSESSMENT_REATTEMPT_DECISION',
    ],
  },
  {
    id: 'learning',
    label: 'Learning',
    types: ['TRAINING_DEADLINE', 'TRAINING_RECOMMENDATION', 'TRAINING_PROGRESS'],
  },
  {
    id: 'mentorship',
    label: 'Mentorship and sessions',
    types: ['MENTORSHIP_INVITE', 'MENTORSHIP_REQUEST', 'SESSION_REMINDER'],
  },
  { id: 'achievements', label: 'Achievements', types: ['ACHIEVEMENT_UNLOCKED'] },
  { id: 'access', label: 'Account requests', types: ['ACCESS_REQUEST', 'ACCESS_DECISION'] },
  { id: 'system', label: 'System', types: ['INFO', 'SYSTEM_ALERT'] },
]

const TYPE_LABEL: Record<NotificationType, string> = {
  GAP_ALERT: 'Gap alert',
  TRAINING_DEADLINE: 'Training deadline',
  MENTORSHIP_INVITE: 'Mentorship',
  SESSION_REMINDER: 'Session reminder',
  ASSESSMENT_REMINDER: 'Assessment due',
  TRAINING_RECOMMENDATION: 'Recommendation',
  TRAINING_PROGRESS: 'Progress',
  ACHIEVEMENT_UNLOCKED: 'Achievement',
  ASSESSMENT_RESULT: 'Assessment result',
  MENTORSHIP_REQUEST: 'Mentorship request',
  ASSESSMENT_REATTEMPT_REQUEST: 'Retake requested',
  ASSESSMENT_REATTEMPT_DECISION: 'Retake decision',
  ACCESS_REQUEST: 'Account request',
  ACCESS_DECISION: 'Account decision',
  INFO: 'Information',
  SYSTEM_ALERT: 'System',
}

/** Which category tint a notification carries, using the shared severity tokens. */
const TYPE_TONE: Record<NotificationType, string> = {
  GAP_ALERT: styles.toneCritical,
  TRAINING_DEADLINE: styles.toneWarning,
  ASSESSMENT_REMINDER: styles.toneWarning,
  ACHIEVEMENT_UNLOCKED: styles.toneGood,
  ASSESSMENT_RESULT: styles.toneGood,
  TRAINING_PROGRESS: styles.toneGood,
  MENTORSHIP_INVITE: styles.toneInfo,
  MENTORSHIP_REQUEST: styles.toneInfo,
  // Amber on the approver's side because it is waiting on them; informational on the
  // employee's, because a decision has already been made and nothing is owed.
  ASSESSMENT_REATTEMPT_REQUEST: styles.toneWarning,
  ASSESSMENT_REATTEMPT_DECISION: styles.toneInfo,
  // Same split as the retake pair: amber while somebody still owes a decision, informational
  // once one has been made.
  ACCESS_REQUEST: styles.toneWarning,
  ACCESS_DECISION: styles.toneInfo,
  SESSION_REMINDER: styles.toneInfo,
  TRAINING_RECOMMENDATION: styles.toneInfo,
  INFO: styles.toneNeutral,
  SYSTEM_ALERT: styles.toneNeutral,
}

export function NotificationCenterPage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [category, setCategory] = useState<string>('all')
  const [unreadOnly, setUnreadOnly] = useState(false)

  const query = useQuery({
    queryKey: queryKeys.notifications.forUser(),
    queryFn: ({ signal }) => notificationsApi.list(undefined, signal),
  })

  const markRead = useMutation({
    // The server marks one at a time, so a bulk action is a set of real calls rather than a
    // pretend one. They are issued together and the feed is refreshed once at the end.
    mutationFn: (ids: number[]) => Promise.all(ids.map((id) => notificationsApi.markAsRead(id))),
    onSuccess: async (_result, ids) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
      if (ids.length > 1) toast.success(`${ids.length} notifications marked as read`)
    },
    onError: (error) => toast.fromError('Could not mark as read', error),
  })

  const all = query.data ?? []
  const unreadCount = all.filter((n) => !n.isRead).length

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: all.length }
    for (const group of CATEGORIES) {
      map[group.id] = all.filter((n) => group.types.includes(n.type)).length
    }
    return map
  }, [all])

  const visible = useMemo(() => {
    const group = CATEGORIES.find((c) => c.id === category)
    return all
      .filter((n) => (group ? group.types.includes(n.type) : true))
      .filter((n) => (unreadOnly ? !n.isRead : true))
  }, [all, category, unreadOnly])

  const visibleUnreadIds = visible.filter((n) => !n.isRead).map((n) => n.id)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.subtitle}>
            {unreadCount === 0
              ? 'Everything here has been read.'
              : `${unreadCount} unread of ${all.length}.`}
          </p>
        </div>
        <Button
          loading={markRead.isPending}
          disabled={visibleUnreadIds.length === 0}
          onClick={() => markRead.mutate(visibleUnreadIds)}
        >
          {category === 'all' && !unreadOnly
            ? 'Mark all as read'
            : `Mark these ${visibleUnreadIds.length} as read`}
        </Button>
      </header>

      <div className={styles.filters}>
        <div className={styles.tabs} role="tablist">
          <FilterTab
            label="Everything"
            count={counts.all}
            active={category === 'all'}
            onClick={() => setCategory('all')}
          />
          {CATEGORIES.map((group) => (
            <FilterTab
              key={group.id}
              label={group.label}
              count={counts[group.id]}
              active={category === group.id}
              onClick={() => setCategory(group.id)}
            />
          ))}
        </div>
        <label className={styles.unreadToggle}>
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(event) => setUnreadOnly(event.target.checked)}
          />
          Unread only
        </label>
      </div>

      <Card flush>
        {query.isLoading ? (
          <LoadingBlock rows={5} label="Loading notifications" />
        ) : query.isError ? (
          isPermissionDenied(query.error) ? (
            <PermissionDenied />
          ) : (
            <ErrorBlock error={query.error} onRetry={query.refetch} />
          )
        ) : visible.length === 0 ? (
          <EmptyBlock
            title={all.length === 0 ? 'Nothing yet' : 'Nothing matches this filter'}
            message={
              all.length === 0
                ? 'Alerts about your gaps, deadlines, recommendations and sessions will arrive here.'
                : 'Try a different category, or clear the unread filter.'
            }
          />
        ) : (
          <ul className={styles.list}>
            {visible.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onMarkRead={() => markRead.mutate([notification.id])}
                busy={markRead.isPending}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function FilterTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      className={[styles.tab, active ? styles.tabActive : ''].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      {label}
      <span className={styles.tabCount}>{count}</span>
    </button>
  )
}

function NotificationRow({
  notification,
  onMarkRead,
  busy,
}: {
  notification: Notification
  onMarkRead: () => void
  busy: boolean
}) {
  return (
    <li className={[styles.row, notification.isRead ? '' : styles.rowUnread].filter(Boolean).join(' ')}>
      {/* Unread is marked by a dot and by weight, not by colour alone. */}
      <span
        className={[styles.dot, notification.isRead ? styles.dotRead : ''].filter(Boolean).join(' ')}
        aria-hidden="true"
      />
      <div className={styles.rowBody}>
        <div className={styles.rowHead}>
          <span className={styles.rowTitle}>{notification.title}</span>
          <span className={[styles.typeTag, TYPE_TONE[notification.type]].join(' ')}>
            {TYPE_LABEL[notification.type] ?? notification.type}
          </span>
        </div>
        <p className={styles.rowMessage}>{notification.message}</p>
        <span className={styles.rowTime}>{formatRelative(notification.createdAt)}</span>
      </div>
      {!notification.isRead && (
        <Button size="sm" variant="ghost" disabled={busy} onClick={onMarkRead}>
          Mark read
        </Button>
      )}
      <span className="visually-hidden">{notification.isRead ? 'Read' : 'Unread'}</span>
    </li>
  )
}

/** Recent things read better as "2 hours ago"; older ones need the actual date. */
function formatRelative(iso: string): string {
  const then = new Date(iso).getTime()
  const minutes = Math.round((Date.now() - then) / 60_000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`

  const days = Math.round(hours / 24)
  if (days <= 7) return `${days} day${days === 1 ? '' : 's'} ago`

  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
