import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryObserver } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { invalidateAfterAssessment } from '@/api/invalidation'

/**
 * The chain a submitted assessment has to set off on the client.
 *
 * The server does its half in one transaction: proficiency moves, gaps recalculate,
 * recommendations regenerate, a notification is written. None of that reaches the screen unless
 * the cached queries behind those screens are dropped, and a mutation that forgets one leaves
 * that panel showing the state from before the submission — with no error to give it away,
 * which is what makes this worth pinning rather than eyeballing.
 *
 * Each case seeds the cache as if the screen had already loaded, runs the invalidation the
 * submit handler runs, and asserts the entry is no longer trusted.
 */
describe('the invalidation chain after an assessment', () => {
  const EMPLOYEE_ID = 2

  let queryClient: QueryClient

  /** Seeds a key as freshly loaded, so "stale" afterwards can only come from invalidation. */
  function seed(key: readonly unknown[], data: unknown) {
    queryClient.setQueryData(key, data)
    expect(queryClient.getQueryState(key)?.isInvalidated).toBe(false)
  }

  function isStale(key: readonly unknown[]) {
    return queryClient.getQueryState(key)?.isInvalidated === true
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  it('drops the skill profile, so the level shown on the profile screen is re-read', async () => {
    const key = queryKeys.skills.forUser(EMPLOYEE_ID)
    seed(key, [{ skillId: 1, proficiencyLevel: 'INTERMEDIATE' }])

    await invalidateAfterAssessment(queryClient, EMPLOYEE_ID)

    expect(isStale(key)).toBe(true)
  })

  it('drops the gap list and the gap summary', async () => {
    const list = queryKeys.gaps.forUser(EMPLOYEE_ID)
    const summary = queryKeys.gaps.summary(EMPLOYEE_ID)
    seed(list, [{ skillId: 1, gapScore: 3 }])
    seed(summary, { overallReadinessPercentage: 60 })

    await invalidateAfterAssessment(queryClient, EMPLOYEE_ID)

    expect(isStale(list)).toBe(true)
    expect(isStale(summary)).toBe(true)
  })

  it('drops the recommendations, which the server regenerates from the new gaps', async () => {
    const key = queryKeys.recommendations.forUser(EMPLOYEE_ID)
    seed(key, [{ id: 1, skillName: 'Java' }])

    await invalidateAfterAssessment(queryClient, EMPLOYEE_ID)

    expect(isStale(key)).toBe(true)
  })

  it('drops the notification feed, so the assessment notification appears', async () => {
    const key = queryKeys.notifications.forUser()
    seed(key, [])

    await invalidateAfterAssessment(queryClient, EMPLOYEE_ID)

    expect(isStale(key)).toBe(true)
  })

  it('drops the learning paths, which are rebuilt from the changed gaps', async () => {
    const key = queryKeys.learningPaths.forUser(EMPLOYEE_ID)
    seed(key, [{ id: 1, overallProgressPercent: 0 }])

    await invalidateAfterAssessment(queryClient, EMPLOYEE_ID)

    expect(isStale(key)).toBe(true)
  })

  it('drops the assessment history, so the new one is listed', async () => {
    const key = queryKeys.assessments.forEmployee(EMPLOYEE_ID)
    seed(key, [])

    await invalidateAfterAssessment(queryClient, EMPLOYEE_ID)

    expect(isStale(key)).toBe(true)
  })

  /**
   * The one most easily missed. A manager's dashboard counts this employee, and an assessment
   * changes what it should say — but the mutation happens on the employee's screen, so nothing
   * about the manager's view is obviously involved.
   */
  it("drops the manager's team dashboard and the department view, not just the employee's own", async () => {
    const own = queryKeys.analytics.employee(EMPLOYEE_ID)
    const team = queryKeys.analytics.team(1)
    const department = queryKeys.analytics.department('Engineering')
    const organization = queryKeys.analytics.organization()
    seed(own, { learningProgressPercent: 0 })
    seed(team, { teamSize: 1 })
    seed(department, { totalEmployees: 2 })
    seed(organization, { totalEmployees: 6 })

    await invalidateAfterAssessment(queryClient, EMPLOYEE_ID)

    expect(isStale(own)).toBe(true)
    expect(isStale(team)).toBe(true)
    expect(isStale(department)).toBe(true)
    expect(isStale(organization)).toBe(true)
  })

  it('leaves unrelated caches alone rather than clearing everything', async () => {
    const unrelated = queryKeys.courses.catalog()
    const otherEmployeeSkills = queryKeys.skills.forUser(99)
    seed(unrelated, [{ id: 1, title: 'Kafka' }])
    seed(otherEmployeeSkills, [])

    await invalidateAfterAssessment(queryClient, EMPLOYEE_ID)

    // The course catalog does not change because somebody was assessed, and another employee's
    // skill list is not affected by this employee's assessment.
    expect(isStale(unrelated)).toBe(false)
    expect(isStale(otherEmployeeSkills)).toBe(false)
  })
})

/**
 * The refetch actually happening, rather than only the entry being marked stale. An invalidated
 * query that nothing is observing stays put until something asks for it; a mounted screen must
 * go back to the server on its own.
 */
describe('an observed query refetches after the chain runs', () => {
  it('re-reads the gap list without anybody reloading the page', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const key = queryKeys.gaps.forUser(2)

    const fetcher = vi
      .fn()
      .mockResolvedValueOnce([{ skillName: 'Java', gapScore: 3 }])
      .mockResolvedValueOnce([{ skillName: 'Java', gapScore: 1 }])

    // Standing in for a mounted GapsPage. The subscription matters: React Query only refetches
    // queries something is actually watching, so an unobserved cache entry would go stale and
    // sit there — which would make this test pass for the wrong reason.
    const observer = new QueryObserver(queryClient, { queryKey: key, queryFn: fetcher })
    const unsubscribe = observer.subscribe(() => {})

    // Waiting for the query to settle, not merely for the fetcher to have been called. An
    // invalidation that lands while a fetch is still in flight is absorbed into it rather than
    // starting a second one, so invalidating too early would prove nothing.
    await vi.waitFor(() => {
      const state = queryClient.getQueryState(key)
      expect(state?.status).toBe("success")
      expect(state?.fetchStatus).toBe("idle")
    })
    expect(fetcher).toHaveBeenCalledTimes(1)

    await invalidateAfterAssessment(queryClient, 2)

    // The gap the assessment closed is reflected because the query went back to the server,
    // not because anything cached was edited in place.
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
    expect(queryClient.getQueryData(key)).toEqual([{ skillName: 'Java', gapScore: 1 }])
    unsubscribe()
  })
})
