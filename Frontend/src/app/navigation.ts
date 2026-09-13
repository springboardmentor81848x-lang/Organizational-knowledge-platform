import type { Role } from '@/types/api'
import { ROLES_WITH_DEVELOPMENT_TRACK } from './roleRoutes'

/**
 * What each role can reach.
 *
 * This mirrors the scoping the backend already enforces — it is a way of not showing people
 * doors that will be refused, not a security boundary. Every endpoint behind these routes
 * checks the caller's role itself.
 *
 * <h2>Why the personal section is not shown to everyone</h2>
 * It used to be. Every signed-in account, a system administrator included, got My development,
 * My skills, My gaps, Recommendations, Learning, Assessments, Mentorship and Achievements —
 * eight items, none of which do anything for an account that exists to run the platform rather
 * than to work in the business. An administrator has no target role, so the assessment refuses
 * to build; no competency profile, so the gap list is empty or an error; and nothing is
 * recommended to them because there is no gap to recommend against. Every one of those screens
 * was a dead end reached by a link the product itself had offered.
 *
 * Worse than useless, in one case: were an administrator to take an assessment, it would write
 * proficiency rows and put them in the workforce heatmap as a data point about a workforce they
 * are not part of.
 *
 * So the personal section belongs to the roles that are actually measured, and the operational
 * roles get the sections they work in. See {@link ROLES_WITH_DEVELOPMENT_TRACK}, which the
 * backend's own `Role.hasDevelopmentTrack()` mirrors.
 */

export interface NavItem {
  label: string
  to: string
  /** Roles that see the item. Omitted means everyone who is signed in. */
  roles?: Role[]
}

export interface NavSection {
  label: string
  items: NavItem[]
}

const MANAGER_ROLES: Role[] = ['MANAGER', 'SYSTEM_ADMIN', 'ADMIN']
const DEPARTMENT_ROLES: Role[] = ['DEPARTMENT_HEAD', 'SYSTEM_ADMIN', 'ADMIN']
const PEOPLE_ROLES: Role[] = ['HR_SPECIALIST', 'HR_ADMIN', 'SYSTEM_ADMIN', 'ADMIN']
const LEARNING_ROLES: Role[] = ['LND_ADMIN', 'SYSTEM_ADMIN', 'ADMIN']
const ADMIN_ROLES: Role[] = ['SYSTEM_ADMIN', 'ADMIN']

/**
 * Who may grant somebody access to the platform: the head of the department a sign-up named,
 * plus HR and system administrators, who can decide any of them. Mirrors the set enforced in
 * {@code AccessRequestService} on the server.
 */
const APPROVER_ROLES: Role[] = [
  'DEPARTMENT_HEAD',
  'HR_SPECIALIST',
  'HR_ADMIN',
  'SYSTEM_ADMIN',
  'ADMIN',
]

/** Everyone keeps their own account screens, whether or not they are measured. */
const EVERYONE: Role[] = [
  'EMPLOYEE',
  'MANAGER',
  'DEPARTMENT_HEAD',
  'HR_SPECIALIST',
  'HR_ADMIN',
  'LND_ADMIN',
  'SYSTEM_ADMIN',
  'ADMIN',
]

/**
 * Sessions and the expert directory.
 *
 * These stay open to the operational roles on purpose, unlike the rest of the personal section.
 * They are about the organisation rather than about you: a knowledge-sharing session is
 * something an L&D administrator schedules and an HR administrator needs to see, and the expert
 * directory is a lookup, not a measurement. Neither depends on having a target role.
 */
const COMMUNITY_ROLES: Role[] = EVERYONE

export const navigation: NavSection[] = [
  {
    label: 'My development',
    items: [
      { label: 'My development', to: '/me', roles: ROLES_WITH_DEVELOPMENT_TRACK },
      { label: 'My skills', to: '/skills', roles: ROLES_WITH_DEVELOPMENT_TRACK },
      { label: 'Assessments', to: '/assessments', roles: ROLES_WITH_DEVELOPMENT_TRACK },
      { label: 'My gaps', to: '/gaps', roles: ROLES_WITH_DEVELOPMENT_TRACK },
      { label: 'Recommendations', to: '/recommendations', roles: ROLES_WITH_DEVELOPMENT_TRACK },
      { label: 'Assistant', to: '/assistant', roles: ROLES_WITH_DEVELOPMENT_TRACK },
      { label: 'Learning', to: '/learning', roles: ROLES_WITH_DEVELOPMENT_TRACK },
      { label: 'Mentorship', to: '/mentorship', roles: ROLES_WITH_DEVELOPMENT_TRACK },
      { label: 'Achievements', to: '/achievements', roles: ROLES_WITH_DEVELOPMENT_TRACK },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'My profile', to: '/profile', roles: EVERYONE },
      { label: 'Notifications', to: '/notifications', roles: EVERYONE },
    ],
  },
  {
    label: 'Organisation',
    items: [
      { label: 'Sessions', to: '/sessions', roles: COMMUNITY_ROLES },
      { label: 'Expert directory', to: '/experts', roles: COMMUNITY_ROLES },
    ],
  },
  {
    label: 'Team',
    items: [
      { label: 'My team', to: '/team', roles: MANAGER_ROLES },
      { label: 'Department', to: '/department', roles: DEPARTMENT_ROLES },
    ],
  },
  {
    label: 'Insight',
    items: [
      { label: 'Workforce', to: '/workforce', roles: PEOPLE_ROLES },
      { label: 'Course catalog', to: '/catalog', roles: LEARNING_ROLES },
      // Everyone the reports route admits gets the link. A role that can open a page by
      // typing its URL should not have to: the two lists are the same list.
      {
        label: 'Reports',
        to: '/reports',
        roles: [...PEOPLE_ROLES, ...MANAGER_ROLES, ...DEPARTMENT_ROLES, ...LEARNING_ROLES],
      },
      // Not inside /admin, because a department head is an approver but is not an
      // administrator: the people who grant access are a wider set than the people who run
      // the platform, so this needs a route of its own.
      { label: 'Account requests', to: '/access-requests', roles: APPROVER_ROLES },
      { label: 'Administration', to: '/admin', roles: ADMIN_ROLES },
    ],
  },
]

export function visibleNavigation(role: Role | undefined): NavSection[] {
  if (!role) return []
  return navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.roles || item.roles.includes(role)),
    }))
    .filter((section) => section.items.length > 0)
}
