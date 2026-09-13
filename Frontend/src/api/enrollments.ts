import { api } from './client'
import type { Enrollment } from '@/types/api'

export interface MilestoneDefinition {
  title: string
  sequence: number
}

export interface EnrollRequest {
  trainingId: number
  /** Defaults to the caller; supplying it requires a manager or L&D role. */
  employeeId?: number
  targetCompletionDate?: string
  milestones?: MilestoneDefinition[]
}

/**
 * Supply an overall percentage, a single milestone completion, or both. The server rejects a
 * request carrying neither.
 */
export interface UpdateProgressRequest {
  progress?: number
  milestoneId?: number
  completionPercentage?: number
}

export const enrollmentsApi = {
  /** Omitting employeeId returns the enrolments belonging to the caller. */
  list: (employeeId?: number, signal?: AbortSignal) =>
    api.get<Enrollment[]>(
      employeeId ? `/api/enrollments?employeeId=${employeeId}` : '/api/enrollments',
      signal,
    ),

  enroll: (body: EnrollRequest) => api.post<Enrollment>('/api/enrollments', body),

  updateProgress: (enrollmentId: number, body: UpdateProgressRequest) =>
    api.put<Enrollment>(`/api/enrollments/${enrollmentId}/progress`, body),

  /** Fires the achievement and notification chain on the server. */
  complete: (enrollmentId: number) =>
    api.put<Enrollment>(`/api/enrollments/${enrollmentId}/complete`),
}
