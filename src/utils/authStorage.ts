const TOKEN_KEY = "okip_token";

/**
 * Get JWT token from browser storage
 */
export const getStoredToken = (): string | null => {
  try {
    return (
      localStorage.getItem(TOKEN_KEY) ||
      sessionStorage.getItem(TOKEN_KEY)
    );
  } catch (error) {
    console.error("Failed to read authentication token:", error);
    return null;
  }
};

/**
 * Store JWT token
 */
export const storeToken = (
  token: string,
  persist: boolean = true
): void => {
  try {
    // Remove old token first
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);

    if (persist) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }

    console.log("JWT token stored successfully");
  } catch (error) {
    console.error("Failed to store authentication token:", error);
  }
};

/**
 * Clear JWT token
 */
export const clearStoredToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("Failed to clear authentication token:", error);
  }
};