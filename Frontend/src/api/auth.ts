import { api } from './client'
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  SignupResponse,
  TargetRoleOption,
  UserProfile,
} from '@/types/api'

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

  /**
   * Self-service sign-up. Returns no tokens on purpose - the account is unusable until a
   * department head, HR or an administrator grants it access.
   */
  signup: (body: SignupRequest) =>
    api.postUnauthenticated<SignupResponse>('/api/auth/signup', body),

  /**
   * The roles a new employee can choose as their target. Unauthenticated, because the person
   * choosing has no account yet; it exposes only role titles and a count.
   */
  targetRoles: (signal?: AbortSignal) =>
    api.getUnauthenticated<TargetRoleOption[]>('/api/role-competencies/target-roles', signal),
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
   * Signs in with a Firebase credential (Google, GitHub, Microsoft, etc.). The server
   * verifies the token with the Firebase Admin SDK before trusting any of it.
   */
  firebaseLogin: (body: { idToken: string }) =>
    api.postUnauthenticated<AuthResponse>('/api/auth/firebase', body),

  /**
   * Revokes a refresh token so signing out actually ends the session server-side rather than
   * only forgetting it in this browser. Unauthenticated on purpose: the access token may
   * already have expired, and possession of the refresh token is the only thing being proved.
   */
  logout: (refreshToken: string) =>
    api.postUnauthenticated<void>('/api/auth/logout', { refreshToken }),

  /**
   * Reports a lockout to the administrators who can reset it. Always succeeds, whether or not
   * the address has an account, so it cannot be used to discover who works here.
   */
  forgotPassword: (email: string) =>
    api.postUnauthenticated<void>('/api/auth/forgot-password', { email }),
  updateProfile: (body: UpdateProfileRequest) => api.put<UserProfile>('/api/auth/profile', body),
  changePassword: (body: ChangePasswordRequest) => api.put<void>('/api/auth/password', body),
}
