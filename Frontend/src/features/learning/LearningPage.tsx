import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { catalogApi } from '@/api/catalog'
import { enrollmentsApi } from '@/api/enrollments'
import { learningPathsApi } from '@/api/learningPaths'
import { recommendationsApi } from '@/api/recommendations'
import { queryKeys } from '@/api/queryKeys'
import { invalidateAfterEnrollmentChange } from '@/api/invalidation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { isPermissionDenied, PermissionDenied } from '@/components/ui/PermissionDenied'
import { StatusPill } from '@/components/ui/StatusPill'
import { useToast } from '@/components/ui/Toast'
import type { Course, Enrollment, LearningPath, LearningPathStep } from '@/types/api'
import { useSession } from '@/features/auth/useSession'
import styles from './LearningPage.module.css'

/**
 * Learning paths, enrolments and the catalog.
 *
 * The path is whatever the server generated from the current gaps, rendered in the order it
 * gave — it is a plan that changes as the gaps do, not a fixed roadmap.
 */
export function LearningPage() {
  const { user } = useSession()
  if (!user) return null

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Learning</h1>
        <p className={styles.subtitle}>
          Your generated paths, the courses you are taking and what is left to finish. Paths are
          rebuilt from your gaps, so they change when your assessments do.
        </p>
      </header>

      <LearningPaths employeeId={user.id} />
      <Enrollments employeeId={user.id} />
      <CourseCatalog employeeId={user.id} />
    </div>
  )
}

// ── Learning paths ──────────────────────────────────────────────────────────

function LearningPaths({ employeeId }: { employeeId: number }) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const query = useQuery({
    queryKey: queryKeys.learningPaths.forUser(employeeId),
    queryFn: ({ signal }) => learningPathsApi.forEmployee(employeeId, signal),
  })

  const generate = useMutation({
    mutationFn: () => learningPathsApi.generate(employeeId),
    onSuccess: async (paths) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.forUser(employeeId) })
      toast.success(
        paths.length === 0 ? 'No path could be generated' : `${paths.length} learning path(s) generated`,
        paths.length === 0 ? 'There are no courses covering your current gaps.' : undefined,
      )
    },
    onError: (error) => toast.fromError('Could not generate a learning path', error),
  })

  const completeStep = useMutation({
    mutationFn: (stepId: number) => learningPathsApi.completeStep(stepId),
    onSuccess: async () => {
      await invalidateAfterEnrollmentChange(queryClient, employeeId)
      toast.success('Step marked complete')
    },
    onError: (error) => toast.fromError('Could not complete that step', error),
  })

  const action = (
    <Button size="sm" loading={generate.isPending} onClick={() => generate.mutate()}>
      Regenerate from my gaps
    </Button>
  )

  if (query.isLoading) {
    return (
      <Card title="Learning paths" actions={action} flush>
        <LoadingBlock rows={4} label="Loading learning paths" />
      </Card>
    )
  }
  if (query.isError) {
    return (
      <Card title="Learning paths" actions={action} flush>
        {isPermissionDenied(query.error) ? (
          <PermissionDenied />
        ) : (
          <ErrorBlock error={query.error} onRetry={query.refetch} />
        )}
      </Card>
    )
  }
  if (!query.data || query.data.length === 0) {
    return (
      <Card title="Learning paths" actions={action} flush>
        <EmptyBlock
          title="No learning path yet"
          message="A path is built from your current gaps and the courses that close them."
        />
      </Card>
    )
  }

  return (
    <>
      {query.data.map((path) => (
        <PathCard
          key={path.id}
          path={path}
          action={action}
          onCompleteStep={(stepId) => completeStep.mutate(stepId)}
          completingStepId={completeStep.isPending ? completeStep.variables : undefined}
        />
      ))}
    </>
  )
}

