import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { onSessionExpired } from '@/api/client'
import { authApi } from '@/api/auth'
import { queryKeys } from '@/api/queryKeys'
import { decodeJwt, userIdFromClaims } from '@/lib/jwt'
import { tokenStore } from '@/lib/tokenStore'
import type { LoginRequest } from '@/types/api'

/**
 * The signed-in user.
 *
 * The profile is a query against /api/auth/me, not a copy of the login response held in state.
 * That distinction matters: if an administrator changes somebody's role or department, the next
 * refetch reflects it. Caching the login payload instead would leave the user looking at
 * permissions they no longer have until they signed out and back in.
 */
export function useSession() {
  const query = useQuery({
    queryKey: queryKeys.session,
    queryFn: ({ signal }) => authApi.me(signal),
    // Only ask when a token exists; otherwise this is a guaranteed 401 on every page load.
    enabled: tokenStore.hasSession(),
    staleTime: 5 * 60_000,
    retry: false,
  })

  // The role from the token paints role-appropriate navigation on the first frame. The
  // profile is still the authority: once /api/auth/me resolves, its role wins, so a role
  // changed since sign-in corrects itself rather than persisting until the token expires.
  const claims = decodeJwt(tokenStore.getAccessToken())
  const role = query.data?.role ?? claims?.role ?? null

  return {
    user: query.data ?? null,
    /** Available before the profile loads, decoded from the token. */
    role,
    userId: query.data?.id ?? userIdFromClaims(claims),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    /** A token exists and the profile behind it loaded. */
    isAuthenticated: Boolean(query.data),
    /** A token exists but we have not yet confirmed it is still good. */
    isRestoring: tokenStore.hasSession() && query.isLoading,
  }
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (auth) => {
      tokenStore.set({ accessToken: auth.accessToken, refreshToken: auth.refreshToken })
      // Seed the session so the shell renders immediately, then let the normal refetch
      // confirm it against the server rather than trusting the login payload indefinitely.
      queryClient.setQueryData(queryKeys.session, auth.user)
      queryClient.invalidateQueries()
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return () => {
    tokenStore.clear()
    // Everything cached belonged to the person signing out. Clearing rather than invalidating
    // means none of it can flash on screen for whoever signs in next.
    queryClient.clear()
  }
}

/**
 * Wipes the cache when the API reports the session is finished, so an expiry that happens
 * while the user is idle does not leave another person's data on the screen.
 */
export function useSessionExpiryHandler() {
  const queryClient = useQueryClient()

  useEffect(() => onSessionExpired(() => queryClient.clear()), [queryClient])
}
