/**
 * One registry for every cache key in the app.
 *
 * Keys live here rather than beside their hooks because invalidation is the hard part. When an
 * employee submits an assessment the backend cascades: proficiency moves, gaps recalculate,
 * recommendations regenerate, learning paths refresh, a notification is written, and the
 * employee's, their manager's and their department's analytics all change. The mutation has to
 * invalidate every one of those, including views belonging to somebody else — a manager's
 * dashboard must show the change without them reloading the page.
 *
 * Getting that right requires seeing all the keys at once, and requires them to nest so that a
 * broad invalidation catches the narrow ones beneath it: invalidating ['analytics'] drops every
 * dashboard, invalidating ['analytics', 'employee', 7] drops only that one.
 */

export const queryKeys = {
  session: ['session'] as const,

  notifications: {
    all: ['notifications'] as const,
    forUser: (userId?: number) => ['notifications', userId ?? 'me'] as const,
  },

  /** The roles that can be aimed at; derived from the competency profiles that exist. */
  targetRoles: () => ['target-roles'] as const,

  skills: {
    all: ['skills'] as const,
    catalog: () => ['skills', 'catalog'] as const,
    forUser: (userId: number) => ['skills', 'user', userId] as const,
  },

  gaps: {
    all: ['gaps'] as const,
    forUser: (userId: number) => ['gaps', 'user', userId] as const,
    summary: (userId: number) => ['gaps', 'user', userId, 'summary'] as const,
    // Nested under the user's gaps so the assessment cascade's existing invalidation of
    // ['gaps','user',id] drops the heatmap too, rather than leaving it showing old colours.
    heatmap: (userId: number) => ['gaps', 'user', userId, 'heatmap'] as const,
    org: () => ['gaps', 'org'] as const,
    department: (department: string) => ['gaps', 'department', department] as const,
  },

  recommendations: {
    all: ['recommendations'] as const,
    forUser: (userId: number) => ['recommendations', 'user', userId] as const,
  },

  /** Sign-ups waiting to be granted access. Scoped to the caller by the server, not by key. */
  accessRequests: {
    all: ['access-requests'] as const,
    pending: () => ['access-requests', 'pending'] as const,
  },

  /**
   * The assistant's opening prompts. Keyed under the user because they are chosen from that
   * person's own gaps and enrolments, so the assessment cascade must be able to drop them.
   */
  assistant: {
    all: ['assistant'] as const,
    suggestions: (userId?: number) => ['assistant', 'suggestions', userId ?? 'me'] as const,
  },

  learningPaths: {
    all: ['learning-paths'] as const,
    forUser: (userId: number) => ['learning-paths', 'user', userId] as const,
  },

  enrollments: {
    all: ['enrollments'] as const,
    forUser: (userId?: number) => ['enrollments', 'user', userId ?? 'me'] as const,
  },

  courses: {
    all: ['courses'] as const,
    catalog: () => ['courses', 'catalog'] as const,
    /**
     * The externally-sourced courses, which is the list an employee is allowed to read. The
     * administrator's full catalogue under `catalog` is refused to them outright.
     */
    external: () => ['courses', 'external'] as const,
  },

  assessments: {
    all: ['assessments'] as const,
    forEmployee: (employeeId?: number) => ['assessments', 'employee', employeeId ?? 'me'] as const,
    results: (assessmentId: number) => ['assessments', 'detail', assessmentId, 'results'] as const,
    history: (employeeId: number) => ['assessments', 'history', employeeId] as const,

    // All three sit under ['assessments'] on purpose. Submitting an attempt consumes the
    // approval that unlocked it and adds to the attempt count, and raising or deciding a
    // request changes what the employee is allowed to do next - so the existing broad
    // invalidation after an assessment already drops every one of them, rather than leaving a
    // screen offering an attempt that has just been used up.
    attemptStatus: () => ['assessments', 'attempt-status'] as const,
    myReattemptRequests: () => ['assessments', 'reattempt-requests', 'mine'] as const,
    reattemptRequests: (status?: string) =>
      ['assessments', 'reattempt-requests', 'review', status ?? 'all'] as const,
  },

  mentorships: {
    all: ['mentorships'] as const,
    forUser: (employeeId: number) => ['mentorships', 'user', employeeId] as const,
    recommendations: (employeeId: number, skillId: number) =>
      ['mentorships', 'recommendations', employeeId, skillId] as const,
  },

  sessions: {
    all: ['sessions'] as const,
    list: (filters?: Record<string, unknown>) => ['sessions', 'list', filters ?? {}] as const,
    detail: (sessionId: number) => ['sessions', 'detail', sessionId] as const,
  },

  experts: {
    all: ['experts'] as const,
    search: (skill: string, minProficiency?: string) =>
      ['experts', 'search', skill, minProficiency ?? 'any'] as const,
  },

  team: {
    all: ['team'] as const,
    /** Keyed by scope so a manager view and a department view never share a cache entry. */
    members: (scope: 'manager' | 'department') => ['team', scope, 'members'] as const,
    gapMatrix: (scope: 'manager' | 'department') => ['team', scope, 'gap-matrix'] as const,
    highRiskGaps: (scope: 'manager' | 'department') => ['team', scope, 'high-risk'] as const,
    adoption: (scope: 'manager' | 'department') => ['team', scope, 'adoption'] as const,
    memberProgress: (scope: 'manager' | 'department', employeeId: number) =>
      ['team', scope, 'member', employeeId] as const,
  },

  /**
   * Workforce intelligence, at organisation scope. Kept apart from the team keys because they
   * are answered by different endpoints for a different audience: nothing here narrows to a
   * caller's own reports, so sharing a cache entry with the team views would be wrong.
   */
  hr: {
    all: ['hr'] as const,
    gapMatrix: (department?: string) => ['hr', 'gap-matrix', department ?? 'all'] as const,
    skillInventory: () => ['hr', 'skill-inventory'] as const,
    trainingEffectiveness: () => ['hr', 'training-effectiveness'] as const,
    gapTrends: (department?: string) => ['hr', 'gap-trends', department ?? 'all'] as const,
    employees: (filters: Record<string, unknown>) => ['hr', 'employees', filters] as const,
  },

  analytics: {
    all: ['analytics'] as const,
    employee: (employeeId: number) => ['analytics', 'employee', employeeId] as const,
    team: (managerId: number) => ['analytics', 'team', managerId] as const,
    department: (department: string) => ['analytics', 'department', department] as const,
    organization: () => ['analytics', 'organization'] as const,
    skillGaps: () => ['analytics', 'skill-gaps'] as const,
  },

  /** The learning catalogue, as its administrator sees it. */
  catalog: {
    all: ['catalog'] as const,
    courses: () => ['catalog', 'courses'] as const,
    course: (courseId: number) => ['catalog', 'courses', courseId] as const,
    participation: (courseId: number) => ['catalog', 'courses', courseId, 'participation'] as const,
    external: () => ['catalog', 'external'] as const,
    learningPaths: () => ['catalog', 'learning-paths'] as const,
    expiringCertifications: () => ['catalog', 'certifications', 'expiring'] as const,
  },

  admin: {
    all: ['admin'] as const,
    users: (department?: string) => ['admin', 'users', department ?? 'all'] as const,
    user: (userId: number) => ['admin', 'users', userId] as const,
    roles: () => ['admin', 'roles'] as const,
    permissions: () => ['admin', 'permissions'] as const,
    auditLogs: () => ['admin', 'audit-logs'] as const,
    health: () => ['admin', 'health'] as const,
  },

  achievements: {
    all: ['achievements'] as const,
    forUser: (userId: number) => ['achievements', 'user', userId] as const,
  },
} as const
