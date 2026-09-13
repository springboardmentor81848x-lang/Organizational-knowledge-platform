import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/api/admin'
import { queryKeys } from '@/api/queryKeys'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ErrorBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { isPermissionDenied, PermissionDenied } from '@/components/ui/PermissionDenied'
import styles from './Admin.module.css'

/**
 * Whether the service is up, and how much of it is in use.
 *
 * The panel refetches on an interval rather than pretending to be live, and it says when it last
 * heard back. If the server stops answering, the error state shows — the figures are never held
 * on screen as though they were still current, which for a health panel would be the one
 * failure that matters.
 */

const REFRESH_MS = 30_000

export function SystemHealthPage() {
  const health = useQuery({
    queryKey: queryKeys.admin.health(),
    queryFn: ({ signal }) => adminApi.systemHealth(signal),
    refetchInterval: REFRESH_MS,
    refetchIntervalInBackground: false,
  })

  if (health.isLoading) {
    return (
      <Card flush>
        <LoadingBlock rows={3} label="Checking the service" />
      </Card>
    )
  }

  if (health.isError) {
    return (
      <Card title="The service did not answer" flush>
        {isPermissionDenied(health.error) ? (
          <PermissionDenied />
        ) : (
          <ErrorBlock error={health.error} onRetry={health.refetch} />
        )}
      </Card>
    )
  }

  const data = health.data
  if (!data) return null

  const up = data.status?.toUpperCase() === 'UP'
  const inactive = data.totalUserCount - data.activeUserCount

  return (
    <>
      <Card
        title="Service status"
        description={`Checked every ${REFRESH_MS / 1000} seconds. Last answer ${formatTime(
          data.timestamp,
        )}.`}
        actions={
          <Button onClick={() => health.refetch()} loading={health.isFetching}>
            Check now
          </Button>
        }
      >
        <div className={styles.healthRow}>
          <span className={[styles.healthLamp, up ? styles.lampUp : styles.lampDown].join(' ')} aria-hidden="true" />
          <div>
            <p className={styles.healthStatus}>{up ? 'Up' : data.status}</p>
            <p className={styles.secondaryText}>{data.databaseStatus}</p>
          </div>
        </div>
      </Card>

      <Card title="Accounts" description="Counted live from the account table on each check.">
        <dl className={styles.stats}>
          <Stat label="Total accounts" value={data.totalUserCount} />
          <Stat label="Active" value={data.activeUserCount} />
          <Stat label="Deactivated" value={inactive} tone={inactive > 0 ? 'bad' : undefined} />
        </dl>
        <p className={styles.dialogNote}>
          Active here means the account has not been deactivated. It is not a count of people
          signed in right now — this application issues stateless tokens and keeps no session
          table, so a count of current sessions is not something it can honestly report.
        </p>
      </Card>
    </>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'bad' }) {
  return (
    <div>
      <dt className={styles.statLabel}>{label}</dt>
      <dd className={[styles.statValue, tone ? styles[tone] : ''].filter(Boolean).join(' ')}>
        <span className="tabular">{value}</span>
      </dd>
    </div>
  )
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
