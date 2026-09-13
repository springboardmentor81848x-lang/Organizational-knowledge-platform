import { useQuery } from '@tanstack/react-query'
import { hrApi } from '@/api/hr'
import { queryKeys } from '@/api/queryKeys'
import { Card } from '@/components/ui/Card'
import { Table, type Column } from '@/components/ui/Table'
import type { TrainingEffectivenessRow } from '@/types/hr'
import styles from './Workforce.module.css'

/**
 * Whether training is working.
 *
 * Two different things are reported and never conflated. Completion is how many people finished
 * a course. Improvement is how far the levels of those who finished it actually moved, measured
 * from assessments taken after they finished — the only evidence in the system that proficiency
 * changed, since finishing a course never moves proficiency by itself.
 *
 * A course with no measured pairs says so in words. It does not show a zero: "nobody has been
 * reassessed since finishing this" and "this course achieved nothing" are opposite findings and
 * a zero would make them identical.
 */
export function TrainingEffectivenessPage() {
  const effectiveness = useQuery({
    queryKey: queryKeys.hr.trainingEffectiveness(),
    queryFn: ({ signal }) => hrApi.trainingEffectiveness(signal),
  })

  const rows = effectiveness.data ?? []
  const measured = rows.filter((row) => row.measuredCount > 0)

  const columns: Column<TrainingEffectivenessRow>[] = [
    {
      key: 'course',
      header: 'Course',
      render: (row) => (
        <div className={styles.twoLine}>
          <span className={styles.primaryText}>{row.courseTitle}</span>
          <span className={styles.secondaryText}>
            {row.provider ?? 'No provider'}
            {row.skillName ? ` · ${row.skillName}` : ' · not mapped to a skill'}
          </span>
        </div>
      ),
    },
    {
      key: 'enrolled',
      header: 'Enrolled',
      numeric: true,
      width: '90px',
      render: (row) => String(row.enrolledCount),
    },
    {
      key: 'completed',
      header: 'Finished',
      numeric: true,
      width: '90px',
      render: (row) => String(row.completedCount),
    },
    {
      key: 'rate',
      header: 'Completion',
      width: '150px',
      render: (row) => <CompletionBar percent={row.completionRatePercent} enrolled={row.enrolledCount} />,
    },
    {
      key: 'movement',
      header: 'Level before → after',
      width: '210px',
      render: (row) =>
        row.measuredCount === 0 || row.avgPreCourseSkillLevel === null ? (
          <span className={styles.muted}>{unmeasuredReason(row)}</span>
        ) : (
          <span className={styles.movement}>
            <span className="tabular">{row.avgPreCourseSkillLevel.toFixed(2)}</span>
            <span aria-hidden="true" className={styles.arrow}>
              →
            </span>
            <span className="tabular">{row.avgPostCourseSkillLevel?.toFixed(2)}</span>
            <span className={styles.secondaryText}>
              from {row.measuredCount} {row.measuredCount === 1 ? 'learner' : 'learners'}
            </span>
          </span>
        ),
    },
    {
      key: 'improvement',
      header: 'Improvement',
      numeric: true,
      width: '120px',
      render: (row) =>
        row.avgSkillImprovement === null ? (
          <span className={styles.muted}>—</span>
        ) : (
          <span
            className={[
              styles.delta,
              row.avgSkillImprovement > 0 ? styles.deltaUp : styles.deltaFlat,
            ].join(' ')}
          >
            {row.avgSkillImprovement > 0 ? '+' : ''}
            {row.avgSkillImprovement.toFixed(2)}
          </span>
        ),
    },
  ]

  return (
    <Card
      title="Training effectiveness"
      description={
        effectiveness.data
          ? `${rows.length} ${rows.length === 1 ? 'course' : 'courses'} in the catalogue; ${measured.length} ${
              measured.length === 1 ? 'has' : 'have'
            } a measured before-and-after.`
          : 'Completion rates, and the skill movement that followed.'
      }
      flush
    >
      <Table
        columns={columns}
        rows={rows}
        rowKey={(row) => row.courseId}
        isLoading={effectiveness.isLoading}
        error={effectiveness.error}
        onRetry={effectiveness.refetch}
        caption="Training effectiveness by course"
        emptyTitle="No courses in the catalogue"
        emptyMessage="Courses appear here once the learning catalogue has any."
      />
      <p className={styles.footnote}>
        Improvement is measured from the earliest assessment of the course&rsquo;s own skill taken
        after a learner completed it, against the level they held going into that assessment.
        Finishing a course does not move proficiency on its own — only an assessment does — so a
        high completion rate with nothing in this column means the training has not yet been
        tested, not that it failed.
      </p>
    </Card>
  )
}

/** Says which of the two reasons a course has no measurement, rather than leaving it blank. */
function unmeasuredReason(row: TrainingEffectivenessRow): string {
  if (!row.skillName) return 'Not mapped to a skill'
  if (row.completedCount === 0) return 'Nobody has finished it'
  return 'No assessment since finishing'
}

function CompletionBar({ percent, enrolled }: { percent: number; enrolled: number }) {
  if (enrolled === 0) {
    return <span className={styles.muted}>No enrolments</span>
  }
  return (
    <div className={styles.barCell}>
      <div
        className={styles.barTrack}
        role="img"
        aria-label={`${percent}% completion across ${enrolled} enrolments`}
      >
        <div className={styles.barFill} style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
      <span className={styles.barValue}>{percent}%</span>
    </div>
  )
}
