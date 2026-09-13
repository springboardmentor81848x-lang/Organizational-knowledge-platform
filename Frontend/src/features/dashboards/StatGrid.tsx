import styles from './RoleDashboard.module.css'

export interface Stat {
  label: string
  /** Always a real figure from the API; there is no placeholder path into this component. */
  value: number
  suffix?: string
}

/** Renders figures at a size worth reading, with tabular digits so a row lines up. */
export function StatGrid({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) {
    return <p className={styles.note}>No figures were returned for this view.</p>
  }

  return (
    <dl className={styles.statGrid}>
      {stats.map((stat) => (
        <div className={styles.stat} key={stat.label}>
          <dt className={styles.statLabel}>{stat.label}</dt>
          <dd className={styles.statValue}>
            <span className="tabular">{formatValue(stat.value)}</span>
            {stat.suffix && <span className={styles.statSuffix}>{stat.suffix}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** Trims a trailing .0 so whole numbers read as whole numbers. */
function formatValue(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100)
}
