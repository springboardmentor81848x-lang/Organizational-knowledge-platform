export type UserRole = "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE";

export interface User {
  id?: string;
  email?: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  token: string;
  role: UserRole;
}

export interface LoginCredentials {
  email?: string;
  password?: string;
  role?: UserRole;
}