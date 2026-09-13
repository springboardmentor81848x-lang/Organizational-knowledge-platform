import { api } from './client'
import type { RankedRecommendation, TrainingRecommendation } from '@/types/api'

export const recommendationsApi = {
  forEmployee: (employeeId: number, signal?: AbortSignal) =>
    api.get<TrainingRecommendation[]>(`/api/recommendations/${employeeId}`, signal),

  /**
   * Ranked live by the shared scoring service rather than by stored priority. Returns scored
   * courses, not stored recommendation rows — a different shape from `forEmployee`.
   */
  rankedForEmployee: (employeeId: number, signal?: AbortSignal) =>
    api.get<RankedRecommendation[]>(`/api/recommendations/${employeeId}/ranked`, signal),

  /** Forces regeneration; normally this happens on its own when gaps are recalculated. */
  generate: (employeeId: number) =>
    api.post<TrainingRecommendation[]>(`/api/recommendations/${employeeId}`),
}
