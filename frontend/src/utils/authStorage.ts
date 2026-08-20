const ACCESS_TOKEN_KEY = "okip.access_token";
const LEGACY_TOKEN_KEY = "token";

/**
 * Reads the current access token from either persistent or tab-only storage.
 * The legacy key is kept as a migration path for an earlier frontend build.
 */
export const getStoredToken = (): string | null => {
  try {
    return (
      localStorage.getItem(ACCESS_TOKEN_KEY) ??
      sessionStorage.getItem(ACCESS_TOKEN_KEY) ??
      localStorage.getItem(LEGACY_TOKEN_KEY) ??
      sessionStorage.getItem(LEGACY_TOKEN_KEY)
    );
  } catch {
    return null;
  }
};

export const storeToken = (token: string, persist: boolean): void => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    sessionStorage.removeItem(LEGACY_TOKEN_KEY);

    const storage = persist ? localStorage : sessionStorage;
    storage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    // A browser can deny storage access. The in-memory AuthContext still works
    // for the current page session in that case.
  }
};

export const clearStoredToken = (): void => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    sessionStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {
    // There is nothing further to clean up when storage is unavailable.
  }
};
