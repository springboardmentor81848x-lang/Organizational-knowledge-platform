import { api } from './client'
import type { ProficiencyLevel, RoleCompetency, Skill, UserSkill } from '@/types/api'

export interface SkillRequest {
  name: string
  category?: string
  description?: string
}

export interface UserSkillRequest {
  skillId: number
  proficiencyLevel: ProficiencyLevel
  ratingScore: number
}

export interface RoleCompetencyRequest {
  jobTitle: string
  department: string
  skillId: number
  requiredProficiencyLevel: ProficiencyLevel
}

export const skillsApi = {
  /** The organisation-wide skill catalog. */
  list: (signal?: AbortSignal) => api.get<Skill[]>('/api/skills', signal),
  get: (skillId: number, signal?: AbortSignal) => api.get<Skill>(`/api/skills/${skillId}`, signal),
  create: (body: SkillRequest) => api.post<Skill>('/api/skills', body),
  update: (skillId: number, body: SkillRequest) => api.put<Skill>(`/api/skills/${skillId}`, body),
  remove: (skillId: number) => api.delete<void>(`/api/skills/${skillId}`),

  /** One employee's held skills. */
  forUser: (userId: number, signal?: AbortSignal) =>
    api.get<UserSkill[]>(`/api/users/${userId}/skills`, signal),
  addToUser: (userId: number, body: UserSkillRequest) =>
    api.post<UserSkill>(`/api/users/${userId}/skills`, body),
  updateForUser: (userId: number, userSkillId: number, body: UserSkillRequest) =>
    api.put<UserSkill>(`/api/users/${userId}/skills/${userSkillId}`, body),
  removeFromUser: (userId: number, userSkillId: number) =>
    api.delete<void>(`/api/users/${userId}/skills/${userSkillId}`),

  /** What each role is expected to hold — the target side of every gap. */
  roleCompetencies: (signal?: AbortSignal) =>
    api.get<RoleCompetency[]>('/api/role-competencies', signal),
  createRoleCompetency: (body: RoleCompetencyRequest) =>
    api.post<RoleCompetency>('/api/role-competencies', body),
  updateRoleCompetency: (id: number, body: RoleCompetencyRequest) =>
    api.put<RoleCompetency>(`/api/role-competencies/${id}`, body),
  removeRoleCompetency: (id: number) => api.delete<void>(`/api/role-competencies/${id}`),
}
