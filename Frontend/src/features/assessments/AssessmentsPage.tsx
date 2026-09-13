import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { quizApi } from '@/api/quiz'
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
import type { Assessment, ProficiencyLevel, Role, UserProfile } from '@/types/api'
import { useSession } from '@/features/auth/useSession'
import { TargetRoleQuiz } from './TargetRoleQuiz'
import { ReattemptApprovals } from './ReattemptApprovals'
import styles from './AssessmentsPage.module.css'

type Mode = 'QUIZ' | 'PEER' | 'APPROVALS'

/**
 * Roles that get the approvals tab. The server decides whose requests they actually see and
 * refuses the endpoint to anybody else, so this only governs whether the tab is painted.
 */
const APPROVER_ROLES: Role[] = [
  'MANAGER',
  'DEPARTMENT_HEAD',
  'HR_SPECIALIST',
  'HR_ADMIN',
  'LND_ADMIN',
  'SYSTEM_ADMIN',
  'ADMIN',
]

/**
 * Assessment.
 *
 * <h2>Why there is no "assess yourself" tab any more</h2>
 * There used to be one: a form on which an employee picked their own level for each skill. It
 * has been withdrawn, and the endpoint behind it with it. A proficiency level is not a private
 * note — it colours the gap heatmap, sizes every gap beneath it and decides what training gets
 * recommended and to whom — and a level somebody awarded themselves is a claim rather than
 * evidence for one. Leaving the form in place meant the heatmap a manager reads was part
 * measurement and part self-report, with nothing on the screen distinguishing the two.
 *
 * What remains are the two things that produce evidence: the marked target-role assessment,
 * where the server scores the answers, and a peer assessment, which is somebody else's judgement
 * rather than the subject's own.
 */
export function AssessmentsPage() {
  const { user, role } = useSession()
  const [mode, setMode] = useState<Mode>('QUIZ')

  // Read here as well as inside the quiz so the tab can say which paper is waiting. It is the
  // same query key, so this costs nothing: React Query serves both from one request.
  const attempt = useQuery({
    queryKey: queryKeys.assessments.attemptStatus(),
    queryFn: ({ signal }) => quizApi.attemptStatus(signal),
    retry: false,
  })

  if (!user) return null

  const canApprove = role !== null && APPROVER_ROLES.includes(role)
  const pendingSkills = attempt.data?.scope === 'NEW_SKILLS' ? attempt.data.pendingSkillCount : 0

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Assessments</h1>
        <p className={styles.subtitle}>
          An assessment is what turns a skill level into evidence. Submitting one moves your
          proficiency, recalculates your gaps and regenerates what is recommended to you. The
          questions come from the skills your target role is measured on, they are marked on the
          server, and the assessment is taken once — a further attempt has to be approved.
        </p>
      </header>

      <div className={styles.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={mode === 'QUIZ'}
          className={[styles.tab, mode === 'QUIZ' ? styles.tabActive : ''].filter(Boolean).join(' ')}
          onClick={() => setMode('QUIZ')}
        >
          {pendingSkills > 0
            ? `Assess ${pendingSkills} new skill${pendingSkills === 1 ? '' : 's'}`
            : 'Take the assessment'}
        </button>
        <button
          role="tab"
          aria-selected={mode === 'PEER'}
          className={[styles.tab, mode === 'PEER' ? styles.tabActive : ''].filter(Boolean).join(' ')}
          onClick={() => setMode('PEER')}
        >
          Assess a colleague
        </button>
        {canApprove && (
          <button
            role="tab"
            aria-selected={mode === 'APPROVALS'}
            className={[styles.tab, mode === 'APPROVALS' ? styles.tabActive : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => setMode('APPROVALS')}
          >
            Retake requests
          </button>
        )}
      </div>

      {mode === 'QUIZ' && <TargetRoleQuiz />}
      {mode === 'PEER' && <PeerAssessmentForm employeeId={user.id} />}
      {mode === 'APPROVALS' && <ReattemptApprovals />}

      {mode !== 'APPROVALS' && <AssessmentHistory employeeId={user.id} />}
    </div>
  )
}

// ── The peer form ───────────────────────────────────────────────────────────

/**
 * Rating a colleague.
 *
 * The skill list is the whole catalogue rather than the colleague's own recorded skills, because
 * you may well know somebody is strong at something that never made it onto their profile — and
 * that is exactly the case a peer assessment is worth having for.
 */
function PeerAssessmentForm({ employeeId }: { employeeId: number }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [colleagueId, setColleagueId] = useState<number | ''>('')
  const [levels, setLevels] = useState<Record<number, ProficiencyLevel>>({})
  const [comments, setComments] = useState('')
  const [submitted, setSubmitted] = useState<Assessment | null>(null)

  const catalog = useQuery({
    queryKey: queryKeys.skills.catalog(),
    queryFn: ({ signal }) => skillsApi.list(signal),
  })

  // Colleagues come from the directory. An employee may not read it, in which case the form
  // says so rather than presenting an empty picker.
  const colleagues = useQuery({
    queryKey: ['directory', 'colleagues'],
    queryFn: ({ signal }) => adminApi.users(signal),
    retry: false,
  })

  const skillOptions = useMemo(
    () => (catalog.data ?? []).map((s) => ({ skillId: s.id, name: s.name })),
    [catalog.data],
  )

  const submit = useMutation({
    mutationFn: () => {
      const results = Object.entries(levels).map(([skillId, proficiency]) => ({
        skillId: Number(skillId),
        proficiency,
      }))
      return api.post<Assessment>(`/api/employee/assessments/peer/${colleagueId}`, {
        results,
        comments: comments.trim() || undefined,
      })
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
  const canSubmit = chosen > 0 && colleagueId !== ''

  return (
    <>
      {submitted && <AssessmentOutcome assessment={submitted} onDismiss={() => setSubmitted(null)} />}

      <Card
        title="Rate a colleague"
        description="Pick the colleague, then rate the skills you have seen them work with."
        flush={catalog.isLoading || Boolean(catalog.error)}
      >
        {catalog.isLoading ? (
          <LoadingBlock rows={4} label="Loading skills" />
        ) : catalog.error ? (
          isPermissionDenied(catalog.error) ? (
            <PermissionDenied />
          ) : (
            <ErrorBlock error={catalog.error} onRetry={catalog.refetch} />
          )
        ) : (
          <>
            <ColleaguePicker
              query={colleagues}
              value={colleagueId}
              onChange={setColleagueId}
              excludeId={employeeId}
            />

            {skillOptions.length === 0 ? (
              <p className={styles.note}>The skill catalog is empty.</p>
            ) : (
              <ul className={styles.skillList}>
                {skillOptions.map((option) => (
                  <li className={styles.skillRow} key={option.skillId}>
                    <div className={styles.skillMeta}>
                      <span className={styles.skillName}>{option.name}</span>
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
      description={`Peer assessment of ${assessment.employeeName}.`}
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
        Their gaps and recommendations have been recalculated from these levels.
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
    {
      key: 'type',
      header: 'Type',
      // SELF now only ever comes from the marked target-role paper, so calling it "Self" would
      // describe how it was authored rather than what it is.
      render: (row) => (
        <StatusPill
          value={row.assessmentType}
          label={row.assessmentType === 'SELF' ? 'Target role' : undefined}
        />
      ),
      width: '120px',
    },
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
