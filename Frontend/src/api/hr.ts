import { api } from './client'
import type { HeatmapMatrix } from '@/types/heatmap'
import type {
  EmployeeDirectoryRow,
  EmployeeSearchFilters,
  GapTrendPoint,
  SkillInventoryRow,
  TrainingEffectivenessRow,
} from '@/types/hr'
import type { Role } from '@/types/api'

/**
 * Workforce intelligence, at organisation scope.
 *
 * These sit behind /api/hr, which admits only the HR roles and the administrators. That is what
 * makes the scope real: a manager calling this is refused rather than quietly served their own
 * team, so the organisation-wide view cannot be reached by anyone whose remit is narrower than
 * the organisation.
 */

function query(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, value)
  }
  const rendered = search.toString()
  return rendered ? `?${rendered}` : ''
}

export const hrApi = {
  /**
   * The person-by-skill matrix across the organisation, in the same shape a manager's team
   * matrix arrives in, so the same component renders both.
   */
  gapMatrix: (department: string | undefined, signal?: AbortSignal) =>
    api.get<HeatmapMatrix>(`/api/hr/gap-matrix${query({ department })}`, signal),

  skillInventory: (signal?: AbortSignal) =>
    api.get<SkillInventoryRow[]>('/api/hr/skill-inventory', signal),

  trainingEffectiveness: (signal?: AbortSignal) =>
    api.get<TrainingEffectivenessRow[]>('/api/hr/training-effectiveness', signal),

  /** The recorded gap history. Empty until the snapshot job has run at least once. */
  gapTrends: (department: string | undefined, signal?: AbortSignal) =>
    api.get<GapTrendPoint[]>(`/api/hr/gap-trends${query({ department })}`, signal),

  employees: (filters: EmployeeSearchFilters, signal?: AbortSignal) =>
    api.get<EmployeeDirectoryRow[]>(
      `/api/hr/employees${query({
        query: filters.query,
        department: filters.department,
        role: filters.role || undefined,
      })}`,
      signal,
    ),

  /**
   * Moves somebody's department or job title. Both are sent as query parameters because that is
   * what the endpoint reads; either may be omitted to leave it unchanged.
   */
  updateAssignment: (employeeId: number, changes: { department?: string; jobTitle?: string }) =>
    api.put<EmployeeDirectoryRow>(
      `/api/hr/employees/${employeeId}/department${query(changes)}`,
    ),
}

export type { Role }
