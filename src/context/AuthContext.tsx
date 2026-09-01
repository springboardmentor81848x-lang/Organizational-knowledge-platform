import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

// The backend has returned user objects under a few different shapes across
// endpoints/history (top-level firstName/lastName, top-level first_name/
// last_name, nested employee.first_name/last_name, or nothing at all).
// NormalizedUser guarantees a `full_name` is always present and consistent,
// and surfaces the employee "virtual ID card" fields at the top level too,
// so components like the Navbar never have to guess which shape they got or
// reach into `user.employee` themselves.
type NormalizedUser = User & {
  full_name: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  employee_code?: string;
  department?: string;
  designation?: string;
};

const FALLBACK_DISPLAY_NAME = 'Girish M';

/** Builds a reliable full_name from whatever shape the raw user payload is in. */
function deriveFullName(raw: any): string {
  if (!raw) return FALLBACK_DISPLAY_NAME;

  if (typeof raw.full_name === 'string' && raw.full_name.trim()) {
    return raw.full_name.trim();
  }
  if (typeof raw.name === 'string' && raw.name.trim()) {
    return raw.name.trim();
  }

  const first = raw.firstName || raw.first_name || raw.employee?.first_name || raw.employee?.firstName;
  const last = raw.lastName || raw.last_name || raw.employee?.last_name || raw.employee?.lastName;
  const combined = [first, last].filter(Boolean).join(' ').trim();
  if (combined) return combined;

  if (typeof raw.email === 'string' && raw.email.trim()) {
    // Last resort before the hardcoded fallback: derive something readable
    // from the email's local part rather than showing "undefined".
    const local = raw.email.split('@')[0];
    if (local) return local;
  }

  return FALLBACK_DISPLAY_NAME;
}

/** Normalizes any raw user payload (login/register/google/me) into a NormalizedUser. */
function normalizeUser(raw: any): NormalizedUser {
  return {
    ...raw,
    full_name: deriveFullName(raw),
    // Real fields already present on raw.employee (from the backend's
    // getEmployeeForUser join) — just surfaced at the top level for
    // convenience. No fabricated data: these are undefined if the employee
    // record genuinely has none set yet.
    employee_code: raw?.employee?.employee_code,
    department: raw?.employee?.department_name,
    designation: raw?.employee?.designation,
  };
}

interface AuthContextType {
  user: NormalizedUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<NormalizedUser | null>(() => {
    const savedUser = localStorage.getItem('okgip_user');
    if (!savedUser) return null;
    try {
      // Normalize on load too — a user cached before this fix, or from an
      // older payload shape, still gets a valid full_name.
      return normalizeUser(JSON.parse(savedUser));
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('okgip_token');
  });

  const [loading, setLoading] = useState<boolean>(true);

  const loginHandler = (newToken: string, newUser: User) => {
    const normalized = normalizeUser(newUser);
    setToken(newToken);
    setUser(normalized);
    localStorage.setItem('okgip_token', newToken);
    localStorage.setItem('okgip_user', JSON.stringify(normalized));
  };

  const logoutHandler = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('okgip_token');
    localStorage.removeItem('okgip_user');
  };

  const refreshUser = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.data.success) {
        const normalized = normalizeUser(res.data.user);
        setUser(normalized);
        localStorage.setItem('okgip_user', JSON.stringify(normalized));
      }
    } catch (error) {
      console.error('Failed to verify session token:', error);
      logoutHandler();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: loginHandler,
        logout: logoutHandler,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
