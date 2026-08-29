import { api } from './client'
import type { LearningPath } from '@/types/api'

export const learningPathsApi = {
  forEmployee: (employeeId: number, signal?: AbortSignal) =>
    api.get<LearningPath[]>(`/api/learning-paths/${employeeId}`, signal),

  get: (employeeId: number, pathId: number, signal?: AbortSignal) =>
    api.get<LearningPath>(`/api/learning-paths/${employeeId}/${pathId}`, signal),

  generate: (employeeId: number) =>
    api.post<LearningPath[]>(`/api/learning-paths/${employeeId}/generate`),

  completeStep: (stepId: number) => api.put<LearningPath>(`/api/learning-paths/steps/${stepId}/complete`),
}
