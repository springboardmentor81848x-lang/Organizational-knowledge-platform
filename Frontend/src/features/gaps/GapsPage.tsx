import { useQuery } from '@tanstack/react-query'
import { gapAnalysisApi } from '@/api/gapAnalysis'
import { queryKeys } from '@/api/queryKeys'
import { Card } from '@/components/ui/Card'
import { StatusPill } from '@/components/ui/StatusPill'
import { Table, type Column } from '@/components/ui/Table'
import type { GapAnalysis, RiskSeverity } from '@/types/api'
import { useSession } from '@/features/auth/useSession'
import { PersonalGapHeatmap } from './PersonalGapHeatmap'
import styles from './GapsPage.module.css'

const SEVERITY_ORDER: Record<RiskSeverity, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

/**
 * The employee's gaps against what their role requires.
 *
 * Read from the stored analysis rather than the recalculating endpoint: opening a page should
 * not rewrite rows and regenerate recommendations as a side effect. The stored rows are kept
 * current by the assessment cascade, so they are already what the last submission produced.
 *
 * Severity colour comes from the shared token scale, the same one the dashboards, heatmap and
 * reports use, so a critical gap looks identical wherever it appears.
 */
export function GapsPage() {
  const { user } = useSession()
  const employeeId = user?.id

  const query = useQuery({
    queryKey: queryKeys.gaps.forUser(employeeId!),
    queryFn: ({ signal }) => gapAnalysisApi.storedForUser(employeeId!, signal),
    enabled: Boolean(employeeId),
  })

  const summary = useQuery({
    queryKey: queryKeys.gaps.summary(employeeId!),
    queryFn: ({ signal }) => gapAnalysisApi.summaryForUser(employeeId!, signal),
    enabled: Boolean(employeeId),
  })

  // The heatmap is a separate call so it can fail or lag without taking the gap table with it.
  // Both are built from the same stored gap rows, so they cannot disagree.
  const heatmap = useQuery({
    queryKey: queryKeys.gaps.heatmap(employeeId!),
    queryFn: ({ signal }) => gapAnalysisApi.heatmapForUser(employeeId!, signal),
    enabled: Boolean(employeeId),
  })

  // Worst first: a list sorted by name buries the thing that matters under the alphabet.
  const rows = query.data
    ? [...query.data].sort(
        (a, b) =>
          SEVERITY_ORDER[a.riskSeverity] - SEVERITY_ORDER[b.riskSeverity] ||
          b.gapScore - a.gapScore,
      )
    : undefined

  const columns: Column<GapAnalysis>[] = [
    {
      key: 'skill',
      header: 'Skill',
      render: (row) => (
        <div className={styles.skillCell}>
          <span className={styles.skillName}>{row.skillName}</span>
          {row.skillCategory && <span className={styles.category}>{row.skillCategory}</span>}
        </div>
      ),
    },
    {
      key: 'required',
      header: 'Required',
      width: '130px',
      render: (row) => <span className={styles.level}>{row.targetProficiency}</span>,
    },
    {
      key: 'current',
      header: 'You hold',
      width: '150px',
      render: (row) =>
        row.isMissingSkill ? (
          <span className={styles.missing}>Not on record</span>
        ) : (
          <span className={styles.level}>{row.currentProficiency}</span>
        ),
    },
    {
      key: 'gap',
      header: 'Gap',
      numeric: true,
      width: '90px',
      render: (row) => <span>{row.gapScore}</span>,
    },
    {
      key: 'severity',
      header: 'Severity',
      width: '120px',
      render: (row) => <StatusPill value={row.riskSeverity} />,
    },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>My knowledge gaps</h1>
        <p className={styles.subtitle}>
          The distance between what your target role requires and what you hold. Every figure
          below is recalculated from your latest assessment — nothing here is fixed.
          {user?.targetJobTitle ? ` Measured against ${user.targetJobTitle}.` : ''}
        </p>
      </header>

      {summary.data && (
        <Card>
          <div className={styles.summary}>
            <div className={styles.readiness}>
              <span className={styles.readinessValue}>
                {summary.data.overallReadinessPercentage}%
              </span>
              <span className={styles.readinessLabel}>
                ready for {summary.data.jobTitle ?? 'your role'}
              </span>
            </div>
            <dl className={styles.breakdown}>
              <Figure label="Skills required" value={summary.data.totalRequiredSkills} />
              <Figure label="Met" value={summary.data.metSkillsCount} />
              <Figure label="Below level" value={summary.data.proficiencyGapsCount} />
              <Figure label="Not on record" value={summary.data.missingSkillsCount} />
            </dl>
          </div>
        </Card>
      )}

      {heatmap.data && heatmap.data.matrix.length > 0 && (
        <Card>
          <h2 className={styles.sectionTitle}>Gap heatmap</h2>
          <p className={styles.sectionSub}>
            One tile per skill your target role is measured on, shaded by how far short you fall.
            Built from the same assessment result as the table below.
          </p>
          <PersonalGapHeatmap matrix={heatmap.data} />
        </Card>
      )}

      <Card flush>
        <Table
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          isLoading={query.isLoading}
          error={query.error}
          onRetry={query.refetch}
          caption="Your skill gaps, most severe first"
          emptyTitle="No gaps recorded"
          emptyMessage="Either your role has no competency profile yet, or you meet every requirement of it."
        />
      </Card>
    </div>
  )
}

function Figure({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.figure}>
      <dt className={styles.figureLabel}>{label}</dt>
      <dd className={`${styles.figureValue} tabular`}>{value}</dd>
    </div>
  )
}
