/**
 * A single error type for everything that comes back from the API, so views never have to
 * guess at the shape of what they caught.
 *
 * The backend's GlobalExceptionHandler returns a consistent body — timestamp, status, error,
 * message, path — and this preserves the server's message rather than replacing it with
 * something generic. When an assessment is rejected because a proficiency score is out of
 * range, the reader should be told that, not "something went wrong".
 */

interface ApiErrorBody {
  timestamp?: string
  status?: number
  error?: string
  message?: string
  path?: string
}

export class ApiError extends Error {
  readonly status: number
  /** The server's own explanation, when it sent one. */
  readonly detail?: string
  readonly path?: string
  /** True when the request never reached the server at all. */
  readonly isNetworkError: boolean

  constructor(params: {
    status: number
    message: string
    detail?: string
    path?: string
    isNetworkError?: boolean
  }) {
    super(params.message)
    this.name = 'ApiError'
    this.status = params.status
    this.detail = params.detail
    this.path = params.path
    this.isNetworkError = params.isNetworkError ?? false
  }

  static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error
    if (error instanceof Error) {
      return new ApiError({ status: 0, message: error.message, isNetworkError: true })
    }
    return new ApiError({ status: 0, message: 'An unexpected error occurred.' })
  }

  static fromResponse(response: Response, body: ApiErrorBody | string | null): ApiError {
    const detail = typeof body === 'string' ? body : body?.message
    return new ApiError({
      status: response.status,
      message: detail || response.statusText || `Request failed with status ${response.status}`,
      detail: detail || undefined,
      path: typeof body === 'object' && body ? body.path : undefined,
    })
  }

  static networkError(cause: unknown): ApiError {
    return new ApiError({
      status: 0,
      message: cause instanceof Error ? cause.message : 'Network request failed',
      isNetworkError: true,
    })
  }

  /** Wording aimed at the person on the screen, not the developer reading the console. */
  userMessage(): string {
    if (this.isNetworkError) {
      return 'The server could not be reached. Check your connection, or try again in a moment.'
    }
    switch (this.status) {
      case 401:
        return 'Your session is not valid for this. Sign in again and retry.'
      case 403:
        return 'You do not have access to this information.'
      case 404:
        return 'This record no longer exists, or was never created.'
      case 500:
      case 502:
      case 503:
        return 'The server ran into a problem handling this request.'
      default:
        return this.detail || this.message
    }
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }
}
