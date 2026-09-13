import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '@/api/profile'
import { queryKeys } from '@/api/queryKeys'
import { invalidateEmployeeSkillGraph } from '@/api/invalidation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/apiError'
import type { UserProfile } from '@/types/api'
import styles from './TargetRoleCard.module.css'

/**
 * The role the employee is working towards, and the means to set it.
 *
 * <h2>Why this is on the profile at all</h2>
 * A target role could only be answered during sign-up. Anybody who skipped the question — and
 * every account an administrator created on somebody's behalf, and every account that predates
 * target roles — had no way to answer it afterwards, and their assessment refused to build for
 * want of one. There was no screen anywhere that let them fix it. This is that screen.
 *
 * <p>The options are fetched rather than typed, because a target role is only meaningful if a
 * competency profile exists to measure against it. The server refuses a pair it has no profile
 * for; offering a list is how the person avoids finding that out the hard way.
 */
export function TargetRoleCard({ user }: { user: UserProfile }) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const [jobTitle, setJobTitle] = useState('')
  const [department, setDepartment] = useState('')

  const options = useQuery({
    queryKey: queryKeys.targetRoles(),
    queryFn: ({ signal }) => profileApi.targetRoleOptions(signal),
    // The set of defined roles changes only when an administrator edits the competency
    // profiles, so it does not need re-reading on every visit.
    staleTime: 10 * 60_000,
  })

  // Seed from what the account already holds, and re-seed if it changes underneath.
  useEffect(() => {
    setJobTitle(user.targetJobTitle ?? '')
    setDepartment(user.targetDepartment ?? '')
  }, [user.targetJobTitle, user.targetDepartment])

  const save = useMutation({
    mutationFn: () => profileApi.setTargetRole({ jobTitle, department }),
    onSuccess: async () => {
      toast.success('Target role saved', 'Your gaps have been recalculated against it.')
      // Gaps are measured against the target role, so changing it changes the gap list, the
      // heatmap, what is recommended and the assessment that will be built. The session goes
      // too: the profile carries the target role, and the dashboard reads it from there.
      await queryClient.invalidateQueries({ queryKey: queryKeys.session })
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
      await queryClient.invalidateQueries({ queryKey: queryKeys.assessments.all })
      await invalidateEmployeeSkillGraph(queryClient, user.id)
    },
    onError: (error) => toast.fromError('Could not set your target role', error),
  })

  /** One entry per distinct role, since the same title can exist in two departments. */
  const choices = useMemo(
    () =>
      (options.data ?? []).map((option) => ({
        key: `${option.jobTitle}||${option.department}`,
        ...option,
      })),
    [options.data],
  )

  const selectedKey = jobTitle && department ? `${jobTitle}||${department}` : ''
  const current = user.targetJobTitle
    ? `${user.targetJobTitle} — ${user.targetDepartment ?? 'no department'}`
    : null
  const changed = jobTitle !== (user.targetJobTitle ?? '') || department !== (user.targetDepartment ?? '')

  return (
    <Card
      className={current ? undefined : styles.unset}
      title="Target role"
      description="The role you are working towards. Your assessment is built from its skills, and your gaps are the distance to it."
    >
      {current ? (
        <p className={styles.current}>
          Currently aiming at <strong>{current}</strong>.
        </p>
      ) : (
        <p className={styles.missing}>
          You have not chosen one yet. Until you do, your assessment cannot be built and your gaps
          fall back to whatever your current job title is measured on — which for many roles is
          nothing at all.
        </p>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="target-role">
          Role
        </label>
        {options.isLoading ? (
          <p className={styles.hint}>Loading the roles you can aim at…</p>
        ) : options.isError ? (
          <p className={styles.hint}>
            The list of roles could not be loaded. {ApiError.from(options.error).userMessage()}
          </p>
        ) : choices.length === 0 ? (
          <p className={styles.hint}>
            No role has a competency profile yet, so there is nothing to aim at. An administrator
            defines these under role competencies.
          </p>
        ) : (
          <select
            id="target-role"
            className={styles.select}
            value={selectedKey}
            onChange={(event) => {
              const [nextTitle, nextDepartment] = event.target.value.split('||')
              setJobTitle(nextTitle ?? '')
              setDepartment(nextDepartment ?? '')
            }}
          >
            <option value="">Choose a role…</option>
            {choices.map((choice) => (
              <option key={choice.key} value={choice.key}>
                {choice.jobTitle} — {choice.department} ({choice.skillCount} skill
                {choice.skillCount === 1 ? '' : 's'})
              </option>
            ))}
          </select>
        )}
      </div>

      {save.isError && (
        <div className={styles.error} role="alert">
          <span aria-hidden="true">!</span>
          <span>{ApiError.from(save.error).userMessage()}</span>
        </div>
      )}

      <div className={styles.actions}>
        <p className={styles.hint}>
          Changing this re-measures your gaps immediately. Assessments you have already taken stay
          on your record.
        </p>
        <Button
          variant="primary"
          loading={save.isPending}
          disabled={!selectedKey || !changed || save.isPending}
          onClick={() => save.mutate()}
        >
          {current ? 'Change target role' : 'Set target role'}
        </Button>
      </div>
    </Card>
  )
}
