import type { Role } from '@/types/api'

/**
 * Where each role lives, and what each role may reach.
 *
 * This is the client half of authorisation. The server enforces the same scoping on every
 * request and is the only thing standing between a user and data they should not see; this
 * exists so a disallowed URL shows an explanation instead of a screen full of failed panels.
 *
 * Nothing here is derived from what the user clicked on the way in. The role comes from the
 * token the backend issued, so the landing tiles cannot influence it.
 */

export interface RoleDefinition {
  /** Where this role is sent after signing in. */
  home: string
  label: string
  /** How the dashboard describes itself, so each role lands somewhere recognisably its own. */
  dashboardTitle: string
  dashboardSubtitle: string
}

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  EMPLOYEE: {
    home: '/me',
    label: 'Employee',
    dashboardTitle: 'My development',
    dashboardSubtitle: 'Where your skills stand against your role, and what is closing the distance.',
  },
  MANAGER: {
    home: '/team',
    label: 'Team Lead',
    dashboardTitle: 'Team capability',
    dashboardSubtitle: 'Where your reports are strong, where they are short, and who is improving.',
  },
  DEPARTMENT_HEAD: {
    home: '/department',
    label: 'Department Head',
    dashboardTitle: 'Department capability',
    dashboardSubtitle: 'Training reach and skill shortfall across your department.',
  },
  HR_SPECIALIST: {
    home: '/workforce',
    label: 'HR Specialist',
    dashboardTitle: 'Workforce intelligence',
    dashboardSubtitle: 'Skill inventory and gap exposure across the organisation.',
  },
  HR_ADMIN: {
    home: '/workforce',
    label: 'HR Administrator',
    dashboardTitle: 'Workforce intelligence',
    dashboardSubtitle: 'Skill inventory and gap exposure across the organisation.',
  },
  LND_ADMIN: {
    home: '/catalog',
    label: 'L&D Administrator',
    dashboardTitle: 'Learning operations',
    dashboardSubtitle: 'What is on offer, who is taking it, and whether it is working.',
  },
  SYSTEM_ADMIN: {
    home: '/admin',
    label: 'System Administrator',
    dashboardTitle: 'Platform administration',
    dashboardSubtitle: 'Accounts, roles and the health of the service.',
  },
  ADMIN: {
    home: '/admin',
    label: 'Administrator',
    dashboardTitle: 'Platform administration',
    dashboardSubtitle: 'Accounts, roles and the health of the service.',
  },
}

/** Which roles may open each route. A route absent from here is open to anyone signed in. */
export const ROUTE_ACCESS: Record<string, Role[]> = {
  '/team': ['MANAGER', 'DEPARTMENT_HEAD', 'SYSTEM_ADMIN', 'ADMIN'],
  '/department': ['DEPARTMENT_HEAD', 'HR_SPECIALIST', 'HR_ADMIN', 'SYSTEM_ADMIN', 'ADMIN'],
  '/workforce': ['HR_SPECIALIST', 'HR_ADMIN', 'SYSTEM_ADMIN', 'ADMIN'],
  '/catalog': ['LND_ADMIN', 'SYSTEM_ADMIN', 'ADMIN'],
  '/reports': [
    'MANAGER',
    'DEPARTMENT_HEAD',
    'HR_SPECIALIST',
    'HR_ADMIN',
    'LND_ADMIN',
    'SYSTEM_ADMIN',
    'ADMIN',
  ],
  '/admin': ['SYSTEM_ADMIN', 'ADMIN'],
}

export function homeFor(role: Role | null | undefined): string {
  return role ? ROLE_DEFINITIONS[role].home : '/me'
}

export function roleLabel(role: Role | null | undefined): string {
  return role ? ROLE_DEFINITIONS[role].label : ''
}

/**
 * Whether a role may open a path. Matches on the route prefix so nested pages inherit the
 * restriction of the section they sit in.
 */
export function canAccess(role: Role | null | undefined, pathname: string): boolean {
  if (!role) return false

  const restriction = Object.entries(ROUTE_ACCESS).find(
    ([route]) => pathname === route || pathname.startsWith(`${route}/`),
  )
  if (!restriction) return true
  return restriction[1].includes(role)
}
