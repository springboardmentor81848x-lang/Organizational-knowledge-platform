import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { catalogApi } from '@/api/catalog'
import { queryKeys } from '@/api/queryKeys'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatusPill } from '@/components/ui/StatusPill'
import { Table, type Column } from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toast'
import type { Certification } from '@/types/api'
import styles from './Catalog.module.css'

/**
 * Certifications approaching expiry, across the organisation.
 *
 * The reminder button writes a real notification into the holder's own feed — it is the same
 * notification the nightly expiry scan sends, triggered by hand. Rows are ordered by how soon
 * they lapse, because that is the order they need dealing with, and the days remaining are
 * computed from the date the server sent rather than stored anywhere.
 */
export function CertificationRenewalsPage() {
  const [reminded, setReminded] = useState<Set<number>>(new Set())

  const certifications = useQuery({
    queryKey: queryKeys.catalog.expiringCertifications(),
    queryFn: ({ signal }) => catalogApi.expiringCertifications(signal),
  })

  const rows = useMemo(
    () =>
      [...(certifications.data ?? [])].sort((a, b) => {
        if (!a.expiresAt) return 1
        if (!b.expiresAt) return -1
        return a.expiresAt.localeCompare(b.expiresAt)
      }),
    [certifications.data],
  )

  const lapsed = rows.filter((row) => daysUntil(row.expiresAt) !== null && daysUntil(row.expiresAt)! < 0)

  const columns: Column<Certification>[] = [
    {
      key: 'holder',
      header: 'Holder',
      render: (row) => (
        <div className={styles.twoLine}>
          <span className={styles.primaryText}>{row.employeeName}</span>
          <span className={styles.secondaryText}>{row.name}</span>
        </div>
      ),
    },
    { key: 'issuer', header: 'Issuer', width: '190px', render: (row) => row.issuer },
    {
      key: 'expires',
      header: 'Expires',
      width: '150px',
      render: (row) =>
        row.expiresAt ? formatDate(row.expiresAt) : <span className={styles.muted}>No expiry</span>,
    },
    {
      key: 'remaining',
      header: 'Remaining',
      width: '150px',
      render: (row) => <Remaining days={daysUntil(row.expiresAt)} />,
    },
    {
      key: 'status',
      header: 'Status',
      width: '140px',
      render: (row) => <StatusPill value={row.status} />,
    },
    {
      key: 'actions',
      header: '',
      width: '160px',
      render: (row) => <RemindButton certification={row} reminded={reminded} setReminded={setReminded} />,
    },
  ]

  return (
    <Card
      title="Certification renewals"
      description={
        certifications.data
          ? `${certifications.data.length} approaching expiry${
              lapsed.length > 0 ? `, ${lapsed.length} already lapsed` : ''
            }.`
          : 'Certifications nearing their expiry date, organisation-wide.'
      }
      flush
    >
      <Table
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        isLoading={certifications.isLoading}
        error={certifications.error}
        onRetry={certifications.refetch}
        caption="Certifications approaching expiry"
        emptyTitle="Nothing is expiring"
        emptyMessage="No certification in the organisation is close enough to its expiry date to need chasing."
      />
    </Card>
  )
}

function RemindButton({
  certification,
  reminded,
  setReminded,
}: {
  certification: Certification
  reminded: Set<number>
  setReminded: (next: Set<number>) => void
}) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const remind = useMutation({
    mutationFn: () => catalogApi.remindCertification(certification.id),
    onError: (error) => toast.fromError('The reminder was not sent', error),
    onSuccess: () => {
      toast.success('Reminder sent', `${certification.employeeName} has been notified.`)
      // It lands in that employee's own notification feed, so their unread badge changes.
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
      setReminded(new Set(reminded).add(certification.id))
    },
  })

  return (
    <Button
      size="sm"
      loading={remind.isPending}
      onClick={() => remind.mutate()}
      title={
        reminded.has(certification.id)
          ? 'Already reminded in this session — sending again is allowed'
          : 'Writes a renewal notification to the holder'
      }
    >
      {reminded.has(certification.id) ? 'Remind again' : 'Send reminder'}
    </Button>
  )
}

/** Days are a stronger signal than a date when the question is what to chase first. */
function Remaining({ days }: { days: number | null }) {
  if (days === null) return <span className={styles.muted}>—</span>
  if (days < 0) {
    return <span className={styles.expired}>Lapsed {Math.abs(days)}d ago</span>
  }
  if (days <= 30) {
    return <span className={styles.warn}>{days} days</span>
  }
  return <span className={styles.secondaryText}>{days} days</span>
}

function daysUntil(date: string | null): number | null {
  if (!date) return null
  const then = new Date(`${date}T00:00:00`)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((then.getTime() - now.getTime()) / 86_400_000)
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
