import { useQuery } from '@tanstack/react-query'
import { assessmentsApi } from '@/api/assessments'
import { enrollmentsApi } from '@/api/enrollments'
import { gapAnalysisApi } from '@/api/gapAnalysis'
import { skillsApi } from '@/api/skills'
import { queryKeys } from '@/api/queryKeys'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { isPermissionDenied, PermissionDenied } from '@/components/ui/PermissionDenied'
import { ProficiencyScale, proficiencyLabel } from '@/components/ui/ProficiencyScale'
import { StatusPill } from '@/components/ui/StatusPill'
import type { TeamMemberSummary } from '@/types/analytics'
import type { Scope } from './TeamDashboardPage'
import { formatDate } from './TeamDashboardPage'
import styles from './TeamDashboardPage.module.css'

/**
 * One person, in full: what they hold, what they are short of, what they are taking and what has
 * been assessed.
 *
 * Each section is its own query against the endpoint that owns that data, rather than a summary
 * assembled server-side. A manager looking at somebody is looking at the same records the
 * employee sees on their own screens, so the two cannot disagree.
 */
export function MemberDrilldown({
  member,
  scope,
  onClose,
  onAssign,
}: {
  member: TeamMemberSummary
  scope: Scope
  onClose: () => void
  onAssign: () => void
}) {
  const skills = useQuery({
    queryKey: queryKeys.skills.forUser(member.id),
    queryFn: ({ signal }) => skillsApi.forUser(member.id, signal),
  })

  const gaps = useQuery({
    queryKey: queryKeys.gaps.forUser(member.id),
    queryFn: ({ signal }) => gapAnalysisApi.storedForUser(member.id, signal),
  })

  const enrollments = useQuery({
    queryKey: queryKeys.enrollments.forUser(member.id),
    queryFn: ({ signal }) => enrollmentsApi.list(member.id, signal),
  })

  const assessments = useQuery({
    queryKey: queryKeys.assessments.forEmployee(member.id),
    queryFn: ({ signal }) => assessmentsApi.list(member.id, signal),
  })

  return (
    <Modal
      open
      onClose={onClose}
      title={member.fullName}
      description={`${member.jobTitle ?? 'Employee'}${
        member.department ? ` · ${member.department}` : ''
      } · ${scope === 'manager' ? 'direct report' : 'department member'}`}
      size="lg"
      footer={
        <>
          <Button onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={onAssign}>
            Assign training or a mentor
          </Button>
        </>
      }
    >
      <Section title="Skills" query={skills} emptyTitle="No skills on record">
        {(rows) => (
          <ul className={styles.drillList}>
            {rows.map((skill) => (
              <li className={styles.drillRow} key={skill.id}>
                <span className={styles.drillName}>{skill.skillName}</span>
                <ProficiencyScale level={skill.proficiencyLevel} compact />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Gaps" query={gaps} emptyTitle="No gap analysis recorded">
        {(rows) => (
          <ul className={styles.drillList}>
            {[...rows]
              .sort((a, b) => b.gapScore - a.gapScore)
              .map((gap) => (
                <li className={styles.drillRow} key={gap.id}>
                  <span className={styles.drillName}>{gap.skillName}</span>
                  <span className={styles.drillMeta}>
                    {gap.isMissingSkill ? 'Not on record' : gap.currentProficiency} →{' '}
                    {gap.targetProficiency}
                  </span>
                  <StatusPill value={gap.riskSeverity} />
                </li>
              ))}
          </ul>
        )}
      </Section>

      <Section title="Training" query={enrollments} emptyTitle="Not enrolled in anything">
        {(rows) => (
          <ul className={styles.drillList}>
            {rows.map((enrollment) => (
              <li className={styles.drillRow} key={enrollment.enrollmentId}>
                <span className={styles.drillName}>{enrollment.trainingTitle}</span>
                <span className={styles.drillMeta}>{enrollment.progress}%</span>
                <StatusPill value={enrollment.status} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Assessment history" query={assessments} emptyTitle="Never assessed">
        {(rows) => (
          <ul className={styles.drillList}>
            {rows.map((assessment) => (
              <li className={styles.drillRow} key={assessment.assessmentId}>
                <span className={styles.drillName}>
                  {assessment.results
                    .map((r) => `${r.skillName}${r.proficiency ? ` → ${proficiencyLabel(r.proficiency)}` : ''}`)
                    .join(', ') || 'No results'}
                </span>
                <span className={styles.drillMeta}>
                  {assessment.assessmentType} · {formatDate(assessment.date)}
                </span>
                <StatusPill value={assessment.status} />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </Modal>
  )
}

/** Each section carries its own async states, so one failing does not blank the others. */
function Section<T>({
  title,
  query,
  emptyTitle,
  children,
}: {
  title: string
  query: { data?: T[]; isLoading: boolean; error: unknown; refetch: () => void }
  emptyTitle: string
  children: (rows: T[]) => React.ReactNode
}) {
  return (
    <section className={styles.drillSection}>
      <h3 className={styles.drillTitle}>{title}</h3>
      {query.isLoading ? (
        <LoadingBlock rows={2} label={`Loading ${title.toLowerCase()}`} />
      ) : query.error ? (
        isPermissionDenied(query.error) ? (
          <PermissionDenied />
        ) : (
          <ErrorBlock error={query.error} onRetry={query.refetch} />
        )
      ) : !query.data || query.data.length === 0 ? (
        <EmptyBlock title={emptyTitle} />
      ) : (
        children(query.data)
      )}
    </section>
  )
}
