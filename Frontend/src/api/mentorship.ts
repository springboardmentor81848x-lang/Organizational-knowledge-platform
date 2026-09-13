import { api } from './client'
import type { Mentorship, RecommendedMentor } from '@/types/api'

export interface MentorshipRequestBody {
  menteeId: number
  mentorId: number
  skillId: number
  goal?: string
  startDate?: string
  endDate?: string
}

export const mentorshipApi = {
  /** Ranked mentor candidates for one employee and skill, with the reasons behind each match. */
  recommendations: (employeeId: number, skillId: number, signal?: AbortSignal) =>
    api.get<RecommendedMentor[]>(
      `/api/mentorships/recommendations?employeeId=${employeeId}&skillId=${skillId}`,
      signal,
    ),

  forEmployee: (employeeId: number, signal?: AbortSignal) =>
    api.get<Mentorship[]>(`/api/mentorships?employeeId=${employeeId}`, signal),

  request: (body: MentorshipRequestBody) => api.post<Mentorship>('/api/mentorships', body),

  accept: (mentorshipId: number) => api.put<Mentorship>(`/api/mentorships/${mentorshipId}/accept`),
  reject: (mentorshipId: number) => api.put<Mentorship>(`/api/mentorships/${mentorshipId}/reject`),
}
