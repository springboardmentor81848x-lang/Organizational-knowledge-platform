/**
 * Workforce intelligence shapes.
 *
 * Transcribed from live responses rather than guessed. The nullable numbers below are load-
 * bearing: the backend returns null for a figure it has not measured, and the screens say so in
 * words instead of printing a zero that would read as a real result.
 */

import type { Role } from './api'

export interface SkillInventoryRow {
  skillId: number
  skillName: string
  category: string | null
  /** People with this skill on file at any level, including UNAWARE. */
  headcount: number
  averageProficiency: number
  averageProficiencyLabel: string
}

export interface TrainingEffectivenessRow {
  courseId: number
  courseTitle: string
  provider: string | null
  /** Null when the course is not mapped to a skill, so its effect cannot be measured at all. */
  skillName: string | null
  enrolledCount: number
  completedCount: number
  completionRatePercent: number
  /** Finished enrolments with an assessment of the covered skill afterwards to compare against. */
  measuredCount: number
  /** All three are null until measuredCount is at least one. Never substitute a zero. */
  avgPreCourseSkillLevel: number | null
  avgPostCourseSkillLevel: number | null
  avgSkillImprovement: number | null
}

/**
 * One recorded point in the gap history. These are written by the weekly snapshot job, so the
 * series is a real record over time rather than a projection from today's numbers.
 */
export interface GapTrendPoint {
  snapshotDate: string
  /** The scope the point was recorded for. "ALL" is the organisation-wide series. */
  department: string
  totalGaps: number
  criticalGapsCount: number
  highGapsCount: number
  mediumGapsCount: number
  lowGapsCount: number
  avgGapScore: number
}

export interface EmployeeDirectoryRow {
  id: number
  email: string
  fullName: string
  role: Role
  department: string | null
  jobTitle: string | null
  avatarUrl: string | null
}

export interface EmployeeSearchFilters {
  query?: string
  department?: string
  role?: Role | ''
}
