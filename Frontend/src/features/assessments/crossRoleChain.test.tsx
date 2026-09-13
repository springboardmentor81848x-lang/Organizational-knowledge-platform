import { describe, expect, it, beforeEach } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { invalidateAfterAssessment, invalidateAfterEnrollmentChange } from '@/api/invalidation'

/**
 * The half of the Milestone 3 chain that crosses from one person's screen to another's.
 *
 * The employee's own cascade was already pinned in assessmentChain.test.tsx. This covers what
 * happens to everybody else: a manager watching their team, an HR specialist watching the
 * organisation, a learning administrator watching a course. Those screens are keyed separately
 * from the employee's, so an invalidation that stops at the employee leaves them showing the
 * answer from before the submission, with nothing on screen to suggest it is out of date.
 *
 * That failure mode is invisible by construction, which is why it is pinned here rather than
 * checked by hand: the panel renders perfectly, it is simply wrong.
 */
describe('the chain across roles', () => {
  const EMPLOYEE_ID = 2

  let queryClient: QueryClient

  function seed(key: readonly unknown[], data: unknown) {
    queryClient.setQueryData(key, data)
    expect(queryClient.getQueryState(key)?.isInvalidated).toBe(false)
  }

  function isStale(key: readonly unknown[]) {
    return queryClient.getQueryState(key)?.isInvalidated === true
  }

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  })

  describe('after an employee submits an assessment', () => {
    it("drops the manager's team heatmap, which now shows a gap that has closed", async () => {
      const matrix = queryKeys.team.gapMatrix('manager')
      seed(matrix, { matrix: [{ userId: EMPLOYEE_ID, skillName: 'Communication', gapSeverity: 'MEDIUM' }] })

      await invalidateAfterAssessment(queryClient, EMPLOYEE_ID)

      expect(isStale(matrix)).toBe(true)
    })

    it("drops the manager's team list, high-risk alerts and drill-down", async () => {
      const members = queryKeys.team.members('manager')
      const highRisk = queryKeys.team.highRiskGaps('manager')
      const member = queryKeys.team.memberProgress('manager', EMPLOYEE_ID)
      seed(members, [{ id: EMPLOYEE_ID, avgSkillScore: 2 }])
      seed(highRisk, [{ id: 9, skillName: 'Communication' }])
      seed(member, { id: EMPLOYEE_ID, gapCount: 5 })

      await invalidateAfterAssessment(queryClient, EMPLOYEE_ID)

      expect(isStale(members)).toBe(true)
      expect(isStale(highRisk)).toBe(true)
      expect(isStale(member)).toBe(true)
    })

    it("drops the department head's view, which is keyed apart from the manager's", async () => {
      const matrix = queryKeys.team.gapMatrix('department')
      seed(matrix, { matrix: [] })

      await invalidateAfterAssessment(queryClient, EMPLOYEE_ID)

      expect(isStale(matrix)).toBe(true)
    })

    it("drops HR's organisation heatmap and skill inventory", async () => {
      const matrix = queryKeys.hr.gapMatrix()
      const inventory = queryKeys.hr.skillInventory()
      seed(matrix, { matrix: [] })
      seed(inventory, [{ skillId: 8, averageProficiency: 1 }])

      await invalidateAfterAssessment(queryClient, EMPLOYEE_ID)

      expect(isStale(matrix)).toBe(true)
      expect(isStale(inventory)).toBe(true)
    })

    it("drops HR's training effectiveness, which is measured from assessments after a course", async () => {
      const key = queryKeys.hr.trainingEffectiveness()
      seed(key, [{ courseId: 1, measuredCount: 0, avgSkillImprovement: null }])

      await invalidateAfterAssessment(queryClient, EMPLOYEE_ID)

      expect(isStale(key)).toBe(true)
    })
  })

  describe('after an enrolment is created or completed', () => {
    it("drops the manager's training adoption, which counts enrolments and completions", async () => {
      const adoption = queryKeys.team.adoption('manager')
      seed(adoption, { totalMembers: 1, completedMembers: 0 })

      await invalidateAfterEnrollmentChange(queryClient, EMPLOYEE_ID)

      expect(isStale(adoption)).toBe(true)
    })

    it("drops HR's training effectiveness and the L&D course participation", async () => {
      const effectiveness = queryKeys.hr.trainingEffectiveness()
      const participation = queryKeys.catalog.participation(1)
      seed(effectiveness, [{ courseId: 1, completedCount: 0 }])
      seed(participation, { courseId: 1, completedCount: 0, avgDaysToComplete: null })

      await invalidateAfterEnrollmentChange(queryClient, EMPLOYEE_ID)

      expect(isStale(effectiveness)).toBe(true)
      expect(isStale(participation)).toBe(true)
    })

    it('drops the recommendations, which the server regenerates when a course completes', async () => {
      const key = queryKeys.recommendations.forUser(EMPLOYEE_ID)
      seed(key, [{ id: 1, courseTitle: 'the course just finished' }])

      await invalidateAfterEnrollmentChange(queryClient, EMPLOYEE_ID)

      expect(isStale(key)).toBe(true)
    })

    it('leaves unrelated caches alone, so the fix is not just invalidating everything', async () => {
      const sessions = queryKeys.sessions.list()
      const roles = queryKeys.admin.roles()
      seed(sessions, [{ id: 1 }])
      seed(roles, [{ id: 1, name: 'EMPLOYEE' }])

      await invalidateAfterEnrollmentChange(queryClient, EMPLOYEE_ID)

      expect(isStale(sessions)).toBe(false)
      expect(isStale(roles)).toBe(false)
    })
  })
})
