import { api } from './client'
import type { TrainingRecommendation } from '@/types/api'

export const recommendationsApi = {
  forEmployee: (employeeId: number, signal?: AbortSignal) =>
    api.get<TrainingRecommendation[]>(`/api/recommendations/${employeeId}`, signal),

  /** Ranked by the shared scoring service rather than by stored priority. */
  rankedForEmployee: (employeeId: number, signal?: AbortSignal) =>
    api.get<TrainingRecommendation[]>(`/api/recommendations/${employeeId}/ranked`, signal),

  /** Forces regeneration; normally this happens on its own when gaps are recalculated. */
  generate: (employeeId: number) =>
    api.post<TrainingRecommendation[]>(`/api/recommendations/${employeeId}`),
}
