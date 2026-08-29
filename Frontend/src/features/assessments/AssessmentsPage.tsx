import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { assessmentsApi } from '@/api/assessments'
import { adminApi } from '@/api/admin'
import { skillsApi } from '@/api/skills'
import { queryKeys } from '@/api/queryKeys'
import { invalidateAfterAssessment } from '@/api/invalidation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ErrorBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { isPermissionDenied, PermissionDenied } from '@/components/ui/PermissionDenied'
import { ProficiencyScale, PROFICIENCY_LEVELS, proficiencyLabel } from '@/components/ui/ProficiencyScale'
import { StatusPill } from '@/components/ui/StatusPill'
import { Table, type Column } from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/apiError'
import type { Assessment, ProficiencyLevel, UserProfile } from '@/types/api'
import { useSession } from '@/features/auth/useSession'
import styles from './AssessmentsPage.module.css'

type Mode = 'SELF' | 'PEER'

/**
 * Self and peer assessment.
 *
 * Both post to the employee endpoints, which create and submit in one call and return the
 * awarded levels alongside the levels held beforehand. That response is the whole point: the
 * user sees what actually moved rather than a bare confirmation, and the numbers come from the
 * server rather than from what was on the form.
 */
export function AssessmentsPage() {
  const { user } = useSession()
  const [mode, setMode] = useState<Mode>('SELF')

  if (!user) return null

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Assessments</h1>
        <p className={styles.subtitle}>
          An assessment is what turns a skill level into evidence. Submitting one moves your
          proficiency, recalculates your gaps and regenerates what is recommended to you.
        </p>
      </header>

      <div className={styles.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={mode === 'SELF'}
          className={[styles.tab, mode === 'SELF' ? styles.tabActive : ''].filter(Boolean).join(' ')}
          onClick={() => setMode('SELF')}
        >
          Assess yourself
        </button>
        <button
          role="tab"
          aria-selected={mode === 'PEER'}
          className={[styles.tab, mode === 'PEER' ? styles.tabActive : ''].filter(Boolean).join(' ')}
          onClick={() => setMode('PEER')}
        >
          Assess a colleague
        </button>
      </div>

      <AssessmentForm mode={mode} employeeId={user.id} />
      <AssessmentHistory employeeId={user.id} />
    </div>
  )
}

// ── The form ────────────────────────────────────────────────────────────────

