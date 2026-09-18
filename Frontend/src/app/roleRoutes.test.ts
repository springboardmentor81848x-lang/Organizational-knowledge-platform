import { describe, expect, it } from 'vitest'
import { navigation } from './navigation'
import { ROLE_DEFINITIONS, ROUTE_ACCESS } from './roleRoutes'
import type { Role } from '@/types/api'

/**
 * The sidebar and the URL guard have to agree.
 *
 * They answer the same question — may this role open this page — from two lists maintained by
 * hand, and nothing makes them drift loudly. `/team` and `/department` had drifted: the guard
 * admitted a department head to `/team` and an HR account to `/department`, both of which the
 * server's ManagerController and DepartmentHeadController refuse outright. The navigation was
 * right and never offered either link, so the only way to reach the broken page was to type its
 * URL, and the only symptom was a screen of refused panels.
 *
 * A route absent from ROUTE_ACCESS is open to anyone signed in, so only routes named in both
 * lists are compared here.
 */
describe('the sidebar and the route guard admit the same roles', () => {
  const linked = navigation.flatMap((section) => section.items)

  for (const item of linked) {
    const guarded = ROUTE_ACCESS[item.to]
    if (!guarded) continue

    it(`${item.to} is offered to exactly the roles it admits`, () => {
      expect([...new Set(item.roles)].sort()).toEqual([...new Set(guarded)].sort())
    })
  }

  it('guards every route it names with at least one role', () => {
    for (const [route, roles] of Object.entries(ROUTE_ACCESS)) {
      expect(roles, `${route} admits nobody`).not.toHaveLength(0)
    }
  })

  it('sends every role home to a page that role can open', () => {
    for (const [role, definition] of Object.entries(ROLE_DEFINITIONS)) {
      const guarded = ROUTE_ACCESS[definition.home]
      if (!guarded) continue
      expect(guarded, `${role} is sent home to ${definition.home}, which refuses it`).toContain(
        role as Role,
      )
    }
  })

  it('names only roles that exist', () => {
    const known: Role[] = [
      'EMPLOYEE',
      'MANAGER',
      'DEPARTMENT_HEAD',
      'HR_SPECIALIST',
      'HR_ADMIN',
      'LND_ADMIN',
      'SYSTEM_ADMIN',
      'ADMIN',
    ]
    for (const [route, roles] of Object.entries(ROUTE_ACCESS)) {
      for (const role of roles) {
        expect(known, `${route} names an unknown role`).toContain(role)
      }
    }
  })
})
