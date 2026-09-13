/**
 * Where the JWT pair lives between page loads.
 *
 * This stores credentials only — never server-owned data. The user's profile, their gaps,
 * their enrolments and everything else are fetched from the API on every load and cached by
 * React Query, so a refresh can never resurrect a stale copy of something the database has
 * since changed. The tokens are the one thing the client legitimately remembers, because the
 * server has no session to remember it by.
 */

const ACCESS_TOKEN_KEY = 'osi.accessToken'
const REFRESH_TOKEN_KEY = 'osi.refreshToken'

/**
 * Kept in memory as well as in storage. The in-memory copy is what requests read, so a token
 * refreshed mid-flight is used immediately rather than after the next storage round trip.
 */
let accessToken: string | null = null
let refreshToken: string | null = null
let hydrated = false

function safeRead(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    // Private browsing and locked-down enterprise policies can both throw here. Losing
    // persistence is survivable; the session simply ends when the tab does.
    return null
  }
}

function safeWrite(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    /* Non-fatal: the in-memory copy still carries this session. */
  }
}

function hydrate(): void {
  if (hydrated) return
  accessToken = safeRead(ACCESS_TOKEN_KEY)
  refreshToken = safeRead(REFRESH_TOKEN_KEY)
  hydrated = true
}

export const tokenStore = {
  getAccessToken(): string | null {
    hydrate()
    return accessToken
  },

  getRefreshToken(): string | null {
    hydrate()
    return refreshToken
  },

  set(tokens: { accessToken: string; refreshToken: string }): void {
    hydrated = true
    accessToken = tokens.accessToken
    refreshToken = tokens.refreshToken
    safeWrite(ACCESS_TOKEN_KEY, tokens.accessToken)
    safeWrite(REFRESH_TOKEN_KEY, tokens.refreshToken)
  },

  clear(): void {
    hydrated = true
    accessToken = null
    refreshToken = null
    safeWrite(ACCESS_TOKEN_KEY, null)
    safeWrite(REFRESH_TOKEN_KEY, null)
  },

  hasSession(): boolean {
    hydrate()
    return Boolean(accessToken)
  },
}
