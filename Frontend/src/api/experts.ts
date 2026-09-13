import { api } from './client'
import type { Expert, ProficiencyLevel } from '@/types/api'

export const expertsApi = {
  /**
   * Finds colleagues who hold a skill, ranked by proficiency and prior mentoring feedback.
   * The server matches `skill` as a partial, case-insensitive name.
   */
  search: (skill: string, minProficiency?: ProficiencyLevel, signal?: AbortSignal) => {
    const params = new URLSearchParams({ skill })
    if (minProficiency) params.set('minProficiency', minProficiency)
    return api.get<Expert[]>(`/api/experts?${params.toString()}`, signal)
  },
}
