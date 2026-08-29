import { api } from './client'
import type { Course } from '@/types/api'

export interface CourseRequest {
  title: string
  description?: string
  provider: string
  skillId?: number
  difficulty?: string
  durationHours?: number
  isInternal?: boolean
  externalUrl?: string
}

export interface CourseParticipation {
  courseId: number
  courseTitle: string
  totalEnrolled: number
  activeCount: number
  completedCount: number
  completionRatePercent: number
  avgProgressPercent: number
}

export const coursesApi = {
  /** The internal catalog, administered by L&D. */
  list: (signal?: AbortSignal) => api.get<Course[]>('/api/ld-admin/courses', signal),
  get: (courseId: number, signal?: AbortSignal) =>
    api.get<Course>(`/api/ld-admin/courses/${courseId}`, signal),
  create: (body: CourseRequest) => api.post<Course>('/api/ld-admin/courses', body),
  update: (courseId: number, body: CourseRequest) =>
    api.put<Course>(`/api/ld-admin/courses/${courseId}`, body),
  remove: (courseId: number) => api.delete<void>(`/api/ld-admin/courses/${courseId}`),

  participation: (courseId: number, signal?: AbortSignal) =>
    api.get<CourseParticipation>(`/api/ld-admin/courses/${courseId}/participation`, signal),

  /** Courses pulled in from external providers. */
  external: (signal?: AbortSignal) => api.get<Course[]>('/api/catalog/external', signal),
  importFromProvider: (providerName: string, keyword: string) =>
    api.post<Course[]>(
      `/api/catalog/import/provider/${encodeURIComponent(providerName)}?keyword=${encodeURIComponent(keyword)}`,
    ),
}
