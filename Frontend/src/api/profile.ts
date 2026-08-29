import { api } from './client'
import type { Achievement, EmployeeProfile } from '@/types/api'

export interface EmployeeProfileRequest {
  bio?: string
  department?: string
  jobRole?: string
  workExperience?: string
  education?: string
}

export const profileApi = {
  get: (signal?: AbortSignal) => api.get<EmployeeProfile>('/api/employee/profile', signal),
  update: (body: EmployeeProfileRequest) => api.put<EmployeeProfile>('/api/employee/profile', body),
  achievements: (signal?: AbortSignal) =>
    api.get<Achievement[]>('/api/employee/achievements', signal),
}
