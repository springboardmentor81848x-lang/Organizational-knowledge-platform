/**
 * Types mirroring the backend DTOs.
 *
 * Every shape here was transcribed from a real response captured from the running service, not
 * inferred from the Java class names. That distinction caught several fields that a reasonable
 * guess would have got wrong: courses expose a flattened `skillId`/`skillName` rather than the
 * nested `skillCovered` the entity carries, sessions return `sessionId` rather than `id`, and
 * the expert directory returns `employeeId`/`fullName` rather than the `mentorId`/`mentorName`
 * used by the mentorship endpoints.
 *
 * The enums are written out rather than widened to `string` because several are ordered scales
 * the UI reasons about, and a typo in a comparison should be a compile error.
 */

// ── Enums ───────────────────────────────────────────────────────────────────

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
export type AttendanceStatus = 'REGISTERED' | 'ATTENDED' | 'ABSENT'

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

export type CertificationStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED'

export type AchievementType =
  | 'COURSE_COMPLETED'
  | 'CERTIFICATION_EARNED'
  | 'SKILL_MASTERED'
  | 'MENTORSHIP_COMPLETED'

// ── Auth and profile ────────────────────────────────────────────────────────

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

export interface EmployeeProfile {
  id: number
  userId: number
  userFullName: string
  userEmail: string
  bio: string | null
  department: string | null
  jobRole: string | null
  workExperience: string | null
  education: string | null
  updatedAt: string
}

// ── Skills ──────────────────────────────────────────────────────────────────

export interface Skill {
  id: number
  name: string
  category: string | null
  description: string | null
}

export interface UserSkill {
  id: number
  userId: number
  skillId: number
  skillName: string
  skillCategory: string | null
  proficiencyLevel: ProficiencyLevel
  ratingScore: number | null
}

export interface RoleCompetency {
  id: number
  jobTitle: string
  department: string
  skillId: number
  skillName: string
  requiredProficiencyLevel: ProficiencyLevel
}

// ── Gap analysis ────────────────────────────────────────────────────────────

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
  /** Serialised under this exact name by the backend's @JsonProperty. */
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
  riskDistribution: Record<RiskSeverity, number>
  topCriticalGaps: GapAnalysis[]
}

export interface SkillGapSummary {
  skillId: number
  skillName: string
  category: string | null
  affectedEmployeesCount: number
  averageGapScore: number
}

export interface OrgGapMetrics {
  totalEmployees: number
  totalAnalyzedGaps: number
  overallAverageGapScore: number
  overallReadinessPercentage: number
  riskDistribution: Record<RiskSeverity, number>
  departmentAverageGaps: Record<string, number>
  topMissingSkills: SkillGapSummary[]
}

// ── Recommendations and learning paths ──────────────────────────────────────

export interface TrainingRecommendation {
  id: number
  employeeId: number
  skillId: number
  skillName: string
  recommendationText: string
  suggestedResourceType: string
  priorityRank: number
  sourceGapSeverity: string
  relevanceScore: number
  scoreBreakdown: string | null
  generatedAt: string
}

export interface LearningPathStep {
  id: number
  learningPathId: number
  courseId: number
  courseTitle: string
  courseDescription: string | null
  provider: string
  externalUrl: string | null
  isInternal: boolean
  stepOrder: number
  difficultyStage: string
  estimatedHours: number
  status: string
  completedAt: string | null
}

export interface LearningPath {
  id: number
  employeeId: number
  employeeName: string
  targetSkillId: number | null
  targetSkillName: string | null
  title: string
  description: string | null
  targetRole: string | null
  targetDepartment: string | null
  targetSeverity: string | null
  totalEstimatedHours: number
  estimatedCalendarTime: string
  status: string
  overallProgressPercent: number
  generatedAt: string
  noCoursesAvailable: boolean
  steps: LearningPathStep[]
}

// ── Courses and enrolments ──────────────────────────────────────────────────

export interface Course {
  id: number
  title: string
  description: string | null
  provider: string
  /** Flattened by the API; the entity's association is not exposed. */
  skillId: number | null
  skillName: string | null
  difficulty: string | null
  durationHours: number | null
  isInternal: boolean
  externalUrl: string | null
  createdAt: string
}

