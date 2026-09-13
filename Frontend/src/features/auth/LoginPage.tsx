import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ApiError } from '@/lib/apiError'
import { isFirebaseConfigured, FIREBASE_PROVIDERS, type FirebaseProviderName } from '@/lib/firebase'
import { ROLE_DEFINITIONS } from '@/app/roleRoutes'
import type { Role } from '@/types/api'
import { useLogin, useFirebaseLogin } from './useSession'
import { ForgotPasswordDialog } from './ForgotPasswordDialog'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const login = useLogin()
  const firebaseLogin = useFirebaseLogin()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [forgotOpen, setForgotOpen] = useState(false)

  // Carried from the landing tiles. It only changes what this screen says, never what the
  // session becomes.
  const intendedRole = (location.state as { intendedRole?: Role } | null)?.intendedRole

  function navigateAfterLogin(actualRole: Role) {
    const mismatched = Boolean(intendedRole && intendedRole !== actualRole)
    navigate(ROLE_DEFINITIONS[actualRole].home, {
      replace: true,
      state: mismatched ? { roleMismatch: { expected: intendedRole, actual: actualRole } } : undefined,
    })
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    login.mutate(
      { email: email.trim(), password },
      { onSuccess: (auth) => navigateAfterLogin(auth.user.role) },
    )
  }

  function handleFirebaseLogin(provider: FirebaseProviderName) {
    firebaseLogin.mutate(provider, {
      onSuccess: (auth) => navigateAfterLogin(auth.user.role),
    })
  }

  const loginError = login.error ? ApiError.from(login.error) : null
  const firebaseError = firebaseLogin.error ? ApiError.from(firebaseLogin.error) : null
  const error = loginError ?? firebaseError
  const errorText =
    error?.status === 401 ? 'That sign-in was not recognised.' : error?.userMessage()

  const anyPending = login.isPending || firebaseLogin.isPending

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
            disabled={!email || !password || anyPending}
          >
            {login.isPending ? 'Signing in' : 'Sign in'}
          </Button>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <FirebaseSignInButtons
            onLogin={handleFirebaseLogin}
            isPending={firebaseLogin.isPending}
            disabled={anyPending}
          />

          <p className={styles.switchRole}>
            No account yet? <Link to="/signup">Create one</Link>
          </p>

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
 * Firebase sign-in buttons for all configured providers.
 *
 * When Firebase is not configured (no env vars), a single notice explains why the buttons
 * are absent — a control that fails on click is worse than one that explains itself.
 */
function FirebaseSignInButtons({
  onLogin,
  isPending,
  disabled,
}: {
  onLogin: (provider: FirebaseProviderName) => void
  isPending: boolean
  disabled: boolean
}) {
  const configured = isFirebaseConfigured()

  if (!configured) {
    return (
      <div className={styles.googleUnavailable}>
        <span className={styles.googleGlyph} aria-hidden="true">
          🔒
        </span>
        <span>
          <strong>Social sign-in</strong> is not enabled on this environment. Sign in with
          your email and password.
        </span>
      </div>
    )
  }

  return (
    <div className={styles.firebaseProviders}>
      {FIREBASE_PROVIDERS.map((provider) => (
        <Button
          key={provider.name}
          type="button"
          size="lg"
          block
          loading={isPending}
          disabled={disabled}
          icon={
            <span className={styles.googleGlyph} aria-hidden="true">
              {provider.glyph}
            </span>
          }
          onClick={() => onLogin(provider.name)}
        >
          Continue with {provider.label}
        </Button>
      ))}
    </div>
  )
}

