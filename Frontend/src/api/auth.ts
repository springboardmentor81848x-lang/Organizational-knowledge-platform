import { api } from './client'
import type { AuthResponse, LoginRequest, UserProfile } from '@/types/api'

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  department?: string
  jobTitle?: string
}

export interface UpdateProfileRequest {
  fullName?: string
  department?: string
  jobTitle?: string
  avatarUrl?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export const authApi = {
  login: (body: LoginRequest) => api.postUnauthenticated<AuthResponse>('/api/auth/login', body),
  register: (body: RegisterRequest) =>
    api.postUnauthenticated<AuthResponse>('/api/auth/register', body),
  refresh: (refreshToken: string) =>
    api.postUnauthenticated<AuthResponse>('/api/auth/refresh', { refreshToken }),
  me: (signal?: AbortSignal) => api.get<UserProfile>('/api/auth/me', signal),

  /**
   * Signs in with a Google credential. The server verifies the token with Google before
   * trusting any of it, and refuses entirely unless a Google client is configured.
   */
  oauth2Google: (body: { idToken: string }) =>
    api.postUnauthenticated<AuthResponse>('/api/auth/oauth2/google', body),

  /**
   * Reports a lockout to the administrators who can reset it. Always succeeds, whether or not
   * the address has an account, so it cannot be used to discover who works here.
   */
  forgotPassword: (email: string) =>
    api.postUnauthenticated<void>('/api/auth/forgot-password', { email }),
  updateProfile: (body: UpdateProfileRequest) => api.put<UserProfile>('/api/auth/profile', body),
  changePassword: (body: ChangePasswordRequest) => api.put<void>('/api/auth/password', body),
}