export interface LearningMilestone {
  milestoneId: number
  trainingId: number
  title: string
  sequence: number
  completionPercentage: number
  status: EnrollmentStatus
}

export interface Enrollment {
  enrollmentId: number
  employeeId: number
  employeeName: string
  trainingId: number
  trainingTitle: string
  provider: string
  status: EnrollmentStatus
  progress: number
  startDate: string
  completionDate: string | null
  milestones: LearningMilestone[]
}

export interface Achievement {
  id: number
  employeeId: number
  type: AchievementType
  title: string
  description: string | null
  earnedAt: string
}

// ── Assessments ─────────────────────────────────────────────────────────────

export interface AssessmentResult {
  resultId: number
  assessmentId: number
  skillId: number
  skillName: string
  /** Null while the assessment is still PENDING. */
  proficiency: ProficiencyLevel | null
  proficiencyScore: number | null
  score: number | null
  previousProficiency: ProficiencyLevel | null
  improvement: number | null
}

export interface Assessment {
  assessmentId: number
  employeeId: number
  employeeName: string
  assessorId: number
  assessorName: string
  assessmentType: AssessmentType
  status: AssessmentStatus
  date: string
  submittedAt: string | null
  comments: string | null
  results: AssessmentResult[]
}

export interface SkillProgression {
  skillId: number
  skillName: string
  previousProficiency: ProficiencyLevel | null
  previousScore: number | null
  previousAssessedAt: string | null
  currentProficiency: ProficiencyLevel
  currentScore: number
  currentAssessedAt: string
  improvement: number
  assessmentCount: number
}

// ── Mentorship ──────────────────────────────────────────────────────────────

export interface Mentorship {
  mentorshipId: number
  mentorId: number
  mentorName: string
  menteeId: number
  menteeName: string
  skillId: number
  skillName: string
  goal: string | null
  startDate: string | null
  endDate: string | null
  status: MentorshipStatus
  createdAt: string
}

export interface RecommendedMentor {
  mentorId: number
  mentorName: string
  mentorEmail: string
  department: string | null
  jobTitle: string | null
  skillId: number
  skillName: string
  mentorProficiency: ProficiencyLevel
  mentorRatingScore: number | null
  menteeProficiency: ProficiencyLevel
  sameDepartment: boolean
  available: boolean
  activeMentorships: number
  completedMentorships: number
  matchScore: number
  /** Plain-language justifications the backend composes for the match. */
  reasons: string[]
}

// ── Knowledge sessions ──────────────────────────────────────────────────────

export interface SessionRegistration {
  registrationId: number
  employeeId: number
  employeeName: string
  attendanceStatus: AttendanceStatus
  feedbackRating: number | null
  feedbackText: string | null
  registeredAt: string
  feedbackSubmittedAt: string | null
}

export interface KnowledgeSession {
  sessionId: number
  title: string
  description: string | null
  mentorId: number
  mentorName: string
  sessionDate: string
  durationMinutes: number
  capacity: number
  status: SessionStatus
  registeredCount: number
  availableSeats: number
  full: boolean
  attendedCount: number
  feedbackCount: number
  averageFeedbackRating: number | null
  registrations: SessionRegistration[]
  createdAt: string
  updatedAt: string
}

// ── Expert directory ────────────────────────────────────────────────────────

export interface Expert {
  employeeId: number
  fullName: string
  email: string
  department: string | null
  jobTitle: string | null
  skillId: number
  skillName: string
  proficiencyLevel: ProficiencyLevel
  ratingScore: number | null
  mentorRating: number | null
  mentorRatingCount: number
  completedMentorships: number
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

export interface Certification {
  id: number
  employeeId: number
  employeeName: string
  name: string
  issuer: string
  /** Dates only, no time component, as the server sends them. */
  issuedAt: string
  expiresAt: string | null
  status: CertificationStatus
}

// ── Administration ──────────────────────────────────────────────────────────

export interface AuditLog {
  id: number
  actorUserId: number | null
  actorEmail: string
  action: string
  entityType: string
  entityId: string
  details: string
  ipAddress: string | null
  timestamp: string
}

export interface SystemHealth {
  status: string
  activeUserCount: number
  totalUserCount: number
  databaseStatus: string
  timestamp: string
}