function PathCard({
  path,
  action,
  onCompleteStep,
  completingStepId,
}: {
  path: LearningPath
  action: React.ReactNode
  onCompleteStep: (stepId: number) => void
  completingStepId?: number
}) {
  // The server assigns stepOrder as the teaching order, beginner through advanced. Sorting by
  // it here means a reordering on the server is reflected rather than assumed.
  const steps = [...path.steps].sort((a, b) => a.stepOrder - b.stepOrder)

  return (
    <Card title={path.title} description={path.description ?? undefined} actions={action}>
      <div className={styles.pathHead}>
        <span className={styles.pathMeta}>
          {path.targetSkillName ? `Towards ${path.targetSkillName} · ` : ''}
          {path.totalEstimatedHours}h of study · {path.estimatedCalendarTime}
        </span>
        <StatusPill value={path.status} />
      </div>

      <div className={styles.progressTrack} aria-hidden="true">
        <div className={styles.progressFill} style={{ width: `${path.overallProgressPercent}%` }} />
      </div>
      <p className={styles.pathMeta} style={{ marginTop: 'var(--s-2)' }}>
        {path.overallProgressPercent}% complete
      </p>

      {/*
        Driven by the steps themselves rather than by noCoursesAvailable. That flag records what
        the catalogue looked like when the path was built, and a retired path is never rebuilt —
        so a path generated before its courses existed went on claiming the catalogue was empty
        long after it had been filled.
      */}
      {steps.length > 0 ? (
        <ol className={styles.steps}>
          {steps.map((step) => (
            <StepRow
              key={step.id}
              step={step}
              onComplete={() => onCompleteStep(step.id)}
              completing={completingStepId === step.id}
            />
          ))}
        </ol>
      ) : path.status === 'OBSOLETE' ? (
        <p className={styles.note} style={{ marginTop: 'var(--s-4)' }}>
          {path.targetSkillName ?? 'This skill'} is no longer one of your gaps, so this path has
          been retired. Regenerating rebuilds your plan around the gaps you have now.
        </p>
      ) : (
        <p className={styles.note} style={{ marginTop: 'var(--s-4)' }}>
          No courses in the catalog cover this skill yet, so the path has no steps.
        </p>
      )}
    </Card>
  )
}

function StepRow({
  step,
  onComplete,
  completing,
}: {
  step: LearningPathStep
  onComplete: () => void
  completing: boolean
}) {
  const done = step.status?.toUpperCase() === 'COMPLETED'

  return (
    <li className={styles.step}>
      <span
        className={[styles.stepNumber, done ? styles.stepNumberDone : ''].filter(Boolean).join(' ')}
        aria-hidden="true"
      >
        {done ? '✓' : step.stepOrder}
      </span>
      <div className={styles.stepBody}>
        <div className={styles.stepHead}>
          <span className={styles.stepTitle}>{step.courseTitle}</span>
          <StatusPill value={step.status} />
        </div>
        <p className={styles.stepMeta}>
          {step.difficultyStage} · {step.estimatedHours}h · {step.provider}
          {step.isInternal ? ' (internal)' : ''}
        </p>
        {step.courseDescription && <p className={styles.stepDesc}>{step.courseDescription}</p>}
        <div className={styles.stepActions}>
          {step.externalUrl && (
            <a href={step.externalUrl} target="_blank" rel="noreferrer">
              Open course
            </a>
          )}
          {!done && (
            <Button size="sm" variant="ghost" loading={completing} onClick={onComplete}>
              Mark complete
            </Button>
          )}
        </div>
      </div>
    </li>
  )
}

// ── Enrolments ──────────────────────────────────────────────────────────────

