import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { catalogApi } from '@/api/catalog'
import { queryKeys } from '@/api/queryKeys'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { StatusPill } from '@/components/ui/StatusPill'
import { Table, type Column } from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toast'
import type { LearningPath } from '@/types/api'
import styles from './Catalog.module.css'

/**
 * Every employee's learning path, across the organisation.
 *
 * A path with no courses is called out rather than shown as an empty row: it means somebody has
 * a gap the catalogue cannot close, which is a purchasing decision for whoever runs this screen
 * and the most actionable thing on it.
 */
export function LearningPathsPage() {
  const [search, setSearch] = useState('')
  const [onlyEmpty, setOnlyEmpty] = useState(false)
  const [viewing, setViewing] = useState<LearningPath | null>(null)

  const paths = useQuery({
    queryKey: queryKeys.catalog.learningPaths(),
    queryFn: ({ signal }) => catalogApi.learningPaths(signal),
  })

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (paths.data ?? []).filter((path) => {
      if (onlyEmpty && !isUncovered(path)) return false
      if (!term) return true
      return (
        (path.employeeName ?? '').toLowerCase().includes(term) ||
        (path.targetSkillName ?? '').toLowerCase().includes(term) ||
        path.title.toLowerCase().includes(term)
      )
    })
  }, [paths.data, search, onlyEmpty])

  const uncovered = (paths.data ?? []).filter(isUncovered).length

  const columns: Column<LearningPath>[] = [
    {
      key: 'employee',
      header: 'Employee',
      render: (path) => (
        <div className={styles.twoLine}>
          <span className={styles.primaryText}>{path.employeeName ?? 'Unassigned'}</span>
          <span className={styles.secondaryText}>{path.title}</span>
        </div>
      ),
    },
    {
      key: 'skill',
      header: 'Target skill',
      width: '150px',
      render: (path) => path.targetSkillName ?? <span className={styles.muted}>—</span>,
    },
    {
      key: 'courses',
      header: 'Courses',
      numeric: true,
      width: '110px',
      render: (path) =>
        isUncovered(path) ? (
          <span className={styles.warn} title="No course in the catalogue covers this skill">
            None
          </span>
        ) : (
          String(path.courses?.length ?? path.steps?.length ?? 0)
        ),
    },
    {
      key: 'progress',
      header: 'Progress',
      width: '150px',
      render: (path) => <ProgressBar percent={path.overallProgressPercent ?? 0} />,
    },
    {
      key: 'status',
      header: 'Status',
      width: '130px',
      render: (path) => (path.status ? <StatusPill value={path.status} /> : <span className={styles.muted}>—</span>),
    },
    {
      key: 'actions',
      header: '',
      width: '90px',
      render: (path) => (
        <Button size="sm" variant="ghost" onClick={() => setViewing(path)}>
          Open
        </Button>
      ),
    },
  ]

  return (
    <>
      <Card
        title="Learning paths"
        description={
          paths.data
            ? `${paths.data.length} paths across the organisation${
                uncovered > 0 ? `; ${uncovered} have no course to offer` : ''
              }.`
            : 'Every path generated for every employee.'
        }
        actions={
          <div className={styles.filters}>
            <input
              className={styles.input}
              type="search"
              value={search}
              placeholder="Employee or skill"
              aria-label="Search learning paths"
              onChange={(event) => setSearch(event.target.value)}
            />
            <label className={styles.checkboxField}>
              <input
                type="checkbox"
                checked={onlyEmpty}
                onChange={(event) => setOnlyEmpty(event.target.checked)}
              />
              <span>Only paths with no courses</span>
            </label>
          </div>
        }
        flush
      >
        <Table
          columns={columns}
          rows={rows}
          rowKey={(path) => path.id}
          isLoading={paths.isLoading}
          error={paths.error}
          onRetry={paths.refetch}
          caption="Learning paths across the organisation"
          emptyTitle={search || onlyEmpty ? 'No paths match' : 'No learning paths yet'}
          emptyMessage={
            search || onlyEmpty
              ? 'Clear the filters to see every path.'
              : 'Paths are generated from an employee’s gaps, so they appear once gap analysis has run.'
          }
        />
      </Card>

      {viewing && <PathDialog path={viewing} onClose={() => setViewing(null)} />}
    </>
  )
}

function PathDialog({ path, onClose }: { path: LearningPath; onClose: () => void }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [confirming, setConfirming] = useState(false)

  const remove = useMutation({
    mutationFn: () => catalogApi.removeLearningPath(path.id),
    onError: (error) => toast.fromError('The path could not be removed', error),
    onSuccess: () => {
      toast.success('Learning path removed', path.title)
      queryClient.invalidateQueries({ queryKey: queryKeys.catalog.learningPaths() })
      // It is the employee's path: their own learning screen must stop showing it.
      queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.all })
      onClose()
    },
  })

  return (
    <Modal
      open
      onClose={onClose}
      title={path.title}
      description={`${path.employeeName ?? 'Unassigned'}${
        path.targetSkillName ? ` · targeting ${path.targetSkillName}` : ''
      }`}
      size="lg"
      footer={
        <>
          <Button onClick={onClose}>Close</Button>
          {confirming ? (
            <Button variant="danger" loading={remove.isPending} onClick={() => remove.mutate()}>
              Yes, remove it
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setConfirming(true)}>
              Remove path
            </Button>
          )}
        </>
      }
    >
      <dl className={styles.stats}>
        <Stat label="Progress" value={`${path.overallProgressPercent ?? 0}%`} />
        <Stat label="Courses" value={String(path.courses?.length ?? path.steps?.length ?? 0)} />
        <Stat
          label="Estimated"
          value={path.totalEstimatedHours != null ? `${path.totalEstimatedHours}h` : '—'}
        />
        <Stat label="Status" value={path.status ?? '—'} />
      </dl>

      <h3 className={styles.subheading}>Courses on this path</h3>
      {isUncovered(path) ? (
        <p className={styles.dialogNote}>
          No course in the catalogue covers{' '}
          <strong>{path.targetSkillName ?? 'this skill'}</strong>, so this path has nothing to
          offer. Adding or importing a course that covers it will fill the path the next time it
          is generated.
        </p>
      ) : (
        <ul className={styles.pathList}>
          {path.courses?.map((course) => (
            <li className={styles.pathRow} key={course.id}>
              <span className={styles.primaryText}>{course.title}</span>
              <span className={styles.secondaryText}>
                {course.provider}
                {course.durationHours != null ? ` · ${course.durationHours}h` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}

      {confirming && (
        <p className={styles.dialogNote}>
          Removing the path takes it off {path.employeeName ?? 'the employee'}&rsquo;s own learning
          screen. Their enrolments and progress are separate records and are not affected.
        </p>
      )}
    </Modal>
  )
}

/**
 * Whether the catalogue has nothing to offer this path. The server answers this itself with
 * noCoursesAvailable, which is more reliable than counting a list it may not have sent.
 */
function isUncovered(path: LearningPath): boolean {
  return path.noCoursesAvailable || (path.courses?.length ?? 0) === 0
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className={styles.barCell}>
      <div className={styles.barTrack} role="img" aria-label={`${percent}% complete`}>
        <div className={styles.barFill} style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
      <span className={styles.barValue}>{percent}%</span>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={styles.statLabel}>{label}</dt>
      <dd className={styles.statValue}>
        <span className="tabular">{value}</span>
      </dd>
    </div>
  )
}
