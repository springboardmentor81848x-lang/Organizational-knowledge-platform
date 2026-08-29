import { api } from './client'
import type { AuditLog, Role, SystemHealth, UserProfile } from '@/types/api'

export interface UpdateRoleRequest {
  role: Role
}

export interface UpdateUserStatusRequest {
  active: boolean
}

export interface JobAssignmentRequest {
  department: string
  jobTitle: string
}

export interface AdminPasswordResetRequest {
  newPassword: string
}

export const adminApi = {
  users: (signal?: AbortSignal) => api.get<UserProfile[]>('/api/admin/users', signal),
  user: (userId: number, signal?: AbortSignal) =>
    api.get<UserProfile>(`/api/admin/users/${userId}`, signal),

  updateRole: (userId: number, body: UpdateRoleRequest) =>
    api.put<UserProfile>(`/api/admin/users/${userId}/role`, body),
  updateStatus: (userId: number, body: UpdateUserStatusRequest) =>
    api.put<UserProfile>(`/api/admin/users/${userId}/status`, body),
  updateJobAssignment: (userId: number, body: JobAssignmentRequest) =>
    api.put<UserProfile>(`/api/admin/users/${userId}/job-assignment`, body),
  resetPassword: (userId: number, body: AdminPasswordResetRequest) =>
    api.put<void>(`/api/admin/users/${userId}/password-reset`, body),
  removeUser: (userId: number) => api.delete<void>(`/api/admin/users/${userId}`),

  auditLogs: (signal?: AbortSignal) => api.get<AuditLog[]>('/api/admin/audit-logs', signal),
  systemHealth: (signal?: AbortSignal) => api.get<SystemHealth>('/api/admin/system/health', signal),
}
