import { api } from './client'
import type {
  DepartmentAnalytics,
  EmployeeAnalytics,
  OrganizationAnalytics,
  SkillGapReportRow,
  TeamAnalytics,
} from '@/types/analytics'

/**
 * Read-only dashboards. Every figure is queried live by the server on each request, so these
 * are always safe to refetch and never return a cached snapshot.
 */
export const analyticsApi = {
  employee: (employeeId: number, signal?: AbortSignal) =>
    api.get<EmployeeAnalytics>(`/api/analytics/employee/${employeeId}`, signal),

  team: (managerId: number, signal?: AbortSignal) =>
    api.get<TeamAnalytics>(`/api/analytics/team/${managerId}`, signal),

  /** Departments are identified by name; they are a property of a user, not an entity. */
  department: (department: string, signal?: AbortSignal) =>
    api.get<DepartmentAnalytics>(
      `/api/analytics/department/${encodeURIComponent(department)}`,
      signal,
    ),

  organization: (signal?: AbortSignal) =>
    api.get<OrganizationAnalytics>('/api/analytics/organization', signal),

  skillGaps: (signal?: AbortSignal) =>
    api.get<SkillGapReportRow[]>('/api/analytics/skill-gaps', signal),
}
