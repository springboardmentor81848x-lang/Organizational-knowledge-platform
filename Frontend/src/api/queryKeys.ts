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

  skills: {
    all: ['skills'] as const,
    catalog: () => ['skills', 'catalog'] as const,
    forUser: (userId: number) => ['skills', 'user', userId] as const,
  },

  gaps: {
    all: ['gaps'] as const,
    forUser: (userId: number) => ['gaps', 'user', userId] as const,
    summary: (userId: number) => ['gaps', 'user', userId, 'summary'] as const,
    org: () => ['gaps', 'org'] as const,
    department: (department: string) => ['gaps', 'department', department] as const,
  },

  recommendations: {
    all: ['recommendations'] as const,
    forUser: (userId: number) => ['recommendations', 'user', userId] as const,
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
  },

  assessments: {
    all: ['assessments'] as const,
    forEmployee: (employeeId?: number) => ['assessments', 'employee', employeeId ?? 'me'] as const,
    results: (assessmentId: number) => ['assessments', 'detail', assessmentId, 'results'] as const,
    history: (employeeId: number) => ['assessments', 'history', employeeId] as const,
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

  analytics: {
    all: ['analytics'] as const,
    employee: (employeeId: number) => ['analytics', 'employee', employeeId] as const,
    team: (managerId: number) => ['analytics', 'team', managerId] as const,
    department: (department: string) => ['analytics', 'department', department] as const,
    organization: () => ['analytics', 'organization'] as const,
    skillGaps: () => ['analytics', 'skill-gaps'] as const,
  },

  achievements: {
    all: ['achievements'] as const,
    forUser: (userId: number) => ['achievements', 'user', userId] as const,
  },
} as const