function Enrollments({ employeeId }: { employeeId: number }) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const query = useQuery({
    queryKey: queryKeys.enrollments.forUser(employeeId),
    queryFn: ({ signal }) => enrollmentsApi.list(undefined, signal),
  })

  const updateProgress = useMutation({
    mutationFn: ({ enrollmentId, progress }: { enrollmentId: number; progress: number }) =>
      enrollmentsApi.updateProgress(enrollmentId, { progress }),
    onSuccess: async () => {
      await invalidateAfterEnrollmentChange(queryClient, employeeId)
      toast.success('Progress saved')
    },
    onError: (error) => toast.fromError('Could not save progress', error),
  })

  const updateMilestone = useMutation({
    mutationFn: ({
      enrollmentId,
      milestoneId,
      completionPercentage,
    }: {
      enrollmentId: number
      milestoneId: number
      completionPercentage: number
    }) => enrollmentsApi.updateProgress(enrollmentId, { milestoneId, completionPercentage }),
    onSuccess: async () => {
      await invalidateAfterEnrollmentChange(queryClient, employeeId)
      toast.success('Milestone updated')
    },
    onError: (error) => toast.fromError('Could not update that milestone', error),
  })

  const complete = useMutation({
    mutationFn: (enrollmentId: number) => enrollmentsApi.complete(enrollmentId),
    onSuccess: async () => {
      await invalidateAfterEnrollmentChange(queryClient, employeeId)
      toast.success('Course completed', 'Your achievement has been recorded.')
    },
    onError: (error) => toast.fromError('Could not complete the course', error),
  })

  if (query.isLoading) {
    return (
      <Card title="Courses you are taking" flush>
        <LoadingBlock rows={4} label="Loading enrolments" />
      </Card>
    )
  }
  if (query.isError) {
    return (
      <Card title="Courses you are taking" flush>
        {isPermissionDenied(query.error) ? (
          <PermissionDenied />
        ) : (
          <ErrorBlock error={query.error} onRetry={query.refetch} />
        )}
      </Card>
    )
  }
  if (!query.data || query.data.length === 0) {
    return (
      <Card title="Courses you are taking" flush>
        <EmptyBlock title="Not enrolled in anything" message="Enrol in a course below to start." />
      </Card>
    )
  }

  return (
    <Card title="Courses you are taking" description="Overall progress, and where you are within each.">
      {query.data.map((enrollment) => (
        <EnrollmentRow
          key={enrollment.enrollmentId}
          enrollment={enrollment}
          onSetProgress={(progress) =>
            updateProgress.mutate({ enrollmentId: enrollment.enrollmentId, progress })
          }
          onSetMilestone={(milestoneId, completionPercentage) =>
            updateMilestone.mutate({
              enrollmentId: enrollment.enrollmentId,
              milestoneId,
              completionPercentage,
            })
          }
          onComplete={() => complete.mutate(enrollment.enrollmentId)}
          busy={updateProgress.isPending || updateMilestone.isPending || complete.isPending}
        />
      ))}
    </Card>
  )
}

