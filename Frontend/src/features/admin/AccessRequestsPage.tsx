import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { accessRequestsApi } from '@/api/accessRequests'
import { queryKeys } from '@/api/queryKeys'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { isPermissionDenied, PermissionDenied } from '@/components/ui/PermissionDenied'
import { useToast } from '@/components/ui/Toast'
import type { AccessRequest } from '@/types/api'
import styles from './AccessRequestsPage.module.css'

/**
 * The queue of people waiting to be let in.
 *
 * Which rows appear is decided entirely on the server from the caller's role: a department head
 * sees their own department, HR and administrators see everything. This screen never asks for a
 * scope, so there is no parameter to change in order to read another department's applicants.
 *
 * Approving is what lets somebody sign in — until then their account exists but is inert — so
 * the reason box sits next to both buttons rather than only the refusal. It is shown to the
 * applicant either way, and "approved, joining the data team on Monday" is worth recording.
 */
export function AccessRequestsPage() {
  const query = useQuery({
    queryKey: queryKeys.accessRequests.pending(),
    queryFn: ({ signal }) => accessRequestsApi.pending(signal),
    retry: false,
  })

  if (query.isError && isPermissionDenied(query.error)) {
    return (
      <Card>
        <PermissionDenied message="Granting access is a department head, HR or administrator responsibility." />
      </Card>
    )
  }

  const requests = query.data ?? []

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Account requests</h1>
        <p className={styles.subtitle}>
          People who have signed up and cannot use the platform until somebody grants them
          access. Approving one lets them sign in immediately; refusing one keeps the reason on
          their record and tells them why.
        </p>
      </header>

      <Card flush={query.isLoading || Boolean(query.error) || requests.length === 0}>
        {query.isLoading ? (
          <LoadingBlock rows={3} label="Loading account requests" />
        ) : query.isError ? (
          <ErrorBlock error={query.error} onRetry={query.refetch} />
        ) : requests.length === 0 ? (
          <EmptyBlock
            title="Nothing waiting"
            message="Nobody is currently waiting for access. New sign-ups appear here as they arrive."
          />
        ) : (
          <div className={styles.list}>
            {requests.map((request) => (
              <RequestRow key={request.id} request={request} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function RequestRow({ request }: { request: AccessRequest }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [note, setNote] = useState('')

  const decide = useMutation({
    mutationFn: ({ approve }: { approve: boolean }) =>
      approve
        ? accessRequestsApi.approve(request.id, note.trim() || undefined)
        : accessRequestsApi.reject(request.id, note.trim() || undefined),
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.accessRequests.all })
      toast.success(
        variables.approve ? `${request.fullName} can now sign in` : `${request.fullName} was declined`,
      )
    },
    onError: (error) => toast.fromError('Could not record that decision', error),
  })

  return (
    <div className={styles.request}>
      <div className={styles.who}>
        <div className={styles.name}>{request.fullName}</div>
        <div className={styles.email}>{request.email}</div>
        <p className={styles.detail}>
          <span className={styles.detailLabel}>Joining as</span> {request.jobTitle} ·{' '}
          {request.department}
        </p>
        {request.targetJobTitle && (
          <p className={styles.detail}>
            <span className={styles.detailLabel}>Working towards</span> {request.targetJobTitle} ·{' '}
            {request.targetDepartment}
          </p>
        )}
      </div>

      {request.decidableByCaller ? (
        <div className={styles.actions}>
          <div className={styles.noteRow}>
            <input
              className={styles.note}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Reason (shown to them)"
              maxLength={1000}
              disabled={decide.isPending}
              aria-label={`Reason for the decision on ${request.fullName}`}
            />
          </div>
          <div className={styles.buttons}>
            <Button
              size="sm"
              variant="danger"
              loading={decide.isPending && decide.variables?.approve === false}
              disabled={decide.isPending}
              onClick={() => decide.mutate({ approve: false })}
            >
              Decline
            </Button>
            <Button
              size="sm"
              variant="primary"
              loading={decide.isPending && decide.variables?.approve === true}
              disabled={decide.isPending}
              onClick={() => decide.mutate({ approve: true })}
            >
              Approve
            </Button>
          </div>
          <p className={styles.hint}>A reason is optional on an approval, and worth giving on a refusal.</p>
        </div>
      ) : (
        <p className={styles.notYours}>Awaiting a decision from {request.department}.</p>
      )}
    </div>
  )
}
