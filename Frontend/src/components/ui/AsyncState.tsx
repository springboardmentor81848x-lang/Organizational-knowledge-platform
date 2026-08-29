import type { ReactNode } from 'react'
import { ApiError } from '@/lib/apiError'
import { Button } from './Button'
import styles from './AsyncState.module.css'

/**
 * The three states every server-backed view must be able to show.
 *
 * There is deliberately no "fall back to zero" path here. A dashboard that renders 0 when the
 * request failed is worse than one that renders nothing: the reader cannot tell the difference
 * between "no gaps" and "we could not ask".
 */

export function LoadingBlock({ rows = 4, label = 'Loading' }: { rows?: number; label?: string }) {
  return (
    <div className={styles.skeletonStack} role="status" aria-live="polite">
      <span className="visually-hidden">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className={styles.skeleton}
          /* Ragged widths read as content loading rather than a progress bar. */
          style={{ width: `${100 - (i % 3) * 14}%` }}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

interface ErrorBlockProps {
  error: unknown
  /** Wired to the query's refetch so the reader can retry without reloading the page. */
  onRetry?: () => void
  title?: string
}

export function ErrorBlock({ error, onRetry, title = 'This could not be loaded' }: ErrorBlockProps) {
  const apiError = ApiError.from(error)

  return (
    <div className={styles.state} role="alert">
      <div className={[styles.icon, styles.iconError].join(' ')} aria-hidden="true">
        !
      </div>
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{apiError.userMessage()}</p>
      {apiError.detail && <p className={styles.detail}>{apiError.detail}</p>}
      {onRetry && (
        <Button size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

interface EmptyBlockProps {
  title: string
  message?: ReactNode
  action?: ReactNode
  icon?: ReactNode
}

export function EmptyBlock({ title, message, action, icon }: EmptyBlockProps) {
  return (
    <div className={styles.state}>
      <div className={[styles.icon, styles.iconEmpty].join(' ')} aria-hidden="true">
        {icon ?? '—'}
      </div>
      <p className={styles.title}>{title}</p>
      {message && <p className={styles.message}>{message}</p>}
      {action}
    </div>
  )
}
