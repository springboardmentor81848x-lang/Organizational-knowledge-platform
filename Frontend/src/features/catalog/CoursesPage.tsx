import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { catalogApi, type CourseRequest } from '@/api/catalog'
import { skillsApi } from '@/api/skills'
import { queryKeys } from '@/api/queryKeys'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { isPermissionDenied, PermissionDenied } from '@/components/ui/PermissionDenied'
import { Modal } from '@/components/ui/Modal'
import { Table, type Column } from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toast'
import type { Course } from '@/types/api'
import styles from './Catalog.module.css'

const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']

/**
 * The course catalogue.
 *
 * A course is not an isolated record: it covers a skill, and that is what puts it into an
 * employee's learning path when they have a gap in it. So the skill is a first-class field here
 * rather than an afterthought, and a course covering nothing is flagged — it can be enrolled in
 * but will never be recommended to anybody, and it can never have its effect measured.
 */
export function CoursesPage() {
  const [search, setSearch] = useState('')
  const [origin, setOrigin] = useState<'all' | 'internal' | 'external'>('all')
  const [editing, setEditing] = useState<Course | 'new' | null>(null)
  const [inspecting, setInspecting] = useState<Course | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Course | null>(null)

  const courses = useQuery({
    queryKey: queryKeys.catalog.courses(),
    queryFn: ({ signal }) => catalogApi.courses(signal),
  })

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (courses.data ?? []).filter((course) => {
      if (origin === 'internal' && !course.isInternal) return false
      if (origin === 'external' && course.isInternal) return false
      if (!term) return true
      return (
        course.title.toLowerCase().includes(term) ||
        (course.provider ?? '').toLowerCase().includes(term) ||
        (course.skillName ?? '').toLowerCase().includes(term)
      )
    })
  }, [courses.data, search, origin])

  const unmapped = (courses.data ?? []).filter((course) => !course.skillId).length

  const columns: Column<Course>[] = [
    {
      key: 'course',
      header: 'Course',
      render: (course) => (
        <div className={styles.twoLine}>
          <span className={styles.primaryText}>{course.title}</span>
          <span className={styles.secondaryText}>
            {course.provider ?? 'No provider'}
            {course.isInternal ? ' · internal' : ' · external'}
          </span>
        </div>
      ),
    },
    {
      key: 'skill',
      header: 'Covers',
      width: '160px',
      render: (course) =>
        course.skillName ? (
          course.skillName
        ) : (
          <span className={styles.warn} title="Never recommended, and its effect cannot be measured">
            No skill mapped
          </span>
        ),
    },
    {
      key: 'difficulty',
      header: 'Level',
      width: '130px',
      render: (course) =>
        course.difficulty ? (
          <span className={styles.secondaryText}>{course.difficulty}</span>
        ) : (
          <span className={styles.muted}>—</span>
        ),
    },
    {
      key: 'hours',
      header: 'Hours',
      numeric: true,
      width: '90px',
      render: (course) =>
        course.durationHours != null ? String(course.durationHours) : <span className={styles.muted}>—</span>,
    },
    {
      key: 'actions',
      header: '',
      width: '230px',
      render: (course) => (
        <div className={styles.rowActions}>
          <Button size="sm" variant="ghost" onClick={() => setInspecting(course)}>
            Participation
          </Button>
          <Button size="sm" onClick={() => setEditing(course)}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(course)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <Card
        title="Course catalogue"
        description={
          courses.data
            ? `${courses.data.length} courses${unmapped > 0 ? `, ${unmapped} covering no skill` : ''}.`
            : 'Everything the organisation can enrol somebody in.'
        }
        actions={
          <div className={styles.filters}>
            <input
              className={styles.input}
              type="search"
              value={search}
              placeholder="Title, provider or skill"
              aria-label="Search courses"
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className={styles.select}
              value={origin}
              aria-label="Filter by origin"
              onChange={(event) => setOrigin(event.target.value as typeof origin)}
            >
              <option value="all">All courses</option>
              <option value="internal">Internal only</option>
              <option value="external">External only</option>
            </select>
            <Button variant="primary" onClick={() => setEditing('new')}>
              New course
            </Button>
          </div>
        }
        flush
      >
        <Table
          columns={columns}
          rows={rows}
          rowKey={(course) => course.id}
          isLoading={courses.isLoading}
          error={courses.error}
          onRetry={courses.refetch}
          caption="Course catalogue"
          emptyTitle={search || origin !== 'all' ? 'No courses match' : 'No courses yet'}
          emptyMessage={
            search || origin !== 'all'
              ? 'Clear the search or the filter to see the whole catalogue.'
              : 'Add one here, or import a curated file on the Import tab.'
          }
        />
      </Card>

      {editing && (
        <CourseDialog
          course={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
      {inspecting && (
        <ParticipationDialog course={inspecting} onClose={() => setInspecting(null)} />
      )}
      {confirmDelete && (
        <DeleteDialog course={confirmDelete} onClose={() => setConfirmDelete(null)} />
      )}
    </>
  )
}

/** Creating or editing a course. Both go through the same form and the same invalidation. */
function CourseDialog({ course, onClose }: { course: Course | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [form, setForm] = useState<CourseRequest>({
    title: course?.title ?? '',
    description: course?.description ?? '',
    provider: course?.provider ?? '',
    skillId: course?.skillId ?? undefined,
    difficulty: course?.difficulty ?? '',
    durationHours: course?.durationHours ?? undefined,
    isInternal: course?.isInternal ?? true,
    externalUrl: course?.externalUrl ?? '',
  })

  const skills = useQuery({
    queryKey: queryKeys.skills.catalog(),
    queryFn: ({ signal }) => skillsApi.list(signal),
  })

  const save = useMutation({
    mutationFn: () =>
      course ? catalogApi.updateCourse(course.id, form) : catalogApi.createCourse(form),
    onError: (error) => toast.fromError('The course could not be saved', error),
    onSuccess: (saved) => {
      toast.success(course ? 'Course updated' : 'Course created', saved.title)
      // A course covers a skill, so the catalogue is not the only thing that changes: it can
      // now appear in anybody's recommendations and learning paths.
      queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations.all })
      onClose()
    },
  })

  const set = <K extends keyof CourseRequest>(key: K, value: CourseRequest[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const valid = form.title.trim().length > 0 && form.provider.trim().length > 0

  return (
    <Modal
      open
      onClose={onClose}
      title={course ? course.title : 'New course'}
      description={course ? 'Editing an existing course.' : 'Adding a course to the catalogue.'}
      size="lg"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            loading={save.isPending}
            disabled={!valid}
            onClick={() => save.mutate()}
          >
            {course ? 'Save changes' : 'Create course'}
          </Button>
        </>
      }
    >
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Title</span>
          <input
            className={styles.input}
            value={form.title}
            onChange={(event) => set('title', event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Provider</span>
          <input
            className={styles.input}
            value={form.provider}
            placeholder="Internal Academy, Coursera, Infosys Springboard…"
            onChange={(event) => set('provider', event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Skill covered</span>
          <select
            className={styles.select}
            value={form.skillId ?? ''}
            onChange={(event) =>
              set('skillId', event.target.value ? Number(event.target.value) : undefined)
            }
          >
            <option value="">No skill — will never be recommended</option>
            {(skills.data ?? []).map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
          <span className={styles.fieldHint}>
            The skill decides whose gap this course closes, so it is what puts the course into
            someone&rsquo;s learning path.
          </span>
        </label>

        <div className={styles.fieldRow}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Level</span>
            <select
              className={styles.select}
              value={form.difficulty ?? ''}
              onChange={(event) => set('difficulty', event.target.value)}
            >
              <option value="">Unspecified</option>
              {DIFFICULTIES.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Duration (hours)</span>
            <input
              className={styles.input}
              type="number"
              min="0"
              step="0.5"
              value={form.durationHours ?? ''}
              onChange={(event) =>
                set('durationHours', event.target.value ? Number(event.target.value) : undefined)
              }
            />
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Description</span>
          <textarea
            className={styles.textarea}
            rows={3}
            value={form.description ?? ''}
            onChange={(event) => set('description', event.target.value)}
          />
        </label>

        <label className={styles.checkboxField}>
          <input
            type="checkbox"
            checked={form.isInternal ?? true}
            onChange={(event) => set('isInternal', event.target.checked)}
          />
          <span>Internal course, delivered by the organisation</span>
        </label>

        {!form.isInternal && (
          <label className={styles.field}>
            <span className={styles.fieldLabel}>External link</span>
            <input
              className={styles.input}
              value={form.externalUrl ?? ''}
              placeholder="https://…"
              onChange={(event) => set('externalUrl', event.target.value)}
            />
          </label>
        )}
      </div>
    </Modal>
  )
}

/** Who is on a course and how it is going. Every figure is queried when the dialog opens. */
function ParticipationDialog({ course, onClose }: { course: Course; onClose: () => void }) {
  const participation = useQuery({
    queryKey: queryKeys.catalog.participation(course.id),
    queryFn: ({ signal }) => catalogApi.participation(course.id, signal),
  })

  return (
    <Modal
      open
      onClose={onClose}
      title={course.title}
      description={`${course.provider ?? 'No provider'} · ${course.skillName ?? 'no skill mapped'}`}
      footer={<Button onClick={onClose}>Close</Button>}
    >
      {participation.isLoading ? (
        <LoadingBlock rows={3} label="Loading participation" />
      ) : participation.isError ? (
        isPermissionDenied(participation.error) ? (
          <PermissionDenied />
        ) : (
          <ErrorBlock error={participation.error} onRetry={participation.refetch} />
        )
      ) : participation.data ? (
        <>
          <dl className={styles.stats}>
            <Stat label="Enrolled" value={String(participation.data.totalEnrolled)} />
            <Stat label="In progress" value={String(participation.data.activeInProgress)} />
            <Stat label="Finished" value={String(participation.data.completedCount)} />
            <Stat
              label="Completion"
              value={String(participation.data.completionRatePercent)}
              suffix="%"
            />
          </dl>

          <div className={styles.measureRow}>
            <span className={styles.fieldLabel}>Average time to complete</span>
            {participation.data.avgDaysToComplete === null ? (
              <span className={styles.muted}>
                {participation.data.completedCount === 0
                  ? 'Nobody has finished it yet'
                  : 'No finished enrolment recorded both a start and an end date'}
              </span>
            ) : (
              <span className={styles.measureValue}>
                <span className="tabular">{participation.data.avgDaysToComplete}</span> days
                <span className={styles.secondaryText}>
                  {' '}
                  from {participation.data.measuredCompletions}{' '}
                  {participation.data.measuredCompletions === 1 ? 'completion' : 'completions'}
                </span>
              </span>
            )}
          </div>

          {participation.data.totalEnrolled === 0 && (
            <EmptyBlock
              title="Nobody is enrolled"
              message="Figures appear here once somebody takes the course."
            />
          )}
        </>
      ) : null}
    </Modal>
  )
}

function DeleteDialog({ course, onClose }: { course: Course; onClose: () => void }) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const remove = useMutation({
    mutationFn: () => catalogApi.removeCourse(course.id),
    onError: (error) => toast.fromError('The course could not be deleted', error),
    onSuccess: () => {
      toast.success('Course deleted', course.title)
      queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations.all })
      onClose()
    },
  })

  return (
    <Modal
      open
      onClose={onClose}
      title="Delete this course?"
      description={course.title}
      size="sm"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="danger" loading={remove.isPending} onClick={() => remove.mutate()}>
            Delete course
          </Button>
        </>
      }
    >
      <p className={styles.dialogNote}>
        The course leaves the catalogue and stops being recommended. Anybody already enrolled keeps
        their enrolment, so their record of having taken it survives.
      </p>
    </Modal>
  )
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div>
      <dt className={styles.statLabel}>{label}</dt>
      <dd className={styles.statValue}>
        <span className="tabular">{value}</span>
        {suffix && <span className={styles.statSuffix}>{suffix}</span>}
      </dd>
    </div>
  )
}
