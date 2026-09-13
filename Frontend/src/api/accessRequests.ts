import { api } from './client'
import type { AccessRequest } from '@/types/api'

/**
 * The queue of people waiting to be let into the platform.
 *
 * No employee id is passed: the server reads the approver from the token and decides both what
 * they may see and what they may act on, since that depends on the applicant's department rather
 * than on the caller's role alone.
 */
export const accessRequestsApi = {
  pending: (signal?: AbortSignal) =>
    api.get<AccessRequest[]>('/api/access-requests/pending', signal),

  approve: (userId: number, note?: string) =>
    api.post<AccessRequest>(`/api/access-requests/${userId}/approve`, { note: note ?? null }),

  reject: (userId: number, note?: string) =>
    api.post<AccessRequest>(`/api/access-requests/${userId}/reject`, { note: note ?? null }),
}
