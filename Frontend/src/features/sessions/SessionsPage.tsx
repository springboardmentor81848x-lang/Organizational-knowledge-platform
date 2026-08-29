import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sessionsApi, type SessionRequest } from '@/api/sessions'
import { queryKeys } from '@/api/queryKeys'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { isPermissionDenied, PermissionDenied } from '@/components/ui/PermissionDenied'
import { StatusPill } from '@/components/ui/StatusPill'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/apiError'
import type { KnowledgeSession, SessionRegistration } from '@/types/api'
import { useSession } from '@/features/auth/useSession'
import styles from './SessionsPage.module.css'
import { SessionHosting } from './SessionHosting'

/**
 * Knowledge-sharing sessions.
 *
 * Capacity is shown as the numbers the server reports — "12 / 12 seats · Full" — rather than
 * expressed only as a disabled button. A control that cannot be pressed with no explanation
 * leaves the reader guessing whether the session is full, cancelled, or already started, and
 * those need different responses from them.
 */
export function SessionsPage() {
  const { user } = useSession()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [feedbackFor, setFeedbackFor] = useState<KnowledgeSession | null>(null)

  const query = useQuery({
    queryKey: queryKeys.sessions.list(),
    queryFn: ({ signal }) => sessionsApi.list(undefined, signal),
  })

  /** Registering changes the seat count everyone else sees, so the whole list is dropped. */
  async function refreshSessions() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
    ])
  }

  const register = useMutation({
    mutationFn: (sessionId: number) => sessionsApi.register(sessionId),
    onSuccess: async () => {
      await refreshSessions()
      toast.success('Registered', 'Your seat is confirmed.')
    },
    // The server's message carries the real seat numbers, so it is shown rather than replaced.
    onError: (error) => toast.fromError('Could not register', error),
  })

  const cancel = useMutation({
    mutationFn: (sessionId: number) => sessionsApi.cancelRegistration(sessionId),
    onSuccess: async () => {
      await refreshSessions()
      toast.success('Registration cancelled', 'Your seat has been released.')
    },
    onError: (error) => toast.fromError('Could not cancel', error),
  })

  if (!user) return null

  const sessions = query.data ?? []
  const now = Date.now()
  const mine = sessions.filter((session) => registrationOf(session, user.id))
  const upcoming = sessions.filter(
    (session) =>
      session.status === 'SCHEDULED' &&
      new Date(session.sessionDate).getTime() > now &&
      !registrationOf(session, user.id) &&
      session.mentorId !== user.id,
  )

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Knowledge-sharing sessions</h1>
        <p className={styles.subtitle}>
          Sessions run by colleagues. Seats are limited and shown live, so you can see what is
          left before you commit.
        </p>
      </header>

      <SessionHosting />

      <Card
        title="Your sessions"
        description="Sessions you are registered for."
        flush={query.isLoading || Boolean(query.error) || mine.length === 0}
      >
        {query.isLoading ? (
          <LoadingBlock rows={2} label="Loading your sessions" />
        ) : query.isError ? (
          isPermissionDenied(query.error) ? (
            <PermissionDenied />
          ) : (
            <ErrorBlock error={query.error} onRetry={query.refetch} />
          )
        ) : mine.length === 0 ? (
          <EmptyBlock title="Nothing booked" message="Register for a session below." />
        ) : (
          mine.map((session) => (
            <SessionRow
              key={session.sessionId}
              session={session}
              registration={registrationOf(session, user.id)}
              onCancel={() => cancel.mutate(session.sessionId)}
              onFeedback={() => setFeedbackFor(session)}
              busy={cancel.isPending && cancel.variables === session.sessionId}
            />
          ))
        )}
      </Card>

      <Card
        title="Open sessions"
        description="Everything upcoming you are not yet registered for."
        flush={query.isLoading || Boolean(query.error) || upcoming.length === 0}
      >
        {query.isLoading ? (
          <LoadingBlock rows={3} label="Loading sessions" />
        ) : query.isError ? (
          <ErrorBlock error={query.error} onRetry={query.refetch} />
        ) : upcoming.length === 0 ? (
          <EmptyBlock
            title="No open sessions"
            message="Nothing is scheduled that you are not already part of."
          />
        ) : (
          upcoming.map((session) => (
            <SessionRow
              key={session.sessionId}
              session={session}
              onRegister={() => register.mutate(session.sessionId)}
              busy={register.isPending && register.variables === session.sessionId}
            />
          ))
        )}
      </Card>

      {feedbackFor && (
        <FeedbackDialog
          session={feedbackFor}
          onClose={() => setFeedbackFor(null)}
          onSubmitted={refreshSessions}
        />
      )}
    </div>
  )
}

function registrationOf(session: KnowledgeSession, employeeId: number): SessionRegistration | undefined {
  return session.registrations.find((registration) => registration.employeeId === employeeId)
}

// ── One session ─────────────────────────────────────────────────────────────

