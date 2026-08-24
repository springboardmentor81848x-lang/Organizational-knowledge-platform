import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

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

import profileService from "@/services/profileService";

// =====================================================
// AUTH CONTEXT TYPE
// =====================================================

interface AuthContextType {
  token: string | null;
  role: AppRole | null;
  email: string | null;

  employeeId: number | null;

  profileLoading: boolean;

  login: (
    token: string,
    persist?: boolean
  ) => void;

  logout: () => void;

  isAuthenticated: boolean;
}

// =====================================================
// CONTEXT
// =====================================================

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

// =====================================================
// AUTH PROVIDER
// =====================================================

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // ===================================================
  // STATE
  // ===================================================

  const [token, setToken] = useState<string | null>(
    () => getStoredToken()
  );

  const [role, setRole] = useState<AppRole | null>(null);

  const [email, setEmail] = useState<string | null>(null);

  const [employeeId, setEmployeeId] =
    useState<number | null>(null);

  const [profileLoading, setProfileLoading] =
    useState<boolean>(true);

  // ===================================================
  // RESET AUTH STATE
  // ===================================================

  const resetAuthState = () => {
    setToken(null);
    setRole(null);
    setEmail(null);
    setEmployeeId(null);
  };

  // ===================================================
  // LOAD EMPLOYEE PROFILE
  // ===================================================

  const loadEmployeeProfile = async () => {
    try {
      setProfileLoading(true);

      console.log(
        "================================="
      );

      console.log(
        "AUTH: LOADING EMPLOYEE PROFILE"
      );

      console.log(
        "================================="
      );

      const profile =
        await profileService.getMyProfile();

      console.log(
        "AUTH: PROFILE RESPONSE:",
        profile
      );

      if (!profile) {
        throw new Error(
          "Employee profile was not returned"
        );
      }

      const id = Number(profile.employeeId);

      console.log(
        "AUTH: RAW PROFILE EMPLOYEE ID:",
        profile.employeeId
      );

      console.log(
        "AUTH: CONVERTED EMPLOYEE ID:",
        id
      );

      if (
        Number.isFinite(id) &&
        id > 0
      ) {
        setEmployeeId(id);

        console.log(
          "AUTH: ✅ EMPLOYEE ID SET:",
          id
        );
      } else {
        console.error(
          "AUTH: ❌ INVALID EMPLOYEE ID:",
          profile.employeeId
        );

        setEmployeeId(null);
      }
    } catch (error) {
      console.error(
        "AUTH: ❌ PROFILE REQUEST FAILED:",
        error
      );

      setEmployeeId(null);
    } finally {
      setProfileLoading(false);

      console.log(
        "AUTH: PROFILE LOADING COMPLETE"
      );
    }
  };

  // ===================================================
  // INITIAL AUTH CHECK
  // ===================================================

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const storedToken = getStoredToken();

      console.log(
        "================================="
      );

      console.log(
        "AUTH CONTEXT INITIALIZATION"
      );

      console.log(
        "TOKEN FOUND:",
        !!storedToken
      );

      console.log(
        "================================="
      );

      // -------------------------------------------------
      // NO TOKEN
      // -------------------------------------------------

      if (!storedToken) {
        if (mounted) {
          resetAuthState();
          setProfileLoading(false);
        }

        console.warn(
          "AUTH: No token available"
        );

        return;
      }

      // -------------------------------------------------
      // DECODE JWT
      // -------------------------------------------------

      const decoded =
        tryDecodeToken(storedToken);

      if (!decoded) {
        console.error(
          "AUTH: ❌ JWT decoding failed"
        );

        clearStoredToken();

        if (mounted) {
          resetAuthState();
          setProfileLoading(false);
        }

        return;
      }

      console.log(
        "AUTH: JWT DECODED:",
        decoded
      );

      // -------------------------------------------------
      // CHECK EXPIRATION
      // -------------------------------------------------

      if (isTokenExpired(decoded)) {
        console.error(
          "AUTH: ❌ JWT TOKEN EXPIRED"
        );

        clearStoredToken();

        if (mounted) {
          resetAuthState();
          setProfileLoading(false);
        }

        return;
      }

      // -------------------------------------------------
      // SET BASIC AUTH DATA
      // -------------------------------------------------

      if (!mounted) {
        return;
      }

      setToken(storedToken);

      setRole(
        getRoleFromPayload(decoded)
      );

      setEmail(
        decoded.sub ?? null
      );

      console.log(
        "AUTH: EMAIL:",
        decoded.sub
      );

      console.log(
        "AUTH: ROLE:",
        getRoleFromPayload(decoded)
      );

      // -------------------------------------------------
      // LOAD PROFILE
      // -------------------------------------------------

      await loadEmployeeProfile();
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // ===================================================
  // LOGIN
  // ===================================================

  const login = (
    jwt: string,
    persist: boolean = true
  ) => {
    console.log(
      "================================="
    );

    console.log(
      "AUTH: LOGIN START"
    );

    console.log(
      "JWT RECEIVED:",
      !!jwt
    );

    console.log(
      "JWT LENGTH:",
      jwt?.length
    );

    console.log(
      "================================="
    );

    if (!jwt) {
      console.error(
        "AUTH: ❌ EMPTY JWT"
      );

      return;
    }

    // -------------------------------------------------
    // STORE TOKEN
    // -------------------------------------------------

    storeToken(
      jwt,
      persist
    );

    const storedToken =
      getStoredToken();

    if (!storedToken) {
      console.error(
        "AUTH: ❌ TOKEN STORAGE FAILED"
      );

      return;
    }

    // -------------------------------------------------
    // DECODE TOKEN
    // -------------------------------------------------

    const decoded =
      tryDecodeToken(storedToken);

    if (!decoded) {
      console.error(
        "AUTH: ❌ JWT DECODING FAILED"
      );

      clearStoredToken();

      resetAuthState();
      setProfileLoading(false);

      return;
    }

    // -------------------------------------------------
    // CHECK EXPIRATION
    // -------------------------------------------------

    if (isTokenExpired(decoded)) {
      console.error(
        "AUTH: ❌ LOGIN TOKEN EXPIRED"
      );

      clearStoredToken();

      resetAuthState();
      setProfileLoading(false);

      return;
    }

    // -------------------------------------------------
    // UPDATE AUTH STATE
    // -------------------------------------------------

    setToken(storedToken);

    setRole(
      getRoleFromPayload(decoded)
    );

    setEmail(
      decoded.sub ?? null
    );

    // IMPORTANT:
    // Clear old employee ID before loading
    // the newly logged-in employee profile.
    setEmployeeId(null);

    // -------------------------------------------------
    // LOAD NEW EMPLOYEE PROFILE
    // -------------------------------------------------

    loadEmployeeProfile();

    console.log(
      "AUTH: ✅ LOGIN SUCCESS"
    );
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const logout = () => {
    console.log(
      "AUTH: LOGOUT"
    );

    clearStoredToken();

    resetAuthState();

    setProfileLoading(false);
  };

  // ===================================================
  // PROVIDER
  // ===================================================

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        email,
        employeeId,
        profileLoading,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// =====================================================
// useAuth HOOK
// =====================================================

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};

// =====================================================
// DEFAULT EXPORT
// =====================================================

export default AuthProvider;