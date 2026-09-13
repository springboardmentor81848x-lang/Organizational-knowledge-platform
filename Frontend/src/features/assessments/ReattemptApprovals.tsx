import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { quizApi } from '@/api/quiz'
import { queryKeys } from '@/api/queryKeys'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { isPermissionDenied, PermissionDenied } from '@/components/ui/PermissionDenied'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/apiError'
import type { ReattemptRequest, ReattemptRequestStatus } from '@/types/api'
import { ReattemptStatusPill, formatDateTime } from './ReattemptRequest'
import styles from './ReattemptApprovals.module.css'

const FILTERS: { id: 'PENDING' | 'ALL'; label: string }[] = [
  { id: 'PENDING', label: 'Awaiting decision' },
  { id: 'ALL', label: 'All requests' },
]

/**
 * The approver's queue: employees asking to sit the target-role assessment again.
 *
 * Which employees appear is decided entirely on the server from the caller's role — a manager's
 * own reports, a department head's department, the organisation for HR and administrators. This
 * screen never asks for a scope, so there is no parameter to change in order to see somebody
 * else's team.
 *
 * It opens on the pending list rather than on everything, because the only rows that need
 * anybody's attention are the undecided ones; the full history is a tab away for context.
 */
export function ReattemptApprovals() {
  const [filter, setFilter] = useState<'PENDING' | 'ALL'>('PENDING')
  const status: ReattemptRequestStatus | undefined = filter === 'PENDING' ? 'PENDING' : undefined

  const query = useQuery({
    queryKey: queryKeys.assessments.reattemptRequests(filter),
    queryFn: ({ signal }) => quizApi.reattemptRequests(status, signal),
    retry: false,
  })

  if (query.isError && isPermissionDenied(query.error)) {
    return (
      <Card>
        <PermissionDenied message="Deciding assessment attempts is a manager, HR or administrator responsibility." />
      </Card>
    )
  }

  const requests = query.data ?? []

  return (
    <div className={styles.approvals}>
      <Card
        title="Requests for another assessment attempt"
        description="An employee sits the target-role assessment once. Everything below is somebody asking to sit it again."
        actions={
          <div className={styles.filters} role="tablist">
            {FILTERS.map((option) => (
              <button
                key={option.id}
                role="tab"
                aria-selected={filter === option.id}
                className={[styles.filter, filter === option.id ? styles.filterActive : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setFilter(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      >
        <p className={styles.guidance}>
          Approving grants exactly one attempt. Once it is used the employee needs a fresh
          approval, so a single decision cannot become a standing licence to retake.
        </p>
      </Card>

      {query.isLoading ? (
        <Card>
          <LoadingBlock rows={3} label="Loading requests" />
        </Card>
      ) : query.isError ? (
        <Card>
          <ErrorBlock error={query.error} onRetry={query.refetch} />
        </Card>
      ) : requests.length === 0 ? (
        <Card>
          <EmptyBlock
            title={filter === 'PENDING' ? 'Nothing awaiting a decision' : 'No requests yet'}
            message={
              filter === 'PENDING'
                ? 'Requests appear here the moment somebody you are responsible for asks to retake their assessment.'
                : 'Nobody you are responsible for has asked to retake their assessment.'
            }
          />
        </Card>
      ) : (
        requests.map((request) => <RequestRow key={request.requestId} request={request} />)
      )}
    </div>
  )
}

/**
 * One request, with its decision.
 *
 * The note is offered on both buttons rather than only on a refusal. An approver who grants an
 * attempt often has a condition attached to it ("last one before we look at the course instead"),
 * and that sentence reaches the employee in the notification.
 */
function RequestRow({ request }: { request: ReattemptRequest }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [note, setNote] = useState('')

  const decide = useMutation({
    mutationFn: (approve: boolean) =>
      approve
        ? quizApi.approveReattempt(request.requestId, note)
        : quizApi.rejectReattempt(request.requestId, note),
    onSuccess: async (updated) => {
      setNote('')
      toast.success(
        updated.status === 'APPROVED' ? 'Attempt approved' : 'Request declined',
        `${updated.employeeName} has been notified.`,
      )
      // The employee's own attempt status hangs off the same branch, so one invalidation covers
      // both this queue and the screen they are looking at.
      await queryClient.invalidateQueries({ queryKey: queryKeys.assessments.all })
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
    onError: (error) => toast.fromError('The decision could not be recorded', error),
  })

  const pending = request.status === 'PENDING'

  return (
    <Card>
      <div className={styles.head}>
        <div>
          <h3 className={styles.name}>{request.employeeName}</h3>
          <p className={styles.meta}>
            {[request.employeeJobTitle, request.employeeDepartment].filter(Boolean).join(' · ') ||
              request.employeeEmail}
          </p>
        </div>
        <div className={styles.headRight}>
          <ReattemptStatusPill request={request} />
          <span className={styles.attempts}>
            {request.attemptsAtRequest} attempt{request.attemptsAtRequest === 1 ? '' : 's'} taken
          </span>
        </div>
      </div>

      <blockquote className={styles.reason}>{request.reason}</blockquote>

      <p className={styles.timestamp}>Requested {formatDateTime(request.createdAt)}</p>

      {pending ? (
        <>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`note-${request.requestId}`}>
              Note to {request.employeeName.split(' ')[0]} (optional)
            </label>
            <textarea
              id={`note-${request.requestId}`}
              className={styles.textarea}
              rows={2}
              maxLength={1000}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          {decide.isError && (
            <div className={styles.error} role="alert">
              <span aria-hidden="true">!</span>
              <span>{ApiError.from(decide.error).userMessage()}</span>
            </div>
          )}

          <div className={styles.actions}>
            <Button
              variant="ghost"
              loading={decide.isPending && decide.variables === false}
              disabled={decide.isPending}
              onClick={() => decide.mutate(false)}
            >
              Decline
            </Button>
            <Button
              variant="primary"
              loading={decide.isPending && decide.variables === true}
              disabled={decide.isPending}
              onClick={() => decide.mutate(true)}
            >
              Approve one attempt
            </Button>
          </div>
        </>
      ) : (
        <div className={styles.decided}>
          <span className={styles.decidedLine}>
            {request.status === 'APPROVED' ? 'Approved' : 'Declined'}
            {request.decidedByName ? ` by ${request.decidedByName}` : ''}
            {request.decidedAt ? ` on ${formatDateTime(request.decidedAt)}` : ''}
            {request.consumedAt ? ` · attempt taken ${formatDateTime(request.consumedAt)}` : ''}
          </span>
          {request.decisionNote && <span className={styles.decidedNote}>{request.decisionNote}</span>}
        </div>
      )}
    </Card>
  )
}
