import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { quizApi } from '@/api/quiz'
import { queryKeys } from '@/api/queryKeys'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatusPill, type Tone } from '@/components/ui/StatusPill'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/apiError'
import type { AssessmentAttemptStatus, ReattemptRequest, ReattemptRequestStatus } from '@/types/api'
import styles from './ReattemptRequest.module.css'

/**
 * A decision is not a severity, so the status pill is told its tone rather than left to guess.
 * PENDING is amber because it is waiting on somebody, APPROVED green because the employee may
 * act, REJECTED neutral rather than red — a refused retake is an ordinary answer, not a fault.
 */
export const REATTEMPT_TONE: Record<ReattemptRequestStatus, Tone> = {
  PENDING: 'medium',
  APPROVED: 'low',
  REJECTED: 'neutral',
}

const REATTEMPT_LABEL: Record<ReattemptRequestStatus, string> = {
  PENDING: 'Awaiting decision',
  APPROVED: 'Approved',
  REJECTED: 'Declined',
}

export function ReattemptStatusPill({ request }: { request: ReattemptRequest }) {
  // An approval that has been spent is still APPROVED on the record, but it no longer unlocks
  // anything — saying so is the difference between "you may retake" and "you already did".
  const spent = request.status === 'APPROVED' && request.consumedAt !== null
  return (
    <StatusPill
      value={request.status}
      tone={spent ? 'neutral' : REATTEMPT_TONE[request.status]}
      label={spent ? 'Approval used' : REATTEMPT_LABEL[request.status]}
    />
  )
}

/**
 * What an employee sees when their attempt is used up.
 *
 * The assessment is sat once. Anything further is a decision somebody else makes, so this screen
 * has exactly one action on it — send the request — and otherwise reports where a request that
 * has already been sent has got to. It never offers a "take it again" button it cannot honour:
 * the server would refuse the paper, and a button that fails is worse than no button.
 */
export function AttemptLockedCard({ status }: { status: AssessmentAttemptStatus }) {
  const request = status.latestRequest

  return (
    <div className={styles.locked}>
      <Card>
        <div className={styles.lockedHead}>
          <div>
            <h2 className={styles.lockedTitle}>Your assessment has been submitted</h2>
            <p className={styles.lockedText}>{status.message}</p>
          </div>
          <div className={styles.attemptBadge}>
            <span className={styles.attemptCount}>{status.attemptsTaken}</span>
            <span className={styles.attemptLabel}>
              attempt{status.attemptsTaken === 1 ? '' : 's'} taken
            </span>
          </div>
        </div>

        {status.lastAttemptAt && (
          <p className={styles.lockedMeta}>
            Last taken on {formatDateTime(status.lastAttemptAt)}. Your skill levels, gaps and
            recommendations are all built from that result.
          </p>
        )}
      </Card>

      {request && request.status !== 'REJECTED' && <RequestSummary request={request} />}

      {status.requestRequired ? (
        <RequestForm previousRequest={request} />
      ) : (
        request?.status === 'PENDING' && (
          <Card>
            <p className={styles.lockedText}>
              Nothing more is needed from you. Your approver will see this on their assessments
              screen, and you will get a notification the moment it is decided.
            </p>
          </Card>
        )
      )}
    </div>
  )
}

/** The state of a request that has already been sent, decision and note included. */
function RequestSummary({ request }: { request: ReattemptRequest }) {
  return (
    <Card
      title="Your request for another attempt"
      actions={<ReattemptStatusPill request={request} />}
    >
      <dl className={styles.summary}>
        <div className={styles.summaryRow}>
          <dt className={styles.summaryLabel}>Sent</dt>
          <dd className={styles.summaryValue}>{formatDateTime(request.createdAt)}</dd>
        </div>
        <div className={styles.summaryRow}>
          <dt className={styles.summaryLabel}>Your reason</dt>
          <dd className={styles.summaryValue}>{request.reason}</dd>
        </div>
        {request.decidedAt && (
          <div className={styles.summaryRow}>
            <dt className={styles.summaryLabel}>Decided</dt>
            <dd className={styles.summaryValue}>
              {formatDateTime(request.decidedAt)}
              {request.decidedByName ? ` by ${request.decidedByName}` : ''}
            </dd>
          </div>
        )}
        {request.decisionNote && (
          <div className={styles.summaryRow}>
            <dt className={styles.summaryLabel}>Note</dt>
            <dd className={styles.summaryValue}>{request.decisionNote}</dd>
          </div>
        )}
      </dl>
    </Card>
  )
}

/**
 * The request itself.
 *
 * A reason is required rather than optional because the approver has nothing else to go on: they
 * cannot see whether the first attempt was cut short by a broken connection or simply went
 * badly, and an empty request forces them to guess or to chase the employee for the answer.
 */
function RequestForm({ previousRequest }: { previousRequest: ReattemptRequest | null }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [reason, setReason] = useState('')

  const send = useMutation({
    mutationFn: () => quizApi.requestReattempt(reason.trim()),
    onSuccess: async () => {
      setReason('')
      toast.success(
        'Request sent',
        'Your manager or HR will decide, and you will be notified either way.',
      )
      await queryClient.invalidateQueries({ queryKey: queryKeys.assessments.all })
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
    onError: (error) => toast.fromError('Your request could not be sent', error),
  })

  const declined = previousRequest?.status === 'REJECTED'

  return (
    <Card
      title={declined ? 'Ask again' : 'Request another attempt'}
      description={
        declined
          ? 'Your last request was declined. You can ask again, but say what has changed since.'
          : 'The assessment is taken once. Another attempt has to be approved by your manager or by HR.'
      }
    >
      {declined && previousRequest && (
        <div className={styles.declined} role="note">
          <span className={styles.declinedLabel}>
            Declined{previousRequest.decidedByName ? ` by ${previousRequest.decidedByName}` : ''}
          </span>
          {previousRequest.decisionNote && (
            <span className={styles.declinedNote}>{previousRequest.decisionNote}</span>
          )}
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="reattempt-reason">
          Why do you need another attempt?
        </label>
        <textarea
          id="reattempt-reason"
          className={styles.textarea}
          rows={4}
          maxLength={1000}
          value={reason}
          placeholder="For example: my connection dropped part-way through, or I have since finished the recommended course and want to be re-measured."
          onChange={(event) => setReason(event.target.value)}
        />
        <span className={styles.counter}>{reason.trim().length}/1000</span>
      </div>

      {send.isError && (
        <div className={styles.error} role="alert">
          <span aria-hidden="true">!</span>
          <span>{ApiError.from(send.error).userMessage()}</span>
        </div>
      )}

      <div className={styles.actions}>
        <p className={styles.hint}>
          Your approver sees your reason and how many attempts you have taken.
        </p>
        <Button
          variant="primary"
          loading={send.isPending}
          disabled={reason.trim().length === 0 || send.isPending}
          onClick={() => send.mutate()}
        >
          Send request
        </Button>
      </div>
    </Card>
  )
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
