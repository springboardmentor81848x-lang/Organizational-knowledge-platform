import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { authApi } from '@/api/auth'
import { ApiError } from '@/lib/apiError'
import type { SignupResponse, TargetRoleOption } from '@/types/api'
import { useSignup } from './useSession'
import styles from './LoginPage.module.css'
import signupStyles from './SignupPage.module.css'

/**
 * Self-service sign-up: one form, then a wait.
 *
 * Signing up does not create a usable account. It creates a request, which the head of the
 * department named below — or HR, or an administrator — has to grant before the person can sign
 * in. So the form is followed by an explanation rather than a dashboard: the account exists, it
 * simply is not active yet, and somebody who was not told that would read the sign-in refusal
 * that follows as a bug.
 *
 * Everyone who signs up here becomes an employee. There is no role picker: the server ignores
 * any role in the payload, because an endpoint open to the public that accepted one would let a
 * stranger create their own administrator account.
 */
export function SignupPage() {
  const [signupResult, setSignupResult] = useState<SignupResponse | null>(null)

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
            Create your account, choose the role you are working towards, and the platform will
            measure you against it — your assessment, your gaps and your learning all follow from
            that choice.
          </p>
        </div>

        <p className={styles.brandFooter}>Internal use only. Access is scoped by your role.</p>
      </aside>

      <main className={styles.formSide}>
        {signupResult ? (
          <SubmittedStep result={signupResult} />
        ) : (
          <DetailsStep onSent={setSignupResult} />
        )}
      </main>
    </div>
  )
}

// ── Step one: account details and target role ────────────────────────────────

function DetailsStep({ onSent }: { onSent: (result: SignupResponse) => void }) {
  const signup = useSignup()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [targetRoleKey, setTargetRoleKey] = useState('')

  /**
   * The target roles are fetched rather than typed. A target only means something if there is a
   * competency profile behind it: that profile is what the assessment questions and the gap
   * analysis are both built from, so a free-text role would produce an account with an empty
   * assessment and no gaps to show.
   */
  const targetRoles = useQuery({
    queryKey: ['target-roles'],
    queryFn: ({ signal }) => authApi.targetRoles(signal),
    staleTime: 5 * 60 * 1000,
  })

  const options: TargetRoleOption[] = useMemo(() => targetRoles.data ?? [], [targetRoles.data])

  const selected = options.find((o) => `${o.jobTitle}|${o.department}` === targetRoleKey) ?? null

  const passwordsMatch = password.length === 0 || confirmPassword.length === 0 || password === confirmPassword
  const passwordLongEnough = password.length === 0 || password.length >= 8

  const canSubmit =
    Boolean(email && password && confirmPassword && fullName && department && jobTitle && selected) &&
    password === confirmPassword &&
    password.length >= 8 &&
    !signup.isPending

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!selected) return
    signup.mutate(
      {
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        department: department.trim(),
        jobTitle: jobTitle.trim(),
        targetJobTitle: selected.jobTitle,
        targetDepartment: selected.department,
      },
      { onSuccess: onSent },
    )
  }

  const error = signup.error ? ApiError.from(signup.error) : null

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.formHeading}>Create your account</h2>
      <p className={styles.formSub}>
        Your request goes to the head of your department for approval.
      </p>

      {error && (
        <div className={styles.error} role="alert">
          <span aria-hidden="true">!</span>
          <span>{error.userMessage()}</span>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="signup-name">
          Full name
        </label>
        <input
          id="signup-name"
          className={styles.input}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          required
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="signup-email">
          Work email
        </label>
        <input
          id="signup-email"
          className={styles.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
        />
      </div>

      <div className={signupStyles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="signup-department">
            Department
          </label>
          <input
            id="signup-department"
            className={styles.input}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            autoComplete="organization"
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="signup-jobtitle">
            Current job title
          </label>
          <input
            id="signup-jobtitle"
            className={styles.input}
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            autoComplete="organization-title"
            required
          />
        </div>
      </div>

      {/* The target role: the yardstick everything else in the platform uses for this person. */}
      <div className={signupStyles.targetSection}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="signup-target">
            Target role
          </label>
          <select
            id="signup-target"
            className={styles.input}
            value={targetRoleKey}
            onChange={(e) => setTargetRoleKey(e.target.value)}
            required
            disabled={targetRoles.isLoading || options.length === 0}
          >
            <option value="">
              {targetRoles.isLoading ? 'Loading roles…' : 'Choose the role you are working towards'}
            </option>
            {options.map((option) => (
              <option
                key={`${option.jobTitle}|${option.department}`}
                value={`${option.jobTitle}|${option.department}`}
              >
                {option.jobTitle} — {option.department} ({option.skillCount} skills)
              </option>
            ))}
          </select>
        </div>

        {targetRoles.isError && (
          <p className={signupStyles.hintWarning}>
            The list of target roles could not be loaded. Sign-up needs it, so please try again.
          </p>
        )}

        {!targetRoles.isLoading && !targetRoles.isError && options.length === 0 && (
          <p className={signupStyles.hintWarning}>
            No target roles are available yet. An administrator needs to define a role competency
            profile before anyone can sign up.
          </p>
        )}

        <p className={signupStyles.hint}>
          {selected
            ? `Your assessment will cover the ${selected.skillCount} skills this role is measured on, and your gaps will be the distance to it.`
            : 'This decides which skills you are assessed on and what your gaps are measured against. You can change it later from your profile.'}
        </p>
      </div>

      <div className={signupStyles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="signup-password">
            Password
          </label>
          <input
            id="signup-password"
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          {!passwordLongEnough && (
            <p className={signupStyles.hintWarning}>Use at least 8 characters.</p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="signup-confirm">
            Confirm password
          </label>
          <input
            id="signup-confirm"
            className={styles.input}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          {!passwordsMatch && (
            <p className={signupStyles.hintWarning}>Those passwords do not match.</p>
          )}
        </div>
      </div>

      <Button
        className={styles.submit}
        type="submit"
        variant="primary"
        size="lg"
        block
        loading={signup.isPending}
        disabled={!canSubmit}
      >
        {signup.isPending ? 'Sending request' : 'Request an account'}
      </Button>

      <p className={styles.switchRole}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </form>
  )
}

// ── After submitting: the request is with an approver ────────────────────────

/**
 * What a new applicant sees instead of a dashboard.
 *
 * Deliberately explicit about who was asked and what happens next. The account exists at this
 * point but is inert, and a screen that simply said "done" would leave somebody trying to sign
 * in and meeting a refusal they had no way to understand.
 */
function SubmittedStep({ result }: { result: SignupResponse }) {
  return (
    <div className={styles.form}>
      <h2 className={styles.formHeading}>Request sent</h2>
      <p className={styles.formSub}>
        Your account for <strong>{result.email}</strong> has been created but is not active yet.
      </p>

      <div className={signupStyles.pendingNotice} role="status">
        <strong>Waiting for approval</strong>
        <span>{result.message}</span>
      </div>

      <p className={signupStyles.hint}>
        You will be able to sign in as soon as somebody grants your request. Trying to sign in
        before then will tell you it is still waiting.
      </p>

      <p className={styles.switchRole}>
        <Link to="/login">Back to sign in</Link>
      </p>
    </div>
  )
}
