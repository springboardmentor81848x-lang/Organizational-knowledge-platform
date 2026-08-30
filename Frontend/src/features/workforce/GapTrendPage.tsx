import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { hrApi } from '@/api/hr'
import { queryKeys } from '@/api/queryKeys'
import { Card } from '@/components/ui/Card'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { isPermissionDenied, PermissionDenied } from '@/components/ui/PermissionDenied'
import { Table, type Column } from '@/components/ui/Table'
import type { RiskSeverity } from '@/types/api'
import type { GapTrendPoint } from '@/types/hr'
import { TrendChart } from './TrendChart'
import styles from './Workforce.module.css'

/**
 * Where the numbers are heading.
 *
 * This is the one screen that could easily have been faked, so it is worth being explicit about
 * what it is. Every point drawn here is a row the backend recorded at the time — the weekly
 * snapshot job writes one, and the seeded history carries earlier ones. Nothing is projected,
 * extrapolated or smoothed, and no trend is ever drawn from a single snapshot: a scope with one
 * recorded point shows that point and says plainly that a trend needs a second one.
 *
 * Each recorded scope is its own series and they are never merged. An organisation-wide snapshot
 * and a department snapshot count different populations, and averaging them together or drawing
 * them as one line would produce a number that was never true of anybody.
 */

const SEVERITIES: { key: RiskSeverity; label: string; token: string }[] = [
  { key: 'CRITICAL', label: 'Critical', token: 'var(--c-critical)' },
  { key: 'HIGH', label: 'High', token: 'var(--c-high)' },
  { key: 'MEDIUM', label: 'Medium', token: 'var(--c-medium)' },
  { key: 'LOW', label: 'Low', token: 'var(--c-low)' },
]

function countOf(point: GapTrendPoint, severity: RiskSeverity): number {
  switch (severity) {
    case 'CRITICAL':
      return point.criticalGapsCount
    case 'HIGH':
      return point.highGapsCount
    case 'MEDIUM':
      return point.mediumGapsCount
    default:
      return point.lowGapsCount
  }
}

function scopeLabel(scope: string): string {
  return scope === 'ALL' ? 'Organisation-wide' : scope
}

