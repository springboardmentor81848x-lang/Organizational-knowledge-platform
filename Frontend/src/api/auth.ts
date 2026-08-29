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
  updateProfile: (body: UpdateProfileRequest) => api.put<UserProfile>('/api/auth/profile', body),
  changePassword: (body: ChangePasswordRequest) => api.put<void>('/api/auth/password', body),
}
