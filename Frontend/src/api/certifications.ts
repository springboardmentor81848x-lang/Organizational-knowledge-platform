import { api } from './client'
import type { Certification } from '@/types/api'

export interface CertificationRequest {
  name: string
  issuer: string
  issuedAt: string
  expiresAt?: string
}

export const certificationsApi = {
  /** The signed-in employee's certifications. */
  list: (signal?: AbortSignal) => api.get<Certification[]>('/api/employee/certifications', signal),

  /**
   * Records a certification. The server decides the status from the expiry date rather than
   * taking one from the caller, so a certificate cannot be filed as valid past its expiry.
   */
  add: (body: CertificationRequest) =>
    api.post<Certification>('/api/employee/certifications', body),
}
