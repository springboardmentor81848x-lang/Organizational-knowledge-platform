import { ApiError } from '@/lib/apiError'
import { tokenStore } from '@/lib/tokenStore'

/**
 * The single door onto the API.
 *
 * Every request goes through here so that three things are guaranteed in one place: the bearer
 * token is attached, a 401 triggers exactly one refresh attempt before the session is given up,
 * and every failure surfaces as an ApiError carrying the server's own message.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

/** Session expiry is a global event: whoever owns the session state subscribes here. */
type SessionExpiredListener = () => void
const sessionExpiredListeners = new Set<SessionExpiredListener>()

/** Where the browser is sent once a session is definitively over. */
const LOGIN_PATH = '/login'

export function onSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener)
  return () => sessionExpiredListeners.delete(listener)
}

function notifySessionExpired(): void {
  tokenStore.clear()
  sessionExpiredListeners.forEach((listener) => listener())

  // A 401 that survived a refresh attempt means the session is over. Subscribers clear the
  // cache; this gets the user to the sign-in screen rather than leaving them on a page whose
  // every panel has failed. Guarded so redirecting while already there cannot loop.
  if (typeof window !== 'undefined' && window.location.pathname !== LOGIN_PATH) {
    window.location.assign(LOGIN_PATH)
  }
}

/**
 * Shared across concurrent 401s. A dashboard fires several queries at once; without this they
 * would each refresh independently and all but one of the new tokens would be discarded.
 */
let refreshInFlight: Promise<boolean> | null = null

async function refreshSession(): Promise<boolean> {
  const refreshToken = tokenStore.getRefreshToken()
  if (!refreshToken) return false

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
        if (!response.ok) return false

        const body = (await response.json()) as {
          accessToken: string
          refreshToken: string
        }
        tokenStore.set({ accessToken: body.accessToken, refreshToken: body.refreshToken })
        return true
      } catch {
        return false
      } finally {
        // Cleared on the next tick so every caller awaiting this attempt sees the same result.
        queueMicrotask(() => {
          refreshInFlight = null
        })
      }
    })()
  }

  return refreshInFlight
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    try {
      return await response.json()
    } catch {
      return null
    }
  }
  const text = await response.text()
  return text || null
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  /** Set for endpoints that must not attempt a refresh, such as login itself. */
  skipAuth?: boolean
  /**
   * A multipart upload. The body is sent as-is and no Content-Type is set: the browser has to
   * write that header itself so it carries the multipart boundary.
   */
  form?: FormData
}

async function send(path: string, options: RequestOptions, isRetry = false): Promise<Response> {
  const headers: Record<string, string> = {}
  if (options.body !== undefined && options.form === undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (!options.skipAuth) {
    const token = tokenStore.getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.form ?? (options.body === undefined ? undefined : JSON.stringify(options.body)),
      signal: options.signal,
    })
  } catch (cause) {
    // An aborted request is the caller changing their mind, not a failure to report.
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause
    throw ApiError.networkError(cause)
  }

  if (response.status === 401 && !options.skipAuth && !isRetry) {
    const refreshed = await refreshSession()
    if (refreshed) return send(path, options, true)
    notifySessionExpired()
  }

  return response
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options)
  const body = await parseBody(response)

  if (!response.ok) {
    throw ApiError.fromResponse(response, body as never)
  }
  return body as T
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: 'POST', body, signal }),
  put: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: 'PUT', body, signal }),
  patch: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: 'PATCH', body, signal }),
  delete: <T>(path: string, signal?: AbortSignal) => request<T>(path, { method: 'DELETE' , signal }),

  /** Multipart upload, for the catalogue import. Carries the bearer token like any other call. */
  postForm: <T>(path: string, form: FormData, signal?: AbortSignal) =>
    request<T>(path, { method: 'POST', form, signal }),

  /** Login and refresh must not carry a stale bearer token or trigger a refresh loop. */
  postUnauthenticated: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body, skipAuth: true }),

  /**
   * A read reached before anybody is signed in - the sign-up form's list of target roles.
   * Skipping auth matters: with a stale token in storage the request would otherwise attempt a
   * refresh, fail, and bounce the visitor to sign-in from the sign-up page.
   */
  getUnauthenticated: <T>(path: string, signal?: AbortSignal) =>
    request<T>(path, { signal, skipAuth: true }),

  /**
   * Reports and other binary downloads. Returns the blob and the filename the server chose,
   * so the browser saves it under the name the report was generated with.
   */
  async download(path: string): Promise<{ blob: Blob; filename: string }> {
    const response = await send(path, {})
    if (!response.ok) {
      throw ApiError.fromResponse(response, (await parseBody(response)) as never)
    }
    const disposition = response.headers.get('content-disposition') ?? ''
    const match = /filename=("?)([^";]+)\1/i.exec(disposition)
    return {
      blob: await response.blob(),
      filename: match?.[2]?.trim() || 'download',
    }
  },
}
