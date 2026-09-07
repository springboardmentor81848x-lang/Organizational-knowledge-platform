export type Role = 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE' | 'UNASSIGNED';

export type RoleLike = 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';

export function token() {
  return localStorage.getItem('okgip_token');
}

export function decodePayload(t: string) {
  try {
    const payload = t.split('.')[1];
    if (!payload) return {};

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized);
    const chars = decoded.split('').map((char) => `%${('00' + char.charCodeAt(0).toString(16)).slice(-2)}`).join('');
    return JSON.parse(decodeURIComponent(chars));
  } catch {
    return {};
  }
}

export function extractJwtRole(rawToken: string): Role | null {
  const payload = decodePayload(rawToken) as Record<string, unknown>;

  const directRole = payload.role ?? payload.roles ?? payload.authorities ?? payload.scope;
  if (typeof directRole === 'string') {
    const normalized = directRole.toUpperCase();
    if (normalized.includes('ADMIN')) return 'ADMIN';
    if (normalized.includes('HR')) return 'HR';
    if (normalized.includes('MANAGER')) return 'MANAGER';
    if (normalized.includes('EMPLOYEE')) return 'EMPLOYEE';
  }

  if (Array.isArray(directRole)) {
    const values = directRole.map((value) => String(value).toUpperCase());
    if (values.some((value) => value.includes('ADMIN'))) return 'ADMIN';
    if (values.some((value) => value.includes('HR'))) return 'HR';
    if (values.some((value) => value.includes('MANAGER'))) return 'MANAGER';
    if (values.some((value) => value.includes('EMPLOYEE'))) return 'EMPLOYEE';
  }

  return null;
}

export function currentEmail() {
  const currentToken = token();
  if (!currentToken) return '';
  const payload = decodePayload(currentToken) as Record<string, unknown>;
  return String(payload.sub ?? payload.email ?? '');
}

export function currentRole(): Role {
  const saved = localStorage.getItem('okgip_role') as Role | null;
  if (saved) return saved;

  const currentToken = token();
  if (!currentToken) return 'UNASSIGNED';

  return extractJwtRole(currentToken) ?? 'UNASSIGNED';
}

export function currentUser() {
  try {
    const raw = localStorage.getItem('okgip_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function loginStore(t: string, explicitRole?: string, userDetails?: any) {
  localStorage.setItem('okgip_token', t);

  const role = explicitRole ? (explicitRole.toUpperCase().replace('ROLE_', '') as Role) : extractJwtRole(t);
  if (role) {
    localStorage.setItem('okgip_role', role);
  } else {
    localStorage.removeItem('okgip_role');
  }

  if (userDetails) {
    localStorage.setItem('okgip_user', JSON.stringify(userDetails));
  }
}

export function logout() {
  localStorage.removeItem('okgip_token');
  localStorage.removeItem('okgip_role');
  localStorage.removeItem('okgip_user');
  window.location.href = '/login';
}
