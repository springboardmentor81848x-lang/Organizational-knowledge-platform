import { describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryObserver } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { invalidateAfterAssessment, invalidateAfterEnrollmentChange } from '@/api/invalidation'
import type { Notification } from '@/types/api'

/**
 * The notification centre and its badge have to follow events raised elsewhere in the app.
 *
 * Both read the same cache entry, so a mutation that refreshes the feed refreshes the badge
 * with it. What is worth pinning is that the mutations which cause a server-side notification
 * actually invalidate that entry — an assessment submitted on one screen, a course completed on
 * another — because nothing about those actions makes the notification feed obviously involved.
 */

function notification(id: number, isRead: boolean): Notification {
  return {
    id,
    userId: 2,
    title: `Notification ${id}`,
    message: 'body',
    type: 'GAP_ALERT',
    isRead,
    createdAt: new Date().toISOString(),
  }
}

/** Mounts the feed the way the centre and the badge both do, and waits for it to settle. */
async function mountFeed(queryClient: QueryClient, pages: Notification[][]) {
  const fetcher = vi.fn()
  pages.forEach((page) => fetcher.mockResolvedValueOnce(page))

  const key = queryKeys.notifications.forUser()
  const observer = new QueryObserver(queryClient, { queryKey: key, queryFn: fetcher })
  const unsubscribe = observer.subscribe(() => {})

  // Settled, not merely started: an invalidation landing mid-flight is absorbed into the
  // request already running and would prove nothing.
  await vi.waitFor(() => {
    const state = queryClient.getQueryState(key)
    expect(state?.status).toBe('success')
    expect(state?.fetchStatus).toBe('idle')
  })

  return { key, fetcher, unsubscribe }
}

const unreadCount = (feed: Notification[] | undefined) =>
  (feed ?? []).filter((n) => !n.isRead).length

describe('the notification feed follows events raised elsewhere', () => {
  it('re-reads and the unread count rises after an assessment is submitted', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const { key, fetcher, unsubscribe } = await mountFeed(queryClient, [
      [notification(1, true)],
      // What the server has after the assessment wrote its notification.
      [notification(1, true), notification(2, false)],
    ])

    expect(unreadCount(queryClient.getQueryData(key))).toBe(0)

    await invalidateAfterAssessment(queryClient, 2)

    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
    const feed = queryClient.getQueryData<Notification[]>(key)
    expect(feed).toHaveLength(2)
    // The badge is this number, so it has moved without anybody reloading the page.
    expect(unreadCount(feed)).toBe(1)

    unsubscribe()
  })

  it('re-reads after a course is completed, which awards an achievement notification', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const { key, fetcher, unsubscribe } = await mountFeed(queryClient, [
      [],
      [notification(3, false)],
    ])

    await invalidateAfterEnrollmentChange(queryClient, 2)

    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
    expect(unreadCount(queryClient.getQueryData(key))).toBe(1)

    unsubscribe()
  })

  it('drops the achievements list too, since completing a course earns one', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    queryClient.setQueryData(['achievements', 'me'], [])
    expect(queryClient.getQueryState(['achievements', 'me'])?.isInvalidated).toBe(false)

    await invalidateAfterEnrollmentChange(queryClient, 2)

    expect(queryClient.getQueryState(['achievements', 'me'])?.isInvalidated).toBe(true)
  })
})