export function GapTrendPage() {
  const [scope, setScope] = useState<string | null>(null)
  const [view, setView] = useState<'chart' | 'table'>('chart')

  const trends = useQuery({
    queryKey: queryKeys.hr.gapTrends(),
    queryFn: ({ signal }) => hrApi.gapTrends(undefined, signal),
  })

  /** One series per recorded scope, each sorted oldest first. */
  const seriesByScope = useMemo(() => {
    const grouped = new Map<string, GapTrendPoint[]>()
    for (const point of trends.data ?? []) {
      const bucket = grouped.get(point.department) ?? []
      bucket.push(point)
      grouped.set(point.department, bucket)
    }
    for (const bucket of grouped.values()) {
      bucket.sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate))
    }
    return grouped
  }, [trends.data])

  const scopes = useMemo(() => [...seriesByScope.keys()].sort(), [seriesByScope])
  // Default to whichever scope has the most history to show, preferring the organisation series.
  const selected =
    scope && seriesByScope.has(scope)
      ? scope
      : scopes.includes('ALL')
        ? 'ALL'
        : (scopes[0] ?? null)
  const series = selected ? (seriesByScope.get(selected) ?? []) : []

  if (trends.isLoading) {
    return (
      <Card flush>
        <LoadingBlock rows={6} label="Loading recorded gap history" />
      </Card>
    )
  }

  if (trends.isError) {
    return (
      <Card flush>
        {isPermissionDenied(trends.error) ? (
          <PermissionDenied />
        ) : (
          <ErrorBlock error={trends.error} onRetry={trends.refetch} />
        )}
      </Card>
    )
  }

  if (scopes.length === 0) {
    return (
      <Card flush>
        <EmptyBlock
          title="No gap history has been recorded yet"
          message="Snapshots are written by the weekly job that records the organisation's gap position. Until it has run at least once there is no history to plot, and nothing here is inferred from today's figures."
        />
      </Card>
    )
  }

  const columns: Column<GapTrendPoint>[] = [
    { key: 'date', header: 'Recorded', width: '140px', render: (row) => longDate(row.snapshotDate) },
    { key: 'total', header: 'Total gaps', numeric: true, render: (row) => String(row.totalGaps) },
    ...SEVERITIES.map<Column<GapTrendPoint>>((severity) => ({
      key: severity.key,
      header: severity.label,
      numeric: true,
      render: (row) => String(countOf(row, severity.key)),
    })),
    {
      key: 'avg',
      header: 'Average gap',
      numeric: true,
      render: (row) => row.avgGapScore.toFixed(2),
    },
  ]

  const first = series[0]
  const latest = series[series.length - 1]
  const maxCount = Math.max(
    1,
    ...series.flatMap((point) => SEVERITIES.map((severity) => countOf(point, severity.key))),
  )

  return (
    <>
      {/* One filter row above everything it scopes, rather than a control inside each card. */}
      <div className={styles.filterRow}>
        <label className={styles.inlineField}>
          <span className={styles.fieldLabel}>Recorded scope</span>
          <select
            className={styles.select}
            value={selected ?? ''}
            onChange={(event) => setScope(event.target.value)}
          >
            {scopes.map((name) => (
              <option key={name} value={name}>
                {scopeLabel(name)} ({seriesByScope.get(name)?.length ?? 0}{' '}
                {seriesByScope.get(name)?.length === 1 ? 'snapshot' : 'snapshots'})
              </option>
            ))}
          </select>
        </label>

        <div className={styles.viewToggle} role="group" aria-label="View as">
          <button
            type="button"
            className={[styles.toggleButton, view === 'chart' ? styles.toggleActive : ''].join(' ')}
            onClick={() => setView('chart')}
            aria-pressed={view === 'chart'}
          >
            Chart
          </button>
          <button
            type="button"
            className={[styles.toggleButton, view === 'table' ? styles.toggleActive : ''].join(' ')}
            onClick={() => setView('table')}
            aria-pressed={view === 'table'}
          >
            Table
          </button>
        </div>
      </div>

      {series.length < 2 ? (
        <Card
          title={`${scopeLabel(selected ?? '')} — one snapshot recorded`}
          description={`Recorded ${longDate(latest.snapshotDate)}.`}
        >
          <dl className={styles.stats}>
            <Figure label="Total gaps" value={String(latest.totalGaps)} />
            {SEVERITIES.map((severity) => (
              <Figure
                key={severity.key}
                label={severity.label}
                value={String(countOf(latest, severity.key))}
              />
            ))}
            <Figure label="Average gap" value={latest.avgGapScore.toFixed(2)} suffix="/ 4" />
          </dl>
          <p className={styles.footnote}>
            A trend needs at least two recorded points, and this scope has one. The figures above
            are that snapshot as it was recorded; no line is drawn through a single point, because
            any direction it appeared to take would have been invented here rather than measured.
          </p>
        </Card>
      ) : view === 'table' ? (
        <Card
          title={`${scopeLabel(selected ?? '')} — recorded history`}
          description={`${series.length} snapshots between ${longDate(first.snapshotDate)} and ${longDate(latest.snapshotDate)}.`}
          flush
        >
          <Table
            columns={columns}
            rows={series}
            rowKey={(row) => `${row.department}-${row.snapshotDate}`}
            caption="Recorded gap history"
          />
        </Card>
      ) : (
        <>
          <Card
            title={`${scopeLabel(selected ?? '')} — average gap over time`}
            description={`${series.length} snapshots between ${longDate(first.snapshotDate)} and ${longDate(latest.snapshotDate)}. Lower is better.`}
          >
            <MovementSummary first={first} latest={latest} />
            <TrendChart
              label="Average gap score, on the 0–4 proficiency scale"
              points={series.map((point) => ({ date: point.snapshotDate, value: point.avgGapScore }))}
              domain={[0, 4]}
              formatValue={(value) => value.toFixed(1)}
            />
          </Card>

          <Card
            title="Gaps by severity over time"
            description="One panel per severity, on a shared scale so the four stay comparable."
          >
            <div className={styles.smallMultiples}>
              {SEVERITIES.map((severity) => (
                <TrendChart
                  key={severity.key}
                  label={`${severity.label} gaps`}
                  color={severity.token}
                  domain={[0, maxCount]}
                  points={series.map((point) => ({
                    date: point.snapshotDate,
                    value: countOf(point, severity.key),
                  }))}
                  formatValue={(value) => String(Math.round(value))}
                />
              ))}
            </div>
          </Card>
        </>
      )}
    </>
  )
}

/** The one comparison worth stating in words: where it was, where it is, and by how much. */
function MovementSummary({ first, latest }: { first: GapTrendPoint; latest: GapTrendPoint }) {
  const change = Number((latest.avgGapScore - first.avgGapScore).toFixed(2))
  const direction = change < 0 ? 'narrowed' : change > 0 ? 'widened' : 'held steady'

  return (
    <p className={styles.summary}>
      The average gap has <strong>{direction}</strong> from{' '}
      <span className="tabular">{first.avgGapScore.toFixed(2)}</span> to{' '}
      <span className="tabular">{latest.avgGapScore.toFixed(2)}</span>
      {change !== 0 && (
        <>
          {' '}
          — a change of{' '}
          <span className={change < 0 ? styles.deltaUp : styles.deltaDown}>
            {change > 0 ? '+' : ''}
            {change.toFixed(2)}
          </span>
        </>
      )}{' '}
      across {longDate(first.snapshotDate)} to {longDate(latest.snapshotDate)}.
    </p>
  )
}

function Figure({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
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

function longDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
