/**
 * Types mirroring the backend DTOs and enums.
 *
 * The enums are written out rather than widened to `string` because several of them are scales
 * the UI reasons about — proficiency is ordered, severity is ordered — and a typo in a comparison
 * should be a compile error, not a silently wrong badge.
 */

export type Role =
  | 'EMPLOYEE'
  | 'MANAGER'
  | 'DEPARTMENT_HEAD'
  | 'HR_SPECIALIST'
  | 'HR_ADMIN'
  | 'LND_ADMIN'
  | 'SYSTEM_ADMIN'
  | 'ADMIN'

/** The canonical 0-4 scale the backend defines on ProficiencyLevel. */
export type ProficiencyLevel = 'UNAWARE' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'

export const PROFICIENCY_SCORE: Record<ProficiencyLevel, number> = {
  UNAWARE: 0,
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
}

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type EnrollmentStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CERTIFIED'
  | 'EXPIRED_RENEWAL'

export type AssessmentType = 'SELF' | 'PEER' | 'MANAGER'
export type AssessmentStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED'

export type MentorshipStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'

export type SessionStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED'

export type NotificationType =
  | 'GAP_ALERT'
  | 'TRAINING_DEADLINE'
  | 'MENTORSHIP_INVITE'
  | 'SESSION_REMINDER'
  | 'ASSESSMENT_REMINDER'
  | 'TRAINING_RECOMMENDATION'
  | 'TRAINING_PROGRESS'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'ASSESSMENT_RESULT'
  | 'MENTORSHIP_REQUEST'
  | 'INFO'
  | 'SYSTEM_ALERT'

export type AchievementType =
  | 'COURSE_COMPLETED'
  | 'CERTIFICATION_EARNED'
  | 'SKILL_MASTERED'
  | 'MENTORSHIP_COMPLETED'

// ── Auth ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: number
  email: string
  fullName: string
  role: Role
  department: string | null
  jobTitle: string | null
  avatarUrl: string | null
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  user: UserProfile
}

export interface LoginRequest {
  email: string
  password: string
}

// ── Skills and gaps ─────────────────────────────────────────────────────────

export interface UserSkill {
  id: number
  userId: number
  skillId: number
  skillName: string
  skillCategory: string | null
  proficiencyLevel: ProficiencyLevel
  ratingScore: number | null
}

export interface GapAnalysis {
  id: number
  userId: number
  userName: string
  skillId: number
  skillName: string
  skillCategory: string | null
  targetScore: number
  currentScore: number
  gapScore: number
  targetProficiency: string
  currentProficiency: string
  isMissingSkill: boolean
  riskSeverity: RiskSeverity
}

export interface UserGapSummary {
  userId: number
  userName: string
  jobTitle: string | null
  department: string | null
  totalRequiredSkills: number
  metSkillsCount: number
  missingSkillsCount: number
  proficiencyGapsCount: number
  overallReadinessPercentage: number
  averageGapScore: number
  riskDistribution: Record<string, number>
  topCriticalGaps: GapAnalysis[]
}

// ── Notifications ───────────────────────────────────────────────────────────

export interface Notification {
  id: number
  userId: number
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string
}
