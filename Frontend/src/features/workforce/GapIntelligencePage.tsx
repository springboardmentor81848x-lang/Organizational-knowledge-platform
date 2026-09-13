import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/api/analytics'
import { hrApi } from '@/api/hr'
import { queryKeys } from '@/api/queryKeys'
import { Card } from '@/components/ui/Card'
import { ErrorBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { isPermissionDenied, PermissionDenied } from '@/components/ui/PermissionDenied'
import { StatusPill } from '@/components/ui/StatusPill'
import { Table, type Column } from '@/components/ui/Table'
import { SkillGapHeatmap } from '@/features/team/SkillGapHeatmap'
import type { SkillGapReportRow } from '@/types/analytics'
import styles from './Workforce.module.css'

/**
 * Where the organisation is exposed.
 *
 * The heatmap is the same component a manager sees for their reports, over the same severity
 * colours, differing only in who is in it — which is the point: the org view is not a manager's
 * view relabelled, it is the same instrument pointed at everybody. Scope comes from the endpoint
 * behind it, /api/hr/gap-matrix, which admits only the roles whose remit is the organisation.
 *
 * The department control narrows a view the reader already holds. It is not how they obtained
 * it: a manager sending the same request is refused outright, not handed their own team.
 */
export function GapIntelligencePage() {
  const [department, setDepartment] = useState('')

  const matrix = useQuery({
    queryKey: queryKeys.hr.gapMatrix(department || undefined),
    queryFn: ({ signal }) => hrApi.gapMatrix(department || undefined, signal),
  })

  const organization = useQuery({
    queryKey: queryKeys.analytics.organization(),
    queryFn: ({ signal }) => analyticsApi.organization(signal),
  })

  const skillGaps = useQuery({
    queryKey: queryKeys.analytics.skillGaps(),
    queryFn: ({ signal }) => analyticsApi.skillGaps(signal),
  })

  /** Departments are a property of a person, so the list comes from the people in the matrix. */
  const departments = useMemo(() => {
    const seen = new Set<string>()
    for (const person of matrix.data?.users ?? []) {
      if (person.department) seen.add(person.department)
    }
    for (const name of Object.keys(organization.data?.gapIntelligence.departmentAverageGaps ?? {})) {
      seen.add(name)
    }
    return [...seen].sort()
  }, [matrix.data, organization.data])

  const gapColumns: Column<SkillGapReportRow>[] = [
    {
      key: 'skill',
      header: 'Skill',
      render: (row) => (
        <div className={styles.twoLine}>
          <span className={styles.primaryText}>{row.skillName}</span>
          {row.category && <span className={styles.secondaryText}>{row.category}</span>}
        </div>
      ),
    },
    {
      key: 'required',
      header: 'Required',
      width: '130px',
      render: (row) => <span className={styles.secondaryText}>{row.requiredLevel}</span>,
    },
    {
      key: 'held',
      header: 'Average held',
      width: '150px',
      render: (row) => (
        <span className={styles.secondaryText}>
          {row.currentAverageLevel} <span className="tabular">({row.currentAverageScore})</span>
        </span>
      ),
    },
    {
      key: 'gap',
      header: 'Avg gap',
      numeric: true,
      width: '90px',
      render: (row) => String(row.averageGapScore),
    },
    {
      key: 'people',
      header: 'People affected',
      numeric: true,
      width: '130px',
      render: (row) => String(row.affectedEmployees),
    },
    {
      key: 'where',
      header: 'Concentrated in',
      render: (row) =>
        row.departmentBreakdown.length === 0 ? (
          <span className={styles.muted}>—</span>
        ) : (
          <span className={styles.secondaryText}>
            {[...row.departmentBreakdown]
              .sort((a, b) => b.affectedEmployees - a.affectedEmployees)
              .slice(0, 3)
              .map((entry) => `${entry.department} (${entry.affectedEmployees})`)
              .join(', ')}
          </span>
        ),
    },
    {
      key: 'severity',
      header: 'Severity',
      width: '110px',
      render: (row) => <StatusPill value={row.severity} />,
    },
  ]

  return (
    <>
      <ExposureStrip query={organization} />

      <Card
        title="Organisation skill gap heatmap"
        description={
          department
            ? `Everyone in ${department}, against every analysed skill.`
            : 'Everyone in the organisation, against every analysed skill.'
        }
        actions={
          <label className={styles.inlineField}>
            <span className={styles.fieldLabel}>Narrow to</span>
            <select
              className={styles.select}
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
            >
              <option value="">Whole organisation</option>
              {departments.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        }
        flush={matrix.isLoading || Boolean(matrix.error)}
      >
        {matrix.isLoading ? (
          <LoadingBlock rows={6} label="Loading the organisation heatmap" />
        ) : matrix.isError ? (
          isPermissionDenied(matrix.error) ? (
            <PermissionDenied />
          ) : (
            <ErrorBlock error={matrix.error} onRetry={matrix.refetch} />
          )
        ) : matrix.data ? (
          <>
            <p className={styles.scopeNote}>
              Showing <strong>{matrix.data.users.length}</strong>{' '}
              {matrix.data.users.length === 1 ? 'person' : 'people'} across{' '}
              <strong>{matrix.data.skills.length}</strong>{' '}
              {matrix.data.skills.length === 1 ? 'skill' : 'skills'} — scope{' '}
              <code className={styles.code}>{matrix.data.scope}</code>, {matrix.data.scopeName}.
            </p>
            <SkillGapHeatmap matrix={matrix.data} />
          </>
        ) : null}
      </Card>

      <Card
        title="Skill shortfall across the organisation"
        description="Every skill with a role requirement, and how far the workforce sits from it."
        flush
      >
        <Table
          columns={gapColumns}
          rows={skillGaps.data}
          rowKey={(row) => row.skillId}
          isLoading={skillGaps.isLoading}
          error={skillGaps.error}
          onRetry={skillGaps.refetch}
          caption="Organisation-wide skill gaps"
          emptyTitle="No skill gaps recorded"
          emptyMessage="Gaps are written when an assessment is submitted or analysis is run for someone."
        />
      </Card>
    </>
  )
}

/** The four figures read first: how big the exposure is and how much of it is serious. */
function ExposureStrip({
  query,
}: {
  query: ReturnType<typeof useQuery<import('@/types/analytics').OrganizationAnalytics>>
}) {
  if (query.isLoading) {
    return (
      <Card flush>
        <LoadingBlock rows={2} label="Loading organisation figures" />
      </Card>
    )
  }
  if (query.isError) {
    return (
      <Card flush>
        {isPermissionDenied(query.error) ? (
          <PermissionDenied />
        ) : (
          <ErrorBlock error={query.error} onRetry={query.refetch} />
        )}
      </Card>
    )
  }
  if (!query.data) return null

  const org = query.data
  const risk = org.gapIntelligence.riskDistribution

  return (
    <Card title="Organisation at a glance" description="Live figures, queried on each request.">
      <dl className={styles.stats}>
        <Stat label="People" value={org.totalEmployees} />
        <Stat label="Analysed gaps" value={org.gapIntelligence.totalAnalyzedGaps} />
        <Stat label="Average gap" value={org.gapIntelligence.overallAverageGapScore} suffix="/ 4" />
        <Stat
          label="Role readiness"
          value={org.gapIntelligence.overallReadinessPercentage}
          suffix="%"
        />
        <Stat label="Critical" value={risk.CRITICAL ?? 0} tone="critical" />
        <Stat label="High" value={risk.HIGH ?? 0} tone="high" />
        <Stat label="Training completion" value={org.trainingCompletionRatePercent} suffix="%" />
        <Stat label="Mean improvement" value={org.averageSkillImprovement} suffix="levels" />
      </dl>
    </Card>
  )
}

function Stat({
  label,
  value,
  suffix,
  tone,
}: {
  label: string
  value: number
  suffix?: string
  tone?: 'critical' | 'high'
}) {
  return (
    <div>
      <dt className={styles.statLabel}>{label}</dt>
      <dd className={[styles.statValue, tone ? styles[tone] : ''].filter(Boolean).join(' ')}>
        <span className="tabular">{value}</span>
        {suffix && <span className={styles.statSuffix}>{suffix}</span>}
      </dd>
    </div>
  )
}
