import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  getRoleFromPayload,
  isTokenExpired,
  tryDecodeToken,
  type AppRole,
} from "@/utils/jwt";
import {
  clearStoredToken,
  getStoredToken,
  storeToken,
} from "@/utils/authStorage";

interface AuthContextType {
  token: string | null;
  role: AppRole | null;
  email: string | null;
  login: (token: string, persist?: boolean) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  const [role, setRole] = useState<AppRole | null>(null);

  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    const decoded = tryDecodeToken(token);
    if (!decoded || isTokenExpired(decoded)) {
      clearStoredToken();
      setToken(null);
      setRole(null);
      setEmail(null);
      return;
    }

    setRole(getRoleFromPayload(decoded));
    setEmail(decoded.sub ?? null);
  }, [token]);

  const login = (jwt: string, persist = true) => {
    storeToken(jwt, persist);
    setToken(jwt);

    const decoded = tryDecodeToken(jwt);
    setRole(decoded ? getRoleFromPayload(decoded) : null);
    setEmail(decoded?.sub ?? null);
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setRole(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        email,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