function AssessmentForm({ mode, employeeId }: { mode: Mode; employeeId: number }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [colleagueId, setColleagueId] = useState<number | ''>('')
  const [levels, setLevels] = useState<Record<number, ProficiencyLevel>>({})
  const [comments, setComments] = useState('')
  const [submitted, setSubmitted] = useState<Assessment | null>(null)

  /**
   * A self assessment covers the skills you already hold. A peer assessment covers the whole
   * catalog, because you may know a colleague is strong at something not yet on their profile.
   */
  const ownSkills = useQuery({
    queryKey: queryKeys.skills.forUser(employeeId),
    queryFn: ({ signal }) => skillsApi.forUser(employeeId, signal),
    enabled: mode === 'SELF',
  })

  const catalog = useQuery({
    queryKey: queryKeys.skills.catalog(),
    queryFn: ({ signal }) => skillsApi.list(signal),
    enabled: mode === 'PEER',
  })

  // Colleagues come from the directory. An employee may not read it, in which case the form
  // says so rather than presenting an empty picker.
  const colleagues = useQuery({
    queryKey: ['directory', 'colleagues'],
    queryFn: ({ signal }) => adminApi.users(signal),
    enabled: mode === 'PEER',
    retry: false,
  })

  const skillOptions = useMemo(() => {
    if (mode === 'SELF') {
      return (ownSkills.data ?? []).map((s) => ({
        skillId: s.skillId,
        name: s.skillName,
        held: s.proficiencyLevel as ProficiencyLevel | undefined,
      }))
    }
    return (catalog.data ?? []).map((s) => ({ skillId: s.id, name: s.name, held: undefined }))
  }, [mode, ownSkills.data, catalog.data])

  const submit = useMutation({
    mutationFn: () => {
      const results = Object.entries(levels).map(([skillId, proficiency]) => ({
        skillId: Number(skillId),
        proficiency,
      }))
      const body = { results, comments: comments.trim() || undefined }
      return mode === 'SELF'
        ? api.post<Assessment>('/api/employee/assessments/self', body)
        : api.post<Assessment>(`/api/employee/assessments/peer/${colleagueId}`, body)
    },
    onSuccess: async (assessment) => {
      setSubmitted(assessment)
      setLevels({})
      setComments('')
      // The subject of the assessment is whose derived data changed — for a peer assessment
      // that is the colleague, not the person who filled the form in.
      await invalidateAfterAssessment(queryClient, assessment.employeeId)
      toast.success('Assessment submitted', 'Gaps and recommendations have been refreshed.')
    },
    onError: (error) => toast.fromError('Could not submit the assessment', error),
  })

  const chosen = Object.keys(levels).length
  const canSubmit = chosen > 0 && (mode === 'SELF' || colleagueId !== '')
  const isLoading = mode === 'SELF' ? ownSkills.isLoading : catalog.isLoading
  const loadError = mode === 'SELF' ? ownSkills.error : catalog.error

  return (
    <>
      {submitted && <AssessmentOutcome assessment={submitted} onDismiss={() => setSubmitted(null)} />}

      <Card
        title={mode === 'SELF' ? 'Rate your own skills' : 'Rate a colleague'}
        description={
          mode === 'SELF'
            ? 'Choose a level for each skill you want to assess. Leave the rest untouched.'
            : 'Pick the colleague, then rate the skills you have seen them work with.'
        }
        flush={isLoading || Boolean(loadError)}
      >
        {isLoading ? (
          <LoadingBlock rows={4} label="Loading skills" />
        ) : loadError ? (
          isPermissionDenied(loadError) ? (
            <PermissionDenied />
          ) : (
            <ErrorBlock
              error={loadError}
              onRetry={mode === 'SELF' ? ownSkills.refetch : catalog.refetch}
            />
          )
        ) : (
          <>
            {mode === 'PEER' && (
              <ColleaguePicker
                query={colleagues}
                value={colleagueId}
                onChange={setColleagueId}
                excludeId={employeeId}
              />
            )}

            {skillOptions.length === 0 ? (
              <p className={styles.note}>
                {mode === 'SELF'
                  ? 'You have no skills on record yet. Add some on My skills first.'
                  : 'The skill catalog is empty.'}
              </p>
            ) : (
              <ul className={styles.skillList}>
                {skillOptions.map((option) => (
                  <li className={styles.skillRow} key={option.skillId}>
                    <div className={styles.skillMeta}>
                      <span className={styles.skillName}>{option.name}</span>
                      {option.held && (
                        <span className={styles.currently}>
                          Currently {proficiencyLabel(option.held)}
                        </span>
                      )}
                    </div>
                    <LevelPicker
                      value={levels[option.skillId]}
                      onChange={(level) =>
                        setLevels((current) => ({ ...current, [option.skillId]: level }))
                      }
                      onClear={() =>
                        setLevels((current) => {
                          const next = { ...current }
                          delete next[option.skillId]
                          return next
                        })
                      }
                    />
                  </li>
                ))}
              </ul>
            )}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="comments">
                Comments (optional)
              </label>
              <textarea
                id="comments"
                className={styles.textarea}
                rows={2}
                value={comments}
                onChange={(event) => setComments(event.target.value)}
              />
            </div>

            {submit.isError && (
              <div className={styles.error} role="alert">
                <span aria-hidden="true">!</span>
                <span>{ApiError.from(submit.error).userMessage()}</span>
              </div>
            )}

            <div className={styles.actions}>
              <span className={styles.selectionCount}>
                {chosen === 0 ? 'No skills selected' : `${chosen} skill${chosen > 1 ? 's' : ''} rated`}
              </span>
              <Button
                variant="primary"
                loading={submit.isPending}
                disabled={!canSubmit}
                onClick={() => submit.mutate()}
              >
                Submit assessment
              </Button>
            </div>
          </>
        )}
      </Card>
    </>
  )
}

function ColleaguePicker({
  query,
  value,
  onChange,
  excludeId,
}: {
  query: { data?: UserProfile[]; isLoading: boolean; isError: boolean; error: unknown }
  value: number | ''
  onChange: (id: number) => void
  excludeId: number
}) {
  if (query.isLoading) return <p className={styles.note}>Loading colleagues…</p>
  if (query.isError) {
    return (
      <p className={styles.note}>
        The colleague directory is not available to your role, so a peer assessment cannot be
        started here. {ApiError.from(query.error).userMessage()}
      </p>
    )
  }

  const options = (query.data ?? []).filter((person) => person.id !== excludeId)

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor="colleague">
        Colleague
      </label>
      <select
        id="colleague"
        className={styles.select}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        <option value="">Choose a colleague…</option>
        {options.map((person) => (
          <option key={person.id} value={person.id}>
            {person.fullName} — {person.jobTitle ?? person.email}
          </option>
        ))}
      </select>
    </div>
  )
}

