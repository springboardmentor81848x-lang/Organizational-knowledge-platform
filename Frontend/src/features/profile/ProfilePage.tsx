import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileApi, type EmployeeProfileRequest } from '@/api/profile'
import { invalidateProfile } from '@/api/invalidation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ErrorBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { isPermissionDenied, PermissionDenied } from '@/components/ui/PermissionDenied'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/apiError'
import { ROLES_WITH_DEVELOPMENT_TRACK, roleLabel } from '@/app/roleRoutes'
import { useSession } from '@/features/auth/useSession'
import { TargetRoleCard } from './TargetRoleCard'
import styles from './ProfilePage.module.css'

/**
 * Viewing and editing the employee profile.
 *
 * The form is seeded from the server and reset from it after every save, so what is on screen
 * is always what was actually stored — a save that the server altered or partly rejected shows
 * the stored version rather than the text that was typed.
 */
export function ProfilePage() {
  const { user } = useSession()
  const queryClient = useQueryClient()
  const toast = useToast()

  const query = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: ({ signal }) => profileApi.get(signal),
  })

  const [form, setForm] = useState<EmployeeProfileRequest>({})
  const [dirty, setDirty] = useState(false)

  // Seed from the server, and re-seed whenever the stored profile changes underneath.
  useEffect(() => {
    if (!query.data) return
    setForm({
      bio: query.data.bio ?? '',
      department: query.data.department ?? '',
      jobRole: query.data.jobRole ?? '',
      workExperience: query.data.workExperience ?? '',
      education: query.data.education ?? '',
    })
    setDirty(false)
  }, [query.data])

  const save = useMutation({
    mutationFn: (body: EmployeeProfileRequest) => profileApi.update(body),
    onSuccess: async (saved) => {
      // Write the server's version back rather than trusting what was typed.
      queryClient.setQueryData(['profile', 'me'], saved)
      if (user) await invalidateProfile(queryClient, user.id)
      setDirty(false)
      toast.success('Profile saved')
    },
    onError: (error) => toast.fromError('Could not save your profile', error),
  })

  function update(field: keyof EmployeeProfileRequest, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setDirty(true)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    save.mutate(form)
  }

  if (query.isLoading) {
    return (
      <Card title="My profile" flush>
        <LoadingBlock rows={6} label="Loading your profile" />
      </Card>
    )
  }

  if (query.isError) {
    return (
      <Card title="My profile" flush>
        {isPermissionDenied(query.error) ? (
          <PermissionDenied />
        ) : (
          <ErrorBlock error={query.error} onRetry={query.refetch} />
        )}
      </Card>
    )
  }

  const saveError = save.error ? ApiError.from(save.error) : null

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>My profile</h1>
        <p className={styles.subtitle}>
          How you appear across the platform. Your name, email and role are administered centrally.
        </p>
      </header>

      {/*
        Outside the two-column layout and above it, because for somebody who has none this is
        the only thing on the page that matters - their assessment, gaps and recommendations all
        wait on it. Only shown to accounts that are actually measured: an administrator has no
        target role and should not be offered one.
      */}
      {user?.role && ROLES_WITH_DEVELOPMENT_TRACK.includes(user.role) && (
        <TargetRoleCard user={user} />
      )}

      <div className={styles.layout}>
        <Card title="Account" description="Set by your administrator.">
          <dl className={styles.readonlyGrid}>
            <ReadOnlyField label="Name" value={user?.fullName} />
            <ReadOnlyField label="Work email" value={user?.email} />
            <ReadOnlyField label="Role" value={roleLabel(user?.role)} />
            <ReadOnlyField label="Job title" value={user?.jobTitle} />
          </dl>
          <p className={styles.note}>
            These come from your account. Ask an administrator if any of them are wrong.
          </p>
        </Card>

        <Card
          title="About you"
          description="Yours to keep up to date."
          actions={
            dirty ? <span className={styles.unsaved}>Unsaved changes</span> : undefined
          }
        >
          <form onSubmit={handleSubmit} noValidate>
            {saveError && (
              <div className={styles.error} role="alert">
                <span aria-hidden="true">!</span>
                <span>{saveError.userMessage()}</span>
              </div>
            )}

            <Field
              id="department"
              label="Department"
              value={form.department ?? ''}
              onChange={(value) => update('department', value)}
              hint="The team or function you sit in."
            />
            <Field
              id="jobRole"
              label="Role"
              value={form.jobRole ?? ''}
              onChange={(value) => update('jobRole', value)}
              hint="What you actually do day to day."
            />
            <Field
              id="workExperience"
              label="Experience"
              value={form.workExperience ?? ''}
              onChange={(value) => update('workExperience', value)}
              multiline
              hint="Previous roles and the work that shaped your skills."
            />
            <Field
              id="education"
              label="Education"
              value={form.education ?? ''}
              onChange={(value) => update('education', value)}
              multiline
              hint="Qualifications and formal study."
            />
            <Field
              id="bio"
              label="Summary"
              value={form.bio ?? ''}
              onChange={(value) => update('bio', value)}
              multiline
              hint="A short description colleagues will see."
            />

            <div className={styles.actions}>
              <Button
                type="button"
                onClick={() => query.refetch()}
                disabled={!dirty || save.isPending}
              >
                Discard changes
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={save.isPending}
                disabled={!dirty}
              >
                {save.isPending ? 'Saving' : 'Save changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

function ReadOnlyField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className={styles.readonlyField}>
      <dt className={styles.readonlyLabel}>{label}</dt>
      <dd className={styles.readonlyValue}>{value || '—'}</dd>
    </div>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  hint,
  multiline = false,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  multiline?: boolean
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          className={styles.textarea}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
        />
      ) : (
        <input
          id={id}
          className={styles.input}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  )
}
