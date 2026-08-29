import type { QueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

/**
 * What each mutation makes stale.
 *
 * Every write in this platform cascades further than it looks. Changing a skill moves the gap
 * analysis built on it, which regenerates recommendations and refreshes learning paths, which
 * changes the employee's dashboard, their manager's team view and their department's totals.
 * Invalidating only the thing that was edited leaves every one of those showing yesterday's
 * answer until something else happens to refetch it.
 *
 * Collecting the fan-out here rather than at each call site means a mutation cannot quietly
 * forget one, and the reason a key is in the list can be written down next to it.
 */

/**
 * Anything derived from one employee's proficiency: their gaps, what is recommended to them,
 * their learning paths and every dashboard that counts them.
 *
 * The analytics invalidation is deliberately broad. A manager's team dashboard and a
 * department's totals both include this employee, and the client has no way of knowing which
 * manager or which department without asking — so it drops every analytics view rather than
 * leaving somebody else's screen wrong.
 */
export function invalidateEmployeeSkillGraph(queryClient: QueryClient, employeeId: number): Promise<void> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.skills.forUser(employeeId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.gaps.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.recommendations.forUser(employeeId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.forUser(employeeId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  ]).then(() => undefined)
}

/** A profile change alters how the person is labelled everywhere they appear. */
export function invalidateProfile(queryClient: QueryClient, employeeId: number): Promise<void> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.session }),
    queryClient.invalidateQueries({ queryKey: ['profile'] }),
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.employee(employeeId) }),
  ]).then(() => undefined)
}
