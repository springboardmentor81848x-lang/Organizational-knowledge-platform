import type { Role } from '@/types/api'

/**
 * Reads the claims out of an access token.
 *
 * This is decoding, not verification. The signature is checked by the server on every request,
 * and nothing here is treated as an authorisation decision — it exists so the shell can paint
 * role-appropriate navigation on the first frame instead of waiting for a profile round trip.
 * Anything that actually matters is still refused server-side.
 *
 * The role in the token is a snapshot taken at sign-in. If an administrator changes somebody's
 * role mid-session the token still carries the old one, which is why the session query against
 * /api/auth/me remains the authority and this is only used before that resolves.
 */

export interface JwtClaims {
  /** The user id, carried in `sub` as a string. */
  sub: string
  email: string
  role?: Role
  /** Issued-at and expiry, both in seconds since the epoch. */
  iat: number
  exp: number
}

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/')
  const withPadding = padded + '='.repeat((4 - (padded.length % 4)) % 4)
  // decodeURIComponent/escape round trip so multi-byte characters in a name survive.
  return decodeURIComponent(
    atob(withPadding)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  )
}

export function decodeJwt(token: string | null): JwtClaims | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null

  try {
    const claims = JSON.parse(base64UrlDecode(parts[1])) as JwtClaims
    return claims.sub ? claims : null
  } catch {
    // A malformed token is treated as no token rather than crashing the shell.
    return null
  }
}

export function isExpired(claims: JwtClaims | null): boolean {
  if (!claims?.exp) return false
  return claims.exp * 1000 <= Date.now()
}

export function userIdFromClaims(claims: JwtClaims | null): number | null {
  if (!claims) return null
  const parsed = Number(claims.sub)
  return Number.isFinite(parsed) ? parsed : null
}
