import { api } from './client'
import type { Enrollment, GapAnalysis, Mentorship } from '@/types/api'
import type { GapHeatmap, TeamMemberSummary, TrainingAdoption } from '@/types/analytics'
import type { HeatmapMatrix } from '@/types/heatmap'

/**
 * The two management surfaces.
 *
 * They are kept as separate objects over separate endpoints rather than one call with a scope
 * parameter, because scope is exactly the thing a caller must not be able to choose. A manager
 * asking /api/manager/team gets their own direct reports because of who they are; a department
 * head asking /api/department-head/department gets their own department for the same reason.
 * Neither can name somebody else's.
 */

export const managerApi = {
  team: (signal?: AbortSignal) => api.get<TeamMemberSummary[]>('/api/manager/team', signal),

  /** Per-skill aggregate across the team: how many gaps at each severity. */
  gapHeatmap: (signal?: AbortSignal) =>
    api.get<GapHeatmap>('/api/manager/team/gap-heatmap', signal),

  /** Person-by-skill matrix, scoped to the direct reports of the calling manager. */
  gapMatrix: (signal?: AbortSignal) =>
    api.get<HeatmapMatrix>('/api/manager/team/gap-matrix', signal),

  highRiskGaps: (signal?: AbortSignal) =>
    api.get<GapAnalysis[]>('/api/manager/team/high-risk-gaps', signal),

  trainingAdoption: (signal?: AbortSignal) =>
    api.get<TrainingAdoption>('/api/manager/team/training-adoption', signal),

  memberProgress: (employeeId: number, signal?: AbortSignal) =>
    api.get<TeamMemberSummary>(`/api/manager/team/${employeeId}/progress`, signal),

  assignTraining: (employeeId: number, courseId: number) =>
    api.post<Enrollment>(`/api/manager/team/${employeeId}/assign-training/${courseId}`),

  assignMentorship: (employeeId: number, mentorId: number, targetSkillId: number) =>
    api.post<Mentorship>(
      `/api/manager/team/${employeeId}/assign-mentorship?mentorId=${mentorId}&targetSkillId=${targetSkillId}`,
    ),
}

export const departmentHeadApi = {
  department: (signal?: AbortSignal) =>
    api.get<TeamMemberSummary[]>('/api/department-head/department', signal),

  gapHeatmap: (signal?: AbortSignal) =>
    api.get<GapHeatmap>('/api/department-head/gap-heatmap', signal),

  /** Person-by-skill matrix, scoped to the department of the calling head. */
  gapMatrix: (signal?: AbortSignal) =>
    api.get<HeatmapMatrix>('/api/department-head/gap-matrix', signal),

  highRiskGaps: (signal?: AbortSignal) =>
    api.get<GapAnalysis[]>('/api/department-head/high-risk-gaps', signal),

  trainingAdoption: (signal?: AbortSignal) =>
    api.get<TrainingAdoption>('/api/department-head/training-adoption', signal),

  memberProgress: (employeeId: number, signal?: AbortSignal) =>
    api.get<TeamMemberSummary>(`/api/department-head/${employeeId}/progress`, signal),

  assignTraining: (employeeId: number, courseId: number) =>
    api.post<Enrollment>(`/api/department-head/${employeeId}/assign-training/${courseId}`),

  assignMentorship: (employeeId: number, mentorId: number, targetSkillId: number) =>
    api.post<Mentorship>(
      `/api/department-head/${employeeId}/assign-mentorship?mentorId=${mentorId}&targetSkillId=${targetSkillId}`,
    ),
}

export type ManagementApi = typeof managerApi
