import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/api/admin'
import { queryKeys } from '@/api/queryKeys'
import { Card } from '@/components/ui/Card'
import { Table, type Column } from '@/components/ui/Table'
import type { AuditLog } from '@/types/api'
import styles from './Admin.module.css'

/**
 * The audit trail. Read-only, and read from the log the server keeps.
 *
 * Failed sign-ins matter as much as successful ones, so they are grouped and countable here.
 * Everything shown is a row the backend wrote at the time; nothing is derived, inferred or
 * reconstructed on this screen.
 */

/** Actions worth separating at a glance, by what they mean rather than by severity. */
const SIGNIFICANT: Record<string, 'auth' | 'refused' | 'access' | 'change'> = {
  LOGIN_SUCCESS: 'auth',
  LOGIN_FAILED: 'refused',
  ACTIVATE_USER: 'access',
  DEACTIVATE_USER: 'access',
  UPDATE_USER_ROLE: 'access',
  RESET_USER_PASSWORD: 'access',
}

export function AuditLogPage() {
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('')

  const logs = useQuery({
    queryKey: queryKeys.admin.auditLogs(),
    queryFn: ({ signal }) => adminApi.auditLogs(signal),
  })

  const actions = useMemo(
    () => [...new Set((logs.data ?? []).map((entry) => entry.action))].sort(),
    [logs.data],
  )

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (logs.data ?? []).filter((entry) => {
      if (action && entry.action !== action) return false
      if (!term) return true
      return (
        entry.actorEmail.toLowerCase().includes(term) ||
        entry.action.toLowerCase().includes(term) ||
        (entry.details ?? '').toLowerCase().includes(term)
      )
    })
  }, [logs.data, search, action])

  const refused = (logs.data ?? []).filter((entry) => entry.action === 'LOGIN_FAILED').length
  const accessChanges = (logs.data ?? []).filter(
    (entry) => SIGNIFICANT[entry.action] === 'access',
  ).length

  const columns: Column<AuditLog>[] = [
    {
      key: 'when',
      header: 'When',
      width: '170px',
      render: (entry) => <span className={styles.timestamp}>{formatTime(entry.timestamp)}</span>,
    },
    {
      key: 'action',
      header: 'Action',
      width: '190px',
      render: (entry) => (
        <span className={[styles.action, styles[SIGNIFICANT[entry.action] ?? 'plain']].join(' ')}>
          {entry.action.replaceAll('_', ' ').toLowerCase()}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'Who',
      width: '230px',
      render: (entry) => (
        <div className={styles.twoLine}>
          <span className={styles.primaryText}>{entry.actorEmail}</span>
          {entry.actorUserId != null && (
            <span className={styles.secondaryText}>account #{entry.actorUserId}</span>
          )}
        </div>
      ),
    },
    {
      key: 'details',
      header: 'What happened',
      render: (entry) => entry.details ?? <span className={styles.muted}>—</span>,
    },
    {
      key: 'entity',
      header: 'Subject',
      width: '150px',
      render: (entry) =>
        entry.entityType ? (
          <span className={styles.secondaryText}>
            {entry.entityType}
            {entry.entityId ? ` #${entry.entityId}` : ''}
          </span>
        ) : (
          <span className={styles.muted}>—</span>
        ),
    },
  ]

  return (
    <>
      <Card title="Recorded activity" description="The hundred most recent entries the server holds.">
        <dl className={styles.stats}>
          <Stat label="Entries" value={logs.data?.length ?? 0} />
          <Stat label="Refused sign-ins" value={refused} tone={refused > 0 ? 'bad' : undefined} />
          <Stat label="Access changes" value={accessChanges} />
          <Stat label="Distinct actions" value={actions.length} />
        </dl>
      </Card>

      <Card
        title="Audit log"
        description="Read-only. Entries are written by the server as things happen and cannot be edited here."
        actions={
          <div className={styles.filters}>
            <input
              className={styles.input}
              type="search"
              value={search}
              placeholder="Who, what, or any detail"
              aria-label="Search the audit log"
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className={styles.select}
              value={action}
              aria-label="Filter by action"
              onChange={(event) => setAction(event.target.value)}
            >
              <option value="">All actions</option>
              {actions.map((name) => (
                <option key={name} value={name}>
                  {name.replaceAll('_', ' ').toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        }
        flush
      >
        <Table
          columns={columns}
          rows={rows}
          rowKey={(entry) => entry.id}
          isLoading={logs.isLoading}
          error={logs.error}
          onRetry={logs.refetch}
          caption="Audit log"
          emptyTitle={search || action ? 'No entries match' : 'Nothing recorded yet'}
          emptyMessage={
            search || action
              ? 'Clear the filters to see the whole log.'
              : 'Sign-ins, role changes and account activations are recorded here as they happen.'
          }
        />
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
  return new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
