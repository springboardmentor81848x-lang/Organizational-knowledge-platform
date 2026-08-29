import type { Role } from '@/types/api'

/**
 * What each role can reach.
 *
 * This mirrors the scoping the backend already enforces — it is a way of not showing people
 * doors that will be refused, not a security boundary. Every endpoint behind these routes
 * checks the caller's role itself.
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

export const navigation: NavSection[] = [
  {
    label: 'My work',
    items: [
      { label: 'My development', to: '/me' },
      { label: 'My skills', to: '/skills' },
      { label: 'My profile', to: '/profile' },
      { label: 'Achievements', to: '/achievements' },
      { label: 'Notifications', to: '/notifications' },
      { label: 'My gaps', to: '/gaps' },
      { label: 'Recommendations', to: '/recommendations' },
      { label: 'Learning', to: '/learning' },
      { label: 'Assessments', to: '/assessments' },
      { label: 'Mentorship', to: '/mentorship' },
    ],
  },
  {
    label: 'Organisation',
    items: [
      { label: 'Sessions', to: '/sessions' },
      { label: 'Expert directory', to: '/experts' },
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
      { label: 'Reports', to: '/reports', roles: [...PEOPLE_ROLES, ...MANAGER_ROLES] },
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


