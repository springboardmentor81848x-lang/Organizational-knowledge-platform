import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { ApiError } from '@/lib/apiError'
import { ROLE_DEFINITIONS } from '@/app/roleRoutes'
import type { Role } from '@/types/api'
import { useLogin } from './useSession'
import { ForgotPasswordDialog } from './ForgotPasswordDialog'
import styles from './LoginPage.module.css'

/** Set only when a real Google client is configured; the backend refuses sign-in otherwise. */
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

export function LoginPage() {
  const login = useLogin()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [forgotOpen, setForgotOpen] = useState(false)

  // Carried from the landing tiles. It only changes what this screen says, never what the
  // session becomes.
  const intendedRole = (location.state as { intendedRole?: Role } | null)?.intendedRole

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    login.mutate(
      { email: email.trim(), password },
      {
        onSuccess: (auth) => {
          // The destination comes from the role the backend returned. If it disagrees with the
          // tile that was clicked, the next screen explains rather than silently correcting.
          const actualRole = auth.user.role
          const mismatched = Boolean(intendedRole && intendedRole !== actualRole)
          navigate(ROLE_DEFINITIONS[actualRole].home, {
            replace: true,
            state: mismatched ? { roleMismatch: { expected: intendedRole, actual: actualRole } } : undefined,
          })
        },
      },
    )
  }

  const error = login.error ? ApiError.from(login.error) : null
  const errorText =
    error?.status === 401 ? 'That email and password combination was not recognised.' : error?.userMessage()

  return (
    <div className={styles.page}>
      <aside className={styles.brand}>
        <div className={styles.brandMark}>
          <span className={styles.brandMarkGlyph} aria-hidden="true">
            IN
          </span>
          Infosys
        </div>

        <div className={styles.brandCopy}>
          <h1 className={styles.brandTitle}>Skills Intelligence</h1>
          <p className={styles.brandText}>
            See where capability sits today, where it needs to be, and what closes the distance —
            across every team in the organisation.
          </p>
        </div>

        <p className={styles.brandFooter}>Internal use only. Access is scoped by your role.</p>
      </aside>

      <main className={styles.formSide}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <h2 className={styles.formHeading}>Sign in</h2>
          <p className={styles.formSub}>
            {intendedRole
              ? `Continuing as ${ROLE_DEFINITIONS[intendedRole].label}. Your account decides your access.`
              : 'Use your Infosys directory account.'}
          </p>

          {errorText && (
            <div className={styles.error} role="alert">
              <span aria-hidden="true">!</span>
              <span>{errorText}</span>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="password">
                Password
              </label>
              <button type="button" className={styles.linkButton} onClick={() => setForgotOpen(true)}>
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <Button
            className={styles.submit}
            type="submit"
            variant="primary"
            size="lg"
            block
            loading={login.isPending}
            disabled={!email || !password}
          >
            {login.isPending ? 'Signing in' : 'Sign in'}
          </Button>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <GoogleSignInButton />

          <p className={styles.switchRole}>
            <Link to="/">Not sure which role you are?</Link>
          </p>
        </form>
      </main>

      <ForgotPasswordDialog
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        initialEmail={email.trim()}
      />
    </div>
  )
}

/**
 * Google sign-in.
 *
 * The backend refuses these unless a Google client is configured, because without one there is
 * no audience to verify a token against. Rather than show a button that cannot work, this says
 * so plainly — a control that fails on click is worse than one that explains itself.
 */
function GoogleSignInButton() {
  const configured = Boolean(GOOGLE_CLIENT_ID)

  const signIn = useMutation({
    mutationFn: (idToken: string) => authApi.oauth2Google({ idToken }),
  })

  if (!configured) {
    return (
      <div className={styles.googleUnavailable}>
        <span className={styles.googleGlyph} aria-hidden="true">
          G
        </span>
        <span>
          <strong>Continue with Google</strong> is not enabled on this environment. Sign in with
          your email and password.
        </span>
      </div>
    )
  }

  return (
    <Button
      type="button"
      size="lg"
      block
      loading={signIn.isPending}
      icon={
        <span className={styles.googleGlyph} aria-hidden="true">
          G
        </span>
      }
      onClick={() => {
        // Google Identity Services issues the credential; the backend verifies it with Google
        // before trusting any of it.
        const google = (window as unknown as { google?: GoogleIdentityServices }).google
        if (!google) return
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => signIn.mutate(response.credential),
        })
        google.accounts.id.prompt()
      }}
    >
      Continue with Google
    </Button>
  )
}

interface GoogleIdentityServices {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string
        callback: (response: { credential: string }) => void
      }) => void
      prompt: () => void
    }
  }
}