function SessionRow({
  session,
  registration,
  onRegister,
  onCancel,
  onFeedback,
  busy = false,
}: {
  session: KnowledgeSession
  registration?: SessionRegistration
  onRegister?: () => void
  onCancel?: () => void
  onFeedback?: () => void
  busy?: boolean
}) {
  const started = new Date(session.sessionDate).getTime() <= Date.now()
  const attended = registration?.attendanceStatus === 'ATTENDED'
  const alreadyGaveFeedback = registration?.feedbackSubmittedAt != null

  return (
    <div className={styles.session}>
      <div className={styles.sessionMain}>
        <div className={styles.sessionHead}>
          <span className={styles.sessionTitle}>{session.title}</span>
          <StatusPill value={session.status} />
        </div>
        <p className={styles.sessionMeta}>
          {formatDateTime(session.sessionDate)} · {session.durationMinutes} min · hosted by{' '}
          {session.mentorName}
        </p>
        {session.description && <p className={styles.sessionDesc}>{session.description}</p>}

        <Capacity session={session} />

        {registration && (
          <p className={styles.attendance}>
            Your attendance: <StatusPill value={registration.attendanceStatus} />
            {alreadyGaveFeedback && registration.feedbackRating != null && (
              <span className={styles.feedbackGiven}>
                You rated this {registration.feedbackRating}/5
              </span>
            )}
          </p>
        )}
      </div>

      <div className={styles.sessionActions}>
        {onRegister && (
          <>
            <Button
              size="sm"
              variant="primary"
              loading={busy}
              disabled={session.full}
              onClick={onRegister}
            >
              Register
            </Button>
            {session.full && <span className={styles.blockedNote}>No seats left</span>}
          </>
        )}

        {onCancel && !started && (
          <Button size="sm" loading={busy} onClick={onCancel}>
            Cancel registration
          </Button>
        )}

        {onFeedback && registration && (
          <>
            <Button
              size="sm"
              disabled={!attended || alreadyGaveFeedback}
              onClick={onFeedback}
            >
              {alreadyGaveFeedback ? 'Feedback given' : 'Give feedback'}
            </Button>
            {/* Why the button is unavailable, rather than leaving it inert and unexplained. */}
            {!attended && !alreadyGaveFeedback && (
              <span className={styles.blockedNote}>
                {started
                  ? 'Available once the host marks you as attended'
                  : 'Available after the session, once attendance is marked'}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/** Seats, as numbers. The bar is decoration; the figures are the message. */
function Capacity({ session }: { session: KnowledgeSession }) {
  const taken = session.registeredCount
  const total = session.capacity
  const percent = total > 0 ? Math.min(100, (taken / total) * 100) : 0

  return (
    <div className={styles.capacity}>
      <div className={styles.capacityTrack} aria-hidden="true">
        <div
          className={[styles.capacityFill, session.full ? styles.capacityFull : '']
            .filter(Boolean)
            .join(' ')}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className={styles.capacityText}>
        <span className="tabular">
          {taken} / {total}
        </span>{' '}
        seats
        {session.full ? (
          <strong className={styles.fullFlag}> · Full</strong>
        ) : (
          <span className={styles.seatsLeft}> · {session.availableSeats} left</span>
        )}
      </span>
    </div>
  )
}

// ── Feedback ────────────────────────────────────────────────────────────────

function FeedbackDialog({
  session,
  onClose,
  onSubmitted,
}: {
  session: KnowledgeSession
  onClose: () => void
  onSubmitted: () => Promise<void>
}) {
  const toast = useToast()
  const [rating, setRating] = useState(4)
  const [feedbackText, setFeedbackText] = useState('')

  const submit = useMutation({
    mutationFn: () => sessionsApi.submitFeedback(session.sessionId, { rating, feedbackText }),
    onSuccess: async () => {
      await onSubmitted()
      toast.success('Thank you', 'Your feedback has been recorded.')
      onClose()
    },
    onError: (error) => toast.fromError('Could not submit feedback', error),
  })

  return (
    <Modal
      open
      onClose={onClose}
      title="How was the session?"
      description={session.title}
      size="sm"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={submit.isPending} onClick={() => submit.mutate()}>
            Submit feedback
          </Button>
        </>
      }
    >
      {submit.isError && (
        <div className={styles.error} role="alert">
          <span aria-hidden="true">!</span>
          <span>{ApiError.from(submit.error).userMessage()}</span>
        </div>
      )}

      <fieldset className={styles.field}>
        <legend className={styles.label}>Rating</legend>
        <div className={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={[styles.ratingButton, rating === value ? styles.ratingActive : '']
                .filter(Boolean)
                .join(' ')}
              aria-pressed={rating === value}
              onClick={() => setRating(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </fieldset>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="feedbackText">
          Comments (optional)
        </label>
        <textarea
          id="feedbackText"
          className={styles.textarea}
          rows={3}
          value={feedbackText}
          onChange={(event) => setFeedbackText(event.target.value)}
        />
      </div>
    </Modal>
  )
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export type { SessionRequest }
