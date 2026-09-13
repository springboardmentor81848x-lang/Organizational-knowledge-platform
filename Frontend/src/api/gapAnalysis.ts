import { api } from './client'
import type { GapAnalysis, OrgGapMetrics, UserGapSummary } from '@/types/api'
import type { HeatmapMatrix } from '@/types/heatmap'

export const gapAnalysisApi = {
  /**
   * Recalculates and returns the employee's gaps. Prefer `stored` for read-only views: this
   * one rewrites the gap rows and regenerates recommendations as a side effect.
   */
  recalculateForUser: (userId: number, signal?: AbortSignal) =>
    api.get<GapAnalysis[]>(`/api/gaps/user/${userId}`, signal),

  /** The persisted gaps, computed only if none exist yet. */
  storedForUser: (userId: number, signal?: AbortSignal) =>
    api.get<GapAnalysis[]>(`/api/gaps/user/${userId}/stored`, signal),

  summaryForUser: (userId: number, signal?: AbortSignal) =>
    api.get<UserGapSummary>(`/api/gaps/user/${userId}/summary`, signal),

  /** Required skills the employee has no record of at all. */
  missingForUser: (userId: number, signal?: AbortSignal) =>
    api.get<GapAnalysis[]>(`/api/gaps/user/${userId}/missing`, signal),

  /** Skills held but below the level the role requires. */
  proficiencyGapsForUser: (userId: number, signal?: AbortSignal) =>
    api.get<GapAnalysis[]>(`/api/gaps/user/${userId}/proficiency-gaps`, signal),

  compareToTargetRole: (userId: number, targetJobTitle: string, targetDepartment: string) =>
    api.post<GapAnalysis[]>(
      `/api/gaps/user/${userId}/compare-target?targetJobTitle=${encodeURIComponent(
        targetJobTitle,
      )}&targetDepartment=${encodeURIComponent(targetDepartment)}`,
    ),

  /**
   * The employee's own skill-by-gap heatmap.
   *
   * Built server-side from the same stored gap rows the list below it reads, so the two can
   * never disagree: both move only when an assessment is submitted.
   */
  heatmapForUser: (userId: number, signal?: AbortSignal) =>
    api.get<HeatmapMatrix>(`/api/heatmap/user/${userId}`, signal),

  orgSummary: (signal?: AbortSignal) => api.get<OrgGapMetrics>('/api/gaps/org-summary', signal),
}
