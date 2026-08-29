import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { ApiError } from '@/lib/apiError'
import { useLogin } from './useSession'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    login.mutate({ email: email.trim(), password })
  }

  // A rejected sign-in is nearly always bad credentials; saying so is more useful than
  // relaying the generic 401 wording meant for expired sessions mid-session.
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
          <p className={styles.formSub}>Use your Infosys directory account.</p>

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
            <label className={styles.label} htmlFor="password">
              Password
            </label>
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
        </form>
      </main>
    </div>
  )
}
