export type Role = 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';

export type UserSession = {
  token: string;
  role: Role;
  email: string;
};
