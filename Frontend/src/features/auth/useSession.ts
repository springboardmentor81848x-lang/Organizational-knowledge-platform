import { useCallback, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { onSessionExpired } from '@/api/client'
import { authApi } from '@/api/auth'
import { queryKeys } from '@/api/queryKeys'
import { decodeJwt, userIdFromClaims } from '@/lib/jwt'
import { signInWithFirebase, type FirebaseProviderName } from '@/lib/firebase'
import { tokenStore } from '@/lib/tokenStore'
import type { LoginRequest, SignupRequest } from '@/types/api'

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

/**
 * Starts a sign-up. Deliberately does not touch the session: no tokens come back, because the
 * account cannot be used until an approver grants it access.
 */
export function useSignup() {
  return useMutation({
    mutationFn: (body: SignupRequest) => authApi.signup(body),
  })
}

/**
 * Firebase sign-in.
 *
 * The mutation function opens the Firebase popup, retrieves the ID token, sends it to the
 * backend for verification, and seeds the session exactly like the email/password flow.
 * The component only needs to call `mutate('google')` (or `'github'`, `'microsoft'`).
 */
export function useFirebaseLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (provider: FirebaseProviderName) => {
      const idToken = await signInWithFirebase(provider)
      return authApi.firebaseLogin({ idToken })
    },
    onSuccess: (auth) => {
      tokenStore.set({ accessToken: auth.accessToken, refreshToken: auth.refreshToken })
      queryClient.setQueryData(queryKeys.session, auth.user)
      queryClient.invalidateQueries()
    },
  })
}

/**
 * Ends the session.
 *
 * Three things have to happen, and dropping any one of them leaves a door open. The refresh
 * token is revoked so the session is over on the server too, not merely forgotten here; the
 * cache is cleared so none of this person's data can flash on screen for whoever signs in
 * next; and the browser is sent to the sign-in screen.
 *
 * That last step is the one that is easy to miss. Clearing the query cache does not re-render
 * the components reading it, so without an explicit navigation the shell stays on screen,
 * still showing a name and a role, while every request behind it fails — a session that looks
 * live and is not.
 */
export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useCallback(() => {
    // Read before clearing: the store is about to forget it.
    const refreshToken = tokenStore.getRefreshToken()

    tokenStore.clear()
    queryClient.clear()

    if (refreshToken) {
      // Not awaited. Revocation is the server's housekeeping, and a network failure on the way
      // out must not strand somebody inside an app they have asked to leave. The request is
      // already in flight before the navigation below.
      void authApi.logout(refreshToken).catch(() => {
        /* The tokens are gone from this browser either way. */
      })
    }

    navigate('/login', { replace: true })
  }, [queryClient, navigate])
}

/**
 * Wipes the cache when the API reports the session is finished, so an expiry that happens
 * while the user is idle does not leave another person's data on the screen.
 */
export function useSessionExpiryHandler() {
  const queryClient = useQueryClient()

  useEffect(() => onSessionExpired(() => queryClient.clear()), [queryClient])
}
