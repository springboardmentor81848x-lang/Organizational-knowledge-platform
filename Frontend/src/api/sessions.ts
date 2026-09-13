import { api } from './client'
import type {
  AttendanceStatus,
  KnowledgeSession,
  SessionRegistration,
  SessionStatus,
} from '@/types/api'

export interface SessionRequest {
  title: string
  description?: string
  sessionDate: string
  durationMinutes: number
  capacity: number
}

export interface AttendanceEntry {
  employeeId: number
  attendanceStatus: AttendanceStatus
}

export interface SessionFeedbackRequest {
  rating: number
  /** The server names this feedbackText; sending `comment` would silently drop it. */
  feedbackText?: string
}

export interface SessionFilters {
  status?: SessionStatus
  mentorId?: number
  availableOnly?: boolean
}

function toQuery(filters?: SessionFilters): string {
  if (!filters) return ''
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.mentorId !== undefined) params.set('mentorId', String(filters.mentorId))
  if (filters.availableOnly) params.set('availableOnly', 'true')
  const query = params.toString()
  return query ? `?${query}` : ''
}

export const sessionsApi = {
  list: (filters?: SessionFilters, signal?: AbortSignal) =>
    api.get<KnowledgeSession[]>(`/api/sessions${toQuery(filters)}`, signal),

  get: (sessionId: number, signal?: AbortSignal) =>
    api.get<KnowledgeSession>(`/api/sessions/${sessionId}`, signal),

  create: (body: SessionRequest) => api.post<KnowledgeSession>('/api/sessions', body),
  update: (sessionId: number, body: SessionRequest) =>
    api.put<KnowledgeSession>(`/api/sessions/${sessionId}`, body),
  cancel: (sessionId: number) => api.delete<void>(`/api/sessions/${sessionId}`),

  register: (sessionId: number) =>
    api.post<SessionRegistration>(`/api/sessions/${sessionId}/register`),
  cancelRegistration: (sessionId: number) => api.delete<void>(`/api/sessions/${sessionId}/register`),

  markAttendance: (sessionId: number, entries: AttendanceEntry[]) =>
    api.put<KnowledgeSession>(`/api/sessions/${sessionId}/attendance`, { entries }),

  submitFeedback: (sessionId: number, body: SessionFeedbackRequest) =>
    api.post<SessionRegistration>(`/api/sessions/${sessionId}/feedback`, body),
}
