import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { managerApi, departmentHeadApi } from './team'
import { tokenStore } from '@/lib/tokenStore'

/**
 * Where the mentor and the target skill travel.
 *
 * Both assign-mentorship endpoints bind an `AssignMentorshipRequest` from the request body and
 * validate `mentorId` and `targetSkillId` as required. Sending them in the query string instead
 * left the body empty, so validation refused the request before the service ever saw it and the
 * "Assign mentor" button failed for every team lead and department head who pressed it.
 *
 * Nothing about the URL makes that mistake visible — it looks like a perfectly reasonable call —
 * so this pins the payload rather than leaving it to be rediscovered from a 400.
 */
describe('assigning a mentor', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    tokenStore.set({ accessToken: 'test-token', refreshToken: 'test-refresh' })
    fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ id: 1, mentorName: 'Bob', skillName: 'Java' }), {
          status: 201,
          headers: { 'content-type': 'application/json' },
        }),
    )
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    tokenStore.clear()
    vi.unstubAllGlobals()
  })

  function sentRequest() {
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    return { url, body: JSON.parse(String(init.body)), method: init.method }
  }

  it('sends the manager assignment in the body, not the query string', async () => {
    await managerApi.assignMentorship(2, 7, 3)
    const { url, body, method } = sentRequest()

    expect(method).toBe('POST')
    expect(url).toBe('/api/manager/team/2/assign-mentorship')
    expect(url).not.toContain('?')
    expect(body).toEqual({ mentorId: 7, targetSkillId: 3 })
  })

  it('sends the department head assignment in the body, not the query string', async () => {
    await departmentHeadApi.assignMentorship(2, 7, 3)
    const { url, body, method } = sentRequest()

    expect(method).toBe('POST')
    expect(url).toBe('/api/department-head/2/assign-mentorship')
    expect(url).not.toContain('?')
    expect(body).toEqual({ mentorId: 7, targetSkillId: 3 })
  })
})
