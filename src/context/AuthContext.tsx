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
  const [token, setToken] = useState<string | null>(() => {
    return getStoredToken();
  });

  const [role, setRole] = useState<AppRole | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      console.log("AUTH CONTEXT: No token available");
      return;
    }

    console.log("AUTH CONTEXT: Checking stored token");

    const decoded = tryDecodeToken(token);

    if (!decoded) {
      console.error("AUTH CONTEXT: JWT decoding failed");
      clearStoredToken();
      setToken(null);
      setRole(null);
      setEmail(null);
      return;
    }

    console.log("AUTH CONTEXT: JWT decoded successfully");
    console.log("AUTH CONTEXT: JWT payload =", decoded);
    console.log("AUTH CONTEXT: JWT expired =", isTokenExpired(decoded));

    if (isTokenExpired(decoded)) {
      console.error("AUTH CONTEXT: JWT token is expired");
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
    console.log("========== AUTH LOGIN ==========");
    console.log("JWT RECEIVED:", !!jwt);
    console.log("JWT LENGTH:", jwt?.length);
    console.log("JWT START:", jwt?.substring(0, 30));

    // Store JWT
    storeToken(jwt, persist);

    // Immediately verify storage
    const storedToken = getStoredToken();

    console.log(
      "TOKEN AFTER storeToken():",
      !!storedToken
    );

    console.log(
      "STORED TOKEN LENGTH:",
      storedToken?.length
    );

    console.log("PERSIST:", persist);

    // Update React state
    setToken(jwt);

    // Decode JWT
    const decoded = tryDecodeToken(jwt);

    console.log("DECODED JWT:", decoded);

    if (!decoded) {
      console.error("❌ JWT DECODE FAILED");
    } else {
      console.log("JWT EXP:", decoded.exp);
      console.log(
        "CURRENT TIME:",
        Math.floor(Date.now() / 1000)
      );
      console.log(
        "TOKEN EXPIRED:",
        isTokenExpired(decoded)
      );
      console.log(
        "JWT ROLE:",
        getRoleFromPayload(decoded)
      );
      console.log("JWT SUB:", decoded.sub);
    }

    setRole(
      decoded ? getRoleFromPayload(decoded) : null
    );

    setEmail(decoded?.sub ?? null);

    console.log("========== AUTH LOGIN END ==========");
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