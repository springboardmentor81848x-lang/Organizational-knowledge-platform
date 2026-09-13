import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { certificationsApi, type CertificationRequest } from '@/api/certifications'
import { profileApi } from '@/api/profile'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/components/ui/AsyncState'
import { isPermissionDenied, PermissionDenied } from '@/components/ui/PermissionDenied'
import { StatusPill } from '@/components/ui/StatusPill'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/apiError'
import type { Achievement, AchievementType, Certification } from '@/types/api'
import styles from './AchievementsPage.module.css'

/**
 * The employee's record: certifications they hold, and what the platform has awarded them.
 *
 * Kept on one screen because they answer the same question — what have I got to show for this —
 * and separating them would mean two half-empty pages.
 */
export function AchievementsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Achievements and certifications</h1>
        <p className={styles.subtitle}>
          What you have earned here, and the qualifications you hold elsewhere.
        </p>
      </header>

      <Certifications />
      <Achievements />
    </div>
  )
}

// ── Certifications ──────────────────────────────────────────────────────────

function Certifications() {
  const [adding, setAdding] = useState(false)

  const query = useQuery({
    queryKey: ['certifications', 'me'],
    queryFn: ({ signal }) => certificationsApi.list(signal),
  })

  const items = query.data ?? []
  // Expired first, then expiring: the ones needing action lead, rather than being buried
  // among the valid ones in whatever order the server returned.
  const ordered = [...items].sort((a, b) => statusRank(a) - statusRank(b))
  const needingAttention = items.filter((c) => c.status !== 'ACTIVE').length

  return (
    <>
      <Card
        title="Certifications"
        description={
          needingAttention > 0
            ? `${needingAttention} need attention.`
            : 'Qualifications you hold, with their validity.'
        }
        actions={
          <Button size="sm" onClick={() => setAdding(true)}>
            Record a certification
          </Button>
        }
        flush={query.isLoading || Boolean(query.error) || ordered.length === 0}
      >
        {query.isLoading ? (
          <LoadingBlock rows={3} label="Loading certifications" />
        ) : query.isError ? (
          isPermissionDenied(query.error) ? (
            <PermissionDenied />
          ) : (
            <ErrorBlock error={query.error} onRetry={query.refetch} />
          )
        ) : ordered.length === 0 ? (
          <EmptyBlock
            title="No certifications recorded"
            message="Record one so its expiry is tracked and you are reminded before it lapses."
          />
        ) : (
          <ul className={styles.list}>
            {ordered.map((certification) => (
              <CertificationRow key={certification.id} certification={certification} />
            ))}
          </ul>
        )}
      </Card>

      {adding && <CertificationDialog onClose={() => setAdding(false)} />}
    </>
  )
}

function statusRank(certification: Certification): number {
  return { EXPIRED: 0, EXPIRING_SOON: 1, ACTIVE: 2 }[certification.status]
}

function CertificationRow({ certification }: { certification: Certification }) {
  const days = certification.expiresAt ? daysUntil(certification.expiresAt) : null

  return (
    <li className={styles.row}>
      <div className={styles.rowBody}>
        <div className={styles.rowHead}>
          <span className={styles.rowTitle}>{certification.name}</span>
          {/* ACTIVE means "valid" here, not the mentorship sense the shared map holds. */}
          <StatusPill
            value={certification.status}
            tone={certification.status === 'ACTIVE' ? 'low' : undefined}
          />
        </div>
        <p className={styles.rowMeta}>
          Issued by {certification.issuer} on {formatDate(certification.issuedAt)}
          {certification.expiresAt ? ` · expires ${formatDate(certification.expiresAt)}` : ' · no expiry'}
        </p>
        {/* The status word says the category; the day count says how urgent it actually is. */}
        {days !== null && (
          <p className={styles.rowUrgency}>
            {days < 0
              ? `Lapsed ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`
              : days === 0
                ? 'Expires today'
                : `${days} day${days === 1 ? '' : 's'} remaining`}
          </p>
        )}
      </div>
    </li>
  )
}

