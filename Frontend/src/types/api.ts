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
  | 'ASSESSMENT_REATTEMPT_REQUEST'
  | 'ASSESSMENT_REATTEMPT_DECISION'
  | 'ACCESS_REQUEST'
  | 'ACCESS_DECISION'
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
  /**
   * The role the person is working towards, as opposed to `jobTitle`, which is the one they
   * hold today. Their assessment questions and gap analysis are both measured against this, so
   * the employee dashboard shows it. Null for accounts that never chose one.
   */
  targetJobTitle: string | null
  targetDepartment: string | null
  /** Where the account stands with the approvers. APPROVED for pre-existing accounts. */
  accessStatus: AccessStatus
  /**
   * Whether the account may be used. Deactivating blocks sign-in and every subsequent request,
   * including ones carrying a token issued before the change.
   */
  active: boolean
}

/** One role that can be aimed at, offered at sign-up and on the profile screen afterwards. */
export interface TargetRoleOption {
  jobTitle: string
  department: string
  /** How many skills the role is measured on, which is also the length of its assessment. */
  skillCount: number
}

export interface SignupRequest {
  email: string
  password: string
  fullName: string
  department: string
  jobTitle: string
  targetJobTitle: string
  targetDepartment: string
}

/**
 * The answer to a sign-up. Deliberately carries no tokens: the account cannot be used until a
 * department head, HR or an administrator grants it access.
 */
export interface SignupResponse {
  email: string
  /** Names who the request went to, so the applicant knows who to chase. */
  message: string
}

/** Where an account stands with the people who grant access. */
export type AccessStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

/** One sign-up in the approval queue. */
export interface AccessRequest {
  id: number
  fullName: string
  email: string
  department: string
  jobTitle: string
  targetJobTitle: string | null
  targetDepartment: string | null
  status: AccessStatus
  decidedByName: string | null
  decidedAt: string | null
  decisionNote: string | null
  /** False when the caller may see the request but not decide it. */
  decidableByCaller: boolean
}

// ── Target-role assessment ───────────────────────────────────────────────────

/** A question as the candidate sees it. The correct answer is never sent with the paper. */
export interface QuizQuestion {
  questionId: number
  skillId: number
  skillName: string
  questionText: string
  options: string[]
  difficulty: ProficiencyLevel
}

export interface Quiz {
  targetJobTitle: string
  targetDepartment: string
  skillCount: number
  questionCount: number
  questions: QuizQuestion[]
}

export interface QuizAnswer {
  questionId: number
  selectedOption: string
}

export interface QuizSkillScore {
  skillId: number
  skillName: string
  questionsAsked: number
  questionsCorrect: number
  scorePercentage: number
  awardedProficiency: ProficiencyLevel
  previousProficiency: ProficiencyLevel | null
  improvement: number
}

export interface QuizGradedAnswer {
  questionId: number
  skillId: number
  skillName: string
  questionText: string
  selectedOption: string
  correctOption: string
  correct: boolean
  difficulty: ProficiencyLevel
  explanation: string | null
}

export interface QuizResult {
  assessmentId: number
  targetJobTitle: string
  targetDepartment: string
  totalQuestions: number
  totalCorrect: number
  overallScorePercentage: number
  /** Per-skill outcome. This is what the gap analysis is recalculated from. */
  skillScores: QuizSkillScore[]
  gradedAnswers: QuizGradedAnswer[]
}

/**
 * Which paper the employee may sit next.
 *
 * `TARGET_ROLE` is the full assessment, taken once. `NEW_SKILLS` covers only skills they have
 * added and never been assessed on - it needs no approval, because nothing on it is being
 * re-measured. `NONE` means there is nothing to sit.
 */
export type AssessmentScope = 'TARGET_ROLE' | 'NEW_SKILLS' | 'NONE'

/** Where a request for another attempt at the assessment has got to. */
export type ReattemptRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

