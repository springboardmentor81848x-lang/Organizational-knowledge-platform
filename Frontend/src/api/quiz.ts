import { api } from './client'
import type {
  AssessmentAttemptStatus,
  Quiz,
  QuizAnswer,
  QuizResult,
  ReattemptRequest,
  ReattemptRequestStatus,
} from '@/types/api'

/**
 * The target-role assessment, and the once-only rule around it.
 *
 * The first three calls are scoped to the signed-in employee by the server, which reads the user
 * from the token rather than from a parameter - so there is deliberately no user id to pass here,
 * and nobody can fetch a paper or raise a request in somebody else's name.
 */
export const quizApi = {
  /**
   * Whether the caller may sit the assessment right now.
   *
   * Asked before `getQuiz`, so an employee who has already used their attempt is offered the
   * request form instead of a paper the server would refuse to mark.
   */
  attemptStatus: (signal?: AbortSignal) =>
    api.get<AssessmentAttemptStatus>('/api/assessments/quiz/attempt-status', signal),

  /** The question paper for the caller's target role. Never includes the answer key. */
  getQuiz: (signal?: AbortSignal) => api.get<Quiz>('/api/assessments/quiz', signal),

  /**
   * Marks the answers and records them as an assessment, which is what moves the employee's
   * skill levels and, through them, their gaps, heatmap and recommendations. Submitting also
   * spends the approval that unlocked the attempt, if one did.
   */
  submit: (answers: QuizAnswer[]) =>
    api.post<QuizResult>('/api/assessments/quiz/submit', { answers }),

  /** Asks the caller's manager or HR for another attempt. */
  requestReattempt: (reason: string) =>
    api.post<ReattemptRequest>('/api/assessments/quiz/reattempt-requests', { reason }),

  /** The caller's own requests, newest first. */
  myReattemptRequests: (signal?: AbortSignal) =>
    api.get<ReattemptRequest[]>('/api/assessments/quiz/reattempt-requests', signal),

  /**
   * The requests the caller may rule on. Which employees those cover is decided server-side from
   * the caller's role, so a manager cannot widen it to somebody else's team.
   */
  reattemptRequests: (status?: ReattemptRequestStatus, signal?: AbortSignal) =>
    api.get<ReattemptRequest[]>(
      status
        ? `/api/assessments/reattempt-requests?status=${status}`
        : '/api/assessments/reattempt-requests',
      signal,
    ),

  approveReattempt: (requestId: number, note?: string) =>
    api.post<ReattemptRequest>(`/api/assessments/reattempt-requests/${requestId}/approve`, {
      note: note?.trim() || undefined,
    }),

  rejectReattempt: (requestId: number, note?: string) =>
    api.post<ReattemptRequest>(`/api/assessments/reattempt-requests/${requestId}/reject`, {
      note: note?.trim() || undefined,
    }),
}
