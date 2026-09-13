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

/**
 * Roles that are measured by the platform, and so have a target role, an assessment, skills,
 * gaps, recommendations and a learning path.
 *
 * <p>A team lead and a department head are on this list because managing people does not stop
 * somebody being a practitioner with a role to grow into. The roles that are missing exist to
 * operate the platform rather than to work in the business — a system administrator maintains
 * the service, an L&D administrator runs the catalogue, an HR administrator manages accounts.
 * None of them has a competency profile to be measured against, so every personal-development
 * screen is a dead end for them, and an assessment taken by one would put an administrator into
 * the workforce heatmap as a data point about a workforce they are not part of.
 *
 * <p>This mirrors `Role.hasDevelopmentTrack()` on the server, which is what actually enforces
 * it. Keep the two in step.
 */
export const ROLES_WITH_DEVELOPMENT_TRACK: Role[] = [
  'EMPLOYEE',
  'MANAGER',
  'DEPARTMENT_HEAD',
  'HR_SPECIALIST',
]

/** Which roles may open each route. A route absent from here is open to anyone signed in. */
export const ROUTE_ACCESS: Record<string, Role[]> = {
  // The personal-development screens. Listed individually rather than under one prefix
  // because they do not share one, and a role that cannot use them should get the explanation
  // rather than a page of empty panels and failed requests.
  '/me': ROLES_WITH_DEVELOPMENT_TRACK,
  '/skills': ROLES_WITH_DEVELOPMENT_TRACK,
  '/assessments': ROLES_WITH_DEVELOPMENT_TRACK,
  '/gaps': ROLES_WITH_DEVELOPMENT_TRACK,
  '/recommendations': ROLES_WITH_DEVELOPMENT_TRACK,
  // The assistant answers from gaps, proficiencies and enrolments, so it belongs to the roles
  // that have them. An operational account would get an assistant with nothing to read.
  '/assistant': ROLES_WITH_DEVELOPMENT_TRACK,
  '/learning': ROLES_WITH_DEVELOPMENT_TRACK,
  '/mentorship': ROLES_WITH_DEVELOPMENT_TRACK,
  '/achievements': ROLES_WITH_DEVELOPMENT_TRACK,

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
  // Wider than /admin on purpose: a department head grants access to their own department
  // without being an administrator of the platform.
  '/access-requests': ['DEPARTMENT_HEAD', 'HR_SPECIALIST', 'HR_ADMIN', 'SYSTEM_ADMIN', 'ADMIN'],
}

export function homeFor(role: Role | null | undefined): string {
  // '/profile' rather than '/me' for the unknown case: every role can open it, whereas '/me' is
  // now refused to the operational roles, and sending somebody to a refusal is a poor way to
  // recover from not knowing who they are.
  return role ? ROLE_DEFINITIONS[role].home : '/profile'
}

/** Whether this role is measured by the platform at all. */
export function hasDevelopmentTrack(role: Role | null | undefined): boolean {
  return role !== null && role !== undefined && ROLES_WITH_DEVELOPMENT_TRACK.includes(role)
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