/**
 * An employee asking a higher authority to let them sit the assessment again.
 *
 * `consumedAt` is what makes an approval single-use: once an attempt has spent it the approval
 * is still APPROVED - the decision stands and stays on the record - but it no longer unlocks
 * anything, so the next retake needs a new request.
 */
export interface ReattemptRequest {
  requestId: number
  employeeId: number
  employeeName: string
  employeeEmail: string
  employeeJobTitle: string | null
  employeeDepartment: string | null
  status: ReattemptRequestStatus
  reason: string
  /** Attempts already taken when the request was raised. */
  attemptsAtRequest: number
  createdAt: string
  decidedById: number | null
  decidedByName: string | null
  decisionNote: string | null
  decidedAt: string | null
  consumedAt: string | null
}

/**
 * Whether the signed-in employee may sit the assessment now, and why not if they may not.
 *
 * The screen asks for this before it asks for a question paper, so somebody who has used their
 * attempt is shown the request form rather than a paper the server would refuse to mark. The
 * server checks the same rule when it issues the paper and again when answers arrive; this is
 * what the page renders, not what enforces it.
 */
export interface AssessmentAttemptStatus {
  /**
   * False for accounts that run the platform rather than work in the business - a system, HR or
   * L&D administrator. They are not measured, so they are told so rather than shown a locked
   * assessment as though they had spent an attempt they never had.
   */
  developmentTrack: boolean
  scope: AssessmentScope
  /** Skills on this profile that no assessment has ever put a level against. */
  pendingSkillCount: number
  attemptsTaken: number
  lastAttemptAt: string | null
  canTake: boolean
  /** True when the only way forward is to ask an approver. */
  requestRequired: boolean
  message: string
  latestRequest: ReattemptRequest | null
  /** The approval that taking the assessment now would spend, if there is one. */
  activeApproval: ReattemptRequest | null
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
  /**
   * True until a marked assessment has put a level against this skill.
   *
   * The level still reads UNAWARE in the meantime rather than being null, because everything
   * downstream - gaps, the heatmap, every analytics figure - reads it. This flag is what lets a
   * screen tell "measured, and the answer was nothing" apart from "added, not measured yet".
   */
  awaitingAssessment: boolean
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

/**
 * One scored course from /api/recommendations/{employeeId}/ranked.
 *
 * Distinct from TrainingRecommendation: that is a stored recommendation row, this is a live
 * scoring result over the course catalogue, flattened by the server so no JPA entity crosses
 * the wire.
 */
export interface RankedRecommendation {
  courseId: number | null
  courseTitle: string | null
  courseProvider: string | null
  difficulty: string | null
  durationHours: number | null
  internal: boolean | null
  externalUrl: string | null
  skillId: number | null
  skillName: string | null
  skillCategory: string | null
  score: number
  scoreBreakdown: string | null
}

/** One turn of an assistant conversation. History is held by the client, not the server. */
export interface AssistantMessage {
  role: 'user' | 'assistant'
  content: string
}

/** A course the assistant points at, picked by the server's ranking rather than by the model. */
export interface AssistantSuggestedCourse {
  id: number
  title: string
  provider: string
  skillName: string
  difficulty: string | null
  durationLabel: string | null
  internal: boolean | null
  externalUrl: string | null
  relevanceScore: number
}

export interface AssistantChatResponse {
  answer: string
  suggestedCourses: AssistantSuggestedCourse[]
  followUps: string[]
  /** False when no model was configured and the grounded offline path answered instead. */
  answeredByModel: boolean
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
  /** The server's own answer to whether the catalogue can offer anything for this skill. */
  noCoursesAvailable: boolean
  steps: LearningPathStep[]
  /** The courses making up the path. Sent by the oversight endpoint; absent on some others. */
  courses?: Course[]
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
  /**
   * Scoped to the viewer: the host and administrators get the whole roster, everybody else
   * gets their own registration and nothing more. Optional because a server that withholds the
   * roster may omit it entirely — read it with `?.` rather than assuming an array.
   */
  registrations?: SessionRegistration[] | null
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
