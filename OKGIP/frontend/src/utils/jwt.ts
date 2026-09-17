import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
  sub?: string;
  role?: string;
  roles?: string | string[];
  authorities?: string | string[];
  scope?: string | string[];
  exp?: number;
  iat?: number;
}

export const decodeToken = (token: string): JwtPayload => {
  return jwtDecode<JwtPayload>(token);
};

export type AppRole = "employee" | "hr" | "manager" | "admin" | "mentor";

const ROLE_LOOKUP: Record<string, AppRole> = {
  ROLE_EMPLOYEE: "employee",
  EMPLOYEE: "employee",
  ROLE_HR: "hr",
  HR: "hr",
  ROLE_MANAGER: "manager",
  MANAGER: "manager",
  ROLE_ADMIN: "admin",
  ADMIN: "admin",
  ROLE_MENTOR: "mentor",
  MENTOR: "mentor",
};

const asRoleValues = (claim: string | string[] | undefined): string[] => {
  if (Array.isArray(claim)) {
    return claim;
  }

  return claim ? claim.split(/[\s,]+/) : [];
};

export const getRoleFromPayload = (payload: JwtPayload): AppRole | null => {
  const candidates = [
    ...asRoleValues(payload.role),
    ...asRoleValues(payload.roles),
    ...asRoleValues(payload.authorities),
    ...asRoleValues(payload.scope),
  ];

  for (const candidate of candidates) {
    const role = ROLE_LOOKUP[candidate.toUpperCase()];
    if (role) {
      return role;
    }
  }

  return null;
};

export const tryDecodeToken = (token: string): JwtPayload | null => {
  try {
    return decodeToken(token);
  } catch {
    return null;
  }
};

export const getRoleFromToken = (token: string): AppRole | null => {
  const payload = tryDecodeToken(token);
  return payload ? getRoleFromPayload(payload) : null;
};

export const isTokenExpired = (payload: JwtPayload): boolean =>
  typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();

export const dashboardPathForRole = (role: AppRole): string => `/${role}`;
