import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  /** Removes body padding, for cards whose body is a table that should meet the edges. */
  flush?: boolean
  children: ReactNode
  className?: string
}

export function Card({ title, description, actions, flush = false, children, className }: CardProps) {
  const hasHeader = Boolean(title || description || actions)

  return (
    <section className={[styles.card, className ?? ''].filter(Boolean).join(' ')}>
      {hasHeader && (
        <header className={styles.header}>
          <div className={styles.headings}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {description && <p className={styles.description}>{description}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      <div className={flush ? styles.bodyFlush : styles.body}>{children}</div>
    </section>
  )
}
