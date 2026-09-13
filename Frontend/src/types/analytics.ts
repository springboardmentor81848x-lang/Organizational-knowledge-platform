/**
 * Analytics and report shapes, kept apart from the core domain types because they are
 * compositions of them rather than entities in their own right.
 */

import type {
  Achievement,
  Enrollment,
  GapAnalysis,
  Mentorship,
  OrgGapMetrics,
  ProficiencyLevel,
  RiskSeverity,
  UserGapSummary,
  UserSkill,
  AssessmentType,
} from './api'

// ── Shared building blocks ──────────────────────────────────────────────────

export interface GapHeatmapCell {
  skillId: number
  skillName: string
  category: string | null
  lowCount: number
  mediumCount: number
  highCount: number
  criticalCount: number
  totalGaps: number
  avgGapScore: number
}

export interface GapHeatmap {
  scope: string
  scopeName: string
  totalEmployees: number
  cells: GapHeatmapCell[]
  generatedAt: string
}

export interface TeamMemberSummary {
  id: number
  fullName: string
  email: string
  jobTitle: string | null
  department: string | null
  avgSkillScore: number
  gapCount: number
  trainingProgressPercent: number
  lastAssessmentDate: string | null
}

export interface TrainingAdoption {
  totalMembers: number
  activeEnrolledMembers: number
  completedMembers: number
  adoptionRatePercent: number
  completionRatePercent: number
  avgProgressPercent: number
}

export interface SkillInventoryEntry {
  skillId: number
  skillName: string
  category: string | null
  headcount: number
  averageProficiency: number
  averageProficiencyLabel: string
}

// ── Employee dashboard ──────────────────────────────────────────────────────

export interface LearningPathSummary {
  learningPathId: number
  title: string
  targetSkillId: number | null
  targetSkillName: string | null
  status: string
  overallProgressPercent: number
  totalEstimatedHours: number
}

export interface UpcomingSessionSummary {
  sessionId: number
  title: string
  mentorName: string
  sessionDate: string
  durationMinutes: number
}

export interface RecentAssessmentResult {
  assessmentId: number
  assessmentType: AssessmentType
  skillId: number
  skillName: string
  previousProficiency: ProficiencyLevel | null
  proficiency: ProficiencyLevel
  improvement: number
  assessedAt: string
}

export interface EmployeeAnalytics {
  employeeId: number
  fullName: string
  email: string
  jobTitle: string | null
  department: string | null
  skillProfile: UserSkill[]
  gapSummary: UserGapSummary
  activeLearningPaths: LearningPathSummary[]
  learningProgressPercent: number
  activeEnrollments: number
  completedEnrollments: number
  achievements: Achievement[]
  upcomingSessions: UpcomingSessionSummary[]
  /** Null when the employee is not currently being mentored. */
  activeMentor: Mentorship | null
  recentAssessmentResults: RecentAssessmentResult[]
  generatedAt: string
}

// ── Team dashboard ──────────────────────────────────────────────────────────

export interface ImprovedAfterTraining {
  employeeId: number
  employeeName: string
  skillId: number
  skillName: string
  trainingId: number
  trainingTitle: string
  trainingCompletedAt: string
  previousProficiency: ProficiencyLevel | null
  currentProficiency: ProficiencyLevel
  improvement: number
  assessedAt: string
}

export interface TrainingProgramUptake {
  trainingId: number
  trainingTitle: string
  provider: string
  skillName: string | null
  enrolledCount: number
  completedCount: number
  completionRatePercent: number
}

export interface TeamAnalytics {
  managerId: number
  managerName: string
  teamSize: number
  gapHeatmap: GapHeatmap
  /** Severity HIGH exactly; CRITICAL gaps raise their own alert when analysis runs. */
  highRiskGapAlerts: GapAnalysis[]
  memberSnapshots: TeamMemberSummary[]
  trainingAdoption: TrainingAdoption
  improvedAfterTraining: ImprovedAfterTraining[]
  topTrainingPrograms: TrainingProgramUptake[]
  generatedAt: string
}

// ── Department and organisation dashboards ──────────────────────────────────

export interface SkillGapFrequency {
  skillId: number
  skillName: string
  category: string | null
  affectedEmployees: number
  criticalCount: number
  averageGapScore: number
}

export interface DepartmentAnalytics {
  department: string
  totalEmployees: number
  eligibleEmployees: number
  employeesEnrolled: number
  employeesCompleted: number
  totalEnrollments: number
  completedEnrollments: number
  trainingCompletionRatePercent: number
  averageLearningProgressPercent: number
  averageSkillImprovement: number
  criticalSkillGapCount: number
  /** Null until gap analysis has run for somebody in the department. */
  topGapBySkill: SkillGapFrequency | null
  generatedAt: string
}

export interface OrganizationAnalytics {
  totalEmployees: number
  gapIntelligence: OrgGapMetrics
  workforceSkillInventory: SkillInventoryEntry[]
  totalEnrollments: number
  completedEnrollments: number
  trainingCompletionRatePercent: number
  averageSkillImprovement: number
  totalAssessmentResults: number
  activeMentorshipCount: number
  generatedAt: string
}

export interface SkillGapDepartmentBreakdown {
  department: string
  affectedEmployees: number
  averageGapScore: number
}

export interface SkillGapReportRow {
  skillId: number
  skillName: string
  category: string | null
  requiredScore: number
  requiredLevel: ProficiencyLevel
  currentAverageScore: number
  currentAverageLevel: ProficiencyLevel
  averageGapScore: number
  affectedEmployees: number
  severity: RiskSeverity
  departmentBreakdown: SkillGapDepartmentBreakdown[]
}

/** Re-exported for callers that receive enrolments embedded in an analytics payload. */
export type { Enrollment }
