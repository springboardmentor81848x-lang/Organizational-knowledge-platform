/**
 * Administration and catalogue shapes.
 *
 * Transcribed from live responses. The import result in particular is the whole point of the
 * import screen: it reports what the server actually did with a file, so the screen can say
 * three rows created, one rejected on line four, rather than assuming everything landed.
 */

import type { Course } from './api'

// ── Catalogue import ────────────────────────────────────────────────────────

export interface ImportRowError {
  /** 1-based line in the uploaded file, counting the header. Null for a provider fetch. */
  line: number | null
  /** Whatever title the row carried, so the reader can find it in their own file. */
  title: string | null
  reason: string
}

export interface CatalogImportResult {
  /** The uploaded filename, or the provider that was called. */
  source: string
  fromProvider: boolean
  /**
   * Set when a live provider fetch failed outright. Distinct from a provider that answered
   * normally with nothing: both leave the catalogue unchanged, only one is a fault.
   */
  providerError: string | null
  rowsRead: number
  created: number
  updated: number
  skipped: number
  errors: ImportRowError[]
  /** The courses now in the catalogue as a result, whether created or updated. */
  courses: Course[]
}

// ── Course monitoring ───────────────────────────────────────────────────────

export interface CourseParticipation {
  courseId: number
  courseTitle: string
  totalEnrolled: number
  activeInProgress: number
  completedCount: number
  completionRatePercent: number
  /** Finished enrolments carrying both a start and a completion date to measure. */
  measuredCompletions: number
  /** Mean days from starting to finishing. Null until at least one enrolment has finished. */
  avgDaysToComplete: number | null
}

// ── Roles and permissions ───────────────────────────────────────────────────

/**
 * A row in the editable role registry. Descriptive only: what a signed-in user may actually do
 * is decided by the role on their account and the rules below, not by this table.
 */
export interface RoleEntity {
  id: number
  name: string
  description: string | null
  active: boolean
  createdAt: string
  updatedAt: string | null
}

export interface RoleEntityRequest {
  name: string
  description?: string
  active?: boolean
}

/**
 * One endpoint and the roles its authorization rule admits, read off the running application.
 * `rawRule` is the expression exactly as written, so a rule the summary cannot reduce to a list
 * of roles is still shown in full rather than silently simplified.
 */
export interface EndpointPermission {
  area: string
  method: string
  path: string
  roles: string[]
  anyAuthenticated: boolean
  /** True when the rule also admits the subject themselves, whatever their role. */
  selfPermitted: boolean
  rawRule: string
}
