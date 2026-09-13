import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sessionsApi, type AttendanceEntry, type SessionRequest } from '@/api/sessions'
import { queryKeys } from '@/api/queryKeys'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { EmptyBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { StatusPill } from '@/components/ui/StatusPill'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/apiError'
import type { AttendanceStatus, KnowledgeSession } from '@/types/api'
import { useSession } from '@/features/auth/useSession'
import { formatDateTime } from './SessionsPage'
import styles from './SessionsPage.module.css'

/**
 * The hosting side: creating sessions, editing them, taking the register and reading back what
 * attendees thought.
 *
 * Whether somebody may host is a property of their skill profile rather than their role — the
 * backend admits mentors at ADVANCED or above as well as L&D administrators — so this shows for
 * everyone and reports the refusal if the server declines, rather than second-guessing the rule
 * and hiding the feature from someone entitled to it.
 */
export function SessionHosting() {
  const { user } = useSession()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [editing, setEditing] = useState<KnowledgeSession | null>(null)
  const [creating, setCreating] = useState(false)
  const [registerFor, setRegisterFor] = useState<KnowledgeSession | null>(null)

  const query = useQuery({
    queryKey: queryKeys.sessions.list({ mentorId: user?.id }),
    queryFn: ({ signal }) => sessionsApi.list({ mentorId: user!.id }, signal),
    enabled: Boolean(user),
  })

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all })
  }

  const cancel = useMutation({
    mutationFn: (sessionId: number) => sessionsApi.cancel(sessionId),
    onSuccess: async () => {
      await refresh()
      toast.success('Session cancelled', 'Everyone registered has been notified.')
    },
    onError: (error) => toast.fromError('Could not cancel the session', error),
  })

  const hosted = query.data ?? []

  return (
    <>
      <Card
        title="Sessions you host"
        description="Create a session, take the register, and read what attendees thought."
        actions={
          <Button size="sm" variant="primary" onClick={() => setCreating(true)}>
            Create a session
          </Button>
        }
        flush={query.isLoading || hosted.length === 0}
      >
        {query.isLoading ? (
          <LoadingBlock rows={2} label="Loading your sessions" />
        ) : hosted.length === 0 ? (
          <EmptyBlock
            title="You are not hosting anything"
            message="Create a session to share what you know with colleagues."
          />
        ) : (
          hosted.map((session) => (
            <div className={styles.session} key={session.sessionId}>
              <div className={styles.sessionMain}>
                <div className={styles.sessionHead}>
                  <span className={styles.sessionTitle}>{session.title}</span>
                  <StatusPill value={session.status} />
                </div>
                <p className={styles.sessionMeta}>
                  {formatDateTime(session.sessionDate)} · {session.durationMinutes} min
                </p>

                <p className={styles.hostStats}>
                  <span className="tabular">
                    {session.registeredCount} / {session.capacity}
                  </span>{' '}
                  registered · <span className="tabular">{session.attendedCount}</span> attended ·{' '}
                  <span className="tabular">{session.feedbackCount}</span> gave feedback
                  {session.averageFeedbackRating != null && (
                    <>
                      {' '}
                      · average rating{' '}
                      <strong className="tabular">
                        {Math.round(session.averageFeedbackRating * 10) / 10}/5
                      </strong>
                    </>
                  )}
                </p>

                {session.feedbackCount === 0 && session.attendedCount > 0 && (
                  <p className={styles.hostNote}>
                    No feedback yet. Attendees can only leave it once you have marked them present.
                  </p>
                )}
              </div>

              <div className={styles.sessionActions}>
                <Button size="sm" onClick={() => setRegisterFor(session)}>
                  Registrants ({session.registeredCount})
                </Button>
                {session.status === 'SCHEDULED' && (
                  <>
                    <Button size="sm" onClick={() => setEditing(session)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={cancel.isPending && cancel.variables === session.sessionId}
                      onClick={() => cancel.mutate(session.sessionId)}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </Card>

      {(creating || editing) && (
        <SessionForm
          session={editing}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSaved={refresh}
        />
      )}

      {registerFor && (
        <RegistrantList session={registerFor} onClose={() => setRegisterFor(null)} onSaved={refresh} />
      )}
    </>
  )
}

// ── Create and edit ─────────────────────────────────────────────────────────

function SessionForm({
  session,
  onClose,
  onSaved,
}: {
  session: KnowledgeSession | null
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const toast = useToast()
  const isEdit = session !== null

  const [form, setForm] = useState<SessionRequest>({
    title: session?.title ?? '',
    description: session?.description ?? '',
    // datetime-local wants a local value without the zone the API returns.
    sessionDate: session ? toLocalInput(session.sessionDate) : '',
    durationMinutes: session?.durationMinutes ?? 60,
    capacity: session?.capacity ?? 10,
  })

  const save = useMutation({
    mutationFn: () => {
      const body: SessionRequest = { ...form, sessionDate: new Date(form.sessionDate).toISOString() }
      return isEdit ? sessionsApi.update(session!.sessionId, body) : sessionsApi.create(body)
    },
    onSuccess: async () => {
      await onSaved()
      toast.success(isEdit ? 'Session updated' : 'Session created')
      onClose()
    },
    onError: (error) => toast.fromError(isEdit ? 'Could not update' : 'Could not create', error),
  })

  const error = save.error ? ApiError.from(save.error) : null

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? 'Edit session' : 'Create a session'}
      description={
        isEdit
          ? 'Changes are sent to everyone already registered.'
          : 'Capacity decides how many colleagues can take a seat.'
      }
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            loading={save.isPending}
            disabled={!form.title.trim() || !form.sessionDate}
            onClick={() => save.mutate()}
          >
            {isEdit ? 'Save changes' : 'Create session'}
          </Button>
        </>
      }
    >
      {error && (
        <div className={styles.error} role="alert">
          <span aria-hidden="true">!</span>
          <span>{error.userMessage()}</span>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="title">
          Title
        </label>
        <input
          id="title"
          className={styles.input}
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="description">
          What it covers
        </label>
        <textarea
          id="description"
          className={styles.textarea}
          rows={3}
          value={form.description ?? ''}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="sessionDate">
            When
          </label>
          <input
            id="sessionDate"
            type="datetime-local"
            className={styles.input}
            value={form.sessionDate}
            onChange={(event) => setForm({ ...form, sessionDate: event.target.value })}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="durationMinutes">
            Minutes
          </label>
          <input
            id="durationMinutes"
            type="number"
            min={15}
            step={15}
            className={styles.input}
            value={form.durationMinutes}
            onChange={(event) => setForm({ ...form, durationMinutes: Number(event.target.value) })}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="capacity">
            Seats
          </label>
          <input
            id="capacity"
            type="number"
            min={1}
            className={styles.input}
            value={form.capacity}
            onChange={(event) => setForm({ ...form, capacity: Number(event.target.value) })}
          />
        </div>
      </div>
    </Modal>
  )
}

// ── The register ────────────────────────────────────────────────────────────

/**
 * Taking the register. Marking somebody present is what unlocks their ability to leave
 * feedback, so the dialog says as much rather than leaving the connection implicit.
 */
function RegistrantList({
  session,
  onClose,
  onSaved,
}: {
  session: KnowledgeSession
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const toast = useToast()
  // The host is sent the full roster; anyone else gets only their own row. This dialog is only
  // ever opened by the host, so the list is expected — but an absent one means an empty roster,
  // not a broken screen.
  const registrants = session.registrations ?? []
  const [marks, setMarks] = useState<Record<number, AttendanceStatus>>(() =>
    Object.fromEntries(
      registrants.map((registration) => [registration.employeeId, registration.attendanceStatus]),
    ),
  )

  const save = useMutation({
    mutationFn: () => {
      const entries: AttendanceEntry[] = Object.entries(marks).map(([employeeId, status]) => ({
        employeeId: Number(employeeId),
        attendanceStatus: status,
      }))
      return sessionsApi.markAttendance(session.sessionId, entries)
    },
    onSuccess: async () => {
      await onSaved()
      toast.success('Attendance recorded', 'Attendees can now leave feedback.')
      onClose()
    },
    onError: (error) => toast.fromError('Could not record attendance', error),
  })

  return (
    <Modal
      open
      onClose={onClose}
      title="Registrants"
      description={`${session.registeredCount} of ${session.capacity} seats taken for ${session.title}.`}
      footer={
        <>
          <Button onClick={onClose}>Close</Button>
          <Button
            variant="primary"
            loading={save.isPending}
            disabled={registrants.length === 0}
            onClick={() => save.mutate()}
          >
            Save attendance
          </Button>
        </>
      }
    >
      {save.isError && (
        <div className={styles.error} role="alert">
          <span aria-hidden="true">!</span>
          <span>{ApiError.from(save.error).userMessage()}</span>
        </div>
      )}

      {registrants.length === 0 ? (
        <p className={styles.hostNote}>Nobody has registered yet.</p>
      ) : (
        <>
          <ul className={styles.registrants}>
            {registrants.map((registration) => (
              <li className={styles.registrant} key={registration.registrationId}>
                <div className={styles.registrantMeta}>
                  <span className={styles.registrantName}>{registration.employeeName}</span>
                  {registration.feedbackRating != null && (
                    <span className={styles.registrantFeedback}>
                      Rated {registration.feedbackRating}/5
                      {registration.feedbackText ? ` — “${registration.feedbackText}”` : ''}
                    </span>
                  )}
                </div>
                <div className={styles.attendanceChoice}>
                  {(['REGISTERED', 'ATTENDED', 'ABSENT'] as AttendanceStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={[
                        styles.attendanceButton,
                        marks[registration.employeeId] === status ? styles.attendanceActive : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-pressed={marks[registration.employeeId] === status}
                      onClick={() =>
                        setMarks((current) => ({ ...current, [registration.employeeId]: status }))
                      }
                    >
                      {status === 'REGISTERED' ? 'Booked' : status === 'ATTENDED' ? 'Present' : 'Absent'}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
          <p className={styles.hostNote}>
            Marking somebody present is what lets them leave feedback on the session.
          </p>
        </>
      )}
    </Modal>
  )
}

/** ISO instant to the value a datetime-local input expects, in the viewer's own zone. */
function toLocalInput(iso: string): string {
  const date = new Date(iso)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}