function EnrollmentRow({
  enrollment,
  onSetProgress,
  onSetMilestone,
  onComplete,
  busy,
}: {
  enrollment: Enrollment
  onSetProgress: (progress: number) => void
  onSetMilestone: (milestoneId: number, completionPercentage: number) => void
  onComplete: () => void
  busy: boolean
}) {
  const finished = enrollment.status === 'COMPLETED' || enrollment.status === 'CERTIFIED'
  const milestones = [...enrollment.milestones].sort((a, b) => a.sequence - b.sequence)

  return (
    <div className={styles.enrollment}>
      <div className={styles.enrollHead}>
        <span className={styles.enrollTitle}>{enrollment.trainingTitle}</span>
        <StatusPill value={enrollment.status} />
      </div>
      <p className={styles.enrollMeta}>
        {enrollment.provider} · started {formatDate(enrollment.startDate)}
        {enrollment.completionDate ? ` · finished ${formatDate(enrollment.completionDate)}` : ''}
      </p>

      <div className={styles.overall} style={{ marginTop: 'var(--s-3)' }}>
        <div className={styles.progressTrack} style={{ flex: 1 }} aria-hidden="true">
          <div className={styles.progressFill} style={{ width: `${enrollment.progress}%` }} />
        </div>
        <span className={styles.overallValue}>{enrollment.progress}%</span>
      </div>

      {milestones.length > 0 && (
        <div className={styles.milestones}>
          {milestones.map((milestone) => (
            <div className={styles.milestone} key={milestone.milestoneId}>
              <span className={styles.milestoneName} title={milestone.title}>
                {milestone.sequence}. {milestone.title}
              </span>
              <div className={styles.milestoneTrack} aria-hidden="true">
                <div
                  className={styles.milestoneFill}
                  style={{ width: `${milestone.completionPercentage}%` }}
                />
              </div>
              {finished ? (
                <StatusPill value={milestone.status} />
              ) : (
                <select
                  className={styles.select}
                  aria-label={`Completion of ${milestone.title}`}
                  value={milestone.completionPercentage}
                  disabled={busy}
                  onChange={(event) =>
                    onSetMilestone(milestone.milestoneId, Number(event.target.value))
                  }
                  style={{ height: 26, fontSize: 'var(--fs-xs)' }}
                >
                  {[0, 25, 50, 75, 100].map((value) => (
                    <option key={value} value={value}>
                      {value}%
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      )}

      {!finished && (
        <div className={styles.enrollActions}>
          <span className={styles.enrollMeta}>Set overall progress:</span>
          {[25, 50, 75].map((value) => (
            <Button key={value} size="sm" disabled={busy} onClick={() => onSetProgress(value)}>
              {value}%
            </Button>
          ))}
          <Button size="sm" variant="primary" loading={busy} onClick={onComplete}>
            Mark complete
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Catalog ─────────────────────────────────────────────────────────────────

function CourseCatalog({ employeeId }: { employeeId: number }) {
  const queryClient = useQueryClient()
  const toast = useToast()

  // Recommendations are the useful entry into the catalog: they are the courses chosen for
  // this person's gaps, with the reasoning the server produced.
  const recommendations = useQuery({
    queryKey: queryKeys.recommendations.forUser(employeeId),
    queryFn: ({ signal }) => recommendationsApi.forEmployee(employeeId, signal),
  })

  /**
   * The external catalogue, not the administrator's one.
   *
   * `catalogApi.courses` reads /api/ld-admin/courses, which refuses an employee outright - so
   * using it here meant every employee saw a permission notice where the course list should be,
   * and never reached the Udemy, YouTube, Coursera or freeCodeCamp courses recommended for
   * their own gaps. /api/catalog/external is the same catalogue filtered to what came from
   * outside the organisation, and employees may read it.
   */
  const catalog = useQuery({
    queryKey: queryKeys.courses.external(),
    queryFn: ({ signal }) => catalogApi.external(signal),
    retry: false,
  })

  // Read so a course already being taken offers "Continue" rather than a second enrolment.
  const enrollments = useQuery({
    queryKey: queryKeys.enrollments.forUser(employeeId),
    queryFn: ({ signal }) => enrollmentsApi.list(undefined, signal),
  })

  const enroll = useMutation({
    mutationFn: (trainingId: number) => enrollmentsApi.enroll({ trainingId }),
    onSuccess: async (enrollment) => {
      await invalidateAfterEnrollmentChange(queryClient, employeeId)
      toast.success('Enrolled', `You are now enrolled in ${enrollment.trainingTitle}.`)
    },
    onError: (error) => toast.fromError('Could not enrol', error),
  })

  /**
   * The severity of the gap each skill has, keyed by skill id.
   *
   * This is what orders the catalog. A flat list is the same list for everybody; ordering it by
   * the severity of the gap the course addresses turns it into this person's list, and it moves
   * whenever their assessment does.
   */
  const severityBySkill = useMemo(() => {
    const map = new Map<number, { severity: string; rank: number; reason: string }>()
    for (const rec of recommendations.data ?? []) {
      const existing = map.get(rec.skillId)
      if (!existing || rec.priorityRank < existing.rank) {
        map.set(rec.skillId, {
          severity: rec.sourceGapSeverity,
          rank: rec.priorityRank,
          reason: rec.recommendationText,
        })
      }
    }
    return map
  }, [recommendations.data])

  const enrolledByCourse = useMemo(() => {
    const map = new Map<number, Enrollment>()
    for (const e of enrollments.data ?? []) map.set(e.trainingId, e)
    return map
  }, [enrollments.data])

  const courses = useMemo(() => {
    const all = (catalog.data ?? []) as Course[]
    return [...all].sort((a, b) => {
      const aRec = a.skillId == null ? undefined : severityBySkill.get(a.skillId)
      const bRec = b.skillId == null ? undefined : severityBySkill.get(b.skillId)
      // Recommended courses first, worst gap first within them, then everything else by title.
      if (aRec && !bRec) return -1
      if (!aRec && bRec) return 1
      if (aRec && bRec && aRec.rank !== bRec.rank) return aRec.rank - bRec.rank
      return a.title.localeCompare(b.title)
    })
  }, [catalog.data, severityBySkill])

  const recommendedCount = courses.filter(
    (c) => c.skillId != null && severityBySkill.has(c.skillId),
  ).length

  return (
    <Card
      title="Available courses"
      description="Courses from Udemy, YouTube, Coursera, freeCodeCamp and vendor documentation, ordered by the gaps they close for you."
      flush={catalog.isLoading || Boolean(catalog.error)}
    >
      {catalog.isLoading ? (
        <LoadingBlock rows={3} label="Loading the course catalog" />
      ) : catalog.isError ? (
        isPermissionDenied(catalog.error) ? (
          <p className={styles.note} style={{ padding: 'var(--s-5)' }}>
            The full catalog is administered by L&amp;D and is not open to your role. Your
            recommendations above are drawn from it.
          </p>
        ) : (
          <ErrorBlock error={catalog.error} onRetry={catalog.refetch} />
        )
      ) : (
        <>
          {recommendedCount > 0 && (
            <p className={styles.note} style={{ marginBottom: 'var(--s-3)' }}>
              {recommendedCount} of these address a gap from your latest assessment and are listed
              first.
            </p>
          )}
          {courses.map((course: Course) => {
            const recommendation =
              course.skillId == null ? undefined : severityBySkill.get(course.skillId)
            const enrollment = enrolledByCourse.get(course.id)
            return (
              <div className={styles.courseRow} key={course.id}>
                <div className={styles.courseMeta}>
                  <span className={styles.courseTitle}>
                    {course.title}
                    {recommendation && (
                      <span className={styles.courseBadge}>
                        <StatusPill value={recommendation.severity} />
                      </span>
                    )}
                  </span>
                  <span className={styles.courseSub}>
                    {course.provider}
                    {course.skillName ? ` · ${course.skillName}` : ''}
                    {course.difficulty ? ` · ${course.difficulty}` : ''}
                    {course.durationHours ? ` · ${course.durationHours}h` : ''}
                  </span>
                  {recommendation && (
                    <span className={styles.courseReason}>{recommendation.reason}</span>
                  )}
                </div>

                <div className={styles.courseActions}>
                  {/*
                    The link to the course itself. rel="noreferrer" matters on a target=_blank
                    link: without it the opened page gets a handle on this window.
                  */}
                  {course.externalUrl && (
                    <a
                      className={styles.courseLink}
                      href={course.externalUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Open course ↗
                    </a>
                  )}

                  {enrollment ? (
                    <span className={styles.courseEnrolled}>
                      {enrollment.status === 'COMPLETED'
                        ? 'Completed'
                        : `Enrolled · ${Math.round(enrollment.progress)}%`}
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      loading={enroll.isPending && enroll.variables === course.id}
                      onClick={() => enroll.mutate(course.id)}
                    >
                      Enrol
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </>
      )}
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
