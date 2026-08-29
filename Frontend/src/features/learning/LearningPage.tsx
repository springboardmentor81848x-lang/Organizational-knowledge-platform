import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { coursesApi } from '@/api/courses'
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

      {path.noCoursesAvailable ? (
        <p className={styles.note} style={{ marginTop: 'var(--s-4)' }}>
          No courses in the catalog cover this skill yet, so the path has no steps.
        </p>
      ) : (
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

  const catalog = useQuery({
    queryKey: queryKeys.courses.catalog(),
    queryFn: ({ signal }) => coursesApi.list(signal),
    retry: false,
  })

  const enroll = useMutation({
    mutationFn: (trainingId: number) => enrollmentsApi.enroll({ trainingId }),
    onSuccess: async (enrollment) => {
      await invalidateAfterEnrollmentChange(queryClient, employeeId)
      toast.success('Enrolled', `You are now enrolled in ${enrollment.trainingTitle}.`)
    },
    onError: (error) => toast.fromError('Could not enrol', error),
  })

  return (
    <Card
      title="Available courses"
      description="Enrol in a course to start tracking progress against it."
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
          {recommendations.data && recommendations.data.length > 0 && (
            <p className={styles.note} style={{ marginBottom: 'var(--s-3)' }}>
              {recommendations.data.length} of these were recommended for your current gaps.
            </p>
          )}
          {(catalog.data ?? []).map((course: Course) => (
            <div className={styles.courseRow} key={course.id}>
              <div className={styles.courseMeta}>
                <span className={styles.courseTitle}>{course.title}</span>
                <span className={styles.courseSub}>
                  {course.provider}
                  {course.skillName ? ` · ${course.skillName}` : ''}
                  {course.difficulty ? ` · ${course.difficulty}` : ''}
                  {course.durationHours ? ` · ${course.durationHours}h` : ''}
                </span>
              </div>
              <Button
                size="sm"
                loading={enroll.isPending && enroll.variables === course.id}
                onClick={() => enroll.mutate(course.id)}
              >
                Enrol
              </Button>
            </div>
          ))}
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