/** Selecting a level is selecting a rung on the same ladder the rest of the app shows. */
function LevelPicker({
  value,
  onChange,
  onClear,
}: {
  value?: ProficiencyLevel
  onChange: (level: ProficiencyLevel) => void
  onClear: () => void
}) {
  return (
    <div className={styles.levelPicker}>
      {PROFICIENCY_LEVELS.map((level) => (
        <button
          key={level}
          type="button"
          className={[styles.levelButton, value === level ? styles.levelButtonActive : '']
            .filter(Boolean)
            .join(' ')}
          onClick={() => (value === level ? onClear() : onChange(level))}
          aria-pressed={value === level}
          title={proficiencyLabel(level)}
        >
          {proficiencyLabel(level).slice(0, 4)}
        </button>
      ))}
    </div>
  )
}

// ── The outcome ─────────────────────────────────────────────────────────────

/**
 * What the submission actually changed, read from the server's response.
 *
 * The before-and-after is the useful part: "Advanced" alone does not say whether anything
 * moved, whereas "Intermediate to Advanced" does.
 */
function AssessmentOutcome({
  assessment,
  onDismiss,
}: {
  assessment: Assessment
  onDismiss: () => void
}) {
  return (
    <Card
      className={styles.outcome}
      title="Assessment recorded"
      description={`${assessment.assessmentType === 'SELF' ? 'Self' : 'Peer'} assessment of ${
        assessment.employeeName
      }.`}
      actions={
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Dismiss
        </Button>
      }
    >
      <ul className={styles.deltaList}>
        {assessment.results.map((result) => (
          <li className={styles.delta} key={result.resultId}>
            <span className={styles.deltaSkill}>{result.skillName}</span>
            <span className={styles.deltaMove}>
              <span className={styles.deltaFrom}>
                {result.previousProficiency ? proficiencyLabel(result.previousProficiency) : 'Not on record'}
              </span>
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
              <span className={styles.deltaTo}>
                {result.proficiency ? proficiencyLabel(result.proficiency) : '—'}
              </span>
            </span>
            <ImprovementBadge improvement={result.improvement} />
          </li>
        ))}
      </ul>
      <p className={styles.outcomeNote}>
        Your gaps and recommendations have been recalculated from these levels.
      </p>
    </Card>
  )
}

function ImprovementBadge({ improvement }: { improvement: number | null }) {
  if (improvement === null) return null
  if (improvement > 0) return <StatusPill value="LOW" label={`+${improvement}`} tone="low" />
  if (improvement < 0) return <StatusPill value="HIGH" label={String(improvement)} tone="high" />
  return <StatusPill value="INFO" label="No change" tone="neutral" />
}

// ── History ─────────────────────────────────────────────────────────────────

function AssessmentHistory({ employeeId }: { employeeId: number }) {
  const query = useQuery({
    queryKey: queryKeys.assessments.forEmployee(employeeId),
    queryFn: ({ signal }) => assessmentsApi.list(undefined, signal),
  })

  const columns: Column<Assessment>[] = [
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date), width: '150px' },
    { key: 'type', header: 'Type', render: (row) => <StatusPill value={row.assessmentType} />, width: '120px' },
    { key: 'assessor', header: 'Assessed by', render: (row) => row.assessorName },
    {
      key: 'skills',
      header: 'Skills',
      render: (row) =>
        row.results.length === 0
          ? '—'
          : row.results
              .map((r) => `${r.skillName}${r.proficiency ? ` (${proficiencyLabel(r.proficiency)})` : ''}`)
              .join(', '),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusPill value={row.status} />, width: '120px' },
  ]

  return (
    <Card title="Your assessment history" description="Every assessment recorded against you." flush>
      <Table
        columns={columns}
        rows={query.data}
        rowKey={(row) => row.assessmentId}
        isLoading={query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        caption="Assessments recorded against you"
        emptyTitle="No assessments yet"
        emptyMessage="Assessments of your skills will be listed here once one is submitted."
      />
    </Card>
  )
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export { ProficiencyScale }
