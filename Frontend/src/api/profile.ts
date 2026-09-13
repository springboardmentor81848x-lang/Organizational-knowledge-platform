import { api } from './client'
import type { Achievement, EmployeeProfile, TargetRoleOption } from '@/types/api'

export interface EmployeeProfileRequest {
  bio?: string
  department?: string
  jobRole?: string
  workExperience?: string
  education?: string
}

/** The role an employee is working towards. Both halves identify a competency profile. */
export interface TargetRoleRequest {
  jobTitle: string
  department: string
}

export const profileApi = {
  get: (signal?: AbortSignal) => api.get<EmployeeProfile>('/api/employee/profile', signal),
  update: (body: EmployeeProfileRequest) => api.put<EmployeeProfile>('/api/employee/profile', body),

  /**
   * The roles that can be aimed at.
   *
   * Derived from the competency profiles that actually exist rather than typed freely: a target
   * nobody has defined skills for gives an account an assessment with no questions and a gap
   * analysis with nothing to measure against.
   */
  targetRoleOptions: (signal?: AbortSignal) =>
    api.get<TargetRoleOption[]>('/api/role-competencies/target-roles', signal),

  /**
   * Sets the caller's own target role. Always their own - the server reads the user from the
   * token - so this is somebody declaring their ambition, not having one assigned.
   */
  setTargetRole: (body: TargetRoleRequest) =>
    api.put<EmployeeProfile>('/api/employee/target-role', body),
  achievements: (signal?: AbortSignal) =>
    api.get<Achievement[]>('/api/employee/achievements', signal),
}
