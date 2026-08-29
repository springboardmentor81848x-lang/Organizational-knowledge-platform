import styles from './StatusPill.module.css'

export type Tone = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'neutral'

/**
 * Maps the backend's own vocabularies onto the visual scale. Anything unrecognised falls to
 * neutral rather than guessing, so a value added on the server never renders as the wrong
 * severity here.
 */
const TONE_BY_VALUE: Record<string, Tone> = {
  // RiskSeverity
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  // EnrollmentStatus
  NOT_STARTED: 'neutral',
  IN_PROGRESS: 'info',
  COMPLETED: 'low',
  CERTIFIED: 'low',
  EXPIRED_RENEWAL: 'high',
  // AssessmentStatus
  PENDING: 'medium',
  CANCELLED: 'neutral',
  // MentorshipStatus
  REQUESTED: 'medium',
  ACCEPTED: 'info',
  ACTIVE: 'info',
  REJECTED: 'neutral',
  // SessionStatus
  SCHEDULED: 'info',
}

export function toneFor(value: string | null | undefined): Tone {
  if (!value) return 'neutral'
  return TONE_BY_VALUE[value.toUpperCase()] ?? 'neutral'
}

/** Turns SCREAMING_SNAKE_CASE from the API into something readable. */
export function humanise(value: string | null | undefined): string {
  if (!value) return '—'
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

interface StatusPillProps {
  /** A raw enum value from the API; the tone is derived from it. */
  value: string | null | undefined
  /** Overrides the derived tone when the caller knows better. */
  tone?: Tone
  /** Overrides the derived label. */
  label?: string
}

export function StatusPill({ value, tone, label }: StatusPillProps) {
  const resolvedTone = tone ?? toneFor(value)
  return <span className={[styles.pill, styles[resolvedTone]].join(' ')}>{label ?? humanise(value)}</span>
}
