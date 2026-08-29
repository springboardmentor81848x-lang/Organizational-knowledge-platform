import { api } from './client'
import type {
  Assessment,
  AssessmentResult,
  AssessmentType,
  ProficiencyLevel,
  SkillProgression,
} from '@/types/api'

export interface CreateAssessmentRequest {
  /** Defaults to the caller, which is the normal case for a SELF assessment. */
  employeeId?: number
  assessmentType: AssessmentType
  skillIds: number[]
  date?: string
  comments?: string
}

/**
 * The level awarded for one skill. Give it by name or by its canonical 0-4 score; the server
 * rejects a request that gives neither, or gives both inconsistently.
 */
export interface AssessmentResultRequest {
  skillId: number
  proficiency?: ProficiencyLevel
  proficiencyScore?: number
  /** Optional raw mark out of 100 behind the awarded level. */
  score?: number
}

export interface SubmitAssessmentRequest {
  results: AssessmentResultRequest[]
  comments?: string
}

export const assessmentsApi = {
  /** Omitting employeeId returns the assessments belonging to the caller. */
  list: (employeeId?: number, signal?: AbortSignal) =>
    api.get<Assessment[]>(
      employeeId ? `/api/assessments?employeeId=${employeeId}` : '/api/assessments',
      signal,
    ),

  create: (body: CreateAssessmentRequest) => api.post<Assessment>('/api/assessments', body),

  /**
   * Runs the whole cascade in one server transaction: skill levels move, improvement is
   * recorded, gaps recalculate, recommendations regenerate and the employee is notified.
   * Callers must invalidate broadly afterwards — including the manager view of this employee.
   */
  submit: (assessmentId: number, body: SubmitAssessmentRequest) =>
    api.post<Assessment>(`/api/assessments/${assessmentId}/submit`, body),

  results: (assessmentId: number, signal?: AbortSignal) =>
    api.get<AssessmentResult[]>(`/api/assessments/${assessmentId}/results`, signal),

  /** Previous versus current level per skill, for before-and-after comparison. */
  history: (employeeId: number, signal?: AbortSignal) =>
    api.get<SkillProgression[]>(`/api/assessments/history/${employeeId}`, signal),
}
