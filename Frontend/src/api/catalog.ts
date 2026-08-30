import { api } from './client'
import type { Certification, Course, LearningPath } from '@/types/api'
import type { CatalogImportResult, CourseParticipation } from '@/types/admin'

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

/**
 * The learning catalogue, administered by L&D.
 *
 * Imports answer with what the server actually did — rows read, created, updated, and every row
 * it rejected with the reason — rather than with a list of whatever happened to succeed. The
 * screen reports that result verbatim; it never infers success from a 201.
 */
export const catalogApi = {
  courses: (signal?: AbortSignal) => api.get<Course[]>('/api/ld-admin/courses', signal),
  course: (courseId: number, signal?: AbortSignal) =>
    api.get<Course>(`/api/ld-admin/courses/${courseId}`, signal),
  createCourse: (body: CourseRequest) => api.post<Course>('/api/ld-admin/courses', body),
  updateCourse: (courseId: number, body: CourseRequest) =>
    api.put<Course>(`/api/ld-admin/courses/${courseId}`, body),
  removeCourse: (courseId: number) => api.delete<void>(`/api/ld-admin/courses/${courseId}`),

  participation: (courseId: number, signal?: AbortSignal) =>
    api.get<CourseParticipation>(`/api/ld-admin/courses/${courseId}/participation`, signal),

  /** Courses already in the catalogue that came from outside the organisation. */
  external: (signal?: AbortSignal) => api.get<Course[]>('/api/catalog/external', signal),

  /** A live fetch from a wired provider. The keyword narrows what the provider returns. */
  importFromProvider: (providerName: string, skill: string) =>
    api.post<CatalogImportResult>(
      `/api/catalog/import/provider/${encodeURIComponent(providerName)}?skill=${encodeURIComponent(skill)}`,
    ),

  /** A curated CSV or JSON file of external courses. */
  importFile: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.postForm<CatalogImportResult>('/api/catalog/import/file', form)
  },

  /** Every employee's learning path, for oversight across the organisation. */
  learningPaths: (signal?: AbortSignal) =>
    api.get<LearningPath[]>('/api/ld-admin/learning-paths', signal),
  learningPath: (pathId: number, signal?: AbortSignal) =>
    api.get<LearningPath>(`/api/ld-admin/learning-paths/${pathId}`, signal),
  removeLearningPath: (pathId: number) =>
    api.delete<void>(`/api/ld-admin/learning-paths/${pathId}`),

  /** Certifications approaching expiry across the whole organisation. */
  expiringCertifications: (signal?: AbortSignal) =>
    api.get<Certification[]>('/api/ld-admin/certifications/expiring', signal),

  /** Sends the holder a renewal reminder. Writes a real notification to their feed. */
  remindCertification: (certificationId: number) =>
    api.post<void>(`/api/ld-admin/certifications/${certificationId}/remind`),
}