function CertificationDialog({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [form, setForm] = useState<CertificationRequest>({
    name: '',
    issuer: '',
    issuedAt: new Date().toISOString().slice(0, 10),
    expiresAt: '',
  })

  const save = useMutation({
    mutationFn: () =>
      certificationsApi.add({ ...form, expiresAt: form.expiresAt || undefined }),
    onSuccess: async () => {
      // Recording one can award an achievement on the server and writes a notification.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['certifications'] }),
        queryClient.invalidateQueries({ queryKey: ['achievements'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ])
      toast.success('Certification recorded')
      onClose()
    },
    onError: (error) => toast.fromError('Could not record it', error),
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    save.mutate()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Record a certification"
      description="Its status is worked out from the expiry date, so it stays accurate on its own."
      size="sm"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            type="submit"
            form="certification-form"
            loading={save.isPending}
            disabled={!form.name.trim() || !form.issuer.trim() || !form.issuedAt}
          >
            Record it
          </Button>
        </>
      }
    >
      <form id="certification-form" onSubmit={handleSubmit} noValidate>
        {save.isError && (
          <div className={styles.error} role="alert">
            <span aria-hidden="true">!</span>
            <span>{ApiError.from(save.error).userMessage()}</span>
          </div>
        )}

        <Field
          id="name"
          label="Certification"
          value={form.name}
          onChange={(value) => setForm({ ...form, name: value })}
        />
        <Field
          id="issuer"
          label="Issued by"
          value={form.issuer}
          onChange={(value) => setForm({ ...form, issuer: value })}
        />
        <div className={styles.formRow}>
          <Field
            id="issuedAt"
            label="Issued on"
            type="date"
            value={form.issuedAt}
            onChange={(value) => setForm({ ...form, issuedAt: value })}
          />
          <Field
            id="expiresAt"
            label="Expires (optional)"
            type="date"
            value={form.expiresAt ?? ''}
            onChange={(value) => setForm({ ...form, expiresAt: value })}
          />
        </div>
      </form>
    </Modal>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        className={styles.input}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

// ── Achievements ────────────────────────────────────────────────────────────

const ACHIEVEMENT_LABEL: Record<AchievementType, string> = {
  COURSE_COMPLETED: 'Course completed',
  CERTIFICATION_EARNED: 'Certification earned',
  SKILL_MASTERED: 'Skill mastered',
  MENTORSHIP_COMPLETED: 'Mentorship completed',
}

function Achievements() {
  const query = useQuery({
    queryKey: ['achievements', 'me'],
    queryFn: ({ signal }) => profileApi.achievements(signal),
  })

  const items = query.data ?? []
  // Newest first: the most recent thing earned is the one worth seeing.
  const ordered = [...items].sort(
    (a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime(),
  )

  return (
    <Card
      title="Achievements"
      description="Awarded automatically as you finish courses, mentorships and certifications."
      flush={query.isLoading || Boolean(query.error) || ordered.length === 0}
    >
      {query.isLoading ? (
        <LoadingBlock rows={3} label="Loading achievements" />
      ) : query.isError ? (
        isPermissionDenied(query.error) ? (
          <PermissionDenied />
        ) : (
          <ErrorBlock error={query.error} onRetry={query.refetch} />
        )
      ) : ordered.length === 0 ? (
        <EmptyBlock
          title="Nothing earned yet"
          message="Finishing a course or completing a mentorship earns your first."
        />
      ) : (
        <ul className={styles.list}>
          {ordered.map((achievement: Achievement) => (
            <li className={styles.row} key={achievement.id}>
              <span className={styles.medal} aria-hidden="true">
                ★
              </span>
              <div className={styles.rowBody}>
                <div className={styles.rowHead}>
                  <span className={styles.rowTitle}>{achievement.title}</span>
                  <span className={styles.achievementType}>
                    {ACHIEVEMENT_LABEL[achievement.type] ?? achievement.type}
                  </span>
                </div>
                {achievement.description && (
                  <p className={styles.rowMeta}>{achievement.description}</p>
                )}
                <p className={styles.rowUrgency}>Earned {formatDate(achievement.earnedAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

// ── Dates ───────────────────────────────────────────────────────────────────

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Whole days from today, negative once the date has passed. */
function daysUntil(date: string): number {
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}
